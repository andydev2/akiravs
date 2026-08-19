"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer style={{
      backgroundColor: 'var(--background)',
      color: 'var(--text-main)',
      padding: '5rem 5% 2rem 5%',
      marginTop: 'auto',
      borderTop: '1px solid var(--border)'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '3rem',
        marginBottom: '3rem'
      }}>
        {/* Brand Col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <img src="/logo.jpg" alt="akiravs Logo" style={{ height: '40px', width: 'auto', borderRadius: '8px' }} width={40} height={40} />
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.5px' }}>
              akiravs
            </div>
          </Link>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, fontSize: '0.95rem' }}>
            {t('footer.desc')}
          </p>
        </div>

        {/* Links Col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{t('footer.links')}</h4>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', fontWeight: 500 }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.transform = 'translateX(4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.transform = 'translateX(0)'; }}>{t('nav.catalog')}</Link>
          <Link href="/support" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', fontWeight: 500 }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.transform = 'translateX(4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.transform = 'translateX(0)'; }}>{t('nav.support')}</Link>
        </div>

        {/* Legal Col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{t('footer.legal')}</h4>
          <Link href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', fontWeight: 500 }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.transform = 'translateX(4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.transform = 'translateX(0)'; }}>{t('footer.terms')}</Link>
          <Link href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', fontWeight: 500 }} onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.transform = 'translateX(4px)'; }} onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.transform = 'translateX(0)'; }}>{t('footer.privacy')}</Link>
        </div>

        {/* Payment Methods */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h4 style={{ color: 'var(--text-main)', fontWeight: 800, fontSize: '1.2rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>{t('footer.payment_methods')}</h4>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ background: 'var(--search-bg)', padding: '0.8rem', borderRadius: '12px', display: 'flex', alignItems: 'center' }}>
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" style={{ height: '18px' }} width={70} height={18} />
            </div>
            <div style={{ background: 'var(--search-bg)', padding: '0.8rem 1rem', borderRadius: '12px', display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#F3BA2F' }}>Binance Pay</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        maxWidth: '1200px', margin: '0 auto', 
        paddingTop: '2rem', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div>&copy; {new Date().getFullYear()} akiravs. Creado por Diego. {t('footer.rights')}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {t('footer.developed')} <a href="https://akira-itzt.vercel.app/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 700, transition: 'opacity 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.opacity = '0.8'} onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}>AKIRA</a>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          {/* Social Icons */}
          <a href="https://wa.me/593990730162" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s', display: 'flex' }} onMouseEnter={(e) => e.currentTarget.style.color = '#25D366'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'} aria-label="WhatsApp">
            <MessageCircle size={24} />
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s', display: 'flex' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E1306C'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'} aria-label="Instagram">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
          <a href="#" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-muted)', transition: 'color 0.2s', display: 'flex' }} onMouseEnter={(e) => e.currentTarget.style.color = '#1877F2'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'} aria-label="Facebook">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
