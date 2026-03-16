# Next.js Full-Stack Migration Architecture — Education Malaysia

## Executive Summary

This document defines the complete production-grade architecture for migrating the **Education Malaysia** platform from **React SPA + Laravel API + MySQL** to a **Next.js 15 App Router full-stack monolith** with **Prisma ORM** targeting the same MySQL database.

The existing system serves ~50+ routes, ~300 universities, ~10,000 courses, and uses a 1,500-line `SeoMetaService.php` for server-side meta tag injection. The new architecture replaces all of this with **native Next.js rendering strategies** (SSG/ISR/SSR), eliminating the SPA waterfall pattern entirely.

---

## Current Architecture Analysis

### What Exists Today

| Layer | Technology | Key Files |
|-------|-----------|-----------|
| **Frontend** | React 18 SPA + React Router | `App.jsx` (347 lines, 50+ routes) |
| **Data Fetching** | React Query + Axios | 13 service modules, 15 custom hooks |
| **Backend API** | Laravel 11 | 24 API controllers, 50+ endpoints |
| **SEO** | Server-side meta injection via Blade | `SeoMetaService.php` (1,500 lines) |
| **Database** | MySQL | 111 Eloquent models |
| **Performance** | LCP HTML shells, cache headers | Custom SSR shells injected via Blade |
| **Multi-tenant** | `WebsiteScope` global scope | `site_var = "MYS"` on all queries |

### Critical Patterns to Preserve

1. **`WebsiteScope`** — Every model query filters by `website = 'MYS'`. Prisma middleware will replicate this.
2. **`DynamicPageSeo`** — Template-based meta tags with `%placeholder%` replacement. Must be replicated in `generateMetadata()`.
3. **`replaceTag()`** — Helper that replaces `%variable%` tokens in SEO strings. Needs a TypeScript port.
4. **Initial data hydration** — Several pages (university list, blog detail, scholarship) receive server-rendered HTML + initial data to avoid API waterfall. Next.js Server Components do this natively.

---

## Production Folder Structure

