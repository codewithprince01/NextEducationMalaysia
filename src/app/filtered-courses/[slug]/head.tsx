import { malaysiaDiscoveryService } from '@/backend'
import { courseDiscoveryJsonLd } from '@/lib/seo/structured-data'

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

export default async function Head({ params, searchParams }: PageProps) {
  const { slug } = await params
  const resolvedParams = await searchParams
  const page = resolvedParams.page ? parseInt(resolvedParams.page, 10) : 1
  const level = firstString(resolvedParams.level ?? resolvedParams.levels)
  const category = firstString(resolvedParams.category ?? resolvedParams.categories)
  const specialization = firstString(resolvedParams.specialization ?? resolvedParams.specializations)
  const studyModes = allStrings(resolvedParams.study_mode ?? resolvedParams.study_modes)
  const intakes = allStrings(resolvedParams.intake ?? resolvedParams.intakes)
  const search = firstString(resolvedParams.search)

  const filterResult = await malaysiaDiscoveryService.getCoursesInMalaysia({})

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

  const result = await malaysiaDiscoveryService.getCoursesInMalaysia(serviceParams)
  const rawSeoTitle = String(result.seo?.meta_title || '').trim()
  const isGenericSeoTitle = /^find courses,\s*universities\/colleges/i.test(rawSeoTitle)
  const breadcrumbTitle =
    rawSeoTitle && rawSeoTitle !== '%title%' && !isGenericSeoTitle
      ? rawSeoTitle
      : `${slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())} Courses in Malaysia - Find the Best Programs | Education Malaysia`
  const breadcrumbDescription =
    result.seo?.meta_description ||
    result.seo?.page_content ||
    'Explore courses and programs offered at universities across Malaysia. Filter by university, intake and more.'

  const topCourse = (result.rows.data || [])[0] as any
  const courseSchema = courseDiscoveryJsonLd({
    courseName: topCourse?.course_name || `${filterValue || slug} Courses in Malaysia`,
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
    courseUrl: `/${slug}-courses`,
    universityUrl: topCourse?.university?.uname ? `/university/${topCourse.university.uname}` : '',
    ranking: topCourse?.university?.rating || '',
    category: result.current_filters?.category?.name || '',
    specialization: result.current_filters?.specialization?.name || '',
  })
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
    </>
  )
}
