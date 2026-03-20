import { notFound } from 'next/navigation'
import { courseJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { getProgramBySlug } from '@/lib/queries/courses'
import CourseDetailClient from './CourseDetailClient'
import UniversityCoursesClient from '@/components/university/UniversityCoursesClient'
import { serializeBigInt } from '@/lib/utils'
import UniversitySectionContainer from '@/components/university/UniversitySectionContainer'

type Props = { params: Promise<{ slug: string; courseSlug: string }> }

export const revalidate = 86400

export default async function CourseDetailPage({ params }: Props) {
  const { slug, courseSlug } = await params
  
  // Case 1: Pagination (e.g., page-2)
  if (courseSlug.startsWith('page-')) {
    const pageNum = parseInt(courseSlug.replace('page-', ''))
    if (isNaN(pageNum) || pageNum < 1) notFound()

    let initialCourseData = null
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/university-courses/${slug}?page=${pageNum}`, { next: { revalidate: 3600 } })
      const d = await res.json()
      initialCourseData = d?.data || d
    } catch (e) {
      console.error('Failed to fetch initial course data:', e)
    }

    return (
      <UniversitySectionContainer slug={slug} universityName={slug} fullWidth={true}>
        <UniversityCoursesClient slug={slug} initialPage={pageNum} initialData={initialCourseData} />
      </UniversitySectionContainer>
    )
  }

  // Case 2: Course Detail
  const programData = await getProgramBySlug(courseSlug)
  if (!programData) notFound()

  const program = serializeBigInt(programData) as any

  return (
    <UniversitySectionContainer
      slug={slug}
      universityName={program.university?.name || ''}
      fullWidth={true}
    >
      <JsonLd data={courseJsonLd(program as any, (program as any).university?.name || '', slug)} />
      <CourseDetailClient slug={slug} courseSlug={courseSlug} program={program as any} />
    </UniversitySectionContainer>
  )
}