```
NextEducationMalaysia/
├── next.config.ts                    # Next.js configuration + redirects
├── package.json
├── tsconfig.json
├── .env.local                        # Database URL, API keys, site config
├── .env.production
│
├── prisma/
│   ├── schema.prisma                 # Pull from existing MySQL (prisma db pull)
│   └── seed.ts                       # Optional: seed reference data
│
├── src/
│   ├── app/                          # ═══ Next.js App Router ═══
│   │   ├── layout.tsx                # Root layout (fonts, global providers)
│   │   ├── page.tsx                  # Homepage (SSG with ISR)
│   │   ├── not-found.tsx             # 404 page
│   │   ├── loading.tsx               # Global suspense fallback
│   │   ├── error.tsx                 # Global error boundary
│   │   ├── robots.ts                 # Dynamic robots.txt
│   │   ├── sitemap.ts                # Dynamic XML sitemap index
│   │   │
│   │   ├── (marketing)/              # ═══ Static / Landing Pages (SSG) ═══
│   │   │   ├── study-in-malaysia/page.tsx
│   │   │   ├── who-we-are/page.tsx
│   │   │   ├── why-study/page.tsx
│   │   │   ├── what-people-say/page.tsx
│   │   │   ├── contact-us/page.tsx
│   │   │   ├── terms-and-conditions/page.tsx
│   │   │   ├── privacy-policy/page.tsx
│   │   │   ├── write-a-review/page.tsx
│   │   │   └── view-our-partners/page.tsx
│   │   │
│   │   ├── universities/             # ═══ University Routes (ISR) ═══
│   │   │   ├── page.tsx              # /universities — select university
│   │   │   └── [type]/
│   │   │       ├── page.tsx          # /universities/[type]
│   │   │       └── [pageSlug]/
│   │   │           └── page.tsx      # /universities/[type]/[pageSlug]
│   │   │
│   │   ├── university/
│   │   │   └── [slug]/
│   │   │       ├── page.tsx          # /university/[slug] — overview (ISR)
│   │   │       ├── [section]/
│   │   │       │   └── page.tsx      # /university/[slug]/courses etc.
│   │   │       └── courses/
│   │   │           └── [courseSlug]/
│   │   │               └── page.tsx  # /university/[slug]/courses/[courseSlug]
│   │   │
│   │   ├── course/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # /course/[slug] — course category (ISR)
│   │   │
│   │   ├── courses/
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # /courses/[slug] — level detail
│   │   │
│   │   ├── courses-in-malaysia/
│   │   │   ├── page.tsx              # /courses-in-malaysia (ISR)
│   │   │   └── [pageSlug]/
│   │   │       └── page.tsx          # /courses-in-malaysia/[pageSlug]
│   │   │
│   │   ├── specialization/
│   │   │   ├── page.tsx              # /specialization — listing
│   │   │   └── [slug]/
│   │   │       ├── page.tsx          # /specialization/[slug]
│   │   │       └── [levelSlug]/
│   │   │           └── page.tsx      # /specialization/[slug]/[levelSlug]
│   │   │
│   │   ├── blog/
│   │   │   ├── page.tsx              # /blog — listing (ISR)
│   │   │   └── [category]/
│   │   │       ├── page.tsx          # /blog/[category] — category listing
│   │   │       └── [slugWithId]/
│   │   │           └── page.tsx      # /blog/[category]/[slugWithId] — detail
│   │   │
│   │   ├── scholarships/
│   │   │   ├── page.tsx              # /scholarships — listing
│   │   │   └── [slug]/
│   │   │       └── page.tsx          # /scholarships/[slug] — detail
│   │   │
│   │   ├── resources/
│   │   │   ├── page.tsx              # /resources — hub page
│   │   │   ├── exams/
│   │   │   │   ├── page.tsx          # /resources/exams
│   │   │   │   └── [slug]/page.tsx   # /resources/exams/[slug]
│   │   │   ├── services/
│   │   │   │   ├── page.tsx          # /resources/services
│   │   │   │   └── [slug]/page.tsx   # /resources/services/[slug]
│   │   │   ├── Guidelines/           # ⚠️ Preserve case from current URLs
│   │   │   │   ├── graduate-pass/page.tsx
│   │   │   │   ├── MQA/page.tsx
│   │   │   │   └── team-education-malaysia/page.tsx
│   │   │   ├── guidelines/page.tsx
│   │   │   └── about/page.tsx
│   │   │
│   │   ├── faqs/page.tsx
│   │   ├── select-level/page.tsx
│   │   ├── bodies/[slug]/page.tsx
│   │   ├── become-a-partner/page.tsx
│   │   │
│   │   ├── (auth)/                   # ═══ Auth Pages (noindex, client) ═══
│   │   │   ├── login/page.tsx
│   │   │   ├── signup/
│   │   │   │   ├── page.tsx
│   │   │   │   └── apply/[programId]/
│   │   │   │       ├── page.tsx
│   │   │   │       └── [redirect]/page.tsx
│   │   │   ├── password/reset/page.tsx
│   │   │   ├── account/password/reset/page.tsx
│   │   │   └── confirmed-email/page.tsx
│   │   │
│   │   ├── student/                  # ═══ Student Dashboard (noindex, client) ═══
│   │   │   ├── layout.tsx            # Auth guard layout
│   │   │   ├── profile/page.tsx
│   │   │   ├── overview/page.tsx
│   │   │   ├── applied-colleges/page.tsx
│   │   │   ├── Conversation/page.tsx # ⚠️ Preserve case
│   │   │   └── change-password/page.tsx
│   │   │
│   │   ├── [...filterCourses]/       # ═══ Dynamic filter routes ═══
│   │   │   └── page.tsx              # Catches /:filterSlug-courses patterns
│   │   │
│   │   └── api/                      # ═══ API Routes (replacing Laravel) ═══
│   │       ├── universities/
│   │       │   ├── route.ts          # GET /api/universities
│   │       │   ├── universities-in-malaysia/route.ts
│   │       │   └── featured/route.ts
│   │       ├── university/
│   │       │   └── [slug]/
│   │       │       ├── route.ts      # GET /api/university/[slug]
│   │       │       ├── overview/route.ts
│   │       │       ├── courses/route.ts
│   │       │       ├── gallery/route.ts
│   │       │       ├── videos/route.ts
│   │       │       ├── reviews/route.ts
│   │       │       └── ranking/route.ts
│   │       ├── blog/
│   │       │   ├── route.ts          # GET /api/blog
│   │       │   └── [...path]/route.ts
│   │       ├── specialization/
│   │       │   └── [...path]/route.ts
│   │       ├── courses/route.ts
│   │       ├── inquiry/
│   │       │   ├── contact-us/route.ts
│   │       │   ├── simple-form/route.ts
│   │       │   ├── brochure-request/route.ts
│   │       │   └── modal-form/route.ts
│   │       ├── student/
│   │       │   ├── register/route.ts
│   │       │   ├── login/route.ts
│   │       │   └── profile/route.ts
│   │       ├── search-and-apply/
│   │       │   └── [...path]/route.ts
│   │       ├── sitemap/
│   │       │   └── [...path]/route.ts
│   │       └── health/route.ts       # Healthcheck endpoint
│   │
│   ├── components/                    # ═══ React Components ═══
│   │   ├── ui/                        # Atomic UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Pagination.tsx
│   │   │   └── ...
│   │   ├── common/                    # Shared components
│   │   │   ├── Header.tsx            # Client component (interactive nav)
│   │   │   ├── Footer.tsx            # Server component
│   │   │   ├── Breadcrumb.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── RouteProgressBar.tsx
│   │   ├── university/               # Domain components
│   │   │   ├── UniversityCard.tsx
│   │   │   ├── UniversityHero.tsx
│   │   │   ├── UniversityOverview.tsx
│   │   │   ├── UniversityCourseList.tsx
│   │   │   └── ...
│   │   ├── course/
│   │   ├── blog/
│   │   ├── specialization/
│   │   ├── scholarship/
│   │   ├── forms/
│   │   ├── home/
│   │   └── seo/
│   │       ├── JsonLd.tsx            # Structured data component
│   │       └── BreadcrumbJsonLd.tsx
│   │
│   ├── lib/                           # ═══ Core Libraries ═══
│   │   ├── db.ts                     # Prisma client singleton
│   │   ├── prisma-middleware.ts      # WebsiteScope equivalent
│   │   ├── seo/
│   │   │   ├── metadata.ts           # generateMetadata helpers
│   │   │   ├── replace-tag.ts        # Port of Laravel replaceTag()
│   │   │   ├── structured-data.ts    # JSON-LD generators
│   │   │   └── breadcrumbs.ts        # Breadcrumb generation
│   │   ├── queries/                   # ═══ Data Access Layer ═══
│   │   │   ├── universities.ts       # University queries
│   │   │   ├── programs.ts           # Program/course queries
│   │   │   ├── specializations.ts    # Specialization queries
│   │   │   ├── blogs.ts              # Blog queries
│   │   │   ├── scholarships.ts       # Scholarship queries
│   │   │   ├── exams.ts              # Exam queries
│   │   │   ├── services.ts           # Service queries
│   │   │   ├── faqs.ts               # FAQ queries
│   │   │   ├── seo.ts                # SEO data queries
│   │   │   └── home.ts               # Homepage data queries
│   │   ├── auth/
│   │   │   ├── session.ts            # NextAuth / custom JWT
│   │   │   └── middleware.ts         # Auth middleware
│   │   ├── email/
│   │   │   └── mailer.ts             # Inquiry email sending
│   │   ├── constants.ts              # SITE_VAR, DOMAIN, IMAGE_BASE_URL
│   │   └── utils.ts                  # slugify, unslugify, etc.
│   │
│   ├── hooks/                         # ═══ Client-Side Hooks ═══
│   │   ├── useContactForm.ts
│   │   ├── useInquiryForm.ts
│   │   ├── useCourseFilters.ts
│   │   ├── useUniversityFilters.ts
│   │   └── ...
│   │
│   ├── styles/
│   │   ├── globals.css               # Port of existing index.css (24KB)
│   │   └── variables.css             # CSS custom properties
│   │
│   ├── types/                         # ═══ TypeScript Types ═══
│   │   ├── university.ts
│   │   ├── program.ts
│   │   ├── blog.ts
│   │   ├── specialization.ts
│   │   ├── seo.ts
│   │   └── ...
│   │
│   └── middleware.ts                  # ═══ Edge Middleware ═══
│                                       # URL redirects, auth guards
│
├── public/
│   ├── logo.png
│   ├── favicon.ico
│   └── images/                        # Static images from current /public/
│
├── scripts/
│   ├── generate-prisma-schema.ts      # One-time: introspect MySQL
│   └── warm-cache.ts                  # ISR cache warming script
│
└── sitemaps/                          # ═══ Sitemap Split Files ═══
    └── (generated at build/runtime)
```

