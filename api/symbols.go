package handler

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	oc "github.com/haideralsh/oc/utils"
)

type SymbolsDetails struct {
	Symbol      string `json:"symbol"`
	Exchange    string `json:"exchange"`
	Type        string `json:"type"`
	Description string `json:"description"`
}

type SymbolsResponse struct {
	Symbols []interface{} `json:"symbols"`
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
	var data interface{}
	err := json.Unmarshal(res, &data)
	if err != nil {
		log.Fatal(err)
	}

	securities := data.(map[string]interface{})["symbols"]

	// No symbols match query
	if securities == nil {
		return SymbolsResponse{
			Symbols: make([]interface{}, 0),
		}
	}

	// One symbol matched query
	symbol, ok := securities.(map[string]interface{})["options"].(map[string]interface{})
	if ok {
		var r []interface{}
		c := append(r, SymbolsDetails{
			Symbol:      symbol["symbol"].(string),
			Exchange:    symbol["exchange"].(string),
			Type:        symbol["type"].(string),
			Description: symbol["description"].(string),
		})

		return SymbolsResponse{
			Symbols: c,
		}
	}

	// More than one symbol matched query
	symbols, ok := securities.(map[string]interface{})["options"].([]interface{})
	if ok {
		return SymbolsResponse{
			Symbols: symbols,
		}
	}

	return nil
}
