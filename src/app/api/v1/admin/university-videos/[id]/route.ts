import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.$executeRawUnsafe(`DELETE FROM university_videos WHERE id = ?`, parseInt(id, 10));

    return NextResponse.json({ success: true, status: true, message: 'Video deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, status: false, error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}

