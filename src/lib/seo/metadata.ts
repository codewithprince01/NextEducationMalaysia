import { Metadata } from 'next'
import { replaceTag } from './replace-tag'
import { prisma } from '@/lib/db'
import { SITE_URL, storageUrl } from '@/lib/constants'
import { currentMonth, currentYear, stripTags, truncate } from '@/lib/utils'

type TagMap = Record<string, string>

function baseTags(): TagMap {
  return {
    currentmonth: currentMonth(),
    currentyear: currentYear(),
    site: SITE_URL,
  }
}

async function getDynamicSeo(url: string) {
  return prisma.dynamicPageSeo.findFirst({ where: { url } })
}

async function getDefaultOgImage(): Promise<string> {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT file_path
    FROM default_og_images
    WHERE \`default\` = 1
    ORDER BY id DESC
    LIMIT 1
  `) as Array<{ file_path?: string | null }>

  return rows[0]?.file_path ? storageUrl(rows[0].file_path)! : `${SITE_URL}/og-default.png`
}

function buildOgImage(path: string | null | undefined, fallback: string): string {
  return path ? storageUrl(path)! : fallback
}

function buildMeta(
  title: string,
  description: string,
  keywords: string,
  canonical: string,
  ogImage: string,
): Metadata {
  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'website',
      siteName: 'Education Malaysia',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
  }
}

export async function resolveUniversityMeta(
  university: { name?: string | null; uname?: string | null; city?: string | null; shortnote?: string | null; meta_title?: string | null; meta_description?: string | null; meta_keyword?: string | null; og_image_path?: string | null },
  section = 'overview',
): Promise<Metadata> {
  const sectionMap: Record<string, string> = {
    overview: 'university',
    courses: 'university-course-list',
    gallery: 'gallery',
    videos: 'video',
    ranking: 'university-ranking',
    reviews: 'review-page',
  }

  const dseo = await getDynamicSeo(sectionMap[section] || 'university')
  const fallbackOg = await getDefaultOgImage()

  const tags: TagMap = {
    ...baseTags(),
    title: university.name || '',
    universityname: university.name || '',
    address: university.city || '',
    shortnote: stripTags(truncate(university.shortnote || '', 160)),
  }

  const title = replaceTag(university.meta_title || dseo?.meta_title || '%universityname%', tags)
  const desc = replaceTag(university.meta_description || dseo?.meta_description || '', tags)
  const kw = replaceTag(university.meta_keyword || dseo?.meta_keyword || '', tags)
  const canonical = `${SITE_URL}/university/${university.uname}${section !== 'overview' ? `/${section}` : ''}`
  const ogImage = buildOgImage(university.og_image_path || dseo?.og_image_path, fallbackOg)

  return buildMeta(title, desc, kw, canonical, ogImage)
}

export async function resolveCourseCategoryMeta(
  category: { name?: string | null; slug?: string | null; meta_title?: string | null; meta_description?: string | null; meta_keyword?: string | null; og_image_path?: string | null },
): Promise<Metadata> {
  const dseo = await getDynamicSeo('course-category')
  const fallbackOg = await getDefaultOgImage()

  const tags: TagMap = {
    ...baseTags(),
    title: category.name || '',
    coursename: category.name || '',
  }

  const title = replaceTag(category.meta_title || dseo?.meta_title || '%coursename%', tags)
  const desc = replaceTag(category.meta_description || dseo?.meta_description || '', tags)
  const kw = replaceTag(category.meta_keyword || dseo?.meta_keyword || '', tags)
  const canonical = `${SITE_URL}/course/${category.slug}`
  const ogImage = buildOgImage(category.og_image_path || dseo?.og_image_path, fallbackOg)

  return buildMeta(title, desc, kw, canonical, ogImage)
}

export async function resolveBlogMeta(
  blog: { title?: string | null; headline?: string | null; slug?: string | null; meta_title?: string | null; meta_description?: string | null; meta_keyword?: string | null; og_image_path?: string | null; category?: { category_slug?: string | null } | null },
  blogId: number,
): Promise<Metadata> {
  const dseo = await getDynamicSeo('blog-detail')
  const fallbackOg = await getDefaultOgImage()
  const blogTitle = blog.title || blog.headline || ''

  const tags: TagMap = {
    ...baseTags(),
    title: blogTitle,
    blogtitle: blogTitle,
  }

  const title = replaceTag(blog.meta_title || dseo?.meta_title || '%blogtitle%', tags)
  const desc = replaceTag(blog.meta_description || dseo?.meta_description || '', tags)
  const kw = replaceTag(blog.meta_keyword || dseo?.meta_keyword || '', tags)
  const categorySlug = blog.category?.category_slug || 'uncategorized'
  const canonical = `${SITE_URL}/blog/${categorySlug}/${blog.slug}-${blogId}`
  const ogImage = buildOgImage(blog.og_image_path || dseo?.og_image_path, fallbackOg)

  return buildMeta(title, desc, kw, canonical, ogImage)
}

export async function resolveSpecializationMeta(
  spec: { name?: string | null; slug?: string | null; meta_title?: string | null; meta_description?: string | null; meta_keyword?: string | null; og_image_path?: string | null },
): Promise<Metadata> {
  const dseo = await getDynamicSeo('specialization')
  const fallbackOg = await getDefaultOgImage()

  const tags: TagMap = {
    ...baseTags(),
    title: spec.name || '',
    specializationname: spec.name || '',
  }

  const title = replaceTag(spec.meta_title || dseo?.meta_title || '%specializationname%', tags)
  const desc = replaceTag(spec.meta_description || dseo?.meta_description || '', tags)
  const kw = replaceTag(spec.meta_keyword || dseo?.meta_keyword || '', tags)
  const canonical = `${SITE_URL}/specialization/${spec.slug}`
  const ogImage = buildOgImage(spec.og_image_path || dseo?.og_image_path, fallbackOg)

  return buildMeta(title, desc, kw, canonical, ogImage)
}

