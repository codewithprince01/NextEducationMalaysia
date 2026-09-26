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
      `SELECT * FROM specialization_contents WHERE id = ? LIMIT 1`,
      contentId
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(
      `UPDATE specialization_contents 
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
      module: 'course-specialization-contents',
      recordId: contentId,
      description: `Updated content tab '${tab || oldValues?.tab || 'Overview'}' for Specialization #${oldValues?.specialization_id || ''} (ID: ${contentId})`,
      oldValues,
      newValues: body,
    });

    return NextResponse.json({ status: true, message: 'Content tab updated successfully' });
  } catch (error: any) {
    console.error('Error updating specialization content:', error);
    return NextResponse.json({ status: false, message: 'Failed to update content tab', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const contentId = Number(id);

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM specialization_contents WHERE id = ? LIMIT 1`,
      contentId
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(`DELETE FROM specialization_contents WHERE id = ?`, contentId);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'course-specialization-contents',
      recordId: contentId,
      description: `Deleted content tab '${oldValues?.tab || 'Overview'}' (ID: ${contentId})`,
      oldValues,
    });

    return NextResponse.json({ status: true, message: 'Content tab deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting specialization content:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete content tab', error: error.message }, { status: 500 });
  }
}

