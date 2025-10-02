ALTER TABLE users ADD COLUMN IF NOT EXISTS login VARCHAR(100) UNIQUE;

UPDATE users SET login = 'admin' WHERE email = 'admin@deputy.gov.ru';