package utils

import (
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"net/url"
	"os"
	"time"
)

type Symbol = string

const BaseUrl = "https://sandbox.tradier.com/v1/markets"

var Token = os.Getenv("TRADIER_TOKEN")

func SetCorsHeaders(w http.ResponseWriter) {
	w.Header().Set("Access-Control-Allow-Headers", "*")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "*")
}

func BuildRequest(endpoint, token string) *http.Request {
	u, _ := url.ParseRequestURI(endpoint)
	url := u.String()

	req, _ := http.NewRequest("GET", url, nil)
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Add("Accept", "application/json")

	return req
}

func GetResponse(req *http.Request) []byte {
	client := &http.Client{}

	res, _ := client.Do(req)
	data, err := ioutil.ReadAll(res.Body)

	if err != nil {
		log.Fatal(err)
	}

	return data
}

func GetQueryString(rawUrl *url.URL, query string) (string, error) {
	q, err := url.ParseQuery(rawUrl.RawQuery)
	if err != nil {
		return "", err
	}

	return q.Get(query), nil
}

func FormatDate(date time.Time) string {
	y, m, d := date.Date()
	return fmt.Sprintf("%d-%d-%d", y, m, d)
}
