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

    const videos = await prisma.universityVideo.findMany({
      where: { university_id: university.id },
      orderBy: { created_at: 'desc' },
    })

    // Map video_link to video_url as expected by client
    const mappedVideos = videos.map(v => ({
      ...v,
      video_url: v.video_link
    }))

    return NextResponse.json({
      data: {
        universityVideos: serializeBigInt(mappedVideos)
      }
    })
  } catch (err) {
    console.error('[University videos API]', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
