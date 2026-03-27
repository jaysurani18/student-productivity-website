-- Campus Companion - Final Database Schema

CREATE DATABASE campus_companion;

\c campus_companion;

-- 1. Users table (Students & Admins)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'student', -- 'student' or 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tasks table (Linked to User)
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    due_date TIMESTAMP,
    urgency_level VARCHAR(20) DEFAULT 'medium', -- low, medium, high
    is_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Events table (Personal Schedule)
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    location VARCHAR(255),
    event_type VARCHAR(50), -- lecture, lab, meeting, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Notices table (Institutional)
CREATE TABLE notices (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    severity VARCHAR(20) DEFAULT 'info', -- info, warning, alert
    attachment_path VARCHAR(255), -- Relative path to uploaded file
    posted_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Default Admin Account (password: admin123)
-- bcrypt hash of 'admin123' with 10 rounds
INSERT INTO users (name, email, password_hash, role)
VALUES (
    'Admin',
    'admin@campus.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
    'admin'
)
ON CONFLICT (email) DO NOTHING;
