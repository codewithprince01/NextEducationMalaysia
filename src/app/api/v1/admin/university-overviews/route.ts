import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const university_id = searchParams.get('university_id');

    let sql = `SELECT uo.*, uo.title AS tab, u.name AS university_name
               FROM university_overviews uo
               LEFT JOIN universities u ON u.id = uo.university_id`;

    if (university_id) {
      sql += ` WHERE uo.university_id = ${parseInt(university_id, 10)}`;
    }

    sql += ` ORDER BY uo.position ASC, uo.id DESC`;

    const overviews: any[] = await prisma.$queryRawUnsafe(sql);

    const formatted = overviews.map((o) => ({
      ...o,
      university: o.university_name ? { id: o.university_id, name: o.university_name } : undefined,
    }));

    return NextResponse.json({ success: true, data: serializeBigInt(formatted) });
  } catch (error: any) {
    console.error('Error fetching university overviews:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch university overviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { university_id, tab, title, description, position } = body;
    const tabTitle = title || tab;

    if (!university_id || !tabTitle) {
      return NextResponse.json(
        { success: false, error: 'University ID and Tab title are required' },
        { status: 400 }
      );
    }

    const now = new Date();
    const [maxRes]: any[] = await prisma.$queryRawUnsafe(`SELECT IFNULL(MAX(id), 0) + 1 AS next_id FROM university_overviews`);
    const nextId = Number(maxRes?.next_id || 1);

    await prisma.$executeRawUnsafe(
      `INSERT INTO university_overviews (id, website, university_id, title, description, position, status, created_at, updated_at)
       VALUES (?, 'MYS', ?, ?, ?, ?, 1, ?, ?)`,
      nextId,
      parseInt(university_id, 10),
      tabTitle,
      description || '',
      position ? parseInt(position, 10) : 0,
      now,
      now
    );

    return NextResponse.json({ success: true, message: 'Overview created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating university overview:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create university overview' },
      { status: 500 }
    );
  }
}
