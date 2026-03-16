import { notFound } from 'next/navigation'
import { getUniversityBySlug, getUniversityFull } from '@/lib/queries/universities'
import { resolveUniversityMeta } from '@/lib/seo/metadata'
import UniversityHeroClient from '@/components/university/UniversityHeroClient'
import UniversityContentClient from '@/components/university/UniversityContentClient'
import { universityJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'

export const revalidate = 86400

type Props = { params: Promise<{ slug: string; section: string }> }

const VALID_SECTIONS = ['courses', 'gallery', 'videos', 'ranking', 'reviews', 'scholarships']

export async function generateMetadata({ params }: Props) {
  const { slug, section } = await params
  if (!VALID_SECTIONS.includes(section)) return {}
  const university = await getUniversityBySlug(slug)
  if (!university) return {}
  return resolveUniversityMeta(university, section)
}

export default async function UniversitySectionPage({ params }: Props) {
  const { slug, section } = await params
  if (!VALID_SECTIONS.includes(section)) notFound()

  const university = await getUniversityFull(slug)
  if (!university) notFound()

  const overviews = (university.overviews || []).map((ov: any) => ({
    ...ov,
    id: Number(ov.id),
    university_id: Number(ov.university_id),
    tab: ov.title || ov.tab
  }))
  const photos = (university.photos || []).map((p: any) => ({
    ...p,
    id: Number(p.id),
    university_id: Number(p.university_id)
  }))

  let initialCourseData = null
  if (section === 'courses') {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/university-courses/${slug}?page=1`, { next: { revalidate: 3600 } })
      const d = await res.json()
      initialCourseData = d?.data || d
    } catch (e) {
      console.error('Failed to fetch initial course data:', e)
    }
  }

  return (
    <>
      <JsonLd data={universityJsonLd(university as any)} />
      <UniversityHeroClient
        university={{ ...(university as any), offeredCourses: [] }}
        photos={photos as any}
      />
      <UniversityContentClient
        slug={slug}
        overviews={overviews as any}
        universityName={university.name}
        initialTab={section}
        initialCourseData={initialCourseData}
      />
    </>
  )
}
