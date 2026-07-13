CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    name        TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE plants (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    species     TEXT NOT NULL DEFAULT 'other',
    location    TEXT,
    planted_at  DATE NOT NULL DEFAULT CURRENT_DATE,
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_plants_user_id ON plants(user_id);

CREATE TABLE care_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id    UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    type        TEXT NOT NULL CHECK (type IN ('water', 'fertilize', 'prune', 'harvest', 'repot', 'other')),
    notes       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_care_logs_plant_id ON care_logs(plant_id);

CREATE TABLE reminders (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id     UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    type         TEXT NOT NULL CHECK (type IN ('water', 'fertilize', 'prune', 'harvest', 'repot', 'other')),
    next_at      TIMESTAMPTZ NOT NULL,
    repeat_days  INT,
    enabled      BOOLEAN NOT NULL DEFAULT true,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_reminders_plant_id ON reminders(plant_id);
CREATE INDEX idx_reminders_next_at ON reminders(next_at) WHERE enabled = true;

CREATE TABLE photos (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id    UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    caption     TEXT,
    taken_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_photos_plant_id ON photos(plant_id);
