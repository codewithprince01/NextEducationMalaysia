import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.universityPhoto.delete({
      where: { id: parseInt(id, 10) },
    });

    return NextResponse.json({ success: true, message: 'Photo deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}

