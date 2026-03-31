import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { SITE_URL } from '@/lib/constants'
import CoursesListClient from '../CoursesListClient'
import { malaysiaDiscoveryService } from '@/backend'
import { buildCoursesDiscoveryMetadata } from '@/lib/seo/courses-discovery-metadata'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbJsonLd, courseDiscoveryJsonLd } from '@/lib/seo/structured-data'
import FaqSection from '@/components/seo/FaqSection'
import { extractFaqItems, fetchDynamicFaqSchema } from '@/lib/seo/dynamic-faq'

export const revalidate = 86400

interface PageProps {
  params: Promise<{ pageSlug: string }>
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

const parsePageFromSlug = (pageSlug: string): number | null => {
  const match = pageSlug.match(/^page-(\d+)$/)
  if (!match) return null
  const page = Number.parseInt(match[1], 10)
  if (!Number.isFinite(page) || page < 1) return null
  return page
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { pageSlug } = await params
  const page = parsePageFromSlug(pageSlug)
  if (!page) return {}

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
    page,
  })

  const title = result.seo?.meta_title && result.seo.meta_title !== '%title%'
    ? result.seo.meta_title
    : `Courses in Malaysia - Page ${page} | Education Malaysia`

  const description = result.seo?.meta_description || result.seo?.page_content ||
    `Page ${page} of courses and programs offered at universities across Malaysia. Find your ideal course today.`

  return buildCoursesDiscoveryMetadata({
    seo: result.seo,
    fallbackTitle: String(title),
    fallbackDescription: description,
    canonicalPath: `/courses-in-malaysia/page-${page}`,
  })
}

export default async function CoursesPageWithSlugPagination({ params, searchParams }: PageProps) {
  const { pageSlug } = await params
  const page = parsePageFromSlug(pageSlug)

  if (!page) notFound()
  if (page === 1) redirect('/courses-in-malaysia')

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
    page,
  })
  const breadcrumbTitle = result.seo?.meta_title && result.seo.meta_title !== '%title%'
    ? result.seo.meta_title
    : `Courses in Malaysia - Page ${page} | Education Malaysia`
  const breadcrumbDescription =
    result.seo?.meta_description ||
    result.seo?.page_content ||
    `Page ${page} of courses and programs offered at universities across Malaysia. Find your ideal course today.`

  const filterData = result.filters
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
    noc: result.noc,
  }
  const samplePrograms = (result.rows.data || [])
    .slice(0, 6)
    .map((item: any) => item?.course_name || item?.name)
    .filter(Boolean)
    .join(', ')
  const faqSchema = await fetchDynamicFaqSchema({
    title: breadcrumbTitle,
    description: breadcrumbDescription,
    content: `${result.seo?.page_content || ''} ${samplePrograms}`.trim(),
    path: `/courses-in-malaysia/page-${page}`,
  })
  const faqItems = extractFaqItems(faqSchema)
  const topCourse = (result.rows.data || [])[0] as any
  const courseSchema = courseDiscoveryJsonLd({
    courseName: topCourse?.course_name || `Courses in Malaysia Page ${page}`,
    description: String(breadcrumbDescription),
    universityName: topCourse?.university?.name || '',
    duration: topCourse?.duration || '',
    fees: topCourse?.tution_fee || '',
    currency: 'MYR',
    studyMode: topCourse?.study_mode || '',
    courseLevel: topCourse?.level || String(result.current_filters?.level || ''),
    country: 'Malaysia',
    city: topCourse?.university?.city || '',
    intakeDates: topCourse?.intake || '',
    courseUrl: `/courses-in-malaysia/page-${page}`,
    universityUrl: topCourse?.university?.uname ? `/university/${topCourse.university.uname}` : '',
    ranking: topCourse?.university?.rating || '',
    category: result.current_filters?.category?.name || '',
    specialization: result.current_filters?.specialization?.name || '',
  })

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Courses in Malaysia', url: `${SITE_URL}/courses-in-malaysia` },
        { name: `Page ${page}`, url: `${SITE_URL}/courses-in-malaysia/page-${page}` },
      ], { name: breadcrumbTitle, description: breadcrumbDescription })} />
      <JsonLd data={courseSchema as any} />
      <JsonLd data={faqSchema as any} />
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
      <FaqSection title={`Courses in Malaysia - Page ${page} FAQs`} faqs={faqItems} />
    </>
  )
}
