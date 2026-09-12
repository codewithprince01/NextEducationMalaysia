import { prisma } from '@/lib/db-fresh'
import { unstable_cache } from 'next/cache'
import { serializeBigInt } from '@/lib/utils'
import { getContentVersion, cachedByContent } from './contentVersion'

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const getAllCourseCategorySlugs = cachedByContent(
  'course',
  ['course-category-slugs-v2'],
  async () => {
    const rows = await prisma.$queryRawUnsafe<Array<{ slug: string | null }>>(
      `
      SELECT slug
      FROM course_categories
      WHERE website = 'MYS'
        AND slug IS NOT NULL
        AND slug <> ''
      `
    )
    return rows.map((r) => r.slug).filter(Boolean) as string[]
  },
  { revalidate: 86400 }
)

export const getCourseCategory = cachedByContent(
  'course',
  ['course-category-detail-v2'],
  async (slug: string) => {
    const requestedSlug = slugify(slug)

    // 1) Exact slug match on website scope
    const exactRows = await prisma.$queryRawUnsafe<Array<{
      id: number
      name: string | null
      slug: string | null
      meta_title: string | null
      meta_description: string | null
      meta_keyword: string | null
      og_image_path: string | null
    }>>(
      `
      SELECT id, name, slug, meta_title, meta_description, meta_keyword, og_image_path
      FROM course_categories
      WHERE website = 'MYS'
        AND slug = ?
      LIMIT 1
      `,
      requestedSlug,
    )

    if (exactRows[0]) return serializeBigInt(exactRows[0])

    // 2) Fallback: resolve by normalized category name slug
    // (old project routes often relied on name->slug equivalence)
    const candidates = await prisma.$queryRawUnsafe<Array<{
      id: number
      name: string | null
      slug: string | null
      meta_title: string | null
      meta_description: string | null
      meta_keyword: string | null
      og_image_path: string | null
    }>>(
      `
      SELECT id, name, slug, meta_title, meta_description, meta_keyword, og_image_path
      FROM course_categories
      WHERE website = 'MYS'
      `
    )

    const matched = candidates.find((row) => {
      const dbSlug = slugify(row.slug || '')
      const nameSlug = slugify(row.name || '')
      return dbSlug === requestedSlug || nameSlug === requestedSlug
    })

    return matched ? serializeBigInt(matched) : null
  },
  { revalidate: 86400, tags: ['course'] },
)

export const getAllCourseCategories = cachedByContent(
  'course',
  ['all-course-categories'],
  () =>
    prisma.courseCategory.findMany({
      where: { status: 1 as any },
      select: {
        id: true,
        name: true,
        slug: true,
        og_image_path: true,
        _count: { select: { programs: { where: { status: 1 as any } } } },
      },
      orderBy: { name: 'asc' },
    }).then(serializeBigInt),
  { revalidate: 86400 }
)

export const getLevels = cachedByContent(
  'course',
  ['levels'],
  () =>
    prisma.level.findMany({
      select: { id: true, level: true, slug: true },
      orderBy: { id: 'asc' },
    }).then(serializeBigInt),
  { revalidate: 86400 }
)

