"use client";

import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { X, Trash2, ShoppingCart } from "lucide-react";
import { useState, useEffect } from "react";
import CheckoutModal from "./CheckoutModal";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function CartDrawer() {
  const { cart, removeFromCart, isCartOpen, setIsCartOpen, cartTotal } = useCart();
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isCartOpen) {
      const count = parseInt(document.body.dataset.modalCount || '0') + 1;
      document.body.dataset.modalCount = count.toString();
      document.body.style.setProperty('overflow', 'hidden', 'important');
      document.documentElement.style.setProperty('overflow', 'hidden', 'important');

      return () => {
        const newCount = Math.max(0, parseInt(document.body.dataset.modalCount || '0') - 1);
        document.body.dataset.modalCount = newCount.toString();
        if (newCount === 0) {
          document.body.style.overflow = '';
          document.documentElement.style.overflow = '';
        }
      };
    }
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    if (cart.length === 0) return;
    if (!session) {
      window.dispatchEvent(new CustomEvent('open-auth-modal'));
      setIsCartOpen(false);
      return;
    }
    setIsCheckoutOpen(true);
  };

  const processPayment = async (paymentId: string, paymentGateway: 'paypal' | 'transfer', receiptBase64?: string) => {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, paymentId, paymentGateway, receiptBase64 }),
    });
    
    const data = await response.json();
    
    if (data.success) {
      cart.forEach(item => removeFromCart(item.id));
      // Wait a moment so the user sees the success animation before redirecting
      setTimeout(() => {
        setIsCheckoutOpen(false);
        setIsCartOpen(false);
        window.location.href = '/dashboard';
      }, 2000);
    } else {
      throw new Error(data.error || "Hubo un error al procesar la orden");
    }
  };

  return (
    <>
      {/* Overlay Background */}
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          zIndex: 99,
          animation: 'fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0,
        width: '100%', maxWidth: '440px',
        backgroundColor: 'var(--card-glass)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        zIndex: 100,
        boxShadow: '-10px 0 50px rgba(0,0,0,0.1)',
        display: 'flex', flexDirection: 'column',
        animation: 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        borderLeft: '1px solid var(--border-glass)'
      }}>
        
        {/* Header */}
        <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <ShoppingCart /> {t('cart.title')}
          </h2>
          <button 
            style={{ background: 'var(--search-bg)', border: 'none', cursor: 'pointer', padding: '0.5rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setIsCartOpen(false)}
            aria-label="Cerrar carrito"
          >
            <X size={28} color="var(--text-muted)" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="hide-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
              <ShoppingCart size={64} opacity={0.2} style={{ margin: '0 auto 1rem auto' }} />
              <p style={{ fontSize: '1.1rem', fontWeight: 500 }}>{t('cart.empty')}</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', padding: '1.2rem', backgroundColor: 'var(--card-bg)', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: item.color, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.5rem' }}>
                  {item.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {language === 'EN' && item.nameEn ? item.nameEn : item.name}
                  </h4>
                  <div style={{ color: 'var(--primary)', fontWeight: 600 }}>${item.price.toFixed(2)} <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 400 }}>x {item.quantity}</span></div>
                </div>
                <button 
                  style={{ background: 'var(--search-bg)', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '0.8rem', borderRadius: '50%', transition: 'all 0.2s' }}
                  onClick={() => removeFromCart(item.id)}
                  title="Eliminar"
                  aria-label="Eliminar del carrito"
                  onMouseEnter={(e) => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#ef4444'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--search-bg)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cart.length > 0 && (
          <div style={{ padding: '2rem', borderTop: '1px solid var(--border-glass)', backgroundColor: 'transparent' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '1.4rem', fontWeight: 800 }}>
              <span style={{ color: 'var(--text-main)' }}>{t('cart.subtotal')}</span>
              <span style={{ color: 'var(--primary)' }}>${cartTotal.toFixed(2)}</span>
            </div>
            
            <button 
              onClick={handleCheckoutClick}
              disabled={loading}
              style={{ 
                width: '100%', padding: '1.2rem', 
                backgroundColor: 'var(--primary)', color: 'var(--background)', 
                border: 'none', borderRadius: '100px', 
                fontWeight: 700, fontSize: '1.2rem', cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.8rem',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.background = 'var(--primary-hover)'; } }}
              onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'; e.currentTarget.style.background = 'var(--primary)'; } }}
            >
              {t('cart.checkout.finalize')}
            </button>
          </div>
        )}
      </div>

      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartTotal={cartTotal}
        onConfirmPayment={processPayment}
      />

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
