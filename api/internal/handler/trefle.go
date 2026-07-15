package handler

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/vakarchukiv/grace/api/internal/model"
	"github.com/vakarchukiv/grace/api/internal/repository"
	"github.com/vakarchukiv/grace/api/internal/trefle"
)

func (h *Handler) SearchTrefle(w http.ResponseWriter, r *http.Request) {
	if h.trefle == nil || !h.trefle.Enabled() {
		writeError(w, http.StatusServiceUnavailable, "trefle not configured")
		return
	}

	query := strings.TrimSpace(r.URL.Query().Get("q"))
	if len(query) < 2 {
		writeError(w, http.StatusBadRequest, "query too short")
		return
	}

	page := 1
	if p := r.URL.Query().Get("page"); p != "" {
		if n, err := strconv.Atoi(p); err == nil && n > 0 {
			page = n
		}
	}

	hits, total, err := h.trefle.Search(r.Context(), query, page)
	if err != nil {
		writeError(w, http.StatusBadGateway, "trefle search failed")
		return
	}

	results := make([]model.TrefleSearchHit, 0, len(hits))
	for _, hit := range hits {
		item := model.TrefleSearchHit{
			TrefleID:       hit.ID,
			Slug:           hit.Slug,
			Name:           trefle.DisplayName(hit),
			ScientificName: hit.ScientificName,
			Family:         hit.Family,
			ImageURL:       hit.ImageURL,
		}
		if sp, err := h.repo.GetSpeciesByTrefleID(r.Context(), hit.ID); err == nil {
			item.Imported = true
			id := sp.ID.String()
			item.SpeciesID = &id
		} else if err != repository.ErrNotFound {
			writeError(w, http.StatusInternalServerError, "lookup failed")
			return
		}
		results = append(results, item)
	}

	writeJSON(w, http.StatusOK, map[string]any{
		"data":  results,
		"total": total,
	})
}

type importTrefleRequest struct {
	Slug string `json:"slug"`
}

func (h *Handler) ImportFromTrefle(w http.ResponseWriter, r *http.Request) {
	if h.trefle == nil || !h.trefle.Enabled() {
		writeError(w, http.StatusServiceUnavailable, "trefle not configured")
		return
	}

	var req importTrefleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid body")
		return
	}
	req.Slug = strings.TrimSpace(req.Slug)
	if req.Slug == "" {
		writeError(w, http.StatusBadRequest, "slug required")
		return
	}

	detail, err := h.trefle.GetSpecies(r.Context(), req.Slug)
	if err != nil {
		writeError(w, http.StatusBadGateway, "trefle fetch failed")
		return
	}

	species := trefle.ToPlantSpecies(detail)
	if detail.ID > 0 {
		if existing, err := h.repo.GetSpeciesByTrefleID(r.Context(), detail.ID); err == nil {
			writeJSON(w, http.StatusOK, existing)
			return
		} else if err != repository.ErrNotFound {
			writeError(w, http.StatusInternalServerError, "lookup failed")
			return
		}
	}

	saved, err := h.repo.UpsertSpecies(r.Context(), species)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "import failed")
		return
	}
	writeJSON(w, http.StatusCreated, saved)
}
