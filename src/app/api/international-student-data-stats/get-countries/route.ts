import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const countries = await (prisma as any).internationalStudentDataCountry.findMany({
      where: {
        applications: { some: {} }
      },
      select: {
        id: true,
        country_name: true,
        color_class: true
      },
      orderBy: { country_name: 'asc' }
    })
    return NextResponse.json(countries)
  } catch (err) {
    console.error('[Nationality Countries API]', err)
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 })
  }
}
