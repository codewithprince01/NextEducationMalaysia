'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Layers, BookOpen, ChevronDown, ChevronUp, X, ArrowRight, Search } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

// ── Cache ────────────────────────────────────────────────────────────────────
const CACHE_TTL = 10 * 60 * 1000
const cache = {
  get(key: string) {
    try {
      const raw = sessionStorage.getItem(`spec_list_${key}`)
      if (!raw) return null
      const { data, ts } = JSON.parse(raw)
      if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem(`spec_list_${key}`); return null }
      return data
    } catch { return null }
  },
  set(key: string, data: unknown) {
    try { sessionStorage.setItem(`spec_list_${key}`, JSON.stringify({ data, ts: Date.now() })) } catch { /* ignore */ }
  },
}

// ── Icons Mapping ────────────────────────────────────────────────────────────
const ICON_MAP: Record<number, any> = {
  0: Layers,
  1: BookOpen,
}
const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase()
  if (n.includes('engineer')) return Layers
  if (n.includes('tech') || n.includes('it') || n.includes('computer')) return Layers
  return BookOpen
}

// ── Sub-components ───────────────────────────────────────────────────────────

const SpecialtyCard = ({ item, index }: { item: any; index: number }) => {
  const Icon = ICON_MAP[index % 2] || Layers
  return (
    <Link
      href={`/specialization/${item.slug}`}
      className="group bg-white rounded-xl sm:rounded-2xl shadow-md hover:shadow-xl p-4 sm:p-5 transition-all duration-300 border border-gray-100 hover:border-blue-200 relative overflow-hidden block"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-gray-700 font-medium text-xs sm:text-sm">Study</span>
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-md">
              <Icon className="w-6 h-6" />
            </div>
          </div>
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-orange-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-1">
            <ArrowRight size={14} className="text-white" />
          </div>
        </div>
        <h3 className="text-gray-900 font-semibold text-sm sm:text-base mb-2 sm:mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 min-h-[2.5rem] sm:min-h-[3rem]">
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

const CategorySidebar = ({
  categories,
  selectedCategory,
  onSelect,
  isExpanded,
  setIsExpanded,
  totalCount
}: any) => (
  <div className="w-full lg:w-72 xl:w-80 flex-shrink-0 lg:self-start lg:sticky lg:top-24">
    <div className="bg-white rounded-xl shadow-md lg:shadow-lg p-3 sm:p-4 lg:p-5 max-h-[80vh] overflow-hidden flex flex-col transition-all duration-300">
      <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-800 mb-3 sm:mb-4">Categories</h3>
      
      <div
        className={`w-full flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer mb-2 flex-shrink-0 border-2 ${
          selectedCategory === 'all' ? 'bg-blue-50 border-blue-200' : 'border-transparent hover:bg-gray-50'
        }`}
        onClick={() => onSelect('all')}
      >
        <div className="flex items-center justify-between flex-1">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <BookOpen size={18} className={selectedCategory === 'all' ? 'text-blue-600' : 'text-gray-700'} />
            <span className={`font-medium text-xs sm:text-sm leading-tight truncate ${selectedCategory === 'all' ? 'text-blue-600' : 'text-gray-700'}`}>
              All Specializations
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-blue-600 text-white">
              {totalCount}
            </span>
          </div>
        </div>
      </div>

      <div className={`overflow-y-auto lg:block lg:max-h-[60vh] lg:space-y-1 ${isExpanded ? 'block max-h-[60vh] space-y-1' : 'hidden lg:block'}`}>
        {categories.map((cat: any) => {
          const Icon = getCategoryIcon(cat.name)
          const isSelected = selectedCategory === cat.slug
          return (
            <div
              key={cat.id}
              className={`w-full flex items-center gap-2 sm:gap-3 p-2 sm:p-2.5 rounded-lg sm:rounded-xl transition-all duration-200 cursor-pointer border-2 ${
                isSelected ? 'bg-blue-50 border-blue-200' : 'border-transparent hover:bg-gray-50'
              }`}
              onClick={() => onSelect(cat.slug)}
            >
              <div className="flex items-center justify-between flex-1 min-w-0">
                <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                  <Icon size={16} className={`flex-shrink-0 ${isSelected ? 'text-blue-600' : 'text-gray-700'}`} />
                  <span className={`font-medium text-xs sm:text-sm leading-tight truncate ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                    {cat.name}
                  </span>
                </div>
                {cat.specializations_count !== undefined && (
                  <span className={`text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full ${isSelected ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {cat.specializations_count}
                  </span>
                )}
              </div>
            </div>
          )
        })}
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

  useEffect(() => {
    const fetchData = async () => {
      const cachedData = cache.get('all_data')
      if (cachedData) {
        setCategories(cachedData.categories)
        setSpecializations(cachedData.specializations)
        setPageContent(cachedData.pageContent)
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const [catRes, specRes, contentRes] = await Promise.all([
          fetch(`${API_BASE}/course-categories`),
          fetch(`${API_BASE}/specializations`),
          fetch(`${API_BASE}/specialization-page-content`)
        ])
        const catJson = await catRes.json()
        const specJson = await specRes.json()
        const contentJson = await contentRes.json()

        const data = {
          categories: catJson.data || [],
          specializations: specJson.data || [],
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

  const filteredSpecs = useMemo(() => {
    let result = specializations
    if (selectedCategory !== 'all') {
      result = result.filter(s => s.course_category?.slug === selectedCategory || s.course_category_id === categories.find(c => c.slug === selectedCategory)?.id)
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(s => s.name.toLowerCase().includes(query))
    }
    return result
  }, [specializations, selectedCategory, searchQuery, categories])

  const description = pageContent?.contents?.description || ''
  const descriptionPreview = description.length > 300 ? description.substring(0, 300) + '...' : description
  const hasLongDescription = description.length > 300

  if (loading) {
    return (
      <div className="min-h-screen animate-pulse">
        <div className="h-[55vh] bg-blue-900" />
        <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
          <div className="h-40 bg-white rounded-xl" />
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="h-80 bg-white rounded-xl" />
            <div className="lg:col-span-3 h-screen bg-white rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Specializations' }]} />

      {/* Hero */}
      <div className="relative min-h-[55vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <img
          src="/girl-banner.png"
          alt=""
          aria-hidden="true"
          className="hidden md:block absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-indigo-900/80" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Discover Your Perfect
            <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
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
        <section className="bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-8 md:px-8 lg:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg shadow-sm relative p-4 md:p-6">
              {showMore && (
                <button
                  onClick={() => setShowMore(false)}
                  className="absolute top-3 right-3 z-20 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-all"
                >
                  <X size={20} />
                </button>
              )}
              <div className={`prose prose-blue max-w-none text-gray-700 ${showMore ? '' : 'max-h-[150px] overflow-hidden'}`}>
                <div dangerouslySetInnerHTML={{ __html: showMore ? description : descriptionPreview }} />
              </div>
              {!showMore && hasLongDescription && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-50 to-transparent pointer-events-none" />
              )}
              {hasLongDescription && !showMore && (
                <button
                  onClick={() => setShowMore(true)}
                  className="mt-4 text-white bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-full flex items-center gap-2 transform hover:scale-105 transition-all mx-auto md:mx-0"
                >
                  Show More <ChevronDown size={16} />
                </button>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Main Grid */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 px-4 py-12 md:px-8 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          <CategorySidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
            isExpanded={isSidebarExpanded}
            setIsExpanded={setIsSidebarExpanded}
            totalCount={specializations.length}
          />

          <div className="flex-1">
            <div className="mb-6 sticky top-16 z-40 bg-gray-50/90 backdrop-blur-sm py-2 rounded-xl">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search specializations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-400 transition-all shadow-sm"
                />
              </div>
            </div>

            {filteredSpecs.length > 0 ? (
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
