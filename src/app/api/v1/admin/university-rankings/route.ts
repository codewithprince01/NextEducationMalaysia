import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const university_id = searchParams.get('university_id');

    let sql = `SELECT ur.*, u.name AS university_name
               FROM university_rankings ur
               LEFT JOIN universities u ON u.id = ur.university_id`;

    if (university_id) {
      sql += ` WHERE ur.university_id = ${parseInt(university_id, 10)}`;
    }

    sql += ` ORDER BY ur.position ASC, ur.id ASC`;

    const rows: any[] = await prisma.$queryRawUnsafe(sql);

    return NextResponse.json({ success: true, data: serializeBigInt(rows) });
  } catch (error: any) {
    console.error('Error fetching university rankings:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch rankings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { university_id, title, description, position } = body;

    if (!university_id || !title) {
      return NextResponse.json(
        { success: false, error: 'University ID and Title are required' },
        { status: 400 }
      );
    }

    const now = new Date();
    const [maxRes]: any[] = await prisma.$queryRawUnsafe(
      `SELECT IFNULL(MAX(id), 0) + 1 AS next_id FROM university_rankings`
    );
    const nextId = Number(maxRes?.next_id || 1);

    await prisma.$executeRawUnsafe(
      `INSERT INTO university_rankings (id, university_id, title, description, position, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      nextId,
      parseInt(university_id, 10),
      title,
      description || '',
      position ? parseInt(position, 10) : 0,
      now,
      now
    );

    return NextResponse.json({ success: true, message: 'Ranking created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating ranking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create ranking' },
      { status: 500 }
    );
  }
}

