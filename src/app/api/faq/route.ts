import { NextRequest, NextResponse } from 'next/server'
import {
  buildFallbackFaqSchema,
  parseFaqSchemaFromModelText,
  type DynamicFaqInput,
} from '@/lib/seo/dynamic-faq'

export const dynamic = 'force-dynamic'

const MAX_LEN = 4000

const safe = (value: unknown) => String(value ?? '').trim().slice(0, MAX_LEN)

export async function POST(request: NextRequest) {
  let input: DynamicFaqInput = {}

  try {
    const body = await request.json()
    input = {
      title: safe(body?.title),
      description: safe(body?.description),
      content: safe(body?.content),
    }
  } catch {
    input = {}
  }

  if (!input.title && !input.description && !input.content) {
    return NextResponse.json(buildFallbackFaqSchema(input))
  }

  const openAiKey = process.env.OPENAI_API_KEY
  if (!openAiKey) {
    return NextResponse.json(buildFallbackFaqSchema(input))
  }

  const prompt = `
You are an SEO expert.

Generate 6 highly relevant FAQs in JSON-LD format.

Topic: ${input.title || 'Study in Malaysia'}
Description: ${input.description || 'Education in Malaysia'}
Content: ${input.content || 'Higher education, fees, eligibility, career outcomes'}

Rules:
- Use FAQPage schema
- Output ONLY valid JSON
- Each answer must be 2-3 lines
- Questions must target search intent (fees, eligibility, duration, career)
`.trim()

  try {
    const model = process.env.OPENAI_FAQ_MODEL || 'gpt-4o-mini'
    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        messages: [
          { role: 'system', content: 'Return only valid JSON. No markdown. No extra text.' },
          { role: 'user', content: prompt },
        ],
      }),
      cache: 'no-store',
    })

    if (!aiResponse.ok) {
      return NextResponse.json(buildFallbackFaqSchema(input))
    }

    const aiJson = await aiResponse.json()
    const modelText: string =
      aiJson?.choices?.[0]?.message?.content ||
      aiJson?.output_text ||
      ''

    const schema = parseFaqSchemaFromModelText(modelText, input)
    return NextResponse.json(schema)
  } catch {
    return NextResponse.json(buildFallbackFaqSchema(input))
  }
}
