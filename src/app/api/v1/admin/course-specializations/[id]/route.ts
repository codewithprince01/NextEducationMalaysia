import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const specId = parseInt(id, 10);
    if (isNaN(specId)) return NextResponse.json({ status: false, message: 'Invalid ID' }, { status: 400 });

    const body = await req.json();
    const {
      name,
      course_category_id,
      author_id,
      shortnote,
      icon_class,
      courses_description,
      description,
      meta_title,
      meta_description,
      meta_keyword,
      seo_rating,
      best_rating,
      review_number,
      thumbnail_path,
      banner_path,
      content_image_path,
      og_image_path,
      status,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ status: false, message: 'Specialization name is required' }, { status: 400 });
    }

    const slug = slugify(name);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE course_specializations 
       SET name = ?, slug = ?, course_category_id = ?, author_id = ?, shortnote = ?, icon_class = ?, courses_description = ?, 
           meta_title = ?, meta_description = ?, meta_keyword = ?, 
           seo_rating = ?, best_rating = ?, review_number = ?,
           thumbnail_path = ?, banner_path = ?, content_image_path = ?, og_image_path = ?, 
           status = ?, updated_at = ?
       WHERE id = ?`,
      name.trim(),
      slug,
      course_category_id ? Number(course_category_id) : null,
      author_id ? Number(author_id) : null,
      shortnote || null,
      icon_class || null,
      courses_description || description || null,
      meta_title || null,
      meta_description || null,
      meta_keyword || null,
      seo_rating || null,
      best_rating || null,
      review_number || null,
      thumbnail_path || null,
      banner_path || null,
      content_image_path || null,
      og_image_path || null,
      status !== undefined ? Number(status) : 1,
      now,
      specId
    );

    return NextResponse.json({ status: true, message: 'Specialization updated successfully' });
  } catch (error: any) {
    console.error('Error updating specialization:', error);
    return NextResponse.json({ status: false, message: 'Failed to update specialization', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const specId = parseInt(id, 10);
    if (isNaN(specId)) return NextResponse.json({ status: false, message: 'Invalid ID' }, { status: 400 });

    await prisma.$executeRawUnsafe(`DELETE FROM course_specializations WHERE id = ?`, specId);
    return NextResponse.json({ status: true, message: 'Specialization deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting specialization:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete specialization', error: error.message }, { status: 500 });
  }
}
