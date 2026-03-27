import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import toast from 'react-hot-toast';
import { Shield, Users, CheckSquare, CalendarDays, Bell, LogOut, Plus, Trash2, Megaphone, User, Lock, CheckCircle2, AlertCircle, FileText, Download, Search } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

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
  const [submitting, setSubmitting] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userFilter, setUserFilter] = useState('all');
  const [noticeFilter, setNoticeFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');

  // Submissions Features
  const [submissionSearch, setSubmissionSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [submissionSort, setSubmissionSort] = useState('latest');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(submissionSearch), 300);
    return () => clearTimeout(handler);
  }, [submissionSearch]);

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
    if (!profileName.trim()) return toast.error('Name cannot be empty.');
    setProfileLoading(true);
    try {
      const res = await api.put('/auth/me', { name: profileName });
      login(localStorage.getItem('cc_token'), res.data); // dynamically updates user context globally
      toast.success('Admin profile updated dynamically!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (profilePassword !== profileConfirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (profilePassword.length < 6) {
      return toast.error('Password must be at least 6 characters.');
    }
    setProfileLoading(true);
    try {
      await api.put('/auth/me', { name: profileName, password: profilePassword });
      setProfilePassword('');
      setProfileConfirmPassword('');
      toast.success('Password changed successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to change password');
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
    if (!newNotice.title.trim()) return toast.error('Title is required.');
    if (!newNotice.content.trim()) return toast.error('Content is required.');
    if (newNotice.attachment && newNotice.attachment.size > 5 * 1024 * 1024) return toast.error('File size exceeds 5MB limit.');
    
    setSubmitting(true);
    const toastId = toast.loading('Posting notice...');
    const formData = new FormData();
    formData.append('title', newNotice.title);
    formData.append('content', newNotice.content);
    formData.append('severity', newNotice.severity);
    formData.append('requires_submission', newNotice.requires_submission);
    if (newNotice.attachment) {
      formData.append('attachment', newNotice.attachment);
    }

    try {
      await api.post('/notices', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Notice posted successfully!', { id: toastId });
      setShowModal(false);
      setNewNotice({ title:'', content:'', severity:'info', attachment: null, requires_submission: false });
      fetchAll();
    } catch (err) { 
      console.error(err); 
      toast.error(err.response?.data?.error || 'Error posting notice', { id: toastId });
    } finally { setSubmitting(false); }
  };

  const createUser = async (e) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password) return toast.error('All fields are required.');
    if (newUser.password.length < 6) return toast.error('Password must be at least 6 characters.');
    
    setSubmitting(true);
    const toastId = toast.loading('Creating user...');
    try {
      await api.post('/auth/register', { ...newUser, role: 'student' });
      toast.success('Student account created!', { id: toastId });
      setShowUserModal(false);
      setNewUser({ name:'', email:'', password:'' });
      fetchAll();
    } catch (err) { 
      toast.error(err.response?.data?.error || 'Error creating user', { id: toastId }); 
      console.error(err); 
    } finally { setSubmitting(false); }
  };

  const postEvent = async (e) => {
    e.preventDefault();
    if (!newEvent.title.trim()) return toast.error('Event title is required.');
    if (new Date(newEvent.end_time) <= new Date(newEvent.start_time)) return toast.error('End time must be after start time.');
    
    setSubmitting(true);
    const toastId = toast.loading('Scheduling event...');
    try {
      await api.post('/events', newEvent);
      toast.success('Event scheduled successfully!', { id: toastId });
      setShowEventModal(false);
      setNewEvent({ title:'', start_time:'', end_time:'', location:'', event_type:'lecture' });
      fetchAll();
    } catch (err) { 
      console.error(err); 
      toast.error(err.response?.data?.error || 'Error scheduling event', { id: toastId });
    } finally { setSubmitting(false); }
  };

  const deleteNotice = async (id) => {
    try { await api.delete(`/notices/${id}`); toast.success('Notice deleted'); fetchAll(); }
    catch (err) { toast.error('Failed to delete notice'); console.error(err); }
  };

  const deleteEvent = async (id) => {
    try { await api.delete(`/events/${id}`); toast.success('Event deleted'); fetchAll(); }
    catch (err) { toast.error('Failed to delete event'); console.error(err); }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <div style={{ background:'var(--bg-primary)', border:'1px solid var(--border-color)', borderRadius:'18px', padding:'22px', display:'flex', flexDirection:'column', gap:'12px' }}>
      <div style={{ width:42, height:42, borderRadius:'12px', background:bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
        <Icon size={21} style={{ color }} />
      </div>
      <div>
        <p style={{ fontSize:'28px', fontWeight:900, color:'var(--text-primary)', margin:0, lineHeight:1 }}>{value}</p>
        <p style={{ fontSize:'13px', color:'var(--text-secondary)', margin:'4px 0 0' }}>{label}</p>
      </div>
    </div>
  );

  const InputStyle = { width:'100%', background:'var(--bg-primary)', border:'1px solid var(--border-color)', borderRadius:'12px', padding:'11px 16px', fontSize:'14px', color:'var(--text-primary)', outline:'none', fontFamily:'inherit', fontWeight:500 };
  const LabelStyle = { display:'block', fontSize:'11px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px' };

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden', fontFamily:"'Inter',sans-serif", background:'var(--bg-primary)' }}>

      {/* Admin Sidebar */}
      <div style={{ width:'240px', minWidth:'240px', display:'flex', flexDirection:'column', padding:'24px 16px', background:'var(--bg-secondary)', borderRight:'1px solid var(--border-color)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'4px 8px', marginBottom:'32px' }}>
          <div style={{ width:36, height:36, borderRadius:'10px', background:'linear-gradient(135deg,#10b981,#059669)', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Shield size={18} color="#fff" />
          </div>
          <div>
            <p style={{ fontWeight:800, fontSize:'14px', color:'var(--text-primary)', margin:0 }}>Admin Panel</p>
            <p style={{ fontSize:'11px', color:'var(--text-secondary)', margin:0 }}>StudyPoint</p>
          </div>
        </div>

        <p style={{ fontSize:'10px', fontWeight:700, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 8px 10px' }}>Menu</p>

        {[
          { key:'overview',    icon:Shield,       label:'Overview' },
          { key:'users',       icon:Users,        label:'Students' },
          { key:'schedule',    icon:CalendarDays, label:'Schedule' },
          { key:'notices',     icon:Megaphone,    label:'Notices' },
          { key:'submissions', icon:FileText,     label:'Submissions' },
          { key:'profile',     icon:User,         label:'Profile' },
        ].map(({ key, icon: Icon, label }) => (
          <button key={key} onClick={() => setTab(key)} className={tab === key ? 'nav-active' : ''} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'11px 14px', borderRadius:'12px', border: '1px solid transparent', fontWeight:600, fontSize:'13px', cursor:'pointer', marginBottom:'2px', textAlign:'left', width:'100%', transition:'all 0.18s', color: tab === key ? 'inherit' : 'var(--text-secondary)' }}>
            <Icon size={16} style={{ opacity: tab === key ? 1 : 0.5 }} />
            {label}
          </button>
        ))}

        <div style={{ marginTop:'auto', borderTop:'1px solid var(--border-color)', paddingTop:'16px' }}>
          <div style={{ padding:'10px 14px', marginBottom:'8px' }}>
            <p style={{ fontWeight:600, fontSize:'13px', color:'var(--text-primary)', margin:0 }}>{user?.name}</p>
            <p style={{ fontSize:'11px', color:'rgba(124,58,237,0.8)', margin:'2px 0 0', fontWeight:600 }}>Administrator</p>
          </div>
          <button onClick={() => setShowLogoutModal(true)} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 14px', borderRadius:'12px', border:'1px solid rgba(239,68,68,0.2)', background:'rgba(239,68,68,0.08)', color:'rgba(239,68,68,0.8)', fontWeight:600, fontSize:'13px', cursor:'pointer', width:'100%', transition:'all 0.18s' }}
            onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.15)'; e.currentTarget.style.color='#f87171'; }}
            onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.color='rgba(239,68,68,0.8)'; }}>
            <LogOut size={15} /> Sign Out
          </button>
        </div>
      </div>

      {/* Main area */}
      <div style={{ flex:1, overflowY:'auto', background:'var(--bg-primary)' }}>
        <div style={{ maxWidth:'900px', margin:'0 auto', padding:'40px 32px' }}>

          {/* ── Overview ── */}
          {tab === 'overview' && (
            <div style={{ animation:'pageUp 0.3s ease both' }}>
              <div style={{ marginBottom:'32px' }}>
                <h2 style={{ fontSize:'26px', fontWeight:900, color:'var(--text-primary)', margin:0, letterSpacing:'-0.02em' }}>System Overview</h2>
                <p style={{ color:'var(--text-secondary)', fontSize:'14px', margin:'4px 0 0' }}>Real-time snapshot of all student activity</p>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'14px', marginBottom:'32px' }}>
                <StatCard icon={Users}       label="Registered Students" value={stats.users}   color="#a78bfa" bg="rgba(124,58,237,0.2)" />
                <StatCard icon={CheckSquare} label="Total Tasks"         value={stats.tasks}   color="#34d399" bg="rgba(16,185,129,0.15)" />
                <StatCard icon={CalendarDays} label="Events Scheduled"   value={stats.events}  color="#60a5fa" bg="rgba(37,99,235,0.15)" />
                <StatCard icon={Bell}         label="Active Notices"     value={stats.notices} color="#fbbf24" bg="rgba(217,119,6,0.15)" />
              </div>

              {/* Quick actions */}
              <div style={{ background:'var(--bg-secondary)', borderRadius:'20px', border:'1px solid var(--border-color)', padding:'24px' }}>
                <h3 style={{ fontWeight:800, fontSize:'15px', color:'var(--text-primary)', margin:'0 0 16px' }}>Quick Actions</h3>
                <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
                  {[
                    { label:'Post Notice',   action: () => { setTab('notices'); setShowModal(true); }, color:'var(--sidebar-text-active)' },
                    { label:'Add Event',     action: () => { setTab('schedule'); setShowEventModal(true); }, color:'var(--sidebar-text-active)' },
                    { label:'View Students', action: () => setTab('users'), color:'#2563eb' },
                  ].map(({ label, action, color }) => (
                    <button key={label} onClick={action} className="btn-grad" style={{ padding:'10px 20px', borderRadius:'12px', border:'none', color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer', transition:'all 0.2s' }}
                      
                      >
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
                  <h2 style={{ fontSize:'26px', fontWeight:900, color:'var(--text-primary)', margin:0 }}>Registered Students</h2>
                  <p style={{ color:'var(--text-secondary)', fontSize:'14px', margin:'4px 0 0' }}>{users.length} student{users.length !== 1 ? 's' : ''} registered</p>
                </div>
                <button onClick={() => setShowUserModal(true)} className="btn-grad" style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', borderRadius:'12px', border:'none', cursor:'pointer', color:'#fff', fontWeight:700, fontSize:'13px' }}>
                  <Plus size={16} /> Add Student
                </button>
              </div>

              <div style={{ display:'flex', gap:'8px', marginBottom:'20px', overflowX:'auto' }}>
                {['all', 'student', 'admin'].map(r => (
                  <button key={r} onClick={() => setUserFilter(r)} style={{ padding:'6px 14px', borderRadius:'10px', fontSize:'13px', fontWeight:600, border:'1px solid var(--border-color)', background: userFilter === r ? 'var(--bg-secondary)' : 'transparent', color: userFilter === r ? 'var(--text-primary)' : 'var(--text-secondary)', cursor:'pointer', transition:'all 0.2s', textTransform:'capitalize' }}>
                    {r}
                  </button>
                ))}
              </div>

              {users.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)' }}>
                  <Users size={40} style={{ marginBottom:16, opacity:0.3 }} />
                  <p>No students registered yet</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {users.filter(u => userFilter === 'all' || u.role === userFilter).map(u => (
                    <div key={u.id} style={{ display:'flex', alignItems:'center', gap:'14px', background:'var(--bg-secondary)', borderRadius:'14px', border:'1px solid var(--border-color)', padding:'14px 18px' }}>
                      <div style={{ width:36, height:36, borderRadius:'10px', background:'rgba(124,58,237,0.25)', display:'flex', alignItems:'center', justifyContent:'center', color:'#a78bfa', fontWeight:800, fontSize:'14px', flexShrink:0 }}>
                        {u.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <div style={{ flex:1 }}>
                        <p style={{ fontWeight:700, color:'var(--text-primary)', fontSize:'14px', margin:0 }}>{u.name}</p>
                        <p style={{ color:'var(--text-secondary)', fontSize:'12px', margin:'2px 0 0' }}>{u.email}</p>
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
                  <h2 style={{ fontSize:'26px', fontWeight:900, color:'var(--text-primary)', margin:0 }}>Manage Notices</h2>
                  <p style={{ color:'var(--text-secondary)', fontSize:'14px', margin:'4px 0 0' }}>Post and manage institutional notices</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-grad" style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', borderRadius:'12px', border:'none', cursor:'pointer', color:'#fff', fontWeight:700, fontSize:'13px' }}>
                  <Plus size={16} /> Post Notice
                </button>
              </div>

              <div style={{ display:'flex', gap:'8px', marginBottom:'20px', overflowX:'auto' }}>
                {['all', 'info', 'warning', 'alert'].map(s => (
                  <button key={s} onClick={() => setNoticeFilter(s)} style={{ padding:'6px 14px', borderRadius:'10px', fontSize:'13px', fontWeight:600, border:'1px solid var(--border-color)', background: noticeFilter === s ? 'var(--bg-secondary)' : 'transparent', color: noticeFilter === s ? 'var(--text-primary)' : 'var(--text-secondary)', cursor:'pointer', transition:'all 0.2s', textTransform:'capitalize' }}>
                    {s}
                  </button>
                ))}
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {notices.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)' }}>
                    <Bell size={40} style={{ marginBottom:16, opacity:0.3 }} />
                    <p>No notices yet. Post one above!</p>
                  </div>
                ) : notices.filter(n => noticeFilter === 'all' || n.severity === noticeFilter).map(n => {
                  const bar = { alert:'#ef4444', warning:'#f59e0b', info:'#3b82f6' }[n.severity] || '#3b82f6';
                  return (
                    <div key={n.id} style={{ display:'flex', alignItems:'flex-start', gap:'14px', background:'var(--bg-secondary)', borderRadius:'14px', border:'1px solid var(--border-color)', borderLeft:`4px solid ${bar}`, padding:'16px 18px', transition:'all 0.2s' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px', flexWrap:'wrap' }}>
                          <p style={{ fontWeight:700, fontSize:'14px', color:'var(--text-primary)', margin:0 }}>{n.title}</p>
                          <span style={{ padding:'2px 8px', borderRadius:'999px', fontSize:'10px', fontWeight:700, background:`${bar}20`, color:bar, border:`1px solid ${bar}40` }}>{n.severity}</span>
                          {n.requires_submission && (
                            <span style={{ padding:'2px 10px', borderRadius:'999px', fontSize:'10px', fontWeight:700, background:'rgba(16,185,129,0.15)', color:'#10b981', border:'1px solid rgba(16,185,129,0.3)', display:'flex', alignItems:'center', gap:'4px' }}>
                              <FileText size={10} /> Submission Required
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize:'13px', color:'var(--text-secondary)', margin:0 }}>{n.content}</p>
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
          {tab === 'submissions' && (() => {
            const filteredSubmissions = submissions
              .filter(s => !debouncedSearch || (s.student_email || '').toLowerCase().includes(debouncedSearch.toLowerCase()))
              .sort((a, b) => {
                const dA = new Date(a.submitted_at || 0).getTime();
                const dB = new Date(b.submitted_at || 0).getTime();
                return submissionSort === 'latest' ? dB - dA : dA - dB;
              });

            return (
            <div style={{ animation:'pageUp 0.3s ease both' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
                <div>
                  <h2 style={{ fontSize:'26px', fontWeight:900, color:'var(--text-primary)', margin:0 }}>Student Submissions</h2>
                  <p style={{ color:'var(--text-secondary)', fontSize:'14px', margin:'4px 0 0' }}>
                    {debouncedSearch 
                      ? `Showing ${filteredSubmissions.length} of ${submissions.length} submission${submissions.length !== 1 ? 's' : ''}`
                      : `${submissions.length} submission${submissions.length !== 1 ? 's' : ''} received`
                    }
                  </p>
                </div>
              </div>

              {submissions.length > 0 && (
                <div style={{ display:'flex', gap:'12px', marginBottom:'24px', alignItems:'center', flexWrap:'wrap' }}>
                  <div style={{ position:'relative', flex:1, minWidth:'200px' }}>
                    <Search size={16} style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', color:'var(--text-secondary)' }} />
                    <input 
                      type="text" 
                      placeholder="Search submissions by student email..." 
                      value={submissionSearch}
                      onChange={(e) => setSubmissionSearch(e.target.value)}
                      style={{ width:'100%', background:'var(--bg-primary)', border:'1px solid var(--border-color)', borderRadius:'12px', padding:'10px 16px 10px 40px', fontSize:'14px', color:'var(--text-primary)', outline:'none', transition:'all 0.2s', fontFamily:'inherit' }}
                      onFocus={e => e.currentTarget.style.border='1px solid rgba(16,185,129,0.5)'}
                      onBlur={e => e.currentTarget.style.border='1px solid rgba(255,255,255,0.1)'}
                    />
                  </div>
                  <div style={{ display:'flex', gap:'6px', background:'var(--bg-primary)', padding:'4px', borderRadius:'12px', border:'1px solid var(--border-color)' }}>
                    <button 
                      onClick={() => setSubmissionSort('latest')}
                      style={{ padding:'6px 12px', borderRadius:'8px', fontSize:'13px', fontWeight:600, border:'none', cursor:'pointer', transition:'all 0.2s', background: submissionSort === 'latest' ? 'rgba(255,255,255,0.1)' : 'transparent', color: submissionSort === 'latest' ? '#fff' : 'rgba(255,255,255,0.5)' }}
                    >Latest</button>
                    <button 
                      onClick={() => setSubmissionSort('oldest')}
                      style={{ padding:'6px 12px', borderRadius:'8px', fontSize:'13px', fontWeight:600, border:'none', cursor:'pointer', transition:'all 0.2s', background: submissionSort === 'oldest' ? 'rgba(255,255,255,0.1)' : 'transparent', color: submissionSort === 'oldest' ? '#fff' : 'rgba(255,255,255,0.5)' }}
                    >Oldest</button>
                  </div>
                </div>
              )}

              {submissions.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)' }}>
                  <FileText size={40} style={{ marginBottom:16, opacity:0.3 }} />
                  <p>No submissions yet</p>
                </div>
              ) : filteredSubmissions.length === 0 ? (
                <div style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)', background:'rgba(255,255,255,0.02)', borderRadius:'16px', border:'1px dashed rgba(255,255,255,0.1)' }}>
                  <Search size={32} style={{ marginBottom:16, opacity:0.3 }} />
                  <p>No submissions found for "{debouncedSearch}"</p>
                  <button onClick={() => setSubmissionSearch('')} style={{ background:'none', border:'none', color:'#10b981', cursor:'pointer', fontSize:'13px', fontWeight:600, marginTop:'8px', textDecoration:'underline' }}>Clear search</button>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                  {filteredSubmissions.map(sub => (
                    <div key={sub.id} style={{ display:'flex', alignItems:'center', gap:'16px', background:'var(--bg-secondary)', borderRadius:'14px', border:'1px solid var(--border-color)', borderLeft:'4px solid #10b981', padding:'16px 18px', transition:'all 0.2s' }}>
                      {/* Avatar */}
                      <div style={{ width:38, height:38, borderRadius:'10px', background:'rgba(16,185,129,0.2)', display:'flex', alignItems:'center', justifyContent:'center', color:'#10b981', fontWeight:800, fontSize:'15px', flexShrink:0 }}>
                        {(sub.student_name || sub.subject)?.[0]?.toUpperCase() || 'S'}
                      </div>

                      {/* Info */}
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'3px', flexWrap:'wrap' }}>
                          <p style={{ fontWeight:700, fontSize:'14px', color:'var(--text-primary)', margin:0 }}>{sub.subject}</p>
                          {sub.student_name && (
                            <span style={{ fontSize:'12px', color:'rgba(167,139,250,0.9)', fontWeight:600 }}>by {sub.student_name}</span>
                          )}
                        </div>
                        <div style={{ display:'flex', gap:'14px', flexWrap:'wrap' }}>
                          {sub.student_email && (
                            <p style={{ fontSize:'12px', color:'var(--text-secondary)', margin:0 }}>{sub.student_email}</p>
                          )}
                          <p style={{ fontSize:'12px', color:'var(--text-muted)', margin:0 }}>
                            {new Date(sub.submitted_at).toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric', hour:'2-digit', minute:'2-digit' })}
                          </p>
                        </div>
                        {sub.description && (
                          <p style={{ fontSize:'12px', color:'var(--text-secondary)', margin:'4px 0 0', fontStyle:'italic' }}>{sub.description}</p>
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
            );
          })()}

          {/* ── Schedule ── */}
          {tab === 'schedule' && (
            <div style={{ animation:'pageUp 0.3s ease both' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px' }}>
                <div>
                  <h2 style={{ fontSize:'26px', fontWeight:900, color:'var(--text-primary)', margin:0 }}>Schedule Management</h2>
                  <p style={{ color:'var(--text-secondary)', fontSize:'14px', margin:'4px 0 0' }}>Manage classes, labs, and exams for the timetable</p>
                </div>
                <button onClick={() => setShowEventModal(true)} className="btn-grad" style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', borderRadius:'12px', border:'none', cursor:'pointer', color:'#fff', fontWeight:700, fontSize:'13px' }}>
                  <Plus size={16} /> Add Event
                </button>
              </div>

              <div style={{ display:'flex', gap:'8px', marginBottom:'20px', overflowX:'auto', paddingBottom:'4px' }}>
                {['all', 'lecture', 'lab', 'meeting', 'workshop', 'exam', 'other'].map(t => (
                  <button key={t} onClick={() => setEventFilter(t)} style={{ padding:'6px 14px', borderRadius:'10px', fontSize:'13px', fontWeight:600, border:'1px solid var(--border-color)', background: eventFilter === t ? 'var(--bg-secondary)' : 'transparent', color: eventFilter === t ? 'var(--text-primary)' : 'var(--text-secondary)', cursor:'pointer', transition:'all 0.2s', textTransform:'capitalize', whiteSpace:'nowrap', flexShrink:0 }}>
                    {t}
                  </button>
                ))}
              </div>

              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {events.length === 0 ? (
                  <div style={{ textAlign:'center', padding:'60px', color:'var(--text-muted)' }}>
                    <CalendarDays size={40} style={{ marginBottom:16, opacity:0.3 }} />
                    <p>No events scheduled. Add one above.</p>
                  </div>
                ) : events.filter(e => eventFilter === 'all' || e.event_type === eventFilter).sort((a,b)=>new Date(a.start_time)-new Date(b.start_time)).map(ev => {
                  const s = { lecture:'#a78bfa', lab:'#34d399', meeting:'#60a5fa', workshop:'#fbbf24', exam:'#ef4444', other:'#94a3b8' }[ev.event_type] || '#94a3b8';
                  return (
                    <div key={ev.id} style={{ display:'flex', alignItems:'center', gap:'14px', background:'var(--bg-secondary)', borderRadius:'14px', border:'1px solid var(--border-color)', borderLeft:`4px solid ${s}`, padding:'16px 18px', transition:'all 0.2s' }}>
                      <div style={{ textAlign:'center', minWidth:'70px' }}>
                        <p style={{ fontSize:'13px', fontWeight:700, color:'var(--text-primary)', margin:0 }}>{new Date(ev.start_time).toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})}</p>
                        <p style={{ fontSize:'11px', color:'var(--text-secondary)', margin:0 }}>{new Date(ev.start_time).toLocaleDateString()}</p>
                      </div>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                          <p style={{ fontWeight:700, fontSize:'14px', color:'var(--text-primary)', margin:0 }}>{ev.title}</p>
                          <span style={{ padding:'2px 8px', borderRadius:'999px', fontSize:'10px', fontWeight:700, background:`${s}20`, color:s, border:`1px solid ${s}40` }}>{ev.event_type}</span>
                        </div>
                        {ev.location && <p style={{ fontSize:'13px', color:'var(--text-secondary)', margin:0 }}>📍 {ev.location}</p>}
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
                <h2 style={{ fontSize:'26px', fontWeight:900, color:'var(--text-primary)', margin:0 }}>Admin Profile</h2>
                <p style={{ color:'var(--text-secondary)', fontSize:'14px', margin:'4px 0 0' }}>Manage your dynamic administrator account details</p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '24px' }}>
                
                {/* Edit Profile */}
                <div style={{ background:'var(--bg-secondary)', padding: '28px', borderRadius: '20px', border:'1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(124,58,237,0.15)', color: '#a78bfa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <User size={20} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color:'var(--text-primary)' }}>Profile Details</h3>
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

                    <button type="submit" disabled={profileLoading} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: 'none', color:'var(--text-primary)', fontWeight: 700, fontSize: '14px', cursor: 'pointer', background: 'linear-gradient(135deg,#10b981,#059669)', transition: 'all 0.2s', opacity: profileLoading ? 0.7 : 1 }}>
                      {profileLoading ? 'Saving...' : 'Update Details Dynamically'}
                    </button>
                  </form>
                </div>

                {/* Change Password */}
                <div style={{ background:'var(--bg-secondary)', padding: '28px', borderRadius: '20px', border:'1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Lock size={20} />
                    </div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color:'var(--text-primary)' }}>Security</h3>
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
          <div style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-color)', width:'100%', maxWidth:'480px', borderRadius:'24px', padding:'36px', animation:'modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <h3 style={{ fontWeight:900, fontSize:'20px', color:'var(--text-primary)', margin:'0 0 24px', letterSpacing:'-0.02em' }}>Post New Notice</h3>
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
                <p style={{ fontSize:'10px', color:'var(--text-muted)', marginTop:'4px' }}>Max 5MB. Images, PDF, or Word docs.</p>
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', color:'var(--text-primary)', fontSize:'13px', fontWeight:600 }}>
                <input type="checkbox" checked={newNotice.requires_submission} onChange={e => setNewNotice(n=>({...n,requires_submission:e.target.checked}))} style={{ width:'16px', height:'16px', accentColor:'#10b981', cursor:'pointer' }} />
                Requires Assignment Submission
              </label>
              <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex:1, padding:'12px', borderRadius:'12px', border:'1px solid var(--border-color)', background:'transparent', color:'var(--text-secondary)', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex:1, padding:'12px', borderRadius:'12px', border:'none', color:'var(--text-primary)', fontWeight:700, fontSize:'14px', cursor: submitting ? 'not-allowed' : 'pointer', background:'linear-gradient(135deg,#10b981,#059669)', boxShadow:'0 4px 14px rgba(16,185,129,0.4)', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Posting...' : 'Post Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showUserModal && (
        <div onClick={e => e.target === e.currentTarget && setShowUserModal(false)}
          style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-color)', width:'100%', maxWidth:'480px', borderRadius:'24px', padding:'36px', animation:'modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <h3 style={{ fontWeight:900, fontSize:'20px', color:'var(--text-primary)', margin:'0 0 24px', letterSpacing:'-0.02em' }}>Add New Student</h3>
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
                <button type="button" onClick={() => setShowUserModal(false)} style={{ flex:1, padding:'12px', borderRadius:'12px', border:'1px solid var(--border-color)', background:'transparent', color:'var(--text-secondary)', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex:1, padding:'12px', borderRadius:'12px', border:'none', color:'var(--text-primary)', fontWeight:700, fontSize:'14px', cursor: submitting ? 'not-allowed' : 'pointer', background:'linear-gradient(135deg,#10b981,#059669)', boxShadow:'0 4px 14px rgba(16,185,129,0.4)', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {showEventModal && (
        <div onClick={e => e.target === e.currentTarget && setShowEventModal(false)}
          style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)' }}>
          <div style={{ background:'var(--bg-secondary)', border:'1px solid var(--border-color)', width:'100%', maxWidth:'480px', borderRadius:'24px', padding:'36px', animation:'modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1) both' }}>
            <h3 style={{ fontWeight:900, fontSize:'20px', color:'var(--text-primary)', margin:'0 0 24px', letterSpacing:'-0.02em' }}>Schedule Event</h3>
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
                    {['lecture', 'lab', 'meeting', 'workshop', 'exam', 'other'].map(t => <option key={t} value={t} style={{background:'var(--bg-secondary)'}}>{t[0].toUpperCase()+t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LabelStyle}>Location</label>
                  <input style={InputStyle} placeholder="e.g. Room 204" value={newEvent.location} onChange={e => setNewEvent(n=>({...n,location:e.target.value}))} />
                </div>
              </div>
              <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
                <button type="button" onClick={() => setShowEventModal(false)} style={{ flex:1, padding:'12px', borderRadius:'12px', border:'1px solid var(--border-color)', background:'transparent', color:'var(--text-secondary)', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>Cancel</button>
                <button type="submit" disabled={submitting} style={{ flex:1, padding:'12px', borderRadius:'12px', border:'none', color:'var(--text-primary)', fontWeight:700, fontSize:'14px', cursor: submitting ? 'not-allowed' : 'pointer', background:'linear-gradient(135deg,#10b981,#059669)', boxShadow:'0 4px 14px rgba(16,185,129,0.4)', opacity: submitting ? 0.7 : 1 }}>
                  {submitting ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Logout Modal */}
      <ConfirmationModal 
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out?"
        confirmText="Yes, Sign Out"
      />

      <style>{`
        @keyframes pageUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes modalPop { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        @keyframes spin { to { transform:rotate(360deg); } }
      `}</style>
    </div>
  );
};

const LabelStyle = { display:'block', fontSize:'11px', fontWeight:700, color:'var(--text-secondary)', textTransform:'uppercase', letterSpacing:'0.08em', margin:'0 0 6px 4px' };
const InputStyle = { width:'100%', background:'var(--bg-primary)', border:'1px solid var(--border-color)', borderRadius:'12px', padding:'12px 16px', fontSize:'14px', color:'var(--text-primary)', outline:'none', fontFamily:'inherit', transition:'all 0.2s' };

export default Admin;
