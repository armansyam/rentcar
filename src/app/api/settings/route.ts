import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    for (const r of rows) {
      if (r.key !== 'admin_password') { // do not leak admin password
        settings[r.key] = r.value;
      }
    }
    return NextResponse.json({ success: true, data: settings });
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const updateStmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');

    const updateMany = db.transaction((settingsObj: Record<string, string>) => {
      for (const [key, val] of Object.entries(settingsObj)) {
        updateStmt.run(key, String(val));
      }
    });

    updateMany(body);

    return NextResponse.json({ success: true, message: 'Pengaturan berhasil diperbarui' });
  } catch (error: any) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
