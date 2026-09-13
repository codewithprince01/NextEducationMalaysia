import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: rawId } = await params;
    const id = parseInt(rawId, 10);
    await prisma.$executeRawUnsafe(`DELETE FROM upload_files WHERE id = ?`, id);
    return NextResponse.json({ status: true, message: 'File deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting file:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete file', error: error.message }, { status: 500 });
  }
}

