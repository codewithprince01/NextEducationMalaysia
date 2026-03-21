import QualificationLevelClient from '../../course/[slug]/QualificationLevelClient'
import { resolveStaticMetaAny } from '@/lib/seo/metadata'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const titleCase = slug
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
  return <QualificationLevelClient slug={slug} />
}
