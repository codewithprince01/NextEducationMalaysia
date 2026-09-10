import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');

    let sql = `
      SELECT r.*, u.name as university_name
      FROM reviews r
      LEFT JOIN universities u ON r.university_id = u.id
      WHERE (r.website = 'MYS' OR r.website IS NULL OR r.website = '')
    `;
    const params: any[] = [];

    if (statusParam !== null && statusParam !== '') {
      sql += ` AND r.status = ?`;
      params.push(Number(statusParam));
    }

    sql += ` ORDER BY r.id DESC`;

    const reviews: any[] = await prisma.$queryRawUnsafe(sql, ...params);

    return NextResponse.json({
      status: true,
      data: serializeBigInt(reviews),
    });
  } catch (error: any) {
    console.error('Error fetching university reviews:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch reviews', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { university_id, name, email, mobile, program, passing_year, review_title, description, rating, status } = body;

    if (!university_id || !name) {
      return NextResponse.json({ status: false, message: 'University and reviewer name are required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO reviews 
       (website, university_id, name, email, mobile, program, passing_year, review_title, description, rating, status, anonymous, created_at, updated_at)
       VALUES ('MYS', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      Number(university_id),
      name,
      email || null,
      mobile || null,
      program || null,
      passing_year || null,
      review_title || null,
      description || null,
      rating !== undefined ? Number(rating) : 5,
      status !== undefined ? Number(status) : 1,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Review created successfully' });
  } catch (error: any) {
    console.error('Error creating review:', error);
    return NextResponse.json({ status: false, message: 'Failed to create review', error: error.message }, { status: 500 });
  }
}
