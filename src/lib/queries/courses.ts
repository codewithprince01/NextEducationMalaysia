import { prisma } from '@/lib/db-fresh'
import { unstable_cache } from 'next/cache'
import { serializeBigInt } from '@/lib/utils'

function slugify(value: string) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export const getAllCourseCategorySlugs = unstable_cache(
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
  ['course-category-slugs-v2'],
  { revalidate: 86400 },
)

export const getCourseCategory = unstable_cache(
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
  ['course-category-detail-v2'],
  { revalidate: 86400, tags: ['course'] },
)

export const getAllCourseCategories = unstable_cache(
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
  ['all-course-categories'],
  { revalidate: 86400 },
)

export const getLevels = unstable_cache(
  () =>
    prisma.level.findMany({
      select: { id: true, level: true, slug: true },
      orderBy: { id: 'asc' },
    }).then(serializeBigInt),
  ['levels'],
  { revalidate: 86400 },
)

export const getProgramBySlug = unstable_cache(
  async (slug: string, universitySlug?: string) => {
    const programRows = await prisma.$queryRawUnsafe(
      `
      SELECT
        up.id, up.course_name, up.slug, up.level, up.study_mode, up.intake, up.duration,
        up.tution_fee, up.application_deadline, up.accreditations,
        up.meta_title, up.meta_description, up.meta_keyword, up.og_image_path,
        up.university_id, up.course_category_id, up.specialization_id,
        u.id AS u_id, u.name AS u_name, u.uname AS u_uname, u.logo_path AS u_logo_path,
        cc.name AS category_name, cc.slug AS category_slug,
        cs.name AS specialization_name, cs.slug AS specialization_slug
      FROM university_programs up
      INNER JOIN universities u ON up.university_id = u.id
      LEFT JOIN course_categories cc ON up.course_category_id = cc.id
      LEFT JOIN course_specializations cs ON up.specialization_id = cs.id
      WHERE up.slug = ?
        AND up.status = 1
        AND up.website = 'MYS'
        AND u.status = 1
        AND (? IS NULL OR u.uname = ?)
      LIMIT 1
      `,
      slug,
      universitySlug ?? null,
      universitySlug ?? null,
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
  },
  ['program-detail'],
  { revalidate: 86400 },
)
