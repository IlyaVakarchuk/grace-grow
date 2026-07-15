package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/vakarchukiv/grace/api/internal/model"
)

var imageFetcher = &http.Client{Timeout: 12 * time.Second}

func fetchRemoteImage(ctx context.Context, remoteURL string) ([]byte, string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, remoteURL, nil)
	if err != nil {
		return nil, "", err
	}
	req.Header.Set("User-Agent", "GraceGrow/1.0 (plant care app)")
	req.Header.Set("Accept", "image/avif,image/webp,image/apng,image/*,*/*;q=0.8")
	req.Header.Set("Referer", "https://trefle.io/")

	res, err := imageFetcher.Do(req)
	if err != nil {
		return nil, "", err
	}
	defer res.Body.Close()

	if res.StatusCode >= 400 {
		return nil, "", fmt.Errorf("upstream status %d", res.StatusCode)
	}

	body, err := io.ReadAll(io.LimitReader(res.Body, 8<<20))
	if err != nil {
		return nil, "", err
	}
	if len(body) == 0 {
		return nil, "", fmt.Errorf("empty image")
	}

	ct := res.Header.Get("Content-Type")
	if ct == "" {
		ct = "image/jpeg"
	}
	return body, ct, nil
}

type wikiSummary struct {
	Thumbnail *struct {
		Source string `json:"source"`
	} `json:"thumbnail"`
	OriginalImage *struct {
		Source string `json:"source"`
	} `json:"originalimage"`
}

// resolveWikipediaImage finds a plant photo via Wikipedia REST API.
func resolveWikipediaImage(ctx context.Context, scientificName, commonName string) (string, error) {
	candidates := []string{}
	if scientificName != "" {
		candidates = append(candidates, scientificName)
	}
	if commonName != "" && !strings.EqualFold(commonName, scientificName) {
		candidates = append(candidates, commonName)
	}

	client := &http.Client{Timeout: 6 * time.Second}
	for _, lang := range []string{"en", "ru"} {
		for _, name := range candidates {
			if img, ok := fetchWikiSummary(ctx, client, lang, name); ok {
				return img, nil
			}
		}
	}
	return "", fmt.Errorf("no wikipedia image")
}

func fetchWikiSummary(ctx context.Context, client *http.Client, lang, name string) (string, bool) {
	title := strings.ReplaceAll(strings.TrimSpace(name), " ", "_")
	apiURL := fmt.Sprintf("https://%s.wikipedia.org/api/rest_v1/page/summary/%s", lang, url.PathEscape(title))
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, apiURL, nil)
	if err != nil {
		return "", false
	}
	req.Header.Set("User-Agent", "GraceGrow/1.0 (plant care app)")
	req.Header.Set("Accept", "application/json")

	res, err := client.Do(req)
	if err != nil {
		return "", false
	}
	body, _ := io.ReadAll(io.LimitReader(res.Body, 1<<20))
	res.Body.Close()
	if res.StatusCode >= 400 {
		return "", false
	}

	var summary wikiSummary
	if err := json.Unmarshal(body, &summary); err != nil {
		return "", false
	}
	if summary.OriginalImage != nil && summary.OriginalImage.Source != "" {
		return summary.OriginalImage.Source, true
	}
	if summary.Thumbnail != nil && summary.Thumbnail.Source != "" {
		return summary.Thumbnail.Source, true
	}
	return "", false
}

func isPlantNetURL(u string) bool {
	return strings.Contains(strings.ToLower(u), "plantnet.org")
}

func speciesNames(item model.PlantSpecies) (scientific, common string) {
	common = item.Name
	scientific = item.Name
	if item.ScientificName != nil && strings.TrimSpace(*item.ScientificName) != "" {
		scientific = strings.TrimSpace(*item.ScientificName)
	}
	return scientific, common
}

// resolveAndCacheImage picks Wikipedia photo and caches it locally.
func resolveAndCacheImage(ctx context.Context, slug, scientificName, commonName string, _ *string) *string {
	wiki, err := resolveWikipediaImage(ctx, scientificName, commonName)
	if err != nil {
		return nil
	}
	if cached, err := cachePlantImage(ctx, slug, wiki); err == nil && cached != nil {
		return cached
	}
	return &wiki
}

// enrichSpeciesImage ensures a species has a working image URL.
func enrichSpeciesImage(ctx context.Context, item model.PlantSpecies) model.PlantSpecies {
	if item.ImageURL != nil && !isPlantNetURL(*item.ImageURL) {
		return item
	}
	sci, common := speciesNames(item)
	if fixed := resolveAndCacheImage(ctx, item.Slug, sci, common, nil); fixed != nil {
		item.ImageURL = fixed
	} else {
		item.ImageURL = nil
	}
	return item
}

func cachePlantImage(ctx context.Context, slug, remoteURL string) (*string, error) {
	if strings.TrimSpace(remoteURL) == "" {
		return nil, nil
	}

	body, ct, err := fetchRemoteImage(ctx, remoteURL)
	if err != nil {
		return nil, err
	}

	dir := filepath.Join("uploads", "species")
	if err := os.MkdirAll(dir, 0755); err != nil {
		return nil, err
	}

	ext := ".jpg"
	switch {
	case strings.Contains(ct, "png"):
		ext = ".png"
	case strings.Contains(ct, "webp"):
		ext = ".webp"
	case strings.Contains(ct, "gif"):
		ext = ".gif"
	}

	path := filepath.Join(dir, slug+ext)
	if err := os.WriteFile(path, body, 0644); err != nil {
		return nil, err
	}

	local := "/uploads/species/" + slug + ext
	return &local, nil
}
