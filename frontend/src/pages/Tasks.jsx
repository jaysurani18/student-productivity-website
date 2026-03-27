import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle, Circle, Filter, Calendar, Clock, FolderOpen } from 'lucide-react';
import api from '../api';
import toast from 'react-hot-toast';

const CATEGORIES = ['assignment', 'exam', 'project', 'personal'];
const URGENCIES  = ['low', 'medium', 'high'];

const DOT_STYLE = {
  high:   { background: '#ef4444', boxShadow: '0 0 7px rgba(239,68,68,0.8)' },
  medium: { background: '#f59e0b', boxShadow: '0 0 7px rgba(245,158,11,0.8)' },
  low:    { background: '#10b981', boxShadow: '0 0 7px rgba(16,185,129,0.8)' },
};

const BADGE_STYLE = {
  high:   { bg: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'rgba(239, 68, 68, 0.2)' },
  medium: { bg: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: 'rgba(245, 158, 11, 0.2)' },
  low:    { bg: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: 'rgba(16, 185, 129, 0.2)' },
};

const UDot = ({ level }) => (
  <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', flexShrink:0, ...(DOT_STYLE[level] || DOT_STYLE.medium) }} />
);

const UBadge = ({ level }) => {
  const s = BADGE_STYLE[level] || BADGE_STYLE.medium;
  return (
    <span style={{ display:'inline-flex', alignItems:'center', padding:'2px 8px', borderRadius:'999px', fontSize:'11px', fontWeight:700, background:s.bg, color:s.color, border:`1px solid ${s.border}` }}>
      {level}
    </span>
  );
};

const InputStyle = {
  width:'100%', background:'var(--bg-primary)', border:'1px solid var(--border-color)', borderRadius:'12px',
  padding:'10px 16px', fontSize:'14px', fontWeight:500, color:'var(--text-primary)',
  outline:'none', fontFamily:'inherit',
};

const LabelStyle = {
  display:'block', fontSize:'11px', fontWeight:700, color:'var(--text-muted)',
  textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'6px',
};

