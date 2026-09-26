import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { recordAuditLog } from '@/lib/auditLogger';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reviewId = Number(id);
    const body = await req.json();
    const { status, review_title, description, rating } = body;
    const now = new Date();

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM reviews WHERE id = ? LIMIT 1`,
      reviewId
    );
    const oldValues = oldRows || null;

    if (status !== undefined && review_title === undefined) {
      // Toggle status only
      await prisma.$executeRawUnsafe(
        `UPDATE reviews SET status = ?, updated_at = ? WHERE id = ?`,
        Number(status),
        now,
        reviewId
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
        reviewId
      );
    }

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'university-reviews',
      recordId: reviewId,
      description: `Updated university review '${oldValues?.name || reviewId}' (ID: ${reviewId})`,
      oldValues,
      newValues: body,
    });

    return NextResponse.json({ status: true, message: 'Review updated successfully' });
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json({ status: false, message: 'Failed to update review', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reviewId = Number(id);

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM reviews WHERE id = ? LIMIT 1`,
      reviewId
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(`DELETE FROM reviews WHERE id = ?`, reviewId);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'university-reviews',
      recordId: reviewId,
      description: `Deleted university review by '${oldValues?.name || reviewId}' (ID: ${reviewId})`,
      oldValues,
    });

    return NextResponse.json({ status: true, message: 'Review deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete review', error: error.message }, { status: 500 });
  }
}

