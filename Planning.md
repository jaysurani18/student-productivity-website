# Campus Companion API - Architecture Plan

## Tech Stack
- Node.js & Express
- PostgreSQL (Database)
- Prisma (ORM)

## Database Schema (3rd Normal Form)
We are using strict relational integrity. Do not add redundant columns.

1. **roles**: id, role_name (e.g., 'student', 'admin')
2. **categories**: id, category_name (e.g., 'Exams', 'Clubs')
3. **priorities**: id, level_name, weight_score (int)
4. **users**: id, role_id (FK), email, password_hash
5. **tasks**: id, user_id (FK), category_id (FK), priority_id (FK), title, description, due_date, is_completed (boolean)
6. **events**: id, user_id (FK), category_id (FK), title, start_time, end_time, location
7. **notices**: id, author_id (FK -> users.id), category_id (FK), title, body_content, published_at