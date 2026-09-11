import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const {
      specialization_id,
      level_name,
      level,
      duration,
      tuition_fees,
      intake,
      accreditation,
      meta_title,
      meta_description,
      meta_keyword,
      og_image_path,
      seo_rating,
      best_rating,
      review_number
    } = body;
    const nameToUse = level_name || level;

    if (!nameToUse || !nameToUse.trim()) {
      return NextResponse.json({ status: false, message: 'Level name is required' }, { status: 400 });
    }

    const level_slug = slugify(nameToUse);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE specialization_levels 
       SET specialization_id = ?, level = ?, level_slug = ?, duration = ?, tuition_fees = ?, 
           intake = ?, accreditation = ?, meta_title = ?, meta_description = ?, meta_keyword = ?, 
           og_image_path = ?, seo_rating = ?, best_rating = ?, review_number = ?, updated_at = ?
       WHERE id = ?`,
      specialization_id ? Number(specialization_id) : null,
      nameToUse.trim(),
      level_slug,
      duration || null,
      tuition_fees || null,
      intake || null,
      accreditation || null,
      meta_title || null,
      meta_description || null,
      meta_keyword || null,
      og_image_path || null,
      seo_rating !== undefined && seo_rating !== '' ? Number(seo_rating) : null,
      best_rating !== undefined && best_rating !== '' ? Number(best_rating) : null,
      review_number !== undefined && review_number !== '' ? Number(review_number) : null,
      now,
      Number(id)
    );

    return NextResponse.json({ status: true, message: 'Specialization level updated successfully' });
  } catch (error: any) {
    console.error('Error updating specialization level:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to update specialization level', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.$executeRawUnsafe(
      `DELETE FROM specialization_levels WHERE id = ?`,
      Number(id)
    );

    return NextResponse.json({ status: true, message: 'Specialization level deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting specialization level:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to delete specialization level', error: error.message },
      { status: 500 }
    );
  }
}
