import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { Shield, Users, CheckSquare, CalendarDays, Bell, LogOut, Plus, Trash2, Megaphone, User, Lock, CheckCircle2, AlertCircle, FileText, Download } from 'lucide-react';

const Admin = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats]     = useState({ tasks: 0, events: 0, notices: 0, users: 0 });
  const [users, setUsers]     = useState([]);
  const [notices, setNotices] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [events, setEvents]   = useState([]);
  const [tab, setTab]         = useState('overview'); // overview | users | notices | schedule
  const [newNotice, setNewNotice] = useState({ title:'', content:'', severity:'info', attachment: null, requires_submission: false });
  const [newUser, setNewUser]     = useState({ name:'', email:'', password:'' });
  const [newEvent, setNewEvent]   = useState({ title:'', start_time:'', end_time:'', location:'', event_type:'lecture' });
  const [showModal, setShowModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [loading, setLoading]     = useState(true);

  // Admin Profile Settings State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileConfirmPassword, setProfileConfirmPassword] = useState('');
  const [profileStatus, setProfileStatus] = useState({ type: '', msg: '' });
  const [profileLoading, setProfileLoading] = useState(false);
  const { login } = useAuth(); // getting login from context to dynamically update header user.name

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileStatus({ type: '', msg: '' });
    try {
      const res = await api.put('/auth/me', { name: profileName });
      login(localStorage.getItem('cc_token'), res.data); // dynamically updates user context globally
      setProfileStatus({ type: 'success', msg: 'Admin profile updated dynamically!' });
      setTimeout(() => setProfileStatus({ type: '', msg: '' }), 3000);
    } catch (err) {
      setProfileStatus({ type: 'error', msg: err.response?.data?.error || 'Failed to update profile' });
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (profilePassword !== profileConfirmPassword) {
      return setProfileStatus({ type: 'error', msg: 'Passwords do not match' });
    }
    setProfileLoading(true);
    setProfileStatus({ type: '', msg: '' });
    try {
      await api.put('/auth/me', { name: profileName, password: profilePassword });
      setProfilePassword('');
      setProfileConfirmPassword('');
      setProfileStatus({ type: 'success', msg: 'Password changed successfully!' });
      setTimeout(() => setProfileStatus({ type: '', msg: '' }), 3000);
    } catch (err) {
      setProfileStatus({ type: 'error', msg: err.response?.data?.error || 'Failed to change password' });
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [t, e, n, u, s] = await Promise.all([
        api.get('/tasks').catch(() => ({ data: [] })),
        api.get('/events').catch(() => ({ data: [] })),
        api.get('/notices').catch(() => ({ data: [] })),
        api.get('/auth/users').catch(() => ({ data: [] })),
        api.get('/assignments').catch(() => ({ data: [] })),
      ]);
      setSubmissions(Array.isArray(s.data) ? s.data : []);
      setStats({
        tasks: t.data?.length ?? 0,
        events: e.data?.length ?? 0,
        notices: n.data?.length ?? 0,
        users: u.data?.length ?? 0,
      });
      setUsers(Array.isArray(u.data) ? u.data : []);
      setNotices(Array.isArray(n.data) ? n.data : []);
      setEvents(Array.isArray(e.data) ? e.data : []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const postNotice = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('title', newNotice.title);
    formData.append('content', newNotice.content);
    formData.append('severity', newNotice.severity);
    formData.append('requires_submission', newNotice.requires_submission);
    if (newNotice.attachment) {
      formData.append('attachment', newNotice.attachment);
    }

    try {
      await api.post('/notices', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowModal(false);
      setNewNotice({ title:'', content:'', severity:'info', attachment: null, requires_submission: false });
      fetchAll();
    } catch (err) { 
      console.error(err); 
      alert(err.response?.data?.error || 'Error posting notice');
    }
  };

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { ...newUser, role: 'student' });
      setShowUserModal(false);
      setNewUser({ name:'', email:'', password:'' });
      fetchAll();
    } catch (err) { alert(err.response?.data?.error || 'Error creating user'); console.error(err); }
  };

  const postEvent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/events', newEvent);
      setShowEventModal(false);
      setNewEvent({ title:'', start_time:'', end_time:'', location:'', event_type:'lecture' });
      fetchAll();
    } catch (err) { console.error(err); }
  };

  const deleteNotice = async (id) => {
    try { await api.delete(`/notices/${id}`); fetchAll(); }
    catch (err) { console.error(err); }
  };

  const deleteEvent = async (id) => {
    try { await api.delete(`/events/${id}`); fetchAll(); }
    catch (err) { console.error(err); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <div style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'18px', padding:'22px', display:'flex', flexDirection:'column', gap:'12px' }}>
      <div style={{ width:42, height:42, borderRadius:'12px', background:bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={21} style={{ color }} />
      </div>
      <div>
        <p style={{ fontSize:'28px', fontWeight:900, color:'#fff', margin:0, lineHeight:1 }}>{value}</p>
        <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', margin:'4px 0 0' }}>{label}</p>
      </div>
    </div>
  );

  const InputStyle = { width:'100%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'12px', padding:'11px 16px', fontSize:'14px', color:'#fff', outline:'none', fontFamily:'inherit', fontWeight:500 };
  const LabelStyle = { display:'block', fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px' };

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:"'Inter',sans-serif", background:'#0a0a1a' }}>

      {/* Admin Sidebar */}
      <div style={{ width:'240px', minWidth:'240px', display:'flex', flexDirection:'column', padding:'24px 16px', background:'linear-gradient(160deg,#0f0c29 0%,#302b63 100%)', borderRight:'1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'4px 8px', marginBottom:'32px' }}>
          <div style={{ width:36, height:36, borderRadius:'10px', background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <p style={{ fontWeight:800, fontSize:'14px', color:'#fff', margin:0 }}>Admin Panel</p>
            <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', margin:0 }}>CampusCompanion</p>
          </div>
        </div>

        <p style={{ fontSize:'10px', fontWeight:700, color:'rgba(255,255,255,0.25)', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 8px 10px' }}>Menu</p>

        {[
          { key:'overview',    icon:Shield,       label:'Overview' },
          { key:'users',       icon:Users,        label:'Students' },
          { key:'schedule',    icon:CalendarDays, label:'Schedule' },
          { key:'notices',     icon:Megaphone,    label:'Notices' },
          { key:'submissions', icon:FileText,     label:'Submissions' },
          { key:'profile',     icon:User,         label:'Profile' },
        ].map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setTab(key)} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'11px 14px', borderRadius:'12px', border: tab === key ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent', background: tab === key ? 'rgba(124,58,237,0.25)' : 'transparent', color: tab === key ? '#fff' : 'rgba(255,255,255,0.45)', fontWeight:600, fontSize:'13px', cursor:'pointer', marginBottom:'2px', textAlign:'left', width:'100%', transition:'all 0.18s' }}>
            <Icon size={16} style={{ opacity: tab === key ? 1 : 0.5 }} />
            {label}
          </button>
        ))}

        <div style={{ marginTop:'auto', borderTop:'1px solid rgba(255,255,255,0.08)', paddingTop:'16px' }}>
          <div style={{ padding:'10px 14px', marginBottom:'8px' }}>
            <p style={{ fontWeight:600, fontSize:'13px', color:'rgba(255,255,255,0.8)', margin:0 }}>{user?.name}</p>
            <p style={{ fontSize:'11px', color:'rgba(124,58,237,0.8)', margin:'2px 0 0', fontWeight:600 }}>Administrator</p>
          </div>
          <button onClick={handleLogout} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', borderRadius:'12px', border:'1px solid rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.08)', color:'rgba(239,68,68,0.8)', fontWeight:600, fontSize:'13px', cursor:'pointer', width:'100%', transition:'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.15)'; e.currentTarget.style.color='#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='rgba(239,68,68,0.8)'; }}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex:1, overflowY:'auto', background:'#0f0f23' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto', padding:'40px 32px' }}>

          {/* ── Overview ── */}
          {tab === 'overview' && (
            <div style={{ animation:'pageUp 0.3s ease both' }}>
              <div style={{ marginBottom:'32px' }}>
                <h2 style={{ fontSize:'26px', fontWeight:900, color:'#fff', margin:0, letterSpacing:'-0.02em' }}>System Overview</h2>
                <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'14px', margin:'4px 0 0' }}>Real-time snapshot of all student activity</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'32px' }}>
                <StatCard icon={Users}       label="Registered Students" value={stats.users}   color="#a78bfa" bg="rgba(124,58,237,0.2)" />
                <StatCard icon={CheckSquare} label="Total Tasks"         value={stats.tasks}   color="#34d399" bg="rgba(16,185,129,0.15)" />
                <StatCard icon={CalendarDays} label="Events Scheduled"   value={stats.events}  color="#60a5fa" bg="rgba(37,99,235,0.15)" />
                <StatCard icon={Bell}         label="Active Notices"     value={stats.notices} color="#fbbf24" bg="rgba(217,119,6,0.15)" />
              </div>

              {/* Quick actions */}
              <div style={{ background:'rgba(255,255,255,0.04)', borderRadius:'20px', border:'1px solid rgba(255,255,255,0.08)', padding:'24px' }}>
                <h3 style={{ fontWeight:800, fontSize:'15px', color:'#fff', margin:'0 0 16px' }}>Quick Actions</h3>
                <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                  {[
                    { label:'Post Notice',   action: () => { setTab('notices'); setShowModal(true); }, color:'#10b981' },
                    { label:'Add Event',     action: () => { setTab('schedule'); setShowEventModal(true); }, color:'#10b981' },
                    { label:'View Students', action: () => setTab('users'), color:'#2563eb' },
                  ].map(({ label, action, color }) => (
                    <button key={label} onClick={action} style={{ padding:'10px 20px', borderRadius:'12px', border:`1px solid ${color}40`, background:`${color}20`, color, fontWeight:700, fontSize:'13px', cursor:'pointer', transition:'all 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background=`${color}35`}
                      onMouseLeave={e => e.currentTarget.style.background=`${color}20`}>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Students ── */}
          {tab === 'users' && (
            <div style={{ animation:'pageUp 0.3s ease both' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
                <div>
                  <h2 style={{ fontSize:'26px', fontWeight:900, color:'#fff', margin:0 }}>Registered Students</h2>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'14px', margin:'4px 0 0' }}>{users.length} student{users.length !== 1 ? 's' : ''} registered</p>
                </div>
                <button onClick={() => setShowUserModal(true)} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', borderRadius:'12px', border:'none', cursor:'pointer', color:'#fff', fontWeight:700, fontSize:'13px', background:'linear-gradient(135deg,#10b981,#059669)', boxShadow:'0 4px 14px rgba(16,185,129,0.4)' }}>
                  <Plus size={16} /> Add Student
                </button>
              </div>
              {users.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px', color:'rgba(255,255,255,0.3)' }}>
                  <Users size={40} style={{ marginBottom:16, opacity:0.3 }} />
                  <p>No students registered yet</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {users.map(u => (
                    <div key={u.id} style={{ display:'flex', alignItems:'center', gap:'14px', background:'rgba(255,255,255,0.04)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.08)', padding:'14px 18px' }}>
                      <div style={{ width:36, height:36, borderRadius:'10px', background:'rgba(124,58,237,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#a78bfa', fontWeight:800, fontSize:'14px', flexShrink:0 }}>
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontWeight:700, color:'#fff', fontSize:'14px', margin:0 }}>{u.name}</p>
                        <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'12px', margin:'2px 0 0' }}>{u.email}</p>
                      </div>
                      <span style={{ padding:'4px 12px', borderRadius:'999px', fontSize:'11px', fontWeight:700, background: u.role==='admin' ? 'rgba(124,58,237,0.25)' : 'rgba(16,185,129,0.15)', color: u.role==='admin' ? '#a78bfa' : '#34d399', border: u.role==='admin' ? '1px solid rgba(167,139,250,0.3)' : '1px solid rgba(52,211,153,0.3)' }}>
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Notices ── */}
          {tab === 'notices' && (
            <div style={{ animation:'pageUp 0.3s ease both' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
                <div>
                  <h2 style={{ fontSize:'26px', fontWeight:900, color:'#fff', margin:0 }}>Manage Notices</h2>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'14px', margin:'4px 0 0' }}>Post and manage institutional notices</p>
                </div>
                <button onClick={() => setShowModal(true)} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', borderRadius:'12px', border:'none', cursor:'pointer', color:'#fff', fontWeight:700, fontSize:'13px', background:'linear-gradient(135deg,#10b981,#059669)', boxShadow:'0 4px 14px rgba(16,185,129,0.4)' }}>
                  <Plus size={16} /> Post Notice
                </button>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {notices.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'60px', color:'rgba(255,255,255,0.3)' }}>
                    <Bell size={40} style={{ marginBottom:16, opacity:0.3 }} />
                    <p>No notices yet. Post one above!</p>
                  </div>
                ) : notices.map(n => {
                  const bar = { alert:'#ef4444', warning:'#f59e0b', info:'#3b82f6' }[n.severity] || '#3b82f6';
                  return (
                    <div key={n.id} style={{ display:'flex', alignItems:'flex-start', gap:'14px', background:'rgba(255,255,255,0.04)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.08)', borderLeft:`4px solid ${bar}`, padding:'16px 18px', transition:'all 0.2s' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px', flexWrap:'wrap' }}>
                          <p style={{ fontWeight:700, fontSize:'14px', color:'#fff', margin:0 }}>{n.title}</p>
                          <span style={{ padding:'2px 8px', borderRadius:'999px', fontSize:'10px', fontWeight:700, background:`${bar}20`, color:bar, border:`1px solid ${bar}40` }}>{n.severity}</span>
                          {n.requires_submission && (
                            <span style={{ padding:'2px 10px', borderRadius:'999px', fontSize:'10px', fontWeight:700, background:'rgba(16,185,129,0.15)', color:'#10b981', border:'1px solid rgba(16,185,129,0.3)', display:'flex', alignItems:'center', gap:'4px' }}>
                              <FileText size={10} /> Submission Required
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', margin:0 }}>{n.content}</p>
                      </div>
                      <button onClick={() => deleteNotice(n.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.4)', padding:'4px', borderRadius:'8px', transition:'all 0.2s', display:'flex' }}
                        onMouseEnter={e => { e.currentTarget.style.color='#ef4444'; e.currentTarget.style.background='rgba(239,68,68,0.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color='rgba(239,68,68,0.4)'; e.currentTarget.style.background='none'; }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Submissions ── */}
          {tab === 'submissions' && (
            <div style={{ animation:'pageUp 0.3s ease both' }}>
              <div style={{ marginBottom:'24px' }}>
                <h2 style={{ fontSize:'26px', fontWeight:900, color:'#fff', margin:0 }}>Student Submissions</h2>
                <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'14px', margin:'4px 0 0' }}>{submissions.length} submission{submissions.length !== 1 ? 's' : ''} received</p>
              </div>

              {submissions.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px', color:'rgba(255,255,255,0.3)' }}>
                  <FileText size={40} style={{ marginBottom:16, opacity:0.3 }} />
                  <p>No submissions yet</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {submissions.map(sub => (
                    <div key={sub.id} style={{ display:'flex', alignItems:'center', gap:'16px', background:'rgba(255,255,255,0.04)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.08)', borderLeft:'4px solid #10b981', padding:'16px 18px' }}>
                      {/* Avatar */}
                      <div style={{ width:38, height:38, borderRadius:'10px', background:'rgba(16,185,129,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#10b981', fontWeight:800, fontSize:'15px', flexShrink:0 }}>
                        {(sub.student_name || sub.subject)?.[0]?.toUpperCase() || 'S'}
                      </div>

                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px', flexWrap:'wrap' }}>
                          <p style={{ fontWeight:700, fontSize:'14px', color:'#fff', margin:0 }}>{sub.subject}</p>
                          {sub.student_name && (
                            <span style={{ fontSize:'12px', color:'rgba(167,139,250,0.9)', fontWeight:600 }}>by {sub.student_name}</span>
                          )}
                        </div>
                        <div style={{ display:'flex', gap:'14px', flexWrap:'wrap' }}>
                          {sub.student_email && (
                            <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', margin:0 }}>{sub.student_email}</p>
                          )}
                          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.3)', margin:0 }}>
                            {new Date(sub.submitted_at).toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                          </p>
                        </div>
                        {sub.description && (
                          <p style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', margin:'4px 0 0', fontStyle:'italic' }}>{sub.description}</p>
                        )}
                      </div>

                      {/* Download button */}
                      <a
                        href={`http://localhost:5000${sub.file_path}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 14px', borderRadius:'10px', background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)', color:'#10b981', fontSize:'12px', fontWeight:700, textDecoration:'none', flexShrink:0, transition:'all 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background='rgba(16,185,129,0.22)'}
                        onMouseLeave={e => e.currentTarget.style.background='rgba(16,185,129,0.12)'}
                      >
                        <Download size={14} /> View File
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Schedule ── */}
          {tab === 'schedule' && (
            <div style={{ animation:'pageUp 0.3s ease both' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
                <div>
                  <h2 style={{ fontSize:'26px', fontWeight:900, color:'#fff', margin:0 }}>Schedule Management</h2>
                  <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'14px', margin:'4px 0 0' }}>Manage classes, labs, and exams for the timetable</p>
                </div>
                <button onClick={() => setShowEventModal(true)} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', borderRadius:'12px', border:'none', cursor:'pointer', color:'#fff', fontWeight:700, fontSize:'13px', background:'linear-gradient(135deg,#10b981,#059669)', boxShadow:'0 4px 14px rgba(16,185,129,0.4)' }}>
                  <Plus size={16} /> Add Event
                </button>
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {events.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'60px', color:'rgba(255,255,255,0.3)' }}>
                    <CalendarDays size={40} style={{ marginBottom:16, opacity:0.3 }} />
                    <p>No events scheduled. Add one above.</p>
                  </div>
                ) : events.sort((a,b)=>new Date(a.start_time)-new Date(b.start_time)).map(ev => {
                  const s = { lecture:'#a78bfa', lab:'#34d399', meeting:'#60a5fa', workshop:'#fbbf24', exam:'#ef4444', other:'#94a3b8' }[ev.event_type] || '#94a3b8';
                  return (
                    <div key={ev.id} style={{ display:'flex', alignItems:'center', gap:'14px', background:'rgba(255,255,255,0.04)', borderRadius:'14px', border:'1px solid rgba(255,255,255,0.08)', borderLeft:`4px solid ${s}`, padding:'16px 18px', transition:'all 0.2s' }}>
                      <div style={{ textAlign:'center', minWidth:'70px' }}>
                        <p style={{ fontSize:'13px', fontWeight:700, color:'#fff', margin:0 }}>{new Date(ev.start_time).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</p>
                        <p style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', margin:0 }}>{new Date(ev.start_time).toLocaleDateString()}</p>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                          <p style={{ fontWeight:700, fontSize:'14px', color:'#fff', margin:0 }}>{ev.title}</p>
                          <span style={{ padding:'2px 8px', borderRadius:'999px', fontSize:'10px', fontWeight:700, background:`${s}20`, color:s, border:`1px solid ${s}40` }}>{ev.event_type}</span>
                        </div>
                        {ev.location && <p style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', margin:0 }}>📍 {ev.location}</p>}
                      </div>
                      <button onClick={() => deleteEvent(ev.id)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(239,68,68,0.4)', padding:'4px', borderRadius:'8px', transition:'all 0.2s', display:'flex' }}
                        onMouseEnter={e => { e.currentTarget.style.color='#ef4444'; e.currentTarget.style.background='rgba(239,68,68,0.15)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color='rgba(239,68,68,0.4)'; e.currentTarget.style.background='none'; }}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Admin Profile ── */}
          {tab === 'profile' && (
            <div style={{ animation:'pageUp 0.3s ease both' }}>
              <div style={{ marginBottom:'32px' }}>
                <h2 style={{ fontSize:'26px', fontWeight:900, color:'#fff', margin:0 }}>Admin Profile</h2>
                <p style={{ color:'rgba(255,255,255,0.4)', fontSize:'14px', margin:'4px 0 0' }}>Manage your dynamic administrator account details</p>
              </div>

              {profileStatus.msg && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '14px 18px', borderRadius: '12px', marginBottom: '24px', fontSize: '14px', fontWeight: 500, background: profileStatus.type === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', color: profileStatus.type === 'success' ? '#10b981' : '#ef4444', border: `1px solid ${profileStatus.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
                  {profileStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                  {profileStatus.msg}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
                
                {/* Edit Profile */}
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '28px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(124,58,237,0.15)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={20} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#fff' }}>Profile Details</h3>
                  </div>

                  <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                      <label style={LabelStyle}>Full Name</label>
                      <input type="text" value={profileName} onChange={(e) => setProfileName(e.target.value)} required style={InputStyle} />
                    </div>

                    <div>
                      <label style={LabelStyle}>Email Address (Read-only)</label>
                      <input type="email" value={profileEmail} disabled style={{ ...InputStyle, cursor: 'not-allowed', opacity: 0.6 }} />
                    </div>

                    <button type="submit" disabled={profileLoading} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', color: '#fff', fontWeight: 700, fontSize: '14px', cursor: 'pointer', background: 'linear-gradient(135deg,#10b981,#059669)', transition: 'all 0.2s', opacity: profileLoading ? 0.7 : 1 }}>
                      {profileLoading ? 'Saving...' : 'Update Details Dynamically'}
                    </button>
                  </form>
                </div>

                {/* Change Password */}
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '28px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Lock size={20} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#fff' }}>Security</h3>
                  </div>

                  <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                    <div>
                      <label style={LabelStyle}>New Password</label>
                      <input type="password" value={profilePassword} onChange={(e) => setProfilePassword(e.target.value)} required minLength={6} placeholder="Min 6 characters" style={InputStyle} />
                    </div>

                    <div>
                      <label style={LabelStyle}>Confirm New Password</label>
                      <input type="password" value={profileConfirmPassword} onChange={(e) => setProfileConfirmPassword(e.target.value)} required minLength={6} style={InputStyle} />
                    </div>

                    <button type="submit" disabled={profileLoading} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '12px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', transition: 'all 0.2s', opacity: profileLoading ? 0.7 : 1 }}>
                      {profileLoading ? 'Updating password...' : 'Change Password'}
                    </button>
                  </form>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

      {/* Post Notice Modal */}
      {showModal && (
        <div onClick={e => e.target === e.currentTarget && setShowModal(false)}
          style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)', width:'100%', maxWidth:'480px', borderRadius:'24px', padding:'36px', animation:'modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <h3 style={{ fontWeight:900, fontSize:'20px', color:'#fff', margin:'0 0 24px', letterSpacing:'-0.02em' }}>Post New Notice</h3>
            <form onSubmit={postNotice} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div>
                <label style={LabelStyle}>Title *</label>
                <input required style={InputStyle} placeholder="Notice title" value={newNotice.title} onChange={e => setNewNotice(n=>({...n,title:e.target.value}))} />
              </div>
              <div>
                <label style={LabelStyle}>Content *</label>
                <textarea required rows={3} style={{ ...InputStyle, resize:'vertical' }} placeholder="Notice details..." value={newNotice.content} onChange={e => setNewNotice(n=>({...n,content:e.target.value}))} />
              </div>
              <div>
                <div style={{ display:'flex', gap:'10px' }}>
                  {['info','warning','alert'].map(s => {
                    const colors = { info:'#3b82f6', warning:'#f59e0b', alert:'#ef4444' };
                    const selected = newNotice.severity === s;
                    return (
                      <button key={s} type="button" onClick={() => setNewNotice(n=>({...n,severity:s}))} style={{ flex:1, padding:'9px', borderRadius:'10px', border:`2px solid ${selected ? colors[s] : 'rgba(255,255,255,0.1)'}`, background: selected ? `${colors[s]}25` : 'transparent', color: selected ? colors[s] : 'rgba(255,255,255,0.4)', fontWeight:700, fontSize:'13px', cursor:'pointer', transition:'all 0.15s' }}>
                        {s[0].toUpperCase()+s.slice(1)}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={LabelStyle}>Attachment (Optional)</label>
                <input type="file" style={InputStyle} accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" onChange={e => setNewNotice(n=>({...n,attachment:e.target.files[0]}))} />
                <p style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)', marginTop:'4px' }}>Max 5MB. Images, PDF, or Word docs.</p>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', color:'#fff', fontSize:'13px', fontWeight:600 }}>
                <input type="checkbox" checked={newNotice.requires_submission} onChange={e => setNewNotice(n=>({...n,requires_submission:e.target.checked}))} style={{ width:'16px', height:'16px', accentColor:'#10b981', cursor:'pointer' }} />
                Requires Assignment Submission
              </label>
              <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex:1, padding:'12px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(255,255,255,0.6)', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex:1, padding:'12px', borderRadius:'12px', border:'none', color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer', background:'linear-gradient(135deg,#10b981,#059669)', boxShadow:'0 4px 14px rgba(16,185,129,0.4)' }}>Post Notice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showUserModal && (
        <div onClick={e => e.target === e.currentTarget && setShowUserModal(false)}
          style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)', width:'100%', maxWidth:'480px', borderRadius:'24px', padding:'36px', animation:'modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <h3 style={{ fontWeight:900, fontSize:'20px', color:'#fff', margin:'0 0 24px', letterSpacing:'-0.02em' }}>Add New Student</h3>
            <form onSubmit={createUser} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div>
                <label style={LabelStyle}>Full Name *</label>
                <input required style={InputStyle} placeholder="e.g. John Doe" value={newUser.name} onChange={e => setNewUser(u=>({...u,name:e.target.value}))} />
              </div>
              <div>
                <label style={LabelStyle}>Email Address *</label>
                <input required type="email" style={InputStyle} placeholder="student@college.edu" value={newUser.email} onChange={e => setNewUser(u=>({...u,email:e.target.value}))} />
              </div>
              <div>
                <label style={LabelStyle}>Temporary Password *</label>
                <input required type="password" style={InputStyle} placeholder="••••••••" value={newUser.password} onChange={e => setNewUser(u=>({...u,password:e.target.value}))} />
              </div>
              <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
                <button type="button" onClick={() => setShowUserModal(false)} style={{ flex:1, padding:'12px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(255,255,255,0.6)', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex:1, padding:'12px', borderRadius:'12px', border:'none', color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer', background:'linear-gradient(135deg,#10b981,#059669)', boxShadow:'0 4px 14px rgba(16,185,129,0.4)' }}>Create Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showEventModal && (
        <div onClick={e => e.target === e.currentTarget && setShowEventModal(false)}
          style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'#1a1a2e', border:'1px solid rgba(255,255,255,0.1)', width:'100%', maxWidth:'480px', borderRadius:'24px', padding:'36px', animation:'modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <h3 style={{ fontWeight:900, fontSize:'20px', color:'#fff', margin:'0 0 24px', letterSpacing:'-0.02em' }}>Schedule Event</h3>
            <form onSubmit={postEvent} style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
              <div>
                <label style={LabelStyle}>Title *</label>
                <input required style={InputStyle} placeholder="e.g. Data Structures Lecture" value={newEvent.title} onChange={e => setNewEvent(n=>({...n,title:e.target.value}))} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div>
                  <label style={LabelStyle}>Start Time *</label>
                  <input required type="datetime-local" style={{...InputStyle, colorScheme: 'dark'}} value={newEvent.start_time} onChange={e => setNewEvent(n=>({...n,start_time:e.target.value}))} />
                </div>
                <div>
                  <label style={LabelStyle}>End Time *</label>
                  <input required type="datetime-local" style={{...InputStyle, colorScheme: 'dark'}} value={newEvent.end_time} onChange={e => setNewEvent(n=>({...n,end_time:e.target.value}))} />
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div>
                  <label style={LabelStyle}>Type</label>
                  <select style={{...InputStyle, colorScheme: 'dark'}} value={newEvent.event_type} onChange={e => setNewEvent(n=>({...n,event_type:e.target.value}))}>
                    {['lecture', 'lab', 'meeting', 'workshop', 'exam', 'other'].map(t => <option key={t} value={t} style={{background:'#1a1a2e'}}>{t[0].toUpperCase()+t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LabelStyle}>Location</label>
                  <input style={InputStyle} placeholder="e.g. Room 204" value={newEvent.location} onChange={e => setNewEvent(n=>({...n,location:e.target.value}))} />
                </div>
              </div>
              <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
                <button type="button" onClick={() => setShowEventModal(false)} style={{ flex:1, padding:'12px', borderRadius:'12px', border:'1px solid rgba(255,255,255,0.1)', background:'transparent', color:'rgba(255,255,255,0.6)', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>Cancel</button>
                <button type="submit" style={{ flex:1, padding:'12px', borderRadius:'12px', border:'none', color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer', background:'linear-gradient(135deg,#10b981,#059669)', boxShadow:'0 4px 14px rgba(16,185,129,0.4)' }}>Save Event</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pageUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalPop { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
};

const LabelStyle = { display:'block', fontSize:'11px', fontWeight:700, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 6px 4px' };
const InputStyle = { width:'100%', background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'12px', padding:'12px 16px', fontSize:'14px', color:'#fff', outline:'none', fontFamily:'inherit', transition:'all 0.2s' };

export default Admin;
