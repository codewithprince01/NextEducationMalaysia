import { SITE_URL, storageUrl } from '@/lib/constants'

type JsonLd = Record<string, unknown>

export function organizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Education Malaysia',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    sameAs: [
      'https://www.facebook.com/educationmalaysia.in',
      'https://www.instagram.com/educationmalaysia.in/',
      'https://www.linkedin.com/company/educationmalaysia/',
      'https://www.youtube.com/@educationmalaysia6986',
      'https://twitter.com/educatemalaysia/',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-98185-60331',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: ['en', 'hi'],
    },
  }
}

export function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Education Malaysia',
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE_URL}/universities?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * Stable identifier for a university across every page it appears on, so a
 * course page and the university page describe the same entity rather than two
 * different ones. Anchored to the university's own URL, never the current page.
 */
function universityNodeId(uname?: string | null, fallbackPath?: string): string {
  const slug = (uname || '').trim()
  const path = slug ? `/university/${slug}` : (fallbackPath || '/university')
  return `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}#organization`
}

/** A number out of a mixed string/number column, or 0 when there is none. */
function toNumber(value: unknown): number {
  const parsed = Number.parseFloat(String(value ?? '').replace(/[^0-9.]/g, ''))
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

/**
 * The rating a page publishes, built from whatever the admin panel holds.
 *
 * The admin panel writes three columns — `seo_rating`, `review_number` and
 * `best_rating` — and they exist on universities, programmes and
 * specializations alike. Nothing here used to read them: the rating came from
 * `average_rating`/`review_count`, which the panel does not write, so it always
 * fell through to counting rows in the reviews table. SEGi is the clearest
 * example — the panel says 491 reviews, the page published 4, and editing the
 * field in admin changed nothing on the site.
 *
 * So the admin values win. They are what someone deliberately entered, and the
 * whole point of the field is that it drives what Google sees. Only when they
 * are blank does this fall back to the older columns and then to averaging the
 * real review rows, so a page with nothing entered still publishes a true
 * rating rather than an invented one.
 *
 * `bestRating` comes from the panel too instead of being pinned at 5 — a
 * university scored out of 10 was being published as 10 out of 5.
 *
 * Returns null when there is nothing real to say, so a page with no rating
 * anywhere never gets one made up for it.
 */
function aggregateRatingFrom(entity: {
  seo_rating?: string | number | null
  review_number?: string | number | null
  best_rating?: string | number | null
  rating?: string | number | null
  review_count?: string | number | null
  average_rating?: string | number | null
  reviews?: Array<{ rating?: string | number | null }> | null
}): JsonLd | null {
  const bestRating = toNumber(entity.best_rating) || 5
  const clamp = (value: number) =>
    Math.min(bestRating, Math.max(1, Math.round(value * 10) / 10))

  // 1. What the admin panel entered.
  const adminValue = toNumber(entity.seo_rating)
  const adminCount = toNumber(entity.review_number)

  // 2. The older aggregate columns, for rows written before the panel had them.
  const storedValue = toNumber(entity.average_rating ?? entity.rating)
  const storedCount = toNumber(entity.review_count)

  // 3. The reviews actually left on the site.
  const reviewRatings = (entity.reviews || [])
    .map((review) => toNumber(review?.rating))
    .filter((value) => value > 0)
  const reviewsValue = reviewRatings.length
    ? reviewRatings.reduce((sum, value) => sum + value, 0) / reviewRatings.length
    : 0

  const ratingValue = adminValue || storedValue || reviewsValue
  const reviewCount = adminCount || storedCount || reviewRatings.length

  if (!(ratingValue > 0 && reviewCount > 0)) return null

  return {
    '@type': 'AggregateRating',
    ratingValue: String(clamp(ratingValue)),
    reviewCount: String(Math.round(reviewCount)),
    bestRating: String(bestRating),
    worstRating: '1',
  }
}

export function universityJsonLd(uni: {
  id?: number | string | null
  name?: string | null
  uname?: string | null
  shortnote?: string | null
  description?: string | null
  logo_path?: string | null
  banner_path?: string | null
  photos?: Array<{ photo_path?: string | null }> | null
  website_url?: string | null
  website?: string | null
  country?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  rating?: string | number | null
  qs_rank?: string | number | null
  rank?: string | number | null
  review_count?: string | number | null
  average_rating?: string | number | null
  reviews?: Array<{
    name?: string | null
    description?: string | null
    rating?: string | number | null
  }> | null
  established_year?: string | null
  programs?: Array<{ course_name?: string | null }> | null
  instituteType?: { type?: string | null } | null
}, options?: { path?: string }): JsonLd {
  const strip = (value?: string | null) => (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const pagePath = options?.path || `/university/${uni.uname || ''}`
  const pageUrl = `${SITE_URL}${pagePath.startsWith('/') ? pagePath : `/${pagePath}`}`
  const officialWebsiteRaw = (uni.website_url || uni.website || '').trim()
  const officialWebsite = /^https?:\/\//i.test(officialWebsiteRaw) ? officialWebsiteRaw : undefined
  const country = (uni.country || '').trim() || 'Malaysia'
  const city = (uni.city || uni.state || '').trim() || country
  const description = strip(uni.description || uni.shortnote) || `${uni.name || 'University'} in ${country}`
  const logo = storageUrl(uni.logo_path) || undefined
  const imageCandidates = [
    ...(uni.photos || []).map((p) => storageUrl(p?.photo_path)).filter(Boolean) as string[],
    storageUrl(uni.banner_path) || undefined,
    logo,
  ].filter(Boolean) as string[]
  const images = imageCandidates.length ? Array.from(new Set(imageCandidates)) : undefined
  const courseNames = Array.from(new Set(
    (uni.programs || [])
      .map((p) => (p?.course_name || '').trim())
      .filter(Boolean)
  )).slice(0, 15)
  const keywords = Array.from(new Set([
    `${uni.name || 'University'} Malaysia`,
    uni.city || '',
    uni.state || '',
    uni.instituteType?.type || '',
    ...courseNames.slice(0, 6),
  ].map((v) => v.trim()).filter(Boolean))).join(', ')

  const data: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    // Stable node id, so the university described on a course page is understood
    // as the same entity as the one on its own page.
    '@id': universityNodeId(uni.uname, pagePath),
    name: uni.name,
    description,
    url: pageUrl,
    logo,
    image: images && images.length === 1 ? images[0] : images,
    address: {
      '@type': 'PostalAddress',
      streetAddress: (uni.address || '').trim() || undefined,
      addressLocality: city,
      addressRegion: (uni.state || '').trim() || undefined,
      addressCountry: country,
    },
    foundingDate: uni.established_year || undefined,
    sameAs: officialWebsite || pageUrl,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: `${uni.name || 'University'} Courses`,
      itemListElement: courseNames.map((course, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: course,
      })),
    },
    areaServed: country,
    keywords,
  }

  // The rating is published by universityRatingJsonLd() as its own small block,
  // not here. Google's review snippet reports whichever node carries
  // aggregateRating, so hanging it on this node made the review item render the
  // entire university — every image, course and keyword.

  if (!data.name) {
    data.name = 'University in Malaysia'
  }

  if (!data.description) {
    data.description = 'University details and programs in Malaysia.'
  }

  if (!data.url) {
    data.url = pageUrl
  }

  if (!data.sameAs && officialWebsite) {
    data.sameAs = officialWebsite
  }

  if (!data.address) {
    data.address = {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressCountry: country,
    }
  }

  return data
}

