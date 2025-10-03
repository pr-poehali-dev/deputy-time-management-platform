-- Добавляем новый статус 'archived' в check constraint для events
-- Сначала удаляем старый constraint если он есть
ALTER TABLE events DROP CONSTRAINT IF EXISTS events_status_check;

-- Создаём новый constraint с добавленным 'archived' и 'pending'
ALTER TABLE events ADD CONSTRAINT events_status_check 
CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled', 'archived', 'pending'));