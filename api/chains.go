package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"

	oc "github.com/haideralsh/oc/utils"
)

type OptionChain struct {
	Percentage float64 `json:"percentage"`
	Strike     float64 `json:"strike"`
	Bid        float64 `json:"bid"`
	Expiration string  `json:"expiration"`
}

type RequestBody struct {
	Symbols    []oc.Symbol `json:"symbols"`
	Percentage float64     `json:"percentage"`
}

func Chains(w http.ResponseWriter, r *http.Request) {
	parsedRequest, err := parseRequest(r)
	if err != nil {
		fmt.Fprint(w, err)
	}

	symbols := parsedRequest.Symbols
	percentage := parsedRequest.Percentage / 100.00

	res, err := find(symbols, percentage)

	if err != nil {
		log.Print(err)
		fmt.Fprint(w, err)
	}

	w.Header().Set("Content-Type", "application/json")
	oc.SetCorsHeaders(w)

	w.Write(res)
}

func find(symbols []string, percentage float64) ([]byte, error) {
	coefficient := 1.00 + percentage

	quotes := make(map[string]<-chan float64)
	options := make(map[string][]<-chan []interface{})
	optimal := make(map[string][]OptionChain)
	expirations := make(map[string]<-chan []interface{})

	for _, s := range symbols {
		quotes[s] = getQuote(s)
		expirations[s] = getOptionExpirations(s)
	}

	for _, s := range symbols {
		for _, exp := range <-expirations[s] {
			options[s] = append(options[s], getOptions(s, exp.(string)))
		}
	}

	for _, s := range symbols {
		q := <-quotes[s]

		target := q * coefficient
		for _, o := range options[s] {
			opt := findOptimalOptions(<-o, q, target, percentage)
			if len(opt) > 0 {
				optimal[s] = append(optimal[s], opt...)
			}
		}
	}

	res, err := json.Marshal(optimal)
	if err != nil {
		return nil, err
	}

	return res, nil
}

func parseRequest(r *http.Request) (RequestBody, error) {
	d := json.NewDecoder(r.Body)
	b := RequestBody{}

	err := d.Decode(&b)
	if err != nil || len(b.Symbols) < 0 || b.Percentage == 0 {
		return RequestBody{}, err
	}

	return b, nil
}

func getOptions(symbol, expiration string) <-chan []interface{} {
	r := make(chan []interface{})

	go func() {
		defer close(r)

		endpoint := fmt.Sprintf("%s/options/chains?symbol=%s&expiration=%s&greeks=false", oc.BaseUrl, symbol, expiration)
		req := oc.BuildRequest(endpoint, oc.Token)
		res := oc.GetResponse(req)

		var data map[string]interface{}
		err := json.Unmarshal(res, &data)

		if err != nil {
			log.Fatal(err)
		}

		r <- data["options"].(map[string]interface{})["option"].([]interface{})
	}()

	return r
}

func findOptimalOptions(options []interface{}, price, target, percentage float64) []OptionChain {
	var optionChains []OptionChain

	for _, o := range options {
		expiration := fmt.Sprintf("%v", o.(map[string]interface{})["expiration_date"])
		otype := fmt.Sprintf("%v", o.(map[string]interface{})["option_type"])
		strike, err := strconv.ParseFloat(fmt.Sprintf("%v", o.(map[string]interface{})["strike"]), 64)
		bid, err := strconv.ParseFloat(fmt.Sprintf("%v", o.(map[string]interface{})["bid"]), 64)

		if err != nil {
			log.Fatal(err)
		}

		if otype == "call" && strike >= target && bid/price >= percentage {
			optionChains = append(optionChains, OptionChain{
				Percentage: (bid / price) * 100,
				Strike:     strike,
				Bid:        bid,
				Expiration: expiration,
			})
		}
	}

	return optionChains
}

func getQuote(symbol string) <-chan float64 {
	r := make(chan float64)

	go func() {
		defer close(r)

		endpoint := fmt.Sprintf("%s/quotes?symbols=%s&greeks=false", oc.BaseUrl, symbol)
		req := oc.BuildRequest(endpoint, oc.Token)
		res := oc.GetResponse(req)

		var data map[string]interface{}
		err := json.Unmarshal(res, &data)

		if err != nil {
			log.Fatal(err)
		}

		raw := data["quotes"].(map[string]interface{})["quote"].(map[string]interface{})["last"]
		str := fmt.Sprintf("%v", raw)

		quote, err := strconv.ParseFloat(str, 64)

		if err != nil {
			log.Fatal(err)
		}

		r <- quote
	}()

	return r
}

func getOptionExpirations(symbol string) <-chan []interface{} {
	r := make(chan []interface{})

	go func() {
		defer close(r)

		endpoint := fmt.Sprintf("%s//options/expirations?symbol=%s&includeAllRoots=true&strikes=false", oc.BaseUrl, symbol)
		req := oc.BuildRequest(endpoint, oc.Token)
		res := oc.GetResponse(req)

		var data map[string]interface{}
		err := json.Unmarshal(res, &data)

		if err != nil {
			log.Fatal(err)
		}

		r <- data["expirations"].(map[string]interface{})["date"].([]interface{})
	}()

	return r
}
