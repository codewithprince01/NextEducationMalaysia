export type FaqEntry = {
  question?: string | null
  answer?: string | null
}

const stripHtml = (value: string): string =>
  String(value || '')
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export function normalizeFaqs(faqs: FaqEntry[] = []): Array<{ question: string; answer: string }> {
  const seen = new Set<string>()
  const normalized: Array<{ question: string; answer: string }> = []

  for (const item of faqs) {
    const question = stripHtml(String(item?.question || ''))
    const answer = stripHtml(String(item?.answer || ''))
    if (!question || !answer) continue

    const key = `${question.toLowerCase()}::${answer.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    normalized.push({ question, answer })
  }

  return normalized
}

export function generateFAQSchema(faqs: FaqEntry[] = []) {
  const normalized = normalizeFaqs(faqs)
  if (normalized.length === 0) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: normalized.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}

