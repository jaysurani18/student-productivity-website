import React from 'react';
import { AlertTriangle, LogOut } from 'lucide-react';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, confirmText }) => {
  if (!isOpen) return null;

  return (
    <div 
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ 
        position: 'fixed', 
        inset: 0, 
        zIndex: 100, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '20px', 
        background: 'rgba(0,0,0,0.65)', 
        backdropFilter: 'blur(8px)',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        style={{ 
          background: '#1a1a2e', 
          border: '1px solid rgba(255,255,255,0.1)', 
          width: '100%', 
          maxWidth: '400px', 
          borderRadius: '24px', 
          padding: '32px', 
          animation: 'modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
          textAlign: 'center'
        }}
      >
        <div style={{ 
          width: '56px', 
          height: '56px', 
          borderRadius: '16px', 
          background: 'rgba(239, 68, 68, 0.15)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 20px',
          color: '#ef4444'
        }}>
          <LogOut size={28} />
        </div>
        
        <h3 style={{ 
          fontWeight: 900, 
          fontSize: '22px', 
          color: '#fff', 
          margin: '0 0 12px', 
          letterSpacing: '-0.02em' 
        }}>
          {title || "Confirm Action"}
        </h3>
        
        <p style={{ 
          color: 'rgba(255,255,255,0.6)', 
          fontSize: '14px', 
          margin: '0 0 28px',
          lineHeight: '1.5'
        }}>
          {message || "Are you sure you want to proceed?"}
        </p>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={onClose} 
            style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '12px', 
              border: '1px solid rgba(255,255,255,0.1)', 
              background: 'transparent', 
              color: 'rgba(255,255,255,0.7)', 
              fontWeight: 700, 
              fontSize: '14px', 
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            Cancel
          </button>
          
          <button 
            onClick={onConfirm} 
            style={{ 
              flex: 1, 
              padding: '12px', 
              borderRadius: '12px', 
              border: 'none', 
              color: '#fff', 
              fontWeight: 700, 
              fontSize: '14px', 
              cursor: 'pointer', 
              background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
              boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            {confirmText || "Yes, Confirm"}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalPop { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
};

export default ConfirmationModal;
