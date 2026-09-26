import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { recordAuditLog } from '@/lib/auditLogger';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    const body = await req.json();
    const { question, answer } = body;

    const existingRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM internship_faqs WHERE id = ? LIMIT 1`,
      id
    );
    const existing = existingRows?.[0] || null;

    const now = new Date();
    await prisma.$executeRawUnsafe(
      `UPDATE internship_faqs SET
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
      module: 'internships',
      recordId: id,
      description: `Updated FAQ for internship (ID: ${id})`,
      oldValues: existing,
      newValues: {
        id,
        question: question ?? existing?.question,
        answer: answer ?? existing?.answer,
      },
    });

    return NextResponse.json({ status: true, message: 'Internship FAQ updated successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: 'Failed to update FAQ', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);

    const existingRows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM internship_faqs WHERE id = ? LIMIT 1`,
      id
    );
    const existing = existingRows?.[0] || null;

    await prisma.$executeRawUnsafe(`DELETE FROM internship_faqs WHERE id = ?`, id);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'internships',
      recordId: id,
      description: `Deleted FAQ '${existing?.question || id}' for internship (ID: ${id})`,
      oldValues: existing,
    });

    return NextResponse.json({ status: true, message: 'Internship FAQ deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: 'Failed to delete FAQ', error: error.message },
      { status: 500 }
    );
  }
}

