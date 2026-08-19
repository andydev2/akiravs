"use client";

import { useState, useEffect, useMemo } from 'react';
import ProductCard from '../components/ProductCard';
import ReviewSection from '../components/ReviewSection';
import { useLanguage } from '../context/LanguageContext';
import { Product as ProductType } from '../data/products';
import { ArrowRight, ShieldCheck, Zap, HeadphonesIcon, Award, Play, Monitor, Bot, Gamepad2, ShoppingBag } from 'lucide-react';

const categories = [
  { id: 'all', labelKey: 'cat.all', icon: <ShoppingBag size={20} /> },
  { id: 'streaming', labelKey: 'cat.streaming', icon: <Monitor size={20} /> },
  { id: 'ai', labelKey: 'cat.ai', icon: <Bot size={20} /> },
  { id: 'music', labelKey: 'cat.music', icon: <Play size={20} /> },
  { id: 'games', labelKey: 'cat.games', icon: <Gamepad2 size={20} /> },
];

export default function Home() {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [allProducts, setAllProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, activeCategory]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const json = await res.json();
        if (json.success) {
          setAllProducts(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleSearch = () => {
      const params = new URLSearchParams(window.location.search);
      setSearchQuery(params.get('q')?.toLowerCase() || '');
    };

    window.addEventListener('searchChanged', handleSearch);
    handleSearch();

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('searchChanged', handleSearch);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const filtered = allProducts.filter(p => {
      const matchesSearch = searchQuery === '' || 
                            p.name.toLowerCase().includes(searchQuery) || 
                            p.description.toLowerCase().includes(searchQuery);
      const matchesCategory = activeCategory === 'all' || p.category.toLowerCase() === activeCategory;
      return matchesSearch && matchesCategory;
    });

    return filtered.sort((a, b) => {
      const isOnDemandA = ['streaming', 'music', 'recharges', 'free_fire'].includes(a.category);
      const isOnDemandB = ['streaming', 'music', 'recharges', 'free_fire'].includes(b.category);
      
      const hasStockA = isOnDemandA ? true : (a.stock || 0) > 0;
      const hasStockB = isOnDemandB ? true : (b.stock || 0) > 0;
      
      if (hasStockA && !hasStockB) return -1;
      if (!hasStockA && hasStockB) return 1;
      return 0;
    });
  }, [searchQuery, activeCategory, allProducts]);

  return (
    <main style={{ position: 'relative', overflowX: 'hidden' }}>
      
      {/* --- CLEAN STATIC BACKGROUND --- */}
      <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: -1,
        pointerEvents: 'none',
        background: 'linear-gradient(180deg, var(--background) 0%, var(--bg-bottom) 100%)',
      }}>
      </div>

      <div style={{ padding: '2rem 5%', maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <style>{`
          /* Asymmetric Premium Bento Grid */
          .bento-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            grid-auto-rows: 240px;
            gap: 1.5rem;
            margin-bottom: 4rem;
          }
          
          .bento-card {
            background: var(--card-glass);
            backdrop-filter: blur(40px);
            -webkit-backdrop-filter: blur(40px);
            border-radius: 32px;
            padding: 2.5rem;
            border: 1px solid var(--border-glass);
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            overflow: hidden;
            position: relative;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255,255,255,0.4);
            display: flex;
            flex-direction: column;
          }
          
          .bento-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
            border-color: rgba(0,0,0,0.1);
          }

          /* Grid cell placements */
          .hero-cell { 
            grid-column: span 2; 
            grid-row: span 2; 
            justify-content: flex-end; 
            background: var(--card-gradient);
          }
          .f1-wide { 
            grid-column: span 2; 
            grid-row: span 1; 
            flex-direction: row; 
            align-items: center; 
            gap: 2rem;
          }
          .f2-square { grid-column: span 1; grid-row: span 1; justify-content: space-between; }
          .f3-square { grid-column: span 1; grid-row: span 1; justify-content: space-between; }
          .about-wide { 
            grid-column: span 3; 
            grid-row: span 1; 
            flex-direction: row; 
            align-items: center; 
            gap: 3rem;
            background: var(--card-bg);
          }
          .f4-tall { 
            grid-column: span 1; 
            grid-row: span 2; 
            background: var(--primary); 
            color: var(--background); 
            justify-content: space-between;
          }
          .cta-wide { 
            grid-column: span 3; 
            grid-row: span 1; 
            background: var(--primary); 
            color: var(--background); 
            flex-direction: row; 
            align-items: center; 
            justify-content: space-between;
            cursor: pointer;
          }
          .cta-wide:hover { background: var(--primary-hover); transform: scale(0.99) }

          /* Typography */
          .hero-title {
            font-size: clamp(2.5rem, 4vw, 4rem);
            font-weight: 900;
            line-height: 1.05;
            letter-spacing: -0.05em;
            color: var(--text-main);
            margin-bottom: 1rem;
          }
          .hero-desc {
            font-size: 1.15rem;
            color: var(--text-muted);
            line-height: 1.5;
            font-weight: 500;
          }
          
          .icon-wrap {
            width: 64px; height: 64px;
            background: var(--background);
            border-radius: 20px;
            display: flex; align-items: center; justify-content: center;
            color: var(--primary); flex-shrink: 0;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
          }
          
          /* Layout Ordering */
          .home-layout { display: flex; flex-direction: column; }
          .bento-section { order: 1; }
          .catalog-section { order: 2; }

          /* Responsive */
          @media (max-width: 1024px) {
            .bento-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: minmax(200px, auto); }
            .hero-cell { grid-column: span 2; grid-row: span 1; justify-content: center; }
            .f1-wide { grid-column: span 2; }
            .about-wide { grid-column: span 2; flex-direction: column; text-align: center; gap: 1rem; }
            .f4-tall { grid-column: span 2; grid-row: span 1; flex-direction: row; align-items: center; }
            .cta-wide { grid-column: span 2; }
          }
          
          @media (max-width: 600px) {
            .bento-grid { grid-template-columns: 1fr; gap: 1rem; grid-auto-rows: auto; }
            .bento-card { padding: 2rem; border-radius: 24px; }
            .hero-cell, .f1-wide, .f2-square, .f3-square, .about-wide, .f4-tall, .cta-wide { 
              grid-column: span 1; grid-row: auto; 
            }
            .f1-wide, .f4-tall { flex-direction: column; text-align: center; gap: 1.5rem; }
            .icon-wrap { width: 56px; height: 56px; margin: 0 auto; }
            .cta-wide { display: none !important; }
            
            .bento-section { order: 2; margin-top: 2rem; }
            .catalog-section { order: 1; margin-bottom: 2rem; }
          }
          .no-scrollbar::-webkit-scrollbar { display: none; }
          .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

        <div className="home-layout">
          {/* --- ASYMMETRIC BENTO GRID --- */}
          <section className="bento-section">
            <div className="bento-grid">
              
              {/* 1. Hero Cell (Huge Square) */}
              <div className="bento-card hero-cell">
                <div style={{ position: 'absolute', top: '-20%', right: '-20%', width: '400px', height: '400px', background: 'radial-gradient(circle, var(--accent) 0%, transparent 60%)', opacity: 0.15, filter: 'blur(60px)', zIndex: 0 }}></div>
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <h1 className="hero-title">{t('hero.title')}</h1>
                  <p className="hero-desc">{t('hero.desc')}</p>
                </div>
              </div>

              {/* 2. Feature 1 (Wide Top Right) */}
              <div className="bento-card f1-wide">
                <div className="icon-wrap">
                  <Award size={32} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>{t('why.exp.title')}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: 1.5, fontWeight: 500 }}>{t('why.exp.desc')}</p>
                </div>
              </div>

              {/* 3. Feature 2 (Small Square) */}
              <div className="bento-card f2-square">
                <div className="icon-wrap" style={{ background: 'var(--search-bg)', color: 'var(--text-main)', boxShadow: 'none' }}>
                  <Zap size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{t('why.delivery.title')}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.4 }}>{t('why.delivery.desc')}</p>
                </div>
              </div>

              {/* 4. Feature 3 (Small Square) */}
              <div className="bento-card f3-square">
                <div className="icon-wrap" style={{ background: 'var(--search-bg)', color: 'var(--text-main)', boxShadow: 'none' }}>
                  <ShieldCheck size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>{t('why.warranty.title')}</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.4 }}>{t('why.warranty.desc')}</p>
                </div>
              </div>

              {/* 5. About Me (Wide Middle) */}
              <div className="bento-card about-wide" id="sobre-mi">
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'inline-block', padding: '0.5rem 1.2rem', background: 'var(--primary)', color: 'var(--background)', borderRadius: '100px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem', marginBottom: '1.5rem' }}>
                    {t('about.subtitle')}
                  </div>
                  <h2 style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.04em', lineHeight: 1.1 }}>{t('about.title')}</h2>
                </div>
                <div style={{ flex: 1.5 }}>
                  <p style={{ color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '0.8rem', fontWeight: 500 }}>
                    {t('about.desc1')}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                    {t('about.desc2')}
                  </p>
                </div>
              </div>

              {/* 6. Feature 4 (Tall Right) */}
              <div className="bento-card f4-tall">
                <div className="icon-wrap" style={{ background: 'var(--border-glass)', color: 'var(--background)', boxShadow: 'none', width: '80px', height: '80px' }}>
                  <HeadphonesIcon size={40} />
                </div>
                <div>
                  <h2 style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--background)', marginBottom: '0.8rem', letterSpacing: '-0.03em', lineHeight: 1.1 }}>{t('why.support.title')}</h2>
                  <p style={{ color: 'var(--background)', opacity: 0.8, fontSize: '1.05rem', lineHeight: 1.5, fontWeight: 500 }}>{t('why.support.desc')}</p>
                </div>
              </div>

              {/* 7. CTA (Wide Bottom) */}
              <div 
                className="bento-card cta-wide" 
                onClick={() => {
                  const el = document.getElementById('catalog');
                  if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
              >
                <div>
                  <h2 style={{ margin: '0 0 0.5rem 0', fontSize: 'clamp(2rem, 3vw, 2.5rem)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
                    {t('nav.catalog')}
                  </h2>
                  <p style={{ fontSize: '1.1rem', fontWeight: 500, opacity: 0.8, margin: 0 }}>
                    Explora nuestros productos y ahorra hoy mismo.
                  </p>
                </div>
                <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)' }}>
                  <ArrowRight size={32} color="var(--background)" />
                </div>
              </div>

            </div>
          </section>

          {/* --- CATALOG SECTION --- */}
          <section id="catalog" className="catalog-section" style={{ paddingTop: '2rem' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '3rem', gap: '2rem' }}>
              <h2 style={{ fontSize: 'clamp(3rem, 6vw, 4.5rem)', fontWeight: 900, letterSpacing: '-0.05em', color: 'var(--text-main)', margin: 0, lineHeight: 1 }}>
                {t('nav.catalog')}
              </h2>
              
              {/* Category Pills */}
              <div className="no-scrollbar" style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', paddingBottom: '0.5rem', maxWidth: '100%' }}>
                {categories.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  return (
                    <button 
                      key={cat.id} 
                      onClick={() => setActiveCategory(cat.id)}
                      style={{
                        background: isActive ? 'var(--primary)' : 'var(--search-bg)',
                        color: isActive ? 'var(--background)' : 'var(--text-muted)',
                        border: '1px solid',
                        borderColor: isActive ? 'var(--primary)' : 'transparent',
                        padding: '0.8rem 1.75rem',
                        borderRadius: '100px',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        boxShadow: isActive ? '0 8px 20px rgba(0,0,0,0.1)' : 'inset 0 2px 4px rgba(0,0,0,0.02)'
                      }}
                      onMouseEnter={(e) => {
                        if(!isActive) {
                          e.currentTarget.style.background = 'var(--card-bg)';
                          e.currentTarget.style.borderColor = 'var(--border)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if(!isActive) {
                          e.currentTarget.style.background = 'var(--search-bg)';
                          e.currentTarget.style.borderColor = 'transparent';
                        }
                      }}
                    >
                      {cat.icon}
                      <span>{t(cat.labelKey)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Product Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '2.5rem'
            }}>
              {loading ? (
                <div style={{ gridColumn: '1 / -1', padding: '5rem', display: 'flex', justifyContent: 'center' }}>
                  <div style={{ width: '50px', height: '50px', border: '5px solid rgba(255,255,255,0.5)', borderTop: '5px solid var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                </div>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.slice(0, visibleCount).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))
              ) : (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', color: 'var(--text-main)', fontSize: '1.2rem', background: 'var(--card-glass)', borderRadius: '32px', fontWeight: 600 }}>
                  {t('empty.search')}
                </div>
              )}
            </div>

            {filteredProducts.length > visibleCount && (
              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4rem' }}>
                <button 
                  onClick={() => setVisibleCount(filteredProducts.length)}
                  style={{ 
                    padding: '1.2rem 3.5rem', 
                    borderRadius: '100px', 
                    fontSize: '1.1rem',
                    fontWeight: 700,
                    background: 'var(--search-bg)',
                    color: 'var(--text-main)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: 'none'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--primary)';
                    e.currentTarget.style.color = 'var(--background)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--search-bg)';
                    e.currentTarget.style.color = 'var(--text-main)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {t('catalog.load_more')}
                </button>
              </div>
            )}
          </section>
        </div>

        {/* --- REVIEWS SECTION --- */}
        <section style={{ marginTop: '6rem', marginBottom: '4rem' }}>
          <ReviewSection />
        </section>
        
      </div>
    </main>
  );
}
