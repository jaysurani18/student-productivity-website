import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../api";
import {
    GraduationCap,
    Eye,
    EyeOff,
    BookOpen,
    CalendarDays,
    Bell,
} from "lucide-react";

// ── Defined OUTSIDE Login so it never remounts on re-render ──
const inputBaseStyle = {
    width: "100%",
    background: "rgba(255,255,255,0.07)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    fontSize: "14px",
    fontWeight: 500,
    color: "#fff",
    outline: "none",
    fontFamily: "inherit",
};

const Input = ({
    label,
    type,
    value,
    onChange,
    placeholder,
    isPassword,
    showPwd,
    onTogglePwd,
}) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
        <label
            style={{
                fontSize: "12px",
                fontWeight: 700,
                color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
            }}
        >
            {label}
        </label>
        <div style={{ position: "relative" }}>
            <input
                type={isPassword && showPwd ? "text" : type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required
                style={{
                    ...inputBaseStyle,
                    padding: isPassword ? "13px 46px 13px 16px" : "13px 16px",
                }}
                onFocus={(e) => {
                    e.currentTarget.style.border =
                        "1px solid rgba(34,211,238,0.6)";
                    e.currentTarget.style.boxShadow =
                        "0 0 0 3px rgba(6,182,212,0.15)";
                }}
                onBlur={(e) => {
                    e.currentTarget.style.border =
                        "1px solid rgba(255,255,255,0.12)";
                    e.currentTarget.style.boxShadow = "none";
                }}
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={onTogglePwd}
                    style={{
                        position: "absolute",
                        right: "14px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "rgba(255,255,255,0.4)",
                        display: "flex",
                    }}
                >
                    {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            )}
        </div>
    </div>
);

const features = [
    {
        icon: BookOpen,
        label: "Manage Tasks",
        desc: "Track deadlines & priorities",
    },
    {
        icon: CalendarDays,
        label: "View Schedule",
        desc: "Daily timetable at a glance",
    },
    { icon: Bell, label: "Stay Informed", desc: "Important notices & alerts" },
];

