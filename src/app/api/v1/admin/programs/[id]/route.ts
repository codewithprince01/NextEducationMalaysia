import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const progId = parseInt(id, 10);
    if (isNaN(progId)) return NextResponse.json({ status: false, message: 'Invalid ID' }, { status: 400 });

    const body = await req.json();
    const {
      course_name,
      university_id,
      level,
      study_mode,
      duration,
      tution_fee,
      course_category_id,
      specialization_id,
      courses_description,
      status,
    } = body;

    if (!course_name || !course_name.trim()) {
      return NextResponse.json({ status: false, message: 'Course name is required' }, { status: 400 });
    }

    const slug = slugify(course_name);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE university_programs 
       SET university_id = ?, course_name = ?, slug = ?, level = ?, study_mode = ?, duration = ?, tution_fee = ?, course_category_id = ?, specialization_id = ?, status = ?, updated_at = ?
       WHERE id = ?`,
      university_id ? Number(university_id) : null,
      course_name.trim(),
      slug,
      level || null,
      study_mode || null,
      duration || null,
      tution_fee || null,
      course_category_id ? Number(course_category_id) : null,
      specialization_id ? Number(specialization_id) : null,
      status !== undefined ? Number(status) : 1,
      now,
      progId
    );

    return NextResponse.json({ status: true, message: 'Program updated successfully' });
  } catch (error: any) {
    console.error('Error updating program:', error);
    return NextResponse.json({ status: false, message: 'Failed to update program', error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const progId = parseInt(id, 10);
    if (isNaN(progId)) return NextResponse.json({ status: false, message: 'Invalid ID' }, { status: 400 });

    await prisma.$executeRawUnsafe(`DELETE FROM university_programs WHERE id = ?`, progId);
    return NextResponse.json({ status: true, message: 'Program deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting program:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete program', error: error.message }, { status: 500 });
  }
}
