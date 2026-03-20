'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, X, ChevronDown, Search } from 'lucide-react'
import UniversityListCard from '@/components/university/UniversityListCard'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

type Uni = { id: number } & Record<string, any>
type FilterOptions = { id: number; name: string }[]

type Props = {
  typeSlug: string
  typeName: string
  initialData?: Uni[]
  initialTotal?: number
  allTypes?: { id: number; type: string; slug?: string; seo_title_slug?: string }[]
  pageContent?: string
}

// Dropdown filter component (matches old project's Dropdown)
function Dropdown({ title, options, selectedValue, onSelect, showAllOption = false }: {
  title: string
  options: FilterOptions
  selectedValue: string
  onSelect: (v: string) => void
  showAllOption?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-w-[160px] cursor-pointer"
      >
        <span className="truncate">{selectedValue || title}</span>
        <ChevronDown className={`ml-2 h-4 w-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 z-30 mt-1 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1 max-h-60 overflow-y-auto">
            {showAllOption && (
              <button onClick={() => { onSelect(''); setOpen(false) }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 cursor-pointer">
                All Universities
              </button>
            )}
            {options.map(opt => (
              <button
                key={opt.id}
                onClick={() => { onSelect(opt.name); setOpen(false) }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 cursor-pointer ${selectedValue === opt.name ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
              >
                {opt.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Skeleton for cards
const CardSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse border border-gray-100">
        <div className="w-full h-48 bg-gray-200" />
        <div className="p-5">
          <div className="flex gap-3 mb-4"><div className="h-3 bg-gray-200 rounded w-20" /><div className="h-3 bg-gray-200 rounded w-20" /></div>
          <div className="h-7 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-7 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="space-y-2 mb-6"><div className="h-3 bg-gray-100 rounded w-full" /><div className="h-3 bg-gray-100 rounded w-5/6" /></div>
          <div className="grid grid-cols-3 gap-4 mb-6">{[1,2,3].map(s => <div key={s} className="h-16 bg-gray-50 rounded-xl" />)}</div>
          <div className="space-y-3"><div className="h-12 bg-gray-200 rounded-xl w-full" /></div>
        </div>
      </div>
    ))}
  </div>
)

export default function UniversityListClient({
  typeSlug, typeName, initialData = [], initialTotal = 0, allTypes = [], pageContent = ''
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [universities, setUniversities] = useState<Uni[]>(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [currentPage, setCurrentPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [perPage] = useState(21)
  const [isLoading, setIsLoading] = useState(!initialData.length)
  const [showMore, setShowMore] = useState(false)

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [filterState, setFilterState] = useState(searchParams.get('state') || '')
  const [filterType, setFilterType] = useState(searchParams.get('institute_type') || '')

  // Dynamic filter options from API
  const [states, setStates] = useState<FilterOptions>([])
  const [instituteTypes, setInstituteTypes] = useState<FilterOptions>([])

  // Load filter options from session or API
  useEffect(() => {
    const cacheKey = `uni_filters_${typeSlug}`
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      try {
        const { states: s, types: t } = JSON.parse(cached)
        setStates(s)
        setInstituteTypes(t)
        return
      } catch {}
    }
    fetch(`${API_BASE}/universities/filters?type=${typeSlug}`, { headers: { 'x-api-key': API_KEY } })
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return
        const s = d?.states || []
        const t = d?.institute_types || []
        setStates(s)
        setInstituteTypes(t)
        sessionStorage.setItem(cacheKey, JSON.stringify({ states: s, types: t }))
      })
      .catch(() => {})
  }, [typeSlug])

  const fetchUniversities = useCallback(async (page: number, q: string, state: string, itype: string) => {
    setIsLoading(true)
    const cacheKey = `uni_list_${typeSlug}_p${page}_q${q}_s${state}_t${itype}`
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      try {
        const json = JSON.parse(cached)
        setUniversities(json.data)
        setTotal(json.total)
        setLastPage(json.last_page)
        setIsLoading(false)
        return
      } catch {}
    }

    try {
      const params = new URLSearchParams({ per_page: String(perPage), page: String(page) })
      if (q) params.append('search', q)
      if (state) params.append('state', state)
      if (itype) params.append('institute_type', itype)
      params.append('type_slug', typeSlug)

      const res = await fetch(`${API_BASE}/universities/universities-in-malaysia?${params}`, { headers: { 'x-api-key': API_KEY } })
      if (!res.ok) throw new Error()
      const json = await res.json()
      const data = json?.data?.data || json?.data || []
      const totalCount = json?.data?.total || json?.total || data.length
      const lp = json?.data?.last_page || json?.last_page || Math.ceil(totalCount / perPage)
      setUniversities(data)
      setTotal(totalCount)
      setLastPage(lp)
      sessionStorage.setItem(cacheKey, JSON.stringify({ data, total: totalCount, last_page: lp }))
    } catch {
      setUniversities([])
    } finally {
      setIsLoading(false)
    }
  }, [typeSlug, perPage])

  useEffect(() => {
    fetchUniversities(currentPage, search, filterState, filterType)
  }, [currentPage, search, filterState, filterType, fetchUniversities])

  const handleReset = () => {
    setSearch('')
    setFilterState('')
    setFilterType('')
    setCurrentPage(1)
  }

  const handlePage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Compute static heading from typeSlug (avoids CLS)
  const staticHeading = (() => {
    const t = typeSlug.toLowerCase()
    if (t.includes('private')) return 'Top Private Universities in Malaysia — Rankings, Fees (MYR), Intakes & Global Pathways'
    if (t.includes('public')) return 'Top Public Universities in Malaysia — Rankings, Fees, and Excellence'
    if (t.includes('foreign')) return 'Top Foreign Universities in Malaysia — International Branch Campuses & Global Degrees'
    if (t.includes('school') || t.includes('international')) return 'Top International Schools in Malaysia — Curriculums, Fees & Facilities'
    return typeName || 'Top Universities in Malaysia'
  })()

  // Strip HTML tags for plain-text description
  const plainText = pageContent
    ? pageContent.replace(/<h[1-3][^>]*>.*?<\/h[1-3]>/gi, '').replace(/<[^>]+>/g, '').trim()
    : ''
  const hasLongContent = plainText.length > 150

  const startItem = (currentPage - 1) * perPage + 1
  const endItem = Math.min(currentPage * perPage, total)

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Type Nav */}
        {allTypes.length > 0 && (
          <nav className="flex gap-2.5 flex-wrap mb-8">
            <Link href="/universities" className="px-5 py-2.5 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:border-blue-500 hover:text-blue-600 transition-all shadow-sm">
              All Universities
            </Link>
            {allTypes.map(t => (
              <Link
                key={t.id}
                href={`/universities/${t.seo_title_slug || t.slug}`}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm ${
                  (t.seo_title_slug || t.slug) === typeSlug
                    ? 'bg-blue-600 text-white border border-blue-600'
                    : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-500 hover:text-blue-600'
                }`}
              >
                {t.type}
              </Link>
            ))}
          </nav>
        )}

        {/* Header Section */}
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-2 tracking-tight">
            {typeName}
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Found <span className="text-blue-600 font-bold">{total}</span> universities matching your criteria.
          </p>
          
          {/* Enhanced Description Box */}
          {pageContent && (
            <div className={`bg-blue-50/80 border border-blue-200 rounded-2xl p-5 md:p-8 mt-6 relative shadow-sm transition-all duration-500 ${showMore ? 'max-h-none' : 'max-h-[300px] overflow-hidden'}`}>
              <div className="text-gray-700 text-sm leading-relaxed">
                {showMore && (
                  <button
                    onClick={() => setShowMore(false)}
                    className="absolute top-4 right-4 p-2 text-red-500 bg-white hover:bg-red-50 border border-red-100 rounded-full transition-all z-20 shadow-sm cursor-pointer"
                    title="Collapse"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-4 tracking-tight leading-snug">{staticHeading}</h3>
                <div className={`relative transition-all duration-500 ${showMore ? '' : 'line-clamp-4 md:line-clamp-3 text-gray-600'}`}>
                  {showMore ? (
                    <div
                      className="prose prose-blue prose-sm max-w-none text-gray-600 font-medium
                        [&>p]:mb-4 [&>p]:leading-relaxed
                        [&>ul]:mb-4 [&>ul]:list-disc [&>ul]:pl-5
                        [&>ol]:mb-4 [&>ol]:list-decimal [&>ol]:pl-5
                        [&>h1]:text-2xl [&>h1]:font-black [&>h1]:mb-3 [&>h1]:text-gray-900
                        [&>h2]:text-xl [&>h2]:font-bold [&>h2]:mb-2 [&>h2]:text-gray-800
                        [&>h3]:text-lg [&>h3]:font-bold [&>h3]:mb-2 [&>h3]:text-gray-800"
                      dangerouslySetInnerHTML={{ __html: pageContent.replace(/<h[1-3][^>]*>.*?<\/h[1-3]>/gi, '') }}
                    />
                  ) : plainText}
                </div>
              </div>
              
              {hasLongContent && (
                <div className={`pt-4 ${showMore ? '' : 'absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-blue-50/90 via-blue-50/40 to-transparent flex justify-center'}`}>
                  <button
                    onClick={() => setShowMore(!showMore)}
                    className="flex items-center gap-1.5 text-blue-600 text-sm font-bold hover:underline cursor-pointer bg-white px-5 py-2 rounded-full shadow-md border border-blue-100 transition-transform active:scale-95"
                  >
                    {showMore ? <>Show Less <ChevronDown className="h-4 w-4 rotate-180 transition-transform" /></> : <>Show More <ChevronDown className="h-4 w-4 transition-transform" /></>}
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4 mb-10 p-4 bg-gray-50/50 rounded-2xl border border-gray-200/60 shadow-sm">
          <div className="relative grow">
            <Search className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="search"
              placeholder="Search university by name..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {instituteTypes.length > 0 && (
              <Dropdown
                title="Institute Type"
                options={instituteTypes}
                selectedValue={filterType}
                onSelect={v => { setFilterType(v); setCurrentPage(1) }}
                showAllOption
              />
            )}
            {states.length > 0 && (
              <Dropdown
                title="State"
                options={states}
                selectedValue={filterState}
                onSelect={v => { setFilterState(v); setCurrentPage(1) }}
              />
            )}
            <button
              onClick={handleReset}
              className="shrink-0 px-8 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 active:bg-blue-700 transition-all text-sm font-bold shadow-md hover:shadow-lg cursor-pointer transform active:scale-95"
            >
              Reset
            </button>
          </div>
        </div>

        {/* University Card Grid */}
        <main>
          {isLoading && !universities.length ? (
            <CardSkeleton />
          ) : !isLoading && universities.length === 0 ? (
            <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="mb-6 inline-flex p-5 bg-blue-50 rounded-full">
                <Search className="w-12 h-12 text-blue-400" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">No universities found</h3>
              <p className="text-gray-500 max-w-xs mx-auto font-medium text-sm">Try adjusting your search or filters to find what you&apos;re looking for.</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              {universities.map((uni, index) => (
                <UniversityListCard
                  key={uni.id}
                  uni={uni}
                  priority={index < 3}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {lastPage > 1 && !isLoading && (
            <div className="mt-16 mb-20">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-sm text-gray-600 font-bold uppercase tracking-wider">
                    Showing <span className="text-blue-600">{startItem}</span>—<span className="text-blue-600">{endItem}</span> of <span className="text-blue-600">{total}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handlePage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg cursor-pointer transform active:scale-95'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4 rotate-90" />
                      <span className="hidden sm:inline">Prev</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {[...Array(lastPage)].map((_, i) => {
                        const page = i + 1
                        const show = page === 1 || page === lastPage || (page >= currentPage - 1 && page <= currentPage + 1)
                        const isDot = page === currentPage - 2 || page === currentPage + 2
                        if (show) return (
                          <button
                            key={page}
                            onClick={() => handlePage(page)}
                            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl font-black text-sm transition-all duration-300 cursor-pointer ${
                              currentPage === page
                                ? 'bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-110 ring-4 ring-blue-500/20'
                                : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600'
                            }`}
                          >{page}</button>
                        )
                        if (isDot) return <span key={page} className="px-1 text-gray-400 font-bold">•••</span>
                        return null
                      })}
                    </div>

                    <button
                      onClick={() => handlePage(currentPage + 1)}
                      disabled={currentPage === lastPage}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                        currentPage === lastPage
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg cursor-pointer transform active:scale-95'
                      }`}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronDown className="w-4 h-4 -rotate-90" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
