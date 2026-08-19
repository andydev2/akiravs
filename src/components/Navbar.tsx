"use client";

import Link from "next/link";
import Image from "next/image";
import { Search, ShoppingCart, Menu, X, Globe, Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { allProducts } from "../data/products";
import ProductCard from "./ProductCard";
import { useSession, signIn } from "next-auth/react";
import { useTheme } from "next-themes";

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const { cart, setIsCartOpen } = useCart();
  const { language, toggleLanguage, t } = useLanguage();

  useEffect(() => {
    if (isCatalogModalOpen && catalogProducts.length === 0) {
      fetch('/api/products')
        .then(res => res.json())
        .then(result => {
          if (result.success) {
            setCatalogProducts(result.data);
          }
        })
        .catch(err => console.error("Error fetching catalog for navbar:", err));
    }
  }, [isCatalogModalOpen]);

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isCatalogModalOpen || isMobileMenuOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isCatalogModalOpen, isMobileMenuOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState({}, '', `/?q=${encodeURIComponent(searchQuery.trim())}`);
      window.dispatchEvent(new Event('searchChanged'));
      setIsMobileMenuOpen(false);
      setIsMobileSearchOpen(false);
    } else {
      window.history.pushState({}, '', `/`);
      window.dispatchEvent(new Event('searchChanged'));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    window.history.pushState(null, '', `?q=${e.target.value}`);
    window.dispatchEvent(new Event('searchChanged'));
  };

  return (
    <>
      <header style={{
        position: 'sticky',
        top: isScrolled ? '1rem' : '0',
        width: isScrolled ? 'calc(100% - 2rem)' : '100%',
        maxWidth: '1200px',
        margin: '0 auto',
        borderRadius: isScrolled ? '100px' : '0',
        padding: '1rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: isScrolled ? 'var(--navbar-bg)' : 'transparent',
        backdropFilter: isScrolled ? 'blur(20px)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(20px)' : 'none',
        boxShadow: isScrolled ? '0 10px 40px rgba(0,0,0,0.08)' : 'none',
        border: isScrolled ? '1px solid var(--border-glass)' : '1px solid transparent',
        zIndex: 50,
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <Image 
            src="/logo.jpg" 
            alt="akiravs Logo" 
            style={{ borderRadius: '8px' }} 
            width={40} height={40}
            priority
          />
          <span style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
            akiravs
          </span>
        </Link>

        {/* Search Bar (Desktop) */}
        <form onSubmit={handleSearch} className="desktop-search" style={{
          display: 'none',
          flex: 1,
          maxWidth: '500px',
          margin: '0 2rem',
          position: 'relative'
        }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} aria-hidden="true" />
          <label htmlFor="desktop-search" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>{t('nav.search')}</label>
          <input 
            id="desktop-search"
            type="text" 
            placeholder={t('nav.search')}
            aria-label={t('nav.search')}
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              width: '100%',
              padding: '0.8rem 1.2rem 0.8rem 3.2rem',
              borderRadius: '100px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--search-bg)',
              color: 'var(--text-main)',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all 0.3s ease',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--primary)';
              e.target.style.boxShadow = '0 0 0 4px rgba(6, 182, 212, 0.1)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.02)';
            }}
          />
        </form>

        {/* Links (Desktop) */}
        <div className="desktop-links" style={{ display: 'none', alignItems: 'center', gap: '2rem' }}>
          {mounted && (
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 0 }}
              aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
          <button 
            onClick={toggleLanguage}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', transition: 'color 0.2s', padding: 0 }}
            aria-label="Cambiar idioma"
          >
            <Globe size={18} aria-hidden="true" /> {language}
          </button>
          <button 
            onClick={() => setIsCatalogModalOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', fontWeight: 600, fontSize: '0.95rem', transition: 'color 0.2s', display: 'flex', alignItems: 'center', padding: 0 }}
          >
            {t('nav.catalog')}
          </button>
          <Link href="/#sobre-mi" style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>{t('nav.about')}</Link>
          <Link href="/support" style={{ color: 'var(--text-main)', fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>{t('nav.support')}</Link>
          
          {/* Auth Button */}
          {session ? (
            <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <Image 
                src={session.user?.image || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} 
                alt="Profile" 
                style={{ width: '32px', height: '32px', borderRadius: '50%', border: '2px solid var(--primary)' }}
                width={32} height={32}
              />
            </Link>
          ) : (
            <button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))}
              style={{ background: 'var(--primary)', color: 'var(--background)', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '100px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.background = 'var(--primary-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'var(--primary)'; }}
            >
              {t('nav.login')}
            </button>
          )}

          {/* Cart Toggle Button */}
          <button 
            onClick={() => setIsCartOpen(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--text-muted)', padding: 0 }}
            aria-label="Carrito"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span style={{
                position: 'absolute', top: '-8px', right: '-8px',
                background: 'var(--primary)', color: '#1C5F5C',
                fontSize: '0.7rem', fontWeight: 'bold',
                width: '18px', height: '18px',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                {totalItems}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Toggle Button */}
        <div className="mobile-toggle" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: isMobileSearchOpen ? 1 : 'none', justifyContent: 'flex-end', marginLeft: isMobileSearchOpen ? '1rem' : 0 }}>
          
          {isMobileSearchOpen ? (
            <form className="search-animate" onSubmit={handleSearch} style={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative' }}>
              <label htmlFor="mobile-search" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>{t('nav.search')}</label>
              <Search size={18} color="#94a3b8" style={{ position: 'absolute', left: '1rem' }} aria-hidden="true" />
              <input 
                id="mobile-search"
                type="text" 
                placeholder={t('nav.search')}
                aria-label={t('nav.search')}
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  width: '100%', padding: '0.6rem 2.5rem 0.6rem 2.5rem',
                  borderRadius: '20px', border: '1px solid var(--border)',
                  backgroundColor: 'var(--search-bg)', fontSize: '1rem', outline: 'none',
                }}
                autoFocus
              />
              <button type="button" onClick={() => setIsMobileSearchOpen(false)} style={{ position: 'absolute', right: '0.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', display: 'flex' }} aria-label="Cerrar búsqueda">
                <X size={20} />
              </button>
            </form>
          ) : (
            <>
              {/* Mobile Language Toggle (Solo icono) */}
              <button 
                onClick={toggleLanguage}
                style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                aria-label="Cambiar Idioma"
              >
                <Globe size={22} />
              </button>

              {/* Mobile Search Toggle */}
              <button 
                onClick={() => { setIsMobileSearchOpen(true); setIsMobileMenuOpen(false); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}
                aria-label="Buscar"
              >
                <Search size={22} />
              </button>

              {/* Cart Toggle */}
              <button 
                onClick={() => setIsCartOpen(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}
                aria-label="Carrito"
              >
                <ShoppingCart size={22} />
                {totalItems > 0 && (
                  <span style={{
                    position: 'absolute', top: '-8px', right: '-8px',
                    background: 'var(--primary)', color: 'var(--background)',
                    fontSize: '0.7rem', fontWeight: 'bold',
                    width: '20px', height: '20px',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '2px solid var(--card-bg)'
                  }}>
                    {totalItems}
                  </span>
                )}
              </button>

              {/* Hamburger Menu */}
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)', display: 'flex' }}
                aria-label="Menú"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </>
          )}
        </div>
      </header>

      <style>{`
        @keyframes expandSearchSmooth {
          from { 
            opacity: 0; 
            transform: translateX(15px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(0); 
          }
        }
        .search-animate {
          animation: expandSearchSmooth 0.3s ease-out forwards;
        }
        @media (max-width: 768px) {
          .desktop-only-text { display: none !important; }
        }
        @media (max-width: 1023px) {
          .mobile-theme-toggle { display: flex !important; }
        }
        @media (min-width: 1024px) {
          .mobile-theme-toggle { display: none !important; }
        }
      `}</style>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'var(--background)', zIndex: 100, // Covers everything, opaque
          display: 'flex', flexDirection: 'column',
          animation: 'fadeInDown 0.3s ease',
          overflowY: 'auto'
        }}>
          {/* Menu Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 5%', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Image src="/logo.jpg" alt="Logo" style={{ borderRadius: '8px' }} width={40} height={40} />
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                akiravs
              </span>
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex' }}
              aria-label="Cerrar menú"
            >
              <X size={28} />
            </button>
          </div>

          <div style={{ padding: '2rem 5%', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', fontSize: '1.2rem', fontWeight: 600 }}>
              <button onClick={() => { setIsCatalogModalOpen(true); setIsMobileMenuOpen(false); }} style={{ textAlign: 'left', background: 'none', border: 'none', fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-muted)', cursor: 'pointer' }}>{t('nav.catalog')}</button>
              <Link href="/#sobre-mi" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('nav.about')}</Link>
              <Link href="/support" onClick={() => setIsMobileMenuOpen(false)} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>{t('nav.support')}</Link>
              <hr style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0' }} />
              
              {session ? (
                <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-main)', textDecoration: 'none' }}>
                  <Image 
                    src={session.user?.image || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} 
                    alt="Profile" 
                    style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--primary)' }}
                    width={40} height={40}
                  />
                  <span>{t('nav.dashboard')}</span>
                </Link>
              ) : (
                <button 
                  onClick={() => window.dispatchEvent(new CustomEvent('open-auth-modal'))}
                  style={{ textAlign: 'left', background: 'var(--primary)', color: '#1C5F5C', border: 'none', padding: '1rem', borderRadius: '12px', fontSize: '1.2rem', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center' }}
                >
                  {t('nav.login')}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Catalog Modal */}
      {isCatalogModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'var(--background)',
          zIndex: 100,
          display: 'flex', flexDirection: 'column',
          animation: 'fadeIn 0.3s ease',
          height: '100dvh', // Asegura que no exceda la pantalla en móviles
          boxSizing: 'border-box'
        }}>
          {/* Header fijo */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2rem 5%', flexShrink: 0 }}>
            <h2 style={{ color: 'var(--text-main)', fontSize: '2rem', fontWeight: 900, margin: 0 }}>{t('nav.catalog')}</h2>
            <button 
              onClick={() => setIsCatalogModalOpen(false)}
              style={{ background: 'var(--card-glass)', color: 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
              aria-label="Cerrar catálogo"
            >
              <X size={24} />
            </button>
          </div>
          
          {/* Área escroleable */}
          <div className="hide-scrollbar" style={{ overflowY: 'auto', flex: 1, padding: '1rem 5% 4rem 5%', WebkitOverflowScrolling: 'touch' }}>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
              gap: '2rem',
              maxWidth: '1200px',
              margin: '0 auto'
            }}>
              {catalogProducts.map((product: any) => (
                <ProductCard key={product.id || product._id} product={product} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
