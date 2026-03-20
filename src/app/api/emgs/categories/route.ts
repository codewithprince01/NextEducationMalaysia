import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { apiSuccess, serializeBigInt } from '@/backend'

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
    return apiSuccess(serializeBigInt(categories))
  } catch (err: any) {
    console.error('[EMGS Categories API]', err)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}
