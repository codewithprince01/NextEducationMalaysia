import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { recordAuditLog } from '@/lib/auditLogger';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { question, answer } = body;

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM course_category_faqs WHERE id = ? LIMIT 1`,
      Number(id)
    );
    const oldValues = oldRows || null;

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE course_category_faqs 
       SET question = ?, answer = ?, updated_at = ?
       WHERE id = ?`,
      question?.trim() || '',
      answer || null,
      now,
      Number(id)
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'course-category-faqs',
      recordId: id,
      description: `Updated course category FAQ '${question || oldValues?.question || id}' (ID: ${id})`,
      oldValues,
      newValues: body,
    });

    return NextResponse.json({ status: true, message: 'FAQ updated successfully' });
  } catch (error: any) {
    console.error('Error updating course category FAQ:', error);
    return NextResponse.json({ status: false, message: 'Failed to update FAQ', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM course_category_faqs WHERE id = ? LIMIT 1`,
      Number(id)
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(`DELETE FROM course_category_faqs WHERE id = ?`, Number(id));

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'course-category-faqs',
      recordId: id,
      description: `Deleted course category FAQ '${oldValues?.question || id}' (ID: ${id})`,
      oldValues,
    });

    return NextResponse.json({ status: true, message: 'FAQ deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting course category FAQ:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete FAQ', error: error.message }, { status: 500 });
  }
}
