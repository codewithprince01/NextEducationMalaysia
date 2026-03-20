import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { serializeBigInt } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params

    const university = await prisma.university.findFirst({
      where: { uname: slug, status: true },
      select: { 
        id: true,
        qs_rank: true,
        times_rank: true,
        qs_asia_rank: true
      },
    })

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    const rankings = await prisma.universityRanking.findMany({
      where: { university_id: university.id },
      orderBy: { position: 'asc' },
    })

    return NextResponse.json({
      data: {
        rankings: serializeBigInt(rankings),
        qs_rank: university.qs_rank,
        times_rank: university.times_rank,
        qs_asia_rank: university.qs_asia_rank
      }
    })
  } catch (err) {
    console.error('[University rankings API]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
