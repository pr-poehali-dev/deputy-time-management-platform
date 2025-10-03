-- Сделать поле time nullable для поддержки событий на весь день
ALTER TABLE events ALTER COLUMN time SET DEFAULT '00:00';
UPDATE events SET time = '00:00' WHERE time IS NULL;