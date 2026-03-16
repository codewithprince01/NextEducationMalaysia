import { notFound } from 'next/navigation'
import { resolveUniversityMeta } from '@/lib/seo/metadata'
import { universityJsonLd, breadcrumbJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/constants'
import {
  getAllUniversitySlugs,
  getUniversityBySlug,
  getUniversityFull,
} from '@/lib/queries/universities'
import UniversityHeroClient from '@/components/university/UniversityHeroClient'
import UniversityContentClient from '@/components/university/UniversityContentClient'

export const revalidate = 86400 // 24 hours

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const slugs = await getAllUniversitySlugs()
    return slugs.map((slug: string) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props) {
  try {
    const { slug } = await params
    const university = await getUniversityBySlug(slug)
    if (!university) return {}
    return resolveUniversityMeta(university)
  } catch {
    return {}
  }
}

export default async function UniversityPage({ params }: Props) {
  const { slug } = await params

  const university = await getUniversityFull(slug)
  if (!university) notFound()

  // Convert BigInts to Numbers for Client Components compatibility
  const mappedUniversity = {
    ...university,
    id: Number(university.id),
    rating: university.rating ? Number(university.rating) : null,
    overviews: (university.overviews || []).map((ov: any) => ({
      ...ov,
      id: Number(ov.id),
      university_id: Number(ov.university_id),
      tab: ov.title || ov.tab
    })),
    photos: (university.photos || []).map((p: any) => ({
      ...p,
      id: Number(p.id),
      university_id: Number(p.university_id)
    }))
  }

  return (
    <>
      <JsonLd data={universityJsonLd(mappedUniversity as any)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Universities', url: `${SITE_URL}/universities` },
        { name: university.name || '', url: `${SITE_URL}/university/${university.uname}` }
      ])} />

      {/* Hero: photo grid, logo, info cards, action buttons, rankings */}
      <UniversityHeroClient
        university={{ ...(mappedUniversity as any), offeredCourses: [] }}
        photos={mappedUniversity.photos as any}
      />

      {/* Combined tab bar + tab content (client-side tab switching) */}
      <UniversityContentClient
        slug={slug}
        overviews={mappedUniversity.overviews as any}
        universityName={university.name}
      />
    </>
  )
}
