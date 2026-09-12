import { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { replaceTag } from './replace-tag'
import { prisma } from '@/lib/db'
import { SITE_URL, storageUrl } from '@/lib/constants'
import { currentMonth, currentYear, stripTags, truncate } from '@/lib/utils'
import { getCourseIndexability, getSpecializationIndexability, robotsFor } from './indexability'
import { buildCourseDescription, buildSpecializationDescription } from './descriptions'

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

/**
 * Image paths that are known not to resolve.
 *
 * `assets/uploadFiles/...` is where the pre-Next site kept its uploads. Those
 * files are gone — every one sampled returns 404 — but the paths are still
 * sitting in `universities.og_image_path` on 47 of the 50 rows that have the
 * column set. Passing one to a crawler advertises a broken preview image, so
 * they are treated as absent and the next candidate is used instead.
 */
const DEAD_IMAGE_PATTERNS = [/assets\/uploadFiles\//i]

function isUsableImagePath(path: string | null | undefined): boolean {
  if (!path) return false
  const value = String(path).trim()
  if (!value) return false
  return !DEAD_IMAGE_PATTERNS.some((pattern) => pattern.test(value))
}

/**
 * The site-wide fallback preview image, or null when none is configured.
 *
 * Returns null rather than a placeholder URL on purpose. This used to fall back
 * to `${SITE_URL}/og-default.png`, a file that does not exist in `public/`, so
 * every page without its own image advertised a 404 to Google, Facebook and
 * WhatsApp. A missing og:image tag is neutral; a broken one is worse than none.
 */
async function getDefaultOgImage(): Promise<string | null> {
  const rows = await prisma.$queryRawUnsafe(`
    SELECT file_path
    FROM default_og_images
    WHERE \`default\` = 1
    ORDER BY id DESC
    LIMIT 1
  `) as Array<{ file_path?: string | null }>

  const path = rows[0]?.file_path
  return isUsableImagePath(path) ? storageUrl(path!) || null : null
}

/**
 * Does this image actually exist?
 *
 * Pattern-matching only catches the dead paths we already know about, and the
 * missing files are referenced from several places — `default_og_images` and
 * `dynamic_page_seos` both point at one that was deleted from storage — so the
 * only reliable answer is to ask the server.
 *
 * The check is cached for a day and keyed on the URL, so a given image is
 * fetched at most once per day no matter how many pages reference it, and the
 * request is a HEAD with a short timeout.
 *
 * It fails open. A definite 404 drops the image, but a timeout or a network
 * blip keeps it: briefly advertising an image that might be fine is a smaller
 * problem than stripping preview images off the whole site because storage was
 * slow for a moment.
 */
const imageExists = unstable_cache(
  async (url: string): Promise<boolean> => {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 2500)
      const res = await fetch(url, { method: 'HEAD', signal: controller.signal })
      clearTimeout(timeout)
      return res.status !== 404 && res.status !== 410
    } catch {
      return true
    }
  },
  ['og-image-exists'],
  { revalidate: 86400 },
)

/**
 * Pick the first preview image that actually loads.
 *
 * Candidates are tried in order; empty values and known-dead paths are skipped
 * without a request, and the rest are verified. When nothing survives the caller
 * emits no image tag at all — social networks handle a missing og:image
 * gracefully, and a broken one is worse than none.
 */
async function buildOgImage(...candidates: Array<string | null | undefined>): Promise<string | null> {
  for (const candidate of candidates) {
    if (!isUsableImagePath(candidate)) continue
    const url = storageUrl(candidate!)
    if (!url) continue
    if (await imageExists(url)) return url
  }
  return null
}

