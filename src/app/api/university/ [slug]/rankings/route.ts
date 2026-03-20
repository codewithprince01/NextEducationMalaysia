import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { serializeBigInt } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params

    const university = await prisma.university.findFirst({
      where: { uname: slug, status: true as any },
      select: { id: true },
    })

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    const rankings = await prisma.universityRanking.findMany({
      where: { university_id: university.id },
      orderBy: { position: 'asc' },
    })

    return NextResponse.json(serializeBigInt(rankings))
  } catch (err) {
    console.error('[University rankings API]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
