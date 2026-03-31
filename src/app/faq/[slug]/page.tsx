import { notFound } from 'next/navigation'
import { extractMetadataText, resolveStaticMetaAny } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import { getFaqs } from '@/lib/queries/home'
import JsonLd from '@/components/seo/JsonLd'
import FAQSchema from '@/components/seo/FAQSchema'
import { SITE_URL } from '@/lib/constants'
import FaqsClient from '@/app/faqs/FaqsClient'

type PageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  return resolveStaticMetaAny(
    [`faq/${slug}`, 'faq', 'FAQ'],
    `/faq/${slug}`,
    `FAQs - ${slug.replace(/-/g, ' ')}`,
  )
}

export default async function FaqCategoryPage({ params }: PageProps) {
  const { slug } = await params
  const activeSlug = String(slug || '').trim().toLowerCase()
  if (!activeSlug) notFound()

  const meta = await resolveStaticMetaAny(
    [`faq/${activeSlug}`, 'faq', 'FAQ'],
    `/faq/${activeSlug}`,
    `FAQs - ${activeSlug.replace(/-/g, ' ')}`,
  )
  const { title, description } = extractMetadataText(meta)

  const faqs = await getFaqs()
  const byCategory = new Map<
    string,
    {
      id: number
      category_name: string
      category_slug: string
      faqs: Array<{ id: number; question: string; answer: string }>
    }
  >()

  for (const row of faqs as any[]) {
    const categorySlug = String(row?.category?.category_slug || '').trim()
    if (!categorySlug) continue
    const name = String(row?.category?.category_name || '').trim()
    if (!byCategory.has(categorySlug)) {
      byCategory.set(categorySlug, {
        id: Number(row?.category?.id || 0),
        category_name: name,
        category_slug: categorySlug,
        faqs: [],
      })
    }
    byCategory.get(categorySlug)!.faqs.push({
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

  if (!initialCategories.some((item) => item.category_slug === activeSlug)) {
    notFound()
  }

  const initialFaqsByCategory = [...byCategory.entries()].reduce(
    (acc, [categorySlug, value]) => {
      acc[categorySlug] = value.faqs
      return acc
    },
    {} as Record<string, Array<{ id: number; question: string; answer: string }>>,
  )
  const activeFaqs = initialFaqsByCategory[activeSlug] || []

  const activeCategoryName =
    initialCategories.find((item) => item.category_slug === activeSlug)?.category_name || activeSlug

  return (
    <>
      <FAQSchema faqs={activeFaqs as any[]} />
      <JsonLd
        data={breadcrumbJsonLd(
          [
            { name: 'Home', url: SITE_URL },
            { name: 'FAQs', url: `${SITE_URL}/faqs` },
            { name: activeCategoryName, url: `${SITE_URL}/faq/${activeSlug}` },
          ],
          { name: title, description },
        )}
      />
      <main>
        <FaqsClient
          initialCategories={initialCategories}
          initialFaqsByCategory={initialFaqsByCategory}
          initialActiveSlug={activeSlug}
        />
      </main>
    </>
  )
}
