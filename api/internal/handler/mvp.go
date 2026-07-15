package handler

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"

	"github.com/vakarchukiv/grace/api/internal/middleware"
	"github.com/vakarchukiv/grace/api/internal/model"
	"github.com/vakarchukiv/grace/api/internal/repository"
)

func (h *Handler) ListLibrary(w http.ResponseWriter, r *http.Request) {
	typeFilter := r.URL.Query().Get("type")
	list, err := h.repo.ListSpecies(r.Context(), typeFilter)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "list failed")
		return
	}
	if list == nil {
		list = []model.PlantSpecies{}
	}

	var wg sync.WaitGroup
	sem := make(chan struct{}, 4)
	for i := range list {
		if list[i].ImageURL != nil && !isPlantNetURL(*list[i].ImageURL) {
			continue
		}
		wg.Add(1)
		go func(idx int) {
			defer wg.Done()
			sem <- struct{}{}
			defer func() { <-sem }()

			enriched := enrichSpeciesImage(r.Context(), list[idx])
			if enriched.ImageURL != nil {
				if saved, err := h.repo.UpsertSpecies(r.Context(), enriched); err == nil {
					list[idx] = saved
				} else {
					list[idx] = enriched
				}
			} else {
				list[idx].ImageURL = nil
			}
		}(i)
	}
	wg.Wait()

	writeJSON(w, http.StatusOK, list)
}

func (h *Handler) GetLibraryItem(w http.ResponseWriter, r *http.Request) {
	id, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	item, err := h.repo.GetSpecies(r.Context(), id)
	if err != nil {
		h.handleRepoErr(w, err)
		return
	}

	if item.ImageURL == nil || isPlantNetURL(*item.ImageURL) {
		item = enrichSpeciesImage(r.Context(), item)
		if item.ImageURL != nil {
			if saved, err := h.repo.UpsertSpecies(r.Context(), item); err == nil {
				item = saved
			}
		}
	}

	writeJSON(w, http.StatusOK, item)
}

func (h *Handler) Calendar(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.UserIDFromContext(r.Context())
	days := 30
	if d := r.URL.Query().Get("days"); d != "" {
		if n, err := strconv.Atoi(d); err == nil && n > 0 {
			days = n
		}
	}
	tasks, err := h.repo.ListCalendarTasks(r.Context(), userID, days)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "list failed")
		return
	}
	if tasks == nil {
		tasks = []model.CalendarTask{}
	}
	writeJSON(w, http.StatusOK, tasks)
}

func (h *Handler) CompleteTask(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.UserIDFromContext(r.Context())
	taskID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.repo.CompleteReminder(r.Context(), userID, taskID); err != nil {
		h.handleRepoErr(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) ListObservations(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.UserIDFromContext(r.Context())
	plantID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if _, err := h.repo.GetPlant(r.Context(), userID, plantID); err != nil {
		h.handleRepoErr(w, err)
		return
	}
	list, err := h.repo.ListObservations(r.Context(), plantID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "list failed")
		return
	}
	if list == nil {
		list = []model.Observation{}
	}
	writeJSON(w, http.StatusOK, list)
}

type observationRequest struct {
	Notes       *string `json:"notes"`
	PhotoBase64 *string `json:"photo_base64"`
}

func (h *Handler) CreateObservation(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.UserIDFromContext(r.Context())
	plantID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if _, err := h.repo.GetPlant(r.Context(), userID, plantID); err != nil {
		h.handleRepoErr(w, err)
		return
	}

	var req observationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid body")
		return
	}
	if (req.Notes == nil || strings.TrimSpace(*req.Notes) == "") && req.PhotoBase64 == nil {
		writeError(w, http.StatusBadRequest, "notes or photo required")
		return
	}

	var photoURL *string
	if req.PhotoBase64 != nil && *req.PhotoBase64 != "" {
		url, err := savePhoto(plantID, *req.PhotoBase64)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid photo")
			return
		}
		photoURL = &url
	}

	obs, err := h.repo.CreateObservation(r.Context(), plantID, req.Notes, photoURL)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "create failed")
		return
	}
	writeJSON(w, http.StatusCreated, obs)
}

func savePhoto(plantID uuid.UUID, data string) (string, error) {
	raw := data
	if idx := strings.Index(data, ","); idx >= 0 {
		raw = data[idx+1:]
	}
	bytes, err := base64.StdEncoding.DecodeString(raw)
	if err != nil {
		return "", err
	}
	if len(bytes) > 5*1024*1024 {
		return "", os.ErrInvalid
	}

	dir := filepath.Join("uploads", plantID.String())
	if err := os.MkdirAll(dir, 0755); err != nil {
		return "", err
	}
	filename := uuid.New().String() + ".jpg"
	path := filepath.Join(dir, filename)
	if err := os.WriteFile(path, bytes, 0644); err != nil {
		return "", err
	}
	return "/uploads/" + plantID.String() + "/" + filename, nil
}

func (h *Handler) createPlantWithReminders(ctx context.Context, userID uuid.UUID, req plantRequest) (model.Plant, error) {
	var speciesID *uuid.UUID
	speciesName := req.Species
	if speciesName == "" {
		speciesName = "other"
	}

	if req.SpeciesID != nil {
		id, err := uuid.Parse(*req.SpeciesID)
		if err != nil {
			return model.Plant{}, repository.ErrNotFound
		}
		sp, err := h.repo.GetSpecies(ctx, id)
		if err != nil {
			return model.Plant{}, err
		}
		speciesID = &id
		speciesName = sp.Slug
	}

	plantedAt := time.Now()
	if req.PlantedAt != nil {
		if t, err := time.Parse("2006-01-02", *req.PlantedAt); err == nil {
			plantedAt = t
		}
	}

	plant, err := h.repo.CreatePlant(ctx, userID, speciesID, req.Name, speciesName, req.Location, req.Notes, plantedAt)
	if err != nil {
		return plant, err
	}

	if speciesID != nil {
		sp, _ := h.repo.GetSpecies(ctx, *speciesID)
		_ = h.repo.CreateRemindersFromSpecies(ctx, plant.ID, sp)
	}

	return plant, nil
}
