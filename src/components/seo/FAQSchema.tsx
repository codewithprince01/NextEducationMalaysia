import JsonLd from '@/components/seo/JsonLd'
import { generateFAQSchema, type FaqEntry } from '@/lib/seo/faq-schema'

type Props = {
  faqs?: FaqEntry[] | null
}

export default function FAQSchema({ faqs = [] }: Props) {
  const schema = generateFAQSchema(faqs || [])
  if (!schema) return null
  return <JsonLd data={schema as any} />
}

