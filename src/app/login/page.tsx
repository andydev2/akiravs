"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLanguage } from "../../context/LanguageContext";
import Image from "next/image";

export default function Login() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const { t } = useLanguage();

  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push(callbackUrl);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al registrarse');
      }

      setMode('verify');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Código inválido');
      }

      // Verificación exitosa, hacer login automáticamente
      const loginRes = await signIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (loginRes?.error) {
        setError(loginRes.error);
        setLoading(false);
      } else {
        router.push(callbackUrl);
      }

    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '85vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '2rem',
      background: 'radial-gradient(circle at 50% -20%, rgba(62, 213, 204, 0.15), transparent 60%)'
    }}>
      <div style={{ 
        background: 'var(--card-bg)', 
        padding: '3rem', 
        borderRadius: '24px', 
        border: '1px solid var(--border)', 
        width: '100%', 
        maxWidth: '420px', 
        boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
        animation: 'fadeInUp 0.4s ease'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', color: 'white', boxShadow: '0 8px 20px rgba(62, 213, 204, 0.4)' }}>
            🔒
          </div>
        </div>

        <h1 style={{ fontSize: '1.8rem', marginBottom: '0.5rem', color: 'var(--text-main)', textAlign: 'center', fontWeight: 800 }}>
          {mode === 'verify' ? 'Verifica tu Correo' : 'Bienvenido'}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', textAlign: 'center', fontSize: '0.95rem' }}>
          {mode === 'verify' 
            ? `Ingresa el código enviado a ${email}` 
            : mode === 'login' ? 'Inicia sesión para continuar' : 'Crea una cuenta para continuar'}
        </p>
        
        {error && (
          <div style={{ background: '#fee2e2', color: '#ef4444', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid #fca5a5' }}>
            {error}
          </div>
        )}

        <form onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          
          {(mode === 'login' || mode === 'register') && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Correo Electrónico</label>
                <input 
                  type="email" 
                  aria-label="Correo Electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com" 
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--search-bg)', color: 'var(--text-main)', transition: 'border 0.2s', outline: 'none' }} 
                  required 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem' }}>Contraseña</label>
                <input 
                  type="password" 
                  aria-label="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--search-bg)', color: 'var(--text-main)', transition: 'border 0.2s', outline: 'none' }} 
                  required 
                />
              </div>
            </>
          )}

          {mode === 'verify' && (
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-main)', fontSize: '0.9rem', textAlign: 'center' }}>Código de 6 dígitos</label>
              <input 
                type="text" 
                aria-label="Código de verificación"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000000" 
                style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--primary)', background: 'var(--search-bg)', color: 'var(--primary)', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '5px', fontWeight: 'bold', transition: 'border 0.2s', outline: 'none' }} 
                required 
              />
            </div>
          )}
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              marginTop: '0.5rem',
              background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
              color: 'var(--background)',
              padding: '1rem',
              borderRadius: '12px',
              border: 'none',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: loading ? 'wait' : 'pointer',
              boxShadow: '0 4px 15px rgba(62, 213, 204, 0.3)',
              transition: 'transform 0.2s',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Procesando...' : mode === 'login' ? 'Iniciar Sesión' : mode === 'register' ? 'Registrarse' : 'Verificar y Entrar'}
          </button>
        </form>

        {(mode === 'login' || mode === 'register') && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            {mode === 'login' ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button 
              onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }} 
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
            >
              {mode === 'login' ? 'Regístrate aquí' : 'Inicia Sesión'}
            </button>
          </div>
        )}

        {mode === 'verify' && (
          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
            <button 
              onClick={() => { setMode('register'); setError(''); }} 
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
            >
              Volver al registro
            </button>
          </div>
        )}

        <div style={{ margin: '2rem 0', display: 'flex', alignItems: 'center', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
          <span style={{ padding: '0 10px', fontSize: '0.85rem' }}>o ingresar por</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }}></div>
        </div>

        <button 
          onClick={() => signIn('google', { callbackUrl })}
          style={{ 
            width: '100%', 
            padding: '0.85rem',
            background: 'var(--search-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-main)',
            cursor: 'pointer',
            transition: 'background 0.2s'
          }}
        >
          <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" style={{ width: '22px', height: 'auto' }} width={22} height={22} />
          Google
        </button>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
