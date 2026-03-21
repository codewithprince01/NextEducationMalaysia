import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db-fresh'
import { serializeBigInt } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params

    const uniRow = await prisma.$queryRawUnsafe(`
      SELECT id, qs_rank, times_rank, qs_asia_rank
      FROM universities
      WHERE uname = ? AND status = 1
      LIMIT 1
    `, slug) as Promise<any[]>

    if (!uniRow.length) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }
    const university = uniRow[0]
    const rankings = await prisma.$queryRawUnsafe(`
      SELECT id, ranking_body, rank, year, position
      FROM university_rankings
      WHERE university_id = ?
      ORDER BY position ASC, id ASC
    `, Number(university.id)) as any[]

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
