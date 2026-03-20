import { notFound } from 'next/navigation'
import { getSpecializationBySlug, getSpecializationLevel } from '@/lib/queries/specializations'
import { SITE_URL } from '@/lib/constants'
import { resolveSpecializationMeta } from '@/lib/seo/metadata'
import SpecializationDetailClient from '../SpecializationDetailClient'

export const revalidate = 86400

type Props = { params: Promise<{ slug: string; levelSlug: string }> }

function toSeoSlug(value: string) {
  return (value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

function matchesLevelSlug(item: any, levelSlug: string, specializationName: string) {
  const rawSlug = item?.url_slug || item?.level_slug || ''
  const composedSlug =
    item?.level_slug && specializationName
      ? `${item.level_slug}-in-${toSeoSlug(specializationName)}`
      : item?.level_slug || ''

  return rawSlug === levelSlug || composedSlug === levelSlug
}

export async function generateMetadata({ params }: Props) {
  const { slug, levelSlug } = await params
  const detail = await getSpecializationBySlug(slug)
  const spec = detail?.specialization
  const levels = spec?.specializationLevels || spec?.specializationlevels || spec?.specialization_levels || []
  const level = levels.find((item: any) => matchesLevelSlug(item, levelSlug, spec?.name || ''))
  if (!spec || !level) return {}

  return {
    ...(await resolveSpecializationMeta(spec)),
    title: `${level.level || level.level_name} - ${spec.name}`,
    alternates: { canonical: `${SITE_URL}/specialization/${slug}/${levelSlug}` },
  }
}

export default async function SpecializationLevelPage({ params }: Props) {
  const { slug, levelSlug } = await params
  const [detail, levelDetail] = await Promise.all([
    getSpecializationBySlug(slug),
    getSpecializationLevel(slug, levelSlug),
  ])
  const spec = detail?.specialization
  const levels = spec?.specializationLevels || spec?.specializationlevels || spec?.specialization_levels || []
  const level = levels.find((item: any) => matchesLevelSlug(item, levelSlug, spec?.name || ''))
  if (!detail || !spec || !level || !levelDetail) notFound()

  return (
    <SpecializationDetailClient
      slug={slug}
      levelSlug={levelSlug}
      initialData={detail}
      initialLevelData={levelDetail}
    />
  )
}
