'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import PopularCourses from './PopularCourses'
import { storageUrl } from '@/lib/constants'
import { formatRichText } from '@/lib/richText'
import AuthModal from '@/components/modals/AuthModal'
import { CounsellingForm } from '@/components/modals/UniversityForms/CounsellingForm'

type Section = {
  id: number
  tab?: string | null
  description?: string | null
  position?: number | null
  thumbnail_path?: string | null
}

type Props = {
  overviews: Section[]
  universityName: string | null
  universitySlug: string | null
  universityId?: number | null
  universityLogo?: string | null
}

const POPULAR_COURSES_TOKENS = [
  'university popular courses',
  'malaysia popular courses',
  'top courses to study in malaysia',
]

const isPopularCoursesSection = (title?: string | null) => {
  if (!title) return false
  const normalized = title.toLowerCase().replace(/\s+/g, ' ').trim()
  return POPULAR_COURSES_TOKENS.some(token => normalized.includes(token))
}

const createSlug = (title: string) => {
  if (!title) return ''
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export default function UniversityOverview({
  overviews,
  universityName,
  universitySlug,
  universityId,
  universityLogo,
}: Props) {
  const router = useRouter()
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isCounsellingOpen, setIsCounsellingOpen] = useState(false)

  const validSections = useMemo(
    () =>
      overviews
        .filter(section => section.tab?.trim() !== '' && !isPopularCoursesSection(section.tab))
        .sort((a, b) => {
          const posA = Number(a.position || 0) > 0 ? Number(a.position) : 999999
          const posB = Number(b.position || 0) > 0 ? Number(b.position) : 999999
          if (posA !== posB) return posA - posB
          return Number(a.id || 0) - Number(b.id || 0)
        }),
    [overviews]
  )

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '')
      if (hash) {
        const timer = setTimeout(() => {
          const el = document.getElementById(hash)
          if (el) {
            const headerOffset = 150
            const elPosition = el.getBoundingClientRect().top
            const offsetPos = elPosition + window.scrollY - headerOffset
            window.scrollTo({
              top: Math.max(0, offsetPos),
              behavior: 'smooth'
            })
          }
        }, 150)
        return () => clearTimeout(timer)
      }
    }
  }, [])

  const scrollToSection = (index: number, sectionSlug: string) => {
    const element = document.getElementById(sectionSlug) || sectionRefs.current[index]
    if (element) {
      // Offset calculation for sticky header (navbar ~76px + sticky university tabs ~55px + 20px breathing room)
      const headerOffset = 150
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - headerOffset

      if (typeof window !== 'undefined') {
        try {
          window.history.replaceState(null, '', `#${sectionSlug}`)
        } catch {}

        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth'
        })
      }
    }
  }

  const handleApplyClick = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (token) {
      if (universitySlug) {
        router.push(`/university/${universitySlug}/courses`)
      } else {
        setIsCounsellingOpen(true)
      }
    } else {
      setIsAuthModalOpen(true)
    }
  }

  const handleEnquireClick = () => {
    setIsCounsellingOpen(true)
  }

  if (validSections.length === 0) {
    return (
      <div className="space-y-8">
        <div className="bg-white rounded-xl p-10 text-center border border-gray-100 shadow-sm">
          <div className="p-6 bg-gray-50 rounded-lg inline-block">
            <p className="text-gray-500 text-lg mb-2">No overview available</p>
            <p className="text-gray-400 text-sm">Content will be updated soon for {universityName}.</p>
          </div>
        </div>
        {universitySlug && <PopularCourses slug={universitySlug} />}
      </div>
    )
  }

  return (
    <div className="space-y-1 px-1 md:px-0 py-4 text-black bg-white">
      {validSections.length > 1 && (
        <div className="bg-[#f4f7fe] rounded-2xl p-4 sm:p-6 mb-8 border border-blue-100/50">
          <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3">
            <span className="w-1.5 h-8 bg-blue-600 rounded-full"></span>
            Table of Contents
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {validSections.map((section, index) => {
              const sectionSlug = createSlug(section.tab || '')
              return (
                <button
                  type="button"
                  key={section.id || index}
                  onClick={() => scrollToSection(index, sectionSlug)}
                  className="flex items-center gap-3 bg-white rounded-xl p-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group border border-gray-50 text-left w-full focus:outline-none"
                >
                  <span className="shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform shadow-md shadow-blue-600/10">
                    {index + 1}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-700 font-bold group-hover:text-blue-700 transition-colors line-clamp-1">
                    {section.tab}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Action Buttons: Apply Here & Enquire Now */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 max-w-2xl mx-auto">
        <button
          type="button"
          onClick={handleApplyClick}
          className="w-full sm:w-auto px-10 py-3.5 bg-blue-600 text-white border-2 border-blue-600 rounded-full font-black hover:bg-blue-700 transition-all duration-300 shadow-lg shadow-blue-500/20 active:scale-95 text-sm uppercase tracking-wider cursor-pointer"
        >
          APPLY HERE
        </button>
        <button
          type="button"
          onClick={handleEnquireClick}
          className="w-full sm:w-auto px-10 py-3.5 bg-white text-blue-600 border-2 border-blue-600 rounded-full font-black hover:bg-blue-50 transition-all duration-300 shadow-lg shadow-blue-500/5 active:scale-95 text-sm uppercase tracking-wider cursor-pointer"
        >
          ENQUIRE NOW
        </button>
      </div>

      <div className="space-y-12">
        {validSections.map((section, index) => {
          const sectionSlug = createSlug(section.tab || '')
          return (
            <div
              key={section.id || index}
              id={sectionSlug}
              ref={el => { sectionRefs.current[index] = el }}
              className="space-y-6 scroll-mt-40"
            >
              <div className="border-l-4 border-blue-600 pl-4">
                <h2 className="text-2xl font-bold text-blue-900">{section.tab}</h2>
              </div>

              {section.thumbnail_path && !section.thumbnail_path.includes('default') && (
                <div className="w-full overflow-hidden rounded-xl shadow-lg aspect-video max-h-[400px] bg-gray-100">
                  <img
                    src={storageUrl(section.thumbnail_path) || ''}
                    alt={section.tab || 'Section image'}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              )}

              {section.description && (
                <div
                  className="cms-content max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatRichText(section.description) }}
                />
              )}
            </div>
          )
        })}
      </div>

      {universitySlug && <PopularCourses slug={universitySlug} />}

      {/* Application Form Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        courseId={null}
        courseData={{
          university_name: universityName,
          universitySlug: universitySlug,
          university: { id: universityId, name: universityName, uname: universitySlug },
        }}
      />

      {/* Enquiry / Counselling Form Modal */}
      <CounsellingForm
        universityId={universityId}
        universityName={universityName}
        universityLogo={universityLogo}
        isOpen={isCounsellingOpen}
        onClose={() => setIsCounsellingOpen(false)}
      />
    </div>
  )
}