// ─────────────────────────────────────────────────────────────
const Login = () => {
    const [form, setForm] = useState({ email: "", password: "" });
    const [showPwd, setShowPwd] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const set = (key) => (e) =>
        setForm((f) => ({ ...f, [key]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        try {
            const res = await api.post("/auth/login", {
                email: form.email,
                password: form.password,
            });
            login(res.data.token, res.data.user);
            navigate(res.data.user.role === "admin" ? "/admin" : "/");
        } catch (err) {
            setError(
                err.response?.data?.error ||
                    "Something went wrong. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                fontFamily: "'Inter',sans-serif",
                background: "#0a0a1a",
            }}
        >
            {/* Left panel — branding */}
            <div
                style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "60px",
                    background:
                        "linear-gradient(135deg,#0a1628 0%,#0e3a4a 60%,#0d2e3a 100%)",
                    position: "relative",
                    overflow: "hidden",
                }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: "-80px",
                        left: "-80px",
                        width: 300,
                        height: 300,
                        borderRadius: "50%",
                        background: "rgba(6,182,212,0.15)",
                        filter: "blur(60px)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "-60px",
                        right: "-60px",
                        width: 250,
                        height: 250,
                        borderRadius: "50%",
                        background: "rgba(8,145,178,0.2)",
                        filter: "blur(50px)",
                    }}
                />

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        marginBottom: "60px",
                        position: "relative",
                    }}
                >
                    <div
                        style={{
                            width: 52,
                            height: 52,
                            borderRadius: "16px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background:
                                "linear-gradient(135deg,#10b981,#059669)",
                            boxShadow: "0 6px 20px rgba(16,185,129,0.5)",
                        }}
                    >
                        <GraduationCap size={28} color="#fff" />
                    </div>
                    <span
                        style={{
                            fontWeight: 900,
                            fontSize: "22px",
                            background:
                                "linear-gradient(90deg,#22d3ee,#67e8f9,#fff)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        CampusCompanion
                    </span>
                </div>

                <h1
                    style={{
                        fontSize: "40px",
                        fontWeight: 900,
                        color: "#fff",
                        lineHeight: 1.15,
                        margin: "0 0 16px",
                        letterSpacing: "-0.03em",
                        maxWidth: 380,
                    }}
                >
                    Your Smart
                    <br />
                    <span
                        style={{
                            background:
                                "linear-gradient(90deg,#22d3ee,#67e8f9)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        Academic Hub
                    </span>
                </h1>
                <p
                    style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: "16px",
                        lineHeight: 1.6,
                        maxWidth: 320,
                        margin: "0 0 48px",
                    }}
                >
                    Manage your schedule, tasks, and stay up-to-date with all
                    academic notices — in one place.
                </p>

                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "20px",
                        position: "relative",
                    }}
                >
                    {features.map(({ icon: Icon, label, desc }) => (
                        <div
                            key={label}
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "16px",
                            }}
                        >
                            <div
                                style={{
                                    width: 42,
                                    height: 42,
                                    borderRadius: "12px",
                                    background: "rgba(6,182,212,0.2)",
                                    border: "1px solid rgba(6,182,212,0.3)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0,
                                }}
                            >
                                <Icon size={19} color="#22d3ee" />
                            </div>
                            <div>
                                <p
                                    style={{
                                        fontWeight: 700,
                                        fontSize: "14px",
                                        color: "#fff",
                                        margin: 0,
                                    }}
                                >
                                    {label}
                                </p>
                                <p
                                    style={{
                                        fontSize: "12px",
                                        color: "rgba(255,255,255,0.4)",
                                        margin: "2px 0 0",
                                    }}
                                >
                                    {desc}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right panel — form */}
            <div
                style={{
                    width: "460px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: "60px 48px",
                    background: "#0f0f23",
                    borderLeft: "1px solid rgba(255,255,255,0.06)",
                }}
            >
                <h2
                    style={{
                        fontSize: "24px",
                        fontWeight: 900,
                        color: "#fff",
                        margin: "0 0 8px",
                        letterSpacing: "-0.02em",
                    }}
                >
                    Welcome back!
                </h2>
                <p
                    style={{
                        fontSize: "13px",
                        color: "rgba(255,255,255,0.4)",
                        margin: "0 0 32px",
                    }}
                >
                    Sign in to your student account
                </p>

                {/* Fixed-height wrapper so form never shifts up/down when error appears */}
                <div style={{ minHeight: "52px", marginBottom: "8px" }}>
                    {error && (
                        <div
                            style={{
                                background: "rgba(239,68,68,0.15)",
                                border: "1px solid rgba(239,68,68,0.4)",
                                borderRadius: "12px",
                                padding: "12px 16px",
                                color: "#f87171",
                                fontSize: "14px",
                                fontWeight: 700,
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                <form
                    onSubmit={handleSubmit}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "18px",
                    }}
                >
                    <Input
                        label="Email Address"
                        type="email"
                        value={form.email}
                        onChange={set("email")}
                        placeholder="you@college.edu"
                    />
                    <Input
                        label="Password"
                        type="password"
                        value={form.password}
                        onChange={set("password")}
                        placeholder="••••••••"
                        isPassword
                        showPwd={showPwd}
                        onTogglePwd={() => setShowPwd((s) => !s)}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        style={{
                            marginTop: "8px",
                            padding: "14px",
                            borderRadius: "14px",
                            border: "none",
                            cursor: loading ? "not-allowed" : "pointer",
                            color: "#fff",
                            fontWeight: 800,
                            fontSize: "15px",
                            fontFamily: "inherit",
                            transition: "all 0.2s",
                            background: loading
                                ? "rgba(16,185,129,0.5)"
                                : "linear-gradient(135deg,#10b981,#059669)",
                            boxShadow: loading
                                ? "none"
                                : "0 4px 14px rgba(16,185,129,0.3)",
                        }}
                    >
                        {loading ? "Please wait..." : "Sign In →"}
                    </button>
                </form>

                {/* <div
                    style={{
                        marginTop: "32px",
                        padding: "14px",
                        background: "rgba(255,255,255,0.03)",
                        borderRadius: "12px",
                        border: "1px solid rgba(255,255,255,0.06)",
                    }}
                >
                    <p
                        style={{
                            fontSize: "11px",
                            color: "rgba(255,255,255,0.3)",
                            margin: 0,
                            textAlign: "center",
                            fontWeight: 500,
                        }}
                    >
                        👤 Admin? Use{" "}
                        <span style={{ color: "rgba(34,211,238,0.7)" }}>
                            admin@campus.com
                        </span>{" "}
                        /{" "}
                        <span style={{ color: "rgba(34,211,238,0.7)" }}>
                            admin123
                        </span>
                    </p>
                </div> */}
            </div>
        </div>
    );
};

export default Login;
