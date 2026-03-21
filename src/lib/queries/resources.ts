import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'
import { serializeBigInt } from '@/lib/utils'

const SITE_VAR = process.env.SITE_VAR || 'MYS'

function normalizeExam(exam: any) {
  if (!exam) return null
  const contents = (exam.exam_page_contents || exam.contents || []).map((content: any) => ({
    ...content,
    tab_title: content?.tab_title ?? content?.tab ?? '',
    tab_content: content?.tab_content ?? content?.description ?? '',
  }))

  return {
    ...exam,
    uri: exam?.uri ?? exam?.slug ?? null,
    slug: exam?.slug ?? exam?.uri ?? null,
    page_name: exam?.page_name ?? exam?.name ?? '',
    headline: exam?.headline ?? exam?.shortnote ?? '',
    imgpath: exam?.imgpath ?? exam?.banner_path ?? exam?.og_image_path ?? null,
    exam_page_contents: contents,
    contents,
    faqs: exam?.faqs || [],
  }
}

async function firstSuccessfulQuery<T = any>(queries: Array<{ sql: string; params?: any[] }>): Promise<T | null> {
  for (const query of queries) {
    try {
      const rows = (await prisma.$queryRawUnsafe(query.sql, ...(query.params || []))) as any[]
      if (rows?.length) return rows[0] as T
    } catch {
      // Try next query variant
    }
  }
  return null
}

async function firstSuccessfulListQuery<T = any>(queries: Array<{ sql: string; params?: any[] }>): Promise<T[]> {
  for (const query of queries) {
    try {
      const rows = (await prisma.$queryRawUnsafe(query.sql, ...(query.params || []))) as any[]
      if (Array.isArray(rows)) return rows as T[]
    } catch {
      // Try next query variant
    }
  }
  return []
}

export const getExamBySlug = unstable_cache(
  async (slug: string) => {
    const exam = await firstSuccessfulQuery<any>([
      { sql: 'SELECT * FROM exams WHERE uri = ? AND website = ? LIMIT 1', params: [slug, SITE_VAR] },
      { sql: 'SELECT * FROM exams WHERE slug = ? AND website = ? LIMIT 1', params: [slug, SITE_VAR] },
      { sql: 'SELECT * FROM exams WHERE (uri = ? OR slug = ?) AND website = ? LIMIT 1', params: [slug, slug, SITE_VAR] },
      { sql: 'SELECT * FROM exams WHERE uri = ? LIMIT 1', params: [slug] },
      { sql: 'SELECT * FROM exams WHERE slug = ? LIMIT 1', params: [slug] },
      { sql: 'SELECT * FROM exams WHERE (uri = ? OR slug = ?) LIMIT 1', params: [slug, slug] },
    ])

    if (!exam) return null

    const [contents, faqs] = await Promise.all([
      firstSuccessfulListQuery<any>([
        {
          sql: 'SELECT * FROM exam_page_contents WHERE exam_id = ? AND status = 1 ORDER BY position ASC, id ASC',
          params: [exam.id],
        },
        {
          sql: 'SELECT * FROM exam_page_contents WHERE exam_id = ? ORDER BY position ASC, id ASC',
          params: [exam.id],
        },
        {
          sql: 'SELECT * FROM exam_contents WHERE exam_id = ? ORDER BY position ASC, id ASC',
          params: [exam.id],
        },
      ]),
      firstSuccessfulListQuery<any>([
        { sql: 'SELECT * FROM exam_faqs WHERE exam_id = ? AND status = 1 ORDER BY position ASC, id ASC', params: [exam.id] },
        { sql: 'SELECT * FROM exam_faqs WHERE exam_id = ? ORDER BY position ASC, id ASC', params: [exam.id] },
      ]),
    ])

    return serializeBigInt(normalizeExam({ ...exam, exam_page_contents: contents, faqs }))
  },
  ['exam-detail'],
  { revalidate: 86400 },
)

