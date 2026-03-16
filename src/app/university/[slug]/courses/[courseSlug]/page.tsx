import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { resolveCourseMeta } from '@/lib/seo/metadata'
import { courseJsonLd, breadcrumbJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/constants'
import { getProgramBySlug } from '@/lib/queries/courses'
import CourseDetailClient from './CourseDetailClient'

type Props = { params: Promise<{ slug: string; courseSlug: string }> }

export const revalidate = 86400

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { courseSlug } = await params
  const program = await getProgramBySlug(courseSlug)
  if (!program) return { title: 'Course Details | Education Malaysia' }
  return resolveCourseMeta(program)
}

export default async function CourseDetailPage({ params }: Props) {
  const { slug, courseSlug } = await params
  const program = await getProgramBySlug(courseSlug)
  if (!program) notFound()

  return (
    <>
      <JsonLd data={courseJsonLd(program as any, (program as any).university?.name || '', slug)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Universities', url: `${SITE_URL}/universities` },
        { name: (program as any).university?.name || '', url: `${SITE_URL}/university/${slug}` },
        { name: 'Courses', url: `${SITE_URL}/university/${slug}/courses` },
        { name: program.course_name || '', url: `${SITE_URL}/university/${slug}/courses/${courseSlug}` }
      ])} />
      <CourseDetailClient slug={slug} courseSlug={courseSlug} program={program as any} />
    </>
  )
}
