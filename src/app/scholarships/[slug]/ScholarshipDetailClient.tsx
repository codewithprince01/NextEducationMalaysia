'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Info, Gift, Building2, FileEdit, CheckCircle, ChevronRight } from 'lucide-react'
import SideInquiryForm from '@/components/forms/SideInquiryForm'

type ScholarshipContent = {
  tab?: string | null
  description?: string | null
  position?: number | null
}

type OtherScholarship = {
  id: number
  title: string
  slug: string
}

type ScholarshipData = {
  title: string
  slug: string
  contents: ScholarshipContent[]
  otherScholarships: OtherScholarship[]
}

const iconMap: Record<string, ReactNode> = {
  Overview: <Info size={16} />,
  'Scholarship Opportunity': <Gift size={16} />,
  University: <Building2 size={16} />,
  'Application Process': <FileEdit size={16} />,
  Conclusion: <CheckCircle size={16} />,
}

function formatHTML(html: string): string {
  if (!html) return ''

  let decoded = html
  decoded = decoded.replace(/<span[^>]*>/gi, '')
  decoded = decoded.replace(/<\/span>/gi, '')
  decoded = decoded.replace(/style="[^"]*"/gi, '')
  decoded = decoded.replace(/&nbsp;/gi, ' ')
  decoded = decoded.replace(/<h[1-6][^>]*>.*?<\/h[1-6]>/gi, '')
  decoded = decoded.replace(/<strong>(.*?)<\/strong>/gi, '<h4 class="text-lg font-semibold mb-2 mt-4">$1</h4>')
  decoded = decoded.replace(/<b>(.*?)<\/b>/gi, '<h4 class="text-lg font-semibold mb-2 mt-4">$1</h4>')
  decoded = decoded.replace(/(?:\r\n|\r|\n)/g, '</p><p>')
  decoded = `<p>${decoded}</p>`
  decoded = decoded.replace(/<p><\/p>/g, '')
  return decoded
}

function buildTabs(contents: ScholarshipContent[]) {
  return contents.map((item) => {
    const tabName = (item.tab || '').trim()
    const lower = tabName.toLowerCase()
    let key = tabName

    if (lower.includes('program')) key = 'Scholarship Opportunity'
    if (lower.includes('overview')) key = 'Overview'
    if (lower.includes('university')) key = 'University'
    if (lower.includes('application')) key = 'Application Process'
    if (lower.includes('conclusion')) key = 'Conclusion'

    return { name: tabName, icon: iconMap[key] || <Info size={16} /> }
  })
}

function findContentByTab(contents: ScholarshipContent[], tabName: string) {
  return (
    contents.find((item) => {
      const tab = (item.tab || '').trim().toLowerCase()
      const name = tabName.toLowerCase()
      if (name === 'scholarship opportunity' && tab.includes('program')) return true
      if (name === 'overview' && tab.includes('overview')) return true
      if (name === 'university' && tab.includes('university')) return true
      if (name === 'application process' && tab.includes('application')) return true
      if (name === 'conclusion' && tab.includes('conclusion')) return true
      return tab === name
    }) || null
  )
}

export default function ScholarshipDetailClient({ data }: { data: ScholarshipData }) {
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const sortedContents = useMemo(
    () =>
      [...(data.contents || [])].sort((a, b) => {
        const posA = Number(a.position || 0)
        const posB = Number(b.position || 0)
        return posA - posB
      }),
    [data.contents],
  )

  const tabs = useMemo(() => buildTabs(sortedContents), [sortedContents])
  const [activeTab, setActiveTab] = useState(tabs[0]?.name || '')

  useEffect(() => {
    setActiveTab(tabs[0]?.name || '')
  }, [tabs])

  useEffect(() => {
    if (tabs.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const tabName = entry.target.getAttribute('data-tab-name')
            if (tabName) setActiveTab(tabName)
          }
        })
      },
      { root: null, rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    )

    tabs.forEach((tab) => {
      const element = sectionRefs.current[tab.name]
      if (element) observer.observe(element)
    })

    return () => observer.disconnect()
  }, [tabs])

  const handleTabClick = (tabName: string) => {
    const element = sectionRefs.current[tabName]
    if (!element) return
    const stickyOffset = 120
    const top = element.getBoundingClientRect().top + window.scrollY - stickyOffset
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' })
  }

  return (
    <section className="bg-linear-to-br from-blue-50 to-white px-4 py-10 md:px-10 lg:px-10">
      <div className="max-w-7xl mx-auto">
        <motion.h1
          className="text-2xl md:text-5xl font-bold text-center text-blue-800 mb-10"
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          {data.title}
        </motion.h1>

        <motion.div
          className="sticky top-[56px] z-50 w-full flex items-center gap-3 overflow-x-auto border-b border-gray-200 py-3 mb-8 no-scrollbar px-2 bg-white shadow-sm"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {tabs.map(({ name, icon }) => (
            <button
              key={name}
              onClick={() => handleTabClick(name)}
              className={`relative flex items-center gap-2 px-5 py-2 rounded-full whitespace-nowrap transition-all duration-300 text-sm md:text-base font-medium shadow-sm ${
                activeTab === name
                  ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300 shadow-md scale-[1.02]'
                  : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              <span className="text-lg">{icon}</span>
              {name}
            </button>
          ))}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-5">
          <div className="space-y-6">
            {tabs.map(({ name }, index) => {
              const contentObj = findContentByTab(sortedContents, name)

              return (
                <motion.div
                  key={name}
                  ref={(el) => {
                    sectionRefs.current[name] = el
                  }}
                  data-tab-name={name}
                  style={{ scrollMarginTop: '140px' }}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.1 }}
                  transition={{ duration: 0.4, delay: index * 0.06 }}
                >
                  <Section title={name}>
                    <div
                      className="formatted-content"
                      dangerouslySetInnerHTML={{
                        __html: formatHTML(contentObj?.description || ''),
                      }}
                    />
                  </Section>
                </motion.div>
              )
            })}
          </div>

          <div className="space-y-4">
            {Array.isArray(data.otherScholarships) && data.otherScholarships.length > 0 && (
              <div className="border rounded-lg px-4 pb-4 bg-white shadow-sm">
                <h2 className="text-lg font-bold mb-4">Other Scholarships</h2>
                <div className="space-y-3">
                  {data.otherScholarships.map((sch) => (
                    <div
                      key={sch.id}
                      className="flex justify-between items-center border-b last:border-b-0 pb-3 last:pb-0"
                    >
                      <Link
                        href={`/scholarships/${sch.slug}`}
                        className="flex-1 text-sm hover:text-blue-600 transition-colors"
                      >
                        {sch.title}
                      </Link>
                      <ChevronRight className="text-white bg-blue-500 rounded-full p-1 w-6 h-6 shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <SideInquiryForm title="Get In Touch" context={data.title} />
          </div>
        </div>
      </div>

      <style jsx global>{`
        .formatted-content p {
          margin-bottom: 0.75rem;
          color: #374151;
          line-height: 1.75;
        }
        .formatted-content ul {
          list-style-type: disc;
          padding-left: 1.25rem;
          margin-bottom: 0.75rem;
        }
        .formatted-content li {
          margin-bottom: 0.4rem;
          color: #374151;
        }
        .formatted-content a {
          color: #2563eb;
          text-decoration: underline;
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

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white border border-blue-100 shadow-md rounded-xl p-6">
      <h3 className="text-lg md:text-xl font-semibold text-blue-700 mb-4 flex items-center gap-2">{title}</h3>
      <div className="text-gray-700 leading-relaxed space-y-2">{children}</div>
    </div>
  )
}
