import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

function serializeBigInt<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (_key, v) => (typeof v === 'bigint' ? Number(v) : v)),
  )
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const exclude = (searchParams.get('exclude') || '').trim()

    const featuredSql = exclude
      ? `
        SELECT id, name, uname, city, logo_path
        FROM universities
        WHERE status = 1 AND featured = 1 AND uname <> ?
        ORDER BY RAND()
        LIMIT 20
      `
      : `
        SELECT id, name, uname, city, logo_path
        FROM universities
        WHERE status = 1 AND featured = 1
        ORDER BY RAND()
        LIMIT 20
      `

    let universities: any[] = await prisma.$queryRawUnsafe(`
      ${featuredSql}
    `, ...(exclude ? [exclude] : []))

    if (!Array.isArray(universities) || universities.length === 0) {
      const activeSql = exclude
        ? `
          SELECT id, name, uname, city, logo_path
          FROM universities
          WHERE status = 1 AND uname <> ?
          ORDER BY RAND()
          LIMIT 20
        `
        : `
          SELECT id, name, uname, city, logo_path
          FROM universities
          WHERE status = 1
          ORDER BY RAND()
          LIMIT 20
        `
      universities = await prisma.$queryRawUnsafe(`
        ${activeSql}
      `, ...(exclude ? [exclude] : []))
    }

    return NextResponse.json(serializeBigInt({
      status: true,
      data: { universities: universities || [] },
    }))
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error?.message || 'Failed to fetch featured universities', data: { universities: [] } },
      { status: 500 }
    )
  }
}
