'use client'

import React, { useState, useMemo, useRef, useEffect } from 'react'
import {
  BookOpen,
  Calendar,
  TrendingUp,
  Globe,
  Filter,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle
} from 'lucide-react'

// --- Types ---

type StatItem = {
  category_id: number
  category: string | null
  slug: string | null
  color: string | null
  count: number
}

type YearData = {
  year: number
  total: number
  items: StatItem[]
}

type StatsResponse = {
  overall_total: number
  years: YearData[]
}

type Category = {
  id: number
  category_name: string
  color_class: string | null
}

// --- Skeleton Component ---

const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
)

const FieldStudySkeleton = () => (
  <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-8">
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <Skeleton className="w-16 h-16 rounded-xl" />
        <Skeleton className="w-2/3 h-10" />
        <Skeleton className="w-1/2 h-6" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-48 rounded-2xl" />)}
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  </div>
)

// --- Main Component ---

export default function FieldStudyClient() {
  const [years, setYears] = useState<number[]>([])
  const [selectedYears, setSelectedYears] = useState<number[]>([])
  const [allCategories, setAllCategories] = useState<any[]>([])
  const [statsData, setStatsData] = useState<StatsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [yearsRes, categoriesRes, statsRes] = await Promise.all([
          fetch('/api/emgs/years').then(r => r.json()),
          fetch('/api/emgs/categories').then(r => r.json()),
          fetch('/api/emgs/stats').then(r => r.json())
        ])

        if (yearsRes.error || categoriesRes.error || statsRes.error) {
          throw new Error('Failed to fetch data')
        }

        setYears(yearsRes)
        setSelectedYears(yearsRes)
        setStatsData(statsRes)
        
        // Extract categories with unique info
        const catMap = new Map()
        statsRes.years.forEach((y: YearData) => {
          y.items.forEach(item => {
            if (!catMap.has(item.category_id)) {
              catMap.set(item.category_id, {
                id: item.category_id,
                name: item.category,
                slug: item.slug,
                color: item.color
              })
            }
          })
        })
        setAllCategories(Array.from(catMap.values()).sort((a, b) => a.id - b.id))
        
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const scrollLeft = () => scrollRef.current?.scrollBy({ left: -300, behavior: 'smooth' })
  const scrollRight = () => scrollRef.current?.scrollBy({ left: 300, behavior: 'smooth' })

  const filteredYearsData = useMemo(() => {
    if (!statsData) return []
    return statsData.years.filter(y => selectedYears.includes(y.year))
  }, [selectedYears, statsData])

  const totalApplications = useMemo(() => {
    return filteredYearsData.reduce((sum, y) => sum + y.total, 0)
  }, [filteredYearsData])

  const toggleYear = (year: number) => {
    setSelectedYears(prev => {
      if (prev.length === years.length) return [year]
      if (prev.length === 1 && prev.includes(year)) return [...years].sort()
      if (prev.includes(year)) {
        const next = prev.filter(y => y !== year)
        return next.length > 0 ? next : [year]
      }
      return [...prev, year].sort()
    })
  }

  if (loading) return <FieldStudySkeleton />

  if (error) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Stats</h3>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pb-16">
      {/* Header Section */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-linear-to-r from-[#003893] to-[#003893] rounded-xl mb-3 sm:mb-4 shadow-lg">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-3 px-4">
              Top Study Areas Preferred by International Students
            </h1>
            <p className="text-sm sm:text-base text-gray-600 max-w-4xl mx-auto px-4">
              Distribution by Field of Study for New Application Received (
              {years.length > 0
                ? `${Math.min(...years)} - ${Math.max(...years)}`
                : "N/A"}
              )
            </p>
          </div>

          {/* Year Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mt-4 sm:mt-6">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white/70 backdrop-blur-sm border border-gray-200 rounded-lg hover:bg-white/90 transition-all duration-200 shadow-md text-sm sm:text-base"
            >
              <Filter className="w-4 h-4" />
              Filter Years
            </button>

            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
              <BarChart3 className="w-4 h-4" />
              {selectedYears.length} of {years.length} years selected
            </div>
          </div>

          {/* Year Selection */}
          <div
            className={`transition-all duration-300 overflow-hidden ${showFilters ? "max-h-96 mt-4" : "max-h-0"}`}
          >
            <div className="overflow-x-auto p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-lg shadow-md scrollbar-hide">
              <div className="flex justify-center gap-2 min-w-max">
                {years.map((year) => (
                  <button
                    key={year}
                    onClick={() => toggleYear(year)}
                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                      selectedYears.includes(year)
                        ? "bg-linear-to-r from-[#003893] to-[#003893] text-white shadow-lg transform scale-105"
                        : "bg-white/80 text-gray-600 border border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-md"
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <p className="text-sm sm:text-base text-gray-600 max-w-4xl mx-auto px-4 mt-4 text-center">
            Source: Education Malaysia Global Services (EMGS) – Official Website
            Data compiled from publicly available information.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Summary */}
        {selectedYears.length > 0 && (
          <div className="text-center">
            <p className="text-xl sm:text-2xl font-bold text-gray-900">
              {totalApplications.toLocaleString()} Total Applications
            </p>
            <p className="text-sm sm:text-base text-gray-600">
              Across {selectedYears.length} years ({Math.min(...selectedYears)}{" "}
              - {Math.max(...selectedYears)})
            </p>
          </div>
        )}

        {/* Legend */}
        {allCategories.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 text-xs sm:text-sm px-2">
            {allCategories.map((cat) => (
              <div key={cat.id} className="flex items-center gap-1.5 sm:gap-2">
                <div
                  className={`w-3 h-3 sm:w-4 sm:h-4 ${cat.color || 'bg-gray-400'} rounded shadow-sm`}
                ></div>
                <span className="font-medium text-gray-700">{cat.name}</span>
              </div>
            ))}
          </div>
        )}

        {/* Year Row Cards with Arrow Navigation */}
        <div className="relative group">
          <button 
            onClick={scrollLeft}
            className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl items-center justify-center hidden md:flex border border-gray-100 hover:bg-blue-600 hover:text-white transition-all scale-0 group-hover:scale-100"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          
          <div 
            ref={scrollRef}
            className="flex gap-6 overflow-x-auto pb-6 pt-2 scrollbar-hide snap-x"
          >
            {filteredYearsData.map(y => (
              <div 
                key={y.year} 
                className="w-80 shrink-0 bg-white rounded-[2rem] p-8 shadow-xl shadow-slate-200/40 border border-white hover:shadow-2xl hover:translate-y-[-4px] transition-all snap-center"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="text-2xl font-black text-gray-900">{y.year}</div>
                  <div className="px-3 py-1 bg-gray-50 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-wider">
                    {y.total.toLocaleString()} Total
                  </div>
                </div>
                <div className="space-y-4">
                  {y.items.map((item, idx) => (
                    <div key={idx} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-bold text-gray-700 truncate max-w-[180px]">{item.category}</span>
                        <span className="font-black text-gray-900">{item.count.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-2 bg-gray-50 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${item.color || 'bg-blue-500'} rounded-full transition-all duration-1000`} 
                          style={{ width: `${(item.count / y.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={scrollRight}
            className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white rounded-full shadow-xl items-center justify-center hidden md:flex border border-gray-100 hover:bg-blue-600 hover:text-white transition-all scale-0 group-hover:scale-100"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>

        {/* Summary by Field */}
        {allCategories.length > 0 && totalApplications > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-6">
            {allCategories
              .map((cat) => {
                const total = filteredYearsData.reduce((sum, yearData) => {
                  const item = yearData.items.find(
                    (i) => i.category_id === cat.id,
                  );
                  return sum + (item ? item.count : 0);
                }, 0);

                if (total === 0) return null;
                const percentage = ((total / totalApplications) * 100).toFixed(
                  1,
                );

                return {
                  cat,
                  total,
                  percentage,
                };
              })
              .filter(Boolean)
              .map(({ cat, total, percentage }: any) => (
                <div
                  key={cat.id}
                  className="bg-white/90 backdrop-blur rounded-2xl p-3 sm:p-4 shadow hover:shadow-md transition-all flex flex-col items-center justify-center border border-gray-100 group"
                >
                  <div
                    className={`w-8 h-8 sm:w-10 sm:h-10 ${cat.color} rounded-lg mb-2 shadow-sm group-hover:scale-110 transition-transform flex items-center justify-center`}
                  >
                    <span className="text-white text-xs font-bold">
                      {percentage}%
                    </span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
                    {total.toLocaleString()}
                  </div>
                  <div className="text-[10px] sm:text-xs text-center text-gray-500 font-medium line-clamp-2 mt-1 px-1 h-8 flex items-center justify-center">
                    {cat.name || "Unknown"}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* Trends */}
        {filteredYearsData.length > 1 && (
          <div className="bg-linear-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 sm:p-6 shadow-lg">
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-linear-to-r from-[#003893] to-[#003893] rounded-xl mb-3 sm:mb-4 shadow-lg">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                Key Insights & Trends
              </h2>
              <p className="text-sm sm:text-base text-gray-600">
                Analysis of field preferences over time
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {(() => {
                const firstYear = filteredYearsData[0];
                const lastYear =
                  filteredYearsData[filteredYearsData.length - 1];

                const socialSciFirst = firstYear.items.find(
                  (i) => i.slug === "social-sciences",
                );
                const socialSciLast = lastYear.items.find(
                  (i) => i.slug === "social-sciences",
                );
                const scienceFirst = firstYear.items.find(
                  (i) => i.slug === "science",
                );
                const scienceLast = lastYear.items.find(
                  (i) => i.slug === "science",
                );

                return (
                  <>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-emerald-600 mb-2">
                        {socialSciFirst && socialSciLast
                          ? Math.round(
                              ((socialSciLast.count - socialSciFirst.count) /
                                socialSciFirst.count) *
                                100,
                            )
                          : 0}
                        %
                      </div>
                      <div className="text-sm sm:text-base text-gray-700 font-medium">
                        Social Sciences Growth
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Since {firstYear.year}
                      </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-red-600 mb-2">
                        {scienceFirst && scienceLast
                          ? Math.round(
                              ((scienceLast.count - scienceFirst.count) /
                                scienceFirst.count) *
                                100,
                            )
                          : 0}
                        %
                      </div>
                      <div className="text-sm sm:text-base text-gray-700 font-medium">
                        Science & Computing Growth
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Since {firstYear.year}
                      </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg text-center">
                      <div className="text-2xl sm:text-3xl font-bold text-blue-600 mb-2">
                        {selectedYears.length}
                      </div>
                      <div className="text-sm sm:text-base text-gray-700 font-medium">
                        Years of Data
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500">
                        Comprehensive tracking
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        <div className="text-center py-10">
           <div className="inline-flex items-center gap-3 px-6 py-3 bg-white rounded-2xl shadow-md border border-gray-100">
              <Globe className="w-5 h-5 text-blue-500 animate-spin-slow" />
              <span className="text-gray-600 font-bold">Data provided by Education Malaysia Global Services (EMGS)</span>
           </div>
        </div>
      </div>
    </div>
  )
}
