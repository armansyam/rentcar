import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    const adminPasswordRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password') as { value: string } | undefined;
    const actualPassword = adminPasswordRow?.value || 'admin123';

    if (username === 'admin' && password === actualPassword) {
      // In production/JWT setup, a signed cookie is created.
      const response = NextResponse.json({ success: true, message: 'Login berhasil' });
      response.cookies.set('admin_session', 'authenticated_token_ams', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });
      return response;
    }

    return NextResponse.json({ success: false, error: 'Username atau password salah' }, { status: 401 });
  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const isAuthenticated = cookieHeader.includes('admin_session=authenticated_token_ams');

    return NextResponse.json({ success: true, authenticated: isAuthenticated });
  } catch (error: any) {
    return NextResponse.json({ success: false, authenticated: false });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil' });
  response.cookies.delete('admin_session');
  return response;
}
