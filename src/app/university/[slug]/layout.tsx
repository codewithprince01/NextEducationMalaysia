import { notFound } from 'next/navigation'
import { getUniversityFull } from '@/lib/queries/universities'
import UniversityHeroClient from '@/components/university/UniversityHeroClient'
import UniversityTabsClient from '@/components/university/UniversityTabsClient'
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
  
  // Extract unique course names/faculties from programs
  const offeredCourses = Array.from(new Set((university.programs || []).map((p: any) => p.course_name))).filter(Boolean).slice(0, 10)

  return (
    <div className="min-h-screen bg-white">
      {/* Shared Hero */}
      <UniversityHeroClient
        university={{ ...university, offeredCourses }}
        photos={photos}
      />

      {/* Shared Tab Bar */}
      <UniversityTabsClient slug={slug} />

      {/* Main Content Area */}
      {/* 
         Note: The layout itself doesn't know the 'activeTab' easily 
         to decide on 'fullWidth' vs 'sidebar'. 
         We'll handle the sidebar inside the individual page components 
         to keep the layout simple and maintain the 'Full Width' requirement for Courses.
      */}
      <div className="max-w-[1400px] mx-auto px-2 md:px-4 py-8">
        {children}
      </div>
    </div>
  )
}
