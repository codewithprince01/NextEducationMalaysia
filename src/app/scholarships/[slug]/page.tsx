import { notFound } from 'next/navigation'
import Link from 'next/link'
import ScholarshipDetailClient from './ScholarshipDetailClient'
import { resolveScholarshipMeta } from '@/lib/seo/metadata'
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
      .filter(s => s.slug !== slug)
      .slice(0, 5) // Limit to 5 similar scholarships
  })

  return (
    <>
      <JsonLd data={scholarshipJsonLd(scholarship)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Scholarships', url: `${SITE_URL}/scholarships` },
        { name: scholarship.title || '', url: `${SITE_URL}/scholarships/${slug}` }
      ])} />
      {/* Breadcrumb */}
      <nav className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li className="flex items-center">
              <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">Home</Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <Link href="/scholarships" className="text-blue-600 hover:text-blue-800 font-medium">Scholarships</Link>
            </li>
            <li className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-gray-500 font-medium">{scholarship.title}</span>
            </li>
          </ol>
        </div>
      </nav>

      <ScholarshipDetailClient data={formattedData as any} />
    </>
  )
}