---

## Database Layer — Prisma ORM

### Strategy: Introspect, Don't Migrate

```bash
# Step 1: Initialize Prisma pointing to existing MySQL
npx prisma init --datasource-provider mysql

# Step 2: Pull existing schema (no changes to DB)
npx prisma db pull

# Step 3: Generate client
npx prisma generate
```

### Prisma Client Singleton

```typescript
// src/lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query'] : [],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### WebsiteScope Equivalent — Prisma Middleware

The existing Laravel app uses a `WebsiteScope` global scope that automatically adds `WHERE website = 'MYS'` to every query. This **must** be replicated:

```typescript
// src/lib/prisma-middleware.ts
import { Prisma } from '@prisma/client'

const SITE_VAR = process.env.SITE_VAR || 'MYS'

// Tables that have the 'website' column
const WEBSITE_SCOPED_MODELS = [
  'university', 'university_program', 'course_specialization',
  'blog', 'course_category', 'level', 'scholarship',
  'service', 'exam', 'page_banner', 'testimonial',
  // ... add all models that have WebsiteScope
]

export function applyWebsiteScope() {
  prisma.$use(async (params, next) => {
    if (WEBSITE_SCOPED_MODELS.includes(params.model?.toLowerCase() ?? '')) {
      if (params.action === 'findMany' || params.action === 'findFirst' || params.action === 'count') {
        params.args = params.args ?? {}
        params.args.where = {
          ...params.args.where,
          website: SITE_VAR,
        }
      }
    }
    return next(params)
  })
}
```

### Key Model Mappings (Eloquent → Prisma)

| Eloquent Model | Prisma Model | Key Relations |
|---------------|-------------|---------------|
| `University` | `University` | hasMany `UniversityProgram`, `UniversityPhoto`, `UniversityOverview`, `Review` |
| `UniversityProgram` | `UniversityProgram` | belongsTo `University`, `CourseCategory`, `CourseSpecialization` |
| `CourseSpecialization` | `CourseSpecialization` | hasMany `UniversityProgram`, `SpecializationContent`, `SpecializationLevel` |
| `Blog` | `Blog` | belongsTo `BlogCategory`, `Author`; hasMany `BlogContent`, `BlogFaq` |
| `CourseCategory` | `CourseCategory` | hasMany `UniversityProgram`, `CourseCategoryContent` |
| `Level` | `Level` | — |
| `DynamicPageSeo` | `DynamicPageSeo` | Template-based SEO meta |
| `StaticPageSeo` | `StaticPageSeo` | Static page SEO meta |

### Data Access Layer Pattern

All database queries are centralized in `src/lib/queries/`, not scattered across pages:

```typescript
// src/lib/queries/universities.ts
import { prisma } from '@/lib/db'
import { unstable_cache } from 'next/cache'

