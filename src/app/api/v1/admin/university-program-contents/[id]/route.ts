import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// PUT /api/v1/admin/university-program-contents/[id]
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { tab_title, heading, description, imgpath, imgname } = body;

    if (!tab_title || !tab_title.trim()) {
      return NextResponse.json(
        { status: false, message: 'Tab title is required' },
        { status: 400 }
      );
    }

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
      Number(id)
    );

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
    await prisma.$executeRawUnsafe(
      `DELETE FROM university_program_contents WHERE id = ?`,
      Number(id)
    );

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
