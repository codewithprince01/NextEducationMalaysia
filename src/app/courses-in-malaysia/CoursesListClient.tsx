'use client'

import { useState, useEffect, useCallback, useMemo, useRef, useTransition } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import Breadcrumb from '@/components/Breadcrumb'
import {
  Filter, ChevronDown, ChevronUp, X, Search, ArrowUpDown,
  List, LayoutGrid, MapPin, Building, Star, BookOpen, Globe, Home, Layers,
  ChevronLeft, ChevronRight, GraduationCap, Clock, Calendar, Coins,
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
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden animate-pulse mb-3 w-full p-3.5 sm:p-4 space-y-2.5">
      <div className="flex items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-13 h-13 sm:w-16 sm:h-16 bg-slate-200 rounded-xl shrink-0" />
          <div className="space-y-1.5">
            <div className="h-3.5 bg-slate-200 rounded w-44" />
            <div className="h-3 bg-slate-100 rounded w-28" />
          </div>
        </div>
        <div className="flex gap-1.5">
          <div className="h-6 bg-slate-200 rounded-full w-20 hidden sm:block" />
          <div className="h-6 bg-slate-200 rounded-full w-28 hidden sm:block" />
        </div>
      </div>
      <div className="h-4.5 bg-slate-200 rounded w-2/3" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-12 bg-slate-100 rounded-xl" />
        ))}
      </div>
      <div className="flex justify-between items-center pt-1.5">
        <div className="flex gap-2">
          <div className="h-8 w-28 bg-slate-100 rounded-xl" />
          <div className="h-8 w-24 bg-slate-100 rounded-xl" />
        </div>
        <div className="h-8 w-24 bg-slate-200 rounded-xl" />
      </div>
    </div>
  )
}

function FilterPanelSkeleton() {
  return (
    <div className="hidden lg:block w-[290px] min-w-[290px] xl:w-[300px] xl:min-w-[300px] shrink-0 bg-white border border-slate-200/80 p-4 rounded-2xl shadow-sm space-y-3 animate-pulse sticky top-[88px]">
      <div className="h-5 bg-slate-200 rounded w-1/2 mb-4" />
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="bg-slate-100 rounded-xl h-10 border border-slate-200/40" />
      ))}
    </div>
  )
}

