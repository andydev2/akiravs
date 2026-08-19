"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";

export default function AuthModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    const handleClose = () => setIsOpen(false);

    window.addEventListener('open-auth-modal', handleOpen);
    window.addEventListener('close-auth-modal', handleClose);

    return () => {
      window.removeEventListener('open-auth-modal', handleOpen);
      window.removeEventListener('close-auth-modal', handleClose);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div style={{ 
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem',
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{ 
        background: 'var(--card-bg)', padding: '3rem 2rem', borderRadius: '24px', 
        border: '1px solid var(--border)', width: '100%', maxWidth: '380px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.2)', position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center'
      }}>
        <button onClick={() => setIsOpen(false)} style={{
          position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none',
          fontSize: '1.5rem', color: 'var(--text-muted)', cursor: 'pointer'
        }} aria-label="Cerrar modal">×</button>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: 'var(--background)', boxShadow: '0 8px 20px rgba(62, 213, 204, 0.4)' }}>
            🔒
          </div>
        </div>

        <h1 style={{ fontSize: '1.6rem', marginBottom: '0.5rem', color: 'var(--text-main)', textAlign: 'center', fontWeight: 800 }}>
          Iniciar Sesión
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
          Para comprar o contactar al soporte, necesitas una cuenta.
        </p>

        <button 
          onClick={() => signIn('google', { callbackUrl: '/' })} 
          style={{ 
            width: '100%', padding: '1rem', background: 'var(--search-bg)', 
            border: '1px solid var(--border)', borderRadius: '14px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', 
            fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)', 
            cursor: 'pointer', transition: 'all 0.2s ease',
            boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.borderColor = 'var(--border)';
          }}
        >
          <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '24px', height: 'auto' }} width={24} height={24} />
          Continuar con Google
        </button>
      </div>
    </div>
  );
}
