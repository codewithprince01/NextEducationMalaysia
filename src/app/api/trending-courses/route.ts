import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

const SITE_VAR = process.env.SITE_VAR || 'MYS'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const rawLimit = Number(searchParams.get('limit') || 12)
  const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(rawLimit, 1), 30) : 12

  try {
    const rows = (await prisma.$queryRawUnsafe(
      `
      SELECT cs.id, cs.name, cs.slug
      FROM course_specializations cs
      WHERE cs.status = 1
        AND cs.website = ?
        AND cs.slug IS NOT NULL
        AND cs.name IS NOT NULL
        AND EXISTS (
          SELECT 1
          FROM specialization_contents sc
          WHERE sc.specialization_id = cs.id
        )
      ORDER BY RAND()
      LIMIT ?
      `,
      SITE_VAR,
      limit,
    )) as Array<{ id: number; name: string; slug: string }>

    if (rows.length > 0) {
      return NextResponse.json({ data: { courses: rows } })
    }

    // Fallback without website constraint.
    const fallbackRows = (await prisma.$queryRawUnsafe(
      `
      SELECT cs.id, cs.name, cs.slug
      FROM course_specializations cs
      WHERE cs.status = 1
        AND cs.slug IS NOT NULL
        AND cs.name IS NOT NULL
      ORDER BY RAND()
      LIMIT ?
      `,
      limit,
    )) as Array<{ id: number; name: string; slug: string }>

    return NextResponse.json({ data: { courses: fallbackRows } })
  } catch {
    return NextResponse.json({ data: { courses: [] } }, { status: 200 })
  }
}

