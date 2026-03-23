import { NextRequest } from 'next/server';
import { withMiddleware, apiError, apiSuccess } from '@/backend';
import { prisma } from '@/lib/db-fresh';
import { serializeBigInt } from '@/lib/utils';

async function getHandler(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const unamesParam = searchParams.get('unames') || '';
    const unames = unamesParam
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean)
      .slice(0, 3);

    if (unames.length === 0) {
      return apiError('At least one university slug is required', 400);
    }

    const placeholders = unames.map(() => '?').join(',');
    const rows: any[] = await prisma.$queryRawUnsafe(
      `
      SELECT
        u.id,
        u.name,
        u.uname,
        u.city,
        u.state,
        u.established_year,
        u.qs_rank,
        u.rating,
        u.click,
        u.shortnote,
        it.type AS institute_type,
        (
          SELECT COUNT(*)
          FROM university_programs up
          WHERE up.university_id = u.id AND up.status = 1
        ) AS active_programs_count
      FROM universities u
      LEFT JOIN institute_types it ON it.id = u.institute_type
      WHERE u.status = 1 AND u.website = 'MYS' AND u.uname IN (${placeholders})
      `,
      ...unames
    );

    const ordered = unames
      .map((uname) => rows.find((r: any) => r.uname === uname))
      .filter(Boolean);

    return apiSuccess(serializeBigInt(ordered), 'University compare data fetched successfully');
  } catch (error: any) {
    return apiError(error?.message || 'Failed to fetch compare data');
  }
}

export const GET = withMiddleware()(getHandler);

