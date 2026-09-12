import { notFound } from 'next/navigation'
import { getSpecializationBySlug, getAllSpecializationSlugs } from '@/lib/queries/specializations'
import { resolveSpecializationMeta } from '@/lib/seo/metadata'
import SpecializationDetailClient from './SpecializationDetailClient'

// Rendered per request so an edit saved in the admin panel shows up straight away.
// This is not as costly as it looks: the expensive queries behind the page are
// still cached, keyed on a cheap database freshness probe, so they only re-run
// when the content actually changed. See src/lib/queries/contentVersion.ts.
export const revalidate = 0

type Props = { params: Promise<{ slug: string; levelSlug?: string }> }

export async function generateStaticParams() {
  const slugs = await getAllSpecializationSlugs()
  return slugs.map((slug: string) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const detail = await getSpecializationBySlug(slug)
  const spec = detail?.specialization
  if (!spec) return {}

  // The prose that decides whether this page is worth indexing lives in the
  // child sections, not on the specialization row, so it is passed through.
  const sectionHtml = (spec?.contents || []).map((section: any) => section?.description)
  return resolveSpecializationMeta(spec, sectionHtml)
}

export default async function SpecializationDetailPage({ params }: Props) {
  const { slug, levelSlug } = await params
  const detail = await getSpecializationBySlug(slug)
  const spec = detail?.specialization
  if (!detail || !spec) notFound()

  return (
    <SpecializationDetailClient
      slug={slug}
      levelSlug={levelSlug}
      initialData={detail}
      initialLevelData={null}
    />
  )
}
