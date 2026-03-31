import { SITE_URL } from '@/lib/constants'

export type DynamicFaqInput = {
  title?: string
  description?: string
  content?: string
  path?: string
}

export type FaqItem = {
  question: string
  answer: string
}

export type FaqJsonLd = {
  '@context': 'https://schema.org'
  '@type': 'FAQPage'
  mainEntity: Array<{
    '@type': 'Question'
    name: string
    acceptedAnswer: {
      '@type': 'Answer'
      text: string
    }
  }>
}

const normalizeText = (value: unknown) => String(value ?? '').replace(/\s+/g, ' ').trim()

const toFaqSchema = (faqs: FaqItem[]): FaqJsonLd => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((item) => ({
    '@type': 'Question',
    name: normalizeText(item.question),
    acceptedAnswer: {
      '@type': 'Answer',
      text: normalizeText(item.answer),
    },
  })),
})

export const extractFaqItems = (schema?: Partial<FaqJsonLd> | null): FaqItem[] => {
  if (!schema || !Array.isArray((schema as any).mainEntity)) return []
  return (schema as any).mainEntity
    .map((q: any) => ({
      question: normalizeText(q?.name),
      answer: normalizeText(q?.acceptedAnswer?.text),
    }))
    .filter((item: FaqItem) => item.question && item.answer)
}

export const buildFallbackFaqSchema = (input: DynamicFaqInput): FaqJsonLd => {
  const title = normalizeText(input.title || 'Study in Malaysia')
  const description = normalizeText(input.description || 'Courses, universities, fees, eligibility, and careers')

  const faqs: FaqItem[] = [
    {
      question: `What are the typical fees for ${title}?`,
      answer:
        `${title} fees vary by university, level, and study mode. Compare tuition, intake, and scholarship options before applying for the best value.`,
    },
    {
      question: `Who is eligible to apply for ${title}?`,
      answer:
        `Eligibility depends on your previous qualification, language proficiency, and specific university criteria. Always verify entry requirements and required documents before applying.`,
    },
    {
      question: `How long does it take to complete ${title}?`,
      answer:
        `Duration usually depends on the program level and institution structure. Most programs list standard completion timelines, with flexibility for part-time and credit-transfer paths.`,
    },
    {
      question: `What career opportunities are available after ${title}?`,
      answer:
        `Career outcomes include industry roles, internships, and higher-study pathways based on specialization. Skill-focused programs can improve employability in Malaysia and global markets.`,
    },
    {
      question: `Are scholarships available for ${title}?`,
      answer:
        `Many universities offer merit-based, need-based, and country-specific scholarships. Check current scholarship cycles, required scores, and application deadlines early.`,
    },
    {
      question: `How do I choose the right university for ${title}?`,
      answer:
        `Shortlist universities based on accreditation, fees, ranking, location, and outcomes. Compare curriculum, intake months, and support services before finalizing your application.`,
    },
  ]

  // keep output stable & unique by adding page context in one answer when available
  const pagePath = normalizeText(input.path || '')
  if (pagePath) {
    faqs[5].answer = `${faqs[5].answer} This guidance is tailored for ${pagePath}.`
  }

  return toFaqSchema(faqs)
}

const parseJsonFromText = (value: string): unknown => {
  const trimmed = normalizeText(value)
  if (!trimmed) return null

  try {
    return JSON.parse(trimmed)
  } catch {
    // try fenced/code-wrapped content recovery
    const start = trimmed.indexOf('{')
    const end = trimmed.lastIndexOf('}')
    if (start !== -1 && end !== -1 && end > start) {
      const slice = trimmed.slice(start, end + 1)
      return JSON.parse(slice)
    }
    throw new Error('Invalid JSON from FAQ model')
  }
}

const normalizeFaqSchema = (raw: unknown, fallbackInput: DynamicFaqInput): FaqJsonLd => {
  if (!raw || typeof raw !== 'object') return buildFallbackFaqSchema(fallbackInput)

  const obj = raw as any
  const faqPage = obj?.['@type'] === 'FAQPage' ? obj : obj?.faqPage || obj?.schema || obj
  const entities = Array.isArray(faqPage?.mainEntity) ? faqPage.mainEntity : []

  const cleaned = entities
    .map((item: any) => ({
      question: normalizeText(item?.name || item?.question),
      answer: normalizeText(item?.acceptedAnswer?.text || item?.answer),
    }))
    .filter((item: FaqItem) => item.question.length > 0 && item.answer.length > 0)
    .slice(0, 6)

  if (cleaned.length < 4) return buildFallbackFaqSchema(fallbackInput)
  return toFaqSchema(cleaned)
}

export async function fetchDynamicFaqSchema(input: DynamicFaqInput): Promise<FaqJsonLd> {
  const payload = {
    title: normalizeText(input.title),
    description: normalizeText(input.description),
    content: normalizeText(input.content),
  }

  const baseFromEnv =
    process.env.FAQ_API_BASE_URL ||
    process.env.INTERNAL_APP_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : SITE_URL)

  try {
    const response = await fetch(`${baseFromEnv.replace(/\/$/, '')}/api/faq`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      cache: 'no-store',
    })

    if (!response.ok) throw new Error(`FAQ API failed: ${response.status}`)
    const json = await response.json()
    return normalizeFaqSchema(json, input)
  } catch {
    return buildFallbackFaqSchema(input)
  }
}

export function parseFaqSchemaFromModelText(modelOutput: string, fallbackInput: DynamicFaqInput): FaqJsonLd {
  try {
    const parsed = parseJsonFromText(modelOutput)
    return normalizeFaqSchema(parsed, fallbackInput)
  } catch {
    return buildFallbackFaqSchema(fallbackInput)
  }
}
