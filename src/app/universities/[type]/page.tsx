import { SITE_URL } from '@/lib/constants'
import { getInstituteTypes, getPageContent } from '@/lib/queries/universities'
import { notFound, redirect } from 'next/navigation'
import { Suspense } from 'react'
import UniversityListClient from './UniversityListClient'
import { serializeBigInt } from '@/lib/utils'
import { universityService } from '@/backend'

export const revalidate = 3600

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

export async function generateMetadata({ params }: Props) {
  try {
    const { type } = await params
    if (type === 'universities-in-malaysia') {
      return {
        title: 'Universities in Malaysia - Education Malaysia',
        description: 'Explore universities in Malaysia. Compare rankings, fees, and more.',
        alternates: { canonical: `${SITE_URL}/universities/international-school-in-malaysia` },
      }
    }
    if (type === 'international-school-in-malaysia') {
      return {
        title: 'Universities in Malaysia - Education Malaysia',
        description: 'Explore universities in Malaysia. Compare rankings, fees, and more.',
        alternates: { canonical: `${SITE_URL}/universities/international-school-in-malaysia` },
      }
    }
    const types = await getInstituteTypes() as any[]
    const current = findType(types, type)
    const typeName = current?.type ?? type.replace(/-/g, ' ')
    return {
      title: `${typeName} in Malaysia - Education Malaysia`,
      description: `Explore the best ${typeName.toLowerCase()} in Malaysia. Compare rankings, fees, and more.`,
      alternates: { canonical: `${SITE_URL}/universities/${type}` },
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
      return (
        <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center"><div className="animate-pulse h-8 bg-gray-200 rounded w-64 mx-auto" /></div>}>
          <UniversityListClient
            typeSlug={type}
            typeName={finalHeading}
            allTypes={serializeBigInt(types) as any[]}
            pageContent={finalContent}
          />
        </Suspense>
      )
    }
    notFound()
  }

  const typeName = current?.type ?? type.replace(/-/g, ' ')
  const cleanTypeSlug = type.replace(/-in-malaysia$/, '')

  const serializedTypes = serializeBigInt(types)

  const pageData = await getPageContent(type) || await getPageContent(normalized) || await getPageContent(type.replace(/-in-malaysia$/, ''))
  const finalContent = pageData?.description || current?.description || ''
  const finalHeading = pageData?.heading || typeName
  const initialListing = await universityService.getUniversitiesInMalaysia({
    type_slug: cleanTypeSlug,
    page: 1,
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
        initialPage={1}
        initialFilters={serializeBigInt(initialListing?.filters || { institute_types: [], states: [] }) as any}
      />
    </Suspense>
  )
}
