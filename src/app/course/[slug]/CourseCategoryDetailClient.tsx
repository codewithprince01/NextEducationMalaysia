"use client"

import React, { useState, useEffect, useMemo } from 'react'
import Breadcrumb from '@/components/Breadcrumb'
import { 
  Home, 
  Clock, 
  DollarSign, 
  GraduationCap, 
  Briefcase, 
  FileText, 
  ChevronDown 
} from 'lucide-react'
import TrendingCourses from '@/components/common/TrendingCourses'
import SideInquiryForm from '@/components/forms/SideInquiryForm'
import FeaturedUniversities from '@/components/common/FeaturedUniversities'

const API_BASE = process.env.NEXT_PUBLIC_API_URL

const ICON_MAP: Record<string, React.ReactNode> = {
  "About Course": <Home size={18} />,
  "Course Duration": <Clock size={18} />,
  "Cost": <DollarSign size={18} />,
  "Universities": <GraduationCap size={18} />,
  "Career": <Briefcase size={18} />,
}

interface PageProps {
  slug: string
}

export default function CourseCategoryDetailClient({ slug }: PageProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("")
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${API_BASE}/course-category/${slug}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const json = await res.json()
        setData(json.data || json)
      } catch (error) {
        console.error('Error fetching course category:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  const { categoryData, tabs, contentMap, faqs } = useMemo(() => {
    const cat = data?.category || data?.data?.category || data?.data || {}
    const contents = cat.contents || []
    const fFaqs = cat.faqs || []
    
    const newTabs = contents.map((section: any) => section.tab)
    if (fFaqs.length > 0) newTabs.push("FAQs")

    const newContentMap = contents.reduce((acc: any, section: any) => {
      acc[section.tab] = section.description
      return acc
    }, {})

    return { 
      categoryData: cat, 
      tabs: newTabs as string[], 
      contentMap: newContentMap, 
      faqs: fFaqs 
    }
  }, [data])

  useEffect(() => {
    if (tabs.length > 0 && !activeTab) {
      setActiveTab(tabs[0])
    }
  }, [tabs, activeTab])

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName)
    const elementId = tabName === "FAQs" ? "faqs" : tabName.replace(/\s+/g, "-").toLowerCase()
    const element = document.getElementById(elementId)
    if (element) {
      const offset = 100
      const bodyRect = document.body.getBoundingClientRect().top
      const elementRect = element.getBoundingClientRect().top
      const elementPosition = elementRect - bodyRect
      const offsetPosition = elementPosition - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      })
    }
  }

  if (loading) return (
    <div className="bg-gray-50 min-h-screen py-10 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 flex gap-10">
            <div className="flex-1 space-y-10">
                <div className="h-12 bg-white rounded-xl shadow-sm" />
                <div className="h-96 bg-white rounded-2xl shadow-sm" />
            </div>
            <div className="hidden md:block w-[350px] space-y-8">
                <div className="h-64 bg-white rounded-2xl shadow-sm" />
                <div className="h-[600px] bg-white rounded-2xl shadow-sm" />
            </div>
        </div>
    </div>
  )

  const pageName = categoryData?.name || slug
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '/courses' },
    { label: categoryData.level_name || 'Listing', href: `/courses/${slug}` },
    { label: pageName },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={breadcrumbItems} />
      
      <section className="bg-linear-to-br from-blue-50 via-white to-blue-100 px-3 py-10 md:px-8 lg:px-8 min-h-screen">
        <div className="max-w-7xl mx-auto">
          {/* Sticky Tabs */}
          <div className="sticky top-[80px] z-30 mb-8 hidden md:block">
            <div className="bg-white/80 backdrop-blur-md p-2 shadow-lg rounded-2xl border border-white/20 overflow-x-auto ring-1 ring-black/5">
              <div className="flex flex-nowrap gap-1 min-w-max p-1">
                {tabs.map((tabName) => {
                  const isActive = activeTab === tabName
                  return (
                    <button
                      key={tabName}
                      onClick={() => handleTabClick(tabName)}
                      className={`
                        relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                        ${isActive 
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                          : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                        }
                      `}
                    >
                      <span className={isActive ? "text-white" : "text-blue-500"}>
                        {ICON_MAP[tabName] || <FileText size={18} />}
                      </span>
                      {tabName}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-6 md:gap-10">
            {/* Main Content */}
            <div className="space-y-8">
              {tabs.map((tabName) => {
                if (tabName === "FAQs") {
                  return (
                    <div
                      key="FAQs"
                      id="faqs"
                      className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-md scroll-mt-32"
                    >
                      <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                        <span className="w-1 h-8 bg-blue-500 rounded-full"></span>
                        Frequently Asked Questions (FAQs)
                      </h3>
                      <div className="space-y-4">
                        {faqs.map((faq: any, idx: number) => (
                          <div key={idx} className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                            <button
                              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                              className="flex justify-between items-center w-full text-left py-2 group"
                            >
                              <span className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                                {faq.question}
                              </span>
                              <ChevronDown className={`w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-all ${openFaq === idx ? 'rotate-180' : ''}`} />
                            </button>
                            {openFaq === idx && (
                              <div 
                                className="mt-4 text-gray-600 leading-relaxed text-[15px] prose max-w-none"
                                dangerouslySetInnerHTML={{ __html: faq.answer }}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }

                return (
                  <div
                    key={tabName}
                    id={tabName.replace(/\s+/g, "-").toLowerCase()}
                    className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-md scroll-mt-32"
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 font-sans">
                      <span className="bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {tabName}
                      </span>
                    </h3>
                    <div
                      className="prose prose-blue max-w-none text-gray-800 text-[15px] leading-relaxed [&_a]:text-blue-600 [&_a]:font-bold [&_a:hover]:underline"
                      dangerouslySetInnerHTML={{ __html: contentMap[tabName] || "" }}
                    />
                  </div>
                )
              })}
            </div>

            {/* Sidebar */}
            <aside className="hidden md:block space-y-8 sticky top-24 h-fit">
              <TrendingCourses />
              <SideInquiryForm />
              <FeaturedUniversities variant="sidebar" />
            </aside>
          </div>
        </div>
      </section>
    </div>
  )
}
