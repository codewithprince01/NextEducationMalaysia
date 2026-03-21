import SideInquiryForm from '@/components/forms/SideInquiryForm'
import UniversityCoursesCard from './UniversityCoursesCard'
import FeaturedUniversities from '@/components/common/FeaturedUniversities'

type Props = {
  children: React.ReactNode
  slug: string
  universityName: string | null
  fullWidth?: boolean
}

export default function UniversitySectionContainer({ children, slug, universityName, fullWidth = false }: Props) {
  if (fullWidth) {
    return <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">{children}</div>
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          {children}
        </div>
      </div>
      <aside className="col-span-1 space-y-8">
        <SideInquiryForm type="university" context={{ slug, universityName }} />
        <FeaturedUniversities variant="sidebar" />
        <UniversityCoursesCard />
      </aside>
    </div>
  )
}
