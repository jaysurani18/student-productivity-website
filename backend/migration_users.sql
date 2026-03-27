-- Run this in pgAdmin to add the users table
-- (Keep existing tables intact)

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student', -- 'student' or 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the first admin account (password: admin123)
-- bcrypt hash of 'admin123' with 10 rounds
INSERT INTO users (name, email, password_hash, role)
VALUES (
    'Admin',
    'admin@campus.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin'
)
ON CONFLICT (email) DO NOTHING;
