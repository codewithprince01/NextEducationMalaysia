import { notFound } from 'next/navigation'
import { getUniversityFull } from '@/lib/queries/universities'
import UniversityCoursesClient from '@/components/university/UniversityCoursesClient'
import UniversityGalleryClient from '@/components/university/UniversityGalleryClient'
import UniversityVideosClient from '@/components/university/tabs/UniversityVideosClient'
import UniversityRankingClient from '@/components/university/tabs/UniversityRankingClient'
import UniversityReviewsClient from '@/components/university/tabs/UniversityReviewsClient'
import UniversitySectionContainer from '@/components/university/UniversitySectionContainer'
import { serializeBigInt } from '@/lib/utils'
import { courseFiltersFromSearchParams, getUniversityCoursesPage } from '@/lib/queries/universityCourses'
import { resolveUniversityMeta } from '@/lib/seo/metadata'
import type { Metadata } from 'next'

export const revalidate = 300

type Props = {
  params: Promise<{ slug: string; section: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

const VALID_SECTIONS = ['courses', 'gallery', 'videos', 'ranking', 'reviews', 'scholarships']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, section } = await params
  if (!VALID_SECTIONS.includes(section)) return {}

  const universityData = await getUniversityFull(slug)
  if (!universityData) return {}

  const university = serializeBigInt(universityData) as any
  const universityMetaSource = {
    name: university?.name || null,
    uname: university?.uname || slug,
    city: university?.city || null,
    shortnote: university?.shortnote || null,
    meta_title: university?.meta_title || null,
    meta_description: university?.meta_description || null,
    meta_keyword: university?.meta_keyword || null,
    og_image_path: university?.og_image_path || null,
    // Real fallbacks for the social preview: most og_image_path values point at
    // the retired upload location and 404.
    banner_path: university?.banner_path || null,
    logo_path: university?.logo_path || null,
  }

  return resolveUniversityMeta(universityMetaSource, section)
}

export default async function UniversitySectionPage({ params, searchParams }: Props) {
  const { slug, section } = await params
  if (!VALID_SECTIONS.includes(section)) notFound()

  const universityData = await getUniversityFull(slug)
  if (!universityData) notFound()

  const university = serializeBigInt(universityData) as any

  let initialCourseData: any = undefined
  if (section === 'courses') {
    try {
      // Honour the filters in the URL so the server renders the same rows the
      // client is about to show — otherwise the full list flashes first.
      const filters = courseFiltersFromSearchParams((await searchParams) ?? {})
      initialCourseData = (await getUniversityCoursesPage(slug, 1, filters)) ?? undefined
    } catch (e) {
      console.error('Failed to fetch initial course data:', e)
    }
  }

  const renderContent = () => {
    switch (section) {
      case 'courses': return <UniversityCoursesClient slug={slug} initialData={initialCourseData} />
      case 'gallery': return <UniversityGalleryClient slug={slug} />
      case 'videos': return <UniversityVideosClient slug={slug} />
      case 'ranking': return <UniversityRankingClient slug={slug} />
      case 'reviews': return <UniversityReviewsClient slug={slug} />
      default: return notFound()
    }
  }

  return (
    <>
      <UniversitySectionContainer
        slug={slug}
        universityName={university.name}
        fullWidth={section === 'courses'}
      >
        {renderContent()}
      </UniversitySectionContainer>
    </>
  )
}
