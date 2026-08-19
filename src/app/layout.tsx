import type { Metadata, Viewport } from "next";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import SessionProviderWrapper from "../components/SessionProviderWrapper";
import ThemeProviderWrapper from "../components/ThemeProviderWrapper";
import { CartProvider } from "../context/CartContext";
import { LanguageProvider } from "../context/LanguageContext";
import CartDrawer from "../components/CartDrawer";
import GlobalChatWidget from "../components/GlobalChatWidget";
import { Outfit } from 'next/font/google';
import "./globals.css";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const outfit = Outfit({ subsets: ['latin'] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#06b6d4',
};

export const metadata: Metadata = {
  title: "akiravs | Servicios Digitales Premium",
  description: "Compra cuentas de IA, Streaming y Juegos al mejor precio. Entrega inmediata y garantía total en akiravs.",
  metadataBase: new URL('https://akira-vs.vercel.app'), // Placeholder production URL
  openGraph: {
    title: "akiravs | Servicios Digitales Premium",
    description: "Compra cuentas de IA, Streaming y Juegos al mejor precio. Entrega inmediata y garantía total en akiravs.",
    url: "https://akira-vs.vercel.app",
    siteName: "akiravs",
    images: [
      {
        url: "/logo.jpg",
        width: 800,
        height: 600,
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "akiravs | Servicios Digitales Premium",
    description: "Compra cuentas de IA, Streaming y Juegos al mejor precio.",
    images: ["/logo.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);
  const isAdmin = (session?.user as any)?.role === 'admin';
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning className={outfit.className} style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <SessionProviderWrapper>
          <ThemeProviderWrapper>
            <LanguageProvider>
              <CartProvider>
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
                  <Navbar />
                  <CartDrawer />
                  <main style={{ flex: 1 }}>{children}</main>
                  <Footer />
                </div>
                <GlobalChatWidget isAdmin={isAdmin} />
              </CartProvider>
            </LanguageProvider>
          </ThemeProviderWrapper>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
