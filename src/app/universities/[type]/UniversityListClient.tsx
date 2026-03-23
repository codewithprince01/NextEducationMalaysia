'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Loader2, X, ChevronDown, Search, House, ChevronRight } from 'lucide-react'
import UniversityListCard from '@/components/university/UniversityListCard'
import { BrochureForm, FeeStructureForm } from '@/components/modals/UniversityForms'
import CompareForm from '@/components/modals/CompareForm'
import Pagination from '@/components/common/Pagination'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''
const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://admin.educationmalaysia.in'
const USE_CLIENT_CACHE = false
const LOCAL_UNIVERSITIES_API = '/api/universities/universities-in-malaysia'

type Uni = { id: number } & Record<string, any>
type FilterOption = { id: number; name: string; slug?: string }
type FiltersPayload = {
  institute_types: FilterOption[]
  states: FilterOption[]
}

type Props = {
  typeSlug: string
  typeName: string
  initialData?: Uni[]
  initialTotal?: number
  initialLastPage?: number
  initialPage?: number
  initialFilters?: FiltersPayload
  allTypes?: { id: number; type: string; slug?: string; seo_title_slug?: string }[]
  pageContent?: string
}

function Dropdown({
  title,
  options,
  selectedValue,
  onSelect,
  showAllOption = false,
}: {
  title: string
  options: FilterOption[]
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
        className="flex items-center justify-between px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all min-w-[160px]"
      >
        <span className="truncate">{selectedValue || title}</span>
        <ChevronDown className={`ml-2 h-4 w-4 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-56 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5">
          <div className="py-1 max-h-60 overflow-y-auto">
            {showAllOption && (
              <button
                onClick={() => {
                  onSelect('')
                  setOpen(false)
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50"
              >
                All Universities
              </button>
            )}
            {options.map((opt) => (
              <button
                key={opt.id || opt.name}
                onClick={() => {
                  onSelect(opt.name)
                  setOpen(false)
                }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 ${selectedValue === opt.name ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'}`}
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

const CardSkeleton = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse border border-gray-100">
        <div className="w-full h-48 bg-gray-200" />
        <div className="p-5">
          <div className="flex gap-3 mb-4">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
          <div className="h-7 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="h-7 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="space-y-2 mb-6">
            <div className="h-3 bg-gray-100 rounded w-full" />
            <div className="h-3 bg-gray-100 rounded w-5/6" />
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">{[1, 2, 3].map((s) => <div key={s} className="h-16 bg-gray-50 rounded-xl" />)}</div>
          <div className="space-y-3">
            <div className="h-12 bg-gray-200 rounded-xl w-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
)

function plainTextFromHtml(html: string) {
  return html
    .replace(/<h[1-3][^>]*>.*?<\/h[1-3]>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .trim()
}

function getCurrentYearRangeShort() {
  const y = new Date().getFullYear()
  return `${y}-${String(y + 1).slice(-2)}`
}

export default function UniversityListClient({
  typeSlug,
  typeName,
  initialData = [],
  initialTotal = 0,
  initialLastPage = 1,
  initialPage = 1,
  initialFilters,
  allTypes = [],
  pageContent = '',
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const normalizedTypeSlug = useMemo(() => typeSlug.replace(/-in-malaysia$/i, ''), [typeSlug])
  const pageFromPath = useMemo(() => {
    const match = pathname?.match(/\/page-(\d+)$/)
    return match ? Math.max(1, Number(match[1])) : 1
  }, [pathname])
  const searchQuery = useMemo(() => searchParams.get('search') || '', [searchParams])
  const defaultInstituteType = useMemo(() => {
    const t = normalizedTypeSlug.toLowerCase()
    if (t.includes('private')) return 'Private Institution'
    if (t.includes('public')) return 'Public Institution'
    if (t.includes('foreign')) return 'Foreign University'
    if (t.includes('international') || t.includes('school')) return 'International School'
    return ''
  }, [normalizedTypeSlug])
  const effectiveTypeSlug = useMemo(() => {
    const t = normalizedTypeSlug.toLowerCase()
    if (!t) return ''
    // "All Institutions" listing should not force institute-type filter.
    if (t === 'universities' || t.includes('international') || t.includes('school')) return ''
    return normalizedTypeSlug
  }, [normalizedTypeSlug])

  const [universities, setUniversities] = useState<Uni[]>(initialData)
  const [total, setTotal] = useState(initialTotal)
  const [currentPage, setCurrentPage] = useState(initialPage || pageFromPath || 1)
  const [lastPage, setLastPage] = useState(initialLastPage)
  const [perPage] = useState(21)
  const [isLoading, setIsLoading] = useState(initialData.length === 0)
  const [showMore, setShowMore] = useState(false)
  const [selectedUniversity, setSelectedUniversity] = useState<Uni | null>(null)
  const [feeModalOpen, setFeeModalOpen] = useState(false)
  const [brochureModalOpen, setBrochureModalOpen] = useState(false)
  const [compareModalOpen, setCompareModalOpen] = useState(false)
  const [successModalOpen, setSuccessModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [debouncedSearch, setDebouncedSearch] = useState(searchParams.get('search') || '')
  const [filterState, setFilterState] = useState('')
  const [filterType, setFilterType] = useState(defaultInstituteType)

  const [states, setStates] = useState<FilterOption[]>(initialFilters?.states || [])
  const [instituteTypes, setInstituteTypes] = useState<FilterOption[]>(initialFilters?.institute_types || [])
  const lastSyncKeyRef = useRef<string>('')

  const formatTypeUrl = useCallback((instituteTypeName: string) => {
    if (!instituteTypeName) return '/universities/international-school-in-malaysia'
    const normalized = instituteTypeName.toLowerCase().trim()
    const byExactType = allTypes.find((t) => String(t.type || '').toLowerCase().trim() === normalized)
    const byKeyword = allTypes.find((t) => {
      const v = String(t.type || '').toLowerCase()
      if (normalized.includes('public')) return v.includes('public')
      if (normalized.includes('private')) return v.includes('private')
      if (normalized.includes('foreign')) return v.includes('foreign')
      if (normalized.includes('international') || normalized.includes('school')) return v.includes('international') || v.includes('school')
      return false
    })
    const match = byExactType || byKeyword

    let slug = (match?.seo_title_slug || match?.slug || instituteTypeName)
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+|-+$/g, '')

    // Ensure canonical category slugs when fallback text differs from DB naming
    if (!match) {
      if (normalized.includes('public')) slug = 'public-institution-in-malaysia'
      if (normalized.includes('private')) slug = 'private-institution-in-malaysia'
      if (normalized.includes('foreign')) slug = 'foreign-universities-in-malaysia'
      if (normalized.includes('international') || normalized.includes('school')) slug = 'international-school-in-malaysia'
    }

    if (!slug.includes('-in-')) {
      slug = `${slug}-in-malaysia`
    }
    return `/universities/${slug}`
  }, [allTypes])

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
    }, 400)
    return () => clearTimeout(t)
  }, [search])

  useEffect(() => {
    if (pageFromPath !== currentPage) setCurrentPage(pageFromPath)
  }, [pageFromPath])

  useEffect(() => {
    const syncKey = `${typeSlug}|${pageFromPath}|${searchQuery}`
    if (lastSyncKeyRef.current === syncKey) return
    lastSyncKeyRef.current = syncKey

    setFilterType(defaultInstituteType)
    setFilterState('')
    setSearch(searchQuery)
    setDebouncedSearch(searchQuery)
    setCurrentPage(initialPage || pageFromPath || 1)
    setUniversities(initialData)
    setTotal(initialTotal)
    setLastPage(initialLastPage)
    setIsLoading(initialData.length === 0)
  }, [typeSlug, defaultInstituteType, initialPage, pageFromPath, searchQuery])

  useEffect(() => {
    if (states.length > 0 && instituteTypes.length > 0) return

    if (USE_CLIENT_CACHE) {
      const cacheKey = 'uni_filters_all'
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          setStates(Array.isArray(parsed?.states) ? parsed.states : [])
          setInstituteTypes(Array.isArray(parsed?.institute_types) ? parsed.institute_types : [])
          return
        } catch {}
      }
    }

    const loadFilters = async () => {
      try {
        const remoteUrl = `${API_BASE}/universities/universities-in-malaysia?per_page=1&page=1`
        const localUrl = `${LOCAL_UNIVERSITIES_API}?per_page=1&page=1`
        let res = await fetch(localUrl, { cache: 'no-store' })
        if (!res.ok && API_BASE) {
          res = await fetch(remoteUrl, {
            headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
          })
        }
        if (!res.ok) return
        const json = await res.json()
        const filters = json?.data?.filters || {}
        const nextStates = Array.isArray(filters?.states) ? filters.states : []
        const nextTypes = Array.isArray(filters?.institute_types) ? filters.institute_types : []
        setStates(nextStates)
        setInstituteTypes(nextTypes)
        if (USE_CLIENT_CACHE) {
          sessionStorage.setItem('uni_filters_all', JSON.stringify({ states: nextStates, institute_types: nextTypes }))
        }
      } catch {}
    }

    loadFilters()
  }, [states.length, instituteTypes.length])

  const fetchUniversities = useCallback(async (page: number, q: string, state: string, instType: string) => {
    setIsLoading(true)

    if (USE_CLIENT_CACHE) {
      const cacheKey = `uni_list_${normalizedTypeSlug}_p${page}_q${q}_s${state}_t${instType}`
      const cached = sessionStorage.getItem(cacheKey)
      if (cached) {
        try {
          const parsed = JSON.parse(cached)
          setUniversities(Array.isArray(parsed?.data) ? parsed.data : [])
          setTotal(Number(parsed?.total || 0))
          setLastPage(Number(parsed?.last_page || 1))
          setIsLoading(false)
          return
        } catch {}
      }
    }

    try {
      const params = new URLSearchParams({ per_page: String(perPage), page: String(page) })
      if (effectiveTypeSlug) params.append('type_slug', effectiveTypeSlug)
      if (q) params.append('search', q)
      if (state) params.append('state', state)
      if (instType && instType !== defaultInstituteType) params.append('institute_type', instType)

      const remoteUrl = `${API_BASE}/universities/universities-in-malaysia?${params.toString()}`
      const localUrl = `${LOCAL_UNIVERSITIES_API}?${params.toString()}`
      let res = await fetch(localUrl, { cache: 'no-store' })
      if (!res.ok && API_BASE) {
        res = await fetch(remoteUrl, {
          headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
        })
      }
      if (!res.ok) throw new Error('Failed university listing request')
      const json = await res.json()

      const rows = Array.isArray(json?.data?.data)
        ? json.data.data
        : Array.isArray(json?.data?.universities?.data)
          ? json.data.universities.data
          : []

      const paging = json?.data?.pagination || json?.data?.universities || {}
      const totalCount = Number(paging?.total || rows.length)
      const last = Number(paging?.last_page || Math.ceil(totalCount / perPage) || 1)

      setUniversities(rows)
      setTotal(totalCount)
      setLastPage(last)

      if (USE_CLIENT_CACHE) {
        const cacheKey = `uni_list_${normalizedTypeSlug}_p${page}_q${q}_s${state}_t${instType}`
        sessionStorage.setItem(cacheKey, JSON.stringify({ data: rows, total: totalCount, last_page: last }))
      }
    } catch {
      setUniversities([])
      setTotal(0)
      setLastPage(1)
    } finally {
      setIsLoading(false)
    }
  }, [effectiveTypeSlug, perPage, defaultInstituteType])

  useEffect(() => {
    // Use SSR data for first paint, then fetch when user changes controls
    if (currentPage === 1 && !debouncedSearch && !filterState && filterType === defaultInstituteType && initialData.length > 0) {
      setUniversities(initialData)
      setTotal(initialTotal)
      setLastPage(initialLastPage)
      setIsLoading(false)
      return
    }
    fetchUniversities(currentPage, debouncedSearch, filterState, filterType)
  }, [currentPage, debouncedSearch, filterState, filterType, fetchUniversities, defaultInstituteType, initialData.length, initialTotal, initialLastPage])

  const handleReset = () => {
    setSearch('')
    setDebouncedSearch('')
    setFilterState('')
    setFilterType(defaultInstituteType)
    const basePath = `/universities/${typeSlug}`
    router.push(basePath)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    const target = Math.max(1, Math.min(lastPage, page))
    const basePath = `/universities/${typeSlug}`
    const targetPath = target === 1 ? basePath : `${basePath}/page-${target}`
    const query = searchParams.toString()
    const targetUrl = query ? `${targetPath}?${query}` : targetPath
    window.location.assign(targetUrl)
    setCurrentPage(target)
  }

  const openFeeModal = (uni: Uni) => {
    setSelectedUniversity(uni)
    setFeeModalOpen(true)
  }

  const openBrochureModal = (uni: Uni) => {
    setSelectedUniversity(uni)
    setBrochureModalOpen(true)
  }

  const openCompareModal = () => {
    setCompareModalOpen(true)
  }

  const showSuccess = (message: string) => {
    setSuccessMessage(message)
    setSuccessModalOpen(true)
    setTimeout(() => {
      setSuccessModalOpen(false)
      setSuccessMessage('')
    }, 3500)
  }

  const getUniversityLogo = (uni: Uni | null) => {
    if (!uni) return null
    const path = uni.logo_path || uni.banner_path
    if (!path) return null
    return String(path)
  }

  const dynamicTitle = (() => {
    const yearRange = getCurrentYearRangeShort()
    const t = normalizedTypeSlug.toLowerCase()
    const count = total || initialTotal || 0
    if (t.includes('private')) return `Top ${count} Private Universities In Malaysia ${yearRange}`
    if (t.includes('public')) return `Top ${count} Public Universities In Malaysia ${yearRange}`
    if (t.includes('foreign')) return `Top ${count} Foreign Universities In Malaysia ${yearRange}`
    if (t.includes('international') || t.includes('school')) return `Top ${count} International Schools In Malaysia ${yearRange}`
    return typeName
  })()

  const breadcrumbLabel = defaultInstituteType || typeName

  const staticHeading = (() => {
    const t = normalizedTypeSlug.toLowerCase()
    if (t.includes('private')) return 'Top Private Universities in Malaysia - Rankings, Fees (MYR), Intakes & Global Pathways'
    if (t.includes('public')) return 'Top Public Universities in Malaysia - Rankings, Fees, and Excellence'
    if (t.includes('foreign')) return 'Top Foreign Universities in Malaysia - International Branch Campuses & Global Degrees'
    if (t.includes('school') || t.includes('international')) return 'Top International Schools in Malaysia — Curriculums, Fees & Facilities'
    return typeName || 'Top Universities in Malaysia'
  })()

  const plainText = (() => {
    return pageContent ? plainTextFromHtml(pageContent) : ''
  })()
  const hasLongContent = plainText.length > 150

  const startItem = (currentPage - 1) * perPage + 1
  const endItem = Math.min(currentPage * perPage, total)

  return (
    <div className="bg-white">
      <div className="w-full bg-[#f0f7ff] border-b border-blue-100/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center space-x-2 text-sm font-medium text-gray-500 flex-wrap">
            <Link href="/" className="hover:text-blue-500 transition-colors flex items-center whitespace-nowrap">
              <House className="w-4 h-4 mr-1 inline text-gray-400" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400 shrink-0" />
            <Link href="/universities" className="hover:text-blue-500 transition-colors flex items-center whitespace-nowrap">Universities</Link>
            <ChevronRight className="w-4 h-4 mx-2 text-gray-400 shrink-0" />
            <span className="text-blue-600 font-semibold truncate max-w-[200px] sm:max-w-none">{breadcrumbLabel}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-2 md:py-3">

        <header className="mb-8">
          <h1 className="text-[42px] leading-[1.1] font-black text-[#0f172a] mb-2">
            {dynamicTitle}
          </h1>
          <p className="text-gray-500 text-lg">
            Found <span className="text-[#2563eb] font-bold">{total}</span> universities matching your criteria.
          </p>

          {pageContent && (
            <div
              className="border border-gray-200 rounded-xl p-4 md:p-6 mt-6 relative"
              style={
                hasLongContent
                  ? (showMore ? { height: 'auto', overflow: 'visible' } : { height: 176, overflow: 'hidden' })
                  : { height: 'auto', overflow: 'visible' }
              }
            >
              <div className="text-gray-700 text-sm leading-relaxed">
                {showMore && (
                  <button
                    onClick={() => setShowMore(false)}
                    className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all z-10"
                    title="Collapse"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}

                <p className="text-lg md:text-xl font-bold text-[#0f172a] mb-2 md:mb-3">{staticHeading}</p>

                <div className={showMore ? 'max-h-[50vh] overflow-y-auto pr-2' : 'line-clamp-3 text-gray-600'}>
                  {showMore ? (
                    <div
                      className="prose prose-sm max-w-none text-gray-600"
                      dangerouslySetInnerHTML={{
                        __html: pageContent.replace(/<h[1-3][^>]*>.*?<\/h[1-3]>/gi, ''),
                      }}
                    />
                  ) : (
                    plainText
                  )}
                </div>
              </div>
            </div>
          )}

          {pageContent && hasLongContent && (
            <div className="mb-6 mt-3">
              <button onClick={() => setShowMore(!showMore)} className="flex items-center gap-1 text-[#2563eb] text-sm font-medium hover:underline">
                {showMore ? (
                  <>
                    Show Less <ChevronDown className="h-4 w-4 rotate-180" />
                  </>
                ) : (
                  <>
                    Show More <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </header>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 mb-8 flex-wrap">
          <div className="relative grow">
            <Search className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="search"
              placeholder="Search university by name..."
              value={search}
              onChange={(e) => {
                if (currentPage !== 1) handlePageChange(1)
                setSearch(e.target.value)
              }}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Dropdown
              title="Institute Type"
              options={instituteTypes}
              selectedValue={filterType}
              onSelect={(v) => {
                const targetUrl = formatTypeUrl(v)
                const normalize = (p: string) => p.replace(/\/+$/, '')
                const currentPath = normalize(pathname || '')
                const nextPath = normalize(targetUrl)

                setFilterType(v || defaultInstituteType)
                setFilterState('')
                setCurrentPage(1)

                if (nextPath !== currentPath) {
                  window.location.assign(targetUrl)
                  return
                }

                if (currentPage !== 1) handlePageChange(1)
              }}
              showAllOption
            />
            <Dropdown
              title="State"
              options={states}
              selectedValue={filterState}
              onSelect={(v) => {
                if (currentPage !== 1) handlePageChange(1)
                setFilterState(v)
                setCurrentPage(1)
              }}
            />
            <button
              onClick={handleReset}
              className="shrink-0 px-6 py-2.5 bg-[#2563eb] text-white rounded-lg hover:bg-[#1d4ed8] transition-colors text-sm font-semibold"
            >
              Reset
            </button>
          </div>
        </div>

        <main>
          {isLoading && !universities.length ? (
            <CardSkeleton />
          ) : !isLoading && universities.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <div className="mb-6 inline-flex p-4 bg-blue-50 rounded-full">
                <Loader2 className="w-12 h-12 text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No universities found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">Try adjusting your search or filters to find what you are looking for.</p>
            </div>
          ) : (
            <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
              {universities.map((uni, index) => (
                <UniversityListCard
                  key={uni.id}
                  uni={uni}
                  priority={index < 3}
                  onOpenFeeModal={openFeeModal}
                  onOpenBrochureModal={openBrochureModal}
                  onOpenCompareModal={openCompareModal}
                />
              ))}
            </div>
          )}

          {lastPage > 1 && (
            <div className="mt-10 mb-16">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm sm:text-base text-gray-700 font-medium">
                    Showing <span className="font-bold text-blue-600">{startItem}</span>-<span className="font-bold text-blue-600">{endItem}</span> of <span className="font-bold text-blue-600">{total}</span> universities
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={lastPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <FeeStructureForm
        universityId={selectedUniversity?.id}
        universityName={selectedUniversity?.name}
        universityLogo={getUniversityLogo(selectedUniversity)}
        isOpen={feeModalOpen}
        onClose={() => setFeeModalOpen(false)}
        onSuccess={showSuccess}
      />

      <BrochureForm
        universityId={selectedUniversity?.id}
        universityName={selectedUniversity?.name}
        universityLogo={getUniversityLogo(selectedUniversity)}
        isOpen={brochureModalOpen}
        onClose={() => setBrochureModalOpen(false)}
        onSuccess={showSuccess}
      />

      <CompareForm
        isOpen={compareModalOpen}
        onClose={() => setCompareModalOpen(false)}
        universities={universities}
      />

      {successModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl p-6 text-center max-w-sm">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{successMessage}</h3>
            <p className="text-gray-600">We'll get back to you soon.</p>
          </div>
        </div>
      )}
    </div>
  )
}
