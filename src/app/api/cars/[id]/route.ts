import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Search by ID or by Slug
    const car: any = db.prepare('SELECT * FROM cars WHERE id = ? OR slug = ?').get(id, id);

    if (!car) {
      return NextResponse.json({ success: false, error: 'Mobil tidak ditemukan' }, { status: 404 });
    }

    const parsedCar = {
      ...car,
      features: car.features ? JSON.parse(car.features) : [],
      gallery: car.gallery ? JSON.parse(car.gallery) : [],
    };

    return NextResponse.json({ success: true, data: parsedCar });
  } catch (error: any) {
    console.error('Error fetching car detail:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const {
      brand,
      model,
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

    const update = db.prepare(`
      UPDATE cars
      SET brand = ?, model = ?, slug = ?, year = ?, capacity = ?, transmission = ?, fuel = ?,
          price_per_day = ?, category = ?, description = ?, features = ?, image_url = ?,
          gallery = ?, status = ?, sort_order = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    update.run(
      brand,
      model,
      slug,
      Number(year) || 2024,
      Number(capacity) || 7,
      transmission,
      fuel,
      Number(price_per_day) || 0,
      category || 'MPV',
      description || '',
      JSON.stringify(features || []),
      image_url,
      JSON.stringify(gallery || [image_url]),
      status,
      Number(sort_order) || 0,
      id
    );

    return NextResponse.json({ success: true, message: 'Mobil berhasil diperbarui' });
  } catch (error: any) {
    console.error('Error updating car:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    db.prepare('DELETE FROM cars WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'Mobil berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting car:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
