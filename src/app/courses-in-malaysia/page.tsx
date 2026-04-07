import { Metadata } from 'next'
import CoursesListClient from './CoursesListClient'
import { malaysiaDiscoveryService } from '@/backend'
import { buildCoursesDiscoveryMetadata } from '@/lib/seo/courses-discovery-metadata'
import FaqSection from '@/components/seo/FaqSection'
import { normalizeFaqs } from '@/lib/seo/faq-schema'

export const revalidate = 86400

const DEFAULT_META: Metadata = {
  title: 'Courses in Malaysia - Find the Best Programs | Education Malaysia',
  description: 'Explore thousands of courses and programs offered at universities across Malaysia. Filter by level, specialization, intake and more. Find your ideal course today.',
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

export async function generateMetadata({ searchParams }: { searchParams: Promise<any> }): Promise<Metadata> {
  const params = await searchParams
  const level = firstString(params.level ?? params.levels)
  const category = firstString(params.category ?? params.categories)
  const specialization = firstString(params.specialization ?? params.specializations)
  const studyModes = allStrings(params.study_mode ?? params.study_modes)
  const intakes = allStrings(params.intake ?? params.intakes)
  const search = firstString(params.search)

  const result = await malaysiaDiscoveryService.getCoursesInMalaysia({
    level,
    category,
    specialization,
    study_mode: studyModes.length > 0 ? studyModes : undefined,
    intake: intakes.length > 0 ? intakes : undefined,
    search,
    page: 1,
  })

  const title = result.seo?.meta_title && result.seo.meta_title !== '%title%'
    ? result.seo.meta_title
    : DEFAULT_META.title
  const description = result.seo?.meta_description || result.seo?.page_content || DEFAULT_META.description

  return buildCoursesDiscoveryMetadata({
    seo: result.seo,
    fallbackTitle: String(title),
    fallbackDescription: String(description ?? ''),
    canonicalPath: '/courses-in-malaysia',
  })
}

export default async function CoursesPage({ searchParams }: { searchParams: Promise<any> }) {
  const params = await searchParams
  const page = params.page ? parseInt(params.page) : 1
  
  const level = firstString(params.level ?? params.levels)
  const category = firstString(params.category ?? params.categories)
  const specialization = firstString(params.specialization ?? params.specializations)
  const studyModes = allStrings(params.study_mode ?? params.study_modes)
  const intakes = allStrings(params.intake ?? params.intakes)
  const search = firstString(params.search)

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
  const faqItems = normalizeFaqs((result as any).faqs || [])

  return (
    <>
      <CoursesListClient 
        initialFilterData={filterData} 
        initialCoursesData={coursesData}
        initialLevel={params.level ?? params.levels}
        initialCategory={params.category ?? params.categories}
        initialSpecialization={params.specialization ?? params.specializations}
        initialStudyMode={params.study_mode ?? params.study_modes}
        initialIntake={params.intake ?? params.intakes}
        initialSearch={params.search}
        initialYear={new Date().getFullYear()}
      />
      <FaqSection title="Courses in Malaysia - FAQs" faqs={faqItems} />
    </>
  )
}