export async function resolveScholarshipMeta(
  scholarship: { title?: string | null; slug?: string | null; meta_title?: string | null; meta_description?: string | null; meta_keyword?: string | null; og_image_path?: string | null }
): Promise<Metadata> {
  const dseo = await getDynamicSeo('scholarship')
  const fallbackOg = await getDefaultOgImage()

  const tags: TagMap = {
    ...baseTags(),
    title: scholarship.title || '',
    scholarshiptitle: scholarship.title || '',
  }

  const title = replaceTag(scholarship.meta_title || dseo?.meta_title || '%scholarshiptitle%', tags)
  const desc = replaceTag(scholarship.meta_description || dseo?.meta_description || '', tags)
  const kw = replaceTag(scholarship.meta_keyword || dseo?.meta_keyword || '', tags)
  const canonical = `${SITE_URL}/scholarships/${scholarship.slug}`
  const ogImage = buildOgImage(scholarship.og_image_path || dseo?.og_image_path, fallbackOg)

  return buildMeta(title, desc, kw, canonical, ogImage)
}

export async function resolveExamMeta(
  exam: {
    page_name?: string | null
    name?: string | null
    uri?: string | null
    slug?: string | null
    meta_title?: string | null
    meta_description?: string | null
    meta_keyword?: string | null
    og_image?: string | null
  }
): Promise<Metadata> {
  const dseo = await getDynamicSeo('exam')
  const fallbackOg = await getDefaultOgImage()
  const examName = exam.page_name || exam.name || ''
  const examSlug = exam.uri || exam.slug || ''

  const tags: TagMap = {
    ...baseTags(),
    title: examName,
    examname: examName,
  }

  const title = replaceTag(exam.meta_title || dseo?.meta_title || '%examname%', tags)
  const desc = replaceTag(exam.meta_description || dseo?.meta_description || '', tags)
  const kw = replaceTag(exam.meta_keyword || dseo?.meta_keyword || '', tags)
  const canonical = `${SITE_URL}/resources/exams/${examSlug}`
  const ogImage = buildOgImage(exam.og_image || (exam as any).og_image_path || dseo?.og_image_path, fallbackOg)

  return buildMeta(title, desc, kw, canonical, ogImage)
}

export async function resolveCourseMeta(
  program: { course_name?: string | null; slug?: string | null; meta_title?: string | null; meta_description?: string | null; meta_keyword?: string | null; og_image_path?: string | null; university?: { name?: string | null; uname?: string | null } | null },
): Promise<Metadata> {
  const dseo = await getDynamicSeo('course-detail')
  const fallbackOg = await getDefaultOgImage()

  const tags: TagMap = {
    ...baseTags(),
    title: program.course_name || '',
    coursename: program.course_name || '',
    universityname: program.university?.name || '',
  }

  const title = replaceTag(program.meta_title || dseo?.meta_title || '%coursename% at %universityname% | Fees & Admission', tags)
  const desc = replaceTag(program.meta_description || dseo?.meta_description || '', tags)
  const kw = replaceTag(program.meta_keyword || dseo?.meta_keyword || '', tags)
  const canonical = `${SITE_URL}/university/${program.university?.uname}/courses/${program.slug}`
  const ogImage = buildOgImage(program.og_image_path || dseo?.og_image_path, fallbackOg)

  return buildMeta(title, desc, kw, canonical, ogImage)
}

export async function resolveServiceMeta(
  service: { headline?: string | null; slug?: string | null; meta_title?: string | null; meta_description?: string | null; meta_keyword?: string | null; og_image_path?: string | null }
): Promise<Metadata> {
  const dseo = await getDynamicSeo('service')
  const fallbackOg = await getDefaultOgImage()

  const tags: TagMap = {
    ...baseTags(),
    title: service.headline || '',
    servicename: service.headline || '',
  }

  const title = replaceTag(service.meta_title || dseo?.meta_title || '%servicename%', tags)
  const desc = replaceTag(service.meta_description || dseo?.meta_description || '', tags)
  const kw = replaceTag(service.meta_keyword || dseo?.meta_keyword || '', tags)
  const canonical = `${SITE_URL}/resources/services/${service.slug}`
  const ogImage = buildOgImage(service.og_image_path || dseo?.og_image_path, fallbackOg)

  return buildMeta(title, desc, kw, canonical, ogImage)
}

export async function resolveStaticMeta(pageName: string, path: string): Promise<Metadata> {
  const seo = await prisma.staticPageSeo.findFirst({ where: { page: pageName } })
  const fallbackOg = await getDefaultOgImage()
  const tags = baseTags()

  const title = replaceTag(seo?.meta_title || pageName, tags)
  const desc = replaceTag(seo?.meta_description || '', tags)
  const kw = replaceTag(seo?.meta_keyword || '', tags)
  const canonical = `${SITE_URL}${path}`
  const ogImage = buildOgImage(seo?.og_image_path, fallbackOg)

  return buildMeta(title, desc, kw, canonical, ogImage)
}
