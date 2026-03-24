'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import { 
  CheckCircle, 
  ChevronDown, 
  ChevronUp,
} from 'lucide-react'

const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://admin.educationmalaysia.in'
const COURSE_PLACEHOLDER = '/course-placeholder.svg'

function resolveCategoryImage(path?: string | null) {
  const raw = String(path || '').trim()
  if (!raw) return COURSE_PLACEHOLDER

  if (/^https?:\/\//i.test(raw)) return raw
  if (raw.startsWith('/storage/')) return `${IMAGE_BASE}${raw}`
  if (raw.startsWith('storage/')) return `${IMAGE_BASE}/${raw}`
  return `${IMAGE_BASE}/storage/${raw.replace(/^\/+/, '')}`
}

interface QualificationLevelClientProps {
  slug: string
}

export default function QualificationLevelClient({ slug }: QualificationLevelClientProps) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAllCategories, setShowAllCategories] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/courses/level/${slug}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed to fetch')
        const json = await res.json()
        setData(json.data || json)
      } catch (error) {
        console.error('Error fetching level detail:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (loading) {
    return (
      <div className="bg-gray-100 min-h-screen py-10 px-4 animate-pulse">
        <div className="max-w-6xl mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm mb-10">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-100 rounded w-1/4" />
            </div>
          </div>
          <div className="h-8 bg-gray-200 rounded w-2/3 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-100 rounded w-full" />
            <div className="h-4 bg-gray-100 rounded w-5/6" />
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  const pageContent = data.pageContent || data.content
  const categories = data.categories || []
  
  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Courses', href: '/courses' },
    { label: pageContent?.heading || slug },
  ]

  const visibleCategories = isMobile && !showAllCategories ? categories.slice(0, 4) : categories

  return (
    <div className="bg-gray-100 min-h-screen">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto p-6 bg-white border border-gray-200 rounded-lg shadow-sm mb-10">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <CheckCircle className="w-5 h-5 text-green-500 absolute -top-1 -right-1 bg-white rounded-full" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900 mb-1 font-sans">
                {pageContent?.author?.name || "Team Education Malaysia"}
              </h2>
              <p className="text-sm text-gray-600 font-sans">
                Updated on - {pageContent?.updated_at ? new Date(pageContent.updated_at).toLocaleDateString("en-MY", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }) : "Jan 2026"}
              </p>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4 font-sans">
            {pageContent?.heading}
          </h1>

          {/* Content */}
          <div
            className={`transition-all duration-300 text-[15px] leading-relaxed relative font-sans ${
              isExpanded ? "max-h-full" : "max-h-[300px] overflow-hidden"
            }`}
          >
            <div
              className="prose prose-blue max-w-none text-gray-800"
              dangerouslySetInnerHTML={{ __html: pageContent?.description || "" }}
            />
            {!isExpanded && (
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-linear-to-t from-white to-transparent pointer-events-none"></div>
            )}
          </div>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 font-sans"
          >
            <span>{isExpanded ? "Show Less" : "Show More"}</span>
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Categories List */}
        <div className="space-y-6 max-w-5xl mx-auto">
          {categories.length === 0 ? (
            <p className="text-center text-gray-500 font-sans">No categories found.</p>
          ) : (
            <>
              {visibleCategories.map((card: any) => (
                <Link
                  key={card.id}
                  href={`/course/${card.slug}`}
                  className="bg-white block w-full transition-all rounded-lg overflow-hidden shadow-md border border-gray-200 hover:shadow-lg hover:border-blue-500"
                >
                  <div className="md:flex">
                    <img
                      src={resolveCategoryImage(card.thumbnail_path)}
                      alt={card.name}
                      onError={(e) => {
                        const target = e.currentTarget
                        if (target.src !== COURSE_PLACEHOLDER) target.src = COURSE_PLACEHOLDER
                      }}
                      className="w-full md:w-1/3 object-cover h-64 md:h-72"
                    />
                    <div className="p-6 flex flex-col justify-center flex-1">
                      <h3 className="text-xl font-semibold text-blue-700 mb-2 font-sans">
                        {card.name}
                      </h3>
                      <p className="text-gray-700 mb-3 text-sm leading-relaxed font-sans">
                        {card.shortnote || "No description available."}
                      </p>

                      {card.specializations?.length > 0 && (
                        <div className="mt-3">
                          <h4 className="text-sm font-semibold text-gray-800 mb-2 font-sans">
                            Specializations:
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {card.specializations.slice(0, 10).map((spec: any) => (
                              <span
                                key={spec.id}
                                className="text-sm px-3 py-1 rounded-full border border-gray-300 text-gray-800 hover:bg-blue-50 hover:text-blue-600 transition font-sans"
                              >
                                {spec.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}

              {isMobile && categories.length > 4 && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <span>{showAllCategories ? "Show Less" : `Show More (${categories.length - 4} more)`}</span>
                    {showAllCategories ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
