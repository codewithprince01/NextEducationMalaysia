import { notFound } from 'next/navigation'
import { getSpecializationBySlug, getSpecializationLevel } from '@/lib/queries/specializations'
import { SITE_URL } from '@/lib/constants'
import { resolveSpecializationMeta } from '@/lib/seo/metadata'
import { getSpecializationLevelIndexability, robotsFor } from '@/lib/seo/indexability'
import { buildSpecializationDescription } from '@/lib/seo/descriptions'
import SpecializationDetailClient from '../SpecializationDetailClient'

// Rendered per request so an edit saved in the admin panel shows up straight away.
// This is not as costly as it looks: the expensive queries behind the page are
// still cached, keyed on a cheap database freshness probe, so they only re-run
// when the content actually changed. See src/lib/queries/contentVersion.ts.
export const revalidate = 0

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
  const [detail, levelDetail] = await Promise.all([
    getSpecializationBySlug(slug),
    getSpecializationLevel(slug, levelSlug),
  ])
  const spec = detail?.specialization
  const levels = spec?.specializationLevels || spec?.specializationlevels || spec?.specialization_levels || []
  const level = levels.find((item: any) => matchesLevelSlug(item, levelSlug, spec?.name || ''))
  if (!spec || !level) return {}

  // A level page is judged on its own content, never on its parent's. The URL
  // shape suggests a duplicate of the specialization above it, but the bodies
  // are written per level and are almost entirely distinct — many carry far
  // more than the hub page does, so inheriting the hub verdict would hide the
  // best pages in this section.
  const sectionHtml = (levelDetail?.contents || []).map((section: any) => section?.description)
  const inherited = await resolveSpecializationMeta(spec, sectionHtml)
  const ownDescription =
    level.meta_description ||
    buildSpecializationDescription({ ...spec, ...level }, sectionHtml) ||
    inherited.description

  return {
    ...inherited,
    title: `${level.level || level.level_name} - ${spec.name}`,
    ...(ownDescription ? { description: ownDescription } : {}),
    robots: robotsFor(getSpecializationLevelIndexability(level, sectionHtml)),
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
