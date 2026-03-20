import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { apiSuccess, serializeBigInt } from '@/backend'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const yearParam = searchParams.get('year')
    const yearsFilter = yearParam 
      ? yearParam.split(',').map(y => parseInt(y.trim())).filter(y => !isNaN(y))
      : undefined

    const rows = await prisma.malaysiaApplication.findMany({
      where: {
        year: yearsFilter ? { in: yearsFilter } : undefined
      },
      include: {
        category: true
      },
      orderBy: { year: 'desc' }
    })

    // Grouping logic
    const groupedMap = new Map<number, any>()

    rows.forEach((row: any) => {
      if (!groupedMap.has(row.year)) {
        groupedMap.set(row.year, {
          year: row.year,
          total: 0,
          items: []
        })
      }
      const group = groupedMap.get(row.year)
      const count = row.count || 0
      group.total += count
      group.items.push({
        category_id: row.category_id,
        category: row.category?.category_name ?? null,
        slug: row.category?.category_slug ?? null,
        color: row.category?.color_class ?? null,
        count: count
      })
    })

    let yearsData = Array.from(groupedMap.values())

    if (yearsFilter) {
      // Keep requested order if filter provided
      yearsData = yearsFilter
        .map(y => groupedMap.get(y))
        .filter(Boolean)
    } else {
      yearsData.sort((a, b) => b.year - a.year)
    }

    const overallTotal = yearsData.reduce((sum, y) => sum + y.total, 0)

    return apiSuccess(serializeBigInt({
      overall_total: overallTotal,
      years: yearsData
    }))
  } catch (err: any) {
    console.error('[EMGS Stats API]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