// Cached query for ISR pages
export const getUniversityBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.university.findFirst({
      where: { uname: slug, status: 1 },
      include: {
        institute_type: true,
        programs: { where: { status: 1 }, select: { id: true } },
        photos: { where: { is_featured: 1 } },
        overviews: { orderBy: { position: 'asc' } },
      },
    })
  },
  ['university-detail'],
  { revalidate: 86400, tags: ['university'] } // 24h
)

export const getAllUniversitySlugs = unstable_cache(
  async () => {
    const universities = await prisma.university.findMany({
      where: { status: 1 },
      select: { uname: true },
    })
    return universities.map(u => u.uname)
  },
  ['university-slugs'],
  { revalidate: 86400 }
)
```

---

## Page Rendering Strategy

### Rendering Matrix

| Route Pattern | Strategy | Revalidate | `generateStaticParams` | Rationale |
|--------------|----------|-----------|----------------------|-----------|
| `/` (Home) | ISR | 12h (43200s) | — | Content changes occasionally |
| `/study-in-malaysia` | SSG/ISR | 12h | — | Landing page, mostly static |
| `/who-we-are`, `/why-study`, etc. | SSG/ISR | 12h | — | Static marketing pages |
| `/universities` | ISR | 24h | — | Select university listing |
| `/universities/[type]` | ISR | 24h | Yes (all types) | ~10 institute types |
| `/university/[slug]` | ISR | 24h | Yes (all 300) | University detail |
| `/university/[slug]/[section]` | ISR | 24h | Yes (slug × section) | Overview/courses/gallery/ranking/reviews |
| `/university/[slug]/courses/[courseSlug]` | ISR | 24h | Top 500, rest on-demand | Per-course detail |
| `/course/[slug]` | ISR | 24h | Yes (all categories) | ~50 categories |
| `/courses-in-malaysia` | ISR | 24h | — | Course listing with filters |
| `/specialization/[slug]` | ISR | 24h | Yes (all) | ~200 specializations |
| `/specialization/[slug]/[levelSlug]` | ISR | 24h | Yes (all combos) | ~500 combinations |
| `/blog` | ISR | 6h | — | Blog listing, changes frequently |
| `/blog/[category]` | ISR | 6h | Yes (all categories) | Blog category pages |
| `/blog/[category]/[slugWithId]` | ISR | 12h | Top 200, rest on-demand | Individual blog posts |
| `/scholarships/[slug]` | ISR | 24h | Yes (all) | ~20 scholarships |
| `/resources/exams/[slug]` | ISR | 24h | Yes | ~10 exams |
| `/resources/services/[slug]` | ISR | 24h | Yes | ~10 services |
| `/student/*` | CSR (no SSR) | — | — | Auth-gated dashboard |
| `/login`, `/signup` | CSR | — | — | Auth pages |
| `/api/*` | SSR (Edge/Node) | — | — | API route handlers |

### Example: University Page (ISR)

```typescript
// src/app/university/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import { getUniversityBySlug, getAllUniversitySlugs } from '@/lib/queries/universities'
import { getUniversityOverview } from '@/lib/queries/universities'
import { resolveUniversityMeta } from '@/lib/seo/metadata'
import { UniversityJsonLd } from '@/components/seo/JsonLd'
import UniversityHero from '@/components/university/UniversityHero'
import UniversityOverview from '@/components/university/UniversityOverview'

// ISR: revalidate every 24 hours
export const revalidate = 86400

// Pre-generate all ~300 university pages at build time
export async function generateStaticParams() {
  const slugs = await getAllUniversitySlugs()
  return slugs.map(slug => ({ slug }))
}

// Dynamic metadata for SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const university = await getUniversityBySlug(slug)
  if (!university) return {}
  return resolveUniversityMeta(university)
}

// Page component — Server Component by default (zero client JS)
export default async function UniversityPage({ params }: Props) {
  const { slug } = await params
  const university = await getUniversityBySlug(slug)
  if (!university) notFound()

  const overview = await getUniversityOverview(university.id)

  return (
    <>
      <UniversityJsonLd university={university} />
      <UniversityHero university={university} />
      <UniversityOverview
        overviews={overview.overviews}
        specializations={overview.specializations}
      />
    </>
  )
}
```

### Example: Course Category Page (ISR)

```typescript
// src/app/course/[slug]/page.tsx
import { notFound } from 'next/navigation'
import { getCourseCategory, getAllCourseCategorySlugs } from '@/lib/queries/courses'
import { resolveCourseMetadata } from '@/lib/seo/metadata'
import { CourseJsonLd } from '@/components/seo/JsonLd'

export const revalidate = 86400

export async function generateStaticParams() {
  const slugs = await getAllCourseCategorySlugs()
  return slugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = await getCourseCategory(slug)
  if (!category) return {}
  return resolveCourseMetadata(category)
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params
  const category = await getCourseCategory(slug)
  if (!category) notFound()

  return (
    <>
      <CourseJsonLd category={category} />
      {/* Server-rendered content — zero client JS */}
      <h1>{category.name}</h1>
      <div dangerouslySetInnerHTML={{ __html: category.description }} />
      {/* FAQ Section */}
      {category.faqs?.map(faq => (
        <details key={faq.id}>
          <summary>{faq.question}</summary>
          <p>{faq.answer}</p>
        </details>
      ))}
    </>
  )
}
```

### Handling `[...filterCourses]` Dynamic Routes

The existing app has pattern `/:filterSlug-courses` (e.g., `/engineering-courses`, `/business-courses`). This is handled with a catch-all segment and route validation:

```typescript
// src/app/[...filterCourses]/page.tsx
import { notFound } from 'next/navigation'

