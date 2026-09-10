import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import { getUniversityFull } from '@/lib/queries/universities'
import UniversityHeroClient from '@/components/university/UniversityHeroClient'
import UniversityTabsClient from '@/components/university/UniversityTabsClient'
import UniversityScrollTop from '@/components/university/UniversityScrollTop'
import { serializeBigInt } from '@/lib/utils'
import SideInquiryForm from '@/components/forms/SideInquiryForm'
import UniversityCoursesCard from '@/components/university/UniversityCoursesCard'

type Props = {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

export default async function UniversityLayout({ children, params }: Props) {
  const { slug } = await params
  const universityData = await getUniversityFull(slug)
  
  if (!universityData) notFound()
  
  const university = serializeBigInt(universityData) as any
  const photos = university.photos || []

  return (
    <div className="min-h-screen bg-white">
      <Suspense fallback={null}>
        <UniversityScrollTop />
      </Suspense>
      {/* Shared Hero */}
      <UniversityHeroClient
        university={university}
        photos={photos}
      />

      {/* Shared Tab Bar */}
      <UniversityTabsClient slug={slug} />

      {/* Main Content Area - Full width background across entire screen */}
      <main className="w-full bg-slate-100/80 border-t border-gray-200/80 min-h-[600px]">
        <div className="max-w-[1400px] mx-auto px-2 md:px-4 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
