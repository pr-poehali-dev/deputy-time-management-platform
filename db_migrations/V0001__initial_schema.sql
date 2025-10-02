-- Создание таблиц для системы управления графиком депутата

-- Таблица пользователей (администраторы и ответственные лица)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    position VARCHAR(255),
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'user')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица событий
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('meeting', 'vks', 'hearing', 'committee', 'visit', 'reception')),
    date DATE NOT NULL,
    time TIME NOT NULL,
    end_time TIME,
    location VARCHAR(500),
    vks_link TEXT,
    description TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in-progress', 'completed', 'cancelled')),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица связи событий и ответственных лиц
CREATE TABLE IF NOT EXISTS event_responsible (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(event_id, user_id)
);

-- Таблица напоминаний
CREATE TABLE IF NOT EXISTS event_reminders (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL REFERENCES events(id),
    reminder_text VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для производительности
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_type ON events(type);
CREATE INDEX IF NOT EXISTS idx_event_responsible_event ON event_responsible(event_id);
CREATE INDEX IF NOT EXISTS idx_event_responsible_user ON event_responsible(user_id);

-- Создание администратора по умолчанию (пароль: admin123)
INSERT INTO users (email, password_hash, full_name, position, role) 
VALUES (
    'admin@deputy.gov.ru',
    '$2b$10$XQvJ5XZ7YnHhW3qCZ3qYYuJ5X9xN5Z7YnHhW3qCZ3qYYuJ5X9xN5Z',
    'Администратор системы',
    'Главный администратор',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Вставка тестовых пользователей
INSERT INTO users (email, password_hash, full_name, position, role) VALUES
    ('ivanov@deputy.gov.ru', '$2b$10$XQvJ5XZ7YnHhW3qCZ3qYYuJ5X9xN5Z7YnHhW3qCZ3qYYuJ5X9xN5Z', 'Иванов И.И.', 'Помощник депутата', 'user'),
    ('petrova@deputy.gov.ru', '$2b$10$XQvJ5XZ7YnHhW3qCZ3qYYuJ5X9xN5Z7YnHhW3qCZ3qYYuJ5X9xN5Z', 'Петрова М.С.', 'Советник', 'user'),
    ('sidorov@deputy.gov.ru', '$2b$10$XQvJ5XZ7YnHhW3qCZ3qYYuJ5X9xN5Z7YnHhW3qCZ3qYYuJ5X9xN5Z', 'Сидоров А.В.', 'Секретарь', 'user')
ON CONFLICT (email) DO NOTHING;