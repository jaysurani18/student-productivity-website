import React from 'react';

const Notices = () => {
  return (
    <div className="page-wrapper">
      <div className="page-header">
        <h1 className="header-title">Important Notices</h1>
      </div>
      <div className="dashboard-grid">
        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>Mid-Term Exam Dates Announced</h3>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>Posted on Oct 20 by Examination Block</p>
          <p>The mid-term exams for all branch students will commence from Nov 10. Check the detailed schedule attached below.</p>
        </div>
        <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>TechFest 2026 Registration</h3>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>Posted on Oct 19 by Cultural Committee</p>
          <p>Register your teams for the upcoming annual TechFest before Oct 30.</p>
        </div>
      </div>
    </div>
  );
};

export default Notices;
