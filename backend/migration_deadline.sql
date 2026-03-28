-- Add deadline column to notices for assignment submission deadlines
ALTER TABLE notices ADD COLUMN IF NOT EXISTS deadline TIMESTAMP;
