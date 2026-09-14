import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { type, seo_title } = body;

    if (!type) {
      return NextResponse.json({ status: false, message: 'Institute type name is required' }, { status: 400 });
    }

    const slug = slugify(type);
    const seoTitle = seo_title || type;
    const seoTitleSlug = slugify(seoTitle);
    const now = new Date();

    await prisma.$executeRawUnsafe(
      `UPDATE institute_types 
       SET type = ?, slug = ?, seo_title = ?, seo_title_slug = ?, updated_at = ?
       WHERE id = ? AND website = 'MYS'`,
      type,
      slug,
      seoTitle,
      seoTitleSlug,
      now,
      Number(id)
    );

    return NextResponse.json({ status: true, message: 'Institute type updated successfully' });
  } catch (error: any) {
    console.error('Error updating institute type:', error);
    return NextResponse.json({ status: false, message: 'Failed to update institute type', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.$executeRawUnsafe(`DELETE FROM institute_types WHERE id = ? AND website = 'MYS'`, Number(id));
    return NextResponse.json({ status: true, message: 'Institute type deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting institute type:', error);
    return NextResponse.json({ status: false, message: 'Failed to delete institute type', error: error.message }, { status: 500 });
  }
}
