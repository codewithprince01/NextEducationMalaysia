import { NextResponse } from 'next/server'
import { universityService } from '@/backend'

export const revalidate = 1800

type Params = { params: Promise<{ slug: string }> }

export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params
    const result = await universityService.getUniversityOverview(slug)

    if (!result) {
      return NextResponse.json(
        { status: false, message: 'University not found', data: {} },
        { status: 404 }
      )
    }

    return NextResponse.json({
      status: true,
      data: result.data ?? {},
    })
  } catch (error: any) {
    return NextResponse.json(
      { status: false, message: error?.message || 'Failed to fetch popular courses', data: {} },
      { status: 500 }
    )
  }
}
