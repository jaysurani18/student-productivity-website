const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/Admin.jsx', 'utf8');

// 1. Sidebar Map replacement
// Replace the inline styled button in the sidebar array map with the nav-active class
const sidebarBtnRegex = /<button key=\{key\} onClick=\{\(\) => setTab\(key\)\} style=\{\{.*?\}\}>/g;
content = content.replace(sidebarBtnRegex, `<button key={key} onClick={() => setTab(key)} className={tab === key ? 'nav-active' : ''} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'11px 14px', borderRadius:'12px', border: '1px solid transparent', fontWeight:600, fontSize:'13px', cursor:'pointer', marginBottom:'2px', textAlign:'left', width:'100%', transition:'all 0.18s', color: tab === key ? 'inherit' : 'var(--text-secondary)' }}>`);

// 2. Primary Green Buttons (Add Event, Post Notice, etc)
// Replace heavy inline gradient styles with className="btn-grad"
const primaryBtnRegex = /style=\{\{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', borderRadius:'12px', border:'none', cursor:'pointer', color:'#fff', fontWeight:700, fontSize:'13px', background:'linear-gradient\(135deg,#10b981,#059669\)', boxShadow:'.*?rgba\(16,185,129,0\.4\)' \}\}/g;
content = content.replace(primaryBtnRegex, `className="btn-grad" style={{ display:'flex', alignItems:'center', gap:'8px', padding:'10px 18px', borderRadius:'12px', border:'none', cursor:'pointer', color:'#fff', fontWeight:700, fontSize:'13px' }}`);

// Modal submit buttons
const modalSubmitRegex = /style=\{\{ flex:1, padding:'12px', borderRadius:'12px', border:'none', color:'#fff', fontWeight:700, fontSize:'14px', cursor: submitting \? 'not-allowed' : 'pointer', background:'linear-gradient\(135deg,#10b981,#059669\)', boxShadow:'.*?rgba\(16,185,129,0\.4\)', opacity: submitting \? 0\.7 : 1 \}\}/g;
content = content.replace(modalSubmitRegex, `className="btn-grad" style={{ flex:1, padding:'12px', borderRadius:'12px', border:'none', color:'#fff', fontWeight:700, fontSize:'14px', cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1 }}`);

// Quick Action Box colors (ensure they pop in both modes)
// we'll replace the label mapping array
content = content.replace(/\{ label:'Post Notice',   action: \(\) => \{ setTab\('notices'\); setShowModal\(true\); \}, color:'#10b981' \},/g, 
  `{ label:'Post Notice',   action: () => { setTab('notices'); setShowModal(true); }, color:'var(--sidebar-text-active)' },`);

content = content.replace(/\{ label:'Add Event',     action: \(\) => \{ setTab\('schedule'\); setShowEventModal\(true\); \}, color:'#10b981' \},/g, 
  `{ label:'Add Event',     action: () => { setTab('schedule'); setShowEventModal(true); }, color:'var(--sidebar-text-active)' },`);

// Quick Action mapping styles
content = content.replace(/style=\{\{ padding:'10px 20px', borderRadius:'12px', border:`1px solid \$\{color\}40`, background:`\$\{color\}20`, color, fontWeight:700, fontSize:'13px', cursor:'pointer', transition:'all 0\.2s' \}\}/g,
  `className="btn-grad" style={{ padding:'10px 20px', borderRadius:'12px', border:'none', color:'#fff', fontWeight:700, fontSize:'13px', cursor:'pointer', transition:'all 0.2s' }}`);

// Eliminate the mouse hover overrides on those quick action buttons since btn-grad handles hover states now
content = content.replace(/onMouseEnter=\{e => e\.currentTarget\.style\.background=`\$\{color\}35`\}/g, "");
content = content.replace(/onMouseLeave=\{e => e\.currentTarget\.style\.background=`\$\{color\}20`\}/g, "");

fs.writeFileSync('frontend/src/pages/Admin.jsx', content);
