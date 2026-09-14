import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tab, description, position } = body;

    const now = new Date();
    await prisma.$executeRawUnsafe(
      `UPDATE internship_contents SET
        tab = COALESCE(?, tab),
        description = COALESCE(?, description),
        position = COALESCE(?, position),
        updated_at = ?
       WHERE id = ?`,
      tab ?? null,
      description ?? null,
      position ? parseInt(position, 10) : null,
      now,
      id
    );

    return NextResponse.json({ status: true, message: 'Internship content updated successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: 'Failed to update content', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.$executeRawUnsafe(`DELETE FROM internship_contents WHERE id = ?`, id);
    return NextResponse.json({ status: true, message: 'Internship content deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: 'Failed to delete content', error: error.message },
      { status: 500 }
    );
  }
}

