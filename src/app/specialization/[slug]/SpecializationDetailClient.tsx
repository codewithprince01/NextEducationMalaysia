'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import SideInquiryForm from '@/components/forms/SideInquiryForm'
import { Info, BookOpen, Lightbulb, ChevronRight, ArrowLeft, GraduationCap, FileText, Award } from 'lucide-react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''

// ── Cache ────────────────────────────────────────────────────────────────────
const CACHE_TTL = 10 * 60 * 1000
const cache = {
  get(key: string) {
    try {
      const raw = sessionStorage.getItem(`spec_${key}`)
      if (!raw) return null
      const { data, ts } = JSON.parse(raw)
      if (Date.now() - ts > CACHE_TTL) { sessionStorage.removeItem(`spec_${key}`); return null }
      return data
    } catch { return null }
  },
  set(key: string, data: unknown) {
    try { sessionStorage.setItem(`spec_${key}`, JSON.stringify({ data, ts: Date.now() })) } catch { /* ignore */ }
  },
}

// ── HTML Formatter ───────────────────────────────────────────────────────────
function formatHTML(html: string): string {
  if (!html) return ''
  return html
    .replace(/<a /g, `<a style="color:#2563EB;text-decoration:underline;font-weight:500;" `)
    .replace(/<table\b[^>]*>/gi, `<div style="overflow-x:auto;width:100%;display:block;"><table style="width:100%;border-collapse:collapse;">`)
    .replace(/<\/table>/gi, '</table></div>')
    .replace(/<th>/g, `<th style="background:#2563EB;color:#fff;padding:8px 12px;font-size:0.8rem;font-weight:600;text-align:left;border-bottom:1px solid #1d4ed8;">`)
    .replace(/<td>/g, `<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:0.875rem;">`)
}

// ── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 animate-pulse">
      <div className="relative min-h-[55vh] bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900" />
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="h-16 bg-white rounded-2xl shadow-xl border border-gray-100" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-white rounded-xl shadow-md border border-blue-100" />)}
          </div>
          <div className="space-y-6">
            <div className="h-80 bg-white rounded-xl shadow-md" />
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Level icon helper ────────────────────────────────────────────────────────
function getLevelIcon(slug: string) {
  const s = slug.toLowerCase()
  if (s.includes('phd') || s.includes('postgraduate')) return <Award className="w-5 h-5" />
  if (s.includes('undergraduate') || s.includes('degree')) return <GraduationCap className="w-5 h-5" />
  return <FileText className="w-5 h-5" />
}

// ── Main Component ────────────────────────────────────────────────────────────
interface Props {
  slug: string
  levelSlug?: string
  initialData?: any
}

