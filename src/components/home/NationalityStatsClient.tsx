'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Globe2,
  Users,
  TrendingUp,
  Award,
  Search,
  Loader2,
  AlertCircle,
  Filter,
  BarChart3,
  Calendar,
  X
} from 'lucide-react'

// --- Utility: HEX Colors for Countries ---

const COLOR_MAP: Record<string, string> = {
  "bg-emerald-300": "#6ee7b7",
  "bg-red-300": "#fca5a5",
  "bg-blue-300": "#93c5fd",
  "bg-amber-300": "#fcd34d",
  "bg-purple-300": "#d8b4fe",
  "bg-lime-300": "#bef264",
  "bg-orange-300": "#fdba74",
  "bg-pink-300": "#f9a8d4",
  "bg-cyan-300": "#67e8f9",
  "bg-rose-300": "#fda4af",
}

const DEFAULT_COLOR = "#94a3b8"

// --- Types ---

type CountryStat = {
  country_id: number | null
  country: string | null
  slug: string | null
  color: string | null
  count: number
}

type YearData = {
  year: number
  total: number
  items: CountryStat[]
}

type ApiResponse = {
  overall_total: number
  years: YearData[]
}

// --- Skeleton ---

const NationalitySkeleton = () => (
  <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 p-6 space-y-8 animate-pulse">
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-16 h-16 bg-gray-200 rounded-2xl" />
        <div className="w-2/3 h-10 bg-gray-200 rounded-lg" />
        <div className="w-1/2 h-6 bg-gray-200 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-gray-200 rounded-2xl" />)}
      </div>
      <div className="h-[400px] bg-gray-200 rounded-3xl" />
    </div>
  </div>
)

// --- Main Component ---