export default async function FilteredCoursesPage({ params }: Props) {
  const segments = (await params).filterCourses
  const slug = segments[0]

  // Only match patterns ending with "-courses"
  if (!slug.endsWith('-courses')) notFound()

  const filterSlug = slug.replace(/-courses$/, '')
  // ... fetch and render filtered courses
}
```

---

## SEO Architecture

### 1. Dynamic Metadata Generation

Port the entire `SeoMetaService.php` logic into `generateMetadata()` functions:

```typescript
// src/lib/seo/metadata.ts
import { Metadata } from 'next'
import { replaceTag } from './replace-tag'
import { prisma } from '@/lib/db'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.educationmalaysia.in'
const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://admin.educationmalaysia.in'

export async function resolveUniversityMeta(university: any, section = 'overview'): Promise<Metadata> {
  const sectionMap: Record<string, string> = {
    overview: 'university',
    courses: 'university-course-list',
    gallery: 'gallery',
    videos: 'video',
    ranking: 'university-ranking',
    reviews: 'review-page',
  }

  const dseo = await prisma.dynamicPageSeo.findFirst({
    where: { url: sectionMap[section] || 'university' }
  })

  const tagArray = {
    title: university.name,
    address: university.city || '',
    shortnote: university.shortnote || '',
    universitytype: university.institute_type?.type || '',
    universityname: university.name,
    currentmonth: new Date().toLocaleString('en', { month: 'short' }),
    currentyear: new Date().getFullYear().toString(),
    site: SITE_URL,
  }

  const metaTitle = replaceTag(
    university.meta_title || dseo?.meta_title || '%universityname% - Study in Malaysia %currentyear%',
    tagArray
  )
  const metaDescription = replaceTag(
    university.meta_description || dseo?.meta_description || '',
    tagArray
  )

  const ogImage = university.og_image_path
    ? `${IMAGE_BASE}/storage/${university.og_image_path}`
    : dseo?.og_image_path
      ? `${IMAGE_BASE}/storage/${dseo.og_image_path}`
      : `${SITE_URL}/og-default.png`

  const canonical = `${SITE_URL}/university/${university.uname}${section !== 'overview' ? '/' + section : ''}`

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: replaceTag(university.meta_keyword || dseo?.meta_keyword || '', tagArray),
    alternates: { canonical },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: canonical,
      images: [{ url: ogImage }],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDescription,
      images: [ogImage],
    },
    robots: 'index, follow',
  }
}
```

### 2. replaceTag() Port

```typescript
// src/lib/seo/replace-tag.ts
export function replaceTag(template: string | null, tags: Record<string, string>): string {
  if (!template) return ''
  return Object.entries(tags).reduce(
    (str, [key, value]) => str.replaceAll(`%${key}%`, value || ''),
    template
  )
}
```

### 3. Structured Data (JSON-LD)

```typescript
// src/components/seo/JsonLd.tsx
import Script from 'next/script'