async function fetchProgramBySlug(slug: string, universitySlug?: string) {
    const cleanCourseSlug = decodeURIComponent(slug).toLowerCase().trim();
    const isCourseNum = !isNaN(Number(slug)) ? Number(slug) : 0;
    const cleanUniSlug = universitySlug ? decodeURIComponent(universitySlug).toLowerCase().trim() : null;
    const isUniNum = cleanUniSlug && !isNaN(Number(cleanUniSlug)) ? Number(cleanUniSlug) : 0;

    const programRows = await prisma.$queryRawUnsafe(
      `
      SELECT
        up.id, up.course_name, up.slug, up.level, up.study_mode, up.intake, up.duration,
        up.tution_fee, up.application_deadline, up.accreditations,
        -- Quality columns. The page metadata decides from these whether the course
        -- has enough of its own substance to ask Google to index it, and builds its
        -- description from them when no one has written one. Omitting them made
        -- every course look empty and silently marked the good ones noindex.
        up.overview, up.page_content, up.entry_requirement, up.exam_required,
        up.scholarship_info, up.mode_of_instruction,
        up.total_tuition_fee, up.annual_tuition_fee, up.total_fee, up.tutions_fee,
        up.currency,
        up.meta_title, up.meta_description, up.meta_keyword, up.og_image_path,
        up.university_id, up.course_category_id, up.specialization_id,
        u.id AS u_id, u.name AS u_name, u.uname AS u_uname, u.logo_path AS u_logo_path,
        -- Stands in as the social preview image: no course row has one of its own
        -- and the shared default file is missing from storage.
        u.banner_path AS u_banner_path,
        cc.name AS category_name, cc.slug AS category_slug,
        cs.name AS specialization_name, cs.slug AS specialization_slug
      FROM university_programs up
      INNER JOIN universities u ON up.university_id = u.id
      LEFT JOIN course_categories cc ON up.course_category_id = cc.id
      LEFT JOIN course_specializations cs ON up.specialization_id = cs.id
      WHERE (
        up.slug = ?
        OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(up.course_name, ' ', '-'), '(', ''), ')', ''), '&', 'and')) = ?
        OR (? > 0 AND up.id = ?)
      )
      AND up.status = 1
      AND up.website = 'MYS'
      AND u.status = 1
      AND (
        ? IS NULL
        OR u.uname = ?
        OR LOWER(REPLACE(u.name, ' ', '-')) = ?
        OR (? > 0 AND u.id = ?)
      )
      LIMIT 1
      `,
      cleanCourseSlug,
      cleanCourseSlug,
      isCourseNum,
      isCourseNum,
      cleanUniSlug,
      cleanUniSlug,
      cleanUniSlug,
      isUniNum,
      isUniNum,
    ) as any[]

    if (!programRows?.length) return null
    const row = programRows[0]

    const contentRows = await prisma.$queryRawUnsafe(
      `
      SELECT id, c_id, tab_title, heading, description, imgpath, imgname
      FROM university_program_contents
      WHERE c_id = ? AND status = 1
      ORDER BY id ASC
      `,
      Number(row.id),
    ) as any[]

    const program = {
      id: row.id,
      course_name: row.course_name,
      slug: row.slug,
      level: row.level,
      study_mode: row.study_mode,
      intake: row.intake,
      duration: row.duration,
      tution_fee: row.tution_fee,
      application_deadline: row.application_deadline,
      accreditations: row.accreditations,
      overview: row.overview,
      page_content: row.page_content,
      entry_requirement: row.entry_requirement,
      exam_required: row.exam_required,
      scholarship_info: row.scholarship_info,
      mode_of_instruction: row.mode_of_instruction,
      total_tuition_fee: row.total_tuition_fee,
      annual_tuition_fee: row.annual_tuition_fee,
      total_fee: row.total_fee,
      tutions_fee: row.tutions_fee,
      currency: row.currency,
      meta_title: row.meta_title,
      meta_description: row.meta_description,
      meta_keyword: row.meta_keyword,
      og_image_path: row.og_image_path,
      university_id: row.university_id,
      course_category_id: row.course_category_id,
      specialization_id: row.specialization_id,
      university: {
        id: row.u_id,
        name: row.u_name,
        uname: row.u_uname,
        logo_path: row.u_logo_path,
        banner_path: row.u_banner_path,
      },
      courseCategory: row.category_name
        ? { name: row.category_name, slug: row.category_slug }
        : null,
      courseSpecialization: row.specialization_name
        ? { name: row.specialization_name, slug: row.specialization_slug }
        : null,
      contents: contentRows || [],
    }

  return serializeBigInt(program)
}

/**
 * The heavy query stays cached; the cheap content-version probe decides whether
 * that cache entry is still current. Without it an edit made in the admin panel
 * sat behind the 24h `revalidate` and only appeared the next day. The long
 * revalidate remains as a backstop for the case where the probe itself fails.
 */
const cachedProgramBySlug = unstable_cache(
  async (_version: string, slug: string, universitySlug?: string) =>
    fetchProgramBySlug(slug, universitySlug),
  ['program-detail'],
  { revalidate: 86400, tags: ['course'] },
)

export async function getProgramBySlug(slug: string, universitySlug?: string) {
  if (process.env.NODE_ENV === 'development') {
    return fetchProgramBySlug(slug, universitySlug)
  }
  return cachedProgramBySlug(await getContentVersion('university'), slug, universitySlug)
}
