import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tab, position, description } = body;
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE course_category_contents 
       SET tab = ?, position = ?, description = ?, updated_at = ?
       WHERE id = ?`,
      tab || 'Overview',
      position !== undefined ? Number(position) : 1,
      description || null,
      now,
      Number(id)
    );

    return NextResponse.json({ status: true, message: 'Content tab updated successfully' });
  } catch (error: any) {
    console.error('Error updating course category content:', error);
    return NextResponse.json({ status: false, message: 'Failed to update content tab', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.$executeRawUnsafe(`DELETE FROM course_category_contents WHERE id = ?`, Number(id));
    return NextResponse.json({ status: true, message: 'Content tab deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting course category content:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete content tab', error: error.message }, { status: 500 });
  }
}
