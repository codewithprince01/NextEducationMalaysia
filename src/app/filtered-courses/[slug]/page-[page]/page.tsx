import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'
import CoursesListClient from '../../../courses-in-malaysia/CoursesListClient'
import { malaysiaDiscoveryService } from '@/backend'
import { buildCoursesDiscoveryMetadata } from '@/lib/seo/courses-discovery-metadata'
import JsonLd from '@/components/seo/JsonLd'
import { breadcrumbJsonLd, courseDiscoveryJsonLd } from '@/lib/seo/structured-data'

export const revalidate = 86400

interface PageProps {
  params: Promise<{ slug: string; page: string }>
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
  const { slug, page } = await params
  const resolvedParams = await searchParams
  const level = firstString(resolvedParams.level ?? resolvedParams.levels)
  const category = firstString(resolvedParams.category ?? resolvedParams.categories)
  const specialization = firstString(resolvedParams.specialization ?? resolvedParams.specializations)
  const studyModes = allStrings(resolvedParams.study_mode ?? resolvedParams.study_modes)
  const intakes = allStrings(resolvedParams.intake ?? resolvedParams.intakes)
  const search = firstString(resolvedParams.search)

  const filterResult = await malaysiaDiscoveryService.getCoursesInMalaysia({})
  const levelMatch = filterResult.filters.levels.find((f: any) => f.slug === slug)
  const categoryMatch = filterResult.filters.categories.find((f: any) => f.slug === slug)
  const specializationMatch = filterResult.filters.specializations.find((f: any) => f.slug === slug)

  let slugLevel: string | undefined
  let slugCategory: string | undefined
  let slugSpecialization: string | undefined
  if (levelMatch) slugLevel = slug
  else if (categoryMatch) slugCategory = slug
  else if (specializationMatch) slugSpecialization = slug

  const result = await malaysiaDiscoveryService.getCoursesInMalaysia({
    level: slugLevel ?? level,
    category: slugCategory ?? category,
    specialization: slugSpecialization ?? specialization,
    study_mode: studyModes.length > 0 ? studyModes : undefined,
    intake: intakes.length > 0 ? intakes : undefined,
    search,
    page: parseInt(page),
  })
  const slugTitle = `${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Courses in Malaysia - Page ${page} | Education Malaysia`
  const rawSeoTitle = String(result.seo?.meta_title || '').trim()
  const isGenericSeoTitle = /^find courses,\s*universities\/colleges/i.test(rawSeoTitle)
  const title = rawSeoTitle && rawSeoTitle !== '%title%' && !isGenericSeoTitle
    ? rawSeoTitle
    : slugTitle
  const description = result.seo?.meta_description || result.seo?.page_content ||
    `Page ${page} of courses and programs offered at universities across Malaysia.`
  const effectiveSeo = isGenericSeoTitle
    ? { ...result.seo, meta_title: String(title), meta_description: description }
    : result.seo

  return buildCoursesDiscoveryMetadata({
    seo: effectiveSeo,
    fallbackTitle: String(title),
    fallbackDescription: description,
    canonicalPath: `/${slug}-courses/page-${page}`,
  })
}

export default async function DynamicCoursesPageWithPagination({ params, searchParams }: PageProps) {
  const { slug, page: pageSlug } = await params
  const resolvedParams = await searchParams
  const page = parseInt(pageSlug)
  const level = firstString(resolvedParams.level ?? resolvedParams.levels)
  const category = firstString(resolvedParams.category ?? resolvedParams.categories)
  const specialization = firstString(resolvedParams.specialization ?? resolvedParams.specializations)
  const studyModes = allStrings(resolvedParams.study_mode ?? resolvedParams.study_modes)
  const intakes = allStrings(resolvedParams.intake ?? resolvedParams.intakes)
  const search = firstString(resolvedParams.search)

  // Determine filter type based on slug
  const filterResult = await malaysiaDiscoveryService.getCoursesInMalaysia({})
  
  // Find which filter type this slug belongs to
  let filterType = 'levels'
  let filterValue = slug
  
  const levelMatch = filterResult.filters.levels.find((f: any) => f.slug === slug)
  const categoryMatch = filterResult.filters.categories.find((f: any) => f.slug === slug)
  const specializationMatch = filterResult.filters.specializations.find((f: any) => f.slug === slug)
  
  if (levelMatch) {
    filterType = 'levels'
    filterValue = levelMatch.level || slug
  } else if (categoryMatch) {
    filterType = 'categories'
    filterValue = categoryMatch.name || slug
  } else if (specializationMatch) {
    filterType = 'specializations'
    filterValue = specializationMatch.name || slug
  }

  const serviceParams: any = {
    level,
    category,
    specialization,
    study_mode: studyModes.length > 0 ? studyModes : undefined,
    intake: intakes.length > 0 ? intakes : undefined,
    search,
    page,
  }
  if (filterType === 'levels') serviceParams.level = slug
  if (filterType === 'categories') serviceParams.category = slug
  if (filterType === 'specializations') serviceParams.specialization = slug

  // Fetch data with the detected filter
  const result = await malaysiaDiscoveryService.getCoursesInMalaysia(serviceParams)
  const rawSeoTitle = String(result.seo?.meta_title || '').trim()
  const isGenericSeoTitle = /^find courses,\s*universities\/colleges/i.test(rawSeoTitle)
  const breadcrumbTitle =
    rawSeoTitle && rawSeoTitle !== '%title%' && !isGenericSeoTitle
      ? rawSeoTitle
      : `${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Courses in Malaysia - Page ${page} | Education Malaysia`
  const breadcrumbDescription =
    result.seo?.meta_description ||
    result.seo?.page_content ||
    `Page ${page} of courses and programs offered at universities across Malaysia.`

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
  const topCourse = (result.rows.data || [])[0] as any
  const courseSchema = courseDiscoveryJsonLd({
    courseName: topCourse?.course_name || `${filterValue || slug} Courses in Malaysia Page ${page}`,
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
    courseUrl: `/${slug}-courses/page-${page}`,
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
        { name: filterValue || slug, url: `${SITE_URL}/${slug}-courses` },
        { name: `Page ${page}`, url: `${SITE_URL}/${slug}-courses/page-${page}` },
      ], { name: breadcrumbTitle, description: breadcrumbDescription })} />
      <JsonLd data={courseSchema as any} />
      <CoursesListClient 
        initialFilterData={result.filters} 
        initialCoursesData={coursesData}
        initialFilterType={filterType}
        initialFilterValue={filterValue}
        initialLevel={filterType === 'levels' ? slug : (resolvedParams.level ?? resolvedParams.levels)}
        initialCategory={filterType === 'categories' ? slug : (resolvedParams.category ?? resolvedParams.categories)}
        initialSpecialization={filterType === 'specializations' ? slug : (resolvedParams.specialization ?? resolvedParams.specializations)}
        initialStudyMode={resolvedParams.study_mode ?? resolvedParams.study_modes}
        initialIntake={resolvedParams.intake ?? resolvedParams.intakes}
        initialSearch={resolvedParams.search}
        initialYear={new Date().getFullYear()}
      />
    </>
  )
}
