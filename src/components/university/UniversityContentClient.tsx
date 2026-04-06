'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import UniversityCoursesClient from './UniversityCoursesClient'
import UniversityGalleryClient from './UniversityGalleryClient'
import UniversityVideosClient from './tabs/UniversityVideosClient'
import UniversityRankingClient from './tabs/UniversityRankingClient'
import UniversityReviewsClient from './tabs/UniversityReviewsClient'
import SideInquiryForm from '../forms/SideInquiryForm'
import UniversityCoursesCard from './UniversityCoursesCard'

type Section = {
  id: number
  tab?: string | null
  description?: string | null
}

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'courses', label: 'Courses' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'videos', label: 'Videos' },
  { id: 'ranking', label: 'Ranking' },
  { id: 'reviews', label: 'Reviews' },
]

type Props = {
  slug: string
  overviews: Section[]
  universityName: string | null
  initialTab?: string
  initialCourseData?: any
}

/** Wrap every bare <table> in a horizontal-scroll div so tables don't overflow on mobile */
function wrapTables(html: string): string {
  if (!html) return ''
  return html
    .replace(/<table/gi, '<div class="responsive-table-wrapper" style="display:block;width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;"><table style="width:max-content;min-width:100%;"')
    .replace(/<\/table>/gi, '</table></div>')
}

function OverviewContent({ overviews, universityName }: { overviews: Section[]; universityName: string | null }) {
  if (overviews.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center text-gray-500">
        <p className="text-lg">No overview information available for {universityName}.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {overviews.map(section => (
        <div key={section.id} className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
          {section.tab && (
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">{section.tab}</h2>
          )}
          {section.description && (
            <div
              className="content-html prose prose-blue max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: wrapTables(section.description) }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default function UniversityContentClient({ slug, overviews, universityName, initialTab = 'overview', initialCourseData }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState(initialTab)

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    // Update URL if needed
    if (tabId === 'overview') {
      router.push(`/university/${slug}`, { scroll: false })
    } else {
      router.push(`/university/${slug}/${tabId}`, { scroll: false })
    }
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'overview': return <OverviewContent overviews={overviews} universityName={universityName} />
      case 'courses': return <UniversityCoursesClient slug={slug} initialData={initialCourseData} />
      case 'gallery': return <UniversityGalleryClient slug={slug} />
      case 'videos': return <UniversityVideosClient slug={slug} />
      case 'ranking': return <UniversityRankingClient slug={slug} />
      case 'reviews': return <UniversityReviewsClient slug={slug} />
      default: return <OverviewContent overviews={overviews} universityName={universityName} />
    }
  }

  const isFullWidth = activeTab === 'courses'

  return (
    <>
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-14 z-10">
        <div className="max-w-[1400px] mx-auto px-2 md:px-4 flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
          {TABS.map((tab, index) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`py-4 text-sm font-medium transition-all border-b-2 cursor-pointer whitespace-nowrap ${index === 0 ? 'pl-0 pr-6' : 'px-6'} ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-500'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-2 md:px-4 py-8">
        {isFullWidth ? (
          <div key={activeTab}>{renderContent()}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div key={activeTab} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {renderContent()}
              </div>
            </div>
            <aside className="col-span-1 space-y-8">
              <SideInquiryForm type="university" context={{ slug, universityName }} />
              <UniversityCoursesCard />
              <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                <h3 className="text-lg font-bold mb-2 relative z-10">Direct Assistance</h3>
                <p className="text-blue-100 text-xs mb-4 relative z-10 leading-relaxed">
                  Confused about requirements? Our experts can help you with the admission process for {universityName}.
                </p>
                <a href="/contact-us" className="inline-block bg-white text-blue-600 px-6 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 transition relative z-10">
                  Contact Us Now
                </a>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  )
}
