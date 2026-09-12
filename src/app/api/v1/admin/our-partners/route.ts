import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET() {
  try {
    const rows: any[] = await prisma.$queryRawUnsafe(
      `SELECT * FROM our_partners ORDER BY id DESC`
    );

    return NextResponse.json({
      status: true,
      data: serializeBigInt(rows),
    });
  } catch (error: any) {
    console.error('Error fetching our partners:', error);
    return NextResponse.json({ status: false, message: 'Failed to fetch partners', error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      designation,
      company,
      phone,
      email,
      city,
      state,
      country,
      experience_years,
      students_placed,
      rating,
      profile_image,
      specializations,
      is_verified,
      is_active,
    } = body;

    if (!name || !designation) {
      return NextResponse.json({ status: false, message: 'Name and Designation are required' }, { status: 400 });
    }

    const now = new Date();

    await prisma.$executeRawUnsafe(
      `INSERT INTO our_partners (
        name, designation, company, phone, email, city, state, country,
        experience_years, students_placed, rating, profile_image, specializations,
        is_verified, is_active, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      name,
      designation,
      company || null,
      phone || null,
      email || null,
      city || null,
      state || null,
      country || null,
      parseInt(experience_years || '0', 10),
      parseInt(students_placed || '0', 10),
      parseFloat(rating || '5.0'),
      profile_image || null,
      specializations || null,
      is_verified ? 1 : 0,
      is_active ? 1 : 0,
      now,
      now
    );

    return NextResponse.json({ status: true, message: 'Partner profile created successfully' });
  } catch (error: any) {
    console.error('Error creating partner:', error);
    return NextResponse.json({ status: false, message: 'Failed to create partner', error: error.message }, { status: 500 });
  }
}
