'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'

const PER_PAGE = 12
const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''
const API_BASE = '/api/v1'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''
const BLOG_CACHE_VERSION = 'v2'

type BlogCategory = { id: number; category_name: string; category_slug: string }

// ── Session cache ────────────────────────────────────────────────────────────
const BLOG_CACHE_TTL = 5 * 60 * 1000
const blogCache = {
  get(key: string) {
    try {
      const raw = sessionStorage.getItem(`blog_${BLOG_CACHE_VERSION}_${key}`)
      if (!raw) return null
      const { data, ts } = JSON.parse(raw)
      if (Date.now() - ts > BLOG_CACHE_TTL) {
        sessionStorage.removeItem(`blog_${BLOG_CACHE_VERSION}_${key}`)
        return null
      }
      return data
    } catch {
      return null
    }
  },
  set(key: string, data: unknown) {
    try {
      sessionStorage.setItem(`blog_${BLOG_CACHE_VERSION}_${key}`, JSON.stringify({ data, ts: Date.now() }))
    } catch { /* ignore */ }
  },
}

function normalizeCategories(payload: any): BlogCategory[] {
  const raw = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.categories)
        ? payload.categories
        : []

  return raw
    .map((item: any) => ({
      id: Number(item?.id),
      category_name: item?.category_name || item?.name || '',
      category_slug: item?.category_slug || item?.slug || '',
    }))
    .filter((item: BlogCategory) => Boolean(item.id && item.category_name && item.category_slug))
}

function deriveCategoriesFromBlogs(items: any[]): BlogCategory[] {
  const map = new Map<string, BlogCategory>()
  items.forEach((blog: any) => {
    const cat = blog?.category || blog?.get_category
    if (!cat?.category_slug) return
    map.set(cat.category_slug, {
      id: Number(cat.id),
      category_name: cat.category_name || '',
      category_slug: cat.category_slug,
    })
  })
  return Array.from(map.values())
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse flex flex-col h-full">
      <div className="w-full aspect-video sm:h-48 bg-gray-200" />
      <div className="p-4 flex-1">
        <div className="h-5 bg-gray-200 rounded w-full mb-2" />
        <div className="h-5 bg-gray-200 rounded w-2/3" />
      </div>
      <div className="px-4 pb-4 mt-auto">
        <div className="h-4 bg-gray-200 rounded w-32" />
      </div>
    </div>
  )
}