export function UniversityJsonLd({ university }: { university: any }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: university.name,
    url: `https://www.educationmalaysia.in/university/${university.uname}`,
    logo: university.logo_path
      ? `https://admin.educationmalaysia.in/storage/${university.logo_path}`
      : undefined,
    address: {
      '@type': 'PostalAddress',
      addressLocality: university.city,
      addressRegion: university.state,
      addressCountry: 'MY',
    },
    aggregateRating: university.rating ? {
      '@type': 'AggregateRating',
      ratingValue: university.rating,
      bestRating: 5,
    } : undefined,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function CourseJsonLd({ program, university }: { program: any; university: any }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: program.course_name,
    provider: {
      '@type': 'EducationalOrganization',
      name: university.name,
    },
    description: program.meta_description || program.course_name,
    url: `https://www.educationmalaysia.in/university/${university.uname}/courses/${program.slug}`,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

### 4. Breadcrumb Schema

```typescript
// src/components/seo/BreadcrumbJsonLd.tsx
export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
```

---

## Sitemap Generation Strategy

### Multi-Sitemap Index Architecture

With 10k+ URLs, a single sitemap won't scale. Use a **sitemap index** pattern:

```typescript
// src/app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  // Sitemap index — points to individual sitemaps
  return [
    { url: 'https://www.educationmalaysia.in/sitemap-home.xml', lastModified: new Date() },
    { url: 'https://www.educationmalaysia.in/sitemap-universities.xml', lastModified: new Date() },
    { url: 'https://www.educationmalaysia.in/sitemap-university-programs.xml', lastModified: new Date() },
    { url: 'https://www.educationmalaysia.in/sitemap-courses.xml', lastModified: new Date() },
    { url: 'https://www.educationmalaysia.in/sitemap-specializations.xml', lastModified: new Date() },
    { url: 'https://www.educationmalaysia.in/sitemap-blog.xml', lastModified: new Date() },
    { url: 'https://www.educationmalaysia.in/sitemap-exams.xml', lastModified: new Date() },
    { url: 'https://www.educationmalaysia.in/sitemap-services.xml', lastModified: new Date() },
  ]
}

// src/app/sitemap-universities.xml/route.ts
import { prisma } from '@/lib/db'

export async function GET() {
  const universities = await prisma.university.findMany({
    where: { status: 1 },
    select: { uname: true, updated_at: true },
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${universities.map(u => `
        <url>
          <loc>https://www.educationmalaysia.in/university/${u.uname}</loc>
          <lastmod>${u.updated_at?.toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `).join('')}
    </urlset>`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
```

### Robots.txt

```typescript
// src/app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/student/', '/login', '/signup', '/admin/'],
      },
    ],
    sitemap: 'https://www.educationmalaysia.in/sitemap.xml',
  }
}
```

---

## API Architecture — Replacing Laravel Controllers

### Migration Mapping

| Laravel Controller | Next.js API Route | Method |
|---|---|---|
| `UniversityApi::selectUniversity` | `GET /api/universities` | Server Component direct query |
| `UniversityApi::universitiesInMalaysia` | `GET /api/universities/in-malaysia` | API route (filtered, paginated) |
| `UniversityApi::universityDetail` | Direct query in page | Server Component |
| `UniversityApi::courses` | `GET /api/university/[slug]/courses` | API route (filtered) |
| `BlogApi::index` | `GET /api/blog` | API route (paginated) |
| `BlogApi::detail` | Direct query in page | Server Component |
| `SpecializationApi::*` | `GET /api/specialization/*` | Mix of SC + API |
| `InquiryApi::*` | `POST /api/inquiry/*` | API route (mutations) |
| `StudentAuthApi::*` | `POST /api/student/*` | API route (auth) |
| `StudentProfileApi::*` | API routes | Auth-protected API |

### Key Principle: Server Components Replace Most APIs

In the existing architecture, the React SPA makes 2-5 API calls per page load (waterfall pattern). In Next.js, **Server Components query the database directly**, eliminating the API layer for read-heavy pages:

```
BEFORE (React SPA):
  Browser → /university/abc → React loads → API call → Wait → Render

AFTER (Next.js):
  Browser → /university/abc → Server renders with data → HTML delivered
```

API routes are only needed for:
1. **Client-side filtering** (university course filters, search)
2. **Form submissions** (inquiry forms, contact us)
3. **Authentication** (student login/register)
4. **Pagination** (client-side page navigation)

---

## Performance Optimization Plan

### Core Web Vitals Strategy

#### LCP < 2.0s

| Technique | Implementation |
|-----------|---------------|
| **Server Components** | All pages are Server Components by default — HTML includes content |
| **`next/image`** | All images use `<Image>` with `priority` for above-fold, `sizes` prop |
| **Font optimization** | `next/font/google` with `display: swap` and preload |
| **Image preloading** | `priority` prop on hero images triggers `<link rel="preload">` |
| **No API waterfall** | Data fetched on server, rendered into HTML |

```typescript
// src/app/layout.tsx
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  )
}
```

#### CLS = 0

| Technique | Implementation |
|-----------|---------------|
| **Fixed image dimensions** | All `<Image>` components specify `width` + `height` or use `fill` with `aspect-ratio` |
| **Font loading** | `next/font` with `display: swap` + `size-adjust` via `adjustFontFallback` |
| **Skeleton loaders** | `loading.tsx` files with fixed-dimension placeholders |
| **No client-side layout shifts** | Server-rendered content, no FOUC |

#### INP < 200ms

| Technique | Implementation |
|-----------|---------------|
| **Server Components** | Minimal client-side JS — only interactive elements are Client Components |
| **Code splitting** | Automatic per-route code splitting via App Router |
| **`'use client'` boundary** | Only on interactive components (forms, search, modals) |
| **React 18 transitions** | `useTransition` for filter updates |
| **Streaming** | Suspense boundaries for non-critical sections |

### Client vs Server Component Split

```
Server Components (zero client JS):
├── Header (static parts)
├── Footer
├── University overview content
├── Blog article content
├── Course descriptions
├── FAQ sections (using <details>)
├── Breadcrumbs
├── Structured data
└── All metadata

Client Components ('use client'):
├── Header navigation (mobile menu toggle)
├── Search bar
├── Course filter sidebar
├── University filter panel
├── Contact/inquiry forms
├── Modal dialogs
├── Image galleries (lightbox)
├── Pagination controls
├── Auth forms
└── Student dashboard
```

### Image Optimization

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.educationmalaysia.in',
        pathname: '/storage/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
}
```

### Streaming & Suspense Boundaries

```typescript
// src/app/university/[slug]/page.tsx
import { Suspense } from 'react'
import UniversityHero from '@/components/university/UniversityHero'
import UniversityOverview from '@/components/university/UniversityOverview'
import RelatedUniversities from '@/components/university/RelatedUniversities'
import { UniversityOverviewSkeleton } from '@/components/ui/Skeleton'

export default async function UniversityPage({ params }: Props) {
  const university = await getUniversityBySlug((await params).slug)
  if (!university) notFound()

  return (
    <>
      {/* Critical content — rendered immediately */}
      <UniversityHero university={university} />

      {/* Streamed after hero — doesn't block LCP */}
      <Suspense fallback={<UniversityOverviewSkeleton />}>
        <UniversityOverview universityId={university.id} />
      </Suspense>

      {/* Low priority — streamed last */}
      <Suspense fallback={null}>
        <RelatedUniversities currentId={university.id} />
      </Suspense>
    </>
  )
}
```

---

## URL Redirects & Preserving Existing URLs

### Edge Middleware for Redirects

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect: /blogs → /blog
  if (pathname === '/blogs') {
    return NextResponse.redirect(new URL('/blog', request.url), 301)
  }

  // Redirect: /courses-in-malaysias → /courses-in-malaysia
  if (pathname === '/courses-in-malaysias') {
    return NextResponse.redirect(new URL('/courses-in-malaysia', request.url), 301)
  }

  // Redirect: /study-malaysia → /
  if (pathname === '/study-malaysia') {
    return NextResponse.redirect(new URL('/', request.url), 301)
  }

  // Redirect: /students-say → /what-people-say
  if (pathname === '/students-say') {
    return NextResponse.redirect(new URL('/what-people-say', request.url), 301)
  }

  // Block invalid query params
  if (request.nextUrl.searchParams.has('page')) {
    return NextResponse.rewrite(new URL('/not-found', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### next.config.ts Redirects

```typescript
// next.config.ts
const nextConfig = {
  async redirects() {
    return [
      { source: '/blogs', destination: '/blog', permanent: true },
      { source: '/courses-in-malaysias', destination: '/courses-in-malaysia', permanent: true },
      { source: '/study-malaysia', destination: '/', permanent: true },
      { source: '/students-say', destination: '/what-people-say', permanent: true },
    ]
  },
}
```

---

## Next.js Configuration

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Output mode for deployment
  output: 'standalone',

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'admin.educationmalaysia.in',
        pathname: '/storage/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
  },

  // Compression
  compress: true,

  // Strict mode
  reactStrictMode: true,

  // Headers for performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
      {
        source: '/(.*)\\.(jpg|jpeg|png|gif|svg|webp|avif|ico)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },

  // Redirects
  async redirects() {
    return [
      { source: '/blogs', destination: '/blog', permanent: true },
      { source: '/courses-in-malaysias', destination: '/courses-in-malaysia', permanent: true },
      { source: '/study-malaysia', destination: '/', permanent: true },
      { source: '/students-say', destination: '/what-people-say', permanent: true },
    ]
  },

  // Experimental features
  experimental: {
    // Enable Partial Prerendering (Next.js 15)
    ppr: 'incremental',
  },
}

export default nextConfig
```

