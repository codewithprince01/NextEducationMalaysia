'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Info, Gift, Building2, FileEdit, CheckCircle, ChevronRight } from 'lucide-react'
import SideInquiryForm from '@/components/forms/SideInquiryForm'

const iconMap: Record<string, React.ReactNode> = {
  Overview: <Info size={16} />,
  'Scholarship Opportunity': <Gift size={16} />,
  University: <Building2 size={16} />,
  'Application Process': <FileEdit size={16} />,
  Conclusion: <CheckCircle size={16} />,
}

interface ScholarshipData {
  title: string
  slug: string
  contents: { tab: string; description: string }[]
  otherScholarships: { id: number; title: string; slug: string }[]
}

export default function ScholarshipDetailClient({ data }: { data: ScholarshipData }) {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const [activeTab, setActiveTab] = useState(data.contents[0]?.tab || '')

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0,
    }

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const tabName = entry.target.getAttribute('data-tab-name')
          if (tabName) setActiveTab(tabName)
        }
      })
    }

    const observer = new IntersectionObserver(observerCallback, observerOptions)
    
    data.contents.forEach((content) => {
      const el = sectionRefs.current[content.tab]
      if (el) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [data.contents])

  const handleTabClick = (tabName: string) => {
    const ref = sectionRefs.current[tabName]
    if (ref) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Offset for sticky header
      const yOffset = -100 
      const y = ref.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
    }
  }

  return (
    <section className="bg-gradient-to-br from-blue-50 to-white px-4 py-10 md:px-10">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <motion.h1
          className="text-2xl md:text-5xl font-bold text-center text-blue-800 mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {data.title}
        </motion.h1>

        {/* Tab Navigation */}
        <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md w-full flex items-center gap-3 overflow-x-auto border-b border-gray-200 py-3 mb-8 no-scrollbar px-2 rounded-xl shadow-sm">
          {data.contents.map((content) => (
            <button
              key={content.tab}
              onClick={() => handleTabClick(content.tab)}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-full whitespace-nowrap transition-all duration-300 text-sm md:text-base font-medium shadow-sm 
              ${activeTab === content.tab
                  ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300 shadow-md scale-[1.02]'
                  : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <span className="text-lg">{iconMap[content.tab] || <Info size={16} />}</span>
              {content.tab}
            </button>
          ))}
        </div>

        {/* Two-column Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-8">
          {/* Left Content */}
          <div className="space-y-6">
            {data.contents.map((content, index) => (
              <motion.div
                key={content.tab}
                ref={(el) => { sectionRefs.current[content.tab] = el }}
                data-tab-name={content.tab}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-blue-100 shadow-md rounded-[2rem] p-8"
              >
                <h3 className="text-xl md:text-2xl font-black text-blue-800 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    {iconMap[content.tab] || <Info size={20} />}
                  </div>
                  {content.tab}
                </h3>
                <div 
                  className="prose prose-blue max-w-none text-gray-700 leading-relaxed scholarship-content"
                  dangerouslySetInnerHTML={{ __html: content.description }}
                />
              </motion.div>
            ))}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-8">
            <SideInquiryForm title="Inquire Scholarship" context={data.title} />

            {/* Other Scholarships */}
            {data.otherScholarships.length > 0 && (
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl p-8">
                <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                  <div className="w-2 h-6 bg-blue-600 rounded-full" />
                  Other Scholarships
                </h2>
                <div className="space-y-3">
                  {data.otherScholarships.map((sch) => (
                    <Link
                      key={sch.id}
                      href={`/scholarships/${sch.slug}`}
                      className="flex justify-between items-center group p-3 hover:bg-blue-50 rounded-2xl transition-all border-b border-gray-50 last:border-0"
                    >
                      <span className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition-colors">
                        {sch.title}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .scholarship-content h4 {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e40af;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        .scholarship-content p {
          margin-bottom: 1rem;
        }
        .scholarship-content ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1rem;
        }
        .scholarship-content li {
          margin-bottom: 0.5rem;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  )
}
