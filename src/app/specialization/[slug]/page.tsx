import { notFound } from 'next/navigation'
import { getSpecializationBySlug, getAllSpecializationSlugs } from '@/lib/queries/specializations'
import { extractMetadataText, resolveSpecializationMeta } from '@/lib/seo/metadata'
import { specializationJsonLd, breadcrumbJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import FAQSchema from '@/components/seo/FAQSchema'
import { SITE_URL } from '@/lib/constants'
import SpecializationDetailClient from './SpecializationDetailClient'

export const revalidate = 86400

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
  return resolveSpecializationMeta(spec)
}

export default async function SpecializationDetailPage({ params }: Props) {
  const { slug, levelSlug } = await params
  const detail = await getSpecializationBySlug(slug)
  const spec = detail?.specialization
  if (!detail || !spec) notFound()
  const meta = await resolveSpecializationMeta(spec)
  const { title, description } = extractMetadataText(meta)

  return (
    <>
      <JsonLd data={specializationJsonLd(spec)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Specialization', url: `${SITE_URL}/specialization` },
        { name: spec.name || '', url: `${SITE_URL}/specialization/${slug}` }
      ], { name: title, description })} />
      <FAQSchema faqs={Array.isArray((spec as any)?.faqs) ? (spec as any).faqs : []} />
      <SpecializationDetailClient
        slug={slug}
        levelSlug={levelSlug}
        initialData={detail}
        initialLevelData={null}
      />
    </>
  )
}