export default function SpecializationDetailClient({ slug, levelSlug, initialData }: Props) {
  const [data, setData] = useState<any>(initialData || null)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<string | null>(levelSlug || null)
  const [levelContent, setLevelContent] = useState<any[]>([])
  const [levelLoading, setLevelLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('')
  const sectionRefs = useRef<Record<string, React.RefObject<HTMLElement>>>({})

  // ── Fetch main specialization data ─────────────────────────────────────────
  useEffect(() => {
    if (initialData) return
    const fetchData = async () => {
      const cacheKey = `detail_${slug}`
      const cached = cache.get(cacheKey)
      if (cached) { setData(cached); setLoading(false); return }
      try {
        setLoading(true)
        const res = await fetch(`${API_BASE}/specialization/${slug}`)
        if (!res.ok) throw new Error('Not found')
        const json = await res.json()
        const d = json.data || json
        setData(d)
        cache.set(cacheKey, d)
      } catch {
        setError('Failed to load specialization data.')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [slug])

  // ── Fetch level content ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!selectedLevel || !data) return
    const spec = data.specialization || data.category || data
    const levels = spec?.specialization_levels || spec?.specializationlevels || []
    const level = levels.find((l: any) => (l.url_slug || l.level_slug || '') === selectedLevel)
    if (!level?.id) return

    const cacheKey = `level_${level.id}`
    const cached = cache.get(cacheKey)
    if (cached) { setLevelContent(cached); return }

    setLevelLoading(true)
    fetch(`${API_BASE}/specialization-level-contents/${level.id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(json => {
        const rows = json.data?.rows || json.rows || []
        setLevelContent(rows)
        cache.set(cacheKey, rows)
      })
      .catch(() => setLevelContent([]))
      .finally(() => setLevelLoading(false))
  }, [selectedLevel, data])

  // ── Derived state ────────────────────────────────────────────────────────────
  const spec = data?.specialization || data?.category || data || {}
  const faqs: any[] = spec.faqs || []
  const levels: any[] = spec.specialization_levels || spec.specializationlevels || []

  // Build tabs + content map
  const rawContents = selectedLevel && levelContent.length > 0
    ? levelContent.map((r: any) => ({ tab: r.title, description: r.description }))
    : spec.contents || []

  const tabs: { name: string }[] = []
  const contentMap: Record<string, string> = {}
  rawContents.forEach((c: any) => {
    const tabName = c.tab || c.title
    if (tabName && c.description) {
      if (!contentMap[tabName]) { tabs.push({ name: tabName }); contentMap[tabName] = c.description }
    }
  })

  // Init refs and activeTab
  tabs.forEach(({ name }) => {
    if (!sectionRefs.current[name]) sectionRefs.current[name] = { current: null } as any
  })

  useEffect(() => {
    if (tabs.length > 0 && !activeTab) setActiveTab(tabs[0].name)
  }, [tabs.length])

  const handleTabClick = useCallback((name: string) => {
    setActiveTab(name)
    const el = document.getElementById(`tab-${name.toLowerCase().replace(/\s+/g, '-')}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  if (loading) return <Skeleton />

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/specialization" className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors">
            <ArrowLeft className="w-5 h-5" /> Back to Specializations
          </Link>
        </div>
      </div>
    )
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Specializations', href: '/specialization' },
    { label: spec.name || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <Breadcrumb items={breadcrumbItems} />

      {/* ── Hero ── */}
      <div className="relative min-h-[55vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        {/* Background image - desktop only */}
        <img
          src="/girl-banner.png"
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          className="hidden md:block absolute inset-0 w-full h-full object-cover object-center scale-105"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 via-purple-900/70 to-indigo-900/80" />
        <div className="relative z-10 text-center px-4 md:px-8 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            {spec.name || (
              <>Discover Your Perfect
                <span className="block bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
                  Specialization
                </span>
              </>
            )}
          </h1>
          <p className="text-white/90 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {spec.description
              ? spec.description.replace(/<[^>]+>/g, '').slice(0, 180)
              : 'Start your academic journey with the right path. Explore top courses and fields of study in Malaysia with expert guidance.'}
          </p>
        </div>
      </div>

      {/* ── Level Selector ── */}
      {levels.length > 0 && (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-6 sm:mb-8 relative z-10">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 md:p-6">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Select Your Level</p>
              <div className="flex flex-wrap gap-2 md:gap-3">
                {levels.map((level: any) => {
                  const levelSl = level.url_slug || level.level_slug || ''
                  const isActive = selectedLevel === levelSl
                  return (
                    <Link
                      key={level.id}
                      href={`/specialization/${slug}/${levelSl}`}
                      onClick={() => setSelectedLevel(levelSl)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all border-2 ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-600 shadow-lg shadow-blue-200'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400 hover:text-blue-600 hover:shadow-md'
                      }`}
                    >
                      {getLevelIcon(levelSl)}
                      {level.level || level.level_name || levelSl}
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky Tab Nav (desktop) ── */}
      {tabs.length > 0 && (
        <div
          className="hidden lg:block bg-white border-b border-gray-200 shadow-sm"
          style={{ position: 'sticky', top: '56px', zIndex: 9998 }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="flex gap-0 overflow-x-auto">
              {tabs.map(({ name }) => (
                <li key={name}>
                  <a
                    href={`#tab-${name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={e => { e.preventDefault(); handleTabClick(name) }}
                    className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                      activeTab === name
                        ? 'text-blue-600 border-blue-600'
                        : 'text-gray-600 border-transparent hover:text-blue-600 hover:border-blue-200'
                    }`}
                  >
                    <Info size={16} />
                    <span>{name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">

          {/* Left Column — Content + FAQs */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {levelLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1,2].map(i => <div key={i} className="h-40 bg-white rounded-xl border border-blue-100" />)}
              </div>
            ) : tabs.length > 0 ? (
              tabs.map(({ name }) => (
                <section
                  key={name}
                  id={`tab-${name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="scroll-mt-24"
                >
                  <div className="bg-gradient-to-br from-white to-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-5 md:p-6 border border-blue-100 shadow-md hover:shadow-lg transition-shadow">
                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Info size={18} className="text-blue-600" />
                      {name}
                    </h2>
                    <div
                      className="prose prose-sm sm:prose prose-blue max-w-none text-gray-700 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatHTML(contentMap[name]) }}
                    />
                  </div>
                </section>
              ))
            ) : (
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Course details coming soon.</p>
              </div>
            )}

            {/* FAQs */}
            {faqs.length > 0 && (
              <section className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-md">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                  Frequently Asked Questions
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  {faqs.map((faq: any, i: number) => (
                    <details key={i} className="group bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl overflow-hidden border border-blue-100">
                      <summary className="cursor-pointer font-semibold text-gray-900 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-blue-100 transition-colors text-sm sm:text-base">
                        <span className="pr-2">{faq.question}</span>
                        <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 group-open:rotate-90 transition-transform shrink-0" />
                      </summary>
                      <div
                        className="px-4 sm:px-6 pb-3 sm:pb-4 text-gray-700 leading-relaxed prose prose-sm max-w-none text-xs sm:text-sm"
                        dangerouslySetInnerHTML={{ __html: formatHTML(faq.answer) }}
                      />
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6 lg:space-y-8">
            <div id="get-in-touch">
              <SideInquiryForm title="Enquire Now" context={spec.name || slug} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
