import { NextRequest, NextResponse } from 'next/server'
import { inquiryService } from '@/backend'
import { buildLeadSource } from '@/backend/utils/lead-source'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const { name, email, country_code, mobile, nationality } = body
    
    if (!name || !email || !mobile) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const sourceMeta = buildLeadSource({
      formType: body.formType || 'Counselling Form',
      source: body.source || 'Counselling Request',
      requestfor: 'counselling',
      sourceUrl: body.sourceUrl,
      sourcePath: body.source_path,
    });

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
      interest: String(body.interested_course_category || '').trim() || undefined,
      dayslot: String(body.preferred_date || body.dayslot || '').trim() || undefined,
      timeslot: String(body.preferred_time || body.timeslot || '').trim() || undefined,
      time_zone: String(body.time_zone || '').trim() || undefined,
      message: String(body.message || '').trim() || undefined,
      university_id: body.university_id ? String(body.university_id) : undefined,
      university: body.university_name ? String(body.university_name) : undefined,
      extra_fields: body,
    });

    return NextResponse.json({
      success: true,
      message: 'Counselling session booked successfully',
      data: { id: lead.id }
    })

  } catch (error: unknown) {
    console.error('[Book Session API]', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Internal server error', details: errorMessage },
      { status: 500 }
    )
  }
}