---

## Environment Variables

```ini
# .env.local

# Database
DATABASE_URL="mysql://root:@127.0.0.1:3306/educationmalaysia"

# Site Configuration
SITE_VAR="MYS"
NEXT_PUBLIC_SITE_URL="https://www.educationmalaysia.in"
NEXT_PUBLIC_IMAGE_BASE_URL="https://admin.educationmalaysia.in"
NEXT_PUBLIC_ADMIN_URL="https://admin.educationmalaysia.in"

# Email (for inquiry forms)
SMTP_HOST="vector.herosite.pro"
SMTP_PORT=465
SMTP_USER="enquiry@britannicaoverseas.com"
SMTP_PASS="..."
MAIL_FROM="info@educationmalaysia.in"

# Auth
JWT_SECRET="..."
NEXTAUTH_URL="https://www.educationmalaysia.in"
NEXTAUTH_SECRET="..."
```

---

## Scalability to 100k+ Pages

### Build-Time: Parallelized Static Generation

```typescript
// For 10k+ pages, use generateStaticParams with fallback
export const dynamicParams = true  // Allow on-demand generation

export async function generateStaticParams() {
  // Pre-build top 500 courses by traffic, rest generated on-demand
  const topCourses = await prisma.universityProgram.findMany({
    where: { status: 1 },
    orderBy: { views: 'desc' },
    take: 500,
    select: { slug: true, university: { select: { uname: true } } },
  })

  return topCourses.map(c => ({
    slug: c.university.uname,
    courseSlug: c.slug,
  }))
}
```

