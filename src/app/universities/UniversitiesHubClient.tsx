'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, Award, BookOpen, Users, FileCheck, CheckCircle2, Loader2 } from 'lucide-react'
import { FaUniversity, FaGraduationCap, FaGlobe, FaSchool } from 'react-icons/fa'
import TrendingCourses from '@/components/common/TrendingCourses'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || ''
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

type University = {
  id: number
  name: string
  uname?: string
  slug?: string
  established_year?: string | null
  city?: string | null
  state?: string | null
}

type UniMap = {
  public: University[]
  private: University[]
  foreign: University[]
}

const CARD_DATA = [
  {
    type: 'public',
    icon: <FaUniversity className="text-blue-600 text-4xl" />,
    title: 'Public Universities',
    description: "Discover Malaysia's top-ranked public institutions offering quality education at affordable rates.",
    path: '/universities/public-institution-in-malaysia',
  },
  {
    type: 'private',
    icon: <FaGraduationCap className="text-blue-600 text-4xl" />,
    title: 'Private Universities',
    description: 'Explore leading private universities known for industry connections and innovative programs.',
    path: '/universities/private-institution-in-malaysia',
  },
  {
    type: 'foreign',
    icon: <FaGlobe className="text-blue-600 text-4xl" />,
    title: 'Foreign Universities',
    description: 'Find international branch campuses offering globally recognized degrees.',
    path: '/universities/foreign-universities-in-malaysia',
  },
]

const MAIN_BODIES = [
  {
    name: 'Malaysian Qualifications Agency (MQA)',
    area: 'Higher education: programmes & institutions',
    description: 'Accredits higher-education programmes, implements the Malaysian Qualifications Framework (MQF), maintains the Malaysian Qualifications Register (MQR) listing accredited programmes.',
    note: 'Statutory body under Malaysian Qualifications Agency Act 2007.',
    icon: Shield,
    color: 'from-cyan-500 to-cyan-600',
  },
  {
    name: 'Finance Accreditation Agency (FAA)',
    area: 'Financial services / training programmes',
    description: 'Accredits training programmes in financial services industry (banks, insurance, securities) to ensure quality of adult professional programmes.',
    note: 'More specialised to professional continuing education rather than general higher ed.',
    icon: Shield,
    color: 'from-cyan-500 to-cyan-700',
  },
]

const PROFESSIONAL_BODIES = [
  {
    name: 'Board of Engineers Malaysia (BEM)',
    area: 'Engineering education & registration',
    description: 'Accredits engineering degree & diploma programmes for registration as Graduate Engineers; ensures programmes meet international accords (Washington, Sydney, Dublin) via EAC.',
    note: 'For engineering-related programmes, professional registration depends on this accreditation.',
    icon: Award,
  },
  {
    name: 'Actuarial Society of Malaysia (ASM)',
    area: 'Actuarial profession',
    description: 'The representative body for actuaries in Malaysia; supports education, professional development and recognition of actuarial qualifications.',
    note: 'Ensures actuarial standards and professional competence.',
    icon: FileCheck,
  },
  {
    name: 'Technological Association Malaysia (TAM)',
    area: 'Technology & engineering-science',
    description: 'Serves as a learned society, professional association, supports education, research, professional development across technology/engineering disciplines.',
    note: 'Membership-based, supportive/recognition role rather than formal accreditation of degrees.',
    icon: Users,
  },
]

const KEY_TAKEAWAYS = [
  { bold: 'MQA accreditation', text: 'is essential for higher education programmes to be recognized and valid in Malaysia.' },
  { bold: 'Professional body recognition', text: 'adds significant value for regulated professions like engineering, helping with registration and licensure.' },
  { bold: 'Dual compliance', text: 'is often required: institutions must meet both national accreditation (MQA/FAA) and professional body standards for regulated fields.' },
  { bold: '', text: 'Always verify that your chosen programme is accredited by the relevant bodies to ensure your qualification will be recognized for employment and further study.' },
]

// Render alternating colored words for headings
const ColoredHeading = ({ title }: { title: string }) => (
  <>
    {title.split(' ').map((word, i) => (
      <span key={i} className={i % 2 === 0 ? 'text-blue-800' : 'text-blue-600'}>
        {word}{' '}
      </span>
    ))}
  </>
)