/**
 * The university's rating as a deliberately tiny standalone block: a name and
 * the aggregate, nothing else.
 *
 * Google's "Review snippets" report renders whichever node carries
 * aggregateRating. On the full university node that meant the review item
 * listed every image, course and keyword on the page. Keeping the rating on a
 * node of its own makes that item exactly what it should be — the score.
 *
 * It carries no `@id` on purpose: sharing one with universityJsonLd() would let
 * Google merge the two back into a single node and the review item would show
 * the whole university again.
 *
 * Returns null when the university has no reviews.
 */
export function universityRatingJsonLd(uni: {
  name?: string | null
  uname?: string | null
  // What the admin panel writes; these take priority — see aggregateRatingFrom.
  seo_rating?: string | number | null
  review_number?: string | number | null
  best_rating?: string | number | null
  rating?: string | number | null
  review_count?: string | number | null
  average_rating?: string | number | null
  reviews?: Array<{ rating?: string | number | null }> | null
}, options?: { path?: string }): JsonLd | null {
  const aggregateRating = aggregateRatingFrom(uni)
  if (!aggregateRating) return null

  const pagePath = options?.path || `/university/${uni.uname || ''}`

  return {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: uni.name || 'University in Malaysia',
    url: `${SITE_URL}${pagePath.startsWith('/') ? pagePath : `/${pagePath}`}`,
    aggregateRating,
  }
}

