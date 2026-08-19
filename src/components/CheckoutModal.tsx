import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { X, CreditCard, Mail, Lock, ShieldCheck, CheckCircle, Landmark, Upload } from 'lucide-react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';

type CheckoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  cartTotal: number;
  onConfirmPayment: (paymentId: string, gateway: 'paypal' | 'transfer', receiptBase64?: string) => Promise<void>;
};


export default function CheckoutModal({ isOpen, onClose, cartTotal, onConfirmPayment }: CheckoutModalProps) {
  const { t, language } = useLanguage();
  const { cart } = useCart();
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [paymentMethod, setPaymentMethod] = useState<'transfer' | 'paypal'>('transfer');
  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Transfer state
  const [transferCountry, setTransferCountry] = useState('Binance Pay');
  const [receiptBase64, setReceiptBase64] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // IMPORTANTE: Aquí debes poner tus datos reales de Binance Pay para que los usuarios puedan transferirte.
  const bankDetails: Record<string, any> = {
    'Binance Pay': { 
      Plataforma: 'Binance Pay', 
      'Pay ID': 'TU_PAY_ID_AQUI', 
      Correo: 'tu_correo_de_binance@gmail.com' 
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Por favor sube una imagen válida');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let MAX_WIDTH = 800;
        let scaleSize = 1;
        if (img.width > MAX_WIDTH) {
          scaleSize = MAX_WIDTH / img.width;
        } else {
          MAX_WIDTH = img.width;
        }
        canvas.width = MAX_WIDTH;
        canvas.height = img.height * scaleSize;
        
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const base64 = canvas.toDataURL('image/jpeg', 0.6);
        setReceiptBase64(base64);
        setErrorMsg(null);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  const handlePaymentSuccess = async (paymentId: string, gateway: 'paypal' | 'transfer') => {
    setStep('processing');
    setErrorMsg(null);
    try {
      await onConfirmPayment(paymentId, gateway, receiptBase64);
      setStep('success');
    } catch (err: any) {
      setStep('form');
      setErrorMsg(err.message || t('checkout.error'));
    }
  };

  const handlePaymentError = (errMessage: string) => {
    setErrorMsg(errMessage);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="hide-scrollbar" style={{
        background: 'var(--card-bg)',
        width: '100%', maxWidth: '450px',
        maxHeight: '90vh',
        overflowY: 'auto',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
      }}>
        {/* Header */}
        <div style={{ padding: '1.5rem 1.5rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={20} color="var(--primary)" />
            <h3 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 700 }}>{t('checkout.title')}</h3>
          </div>
          {step === 'form' && (
            <button onClick={() => { setErrorMsg(null); onClose(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} aria-label="Cerrar checkout">
              <X size={24} />
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: '1.5rem' }}>
          {step === 'form' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ textAlign: 'center', margin: '0.5rem 0 1rem 0' }}>
                <p style={{ color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>{t('checkout.total')}</p>
                <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)' }}>${cartTotal.toFixed(2)}</div>
              </div>

              {errorMsg && (
                <div style={{ 
                  backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                  border: '1px solid rgba(239, 68, 68, 0.3)', 
                  color: '#ef4444', 
                  padding: '1rem', 
                  borderRadius: '12px', 
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.5rem',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <svg style={{ flexShrink: 0, marginTop: '2px' }} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  <div style={{ flex: 1, lineHeight: '1.4' }}>{errorMsg}</div>
                  <button onClick={() => setErrorMsg(null)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, opacity: 0.7 }} aria-label="Cerrar error">
                    <X size={16} />
                  </button>
                </div>
              )}

              <div>
                <label htmlFor="checkout-email" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>{t('checkout.email')}</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                  <input 
                    id="checkout-email"
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrorMsg(null); }}
                    placeholder={t('checkout.email.placeholder')}
                    style={{ width: '100%', padding: '0.8rem 1rem 0.8rem 2.5rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--search-bg)', color: 'var(--text-main)', fontSize: '1rem' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>{t('checkout.method')}</label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('transfer')}
                    style={{ 
                      flex: 1, padding: '1rem', borderRadius: '12px', 
                      border: `2px solid ${paymentMethod === 'transfer' ? '#F3BA2F' : 'var(--border)'}`, 
                      background: paymentMethod === 'transfer' ? 'rgba(243, 186, 47, 0.05)' : 'var(--search-bg)',
                      color: paymentMethod === 'transfer' ? '#F3BA2F' : 'var(--text-muted)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Landmark size={24} />
                    Binance Pay
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPaymentMethod('paypal')}
                    style={{ 
                      flex: 1, padding: '1rem', borderRadius: '12px', 
                      border: `2px solid ${paymentMethod === 'paypal' ? '#3b82f6' : 'var(--border)'}`, 
                      background: paymentMethod === 'paypal' ? 'rgba(59, 130, 246, 0.05)' : 'var(--search-bg)',
                      color: paymentMethod === 'paypal' ? '#3b82f6' : 'var(--text-muted)',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <CreditCard size={24} />
                    PayPal
                  </button>
                </div>
              </div>

              {paymentMethod === 'transfer' && (
                <div style={{ marginTop: '0.5rem', animation: 'fadeIn 0.3s ease' }}>
                  <label htmlFor="country-select" style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Selecciona tu Método</label>
                  <select 
                    id="country-select"
                    value={transferCountry}
                    onChange={(e) => setTransferCountry(e.target.value)}
                    style={{ width: '100%', padding: '0.8rem 1rem', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--search-bg)', color: 'var(--text-main)', fontSize: '1rem', marginBottom: '1rem' }}
                  >
                    {Object.keys(bankDetails).map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>

                  <div style={{ padding: '1rem', background: 'var(--search-bg)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '1rem', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                    <div style={{ fontWeight: 800, marginBottom: '0.5rem', color: 'var(--primary)' }}>Datos Bancarios - {transferCountry}</div>
                    {Object.entries(bankDetails[transferCountry]).map(([key, value]) => (
                      <div key={key} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{key}:</span>
                        <span style={{ fontWeight: 600 }}>{value as React.ReactNode}</span>
                      </div>
                    ))}
                  </div>

                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 600 }}>Subir Comprobante</label>
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    style={{ 
                      width: '100%', padding: '2rem', border: '2px dashed var(--border)', borderRadius: '12px', 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: receiptBase64 ? '#10b981' : 'var(--text-muted)',
                      background: receiptBase64 ? 'rgba(16, 185, 129, 0.05)' : 'var(--search-bg)'
                    }}
                  >
                    {receiptBase64 ? (
                      <>
                        <CheckCircle size={32} style={{ marginBottom: '0.5rem' }} />
                        <span style={{ fontWeight: 600 }}>¡Comprobante subido!</span>
                        <span style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>Clic para cambiar</span>
                      </>
                    ) : (
                      <>
                        <Upload size={32} style={{ marginBottom: '0.5rem' }} />
                        <span style={{ fontWeight: 600 }}>Sube la captura de tu transferencia</span>
                        <span style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>Formatos: JPG, PNG</span>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />

                  <button 
                    onClick={() => {
                      if (!email) { setErrorMsg('Ingresa tu correo'); return; }
                      if (!receiptBase64) { setErrorMsg('Por favor sube tu comprobante'); return; }
                      handlePaymentSuccess('transfer_manual', 'transfer');
                    }}
                    disabled={!receiptBase64 || !email}
                    style={{ 
                      marginTop: '1.5rem', width: '100%', padding: '1.2rem', 
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', 
                      color: 'white', border: 'none', borderRadius: '16px', 
                      fontWeight: 800, fontSize: '1.1rem', cursor: (!receiptBase64 || !email) ? 'not-allowed' : 'pointer',
                      boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)',
                      display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
                      opacity: (!receiptBase64 || !email) ? 0.7 : 1
                    }}
                  >
                    Enviar Comprobante
                  </button>
                </div>
              )}

              {paymentMethod === 'paypal' && (
                <div style={{ marginTop: '1rem', animation: 'fadeIn 0.3s ease' }}>
                  <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                    <strong>Nota sobre comisiones:</strong> PayPal cobra una comisión internacional (aprox. 5.4% + $0.30). Para que el monto llegue exacto, el precio ha sido ajustado de <strong>${cartTotal.toFixed(2)}</strong> a <strong>${((cartTotal + 0.30) / (1 - 0.054)).toFixed(2)}</strong>.
                  </div>
                  
                  <PayPalScriptProvider options={{ "clientId": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "test", currency: "USD" }}>
                    <PayPalButtons 
                      style={{ layout: "vertical", shape: "rect" }}
                      createOrder={(data, actions) => {
                        const finalTotal = ((cartTotal + 0.30) / (1 - 0.054)).toFixed(2);
                        return actions.order.create({
                          intent: "CAPTURE",
                          purchase_units: [
                            {
                              amount: {
                                currency_code: "USD",
                                value: finalTotal,
                              },
                              description: "Compra en Stream Store"
                            },
                          ],
                        });
                      }}
                      onApprove={async (data, actions) => {
                        if (actions.order) {
                          const details = await actions.order.capture();
                          await handlePaymentSuccess(details.id as string, 'paypal');
                        }
                      }}
                      onError={(err) => {
                        console.error("PayPal Error:", err);
                        setErrorMsg("Error al procesar el pago con PayPal.");
                      }}
                    />
                  </PayPalScriptProvider>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                <ShieldCheck size={16} /> {t('checkout.secure')}
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem', gap: '1.5rem', animation: 'fadeIn 0.3s ease' }}>
              <div className="spinner" style={{ width: '60px', height: '60px', border: '4px solid rgba(62, 213, 204, 0.2)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <div style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--text-main)', margin: '0 0 0.5rem 0' }}>{t('checkout.processing.title')}</h3>
                <p style={{ color: 'var(--text-muted)', margin: 0 }}>{t('checkout.processing.desc')}</p>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', gap: '1rem', animation: 'fadeIn 0.3s ease' }}>
              <div style={{ width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', marginBottom: '1rem' }}>
                <CheckCircle size={48} />
              </div>
              <h3 style={{ fontSize: '1.6rem', color: 'var(--text-main)', margin: 0, fontWeight: 800 }}>{t('checkout.success.title')}</h3>
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: '0 0 2rem 0', lineHeight: 1.5 }}>
                {t('checkout.success.desc')}
              </p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
