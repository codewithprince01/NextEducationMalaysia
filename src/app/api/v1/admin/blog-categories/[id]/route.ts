import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const catId = parseInt(id, 10);
    const categories: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM blog_categories WHERE id = ?`,
      catId
    );

    if (!categories.length) {
      return NextResponse.json(
        { success: false, error: 'Category not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: serializeBigInt(categories[0]) });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch category' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const catId = parseInt(id, 10);
    const body = await request.json();
    const {
      category_name,
      category_slug,
      meta_title,
      meta_description,
      meta_keyword,
      og_image_path,
      seo_rating,
      best_rating,
      review_number,
      status,
    } = body;

    const slug = category_slug ? slugify(category_slug) : (category_name ? slugify(category_name) : '');
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE blog_categories
       SET category_name = COALESCE(?, category_name),
           category_slug = COALESCE(?, category_slug),
           meta_title = COALESCE(?, meta_title),
           meta_description = COALESCE(?, meta_description),
           meta_keyword = COALESCE(?, meta_keyword),
           og_image_path = COALESCE(?, og_image_path),
           seo_rating = ?,
           best_rating = ?,
           review_number = ?,
           status = COALESCE(?, status),
           updated_at = ?
       WHERE id = ?`,
      category_name,
      slug,
      meta_title,
      meta_description,
      meta_keyword,
      og_image_path,
      seo_rating ? parseFloat(seo_rating) : null,
      best_rating ? parseFloat(best_rating) : null,
      review_number ? parseInt(review_number, 10) : null,
      status !== undefined ? parseInt(status, 10) : null,
      now,
      catId
    );

    return NextResponse.json({ success: true, message: 'Category updated successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const catId = parseInt(id, 10);

    await prisma.$executeRawUnsafe(
      `DELETE FROM blog_categories WHERE id = ?`,
      catId
    );

    return NextResponse.json({ success: true, message: 'Category deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}

