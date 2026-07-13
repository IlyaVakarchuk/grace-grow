package model

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID        uuid.UUID `json:"id"`
	Email     string    `json:"email"`
	Name      string    `json:"name"`
	CreatedAt time.Time `json:"created_at"`
}

type Plant struct {
	ID        uuid.UUID `json:"id"`
	UserID    uuid.UUID `json:"user_id"`
	Name      string    `json:"name"`
	Species   string    `json:"species"`
	Location  *string   `json:"location"`
	PlantedAt time.Time `json:"planted_at"`
	Notes     *string   `json:"notes"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type CareLog struct {
	ID        uuid.UUID `json:"id"`
	PlantID   uuid.UUID `json:"plant_id"`
	Type      string    `json:"type"`
	Notes     *string   `json:"notes"`
	CreatedAt time.Time `json:"created_at"`
}

type Reminder struct {
	ID         uuid.UUID `json:"id"`
	PlantID    uuid.UUID `json:"plant_id"`
	Type       string    `json:"type"`
	NextAt     time.Time `json:"next_at"`
	RepeatDays *int      `json:"repeat_days"`
	Enabled    bool      `json:"enabled"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
}

type Photo struct {
	ID        uuid.UUID `json:"id"`
	PlantID   uuid.UUID `json:"plant_id"`
	URL       string    `json:"url"`
	Caption   *string   `json:"caption"`
	TakenAt   time.Time `json:"taken_at"`
	CreatedAt time.Time `json:"created_at"`
}
