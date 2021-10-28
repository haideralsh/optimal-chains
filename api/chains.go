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

const (
	baseUrl     = "https://sandbox.tradier.com/v1/markets"
	percentage  = 9.00 / 100.00
	coefficient = 1.00 + percentage
)

var (
	token = os.Getenv("TRADIER_TOKEN")
)

type OptionChain struct {
	symbol     string
	strike     float64
	bid        float64
	expiration string
}

func Handler(w http.ResponseWriter, r *http.Request) {
	// start := time.Now()

	result := make(map[string][]OptionChain)
	d := json.NewDecoder(r.Body)

	b := struct {
		Symbol *string `json:"symbol"` // pointer so we can test for field absence
	}{}

	err := d.Decode(&b)
	if err != nil {
		fmt.Fprint(w, err)
	}

	s := *b.Symbol

	price := getQuote(s)
	target := price * coefficient

	for _, exp := range getOptionExpirations(s) {
		options := getOptions(s, exp.(string))
		op := findOptimalOptions(options, price, target)

		result[s] = op
	}

	v, err := json.Marshal(result)

	if err != nil {
		fmt.Fprint(w, err)
	}

	fmt.Fprintf(w, string(v))
}

func getOptions(symbol string, expiration string) []interface{} {
	endpoint := fmt.Sprintf("%s/options/chains?symbol=%s&expiration=%s&greeks=false", baseUrl, symbol, expiration)
	req := buildRequest(endpoint)
	res := getResponse(req)

	var data map[string]interface{}
	err := json.Unmarshal(res, &data)

	if err != nil {
		log.Fatal(err)
	}

	return data["options"].(map[string]interface{})["option"].([]interface{})
}

func findOptimalOptions(options []interface{}, price float64, target float64) []OptionChain {
	var optionChains []OptionChain

	for _, o := range options {
		symbol := fmt.Sprintf("%v", o.(map[string]interface{})["symbol"])
		expiration := fmt.Sprintf("%v", o.(map[string]interface{})["expiration_date"])
		otype := fmt.Sprintf("%v", o.(map[string]interface{})["option_type"])
		strike, err := strconv.ParseFloat(fmt.Sprintf("%v", o.(map[string]interface{})["strike"]), 64)
		bid, err := strconv.ParseFloat(fmt.Sprintf("%v", o.(map[string]interface{})["bid"]), 64)

		if err != nil {
			log.Fatal(err)
		}

		if otype == "call" && strike >= target && bid/price >= percentage {
			optionChains = append(optionChains, OptionChain{
				symbol:     symbol,
				strike:     strike,
				bid:        bid,
				expiration: expiration,
			})
		}
	}

	return optionChains
}

func getQuote(symbol string) float64 {
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

	price, err := strconv.ParseFloat(str, 64)

	if err != nil {
		log.Fatal(err)
	}

	return price
}

func getOptionExpirations(symbol string) []interface{} {
	endpoint := fmt.Sprintf("%s//options/expirations?symbol=%s&includeAllRoots=true&strikes=false", baseUrl, symbol)
	req := buildRequest(endpoint)
	res := getResponse(req)

	var data map[string]interface{}
	err := json.Unmarshal(res, &data)

	if err != nil {
		log.Fatal(err)
	}

	return data["expirations"].(map[string]interface{})["date"].([]interface{})
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
