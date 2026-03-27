-- Add flags to notices and assignments to link them
ALTER TABLE notices ADD COLUMN requires_submission BOOLEAN DEFAULT false;

ALTER TABLE assignment_submissions 
ADD COLUMN notice_id INTEGER REFERENCES notices(id) ON DELETE CASCADE;