/**
 * Course entity for a single programme page.
 *
 * Sibling courses at one university share most of their markup — the header,
 * tabs, sidebar and footer are identical, and only the write-up differs — which
 * is why Google was clustering them and reporting "Duplicate, Google chose a
 * different canonical". Naming each URL as its own Course, with its own
 * provider, level, duration and fee, gives it an identity that does not depend
 * on how much of the visible page it shares with its neighbours.
 *
 * Every optional field is omitted rather than guessed: an incomplete entity is
 * fine, an entity asserting a fee the page does not show is not.
 */
export function courseJsonLd(program: {
  course_name?: string | null
  slug?: string | null
  meta_description?: string | null
  level?: string | null
  duration?: string | null
  study_mode?: string | null
  currency?: string | null
  total_tuition_fee?: unknown
  annual_tuition_fee?: unknown
  tution_fee?: unknown
  total_fee?: unknown
  tutions_fee?: unknown
  // The admin panel exposes these on a programme exactly as it does on a
  // university. They were never read, so filling them in did nothing.
  seo_rating?: string | number | null
  review_number?: string | number | null
  best_rating?: string | number | null
}, universityName: string, universitySlug: string, description?: string | null): JsonLd {
  const url = `${SITE_URL}/university/${universitySlug}/courses/${program.slug}`

  // A rating entered against this course describes the course, not the
  // university it belongs to, so it belongs on this node. Omitted entirely when
  // the panel has nothing for it, which leaves the university's own rating as
  // the only one on the page — the behaviour before these fields were wired up.
  const aggregateRating = aggregateRatingFrom(program)

  // Fees arrive as strings as often as numbers, and sometimes carry a currency
  // symbol or thousands separators, so everything but the digits is stripped
  // before the value is trusted.
  const toAmount = (value: unknown) => Number(String(value ?? '').replace(/[^\d.]/g, ''))
  const feeRaw = [
    program.total_tuition_fee,
    program.annual_tuition_fee,
    program.tution_fee,
    program.total_fee,
    program.tutions_fee,
  ].find((value) => {
    const amount = toAmount(value)
    return Number.isFinite(amount) && amount > 0
  })
  const fee = feeRaw == null ? 0 : toAmount(feeRaw)

  const mode = String(program.study_mode || '').toLowerCase().includes('online')
    ? 'online'
    : 'onsite'

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: program.course_name,
    description: description || program.meta_description || program.course_name,
    url,
    provider: {
      '@type': 'CollegeOrUniversity',
      name: universityName,
      url: `${SITE_URL}/university/${universitySlug}`,
    },
    ...(program.level ? { educationalLevel: program.level } : {}),
    ...(aggregateRating ? { aggregateRating } : {}),
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: mode,
      ...(program.duration ? { courseWorkload: program.duration } : {}),
    },
    ...(fee > 0
      ? {
          offers: {
            '@type': 'Offer',
            price: fee,
            priceCurrency: String(program.currency || 'MYR'),
            category: 'Tuition',
            url,
          },
        }
      : {}),
  }
}

