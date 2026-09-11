import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const data: any[] = await prisma.$queryRawUnsafe(
      `SELECT isd.*, isdc.country_name, isdc.color_class
       FROM international_student_data isd
       LEFT JOIN international_student_data_countries isdc ON isd.country_id = isdc.id
       ORDER BY isd.year DESC, isd.id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(data),
    });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to fetch student data', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { year, country_id, count } = body;

    if (!year || !country_id) {
      return NextResponse.json({ status: false, message: 'Year and Country are required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO international_student_data (year, country_id, count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      parseInt(year, 10),
      parseInt(country_id, 10),
      count ? parseInt(count, 10) : 0,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'International student record created successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to create record', error: error.message }, { status: 500 });
  }
}
