import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    const categories = await prisma.malaysiaApplicationCategory.findMany({
      where: {
        applications: { some: {} }
      },
      select: {
        id: true,
        category_name: true,
        color_class: true
      },
      orderBy: { category_name: 'asc' }
    })
    return NextResponse.json(categories)
  } catch (err) {
    console.error('[EMGS Categories API]', err)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
