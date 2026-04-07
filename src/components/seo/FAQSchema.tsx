import { generateFAQSchema, type FaqEntry } from '@/lib/seo/faq-schema'

type Props = {
  faqs?: FaqEntry[] | null
}

export default function FAQSchema({ faqs = [] }: Props) {
  const schema = generateFAQSchema(Array.isArray(faqs) ? faqs : [])
  if (!schema) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