function buildMeta(
  title: string,
  description: string,
  keywords: string,
  canonical: string,
  // Null when the page has no preview image that resolves. The image keys are
  // then left off entirely rather than pointed at a placeholder that 404s.
  ogImage: string | null,
  // Omitted by every page that has no opinion, which leaves the site-wide
  // `index, follow` from the root layout in place. Only pages that judge
  // themselves thin pass a directive here.
  robots?: Metadata['robots'],
): Metadata {
  return {
    title: { absolute: title },
    // An empty description is dropped rather than emitted as an empty tag.
    ...(description ? { description } : {}),
    ...(robots ? { robots } : {}),
    keywords,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630 }] } : {}),
      type: 'website',
      siteName: 'Education Malaysia',
    },
    twitter: {
      // Without an image Twitter renders a summary card instead of a broken
      // large one, so the card type follows whether an image survived.
      card: ogImage ? 'summary_large_image' : 'summary',
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  }
}

export async function resolveUniversityMeta(
  university: {
    name?: string | null
    uname?: string | null
    city?: string | null
    shortnote?: string | null
    meta_title?: string | null
    meta_description?: string | null
    meta_keyword?: string | null
    og_image_path?: string | null
    // Preview-image fallbacks. Most universities that have `og_image_path` set
    // point it at the retired assets/uploadFiles location, so the banner and
    // logo — which are live uploads — are what actually end up being used.
    banner_path?: string | null
    logo_path?: string | null
  },
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
  const ogImage = await buildOgImage(
    university.og_image_path,
    university.banner_path,
    university.logo_path,
    dseo?.og_image_path,
    fallbackOg,
  )

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
  const ogImage = await buildOgImage(category.og_image_path || dseo?.og_image_path, fallbackOg)

  return buildMeta(title, desc, kw, canonical, ogImage)
}

export async function resolveBlogMeta(
  blog: {
    title?: string | null
    headline?: string | null
    slug?: string | null
    meta_title?: string | null
    meta_description?: string | null
    meta_keyword?: string | null
    og_image_path?: string | null
    // The article's own header image. No blog row sets og_image_path, so
    // without this the shared default is all there is — and that file is
    // missing, which left blog posts with no preview image at all.
    thumbnail_path?: string | null
    category?: { category_slug?: string | null } | null
  },
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
  const ogImage = await buildOgImage(
    blog.og_image_path,
    blog.thumbnail_path,
    dseo?.og_image_path,
    fallbackOg,
  )

  return buildMeta(title, desc, kw, canonical, ogImage)
}

export async function resolveSpecializationMeta(
  spec: {
    name?: string | null
    slug?: string | null
    meta_title?: string | null
    meta_description?: string | null
    meta_keyword?: string | null
    og_image_path?: string | null
    [key: string]: unknown
  },
  // A specialization keeps its prose in child `specialization_contents` rows,
  // so whether the page has anything to say can only be judged with those in
  // hand. Callers that do not load them get the structured-fact rules alone.
  sectionHtml: Array<unknown> = [],
): Promise<Metadata> {
  const dseo = await getDynamicSeo('specialization')
  const fallbackOg = await getDefaultOgImage()

  const tags: TagMap = {
    ...baseTags(),
    title: spec.name || '',
    specializationname: spec.name || '',
  }

  const title = replaceTag(spec.meta_title || dseo?.meta_title || '%specializationname%', tags)
  const desc =
    replaceTag(spec.meta_description || dseo?.meta_description || '', tags) ||
    buildSpecializationDescription(spec, sectionHtml)
  const kw = replaceTag(spec.meta_keyword || dseo?.meta_keyword || '', tags)
  const canonical = `${SITE_URL}/specialization/${spec.slug}`
  const ogImage = await buildOgImage(spec.og_image_path || dseo?.og_image_path, fallbackOg)
  const robots = robotsFor(getSpecializationIndexability(spec, sectionHtml))

  return buildMeta(title, desc, kw, canonical, ogImage, robots)
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
  const ogImage = await buildOgImage(scholarship.og_image_path || dseo?.og_image_path, fallbackOg)

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
  const ogImage = await buildOgImage(exam.og_image || (exam as any).og_image_path || dseo?.og_image_path, fallbackOg)

  return buildMeta(title, desc, kw, canonical, ogImage)
}

