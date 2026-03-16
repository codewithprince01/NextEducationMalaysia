import { SITE_URL } from '@/lib/constants'
import { getInstituteTypes } from '@/lib/queries/universities'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import UniversityListClient from './UniversityListClient'

export const revalidate = 3600

type Props = { params: Promise<{ type: string }> }

export async function generateStaticParams() {
  try {
    const types = await getInstituteTypes()
    return types
      .map(t => ({ type: t.seo_title_slug || t.slug || '' }))
      .filter(t => t.type)
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props) {
  try {
    const { type } = await params
    const types = await getInstituteTypes()
    const current = types.find(t => t.slug === type || t.seo_title_slug === type)
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
    types = await getInstituteTypes()
  } catch {
    types = []
  }

  const current = types.find(t => t.slug === type || t.seo_title_slug === type)
  if (!current && types.length > 0) notFound()

  const typeName = current?.type ?? type.replace(/-/g, ' ')

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center"><div className="animate-pulse h-8 bg-gray-200 rounded w-64 mx-auto" /></div>}>
      <UniversityListClient
        typeSlug={type}
        typeName={typeName}
        allTypes={types}
        pageContent={current?.description || ''}
      />
    </Suspense>
  )
}
