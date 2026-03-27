-- Phase 2 Migrations

-- 1. Add user_id to tasks for personalized task management
-- (Each student should see only their own tasks)
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES users(id);

-- 2. Add attachment_path to notices for document sharing
-- (Admins can attach files to notifications)
ALTER TABLE notices ADD COLUMN IF NOT EXISTS attachment_path TEXT;
