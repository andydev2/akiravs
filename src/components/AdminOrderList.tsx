"use client";

import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import Image from 'next/image';

export default function AdminOrderList() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Modal states
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; id: string; action: 'approve' | 'reject' | null; category?: string }>({ isOpen: false, id: '', action: null });
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; title: string; message: string; type: 'success' | 'error' }>({ isOpen: false, title: '', message: '', type: 'success' });
  
  // Streaming credentials state
  const [manualCreds, setManualCreds] = useState({ email: '', password: '', profile: '', pin: '' });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/orders');
      const result = await res.json();
      if (result.success) {
        setOrders(result.data);
      } else {
        setError('Error al cargar órdenes');
      }
    } catch (err) {
      setError('Error de red');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleActionClick = (id: string, action: 'approve' | 'reject', category?: string) => {
    setManualCreds({ email: '', password: '', profile: '', pin: '' });
    setConfirmModal({ isOpen: true, id, action, category });
  };

  const executeAction = async () => {
    const { id, action, category } = confirmModal;
    if (!id || !action) return;
    
    const payload: any = { action };
    
    if (action === 'approve' && (category === 'streaming' || category === 'music')) {
      if (!manualCreds.email || !manualCreds.password) {
        setAlertModal({ isOpen: true, title: 'Datos Incompletos', message: 'Debes rellenar el correo y la contraseña de la cuenta.', type: 'error' });
        return;
      }
      payload.email = manualCreds.email;
      payload.password = manualCreds.password;
      payload.profile = manualCreds.profile;
      payload.pin = manualCreds.pin;
    }
    
    setConfirmModal({ isOpen: false, id: '', action: null });
    setProcessingId(id);
    
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (result.success) {
        setAlertModal({ isOpen: true, title: '¡Éxito!', message: action === 'approve' ? 'La orden fue aprobada correctamente.' : 'La orden fue rechazada y eliminada.', type: 'success' });
        fetchOrders();
      } else {
        setAlertModal({ isOpen: true, title: 'Error', message: result.error || 'Hubo un error al procesar la orden', type: 'error' });
      }
    } catch (err) {
      setAlertModal({ isOpen: true, title: 'Error de Red', message: 'No se pudo conectar con el servidor', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading) return <div style={{ marginTop: '2rem', textAlign: 'center' }}>{t('admin.orders.loading')}</div>;
  if (error) return <div style={{ marginTop: '2rem', color: 'red', textAlign: 'center' }}>{error}</div>;

  return (
    <div style={{ background: 'var(--card-bg)', padding: 'clamp(1rem, 3vw, 2rem)', borderRadius: '12px', border: '1px solid var(--border)', marginTop: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.5rem', color: 'var(--text-main)' }}>{t('admin.orders.title')} ({orders.length})</h3>
        <button onClick={fetchOrders} className="btn" style={{ padding: '0.5rem 1rem', background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}>
          ↻ {t('admin.orders.refresh')}
        </button>
      </div>

      {orders.length === 0 ? (
        <p style={{ color: 'var(--text-muted)' }}>{t('admin.orders.empty')}</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {orders.map((order) => (
            <div key={order._id} style={{ padding: '1.5rem', background: 'var(--search-bg)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ flex: '1 1 300px' }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)', fontSize: '1.2rem' }}>{order.productName}</h4>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{t('admin.orders.buyer')} <strong>{order.userEmail}</strong></div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{t('admin.orders.price')} <strong>${order.price}</strong></div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.2rem' }}>{t('admin.orders.date')} {new Date(order.createdAt).toLocaleString()}</div>
                <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.05)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{t('admin.orders.reserved')}</div>
                  <div style={{ color: 'var(--text-main)', fontWeight: 'bold' }}>{order.accountUsername} : {order.accountPassword}</div>
                </div>
              </div>

              <div style={{ flex: '1 1 200px', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold' }}>{t('admin.orders.receipt')}</div>
                {order.receiptBase64 ? (
                  <Image 
                    src={order.receiptBase64} 
                    alt="Comprobante" 
                    style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', border: '2px solid var(--border)', objectFit: 'contain', background: '#000' }} 
                    width={400} height={200}
                  />
                ) : (
                  <div style={{ color: '#ef4444' }}>{t('admin.orders.no_receipt')}</div>
                )}
                
                <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                  <button 
                    onClick={() => handleActionClick(order._id, 'reject', order.productCategory)}
                    disabled={processingId === order._id}
                    style={{ flex: 1, padding: '0.75rem', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {t('admin.orders.reject')}
                  </button>
                  <button 
                    onClick={() => handleActionClick(order._id, 'approve', order.productCategory)}
                    disabled={processingId === order._id}
                    style={{ flex: 1, padding: '0.75rem', background: '#dcfce7', color: '#16a34a', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {processingId === order._id ? t('admin.orders.processing') : t('admin.orders.approve')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Confirm Modal */}
      {confirmModal.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '400px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}>
            <div style={{ 
              width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem auto',
              background: confirmModal.action === 'approve' ? '#dcfce7' : '#fee2e2',
              color: confirmModal.action === 'approve' ? '#16a34a' : '#ef4444'
            }}>
              {confirmModal.action === 'approve' ? '✅' : '⚠️'}
            </div>
            <h3 style={{ margin: '0 0 1rem 0', color: 'var(--text-main)' }}>
              {confirmModal.action === 'approve' ? t('admin.orders.approve_title') : t('admin.orders.reject_title')}
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {confirmModal.action === 'approve' 
                ? t('admin.orders.approve_desc')
                : t('admin.orders.reject_desc')}
            </p>
            
            {confirmModal.action === 'approve' && (confirmModal.category === 'streaming' || confirmModal.category === 'music') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem', textAlign: 'left' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{t('admin.orders.email')}</label>
                <input type="email" value={manualCreds.email} onChange={(e) => setManualCreds({...manualCreds, email: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--search-bg)', color: 'var(--text-main)' }} placeholder="ejemplo@gmail.com" />
                
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{t('admin.orders.password')}</label>
                <input type="text" value={manualCreds.password} onChange={(e) => setManualCreds({...manualCreds, password: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--search-bg)', color: 'var(--text-main)' }} placeholder="contraseña123" />
                
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{t('admin.orders.profile')}</label>
                <input type="text" value={manualCreds.profile} onChange={(e) => setManualCreds({...manualCreds, profile: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--search-bg)', color: 'var(--text-main)' }} placeholder="Ej: 2" />
                
                <label style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{t('admin.orders.pin')}</label>
                <input type="text" value={manualCreds.pin} onChange={(e) => setManualCreds({...manualCreds, pin: e.target.value})} style={{ padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--search-bg)', color: 'var(--text-main)' }} placeholder="Ej: 4567" />
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button 
                onClick={() => setConfirmModal({ isOpen: false, id: '', action: null })}
                style={{ padding: '0.75rem 1.5rem', background: '#f1f5f9', color: '#334155', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, flex: 1 }}
              >
                Cancelar
              </button>
              <button 
                onClick={executeAction}
                style={{ 
                  padding: '0.75rem 1.5rem', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, flex: 1,
                  background: confirmModal.action === 'approve' ? 'var(--primary)' : '#ef4444',
                  color: confirmModal.action === 'approve' ? '#1C5F5C' : 'white'
                }}
              >
                {confirmModal.action === 'approve' ? 'Sí, Aprobar' : 'Sí, Rechazar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert Modal */}
      {alertModal.isOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ background: 'var(--card-bg)', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {alertModal.type === 'success' ? '🎉' : '❌'}
            </div>
            <h3 style={{ fontSize: '1.4rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>{alertModal.title}</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{alertModal.message}</p>
            <button 
              onClick={() => setAlertModal({ ...alertModal, isOpen: false })}
              style={{ width: '100%', padding: '0.75rem', background: 'var(--primary)', color: '#1C5F5C', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
