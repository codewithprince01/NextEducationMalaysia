import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category_id = searchParams.get('category_id');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    let sql = `SELECT b.*, b.headline AS title,
               bc.category_name, a.name AS author_name
               FROM blogs b
               LEFT JOIN blog_categories bc ON bc.id = b.category_id
               LEFT JOIN authors a ON a.id = b.author_id WHERE 1=1`;

    if (category_id) sql += ` AND b.category_id = ${parseInt(category_id, 10)}`;
    if (status !== null && status !== undefined && status !== '') {
      sql += ` AND b.status = ${parseInt(status, 10)}`;
    }
    if (search) {
      sql += ` AND (b.headline LIKE '%${search}%' OR b.slug LIKE '%${search}%')`;
    }

    sql += ` ORDER BY b.id DESC`;

    const blogs: any[] = await prisma.$queryRawUnsafe(sql);

    const formatted = blogs.map((b) => ({
      ...b,
      title: b.title || b.headline || `Blog #${b.id}`,
      category: b.category_name ? { id: b.category_id, category_name: b.category_name } : undefined,
      author: b.author_name ? { id: b.author_id, name: b.author_name } : undefined,
    }));

    return NextResponse.json({ success: true, data: serializeBigInt(formatted) });
  } catch (error: any) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
    if (!blogHeadline) {
      return NextResponse.json(
        { success: false, error: 'Blog title or headline is required' },
        { status: 400 }
      );
    }

    const blogSlug = slug ? slugify(slug) : slugify(blogHeadline);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO blogs (headline, slug, description, thumbnail_path, category_id, author_id, status, meta_title, meta_description, meta_keyword, og_image_path, website, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'MYS', ?, ?)`,
      blogHeadline,
      blogSlug,
      description || '',
      thumbnail_path || '',
      category_id ? parseInt(category_id, 10) : 0,
      author_id ? parseInt(author_id, 10) : null,
      status !== undefined ? parseInt(status, 10) : 1,
      meta_title || '',
      meta_description || '',
      meta_keyword || '',
      og_image_path || '',
      now,
      now
    );

    return NextResponse.json({ success: true, message: 'Blog created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create blog' },
      { status: 500 }
    );
  }
}

