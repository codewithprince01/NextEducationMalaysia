'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { 
  Layers, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  X, 
  ArrowRight, 
  Search, 
  Sparkles, 
  Star, 
  Wrench, 
  Monitor, 
  Heart, 
  Briefcase, 
  FlaskConical, 
  Palette, 
  Globe, 
  Calculator,
  GraduationCap
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

// ── Cache ────────────────────────────────────────────────────────────────────
const CACHE_TTL = 10 * 60 * 1000
const CACHE_VERSION = 'v3'
const cache = {
  get(key: string) {
    try {
      const raw = sessionStorage.getItem(`spec_list_${CACHE_VERSION}_${key}`)
      if (!raw) return null
      const { data, ts } = JSON.parse(raw)
      if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem(`spec_list_${CACHE_VERSION}_${key}`); return null }
      return data
    } catch { return null }
  },
  set(key: string, data: unknown) {
    try { sessionStorage.setItem(`spec_list_${CACHE_VERSION}_${key}`, JSON.stringify({ data, ts: Date.now() })) } catch { /* ignore */ }
  },
}

const normalizeCategories = (items: any[] = []) =>
  items.map((item) => ({
    ...item,
    id: Number(item.id),
    number_of_specialization: Number(item.number_of_specialization || 0),
  }))

const normalizeSpecializations = (items: any[] = []) =>
  items.map((item) => ({
    ...item,
    course_category_id:
      item.course_category_id === null || item.course_category_id === undefined
        ? null
        : Number(item.course_category_id),
  }))

// ── Icons Mapping ────────────────────────────────────────────────────────────
// ── Icons Mapping ────────────────────────────────────────────────────────────
const GET_SPECIALIZATION_ICON = (index: number) => {
  const icons = [
    Sparkles,
    Star,
    Wrench,
    Monitor,
    Heart,
    Briefcase,
    FlaskConical,
    Palette,
    Globe,
    Calculator,
  ];
  return icons[index % icons.length];
};

const getCategoryIcon = (categoryName: string) => {
  const name = categoryName.toLowerCase();
  if (name.includes("tech") || name.includes("computer")) return Monitor;
  if (name.includes("business") || name.includes("management"))
    return Briefcase;
  if (name.includes("health") || name.includes("medical")) return Heart;
  if (name.includes("engineering")) return Wrench;
  if (name.includes("art") || name.includes("design")) return Palette;
  if (name.includes("science")) return FlaskConical;
  return GraduationCap;
};

// ── Sub-components ───────────────────────────────────────────────────────────

const SpecialtyCard = ({ item, index }: { item: any; index: number }) => {
  const Icon = GET_SPECIALIZATION_ICON(index)
  return (
    <Link
      href={`/specialization/${item.slug}`}
      className="group bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl p-4 sm:p-5 transition-all duration-300 border border-gray-100 hover:border-blue-200 relative overflow-hidden block"
    >
      <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-gray-700 font-medium text-xs sm:text-sm">Study</span>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-linear-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-md">
              <Icon className="w-6 h-6" />
            </div>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
            <ArrowRight size={14} className="text-white sm:w-4 sm:h-4" />
          </div>
        </div>
        <h3 className="text-gray-900 font-semibold text-sm sm:text-base mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 min-h-10 sm:min-h-12">
          {item.name}
        </h3>
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-full">
            In Malaysia
          </div>
          <span className="text-xs text-gray-500 font-medium">Explore</span>
        </div>
      </div>
    </Link>
  )
}

const SpecializationSkeleton = () => (
  <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 animate-pulse">
    {[...Array(8)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-3 bg-gray-200 rounded"></div>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200"></div>
          </div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-2/3 mb-3"></div>
        <div className="flex items-center justify-between">
          <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
          <div className="w-12 h-3 bg-gray-100 rounded"></div>
        </div>
      </div>
    ))}
  </div>
)

