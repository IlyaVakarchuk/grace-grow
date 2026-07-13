package repository

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"

	"github.com/vakarchukiv/grace/api/internal/model"
)

func (r *Repository) ListSpecies(ctx context.Context, typeFilter string) ([]model.PlantSpecies, error) {
	query := `
		SELECT id, slug, name, type, light, humidity, water_days, fertilize_days, repot_days, description
		FROM plant_species
	`
	args := []any{}
	if typeFilter != "" {
		query += ` WHERE type = $1`
		args = append(args, typeFilter)
	}
	query += ` ORDER BY name ASC`

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.PlantSpecies
	for rows.Next() {
		var s model.PlantSpecies
		if err := rows.Scan(&s.ID, &s.Slug, &s.Name, &s.Type, &s.Light, &s.Humidity, &s.WaterDays, &s.FertilizeDays, &s.RepotDays, &s.Description); err != nil {
			return nil, err
		}
		list = append(list, s)
	}
	return list, rows.Err()
}

func (r *Repository) GetSpecies(ctx context.Context, id uuid.UUID) (model.PlantSpecies, error) {
	var s model.PlantSpecies
	err := r.pool.QueryRow(ctx, `
		SELECT id, slug, name, type, light, humidity, water_days, fertilize_days, repot_days, description
		FROM plant_species WHERE id = $1
	`, id).Scan(&s.ID, &s.Slug, &s.Name, &s.Type, &s.Light, &s.Humidity, &s.WaterDays, &s.FertilizeDays, &s.RepotDays, &s.Description)
	if err == pgx.ErrNoRows {
		return s, ErrNotFound
	}
	return s, err
}

func (r *Repository) GetSpeciesBySlug(ctx context.Context, slug string) (model.PlantSpecies, error) {
	var s model.PlantSpecies
	err := r.pool.QueryRow(ctx, `
		SELECT id, slug, name, type, light, humidity, water_days, fertilize_days, repot_days, description
		FROM plant_species WHERE slug = $1
	`, slug).Scan(&s.ID, &s.Slug, &s.Name, &s.Type, &s.Light, &s.Humidity, &s.WaterDays, &s.FertilizeDays, &s.RepotDays, &s.Description)
	if err == pgx.ErrNoRows {
		return s, ErrNotFound
	}
	return s, err
}

func (r *Repository) ListCalendarTasks(ctx context.Context, userID uuid.UUID, days int) ([]model.CalendarTask, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT r.id, r.plant_id, p.name, r.type, r.next_at, r.repeat_days, r.enabled
		FROM reminders r
		JOIN plants p ON p.id = r.plant_id
		WHERE p.user_id = $1 AND r.enabled = true
		  AND r.next_at <= now() + ($2 || ' days')::interval
		ORDER BY r.next_at ASC
	`, userID, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tasks []model.CalendarTask
	for rows.Next() {
		var t model.CalendarTask
		if err := rows.Scan(&t.ID, &t.PlantID, &t.PlantName, &t.Type, &t.NextAt, &t.RepeatDays, &t.Enabled); err != nil {
			return nil, err
		}
		tasks = append(tasks, t)
	}
	return tasks, rows.Err()
}

func (r *Repository) CompleteReminder(ctx context.Context, userID, reminderID uuid.UUID) error {
	var repeatDays *int
	err := r.pool.QueryRow(ctx, `
		SELECT r.repeat_days FROM reminders r
		JOIN plants p ON p.id = r.plant_id
		WHERE r.id = $1 AND p.user_id = $2 AND r.enabled = true
	`, reminderID, userID).Scan(&repeatDays)
	if err == pgx.ErrNoRows {
		return ErrNotFound
	}
	if err != nil {
		return err
	}

	if repeatDays != nil && *repeatDays > 0 {
		_, err = r.pool.Exec(ctx, `
			UPDATE reminders SET next_at = next_at + ($2 || ' days')::interval, updated_at = now()
			WHERE id = $1
		`, reminderID, *repeatDays)
	} else {
		_, err = r.pool.Exec(ctx, `
			UPDATE reminders SET enabled = false, updated_at = now() WHERE id = $1
		`, reminderID)
	}
	return err
}

func (r *Repository) ListObservations(ctx context.Context, plantID uuid.UUID) ([]model.Observation, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, plant_id, notes, photo_url, created_at
		FROM observations WHERE plant_id = $1 ORDER BY created_at DESC
	`, plantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []model.Observation
	for rows.Next() {
		var o model.Observation
		if err := rows.Scan(&o.ID, &o.PlantID, &o.Notes, &o.PhotoURL, &o.CreatedAt); err != nil {
			return nil, err
		}
		list = append(list, o)
	}
	return list, rows.Err()
}

func (r *Repository) CreateObservation(ctx context.Context, plantID uuid.UUID, notes, photoURL *string) (model.Observation, error) {
	var o model.Observation
	err := r.pool.QueryRow(ctx, `
		INSERT INTO observations (plant_id, notes, photo_url)
		VALUES ($1, $2, $3)
		RETURNING id, plant_id, notes, photo_url, created_at
	`, plantID, notes, photoURL).Scan(&o.ID, &o.PlantID, &o.Notes, &o.PhotoURL, &o.CreatedAt)
	return o, err
}

func (r *Repository) CreateRemindersFromSpecies(ctx context.Context, plantID uuid.UUID, species model.PlantSpecies) error {
	now := "now()"
	tasks := []struct {
		typ   string
		days  *int
	}{
		{"water", &species.WaterDays},
		{"fertilize", species.FertilizeDays},
		{"repot", species.RepotDays},
	}

	for _, t := range tasks {
		if t.days == nil || *t.days <= 0 {
			continue
		}
		_, err := r.pool.Exec(ctx, `
			INSERT INTO reminders (plant_id, type, next_at, repeat_days)
			VALUES ($1, $2, `+now+` + ($3 || ' days')::interval, $3)
		`, plantID, t.typ, *t.days)
		if err != nil {
			return err
		}
	}
	return nil
}
