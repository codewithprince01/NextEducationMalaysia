import { Suspense } from 'react'
import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'
import Hero from '@/components/home/Hero'
import StudyJourney from '@/components/home/StudyJourney'
import UniversitySliderClient from '@/components/home/UniversitySliderClient'
import MalaysiaSection from '@/components/home/MalaysiaSection'
import Culture from '@/components/home/Culture'
import ProgrammeSelector from '@/components/home/ProgrammeSelector'
import RankingTable from '@/components/home/RankingTable'
import TestimonialSlider from '@/components/home/TestimonialSlider'
import type { Testimonial } from '@/components/home/TestimonialSlider'
import FieldStudyClient from '@/components/home/FieldStudyClient'
import NationalityStatsClient from '@/components/home/NationalityStatsClient'
import EducationSystem from '@/components/home/EducationSystem'
import UniversityRankingTableClient from '@/components/home/UniversityRankingTableClient'
import TestimonialSliderClient from '@/components/home/TestimonialSliderClient'
import { organizationJsonLd, websiteJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'

export const revalidate = 43200 // 12 hours

export const metadata: Metadata = {
  title: 'Education Malaysia - Study in Top Malaysian Universities',
  description:
    'Discover top universities in Malaysia. Find courses, scholarships, exams, and expert guidance for studying in Malaysia. Your gateway to quality education in Malaysia.',
  alternates: { canonical: SITE_URL },
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
    return (await (prisma as any).testimonial.findMany({
      where: { status: true },
      select: { id: true, name: true, review: true, country: true, program: true, university: true },
      take: 10,
    })) as Testimonial[]
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
        <section>
          <UniversitySliderClient universities={featuredUniversities as any[]} />
        </section>
      )}

      {/* Why Malaysia + stats + education pathway */}
      <MalaysiaSection />

      {/* Culture info cards + About Malaysia grid */}
      <Suspense fallback={<Skeleton />}>
        <Culture />
      </Suspense>

      {/* Educational System — Academic pathway visualization */}
      <EducationSystem />

      {/* Favourite programme selector */}
      <Suspense fallback={<Skeleton />}>
        <ProgrammeSelector />
      </Suspense>

      {/* EMGS Field Study Dashboard — Interactive enrollment trends */}
      <FieldStudyClient />

      {/* EMGS Nationality Trends — Global enrollment footprint */}
      <NationalityStatsClient />

      {/* University rankings table */}
      <Suspense fallback={<Skeleton />}>
        <RankingTable />
      </Suspense>

      {/* Student testimonials */}
      {testimonials.length > 0 && <TestimonialSlider testimonials={testimonials} />}
    </main>
  )
}
