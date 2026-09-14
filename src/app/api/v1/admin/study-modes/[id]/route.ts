import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { study_mode } = body;

    if (!study_mode) {
      return NextResponse.json({ status: false, message: 'Study mode name is required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE study_modes 
       SET study_mode = ?, updated_at = ?
       WHERE id = ?`,
      study_mode,
      now,
      Number(id)
    );

    return NextResponse.json({ status: true, message: 'Study mode updated successfully' });
  } catch (error: any) {
    console.error('Error updating study mode:', error);
    return NextResponse.json({ status: false, message: 'Failed to update study mode', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.$executeRawUnsafe(`DELETE FROM study_modes WHERE id = ?`, Number(id));
    return NextResponse.json({ status: true, message: 'Study mode deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting study mode:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete study mode', error: error.message }, { status: 500 });
  }
}