const Tasks = () => {
  const [tasks, setTasks]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTask, setNewTask]     = useState({ title:'', description:'', category:'', due_date:'', urgency_level:'medium' });
  const [filters, setFilters] = useState(() => {
    const saved = localStorage.getItem('cc_task_filters');
    return saved ? JSON.parse(saved) : { category:'', urgency:'' };
  });

  useEffect(() => {
    localStorage.setItem('cc_task_filters', JSON.stringify(filters));
  }, [filters]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.urgency)  params.urgency  = filters.urgency;
      const res = await api.get('/tasks', { params });
      setTasks(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); setTasks([]); toast.error('Failed to load tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, [filters]);

  const handleAdd = async (e) => {
    e.preventDefault();
    const titleTrim = newTask.title.trim();
    if (!titleTrim) return toast.error('Task title cannot be empty.');
    if (titleTrim.length < 3) return toast.error('Task title must be at least 3 characters.');

    try {
      await api.post('/tasks', newTask);
      toast.success('Task created successfully!');
      setShowModal(false);
      setNewTask({ title:'', description:'', category:'', due_date:'', urgency_level:'medium' });
      fetchTasks();
    } catch (err) { 
      console.error(err); 
      toast.error(err.response?.data?.error || 'Failed to create task');
    }
  };

  const toggleComplete = async (task) => {
    try {
      // Only send is_completed — avoids sending due_date back which causes timezone drift
      await api.patch(`/tasks/${task.id}/toggle`, { is_completed: !task.is_completed });
      if (!task.is_completed) toast.success('Task completed!');
      fetchTasks();
    } catch (err) { 
      toast.error('Failed to update task');
      console.error(err); 
    }
  };

  const deleteTask = async (id) => {
    try { await api.delete(`/tasks/${id}`); setTasks(t => t.filter(x => x.id !== id)); toast.success('Task deleted'); }
    catch (err) { toast.error('Failed to delete task'); console.error(err); }
  };

  const total    = tasks.length;
  const done     = tasks.filter(t => t.is_completed).length;
  const urgent   = tasks.filter(t => t.urgency_level === 'high' && !t.is_completed).length;
  const progress = total ? Math.round((done / total) * 100) : 0;

  return (
    <div style={{ animation:'pageUp 0.35s ease both' }}>

      {/* ── Header ─────────────────────────────── */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'32px' }}>
        <div>
          <h2 style={{ fontSize:'28px', fontWeight:900, color:'var(--text-primary)', letterSpacing:'-0.02em', margin:0 }}>Tasks & Deadlines</h2>
          <p style={{ color:'var(--text-secondary)', fontSize:'14px', marginTop:'4px' }}>Stay on top of every assignment, exam & project</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 20px', borderRadius:'12px', border:'none', cursor:'pointer', color:'#fff', fontSize:'14px', fontWeight:600, background:'linear-gradient(135deg,#10b981,#059669)', boxShadow:'0 4px 14px rgba(16,185,129,0.4)' }}
        >
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* ── Progress banner ─────────────────────── */}
      {total > 0 && (
        <div style={{ background:'var(--bg-secondary)', borderRadius:'18px', border:'1px solid var(--border-color)', boxShadow:'var(--card-shadow)', padding:'20px', marginBottom:'20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
            <span style={{ fontSize:'14px', fontWeight:700, color:'var(--text-primary)' }}>Completion Progress</span>
            <span style={{ fontSize:'14px', fontWeight:700, color:'#10b981' }}>{done} / {total} done</span>
          </div>
          <div style={{ height:'10px', background:'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius:'999px', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${progress}%`, background:'linear-gradient(90deg,#10b981,#059669)', borderRadius:'999px', transition:'width 0.7s ease' }} />
          </div>
          <p style={{ fontSize:'12px', marginTop:'8px', color: urgent > 0 ? '#dc2626' : '#16a34a' }}>
            {urgent > 0 ? `🔴 ${urgent} urgent task${urgent > 1 ? 's' : ''} need attention` : '✅ No urgent tasks — keep it up!'}
          </p>
        </div>
      )}

      {/* ── Filters ─────────────────────────────── */}
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'12px', background:'var(--bg-secondary)', borderRadius:'16px', border:'1px solid var(--border-color)', boxShadow:'var(--card-shadow)', padding:'14px 18px', marginBottom:'20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'6px', color:'var(--text-muted)', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>
          <Filter size={13} /> Filters
        </div>
        <select
          value={filters.category}
          onChange={e => setFilters(f => ({...f, category:e.target.value}))}
          style={{ background:'var(--bg-primary)', border:'1px solid var(--border-color)', borderRadius:'10px', padding:'8px 12px', fontSize:'13px', color:'var(--text-primary)', outline:'none', cursor:'pointer', fontFamily:'inherit' }}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c[0].toUpperCase()+c.slice(1)}</option>)}
        </select>
        <select
          value={filters.urgency}
          onChange={e => setFilters(f => ({...f, urgency:e.target.value}))}
          style={{ background:'var(--bg-primary)', border:'1px solid var(--border-color)', borderRadius:'10px', padding:'8px 12px', fontSize:'13px', color:'var(--text-primary)', outline:'none', cursor:'pointer', fontFamily:'inherit' }}
        >
          <option value="">All Urgency</option>
          {URGENCIES.map(u => <option key={u} value={u}>{u[0].toUpperCase()+u.slice(1)}</option>)}
        </select>
        {(filters.category || filters.urgency) && (
          <button onClick={() => setFilters({category:'',urgency:''})} style={{ background:'none', border:'none', color:'#10b981', fontSize:'13px', fontWeight:700, cursor:'pointer', textDecoration:'underline' }}>
            Clear
          </button>
        )}
        <span style={{ marginLeft:'auto', fontSize:'12px', color:'var(--text-muted)' }}>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Task list ───────────────────────────── */}
      <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px', background:'var(--bg-secondary)', borderRadius:'24px', border:'1px solid var(--border-color)' }}>
            <div style={{ width:30, height:30, borderRadius:'50%', border:'2px solid #10b981', borderTopColor:'transparent', animation:'spin 0.8s linear infinite', marginBottom:12 }} />
            <p style={{ color:'var(--text-muted)', fontSize:'14px' }}>Loading tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 20px', background:'var(--bg-secondary)', borderRadius:'24px', border:'2px dashed var(--border-color)', textAlign:'center' }}>
            <div style={{ width:60, height:60, borderRadius:'18px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16, background:'linear-gradient(135deg,#ede9fe,#ddd6fe)' }}>
              <CheckCircle size={26} style={{ color:'#10b981' }} />
            </div>
            <p style={{ fontWeight:600, color:'var(--text-primary)', fontSize:'16px', margin:0 }}>No tasks found</p>
            <p style={{ color:'var(--text-muted)', fontSize:'13px', marginTop:'6px' }}>Click "New Task" to add your first one</p>
          </div>
        ) : (
          tasks.map(task => (
            <div
              key={task.id}
              style={{ display:'flex', alignItems:'center', gap:'14px', background:'var(--bg-secondary)', borderRadius:'16px', border:'1px solid var(--border-color)', boxShadow:'var(--card-shadow)', padding:'16px 18px', transition:'all 0.2s', opacity: task.is_completed ? 0.6 : 1 }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow='0 8px 30px rgba(0,0,0,0.1)'; e.currentTarget.style.transform='translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow='var(--card-shadow)'; e.currentTarget.style.transform='none'; }}
            >
              <UDot level={task.urgency_level} />

              <button
                onClick={() => toggleComplete(task)}
                style={{ background:'none', border:'none', cursor:'pointer', flexShrink:0, display:'flex', padding:0, color: task.is_completed ? '#10b981' : 'var(--text-muted)', transition:'color 0.2s' }}
                onMouseEnter={e => !task.is_completed && (e.currentTarget.style.color='#10b981')}
                onMouseLeave={e => !task.is_completed && (e.currentTarget.style.color='var(--text-muted)')}
              >
                {task.is_completed ? <CheckCircle size={22} /> : <Circle size={22} />}
              </button>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:'8px', marginBottom:'4px' }}>
                  <span style={{ fontWeight:600, fontSize:'15px', color: task.is_completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.is_completed ? 'line-through' : 'none' }}>
                    {task.title}
                  </span>
                  <UBadge level={task.urgency_level} />
                  {task.category && (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', padding:'2px 8px', borderRadius:'999px', fontSize:'11px', fontWeight:700, background:'rgba(59, 130, 246, 0.12)', color:'#3b82f6', border:'1px solid rgba(59, 130, 246, 0.3)' }}>
                      <FolderOpen size={10} /> {task.category}
                    </span>
                  )}
                </div>
                {task.due_date && (
                  <p style={{ fontSize:'12px', color:'var(--text-muted)', display:'flex', alignItems:'center', gap:'4px', margin:0 }}>
                    <Calendar size={11} />
                    {new Date(task.due_date).toLocaleDateString('en-IN', { weekday:'short', month:'short', day:'numeric' })}
                    <span style={{ margin:'0 2px', opacity:0.4 }}>·</span>
                    <Clock size={11} />
                    {new Date(task.due_date).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                  </p>
                )}
              </div>

              <button
                onClick={() => deleteTask(task.id)}
                style={{ background:'none', border:'none', cursor:'pointer', padding:'8px', borderRadius:'10px', color:'var(--text-muted)', flexShrink:0, transition:'all 0.2s', display:'flex' }}
                onMouseEnter={e => { e.currentTarget.style.color='#ef4444'; e.currentTarget.style.background='rgba(239, 68, 68, 0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.background='none'; }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* ── Create Modal ────────────────────────── */}
      {showModal && (
        <div
          onClick={e => e.target === e.currentTarget && setShowModal(false)}
          style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', background:'rgba(15,12,41,0.65)', backdropFilter:'blur(8px)' }}
        >
          <div style={{ background:'var(--bg-secondary)', width:'100%', maxWidth:'520px', borderRadius:'24px', boxShadow:'0 25px 60px rgba(0,0,0,0.35)', padding:'36px', animation:'modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1) both', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize:'22px', fontWeight:900, color:'var(--text-primary)', letterSpacing:'-0.02em', margin:'0 0 24px' }}>Create New Task</h3>
            <form onSubmit={handleAdd} style={{ display:'flex', flexDirection:'column', gap:'18px' }}>
              <div>
                <label style={LabelStyle}>Title *</label>
                <input required style={InputStyle} placeholder="e.g. Finish Chapter 5 notes" value={newTask.title} onChange={e => setNewTask(t=>({...t,title:e.target.value}))} />
              </div>
              <div>
                <label style={LabelStyle}>Description</label>
                <textarea rows={2} style={{ ...InputStyle, resize:'vertical' }} placeholder="Optional details..." value={newTask.description} onChange={e => setNewTask(t=>({...t,description:e.target.value}))} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
                <div>
                  <label style={LabelStyle}>Category</label>
                  <select style={InputStyle} value={newTask.category} onChange={e => setNewTask(t=>({...t,category:e.target.value}))}>
                    <option value="">None</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c[0].toUpperCase()+c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label style={LabelStyle}>Urgency</label>
                  <select style={InputStyle} value={newTask.urgency_level} onChange={e => setNewTask(t=>({...t,urgency_level:e.target.value}))}>
                    {URGENCIES.map(u => <option key={u} value={u}>{u[0].toUpperCase()+u.slice(1)}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={LabelStyle}>Due Date & Time</label>
                <input type="datetime-local" style={InputStyle} value={newTask.due_date} onChange={e => setNewTask(t=>({...t,due_date:e.target.value}))} />
              </div>

              {/* Urgency preview */}
              <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 14px', borderRadius:'12px', background:'var(--bg-primary)', border:'1px solid var(--border-color)' }}>
                <UDot level={newTask.urgency_level} />
                <span style={{ fontSize:'13px', color:'var(--text-secondary)' }}>
                  This will appear as <strong style={{ color:'var(--text-primary)' }}>{newTask.urgency_level}</strong> priority
                </span>
              </div>

              <div style={{ display:'flex', gap:'12px', paddingTop:'8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex:1, padding:'13px', borderRadius:'14px', border:'none', background:'var(--bg-primary)', color:'var(--text-secondary)', border: '1px solid var(--border-color)', fontWeight:700, fontSize:'14px', cursor:'pointer' }}>
                  Cancel
                </button>
                <button type="submit" style={{ flex:1, padding:'13px', borderRadius:'14px', border:'none', color:'#fff', fontWeight:700, fontSize:'14px', cursor:'pointer', background:'linear-gradient(135deg,#10b981,#059669)', boxShadow:'0 4px 14px rgba(16,185,129,0.4)' }}>
                  Save Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin     { to { transform: rotate(360deg); } }
        @keyframes modalPop { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
        @keyframes pageUp   { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </div>
  );
};

export default Tasks;
