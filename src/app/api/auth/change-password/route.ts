import { NextResponse } from 'next/server';
import db from '@/lib/db';
import { verifyPassword, hashPassword, createSessionToken, verifySessionToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Verify that user is currently authenticated
    const cookieHeader = request.headers.get('cookie') || '';
    const cookies = Object.fromEntries(
      cookieHeader.split('; ').map((c) => {
        const [k, ...v] = c.split('=');
        return [k, v.join('=')];
      })
    );

    const token = cookies[ADMIN_COOKIE_NAME];
    const session = verifySessionToken(token);

    if (!session.valid) {
      return NextResponse.json({ success: false, error: 'Sesi Anda telah berakhir. Silakan login kembali.' }, { status: 401 });
    }

    const { currentPassword, newPassword, newUsername } = await request.json();

    if (!currentPassword) {
      return NextResponse.json({ success: false, error: 'Password saat ini wajib diisi untuk verifikasi keamanan.' }, { status: 400 });
    }

    // 2. Fetch current stored password from database
    const adminPassRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password') as { value: string } | undefined;
    const storedPassword = adminPassRow?.value || 'admin123';

    // 3. Verify current password
    if (!verifyPassword(currentPassword, storedPassword)) {
      return NextResponse.json({ success: false, error: 'Password saat ini salah. Mohon periksa kembali.' }, { status: 400 });
    }

    // 4. Update username if provided
    let updatedUsername = session.username || 'admin';
    if (newUsername && newUsername.trim()) {
      const trimmedUser = newUsername.trim();
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('admin_username', trimmedUser);
      updatedUsername = trimmedUser;
    }

    // 5. Update password if new password is provided
    if (newPassword && newPassword.trim()) {
      if (newPassword.trim().length < 6) {
        return NextResponse.json({ success: false, error: 'Password baru minimal 6 karakter.' }, { status: 400 });
      }

      const hashed = hashPassword(newPassword.trim());
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('admin_password', hashed);
    }

    // 6. Refresh session token with updated username
    const newToken = createSessionToken(updatedUsername, 7);

    const response = NextResponse.json({
      success: true,
      message: 'Kredensial keamanan akun admin berhasil diperbarui!',
      username: updatedUsername,
    });

    const proto = request.headers.get('x-forwarded-proto');
    const isHttps = proto === 'https' || request.url.startsWith('https://');

    response.cookies.set(ADMIN_COOKIE_NAME, newToken, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error('Error changing password:', error);
    return NextResponse.json({ success: false, error: error.message || 'Gagal mengubah password.' }, { status: 500 });
  }
}
