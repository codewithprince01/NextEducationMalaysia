import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10))
    const level = searchParams.get('level')
    const perPage = 20

    // Look up the university
    const university = await prisma.university.findFirst({
      where: { uname: slug, status: true },
      select: { id: true, name: true },
    })

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    const where: Record<string, unknown> = {
      university_id: university.id,
      status: true,
    }
    if (level) where.level = level

    const [total, courses] = await Promise.all([
      prisma.universityProgram.count({ where: where as any }),
      prisma.universityProgram.findMany({
        where: where as any,
        select: {
          id: true,
          course_name: true,
          slug: true,
          level: true,
          duration: true,
          tution_fee: true,
          intake: true,
        },
        orderBy: { course_name: 'asc' },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
    ])

    // Distinct levels for filters
    const levels = await prisma.universityProgram.findMany({
      where: { university_id: university.id, status: true, level: { not: null } },
      select: { level: true },
      distinct: ['level'],
      orderBy: { level: 'asc' },
    })

    return NextResponse.json({
      programs: {
        data: courses,
        current_page: page,
        last_page: Math.ceil(total / perPage),
        total,
      },
      filterOptions: {
        levels: levels.map(l => l.level).filter(Boolean),
        categories: [],
        study_modes: [],
      },
      universityName: university.name,
    })
  } catch (err) {
    console.error('[University courses API]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
