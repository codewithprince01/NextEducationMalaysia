import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params

    const university = await prisma.university.findFirst({
      where: { uname: slug, status: true },
      select: { id: true },
    })

    if (!university) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }

    const photos = await prisma.universityPhoto.findMany({
      where: { university_id: university.id },
      select: { id: true, photo_path: true },
      orderBy: { is_featured: 'desc' },
    })

    return NextResponse.json(photos)
  } catch (err) {
    console.error('[University gallery API]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
