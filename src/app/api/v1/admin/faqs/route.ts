import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category_id = searchParams.get('category_id');

    let sql = `SELECT f.*, fc.category_name 
               FROM faqs f 
               LEFT JOIN faq_categories fc ON f.category_id = fc.id`;
    const params: any[] = [];

    if (category_id) {
      sql += ` WHERE f.category_id = ?`;
      params.push(parseInt(category_id, 10));
    }

    sql += ` ORDER BY f.id DESC`;

    const faqs: any[] = await prisma.$queryRawUnsafe(sql, ...params);

    return NextResponse.json({
      status: true,
      data: serializeBigInt(faqs),
    });
  } catch (error: any) {
    console.error('Error fetching FAQs:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch FAQs', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { category_id, question, answer, position } = body;

    if (!question) {
      return NextResponse.json({ status: false, message: 'Question is required' }, { status: 400 });
    }

    const now = new Date();
    const catId = category_id ? parseInt(category_id, 10) : null;

    await prisma.$executeRawUnsafe(
      `INSERT INTO faqs (category_id, u_id, question, answer, status, website, created_at, updated_at)
       VALUES (?, 0, ?, ?, 1, 'MYS', ?, ?)`,
      catId,
      question,
      answer || null,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'FAQ created successfully' });
  } catch (error: any) {
    console.error('Error creating FAQ:', error);
    return NextResponse.json({ status: false, message: 'Failed to create FAQ', error: error.message }, { status: 500 });
  }
}
