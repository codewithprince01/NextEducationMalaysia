import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('course_category_id');

    let sql = `SELECT * FROM course_category_faqs`;
    const params: any[] = [];

    if (categoryId) {
      sql += ` WHERE course_category_id = ?`;
      params.push(Number(categoryId));
    }

    sql += ` ORDER BY id DESC`;

    const faqs: any[] = await prisma.$queryRawUnsafe(sql, ...params);

    return NextResponse.json({
      status: true,
      data: serializeBigInt(faqs),
    });
  } catch (error: any) {
    console.error('Error fetching course category FAQs:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch FAQs', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { course_category_id, question, answer } = body;

    if (!course_category_id || !question || !question.trim()) {
      return NextResponse.json({ status: false, message: 'Category ID and Question are required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO course_category_faqs (course_category_id, question, answer, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      Number(course_category_id),
      question.trim(),
      answer || null,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'FAQ created successfully' });
  } catch (error: any) {
    console.error('Error creating course category FAQ:', error);
    return NextResponse.json({ status: false, message: 'Failed to create FAQ', error: error.message }, { status: 500 });
  }
}
