import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const specId = searchParams.get('specialization_id');

    let sql = `SELECT * FROM course_specialization_faqs`;
    const params: any[] = [];

    if (specId) {
      const specIdNum = Number(specId);
      sql += ` WHERE (specialization_id = ? OR sid = ?)`;
      params.push(specIdNum, specIdNum);
    }

    sql += ` ORDER BY id ASC`;

    const faqs: any[] = await prisma.$queryRawUnsafe(sql, ...params);

    return NextResponse.json({
      status: true,
      data: serializeBigInt(faqs),
    });
  } catch (error: any) {
    console.error('Error fetching specialization FAQs:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch FAQs', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { specialization_id, question, answer } = body;

    if (!specialization_id || !question) {
      return NextResponse.json({ status: false, message: 'Specialization ID and question are required' }, { status: 400 });
    }

    const specIdNum = Number(specialization_id);
    const now = new Date();

    let spc: string | null = null;
    try {
      const specRows: any[] = await prisma.$queryRawUnsafe(
        `SELECT slug FROM course_specializations WHERE id = ? LIMIT 1`,
        specIdNum
      );
      if (specRows.length > 0) {
        spc = specRows[0].slug;
      }
    } catch {}

    await prisma.$executeRawUnsafe(
      `INSERT INTO course_specialization_faqs (sid, specialization_id, spc, question, answer, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
      specIdNum,
      specIdNum,
      spc,
      question,
      answer || null,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'FAQ created successfully' });
  } catch (error: any) {
    console.error('Error creating specialization FAQ:', error);
    return NextResponse.json({ status: false, message: 'Failed to create FAQ', error: error.message }, { status: 500 });
  }
}
