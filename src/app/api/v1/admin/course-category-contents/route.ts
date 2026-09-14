import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get('course_category_id');

    let sql = `SELECT * FROM course_category_contents`;
    const params: any[] = [];

    if (categoryId) {
      sql += ` WHERE course_category_id = ?`;
      params.push(Number(categoryId));
    }

    sql += ` ORDER BY position ASC, id ASC`;

    const contents: any[] = await prisma.$queryRawUnsafe(sql, ...params);

    return NextResponse.json({
      status: true,
      data: serializeBigInt(contents),
    });
  } catch (error: any) {
    console.error('Error fetching course category contents:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch contents', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { course_category_id, tab, position, description } = body;

    if (!course_category_id) {
      return NextResponse.json({ status: false, message: 'Category ID is required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO course_category_contents (course_category_id, tab, position, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      Number(course_category_id),
      tab || 'Overview',
      position !== undefined ? Number(position) : 1,
      description || null,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Content tab added successfully' });
  } catch (error: any) {
    console.error('Error creating course category content:', error);
    return NextResponse.json({ status: false, message: 'Failed to add content tab', error: error.message }, { status: 500 });
  }
}
