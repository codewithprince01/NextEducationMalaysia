import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'
import CoursesListClient from '../../courses-in-malaysia/CoursesListClient'
import { malaysiaDiscoveryService } from '@/backend'

export const revalidate = 86400

interface PageProps {
  params: Promise<{ slug: string; page: string }>
  searchParams: Promise<any>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, page } = await params
  const formattedName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  
  return {
    title: `${formattedName} Courses in Malaysia - Page ${page} | Education Malaysia`,
    description: `Page ${page} of ${formattedName.toLowerCase()} courses and programs offered at universities across Malaysia. Find your ideal ${formattedName.toLowerCase()} course today.`,
    alternates: { canonical: `${SITE_URL}/${slug}-courses/page-${page}` },
  }
}

export default async function DynamicCoursesPageWithPagination({ params, searchParams }: PageProps) {
  const { slug, page: pageSlug } = await params
  const resolvedParams = await searchParams
  const page = parseInt(pageSlug)
  
  // Extract first value from potential arrays for filter slugs
  const getFirst = (val: any) => Array.isArray(val) ? val[0] : val

  // Determine filter type based on slug
  const { malaysiaDiscoveryService } = await import('@/backend')
  const filterData = await malaysiaDiscoveryService.getCoursesInMalaysia({})
  
  // Find which filter type this slug belongs to
  let filterType = 'levels'
  let filterValue = slug
  
  const levelMatch = filterData.filters.levels.find((f: any) => f.slug === slug)
  const categoryMatch = filterData.filters.categories.find((f: any) => f.slug === slug)
  const specializationMatch = filterData.filters.specializations.find((f: any) => f.slug === slug)
  
  if (levelMatch) {
    filterType = 'levels'
    filterValue = levelMatch.level
  } else if (categoryMatch) {
    filterType = 'categories'
    filterValue = categoryMatch.name
  } else if (specializationMatch) {
    filterType = 'specializations'
    filterValue = specializationMatch.name
  }

  // Fetch data with the detected filter
  const result = await malaysiaDiscoveryService.getCoursesInMalaysia({
    [filterType]: slug,
    study_mode: getFirst(resolvedParams.study_modes),
    intake: getFirst(resolvedParams.intakes),
    search: resolvedParams.search,
    page: page
  })

  const coursesData = {
    data: result.rows.data,
    pagination: {
      total: result.rows.total,
      current_page: result.rows.current_page,
      per_page: result.rows.per_page,
      last_page: result.rows.last_page,
    },
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
      initialFilterType={filterType}
      initialFilterValue={filterValue}
      initialLevel={filterType === 'levels' ? slug : undefined}
      initialCategory={filterType === 'categories' ? slug : undefined}
      initialSpecialization={filterType === 'specializations' ? slug : undefined}
    />
  )
}
