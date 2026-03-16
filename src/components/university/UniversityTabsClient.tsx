'use client'

import { useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

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
  initialTab?: string
}

export default function UniversityTabsClient({ slug, initialTab = 'overview' }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState(initialTab)

  // Sync tab to URL when tab changes
  useEffect(() => {
    if (activeTab === 'overview') {
      router.replace(`/university/${slug}`, { scroll: false })
    } else {
      router.replace(`/university/${slug}/${activeTab}`, { scroll: false })
    }
  }, [activeTab, slug, router])

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-14 z-10">
      <div className="max-w-[1400px] mx-auto px-2 md:px-4 flex overflow-x-auto scrollbar-hide">
        {TABS.map((tab, index) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 text-sm font-medium transition-all border-b-2 cursor-pointer whitespace-nowrap ${index === 0 ? 'pl-0 pr-6' : 'px-6'} ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-500'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  )
}
