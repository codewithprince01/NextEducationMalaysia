import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { slugify } from '@/lib/utils';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { specialization_level_id, title, tab, description, position } = body;
    const tabTitle = (title || tab || '').trim();

    if (!tabTitle) {
      return NextResponse.json({ status: false, message: 'Title is required' }, { status: 400 });
    }

    const slug = slugify(tabTitle);
    const now = new Date();

    try {
      await prisma.$executeRawUnsafe(
        `UPDATE specialization_level_contents 
         SET specialization_level_id = ?, title = ?, tab = ?, slug = ?, description = ?, position = ?, updated_at = ?
         WHERE id = ?`,
        specialization_level_id ? Number(specialization_level_id) : null,
        tabTitle,
        tabTitle,
        slug,
        description || null,
        position ? Number(position) : 1,
        now,
        Number(id)
      );
    } catch {
      await prisma.$executeRawUnsafe(
        `UPDATE specialization_level_contents 
         SET specialization_level_id = ?, title = ?, slug = ?, description = ?, position = ?, updated_at = ?
         WHERE id = ?`,
        specialization_level_id ? Number(specialization_level_id) : null,
        tabTitle,
        slug,
        description || null,
        position ? Number(position) : 1,
        now,
        Number(id)
      );
    }

    return NextResponse.json({ status: true, message: 'Content tab updated successfully' });
  } catch (error: any) {
    console.error('Error updating specialization level content:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to update content tab', error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.$executeRawUnsafe(
      `DELETE FROM specialization_level_contents WHERE id = ?`,
      Number(id)
    );

    return NextResponse.json({ status: true, message: 'Content tab deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting specialization level content:', error);
    return NextResponse.json(
      { status: false, message: 'Failed to delete content tab', error: error.message },
      { status: 500 }
    );
  }
}
