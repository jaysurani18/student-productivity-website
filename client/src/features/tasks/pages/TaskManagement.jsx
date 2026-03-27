import React, { useState } from 'react';
import { Plus, Filter } from 'lucide-react';
import './TaskManagement.css';

const TaskManagement = () => {
  const [tasks] = useState([
    { id: 1, title: 'Submit SE Assignment', priority: 'High', date: 'Oct 25', status: 'Pending' },
    { id: 2, title: 'Read Chapter 4 OS', priority: 'Medium', date: 'Oct 26', status: 'Pending' },
    { id: 3, title: 'Register for Hackathon', priority: 'Low', date: 'Oct 28', status: 'Completed' },
  ]);

  return (
    <div className="task-page">
      <div className="page-header">
        <h1 className="header-title">Task Management</h1>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <Filter size={18} /> Filter
          </button>
          <button className="btn btn-primary">
            <Plus size={18} /> New Task
          </button>
        </div>
      </div>

      <div className="card">
        <table className="task-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Priority</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map(task => (
              <tr key={task.id}>
                <td>
                  <span className={`task-title ${task.status === 'Completed' ? 'completed' : ''}`}>
                    {task.title}
                  </span>
                </td>
                <td>
                  <span className={`badge-priority ${task.priority.toLowerCase()}`}>
                    {task.priority}
                  </span>
                </td>
                <td>{task.date}</td>
                <td>
                  <span className={`badge-status ${task.status.toLowerCase()}`}>
                    {task.status}
                  </span>
                </td>
                <td>
                  <button className="btn-link">Edit</button>
                  <button className="btn-link text-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskManagement;
