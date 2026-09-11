import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt, slugify } from '@/lib/utils';

export async function GET(req: Request) {
  try {
    const countries: any[] = await prisma.$queryRawUnsafe(
      `SELECT c.*, c.country_name AS name, c.country_slug AS slug FROM international_student_data_countries c ORDER BY c.country_name ASC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(countries),
    });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to fetch countries', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { country_name, color_class } = body;

    if (!country_name) {
      return NextResponse.json({ status: false, message: 'Country name is required' }, { status: 400 });
    }

    const country_slug = slugify(country_name);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO international_student_data_countries (country_name, country_slug, color_class, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)`,
      country_name,
      country_slug,
      color_class || null,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Country created successfully' });
  } catch (error: any) {
    return NextResponse.json({ status: false, message: 'Failed to create country', error: error.message }, { status: 500 });
  }
}
