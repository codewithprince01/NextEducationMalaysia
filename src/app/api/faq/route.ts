import { NextRequest, NextResponse } from 'next/server'
import { generateFAQSchema, normalizeFaqs } from '@/lib/seo/faq-schema'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const rawFaqs = Array.isArray(body?.faqs) ? body.faqs : []
    const faqs = normalizeFaqs(rawFaqs)
    const schema = generateFAQSchema(faqs)
    return NextResponse.json(schema || {})
  } catch {
    return NextResponse.json({}, { status: 200 })
  }
}

