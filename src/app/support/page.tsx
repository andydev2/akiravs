"use client";

import { useLanguage } from '../../context/LanguageContext';
import { Mail, MessageCircle, HelpCircle } from 'lucide-react';

export default function SupportPage() {
  const { t } = useLanguage();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)', padding: '4rem 5%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '4rem', maxWidth: '800px' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '1rem', letterSpacing: '-1px' }}>
          {t('nav.support')}
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          {t('support.subtitle')}
        </p>
      </div>

      {/* Cards de Contacto */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', width: '100%', maxWidth: '800px', marginBottom: '4rem', marginLeft: 'auto', marginRight: 'auto' }}>
        
        {/* WhatsApp Soporte */}
        <div style={{ 
          backgroundColor: 'var(--card-bg)', borderRadius: '24px', padding: '2rem', 
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)', textAlign: 'center',
          transition: 'transform 0.3s ease', height: '100%'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ width: '60px', height: '60px', backgroundColor: '#25D366', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'white' }}>
            <MessageCircle size={32} aria-hidden="true" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>{t('nav.support')}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {t('support.whatsapp.desc')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <a href="https://wa.me/593998386973" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{ 
                backgroundColor: '#1B9A4A', color: 'white', border: 'none', padding: '0.8rem 1.5rem', 
                borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', width: '100%'
              }}>
                +593 99 838 6973
              </button>
            </a>
            <a href="https://wa.me/573183453036" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <button style={{ 
                backgroundColor: '#1B9A4A', color: 'white', border: 'none', padding: '0.8rem 1.5rem', 
                borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', width: '100%'
              }}>
                +57 318 345 3036
              </button>
            </a>
          </div>
        </div>

        {/* Correo Soporte */}
        <div style={{ 
          backgroundColor: 'var(--card-bg)', borderRadius: '24px', padding: '2rem', 
          boxShadow: '0 10px 40px rgba(0,0,0,0.05)', textAlign: 'center',
          transition: 'transform 0.3s ease', height: '100%'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ width: '60px', height: '60px', backgroundColor: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'white' }}>
            <Mail size={32} aria-hidden="true" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-main)' }}>{t('nav.support')}</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {t('support.email.desc')}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <a href="mailto:andyz1238@gmail.com" style={{ textDecoration: 'none' }}>
              <button style={{ 
                backgroundColor: 'var(--primary)', color: 'var(--background)', border: 'none', padding: '0.8rem 1.5rem', 
                borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', width: '100%'
              }}>
                andyz1238@gmail.com
              </button>
            </a>
            <a href="mailto:y@uam.lol" style={{ textDecoration: 'none' }}>
              <button style={{ 
                backgroundColor: 'var(--primary)', color: 'var(--background)', border: 'none', padding: '0.8rem 1.5rem', 
                borderRadius: '12px', fontWeight: 700, fontSize: '1rem', cursor: 'pointer', width: '100%'
              }}>
                y@uam.lol
              </button>
            </a>
          </div>
        </div>

      </div>

      {/* Preguntas Frecuentes (FAQ) */}
      <div style={{ width: '100%', maxWidth: '800px' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '2rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HelpCircle color="var(--primary)" aria-hidden="true" /> {t('support.faq.title')}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            {
              q: t('support.faq.1.q'),
              a: t('support.faq.1.a')
            },
            {
              q: t('support.faq.2.q'),
              a: t('support.faq.2.a')
            },
            {
              q: t('support.faq.3.q'),
              a: t('support.faq.3.a')
            }
          ].map((faq, index) => (
            <div key={index} style={{ 
              backgroundColor: 'var(--card-bg)', 
              padding: '1.5rem', 
              borderRadius: '16px', 
              border: '1px solid var(--border)',
              transition: 'transform 0.2s',
              cursor: 'default'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(5px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{faq.q}</h3>
              <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