export async function resolveCourseMeta(
  // Loosely typed on purpose: the indexability check and the generated
  // description read a dozen optional columns off the programme row, and the
  // callers pass the row straight through from the query.
  program: {
    course_name?: string | null
    slug?: string | null
    meta_title?: string | null
    meta_description?: string | null
    meta_keyword?: string | null
    og_image_path?: string | null
    university?: { name?: string | null; uname?: string | null } | null
    [key: string]: unknown
  },
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

  // A course keeps its write-up in the content tabs rather than a column on the
  // row, so both the description and the index decision read from there.
  const contentHtml = (program.contents as any[] | undefined)?.map((row) => row?.description) || []

  // Hand-written description first, then the shared template, then one built
  // from this course's own write-up or figures. Before the last fallback
  // existed, a course with none of the first two shipped with no tag at all.
  const desc =
    replaceTag(program.meta_description || dseo?.meta_description || '', tags) ||
    buildCourseDescription(program, program.university?.name, contentHtml)
  const kw = replaceTag(program.meta_keyword || dseo?.meta_keyword || '', tags)
  const canonical = `${SITE_URL}/university/${program.university?.uname}/courses/${program.slug}`
  // No course row in the catalogue has its own og_image_path, and the shared
  // default currently points at a file that is gone, so without the university's
  // own artwork every course page would share the site preview or have none.
  // The banner and logo are live uploads and do resolve.
  const university = program.university as Record<string, unknown> | null | undefined
  const ogImage = await buildOgImage(
    program.og_image_path,
    university?.banner_path as string | undefined,
    university?.logo_path as string | undefined,
    dseo?.og_image_path,
    fallbackOg,
  )

  // A course with nothing but its name, level and study mode is asking to be
  // crawled and followed, not indexed — see lib/seo/indexability.
  const robots = robotsFor(getCourseIndexability(program, contentHtml))

  return buildMeta(title, desc, kw, canonical, ogImage, robots)
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
  const ogImage = await buildOgImage(service.og_image_path || dseo?.og_image_path, fallbackOg)

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
  const ogImage = await buildOgImage(seo?.og_image_path, fallbackOg)

  return buildMeta(title, desc, kw, canonical, ogImage)
}

export async function resolveStaticMetaAny(
  pageNames: string[],
  path: string,
  fallbackTitle?: string,
): Promise<Metadata> {
  const normalized = Array.from(
    new Set(
      pageNames
        .map((n) => String(n || '').trim())
        .filter(Boolean)
        .flatMap((n) => [n, n.toLowerCase(), n.replace(/\s+/g, '-').toLowerCase()]),
    ),
  )

  let seo: any = null
  for (const key of normalized) {
    seo = await prisma.$queryRawUnsafe(
      `SELECT meta_title, meta_keyword, meta_description, og_image_path, page
       FROM static_page_seos
       WHERE LOWER(page) = LOWER(?)
       LIMIT 1`,
      key,
    ) as any[]
    if (Array.isArray(seo) && seo.length > 0) {
      seo = seo[0]
      break
    }
    seo = null
  }

  const fallbackOg = await getDefaultOgImage()
  const tags = baseTags()

  const title = replaceTag(seo?.meta_title || fallbackTitle || pageNames[0] || 'Education Malaysia', tags)
  const desc = replaceTag(seo?.meta_description || '', tags)
  const kw = replaceTag(seo?.meta_keyword || '', tags)
  const canonical = `${SITE_URL}${path}`
  const ogImage = await buildOgImage(seo?.og_image_path, fallbackOg)

  return buildMeta(title, desc, kw, canonical, ogImage)
}

export function extractMetadataText(meta: Metadata | null | undefined): { title?: string; description?: string } {
  if (!meta) return {}

  let title: string | undefined
  if (typeof meta.title === 'string') {
    title = meta.title
  } else if (meta.title && typeof meta.title === 'object') {
    const t = meta.title as { absolute?: string; default?: string; template?: string }
    title = t.absolute || t.default
  }

  const description = typeof meta.description === 'string' ? meta.description : undefined
  return { title, description }
}
