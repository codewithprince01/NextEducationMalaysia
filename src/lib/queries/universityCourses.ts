import { prisma } from '@/lib/db'

export const COURSES_PER_PAGE = 10

export type UniversityCourseFilters = {
  level?: string
  course_category_id?: string | number
  specialization_id?: string | number
  study_mode?: string
}

/** Same predicates the /api/university/[slug]/courses route applies. */
function buildCourseFilterSql(filters: UniversityCourseFilters = {}) {
  let sql = ''
  const args: any[] = []

  if (filters.level) {
    sql += ' AND level = ?'
    args.push(filters.level)
  }
  if (filters.course_category_id) {
    sql += ' AND course_category_id = ?'
    args.push(Number(filters.course_category_id))
  }
  if (filters.specialization_id) {
    sql += ' AND specialization_id = ?'
    args.push(Number(filters.specialization_id))
  }
  if (filters.study_mode) {
    sql += ' AND study_mode LIKE ?'
    args.push(`%${filters.study_mode}%`)
  }

  return { sql, args }
}

/** Pulls the course filters out of a page's `searchParams`, first value wins. */
export function courseFiltersFromSearchParams(
  searchParams: Record<string, string | string[] | undefined> = {}
): UniversityCourseFilters {
  const first = (value: string | string[] | undefined) =>
    (Array.isArray(value) ? value[0] : value) || undefined

  return {
    level: first(searchParams.level),
    course_category_id: first(searchParams.course_category_id),
    specialization_id: first(searchParams.specialization_id),
    study_mode: first(searchParams.study_mode),
  }
}

export type UniversityCoursesPage = {
  programs: {
    data: any[]
    current_page: number
    last_page: number
    total: number
  }
  levels: any[]
  categories: any[]
  specializations: any[]
  study_modes: { study_mode: string }[]
  university: { id: number; name: string | null }
}

/**
 * Server-side data for one page of a university's course list.
 *
 * Ordering is `id DESC` to match `universityService.getUniversityCourses`, which
 * backs the /api/university/[slug]/courses endpoint the client re-fetches from.
 * The old server query sorted by course_name, so the list silently reshuffled
 * the moment the client took over.
 *
 * Shared by `/university/[slug]/courses` and `/university/[slug]/courses/page-N`
 * so both render from the same query. The page-N route used to `fetch()` the
 * REST endpoint through a relative URL, which a Server Component cannot resolve
 * — it threw "Failed to parse URL" on every request and left the page with no
 * server-rendered data at all.
 */
export async function getUniversityCoursesPage(
  slug: string,
  page = 1,
  filters: UniversityCourseFilters = {}
): Promise<UniversityCoursesPage | null> {
  const currentPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  const offset = (currentPage - 1) * COURSES_PER_PAGE
  // Applying the filters server-side is what stops page 2 from painting the
  // full, unfiltered list for a frame before the client re-fetches.
  const filter = buildCourseFilterSql(filters)

  const uni = await prisma.university.findFirst({
    where: { uname: slug, status: 1 },
    select: { id: true, name: true },
  })
  if (!uni) return null

  const [totalRes, programsRaw, levelsRaw, categories, specializations, studyModesRaw] =
    await Promise.all([
      prisma.$queryRawUnsafe(
        `SELECT COUNT(*) as total FROM university_programs WHERE university_id = ? AND status = 1${filter.sql}`,
        uni.id,
        ...filter.args
      ) as Promise<any[]>,
      prisma.$queryRawUnsafe(
        `SELECT id, course_name, slug, level, duration, tution_fee, intake, study_mode, application_deadline, accreditations, university_id
         FROM university_programs
         WHERE university_id = ? AND status = 1${filter.sql}
         ORDER BY id DESC
         LIMIT ? OFFSET ?`,
        uni.id,
        ...filter.args,
        COURSES_PER_PAGE,
        offset
      ) as Promise<any[]>,
      prisma.$queryRawUnsafe(
        `SELECT DISTINCT level FROM university_programs WHERE university_id = ? AND status = 1 AND level IS NOT NULL ORDER BY level ASC`,
        uni.id
      ) as Promise<any[]>,
      prisma.$queryRawUnsafe(
        `SELECT DISTINCT cc.id, cc.name
         FROM university_programs up
         JOIN course_categories cc ON up.course_category_id = cc.id
         WHERE up.university_id = ? AND up.status = 1 AND up.course_category_id IS NOT NULL
         ORDER BY cc.name ASC`,
        uni.id
      ) as Promise<any[]>,
      prisma.$queryRawUnsafe(
        `SELECT DISTINCT cs.id, cs.name
         FROM university_programs up
         JOIN course_specializations cs ON up.specialization_id = cs.id
         WHERE up.university_id = ? AND up.status = 1 AND up.specialization_id IS NOT NULL
         ORDER BY cs.name ASC`,
        uni.id
      ) as Promise<any[]>,
      prisma.$queryRawUnsafe(
        `SELECT DISTINCT study_mode
         FROM university_programs
         WHERE university_id = ? AND status = 1 AND study_mode IS NOT NULL AND study_mode <> ''`,
        uni.id
      ) as Promise<any[]>,
    ])

  const total = Number(totalRes[0]?.total || 0)
  const programs = (programsRaw || []).map((p: any) => ({
    ...p,
    id: Number(p.id),
    university_id: Number(p.university_id),
    tution_fee: p.tution_fee != null ? String(p.tution_fee) : '',
  }))

  const study_modes = Array.from(
    new Set(
      (studyModesRaw || [])
        .flatMap((r: any) => String(r.study_mode || '').split(','))
        .map((v: string) => v.trim())
        .filter(Boolean)
    )
  )
    .sort((a: string, b: string) => a.localeCompare(b))
    .map((study_mode: string) => ({ study_mode }))

  return {
    programs: {
      data: programs,
      current_page: currentPage,
      last_page: Math.max(1, Math.ceil(total / COURSES_PER_PAGE)),
      total,
    },
    levels: levelsRaw || [],
    categories: categories || [],
    specializations: specializations || [],
    study_modes,
    university: { id: Number(uni.id), name: uni.name },
  }
}
