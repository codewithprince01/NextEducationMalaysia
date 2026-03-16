'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'

const PER_PAGE = 12
const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''
const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

// ── Session cache ────────────────────────────────────────────────────────────
const BLOG_CACHE_TTL = 5 * 60 * 1000
const blogCache = {
  get(key: string) {
    try {
      const raw = sessionStorage.getItem(`blog_${key}`)
      if (!raw) return null
      const { data, ts } = JSON.parse(raw)
      if (Date.now() - ts > BLOG_CACHE_TTL) {
        sessionStorage.removeItem(`blog_${key}`)
        return null
      }
      return data
    } catch {
      return null
    }
  },
  set(key: string, data: unknown) {
    try {
      sessionStorage.setItem(`blog_${key}`, JSON.stringify({ data, ts: Date.now() }))
    } catch { /* ignore */ }
  },
}

/* ─── Skeleton ───────────────────────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
      <div className="w-full h-48 bg-gray-300" />
      <div className="p-4 space-y-2">
        <div className="h-4 bg-gray-300 rounded w-1/4" />
        <div className="h-6 bg-gray-300 rounded w-3/4" />
        <div className="h-4 bg-gray-300 rounded w-1/2" />
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
  const initCat = initialCategory || 'all'

  const [blogs, setBlogs] = useState<any[]>(initialData?.blogs?.data || initialData?.data || [])
  const [categories, setCategories] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(initialData?.blogs?.current_page || initialData?.current_page || 1)
  const [lastPage, setLastPage] = useState(initialData?.blogs?.last_page || initialData?.last_page || 1)
  const [total, setTotal] = useState(initialData?.blogs?.total || initialData?.total || 0)
  const [loading, setLoading] = useState(!initialData)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(initCat)

  /* ── Fetch blogs ─────────────────────────────────────────────────────── */
  const fetchBlogs = useCallback(async (page: number, category: string) => {
    const cacheKey = `${category || 'all'}_${page}`
    const cached = blogCache.get(cacheKey)
    if (cached) {
      setBlogs(cached.blogs)
      setCurrentPage(cached.currentPage)
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
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      const blogData = json.blogs
      if (blogData) {
        const newBlogs = blogData.data || []
        const newCurrent = blogData.current_page || page
        const newLast = blogData.last_page || 1
        const newTotal = blogData.total || 0
        setBlogs(newBlogs)
        setCurrentPage(newCurrent)
        setLastPage(newLast)
        setTotal(newTotal)
        blogCache.set(cacheKey, { blogs: newBlogs, currentPage: newCurrent, lastPage: newLast, total: newTotal })
      }
    } catch (err) {
      console.error('Error fetching blogs:', err)
      if (!cached) setBlogs([])
    } finally {
      setLoading(false)
    }
  }, [])

  /* ── Fetch categories once ───────────────────────────────────────────── */
  useEffect(() => {
    if (categories.length > 0) return
    const fetch_ = async () => {
      try {
        const res = await fetch(`${API_BASE}/blog`)
        const json = await res.json()
        const blogData = json.blogs
        if (blogData?.data?.length > 0) {
          const map = new Map()
          blogData.data.forEach((b: any) => {
            if (b.get_category && !map.has(b.get_category.id)) {
              map.set(b.get_category.id, {
                id: b.get_category.id,
                category_name: b.get_category.category_name,
                category_slug: b.get_category.category_slug,
              })
            }
          })
          setCategories(Array.from(map.values()))
        }
      } catch (err) {
        console.error('Error fetching categories:', err)
      }
    }
    fetch_()
  }, [])

  /* ── Initial load ────────────────────────────────────────────────────── */
  useEffect(() => {
    if (initialData && initCat === initialCategory) return
    fetchBlogs(1, initCat)
    setSelectedCategory(initCat)
    setCurrentPage(1)
    setSearchQuery('')
  }, [initCat])

  /* ── Refetch on page change ──────────────────────────────────────────── */
  useEffect(() => {
    if (searchQuery) return
    if (initialData && currentPage === 1 && selectedCategory === initCat) return
    fetchBlogs(currentPage, selectedCategory)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  /* ── Client-side search filter ───────────────────────────────────────── */
  const displayedBlogs = searchQuery.trim()
    ? blogs.filter(b =>
        b.headline?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.short_description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    if (page >= 1 && page <= lastPage) setCurrentPage(page)
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
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
          <div className="mb-4 text-gray-700 font-semibold">
            {searchQuery ? (
              <>
                Found <span className="text-blue-600">{displayedBlogs.length}</span>{' '}
                blog{displayedBlogs.length !== 1 ? 's' : ''} matching &ldquo;{searchQuery}&rdquo;
              </>
            ) : (
              <>
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
            Array.from({ length: 6 }).map((_, i) => <LoadingSkeleton key={i} />)
          ) : displayedBlogs.length > 0 ? (
            displayedBlogs.map(item => {
              const imageUrl = item.imgpath?.startsWith('http')
                ? item.imgpath
                : `${IMAGE_BASE}/storage/${(item.thumbnail_path || 'default.jpg').replace(/^\/+/, '')}`
              const catSlug = item.get_category?.category_slug

              return (
                <Link
                  href={`/blog/${catSlug}/${item.slug}-${item.id}`}
                  key={item.id}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="relative">
                    <img
                      src={imageUrl}
                      alt={item.headline}
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div
                      onClick={e => { e.preventDefault(); handleCategoryChange(catSlug) }}
                      className={`absolute top-4 left-4 font-semibold text-sm px-3 py-1 rounded shadow-md cursor-pointer transition ${
                        selectedCategory === catSlug ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-blue-100'
                      }`}
                    >
                      {item.get_category?.category_name || 'General'}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-base text-gray-800 line-clamp-2 hover:text-blue-600 transition-colors">
                      {item.headline}
                    </h3>
                  </div>
                  <div className="px-4 pb-4 flex items-center text-gray-600 text-sm">
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
