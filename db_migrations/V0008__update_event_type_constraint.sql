-- Обновление constraint для типов событий (добавление regional-trip)
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_type_check;
ALTER TABLE events ADD CONSTRAINT events_type_check 
    CHECK (type IN ('meeting', 'vks', 'hearing', 'committee', 'visit', 'reception', 'regional-trip'));