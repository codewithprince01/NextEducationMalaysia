import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { recordAuditLog } from '@/lib/auditLogger';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const photoId = parseInt(id, 10);

    const oldPhoto = await prisma.universityPhoto.findUnique({
      where: { id: photoId },
    });

    await prisma.universityPhoto.delete({
      where: { id: photoId },
    });

    await recordAuditLog({
      req: request,
      action: 'DELETE',
      module: 'university-photos',
      recordId: photoId,
      description: `Deleted campus photo (ID: ${photoId})`,
      oldValues: oldPhoto,
    });

    return NextResponse.json({ success: true, message: 'Photo deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete photo' },
      { status: 500 }
    );
  }
}


