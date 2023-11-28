package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	oc "github.com/haideralsh/oc/utils"
)

type OptionDetails struct {
	Symbol string `json:"rootSymbol"`
	Options []string `json:"options"`
}

type SymbolsDetails struct {
	Symbols []OptionDetails `json:"symbols"`
}

func Symbols(w http.ResponseWriter, r *http.Request) {
	q, err := oc.GetQueryString(r.URL, "q")
	if err != nil {
		log.Print(err)
		fmt.Fprint(w, err)
	}

	s, err := getMatchingSymbols(q)
	if err != nil {
		log.Print(err)
		fmt.Fprint(w, err)
	}

	w.Header().Set("Content-Type", "application/json")
	oc.SetCorsHeaders(w)

	w.Write(s)
}

func getMatchingSymbols(query string) ([]byte, error) {
	endpoint := fmt.Sprintf("%s/options/lookup?underlying=%s", oc.BaseUrl, query)
	req := oc.BuildRequest(endpoint, oc.Token)
	res := oc.GetResponse(req)

	matches, err := json.Marshal(normalizeResponse(res))
	if err != nil {
		return nil, err
	}

	return matches, nil
}

func normalizeResponse(res []byte) interface{} {
	var data SymbolsDetails
	err := json.Unmarshal(res, &data)
	if err != nil {
		log.Fatal(err)
	}

	// No symbols match query
	if len(data.Symbols) == 0 {
		return SymbolsResponse{
			Symbols: make([]interface{}, 0),
		}
	}

	// One or more symbols matched query
	var symbols []interface{}
	for _, option := range data.Symbols {
		symbols = append(symbols, SymbolsDetails{
			Symbols: []OptionDetails{
				OptionDetails{
					Symbol: option.Symbol,
					Options: option.Options,
				},
			},
		})
	}

	return SymbolsResponse{
		Symbols: symbols,
	}
}
