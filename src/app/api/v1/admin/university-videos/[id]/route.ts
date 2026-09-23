import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { recordAuditLog } from '@/lib/auditLogger';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const videoId = parseInt(id, 10);

    const oldVideo = await prisma.universityVideo.findUnique({
      where: { id: videoId },
    });

    await prisma.$executeRawUnsafe(`DELETE FROM university_videos WHERE id = ?`, videoId);

    await recordAuditLog({
      req: request,
      action: 'DELETE',
      module: 'university-videos',
      recordId: videoId,
      description: `Deleted campus video '${oldVideo?.title || videoId}' (ID: ${videoId})`,
      oldValues: oldVideo,
    });

    return NextResponse.json({ success: true, status: true, message: 'Video deleted' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, status: false, error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}


