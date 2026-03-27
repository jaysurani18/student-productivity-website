import React, { useState, useEffect } from 'react';
import { MapPin, Clock, CalendarDays } from 'lucide-react';
import api from '../api';

const EVENT_TYPES = ['lecture', 'lab', 'meeting', 'workshop', 'exam', 'other'];

const TYPE_STYLES = {
  lecture:  { bg: 'rgba(124, 58, 237, 0.12)', color: '#8b5cf6', border: 'rgba(124, 58, 237, 0.3)', label: 'Lecture' },
  lab:      { bg: 'rgba(16, 185, 129, 0.12)', color: '#10b981', border: 'rgba(16, 185, 129, 0.3)', label: 'Lab' },
  meeting:  { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)', label: 'Meeting' },
  workshop: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)', label: 'Workshop' },
  exam:     { bg: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)', label: 'Exam' },
  other:    { bg: 'rgba(100, 116, 139, 0.12)', color: '#64748b', border: 'rgba(100, 116, 139, 0.3)', label: 'Other' },
};

const TypeBadge = ({ type }) => {
  const s = TYPE_STYLES[type] || TYPE_STYLES.other;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', padding:'2px 10px',
      borderRadius:'999px', fontSize:'11px', fontWeight:700, letterSpacing:'0.02em',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>{s.label}</span>
  );
};

const Schedule = () => {
  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [events, setEvents]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [selectedDate, setSelectedDate] = useState(getTodayStr());

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await api.get('/events', { params: selectedDate ? { date: selectedDate } : {} });
      setEvents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, [selectedDate]);

  const formatTime = (dt) => new Date(dt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (d) => new Date(d + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

  // Shift selected date
  const shiftDate = (days) => {
    const d = new Date(selectedDate + 'T00:00:00');
    d.setDate(d.getDate() + days);
    
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${day}`);
  };

  const isToday = selectedDate === getTodayStr();

  return (
    <div style={{ animation: 'pageUp 0.35s ease both' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Schedule</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Your timetable, classes and events</p>
        </div>
      </div>

      {/* Date navigator */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)',
        boxShadow: 'var(--card-shadow)', padding: '16px 20px', marginBottom: '20px',
      }}>
        <button onClick={() => shiftDate(-1)} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>‹ Prev</button>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <p style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)', margin: 0 }}>
            {formatDate(selectedDate)}
            {isToday && <span style={{ marginLeft: '8px', background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700 }}>Today</span>}
          </p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={e => setSelectedDate(e.target.value)}
          style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', cursor: 'pointer', color: 'var(--text-primary)', outline: 'none' }}
        />
        <button onClick={() => shiftDate(1)} style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 14px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, color: 'var(--text-secondary)' }}>Next ›</button>
      </div>

      {/* Today shortcut */}
      {!isToday && (
        <div style={{ textAlign: 'right', marginBottom: '12px' }}>
          <button onClick={() => setSelectedDate(getTodayStr())} style={{ background: 'none', border: 'none', color: '#10b981', fontSize: '13px', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}>
            Go to today
          </button>
        </div>
      )}

      {/* Events list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #10b981', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', marginBottom: 12 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading events...</p>
          </div>
        ) : events.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', background: 'var(--bg-secondary)', borderRadius: '24px', border: '2px dashed var(--border-color)', textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, background: 'linear-gradient(135deg,#ede9fe,#ddd6fe)' }}>
              <CalendarDays size={26} style={{ color: '#10b981' }} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '16px', margin: 0 }}>No events for this day</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>Check another day for scheduled classes.</p>
          </div>
        ) : (
          events.map(ev => (
            <div
              key={ev.id}
              className="group"
              style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)',
                boxShadow: 'var(--card-shadow)', padding: '16px 20px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow='0 8px 30px rgba(0,0,0,0.1)'; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow='var(--card-shadow)'; e.currentTarget.style.transform='none'; }}
            >
              {/* Time column */}
              <div style={{ textAlign: 'center', minWidth: '70px', flexShrink: 0 }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: '#10b981', margin: 0 }}>{formatTime(ev.start_time)}</p>
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0' }}>{formatTime(ev.end_time)}</p>
              </div>

              {/* Divider */}
              <div style={{ width: '3px', height: '42px', borderRadius: '999px', background: TYPE_STYLES[ev.event_type]?.color || '#10b981', flexShrink: 0, opacity: 0.7 }} />

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{ev.title}</span>
                  <TypeBadge type={ev.event_type} />
                </div>
                {ev.location && (
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', margin: 0 }}>
                    <MapPin size={11} /> {ev.location}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Spinner keyframes */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pageUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
};

export default Schedule;
