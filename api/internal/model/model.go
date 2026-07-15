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

type TrefleMeta struct {
	Family                   string `json:"family,omitempty"`
	Genus                    string `json:"genus,omitempty"`
	GrowthHabit              string `json:"growth_habit,omitempty"`
	GrowthForm               string `json:"growth_form,omitempty"`
	LigneousType             string `json:"ligneous_type,omitempty"`
	GrowthDescription        string `json:"growth_description,omitempty"`
	LightLevel               *int   `json:"light_level,omitempty"`
	LightLabel               string `json:"light_label,omitempty"`
	SoilHumidityLevel        *int   `json:"soil_humidity_level,omitempty"`
	SoilHumidityLabel        string `json:"soil_humidity_label,omitempty"`
	AtmosphericHumidityLevel *int   `json:"atmospheric_humidity_level,omitempty"`
	AtmosphericHumidityLabel string `json:"atmospheric_humidity_label,omitempty"`
	DaysToHarvest            *int   `json:"days_to_harvest,omitempty"`
}

type PlantSpecies struct {
	ID             uuid.UUID   `json:"id"`
	Slug           string      `json:"slug"`
	Name           string      `json:"name"`
	Type           string      `json:"type"`
	Light          string      `json:"light"`
	Humidity       string      `json:"humidity"`
	WaterDays      int         `json:"water_days"`
	FertilizeDays  *int        `json:"fertilize_days"`
	RepotDays      *int        `json:"repot_days"`
	Description    *string     `json:"description"`
	TrefleID       *int        `json:"trefle_id,omitempty"`
	ImageURL       *string     `json:"image_url,omitempty"`
	ScientificName *string     `json:"scientific_name,omitempty"`
	Family         *string     `json:"family,omitempty"`
	Genus          *string     `json:"genus,omitempty"`
	TrefleData     *TrefleMeta `json:"trefle_data,omitempty"`
	Source         string      `json:"source"`
}

type TrefleSearchHit struct {
	TrefleID       int     `json:"trefle_id"`
	Slug           string  `json:"slug"`
	Name           string  `json:"name"`
	ScientificName string  `json:"scientific_name"`
	Family         string  `json:"family"`
	Genus          string  `json:"genus"`
	ImageURL       *string `json:"image_url,omitempty"`
	Imported       bool    `json:"imported"`
	SpeciesID      *string `json:"species_id,omitempty"`
}

type Plant struct {
	ID        uuid.UUID  `json:"id"`
	UserID    uuid.UUID  `json:"user_id"`
	SpeciesID *uuid.UUID `json:"species_id"`
	Name      string     `json:"name"`
	Species   string     `json:"species"`
	Location  *string    `json:"location"`
	PlantedAt time.Time  `json:"planted_at"`
	Notes     *string    `json:"notes"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
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

type CalendarTask struct {
	ID         uuid.UUID `json:"id"`
	PlantID    uuid.UUID `json:"plant_id"`
	PlantName  string    `json:"plant_name"`
	Type       string    `json:"type"`
	NextAt     time.Time `json:"next_at"`
	RepeatDays *int      `json:"repeat_days"`
	Enabled    bool      `json:"enabled"`
}

type Observation struct {
	ID        uuid.UUID `json:"id"`
	PlantID   uuid.UUID `json:"plant_id"`
	Notes     *string   `json:"notes"`
	PhotoURL  *string   `json:"photo_url"`
	CreatedAt time.Time `json:"created_at"`
}

type Photo struct {
	ID        uuid.UUID `json:"id"`
	PlantID   uuid.UUID `json:"plant_id"`
	URL       string    `json:"url"`
	Caption   *string   `json:"caption"`
	TakenAt   time.Time `json:"taken_at"`
	CreatedAt time.Time `json:"created_at"`
}
