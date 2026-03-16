import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const [universityRanks, testimonials] = await Promise.all([
      prisma.university.findMany({
        where: {
          status: true,
          homeview: true,
          OR: [
            { qs_rank: { not: '' } },
            { times_rank: { not: '' } },
            { qs_asia_rank: { not: '' } },
          ],
        },
        select: {
          id: true,
          name: true,
          uname: true,
          qs_rank: true,
          times_rank: true,
          qs_asia_rank: true,
          _count: {
            select: { programs: { where: { status: true } } }
          }
        },
        orderBy: { qs_rank: 'asc' },
        take: 30,
      }),
      prisma.review.findMany({
        where: { status: true },
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
          _count: { programs: Number(u._count?.programs || 0) }
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
