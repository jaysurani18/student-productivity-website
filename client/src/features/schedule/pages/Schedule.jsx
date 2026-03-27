import React from 'react';

const Schedule = () => {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="header-title">My Schedule</h1>
      </div>
      <div className="card">
        <p className="text-muted">Calendar integration and detailed schedule view will be implemented here.</p>
        <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div className="card stat-card" style={{ flex: 1 }}>
                <div className="stat-info">
                    <p className="stat-label">Monday</p>
                    <h4 style={{marginTop: '0.5rem'}}>Data Structures - 09:00 AM</h4>
                    <p className="text-muted">Room 302</p>
                </div>
            </div>
            <div className="card stat-card" style={{ flex: 1 }}>
                <div className="stat-info">
                    <p className="stat-label">Tuesday</p>
                    <h4 style={{marginTop: '0.5rem'}}>Operating Systems - 11:00 AM</h4>
                    <p className="text-muted">Room 101</p>
                </div>
            </div>
            <div className="card stat-card" style={{ flex: 1 }}>
                <div className="stat-info">
                    <p className="stat-label">Wednesday</p>
                    <h4 style={{marginTop: '0.5rem'}}>Database Systems - 01:00 PM</h4>
                    <p className="text-muted">Room 205</p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Schedule;
