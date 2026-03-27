UPDATE notices SET requires_submission = true WHERE title ILIKE '%assignment%' OR content ILIKE '%assignment%';
