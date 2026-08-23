import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';
import db from '@/lib/db';
import { verifySessionToken, ADMIN_COOKIE_NAME } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function getAuthenticatedAdmin(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split('; ').map((c) => {
      const [k, ...v] = c.split('=');
      return [k, v.join('=')];
    })
  );
  const token = cookies[ADMIN_COOKIE_NAME];
  return verifySessionToken(token);
}

const dataDir = path.join(process.cwd(), 'data');
const backupsDir = path.join(dataDir, 'backups');
const dbFilePath = path.join(dataDir, 'rentcar.db');

function ensureBackupsDir() {
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }
}

function getDatabaseStats() {
  try {
    const totalCars = (db.prepare('SELECT COUNT(*) as c FROM cars').get() as any)?.c || 0;
    const totalInquiries = (db.prepare('SELECT COUNT(*) as c FROM inquiries').get() as any)?.c || 0;
    const totalSettings = (db.prepare('SELECT COUNT(*) as c FROM settings').get() as any)?.c || 0;

    let dbSizeFormatted = '0 KB';
    let lastModified = '-';
    if (fs.existsSync(dbFilePath)) {
      const stat = fs.statSync(dbFilePath);
      const sizeBytes = stat.size;
      dbSizeFormatted = sizeBytes > 1024 * 1024 
        ? `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB` 
        : `${(sizeBytes / 1024).toFixed(1)} KB`;
      lastModified = stat.mtime.toLocaleString('id-ID');
    }

    // List snapshots
    ensureBackupsDir();
    const files = fs.readdirSync(backupsDir)
      .filter((f) => f.endsWith('.db') || f.endsWith('.sqlite'))
      .map((f) => {
        const p = path.join(backupsDir, f);
        const st = fs.statSync(p);
        return {
          filename: f,
          size: st.size > 1024 * 1024 
            ? `${(st.size / (1024 * 1024)).toFixed(2)} MB` 
            : `${(st.size / 1024).toFixed(1)} KB`,
          createdAt: st.mtime.toISOString(),
          createdFormatted: st.mtime.toLocaleString('id-ID'),
        };
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return {
      dbPath: 'data/rentcar.db',
      dbSize: dbSizeFormatted,
      lastModified,
      totalCars,
      totalInquiries,
      totalSettings,
      backups: files,
    };
  } catch (error: any) {
    return {
      dbPath: 'data/rentcar.db',
      dbSize: '0 KB',
      lastModified: '-',
      totalCars: 0,
      totalInquiries: 0,
      totalSettings: 0,
      backups: [],
      error: error.message,
    };
  }
}

export async function GET(request: Request) {
  const session = getAuthenticatedAdmin(request);
  if (!session.valid) {
    return NextResponse.json({ success: false, error: 'Akses tidak sah. Silakan login terlebih dahulu.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action') || 'info';

  if (action === 'info') {
    const stats = getDatabaseStats();
    return NextResponse.json({ success: true, data: stats });
  }

  if (action === 'download') {
    try {
      ensureBackupsDir();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const tempBackupFile = path.join(backupsDir, `temp-download-${timestamp}.db`);

      // SQLite safe vacuum backup to temporary file
      try {
        db.backup(tempBackupFile);
      } catch (err) {
        // Fallback: direct read if backup method fails
        fs.copyFileSync(dbFilePath, tempBackupFile);
      }

      const fileBuffer = fs.readFileSync(tempBackupFile);
      // Clean up temp file
      try { fs.unlinkSync(tempBackupFile); } catch (_) {}

      const filename = `rentcar-backup-${new Date().toISOString().slice(0, 10)}.db`;
      return new Response(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/x-sqlite3',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Content-Length': fileBuffer.length.toString(),
        },
      });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message || 'Gagal mengunduh database.' }, { status: 500 });
    }
  }

  if (action === 'download_snapshot') {
    const filename = searchParams.get('file');
    if (!filename || filename.includes('..') || filename.includes('/')) {
      return NextResponse.json({ success: false, error: 'Nama file tidak valid.' }, { status: 400 });
    }

    const filePath = path.join(backupsDir, filename);
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'File backup tidak ditemukan.' }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    return new Response(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-sqlite3',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': fileBuffer.length.toString(),
      },
    });
  }

  return NextResponse.json({ success: false, error: 'Aksi tidak dikenali.' }, { status: 400 });
}

