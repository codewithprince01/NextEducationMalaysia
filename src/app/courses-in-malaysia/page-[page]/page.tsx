import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'
import CoursesListClient from '../CoursesListClient'
import { malaysiaDiscoveryService } from '@/backend'
import { buildCoursesDiscoveryMetadata } from '@/lib/seo/courses-discovery-metadata'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'

export const revalidate = 86400

interface PageProps {
  params: Promise<{ page: string }>
  searchParams: Promise<any>
}

const firstString = (value: any): string | undefined => {
  if (Array.isArray(value)) return value[0] ? String(value[0]) : undefined
  return value ? String(value) : undefined
}

const allStrings = (value: any): string[] => {
  if (!value) return []
  if (Array.isArray(value)) return value.map((v) => String(v)).filter(Boolean)
  return [String(value)]
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { page } = await params
  const resolvedParams = await searchParams
  const level = firstString(resolvedParams.level ?? resolvedParams.levels)
  const category = firstString(resolvedParams.category ?? resolvedParams.categories)
  const specialization = firstString(resolvedParams.specialization ?? resolvedParams.specializations)
  const studyModes = allStrings(resolvedParams.study_mode ?? resolvedParams.study_modes)
  const intakes = allStrings(resolvedParams.intake ?? resolvedParams.intakes)
  const search = firstString(resolvedParams.search)

  const result = await malaysiaDiscoveryService.getCoursesInMalaysia({
    level,
    category,
    specialization,
    study_mode: studyModes.length > 0 ? studyModes : undefined,
    intake: intakes.length > 0 ? intakes : undefined,
    search,
    page: parseInt(page),
  })
  const title = result.seo?.meta_title && result.seo.meta_title !== '%title%'
    ? result.seo.meta_title
    : `Courses in Malaysia - Page ${page} | Education Malaysia`
  const description = result.seo?.meta_description || result.seo?.page_contents ||
    `Page ${page} of courses and programs offered at universities across Malaysia. Find your ideal course today.`
  
  return buildCoursesDiscoveryMetadata({
    seo: result.seo,
    fallbackTitle: String(title),
    fallbackDescription: description,
    canonicalPath: `/courses-in-malaysia/page-${page}`,
  })
}

export default async function CoursesPageWithPagination({ params, searchParams }: PageProps) {
  const { page: pageSlug } = await params
  const resolvedParams = await searchParams
  const page = parseInt(pageSlug)
  const level = firstString(resolvedParams.level ?? resolvedParams.levels)
  const category = firstString(resolvedParams.category ?? resolvedParams.categories)
  const specialization = firstString(resolvedParams.specialization ?? resolvedParams.specializations)
  const studyModes = allStrings(resolvedParams.study_mode ?? resolvedParams.study_modes)
  const intakes = allStrings(resolvedParams.intake ?? resolvedParams.intakes)
  const search = firstString(resolvedParams.search)

  // Fetch data directly from service (bypasses API Key/Network issues in RSC)
  const result = await malaysiaDiscoveryService.getCoursesInMalaysia({
    level,
    category,
    specialization,
    study_mode: studyModes.length > 0 ? studyModes : undefined,
    intake: intakes.length > 0 ? intakes : undefined,
    search,
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
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Courses in Malaysia', url: `${SITE_URL}/courses-in-malaysia` },
        { name: `Page ${page}`, url: `${SITE_URL}/courses-in-malaysia/page-${page}` },
      ])} />
      <CoursesListClient 
        initialFilterData={filterData} 
        initialCoursesData={coursesData}
        initialLevel={resolvedParams.level ?? resolvedParams.levels}
        initialCategory={resolvedParams.category ?? resolvedParams.categories}
        initialSpecialization={resolvedParams.specialization ?? resolvedParams.specializations}
        initialStudyMode={resolvedParams.study_mode ?? resolvedParams.study_modes}
        initialIntake={resolvedParams.intake ?? resolvedParams.intakes}
        initialSearch={resolvedParams.search}
        initialYear={new Date().getFullYear()}
      />
    </>
  )
}
