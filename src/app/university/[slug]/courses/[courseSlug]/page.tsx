import { notFound, permanentRedirect } from 'next/navigation'
import { getProgramBySlug } from '@/lib/queries/courses'
import CourseDetailClient from './CourseDetailClient'
import UniversityCoursesClient from '@/components/university/UniversityCoursesClient'
import { serializeBigInt } from '@/lib/utils'
import UniversitySectionContainer from '@/components/university/UniversitySectionContainer'
import { resolveCourseMeta } from '@/lib/seo/metadata'
import { courseJsonLd } from '@/lib/seo/structured-data'
import { buildCourseDescription } from '@/lib/seo/descriptions'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string; courseSlug: string }> }

// Rendered per request so an edit saved in the admin panel is live immediately.
// The cost is one ~1ms freshness probe: the expensive program query behind this
// page stays cached and only re-runs when that probe shows the content actually
// changed. See src/lib/queries/contentVersion.ts.
export const revalidate = 0

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, courseSlug } = await params
  if (courseSlug.startsWith('page-')) return {}

  const programData = await getProgramBySlug(courseSlug, slug)
  if (!programData) return {}

  const program = serializeBigInt(programData) as any
  return resolveCourseMeta(program)
}

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
  const programData = await getProgramBySlug(courseSlug, slug)
  if (!programData) notFound()

  const program = serializeBigInt(programData) as any

  // The lookup deliberately accepts more than the canonical slug — a numeric id,
  // or the course name with different capitalisation — so old and hand-typed
  // links keep working. Each of those was answering 200 with the same content,
  // which is three URLs for one page and exactly what makes Google report
  // "Duplicate, Google chose a different canonical". They now redirect to the
  // canonical URL instead, so only one URL ever serves the page.
  const canonicalSlug = String(program.slug || '')
  const canonicalUniSlug = String(program.university?.uname || '')
  if (
    canonicalSlug &&
    canonicalUniSlug &&
    (courseSlug !== canonicalSlug || slug !== canonicalUniSlug)
  ) {
    permanentRedirect(`/university/${canonicalUniSlug}/courses/${canonicalSlug}`)
  }

  // Rendered here rather than in head.tsx: that file is a Next 13.0 convention
  // the App Router dropped, so the Course entity it declared never reached the
  // page. Without it every course was describing itself only as part of the
  // university, which gives Google nothing to tell two sibling courses apart
  // when their markup is otherwise 80% identical.
  const contentHtml = (program.contents as any[] | undefined)?.map((row) => row?.description) || []
  const courseSchema = courseJsonLd(
    program,
    program.university?.name || '',
    program.university?.uname || slug,
    program.meta_description || buildCourseDescription(program, program.university?.name, contentHtml),
  )

  return (
    <UniversitySectionContainer
      slug={slug}
      universityName={program.university?.name || ''}
      fullWidth={true}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <CourseDetailClient slug={slug} courseSlug={courseSlug} program={program as any} />
    </UniversitySectionContainer>
  )
}