export const getAllExams = unstable_cache(
  async () => {
    const exams = await firstSuccessfulListQuery<any>([
      { sql: 'SELECT * FROM exams WHERE status = 1 AND website = ? ORDER BY position ASC, id ASC', params: [SITE_VAR] },
      { sql: 'SELECT * FROM exams WHERE website = ? ORDER BY position ASC, id ASC', params: [SITE_VAR] },
      { sql: 'SELECT * FROM exams WHERE status = 1 ORDER BY position ASC, id ASC' },
      { sql: 'SELECT * FROM exams ORDER BY position ASC, id ASC' },
      { sql: 'SELECT * FROM exams ORDER BY id ASC' },
    ])

    return serializeBigInt(exams.map(normalizeExam))
  },
  ['all-exams'],
  { revalidate: 86400 },
)

export const getServiceBySlug = unstable_cache(
  async (slug: string) => {
    const serviceRows = await firstSuccessfulListQuery<any>([
      { sql: 'SELECT * FROM site_pages WHERE uri = ? AND website = ? AND status = 1 LIMIT 1', params: [slug, SITE_VAR] },
      { sql: 'SELECT * FROM site_pages WHERE uri = ? AND status = 1 LIMIT 1', params: [slug] },
      { sql: 'SELECT * FROM services WHERE slug = ? AND website = ? AND status = 1 LIMIT 1', params: [slug, SITE_VAR] },
      { sql: 'SELECT * FROM services WHERE slug = ? AND status = 1 LIMIT 1', params: [slug] },
    ])

    const service = serviceRows[0]
    if (!service) return null

    const contents = await firstSuccessfulListQuery<any>([
      { sql: 'SELECT * FROM site_page_tabs WHERE page_id = ? AND status = 1 ORDER BY id ASC', params: [service.id] },
      { sql: 'SELECT * FROM site_page_tabs WHERE page_id = ? ORDER BY id ASC', params: [service.id] },
      { sql: 'SELECT * FROM service_contents WHERE service_id = ? ORDER BY COALESCE(position, 0), id', params: [service.id] },
    ])

    return serializeBigInt({
      ...service,
      slug: service?.slug ?? service?.uri ?? slug,
      uri: service?.uri ?? service?.slug ?? slug,
      page_name: service?.page_name ?? service?.title ?? service?.headline ?? '',
      headline: service?.headline ?? service?.page_name ?? service?.title ?? '',
      description: service?.description ?? service?.shortnote ?? '',
      imgpath: service?.imgpath ?? service?.thumbnail_path ?? service?.banner_path ?? service?.imgpath ?? null,
      thumbnail_path: service?.thumbnail_path ?? service?.imgpath ?? null,
      contents: contents.map((row: any) => ({
        ...row,
        tab_title: row?.tab_title ?? row?.tab ?? '',
        tab_content: row?.tab_content ?? row?.description ?? '',
      })),
    })
  },
  ['service-detail'],
  { revalidate: 86400 },
)

export const getAllServices = unstable_cache(
  async () => {
    const rows = await firstSuccessfulListQuery<any>([
      { sql: 'SELECT * FROM site_pages WHERE website = ? AND status = 1 ORDER BY position ASC, id ASC', params: [SITE_VAR] },
      { sql: 'SELECT * FROM site_pages WHERE status = 1 ORDER BY position ASC, id ASC' },
      { sql: 'SELECT * FROM services WHERE website = ? AND status = 1 ORDER BY id DESC', params: [SITE_VAR] },
      { sql: 'SELECT * FROM services WHERE status = 1 ORDER BY id DESC' },
    ])

    return serializeBigInt(
      rows.map((service: any) => ({
        ...service,
        slug: service?.slug ?? service?.uri ?? '',
        uri: service?.uri ?? service?.slug ?? '',
        page_name: service?.page_name ?? service?.title ?? service?.headline ?? '',
        headline: service?.headline ?? service?.page_name ?? service?.title ?? '',
        description: service?.description ?? service?.shortnote ?? '',
        imgpath: service?.imgpath ?? service?.thumbnail_path ?? service?.banner_path ?? null,
        thumbnail_path: service?.thumbnail_path ?? service?.imgpath ?? null,
      })),
    )
  },
  ['all-services'],
  { revalidate: 86400 },
)