type Props = {
  pageTitle?: string
  initialData?: UniMap
}

export default function UniversitiesHubClient({ pageTitle = 'TOP UNIVERSITIES IN MALAYSIA', initialData }: Props) {
  const [activeTab, setActiveTab] = useState<'public' | 'private' | 'foreign'>('public')
  const [universities, setUniversities] = useState<UniMap>(initialData || { public: [], private: [], foreign: [] })
  const [loading, setLoading] = useState(!initialData)
  const [currentPage, setCurrentPage] = useState({ public: 1, private: 1, foreign: 1 })
  const itemsPerPage = 10

  useEffect(() => {
    if (initialData) return
    const cacheKey = 'uni_hub_all'
    const cached = sessionStorage.getItem(cacheKey)
    if (cached) {
      try {
        setUniversities(JSON.parse(cached))
        setLoading(false)
        return
      } catch {}
    }

    const fetchType = async (type: string) => {
      const typeSlug =
        type === 'public'
          ? 'public-institution'
          : type === 'private'
            ? 'private-institution'
            : 'foreign-university'

      const res = await fetch(
        `${API_BASE}/universities/universities-in-malaysia?type_slug=${encodeURIComponent(typeSlug)}&page=1&per_page=21`,
        { headers: { 'x-api-key': API_KEY } },
      )
      if (!res.ok) return []
      const json = await res.json()
      return json?.data?.data || json?.data?.universities?.data || json?.data || []
    }

    const loadAll = async () => {
      try {
        const [pub, priv, foreign] = await Promise.all([
          fetchType('public'),
          fetchType('private'),
          fetchType('foreign'),
        ])
        const data = { public: pub, private: priv, foreign }
        setUniversities(data)
        sessionStorage.setItem(cacheKey, JSON.stringify(data))
      } catch {
        setUniversities({ public: [], private: [], foreign: [] })
      } finally {
        setLoading(false)
      }
    }

    loadAll()
  }, [])

  const renderTable = (data: University[], type: 'public' | 'private' | 'foreign') => {
    if (!data.length) {
      return <p className="text-center text-gray-500 py-8">No universities found.</p>
    }

    const currentPageNum = currentPage[type]
    const indexOfLast = currentPageNum * itemsPerPage
    const indexOfFirst = indexOfLast - itemsPerPage
    const currentItems = data.slice(indexOfFirst, indexOfLast)
    const totalPages = Math.ceil(data.length / itemsPerPage)

    const handlePage = (page: number) => {
      setCurrentPage(prev => ({ ...prev, [type]: page }))
      window.scrollTo({ top: 600, behavior: 'smooth' })
    }

    return (
      <div className="relative">
        <div className="md:hidden text-center mb-2">
          <p className="text-xs text-gray-500 italic flex items-center justify-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
            Swipe to see more
          </p>
        </div>

        <div style={{ margin: '1rem 0', borderRadius: '0.75rem', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)', padding: '0.15rem' }}>
          <div className="overflow-x-auto" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin', scrollbarColor: '#93c5fd #e0e7ff' }}>
            <div style={{ background: 'white', overflow: 'hidden', minWidth: '600px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)' }}>
                  <tr>
                    {['NO.', 'NAME OF UNIVERSITY', 'YEAR', 'LOCATION'].map(h => (
                      <th key={h} className="px-3 sm:px-4 md:px-5 py-2 sm:py-3 md:py-4 text-white text-left font-bold text-[10px] sm:text-xs uppercase tracking-wide border-0 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((uni, index) => {
                    const bgColor = index % 2 === 0 ? '#f9fafb' : '#ffffff'
                    const actualIndex = indexOfFirst + index + 1
                    const href = `/university/${uni.uname || uni.slug}`
                    return (
                      <tr
                        key={uni.id}
                        style={{ backgroundColor: bgColor, borderBottom: '1px solid #e5e7eb', transition: 'all 0.2s ease' }}
                        onMouseOver={e => (e.currentTarget.style.backgroundColor = '#eff6ff')}
                        onMouseOut={e => (e.currentTarget.style.backgroundColor = bgColor)}
                      >
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 border-0 align-middle">
                          <span className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-linear-to-br from-blue-100 to-blue-200 text-blue-800 rounded-full font-bold text-xs sm:text-sm">
                            {actualIndex}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 font-semibold text-xs sm:text-sm md:text-base border-0 align-middle">
                          <Link href={href} className="text-black hover:text-blue-600 transition-colors duration-200">
                            {uni.name}
                          </Link>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 border-0 align-middle">
                          <span className="text-blue-600 font-bold text-sm sm:text-base md:text-lg">
                            {uni.established_year || 'N/A'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-5 border-0 align-middle">
                          <span className="inline-flex items-center gap-1.5 sm:gap-2 text-gray-700">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-xs sm:text-sm md:text-base">
                              {uni.city && uni.state ? `${uni.city} / ${uni.state}` : uni.city || uni.state || 'N/A'}
                            </span>
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="mt-8 mb-16">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm sm:text-base text-gray-700 font-medium">
                  Showing <span className="font-bold text-blue-600">{indexOfFirst + 1}</span>-
                  <span className="font-bold text-blue-600">{Math.min(indexOfLast, data.length)}</span> of{' '}
                  <span className="font-bold text-blue-600">{data.length}</span> universities
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePage(currentPageNum - 1)}
                    disabled={currentPageNum === 1}
                    className={`flex items-center gap-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      currentPageNum === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span className="hidden sm:inline">Previous</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1
                      const show = page === 1 || page === totalPages || (page >= currentPageNum - 1 && page <= currentPageNum + 1)
                      const isDot = page === currentPageNum - 2 || page === currentPageNum + 2
                      if (show) return (
                        <button
                          key={page}
                          onClick={() => handlePage(page)}
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg font-bold text-sm sm:text-base transition-all duration-200 ${
                            currentPageNum === page
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
                    onClick={() => handlePage(currentPageNum + 1)}
                    disabled={currentPageNum === totalPages}
                    className={`flex items-center gap-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all duration-200 ${
                      currentPageNum === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-linear-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg'
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
      </div>
    )
  }

  return (
    <div className="py-10 px-4">
      {/* Page Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
        <ColoredHeading title={pageTitle} />
      </h1>

      {/* University Type Cards */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {CARD_DATA.map(card => (
            <div key={card.type} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 flex flex-col items-center">
              <div className="bg-blue-100 p-4 rounded-full mb-4">{card.icon}</div>
              <h3 className="text-xl font-bold text-blue-800 mb-3">{card.title}</h3>
              <p className="text-gray-600 text-center mb-6">{card.description}</p>
              <Link
                href={card.path}
                className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
              >
                BROWSE ALL
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* International Schools */}
      <div className="max-w-6xl mx-auto mt-20">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          <span className="text-blue-800">International Schools</span>{' '}
          <span className="text-blue-600">in Malaysia</span>
        </h2>
        <div className="flex justify-center grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 flex flex-col items-center">
            <div className="bg-blue-100 p-4 rounded-full mb-4">
              <FaSchool className="text-blue-600 text-4xl" />
            </div>
            <h3 className="text-xl font-bold text-blue-800 mb-3">International Schools</h3>
            <p className="text-gray-600 text-center mb-6">
              Discover top international schools in Malaysia that offer globally recognized curriculums like IGCSE, IB, and American diplomas.
            </p>
            <Link
              href="/universities/international-school-in-malaysia"
              className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
            >
              BROWSE ALL
            </Link>
          </div>
        </div>
      </div>

      {/* Accrediting and Professional Bodies */}
      <div className="max-w-6xl mx-auto mt-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">
          <span className="text-blue-800">Accrediting</span>{' '}
          <span className="text-blue-600">and Professional Bodies</span>
        </h2>

        {/* Main Accreditation Bodies */}
        <section className="mb-16">
          <div className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <Shield className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-blue-800">Main Accreditation Bodies</h2>
            </div>
            <p className="text-lg text-gray-600 text-center">
              National agencies responsible for quality assurance and accreditation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {MAIN_BODIES.map((body, i) => {
              const Icon = body.icon
              return (
                <div key={i} className="bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300">
                  <div className={`h-2 bg-linear-to-r ${body.color}`} />
                  <div className="p-8">
                    <div className="flex items-start gap-4 mb-6">
                      <div className={`p-3 bg-linear-to-br ${body.color} rounded-lg shrink-0`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{body.name}</h3>
                        <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">{body.area}</p>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-6">{body.description}</p>
                    <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                      <p className="text-sm text-gray-600 italic">{body.note}</p>
                    </div>
                    <Link
                      href="/resources/guidelines/MQA"
                      className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors block text-center"
                    >
                      View Detail
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Professional Bodies */}
        <section className="mb-16">
          <div className="mb-12">
            <div className="flex items-center justify-center gap-3 mb-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <h2 className="text-3xl font-bold text-blue-800">Professional Bodies</h2>
            </div>
            <p className="text-lg text-gray-600 text-center">
              Discipline-specific organizations that regulate professional standards and recognition
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {PROFESSIONAL_BODIES.map((body, i) => {
              const Icon = body.icon
              return (
                <div key={i} className="bg-white rounded-xl p-8 shadow-lg border border-gray-200 hover:shadow-2xl hover:border-blue-300 transition-all duration-300 flex flex-col">
                  <div className="w-14 h-14 bg-linear-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{body.name}</h3>
                  <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-4">{body.area}</p>
                  <p className="text-gray-700 leading-relaxed mb-6 grow">{body.description}</p>
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500 mb-6">
                    <p className="text-sm text-gray-600 italic">{body.note}</p>
                  </div>
                  <Link
                    href="/resources/guidelines/MQA"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors block text-center mt-auto"
                  >
                    View Detail
                  </Link>
                </div>
              )
            })}
          </div>
        </section>

        {/* Key Takeaways */}
        <section className="mb-16">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg border border-gray-200">
            <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">Key Takeaways</h2>
            <div className="space-y-4">
              {KEY_TAKEAWAYS.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <CheckCircle2 className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
                  <p className="text-gray-700 leading-relaxed">
                    {item.bold && <span className="font-semibold">{item.bold}</span>} {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* Find out more tabs */}
      <div className="max-w-6xl mx-auto mt-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-10">
          <span className="text-blue-800">Find out more</span>{' '}
          <span className="text-blue-600">about:</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setActiveTab('public')}
            className={`group relative overflow-hidden rounded-xl bg-white px-6 py-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${activeTab === 'public' ? 'ring-2 ring-blue-600' : ''}`}
          >
            <h3 className="text-xl font-bold text-blue-800">PUBLIC UNIVERSITIES</h3>
          </button>
          <button
            onClick={() => setActiveTab('private')}
            className={`group relative overflow-hidden rounded-xl bg-white px-6 py-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${activeTab === 'private' ? 'ring-2 ring-blue-600' : ''}`}
          >
            <h3 className="text-xl font-bold text-blue-800">PRIVATE UNIVERSITIES</h3>
          </button>
          <button
            onClick={() => setActiveTab('foreign')}
            className={`group relative overflow-hidden rounded-xl bg-white px-6 py-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer ${activeTab === 'foreign' ? 'ring-2 ring-blue-600' : ''}`}
          >
            <h3 className="text-xl font-bold text-blue-800">FOREIGN UNIVERSITIES</h3>
          </button>
        </div>
      </div>

      {/* University Table */}
      <div className="max-w-6xl mx-auto mt-8 sm:mt-12 md:mt-16 px-2 sm:px-4">
        {loading ? (
          <div className="flex justify-center items-center p-6 sm:p-10">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          <div className="p-3 sm:p-4 md:p-6 bg-white rounded-lg shadow-md">
            <div>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                {activeTab === 'public' && 'List of Public Universities in Malaysia'}
                {activeTab === 'private' && 'List of Private Universities in Malaysia'}
                {activeTab === 'foreign' && 'List of Foreign Universities in Malaysia'}
              </h3>
              {renderTable(universities[activeTab], activeTab)}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto mt-16">
        <TrendingCourses />
      </div>
    </div>
  )
}
