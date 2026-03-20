import { notFound } from 'next/navigation'
import { getUniversityFull } from '@/lib/queries/universities'
import UniversityCoursesClient from '@/components/university/UniversityCoursesClient'
import UniversityGalleryClient from '@/components/university/UniversityGalleryClient'
import UniversityVideosClient from '@/components/university/tabs/UniversityVideosClient'
import UniversityRankingClient from '@/components/university/tabs/UniversityRankingClient'
import UniversityReviewsClient from '@/components/university/tabs/UniversityReviewsClient'
import UniversitySectionContainer from '@/components/university/UniversitySectionContainer'
import { serializeBigInt } from '@/lib/utils'

export const revalidate = 86400

type Props = { params: Promise<{ slug: string; section: string }> }

const VALID_SECTIONS = ['courses', 'gallery', 'videos', 'ranking', 'reviews', 'scholarships']

export default async function UniversitySectionPage({ params }: Props) {
  const { slug, section } = await params
  if (!VALID_SECTIONS.includes(section)) notFound()

  const universityData = await getUniversityFull(slug)
  if (!universityData) notFound()

  const university = serializeBigInt(universityData) as any

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

  const renderContent = () => {
    switch (section) {
      case 'courses': return <UniversityCoursesClient slug={slug} initialData={initialCourseData} />
      case 'gallery': return <UniversityGalleryClient slug={slug} />
      case 'videos': return <UniversityVideosClient uname={slug} />
      case 'ranking': return <UniversityRankingClient uname={slug} />
      case 'reviews': return <UniversityReviewsClient uname={slug} />
      default: return notFound()
    }
  }

  return (
    <UniversitySectionContainer
      slug={slug}
      universityName={university.name}
      fullWidth={section === 'courses'}
    >
      {renderContent()}
    </UniversitySectionContainer>
  )
}
