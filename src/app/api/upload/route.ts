import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

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
    const validMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/jpg', 'image/svg+xml', 'image/x-icon'];
    if (!validMimes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Format file tidak didukung. Gunakan JPG, PNG, WebP, atau SVG.' },
        { status: 400 }
      );
    }

    // Convert file to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Prepare target directory
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'cars');
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate clean unique filename
    const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/);
    const originalExt = extMatch ? extMatch[1].toLowerCase() : 'webp';
    const cleanName = file.name
      .toLowerCase()
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now();

    let filename = `${cleanName}-${timestamp}.webp`;
    let targetPath = path.join(uploadDir, filename);

    // Try processing image with Sharp if available, fallback to direct buffer write
    let sharpProcessed = false;
    try {
      // Dynamic import to avoid hard compile-time failure if sharp native binary is installing
      const sharpModule = await import('sharp');
      const sharp = sharpModule.default || sharpModule;

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

      sharpProcessed = true;
    } catch (sharpError) {
      // Fallback: write direct buffer with appropriate extension
      filename = `${cleanName}-${timestamp}.${originalExt}`;
      targetPath = path.join(uploadDir, filename);
      await fs.writeFile(targetPath, buffer);
    }

    const publicUrl = `/images/cars/${filename}`;

    return NextResponse.json({
      success: true,
      message: sharpProcessed
        ? 'Foto berhasil diunggah, dikompres, dan dikonversi ke WebP'
        : 'Foto berhasil diunggah',
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
