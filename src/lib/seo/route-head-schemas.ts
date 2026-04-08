import { prisma } from '@/lib/db-fresh'
import { blogService, malaysiaDiscoveryService } from '@/backend'
import { getFaqs } from '@/lib/queries/home'
import { getSpecializationBySlug } from '@/lib/queries/specializations'
import { getUniversityFull } from '@/lib/queries/universities'
import { serializeBigInt } from '@/lib/utils'
import { blogJsonLd, courseDiscoveryJsonLd, universityJsonLd } from '@/lib/seo/structured-data'
import { generateFAQSchema, normalizeFaqs } from '@/lib/seo/faq-schema'

type JsonLd = Record<string, unknown>

function parseSlugWithId(slugWithId: string) {
  const lastDash = slugWithId.lastIndexOf('-')
  if (lastDash === -1) return null
  const id = Number.parseInt(slugWithId.slice(lastDash + 1), 10)
  if (!Number.isFinite(id)) return null
  const slug = slugWithId.slice(0, lastDash)
  return { slug, id }
}

function pushFaqSchema(schemas: JsonLd[], rows: Array<{ question?: string; answer?: string }>) {
  const faqSchema = generateFAQSchema(normalizeFaqs(rows as any[]))
  if (faqSchema) schemas.push(faqSchema as JsonLd)
}

async function getFilteredCoursesResultBySlug(slug: string, page: number) {
  const filterResult = await malaysiaDiscoveryService.getCoursesInMalaysia({})
  let filterType: 'levels' | 'categories' | 'specializations' = 'levels'
  const levelMatch = filterResult.filters.levels.find((f: any) => f.slug === slug)
  const categoryMatch = filterResult.filters.categories.find((f: any) => f.slug === slug)
  const specializationMatch = filterResult.filters.specializations.find((f: any) => f.slug === slug)

  if (categoryMatch) filterType = 'categories'
  else if (specializationMatch) filterType = 'specializations'
  else if (levelMatch) filterType = 'levels'

  const serviceParams: any = { page }
  if (filterType === 'levels') serviceParams.level = slug
  if (filterType === 'categories') serviceParams.category = slug
  if (filterType === 'specializations') serviceParams.specialization = slug

  return malaysiaDiscoveryService.getCoursesInMalaysia(serviceParams)
}

async function getUniversityTypeFaqs(typeSlug: string) {
  const aliases = Array.from(
    new Set([
      String(typeSlug || '').toLowerCase(),
      String(typeSlug || '').toLowerCase().replace(/-in-malaysia$/, ''),
      'universities',
      'university',
    ]),
  ).filter(Boolean)
  if (aliases.length === 0) return []

  const rows = (await prisma.$queryRawUnsafe(
    `
      SELECT f.question, f.answer
      FROM faq_categories fc
      INNER JOIN faqs f ON f.category_id = fc.id
      WHERE LOWER(fc.category_slug) IN (${aliases.map(() => '?').join(', ')})
      ORDER BY f.id ASC
      LIMIT 12
    `,
    ...aliases,
  )) as Array<{ question?: string; answer?: string }>

  return rows
}

