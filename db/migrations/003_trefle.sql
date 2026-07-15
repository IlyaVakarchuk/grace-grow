ALTER TABLE plant_species
    ADD COLUMN trefle_id INT UNIQUE,
    ADD COLUMN image_url TEXT,
    ADD COLUMN scientific_name TEXT,
    ADD COLUMN source TEXT NOT NULL DEFAULT 'seed';

CREATE INDEX idx_plant_species_trefle_id ON plant_species(trefle_id) WHERE trefle_id IS NOT NULL;
