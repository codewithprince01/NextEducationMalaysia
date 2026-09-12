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

  // A scale has to be able to hold the score. `best_rating` is a free text field
  // in admin and has been saved as 1, which produced "1 out of 1 (worst 1)" —
  // a rating Google rejects and that means nothing to a reader. Anything that
  // is not a usable ceiling falls back to the conventional 5.
  const scaleMax = bestRating > 1 && bestRating >= ratingValue ? bestRating : 5

  // `ratingCount`, not `reviewCount`. The number comes from a figure typed into
  // the admin panel, not from that many written reviews on the site, and Google
  // asks for reviewCount only when the reviews themselves exist. ratingCount is
  // the honest claim and carries the same star display.
  return {
    '@type': 'AggregateRating',
    ratingValue: String(Math.min(scaleMax, Math.max(1, Math.round(ratingValue * 10) / 10))),
    ratingCount: String(Math.round(reviewCount)),
    bestRating: String(scaleMax),
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
  // Admin-entered rating; drives aggregateRating on this node.
  seo_rating?: string | number | null
  review_number?: string | number | null
  best_rating?: string | number | null
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
}, options?: {
  path?: string
  /**
   * Set false where the page is about something other than the university —
   * a course page, say, whose own Course node carries the rating. Two rated
   * nodes on one page leave Google guessing which the review describes.
   */
  includeRating?: boolean
}): JsonLd {
  const pagePath = options?.path || `/university/${uni.uname || ''}`
  const pageUrl = `${SITE_URL}${pagePath.startsWith('/') ? pagePath : `/${pagePath}`}`
  const aggregateRating = options?.includeRating === false ? null : aggregateRatingFrom(uni)

  // Name, url, rating. Nothing else.
  //
  // This node used to carry the description, logo, a gallery of images, the
  // postal address, founding date, an OfferCatalog of fifteen courses and a
  // keyword list. All of it true, none of it needed: the page states those
  // things in its own markup, and in the Rich Results report they buried the
  // one thing this node exists to publish. Every extra property was also one
  // more thing Google could flag.
  const data: JsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: uni.name,
    url: pageUrl,
    ...(aggregateRating ? { aggregateRating } : {}),
  }

  // A row with no name would otherwise publish a node identifying nothing.
  if (!data.name) {
    data.name = 'University in Malaysia'
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
 * A course's rating, and nothing else.
 *
 * This node used to describe the whole programme — description, provider,
 * level, duration, tuition offer. All of it was accurate, and all of it was
 * noise: the page already says those things in its own markup, and every extra
 * property was another line in the Rich Results report to read past and another
 * thing that could be flagged. The one thing markup adds that the page cannot
 * express on its own is the star rating.
 *
 * So the node is the rating, attached to a name so Google knows what is being
 * rated. Nothing is emitted at all when there is no rating to publish.
 */
export function courseJsonLd(program: {
  course_name?: string | null
  // The rating the admin panel holds against this programme.
  seo_rating?: string | number | null
  review_number?: string | number | null
  best_rating?: string | number | null
}): JsonLd | null {
  const aggregateRating = aggregateRatingFrom(program)

  // No rating, no node. A name on its own tells Google nothing it cannot read
  // off the page, and an empty node is one more thing for the Rich Results
  // report to complain about.
  if (!aggregateRating) return null

  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: program.course_name,
    aggregateRating,
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
