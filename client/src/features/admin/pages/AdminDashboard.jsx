import React from 'react';
import { Users, FileText, Calendar as CalendarIcon } from 'lucide-react';

const AdminDashboard = () => {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="header-title">Admin Dashboard</h1>
        <button className="btn btn-primary">Download Reports</button>
      </div>

      <div className="dashboard-grid">
        <div className="card stat-card">
          <div className="stat-icon bg-primary-light text-primary"><Users /></div>
          <div className="stat-info">
            <p className="stat-label">Total Users</p>
            <h3 className="stat-value">1,245</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-secondary-light text-secondary"><FileText /></div>
          <div className="stat-info">
            <p className="stat-label">Active Notices</p>
            <h3 className="stat-value">12</h3>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon bg-danger-light text-danger"><CalendarIcon /></div>
          <div className="stat-info">
            <p className="stat-label">Upcoming Events</p>
            <h3 className="stat-value">4</h3>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 className="section-title">Quick Actions</h2>
        <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-primary">Create Notice</button>
            <button className="btn btn-secondary">Manage Schedule</button>
            <button className="btn btn-secondary">User Management</button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
