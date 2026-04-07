import { notFound } from 'next/navigation'
import ScholarshipDetailClient from './ScholarshipDetailClient'
import { resolveScholarshipMeta } from '@/lib/seo/metadata'
import { 
  getScholarshipBySlug, 
  getAllScholarshipSlugs, 
  getAllScholarships 
} from '@/lib/queries/scholarships'

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

  return <ScholarshipDetailClient data={formattedData as any} />
}
