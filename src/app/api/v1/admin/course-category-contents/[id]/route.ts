import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { recordAuditLog } from '@/lib/auditLogger';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const contentId = Number(id);
    const body = await req.json();
    const { tab, position, description } = body;
    const now = new Date();

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM course_category_contents WHERE id = ? LIMIT 1`,
      contentId
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(
      `UPDATE course_category_contents 
       SET tab = ?, position = ?, description = ?, updated_at = ?
       WHERE id = ?`,
      tab || 'Overview',
      position !== undefined ? Number(position) : 1,
      description || null,
      now,
      contentId
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'course-category-contents',
      recordId: contentId,
      description: `Updated content tab '${tab || oldValues?.tab || 'Overview'}' for Course Category #${oldValues?.course_category_id || ''} (ID: ${contentId})`,
      oldValues,
      newValues: body,
    });

    return NextResponse.json({ status: true, message: 'Content tab updated successfully' });
  } catch (error: any) {
    console.error('Error updating course category content:', error);
    return NextResponse.json({ status: false, message: 'Failed to update content tab', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const contentId = Number(id);

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM course_category_contents WHERE id = ? LIMIT 1`,
      contentId
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(`DELETE FROM course_category_contents WHERE id = ?`, contentId);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'course-category-contents',
      recordId: contentId,
      description: `Deleted content tab '${oldValues?.tab || 'Overview'}' (ID: ${contentId})`,
      oldValues,
    });

    return NextResponse.json({ status: true, message: 'Content tab deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting course category content:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete content tab', error: error.message }, { status: 500 });
  }
}

