import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, CheckSquare, Bell, LogOut, GraduationCap } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import ConfirmationModal from './components/ConfirmationModal';
import Dashboard from './pages/Dashboard';
import Schedule  from './pages/Schedule';
import Tasks     from './pages/Tasks';
import Notices   from './pages/Notices';
import Settings  from './pages/Settings';
import Login     from './pages/Login';
import Admin     from './pages/Admin';
import { Sun, Moon, Settings as SettingsIcon, User } from 'lucide-react';
import { Toaster } from 'react-hot-toast';

const navItems = [
  { path: '/',         label: 'Dashboard', icon: LayoutDashboard },
  { path: '/schedule', label: 'Schedule', icon: CalendarDays },
  { path: '/tasks',    label: 'Tasks',    icon: CheckSquare },
  { path: '/notices',  label: 'Assignments/Notices',  icon: Bell },
];

// Redirect to /login if not authenticated
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'#0f0f23' }}><div style={{ width:32, height:32, borderRadius:'50%', border:'3px solid #10b981', borderTopColor:'transparent', animation:'spin 0.8s linear infinite' }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;
  return user ? children : <Navigate to="/login" replace />;
};

// Redirect admin away from student app
const StudentRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  return children;
};

// Redirect student away from admin app
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const Sidebar = () => {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div className="sidebar-bg" style={{ width:'260px', minWidth:'260px', height:'100vh', display:'flex', flexDirection:'column', padding:'20px', borderRight:'1px solid rgba(255,255,255,0.06)', overflowY:'auto' }}>
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'32px', padding:'4px' }}>
        <div className="logo-icon-bg" style={{ width:'40px', height:'40px', borderRadius:'12px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', boxShadow: '0 4px 14px rgba(16,185,129,0.3)' }}>
          <GraduationCap size={22} color="#fff" />
        </div>
        <span className="logo-text-grad" style={{ fontWeight:800, fontSize:'17px', letterSpacing:'-0.02em' }}>StudyPoint</span>
      </div>

      <p style={{ color:'rgba(255,255,255,0.25)', fontSize:'11px', fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'10px', padding:'0 4px' }}>Navigation</p>

      <nav style={{ flex:1, display:'flex', flexDirection:'column', gap:'2px' }}>
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = pathname === path;
          return (
            <Link key={path} to={path} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'11px 14px', borderRadius:'12px', textDecoration:'none', fontSize:'14px', fontWeight:500, transition:'all 0.18s', color: active ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)', background: active ? 'linear-gradient(90deg,rgba(16,185,129,0.35),rgba(5,150,105,0.15))' : 'transparent', border: active ? '1px solid rgba(52,211,153,0.3)' : '1px solid transparent', boxShadow: active ? '0 2px 12px rgba(16,185,129,0.15)' : 'none' }}>
              <Icon size={17} style={{ opacity: active ? 1 : 0.55, flexShrink:0 }} />
              <span style={{ flex:1 }}>{label}</span>
              {active && <span style={{ width:6, height:6, borderRadius:'50%', background:'#6ee7b7', flexShrink:0 }} />}
            </Link>
          );
        })}
        {/* Settings Link */}
        <Link to="/settings" style={{ display:'flex', alignItems:'center', gap:'12px', padding:'11px 14px', borderRadius:'12px', textDecoration:'none', fontSize:'14px', fontWeight:500, transition:'all 0.18s', color: pathname === '/settings' ? 'var(--sidebar-text-active)' : 'var(--sidebar-text)', background: pathname === '/settings' ? 'linear-gradient(90deg,rgba(16,185,129,0.35),rgba(5,150,105,0.15))' : 'transparent', border: pathname === '/settings' ? '1px solid rgba(52,211,153,0.3)' : '1px solid transparent', marginTop:'4px' }}>
          <User size={17} style={{ opacity: pathname === '/settings' ? 1 : 0.55, flexShrink:0 }} />
          <span style={{ flex:1 }}>My Profile</span>
        </Link>
      </nav>

      <div style={{ padding:'0 4px', marginBottom:'16px' }}>
        <button onClick={toggleTheme} style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'10px 14px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.7)', fontSize:'13px', fontWeight:600, cursor:'pointer', transition:'all 0.2s' }}>
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      <div style={{ marginTop:'auto', paddingTop:'16px', borderTop:'1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'0 4px', marginBottom:'10px' }}>
          <div style={{ width:'36px', height:'36px', borderRadius:'10px', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:'13px', fontWeight:700, background:'rgba(255,255,255,0.1)' }}>
            {user?.name?.[0]?.toUpperCase() || 'S'}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <p style={{ color:'rgba(255,255,255,0.8)', fontSize:'13px', fontWeight:600, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user?.name || 'Student'}</p>
            <p style={{ color:'rgba(255,255,255,0.35)', fontSize:'11px', margin:0 }}>Academic Year 2025</p>
          </div>
        </div>
        <button onClick={() => setShowLogoutModal(true)}
          style={{ display:'flex', alignItems:'center', gap:'8px', width:'100%', padding:'9px 12px', borderRadius:'10px', border:'1px solid rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.06)', color:'rgba(239,68,68,0.7)', fontSize:'12px', fontWeight:600, cursor:'pointer', transition:'all 0.18s' }}
          onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.15)'; e.currentTarget.style.color='#f87171'; }}
          onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.06)'; e.currentTarget.style.color='rgba(239,68,68,0.7)'; }}>
          <LogOut size={13} /> Sign Out
        </button>
      </div>

      <ConfirmationModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => { logout(); window.location.href = '/login'; }}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Yes, Sign Out"
      />
    </div>
  );
};

function AppShell() {
  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:"'Inter',sans-serif", background:'var(--bg-primary)', color:'var(--text-primary)', transition:'background-color 0.3s ease, color 0.3s ease' }}>
      <Sidebar />
      <div style={{ flex:1, overflowY:'auto' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto', padding:'40px 32px' }}>
          <Routes>
            <Route path="/"         element={<Dashboard />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/tasks"    element={<Tasks />} />
            <Route path="/notices"  element={<Notices />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-secondary)', color: 'var(--text-primary)', borderRadius: '12px', border: '1px solid var(--border-color)' } }} />
          <Routes>
            {/* Public */}
            <Route path="/login" element={<Login />} />

            {/* Admin only */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              </ProtectedRoute>
            } />

            {/* Student app (protected) */}
            <Route path="/*" element={
              <ProtectedRoute>
                <StudentRoute>
                  <AppShell />
                </StudentRoute>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
