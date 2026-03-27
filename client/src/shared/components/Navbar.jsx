import React from 'react';
import { Bell, Search, User } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  return (
    <header className="navbar">
      <div className="navbar-search">
        <Search size={20} className="icon-muted" />
        <input type="text" placeholder="Search tasks, events..." className="search-input" />
      </div>
      <div className="navbar-actions">
        <button className="icon-btn">
          <Bell size={20} />
          <span className="badge">3</span>
        </button>
        <button className="profile-btn">
          <User size={20} />
          <span>Student</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
