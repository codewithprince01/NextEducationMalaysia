import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { name, email, country_code, mobile, nationality, university_id } = body
    
    if (!name || !email || !mobile || !university_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create fee structure inquiry record - using raw query for missing model
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prismaAny = prisma as any
    const inquiry = await prismaAny.inquiry.create({
      data: {
        name,
        email,
        country_code,
        mobile,
        nationality,
        university_id: Number(university_id),
        requestfor: 'fees',
        source_path: body.source_path || '',
        highest_qualification: body.highest_qualification || '',
        interested_course_category: body.interested_course_category || '',
        status: true,
        created_at: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Fee structure request submitted successfully',
      data: { id: inquiry.id }
    })

  } catch (error: unknown) {
    console.error('[Fee Structure API]', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
