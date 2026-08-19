"use client";

import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type Product = {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
  price: number;
  icon: string;
  color: string;
  stock?: number;
  details?: string[];
  detailsEn?: string[];
  images?: string[];
  requiresIdVerification?: boolean;
  category?: string;
};

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const { t, language } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (isModalOpen) {
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
  }, [isModalOpen]);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que abra el modal
    if (!session) {
      window.dispatchEvent(new CustomEvent('open-auth-modal'));
      return;
    }
    addToCart(product);
  };

  const handleSupportClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!session) {
      window.dispatchEvent(new CustomEvent('open-auth-modal'));
      return;
    }
    window.dispatchEvent(new CustomEvent('open-chat', { detail: { id: product.id, name: product.name } }));
  };

  const isOnDemand = product.category === 'streaming' || product.category === 'music';
  const hasStock = isOnDemand ? true : (product.stock !== undefined ? product.stock > 0 : true);
  const isRecharge = product.category === 'recharges' || product.category === 'free_fire';

  return (
    <>
      <div 
        style={{
          background: 'var(--card-glass)',
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          borderRadius: '24px',
          padding: '2rem',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255,255,255,0.4)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          border: '1px solid var(--border-glass)',
          position: 'relative',
          overflow: 'hidden',
          opacity: hasStock ? 1 : 0.6,
        }}
        onMouseEnter={(e) => {
          if (!hasStock) return;
          e.currentTarget.style.transform = 'translateY(-8px)';
          e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.08)';
          e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
        }}
        onMouseLeave={(e) => {
          if (!hasStock) return;
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 24px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255,255,255,0.4)';
          e.currentTarget.style.borderColor = 'var(--border-glass)';
        }}
      >


        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '16px', 
              background: product.color, color: 'white', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontWeight: 800, fontSize: '1.8rem',
              boxShadow: `0 8px 20px ${product.color}40`
            }}>
              {product.icon}
            </div>
            <div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                {language === 'EN' && product.nameEn ? product.nameEn : product.name}
              </h3>
              <div style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem' }}>
                ${product.price.toFixed(2)} {(product.category !== 'recharges' && product.category !== 'free_fire') && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{t('product.month')}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Stock Indicator */}
        <div style={{ zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', fontWeight: 600, color: hasStock ? '#16a34a' : '#dc2626', background: hasStock ? '#dcfce7' : '#fee2e2', padding: '0.3rem 0.6rem', borderRadius: '20px', width: 'fit-content' }}>
          {isRecharge ? (
            hasStock ? `🟢 ${t('product.recharge.available')}` : `🔴 ${t('product.stock.none')}`
          ) : isOnDemand ? (
            `🟢 ${t('product.stock.ondemand')}`
          ) : (
            hasStock ? `🟢 ${product.stock} ${t('product.stock.available')}` : `🔴 ${t('product.stock.out')}`
          )}
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.6, zIndex: 1, flex: 1 }}>
          {language === 'EN' && product.descriptionEn ? product.descriptionEn : product.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', zIndex: 1, marginTop: 'auto' }}>
          <button 
            disabled={!hasStock}
            style={{ 
              background: 'var(--search-bg)', 
              color: hasStock ? 'var(--text-main)' : 'var(--text-muted)', 
              border: '1px solid var(--border)', 
              padding: '0.8rem', 
              borderRadius: '100px', 
              fontWeight: 700, 
              cursor: hasStock ? 'pointer' : 'not-allowed',
              fontSize: '0.95rem',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}
            onClick={(e) => { 
              e.stopPropagation(); 
              if (hasStock) setIsModalOpen(true); 
            }}
            onMouseEnter={(e) => { if (hasStock) { e.currentTarget.style.background = 'var(--card-bg)'; e.currentTarget.style.borderColor = 'var(--primary)'; } }}
            onMouseLeave={(e) => { if (hasStock) { e.currentTarget.style.background = 'var(--search-bg)'; e.currentTarget.style.borderColor = 'var(--border)'; } }}
          >
            {t('product.details')}
          </button>
          
          <button 
            disabled={!hasStock && !isRecharge}
            style={{ 
              background: (hasStock || isRecharge) ? 'var(--primary)' : 'var(--border)', 
              color: (hasStock || isRecharge) ? 'var(--background)' : 'var(--text-muted)', border: 'none', padding: '1rem', borderRadius: '100px', 
              fontWeight: 700, 
              cursor: (hasStock || isRecharge) ? 'pointer' : 'not-allowed',
              fontSize: '1.05rem',
              boxShadow: (hasStock || isRecharge) ? '0 4px 15px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
            onClick={isRecharge ? handleSupportClick : handleAddToCart}
            onMouseEnter={(e) => { if (hasStock || isRecharge) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'var(--primary-hover)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)'; } }}
            onMouseLeave={(e) => { if (hasStock || isRecharge) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'; } }}
          >
            {isRecharge ? (hasStock ? t('product.recharge.request') : t('product.stock.none')) : (hasStock ? t('cart.add') : t('product.stock.none'))}
          </button>
        </div>
      </div>

      {/* Modal de Detalles */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, 
          padding: '2rem'
        }} onClick={() => { setIsModalOpen(false); setCurrentImage(0); }}>
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: '24px',
            width: '100%', maxWidth: '600px',
            position: 'relative',
            animation: 'fadeInUp 0.3s ease',
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            maxHeight: '90vh',
            boxShadow: '0 25px 50px rgba(0,0,0,0.2)'
          }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => { setIsModalOpen(false); setCurrentImage(0); }}
              style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', cursor: 'pointer', color: 'white', zIndex: 10 }}
              aria-label="Cerrar modal"
            >
              ✕
            </button>

            {/* Carousel Header */}
            {product.images && product.images.length > 0 ? (
              <div style={{ position: 'relative', width: '100%', height: '250px', backgroundColor: '#000', flexShrink: 0 }}>
                <img 
                  src={product.images[currentImage]} 
                  alt={`${product.name} screenshot ${currentImage + 1}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  width={800} height={450}
                />
                {product.images.length > 1 && (
                  <>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCurrentImage(prev => prev === 0 ? product.images!.length - 1 : prev - 1); }}
                      style={{ position: 'absolute', top: '50%', left: '10px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}
                      aria-label="Imagen anterior"
                    >
                      ❮
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setCurrentImage(prev => prev === product.images!.length - 1 ? 0 : prev + 1); }}
                      style={{ position: 'absolute', top: '50%', right: '10px', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}
                      aria-label="Imagen siguiente"
                    >
                      ❯
                    </button>
                    <div style={{ position: 'absolute', bottom: '10px', left: '0', right: '0', display: 'flex', justifyContent: 'center', gap: '6px' }}>
                      {product.images.map((_: string, idx: number) => (
                        <div key={idx} style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: idx === currentImage ? 'white' : 'rgba(255,255,255,0.4)', transition: 'background-color 0.2s' }} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div style={{ padding: '2.5rem 2.5rem 0 2.5rem', display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', flexShrink: 0 }}>
                <div style={{ 
                  width: '64px', height: '64px', borderRadius: '16px', 
                  background: product.color, color: 'white', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontWeight: 800, fontSize: '2rem',
                  boxShadow: `0 8px 20px ${product.color}40`
                }}>
                  {product.icon}
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.8rem', color: 'var(--text-main)', fontWeight: 800 }}>
                    {language === 'EN' && product.nameEn ? product.nameEn : product.name}
                  </h2>
                </div>
              </div>
            )}

            <div className="hide-scrollbar" style={{ padding: product.images ? '1.5rem 2.5rem 2.5rem 2.5rem' : '0 2.5rem 2.5rem 2.5rem', overflowY: 'auto', flex: 1 }}>
              {product.images && (
                 <h2 style={{ margin: '0 0 1rem 0', fontSize: '1.8rem', color: 'var(--text-main)', fontWeight: 800 }}>
                   {language === 'EN' && product.nameEn ? product.nameEn : product.name}
                 </h2>
              )}
              
              <div style={{ color: 'var(--primary)', fontWeight: 800, fontSize: '1.6rem', marginBottom: '1.5rem' }}>
                ${product.price.toFixed(2)}
              </div>

              <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '2rem', lineHeight: 1.6 }}>
                {language === 'EN' && product.descriptionEn ? product.descriptionEn : product.description}
              </p>

              {product.details && product.details.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '1rem' }}>{t('modal.includes')}</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {(language === 'EN' && product.detailsEn ? product.detailsEn : product.details).map((detail, idx) => (
                      <li key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', color: 'var(--text-muted)' }}>
                        <span style={{ color: 'var(--secondary)' }}>✓</span>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button 
                disabled={!hasStock && !isRecharge}
                style={{ 
                  background: (hasStock || isRecharge) ? 'var(--primary)' : 'var(--border)', 
                  color: (hasStock || isRecharge) ? 'var(--background)' : 'var(--text-muted)', border: 'none', padding: '1.2rem', borderRadius: '100px', 
                  fontWeight: 700, cursor: (hasStock || isRecharge) ? 'pointer' : 'not-allowed', fontSize: '1.1rem', width: '100%',
                  boxShadow: (hasStock || isRecharge) ? '0 4px 15px rgba(0,0,0,0.1)' : 'none',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
                onMouseEnter={(e) => { if (hasStock || isRecharge) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'var(--primary-hover)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)'; } }}
                onMouseLeave={(e) => { if (hasStock || isRecharge) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'; } }}
                onClick={(e) => { 
                  if (isRecharge) {
                    handleSupportClick(e);
                    setIsModalOpen(false);
                  } else if (hasStock) {
                    handleAddToCart(e); 
                    setIsModalOpen(false); 
                    setCurrentImage(0); 
                  }
                }}
              >
                {isRecharge ? (hasStock ? t('product.recharge.request') : t('product.stock.none')) : (hasStock ? t('cart.add') : t('product.stock.none'))}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
