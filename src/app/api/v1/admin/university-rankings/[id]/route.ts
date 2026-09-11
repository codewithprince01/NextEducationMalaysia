import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    const body = await request.json();
    const { title, description, position } = body;
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE university_rankings SET title = ?, description = ?, position = ?, updated_at = ? WHERE id = ?`,
      title || '',
      description || '',
      position ? parseInt(position, 10) : 0,
      now,
      id
    );

    return NextResponse.json({ success: true, message: 'Ranking updated successfully' });
  } catch (error: any) {
    console.error('Error updating ranking:', error);
    return NextResponse.json({ success: false, error: 'Failed to update ranking' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id, 10);
    await prisma.$executeRawUnsafe(`DELETE FROM university_rankings WHERE id = ?`, id);
    return NextResponse.json({ success: true, message: 'Ranking deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: 'Failed to delete ranking' }, { status: 500 });
  }
}

