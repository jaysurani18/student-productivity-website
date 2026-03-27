import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, CalendarDays, Bell, TrendingUp, AlertCircle, ArrowRight, Clock, Paperclip } from 'lucide-react';
import api from '../api';

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

const UDot = ({ level }) => {
  const colors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
  const shadows = { high: 'rgba(239,68,68,0.7)', medium: 'rgba(245,158,11,0.7)', low: 'rgba(16,185,129,0.7)' };
  return <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: colors[level], boxShadow: `0 0 6px ${shadows[level]}` }} />;
};

const Dashboard = () => {
  const [tasks, setTasks]     = useState([]);
  const [stats, setStats]     = useState({ total: 0, completed: 0, pending: 0, high_priority: 0 });
  const [events, setEvents]   = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const d = new Date();
    const today = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    Promise.all([
      api.get('/tasks').catch(() => ({ data: [] })),
      api.get('/tasks/stats').catch(() => ({ data: { total: 0, completed: 0, pending: 0, high_priority: 0 } })),
      api.get('/events', { params: { date: today } }).catch(() => ({ data: [] })),
      api.get('/notices').catch(() => ({ data: [] })),
    ]).then(([t, s, e, n]) => {
      setTasks(Array.isArray(t.data) ? t.data : []);
      setStats(s.data || { total: 0, completed: 0, pending: 0, high_priority: 0 });
      setEvents(Array.isArray(e.data) ? e.data : []);
      setNotices(Array.isArray(n.data) ? n.data : []);
      setLoading(false);
    });
  }, []);

  const progress = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;
  const urgentTasks = tasks.filter(t => t.urgency_level === 'high' && !t.is_completed);

  const formatTime = (dt) => new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const formatDateShort = (dt) => new Date(dt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });

  const StatCard = ({ icon: Icon, label, value, sub, color, bg }) => (
    <div style={{ background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', padding: '22px', display: 'flex', flexDirection: 'column', gap: '12px', transition: 'all 0.3s ease' }}>
      <div style={{ width: 44, height: 44, borderRadius: '14px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={22} style={{ color }} />
      </div>
      <div>
        <p style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>{value}</p>
        <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', margin: '4px 0 0' }}>{label}</p>
        {sub && <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{sub}</p>}
      </div>
    </div>
  );

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid #10b981', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
      <p style={{ color: '#94a3b8', fontWeight: 500 }}>Loading your dashboard...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ animation: 'pageUp 0.35s ease both' }}>
      {/* Greeting */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
          {greeting()}, Student! 👋
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      {/* Stats cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', marginBottom: '28px' }}>
        <StatCard icon={CheckSquare} label="Pending Tasks"   value={stats.pending}         sub={`${stats.completed} completed`} color="#10b981" bg="#ecfdf5" />
        <StatCard icon={TrendingUp}  label="Progress"        value={`${progress}%`}         sub="Current completion"                     color="#059669" bg="#d1fae5" />
        <StatCard icon={CalendarDays} label="Events Today"  value={events.length}           sub="scheduled for today"                 color="#2563eb" bg="#dbeafe" />
        <StatCard icon={Bell}         label="Active Notices" value={notices.length}         sub="from institution"                    color="#d97706" bg="#fef3c7" />
      </div>

      {/* Progress bar */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', padding: '20px', marginBottom: '28px', transition: 'all 0.3s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Task Completion Progress</span>
          <span style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}>{stats.completed} / {stats.total} Tasks</span>
        </div>
        <div style={{ height: '10px', background: 'var(--bg-primary)', borderRadius: '999px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#10b981,#059669)', borderRadius: '999px', transition: 'width 0.8s ease' }} />
        </div>
      </div>

      {/* Urgent alert banner */}
      {stats.high_priority > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid #fca5a5', borderRadius: '16px', padding: '14px 18px', marginBottom: '24px' }}>
          <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#dc2626' }}>
            Attention! You have {stats.high_priority} high-priority task{stats.high_priority > 1 ? 's' : ''} pending.
          </p>
          <Link to="/tasks" style={{ marginLeft: 'auto', color: '#dc2626', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}>
            Action Required <ArrowRight size={14} />
          </Link>
        </div>
      )}

      {/* Two-col: Urgent Tasks + Today's Events */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>

        {/* Urgent tasks */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', padding: '22px', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', margin: 0 }}>🔥 Urgent Tasks</h3>
            <Link to="/tasks" style={{ fontSize: '12px', fontWeight: 600, color: '#10b981', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>All <ArrowRight size={12} /></Link>
          </div>
          {urgentTasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '28px', margin: '0 0 8px' }}>✅</p>
              <p style={{ fontSize: '13px', margin: 0 }}>No urgent tasks!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {urgentTasks.slice(0, 4).map(t => (
                <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'rgba(239,68,68,0.05)', borderRadius: '12px', border: '1px solid rgba(239,68,68,0.15)' }}>
                  <UDot level="high" />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</p>
                    {t.due_date && <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{formatDateShort(t.due_date)}</p>}
                  </div>
                  {t.category && <span style={{ fontSize: '10px', fontWeight: 600, color: '#dc2626', background: '#fee2e2', padding: '2px 6px', borderRadius: '6px' }}>{t.category}</span>}
                </div>
              ))}
              {urgentTasks.length > 4 && <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', margin: '4px 0 0' }}>+{urgentTasks.length - 4} more</p>}
            </div>
          )}
        </div>

        {/* Today's Events */}
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', padding: '22px', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', margin: 0 }}>📅 Today's Schedule</h3>
            <Link to="/schedule" style={{ fontSize: '12px', fontWeight: 600, color: '#10b981', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>All <ArrowRight size={12} /></Link>
          </div>
          {events.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '28px', margin: '0 0 8px' }}>🎉</p>
              <p style={{ fontSize: '13px', margin: 0 }}>Nothing scheduled today!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {events.slice(0, 4).map(ev => (
                <div key={ev.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', background: 'var(--bg-primary)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                  <Clock size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.title}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{formatTime(ev.start_time)} – {formatTime(ev.end_time)}</p>
                  </div>
                  {ev.event_type && <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', background: '#ecfdf5', padding: '2px 6px', borderRadius: '6px' }}>{ev.event_type}</span>}
                </div>
              ))}
              {events.length > 4 && <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', margin: '4px 0 0' }}>+{events.length - 4} more</p>}
            </div>
          )}
        </div>
      </div>

      {/* Recent Notices */}
      {notices.length > 0 && (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: '20px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', padding: '22px', transition: 'all 0.3s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', margin: 0 }}>📢 Recent Notices</h3>
            <Link to="/notices" style={{ fontSize: '12px', fontWeight: 600, color: '#10b981', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>All <ArrowRight size={12} /></Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {notices.slice(0, 3).map(n => {
              const barColors = { alert: '#ef4444', warning: '#f59e0b', info: '#3b82f6' };
              return (
                <div key={n.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: '12px', borderLeft: `3px solid ${barColors[n.severity] || '#3b82f6'}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <p style={{ fontWeight: 700, fontSize: '13px', color: 'var(--text-primary)', margin: 0 }}>{n.title}</p>
                      {n.attachment_path && <Paperclip size={12} style={{ color: 'var(--text-muted)' }} />}
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.content}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`@keyframes pageUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default Dashboard;