export async function resolveRouteHeadSchemas(pathname: string): Promise<JsonLd[]> {
  try {
    const pathOnly = String(pathname || '/').split('?')[0].split('#')[0] || '/'
    const schemas: JsonLd[] = []

  if (pathOnly === '/faqs') {
    const faqs = await getFaqs()
    const byCategory = new Map<string, Array<{ question: string; answer: string }>>()
    for (const row of faqs as any[]) {
      const slug = String(row?.category?.category_slug || '').trim()
      if (!slug) continue
      if (!byCategory.has(slug)) byCategory.set(slug, [])
      byCategory.get(slug)!.push({
        question: String(row?.question || '').trim(),
        answer: String(row?.answer || '').trim(),
      })
    }
    const defaultActiveSlug = [...byCategory.keys()][0] || ''
    const activeFaqs = defaultActiveSlug ? byCategory.get(defaultActiveSlug) || [] : []
    pushFaqSchema(schemas, activeFaqs as any[])
  }

  const faqDetailMatch = pathOnly.match(/^\/faq\/([^/]+)$/i)
  if (faqDetailMatch) {
    const categorySlug = String(faqDetailMatch[1] || '').trim().toLowerCase()
    if (categorySlug) {
      const rows = await getFaqs(categorySlug)
      pushFaqSchema(
        schemas,
        (rows || []).map((r: any) => ({
          question: String(r?.question || '').trim(),
          answer: String(r?.answer || '').trim(),
        })),
      )
    }
  }

  const coursesMatch = pathOnly.match(/^\/courses-in-malaysia(?:\/page-(\d+))?$/i)
  if (coursesMatch) {
    const parsedPage = Number.parseInt(coursesMatch[1] || '1', 10)
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1

    const result = await malaysiaDiscoveryService.getCoursesInMalaysia({ page })
    const topCourse = (result?.rows?.data || [])[0] as any
    const fallbackDescription =
      result?.seo?.meta_description ||
      result?.seo?.page_content ||
      `Page ${page} of courses and programs offered at universities across Malaysia. Find your ideal course today.`

    schemas.push(
      courseDiscoveryJsonLd({
        courseName: topCourse?.course_name || (page > 1 ? `Courses in Malaysia Page ${page}` : 'Courses in Malaysia'),
        description: String(fallbackDescription),
        universityName: topCourse?.university?.name || '',
        duration: topCourse?.duration || '',
        fees: topCourse?.tution_fee || '',
        currency: 'MYR',
        studyMode: topCourse?.study_mode || '',
        courseLevel: topCourse?.level || String(result?.current_filters?.level || ''),
        country: 'Malaysia',
        city: topCourse?.university?.city || '',
        intakeDates: topCourse?.intake || '',
        courseUrl: page > 1 ? `/courses-in-malaysia/page-${page}` : '/courses-in-malaysia',
        universityUrl: topCourse?.university?.uname ? `/university/${topCourse.university.uname}` : '',
        category: result?.current_filters?.category?.name || '',
        specialization: result?.current_filters?.specialization?.name || '',
      }) as JsonLd,
    )
    pushFaqSchema(schemas, ((result as any).faqs || []) as any[])
  }

  const filteredMatch = pathOnly.match(/^\/filtered-courses\/([^/]+)(?:\/page-(\d+))?$/i)
  const prettyFilteredMatch = pathOnly.match(/^\/([^/]+)-courses(?:\/page-(\d+))?$/i)
  const isCoursesInMalaysiaPretty = /^\/courses-in-malaysia(?:\/page-\d+)?$/i.test(pathOnly)
  const slugFromFiltered = filteredMatch?.[1] || (!isCoursesInMalaysiaPretty ? prettyFilteredMatch?.[1] : '')
  const pageFromFiltered = Number.parseInt(filteredMatch?.[2] || prettyFilteredMatch?.[2] || '1', 10)

  if (slugFromFiltered) {
    const page = Number.isFinite(pageFromFiltered) && pageFromFiltered > 0 ? pageFromFiltered : 1
    const result = await getFilteredCoursesResultBySlug(slugFromFiltered, page)
    const topCourse = (result?.rows?.data || [])[0] as any
    const fallbackDescription =
      result?.seo?.meta_description ||
      result?.seo?.page_content ||
      `Page ${page} of courses and programs offered at universities across Malaysia. Find your ideal course today.`

    schemas.push(
      courseDiscoveryJsonLd({
        courseName: topCourse?.course_name || `${slugFromFiltered.replace(/-/g, ' ')} Courses in Malaysia`,
        description: String(fallbackDescription),
        universityName: topCourse?.university?.name || '',
        duration: topCourse?.duration || '',
        fees: topCourse?.tution_fee || '',
        currency: 'MYR',
        studyMode: topCourse?.study_mode || '',
        courseLevel: topCourse?.level || String(result?.current_filters?.level || ''),
        country: 'Malaysia',
        city: topCourse?.university?.city || '',
        intakeDates: topCourse?.intake || '',
        courseUrl: pathOnly,
        universityUrl: topCourse?.university?.uname ? `/university/${topCourse.university.uname}` : '',
        category: result?.current_filters?.category?.name || '',
        specialization: result?.current_filters?.specialization?.name || '',
      }) as JsonLd,
    )
    pushFaqSchema(schemas, ((result as any).faqs || []) as any[])
  }

  const blogMatch = pathOnly.match(/^\/blog\/([^/]+)\/([^/]+)$/i)
  if (blogMatch && !/^page-\d+$/i.test(blogMatch[2])) {
    const categorySlug = blogMatch[1]
    const slugWithId = blogMatch[2]
    const parsed = parseSlugWithId(slugWithId)

    const blog = parsed
      ? await prisma.blog.findFirst({
          where: { id: parsed.id, status: 1 },
          select: {
            id: true,
            headline: true,
            slug: true,
            description: true,
            thumbnail_path: true,
            meta_keyword: true,
            og_image_path: true,
            created_at: true,
            updated_at: true,
            author: { select: { name: true } },
            category: { select: { category_name: true, category_slug: true } },
          },
        })
      : await prisma.blog.findFirst({
          where: {
            slug: slugWithId,
            status: 1,
            category: { category_slug: categorySlug },
          },
          select: {
            id: true,
            headline: true,
            slug: true,
            description: true,
            thumbnail_path: true,
            meta_keyword: true,
            og_image_path: true,
            created_at: true,
            updated_at: true,
            author: { select: { name: true } },
            category: { select: { category_name: true, category_slug: true } },
          },
        })

    if (blog?.id && blog?.slug) {
      const canonicalCategory = blog.category?.category_slug || categorySlug
      schemas.push(
        blogJsonLd(blog as any, Number(blog.id), {
          categorySlug: canonicalCategory,
          path: `/blog/${canonicalCategory}/${blog.slug}-${blog.id}`,
        }) as JsonLd,
      )
      let faqRows: Array<{ question?: string; answer?: string }> = []
      try {
        const detail = await blogService.getBlogDetail(
          canonicalCategory,
          `${blog.slug}-${blog.id}`,
        )
        if (Array.isArray((detail as any)?.faqs)) {
          faqRows = (detail as any).faqs as Array<{ question?: string; answer?: string }>
        }
      } catch {
        // Fallback to direct table query below
      }

      if (!Array.isArray(faqRows) || faqRows.length === 0) {
        const blogFaqRows = await prisma.blogFaq.findMany({
          where: { blog_id: Number(blog.id) },
          select: { question: true, answer: true, position: true, id: true },
          orderBy: [{ position: 'asc' }, { id: 'asc' }],
        })
        faqRows = blogFaqRows as Array<{ question?: string; answer?: string }>
      }

      pushFaqSchema(schemas, faqRows)
    }
  }

  const specializationMatch = pathOnly.match(/^\/specialization\/([^/]+)(?:\/[^/]+)?$/i)
  if (specializationMatch) {
    const specSlug = specializationMatch[1]
    const detail = await getSpecializationBySlug(specSlug)
    const spec = detail?.specialization as any
    if (spec && Array.isArray(spec.faqs)) {
      pushFaqSchema(schemas, spec.faqs as any[])
    }
  }

  const universitiesTypeMatch = pathOnly.match(/^\/universities\/([^/]+)(?:\/[^/]+)?$/i)
  if (universitiesTypeMatch) {
    const typeSlug = universitiesTypeMatch[1]
    if (typeSlug && typeSlug !== 'universities-in-malaysia') {
      const faqRows = await getUniversityTypeFaqs(typeSlug)
      pushFaqSchema(schemas, faqRows as any[])
    }
  }

  const uniMatch =
    pathOnly.match(/^\/university\/([^/]+)(?:\/.*)?$/i) ||
    pathOnly.match(/^\/universities\/([^/]+)(?:\/.*)?$/i)
  if (uniMatch) {
    const slug = uniMatch[1]
    const universityData = await getUniversityFull(slug)
    if (universityData) {
      const university = serializeBigInt(universityData) as any
      schemas.push(
        universityJsonLd(university, { path: `/university/${slug}` }) as JsonLd,
      )
    }
  }

    return schemas
  } catch {
    return []
  }
}
