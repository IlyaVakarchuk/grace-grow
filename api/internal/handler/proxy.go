package handler

import (
	"context"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

var allowedImageHosts = map[string]bool{
	"bs.plantnet.org":       true,
	"plantnet.org":          true,
	"trefle.io":             true,
	"media.trefle.io":       true,
	"upload.wikimedia.org":  true,
	"commons.wikimedia.org": true,
	"en.wikipedia.org":      true,
	"images.unsplash.com":   true,
}

func hostAllowed(host string) bool {
	host = strings.ToLower(host)
	if allowedImageHosts[host] {
		return true
	}
	if strings.HasSuffix(host, ".wikimedia.org") || strings.HasSuffix(host, ".wikipedia.org") {
		return true
	}
	for h := range allowedImageHosts {
		if strings.HasSuffix(host, "."+h) {
			return true
		}
	}
	return false
}

// ProxyImage streams an external plant image through our API.
func (h *Handler) ProxyImage(w http.ResponseWriter, r *http.Request) {
	raw := r.URL.Query().Get("url")
	if raw == "" {
		writeError(w, http.StatusBadRequest, "url required")
		return
	}

	u, err := url.Parse(raw)
	if err != nil || (u.Scheme != "https" && u.Scheme != "http") {
		writeError(w, http.StatusBadRequest, "invalid url")
		return
	}
	if !hostAllowed(u.Host) {
		writeError(w, http.StatusForbidden, "host not allowed")
		return
	}

	// PlantNet CDN is unreachable from this environment — fail instantly.
	if isPlantNetURL(u.String()) {
		writeError(w, http.StatusBadGateway, "plantnet unavailable")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 10*time.Second)
	defer cancel()

	body, ct, err := fetchRemoteImage(ctx, u.String())
	if err != nil {
		log.Printf("media proxy failed: %v", err)
		writeError(w, http.StatusBadGateway, "image fetch failed")
		return
	}

	if !strings.HasPrefix(ct, "image/") {
		ct = "image/jpeg"
	}
	w.Header().Set("Content-Type", ct)
	w.Header().Set("Cache-Control", "public, max-age=86400")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Content-Length", strconv.Itoa(len(body)))
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write(body)
}
