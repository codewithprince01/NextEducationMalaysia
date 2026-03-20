import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'
import CoursesListClient from './CoursesListClient'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Courses in Malaysia - Find the Best Programs | Education Malaysia',
  description: 'Explore thousands of courses and programs offered at universities across Malaysia. Filter by level, specialization, intake and more. Find your ideal course today.',
  alternates: { canonical: `${SITE_URL}/courses-in-malaysia` },
}

import { malaysiaDiscoveryService } from '@/backend'

export default async function CoursesPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page) : 1
  
  // Extract first value from potential arrays for filter slugs
  const getFirst = (val: any) => Array.isArray(val) ? val[0] : val

  // Fetch data directly from service (bypasses API Key/Network issues in RSC)
  const result = await malaysiaDiscoveryService.getCoursesInMalaysia({
    level: getFirst(params.levels),
    category: getFirst(params.categories),
    specialization: getFirst(params.specializations),
    study_mode: getFirst(params.study_modes),
    intake: getFirst(params.intakes),
    search: params.search,
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
      initialLevel={params.levels || params.level}
      initialCategory={params.categories || params.category}
      initialSpecialization={params.specializations || params.specialization}
      initialStudyMode={params.study_modes || params.study_mode}
      initialIntake={params.intakes || params.intake}
    />
  )
}
