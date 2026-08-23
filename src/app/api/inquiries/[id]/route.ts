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
    const { status } = body;

    if (!status) {
      return NextResponse.json({ success: false, error: 'Status tidak boleh kosong' }, { status: 400 });
    }

    db.prepare('UPDATE inquiries SET status = ? WHERE id = ?').run(status, id);
    return NextResponse.json({ success: true, message: 'Status inquiry berhasil diperbarui' });
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
