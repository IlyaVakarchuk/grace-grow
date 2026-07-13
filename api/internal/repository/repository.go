package repository

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/vakarchukiv/grace/api/internal/model"
)

var ErrNotFound = errors.New("not found")

type Repository struct {
	pool *pgxpool.Pool
}

func New(pool *pgxpool.Pool) *Repository {
	return &Repository{pool: pool}
}

func (r *Repository) CreateUser(ctx context.Context, email, passwordHash, name string) (model.User, error) {
	var u model.User
	err := r.pool.QueryRow(ctx, `
		INSERT INTO users (email, password_hash, name)
		VALUES ($1, $2, $3)
		RETURNING id, email, name, created_at
	`, email, passwordHash, name).Scan(&u.ID, &u.Email, &u.Name, &u.CreatedAt)
	return u, err
}

func (r *Repository) GetUserByEmail(ctx context.Context, email string) (model.User, string, error) {
	var u model.User
	var hash string
	err := r.pool.QueryRow(ctx, `
		SELECT id, email, name, created_at, password_hash
		FROM users WHERE email = $1
	`, email).Scan(&u.ID, &u.Email, &u.Name, &u.CreatedAt, &hash)
	return u, hash, err
}

func (r *Repository) GetUserByID(ctx context.Context, id uuid.UUID) (model.User, error) {
	var u model.User
	err := r.pool.QueryRow(ctx, `
		SELECT id, email, name, created_at FROM users WHERE id = $1
	`, id).Scan(&u.ID, &u.Email, &u.Name, &u.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return u, ErrNotFound
	}
	return u, err
}

func (r *Repository) ListPlants(ctx context.Context, userID uuid.UUID) ([]model.Plant, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, user_id, name, species, location, planted_at, notes, created_at, updated_at
		FROM plants WHERE user_id = $1 ORDER BY created_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var plants []model.Plant
	for rows.Next() {
		var p model.Plant
		if err := rows.Scan(&p.ID, &p.UserID, &p.Name, &p.Species, &p.Location, &p.PlantedAt, &p.Notes, &p.CreatedAt, &p.UpdatedAt); err != nil {
			return nil, err
		}
		plants = append(plants, p)
	}
	return plants, rows.Err()
}

func (r *Repository) CreatePlant(ctx context.Context, userID uuid.UUID, name, species string, location, notes *string, plantedAt time.Time) (model.Plant, error) {
	var p model.Plant
	err := r.pool.QueryRow(ctx, `
		INSERT INTO plants (user_id, name, species, location, notes, planted_at)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, user_id, name, species, location, planted_at, notes, created_at, updated_at
	`, userID, name, species, location, notes, plantedAt).Scan(
		&p.ID, &p.UserID, &p.Name, &p.Species, &p.Location, &p.PlantedAt, &p.Notes, &p.CreatedAt, &p.UpdatedAt,
	)
	return p, err
}

func (r *Repository) GetPlant(ctx context.Context, userID, plantID uuid.UUID) (model.Plant, error) {
	var p model.Plant
	err := r.pool.QueryRow(ctx, `
		SELECT id, user_id, name, species, location, planted_at, notes, created_at, updated_at
		FROM plants WHERE id = $1 AND user_id = $2
	`, plantID, userID).Scan(
		&p.ID, &p.UserID, &p.Name, &p.Species, &p.Location, &p.PlantedAt, &p.Notes, &p.CreatedAt, &p.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return p, ErrNotFound
	}
	return p, err
}

func (r *Repository) UpdatePlant(ctx context.Context, userID, plantID uuid.UUID, name, species string, location, notes *string, plantedAt time.Time) (model.Plant, error) {
	var p model.Plant
	err := r.pool.QueryRow(ctx, `
		UPDATE plants SET name=$3, species=$4, location=$5, notes=$6, planted_at=$7, updated_at=now()
		WHERE id=$1 AND user_id=$2
		RETURNING id, user_id, name, species, location, planted_at, notes, created_at, updated_at
	`, plantID, userID, name, species, location, notes, plantedAt).Scan(
		&p.ID, &p.UserID, &p.Name, &p.Species, &p.Location, &p.PlantedAt, &p.Notes, &p.CreatedAt, &p.UpdatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return p, ErrNotFound
	}
	return p, err
}

