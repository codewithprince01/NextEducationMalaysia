import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';

// PUT /api/v1/admin/levels/[id] - Update level
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const levelId = parseInt(id, 10);
    if (isNaN(levelId)) {
      return NextResponse.json({ status: false, message: 'Invalid Level ID' }, { status: 400 });
    }

    const body = await req.json();
    const { level, short_name, seo_name, courses_description } = body;

    if (!level || !level.trim()) {
      return NextResponse.json({ status: false, message: 'Level title is required' }, { status: 400 });
    }

    const slug = slugify(level);
    const shortNameSlug = short_name ? slugify(short_name) : null;
    const seoNameSlug = seo_name ? slugify(seo_name) : null;

    // Check duplicate
    const existing: any[] = await prisma.$queryRawUnsafe(
      `SELECT id FROM levels WHERE (level = ? OR slug = ?) AND id != ? LIMIT 1`,
      level.trim(),
      slug,
      levelId
    );

    if (existing && existing.length > 0) {
      return NextResponse.json({ status: false, message: 'Another level with this name already exists' }, { status: 400 });
    }

    const now = new Date();
    await prisma.$executeRawUnsafe(
      `UPDATE levels 
       SET level = ?, slug = ?, short_name = ?, short_name_slug = ?, seo_name = ?, seo_name_slug = ?, courses_description = ?, updated_at = ?
       WHERE id = ?`,
      level.trim(),
      slug,
      short_name?.trim() || null,
      shortNameSlug,
      seo_name?.trim() || null,
      seoNameSlug,
      courses_description || null,
      now,
      levelId
    );

    return NextResponse.json({
      status: true,
      message: 'Level updated successfully',
    });
  } catch (error: any) {
    console.error('Error updating level:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to update level', error: error.message },
      { status: 500 }
    );
  }
}

// DELETE /api/v1/admin/levels/[id] - Delete level
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const levelId = parseInt(id, 10);
    if (isNaN(levelId)) {
      return NextResponse.json({ status: false, message: 'Invalid Level ID' }, { status: 400 });
    }

    await prisma.$executeRawUnsafe(`DELETE FROM levels WHERE id = ?`, levelId);

    return NextResponse.json({
      status: true,
      message: 'Level deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting level:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to delete level', error: error.message },
      { status: 500 }
    );
  }
}