### Runtime: On-Demand ISR

Pages not pre-built at build time are generated on first request and cached. Subsequent requests serve the cached version until `revalidate` expires.

### Future: 100k+ Pages

- **Incremental builds**: Only changed pages are regenerated
- **`revalidateTag()`**: Targeted cache invalidation when admin updates content
- **CDN**: Vercel Edge Network / Cloudflare caches all ISR pages globally
- **Database indexes**: Ensure `uname`, `slug`, `status`, `website` columns are indexed

---

## Verification Plan

### Automated Testing

Since this is an architecture plan (no code has been written yet), verification will happen during execution:

1. **Build verification**: `npm run build` — must complete without errors, generating all static pages
2. **Lighthouse CI**: Run Lighthouse on key pages with these thresholds:
   - LCP < 2.0s
   - CLS = 0  
   - Performance score ≥ 90
3. **URL preservation check**: Script to crawl all existing URLs and verify 200 status codes
4. **Sitemap validation**: Verify sitemap.xml contains all expected URLs

### Manual Verification

1. **Visual comparison**: Side-by-side comparison of old and new site pages
2. **SEO audit**: Verify meta tags, og tags, canonical URLs, and structured data match existing site
3. **Mobile responsiveness**: Test on multiple viewport sizes
4. **Form submissions**: Test all inquiry and contact forms
5. **Authentication flow**: Test student login, signup, and dashboard access

---

## Migration Phases (Recommended Execution Order)

### Phase 1: Foundation (Days 1–2)
- Initialize Next.js 15 project
- Set up Prisma with existing MySQL
- Port utility functions (`replaceTag`, `slugify`, etc.)
- Create root layout with fonts and global styles
- Set up environment variables

### Phase 2: Core Pages (Days 3–5)
- Homepage
- University listing and detail pages
- Course pages (courses-in-malaysia, course/[slug])
- Specialization pages

### Phase 3: Content Pages (Days 6–7)
- Blog listing and detail pages
- Scholarship pages
- Exam and service pages
- FAQ page

### Phase 4: Interactive Features (Days 8–9)
- Contact and inquiry forms
- Search and filter functionality
- University course filtering
- Student authentication

### Phase 5: SEO & Performance (Days 10–11)
- Sitemap generation
- Robots.txt
- Structured data (JSON-LD)
- Image optimization
- Core Web Vitals audit

### Phase 6: Student Dashboard (Day 12)
- Student profile
- Applied colleges
- Document uploads

### Phase 7: Testing & Launch (Days 13–14)
- URL parity verification
- Lighthouse audits
- Load testing
- DNS cutover plan
