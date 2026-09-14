import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const blog_id = searchParams.get('blog_id');

    let query = `SELECT * FROM blog_faqs`;
    const paramsList: any[] = [];

    if (blog_id) {
      query += ` WHERE blog_id = ?`;
      paramsList.push(blog_id);
    }
    query += ` ORDER BY id DESC`;

    const rows: any[] = await prisma.$queryRawUnsafe(query, ...paramsList);

    return NextResponse.json({
      success: true,
      data: serializeBigInt(rows),
    });
  } catch (error: any) {
    console.error('Error fetching blog faqs:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch blog faqs', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { blog_id, question, answer } = body;

    if (!blog_id || !question || !answer) {
      return NextResponse.json(
        { success: false, message: 'Blog ID, question, and answer are required' },
        { status: 400 }
      );
    }

    const now = new Date();
    await prisma.$executeRawUnsafe(
      `INSERT INTO blog_faqs (blog_id, question, answer, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      parseInt(blog_id, 10),
      question,
      answer,
      now,
      now
    );

    return NextResponse.json({ success: true, message: 'Blog FAQ created successfully' });
  } catch (error: any) {
    console.error('Error creating blog FAQ:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create blog FAQ', error: error.message },
      { status: 500 }
    );
  }
}

