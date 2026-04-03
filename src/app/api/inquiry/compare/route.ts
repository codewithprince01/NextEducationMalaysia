import { NextRequest, NextResponse } from 'next/server'
import { inquiryService } from '@/backend'
import { buildLeadSource } from '@/backend/utils/lead-source'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { name, email, country_code, mobile, nationality, universities } = body
    
    if (!name || !email || !mobile || !universities) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const sourceMeta = buildLeadSource({
      formType: body.formType || 'Compare Universities',
      source: body.source || 'Compare Universities Request',
      requestfor: 'comparison',
      sourceUrl: body.sourceUrl,
      sourcePath: body.source_path,
    });

    const compared = Array.isArray(universities) ? universities.join(', ') : String(universities || '');
    const lead = await inquiryService.createLead({
      name: String(name).trim(),
      email: String(email).trim(),
      country_code: String(country_code || '91').replace('+', '').trim() || '91',
      mobile: String(mobile).trim(),
      nationality: String(nationality || '').trim() || undefined,
      source: sourceMeta.source,
      source_path: sourceMeta.source_path,
      highest_qualification: String(body.highest_qualification || '').trim() || undefined,
      interested_course_category: String(body.interested_course_category || '').trim() || undefined,
      message: compared ? `Universities to compare: ${compared}` : undefined,
      extra_fields: body,
    });

    return NextResponse.json({
      success: true,
      message: 'Comparison request submitted successfully',
      data: { id: lead.id }
    })

  } catch (error: unknown) {
    console.error('[Compare API]', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
