import React, { useState, useEffect, useRef } from 'react';
import { Megaphone, AlertTriangle, Info, Paperclip, Download, Upload, FileText, CheckCircle, X } from 'lucide-react';
import api from '../api';

const FILE_BASE_URL = 'http://localhost:5000';

const SEV_STYLES = {
  alert:   { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.2)', barColor: '#ef4444', icon: AlertTriangle, iconColor: '#ef4444', label: 'Alert' },
  warning: { bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.2)', barColor: '#f59e0b', icon: AlertTriangle, iconColor: '#f59e0b', label: 'Warning' },
  info:    { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.2)', barColor: '#3b82f6', icon: Info,          iconColor: '#3b82f6', label: 'Info' },
};

const Notices = () => {
  const [notices, setNotices]     = useState([]);
  const [loading, setLoading]     = useState(true);

  // Assignment Submission State
  const [activeSubmitNoticeId, setActiveSubmitNoticeId] = useState(null);
  const [assignmentSubject, setAssignmentSubject] = useState('');
  const [assignmentDesc, setAssignmentDesc] = useState('');
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setAssignmentSubject('');
    setAssignmentDesc('');
    setAssignmentFile(null);
    setSubmitMessage({ type: '', text: '' });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAssignmentSubmit = async (e, noticeId) => {
    e.preventDefault();
    if (!assignmentFile || !assignmentSubject.trim()) {
      setSubmitMessage({ type: 'error', text: 'Subject and file are required.' });
      return;
    }

    // Check if deadline has passed
    const notice = notices.find(n => n.id === noticeId);
    if (notice && notice.deadline && new Date(notice.deadline) < new Date()) {
      setSubmitMessage({ type: 'error', text: 'This assignment deadline has passed. Submissions are no longer accepted.' });
      return;
    }

    setSubmitLoading(true);
    setSubmitMessage({ type: '', text: '' });

    const formData = new FormData();
    formData.append('subject', assignmentSubject);
    formData.append('description', assignmentDesc);
    formData.append('assignment_file', assignmentFile);
    formData.append('notice_id', noticeId);

    try {
      await api.post('/assignments', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSubmitMessage({ type: 'success', text: 'Assignment submitted successfully!' });
      setTimeout(() => {
        resetForm();
        setActiveSubmitNoticeId(null);
      }, 2000);
    } catch (err) {
      setSubmitMessage({ type: 'error', text: err.response?.data?.error || 'Failed to submit assignment' });
    } finally {
      setSubmitLoading(false);
    }
  };

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await api.get('/notices');
      setNotices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error(err);
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotices(); }, []);

  const formatDate = (dt) => new Date(dt).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ animation: 'pageUp 0.35s ease both' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>Notices</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginTop: '4px' }}>Important announcements and alerts from your institution</p>
        </div>
      </div>

      {/* Severity summary bar */}
      {notices.length > 0 && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          {['alert','warning','info'].map(sev => {
            const count = notices.filter(n => n.severity === sev).length;
            const s = SEV_STYLES[sev];
            const Icon = s.icon;
            return (
              <div key={sev} style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: '14px', border: `1px solid var(--border-color)`, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: 'var(--card-shadow)' }}>
                <Icon size={18} style={{ color: s.iconColor, flexShrink: 0 }} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: '20px', color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>{count}</p>
                  <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, marginTop: '2px' }}>{s.label}{count !== 1 ? 's' : ''}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Notices */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px', background: 'var(--bg-secondary)', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid #10b981', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite', marginBottom: 12 }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Loading notices...</p>
          </div>
        ) : notices.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 20px', background: 'var(--bg-secondary)', borderRadius: '24px', border: '2px dashed var(--border-color)', textAlign: 'center' }}>
            <div style={{ width: 60, height: 60, borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, background: 'linear-gradient(135deg,#ede9fe,#ddd6fe)' }}>
              <Megaphone size={26} style={{ color: '#10b981' }} />
            </div>
            <p style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '16px', margin: 0 }}>No notices yet</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>Check back later for updates</p>
          </div>
        ) : (
          notices.map(notice => {
            const s = SEV_STYLES[notice.severity] || SEV_STYLES.info;
            const Icon = s.icon;
            return (
              <div
                key={notice.id}
                style={{
                  background: 'var(--bg-secondary)', borderRadius: '16px', border: '1px solid var(--border-color)',
                  borderLeft: `4px solid ${s.barColor}`,
                  boxShadow: 'var(--card-shadow)', padding: '18px 20px',
                  display: 'flex', alignItems: 'flex-start', gap: '14px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 8px 30px rgba(0,0,0,0.12)'; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow='var(--card-shadow)'; e.currentTarget.style.transform='none'; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '10px', background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={17} style={{ color: s.iconColor }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 700, fontSize: '15px', color: 'var(--text-primary)' }}>{notice.title}</span>
                    <span style={{ display: 'inline-flex', padding: '2px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 700, background: s.bg, color: s.iconColor, border: `1px solid ${s.border}` }}>{s.label}</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>{notice.content}</p>
                  
                  {notice.attachment_path && (
                    <a 
                      href={`${FILE_BASE_URL}${notice.attachment_path}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        marginTop: '12px', 
                        padding: '6px 12px', 
                        background: 'var(--bg-primary)', 
                        border: '1px solid var(--border-color)', 
                        borderRadius: '8px', 
                        fontSize: '12px', 
                        fontWeight: 600, 
                        color: 'var(--text-primary)', 
                        textDecoration: 'none',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                    >
                      <Paperclip size={14} style={{ color: '#10b981' }} />
                      View Attachment
                      <Download size={14} style={{ marginLeft: '4px', opacity: 0.6 }} />
                    </a>
                  )}
                  
                  {notice.requires_submission && (
                    <>
                      {notice.deadline && (
                        <p style={{ fontSize: '12px', color: new Date(notice.deadline) < new Date() ? '#ef4444' : '#10b981', margin: '12px 0 0', fontWeight: 600 }}>
                          📅 Submission Deadline: {new Date(notice.deadline).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          {new Date(notice.deadline) < new Date() && ' (Closed)'}
                        </p>
                      )}
                      {activeSubmitNoticeId !== notice.id && (!notice.deadline || new Date(notice.deadline) >= new Date()) && (
                        <button onClick={() => { setActiveSubmitNoticeId(notice.id); resetForm(); }} style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#10b981', color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)' }}>
                          <Upload size={14} /> Submit Assignment
                        </button>
                      )}
                      {notice.deadline && new Date(notice.deadline) < new Date() && (
                        <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                          <AlertTriangle size={16} />
                          <span style={{ fontSize: '12px', fontWeight: 600 }}>This assignment deadline has passed. Submissions are no longer accepted.</span>
                        </div>
                      )}
                    </>
                  )}

                  {!notice.requires_submission && notice.due_date && (
                    <p style={{ fontSize: '12px', color: '#10b981', margin: '12px 0 0', fontWeight: 600 }}>
                      📅 Due Date: {new Date(notice.due_date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}

                  {activeSubmitNoticeId === notice.id && (
                    <div style={{ marginTop: '16px', background: 'var(--bg-primary)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>Submit Assignment</h4>
                        <button onClick={() => setActiveSubmitNoticeId(null)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={16} /></button>
                      </div>

                      {submitMessage.text && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '8px', marginBottom: '12px', background: submitMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: submitMessage.type === 'success' ? '#10b981' : '#ef4444', border: `1px solid ${submitMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}` }}>
                          {submitMessage.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                          <span style={{ fontSize: '12px', fontWeight: 600 }}>{submitMessage.text}</span>
                        </div>
                      )}

                      <form onSubmit={(e) => handleAssignmentSubmit(e, notice.id)} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <input type="text" value={assignmentSubject} onChange={(e) => setAssignmentSubject(e.target.value)} placeholder="Subject *" required style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }} />
                        </div>
                        <div>
                          <textarea value={assignmentDesc} onChange={(e) => setAssignmentDesc(e.target.value)} placeholder="Description (Optional)" rows={2} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '13px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }} />
                        </div>
                        <div style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: '16px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-primary)' }} onClick={() => fileInputRef.current?.click()}>
                          <input type="file" ref={fileInputRef} onChange={(e) => setAssignmentFile(e.target.files[0])} style={{ display: 'none' }} accept=".pdf,.doc,.docx,.zip,.rar,.png,.jpg,.jpeg" />
                          {assignmentFile ? (
                            <div>
                              <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#10b981' }}>{assignmentFile.name}</p>
                              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-muted)' }}>{(assignmentFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                            </div>
                          ) : (
                            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-secondary)' }}>Click to add file *</p>
                          )}
                        </div>
                        <button type="submit" disabled={submitLoading || !assignmentFile || !assignmentSubject.trim()} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', padding: '10px', fontSize: '13px', fontWeight: 600, cursor: (submitLoading || !assignmentFile || !assignmentSubject.trim()) ? 'not-allowed' : 'pointer', opacity: (submitLoading || !assignmentFile || !assignmentSubject.trim()) ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          {submitLoading ? 'Submitting...' : 'Upload'}
                        </button>
                      </form>
                    </div>
                  )}

                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '12px 0 0' }}>{formatDate(notice.posted_date)}</p>
                </div>
              </div>
            );
          })
        )}
      </div>


      <style>{`@keyframes spin { to { transform: rotate(360deg); } } @keyframes pageUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }`}</style>
    </div>
  );
};

export default Notices;
