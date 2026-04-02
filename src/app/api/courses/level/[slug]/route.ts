import { NextRequest, NextResponse } from 'next/server'
import { getCourseLevelPageData } from '@/backend/services/course-level.service'

type Params = { params: Promise<{ slug: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { slug } = await params
    if (!slug) {
      return NextResponse.json({ status: false, message: 'Invalid level slug' }, { status: 400 })
    }

    const data = await getCourseLevelPageData(slug)
    if (!data) {
      return NextResponse.json({ status: false, message: 'Level not found' }, { status: 404 })
    }

    return NextResponse.json({ status: true, data })
  } catch (error) {
    console.error('GET /api/courses/level/[slug] failed:', error)
    return NextResponse.json(
      { status: false, message: (error as any)?.message || 'Failed to fetch level data' },
      { status: 500 }
    )
  }
}
