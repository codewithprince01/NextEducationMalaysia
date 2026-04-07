import { Metadata } from 'next'
import CoursesListClient from '../../courses-in-malaysia/CoursesListClient'
import { malaysiaDiscoveryService } from '@/backend'
import { buildCoursesDiscoveryMetadata } from '@/lib/seo/courses-discovery-metadata'

export const revalidate = 86400

interface PageProps {
  params: Promise<{ slug: string }>
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
  const { slug } = await params
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
  else slugSpecialization = slug

  const result = await malaysiaDiscoveryService.getCoursesInMalaysia({
    level: slugLevel ?? level,
    category: slugCategory ?? category,
    specialization: slugSpecialization ?? specialization,
    study_mode: studyModes.length > 0 ? studyModes : undefined,
    intake: intakes.length > 0 ? intakes : undefined,
    search,
    page: 1,
  })

  const slugTitle = `${slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Courses in Malaysia - Find the Best Programs | Education Malaysia`
  const rawSeoTitle = String(result.seo?.meta_title || '').trim()
  const isGenericSeoTitle = /^find courses,\s*universities\/colleges/i.test(rawSeoTitle)
  const title = rawSeoTitle && rawSeoTitle !== '%title%' && !isGenericSeoTitle
    ? rawSeoTitle
    : slugTitle
  const description = result.seo?.meta_description || result.seo?.page_content ||
    `Explore courses and programs offered at universities across Malaysia. Filter by university, intake and more.`
  const effectiveSeo = isGenericSeoTitle
    ? { ...result.seo, meta_title: String(title), meta_description: description }
    : result.seo

  return buildCoursesDiscoveryMetadata({
    seo: effectiveSeo,
    fallbackTitle: String(title),
    fallbackDescription: description,
    canonicalPath: `/${slug}-courses`,
  })
}

export default async function DynamicCoursesPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const resolvedParams = await searchParams
  const page = resolvedParams.page ? parseInt(resolvedParams.page) : 1
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
    <>
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
