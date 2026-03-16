'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Loader2, X, ChevronDown, Search } from 'lucide-react'
import UniversityListCard from '@/components/university/UniversityListCard'

const API_BASE = process.env.NEXT_PUBLIC_API_URL

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
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})
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
    fetch(`${API_BASE}/universities/filters?type=${typeSlug}`)
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

      const res = await fetch(`${API_BASE}/universities/universities-in-malaysia?${params}`)
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
      <div className="container mx-auto px-4 py-10">
        {/* Type Nav */}
        {allTypes.length > 0 && (
          <nav className="flex gap-2 flex-wrap mb-6">
            <Link href="/universities" className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium hover:border-blue-500 hover:text-blue-600 transition-all">
              All Universities
            </Link>
            {allTypes.map(t => (
              <Link
                key={t.id}
                href={`/universities/${t.seo_title_slug || t.slug}`}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                  (t.seo_title_slug || t.slug) === typeSlug
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600'
                }`}
              >
                {t.type}
              </Link>
            ))}
          </nav>
        )}

        {/* Heading */}
        <div className="mb-3 min-h-[80px] md:min-h-[100px]">
          <h1 className="text-2xl md:text-4xl font-black text-[#0f172a] leading-tight mb-2">
            {typeName}
          </h1>
          <p className="text-gray-500 text-lg">
            Found <span className="text-[#2563eb] font-bold">{total}</span> universities matching your criteria.
          </p>
        </div>

        {/* Collapsible description box */}
        {pageContent && (
          <>
            <div
              className="border border-gray-200 rounded-xl p-4 md:p-6 mb-3 relative"
              style={showMore ? { height: 'auto', overflow: 'visible' } : { height: 176, overflow: 'hidden' }}
            >
              <div className="text-gray-700 text-sm leading-relaxed">
                {showMore && (
                  <button
                    onClick={() => setShowMore(false)}
                    className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all z-10 cursor-pointer"
                    title="Collapse"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
                <p className="text-lg md:text-xl font-bold text-[#0f172a] mb-2 md:mb-3">{staticHeading}</p>
                <div className={showMore ? 'max-h-[50vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200' : 'line-clamp-3 text-gray-600'}>
                  {showMore ? (
                    <div
                      className="prose prose-sm max-w-none text-gray-600"
                      dangerouslySetInnerHTML={{ __html: pageContent.replace(/<h[1-3][^>]*>.*?<\/h[1-3]>/gi, '') }}
                    />
                  ) : plainText}
                </div>
              </div>
            </div>
            {hasLongContent && (
              <div className="mb-6">
                <button
                  onClick={() => setShowMore(!showMore)}
                  className="flex items-center gap-1 text-[#2563eb] text-sm font-medium hover:underline cursor-pointer"
                >
                  {showMore ? <>Show Less <ChevronDown className="rotate-180 transition-transform" /></> : <>Show More <ChevronDown className="transition-transform" /></>}
                </button>
              </div>
            )}
          </>
        )}

        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-8 flex-wrap">
          <div className="relative grow">
            <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="search"
              placeholder="Search university by name..."
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
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
              className="shrink-0 px-6 py-2.5 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors text-sm font-semibold cursor-pointer"
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
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="mb-6 inline-flex p-4 bg-blue-50 rounded-full">
                <Loader2 className="w-12 h-12 text-blue-300 animate-spin" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No universities found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">Try adjusting your search or filters to find what you&apos;re looking for.</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
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
            <div className="mt-10 mb-16">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm sm:text-base text-gray-700 font-medium">
                    Showing <span className="font-bold text-blue-600">{startItem}</span>-
                    <span className="font-bold text-blue-600">{endItem}</span> of{' '}
                    <span className="font-bold text-blue-600">{total}</span> universities
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className={`flex items-center gap-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg cursor-pointer'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      {[...Array(lastPage)].map((_, i) => {
                        const page = i + 1
                        const show = page === 1 || page === lastPage || (page >= currentPage - 1 && page <= currentPage + 1)
                        const isDot = page === currentPage - 2 || page === currentPage + 2
                        if (show) return (
                          <button
                            key={page}
                            onClick={() => handlePage(page)}
                            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg font-bold text-sm sm:text-base transition-all duration-200 cursor-pointer ${
                              currentPage === page
                                ? 'bg-linear-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-110 ring-2 ring-blue-300'
                                : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 hover:shadow-md'
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
                      className={`flex items-center gap-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                        currentPage === lastPage
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg cursor-pointer'
                      }`}
                    >
                      <span className="hidden sm:inline">Next</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
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
