'use client'

import { useState, useEffect, useCallback, useMemo, useRef, useTransition } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Breadcrumb from '@/components/Breadcrumb'
import {
  Filter, ChevronDown, ChevronUp, X, Search, ArrowUpDown,
  List, LayoutGrid, MapPin, Building, Star, BookOpen, Globe, Home, Layers,
  ChevronLeft, ChevronRight,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Pagination from '@/components/common/Pagination'
import { toast } from 'react-toastify'

const AuthModal = dynamic(() => import('@/components/modals/AuthModal'))
const PopupForm = dynamic(() => import('@/components/modals/PopupForm'))
const CourseCompareBar = dynamic(() => import('./CourseCompareBar'))
const CourseComparisonModal = dynamic(() => import('./CourseComparisonModal'))

const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''
const PER_PAGE = 10

// ── Session cache ────────────────────────────────────────────────────────────
const CACHE_TTL = 5 * 60 * 1000
const cache = {
  get(key: string) {
    try {
      const raw = sessionStorage.getItem(`courses_${key}`)
      if (!raw) return null
      const { data, ts } = JSON.parse(raw)
      if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem(`courses_${key}`); return null }
      return data
    } catch { return null }
  },
  set(key: string, data: unknown) {
    try { sessionStorage.setItem(`courses_${key}`, JSON.stringify({ data, ts: Date.now() })) } catch { /* ignore */ }
  },
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden animate-pulse mb-4 w-full">
      <div className="px-4 py-3 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 bg-gray-200 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="grid grid-cols-4 gap-2">
          {[1,2,3,4].map(i => <div key={i} className="h-14 bg-gray-100 rounded" />)}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1,2,3].map(i => <div key={i} className="h-9 bg-gray-200 rounded-lg" />)}
        </div>
      </div>
    </div>
  )
}

function FilterPanelSkeleton() {
  return (
    <div className="hidden lg:block w-[280px] min-w-[280px] shrink-0 bg-white border border-blue-100 p-6 rounded-2xl shadow-xl space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-1/2" />
      {[1,2,3,4].map(i => (
        <div key={i} className="bg-gray-100 rounded-xl border border-gray-200 p-3 h-12" />
      ))}
    </div>
  )
}

