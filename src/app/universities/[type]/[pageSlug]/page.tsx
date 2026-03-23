import { SITE_URL } from '@/lib/constants'
import { getInstituteTypes, getPageContent } from '@/lib/queries/universities'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import UniversityListClient from '../UniversityListClient'
import { serializeBigInt } from '@/lib/utils'
import { universityService } from '@/backend'

export const revalidate = 3600

type Props = { params: Promise<{ type: string; pageSlug: string }> }

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

function parsePageSlug(pageSlug: string) {
  const m = pageSlug.match(/^page-(\d+)$/)
  if (!m) return null
  const pageNum = Number(m[1])
  if (!Number.isFinite(pageNum) || pageNum < 1) return null
  return pageNum
}

export async function generateMetadata({ params }: Props) {
  try {
    const { type, pageSlug } = await params
    const pageNum = parsePageSlug(pageSlug)
    if (!pageNum) return { title: 'Universities in Malaysia' }
    if (type === 'universities-in-malaysia') {
      return {
        title: `Universities in Malaysia - Page ${pageNum} - Education Malaysia`,
        description: `Explore the best universities in Malaysia. Page ${pageNum}.`,
        alternates: { canonical: `${SITE_URL}/universities/international-school-in-malaysia/page-${pageNum}` },
      }
    }
    if (type === 'international-school-in-malaysia') {
      return {
        title: `Universities in Malaysia - Page ${pageNum} - Education Malaysia`,
        description: `Explore the best universities in Malaysia. Page ${pageNum}.`,
        alternates: { canonical: `${SITE_URL}/universities/international-school-in-malaysia/page-${pageNum}` },
      }
    }

    const types = (await getInstituteTypes()) as any[]
    const current = findType(types, type)
    const typeName = current?.type ?? type.replace(/-/g, ' ')

    return {
      title: `${typeName} in Malaysia - Page ${pageNum} - Education Malaysia`,
      description: `Explore the best ${typeName.toLowerCase()} in Malaysia. Page ${pageNum}.`,
      alternates: { canonical: `${SITE_URL}/universities/${type}/page-${pageNum}` },
    }
  } catch {
    return { title: 'Universities in Malaysia' }
  }
}

export default async function UniversitiesByTypePaginatedPage({ params }: Props) {
  const { type, pageSlug } = await params
  const pageNum = parsePageSlug(pageSlug)

  if (!pageNum) notFound()
  if (type === 'universities-in-malaysia') {
    redirect(`/universities/international-school-in-malaysia/page-${pageNum}`)
  }

  let types: any[] = []
  try {
    types = (await getInstituteTypes()) as any[]
  } catch {
    types = []
  }

  const normalized = type.replace(/-in-malaysia$/, '').replace(/-universities$/, '-university').replace(/-institutions$/, '-institution')
  const current = findType(types, type)

  if (!current && types.length > 0) {
    if (normalized === 'international-school') {
      const pageData =
        (await getPageContent('universities-in-malaysia')) ||
        (await getPageContent('universities')) ||
        (await getPageContent(type))
      const finalContent = pageData?.description || 'Explore the best universities in Malaysia.'
      const finalHeading = pageData?.heading || 'International Schools'
      const initialListing = await universityService.getUniversitiesInMalaysia({
        type_slug: type.replace(/-in-malaysia$/, ''),
        page: pageNum,
        limit: 21,
      })

      return (
        <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center"><div className="animate-pulse h-8 bg-gray-200 rounded w-64 mx-auto" /></div>}>
          <UniversityListClient
            typeSlug={type}
            typeName={finalHeading}
            allTypes={serializeBigInt(types) as any[]}
            pageContent={finalContent}
            initialData={serializeBigInt(initialListing?.data || []) as any[]}
            initialTotal={Number(initialListing?.pagination?.total || 0)}
            initialLastPage={Number(initialListing?.pagination?.last_page || 1)}
            initialPage={pageNum}
            initialFilters={serializeBigInt(initialListing?.filters || { institute_types: [], states: [] }) as any}
          />
        </Suspense>
      )
    }
    notFound()
  }

  const typeName = current?.type ?? type.replace(/-/g, ' ')
  const cleanTypeSlug = type.replace(/-in-malaysia$/, '')
  const serializedTypes = serializeBigInt(types)

  const pageData =
    (await getPageContent(type)) ||
    (await getPageContent(normalized)) ||
    (await getPageContent(type.replace(/-in-malaysia$/, '')))

  const finalContent = pageData?.description || current?.description || ''
  const finalHeading = pageData?.heading || typeName

  const initialListing = await universityService.getUniversitiesInMalaysia({
    type_slug: cleanTypeSlug,
    page: pageNum,
    limit: 21,
  })

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center"><div className="animate-pulse h-8 bg-gray-200 rounded w-64 mx-auto" /></div>}>
      <UniversityListClient
        typeSlug={type}
        typeName={finalHeading}
        allTypes={serializedTypes as any[]}
        pageContent={finalContent}
        initialData={serializeBigInt(initialListing?.data || []) as any[]}
        initialTotal={Number(initialListing?.pagination?.total || 0)}
        initialLastPage={Number(initialListing?.pagination?.last_page || 1)}
        initialPage={pageNum}
        initialFilters={serializeBigInt(initialListing?.filters || { institute_types: [], states: [] }) as any}
      />
    </Suspense>
  )
}