export async function POST(request: Request) {
  const session = getAuthenticatedAdmin(request);
  if (!session.valid) {
    return NextResponse.json({ success: false, error: 'Akses tidak sah. Silakan login terlebih dahulu.' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') || '';

  // 1. Multipart Form Data (File Upload Import / Restore)
  if (contentType.includes('multipart/form-data')) {
    try {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;

      if (!file) {
        return NextResponse.json({ success: false, error: 'File database tidak ditemukan.' }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());

      // Validate SQLite Header ("SQLite format 3\0")
      const sqliteHeader = buffer.subarray(0, 16).toString('utf-8');
      if (!sqliteHeader.startsWith('SQLite format 3')) {
        return NextResponse.json({
          success: false,
          error: 'File yang diunggah bukan file SQLite Database yang valid.',
        }, { status: 400 });
      }

      ensureBackupsDir();
      const tempRestorePath = path.join(backupsDir, `temp-import-${Date.now()}.db`);
      fs.writeFileSync(tempRestorePath, buffer);

      // Verify that uploaded SQLite has required tables
      try {
        const testDb = new Database(tempRestorePath, { readonly: true });
        const tables = testDb.prepare("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[];
        const tableNames = tables.map((t) => t.name);
        testDb.close();

        if (!tableNames.includes('cars') && !tableNames.includes('settings')) {
          fs.unlinkSync(tempRestorePath);
          return NextResponse.json({
            success: false,
            error: 'Database yang diunggah tidak memiliki struktur tabel RentCar (cars, settings).',
          }, { status: 400 });
        }
      } catch (checkError: any) {
        try { fs.unlinkSync(tempRestorePath); } catch (_) {}
        return NextResponse.json({
          success: false,
          error: `Struktur database korup atau tidak terbaca: ${checkError.message}`,
        }, { status: 400 });
      }

      // Create emergency pre-restore backup of existing DB
      if (fs.existsSync(dbFilePath)) {
        const emergencyBak = path.join(backupsDir, `pre-restore-auto-${Date.now()}.db`);
        try {
          fs.copyFileSync(dbFilePath, emergencyBak);
        } catch (_) {}
      }

      // Close WAL before replace
      try {
        db.pragma('wal_checkpoint(TRUNCATE)');
      } catch (_) {}

      // Replace main DB
      fs.copyFileSync(tempRestorePath, dbFilePath);
      fs.unlinkSync(tempRestorePath);

      return NextResponse.json({
        success: true,
        message: 'Database berhasil di-restore dan data telah diperbarui!',
      });
    } catch (err: any) {
      console.error('Error importing database:', err);
      return NextResponse.json({ success: false, error: err.message || 'Gagal mengimpor database.' }, { status: 500 });
    }
  }

  // 2. JSON Body Actions (Create Snapshot, Restore Snapshot, Delete Snapshot)
  try {
    const { action, filename } = await request.json();

    if (action === 'create_snapshot') {
      ensureBackupsDir();
      const now = new Date();
      const datePart = now.toISOString().slice(0, 10);
      const timePart = now.toTimeString().slice(0, 8).replace(/:/g, '-');
      const targetFilename = `snapshot-${datePart}_${timePart}.db`;
      const targetPath = path.join(backupsDir, targetFilename);

      try {
        db.backup(targetPath);
      } catch (err) {
        fs.copyFileSync(dbFilePath, targetPath);
      }

      return NextResponse.json({
        success: true,
        message: `Snapshot server berhasil dibuat: ${targetFilename}`,
        filename: targetFilename,
      });
    }

    if (action === 'restore_snapshot') {
      if (!filename || filename.includes('..') || filename.includes('/')) {
        return NextResponse.json({ success: false, error: 'Nama file snapshot tidak valid.' }, { status: 400 });
      }

      const sourcePath = path.join(backupsDir, filename);
      if (!fs.existsSync(sourcePath)) {
        return NextResponse.json({ success: false, error: 'File snapshot tidak ditemukan.' }, { status: 404 });
      }

      // Make emergency safety backup first
      if (fs.existsSync(dbFilePath)) {
        const safetyBak = path.join(backupsDir, `pre-snapshot-restore-${Date.now()}.db`);
        try { fs.copyFileSync(dbFilePath, safetyBak); } catch (_) {}
      }

      try {
        db.pragma('wal_checkpoint(TRUNCATE)');
      } catch (_) {}

      fs.copyFileSync(sourcePath, dbFilePath);

      return NextResponse.json({
        success: true,
        message: `Database berhasil dipulihkan dari snapshot ${filename}!`,
      });
    }

    if (action === 'delete_snapshot') {
      if (!filename || filename.includes('..') || filename.includes('/')) {
        return NextResponse.json({ success: false, error: 'Nama file snapshot tidak valid.' }, { status: 400 });
      }

      const targetPath = path.join(backupsDir, filename);
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }

      return NextResponse.json({
        success: true,
        message: `Snapshot ${filename} berhasil dihapus.`,
      });
    }

    return NextResponse.json({ success: false, error: 'Aksi tidak valid.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || 'Terjadi kesalahan pada server.' }, { status: 500 });
  }
}
