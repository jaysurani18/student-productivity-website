import React, { useState, useEffect } from 'react';
import { MapPin, CalendarDays, ChevronLeft, ChevronRight, Bell } from 'lucide-react';
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

const NOTICE_STYLES = {
  info:    { bg: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
  warning: { bg: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
  alert:   { bg: 'rgba(239, 68, 68, 0.12)',  color: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
};

const TypeBadge = ({ type }) => {
  const s = TYPE_STYLES[type] || TYPE_STYLES.other;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', padding:'2px 8px',
      borderRadius:'6px', fontSize:'10px', fontWeight:700, letterSpacing:'0.02em',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>{s.label}</span>
  );
};

const Schedule = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [items, setItems] = useState({ events: [], notices: [] });
  const [loading, setLoading] = useState(true);

  const prevMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelectedDate(today);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [eRes, nRes] = await Promise.all([
        api.get('/events').catch(() => ({ data: [] })),
        api.get('/notices').catch(() => ({ data: [] }))
      ]);
      setItems({ 
        events: Array.isArray(eRes.data) ? eRes.data : [],
        notices: Array.isArray(nRes.data) ? nRes.data : []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const generateGrid = () => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const daysInPrevMonth = new Date(y, m, 0).getDate();
    
    const days = [];
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(new Date(y, m - 1, daysInPrevMonth - i));
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(y, m, i));
    }
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
        days.push(new Date(y, m + 1, i));
    }
    return days;
  };

  const isSameDay = (d1, d2) => 
    d1.getFullYear() === d2.getFullYear() && 
    d1.getMonth() === d2.getMonth() && 
    d1.getDate() === d2.getDate();

  const getDayItems = (date) => {
    const dayEvents = items.events.filter(e => e.start_time && isSameDay(new Date(e.start_time), date));
    const dayNotices = items.notices.filter(n => n.posted_date && isSameDay(new Date(n.posted_date), date));
    return { dayEvents, dayNotices };
  };

  return (
    <div style={{ animation: 'pageUp 0.35s ease both', display:'flex', flexDirection:'column', height:'100%', paddingBottom:'32px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Calendar Focus</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Overview of all schedules, labs, and notices</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px', background: 'var(--bg-secondary)', borderRadius: '12px', padding: '6px', border: '1px solid var(--border-color)' }}>
          <button onClick={prevMonth} style={{ background:'transparent', border:'none', color:'var(--text-primary)', cursor:'pointer', padding:'6px', display:'flex' }}><ChevronLeft size={18}/></button>
          <span style={{ fontWeight:800, fontSize:'15px', color:'var(--text-primary)', minWidth:'130px', textAlign:'center' }}>
            {currentMonth.toLocaleDateString('en-US', { month:'long', year:'numeric' })}
          </span>
          <button onClick={nextMonth} style={{ background:'transparent', border:'none', color:'var(--text-primary)', cursor:'pointer', padding:'6px', display:'flex' }}><ChevronRight size={18}/></button>
          <div style={{ width:'1px', height:'20px', background:'var(--border-color)', margin:'0 4px' }} />
          <button onClick={goToToday} style={{ background:'transparent', border:'none', color:'#10b981', fontWeight:700, fontSize:'13px', cursor:'pointer', padding:'6px 12px' }}>Today</button>
        </div>
      </div>

      {/* Core Grid and Panel container  */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 340px', gap: '24px', flex:1, overflow:'hidden', minHeight:'550px' }}>
        
        {/* Calendar Month View */}
        <div style={{ background:'var(--bg-secondary)', borderRadius:'20px', border:'1px solid var(--border-color)', padding:'24px', display:'flex', flexDirection:'column', boxShadow:'var(--card-shadow)', overflowY:'auto' }}>
          
          {/* Days Header */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'8px', marginBottom:'16px' }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
               <div key={d} style={{ textAlign:'center', fontSize:'12px', fontWeight:800, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{d}</div>
            ))}
          </div>
          
          {/* Actual 6x7 Grid */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'8px', flex:1 }}>
            {generateGrid().map((date, i) => {
              const { dayEvents, dayNotices } = getDayItems(date);
              const isSelected = isSameDay(date, selectedDate);
              const isToday = isSameDay(date, new Date());
              const isCurrentMonth = date.getMonth() === currentMonth.getMonth();
              
              return (
                <div 
                  key={i} 
                  onClick={() => setSelectedDate(date)}
                  style={{
                    background: isSelected ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-primary)',
                    border: isSelected ? '1px solid rgba(16, 185, 129, 0.4)' : isToday ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid var(--border-color)',
                    borderRadius: '12px', 
                    padding: '8px', 
                    cursor: 'pointer',
                    opacity: isCurrentMonth ? 1 : 0.4,
                    display: 'flex', flexDirection: 'column',
                    transition: 'all 0.15s',
                    minHeight: '80px',
                  }}
                  onMouseEnter={e => { if(!isSelected) e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)' }}
                  onMouseLeave={e => { if(!isSelected) e.currentTarget.style.borderColor = isToday ? 'rgba(16, 185, 129, 0.15)' : 'var(--border-color)' }}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'4px' }}>
                    <span style={{ 
                      fontSize:'13px', fontWeight:800, 
                      color: isToday ? '#10b981' : isSelected ? 'var(--text-primary)' : 'var(--text-muted)',
                      background: isToday ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                      width: '24px', height:'24px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'6px'
                    }}>
                      {date.getDate()}
                    </span>
                    {dayNotices.length > 0 && <Bell size={12} color="#fbbf24" style={{ marginTop:'4px', opacity:0.8 }} />}
                  </div>
                  
                  {/* Event indicator dots */}
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', marginTop:'auto' }}>
                    {dayEvents.slice(0, 4).map(e => (
                       <div key={e.id} style={{ width:'8px', height:'8px', borderRadius:'10px', background: TYPE_STYLES[e.event_type]?.color || '#10b981' }} title={e.title}/>
                    ))}
                    {dayEvents.length > 4 && <span style={{ fontSize:'9px', color:'var(--text-muted)', fontWeight:700 }}>+{dayEvents.length-4}</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Side Panel for Selected Day Detail Lists */}
        <div style={{ background:'var(--bg-secondary)', borderRadius:'20px', border:'1px solid var(--border-color)', display:'flex', flexDirection:'column', boxShadow:'var(--card-shadow)', overflow:'hidden' }}>
          
          <div style={{ padding:'24px 24px 16px', borderBottom:'1px solid var(--border-color)', background:'rgba(255,255,255,0.02)' }}>
             <h3 style={{ fontSize:'20px', fontWeight:800, color:'var(--text-primary)', margin:'0 0 4px' }}>
               {selectedDate.toLocaleDateString('en-US', { weekday:'long' })}
             </h3>
             <p style={{ fontSize:'14px', color:'var(--text-secondary)', margin:0 }}>
               {selectedDate.toLocaleDateString('en-US', { month:'long', day:'numeric', year:'numeric' })}
             </p>
          </div>

          <div style={{ padding:'20px', overflowY:'auto', flex:1, display:'flex', flexDirection:'column', gap:'24px' }}>
             {(() => {
                const { dayEvents, dayNotices } = getDayItems(selectedDate);
                if (loading) return <div style={{textAlign:'center', padding:'40px 0', color:'var(--text-muted)'}}>Loading schedule...</div>;
                if (dayEvents.length === 0 && dayNotices.length === 0) {
                   return (
                     <div style={{ textAlign:'center', padding:'60px 0' }}>
                       <CalendarDays size={40} style={{ color:'var(--text-muted)', opacity:0.3, margin:'0 auto 12px' }} />
                       <p style={{ color:'var(--text-secondary)', fontSize:'14px', margin:0 }}>No classes or notices found.</p>
                     </div>
                   )
                }

                return (
                  <>
                    {/* Notices Sector */}
                    {dayNotices.length > 0 && (
                      <div>
                        <h4 style={{ fontSize:'11px', fontWeight:800, textTransform:'uppercase', color:'var(--text-muted)', letterSpacing:'0.05em', margin:'0 0 10px' }}>Notices</h4>
                        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                          {dayNotices.map(n => {
                            const s = NOTICE_STYLES[n.severity] || NOTICE_STYLES.info;
                            return (
                              <div key={n.id} style={{ background: s.bg, borderLeft:`3px solid ${s.color}`, padding:'12px', borderRadius:'8px' }}>
                                 <div style={{ display:'flex', gap:'6px', marginBottom:'4px' }}>
                                   <Bell size={12} color={s.color} style={{marginTop:'1px', flexShrink:0}} />
                                   <p style={{ fontSize:'13px', fontWeight:700, color:'var(--text-primary)', margin:0, lineHeight:1.3 }}>{n.title}</p>
                                 </div>
                                 <p style={{ fontSize:'12px', color:'var(--text-secondary)', margin:0, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{n.content}</p>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Schedule Outline Sector */}
                    {dayEvents.length > 0 && (
                      <div>
                        <h4 style={{ fontSize:'11px', fontWeight:800, textTransform:'uppercase', color:'var(--text-muted)', letterSpacing:'0.05em', margin:'0 0 10px' }}>Agenda</h4>
                        <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                          {dayEvents.sort((a,b)=>new Date(a.start_time)-new Date(b.start_time)).map(ev => (
                            <div key={ev.id} style={{ background: 'rgba(255,255,255,0.03)', border:'1px solid var(--border-color)', padding:'14px', borderRadius:'10px' }}>
                               <p style={{ fontSize:'11px', fontWeight:700, color:'#10b981', margin:'0 0 6px' }}>
                                 {new Date(ev.start_time).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})} - {new Date(ev.end_time).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
                               </p>
                               <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px' }}>
                                 <p style={{ fontSize:'14px', fontWeight:800, color:'var(--text-primary)', margin:0, lineHeight:1.3 }}>{ev.title}</p>
                               </div>
                               <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
                                 <TypeBadge type={ev.event_type} />
                                 {ev.location && <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>📍 {ev.location}</span>}
                               </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                );
             })()}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pageUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        /* Simple scrollbar override for local elements */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
    </div>
  );
};

export default Schedule;
