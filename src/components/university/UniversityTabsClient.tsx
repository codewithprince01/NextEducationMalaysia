'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const TABS = [
  { id: 'overview', label: 'Overview', path: '' },
  { id: 'courses', label: 'Courses', path: '/courses' },
  { id: 'gallery', label: 'Gallery', path: '/gallery' },
  { id: 'videos', label: 'Videos', path: '/videos' },
  { id: 'ranking', label: 'Ranking', path: '/ranking' },
  { id: 'reviews', label: 'Reviews', path: '/reviews' },
]

type Props = {
  slug: string
}

export default function UniversityTabsClient({ slug }: Props) {
  const pathname = usePathname()
  
  // Determine active tab based on pathname
  const activeTab = TABS.find(tab => {
    if (tab.id === 'overview') {
      return pathname === `/university/${slug}`
    }
    return pathname.startsWith(`/university/${slug}${tab.path}`)
  })?.id || 'overview'

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-14 z-10">
      <div className="max-w-[1400px] mx-auto px-1 sm:px-2 lg:px-4 flex overflow-x-auto scrollbar-hide">
        {TABS.map((tab, index) => (
          <Link
            key={tab.id}
            href={`/university/${slug}${tab.path}`}
            scroll={false}
            className={`py-4 text-sm font-medium transition-all border-b-2 cursor-pointer whitespace-nowrap ${index === 0 ? 'pl-0 pr-6' : 'px-6'} ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-600 hover:text-blue-500'}`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
