import { getInstituteTypes, getPageContent } from '@/lib/queries/universities'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import UniversityListClient from './UniversityListClient'
import { serializeBigInt } from '@/lib/utils'
import { universityService } from '@/backend'
import FaqSection from '@/components/seo/FaqSection'
import { normalizeFaqs } from '@/lib/seo/faq-schema'
import { prisma } from '@/lib/db-fresh'
import { SITE_URL } from '@/lib/constants'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type Props = { params: Promise<{ type: string }> }

const findType = (types: any[], rawType: string) => {
  const base = rawType.replace(/-in-malaysia$/, '')
  const normalized = base.replace(/-universities$/, '-university').replace(/-institutions$/, '-institution')

  const aliases = new Set<string>([
    rawType,
    base,
    normalized,
    normalized.replace(/-institution$/, ''),
    normalized.replace(/-university$/, ''),
    normalized.replace(/-university$/, '-universities'),
    normalized.replace(/-institution$/, '-institutions'),
    base.replace(/-university$/, '-universities'),
    base.replace(/-institution$/, '-institutions'),
  ])

  return types.find((t: any) => aliases.has(String(t.slug || '')) || aliases.has(String(t.seo_title_slug || '')))
}

const getUniversityFaqs = async (typeSlug: string) => {
  const aliases = Array.from(new Set([
    String(typeSlug || '').toLowerCase(),
    String(typeSlug || '').toLowerCase().replace(/-in-malaysia$/, ''),
    'universities',
    'university',
  ])).filter(Boolean)

  if (aliases.length === 0) return []

  const rows = await prisma.$queryRawUnsafe(
    `
      SELECT f.question, f.answer
      FROM faq_categories fc
      INNER JOIN faqs f ON f.category_id = fc.id
      WHERE LOWER(fc.category_slug) IN (${aliases.map(() => '?').join(', ')})
      ORDER BY f.id ASC
      LIMIT 12
    `,
    ...aliases
  ) as any[]

  return normalizeFaqs(rows)
}

export async function generateStaticParams() {
  try {
    const types = await getInstituteTypes() as any[]
    const params: { type: string }[] = []
    
    types.forEach((t: any) => {
      const slug = t.seo_title_slug || t.slug
      if (slug) {
        params.push({ type: slug })
        // Also pre-render the -in-malaysia version for better performance
        params.push({ type: `${slug}-in-malaysia` })
      }
    })
    
    return params
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const { type } = await params
    const isAllAlias = type === 'universities-in-malaysia' || type === 'international-school-in-malaysia'
    const canonicalType = isAllAlias ? 'international-school-in-malaysia' : type
    const cleanTypeSlug = canonicalType.replace(/-in-malaysia$/, '')

    const listing = await universityService.getUniversitiesInMalaysia({
      type_slug: cleanTypeSlug,
      page: 1,
      limit: 21,
    })
    const seo = listing?.seo || {}
    const title = seo.meta_title || `${type.replace(/-/g, ' ')} in Malaysia - Education Malaysia`
    const description = seo.meta_description || `Explore the best ${type.replace(/-/g, ' ')} in Malaysia.`
    const keywords = seo.meta_keyword || undefined
    const ogImage = seo.og_image_path || `${SITE_URL}/og-default.png`
    const canonical = `${SITE_URL}/universities/${canonicalType}`

    return {
      title,
      description,
      keywords,
      robots: { index: true, follow: true },
      alternates: { canonical },
      openGraph: {
        type: 'website',
        title,
        description,
        url: canonical,
        siteName: 'Education Malaysia',
        locale: 'en_US',
        images: [{ url: ogImage }],
      },
      twitter: {
        card: 'summary_large_image',
        site: '@educatemalaysia',
        title,
        description,
        images: [ogImage],
      },
      other: {
        'server-rendered-meta': 'true',
      },
    }
  } catch {
    return { title: 'Universities in Malaysia' }
  }
}

export default async function UniversitiesByTypePage({ params }: Props) {
  const { type } = await params
  if (type === 'universities-in-malaysia') {
    redirect('/universities/international-school-in-malaysia')
  }

  let types: any[] = []
  try {
    types = await getInstituteTypes() as any[]
  } catch {
    types = []
  }

  const normalized = type.replace(/-in-malaysia$/, '').replace(/-universities$/, '-university').replace(/-institutions$/, '-institution')
  const current = findType(types, type)

  if (!current && types.length > 0) {
    // Fallback for international schools or others not in DB
    if (normalized === 'international-school') {
      const typeName = 'International Schools';
      const pageData =
        (await getPageContent('universities-in-malaysia')) ||
        (await getPageContent('universities')) ||
        (await getPageContent(type))
      const finalContent = pageData?.description || 'Explore the best universities in Malaysia.'
      const finalHeading = pageData?.heading || typeName
      const faqItems = await getUniversityFaqs(type)
      return (
        <>
          <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center"><div className="animate-pulse h-8 bg-gray-200 rounded w-64 mx-auto" /></div>}>
            <UniversityListClient
              typeSlug={type}
              typeName={finalHeading}
              allTypes={serializeBigInt(types) as any[]}
              pageContent={finalContent}
            />
          </Suspense>
          <FaqSection title={`${finalHeading} - FAQs`} faqs={faqItems} />
        </>
      )
    }
    notFound()
  }

  const typeName = current?.type ?? type.replace(/-/g, ' ')
  const cleanTypeSlug = type.replace(/-in-malaysia$/, '')
  const normalizedForFilter = cleanTypeSlug.toLowerCase()
  const backendTypeSlug =
    normalizedForFilter === 'universities' ||
    normalizedForFilter.includes('international') ||
    normalizedForFilter.includes('school')
      ? undefined
      : cleanTypeSlug

  const serializedTypes = serializeBigInt(types)

  const pageData = await getPageContent(type) || await getPageContent(normalized) || await getPageContent(type.replace(/-in-malaysia$/, ''))
  const finalContent = pageData?.description || current?.description || ''
  const finalHeading = pageData?.heading || typeName
  const initialListing = await universityService.getUniversitiesInMalaysia({
    type_slug: backendTypeSlug,
    page: 1,
    limit: 21,
  })
  const faqItems = await getUniversityFaqs(type)

  return (
    <>
      <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center"><div className="animate-pulse h-8 bg-gray-200 rounded w-64 mx-auto" /></div>}>
        <UniversityListClient
          typeSlug={type}
          typeName={finalHeading}
          allTypes={serializedTypes as any[]}
          pageContent={finalContent}
          initialData={serializeBigInt(initialListing?.data || []) as any[]}
          initialTotal={Number(initialListing?.pagination?.total || 0)}
          initialLastPage={Number(initialListing?.pagination?.last_page || 1)}
          initialPage={1}
          initialFilters={serializeBigInt(initialListing?.filters || { institute_types: [], states: [] }) as any}
        />
      </Suspense>
      <FaqSection title={`${finalHeading} - FAQs`} faqs={faqItems} />
    </>
  )
}
