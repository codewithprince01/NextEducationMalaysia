'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import SideInquiryForm from '@/components/forms/SideInquiryForm'
import { CalendarDays, ArrowRight, User, Clock } from 'lucide-react'

const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || ''
const API_BASE = '/api/v1'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

// ── Session cache ────────────────────────────────────────────────────────────
const CACHE_TTL = 5 * 60 * 1000
const BLOG_DETAIL_CACHE_VERSION = 'v2'
const blogDetailCache = {
  get(key: string) {
    try {
      const raw = sessionStorage.getItem(`blog_detail_${BLOG_DETAIL_CACHE_VERSION}_${key}`)
      if (!raw) return null
      const { data, ts } = JSON.parse(raw)
      if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem(`blog_detail_${BLOG_DETAIL_CACHE_VERSION}_${key}`); return null }
      return data
    } catch { return null }
  },
  set(key: string, data: unknown) {
    try { sessionStorage.setItem(`blog_detail_${BLOG_DETAIL_CACHE_VERSION}_${key}`, JSON.stringify({ data, ts: Date.now() })) } catch { /* ignore */ }
  },
}

// ── HTML formatter matching the old project exactly ──────────────────────────
function formatBlogHTML(html: string, sectionIndex: string | number | null = null): string {
  if (!html) return ''
  let formatted = html
  let h2Counter = 0
  let h3Counter = 0

  // Links styling
  formatted = formatted.replace(
    /<a /g,
    `<a style="color: #2563EB; text-decoration: underline; font-weight: 500; transition: all 0.2s;" onmouseover="this.style.color='#1E40AF'" onmouseout="this.style.color='#2563EB'" `,
  )

  // H2 headings
  formatted = formatted.replace(/<h2>(.*?)<\/h2>/g, (_match, content) => {
    const id = sectionIndex !== null ? `section-${sectionIndex}-h2-${h2Counter}` : `h2-${h2Counter}`
    h2Counter++
    return `<h2 id="${id}" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: clamp(1.25rem, 4vw, 1.75rem); font-weight: 700; color: #000000; margin: clamp(1rem, 3vw, 2rem) 0 clamp(0.5rem, 2vw, 1rem); line-height: 1.4; border-left: 4px solid #000000; padding-left: clamp(0.5rem, 2vw, 0.75rem); scroll-margin-top: 100px;">${content}</h2>`
  })

  // H3 headings
  formatted = formatted.replace(/<h3>(.*?)<\/h3>/g, (_match, content) => {
    const id = sectionIndex !== null ? `section-${sectionIndex}-h3-${h3Counter}` : `h3-${h3Counter}`
    h3Counter++
    return `<h3 id="${id}" style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; font-size: clamp(1.1rem, 3.5vw, 1.375rem); font-weight: 600; color: #000000; margin: clamp(1rem, 3vw, 1.5rem) 0 clamp(0.5rem, 2vw, 0.75rem); line-height: 1.5; scroll-margin-top: 100px;">${content}</h3>`
  })

  // Paragraph styling
  formatted = formatted.replace(
    /<p>/g,
    `<p style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: clamp(1.5, 4vw, 1.6); font-size: clamp(0.875rem, 2.5vw, 1.0625rem); color: #1F2937; margin: clamp(0.75rem, 2vw, 1rem) 0;">`,
  )

  // UL styling
  formatted = formatted.replace(
    /<ul>/g,
    `<ul style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; padding-left: clamp(1rem, 3vw, 1.5rem); margin: clamp(0.25rem, 1vw, 0.5rem) 0; list-style-type: disc; color: #1F2937;">`,
  )

  // LI styling
  formatted = formatted.replace(
    /<li>/g,
    `<li style="margin-bottom: 0.5rem; line-height: clamp(1.4, 4vw, 1.5); font-size: clamp(0.875rem, 2.5vw, 1.0625rem); color: #1F2937;">`,
  )

  // Table wrapper
  formatted = formatted.replace(
    /<table\b[^>]*>/gi,
    `<div class="responsive-table-wrapper"><table class="w-full min-w-[600px] border-collapse text-left">`,
  )
  formatted = formatted.replace(/<\/table>/gi, `</table></div>`)

  // TH styling
  formatted = formatted.replace(
    /<th>/g,
    `<th class="bg-blue-600 text-white px-4 py-3 text-sm font-semibold uppercase tracking-wider whitespace-nowrap md:whitespace-normal border-b border-blue-700">`,
  )

  // TD styling
  formatted = formatted.replace(
    /<td>/g,
    `<td class="px-4 py-3 border-b border-gray-200 text-gray-700 text-sm align-top">`,
  )

  return formatted
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function BlogDetailSkeleton() {
  return (
    <div className="bg-gray-50 py-4 md:py-8 animate-pulse">
      <div className="max-w-7xl mx-auto px-3 md:px-4 flex flex-col lg:flex-row gap-6 md:gap-8">
        <div className="w-full lg:w-2/3 bg-white shadow-lg rounded-xl p-4 md:p-6 space-y-4">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-1/3" />
          <div className="aspect-video w-full bg-gray-200 rounded-xl" />
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
        <div className="w-full lg:w-1/3 space-y-4">
          <div className="bg-white rounded-xl shadow-md p-4 h-64" />
          <div className="bg-white rounded-xl shadow-md p-4 h-48" />
        </div>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────
interface BlogDetailClientProps {
  category: string
  slugWithId: string
}

function normalizeDetailPayload(payload: any) {
  const root = payload || {}
  const dataRoot = root?.data && typeof root.data === 'object' ? root.data : root
  const blogData = dataRoot?.blog || dataRoot || {
    headline: '',
    created_at: new Date().toISOString(),
    author: { name: '' },
    description: '',
    parent_contents: [],
    categories: [],
  }

  return {
    blog: blogData,
    relatedBlogs: dataRoot?.related_blogs || root?.related_blogs || [],
    categories: dataRoot?.categories || root?.categories || [],
    courses: dataRoot?.specializations || root?.specializations || [],
  }
}

export default function BlogDetailClient({ category, slugWithId, initialData }: BlogDetailClientProps & { initialData?: any }) {
  const cacheKey = `${category}_${slugWithId}`

  const normalizedInitial = normalizeDetailPayload(initialData)
  const [blog, setBlog] = useState<any>(normalizedInitial.blog)
  const [relatedBlogs, setRelatedBlogs] = useState<any[]>(normalizedInitial.relatedBlogs)
  const [categories, setCategories] = useState<any[]>(normalizedInitial.categories)
  const [courses, setCourses] = useState<any[]>(normalizedInitial.courses)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      const parsed = normalizeDetailPayload(initialData)
      setBlog(parsed.blog)
      setRelatedBlogs(parsed.relatedBlogs)
      setCategories(parsed.categories)
      setCourses(parsed.courses)
      setLoading(false)
      return
    }

    const cached = blogDetailCache.get(cacheKey)
    if (cached) {
      setBlog(cached.blog || { headline: '', created_at: new Date().toISOString(), author: { name: '' }, description: '', parent_contents: [], categories: [] })
      setRelatedBlogs(cached.relatedBlogs || [])
      setCategories(cached.categories || [])
      setCourses(cached.courses || [])
      setLoading(false)
    }

    const controller = new AbortController()
    const fetchBlogData = async () => {
      try {
        if (!cached) setLoading(true)
        setError(null)
        let res = await fetch(`${API_BASE}/blog-details/${category}/${slugWithId}`, {
          headers: { 'x-api-key': API_KEY },
          cache: 'no-store',
          signal: controller.signal,
        })
        let json: any = null

        if (res.ok) {
          json = await res.json()
        } else {
          const idMatch = slugWithId.match(/-(\d+)$/)
          const blogId = idMatch ? Number.parseInt(idMatch[1], 10) : NaN

          if (Number.isFinite(blogId) && blogId > 0) {
            res = await fetch(`${API_BASE}/blog-detail-by-id/${blogId}`, {
              headers: { 'x-api-key': API_KEY },
              cache: 'no-store',
              signal: controller.signal,
            })
            if (!res.ok) throw new Error('Failed')
            json = await res.json()
          } else {
            throw new Error('Failed')
          }
        }

        const data = json?.data || json
        const blogData = data.blog || data
        const relatedData = data.related_blogs || json?.related_blogs || []
        const catsData = data.categories || json?.categories || []
        const coursesData = data.specializations || json?.specializations || []

        setBlog(blogData)
        setRelatedBlogs(relatedData)
        setCategories(catsData)
        setCourses(coursesData)

        blogDetailCache.set(cacheKey, { blog: blogData, relatedBlogs: relatedData, categories: catsData, courses: coursesData })
      } catch (err) {
        if ((err as Error)?.name === 'AbortError') return
        setError('Failed to load blog details.')
      } finally {
        setLoading(false)
      }
    }
    fetchBlogData()
    return () => controller.abort()
  }, [category, slugWithId, initialData, cacheKey])

  useEffect(() => {
    if (relatedBlogs.length === 0) return
    relatedBlogs
      .filter((item: any) => item?.thumbnail_path)
      .slice(0, 6)
      .forEach((item: any) => {
        const img = new Image()
        img.src = `${IMAGE_BASE}/storage/${String(item.thumbnail_path).replace(/^\/+/, '')}`
      })
  }, [relatedBlogs])

  if (loading) return <BlogDetailSkeleton />
  if (error) return <div className="p-6 text-center text-red-600">{error}</div>

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: category.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), href: `/blog/${category}` },
    { label: blog.headline || slugWithId },
  ]

  const filteredRelatedBlogs = useMemo(
    () => relatedBlogs.filter((item: any) => Number(item?.id) !== Number(blog?.id)),
    [relatedBlogs, blog?.id],
  )

  return (
    <>
      <Breadcrumb items={breadcrumbItems} />

      {/* Responsive image & table reset styles */}
      <style>{`
        .blog-content img {
          max-width: 100% !important;
          height: auto !important;
          max-height: 500px;
          object-fit: contain;
          border-radius: 8px;
          margin: 0.5rem auto !important;
          display: block;
        }
        @media (max-width: 768px) {
          .blog-content img { max-height: 300px; }
        }
        .prose table { margin: 0 !important; }
        .blog-content .responsive-table-wrapper {
          overflow-x: auto !important;
          width: 100% !important;
          display: block !important;
        }
      `}</style>

      <div className="bg-gray-50 py-4 md:py-8">
        <div className="max-w-7xl mx-auto px-3 md:px-4 flex flex-col lg:flex-row gap-6 md:gap-8">

          {/* ── Main Article Column ── */}
          <div className="w-full lg:w-2/3 bg-white shadow-lg rounded-xl p-4 md:p-6 space-y-4">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
              {blog.headline}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-4 border-b">
              {blog.author && (
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-gray-500" />
                  {blog.author.name || 'Unknown'}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4 text-gray-500" />
                {new Date(blog.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-gray-500" />
                {new Date(blog.created_at).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
              </span>
            </div>

            {blog.thumbnail_path && (
              <div className="aspect-video w-full rounded-xl shadow-md overflow-hidden bg-gray-100">
                <img
                  src={`${IMAGE_BASE}/storage/${blog.thumbnail_path.replace(/^\/+/, '')}`}
                  alt={blog.headline}
                  className="w-full h-full object-cover"
                  loading="eager"
                  fetchPriority="high"
                  width={800}
                  height={450}
                />
              </div>
            )}

            {/* Table of Contents */}
            {blog.parent_contents?.length > 0 && (
              <div className="bg-white border-2 border-gray-200 rounded-xl my-3 md:my-4 p-4 md:p-5">
                <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-2 text-center flex items-center justify-center gap-2">
                  Table of Contents
                </h2>
                <ol className="space-y-2 md:space-y-3">
                  {blog.parent_contents.map((section: any, index: number) => (
                    <li key={index} className="md:ml-6">
                      <a
                        href={`#section-${index}`}
                        className="text-gray-900 hover:text-blue-600 font-semibold text-sm md:text-base transition-colors duration-200"
                      >
                        {index + 1}. {section.title}
                      </a>
                      {section.child_contents?.length > 0 && (
                        <ol className="ml-6 md:ml-8 mt-2 space-y-1 md:space-y-2">
                          {section.child_contents.map((child: any, i: number) => (
                            <li key={i}>
                              <a
                                href={`#subsection-${index}-${i}`}
                                className="text-blue-600 hover:text-blue-800 text-xs md:text-sm font-medium transition-colors hover:underline"
                              >
                                {index + 1}.{i + 1} {child.title}
                              </a>
                            </li>
                          ))}
                        </ol>
                      )}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-2 md:gap-4 justify-center my-4 md:my-6">
              <a
                href="/signup"
                className="px-6 md:px-8 py-2 md:py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 shadow-md hover:shadow-lg transition-all text-sm md:text-base"
              >
                APPLY HERE
              </a>
              <button
                onClick={() => document.getElementById('get-in-touch')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 md:px-8 py-2 md:py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-full hover:bg-blue-600 hover:text-white transition-all text-sm md:text-base"
              >
                ENQUIRE NOW
              </button>
            </div>

            {/* Main description */}
            {blog.description && (
              <div
                className="prose prose-lg max-w-none blog-content"
                style={{ maxWidth: '100%' }}
                dangerouslySetInnerHTML={{ __html: formatBlogHTML(blog.description, 'main') }}
              />
            )}

            {/* Section contents */}
            {blog.parent_contents?.length > 0 && (
              <div className="space-y-6 mt-2">
                {blog.parent_contents.map((section: any, index: number) => (
                  <div key={index} id={`section-${index}`} className="scroll-mt-24">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 px-4 py-2 border-l-4 border-blue-500 bg-blue-50 rounded">
                      {section.title}
                    </h2>
                    <div
                      className="prose prose-lg max-w-none prose-p:my-1 prose-li:my-1 prose-h2:my-2 prose-h3:my-1 blog-content"
                      style={{ maxWidth: '100%' }}
                      dangerouslySetInnerHTML={{ __html: formatBlogHTML(section.description) }}
                    />
                    {section.child_contents?.length > 0 && (
                      <div className="mt-6 space-y-6">
                        {section.child_contents.map((child: any, i: number) => (
                          <div key={i} id={`subsection-${index}-${i}`} className="scroll-mt-24">
                            <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
                              {child.title}
                            </h3>
                            <div
                              className="prose max-w-none blog-content"
                              style={{ maxWidth: '100%' }}
                              dangerouslySetInnerHTML={{ __html: formatBlogHTML(child.description) }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {/* Author card */}
                <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4 p-3 md:p-5 bg-white shadow-sm rounded-xl w-full">
                  <div className="relative w-16 h-16 md:w-24 md:h-24">
                    <img
                      src="/blog-detail-avtar.png"
                      alt="avatar"
                      className="w-full h-full object-contain select-none"
                    />
                    <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 bg-green-500 rounded-full p-[2px] md:p-[4px] shadow-md flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 md:h-4 md:w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div className="text-center md:text-left">
                    <h2 className="text-xs md:text-sm font-semibold text-gray-900">Team Education Malaysia</h2>
                    <p className="text-gray-600 md:text-gray-700 text-xs md:text-sm">Content Curator | Updated on – Aug 18, 2023</p>
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      className="text-blue-600 mt-1 font-medium hover:underline text-xs md:text-sm cursor-pointer"
                    >
                      Read Full Bio
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Sidebar ── */}
          <aside className="w-full lg:w-1/3 space-y-4 md:space-y-6">
            {/* Categories */}
            {categories.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-900">Categories</h3>
                <ul className="space-y-0">
                  {categories.map((cat: any) => (
                    <li key={cat.id}>
                      <a
                        href={`/blog/${cat.category_slug}`}
                        className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 rounded-lg hover:bg-blue-50 transition group"
                      >
                        <span className="text-gray-700 group-hover:text-blue-600 font-medium text-sm md:text-base">
                          {cat.category_name}
                        </span>
                        <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Inquiry Form */}
            <div id="get-in-touch">
              <SideInquiryForm title="Get In Touch" context={blog.headline} />
            </div>

            {/* Related Blogs */}
            {filteredRelatedBlogs.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-900">Related Blogs</h3>
                <div className="space-y-3 md:space-y-4">
                  {filteredRelatedBlogs.map((item: any) => {
                    const blogSlug = item.slug ||
                      item.headline?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') ||
                      'blog'
                    const itemCategory =
                      item.category?.category_slug ||
                      item.get_category?.category_slug ||
                      item.getCategory?.category_slug ||
                      category
                    return (
                      <Link
                        key={item.id}
                        href={`/blog/${itemCategory}/${blogSlug}-${item.id}`}
                        className="flex items-center gap-2 md:gap-3 hover:bg-gray-50 p-2 md:p-3 rounded-lg transition group"
                      >
                        {item.thumbnail_path && (
                          <img
                            src={`${IMAGE_BASE}/storage/${item.thumbnail_path.replace(/^\/+/, '')}`}
                            alt={item.headline}
                            className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-lg shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs md:text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600">
                            {item.headline}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Trending Courses */}
            {courses.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4 text-gray-900">Trending Courses</h3>
                <ul className="space-y-1 md:space-y-2">
                  {courses.map((spec: any) => (
                    <li key={spec.id}>
                      <a
                        href={`/specialization/${spec.slug}`}
                        className="flex items-center justify-between px-3 md:px-4 py-2 md:py-3 rounded-lg hover:bg-orange-50 transition group"
                      >
                        <span className="text-gray-700 group-hover:text-orange-600 font-medium text-sm md:text-base">
                          {spec.name}
                        </span>
                        <ArrowRight className="w-3 h-3 md:w-4 md:h-4 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  )
}
