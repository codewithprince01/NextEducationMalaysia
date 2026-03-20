import { SITE_URL } from '@/lib/constants'
import { getInstituteTypes, getPageContent } from '@/lib/queries/universities'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import UniversityListClient from './UniversityListClient'
import { serializeBigInt } from '@/lib/utils'

export const revalidate = 3600

type Props = { params: Promise<{ type: string }> }

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
    const types = await getInstituteTypes() as any[]
    const base = type.replace(/-in-malaysia$/, '');
    const normalized = base.replace(/-universities$/, '-university').replace(/-institutions$/, '-institution');
    const current = types.find((t: any) => 
      t.slug === normalized || 
      t.seo_title_slug === normalized ||
      t.slug === base ||
      t.seo_title_slug === base ||
      t.slug === normalized.replace(/-institution$/, '') ||
      t.slug === normalized.replace(/-university$/, '')
    )
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

  let types: any[] = []
  try {
    types = await getInstituteTypes() as any[]
  } catch {
    types = []
  }

  const normalized = type.replace(/-in-malaysia$/, '').replace(/-universities$/, '-university').replace(/-institutions$/, '-institution');
  const current = types.find((t: any) => 
    t.slug === normalized || 
    t.seo_title_slug === normalized ||
    t.slug === type.replace(/-in-malaysia$/, '') ||
    t.seo_title_slug === type.replace(/-in-malaysia$/, '') ||
    t.slug === normalized.replace(/-institution$/, '') ||
    t.slug === normalized.replace(/-university$/, '')
  )

  if (!current && types.length > 0) {
    // Fallback for international schools or others not in DB
    if (normalized === 'international-school') {
      const typeName = 'International Schools';
      return (
        <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center"><div className="animate-pulse h-8 bg-gray-200 rounded w-64 mx-auto" /></div>}>
          <UniversityListClient
            typeSlug={type}
            typeName={typeName}
            allTypes={serializeBigInt(types) as any[]}
            pageContent="Explore international schools in Malaysia."
          />
        </Suspense>
      )
    }
    notFound()
  }

  const typeName = current?.type ?? type.replace(/-/g, ' ')

  const serializedTypes = serializeBigInt(types)

  const pageData = await getPageContent(type) || await getPageContent(normalized) || await getPageContent(type.replace(/-in-malaysia$/, ''))
  const finalContent = pageData?.description || current?.description || ''
  const finalHeading = pageData?.heading || typeName

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center"><div className="animate-pulse h-8 bg-gray-200 rounded w-64 mx-auto" /></div>}>
      <UniversityListClient
        typeSlug={type}
        typeName={finalHeading}
        allTypes={serializedTypes as any[]}
        pageContent={finalContent}
      />
    </Suspense>
  )
}
