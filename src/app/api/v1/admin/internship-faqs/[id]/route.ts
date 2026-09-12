import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { question, answer } = body;

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
    const { id } = await params;
    await prisma.$executeRawUnsafe(`DELETE FROM internship_faqs WHERE id = ?`, id);
    return NextResponse.json({ status: true, message: 'Internship FAQ deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: 'Failed to delete FAQ', error: error.message },
      { status: 500 }
    );
  }
}

