import { NextResponse } from 'next/server';
import db from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();

    const allowedFields = [
      'status',
      'dp_amount',
      'deposit_amount',
      'total_price',
      'odometer_start',
      'odometer_end',
      'overtime_hours',
      'overtime_fee',
      'fuel_charge',
      'damage_charge',
      'payment_method_dp',
      'payment_method_final',
      'payment_method_deposit',
      'payment_status',
      'deposit_status',
      'notes_admin',
      'actual_return_date',
    ];

    const updates: string[] = [];
    const values: any[] = [];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ success: false, error: 'Tidak ada field yang diperbarui' }, { status: 400 });
    }

    values.push(id);
    const sql = `UPDATE inquiries SET ${updates.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values);

    return NextResponse.json({ success: true, message: 'Data sewa / inquiry berhasil diperbarui' });
  } catch (error: any) {
    console.error('Error updating inquiry status:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    db.prepare('DELETE FROM inquiries WHERE id = ?').run(id);
    return NextResponse.json({ success: true, message: 'Inquiry berhasil dihapus' });
  } catch (error: any) {
    console.error('Error deleting inquiry:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
