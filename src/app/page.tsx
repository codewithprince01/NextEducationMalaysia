import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { resolveStaticMetaAny } from '@/lib/seo/metadata'
import Hero from '@/components/home/Hero'
import type { Banner } from '@/components/home/Hero'
import type { Testimonial } from '@/components/home/TestimonialSlider'
import LazySection from '@/components/ui/LazySection'
import ErrorBoundary from '@/components/ui/ErrorBoundary'

// ── Below-fold components: dynamic() defers JS download until render ──
// This is the critical TBT fix — static imports cause ALL component JS to be
// downloaded + parsed + compiled at page load, even inside LazySection.
// dynamic() actually code-splits them into separate chunks loaded on demand.
const StudyJourney = dynamic(() => import('@/components/home/StudyJourney'))
const UniversitySliderClient = dynamic(() => import('@/components/home/UniversitySliderClient'))
const MalaysiaSection = dynamic(() => import('@/components/home/MalaysiaSection'))
const Culture = dynamic(() => import('@/components/home/Culture'))
const MalaysiaInfo = dynamic(() => import('@/components/home/MalaysiaInfo'))
const ProgrammeSelector = dynamic(() => import('@/components/home/ProgrammeSelector'))
const FieldStudyClient = dynamic(() => import('@/components/home/FieldStudyClient'))
const NationalityStatsClient = dynamic(() => import('@/components/home/NationalityStatsClient'))
const RankingTable = dynamic(() => import('@/components/home/RankingTable'))
const TestimonialSlider = dynamic(() => import('@/components/home/TestimonialSlider'))

export const revalidate = 43200 // 12 hours

export async function generateMetadata() {
  return resolveStaticMetaAny(
    ['home', 'Home Page'],
    '/',
    'Education Malaysia - Study in Top Malaysian Universities',
  )
}

const Skeleton = () => <div style={{ minHeight: 320 }} className="bg-slate-50" />

async function getHomeData() {
  try {
    const { getHomePageData } = await import('@/lib/queries/home')
    const data: any = await getHomePageData()
    if (Array.isArray(data?.featuredUniversities) && data.featuredUniversities.length > 0) {
      return data
    }

    // Hard fallback: fetch trending universities directly when cached query returns empty.
    const { prisma } = await import('@/lib/db-fresh')
    const fallbackRows = await prisma.$queryRawUnsafe(`
      SELECT
        u.id, u.name, u.uname, u.logo_path, u.banner_path, u.city, u.state,
        u.qs_rank, u.rating, u.shortnote, u.click,
        it.type AS institute_type_name,
        (
          SELECT COUNT(*)
          FROM university_programs up
          WHERE up.university_id = u.id AND up.status = 1
        ) AS active_programs_count
      FROM universities u
      LEFT JOIN institute_types it ON it.id = u.institute_type
      WHERE u.status = 1 AND u.website = 'MYS'
      ORDER BY u.click DESC, u.name ASC
      LIMIT 12
    `) as any[]

    const featuredUniversities = (fallbackRows || []).map((u: any) => ({
      ...u,
      institute_type: { type: u.institute_type_name || null },
    }))

    return {
      featuredUniversities,
      totalUniversities: 0,
      totalCourses: 0,
      courseCategories: [],
      pageContent: [],
    }
  } catch {
    try {
      const { prisma } = await import('@/lib/db-fresh')
      const fallbackRows = await prisma.$queryRawUnsafe(`
        SELECT
          u.id, u.name, u.uname, u.logo_path, u.banner_path, u.city, u.state,
          u.qs_rank, u.rating, u.shortnote, u.click,
          it.type AS institute_type_name,
          (
            SELECT COUNT(*)
            FROM university_programs up
            WHERE up.university_id = u.id AND up.status = 1
          ) AS active_programs_count
        FROM universities u
        LEFT JOIN institute_types it ON it.id = u.institute_type
        WHERE u.status = 1 AND u.website = 'MYS'
        ORDER BY u.click DESC, u.name ASC
        LIMIT 12
      `) as any[]

      return {
        featuredUniversities: (fallbackRows || []).map((u: any) => ({
          ...u,
          institute_type: { type: u.institute_type_name || null },
        })),
        totalUniversities: 0,
        totalCourses: 0,
        courseCategories: [],
        pageContent: [],
      }
    } catch {
      return { featuredUniversities: [], totalUniversities: 0, totalCourses: 0, courseCategories: [], pageContent: [] }
    }
  }
}

