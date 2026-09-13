import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const university_id = searchParams.get('university_id');

    let rows: any[] = [];
    if (university_id) {
      rows = await prisma.$queryRawUnsafe(
        `SELECT DISTINCT c.id, c.name, c.icon, c.slug
         FROM university_document_categories c
         INNER JOIN university_documents d ON d.category_id = c.id
         WHERE c.status = 1 AND d.university_id = ?
         ORDER BY c.position ASC`,
        parseInt(university_id, 10)
      );
    } else {
      rows = await prisma.$queryRawUnsafe(
        `SELECT id, name, icon, slug
         FROM university_document_categories
         WHERE status = 1
         ORDER BY position ASC`
      );
    }

    return NextResponse.json({
      success: true,
      data: serializeBigInt(rows),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch categories', error: error.message },
      { status: 500 }
    );
  }
}
