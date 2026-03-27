import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import toast from "react-hot-toast";
import { GraduationCap, Eye, EyeOff, BookOpen, Lock, Mail, ChevronRight, LayoutDashboard, CalendarDays } from "lucide-react";

const InputField = ({ icon: Icon, label, type, value, onChange, placeholder, isPassword, showPwd, onTogglePwd }) => {
    const [focused, setFocused] = useState(false);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
            <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', display: 'flex' }}>
                    <Icon size={18} color={focused ? "#06b6d4" : "#94a3b8"} style={{ transition: 'color 0.2s' }} />
                </div>
                <input
                    type={isPassword && showPwd ? "text" : type}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder={placeholder}
                    required
                    style={{
                        width: '100%',
                        background: '#ffffff',
                        border: focused ? '1px solid #06b6d4' : '1px solid #e2e8f0',
                        boxShadow: focused ? '0 0 0 3px rgba(6,182,212,0.1)' : '0 1px 2px rgba(0,0,0,0.05)',
                        borderRadius: '12px',
                        padding: isPassword ? '14px 46px 14px 44px' : '14px 16px 14px 44px',
                        fontSize: '14px',
                        color: '#0f172a',
                        outline: 'none',
                        fontFamily: 'inherit',
                        transition: 'all 0.2s ease',
                    }}
                />
                {isPassword && (
                    <button
                        type="button"
                        onClick={onTogglePwd}
                        style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', transition: 'color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
                        onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                        {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </div>
        </div>
    );
};

const Login = () => {
    const [role, setRole] = useState("student"); // 'student' | 'teacher'
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [rememberMe, setRememberMe] = useState(false);
    
    const { login } = useAuth();
    const navigate = useNavigate();

    // Check localStorage for saved email on mount
    useEffect(() => {
        const savedEmail = localStorage.getItem("cc_saved_email");
        if (savedEmail) {
            setForm(f => ({ ...f, email: savedEmail }));
            setRememberMe(true);
        }
    }, []);

    const setVal = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        const emailStr = form.email.trim();
        const passStr = form.password;
        
        // Basic Client Validations
        if (!emailStr) return setError("Please enter your email address.");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailStr)) return setError("Please enter a valid email format.");
        if (!passStr) return setError("Please enter your password.");

        setLoading(true);
        setError("");
        try {
            const res = await api.post("/auth/login", { email: emailStr, password: passStr });
            
            if (rememberMe) localStorage.setItem("cc_saved_email", emailStr);
            else localStorage.removeItem("cc_saved_email");

            toast.success(`Welcome back ${role === 'teacher' ? 'Professor' : 'Student'}!`);
            login(res.data.token, res.data.user);
            navigate(res.data.user.role === "admin" ? "/admin" : "/");
        } catch (err) {
            setError(err.response?.data?.error || "Invalid credentials. Please verify your account details.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display:'flex', minHeight:'100vh', fontFamily:"'Inter',sans-serif", background:'#ffffff' }}>
            
            {/* Split Screen Left - Illustration / Branding */}
            <div style={{ flex: 1.2, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '60px', background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)' }}>
                
                {/* Accent blurred orbs for modern glow (Teal/Cyan) */}
                <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '500px', height: '500px', borderRadius: '50%', background: 'rgba(6,182,212,0.15)', filter: 'blur(80px)' }} />
                <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '600px', height: '600px', borderRadius: '50%', background: 'rgba(30,58,138,0.4)', filter: 'blur(100px)' }} />

                {/* Logo Area */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative', zIndex: 10 }}>
                    <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'linear-gradient(135deg, #06b6d4, #0284c7)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(6,182,212,0.4)' }}>
                        <GraduationCap size={24} color="#fff" />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '22px', color: '#fff', letterSpacing: '-0.02em' }}>
                        StudyPoint
                    </span>
                </div>

                {/* Main Hero Copy - Dynamically changes based on role toggle for UX flair */}
                <div style={{ margin: 'auto 0', position: 'relative', zIndex: 10, animation: 'pageUp 0.4s ease both' }}>
                    <h1 style={{ fontSize: '48px', fontWeight: 900, color: '#fff', lineHeight: 1.1, marginBottom: '20px', letterSpacing: '-0.03em' }}>
                        {role === 'student' ? 'Unlock your academic potential.' : 'Empower your remote classrooms.'}
                    </h1>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '18px', maxWidth: '400px', lineHeight: 1.5, marginBottom: '40px' }}>
                        {role === 'student' 
                            ? 'Manage your schedule, track assignments, and stay connected with a modern, intelligent hub.'
                            : 'Distribute assignments, post urgent notices, and oversee all student activities instantly.'}
                    </p>

                    {/* Glassmorphism Feature List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {role === 'student' ? [
                            { icon: BookOpen, text: 'Track core task deadlines securely' },
                            { icon: CalendarDays, text: 'Sync daily class and lab schedules' }
                        ].map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '14px 20px', borderRadius: '14px', backdropFilter: 'blur(10px)', width: 'fit-content' }}>
                                <f.icon size={18} color="#06b6d4" />
                                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>{f.text}</span>
                            </div>
                        )) : [
                            { icon: LayoutDashboard, text: 'Full oversight of student submissions' },
                            { icon: BookOpen, text: 'Broadcast multi-level priority notices' }
                        ].map((f, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: '14px 20px', borderRadius: '14px', backdropFilter: 'blur(10px)', width: 'fit-content' }}>
                                <f.icon size={18} color="#06b6d4" />
                                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 500 }}>{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div style={{ position: 'relative', zIndex: 10, fontSize: '12px', color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>
                    © {new Date().getFullYear()} StudyPoint System. Access restricted to authorized personnel.
                </div>
            </div>

            {/* Split Screen Right - Form Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '40px', background: '#ffffff' }}>
                <div style={{ width: '100%', maxWidth: '400px', animation: 'pageUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
                    
                    <h2 style={{ fontSize: '28px', fontWeight: 900, color: '#0f172a', margin: '0 0 8px', letterSpacing: '-0.02em', textAlign: 'center' }}>
                        Welcome back
                    </h2>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: '0 0 32px', textAlign: 'center' }}>
                        Please enter your secure credentials to sign in
                    </p>

                    {/* Highly Premium Role Switch Toggle (Light Mode Version) */}
                    <div style={{ display: 'flex', background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '6px', marginBottom: '32px', position: 'relative' }}>
                        {['student', 'teacher'].map((r) => (
                            <button
                                key={r}
                                type="button"
                                onClick={() => { setRole(r); setError(""); }}
                                style={{
                                    flex: 1, padding: '10px 0', fontSize: '14px', fontWeight: 700, borderRadius: '12px', border: 'none', cursor: 'pointer', zIndex: 2, transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                    color: role === r ? '#ffffff' : '#64748b',
                                    background: role === r ? '#1e3a8a' : 'transparent',
                                    boxShadow: role === r ? '0 4px 12px rgba(30,58,138,0.15)' : 'none',
                                    textTransform: 'capitalize'
                                }}
                            >
                                {r} Portal
                            </button>
                        ))}
                    </div>

                    {/* Animated Error Box */}
                    <div style={{ minHeight: '52px', overflow: 'hidden', transition: 'all 0.3s ease', marginBottom: error ? '16px' : '0' }}>
                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px', padding: '12px 16px', color: '#ef4444', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', animation: 'modalPop 0.2s ease both' }}>
                                <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>!</div> 
                                {error}
                            </div>
                        )}
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        
                        <InputField 
                            icon={Mail}
                            label={`${role === 'teacher' ? 'Faculty' : 'Student'} Email`}
                            type="email"
                            value={form.email}
                            onChange={setVal("email")}
                            placeholder={role === 'teacher' ? "professor@university.edu" : "student@university.edu"}
                        />

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <InputField 
                                icon={Lock}
                                label="Password"
                                type="password"
                                value={form.password}
                                onChange={setVal("password")}
                                placeholder="••••••••"
                                isPassword
                                showPwd={showPwd}
                                onTogglePwd={() => setShowPwd((s) => !s)}
                            />
                            {/* Remember me only - no forgot password */}
                            <div style={{ display: 'flex', alignItems: 'center', marginTop: '4px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        style={{ accentColor: '#06b6d4', width: '15px', height: '15px', cursor: 'pointer' }} 
                                    />
                                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, transition: 'color 0.2s' }}>Remember me</span>
                                </label>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                marginTop: '12px',
                                padding: '16px',
                                borderRadius: '14px',
                                border: 'none',
                                cursor: loading ? "not-allowed" : "pointer",
                                color: "#fff",
                                fontWeight: 800,
                                fontSize: "15px",
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                gap: '8px',
                                transition: "all 0.2s",
                                background: loading ? "rgba(6,182,212,0.5)" : "linear-gradient(135deg, #06b6d4, #0284c7)",
                                boxShadow: loading ? "none" : "0 4px 20px rgba(6,182,212,0.35)",
                                position: 'relative'
                            }}
                            onMouseEnter={e => { if(!loading) e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 25px rgba(6,182,212,0.45)'; }}
                            onMouseLeave={e => { if(!loading) e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(6,182,212,0.35)'; }}
                        >
                            {loading ? (
                                <div style={{ width:20, height:20, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }} />
                            ) : (
                                <>Sign in securely <ChevronRight size={18} /></>
                            )}
                        </button>
                        
                    </form>
                </div>
            </div>

            <style>{`
                @keyframes pageUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
                @keyframes modalPop { from{opacity:0;transform:scale(0.96)} to{opacity:1;transform:scale(1)} }
                @keyframes spin { to { transform:rotate(360deg); } }
                
                /* Mobile responsiveness */
                @media (max-width: 900px) {
                    div[style*="minHeight: '100vh'"] { flexDirection: "column" !important; }
                    div[style*="flex: 1.2"] { padding: "40px 24px" !important; flex: "none" !important; minHeight: "35vh"; justify-content: "center"; }
                    div[style*="width: '100%'"] { padding: "32px 24px" !important; }
                    h1 { fontSize: "32px" !important; }
                }
            `}</style>
        </div>
    );
};

export default Login;
