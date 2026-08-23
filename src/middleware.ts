import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_SECRET = process.env.AUTH_SECRET || 'ams_rentcar_secure_auth_secret_key_2026';
const ADMIN_COOKIE_NAME = 'admin_session';

async function verifyEdgeToken(token?: string | null): Promise<boolean> {
  if (!token || !token.includes('.')) return false;
  try {
    const [payloadStr, signature] = token.split('.');
    if (!payloadStr || !signature) return false;

    // Decode payload
    const decodedPayload = atob(payloadStr.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(decodedPayload);

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return false; // Expired
    }

    // Verify HMAC-SHA256 signature using Web Crypto API
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(AUTH_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Convert signature from base64url to Uint8Array
    const sigBinStr = atob(signature.replace(/-/g, '+').replace(/_/g, '/'));
    const sigBytes = new Uint8Array(sigBinStr.length);
    for (let i = 0; i < sigBinStr.length; i++) {
      sigBytes[i] = sigBinStr.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      sigBytes,
      encoder.encode(payloadStr)
    );

    return isValid;
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect /admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next();
  }

  const sessionToken = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
  const isAuthenticated = await verifyEdgeToken(sessionToken);

  // If visiting /admin/login
  if (pathname === '/admin/login') {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // If visiting any other /admin page without valid session
  if (!isAuthenticated) {
    const loginUrl = new URL('/admin/login', request.url);
    if (pathname !== '/admin') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
