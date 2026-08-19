"use client";

import { useLanguage } from "@/context/LanguageContext";
import AdminProductForm from "@/components/AdminProductForm";
import AdminProductList from "@/components/AdminProductList";
import AdminReviewList from "@/components/AdminReviewList";
import AdminChatList from "@/components/AdminChatList";
import AdminOrderList from "@/components/AdminOrderList";
import { signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Key } from "lucide-react";
import Image from "next/image";

type DashboardClientProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  isAdmin: boolean;
};

export default function DashboardClient({ user, isAdmin }: DashboardClientProps) {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeAdminTab, setActiveAdminTab] = useState<'products' | 'reviews' | 'chats' | 'orders'>('products');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch('/api/orders');
        const json = await res.json();
        if (json.success) {
          setOrders(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoadingOrders(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '4rem', paddingLeft: '5%', paddingRight: '5%', maxWidth: '100vw', overflowX: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '3rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Image 
            src={user.image || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} 
            alt="Avatar" 
            style={{ width: 'clamp(50px, 15vw, 80px)', height: 'auto', borderRadius: '50%', border: '3px solid var(--primary)' }} 
            width={80} height={80}
          />
          <div style={{ maxWidth: '100%' }}>
            <h1 style={{ fontSize: 'clamp(1.5rem, 6vw, 2.5rem)', color: 'var(--text-main)', wordBreak: 'break-word', lineHeight: 1.2 }}>¡Hola, {user.name}!</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)', wordBreak: 'break-all', marginTop: '0.2rem' }}>{user.email}</p>
          </div>
        </div>
        <button 
          onClick={() => signOut({ callbackUrl: '/' })}
          style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '12px', fontWeight: 600, cursor: 'pointer', width: '100%', maxWidth: '200px' }}
        >
          {t('dashboard.logout')}
        </button>
      </div>

      <h2 style={{ fontSize: '1.8rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', color: 'var(--text-main)' }}>
        {t('dashboard.purchases')}
      </h2>
      
      {loadingOrders ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando tus compras...</div>
      ) : orders.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {orders.map((order) => (
            <div key={order._id} style={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: 0 }}>{order.productName}</h3>
                {order.status === 'pending_verification' ? (
                  <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>{t('dashboard.order.verifying')}</span>
                ) : (
                  <span style={{ background: 'var(--primary)', color: 'var(--background)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>{t('dashboard.order.active')}</span>
                )}
              </div>
              <div style={{ background: 'var(--search-bg)', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {order.status === 'pending_verification' ? (
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center', padding: '0.5rem 0' }}>
                    {t('dashboard.order.verifying_desc1')} <br/>
                    <strong style={{ color: 'var(--primary)' }}>{t('dashboard.order.verifying_desc2')}</strong>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flexShrink: 0 }}>{t('dashboard.order.user')}</span>
                      <strong style={{ color: 'var(--text-main)', wordBreak: 'break-all', textAlign: 'right' }}>{order.accountUsername}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem', flexShrink: 0 }}>{t('dashboard.order.password')}</span>
                      <strong style={{ color: 'var(--text-main)', letterSpacing: '1px', wordBreak: 'break-all', textAlign: 'right' }}>{order.accountPassword}</strong>
                    </div>
                    {(order.accountProfile || order.accountPin) && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(62, 213, 204, 0.1)', padding: '0.8rem', borderRadius: '8px', border: '1px solid rgba(62, 213, 204, 0.3)' }}>
                        {order.accountProfile && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', paddingBottom: order.accountPin ? '0.5rem' : '0', borderBottom: order.accountPin ? '1px solid rgba(62, 213, 204, 0.3)' : 'none' }}>
                            <span style={{ color: 'var(--primary)', fontSize: '0.9rem', flexShrink: 0, fontWeight: 'bold' }}>{t('dashboard.order.profile')}</span>
                            <strong style={{ color: 'var(--text-main)', letterSpacing: '1px', wordBreak: 'break-all', textAlign: 'right' }}>{order.accountProfile}</strong>
                          </div>
                        )}
                        {order.accountPin && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                            <span style={{ color: 'var(--primary)', fontSize: '0.9rem', flexShrink: 0, fontWeight: 'bold' }}>{t('dashboard.order.pin')}</span>
                            <strong style={{ color: 'var(--text-main)', letterSpacing: '2px', wordBreak: 'break-all', textAlign: 'right' }}>{order.accountPin}</strong>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {t('dashboard.order.bought_on')} {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                  
                  {/* Logic for Renovar */}
                  {order.productCategory === 'streaming' && (
                    (() => {
                      const orderDate = new Date(order.createdAt);
                      const currentDate = new Date();
                      const diffTime = Math.abs(currentDate.getTime() - orderDate.getTime());
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      
                      if (diffDays >= 27) {
                        return (
                          <button style={{ 
                            background: 'var(--primary)', color: 'var(--background)', 
                            border: 'none', padding: '0.4rem 1rem', borderRadius: '8px', 
                            fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer',
                            boxShadow: '0 4px 10px rgba(62, 213, 204, 0.2)'
                          }}>
                            {t('dashboard.order.renew')}
                          </button>
                        );
                      }
                      return null;
                    })()
                  )}
                </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ background: 'var(--card-bg)', padding: '3rem', borderRadius: '12px', border: '1px solid var(--border)', textAlign: 'center', marginBottom: '3rem' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '1rem' }}>
            {t('dashboard.purchases.empty')}
          </p>
          <a href="/" className="btn btn-primary" style={{ padding: '0.75rem 1.5rem', borderRadius: '20px', textDecoration: 'none', color: 'var(--background)', background: 'var(--primary)', display: 'inline-block', fontWeight: 'bold' }}>
            {t('nav.catalog')}
          </a>
        </div>
      )}

      {isAdmin && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.8rem', color: '#dc2626', margin: 0 }}>
              {t('dashboard.admin')}
            </h2>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button 
                onClick={() => setActiveAdminTab('products')}
                style={{ 
                  background: activeAdminTab === 'products' ? '#dc2626' : 'transparent',
                  color: activeAdminTab === 'products' ? 'white' : 'var(--text-muted)',
                  border: activeAdminTab === 'products' ? 'none' : '1px solid var(--border)',
                  padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                {t('admin.tab.products')}
              </button>
              <button 
                onClick={() => setActiveAdminTab('reviews')}
                style={{ 
                  background: activeAdminTab === 'reviews' ? '#dc2626' : 'transparent',
                  color: activeAdminTab === 'reviews' ? 'white' : 'var(--text-muted)',
                  border: activeAdminTab === 'reviews' ? 'none' : '1px solid var(--border)',
                  padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                {t('admin.tab.reviews')}
              </button>
              <button 
                onClick={() => setActiveAdminTab('chats')}
                style={{ 
                  background: activeAdminTab === 'chats' ? '#dc2626' : 'transparent',
                  color: activeAdminTab === 'chats' ? 'white' : 'var(--text-muted)',
                  border: activeAdminTab === 'chats' ? 'none' : '1px solid var(--border)',
                  padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                {t('admin.tab.chats')}
              </button>
              <button 
                onClick={() => setActiveAdminTab('orders')}
                style={{ 
                  background: activeAdminTab === 'orders' ? '#dc2626' : 'transparent',
                  color: activeAdminTab === 'orders' ? 'white' : 'var(--text-muted)',
                  border: activeAdminTab === 'orders' ? 'none' : '1px solid var(--border)',
                  padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, cursor: 'pointer'
                }}
              >
                {t('admin.tab.orders')}
              </button>
            </div>
          </div>

          {activeAdminTab === 'products' && (
            <>
              <AdminProductForm />
              <AdminProductList />
            </>
          )}
          {activeAdminTab === 'reviews' && (
            <AdminReviewList />
          )}
          {activeAdminTab === 'chats' && (
            <AdminChatList />
          )}
          {activeAdminTab === 'orders' && (
            <AdminOrderList />
          )}
        </>
      )}
    </div>
  );
}
