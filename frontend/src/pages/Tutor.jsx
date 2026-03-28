import React, { useState, useEffect, useRef } from 'react';
import api from '../api';
import { Send, Trash2, Bot, User, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Tutor = () => {
    const [messages, setMessages] = useState(() => {
        // Optional: restore chat history from localStorage
        const saved = localStorage.getItem('cc_tutor_chat');
        if (saved) return JSON.parse(saved);
        return [{ role: 'assistant', content: 'Hello! I am your AI Study Assistant. What academic topic can I help you understand today?' }];
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Auto-scroll to bottom of chat
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
        // Save chat history automatically
        localStorage.setItem('cc_tutor_chat', JSON.stringify(messages));
    }, [messages]);

    const handleClear = () => {
        setMessages([{ role: 'assistant', content: 'Chat cleared. How can I help you next?' }]);
        localStorage.removeItem('cc_tutor_chat');
    };

    const handleSend = async () => {
        const text = input.trim();
        if (!text) return;

        // Append user message to UI
        const newMsg = { role: 'user', content: text };
        const updatedMsgs = [...messages, newMsg];
        setMessages(updatedMsgs);
        setInput('');
        setLoading(true);

        try {
            // Strip out the initial greeting if we want to save tokens, but standard OpenAI format just takes the entire history
            // We pass the conversation context to OpenAI for seamless memory
            const res = await api.post('/chat', {
                messages: updatedMsgs.map(m => ({ role: m.role, content: m.content }))
            });

            // The completion API returns an array of choices
            const aiResponse = res.data.choices?.[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
            
            setMessages((prev) => [...prev, { role: 'assistant', content: aiResponse }]);
        } catch (err) {
            console.error('Chat Error:', err);
            toast.error(err.response?.data?.error || "Failed to reach the AI. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={{ animation:'pageUp 0.3s ease both', display:'flex', flexDirection:'column', height:'calc(100vh - 40px)', background:'var(--bg-primary)', borderRadius:'24px', border:'1px solid var(--border-color)', overflow:'hidden' }}>
            
            {/* Chat Header */}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 24px', background:'var(--bg-secondary)', borderBottom:'1px solid var(--border-color)', zIndex:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                    <div style={{ width:40, height:40, borderRadius:'12px', background:'linear-gradient(135deg, #06b6d4, #0284c7)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(6,182,212,0.3)' }}>
                        <Bot size={20} color="#fff" />
                    </div>
                    <div>
                        <h2 style={{ fontSize:'18px', fontWeight:900, color:'var(--text-primary)', margin:0, letterSpacing:'-0.02em' }}>AI Study Assistant</h2>
                        <p style={{ color:'var(--text-secondary)', fontSize:'12px', margin:'2px 0 0', display:'flex', alignItems:'center', gap:'6px' }}>
                            <span style={{ width:8, height:8, borderRadius:'50%', background:'#10b981', display:'inline-block' }} /> 
                            Online & Ready
                        </p>
                    </div>
                </div>
                <button onClick={handleClear} style={{ display:'flex', alignItems:'center', gap:'8px', padding:'8px 14px', borderRadius:'10px', background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.2)', fontSize:'12px', fontWeight:700, cursor:'pointer', transition:'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.2)'} onMouseLeave={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}>
                    <Trash2 size={14} /> Clear Chat
                </button>
            </div>

            {/* Chat Messages Area */}
            <div style={{ flex:1, overflowY:'auto', padding:'24px', display:'flex', flexDirection:'column', gap:'20px' }}>
                {messages.map((msg, idx) => {
                    const isAi = msg.role === 'assistant';
                    return (
                        <div key={idx} style={{ display:'flex', flexDirection: isAi ? 'row' : 'row-reverse', alignItems:'flex-end', gap:'12px', animation:'pageUp 0.3s ease both' }}>
                            
                            {/* Avatar */}
                            <div style={{ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background: isAi ? 'rgba(6,182,212,0.15)' : 'rgba(16,185,129,0.15)', color: isAi ? '#06b6d4' : '#10b981' }}>
                                {isAi ? <Bot size={16} /> : <User size={16} />}
                            </div>

                            {/* Message Bubble */}
                            <div style={{ 
                                maxWidth:'75%', padding:'14px 18px', fontSize:'14px', lineHeight:1.6, 
                                color: isAi ? 'var(--text-primary)' : '#fff',
                                background: isAi ? 'var(--bg-secondary)' : 'linear-gradient(135deg, #06b6d4, #0284c7)',
                                border: isAi ? '1px solid var(--border-color)' : 'none',
                                borderRadius: isAi ? '20px 20px 20px 4px' : '20px 20px 4px 20px',
                                boxShadow: isAi ? '0 2px 8px rgba(0,0,0,0.03)' : '0 4px 12px rgba(6,182,212,0.25)' 
                            }}>
                                {/* Extremely simple markdown/newline support renderer */}
                                {msg.content.split('\n').map((line, i) => (
                                    <React.Fragment key={i}>
                                        {line}
                                        {i !== msg.content.split('\n').length - 1 && <br />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    );
                })}

                {loading && (
                    <div style={{ display:'flex', alignItems:'flex-end', gap:'12px', animation:'pageUp 0.3s ease both' }}>
                        <div style={{ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, background:'rgba(6,182,212,0.15)', color:'#06b6d4' }}>
                            <Bot size={16} />
                        </div>
                        <div style={{ padding:'14px 18px', background:'var(--bg-secondary)', border:'1px solid var(--border-color)', borderRadius:'20px 20px 20px 4px', display:'flex', alignItems:'center', gap:'8px' }}>
                            <Loader2 size={16} color="#06b6d4" className="animate-spin" style={{ animation: 'spin 1.5s linear infinite' }} />
                            <span style={{ fontSize:'13px', color:'var(--text-secondary)', fontWeight:600 }}>Analyzing...</span>
                        </div>
                    </div>
                )}
                
                {/* Dummy div to scroll into view */}
                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input Bar */}
            <div style={{ padding:'20px 24px', background:'var(--bg-secondary)', borderTop:'1px solid var(--border-color)', display:'flex', gap:'12px', alignItems:'center' }}>
                <textarea 
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={loading}
                    placeholder="Ask a question about your courses... (Press Enter to Send)"
                    rows={1}
                    style={{ flex:1, resize:'none', background:'var(--bg-primary)', border:'1px solid var(--border-color)', borderRadius:'14px', padding:'14px 18px', fontSize:'14px', color:'var(--text-primary)', outline:'none', fontFamily:'inherit', lineHeight:1.5, maxHeight:'120px' }}
                    onFocus={e => { e.currentTarget.style.border='1px solid #06b6d4'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(6,182,212,0.15)'; }}
                    onBlur={e => { e.currentTarget.style.border='1px solid var(--border-color)'; e.currentTarget.style.boxShadow='none'; }}
                />
                
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() || loading}
                    style={{ width:48, height:48, borderRadius:'14px', display:'flex', alignItems:'center', justifyContent:'center', border:'none', cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer', background: (!input.trim() || loading) ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #06b6d4, #0284c7)', color: (!input.trim() || loading) ? 'var(--text-muted)' : '#fff', transition:'all 0.2s', boxShadow: (!input.trim() || loading) ? 'none' : '0 4px 14px rgba(6,182,212,0.3)' }}
                >
                    <Send size={18} style={{ transform: input.trim() ? 'scale(1.1) translateX(2px)' : 'none', transition:'all 0.2s' }} />
                </button>
            </div>
            
            <style>{`
                @keyframes spin { 100% { transform:rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default Tutor;
