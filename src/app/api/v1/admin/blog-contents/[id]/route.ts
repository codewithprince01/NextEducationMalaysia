import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, position, parent_id } = body;

    const contentSlug = title ? slugify(title) : undefined;
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE blog_contents SET
        title = COALESCE(?, title),
        slug = COALESCE(?, slug),
        description = COALESCE(?, description),
        position = COALESCE(?, position),
        parent_id = ?,
        updated_at = ?
       WHERE id = ?`,
      title ?? null,
      contentSlug ?? null,
      description ?? null,
      position ? parseInt(position, 10) : null,
      parent_id ? parseInt(parent_id, 10) : null,
      now,
      id
    );

    return NextResponse.json({ success: true, message: 'Blog content updated successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to update content', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.$executeRawUnsafe(`DELETE FROM blog_contents WHERE id = ?`, id);
    return NextResponse.json({ success: true, message: 'Blog content deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete content', error: error.message },
      { status: 500 }
    );
  }
}