export default function NationalityStatsClient() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [hoverInfo, setHoverInfo] = useState<{ country: string; year: number; value: number; color: string } | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        const res = await fetch('/api/international-student-data-stats/stats/years')
        const json = await res.json()
        if (json.error) throw new Error(json.error)
        
        setData(json)
        
        // Extract unique countries
        const countries: string[] = []
        json.years.forEach((y: YearData) => {
          y.items.forEach(item => {
            const name = item.country || "Unknown"
            if (!countries.includes(name)) countries.push(name)
          })
        })
        setSelectedCountries(countries)
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load stats')
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  // Derived Data
  const countryColors = useMemo(() => {
    if (!data) return {}
    const map: Record<string, string> = {}
    data.years.forEach(y => {
      y.items.forEach(item => {
        const name = item.country || "Unknown"
        if (!map[name]) {
          map[name] = COLOR_MAP[item.color || ''] || DEFAULT_COLOR
        }
      })
    })
    return map
  }, [data])

  const chartData = useMemo(() => {
    if (!data) return []
    // Reversed to show oldest to newest if needed, but let's keep it desc for now like Field Study
    return [...data.years].sort((a,b) => a.year - b.year)
  }, [data])

  const filteredCountries = useMemo(() => {
    return Object.keys(countryColors).filter(c => 
      c.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort()
  }, [countryColors, searchTerm])

  const chartStats = useMemo(() => {
    if (!data || chartData.length === 0) return null
    
    const newest = chartData[chartData.length - 1]
    const oldest = chartData[0]
    
    const leading = newest.items.reduce((max, curr) => curr.count > max.count ? curr : max, newest.items[0])
    
    let growth = 'N/A'
    if (oldest.total > 0) {
      const g = Math.round(((newest.total - oldest.total) / oldest.total) * 100)
      growth = g > 0 ? `+${g}%` : `${g}%`
    }

    return {
      leading: leading.country || 'Unknown',
      leadingCount: leading.count,
      growth,
      period: `${oldest.year}-${newest.year}`,
      totalCountries: Object.keys(countryColors).length
    }
  }, [data, chartData, countryColors])

  const handleToggleCountry = (country: string) => {
    setSelectedCountries(prev => {
      if (prev.length === Object.keys(countryColors).length) return [country]
      if (prev.length === 1 && prev.includes(country)) return Object.keys(countryColors)
      if (prev.includes(country)) return prev.filter(c => c !== country)
      return [...prev, country]
    })
  }

  if (loading) return <NationalitySkeleton />

  if (error || !data) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Technical Difficulties</h3>
        <p className="text-gray-600 mb-6">{error || "Data not available"}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Retry Connection
        </button>
      </div>
    )
  }

  // Bar Chart Dimensions
  const yMax = Math.max(...chartData.map(y => y.total))
  const chartHeight = 350
  
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50 pb-20">
      {/* Header / Hero Section */}
      <div className="bg-white/80 backdrop-blur-xl shadow-lg border-b border-white/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-[#003893] to-[#003893] rounded-2xl mb-3 sm:mb-4 shadow-lg">
              <Globe2 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 sm:mb-3 px-4">
              Global Footprint of International Student Applications to Malaysia
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-3xl mx-auto px-4">
              Top {data.years[0]?.items.length || 0} Highest Application Countries for New Applications Received
            </p>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              {data.overall_total.toLocaleString()} total applications across {Object.keys(countryColors).length} source countries
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-12">
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl shadow-inner bg-emerald-100 text-emerald-600">
                <Users className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-1">Total Applications</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{data.overall_total.toLocaleString()}</p>
              <p className="text-[11px] sm:text-xs text-slate-500">Across {chartData.length} years</p>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl shadow-inner bg-blue-100 text-blue-600">
                <Globe2 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-1">Countries</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{Object.keys(countryColors).length}</p>
              <p className="text-[11px] sm:text-xs text-slate-500">Top source countries</p>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl shadow-inner bg-amber-100 text-amber-600">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-1">Growth Rate</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{chartStats?.growth}</p>
              <p className="text-[11px] sm:text-xs text-slate-500">{chartStats?.period} period</p>
            </div>
          </div>
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-4 sm:p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl shadow-inner bg-rose-100 text-rose-600">
                <Award className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-slate-600 mb-1">Leading Source Country</p>
              <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 truncate">{chartStats?.leading}</p>
              <p className="text-[11px] sm:text-xs text-slate-500">{chartStats?.leadingCount.toLocaleString()} applications</p>
            </div>
          </div>
        </div>

        {/* Filters & Legend */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-4 sm:p-6 mb-6 sm:mb-8">
           <div className="mb-4">
              <input 
                 type="text" 
                 placeholder="Search countries..."
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full px-4 py-2 text-sm sm:text-base border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003893] focus:border-transparent bg-white/80"
              />
           </div>
           
           <div className="flex flex-wrap gap-3 sm:gap-4 max-h-48 overflow-y-auto scrollbar-hide">
              {filteredCountries.map(country => (
                <button
                  key={country}
                  onClick={() => handleToggleCountry(country)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all hover:bg-slate-50 shadow-sm ${
                    selectedCountries.includes(country)
                      ? 'opacity-100 bg-slate-50 ring-1 ring-slate-200'
                      : 'opacity-50 grayscale'
                  }`}
                >
                  <div 
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full shadow" 
                    style={{ backgroundColor: countryColors[country] }}
                  />
                  <span className="text-slate-700">{country}</span>
                </button>
              ))}
           </div>
        </div>

        {/* Stacked Chart Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/40 p-4 sm:p-8 mb-6 sm:mb-10">
           {/* Chart Header */}
           <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-4 text-center">
              Application Volume by Year & Country
           </h3>

           {/* Tooltip Overlay */}
           {hoverInfo && (
              <div className="absolute top-12 right-12 bg-gray-900 text-white p-4 rounded-2xl shadow-2xl z-20 animate-in fade-in zoom-in duration-200 border border-gray-800 backdrop-blur-md">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: hoverInfo.color }} />
                    <span className="font-black text-sm">{hoverInfo.country}</span>
                 </div>
                 <div className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Year {hoverInfo.year}</div>
                 <div className="text-xl font-black">{hoverInfo.value.toLocaleString()} <span className="text-xs font-normal text-gray-500">Applications</span></div>
              </div>
           )}

           <div className="w-full overflow-x-auto pb-8 scrollbar-hide">
              <div className="min-w-[800px] flex items-end justify-between px-4" style={{ height: chartHeight }}>
                 {chartData.map(y => {
                    const activeItems = y.items.filter(item => selectedCountries.includes(item.country || "Unknown"))
                    const activeTotal = activeItems.reduce((sum, item) => sum + item.count, 0)
                    
                    return (
                       <div key={y.year} className="flex-1 flex flex-col items-center group relative h-full">
                          {/* Y-axis bars */}
                          <div className="flex-1 w-20 flex flex-col-reverse items-center justify-start h-full">
                             <div className="w-full bg-gray-50/50 rounded-t-2xl overflow-hidden flex flex-col-reverse shadow-inner border border-gray-100 group-hover:shadow-2xl transition-all duration-300 h-full">
                                {y.items.map((item, idx) => {
                                   const isSelected = selectedCountries.includes(item.country || "Unknown")
                                   const heightRatio = (item.count / yMax) * 100
                                   
                                   return (
                                      <div 
                                        key={idx}
                                        className="w-full transition-all duration-500 cursor-crosshair hover:brightness-110 flex items-center justify-center group/segment"
                                        style={{ 
                                          height: `${heightRatio}%`, 
                                          backgroundColor: isSelected ? countryColors[item.country || "Unknown"] : '#f3f4f6',
                                          opacity: isSelected ? 1 : 0.2
                                        }}
                                        onMouseEnter={() => isSelected && setHoverInfo({
                                          country: item.country || "Unknown",
                                          year: y.year,
                                          value: item.count,
                                          color: countryColors[item.country || "Unknown"]
                                        })}
                                        onMouseLeave={() => setHoverInfo(null)}
                                      >
                                         {heightRatio > 5 && isSelected && (
                                           <span className="text-[9px] font-black text-white drop-shadow-sm opacity-0 group-hover/segment:opacity-100 transition-opacity">
                                              {item.count > 1000 ? `${(item.count/1000).toFixed(1)}k` : item.count}
                                           </span>
                                         )}
                                      </div>
                                   )
                                })}
                             </div>
                          </div>
                          
                          {/* Labels */}
                          <div className="mt-6 flex flex-col items-center">
                             <div className="text-lg font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-widest">{y.year}</div>
                             <div className="text-[10px] font-bold text-gray-400">{y.total.toLocaleString()} TOTAL</div>
                          </div>
                       </div>
                    )
                 })}
              </div>
           </div>
        </div>

        {/* Interactive Tip */}
        <div className="text-center py-6">
           <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/50 backdrop-blur-sm rounded-2xl shadow-sm border border-white">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              <span className="text-gray-500 font-bold italic">Toggle countries in the legend to adjust the visualization trends</span>
           </div>
        </div>
      </div>
    </div>
  )
}
