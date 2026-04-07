import { notFound } from 'next/navigation'
import { getSpecializationBySlug } from '@/lib/queries/specializations'
import { resolveSpecializationMeta } from '@/lib/seo/metadata'
import { specializationJsonLd } from '@/lib/seo/structured-data'

type Props = { params: Promise<{ slug: string; levelSlug?: string }> }

export default async function Head({ params }: Props) {
  const { slug } = await params
  const detail = await getSpecializationBySlug(slug)
  const spec = detail?.specialization
  if (!detail || !spec) notFound()

  await resolveSpecializationMeta(spec)
  const specializationSchema = specializationJsonLd(spec)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(specializationSchema) }}
      />
    </>
  )
}
