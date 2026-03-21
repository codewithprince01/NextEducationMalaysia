import { Suspense } from 'react'
import { SITE_URL } from '@/lib/constants'
import { resolveStaticMetaAny } from '@/lib/seo/metadata'
import Hero from '@/components/home/Hero'
import StudyJourney from '@/components/home/StudyJourney'
import UniversitySliderClient from '@/components/home/UniversitySliderClient'
import MalaysiaSection from '@/components/home/MalaysiaSection'
import Culture from '@/components/home/Culture'
import MalaysiaInfo from '@/components/home/MalaysiaInfo'
import ProgrammeSelector from '@/components/home/ProgrammeSelector'
import FieldStudyClient from '@/components/home/FieldStudyClient'
import NationalityStatsClient from '@/components/home/NationalityStatsClient'
import RankingTable from '@/components/home/RankingTable'
import TestimonialSlider from '@/components/home/TestimonialSlider'
import type { Testimonial } from '@/components/home/TestimonialSlider'
import LazySection from '@/components/ui/LazySection'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'

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
    return await getHomePageData()
  } catch {
    return { featuredUniversities: [], totalUniversities: 0, totalCourses: 0, courseCategories: [], pageContent: [] }
  }
}

async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const { prisma } = await import('@/lib/db')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const testimonialModel = (prisma as any).testimonial
    return await testimonialModel.findMany({
      where: { status: true },
      select: { id: true, name: true, review: true, country: true, program: true, university: true },
      take: 10,
    }) as Testimonial[]
  } catch {
    return []
  }
}

export default async function Home() {
  const [{ featuredUniversities }, testimonials] = await Promise.all([
    getHomeData(),
    getTestimonials(),
  ])

  return (
    <main>
      <JsonLd data={organizationJsonLd()} />
      <JsonLd data={websiteJsonLd()} />
      <h1 className="sr-only">Education Malaysia - Study in Malaysia</h1>

      {/* Above fold: SSR hero + Swiper client */}
      <Suspense fallback={<div style={{ height: '100dvh', minHeight: 480 }} className="bg-blue-950" />}>
        <Hero />
      </Suspense>

      {/* 5-step study journey */}
      <StudyJourney />

      {/* University slider — SSR data → client Swiper */}
      {featuredUniversities.length > 0 && (
        <LazySection>
          <ErrorBoundary>
            <UniversitySliderClient universities={featuredUniversities} />
          </ErrorBoundary>
        </LazySection>
      )}

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
      <ErrorBoundary>
        <Suspense fallback={<Skeleton />}>
          <RankingTable />
        </Suspense>
      </ErrorBoundary>

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
