import { notFound } from 'next/navigation'
import { getSpecializationBySlug, getAllSpecializationSlugs } from '@/lib/queries/specializations'
import { serializeBigInt } from '@/lib/utils'
import { resolveSpecializationMeta } from '@/lib/seo/metadata'
import { specializationJsonLd, breadcrumbJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
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
  const spec = await getSpecializationBySlug(slug)
  if (!spec) return {}
  return resolveSpecializationMeta(spec)
}

export default async function SpecializationDetailPage({ params }: Props) {
  const { slug, levelSlug } = await params
  const specData = await getSpecializationBySlug(slug)
  if (!specData) notFound()

  const spec = serializeBigInt(specData)

  return (
    <>
      <JsonLd data={specializationJsonLd(spec)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Specialization', url: `${SITE_URL}/specialization` },
        { name: spec.name || '', url: `${SITE_URL}/specialization/${slug}` }
      ])} />
      <SpecializationDetailClient slug={slug} levelSlug={levelSlug} initialData={spec} />
    </>
  )
}
