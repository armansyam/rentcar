import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const inquiries = db.prepare('SELECT * FROM inquiries ORDER BY created_at DESC').all();
    return NextResponse.json({ success: true, data: inquiries });
  } catch (error: any) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      car_id,
      car_name,
      start_date,
      end_date,
      duration_days,
      pickup_location,
      destination,
      customer_name,
      customer_phone,
      notes,
    } = body;

    if (!car_name || !start_date || !end_date || !pickup_location || !customer_name || !customer_phone) {
      return NextResponse.json(
        { success: false, error: 'Silakan lengkapi semua data wajib pada formulir.' },
        { status: 400 }
      );
    }

    const timestamp = Date.now().toString().slice(-6);
    const invoice_no = `INV-${timestamp}`;
    const id = `inq-${Date.now()}`;

    const insert = db.prepare(`
      INSERT INTO inquiries (id, invoice_no, car_id, car_name, start_date, end_date, duration_days, pickup_location, destination, customer_name, customer_phone, notes, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'NEW')
    `);

    insert.run(
      id,
      invoice_no,
      car_id || null,
      car_name,
      start_date,
      end_date,
      Number(duration_days) || 1,
      pickup_location,
      destination || '',
      customer_name,
      customer_phone,
      notes || ''
    );

    return NextResponse.json({
      success: true,
      message: 'Inquiry berhasil disimpan',
      invoice_no,
      id,
    });
  } catch (error: any) {
    console.error('Error creating inquiry:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
