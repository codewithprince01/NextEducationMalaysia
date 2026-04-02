import QualificationLevelClient from '../../course/[slug]/QualificationLevelClient'
import { resolveStaticMetaAny } from '@/lib/seo/metadata'
import { getCourseLevelPageData } from '@/backend/services/course-level.service'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const normalized = String(slug || '').toLowerCase().trim()
  const titleCase =
    normalized === 'phd' || normalized === 'ph-d'
      ? 'PhD'
      : slug
          .split('-')
          .filter(Boolean)
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(' ')
  return resolveStaticMetaAny(
    ['Courses in Malaysia', 'courses-level'],
    `/courses/${slug}`,
    `${titleCase} Courses in Malaysia | Education Malaysia`,
  )
}

export default async function CourseLevelListingPage({ params }: Props) {
  const { slug } = await params
  const initialData = await getCourseLevelPageData(slug)
  if (!initialData) notFound()

  return <QualificationLevelClient slug={slug} initialData={initialData} />
}
