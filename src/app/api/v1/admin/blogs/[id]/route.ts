import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const blogId = parseInt(id, 10);

    const blogs: any[] = await prisma.$queryRawUnsafe(
      `SELECT *, headline AS title FROM blogs WHERE id = ?`,
      blogId
    );

    if (!blogs.length) {
      return NextResponse.json(
        { success: false, error: 'Blog post not found' },
        { status: 404 }
      );
    }

    const b = blogs[0];
    return NextResponse.json({
      success: true,
      data: serializeBigInt({
        ...b,
        title: b.title || b.headline || '',
      }),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch blog post' },
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
    const blogId = parseInt(id, 10);
    const body = await request.json();
    const {
      title,
      headline,
      slug,
      description,
      thumbnail_path,
      category_id,
      author_id,
      status,
      meta_title,
      meta_description,
      meta_keyword,
      og_image_path,
    } = body;

    const blogHeadline = headline || title;
    const blogSlug = slug ? slugify(slug) : (blogHeadline ? slugify(blogHeadline) : undefined);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE blogs
       SET headline = COALESCE(?, headline),
           slug = COALESCE(?, slug),
           description = COALESCE(?, description),
           thumbnail_path = COALESCE(?, thumbnail_path),
           category_id = COALESCE(?, category_id),
           author_id = COALESCE(?, author_id),
           status = COALESCE(?, status),
           meta_title = COALESCE(?, meta_title),
           meta_description = COALESCE(?, meta_description),
           meta_keyword = COALESCE(?, meta_keyword),
           og_image_path = COALESCE(?, og_image_path),
           updated_at = ?
       WHERE id = ?`,
      blogHeadline,
      blogSlug,
      description,
      thumbnail_path,
      category_id ? parseInt(category_id, 10) : null,
      author_id ? parseInt(author_id, 10) : null,
      status !== undefined ? parseInt(status, 10) : null,
      meta_title,
      meta_description,
      meta_keyword,
      og_image_path,
      now,
      blogId
    );

    return NextResponse.json({ success: true, message: 'Blog updated successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update blog post' },
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
    const blogId = parseInt(id, 10);

    await prisma.$executeRawUnsafe(`DELETE FROM blogs WHERE id = ?`, blogId);

    return NextResponse.json({ success: true, message: 'Blog deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete blog post' },
      { status: 500 }
    );
  }
}

