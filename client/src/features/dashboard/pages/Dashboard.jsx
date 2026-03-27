import React from 'react';
import { Calendar, CheckSquare, AlertCircle } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <h1 className="header-title">Welcome back, John! 👋</h1>
      
      <div className="dashboard-grid">
        <div className="card stat-card">
          <div className="stat-icon bg-primary-light">
            <CheckSquare className="text-primary" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Pending Tasks</p>
            <h3 className="stat-value">5</h3>
          </div>
        </div>
        
        <div className="card stat-card">
          <div className="stat-icon bg-secondary-light">
            <Calendar className="text-secondary" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Today's Classes</p>
            <h3 className="stat-value">3</h3>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon bg-danger-light">
            <AlertCircle className="text-danger" />
          </div>
          <div className="stat-info">
            <p className="stat-label">Urgent Deadlines</p>
            <h3 className="stat-value">2</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="card dashboard-section">
          <h2 className="section-title">Today's Schedule</h2>
          <div className="schedule-list">
            <div className="schedule-item">
              <div className="time">09:00 AM</div>
              <div className="details">
                <h4>Data Structures</h4>
                <p>Room 302</p>
              </div>
            </div>
            <div className="schedule-item">
              <div className="time">11:30 AM</div>
              <div className="details">
                <h4>Software Engineering</h4>
                <p>Room 105</p>
              </div>
            </div>
            <div className="schedule-item pb-last">
              <div className="time">02:00 PM</div>
              <div className="details">
                <h4>Project Meeting</h4>
                <p>Library Collab Space</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card dashboard-section">
          <h2 className="section-title">Urgent Tasks</h2>
          <div className="task-list">
            <div className="task-item urgent">
              <div className="task-checkbox"></div>
              <div className="task-details">
                <h4>Submit SE Assignment</h4>
                <p>Today, 11:59 PM</p>
              </div>
            </div>
            <div className="task-item high">
              <div className="task-checkbox"></div>
              <div className="task-details">
                <h4>Prepare DB Presentation</h4>
                <p>Tomorrow, 10:00 AM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
