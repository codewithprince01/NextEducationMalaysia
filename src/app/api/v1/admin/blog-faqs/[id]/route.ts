import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { recordAuditLog } from '@/lib/auditLogger';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { question, answer } = body;

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM blog_faqs WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    const now = new Date();
    await prisma.$executeRawUnsafe(
      `UPDATE blog_faqs SET
        question = COALESCE(?, question),
        answer = COALESCE(?, answer),
        updated_at = ?
       WHERE id = ?`,
      question ?? null,
      answer ?? null,
      now,
      id
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'blog-faqs',
      recordId: id,
      description: `Updated blog FAQ '${question || oldValues?.question || id}' (ID: ${id})`,
      oldValues,
      newValues: body,
    });

    return NextResponse.json({ success: true, message: 'Blog FAQ updated successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to update FAQ', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM blog_faqs WHERE id = ? LIMIT 1`,
      id
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(`DELETE FROM blog_faqs WHERE id = ?`, id);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'blog-faqs',
      recordId: id,
      description: `Deleted blog FAQ '${oldValues?.question || id}' (ID: ${id})`,
      oldValues,
    });

    return NextResponse.json({ success: true, message: 'Blog FAQ deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete FAQ', error: error.message },
      { status: 500 }
    );
  }
}

