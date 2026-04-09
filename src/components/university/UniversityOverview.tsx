'use client'

import { useMemo, useRef } from 'react'
import PopularCourses from './PopularCourses'
import { storageUrl } from '@/lib/constants'

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

/* ============================================================
    FINAL CLEAN HTML FORMATTER (NO BLANK SPACE + FIXED TABLES)
   ============================================================ */
const formatHTML = (html: string) => {
  if (!html) return ''

  let decoded = html

  decoded = decoded.replace(/^<p[^>]*>.*?About.*?<\/p>/i, '')
  decoded = decoded.replace(/<span[^>]*>/gi, '')
  decoded = decoded.replace(/<\/span>/gi, '')
  decoded = decoded.replace(/style="[^"]*"/gi, '')
  decoded = decoded.replace(/&nbsp;/gi, ' ')

  decoded = decoded.replace(
    /<p>\s*<(strong|b)>([^<]{5,})<\/\1>\s*<\/p>/gi,
    '<h3 class="text-lg font-bold text-gray-900 mb-3 mt-6">$2</h3>'
  )

  decoded = decoded.replace(/<(strong|b)>/gi, '<span class="font-semibold text-gray-900">')
  decoded = decoded.replace(/<\/(strong|b)>/gi, '</span>')

  decoded = decoded.replace(/<p>/gi, '<p class="text-sm text-gray-700 leading-relaxed mb-4">')
  decoded = decoded.replace(/<p[^>]*>\s*<\/p>/gi, '')

  decoded = decoded.replace(/<table[^>]*>/gi,
    `<div class="responsive-table-wrapper overflow-x-auto my-6" style="display:block;width:100%;overflow-x:auto;-webkit-overflow-scrolling:touch;">
      <table class="border-collapse text-sm" style="width:max-content;min-width:100%;">`)
  decoded = decoded.replace(/<\/table>/gi, '</table></div>')

  decoded = decoded.replace(/<thead[^>]*>/gi, `<thead class="bg-blue-600 text-white">`)
  decoded = decoded.replace(/<tr[^>]*>(\s*<th[\s\S]*?<\/tr>)/i, `<tr class="bg-blue-600 text-white">$1`)
  decoded = decoded.replace(/<tbody[^>]*>/gi, `<tbody class="text-gray-800">`)
  decoded = decoded.replace(/<th[^>]*>/gi, `<th class="px-4 py-3 border-b border-gray-200 text-left font-semibold whitespace-nowrap">`)
  decoded = decoded.replace(/<tr[^>]*>/gi, `<tr class="even:bg-blue-50">`)
  decoded = decoded.replace(/<td[^>]*>/gi, `<td class="px-4 py-3 border-b border-gray-100">`)

  decoded = decoded.replace(/<input[^>]*type=["']checkbox["'][^>]*>/gi,
    `<span class="inline-block w-4 h-4 rounded border border-gray-400 mr-2 bg-white"></span>`)

  decoded = decoded.replace(/<ul>/gi, '<ul class="list-disc pl-6 space-y-2 text-gray-800 mb-4">')
  decoded = decoded.replace(/<ol>/gi, '<ol class="list-decimal pl-6 space-y-2 text-gray-800 mb-4">')
  decoded = decoded.replace(/<li>/gi, '<li class="mb-1 text-sm">')

  return decoded
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

export default function UniversityOverview({ overviews, universityName, universitySlug }: Props) {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([])

  const validSections = useMemo(
    () => overviews.filter(section => section.tab?.trim() !== '' && !isPopularCoursesSection(section.tab)),
    [overviews]
  )

  const scrollToSection = (index: number, sectionSlug: string) => {
    const element = sectionRefs.current[index]
    if (element) {
      window.history.pushState(null, '', `#${sectionSlug}`)
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
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
                <div
                  key={section.id}
                  onClick={() => scrollToSection(index, sectionSlug)}
                  className="flex items-center gap-3 bg-white rounded-xl p-3 cursor-pointer hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group border border-gray-50"
                >
                  <span className="shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform shadow-md shadow-blue-600/10">
                    {index + 1}
                  </span>
                  <span className="text-xs sm:text-sm text-gray-700 font-bold group-hover:text-blue-700 transition-colors line-clamp-1">
                    {section.tab}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 max-w-2xl mx-auto">
        <button className="w-full sm:w-auto px-10 py-3.5 bg-white text-blue-600 border-2 border-blue-600 rounded-full font-black hover:bg-blue-50 transition-all duration-300 shadow-lg shadow-blue-500/5 active:scale-95 text-sm uppercase tracking-wider cursor-pointer">
          APPLY HERE
        </button>
        <button className="w-full sm:w-auto px-10 py-3.5 bg-white text-blue-600 border-2 border-blue-600 rounded-full font-black hover:bg-blue-50 transition-all duration-300 shadow-lg shadow-blue-500/5 active:scale-95 text-sm uppercase tracking-wider cursor-pointer">
          ENQUIRE NOW
        </button>
      </div>

      <div className="space-y-12">
        {validSections.map((section, index) => {
          const sectionSlug = createSlug(section.tab || '')
          return (
            <div
              key={section.id}
              id={sectionSlug}
              ref={el => { sectionRefs.current[index] = el }}
              className="space-y-6 scroll-mt-24"
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
                  className="prose prose-blue max-w-none text-gray-700 leading-relaxed [&_a]:text-blue-600 hover:[&_a]:underline font-normal"
                  dangerouslySetInnerHTML={{ __html: formatHTML(section.description) }}
                />
              )}
            </div>
          )
        })}
      </div>

      {universitySlug && <PopularCourses slug={universitySlug} />}
    </div>
  )
}
