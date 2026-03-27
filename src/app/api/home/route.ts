import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const website = process.env.SITE_VAR || 'MYS'
    const [universityRanks, testimonials] = await Promise.all([
      prisma.$queryRawUnsafe(
        `
        SELECT
          u.id,
          u.name,
          u.uname,
          u.qs_rank,
          u.times_rank,
          u.qs_asia_rank,
          (
            SELECT COUNT(*)
            FROM university_programs up
            WHERE up.university_id = u.id
              AND up.status = 1
          ) AS programs_count
        FROM universities u
        WHERE u.status = 1
          AND u.homeview = 1
          AND u.website = ?
          AND (
            COALESCE(TRIM(u.qs_rank), '') <> ''
            OR COALESCE(TRIM(u.times_rank), '') <> ''
            OR COALESCE(TRIM(u.qs_asia_rank), '') <> ''
          )
        ORDER BY CAST(NULLIF(u.qs_rank, '') AS UNSIGNED) ASC, u.name ASC
        LIMIT 30
        `,
        website,
      ) as Promise<any[]>,
      prisma.review.findMany({
        where: { status: 1 as any },
        include: {
           university: { select: { name: true, uname: true } }
        },
        take: 10,
        orderBy: { created_at: 'desc' }
      })
    ])

    return NextResponse.json({
      status: true,
      message: 'Homepage data fetched successfully',
      data: {
        universityRanks: universityRanks.map((u: any) => ({
          ...u,
          id: Number(u.id),
          _count: { programs: Number(u.programs_count || 0) }
        })),
        testimonials: testimonials.map((t: any) => ({
          ...t,
          id: Number(t.id),
          university_id: t.university_id ? Number(t.university_id) : null
        }))
      }
    })
  } catch (err) {
    console.error('[Home API]', err)
    return NextResponse.json({ 
      status: false,
      message: 'Internal server error',
      data: { universityRanks: [], testimonials: [] } 
    }, { status: 500 })
  }
}
