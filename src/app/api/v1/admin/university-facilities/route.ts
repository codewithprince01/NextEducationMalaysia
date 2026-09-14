import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const university_id = searchParams.get('university_id');

    let sql = `SELECT uf.*, IFNULL(uf.title, '') AS facility, IFNULL(uf.title, '') AS title, u.name AS university_name
               FROM university_facilities uf
               LEFT JOIN universities u ON u.id = uf.u_id`;

    if (university_id) {
      sql += ` WHERE uf.u_id = ${parseInt(university_id, 10)}`;
    }

    sql += ` ORDER BY uf.id DESC`;

    const facilities: any[] = await prisma.$queryRawUnsafe(sql);

    return NextResponse.json({ success: true, data: serializeBigInt(facilities) });
  } catch (error: any) {
    console.error('Error fetching university facilities:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch facilities' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { university_id, facility, title, description } = body;
    const facilityTitle = title || facility;

    if (!university_id || !facilityTitle) {
      return NextResponse.json(
        { success: false, error: 'University ID and Facility title are required' },
        { status: 400 }
      );
    }

    const now = new Date();
    const [maxRes]: any[] = await prisma.$queryRawUnsafe(`SELECT IFNULL(MAX(id), 0) + 1 AS next_id FROM university_facilities`);
    const nextId = Number(maxRes?.next_id || 1);

    await prisma.$executeRawUnsafe(
      `INSERT INTO university_facilities (id, website, u_id, title, description, status, created_at, updated_at)
       VALUES (?, 'MYS', ?, ?, ?, 1, ?, ?)`,
      nextId,
      parseInt(university_id, 10),
      facilityTitle,
      description || '',
      now,
      now
    );

    return NextResponse.json({ success: true, message: 'Facility created successfully' }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating facility:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create facility' },
      { status: 500 }
    );
  }
}
