import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyPassword, hashPassword, createSessionToken, verifySessionToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: 'Username dan password wajib diisi.' }, { status: 400 });
    }

    // Fetch admin username & password from settings
    const adminUserRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_username') as { value: string } | undefined;
    const adminPassRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password') as { value: string } | undefined;

    const expectedUsername = adminUserRow?.value || 'admin';
    const storedPassword = adminPassRow?.value || 'admin123';

    // Verify username & password
    const isUsernameMatch = username.trim().toLowerCase() === expectedUsername.trim().toLowerCase();
    const isPasswordMatch = verifyPassword(password, storedPassword);

    if (!isUsernameMatch || !isPasswordMatch) {
      return NextResponse.json({ success: false, error: 'Username atau password salah.' }, { status: 401 });
    }

    // Transparently upgrade legacy plaintext password to cryptographic hash
    if (!storedPassword.startsWith('sha256$')) {
      try {
        const hashed = hashPassword(password);
        db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('admin_password', hashed);
      } catch (e) {
        // ignore
      }
    }

    // Generate signed session token
    const token = createSessionToken(expectedUsername, 7);

    const proto = request.headers.get('x-forwarded-proto');
    const isHttps = proto === 'https' || request.url.startsWith('https://');

    const response = NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      username: expectedUsername,
    });

    response.cookies.set(ADMIN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error during login:', error);
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map((c) => {
        const [k, ...v] = c.split('=');
        return [k, v.join('=')];
      })
    );

    const token = cookies[ADMIN_COOKIE_NAME];
    const { valid, username } = verifySessionToken(token);

    return NextResponse.json({
      success: true,
      authenticated: valid,
      username: valid ? username : null,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, authenticated: false });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: 'Logout berhasil.' });
  response.cookies.set(ADMIN_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
