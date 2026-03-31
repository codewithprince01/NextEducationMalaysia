import { extractMetadataText, resolveStaticMeta } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import { getFaqs } from '@/lib/queries/home'
import JsonLd from '@/components/seo/JsonLd'
import FAQSchema from '@/components/seo/FAQSchema'
import { SITE_URL } from '@/lib/constants'
import FaqsClient from './FaqsClient'

export async function generateMetadata() {
  return resolveStaticMeta('FAQ', '/faqs')
}

export default async function FaqsPage() {
  const meta = await resolveStaticMeta('FAQ', '/faqs')
  const { title, description } = extractMetadataText(meta)
  const faqs = await getFaqs()
  const byCategory = new Map<string, { id: number; category_name: string; category_slug: string; faqs: Array<{ id: number; question: string; answer: string }> }>()

  for (const row of faqs as any[]) {
    const slug = String(row?.category?.category_slug || '').trim()
    if (!slug) continue
    const name = String(row?.category?.category_name || '').trim()
    if (!byCategory.has(slug)) {
      byCategory.set(slug, {
        id: Number(row?.category?.id || 0),
        category_name: name,
        category_slug: slug,
        faqs: [],
      })
    }
    byCategory.get(slug)!.faqs.push({
      id: Number(row?.id || 0),
      question: String(row?.question || '').trim(),
      answer: String(row?.answer || '').trim(),
    })
  }

  const initialCategories = [...byCategory.values()]
    .map((item) => ({
      id: item.id,
      category_name: item.category_name,
      category_slug: item.category_slug,
    }))
    .filter((item) => !!item.category_slug)

  const initialFaqsByCategory = [...byCategory.entries()].reduce(
    (acc, [slug, value]) => {
      acc[slug] = value.faqs
      return acc
    },
    {} as Record<string, Array<{ id: number; question: string; answer: string }>>
  )
  const defaultActiveSlug = initialCategories[0]?.category_slug || ''
  const activeFaqs = defaultActiveSlug ? (initialFaqsByCategory[defaultActiveSlug] || []) : []

  return (
    <>
      <FAQSchema faqs={activeFaqs as any[]} />
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'FAQs', url: `${SITE_URL}/faqs` }
      ], { name: title, description })} />
      <main>
        <FaqsClient
          initialCategories={initialCategories}
          initialFaqsByCategory={initialFaqsByCategory}
        />
      </main>
    </>
  )
}
