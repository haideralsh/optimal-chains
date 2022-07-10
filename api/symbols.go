package handler

import (
	"fmt"
	"log"
	"net/http"
	"net/url"

	oc "github.com/haideralsh/oc/utils"
)

func Symbols(w http.ResponseWriter, r *http.Request) {
	q, err := parseUrl(r.URL)
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

func parseUrl(rawUrl *url.URL) (string, error) {
	q, err := url.ParseQuery(rawUrl.RawQuery)
	if err != nil {
		return "", err
	}

	return q.Get("symbol"), nil
}