const CategorySidebar = ({
  categories,
  selectedCategory,
  onSelect,
  isExpanded,
  setIsExpanded,
  totalCount,
  categoryCounts
}: any) => (
  <div className="w-full lg:w-72 xl:w-80 shrink-0 lg:self-start lg:sticky lg:top-24">
    <div className="bg-white rounded-xl shadow-md lg:shadow-lg p-3 sm:p-4 lg:p-5 max-h-[80vh] overflow-hidden flex flex-col transition-all duration-300">
      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-3 sm:mb-4">
        Categories
      </h3>

      <div
        className="w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer bg-blue-50 border-2 border-blue-200 mb-2 shrink-0"
        onClick={() => {
          onSelect('all')
          setIsExpanded(!isExpanded)
        }}
      >
        <div className="flex items-center justify-between flex-1">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <BookOpen
              size={18}
              className="text-blue-600 shrink-0 sm:w-5 sm:h-5"
            />
            <span className="font-medium text-xs sm:text-sm leading-tight text-blue-600 truncate">
              All Specializations
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full shrink-0 bg-blue-600 text-white">
              {totalCount}
            </span>
            <div className="lg:hidden">
              {isExpanded ? (
                <ChevronUp size={16} className="text-blue-600" />
              ) : (
                <ChevronDown size={16} className="text-blue-600" />
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden flex flex-col pt-1">
        <div
          className={`overflow-y-auto overflow-x-hidden transition-all duration-300 pr-[25px]
          [&::-webkit-scrollbar]:w-[6px] 
          [&::-webkit-scrollbar-track]:bg-[#f1f5f9] 
          [&::-webkit-scrollbar-track]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-[#1d4ed8] 
          [&::-webkit-scrollbar-thumb]:rounded-full
          lg:block! lg:max-h-[60vh]! lg:opacity-100! lg:space-y-1
          ${isExpanded ? "block max-h-[60vh] opacity-100 space-y-1" : "hidden max-h-0 opacity-0"}`}
        >
          {categories.map((cat: any) => {
            const IconComponent = getCategoryIcon(cat.name)
            const isSelected = selectedCategory === cat.slug
            const count = categoryCounts[cat.id] || 0

            return (
              <div
                key={cat.id}
                className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? "bg-blue-50 border-2 border-blue-200"
                    : "hover:bg-gray-50 border-2 border-transparent"
                }`}
                onClick={() => onSelect(cat.slug)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onSelect(cat.slug)}
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer shrink-0"
                  onClick={(e) => e.stopPropagation()}
                />

                <div className="flex items-center justify-between flex-1 min-w-0">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <IconComponent
                      size={16}
                      className={`shrink-0 sm:w-5 sm:h-5 ${isSelected ? "text-blue-600" : "text-gray-700"}`}
                    />
                    <span
                      className={`font-medium text-xs sm:text-sm leading-tight truncate ${
                        isSelected ? "text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {cat.name}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full shrink-0 ml-1 sm:ml-2 min-w-[24px] text-center ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {count}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  </div>
)

// ── Main Page Component ──────────────────────────────────────────────────────

export default function SpecializationListClient() {
  const [categories, setCategories] = useState<any[]>([])
  const [specializations, setSpecializations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showMore, setShowMore] = useState(false)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false)
  const [pageContent, setPageContent] = useState<any>(null)
  const resultsTopRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const cachedData = cache.get('all_data')
      if (cachedData) {
        setCategories(normalizeCategories(cachedData.categories || []))
        setSpecializations(normalizeSpecializations(cachedData.specializations || []))
        setPageContent(cachedData.pageContent)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        console.log(`[SpecializationListClient] Fetching with API_KEY: "${API_KEY.substring(0, 5)}..." to ${API_BASE}`)
        const [catRes, specRes, contentRes] = await Promise.all([
          fetch(`${API_BASE}/specializations/course-categories`, { headers: { 'x-api-key': API_KEY } }),
          fetch(`${API_BASE}/specializations`, { headers: { 'x-api-key': API_KEY } }),
          fetch(`${API_BASE}/page-contents/specialization`, { headers: { 'x-api-key': API_KEY } })
        ])
        const catJson = await catRes.json()
        const specJson = await specRes.json()
        const contentJson = await contentRes.json()

        const data = {
          categories: normalizeCategories(catJson.data || []),
          specializations: normalizeSpecializations(specJson.data || []),
          pageContent: contentJson.data || null
        }
        setCategories(data.categories)
        setSpecializations(data.specializations)
        setPageContent(data.pageContent)
        cache.set('all_data', data)
      } catch (err) {
        console.error('Failed to fetch specialization data', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const categoryCounts = useMemo(() => {
    const counts: Record<number, number> = {}
    specializations.forEach(s => {
      const catId = Number(s.course_category_id)
      if (Number.isFinite(catId) && catId > 0) {
        counts[catId] = (counts[catId] || 0) + 1
      }
    })
    return counts
  }, [specializations])

  const filteredSpecs = useMemo(() => {
    let result = specializations
    if (selectedCategory !== 'all') {
      const selectedCategoryId = categories.find(c => c.slug === selectedCategory)?.id
      result = result.filter(
        (s) =>
          s.course_category?.slug === selectedCategory ||
          Number(s.course_category_id) === selectedCategoryId
      )
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(s => s.name.toLowerCase().includes(query))
    }
    return result
  }, [specializations, selectedCategory, searchQuery, categories])

  const description = pageContent?.contents?.description || ''
  const descriptionPreview = description.length > 200 ? description.substring(0, 200) + '...' : description
  const hasLongDescription = description.length > 200

  const handleCategorySelect = (slug: string) => {
    setSelectedCategory(slug)
    requestAnimationFrame(() => {
      const el = resultsTopRef.current
      if (!el) return
      const navOffset = 96
      const y = el.getBoundingClientRect().top + window.scrollY - navOffset
      window.scrollTo({ top: Math.max(y, 0), behavior: 'smooth' })
    })
  }


  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Specialization' }]} />

      {/* Hero */}
      <div className="relative min-h-[55vh] flex items-center justify-center overflow-hidden bg-linear-to-br from-blue-900 via-purple-900 to-indigo-900">
        <img
          src="/girl-banner.png"
          alt=""
          aria-hidden="true"
          className="hidden md:block absolute inset-0 w-full h-full object-cover object-center scale-105"
        />
        <div className="absolute inset-0 bg-linear-to-br from-blue-900/80 via-purple-900/70 to-indigo-900/80" />
        <div className="relative z-10 text-center px-4 md:px-8 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Discover Your Perfect
            <span className="block bg-linear-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              Specialization
            </span>
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Start your academic journey with the right path. Explore top courses and fields of study in Malaysia with expert guidance.
          </p>
        </div>
      </div>

	      {/* Description */}
		      {description && (
		        <section className="bg-linear-to-br from-gray-50 to-blue-50 px-3 sm:px-4 py-4 sm:py-6 md:py-8 md:px-8 lg:px-12">
		          <div className="max-w-7xl mx-auto">
		            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg shadow-sm relative">
		              {showMore && (
		                <button
		                  onClick={() => setShowMore(false)}
		                  className="absolute top-3 right-3 z-20 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
		                >
		                  <X size={20} />
		                </button>
		              )}
		              <div className="p-4 sm:p-5 md:p-6">
		                <div className="relative">
		                  <div 
		                    className={`content-html text-gray-700 text-sm sm:text-base transition-all duration-300 ease-in-out
                    ${showMore ? 'max-h-[65vh] overflow-y-auto pr-2' : 'max-h-[300px]'}
		                    ${!showMore && 'overflow-hidden'}
		                    [&>p]:mb-3 sm:[&>p]:mb-4 [&>p]:leading-relaxed [&>p]:text-sm sm:[&>p]:text-base
		                    [&>ul]:my-4 sm:[&>ul]:my-6 [&>ul]:pl-5 sm:[&>ul]:pl-6 [&>ul]:list-disc
		                    [&>ul>li]:mb-2 sm:[&>ul>li]:mb-3 [&>ul>li]:pl-2 [&>ul>li]:leading-relaxed [&>ul>li]:text-sm sm:[&>ul>li]:text-base
		                    [&>h2]:text-xl sm:[&>h2]:text-2xl [&>h2]:font-semibold [&>h2]:mt-4 sm:[&>h2]:mt-6 [&>h2]:mb-3 sm:[&>h2]:mb-4 [&>h2]:text-gray-800
		                    [&>h3]:text-lg sm:[&>h3]:text-xl [&>h3]:font-semibold [&>h3]:mt-3 sm:[&>h3]:mt-4 [&>h3]:mb-2 sm:[&>h3]:mb-3 [&>h3]:text-gray-800
		                    [&>strong]:font-semibold [&>strong]:text-gray-900
		                    [&>div>table]:w-full [&>div>table]:border-collapse [&>div>table]:text-sm
		                    [&>div>table>thead>tr>th]:p-3 [&>div>table>thead>tr>th]:bg-blue-100/50 [&>div>table>thead>tr>th]:text-blue-900 [&>div>table>thead>tr>th]:border-b [&>div>table>thead>tr>th]:border-blue-200 [&>div>table>thead>tr>th]:text-left [&>div>table>thead>tr>th]:font-semibold
		                    [&>div>table>tbody>tr>td]:p-3 [&>div>table>tbody>tr>td]:border-b [&>div>table>tbody>tr>td]:border-gray-100 [&>div>table>tbody>tr:last-child>td]:border-0`}
		                    dangerouslySetInnerHTML={{ __html: showMore ? description : descriptionPreview }} 
		                  />
		                  {!showMore && hasLongDescription && (
		                    <div className="absolute bottom-0 left-0 right-0 h-24 bg-linear-to-t from-blue-50 to-transparent pointer-events-none sm:h-32" />
		                  )}
		                </div>
		                {hasLongDescription && !showMore && (
		                  <div className="relative z-10 mt-2 sm:mt-4 flex justify-center sm:justify-start">
		                    <button
		                      onClick={() => setShowMore(true)}
		                      className="text-white bg-blue-600 font-medium hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 px-5 py-2 rounded-full shadow-md text-sm sm:text-base cursor-pointer transform hover:scale-105"
		                    >
		                      Show More <ChevronDown size={16} />
		                    </button>
		                  </div>
		                )}
		              </div>
		            </div>
		          </div>
		        </section>
		      )}

      {/* Main Grid */}
      <section className="bg-linear-to-br from-gray-50 to-blue-50 px-3 sm:px-4 py-6 sm:py-8 md:py-12 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={handleCategorySelect}
            isExpanded={isSidebarExpanded}
            setIsExpanded={setIsSidebarExpanded}
            categoryCounts={categoryCounts}
            totalCount={specializations.length}
          />

          <div className="flex-1 min-w-0">
            <div ref={resultsTopRef} />
            <div className="mb-4 sm:mb-6 sticky top-16 z-40 bg-linear-to-br from-gray-50 to-blue-50 py-2 -mx-1 px-1 rounded-xl">
              <input
                type="text"
                placeholder="Search specializations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg sm:rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:outline-none shadow-sm"
              />
            </div>

            {loading && filteredSpecs.length === 0 ? (
              <SpecializationSkeleton />
            ) : filteredSpecs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSpecs.map((item, index) => (
                  <SpecialtyCard key={item.id} item={item} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Layers size={32} className="text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">No Specializations Found</h3>
                <p className="text-gray-500 mt-2">Try adjusting your search or category selection.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
