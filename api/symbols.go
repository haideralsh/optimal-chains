package handler

import (
	"net/http"

	"github.com/haideralsh/oc/utils"
)

func Symbols(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	utils.SetCorsHeaders(w)

	w.Write([]byte("Hello from the symbols ma man"))
}
