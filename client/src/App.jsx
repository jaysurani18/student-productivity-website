import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './shared/components/Layout';
import Dashboard from './features/dashboard/pages/Dashboard';
import TaskManagement from './features/tasks/pages/TaskManagement';
import Schedule from './features/schedule/pages/Schedule';
import Notices from './features/notices/pages/Notices';
import AdminDashboard from './features/admin/pages/AdminDashboard';
import Login from './features/auth/pages/Login';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="tasks" element={<TaskManagement />} />
        <Route path="schedule" element={<Schedule />} />
        <Route path="notices" element={<Notices />} />
        <Route path="admin" element={<AdminDashboard />} />
      </Route>
    </Routes>
  );
}

export default App;
