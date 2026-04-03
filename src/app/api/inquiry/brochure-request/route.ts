import { NextRequest, NextResponse } from 'next/server'
import { inquiryService } from '@/backend'
import { buildLeadSource } from '@/backend/utils/lead-source'

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

    const sourceMeta = buildLeadSource({
      formType: body.formType || 'Brochure Download',
      source: body.source || 'Brochure Request',
      requestfor: 'brochure',
      sourceUrl: body.sourceUrl,
      sourcePath: body.source_path,
    });

    const lead = await inquiryService.createLead({
      name: String(name).trim(),
      email: String(email).trim(),
      country_code: String(country_code || '91').replace('+', '').trim() || '91',
      mobile: String(mobile).trim(),
      nationality: String(nationality || '').trim() || undefined,
      university_id: String(university_id),
      source: sourceMeta.source,
      source_path: sourceMeta.source_path,
      highest_qualification: String(body.highest_qualification || '').trim() || undefined,
      interested_course_category: String(body.interested_course_category || '').trim() || undefined,
      extra_fields: body,
    });

    return NextResponse.json({
      success: true,
      message: 'Brochure request submitted successfully',
      data: { id: lead.id }
    })

  } catch (error: unknown) {
    console.error('[Brochure Request API]', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
