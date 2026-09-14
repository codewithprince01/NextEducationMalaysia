import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, review_title, description, rating } = body;
    const now = new Date();

    if (status !== undefined && review_title === undefined) {
      // Toggle status only
      await prisma.$executeRawUnsafe(
        `UPDATE reviews SET status = ?, updated_at = ? WHERE id = ?`,
        Number(status),
        now,
        Number(id)
      );
    } else {
      await prisma.$executeRawUnsafe(
        `UPDATE reviews 
         SET status = ?, review_title = ?, description = ?, rating = ?, updated_at = ?
         WHERE id = ?`,
        status !== undefined ? Number(status) : 1,
        review_title || null,
        description || null,
        rating !== undefined ? Number(rating) : 5,
        now,
        Number(id)
      );
    }

    return NextResponse.json({ status: true, message: 'Review updated successfully' });
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json({ status: false, message: 'Failed to update review', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.$executeRawUnsafe(`DELETE FROM reviews WHERE id = ?`, Number(id));
    return NextResponse.json({ status: true, message: 'Review deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete review', error: error.message }, { status: 500 });
  }
}
