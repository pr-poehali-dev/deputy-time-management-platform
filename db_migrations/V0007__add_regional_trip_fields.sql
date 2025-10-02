-- Добавление полей для выезда в регион
ALTER TABLE events ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS region_name VARCHAR(255);
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_multi_day BOOLEAN DEFAULT FALSE;