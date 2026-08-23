import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'active';
    const all = searchParams.get('all') === 'true'; // For admin dashboard

    let query = 'SELECT * FROM cars';
    const params: any[] = [];

    if (!all) {
      query += ' WHERE status = ?';
      params.push(status);
      if (category && category !== 'Semua') {
        query += ' AND category = ?';
        params.push(category);
      }
    } else if (category && category !== 'Semua') {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY sort_order ASC, created_at DESC';

    const cars = db.prepare(query).all(...params);

    // Parse JSON fields
    const parsedCars = cars.map((car: any) => ({
      ...car,
      features: car.features ? JSON.parse(car.features) : [],
      gallery: car.gallery ? JSON.parse(car.gallery) : [],
    }));

    return NextResponse.json({ success: true, data: parsedCars });
  } catch (error: any) {
    console.error('Error fetching cars:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      brand,
      model,
      plate_number,
      slug,
      year,
      capacity,
      transmission,
      fuel,
      price_per_day,
      category,
      description,
      features,
      image_url,
      gallery,
      status,
      sort_order,
    } = body;

    if (!brand || !model || !slug || !image_url) {
      return NextResponse.json({ success: false, error: 'Semua field wajib diisi' }, { status: 400 });
    }

    const id = `car-${Date.now()}`;
    const insert = db.prepare(`
      INSERT INTO cars (id, brand, model, plate_number, slug, year, capacity, transmission, fuel, price_per_day, category, description, features, image_url, gallery, status, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insert.run(
      id,
      brand,
      model,
      plate_number || 'D 1234 AMS',
      slug,
      Number(year) || 2024,
      Number(capacity) || 7,
      transmission || 'Manual',
      fuel || 'Bensin',
      Number(price_per_day) || 0,
      category || 'MPV',
      description || '',
      JSON.stringify(features || []),
      image_url,
      JSON.stringify(gallery || [image_url]),
      status || 'active',
      Number(sort_order) || 0
    );

    return NextResponse.json({ success: true, message: 'Mobil berhasil ditambahkan', id });
  } catch (error: any) {
    console.error('Error creating car:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
