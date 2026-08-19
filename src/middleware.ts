import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

// Simple in-memory rate limiting map (IP -> { count, startTime })
const rateLimitMap = new Map<string, { count: number, startTime: number }>();

export default withAuth(
  function middleware(req) {
    const ip = (req as any).ip || req.headers.get('x-forwarded-for') || 'unknown';
    
    // Rate limiting for API routes
    if (req.nextUrl.pathname.startsWith('/api/')) {
      const windowMs = 60 * 1000; // 1 minute
      const limit = 60; // Max 60 requests per minute per IP for API routes
      const now = Date.now();
      const requestData = rateLimitMap.get(ip);

      if (!requestData) {
        rateLimitMap.set(ip, { count: 1, startTime: now });
      } else {
        if (now - requestData.startTime < windowMs) {
          if (requestData.count >= limit) {
            return new NextResponse(JSON.stringify({ error: "Demasiadas peticiones. Intenta de nuevo más tarde." }), {
              status: 429,
              headers: {
                'Content-Type': 'application/json',
                'Retry-After': '60'
              }
            });
          }
          requestData.count += 1;
        } else {
          // Reset window
          rateLimitMap.set(ip, { count: 1, startTime: now });
        }
      }
    }

    const response = NextResponse.next();

    // Security Headers (HSTS, CSP, etc.)
    const cspHeader = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://apis.google.com https://accounts.google.com;
      style-src 'self' 'unsafe-inline';
      img-src 'self' blob: data: https://upload.wikimedia.org https://lh3.googleusercontent.com;
      font-src 'self';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
      frame-ancestors 'none';
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    response.headers.set('Content-Security-Policy', cspHeader);
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    if (process.env.NODE_ENV === 'production') {
      response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    }

    return response;
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const path = req.nextUrl.pathname;
        if (path.startsWith('/dashboard') || path.startsWith('/admin')) {
          return !!token;
        }
        return true;
      },
    },
    pages: {
      signIn: "/",
    }
  }
);

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
