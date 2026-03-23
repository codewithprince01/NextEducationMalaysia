import { NextRequest, NextResponse } from 'next/server'
import { universityService } from '@/backend'

/**
 * Public proxy for universities listing used by frontend pages.
 * Keeps response shape aligned with /api/v1/universities/universities-in-malaysia.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const params = {
      search: searchParams.get('search') || undefined,
      institute_type: searchParams.get('institute_type') || undefined,
      type_slug: searchParams.get('type_slug') || undefined,
      state: searchParams.get('state') || undefined,
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('per_page') || searchParams.get('limit_per_page') || '21', 10),
    }

    const data = await universityService.getUniversitiesInMalaysia(params)
    return NextResponse.json({
      status: true,
      message: 'University list fetched successfully',
      data,
    })
  } catch (error) {
    console.error('GET /api/universities/universities-in-malaysia failed:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch universities' },
      { status: 500 }
    )
  }
}

