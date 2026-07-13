package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/vakarchukiv/grace/api/internal/middleware"
	"github.com/vakarchukiv/grace/api/internal/model"
	"github.com/vakarchukiv/grace/api/internal/repository"
)

type Handler struct {
	repo      *repository.Repository
	jwtSecret string
}

func New(repo *repository.Repository, jwtSecret string) *Handler {
	return &Handler{repo: repo, jwtSecret: jwtSecret}
}

func (h *Handler) Health(w http.ResponseWriter, r *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}

type registerRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
	Name     string `json:"name"`
}

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid body")
		return
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || len(req.Password) < 6 {
		writeError(w, http.StatusBadRequest, "email and password (min 6) required")
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "hash error")
		return
	}

	user, err := h.repo.CreateUser(r.Context(), req.Email, string(hash), req.Name)
	if err != nil {
		if strings.Contains(err.Error(), "duplicate") {
			writeError(w, http.StatusConflict, "email already exists")
			return
		}
		writeError(w, http.StatusInternalServerError, "create user failed")
		return
	}

	token, err := h.issueToken(user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "token error")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]any{"user": user, "token": token})
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid body")
		return
	}
	req.Email = strings.TrimSpace(strings.ToLower(req.Email))

	user, hash, err := h.repo.GetUserByEmail(r.Context(), req.Email)
	if err != nil {
		writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}
	if bcrypt.CompareHashAndPassword([]byte(hash), []byte(req.Password)) != nil {
		writeError(w, http.StatusUnauthorized, "invalid credentials")
		return
	}

	token, err := h.issueToken(user.ID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "token error")
		return
	}

	writeJSON(w, http.StatusOK, map[string]any{"user": user, "token": token})
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	userID, ok := middleware.UserIDFromContext(r.Context())
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}
	user, err := h.repo.GetUserByID(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusNotFound, "user not found")
		return
	}
	writeJSON(w, http.StatusOK, user)
}

func (h *Handler) ListPlants(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.UserIDFromContext(r.Context())
	plants, err := h.repo.ListPlants(r.Context(), userID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "list failed")
		return
	}
	if plants == nil {
		plants = []model.Plant{}
	}
	writeJSON(w, http.StatusOK, plants)
}

type plantRequest struct {
	Name      string  `json:"name"`
	Species   string  `json:"species"`
	Location  *string `json:"location"`
	Notes     *string `json:"notes"`
	PlantedAt *string `json:"planted_at"`
}

func (h *Handler) CreatePlant(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.UserIDFromContext(r.Context())
	var req plantRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.Name) == "" {
		writeError(w, http.StatusBadRequest, "name required")
		return
	}
	if req.Species == "" {
		req.Species = "other"
	}
	plantedAt := time.Now()
	if req.PlantedAt != nil {
		if t, err := time.Parse("2006-01-02", *req.PlantedAt); err == nil {
			plantedAt = t
		}
	}

	plant, err := h.repo.CreatePlant(r.Context(), userID, req.Name, req.Species, req.Location, req.Notes, plantedAt)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "create failed")
		return
	}
	writeJSON(w, http.StatusCreated, plant)
}

func (h *Handler) GetPlant(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.UserIDFromContext(r.Context())
	plantID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	plant, err := h.repo.GetPlant(r.Context(), userID, plantID)
	if err != nil {
		h.handleRepoErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, plant)
}

func (h *Handler) UpdatePlant(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.UserIDFromContext(r.Context())
	plantID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	var req plantRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.Name) == "" {
		writeError(w, http.StatusBadRequest, "name required")
		return
	}
	if req.Species == "" {
		req.Species = "other"
	}
	plantedAt := time.Now()
	if req.PlantedAt != nil {
		if t, err := time.Parse("2006-01-02", *req.PlantedAt); err == nil {
			plantedAt = t
		}
	}

	plant, err := h.repo.UpdatePlant(r.Context(), userID, plantID, req.Name, req.Species, req.Location, req.Notes, plantedAt)
	if err != nil {
		h.handleRepoErr(w, err)
		return
	}
	writeJSON(w, http.StatusOK, plant)
}

func (h *Handler) DeletePlant(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.UserIDFromContext(r.Context())
	plantID, err := uuid.Parse(r.PathValue("id"))
	if err != nil {
		writeError(w, http.StatusBadRequest, "invalid id")
		return
	}
	if err := h.repo.DeletePlant(r.Context(), userID, plantID); err != nil {
		h.handleRepoErr(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *Handler) ListCareLogs(w http.ResponseWriter, r *http.Request) {
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
	logs, err := h.repo.ListCareLogs(r.Context(), plantID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "list failed")
		return
	}
	if logs == nil {
		logs = []model.CareLog{}
	}
	writeJSON(w, http.StatusOK, logs)
}

type careLogRequest struct {
	Type  string  `json:"type"`
	Notes *string `json:"notes"`
}

var validCareTypes = map[string]bool{
	"water": true, "fertilize": true, "prune": true,
	"harvest": true, "repot": true, "other": true,
}

func (h *Handler) CreateCareLog(w http.ResponseWriter, r *http.Request) {
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

	var req careLogRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || !validCareTypes[req.Type] {
		writeError(w, http.StatusBadRequest, "valid type required")
		return
	}

	log, err := h.repo.CreateCareLog(r.Context(), plantID, req.Type, req.Notes)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "create failed")
		return
	}
	writeJSON(w, http.StatusCreated, log)
}

func (h *Handler) ListReminders(w http.ResponseWriter, r *http.Request) {
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
	reminders, err := h.repo.ListReminders(r.Context(), plantID)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "list failed")
		return
	}
	if reminders == nil {
		reminders = []model.Reminder{}
	}
	writeJSON(w, http.StatusOK, reminders)
}

type reminderRequest struct {
	Type       string  `json:"type"`
	NextAt     string  `json:"next_at"`
	RepeatDays *int    `json:"repeat_days"`
}

func (h *Handler) CreateReminder(w http.ResponseWriter, r *http.Request) {
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

	var req reminderRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || !validCareTypes[req.Type] {
		writeError(w, http.StatusBadRequest, "valid type required")
		return
	}
	nextAt, err := time.Parse(time.RFC3339, req.NextAt)
	if err != nil {
		writeError(w, http.StatusBadRequest, "next_at must be RFC3339")
		return
	}

	rem, err := h.repo.CreateReminder(r.Context(), plantID, req.Type, nextAt, req.RepeatDays)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "create failed")
		return
	}
	writeJSON(w, http.StatusCreated, rem)
}

func (h *Handler) UpcomingReminders(w http.ResponseWriter, r *http.Request) {
	userID, _ := middleware.UserIDFromContext(r.Context())
	reminders, err := h.repo.ListUpcomingReminders(r.Context(), userID, 20)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "list failed")
		return
	}
	if reminders == nil {
		reminders = []model.Reminder{}
	}
	writeJSON(w, http.StatusOK, reminders)
}

func (h *Handler) issueToken(userID uuid.UUID) (string, error) {
	claims := middleware.Claims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(30 * 24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, claims).SignedString([]byte(h.jwtSecret))
}

func (h *Handler) handleRepoErr(w http.ResponseWriter, err error) {
	if errors.Is(err, repository.ErrNotFound) {
		writeError(w, http.StatusNotFound, "not found")
		return
	}
	writeError(w, http.StatusInternalServerError, "internal error")
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}
