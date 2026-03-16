'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import {
  Filter, ChevronDown, ChevronUp, X, Search, ArrowUpDown,
  List, LayoutGrid, MapPin, Building, Star, BookOpen, Globe, Home,
  ChevronLeft, ChevronRight,
} from 'lucide-react'

const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''
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

// ── CourseCard ────────────────────────────────────────────────────────────────
function CourseCard({ course, viewMode }: { course: any; viewMode: 'list' | 'grid' }) {
  const accreditations: string[] = Array.isArray(course.accreditations)
    ? course.accreditations
    : typeof course.accreditations === 'string'
      ? course.accreditations.split(',').map((s: string) => s.replace(/[\\"\[\]]/g, '').trim()).filter(Boolean)
      : []

  const uniSlug = course.university?.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '') || ''

  return (
    <div className={`bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-blue-300 group relative ${viewMode === 'grid' ? 'flex flex-col h-full' : 'mb-4 w-full'}`}>
      <div className="px-4 py-1.5">
        {/* University Header */}
        <div className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-3 w-full">
            {/* Logo */}
            <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shrink-0 border border-gray-200 shadow-sm overflow-hidden">
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
              <Link
                href={`/university/${uniSlug}`}
                className="text-sm sm:text-base font-bold text-gray-900 hover:text-blue-600 transition-colors truncate leading-tight block"
              >
                {course.university?.name}
              </Link>
              <div className="flex items-center text-gray-600 text-xs mt-0.5">
                <MapPin className="w-3 h-3 mr-1 shrink-0" />
                <span className="truncate">{course.university?.city}, {course.university?.state}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
                <div className="flex items-center">
                  <Building className="w-3 h-3 mr-0.5" />
                  <span>{course.university?.inst_type || 'Private'}</span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="w-3 h-3 mr-0.5" />
                  <span>{course.university?.programs_count} Courses</span>
                </div>
              </div>
            </div>
          </div>

          {/* Rating & Badges */}
          <div className="flex items-center gap-3 flex-wrap w-full sm:w-auto sm:shrink-0">
            <div className="flex gap-1.5">
              {course.is_local === 1 && (
                <div className="flex items-center gap-1 bg-blue-50 px-2 py-1 rounded border border-blue-200">
                  <Home className="w-3 h-3 text-blue-600" />
                  <span className="text-xs font-semibold text-blue-700">Local</span>
                </div>
              )}
              {course.is_international === 1 && (
                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-200">
                  <Globe className="w-3 h-3 text-green-600" />
                  <span className="text-xs font-semibold text-green-700">Int&apos;l</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-0.5 bg-gradient-to-br from-amber-50 to-yellow-50 px-2 py-1 rounded border border-amber-200">
              <span className="text-sm font-bold text-gray-900">{course.university?.rating || 'N/A'}</span>
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            </div>
          </div>
        </div>

        {/* Course Title + Specs */}
        <div className="border-t border-gray-200 pt-2 mb-2">
          <Link
            href={`/university/${uniSlug}/${course.slug || course.id}`}
            className="text-sm font-bold text-blue-600 mb-2 hover:text-blue-700 transition-colors line-clamp-2 leading-tight block"
          >
            {course.course_name}
          </Link>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 mb-2">
            {[
              { label: 'Mode', value: course.study_mode },
              { label: 'Duration', value: course.duration },
              { label: 'Intakes', value: course.intake },
              { label: 'Tuition Fee', value: course.fee },
            ].map(({ label, value }) => (
              <div key={label} className="bg-gray-50 rounded p-2 border border-gray-200 flex flex-col justify-center min-h-[60px]">
                <p className="text-xs text-gray-500 mb-0.5 font-semibold uppercase">{label}</p>
                <p className="text-xs font-bold text-gray-900 line-clamp-1">{value || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Accreditation Badges */}
        {accreditations.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-2">
            {accreditations.map((acc, i) => (
              <span key={i} className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-green-300 whitespace-nowrap">
                {acc}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-1.5 w-full mb-1">
          <Link
            href={`/contact-us`}
            className="font-bold py-2 px-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 text-xs bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 text-center"
          >
            Apply Now
          </Link>
          <Link
            href={`/university/${uniSlug}/${course.slug || course.id}`}
            className="cursor-pointer bg-white text-gray-800 font-bold py-2.5 px-2 rounded-lg border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md text-xs sm:text-sm text-center"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  )
}

// ── FilterPanel Desktop ───────────────────────────────────────────────────────
function DesktopFilterPanel({ loading, filters, selectedFilters, openFilters, activeFilterCount, specializationSearch, onToggleFilter, onFilterChange, onReset, onSpecializationSearch }: any) {
  if (loading) return <FilterPanelSkeleton />
  return (
    <div className="hidden lg:block w-[280px] min-w-[280px] shrink-0 bg-gradient-to-br from-white to-blue-50/30 border border-blue-100 p-6 rounded-2xl shadow-xl space-y-5 text-base sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto">
      <div className="pb-4 border-b-2 border-blue-100">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-1.5 rounded-lg shadow-sm">
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
            <button onClick={() => onToggleFilter(key)} className="w-full flex items-center justify-between p-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-transparent transition-all">
              <span className="font-bold text-gray-900 capitalize flex items-center gap-2">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                {selectedFilters[key]?.length > 0 && (
                  <span className="bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-sm">{selectedFilters[key].length}</span>
                )}
              </span>
              <div className={`transition-transform duration-200 ${openFilters[key] ? 'rotate-180' : ''}`}>
                <ChevronDown className="w-5 h-5 text-blue-600" />
              </div>
            </button>
            {openFilters[key] && (
              <div className="px-3 pb-3 space-y-1.5 max-h-56 overflow-y-auto bg-gradient-to-b from-gray-50/50 to-white">
                {key === 'specializations' && (
                  <div className="sticky top-0 bg-white z-10 pb-2 mb-2 border-b border-gray-200">
                    <input type="text" placeholder="Search specializations..." value={specializationSearch} onChange={e => onSpecializationSearch(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" />
                  </div>
                )}
                {(items as any[]).filter((item: any) => {
                  if (key !== 'specializations' || !specializationSearch) return true
                  return (item.label || item.name || item.slug || '').toLowerCase().includes(specializationSearch.toLowerCase())
                }).map((item: any) => {
                  const value = item.value || item.slug || item.name || item.month || item.study_mode || item
                  const display = item.label || item.name || item.slug || item.month || item.study_mode || item
                  const normalizedValue = (key === 'intakes' || key === 'study_modes') ? String(value).trim() : String(value).toLowerCase().trim().replace(/\s+/g, '-')
                  const isChecked = selectedFilters[key]?.includes(normalizedValue) || false
                  return (
                    <label key={item.id || value} className={`flex items-center gap-3 py-2 px-3 cursor-pointer rounded-lg transition-all group ${isChecked ? 'bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200 shadow-sm' : 'hover:bg-blue-50/50 border border-transparent'}`}>
                      <input type="radio" name={`course-${key}-desktop`} className="w-4 h-4 text-blue-600 border-2 border-gray-300 focus:ring-2 focus:ring-blue-500 shrink-0 cursor-pointer rounded-full" checked={isChecked} onChange={() => onFilterChange(key, normalizedValue, item.id)} />
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
                    const display = item.label || item.name || item.slug || item.month || item.study_mode || item
                    return (
                      <label key={item.id || value} className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-blue-50 rounded-lg pl-0 pr-2 transition-all group">
                        <input type="radio" name={`course-${key}-mobile`} className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-2 focus:ring-blue-500 shrink-0 rounded-full" checked={selectedFilters[key].includes(String(value).toLowerCase().trim())} onChange={() => onFilterChange(key, String(value).toLowerCase().trim(), item.id)} />
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
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md'}`}>
        <ChevronLeft className="w-4 h-4" /><span className="hidden sm:inline">Previous</span>
      </button>
      {unique.map((p, i) => {
        const prev = unique[i - 1]
        return (
          <span key={p} className="flex items-center gap-2">
            {prev && p - prev > 1 && <span className="text-gray-400 font-bold px-1">•••</span>}
            <button onClick={() => onPageChange(p)} className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${currentPage === p ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-110 ring-2 ring-blue-300' : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'}`}>{p}</button>
          </span>
        )
      })}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === lastPage} className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${currentPage === lastPage ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md'}`}>
        <span className="hidden sm:inline">Next</span><ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
interface CoursesListClientProps {
  initialLevel?: string
  initialCategory?: string
  initialFilterData?: any
  initialCoursesData?: any
}

const EMPTY_FILTERS = { levels: [], categories: [], specializations: [], intakes: [], study_modes: [] }

export default function CoursesListClient({ 
  initialLevel, 
  initialCategory,
  initialFilterData,
  initialCoursesData
}: CoursesListClientProps) {
  const [courses, setCourses] = useState<any[]>(initialCoursesData?.courses?.data || initialCoursesData?.data || [])
  const [filterData, setFilterData] = useState<any>(initialFilterData || {})
  const [filterLoading, setFilterLoading] = useState(!initialFilterData)
  const [loading, setLoading] = useState(!initialCoursesData)
  const [currentPage, setCurrentPage] = useState(initialCoursesData?.courses?.current_page || initialCoursesData?.current_page || 1)
  const [lastPage, setLastPage] = useState(initialCoursesData?.courses?.last_page || initialCoursesData?.last_page || 1)
  const [totalCourses, setTotalCourses] = useState(initialCoursesData?.courses?.total || initialCoursesData?.total || 0)
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>(EMPTY_FILTERS)
  const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({ levels: true })
  const [specializationSearch, setSpecializationSearch] = useState('')
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState('rating')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showMobileFilter, setShowMobileFilter] = useState(false)
  const [pageTitle, setPageTitle] = useState('Find Your Perfect Course')

  const activeFilterCount = Object.values(selectedFilters).reduce((acc, v) => acc + v.length, 0)

  // ── Build query string ───────────────────────────────────────────────────
  const buildQuery = useCallback((page: number, filters: Record<string, string[]>, q: string, sort: string) => {
    const params = new URLSearchParams({ page: String(page), per_page: String(PER_PAGE), sort_by: sort })
    if (q) params.set('search', q)
    Object.entries(filters).forEach(([key, values]) => {
      values.forEach(v => params.append(key + '[]', v))
    })
    return params.toString()
  }, [])

  // ── Fetch filters ────────────────────────────────────────────────────────
  useEffect(() => {
    if (initialFilterData) return
    const fetchFilters = async () => {
      const cacheKey = 'filters'
      const cached = cache.get(cacheKey)
      if (cached) { setFilterData(cached); setFilterLoading(false); return }
      try {
        const res = await fetch(`${API_BASE}/courses/filters`)
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
    if (initialLevel) init.levels = [initialLevel.toLowerCase()]
    if (initialCategory) init.categories = [initialCategory.toLowerCase()]
    setSelectedFilters(init)
  }, [initialLevel, initialCategory])

  // ── Fetch courses ────────────────────────────────────────────────────────
  const fetchCourses = useCallback(async (page: number, filters: Record<string, string[]>, q: string, sort: string) => {
    const qs = buildQuery(page, filters, q, sort)
    const cacheKey = `list_${qs}`
    const cached = cache.get(cacheKey)
    if (cached) {
      setCourses(cached.courses)
      setCurrentPage(cached.currentPage)
      setLastPage(cached.lastPage)
      setTotalCourses(cached.total)
      if (cached.title) setPageTitle(cached.title)
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/courses?${qs}`)
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      const data = json.data || json
      const newCourses = data.courses?.data || data.data || []
      const newLast = data.courses?.last_page || data.last_page || 1
      const newTotal = data.courses?.total || data.total || 0
      const newTitle = data.seo?.meta_title || data.title || 'Find Your Perfect Course'
      setCourses(newCourses)
      setCurrentPage(page)
      setLastPage(newLast)
      setTotalCourses(newTotal)
      setPageTitle(newTitle)
      cache.set(cacheKey, { courses: newCourses, currentPage: page, lastPage: newLast, total: newTotal, title: newTitle })
    } catch (e) {
      console.error('Courses error:', e)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }, [buildQuery])

  useEffect(() => {
    if (initialCoursesData && currentPage === 1 && Object.values(selectedFilters).every(v => v.length === 0) && !search) {
      // Data already loaded from props for first page and no filters
      return
    }
    fetchCourses(currentPage, selectedFilters, search, sortBy)
  }, [currentPage, selectedFilters, sortBy])

  const handleSearch = () => {
    setCurrentPage(1)
    fetchCourses(1, selectedFilters, search, sortBy)
  }

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters(prev => {
      const curr = prev[key] || []
      const next = curr.includes(value) ? curr.filter(v => v !== value) : [value]
      return { ...prev, [key]: next }
    })
    setCurrentPage(1)
  }

  const handleReset = () => {
    setSelectedFilters(EMPTY_FILTERS)
    setSearch('')
    setSortBy('rating')
    setCurrentPage(1)
  }

  const toggleFilter = (key: string) => setOpenFilters(prev => ({ ...prev, [key]: !prev[key] }))

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Courses in Malaysia', href: '/courses-in-malaysia' },
    ...(initialLevel ? [{ label: initialLevel.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }] : []),
    ...(initialCategory ? [{ label: initialCategory.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) }] : []),
  ]

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

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
            <div className="lg:hidden w-full flex justify-between items-center mb-3 bg-gradient-to-r from-white to-blue-50/50 rounded-xl p-3 shadow-lg border border-blue-100">
              <span className="text-sm font-bold text-gray-800">
                <span className="text-blue-600">{totalCourses}</span> Courses Found
              </span>
              <button
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2.5 rounded-lg shadow-md flex items-center gap-2 text-sm font-bold hover:from-blue-700 hover:to-blue-800 transition-all hover:shadow-lg transform hover:-translate-y-0.5"
                onClick={() => setShowMobileFilter(true)}
              >
                <Filter className="w-4 h-4" />
                Filters{' '}
                {activeFilterCount > 0 && (
                  <span className="bg-white text-blue-600 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">{activeFilterCount}</span>
                )}
              </button>
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
                      <h1 className="text-2xl font-bold text-gray-900 mb-1">{pageTitle}</h1>
                      <p className="text-sm text-gray-600">
                        Showing <span className="font-semibold text-blue-600">{totalCourses}</span> courses available in Malaysia
                      </p>
                    </div>
                  </div>

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
                          value={search}
                          onChange={e => setSearch(e.target.value)}
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
                    <div className="bg-white border border-gray-200 rounded-xl mt-2 shadow-sm p-4">
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
                            <span className="font-semibold text-blue-900 leading-none">{value.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
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
              <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-0'}`}>
                {loading && courses.length === 0
                  ? [...Array(5)].map((_, i) => <CourseCardSkeleton key={i} />)
                  : courses.length > 0
                    ? courses.map(course => <CourseCard key={course.id} course={course} viewMode={viewMode} />)
                    : (
                      <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <p className="text-gray-500 text-lg mb-4">No courses found matching your criteria.</p>
                        <button onClick={handleReset} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all">Clear Filters</button>
                      </div>
                    )
                }
              </div>

              <CoursePagination currentPage={currentPage} lastPage={lastPage} onPageChange={p => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
