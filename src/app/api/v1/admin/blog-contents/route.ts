import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const blog_id = searchParams.get('blog_id');

    let query = `SELECT bc.*, p.title as parent_title FROM blog_contents bc LEFT JOIN blog_contents p ON p.id = bc.parent_id`;
    const paramsList: any[] = [];

    if (blog_id) {
      query += ` WHERE bc.blog_id = ?`;
      paramsList.push(blog_id);
    }
    query += ` ORDER BY bc.position ASC, bc.id DESC`;

    const rows: any[] = await prisma.$queryRawUnsafe(query, ...paramsList);

    return NextResponse.json({
      success: true,
      data: serializeBigInt(rows),
    });
  } catch (error: any) {
    console.error('Error fetching blog contents:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch blog contents', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { blog_id, title, description, position, parent_id } = body;

    if (!blog_id || !title || !description) {
      return NextResponse.json(
        { success: false, message: 'Blog ID, title, and description are required' },
        { status: 400 }
      );
    }

    const contentSlug = slugify(title);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO blog_contents (blog_id, title, slug, description, position, parent_id, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      parseInt(blog_id, 10),
      title,
      contentSlug,
      description,
      position ? parseInt(position, 10) : 1,
      parent_id ? parseInt(parent_id, 10) : null,
      now,
      now
    );

    return NextResponse.json({ success: true, message: 'Blog content created successfully' });
  } catch (error: any) {
    console.error('Error creating blog content:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create blog content', error: error.message },
      { status: 500 }
    );
  }
}

