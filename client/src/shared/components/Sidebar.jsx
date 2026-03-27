import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CheckSquare, Calendar, Bell, Settings } from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { path: '/', name: 'Dashboard', icon: <Home size={20} /> },
    { path: '/tasks', name: 'Tasks', icon: <CheckSquare size={20} /> },
    { path: '/schedule', name: 'Schedule', icon: <Calendar size={20} /> },
    { path: '/notices', name: 'Notices', icon: <Bell size={20} /> },
    //{ path: '/admin', name: 'Admin Panel', icon: <Settings size={20} /> }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="logo-icon">CC</div>
        <h2>Campus<span>Companion</span></h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="user-info">
          <p className="user-name">John Doe</p>
          <p className="user-role">CS Student</p>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
