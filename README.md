# Campus Companion - Student Productivity Platform

A full-stack web app for students to manage tasks, schedules, and notices. Built with React, Node.js, Express, and MongoDB.

## Features

- 📊 Personal Dashboard
- ✅ Task Management 
- 📅 Schedule Planner
- 📢 Notices & Announcements
- 👤 Student/Admin Roles
- 🔐 User Authentication

## Tech Stack

**Frontend:** React 19 • Vite • React Router • Axios • Lucide Icons

**Backend:** Node.js • Express 5 • MongoDB • Mongoose • CORS

## Quick Start

### Prerequisites
- Node.js v16+
- MongoDB (local or Atlas)

### Setup

```bash
# Clone and navigate
cd student-productivity-website-main

# Backend
cd server
npm install
# Create .env
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/student-productivity

# Frontend (new terminal)
cd client
npm install
```

### Run

**Backend:** 
```bash
cd server
npm start  # runs on http://localhost:5000
```

**Frontend:**
```bash
cd client
npm run dev  # runs on http://localhost:5173
```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── features/      # Auth, Dashboard, Tasks, Schedule, Notices, Admin
│   │   ├── shared/        # Layout, Navbar, Sidebar
│   │   └── App.jsx
│   └── package.json
│
└── server/                # Express backend
    ├── src/
    │   ├── models/        # User, Task, Event, Notice schemas
    │   ├── routes/        # API routes
    │   ├── app.js
    │   └── server.js
    └── package.json
```

## API Routes

- `GET /api/users`
- `GET /api/tasks`
- `GET /api/events`
- `GET /api/notices`


