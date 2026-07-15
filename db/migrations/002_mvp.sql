CREATE TABLE plant_species (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug           TEXT NOT NULL UNIQUE,
    name           TEXT NOT NULL,
    type           TEXT NOT NULL CHECK (type IN ('vegetable', 'herb', 'spice', 'fruit', 'indoor', 'other')),
    light          TEXT NOT NULL,
    humidity       TEXT NOT NULL,
    water_days     INT NOT NULL DEFAULT 7,
    fertilize_days INT,
    repot_days     INT,
    description    TEXT
);

ALTER TABLE plants ADD COLUMN species_id UUID REFERENCES plant_species(id);

CREATE TABLE observations (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plant_id    UUID NOT NULL REFERENCES plants(id) ON DELETE CASCADE,
    notes       TEXT,
    photo_url   TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_observations_plant_id ON observations(plant_id);
CREATE INDEX idx_plants_species_id ON plants(species_id);

INSERT INTO plant_species (slug, name, type, light, humidity, water_days, fertilize_days, repot_days, description) VALUES
('tomato', 'Томат', 'vegetable', 'Полное солнце, 6-8 ч', 'Средняя, 50-70%', 2, 14, 365, 'Теплолюбивое растение. Полив обильный, но без застоя воды.'),
('basil', 'Базилик', 'herb', 'Яркий рассеянный свет', 'Умеренная, 40-60%', 3, 21, 180, 'Любит тепло и регулярный полив. Срезайте верхушки для кустистости.'),
('mint', 'Мята', 'herb', 'Полутень или солнце', 'Высокая, 60-80%', 2, 30, 365, 'Быстро разрастается. Лучше в отдельном горшке.'),
('pepper', 'Перец', 'vegetable', 'Полное солнце', 'Средняя, 50-60%', 3, 14, 365, 'Тепло и свет критичны. Полив после подсыхания верхнего слоя.'),
('parsley', 'Петрушка', 'herb', 'Солнце или полутень', 'Умеренная, 50%', 4, 21, 180, 'Морозостойкая зелень. Не переувлажняйте почву.'),
('cucumber', 'Огурец', 'vegetable', 'Яркий свет', 'Высокая, 70-80%', 1, 10, NULL, 'Требует частого полива и опрыскивания.'),
('rosemary', 'Розмарин', 'spice', 'Полное солнце', 'Низкая, 30-50%', 7, 30, 730, 'Засухоустойчив. Полив редкий, хороший дренаж.'),
('thyme', 'Тимьян', 'spice', 'Солнце', 'Низкая, 30-40%', 5, 30, 365, 'Не любит переувлажнение. Почва должна просыхать.'),
('aloe', 'Алоэ', 'indoor', 'Яркий свет', 'Низкая, 30%', 14, 60, 730, 'Суккулент. Полив раз в 2 недели зимой.'),
('monstera', 'Монстера', 'indoor', 'Рассеянный свет', 'Высокая, 60-70%', 7, 30, 365, 'Тропическое растение. Опрыскивайте листья.');
