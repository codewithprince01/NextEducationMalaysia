import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { apiSuccess } from '@/backend'

export async function GET() {
  try {
    const years = await prisma.malaysiaApplication.findMany({
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'asc' },
    })
    return apiSuccess(years.map((y: { year: number }) => y.year))
  } catch (err) {
    console.error('[EMGS Years API]', err)
    return NextResponse.json({ error: 'Failed to fetch years' }, { status: 500 })
  }
}