/* ─── Pagination Bar ─────────────────────────────────────────────────────── */
function PaginationBar({ currentPage, lastPage, onPageChange }: {
  currentPage: number
  lastPage: number
  onPageChange: (p: number) => void
}) {
  if (lastPage <= 1) return null

  const pages: number[] = []
  for (let i = 1; i <= lastPage; i++) {
    if (i === 1 || i === lastPage || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages.push(i)
    }
  }
  const unique = [...new Set(pages)].sort((a, b) => a - b)

  return (
    <div className="flex justify-center items-center gap-2 mt-10 mb-4 flex-wrap">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
          currentPage === 1
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg'
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {unique.map((pageNum, idx) => {
        const prev = unique[idx - 1]
        const showDots = prev && pageNum - prev > 1
        return (
          <React.Fragment key={pageNum}>
            {showDots && <span className="px-1 text-gray-400 font-bold">•••</span>}
            <button
              onClick={() => onPageChange(pageNum)}
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg font-bold text-sm transition-all duration-200 ${
                currentPage === pageNum
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-110 ring-2 ring-blue-300'
                  : 'bg-gray-50 text-gray-700 border-2 border-gray-200 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 hover:shadow-md'
              }`}
            >
              {pageNum}
            </button>
          </React.Fragment>
        )
      })}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === lastPage}
        className={`flex items-center gap-1 px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
          currentPage === lastPage
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg'
        }`}
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  )
}

/* ─── Main Client Component ──────────────────────────────────────────────── */
export default function BlogListClient({ initialCategory, initialData }: { initialCategory?: string, initialData?: any }) {
  const router = useRouter()
  const pathname = usePathname()
  const initCat = initialCategory || 'all'
  const routeDefaults = (() => {
    if (typeof window === 'undefined') return { category: initCat, page: 1 }
    const parts = window.location.pathname.split('/').filter(Boolean)
    if (parts[0] !== 'blog') return { category: initCat, page: 1 }

    let category = 'all'
    let page = 1
    if (parts[1]) {
      if (parts[1].startsWith('page-')) {
        page = Number.parseInt(parts[1].replace('page-', ''), 10) || 1
      } else {
        category = parts[1]
        if (parts[2]?.startsWith('page-')) {
          page = Number.parseInt(parts[2].replace('page-', ''), 10) || 1
        }
      }
    }
    return { category, page }
  })()

  const readPayload = (payload: any) => ({
    blogs: payload?.data || payload?.blogs?.data || [],
    currentPage: payload?.pagination?.current_page || payload?.blogs?.current_page || 1,
    lastPage: payload?.pagination?.last_page || payload?.blogs?.last_page || 1,
    total: payload?.pagination?.total || payload?.blogs?.total || 0,
  })

  const [blogs, setBlogs] = useState<any[]>(readPayload(initialData).blogs)
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [currentPage, setCurrentPage] = useState(routeDefaults.page || readPayload(initialData).currentPage)
  const [lastPage, setLastPage] = useState(readPayload(initialData).lastPage)
  const [total, setTotal] = useState(readPayload(initialData).total)
  const [loading, setLoading] = useState(!initialData)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(routeDefaults.category || initCat)
  const activeRequestRef = useRef<{ key: string; controller: AbortController } | null>(null)
  const activeSearchRequestRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!initialData) return
    const next = readPayload(initialData)
    setBlogs(next.blogs)
    setCurrentPage(next.currentPage)
    setLastPage(next.lastPage)
    setTotal(next.total)
    setSelectedCategory(initCat)
    setLoading(false)
  }, [initialData, initCat])

  useEffect(() => {
    if (!pathname) return

    const parts = pathname.split('/').filter(Boolean)
    if (parts[0] !== 'blog') return

    let categoryFromUrl = 'all'
    let pageFromUrl = 1

    if (parts[1]) {
      if (parts[1].startsWith('page-')) {
        pageFromUrl = Number.parseInt(parts[1].replace('page-', ''), 10) || 1
      } else {
        categoryFromUrl = parts[1]
        if (parts[2]?.startsWith('page-')) {
          pageFromUrl = Number.parseInt(parts[2].replace('page-', ''), 10) || 1
        }
      }
    }

    if (selectedCategory !== categoryFromUrl) setSelectedCategory(categoryFromUrl)
    if (currentPage !== pageFromUrl) setCurrentPage(pageFromUrl)
  }, [pathname])

  useEffect(() => {
    return () => {
      activeRequestRef.current?.controller.abort()
      activeSearchRequestRef.current?.abort()
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  /* ── Fetch blogs ─────────────────────────────────────────────────────── */
  const fetchBlogs = useCallback(async (page: number, category: string) => {
    const cacheKey = `${category || 'all'}_${page}`
    if (activeRequestRef.current?.key === cacheKey) return

    activeRequestRef.current?.controller.abort()
    const controller = new AbortController()
    activeRequestRef.current = { key: cacheKey, controller }

    const cached = blogCache.get(cacheKey)
    if (cached) {
      setBlogs(cached.blogs)
      setLastPage(cached.lastPage)
      setTotal(cached.total)
      if (cached.categories?.length) setCategories(cached.categories)
      setLoading(false)
    } else {
      setLoading(true)
    }

    try {
      const url = (!category || category === 'all')
        ? `${API_BASE}/blog?page=${page}&per_page=${PER_PAGE}`
        : `${API_BASE}/blog-by-category/${category}?page=${page}&per_page=${PER_PAGE}`
      const res = await fetch(url, { headers: { 'x-api-key': API_KEY }, cache: 'no-store', signal: controller.signal })
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()

      if (activeRequestRef.current?.key !== cacheKey) return
      
      if (json.status) {
        const newBlogs = json.data || []
        const newCurrent = json.pagination?.current_page || page
        const newLast = json.pagination?.last_page || 1
        const newTotal = json.pagination?.total || 0
        setBlogs(newBlogs)
        setLastPage(newLast)
        setTotal(newTotal)
        blogCache.set(cacheKey, { blogs: newBlogs, currentPage: newCurrent, lastPage: newLast, total: newTotal })
      }
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return
      console.error('Error fetching blogs:', err)
      if (!cached) setBlogs([])
    } finally {
      if (activeRequestRef.current?.key === cacheKey) {
        setLoading(false)
      }
    }
  }, [])

  const fetchSearchBlogs = useCallback(async (query: string, category: string, page: number) => {
    const term = query.trim()
    if (!term) return

    activeSearchRequestRef.current?.abort()
    const controller = new AbortController()
    activeSearchRequestRef.current = controller
    setLoading(true)

    try {
      // Match old project behavior: for "all" search, fetch a larger pool (multi-page)
      if (!category || category === 'all') {
        const firstRes = await fetch(`${API_BASE}/blog?page=1&per_page=50`, {
          headers: { 'x-api-key': API_KEY },
          cache: 'no-store',
          signal: controller.signal,
        })
        if (!firstRes.ok) throw new Error('Failed to fetch blogs')
        const firstJson = await firstRes.json()
        if (!firstJson?.status) throw new Error('Invalid response')

        const firstPageBlogs = Array.isArray(firstJson?.data) ? firstJson.data : []
        const serverLastPage = Number(firstJson?.pagination?.last_page || 1)
        const serverTotal = Number(firstJson?.pagination?.total || firstPageBlogs.length)

        let mergedBlogs = [...firstPageBlogs]
        if (serverLastPage > 1) {
          const targetLastPage = Math.min(serverLastPage, 10)
          const requests: Promise<Response>[] = []
          for (let p = 2; p <= targetLastPage; p++) {
            requests.push(
              fetch(`${API_BASE}/blog?page=${p}&per_page=50`, {
                headers: { 'x-api-key': API_KEY },
                cache: 'no-store',
                signal: controller.signal,
              }),
            )
          }
          const responses = await Promise.all(requests)
          for (const response of responses) {
            if (!response.ok) continue
            const json = await response.json()
            if (Array.isArray(json?.data)) mergedBlogs = [...mergedBlogs, ...json.data]
          }
        }

        setBlogs(mergedBlogs)
        setTotal(serverTotal)
        setLastPage(Math.max(1, Math.ceil(serverTotal / PER_PAGE)))
        return
      }

      // For category-specific search, keep same scoped fetch behavior
      const res = await fetch(`${API_BASE}/blog-by-category/${category}?page=${page}&per_page=50`, {
        headers: { 'x-api-key': API_KEY },
        cache: 'no-store',
        signal: controller.signal,
      })
      if (!res.ok) throw new Error('Failed to fetch category blogs')
      const json = await res.json()
      if (!json?.status) throw new Error('Invalid response')

      const categoryBlogs = Array.isArray(json?.data) ? json.data : []
      setBlogs(categoryBlogs)
      setTotal(Number(json?.pagination?.total || categoryBlogs.length))
      setLastPage(Number(json?.pagination?.last_page || 1))
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return
      console.error('Error fetching search blogs:', err)
      setBlogs([])
      setTotal(0)
      setLastPage(1)
    } finally {
      setLoading(false)
    }
  }, [])

  /* ── Fetch categories once ───────────────────────────────────────────── */
  useEffect(() => {
    if (categories.length > 0) return
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_BASE}/blog/categories`, { headers: { 'x-api-key': API_KEY } })
        const json = await res.json()
        const parsed = normalizeCategories(json)
        if (json.status && parsed.length > 0) {
          setCategories(parsed)
          return
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
      }

      const fromCurrentBlogs = deriveCategoriesFromBlogs(blogs)
      if (fromCurrentBlogs.length > 0) {
        setCategories(fromCurrentBlogs)
        return
      }

      try {
        const res = await fetch(`${API_BASE}/blog?page=1&per_page=50`, { headers: { 'x-api-key': API_KEY } })
        const json = await res.json()
        const fallback = deriveCategoriesFromBlogs(json?.data || [])
        if (fallback.length > 0) setCategories(fallback)
      } catch {
        // keep empty if everything fails
      }
    }
    fetch_()
  }, [blogs, categories.length])

  /* ── Initial load ────────────────────────────────────────────────────── */
  /* ── Refetch on page change ──────────────────────────────────────────── */
  useEffect(() => {
    if (debouncedSearch.trim()) {
      fetchSearchBlogs(debouncedSearch, selectedCategory, currentPage)
      return
    }
    fetchBlogs(currentPage, selectedCategory)
  }, [currentPage, selectedCategory, debouncedSearch, fetchBlogs, fetchSearchBlogs])

  /* ── Client-side search filter ───────────────────────────────────────── */
  const displayedBlogs = searchQuery.trim()
    ? blogs.filter(b =>
        b.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category?.category_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.get_category?.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : blogs

  /* ── Handlers ────────────────────────────────────────────────────────── */
  const handleCategoryChange = (slug: string) => {
    setCurrentPage(1)
    setSearchQuery('')
    setSelectedCategory(slug)
    if (slug === 'all') router.push('/blog')
    else router.push(`/blog/${slug}`)
  }

  const handleReset = () => {
    setSearchQuery('')
    setCurrentPage(1)
    setSelectedCategory('all')
    router.push('/blog')
  }

  const handlePageChange = (page: number) => {
    if (page < 1 || page > lastPage) return
    setCurrentPage(page)
    setSearchQuery('')

    let newUrl: string
    if (!selectedCategory || selectedCategory === 'all') {
      newUrl = page === 1 ? '/blog' : `/blog/page-${page}`
    } else {
      newUrl = page === 1 ? `/blog/${selectedCategory}` : `/blog/${selectedCategory}/page-${page}`
    }

    router.push(newUrl, { scroll: false })
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    ...(selectedCategory !== 'all' && categories.find(c => c.category_slug === selectedCategory)
      ? [{ label: categories.find(c => c.category_slug === selectedCategory)!.category_name }]
      : []),
  ]

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <div className="p-6 lg:p-10">
        {/* Search & Filter */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow-md">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search blog by title..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Category dropdown */}
            <div className="w-full md:w-64">
              <select
                value={selectedCategory}
                onChange={e => handleCategoryChange(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer font-medium text-gray-700 shadow-sm hover:border-blue-400 transition-colors"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.category_slug}>{cat.category_name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleReset}
              className="w-full md:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-md"
            >
              Reset
            </button>
          </div>

          {/* Active filters */}
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="font-semibold text-gray-600">Active Filters:</span>
              {searchQuery && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                  Search: &ldquo;{searchQuery}&rdquo;
                </span>
              )}
              {selectedCategory !== 'all' && (
                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                  Category: {categories.find(c => c.category_slug === selectedCategory)?.category_name}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results count */}
        {!loading && (
          <div className="mb-4 text-gray-700 font-semibold flex items-center gap-2">
            {searchQuery ? (
              <>
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                Found <span className="text-blue-600">{displayedBlogs.length}</span>{' '}
                blog{displayedBlogs.length !== 1 ? 's' : ''} matching "{searchQuery}"
              </>
            ) : (
              <>
                <div className="w-1.5 h-6 bg-blue-600 rounded-full" />
                Showing{' '}
                <span className="text-blue-600">
                  {(currentPage - 1) * PER_PAGE + 1}–{Math.min(currentPage * PER_PAGE, total)}
                </span>{' '}
                of <span className="text-blue-600">{total}</span> blogs
              </>
            )}
          </div>
        )}

        {/* Blog Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => <LoadingSkeleton key={i} />)
          ) : displayedBlogs.length > 0 ? (
            displayedBlogs.map((item, index) => {
              const imageUrl = item.imgpath?.startsWith('http')
                ? item.imgpath
                : `${IMAGE_BASE}/storage/${(item.thumbnail_path || 'default.jpg').replace(/^\/+/, '')}`
              const itemCategory = item.category || item.get_category
              const catSlug =
                itemCategory?.category_slug ||
                (selectedCategory && selectedCategory !== 'all' ? selectedCategory : 'all')
              const blogSlug =
                item.slug ||
                item.headline?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
                'blog'

              return (
                <Link
                  href={`/blog/${catSlug}/${blogSlug}-${item.id}`}
                  key={item.id}
                  className="flex flex-col h-full bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative aspect-video sm:h-48">
                    <img
                      src={imageUrl}
                      alt={item.headline}
                      className="w-full h-full object-cover"
                      loading={index === 0 ? 'eager' : 'lazy'}
                      fetchPriority={index === 0 ? 'high' : 'auto'}
                    />
                    <div
                      onClick={e => {
                        e.preventDefault()
                        if (catSlug && catSlug !== 'all') handleCategoryChange(catSlug)
                      }}
                      className={`absolute top-4 left-4 font-semibold text-sm px-3 py-1 rounded shadow-md cursor-pointer transition ${
                        selectedCategory === catSlug ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-blue-100'
                      }`}
                    >
                      {itemCategory?.category_name || 'General'}
                    </div>
                  </div>
                  <div className="p-4 flex-1">
                    <h3 className="font-semibold text-base text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors min-h-12">
                      {item.headline}
                    </h3>
                  </div>
                  <div className="px-4 pb-4 mt-auto flex items-center text-gray-600 text-sm">
                    <CalendarDays className="w-4 h-4 mr-2" />
                    <span>
                      {new Date(item.created_at).toLocaleDateString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </span>
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No blogs found matching your criteria.</p>
              <button
                onClick={handleReset}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination — only shown when not in search mode */}
        {!searchQuery && (
          <PaginationBar
            currentPage={currentPage}
            lastPage={lastPage}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </>
  )
}
