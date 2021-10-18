package main

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

const baseUrl = "https://sandbox.tradier.com/v1/markets"

var (
	token   = os.Getenv("TRADIER_TOKEN")
	symbols = [...]string{"SPCE", "AAPL"}
)

func main() {
	start := time.Now()

	fmt.Println(getPrice("AAPL"))

	log.Printf("\nFinished Running in %v", time.Since(start))
}

func getPrice(symbol string) float64 {
	endpoint := fmt.Sprintf("%s/quotes?symbols=%s", baseUrl, symbol)
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

// Utils

func buildRequest(endpoint string) *http.Request {
	u, _ := url.ParseRequestURI(endpoint + "&greeks=false")
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
