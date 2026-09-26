import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { recordAuditLog } from '@/lib/auditLogger';

// PUT /api/v1/admin/university-program-contents/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentId = Number(id);
    const body = await req.json();
    const { tab_title, heading, description, imgpath, imgname } = body;

    if (!tab_title || !tab_title.trim()) {
      return NextResponse.json(
        { status: false, message: 'Tab title is required' },
        { status: 400 }
      );
    }

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM university_program_contents WHERE id = ? LIMIT 1`,
      contentId
    );
    const oldValues = oldRows || null;

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE university_program_contents
       SET tab_title = ?, heading = ?, description = ?, imgpath = ?, imgname = ?, updated_at = ?
       WHERE id = ?`,
      tab_title.trim(),
      heading?.trim() || null,
      description || null,
      imgpath || null,
      imgname || null,
      now,
      contentId
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'university-program-contents',
      recordId: contentId,
      description: `Updated program content tab '${tab_title.trim()}' (ID: ${contentId})`,
      oldValues,
      newValues: body,
    });

    return NextResponse.json({
      status: true,
      message: 'Program content updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating university program content:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to update program content', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/admin/university-program-contents/[id]
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contentId = Number(id);

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM university_program_contents WHERE id = ? LIMIT 1`,
      contentId
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(
      `DELETE FROM university_program_contents WHERE id = ?`,
      contentId
    );

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'university-program-contents',
      recordId: contentId,
      description: `Deleted program content tab '${oldValues?.tab_title || contentId}' (ID: ${contentId})`,
      oldValues,
    });

    return NextResponse.json({
      status: true,
      message: 'Program content deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting university program content:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to delete program content', error: error.message },
      { status: 500 }
    );
  }
}

