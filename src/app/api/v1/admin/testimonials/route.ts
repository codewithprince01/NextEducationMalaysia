import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const testimonials: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM testimonials ORDER BY id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(testimonials),
    });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to fetch testimonials', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, university_name, program_name, rating, review, student_image } = body;

    if (!name) {
      return NextResponse.json({ status: false, message: 'Student name is required' }, { status: 400 });
    }

    const now = new Date();
    const [maxRes]: any[] = await prisma.$queryRawUnsafe(`SELECT IFNULL(MAX(id), 0) + 1 AS next_id FROM testimonials`);
    const nextId = Number(maxRes?.next_id || 1);

    await prisma.$executeRawUnsafe(
      `INSERT INTO testimonials (id, website, user_type, status, name, email, review, created_at, updated_at)
       VALUES (?, 'MYS', 'student', 1, ?, ?, ?, ?, ?)`,
      nextId,
      name,
      email || '',
      review || null,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Testimonial created successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to create testimonial', error: error.message }, { status: 500 });
  }
}