func (r *Repository) DeletePlant(ctx context.Context, userID, plantID uuid.UUID) error {
	tag, err := r.pool.Exec(ctx, `DELETE FROM plants WHERE id=$1 AND user_id=$2`, plantID, userID)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (r *Repository) ListCareLogs(ctx context.Context, plantID uuid.UUID) ([]model.CareLog, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, plant_id, type, notes, created_at
		FROM care_logs WHERE plant_id = $1 ORDER BY created_at DESC
	`, plantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var logs []model.CareLog
	for rows.Next() {
		var l model.CareLog
		if err := rows.Scan(&l.ID, &l.PlantID, &l.Type, &l.Notes, &l.CreatedAt); err != nil {
			return nil, err
		}
		logs = append(logs, l)
	}
	return logs, rows.Err()
}

func (r *Repository) CreateCareLog(ctx context.Context, plantID uuid.UUID, logType string, notes *string) (model.CareLog, error) {
	var l model.CareLog
	err := r.pool.QueryRow(ctx, `
		INSERT INTO care_logs (plant_id, type, notes)
		VALUES ($1, $2, $3)
		RETURNING id, plant_id, type, notes, created_at
	`, plantID, logType, notes).Scan(&l.ID, &l.PlantID, &l.Type, &l.Notes, &l.CreatedAt)
	return l, err
}

func (r *Repository) ListReminders(ctx context.Context, plantID uuid.UUID) ([]model.Reminder, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, plant_id, type, next_at, repeat_days, enabled, created_at, updated_at
		FROM reminders WHERE plant_id = $1 ORDER BY next_at ASC
	`, plantID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reminders []model.Reminder
	for rows.Next() {
		var rem model.Reminder
		if err := rows.Scan(&rem.ID, &rem.PlantID, &rem.Type, &rem.NextAt, &rem.RepeatDays, &rem.Enabled, &rem.CreatedAt, &rem.UpdatedAt); err != nil {
			return nil, err
		}
		reminders = append(reminders, rem)
	}
	return reminders, rows.Err()
}

func (r *Repository) CreateReminder(ctx context.Context, plantID uuid.UUID, remType string, nextAt time.Time, repeatDays *int) (model.Reminder, error) {
	var rem model.Reminder
	err := r.pool.QueryRow(ctx, `
		INSERT INTO reminders (plant_id, type, next_at, repeat_days)
		VALUES ($1, $2, $3, $4)
		RETURNING id, plant_id, type, next_at, repeat_days, enabled, created_at, updated_at
	`, plantID, remType, nextAt, repeatDays).Scan(
		&rem.ID, &rem.PlantID, &rem.Type, &rem.NextAt, &rem.RepeatDays, &rem.Enabled, &rem.CreatedAt, &rem.UpdatedAt,
	)
	return rem, err
}

func (r *Repository) ListUpcomingReminders(ctx context.Context, userID uuid.UUID, limit int) ([]model.Reminder, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT r.id, r.plant_id, r.type, r.next_at, r.repeat_days, r.enabled, r.created_at, r.updated_at
		FROM reminders r
		JOIN plants p ON p.id = r.plant_id
		WHERE p.user_id = $1 AND r.enabled = true AND r.next_at <= now() + interval '7 days'
		ORDER BY r.next_at ASC
		LIMIT $2
	`, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reminders []model.Reminder
	for rows.Next() {
		var rem model.Reminder
		if err := rows.Scan(&rem.ID, &rem.PlantID, &rem.Type, &rem.NextAt, &rem.RepeatDays, &rem.Enabled, &rem.CreatedAt, &rem.UpdatedAt); err != nil {
			return nil, err
		}
		reminders = append(reminders, rem)
	}
	return reminders, rows.Err()
}