async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const { prisma } = await import('@/lib/db-fresh')
    const website = process.env.SITE_VAR || 'MYS'
    const rows = await prisma.$queryRawUnsafe(
      `
      SELECT id, name, review, country
      FROM testimonials
      WHERE status = 1
        AND website = ?
        AND name IS NOT NULL AND TRIM(name) <> ''
        AND review IS NOT NULL AND TRIM(review) <> ''
      ORDER BY id DESC
      LIMIT 10
      `,
      website
    ) as any[]

    return (rows || []).map((row: any) => ({
      id: Number(row.id),
      name: String(row.name || ''),
      review: String(row.review || ''),
      country: row.country ? String(row.country) : null,
      program: null,
      university: null,
    })) as Testimonial[]
  } catch {
    return []
  }
}

export default async function Home() {
  const [{ featuredUniversities }, testimonials, heroBanners] = await Promise.all([
    getHomeData(),
    getTestimonials(),
    // Hero banners now fetched in parallel — was sequential in Hero's async RSC render
    (async (): Promise<Banner[]> => {
      try {
        const { getHeroBanners } = await import('@/lib/queries/home')
        return (await getHeroBanners()) as unknown as Banner[]
      } catch { return [] }
    })(),
  ])

  return (
    <main>
      <h1 className="sr-only">Education Malaysia - Study in Malaysia</h1>

      {/* Above fold: Hero receives pre-fetched banners — no more sequential DB query */}
      <Hero banners={heroBanners} />

      {/* 5-step study journey — below fold on mobile, lazy mount */}
      <LazySection>
        <StudyJourney />
      </LazySection>

      {/* University slider — SSR data → client Swiper */}
      <LazySection>
        <ErrorBoundary>
          <UniversitySliderClient universities={featuredUniversities || []} />
        </ErrorBoundary>
      </LazySection>

      {/* Why Malaysia + stats + education pathway */}
      <LazySection>
        <ErrorBoundary>
          <MalaysiaSection />
        </ErrorBoundary>
      </LazySection>

      {/* Culture info cards + About Malaysia grid */}
      <LazySection>
        <ErrorBoundary>
          <Suspense fallback={<Skeleton />}>
            <Culture />
          </Suspense>
        </ErrorBoundary>
      </LazySection>

      {/* Educational System — Academic pathway visualization */}
      <LazySection>
        <ErrorBoundary>
          <Suspense fallback={<Skeleton />}>
            <MalaysiaInfo />
          </Suspense>
        </ErrorBoundary>
      </LazySection>

      {/* Favourite programme selector */}
      <LazySection>
        <ErrorBoundary>
          <Suspense fallback={<Skeleton />}>
            <ProgrammeSelector />
          </Suspense>
        </ErrorBoundary>
      </LazySection>

      {/* EMGS Field Study Dashboard — Interactive enrollment trends */}
      <LazySection>
        <ErrorBoundary>
          <FieldStudyClient />
        </ErrorBoundary>
      </LazySection>

      {/* EMGS Nationality Trends — Global enrollment footprint */}
      <LazySection>
        <ErrorBoundary>
          <NationalityStatsClient />
        </ErrorBoundary>
      </LazySection>

      {/* University rankings table */}
      <LazySection>
        <ErrorBoundary>
          <Suspense fallback={<Skeleton />}>
            <RankingTable />
          </Suspense>
        </ErrorBoundary>
      </LazySection>

      {/* Student testimonials */}
      {testimonials.length > 0 && (
        <LazySection>
          <ErrorBoundary>
            <TestimonialSlider testimonials={testimonials} />
          </ErrorBoundary>
        </LazySection>
      )}
    </main>
  )
}

