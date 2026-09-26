import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';
import { recordAuditLog } from '@/lib/auditLogger';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const contentId = Number(id);
    const body = await req.json();
    const { title, description, position, parent_id } = body;

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM blog_contents WHERE id = ? LIMIT 1`,
      contentId
    );
    const oldValues = oldRows || null;

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
      contentId
    );

    await recordAuditLog({
      req,
      action: 'UPDATE',
      module: 'blog-contents',
      recordId: contentId,
      description: `Updated blog section content '${title || oldValues?.title}' (ID: ${contentId})`,
      oldValues,
      newValues: body,
    });

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
    const contentId = Number(id);

    const [oldRows]: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM blog_contents WHERE id = ? LIMIT 1`,
      contentId
    );
    const oldValues = oldRows || null;

    await prisma.$executeRawUnsafe(`DELETE FROM blog_contents WHERE id = ?`, contentId);

    await recordAuditLog({
      req,
      action: 'DELETE',
      module: 'blog-contents',
      recordId: contentId,
      description: `Deleted blog section content '${oldValues?.title || contentId}' (ID: ${contentId})`,
      oldValues,
    });

    return NextResponse.json({ success: true, message: 'Blog content deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to delete content', error: error.message },
      { status: 500 }
    );
  }
}


