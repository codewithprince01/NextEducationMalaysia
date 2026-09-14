import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const internship_id = searchParams.get('internship_id');

    let query = `SELECT * FROM internship_faqs`;
    const paramsList: any[] = [];

    if (internship_id) {
      query += ` WHERE internship_id = ?`;
      paramsList.push(internship_id);
    }
    query += ` ORDER BY id DESC`;

    const rows: any[] = await prisma.$queryRawUnsafe(query, ...paramsList);

    return NextResponse.json({
      status: true,
      data: serializeBigInt(rows),
    });
  } catch (error: any) {
    console.error('Error fetching internship faqs:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch internship faqs', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { internship_id, question, answer } = body;

    if (!internship_id || !question || !answer) {
      return NextResponse.json({ status: false, message: 'Internship ID, question, and answer are required' }, { status: 400 });
    }

    const now = new Date();
    await prisma.$executeRawUnsafe(
      `INSERT INTO internship_faqs (internship_id, question, answer, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      internship_id,
      question,
      answer,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Internship FAQ created successfully' });
  } catch (error: any) {
    console.error('Error creating internship FAQ:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to create internship FAQ', error: error.message },
      { status: 500 }
    );
  }
}

