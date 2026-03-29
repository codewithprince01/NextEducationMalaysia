import { notFound } from 'next/navigation'
import ScholarshipDetailClient from './ScholarshipDetailClient'
import { extractMetadataText, resolveScholarshipMeta } from '@/lib/seo/metadata'
import { 
  getScholarshipBySlug, 
  getAllScholarshipSlugs, 
  getAllScholarships 
} from '@/lib/queries/scholarships'
import { scholarshipJsonLd, breadcrumbJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/constants'

import { serializeBigInt } from '@/lib/utils'

interface Params {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const slugs = await getAllScholarshipSlugs()
  return slugs.map((slug: string) => ({ slug }))
}

export async function generateMetadata({ params }: Params) {
  const { slug } = await params
  const scholarship = await getScholarshipBySlug(slug)
  if (!scholarship) return { title: 'Scholarship Not Found' }
  return resolveScholarshipMeta(scholarship)
}

export default async function ScholarshipDetailPage({ params }: Params) {
  const { slug } = await params
  const scholarship = await getScholarshipBySlug(slug)

  if (!scholarship) {
    notFound()
  }

  const otherScholarships = await getAllScholarships()

  // Format data for client component
  const formattedData = serializeBigInt({
    ...scholarship,
    otherScholarships: otherScholarships
      .filter((s: { slug?: string | null }) => s.slug !== slug)
      .slice(0, 5) // Limit to 5 similar scholarships
  })
  const meta = await resolveScholarshipMeta(scholarship)
  const { title, description } = extractMetadataText(meta)

  return (
    <>
      <JsonLd data={scholarshipJsonLd(scholarship)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Scholarships', url: `${SITE_URL}/scholarships` },
        { name: scholarship.title || '', url: `${SITE_URL}/scholarships/${slug}` }
      ], { name: title, description })} />
      <ScholarshipDetailClient data={formattedData as any} />
    </>
  )
}