export function courseDiscoveryJsonLd(input: {
  courseName?: string | null
  description?: string | null
  universityName?: string | null
  duration?: string | null
  fees?: string | number | null
  currency?: string | null
  studyMode?: string | null
  courseLevel?: string | null
  country?: string | null
  city?: string | null
  intakeDates?: string | string[] | null
  courseUrl?: string | null
  universityUrl?: string | null
  ranking?: string | number | null
  category?: string | null
  specialization?: string | null
}): JsonLd {
  const clean = (value?: string | null) =>
    (value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const cleanText = (value?: string | null) => {
    const v = clean(value)
    return v.length > 260 ? `${v.slice(0, 257)}...` : v
  }
  const absoluteUrl = (url?: string | null) => {
    const v = (url || '').trim()
    if (!v) return ''
    if (/^https?:\/\//i.test(v)) return v
    return `${SITE_URL}${v.startsWith('/') ? v : `/${v}`}`
  }
  const parseDurationIso = (raw?: string | null) => {
    const value = clean(raw).toLowerCase()
    if (!value) return ''
    const numberMatches = value.match(/\d+(\.\d+)?/g)
    if (!numberMatches || numberMatches.length === 0) return ''
    const first = Number.parseFloat(numberMatches[0])
    if (!Number.isFinite(first) || first <= 0) return ''

    if (value.includes('month')) {
      const months = Math.max(1, Math.round(first))
      return `P${months}M`
    }
    if (value.includes('year') || value.includes('yr')) {
      const whole = Math.floor(first)
      const months = Math.round((first - whole) * 12)
      if (whole > 0 && months > 0) return `P${whole}Y${months}M`
      if (whole > 0) return `P${whole}Y`
      return `P${Math.max(1, months)}M`
    }
    const whole = Math.floor(first)
    const months = Math.round((first - whole) * 12)
    if (whole > 0 && months > 0) return `P${whole}Y${months}M`
    if (whole > 0) return `P${whole}Y`
    return `P${Math.max(1, months)}M`
  }
  const parseFees = (value?: string | number | null) => {
    if (value == null) return ''
    const raw = String(value).trim()
    if (!raw || /^n\/?a$/i.test(raw)) return ''
    const numeric = raw.replace(/[^0-9.]/g, '')
    return numeric || ''
  }
  const extractIntakeDates = (raw?: string | string[] | null) => {
    const values = Array.isArray(raw) ? raw : raw ? [raw] : []
    const monthMap: Record<string, string> = {
      jan: '01', january: '01',
      feb: '02', february: '02',
      mar: '03', march: '03',
      apr: '04', april: '04',
      may: '05',
      jun: '06', june: '06',
      jul: '07', july: '07',
      aug: '08', august: '08',
      sep: '09', sept: '09', september: '09',
      oct: '10', october: '10',
      nov: '11', november: '11',
      dec: '12', december: '12',
    }
    const year = new Date().getFullYear()
    const dates: string[] = []
    values
      .flatMap((v) => String(v).split(','))
      .map((v) => v.trim().toLowerCase())
      .forEach((m) => {
        const month = monthMap[m]
        if (month) dates.push(`${year}-${month}-01`)
      })
    return Array.from(new Set(dates))
  }

  const name = clean(input.courseName)
  const description = cleanText(input.description)
  const courseUrl = absoluteUrl(input.courseUrl)
  const universityName = clean(input.universityName)
  const universityUrl = absoluteUrl(input.universityUrl)
  const feePrice = parseFees(input.fees)
  const currency = (input.currency || 'MYR').trim()
  const isoDuration = parseDurationIso(input.duration)
  const intakeDates = extractIntakeDates(input.intakeDates)
  const country = clean(input.country) || 'Malaysia'
  const keywordParts = [
    name,
    input.courseLevel || '',
    input.studyMode || '',
    input.category || '',
    input.specialization || '',
    universityName,
    input.city || '',
    country,
    name ? `${name} Malaysia` : '',
    name ? `Study ${name} in Malaysia` : '',
    name ? `${name} fees Malaysia` : '',
  ]
  const keywords = Array.from(new Set(keywordParts.map((v) => clean(v)).filter(Boolean))).join(', ')

  const data: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: name || 'Course in Malaysia',
    description: description || `${name || 'Course'} details for studying in Malaysia.`,
  }

  if (courseUrl) data.url = courseUrl
  if (keywords) data.keywords = keywords
  if (input.courseLevel && clean(input.courseLevel)) {
    data.educationalCredentialAwarded = clean(input.courseLevel)
  }
  if (input.studyMode && clean(input.studyMode)) {
    data.courseMode = clean(input.studyMode)
  }
  if (isoDuration) {
    data.timeRequired = isoDuration
  }
  if (universityName) {
    data.provider = {
      '@type': 'CollegeOrUniversity',
      name: universityName,
      ...(universityUrl ? { sameAs: universityUrl } : {}),
    }
  }
  if (feePrice) {
    data.offers = {
      '@type': 'Offer',
      price: feePrice,
      priceCurrency: currency || 'MYR',
      availability: 'https://schema.org/InStock',
      category: 'Education',
    }
  }
  if (intakeDates.length > 0) {
    data.hasCourseInstance = intakeDates.map((startDate) => ({
      '@type': 'CourseInstance',
      startDate,
    }))
  }

  return data
}

export function blogJsonLd(blog: {
  title?: string | null
  headline?: string | null
  slug?: string | null
  short_description?: string | null
  description?: string | null
  content?: string | null
  featuredImage?: string | null
  thumbnail_path?: string | null
  og_image_path?: string | null
  authorName?: string | null
  meta_keyword?: string | null
  created_at?: Date | string | null
  updated_at?: Date | string | null
  author?: { name?: string | null } | null
  category?: { category_name?: string | null; category_slug?: string | null } | null
}, blogId: number, options?: { categorySlug?: string; path?: string }): JsonLd {
  const categorySlug = options?.categorySlug || blog.category?.category_slug || 'uncategorized'
  const toIso = (value?: Date | string | null) => {
    if (!value) return undefined
    if (value instanceof Date) return value.toISOString()
    const parsed = new Date(value)
    return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString()
  }
  const stripTags = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const title = (blog.title || blog.headline || 'Education Malaysia Blog').trim()
  const description = stripTags(
    blog.short_description ||
    blog.description ||
    blog.content ||
    `Read ${title} on Education Malaysia.`
  )
  const categoryName = (blog.category?.category_name || categorySlug.replace(/-/g, ' ')).replace(/\b\w/g, c => c.toUpperCase())
  const pagePath = options?.path || `/blog/${categorySlug}/${blog.slug || ''}-${blogId}`
  const pageUrl = `${SITE_URL}${pagePath.startsWith('/') ? pagePath : `/${pagePath}`}`
  const keywordSource = `${title} ${description} ${stripTags(blog.description || blog.content || '')}`
  const keywords = extractTopKeywords(keywordSource, blog.meta_keyword || '')
  const image =
    storageUrl(blog.featuredImage) ||
    storageUrl(blog.og_image_path) ||
    storageUrl(blog.thumbnail_path) ||
    `${SITE_URL}/og-default.png`
  const datePublished = toIso(blog.created_at) || new Date().toISOString()
  const dateModified = toIso(blog.updated_at) || datePublished
  const authorName = (blog.authorName || blog.author?.name || 'Education Malaysia').trim() || 'Education Malaysia'

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    image: [image],
    mainEntityOfPage: pageUrl,
    url: pageUrl,
    datePublished,
    dateModified,
    articleSection: categoryName,
    keywords,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Education Malaysia',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/logo.png`,
      },
    },
  }
}

