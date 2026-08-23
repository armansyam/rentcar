import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import sharp from 'sharp';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'File gambar tidak ditemukan' },
        { status: 400 }
      );
    }

    // Validate mime type
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/jpg'];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.' },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Prepare target directory
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'cars');
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate clean unique filename with .webp extension
    const cleanName = file.name
      .toLowerCase()
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();
    const filename = `${cleanName}-${timestamp}.webp`;
    const targetPath = path.join(uploadDir, filename);

    // Process image with Sharp:
    // 1. Resize proportionally to max width 1200px (standard vehicle studio view)
    // 2. Apply subtle sharpening for crisp car details (headlights, wheels, bodylines)
    // 3. Compress and convert to high-efficiency WebP
    await sharp(buffer)
      .resize({
        width: 1200,
        height: 800,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .sharpen({
        sigma: 1.0,
        m1: 1.0,
        m2: 2.0,
      })
      .webp({
        quality: 82,
        effort: 6,
      })
      .toFile(targetPath);

    const publicUrl = `/images/cars/${filename}`;

    return NextResponse.json({
      success: true,
      message: 'Foto berhasil diunggah, dikompres, dan dikonversi ke WebP',
      url: publicUrl,
      filename,
    });
  } catch (error: any) {
    console.error('Error uploading/compressing image:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses gambar' },
      { status: 500 }
    );
  }
}
