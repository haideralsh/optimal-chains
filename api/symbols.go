package handler

import (
	"fmt"
	"log"
	"net/http"
	"net/url"

	oc "github.com/haideralsh/oc/utils"
)

func Symbols(w http.ResponseWriter, r *http.Request) {
	q, err := getQueryString(r.URL, "q")
	if err != nil {
		log.Print(err)
		fmt.Fprint(w, err)
	}

	endpoint := fmt.Sprintf("%s/lookup?q=%s", oc.BaseUrl, q)
	req := oc.BuildRequest(endpoint, oc.Token)
	res := oc.GetResponse(req)

	w.Header().Set("Content-Type", "application/json")
	oc.SetCorsHeaders(w)

	w.Write(res)
}

func getQueryString(rawUrl *url.URL, query string) (string, error) {
	q, err := url.ParseQuery(rawUrl.RawQuery)
	if err != nil {
		return "", err
	}

	return q.Get(query), nil
}
