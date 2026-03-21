import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db-fresh'
import { serializeBigInt } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    const uniRows = await prisma.$queryRawUnsafe(
      `SELECT id FROM universities WHERE uname = ? AND status = 1 LIMIT 1`,
      slug
    ) as any[]

    if (!uniRows.length) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    const universityId = Number(uniRows[0].id)

    // Select only safe columns (avoid legacy invalid datetime fields)
    const photos = await prisma.$queryRawUnsafe(
      `SELECT id, university_id, photo_path, photo_name, title, is_featured
       FROM university_photos
       WHERE university_id = ?
       ORDER BY is_featured DESC, id ASC`,
      universityId
    ) as any[]

    return NextResponse.json(serializeBigInt(photos))
  } catch (err) {
    console.error('[University gallery API]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