const formatFee = (val: any) => {
  if (!val) return 'N/A'
  const str = String(val).trim()
  if (!str || str === '0' || str.toLowerCase() === 'n/a') return 'N/A'
  if (/^[\d,.]+$/.test(str)) {
    return `RM ${str}`
  }
  return str
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

  // Dynamic scholarship support: checks course.scholarship, scholarship_name, scholarship_amount, scholarship_text, etc.
  // When admin creates the scholarship field later, it will automatically reflect that dynamic data.
  const scholarshipBadge = (() => {
    if (course.scholarship === false || course.has_scholarship === false || course.is_scholarship === 0) {
      return null
    }
    if (typeof course.scholarship === 'string' && course.scholarship.trim()) {
      return course.scholarship.trim()
    }
    if (typeof course.scholarship_text === 'string' && course.scholarship_text.trim()) {
      return course.scholarship_text.trim()
    }
    if (typeof course.scholarship_title === 'string' && course.scholarship_title.trim()) {
      return course.scholarship_title.trim()
    }
    if (typeof course.scholarship_name === 'string' && course.scholarship_name.trim()) {
      return course.scholarship_name.trim()
    }
    if (typeof course.scholarship_amount === 'string' && course.scholarship_amount.trim()) {
      return course.scholarship_amount.trim()
    }
    if (typeof course.scholarship_discount === 'string' && course.scholarship_discount.trim()) {
      return course.scholarship_discount.trim()
    }
    return 'Scholarship Available'
  })()

  const specs = [
    { label: 'Mode', value: course.study_mode || 'Full Time', icon: BookOpen },
    { label: 'Duration', value: course.duration || 'N/A', icon: Clock },
    { label: 'Intakes', value: course.intake || 'N/A', icon: Calendar },
    { label: 'Tuition Fee', value: formatFee(course.fee || course.tution_fee || course.tuition_fee), icon: Coins, highlight: true },
  ]

  return (
    <div
      className={`bg-white rounded-2xl border border-slate-200/90 hover:border-blue-300 hover:shadow-xl transition-all duration-300 group relative overflow-hidden ${
        viewMode === "grid" ? "flex flex-col h-full" : "w-full mb-3"
      }`}
    >
      <div className="p-3.5 sm:p-4 flex flex-col h-full">
        {/* University Header & Meta */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo */}
            <div className="w-13 h-13 sm:w-16 sm:h-16 bg-white rounded-xl flex items-center justify-center shrink-0 border border-slate-200/80 shadow-2xs overflow-hidden p-1 group-hover:border-blue-200 transition-colors">
              {course.university?.logo_path ? (
                <img
                  src={`${IMAGE_BASE}/storage/${course.university.logo_path}`}
                  alt={course.university?.name || 'University'}
                  className="w-full h-full object-contain"
                  loading="lazy"
                  width={64}
                  height={64}
                />
              ) : (
                <div className="w-full h-full bg-slate-50 flex items-center justify-center text-xs font-semibold text-slate-400">Logo</div>
              )}
            </div>

            {/* University Info */}
            <div className="min-w-0 flex-1">
              <h3
                onClick={() => onUniversityClick(course.university)}
                className="text-[14.5px] sm:text-[16px] font-bold text-slate-900 hover:text-[#003893] cursor-pointer transition-colors truncate leading-tight"
                title={course.university?.name}
              >
                {course.university?.name}
              </h3>

              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11.5px] text-slate-500 mt-0.5">
                {(course.university?.city || course.university?.state) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{[course.university?.city, course.university?.state].filter(Boolean).join(', ')}</span>
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Building className="w-3 h-3 text-slate-400 shrink-0" />
                  <span>{course.university?.inst_type || "Private"}</span>
                </span>
                {Boolean(course.university?.programs_count) && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>{course.university?.programs_count} Courses</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Right Corner: Degree (Level), Dynamic Scholarship, Local/Int'l & Rating */}
          <div className="flex items-center gap-1.5 flex-wrap sm:justify-end shrink-0">
            {course.level && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-50 text-[#003893] border border-blue-200/80 shadow-2xs">
                {course.level}
              </span>
            )}

            {scholarshipBadge && (
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[11.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{scholarshipBadge}</span>
              </span>
            )}

            {Number(course.is_local) === 1 && (
              <span className="inline-flex items-center gap-1 bg-blue-50 text-[#003893] border border-blue-200/80 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                <Home className="w-2.5 h-2.5 text-[#003893]" />
                <span>Local</span>
              </span>
            )}

            {Number(course.is_international) === 1 && (
              <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 border border-green-200/80 px-2 py-0.5 rounded-full text-[11px] font-semibold">
                <Globe className="w-2.5 h-2.5 text-green-600" />
                <span>Int&apos;l</span>
              </span>
            )}

            <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-full font-bold text-[11.5px] shadow-2xs">
              <span>{course.university?.rating || "4.5"}</span>
              <Star className="w-3 h-3 text-amber-500 fill-amber-400" />
            </div>
          </div>
        </div>

        {/* Course Title + Accreditations */}
        <div className="pt-2 pb-2">
          <h4
            onClick={() => onViewDetail(course)}
            className="text-[16px] sm:text-[17.5px] font-bold text-slate-900 group-hover:text-[#003893] cursor-pointer transition-colors leading-snug line-clamp-2"
          >
            {courseDisplayName}
          </h4>

          {accreditations.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {accreditations.map((acc, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/70 whitespace-nowrap"
                >
                  {acc}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Specs Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5 sm:gap-2 mb-2.5">
          {specs.map(({ label, value, icon: Icon, highlight }) => (
            <div
              key={label}
              className="bg-slate-50/80 hover:bg-blue-50/30 border border-slate-200/60 rounded-xl px-2.5 py-1.5 sm:py-2 transition-colors flex flex-col justify-center"
            >
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-0.5">
                <Icon className="w-3 h-3 text-slate-400 shrink-0" />
                {label}
              </span>
              <span className={`text-xs sm:text-[13px] font-bold line-clamp-1 ${highlight ? 'text-[#003893]' : 'text-slate-800'}`}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        {viewMode === 'grid' ? (
          <div className="space-y-2 pt-2.5 border-t border-slate-100 mt-auto">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onCompareUniversity(course)}
                className="cursor-pointer font-semibold py-2 px-2 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-all text-xs text-center shadow-2xs"
              >
                Compare
              </button>
              <button
                onClick={() => onViewDetail(course)}
                className="cursor-pointer font-semibold py-2 px-2 rounded-xl border border-blue-200/80 bg-blue-50/50 hover:bg-blue-100/60 text-[#003893] transition-all text-xs text-center shadow-2xs"
              >
                View Detail
              </button>
            </div>
            <button
              onClick={() => !appliedCourses.has(course.id) && onApplyNow(course)}
              disabled={appliedCourses.has(course.id)}
              className={`w-full font-bold py-2 px-4 rounded-xl text-xs sm:text-[13px] transition-all shadow-sm cursor-pointer ${
                appliedCourses.has(course.id)
                  ? 'bg-emerald-600 text-white cursor-not-allowed'
                  : 'bg-linear-to-r from-[#003893] to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-md'
              }`}
            >
              {appliedCourses.has(course.id) ? 'Applied' : 'Apply Now'}
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2.5 border-t border-slate-100 mt-auto">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => onCompareUniversity(course)}
                className="flex-1 sm:flex-initial cursor-pointer font-semibold py-2 px-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 transition-all text-xs sm:text-[13px] shadow-2xs"
              >
                Compare University
              </button>
              <button
                onClick={() => onViewDetail(course)}
                className="flex-1 sm:flex-initial cursor-pointer font-semibold py-2 px-3.5 rounded-xl border border-blue-200/80 bg-blue-50/50 hover:bg-blue-100/60 text-[#003893] transition-all text-xs sm:text-[13px] shadow-2xs"
              >
                View Detail
              </button>
            </div>
            <div className="w-full sm:w-auto">
              <button
                onClick={() => !appliedCourses.has(course.id) && onApplyNow(course)}
                disabled={appliedCourses.has(course.id)}
                className={`w-full sm:w-auto sm:min-w-[130px] font-bold py-2 px-4.5 rounded-xl text-xs sm:text-[13px] transition-all shadow-sm cursor-pointer ${
                  appliedCourses.has(course.id)
                    ? 'bg-emerald-600 text-white cursor-not-allowed'
                    : 'bg-linear-to-r from-[#003893] to-blue-600 hover:from-blue-700 hover:to-blue-800 text-white hover:shadow-md'
                }`}
              >
                {appliedCourses.has(course.id) ? 'Applied' : 'Apply Now'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── FilterPanel Desktop ───────────────────────────────────────────────────────
function DesktopFilterPanel({ loading, filters, selectedFilters, openFilters, activeFilterCount, specializationSearch, onToggleFilter, onFilterChange, onReset, onSpecializationSearch }: any) {
  if (loading) return <FilterPanelSkeleton />
  return (
    <div className="hidden lg:block w-[290px] min-w-[290px] xl:w-[300px] xl:min-w-[300px] shrink-0 bg-white border border-slate-200/80 p-4 sm:p-5 rounded-2xl shadow-xs space-y-4 text-base sticky top-[88px] self-start max-h-[calc(100vh-6.5rem)] overflow-y-auto scrollbar-hide">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#003893] flex items-center justify-center shrink-0">
            <Filter className="w-4 h-4" />
          </div>
          <h2 className="text-[15.5px] font-bold text-slate-900 tracking-tight">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="flex items-center justify-center h-5 min-w-5 px-1.5 text-[11px] font-bold bg-[#003893] text-white rounded-full">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={onReset}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded-md transition-colors cursor-pointer"
          >
            Reset all
          </button>
        )}
      </div>

      {/* Accordion groups */}
      <div className="space-y-2.5">
        {Object.entries(filters).map(([key, items]: [string, any]) => (
          <div
            key={key}
            className="rounded-xl border border-slate-200/70 overflow-hidden bg-slate-50/40 hover:border-slate-300 transition-colors"
          >
            <button
              onClick={() => onToggleFilter(key)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 text-left hover:bg-slate-100/60 transition-colors"
            >
              <span className="font-semibold text-slate-800 text-[13.5px] capitalize flex items-center gap-2">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                {selectedFilters[key]?.length > 0 && (
                  <span className="bg-[#003893] text-white text-[10.5px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                    {selectedFilters[key].length}
                  </span>
                )}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                  openFilters[key] ? 'rotate-180 text-[#003893]' : ''
                }`}
              />
            </button>

            {openFilters[key] && (
              <div className="px-3 pb-3 pt-1 space-y-1 max-h-56 overflow-y-auto border-t border-slate-200/50 bg-white scrollbar-hide">
                {key === 'specializations' && (
                  <div className="sticky top-0 bg-white z-10 pb-2 pt-1 mb-1 border-b border-slate-100">
                    <div className="relative flex items-center">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                      <input
                        type="text"
                        placeholder="Search specializations..."
                        value={specializationSearch}
                        onChange={e => onSpecializationSearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-[#003893] outline-none transition-all"
                      />
                    </div>
                  </div>
                )}
                {(Array.isArray(items) ? items : [])
                  .filter((item: any) => {
                    if (key !== 'specializations' || !specializationSearch) return true
                    return (item.label || item.name || item.slug || '')
                      .toLowerCase()
                      .includes(specializationSearch.toLowerCase())
                  })
                  .map((item: any) => {
                    const value = item.value || item.slug || item.name || item.month || item.study_mode || item
                    const displayRaw = item.label || item.name || item.slug || item.month || item.study_mode || item
                    const display = formatFilterDisplayLabel(key, displayRaw)
                    const normalizedValue = normalizeFilterValue(key, value)
                    const isChecked = selectedFilters[key]?.includes(normalizedValue) || false
                    const isSingleSelect = SINGLE_SELECT_FILTERS.includes(key)
                    return (
                      <label
                        key={item.id || value}
                        className={`flex items-center gap-2.5 py-1.5 px-2.5 cursor-pointer rounded-lg transition-all text-left ${
                          isChecked
                            ? 'bg-blue-50 text-[#003893] font-semibold'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <input
                          type={isSingleSelect ? 'radio' : 'checkbox'}
                          name={`course-${key}-desktop`}
                          className={`w-3.5 h-3.5 text-[#003893] border-slate-300 focus:ring-2 focus:ring-blue-500/20 shrink-0 cursor-pointer ${
                            isSingleSelect ? 'rounded-full' : 'rounded'
                          }`}
                          checked={isChecked}
                          onChange={() => onFilterChange(key, normalizedValue, item.id)}
                        />
                        <span className="text-[13px] leading-snug line-clamp-2">{display}</span>
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
    <div className="fixed inset-0 z-50 flex backdrop-blur-xs bg-slate-900/40">
      <div className="w-4/5 max-w-xs bg-white p-5 rounded-r-2xl shadow-2xl h-full overflow-y-auto scrollbar-hide space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#003893] flex items-center justify-center shrink-0">
              <Filter className="w-4 h-4" />
            </div>
            <h2 className="text-[16px] font-bold text-slate-900">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="flex items-center justify-center h-5 min-w-5 px-1.5 text-[11px] font-bold bg-[#003893] text-white rounded-full">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button className="text-2xl font-bold text-slate-400 hover:text-slate-700 leading-none" onClick={onClose}>×</button>
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={() => { onReset(); onClose() }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline"
          >
            Clear all filters
          </button>
        )}
        <div className="space-y-2">
          {Object.entries(filters).map(([key, items]: [string, any]) => (
            <div key={key} className="rounded-xl border border-slate-200/70 overflow-hidden bg-slate-50/40">
              <button
                onClick={() => onToggleFilter(key)}
                className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-slate-100/60 transition-colors"
              >
                <span className="font-semibold text-slate-800 text-[13px] capitalize flex items-center gap-2">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                  {selectedFilters[key]?.length > 0 && (
                    <span className="bg-[#003893] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center">
                      {selectedFilters[key].length}
                    </span>
                  )}
                </span>
                {openFilters[key] ? <ChevronUp className="w-4 h-4 text-[#003893]" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </button>
              {openFilters[key] && (
                <div className="px-2.5 pb-2.5 pt-1 space-y-1 max-h-56 overflow-y-auto border-t border-slate-200/50 bg-white scrollbar-hide">
                  {key === 'specializations' && (
                    <div className="sticky top-0 bg-white z-10 pb-2 pt-1 mb-1 border-b border-slate-100">
                      <div className="relative flex items-center">
                        <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                        <input
                          type="text"
                          placeholder="Search specializations..."
                          value={specializationSearch}
                          onChange={e => onSpecializationSearch(e.target.value)}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-[#003893] outline-none"
                        />
                      </div>
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
                    const isChecked = selectedFilters[key]?.includes(normalizedValue) || false
                    const isSingleSelect = SINGLE_SELECT_FILTERS.includes(key)
                    return (
                      <label
                        key={item.id || value}
                        className={`flex items-center gap-2 py-1.5 px-2 cursor-pointer rounded-lg transition-all text-left ${
                          isChecked ? 'bg-blue-50 text-[#003893] font-semibold' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <input 
                          type={isSingleSelect ? "radio" : "checkbox"} 
                          name={`course-${key}-mobile`} 
                          className={`w-3.5 h-3.5 text-[#003893] border-slate-300 focus:ring-2 focus:ring-blue-500/20 shrink-0 cursor-pointer ${
                            isSingleSelect ? 'rounded-full' : 'rounded'
                          }`}
                          checked={isChecked} 
                          onChange={() => onFilterChange(key, normalizedValue, item.id)} 
                        />
                        <span className="text-[13px] leading-snug">{display}</span>
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
    const nextFilters: FilterState = { ...selectedFilters }
    
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
            <div className="lg:hidden sticky top-[76px] z-30 bg-[#eff6ff] pt-2 pb-2 -mx-2 px-2 w-[calc(100%+16px)]">
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
