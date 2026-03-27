# Campus Companion - Smart Student Productivity Hub

A comprehensive student productivity app to manage timetables, tasks, and institutional notices.

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [PostgreSQL](https://www.postgresql.org/) (v14+)

---

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Edit the `.env` file with your PostgreSQL credentials.*
4. Initialize the database:
   *Use the `schema.sql` file to create the database and tables.*
   ```bash
   psql -U your_username -f schema.sql
   ```
5. Start the server:
   ```bash
   npm run dev
   ```

---

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm run dev
   ```
   *The app should be running at `http://localhost:5173`.*

---

## 🛠️ Features
- **Student Dashboard:** Real-time analytics and task progress tracking.
- **Task Management:** Categorized tasks with urgency levels and deadlines.
- **Schedule:** Interactive timetable for lectures and events.
- **Notices:** Institutional announcements with file attachment support.
- **Profile:** Theme toggle (Dark/Light) and personal settings.

## 🔑 Default Admin Account
- **Email:** `admin@campus.com`
- **Password:** `admin123`

---

## 📦 Tech Stack
- **Frontend:** React, Lucide-React, CSS Variables (for themes)
- **Backend:** Node.js, Express, Multer (File Uploads)
- **Database:** PostgreSQL
- **Authentication:** JWT & bcrypt
