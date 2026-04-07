import { notFound } from 'next/navigation'
import { resolveScholarshipMeta } from '@/lib/seo/metadata'
import { getScholarshipBySlug } from '@/lib/queries/scholarships'
import { scholarshipJsonLd } from '@/lib/seo/structured-data'

interface Params {
  params: Promise<{ slug: string }>
}

export default async function Head({ params }: Params) {
  const { slug } = await params
  const scholarship = await getScholarshipBySlug(slug)
  if (!scholarship) notFound()

  await resolveScholarshipMeta(scholarship)
  const scholarshipSchema = scholarshipJsonLd(scholarship)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(scholarshipSchema) }}
      />
    </>
  )
}
