import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { serializeBigInt } from '@/lib/utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const university_id = searchParams.get('university_id');
    const university_slug = searchParams.get('university_slug');
    const visibility = searchParams.get('visibility');

    let uniIdFilter: number | null = null;
    if (university_id) {
      uniIdFilter = parseInt(university_id, 10);
    } else if (university_slug) {
      const [u]: any[] = await prisma.$queryRawUnsafe(
        `SELECT id FROM universities WHERE uname = ? LIMIT 1`,
        university_slug
      );
      if (u) {
        uniIdFilter = u.id;
      }
    }

    const whereConditions: string[] = ['c.status = 1'];
    const params: any[] = [];

    let visCondition = "d.visibility IN ('all', 'agents_only', 'counsellors_only')";
    if (visibility === 'all') {
      visCondition = "d.visibility = 'all'";
    } else if (visibility === 'agents_only') {
      visCondition = "d.visibility IN ('all', 'agents_only')";
    } else if (visibility === 'counsellors_only') {
      visCondition = "d.visibility IN ('all', 'counsellors_only')";
    }

    let categories: any[] = [];

    if (uniIdFilter) {
      categories = await prisma.$queryRawUnsafe(
        `SELECT c.id, c.name, c.slug, c.description, c.icon, c.position,
                (SELECT COUNT(*) 
                 FROM university_documents d 
                 WHERE d.category_id = c.id 
                   AND d.status = 1 
                   AND d.university_id = ? 
                   AND ${visCondition}) AS documents_count
         FROM university_document_categories c
         INNER JOIN university_documents d ON d.category_id = c.id
         WHERE c.status = 1 AND d.status = 1 AND d.university_id = ? AND ${visCondition}
         GROUP BY c.id, c.name, c.slug, c.description, c.icon, c.position
         ORDER BY c.position ASC, c.name ASC`,
        uniIdFilter,
        uniIdFilter
      );
    } else {
      categories = await prisma.$queryRawUnsafe(
        `SELECT c.id, c.name, c.slug, c.description, c.icon, c.position,
                (SELECT COUNT(*) 
                 FROM university_documents d 
                 WHERE d.category_id = c.id 
                   AND d.status = 1 
                   AND ${visCondition}) AS documents_count
         FROM university_document_categories c
         WHERE c.status = 1
         ORDER BY c.position ASC, c.name ASC`
      );
    }

    const formatted = categories.map((cat) => ({
      ...cat,
      documents_count: Number(cat.documents_count || 0),
    }));

    return NextResponse.json({
      success: true,
      data: serializeBigInt(formatted),
    });
  } catch (error: any) {
    console.error('Error fetching public document categories:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch document categories', error: error.message },
      { status: 500 }
    );
  }
}