export function breadcrumbJsonLd(
  items: { name: string; url: string }[],
  options?: { name?: string; description?: string }
): JsonLd {
  const lastName = items[items.length - 1]?.name || 'Education Malaysia'
  const name = options?.name || lastName
  const description =
    options?.description || `${lastName} - Education Malaysia`

  return {
    '@context': 'https://schema.org/',
    '@type': 'BreadcrumbList',
    name,
    description,
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

function toBreadcrumbLabel(segment: string): string {
  const cleaned = decodeURIComponent(segment || '').trim()
  if (!cleaned) return ''
  const pageMatch = cleaned.match(/^page-(\d+)$/i)
  if (pageMatch) return `Page ${pageMatch[1]}`
  return cleaned
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

export function globalBreadcrumbJsonLd(pathname: string): JsonLd | null {
  const pathOnly = String(pathname || '/').split('?')[0].split('#')[0] || '/'
  if (!pathOnly.startsWith('/')) return null
  if (
    pathOnly.startsWith('/_next') ||
    pathOnly.startsWith('/api') ||
    pathOnly === '/favicon.ico' ||
    pathOnly === '/robots.txt' ||
    pathOnly === '/sitemap.xml'
  ) {
    return null
  }

  const segments = pathOnly.split('/').filter(Boolean)
  const items: { name: string; url: string }[] = [{ name: 'Home', url: SITE_URL }]
  let currentPath = ''
  for (const raw of segments) {
    const name = toBreadcrumbLabel(raw)
    if (!name) continue
    currentPath += `/${raw}`
    items.push({ name, url: `${SITE_URL}${currentPath}` })
  }

  return breadcrumbJsonLd(items)
}

export function faqJsonLd(faqs: { question?: string | null; answer?: string | null }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs
      .filter(f => f.question && f.answer)
      .map(f => ({
        '@type': 'Question',
        name: f.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: f.answer,
        },
      })),
  }
}

export function specializationJsonLd(spec: {
  name?: string | null
  slug?: string | null
  description?: string | null
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Topic',
    name: spec.name,
    description: spec.description || undefined,
    url: `${SITE_URL}/specialization/${spec.slug}`,
  }
}

export function scholarshipJsonLd(scholarship: {
  title?: string | null
  slug?: string | null
  description?: string | null
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Grant',
    name: scholarship.title,
    description: stripTags(scholarship.description || '').substring(0, 200),
    url: `${SITE_URL}/scholarships/${scholarship.slug}`,
  }
}

function stripTags(html: string): string {
  return html.replace(/<[^>]*>?/gm, '')
}

function extractTopKeywords(source: string, seedKeywords: string): string {
  const stopWords = new Set([
    'the', 'and', 'for', 'with', 'this', 'that', 'from', 'your', 'you', 'are', 'was', 'were',
    'have', 'has', 'had', 'will', 'can', 'into', 'about', 'malaysia', 'study', 'students',
    'their', 'they', 'them', 'more', 'than', 'how', 'what', 'when', 'where', 'why', 'which',
    'also', 'through', 'over', 'under', 'between', 'across', 'into', 'is', 'in', 'of', 'to',
    'on', 'at', 'by', 'it', 'as', 'be', 'or', 'an', 'a'
  ])

  const seed = seedKeywords
    .split(',')
    .map(k => k.trim())
    .filter(Boolean)
    .slice(0, 4)

  const words = source
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))

  const freq = new Map<string, number>()
  for (const word of words) {
    freq.set(word, (freq.get(word) || 0) + 1)
  }

  const ranked = Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word]) => word.replace(/\b\w/g, c => c.toUpperCase()))

  const merged = [...seed, ...ranked]
  const unique: string[] = []
  const seen = new Set<string>()
  for (const item of merged) {
    const key = item.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      unique.push(item)
    }
  }
  return unique.slice(0, 10).join(', ')
}
