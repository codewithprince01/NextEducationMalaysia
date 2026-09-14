import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const apps: any[] = await prisma.$queryRawUnsafe(
      `SELECT ma.*, mac.category_name, mac.color_class
       FROM malaysia_applications ma
       LEFT JOIN malaysia_application_categories mac ON ma.category_id = mac.id
       ORDER BY ma.year DESC, ma.id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(apps),
    });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to fetch applications', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { year, category_id, count } = body;

    if (!year || !category_id) {
      return NextResponse.json({ status: false, message: 'Year and Category are required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO malaysia_applications (year, category_id, count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      parseInt(year, 10),
      parseInt(category_id, 10),
      count ? parseInt(count, 10) : 0,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Malaysia application record created successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to create record', error: error.message }, { status: 500 });
  }
}
