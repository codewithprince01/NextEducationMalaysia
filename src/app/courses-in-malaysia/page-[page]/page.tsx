import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'
import CoursesListClient from '../CoursesListClient'
import { malaysiaDiscoveryService } from '@/backend'

export const revalidate = 86400

interface PageProps {
  params: Promise<{ page: string }>
  searchParams: Promise<any>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { page } = await params
  
  return {
    title: `Courses in Malaysia - Page ${page} | Education Malaysia`,
    description: `Page ${page} of courses and programs offered at universities across Malaysia. Find your ideal course today.`,
    alternates: { canonical: `${SITE_URL}/courses-in-malaysia/page-${page}` },
  }
}

export default async function CoursesPageWithPagination({ params, searchParams }: PageProps) {
  const { page: pageSlug } = await params
  const resolvedParams = await searchParams
  const page = parseInt(pageSlug)
  
  // Extract first value from potential arrays for filter slugs
  const getFirst = (val: any) => Array.isArray(val) ? val[0] : val

  // Fetch data directly from service (bypasses API Key/Network issues in RSC)
  const result = await malaysiaDiscoveryService.getCoursesInMalaysia({
    level: getFirst(resolvedParams.levels),
    category: getFirst(resolvedParams.categories),
    specialization: getFirst(resolvedParams.specializations),
    study_mode: getFirst(resolvedParams.study_modes),
    intake: getFirst(resolvedParams.intakes),
    search: resolvedParams.search,
    page: page
  })

  const filterData = result.filters
  const coursesData = {
    data: result.rows.data,
    pagination: {
      total: result.rows.total,
      current_page: result.rows.current_page,
      per_page: result.rows.per_page,
      last_page: result.rows.last_page,
    },
    // Adding fallbacks matching client component checks
    courses: {
      data: result.rows.data,
      total: result.rows.total,
      current_page: result.rows.current_page,
      last_page: result.rows.last_page,
    },
    filters: result.filters,
    current_filters: result.current_filters,
    seo: result.seo,
    nou: result.nou,
    noc: result.noc
  }

  return (
    <CoursesListClient 
      initialFilterData={filterData} 
      initialCoursesData={coursesData}
      initialLevel={resolvedParams.levels}
      initialCategory={resolvedParams.categories}
    />
  )
}
