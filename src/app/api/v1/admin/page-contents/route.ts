import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET() {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT pc.*, a.name as author_name 
       FROM page_contents pc 
       LEFT JOIN authors a ON pc.author_id = a.id 
       ORDER BY pc.id DESC`
    );

    const formatted = rows.map((r) => ({
      ...r,
      author: r.author_name ? { id: r.author_id, name: r.author_name } : null,
    }));

    return NextResponse.json({
      status: true,
      data: serializeBigInt(formatted),
    });
  } catch (error: any) {
    console.error('Error fetching page_contents:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch page contents', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { page_name, author_id, heading, description } = body;

    if (!page_name) {
      return NextResponse.json({ status: false, message: 'Page name is required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO page_contents (website, page_name, author_id, heading, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      'MYS',
      page_name,
      author_id ? parseInt(author_id, 10) : null,
      heading || null,
      description || null,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Page content created successfully' });
  } catch (error: any) {
    console.error('Error creating page_content:', error);
    return NextResponse.json({ status: false, message: 'Failed to create page content', error: error.message }, { status: 500 });
  }
}

