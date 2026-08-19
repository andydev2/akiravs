"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Star, MessageSquare } from 'lucide-react';

type Review = {
  _id: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export default function ReviewSection() {
  const { t } = useLanguage();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('/api/reviews');
        const json = await res.json();
        if (json.success) {
          setReviews(json.data);
        }
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    };
    fetchReviews();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), rating, comment: comment.trim() }),
      });
      const json = await res.json();
      
      if (json.success) {
        setReviews([json.data, ...reviews]);
        setName('');
        setComment('');
        setRating(5);
        setIsFormOpen(false);
      }
    } catch (err) {
      console.error('Error posting review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Duplicamos las reviews para el efecto de carrusel infinito
  const infiniteReviews = reviews.length > 0 ? [...reviews, ...reviews, ...reviews] : [];

  return (
    <section style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem', padding: '0 5%' }}>
        <h2 style={{ fontSize: '2rem', color: 'var(--text-main)', fontWeight: 900 }}>
          {t('review.title')}
        </h2>
        <button 
          onClick={() => setIsFormOpen(true)}
          style={{ 
            background: 'var(--primary)', color: 'var(--background)', border: 'none', 
            padding: '0.8rem 1.5rem', borderRadius: '100px', fontWeight: 700, 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)', transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.background = 'var(--primary-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'; e.currentTarget.style.background = 'var(--primary)'; }}
        >
          <MessageSquare size={18} /> {t('review.leave')}
        </button>
      </div>

      {isFormOpen && (
        <div style={{ padding: '0 5%' }}>
          <form onSubmit={handleSubmit} style={{ 
            background: 'var(--card-bg)', padding: '2rem', borderRadius: '24px', 
            boxShadow: '0 10px 40px rgba(0,0,0,0.05)', marginBottom: '3rem',
            border: '1px solid #f1f5f9', animation: 'fadeInDown 0.3s ease',
            maxWidth: '1000px', margin: '0 auto 3rem auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.4rem', color: 'var(--text-main)' }}>{t('review.leave')}</h3>
              <button type="button" onClick={() => setIsFormOpen(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  size={28} 
                  fill={star <= rating ? '#FFB800' : 'none'} 
                  color={star <= rating ? '#FFB800' : '#cbd5e1'}
                  style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                  onClick={() => setRating(star)}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                />
              ))}
            </div>

            <input 
              type="text" 
              placeholder={t('review.name')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1rem', outline: 'none', fontSize: '1rem' }}
              required
            />
            
            <textarea 
              placeholder={t('review.comment')}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1.5rem', outline: 'none', fontSize: '1rem', minHeight: '100px', resize: 'none' }}
              required
            />

            <button type="submit" style={{ 
              width: '100%', background: 'var(--primary)', color: 'var(--background)', border: 'none', 
              padding: '1.2rem', borderRadius: '100px', fontWeight: 700, cursor: 'pointer', fontSize: '1.1rem',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.1)'; e.currentTarget.style.background = 'var(--primary-hover)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = 'var(--primary)'; }}
            >
              {t('review.submit')}
            </button>
          </form>
        </div>
      )}

      {/* Carrusel Infinito de Opiniones */}
      <div style={{ 
        position: 'relative', overflow: 'hidden', width: '100%', padding: '1rem 0',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)'
      }}>
        {reviews.length > 0 ? (
          <>
            <div 
              className="marquee-track"
              style={{ 
                display: 'flex', 
                gap: '1.5rem',
                width: 'max-content',
              }}
            >
              {infiniteReviews.map((review, idx) => (
                <div key={`${review._id}-${idx}`} style={{ 
                  width: '320px', 
                  flexShrink: 0,
                }}>
                  <div style={{ 
                    background: 'var(--card-glass)', 
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    padding: '2rem', 
                    borderRadius: '24px', 
                    boxShadow: '0 4px 20px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.2)', 
                    border: '1px solid var(--border-glass)',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: 800 }}>{review.name}</h4>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} size={14} fill={i < review.rating ? '#FFB800' : 'none'} color={i < review.rating ? '#FFB800' : '#e2e8f0'} />
                        ))}
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, margin: 0, fontSize: '1rem', fontStyle: 'italic' }}>
                      "{review.comment}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ width: '100%', textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            {t('review.empty')}
          </div>
        )}
      </div>

      <style>{`
        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.3333%); } /* Se mueve 1/3 porque la lista está triplicada */
        }
        .marquee-track {
          animation: scrollMarquee 30s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
