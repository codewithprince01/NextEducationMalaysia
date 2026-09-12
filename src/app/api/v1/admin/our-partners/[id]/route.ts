import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      `UPDATE our_partners SET
        name = ?, designation = ?, company = ?, phone = ?, email = ?,
        city = ?, state = ?, country = ?, experience_years = ?, students_placed = ?,
        rating = ?, profile_image = ?, specializations = ?, is_verified = ?, is_active = ?,
        updated_at = ?
      WHERE id = ?`,
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
      id
    );

    return NextResponse.json({ status: true, message: 'Partner profile updated successfully' });
  } catch (error: any) {
    console.error('Error updating partner:', error);
    return NextResponse.json({ status: false, message: 'Failed to update partner', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.$executeRawUnsafe(
      `DELETE FROM our_partners WHERE id = ?`,
      id
    );

    return NextResponse.json({ status: true, message: 'Partner profile deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting partner:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete partner', error: error.message }, { status: 500 });
  }
}
