import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const years = await (prisma as any).internationalStudentData.findMany({
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'asc' },
    })
    return NextResponse.json(years.map((y: any) => y.year))
  } catch (err) {
    console.error('[Nationality Years API]', err)
    return NextResponse.json({ error: 'Failed to fetch years' }, { status: 500 })
  }
}
