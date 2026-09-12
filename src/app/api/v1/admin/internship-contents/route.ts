import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const internship_id = searchParams.get('internship_id');

    let query = `SELECT * FROM internship_contents`;
    const paramsList: any[] = [];

    if (internship_id) {
      query += ` WHERE internship_id = ?`;
      paramsList.push(internship_id);
    }
    query += ` ORDER BY position ASC, id DESC`;

    const rows: any[] = await prisma.$queryRawUnsafe(query, ...paramsList);

    return NextResponse.json({
      status: true,
      data: serializeBigInt(rows),
    });
  } catch (error: any) {
    console.error('Error fetching internship contents:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to fetch internship contents', error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { internship_id, tab, description, position } = body;

    if (!internship_id || !tab || !description) {
      return NextResponse.json({ status: false, message: 'Internship ID, tab, and description are required' }, { status: 400 });
    }

    const now = new Date();
    await prisma.$executeRawUnsafe(
      `INSERT INTO internship_contents (internship_id, tab, description, position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      internship_id,
      tab,
      description,
      position ? parseInt(position, 10) : 1,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Internship content created successfully' });
  } catch (error: any) {
    console.error('Error creating internship content:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to create internship content', error: error.message },
      { status: 500 }
    );
  }
}
