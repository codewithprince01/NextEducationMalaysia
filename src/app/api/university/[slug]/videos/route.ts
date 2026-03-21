import { NextRequest, NextResponse } from 'next/server'
import { universityService } from '@/backend'
import { serializeBigInt } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params
    const result = await universityService.getUniversityVideos(slug)
    if (!result) {
      return NextResponse.json({ error: 'University not found' }, { status: 404 })
    }
    const videos = Array.isArray(result.data) ? result.data : []
    const mappedVideos = videos.map((v: any) => ({
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
