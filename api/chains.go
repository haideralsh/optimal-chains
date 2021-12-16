package handler

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"strconv"
	"time"
)

type Symbol = string

const (
	baseUrl     = "https://sandbox.tradier.com/v1/markets"
	percentage  = 12.00 / 100.00 // @todo: Make this configurable
	coefficient = 1.00 + percentage
)

var (
	token = os.Getenv("TRADIER_TOKEN")
	mock  = [...]Symbol{ // Sample stock symbols used for local testing
		"AAPL",
		"ADBE",
		"BABA",
		"F",
		"FB",
		"GOOG",
		"HOOD",
		"MSFT",
		"NET",
		"NKE",
		"NOK",
		"NVDA",
		"SHOP",
		"SNAP",
		"TSLA",
		"UAL",
	}
)

type OptionChain struct {
	Percentage float64 `json:"percentage"`
	Strike     float64 `json:"strike"`
	Bid        float64 `json:"bid"`
	Expiration string  `json:"expiration"`
}

type RequestBody struct {
	Symbols []Symbol `json:"symbols"`
}

func Handler(w http.ResponseWriter, r *http.Request) {
	symbols, err := parseRequest(r)
	if err != nil {
		fmt.Fprint(w, err)
	}

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
			opt := findOptimalOptions(<-o, q, target)
			if len(opt) > 0 {
				optimal[s] = append(optimal[s], opt...)
			}
		}
	}

	res, err := json.Marshal(optimal)
	if err != nil {
		log.Print(err)
		fmt.Fprint(w, err)
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

func parseRequest(r *http.Request) ([]Symbol, error) {
	d := json.NewDecoder(r.Body)
	b := RequestBody{}

	err := d.Decode(&b)
	if err != nil {
		return nil, err
	}

	return b.Symbols, nil
}

func getOptions(symbol, expiration string) <-chan []interface{} {
	r := make(chan []interface{})

	go func() {
		defer close(r)

		endpoint := fmt.Sprintf("%s/options/chains?symbol=%s&expiration=%s&greeks=false", baseUrl, symbol, expiration)
		req := buildRequest(endpoint)
		res := getResponse(req)

		var data map[string]interface{}
		err := json.Unmarshal(res, &data)

		if err != nil {
			log.Fatal(err)
		}

		r <- data["options"].(map[string]interface{})["option"].([]interface{})
	}()

	return r
}

func findOptimalOptions(options []interface{}, price, target float64) []OptionChain {
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

		endpoint := fmt.Sprintf("%s/quotes?symbols=%s&greeks=false", baseUrl, symbol)
		req := buildRequest(endpoint)
		res := getResponse(req)

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

		endpoint := fmt.Sprintf("%s//options/expirations?symbol=%s&includeAllRoots=true&strikes=false", baseUrl, symbol)
		req := buildRequest(endpoint)
		res := getResponse(req)

		var data map[string]interface{}
		err := json.Unmarshal(res, &data)

		if err != nil {
			log.Fatal(err)
		}

		r <- data["expirations"].(map[string]interface{})["date"].([]interface{})
	}()

	return r
}

// Utils

func buildRequest(endpoint string) *http.Request {
	u, _ := url.ParseRequestURI(endpoint)
	url := u.String()

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Add("Accept", "application/json")

	return req
}

func getResponse(req *http.Request) []byte {
	client := &http.Client{}

	res, _ := client.Do(req)
	data, err := ioutil.ReadAll(res.Body)

	if err != nil {
		log.Fatal(err)
	}

	return data
}

func formatDate(date time.Time) string {
	y, m, d := date.Date()
	return fmt.Sprintf("%d-%d-%d", y, m, d)
}