function CourseCard({ 
  course, 
  viewMode,
  appliedCourses,
  onApplyNow,
  onViewDetail,
  onCompareUniversity,
  onUniversityClick,
}: { 
  course: any; 
  viewMode: 'list' | 'grid';
  appliedCourses: Set<number>;
  onApplyNow: (c: any) => void;
  onViewDetail: (c: any) => void;
  onCompareUniversity: (c: any) => void;
  onUniversityClick: (u: any) => void;
}) {
  const accreditations: string[] = Array.isArray(course.accreditations)
    ? course.accreditations
    : typeof course.accreditations === 'string'
      ? course.accreditations.split(',').map((s: string) => s.replace(/[\\"\[\]]/g, '').trim()).filter(Boolean)
      : []
  const courseDisplayName = String(course.course_name || '')
    .split(' ')
    .filter(Boolean)
    .map((word: string) => {
      if (word === word.toUpperCase()) return word
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    })
    .join(' ')

  const uniSlug = course.university?.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || ''

    return (
    <div
      className={`bg-white rounded-xl shadow-md border border-blue-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-blue-300 group relative ${
        viewMode === "grid" ? "flex flex-col h-full" : "mb-4 w-full"
      }`}
    >
      <div className="px-4 sm:px-5 py-2.5 sm:py-3">
        {/* University Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-2.5 mb-2.5">
          <div className="flex items-center gap-4 w-full">
            {/* Logo */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-white rounded-lg flex items-center justify-center flex-shrink-0 border border-gray-200 shadow-sm overflow-hidden">
              {course.university?.logo_path ? (
                <img
                  src={`${IMAGE_BASE}/storage/${course.university.logo_path}`}
                  alt={course.university?.name || 'University'}
                  className="w-full h-full object-contain p-1"
                  loading="lazy"
                  width={56}
                  height={56}
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-400">Logo</div>
              )}
            </div>

            {/* University Info */}
            <div className="flex-1 min-w-0">
              <h3
                onClick={() => onUniversityClick(course.university)}
                className="text-lg sm:text-xl font-bold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors truncate leading-tight"
              >
                {course.university?.name}
              </h3>

              <div className="flex items-center text-gray-600 text-sm mt-0.5">
                <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                <span className="truncate">
                  {course.university?.city}, {course.university?.state}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-sm text-gray-600 mt-0.5">
                <div className="flex items-center">
                  <Building className="w-3.5 h-3.5 mr-0.5" />
                  <span>{course.university?.inst_type || "Private"}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-3.5 h-3.5 mr-0.5" />
                  <span>{course.university?.programs_count} Courses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rating & Badges */}
          <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto sm:flex-shrink-0">
            <div className="flex gap-1.5">
              {Number(course.is_local) === 1 && (
                <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                  <Home className="w-3 h-3 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">
                    Local
                  </span>
                </div>
              )}
              {Number(course.is_international) === 1 && (
                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-200">
                  <Globe className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">
                    Int&apos;l
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-0.5 bg-linear-to-br from-amber-50 to-yellow-50 px-2 py-1 rounded border border-amber-200">
              <span className="text-sm font-bold text-gray-900">
                {course.university?.rating || "N/A"}
              </span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
          </div>
        </div>

        {/* Course Title + Specs */}
        <div className="border-t border-gray-200 pt-3 mb-2.5">
          <h4
            onClick={() => onViewDetail(course)}
            className="text-lg sm:text-xl font-semibold text-blue-600 mb-2 hover:text-blue-700 cursor-pointer transition-colors line-clamp-2 leading-tight block"
          >
            {courseDisplayName}
          </h4>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mb-2.5">
            {[
              { label: 'Mode', value: course.study_mode },
              { label: 'Duration', value: course.duration },
              { label: 'Intakes', value: course.intake },
              { label: 'Tuition Fee', value: course.fee, },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded p-2 border border-gray-200 flex flex-col justify-center min-h-[58px]">
                <p className="text-xs text-gray-500 mb-0.5 font-semibold uppercase">{label}</p>
                <p className="text-sm sm:text-[15px] font-semibold text-gray-900 line-clamp-1">{value || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Accreditation Badges */}
        {accreditations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2.5">
            {accreditations.map((acc, i) => (
              <span key={i} className="bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-green-300 whitespace-nowrap">
                {acc}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5 w-full">
          <button
            onClick={() => onViewDetail(course)}
            className="cursor-pointer bg-white text-gray-800 font-bold py-2.5 px-2 rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md text-xs sm:text-sm"
          >
            View Detail
          </button>
          <button
            onClick={() => !appliedCourses.has(course.id) && onApplyNow(course)}
            className={`font-bold py-2.5 px-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-xs sm:text-sm ${
              appliedCourses.has(course.id)
                ? "bg-green-600 text-white cursor-not-allowed hover:transform-none hover:shadow-md"
                : "bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800"
            }`}
            disabled={appliedCourses.has(course.id)}
          >
            {appliedCourses.has(course.id) ? "Applied" : "Apply Now"}
          </button>
          <button
            onClick={() => onCompareUniversity(course)}
            className="cursor-pointer font-bold py-2.5 px-2 rounded-lg border-2 transition-all duration-200 shadow-sm hover:shadow-md bg-white text-blue-600 border-blue-300 hover:border-blue-400 hover:bg-blue-50 text-xs sm:text-sm"
          >
            Compare University
          </button>
        </div>
      </div>
    </div>
  )
}

// ── FilterPanel Desktop ───────────────────────────────────────────────────────
function DesktopFilterPanel({ loading, filters, selectedFilters, openFilters, activeFilterCount, specializationSearch, onToggleFilter, onFilterChange, onReset, onSpecializationSearch }: any) {
  if (loading) return <FilterPanelSkeleton />
  return (
    <div className="hidden lg:block w-[280px] min-w-[280px] shrink-0 bg-linear-to-br from-white to-blue-50/30 border border-blue-100 p-6 rounded-2xl shadow-xl space-y-5 text-base sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide">
      <div className="pb-4 border-b-2 border-blue-100">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="bg-linear-to-br from-blue-600 to-blue-700 p-1.5 rounded-lg shadow-sm">
            <Filter className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center w-5 h-5 text-[11px] font-semibold bg-blue-600 text-white rounded-full">{activeFilterCount}</span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <div className="flex justify-end">
            <button onClick={onReset} className="text-md text-red-600 hover:text-red-700 font-bold transition-all hover:underline cursor-pointer">Clear All</button>
          </div>
        )}
      </div>
      <div className="space-y-3">
        {Object.entries(filters).map(([key, items]: [string, any]) => (
          <div key={key} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all">
            <button onClick={() => onToggleFilter(key)} className="w-full flex items-center justify-between p-3 text-left hover:bg-linear-to-r hover:from-blue-50 hover:to-transparent transition-all">
              <span className="font-bold text-gray-900 capitalize flex items-center gap-2">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                {selectedFilters[key]?.length > 0 && (
                  <span className="bg-linear-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">{selectedFilters[key].length}</span>
                )}
              </span>
              <div className={`transition-transform duration-200 ${openFilters[key] ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5 text-blue-600" />
              </div>
            </button>
            {openFilters[key] && (
              <div className="px-3 pb-3 space-y-1.5 max-h-56 overflow-y-auto bg-linear-to-b from-gray-50/50 to-white">
                {key === 'specializations' && (
                  <div className="sticky top-0 bg-white z-10 pb-2 mb-2 border-b border-gray-200">
                    <input type="text" placeholder="Search specializations..." value={specializationSearch} onChange={e => onSpecializationSearch(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                )}
                {(Array.isArray(items) ? items : []).filter((item: any) => {
                  if (key !== 'specializations' || !specializationSearch) return true
                  return (item.label || item.name || item.slug || '').toLowerCase().includes(specializationSearch.toLowerCase())
                }).map((item: any) => {
                  const value = item.value || item.slug || item.name || item.month || item.study_mode || item
                  const displayRaw = item.label || item.name || item.slug || item.month || item.study_mode || item
                  const display = formatFilterDisplayLabel(key, displayRaw)
                  const normalizedValue = normalizeFilterValue(key, value)
                  const isChecked = selectedFilters[key]?.includes(normalizedValue) || false
                  const isSingleSelect = SINGLE_SELECT_FILTERS.includes(key)
                  return (
                    <label key={item.id || value} className={`flex items-center gap-3 py-2 px-3 cursor-pointer rounded-lg transition-all group ${isChecked ? 'bg-linear-to-r from-blue-100 to-blue-50 border border-blue-200 shadow-sm' : 'hover:bg-blue-50/50 border border-transparent'}`}>
                      <input 
                        type={isSingleSelect ? "radio" : "checkbox"} 
                        name={`course-${key}-desktop`} 
                        className="w-4 h-4 text-blue-600 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 shrink-0 cursor-pointer rounded-full" 
                        checked={isChecked} 
                        onChange={() => onFilterChange(key, normalizedValue, item.id)} 
                      />
                      <span className={`text-sm font-medium text-left transition-colors ${isChecked ? 'text-blue-900 font-semibold' : 'text-gray-700 group-hover:text-blue-700'}`}>{display}</span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── FilterDrawer Mobile ───────────────────────────────────────────────────────
function MobileFilterDrawer({ filters, selectedFilters, openFilters, activeFilterCount, specializationSearch, onToggleFilter, onFilterChange, onReset, onClose, onSpecializationSearch }: any) {
  return (
    <div className="fixed inset-0 z-50 flex backdrop-blur-[5px]">
      <div className="w-4/5 max-w-xs bg-white p-5 rounded-r-xl shadow-xl h-full overflow-y-auto space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Filters</h2>
            {activeFilterCount > 0 && <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">{activeFilterCount}</span>}
          </div>
          <button className="text-2xl font-bold text-gray-600 hover:text-gray-900" onClick={onClose}>×</button>
        </div>
        {activeFilterCount > 0 && (
          <button onClick={() => { onReset(); onClose() }} className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline">Clear All Filters</button>
        )}
        <div className="space-y-2">
          {Object.entries(filters).map(([key, items]: [string, any]) => (
            <div key={key} className="border-b border-gray-100 last:border-0 pb-2">
              <button onClick={() => onToggleFilter(key)} className="w-full flex items-center justify-between py-2 text-left hover:bg-gray-50 rounded-lg px-2">
                <span className="font-semibold text-gray-900 capitalize flex items-center gap-2">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                  {selectedFilters[key].length > 0 && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">{selectedFilters[key].length}</span>}
                </span>
                {openFilters[key] ? <ChevronUp className="w-5 h-5 text-gray-600" /> : <ChevronDown className="w-5 h-5 text-gray-600" />}
              </button>
              {openFilters[key] && (
                <div className="mt-2 space-y-2 pl-2 max-h-56 overflow-y-auto">
                  {key === 'specializations' && (
                    <div className="sticky top-0 bg-white z-10 pb-2 mb-2 border-b border-gray-200 pr-2">
                      <input type="text" placeholder="Search specializations..." value={specializationSearch} onChange={e => onSpecializationSearch(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                  )}
                  {(items as any[]).filter((item: any) => {
                    if (key !== 'specializations' || !specializationSearch) return true
                    return (item.label || item.name || item.slug || '').toLowerCase().includes(specializationSearch.toLowerCase())
                  }).map((item: any) => {
                    const value = item.value || item.slug || item.name || item.month || item.study_mode || item
                    const displayRaw = item.label || item.name || item.slug || item.month || item.study_mode || item
                    const display = formatFilterDisplayLabel(key, displayRaw)
                    const normalizedValue = normalizeFilterValue(key, value)
                    const isSingleSelect = SINGLE_SELECT_FILTERS.includes(key)
                    return (
                      <label key={item.id || value} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-blue-50 rounded-lg pl-0 pr-2 transition-all group">
                        <input 
                          type={isSingleSelect ? "radio" : "checkbox"} 
                          name={`course-${key}-mobile`} 
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 shrink-0 rounded-full" 
                          checked={selectedFilters[key].includes(normalizedValue)} 
                          onChange={() => onFilterChange(key, normalizedValue, item.id)} 
                        />
                        <span className="text-gray-700 text-sm font-medium group-hover:text-blue-700 text-left">{display}</span>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1" onClick={onClose} />
    </div>
  )
}

// ── Pagination ────────────────────────────────────────────────────────────────
function CoursePagination({ currentPage, lastPage, onPageChange }: { currentPage: number; lastPage: number; onPageChange: (p: number) => void }) {
  if (lastPage <= 1) return null
  const pages: number[] = []
  for (let i = 1; i <= lastPage; i++) {
    if (i === 1 || i === lastPage || (i >= currentPage - 1 && i <= currentPage + 1)) pages.push(i)
  }
  const unique = [...new Set(pages)].sort((a, b) => a - b)
  return (
    <div className="flex justify-center items-center gap-2 mt-8 flex-wrap">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:border-gray-400 shadow-sm'}`}>
        <ChevronLeft size={20} />
      </button>
      {unique.map((p, i) => {
        const prev = unique[i - 1]
        return (
          <span key={p} className="flex items-center gap-2">
            {prev && p - prev > 1 && <span className="text-gray-400 font-bold px-1">•••</span>}
            <button onClick={() => onPageChange(p)} className={`w-10 h-10 rounded-full font-bold text-sm transition-all ${currentPage === p ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:border-gray-400'}`}>{p}</button>
          </span>
        )
      })}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === lastPage} className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${currentPage === lastPage ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 hover:border-gray-400 shadow-sm'}`}>
        <ChevronRight size={20} />
      </button>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
interface CoursesListClientProps {
  initialLevel?: string | string[]
  initialCategory?: string | string[]
  initialSpecialization?: string | string[]
  initialStudyMode?: string | string[]
  initialIntake?: string | string[]
  initialSearch?: string | string[]
  initialYear?: number
  initialFilterType?: string
  initialFilterValue?: string
  initialFilterData?: any
  initialCoursesData?: any
}

type FilterState = Record<string, string[]>

const EMPTY_FILTERS: FilterState = { levels: [], categories: [], specializations: [], intakes: [], study_modes: [] }

const SINGLE_SELECT_FILTERS = ['levels', 'categories', 'specializations']

const normalizeFilterValue = (key: string, value: any) => {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  if (key === 'intakes' || key === 'study_modes') return raw
  return raw.toLowerCase().replace(/\s+/g, '-')
}

const LEVEL_LABEL_OVERRIDES: Record<string, string> = {
  diploma: 'Diploma',
  'under-graduate': 'Under-Graduate',
  'post-graduate': 'Post-Graduate',
  'post-graduate-diploma': 'Post-Graduate-Diploma',
}

const formatFilterDisplayLabel = (key: string, value: any) => {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  if (key !== 'levels') return raw
  const normalized = raw.toLowerCase().replace(/\s+/g, '-')
  if (LEVEL_LABEL_OVERRIDES[normalized]) return LEVEL_LABEL_OVERRIDES[normalized]
  return normalized
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-')
}

export default function CoursesListClient({ 
  initialLevel, 
  initialCategory,
  initialSpecialization,
  initialStudyMode,
  initialIntake,
  initialSearch,
  initialYear,
  initialFilterType,
  initialFilterValue,
  initialFilterData,
  initialCoursesData
}: CoursesListClientProps) {
  const renderYear = initialYear || 2026
  const [courses, setCourses] = useState<any[]>(initialCoursesData?.data || initialCoursesData?.courses?.data || [])
  const [filterData, setFilterData] = useState<any>(initialFilterData || {})
  const [filterLoading, setFilterLoading] = useState(!initialFilterData)
  const [loading, setLoading] = useState(!initialCoursesData)
  const [currentPage, setCurrentPage] = useState(initialCoursesData?.pagination?.current_page || initialCoursesData?.courses?.current_page || 1)
  const [lastPage, setLastPage] = useState(initialCoursesData?.pagination?.last_page || initialCoursesData?.courses?.last_page || 1)
  const [totalCourses, setTotalCourses] = useState(initialCoursesData?.pagination?.total || initialCoursesData?.courses?.total || 0)
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(EMPTY_FILTERS)
  const [lastSelectedFilter, setLastSelectedFilter] = useState<{key: string, value: string, id?: number} | null>(null)
  const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({
    levels: true,
    categories: true,
    specializations: true,
    intakes: true,
    study_modes: true,
  })
  const [specializationSearch, setSpecializationSearch] = useState('')
  const [search, setSearch] = useState(Array.isArray(initialSearch) ? String(initialSearch[0] || '') : String(initialSearch || ''))
  const [searchInput, setSearchInput] = useState(Array.isArray(initialSearch) ? String(initialSearch[0] || '') : String(initialSearch || ''))
  const [sortBy, setSortBy] = useState('rating')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [showMore, setShowMore] = useState(false)
  const [comparisonCourses, setComparisonCourses] = useState<any[]>([])
  const [showComparisonModal, setShowComparisonModal] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [pendingCourse, setPendingCourse] = useState<any>(null)
  const [appliedCourses, setAppliedCourses] = useState<Set<number>>(new Set())
  const [isPopupFormOpen, setIsPopupFormOpen] = useState(false)
  const [popupFormType, setPopupFormType] = useState<'brochure' | 'fee' | 'apply' | 'counselling'>('brochure')
  const [popupUniversityData, setPopupUniversityData] = useState<any>(null)
  const navigationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [, startTransition] = useTransition()
  const router = useRouter()
  
  const current_filters = useMemo(() => ({
    level: Array.isArray(initialLevel) ? initialLevel[0] : initialLevel,
    category: initialCategory ? { name: Array.isArray(initialCategory) ? initialCategory[0] : initialCategory } : null,
    specialization: initialSpecialization ? { name: Array.isArray(initialSpecialization) ? initialSpecialization[0] : initialSpecialization } : null
  }), [initialLevel, initialCategory, initialSpecialization])

  // SEO logic matching old project
  const pageHeading = useMemo(() => {
    // Priority: 1. User's last click, 2. Initial URL filters
    if (lastSelectedFilter) {
      const name = lastSelectedFilter.value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      return `${name} Courses in Malaysia`
    }
    
    const activeFilterName = current_filters.level || current_filters.category?.name || current_filters.specialization?.name
    if (activeFilterName) {
      const name = String(activeFilterName).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      return `${name} Courses in Malaysia`
    }

    if (initialCoursesData?.seo?.meta_title && initialCoursesData.seo.meta_title !== '%title%') {
      return initialCoursesData.seo.meta_title.split('|')[0].split(' - ')[0].trim()
    }
    return 'Courses in Malaysia'
  }, [initialCoursesData, lastSelectedFilter, current_filters])

  const pageDescription = useMemo(() => {
    const activeFilterNameRaw = lastSelectedFilter?.value || current_filters.level || current_filters.category?.name || current_filters.specialization?.name
    
    if (activeFilterNameRaw) {
      const activeFilterName = String(activeFilterNameRaw).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      return (
        `Discover a list of ${totalCourses > 0 ? totalCourses : "..."} ${activeFilterName} courses offered by the Top ${initialCoursesData?.nou || "..."} universities ` +
        `and colleges in Malaysia. Gather valuable information such as entry requirements, fee structures, ` +
        `intake schedules for ${renderYear}, study modes, and recommendations for the best ` +
        `universities and colleges offering ${activeFilterName} degree programs. Enroll directly in ` +
        `${activeFilterName} courses through EducationMalaysia.in.`
      )
    }
    return initialCoursesData?.seo?.page_contents || 
      "Discover thousands of courses offered by top universities and colleges in Malaysia. Compare programs, entry requirements, fee structures, intake dates, and study modes. Find the best degrees, diplomas, and certificates across all fields of study in Malaysia and enroll directly through EducationMalaysia.in."
  }, [initialCoursesData, lastSelectedFilter, current_filters, totalCourses, renderYear])

  const decodeHTMLEntities = (text: string) => {
    if (!text) return ''
    return text
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
      .replace(/&[a-z]+;/gi, '')
  }

  const stripTags = (html: string) => {
    if (!html) return ''
    const clean = decodeHTMLEntities(html.replace(/<\/?[^>]+(>|$)/g, ' ').replace(/\s+/g, ' '))
    return clean.trim()
  }

  const isHtml = /<[a-z][\s\S]*>/i.test(pageDescription)
  const plainText = isHtml ? stripTags(pageDescription) : pageDescription
  const CHAR_LIMIT = 450
  const needsButton = pageDescription && plainText.length > CHAR_LIMIT

  const activeFilterCount = Object.values(selectedFilters).reduce((acc, v) => acc + v.length, 0)

  // ── Build query string ───────────────────────────────────────────────────
  const buildQuery = useCallback((page: number, filters: Record<string, string[]>, q: string, sort: string) => {
    const params = new URLSearchParams({ page: String(page), per_page: String(PER_PAGE) })
    if (q) params.set('search', q)
    Object.entries(filters).forEach(([key, values]) => {
      const paramKey = key === 'levels' ? 'level' : 
                      key === 'categories' ? 'category' : 
                      key === 'specializations' ? 'specialization' : 
                      key === 'study_modes' ? 'study_mode' : 
                      key === 'intakes' ? 'intake' : key
      values.forEach(v => params.append(paramKey, v))
    })
    return params.toString()
  }, [])

  const buildRouteFromFilters = useCallback((page: number, filters: Record<string, string[]>, q: string) => {
    const primaryKeys = ['specializations', 'categories', 'levels']
    const activePrimaryKey = primaryKeys.find((k) => filters[k]?.length > 0)

    let basePath = '/courses-in-malaysia'
    if (activePrimaryKey && filters[activePrimaryKey][0]) {
      basePath = `/${filters[activePrimaryKey][0]}-courses`
    }
    if (page > 1) {
      basePath = `${basePath}/page-${page}`
    }

    const params = new URLSearchParams()
    if (q) params.set('search', q)
    Object.entries(filters).forEach(([filterKey, values]) => {
      if (filterKey === activePrimaryKey) return
      const vals = values as string[]
      if (vals.length > 0) {
        const paramKey = filterKey === 'levels' ? 'level' :
                        filterKey === 'categories' ? 'category' :
                        filterKey === 'specializations' ? 'specialization' :
                        filterKey === 'study_modes' ? 'study_mode' :
                        filterKey === 'intakes' ? 'intake' : filterKey
        vals.forEach((v) => params.append(paramKey, v))
      }
    })
    const queryString = params.toString()
    return queryString ? `${basePath}?${queryString}` : basePath
  }, [])

  const pushRouteSafely = useCallback((targetPath: string) => {
    startTransition(() => {
      router.push(targetPath)
    })
  }, [router, startTransition])

  const scheduleRouteUpdate = useCallback((targetPath: string, delay = 90) => {
    if (navigationTimerRef.current) clearTimeout(navigationTimerRef.current)
    navigationTimerRef.current = setTimeout(() => {
      pushRouteSafely(targetPath)
      navigationTimerRef.current = null
    }, delay)
  }, [pushRouteSafely])

  // ── Fetch filters ────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialFilterData) return
    const fetchFilters = async () => {
      const cacheKey = 'filters'
      const cached = cache.get(cacheKey)
      if (cached) { setFilterData(cached); setFilterLoading(false); return }
      try {
        const res = await fetch(`${API_BASE}/courses/filters`, { headers: { 'x-api-key': API_KEY } })
        if (!res.ok) throw new Error('Failed')
        const json = await res.json()
        const data = json.data || json
        setFilterData(data)
        cache.set(cacheKey, data)
      } catch (e) {
        console.error('Filters error:', e)
      } finally {
        setFilterLoading(false)
      }
    }
    fetchFilters()
  }, [])

  // ── Init filters from URL props ──────────────────────────────────────────
  useEffect(() => {
    const init: Record<string, string[]> = { ...EMPTY_FILTERS }
    
    const toArr = (key: string, val: any) => {
      if (!val) return []
      return (Array.isArray(val) ? val : [val]).map((v) => normalizeFilterValue(key, v)).filter(Boolean)
    }

    if (initialLevel) init.levels = toArr('levels', initialLevel)
    if (initialCategory) init.categories = toArr('categories', initialCategory)
    if (initialSpecialization) init.specializations = toArr('specializations', initialSpecialization)
    if (initialStudyMode) init.study_modes = toArr('study_modes', initialStudyMode)
    if (initialIntake) init.intakes = toArr('intakes', initialIntake)
    
    // Set last selected filter for SEO
    if (initialFilterType && initialFilterValue) {
      setLastSelectedFilter({ key: initialFilterType, value: initialFilterValue })
    }
    
    setSelectedFilters(init)
  }, [initialLevel, initialCategory, initialSpecialization, initialStudyMode, initialIntake, initialFilterType, initialFilterValue])

  // Keep category/specialization selections aligned with currently available options
  // (same behavior as old project dependent filters)
  useEffect(() => {
    const availableCategories = Array.isArray(filterData?.categories) ? filterData.categories : []
    const availableSpecializations = Array.isArray(filterData?.specializations) ? filterData.specializations : []
    if (availableCategories.length === 0 && availableSpecializations.length === 0) return

    const validCategoryValues = new Set(
      availableCategories
        .map((item: any) => normalizeFilterValue('categories', item?.value || item?.slug || item?.name))
        .filter(Boolean),
    )
    const validSpecValues = new Set(
      availableSpecializations
        .map((item: any) => normalizeFilterValue('specializations', item?.value || item?.slug || item?.name))
        .filter(Boolean),
    )

    const filteredCategories = selectedFilters.categories.filter((cat) => validCategoryValues.has(cat))
    const filteredSpecializations = selectedFilters.specializations.filter((spec) => validSpecValues.has(spec))

    const hasCategoryChange = filteredCategories.length !== selectedFilters.categories.length
    const hasSpecChange = filteredSpecializations.length !== selectedFilters.specializations.length
    if (!hasCategoryChange && !hasSpecChange) return

    const nextFilters = {
      ...selectedFilters,
      categories: filteredCategories,
      specializations: filteredSpecializations,
    }
    setSelectedFilters(nextFilters)
    setCurrentPage(1)
    scheduleRouteUpdate(buildRouteFromFilters(1, nextFilters, search))
  }, [filterData, selectedFilters, buildRouteFromFilters, search, scheduleRouteUpdate])

  // Apply sorting like OLD project
  const applySorting = useCallback((coursesList: any[], sortType: string) => {
    const sorted = [...coursesList]
    if (sortType === 'rating')
      sorted.sort(
        (a, b) => (b.university?.rating || 0) - (a.university?.rating || 0),
      )
    else if (sortType === 'duration')
      sorted.sort(
        (a, b) =>
          parseFloat((a.duration || "0").replace(/[^0-9.]/g, "")) -
          parseFloat((b.duration || "0").replace(/[^0-9.]/g, "")),
      )
    return sorted
  }, [])

  // Apply sorting when sortBy changes
  useEffect(() => {
    if (courses.length > 0) {
      const sortedCourses = applySorting(courses, sortBy)
      setCourses(sortedCourses)
    }
  }, [sortBy, applySorting])

  // ── Fetch courses ────────────────────────────────────────────────────────
  const fetchCourses = useCallback(async (page: number, filters: Record<string, string[]>, q: string, sort: string) => {
    const qs = buildQuery(page, filters, q, sort)
    const cacheKey = `list_${qs}`
    const cached = cache.get(cacheKey)
    if (cached) {
      // Apply sorting to cached data
      const sortedCourses = applySorting(cached.courses, sort)
      setCourses(sortedCourses)
      setCurrentPage(cached.currentPage)
      setLastPage(cached.lastPage)
      setTotalCourses(cached.total)
      if (cached.title) { /* update pageTitle if needed */ }
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/courses-in-malaysia?${qs}`, { headers: { 'x-api-key': API_KEY } })
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      
      if (json.status || json.data) {
        let newCourses = json.data || json.rows?.data || []
        
        // Apply client-side sorting like OLD project
        newCourses = applySorting(newCourses, sort)
        
        const pagination = json.pagination || json.rows
        const newLast = pagination?.last_page || 1
        const newTotal = pagination?.total || 0
        const newTitle = json.seo?.meta_title || json.title || 'Find Your Perfect Course'
        if (json.filters) setFilterData(json.filters)
        setCourses(newCourses)
        setCurrentPage(page)
        setLastPage(newLast)
        setTotalCourses(newTotal)
        // setPageTitle(newTitle)
        cache.set(cacheKey, { courses: newCourses, currentPage: page, lastPage: newLast, total: newTotal, title: newTitle })
      }
    } catch (e) {
      console.error('Courses error:', e)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [buildQuery, applySorting])

  useEffect(() => {
    if (initialCoursesData && currentPage === 1 && Object.values(selectedFilters).every(v => v.length === 0) && !search) {
      // Data already loaded from props for first page and no filters
      return
    }
    fetchCourses(currentPage, selectedFilters, search, sortBy)
  }, [currentPage, selectedFilters, search, sortBy, fetchCourses])

  useEffect(() => {
    if (searchInput === search) return
    if (searchInput.trim() === '') {
      setCurrentPage(1)
      setSearch('')
      scheduleRouteUpdate(buildRouteFromFilters(1, selectedFilters, ''), 0)
      return
    }
    const timer = setTimeout(() => {
      setCurrentPage(1)
      setSearch(searchInput)
      scheduleRouteUpdate(buildRouteFromFilters(1, selectedFilters, searchInput), 0)
    }, 350)
    return () => clearTimeout(timer)
  }, [searchInput, search, selectedFilters, buildRouteFromFilters, scheduleRouteUpdate])

  const handleSearch = () => {
    setCurrentPage(1)
    const fullPath = buildRouteFromFilters(1, selectedFilters, searchInput)
    scheduleRouteUpdate(fullPath, 0)
    if (searchInput === search) {
      fetchCourses(1, selectedFilters, searchInput, sortBy)
      return
    }
    setSearch(searchInput)
  }

  const handleFilterChange = (key: string, value: string, filterId?: number) => {
    let nextFilters: FilterState = { ...selectedFilters }
    
    // 1. Calculate next state
    const isSingleSelect = SINGLE_SELECT_FILTERS.includes(key)
    const curr = selectedFilters[key] || []
    const exists = curr.includes(value)
    
    if (isSingleSelect) {
      nextFilters[key] = exists ? [] : [value]
    } else {
      nextFilters[key] = exists ? curr.filter(v => v !== value) : [...curr, value]
    }

    // 2. Update state
    setSelectedFilters(nextFilters)
    
    // Update last selected filter for SEO
    if (!exists) {
      setLastSelectedFilter({ key, value, id: filterId })
    }
    
    const fullPath = buildRouteFromFilters(1, nextFilters, search)
    scheduleRouteUpdate(fullPath)
    setCurrentPage(1)
  }

  const handleReset = () => {
    setSelectedFilters(EMPTY_FILTERS)
    setSearch('')
    setSearchInput('')
    setSortBy('rating')
    setCurrentPage(1)
    setLastSelectedFilter(null)
    scheduleRouteUpdate('/courses-in-malaysia', 0)
  }

  const handleAddToCompare = useCallback((course: any) => {
    if (comparisonCourses.length >= 3) {
      toast.error('You can compare maximum 3 courses')
      return
    }
    if (comparisonCourses.find(c => c.id === course.id)) {
      toast('Course already added to comparison')
      return
    }
    setComparisonCourses(prev => [...prev, course])
    toast.success('Course added to comparison')
  }, [comparisonCourses])

  const handleRemoveFromCompare = useCallback((courseId: number) => {
    setComparisonCourses(prev => prev.filter(c => c.id !== courseId))
  }, [])

  const handleClearAllCompare = useCallback(() => setComparisonCourses([]), [])

  const handleCompare = useCallback(() => {
    if (comparisonCourses.length < 2) {
      toast.error('Please add at least 2 courses to compare')
      return
    }
    setShowComparisonModal(true)
  }, [comparisonCourses.length])

  const handleUniversityClick = useCallback((university: any) => {
    const universityName = typeof university === 'string' ? university : university?.name || university?.uname
    if (!universityName) return
    
    const slug = university?.uname || universityName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
    
    router.push(`/university/${slug}`)
  }, [router])

  const handleApplyNow = useCallback(async (course: any) => {
    const token = localStorage.getItem('token')
    if (!token) {
      setPendingCourse(course)
      setShowAuthModal(true)
      return
    }

    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      }

      if (API_KEY) {
        headers['x-api-key'] = API_KEY
      }

      const response = await fetch(`${API_BASE}/student/apply-program/${course.id}`, {
        method: 'GET',
        headers,
      })

      if (response.ok) {
        toast.success('Course applied successfully!')
        setAppliedCourses(prev => new Set([...prev, course.id]))
        return
      }

      if (response.status === 409) {
        toast.warn('You have already applied for this course.')
        setAppliedCourses(prev => new Set([...prev, course.id]))
        return
      }

      if (response.status === 401) {
        setPendingCourse(course)
        setShowAuthModal(true)
        return
      }

      toast.error('Failed to apply. Please try again.')
    } catch {
      toast.error('Failed to apply. Please try again.')
    }
  }, [])

  const handleViewDetail = useCallback((course: any) => {
    if (!course || !course.university?.name) return
    const universitySlug = course.university.uname || course.university.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
    const courseSlug = course.slug || (course.course_name ? course.course_name.toLowerCase().replace(/\s+/g, '-').replace(/[()&]/g, '').replace(/--+/g, '-').trim() : null)
    if (!courseSlug) return
    router.push(`/university/${universitySlug}/courses/${courseSlug}`)
  }, [router])

  const openPopup = useCallback((course: any, type: 'brochure' | 'fee') => {
    setPopupFormType(type)
    setPopupUniversityData({
      id: course?.university?.id ?? course?.university_id ?? null,
      name: course?.university?.name ?? '',
      logo_path: course?.university?.logo_path ?? '',
    })
    setIsPopupFormOpen(true)
  }, [])

  const toggleFilter = () =>
    setOpenFilters({
      levels: true,
      categories: true,
      specializations: true,
      intakes: true,
      study_modes: true,
    })

  const breadcrumbCurrent = useMemo(() => {
    const dynamic =
      lastSelectedFilter?.value ||
      selectedFilters.specializations?.[0] ||
      selectedFilters.categories?.[0] ||
      selectedFilters.levels?.[0] ||
      (Array.isArray(initialSpecialization) ? initialSpecialization[0] : initialSpecialization) ||
      (Array.isArray(initialCategory) ? initialCategory[0] : initialCategory) ||
      (Array.isArray(initialLevel) ? initialLevel[0] : initialLevel) ||
      null
    return dynamic
      ? String(dynamic).replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      : null
  }, [lastSelectedFilter, selectedFilters, initialLevel, initialCategory, initialSpecialization])

  const startItem = totalCourses === 0 ? 0 : (currentPage - 1) * PER_PAGE + 1
  const endItem = totalCourses === 0 ? 0 : Math.min(currentPage * PER_PAGE, totalCourses)

  const syncAppliedCourses = useCallback(async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setAppliedCourses(new Set())
        return
      }

      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      }
      if (API_KEY) headers['x-api-key'] = API_KEY

      const res = await fetch(`${API_BASE}/student/applied-college`, { headers })
      if (!res.ok) return

      const json = await res.json()
      const appliedList = Array.isArray(json?.data?.applied_programs)
        ? json.data.applied_programs
        : Array.isArray(json?.applied_programs)
          ? json.applied_programs
          : []

      const ids = new Set<number>(
        appliedList
          .map((item: any) => Number(item?.prog_id ?? item?.program_id ?? item?.university_program?.id))
          .filter((id: number) => Number.isFinite(id) && id > 0),
      )

      setAppliedCourses(ids)
    } catch {
      // no-op
    }
  }, [])

  // Keep Apply button state updated across navigation/deletes
  useEffect(() => {
    syncAppliedCourses()

    const onFocus = () => syncAppliedCourses()
    const onVisibility = () => {
      if (document.visibilityState === 'visible') syncAppliedCourses()
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'applied_colleges_updated') syncAppliedCourses()
    }

    window.addEventListener('focus', onFocus)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener('focus', onFocus)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('storage', onStorage)
    }
  }, [syncAppliedCourses])

  useEffect(() => {
    return () => {
      if (navigationTimerRef.current) {
        clearTimeout(navigationTimerRef.current)
      }
    }
  }, [])

  return (
    <>
      {/* Breadcrumb section */}
      <div className="w-full bg-blue-50 shadow-sm min-h-[40px] sm:min-h-[52px]">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 py-2 sm:py-3">
          <div className="flex items-center flex-nowrap gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600 overflow-x-auto scrollbar-hide">
            <Link href="/" className="flex items-center gap-1 hover:underline hover:text-blue-500 shrink-0">
              <Home size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span>Home</span>
            </Link>
            <span className="text-gray-400">/</span>
            <Link href="/courses-in-malaysia" className="flex items-center gap-1 hover:underline hover:text-blue-500 shrink-0">
              <Layers size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span>Courses in Malaysia</span>
            </Link>
            {breadcrumbCurrent && (
              <>
                <ChevronRight className="shrink-0 w-4 h-4 text-gray-400 mx-1" />
                <span className="shrink-0 text-blue-600 font-semibold whitespace-nowrap capitalize">
                  {breadcrumbCurrent}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile filter drawer */}
      {showMobileFilter && (
        <MobileFilterDrawer
          filters={filterData}
          selectedFilters={selectedFilters}
          openFilters={openFilters}
          activeFilterCount={activeFilterCount}
          specializationSearch={specializationSearch}
          onToggleFilter={toggleFilter}
          onFilterChange={handleFilterChange}
          onReset={handleReset}
          onClose={() => setShowMobileFilter(false)}
          onSpecializationSearch={setSpecializationSearch}
        />
      )}

      <div className="bg-gradient-to-br from-blue-50 to-white p-2 sm:p-4 min-h-screen">
        <div className="max-w-[1600px] mx-auto px-2 sm:px-4 py-2">
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">

            {/* Mobile filter button */}
            <div className="lg:hidden sticky top-[56px] z-30 bg-[#eff6ff] pt-2 pb-2 -mx-2 px-2 w-[calc(100%+16px)]">
              <div className="w-full flex justify-between items-center bg-white rounded-xl p-3 shadow-lg border border-blue-100">
                <span className="text-sm font-bold text-gray-800">
                  <span className="text-blue-600">{totalCourses}</span> Courses Found
                </span>
                <button
                  className="bg-linear-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg shadow-md flex items-center gap-2 text-sm font-bold hover:from-blue-700 hover:to-blue-800 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                  onClick={() => setShowMobileFilter(true)}
                >
                  <Filter className="w-4 h-4" />
                  Filters{' '}
                  {activeFilterCount > 0 && (
                    <span className="bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{activeFilterCount}</span>
                  )}
                </button>
              </div>
            </div>

            {/* Desktop filter panel */}
            <DesktopFilterPanel
              loading={filterLoading}
              filters={filterData}
              selectedFilters={selectedFilters}
              openFilters={openFilters}
              activeFilterCount={activeFilterCount}
              specializationSearch={specializationSearch}
              onToggleFilter={toggleFilter}
              onFilterChange={handleFilterChange}
              onReset={handleReset}
              onSpecializationSearch={setSpecializationSearch}
            />

            {/* Course list */}
            <div className="flex-1 min-w-0 max-w-full space-y-6">
              {/* Header toolbar */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">{pageHeading}</h1>
                      <p className="text-sm text-gray-600">
                        {totalCourses > 0 ? (
                          <>
                            Showing <span className="font-semibold text-blue-600">{startItem}-{endItem}</span> of <span className="font-semibold text-blue-600">{totalCourses}</span> courses in Malaysia
                          </>
                        ) : (
                          <>
                            Showing <span className="font-semibold text-blue-600">0</span> courses available in Malaysia
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  {pageDescription && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 mt-2 shadow-sm">
                      {showMore ? (
                        <div
                          className="text-gray-700 text-sm leading-relaxed prose prose-sm max-w-none transition-opacity duration-300"
                          dangerouslySetInnerHTML={{ __html: pageDescription }}
                        />
                      ) : (
                        <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                          {needsButton ? plainText.slice(0, CHAR_LIMIT) + '...' : plainText}
                        </p>
                      )}
                      {needsButton && (
                        <button
                          onClick={() => setShowMore(!showMore)}
                          className="mt-3 text-blue-600 text-sm font-semibold hover:underline focus:outline-none flex items-center gap-1 cursor-pointer"
                        >
                          {showMore ? <>Show Less <ChevronUp className="w-4 h-4" /></> : <>Show More <ChevronDown className="w-4 h-4" /></>}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Sort + Search + View toggle */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ArrowUpDown className="w-5 h-5 text-gray-600 shrink-0" />
                      <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Sort by:</span>
                      <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="flex-1 sm:flex-none px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors font-medium text-sm bg-white cursor-pointer hover:border-gray-300">
                        <option value="rating">Highest Rated</option>
                        <option value="duration">Duration</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                        <input
                          type="text"
                          placeholder="Search courses..."
                          value={searchInput}
                          onChange={e => setSearchInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
                          className="w-full pl-9 sm:pl-12 pr-3 py-2.5 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors font-medium text-sm"
                        />
                      </div>
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1 shrink-0">
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`} title="List View">
                          <List className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`} title="Grid View">
                          <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Active filter chips */}
                  {activeFilterCount > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl mt-4 shadow-sm p-4">
                      <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                            <Filter className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-bold text-gray-800 text-sm shrink-0">Active Filters</span>
                        </div>
                        <button onClick={handleReset} className="text-xs font-semibold text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded transition-colors flex items-center gap-1">
                          <X className="w-3 h-3" /> Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(selectedFilters).map(([key, values]) => values.map(value => (
                          <div key={`${key}-${value}`} className="group flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg pl-2.5 pr-1.5 py-1.5 text-xs transition-all hover:bg-white hover:border-blue-300 hover:shadow-sm">
                            <span className="text-gray-500 font-medium uppercase tracking-wider text-[10px] mr-1">{key}:</span>
                            <span className="font-semibold text-blue-900 leading-none">{formatFilterDisplayLabel(key, value)}</span>
                            <button onClick={() => handleFilterChange(key, value)} className="w-4 h-4 flex items-center justify-center rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all ml-1">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Course Cards */}
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-4'}`}>
                {loading && courses.length === 0
                  ? [...Array(5)].map((_, i) => <CourseCardSkeleton key={i} />)
                  : courses.length > 0
                    ? courses.map(course => (
                        <CourseCard 
                          key={course.id} 
                          course={course} 
                          viewMode={viewMode}
                          appliedCourses={appliedCourses}
                          onApplyNow={handleApplyNow}
                          onViewDetail={handleViewDetail}
                          onCompareUniversity={handleAddToCompare}
                          onUniversityClick={handleUniversityClick}
                        />
                      ))
                    : (
                      <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <p className="text-gray-500 text-lg mb-4">No courses found matching your criteria.</p>
                        <button onClick={handleReset} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all">Clear Filters</button>
                      </div>
                    )
                }
              </div>

              <Pagination
                currentPage={currentPage}
                totalPages={lastPage}
                className="mt-6"
                onPageChange={(p) => {
                  if (p < 1 || p > lastPage || p === currentPage) return
                  setCurrentPage(p)
                  scheduleRouteUpdate(buildRouteFromFilters(p, selectedFilters, search), 0)
                  window.scrollTo({ top: 0, behavior: 'smooth' })
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <CourseCompareBar 
        comparisonCourses={comparisonCourses}
        onRemoveFromCompare={handleRemoveFromCompare}
        onCompare={handleCompare}
        onClearAll={handleClearAllCompare}
      />

      {showComparisonModal && (
        <CourseComparisonModal 
          comparisonCourses={comparisonCourses}
          appliedCourses={appliedCourses}
          onApplyNow={handleApplyNow}
          onClose={() => setShowComparisonModal(false)}
        />
      )}

      {/* Modals */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        courseId={pendingCourse?.id || null}
        onSuccess={() => {
          if (pendingCourse?.id) {
            setAppliedCourses(prev => new Set([...prev, pendingCourse.id]))
          }
          setPendingCourse(null)
        }} 
      />
      <PopupForm
        isOpen={isPopupFormOpen}
        onClose={() => setIsPopupFormOpen(false)}
        formType={popupFormType}
        universityData={popupUniversityData || { id: null, name: '', logo_path: '' }}
      />
    </>
  )
}
