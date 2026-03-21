'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Breadcrumb from '@/components/Breadcrumb'
import { storageUrl } from '@/lib/constants'

const API_BASE = process.env.NEXT_PUBLIC_API_URL
const IMG_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || API_BASE

const EXAM_CACHE_TTL = 5 * 60 * 1000

type Exam = {
  id: number
  page_name: string
  headline?: string
  uri?: string
  slug?: string
  imgpath?: string
}

function getCache() {
  try {
    const raw = sessionStorage.getItem('exam_list_cache')
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > EXAM_CACHE_TTL) {
      sessionStorage.removeItem('exam_list_cache')
      return null
    }
    return data
  } catch {
    return null
  }
}

function setCache(data: any) {
  try {
    sessionStorage.setItem('exam_list_cache', JSON.stringify({ data, ts: Date.now() }))
  } catch {}
}

function imageSrc(path?: string) {
  if (!path) return '/girl-banner.webp'
  if (path.startsWith('http://') || path.startsWith('https://')) return path
  const storage = storageUrl(path)
  if (storage) return storage
  const base = (IMG_BASE || '').replace(/\/$/, '')
  const clean = path.replace(/^\//, '')
  return `${base}/${clean}`
}

const LoadingSkeleton = () => (
  <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-lg animate-pulse">
    <div className="relative h-48 bg-linear-to-r from-gray-200 via-gray-300 to-gray-200 bg-size-[400%_100%]" />
    <div className="p-6 space-y-4">
      <div className="space-y-3">
        <div className="h-5 bg-gray-300 rounded-lg w-4/5" />
        <div className="h-4 bg-gray-200 rounded-lg w-3/5" />
      </div>
      <div className="h-10 bg-gray-300 rounded-full w-full" />
    </div>
  </div>
)

export default function ExamsClient({ initialExams = [] }: { initialExams?: Exam[] }) {
  const [exams, setExams] = useState<Exam[]>(initialExams)
  const [loading, setLoading] = useState(initialExams.length === 0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cached = getCache()

    if (initialExams.length > 0 && !cached?.exams?.length) {
      setCache({ exams: initialExams })
    }

    const fetchData = async () => {
      if (!API_BASE) {
        setLoading(false)
        return
      }

      try {
        const res = await fetch(`${API_BASE}/exams`)
        if (!res.ok) throw new Error()
        const json = await res.json()
        const list: Exam[] = json?.data?.exams || json?.exams || []
        setExams(list)
        setCache({ exams: list })
      } catch {
        if (cached?.exams?.length) {
          setExams(cached.exams)
        } else if (initialExams.length === 0) {
          setError('Failed to load exams.')
        }
      } finally {
        setLoading(false)
      }
    }

    if (cached?.exams?.length) {
      setExams(cached.exams)
      setLoading(false)
    }

    if (!cached?.exams?.length && initialExams.length === 0) {
      fetchData()
    }
  }, [initialExams])

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-purple-100">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Resources', href: '/resources' },
          { label: 'Exams' },
        ]}
      />

      <div className="px-6 py-14">
        <h1 className="text-4xl font-bold text-center mb-12 text-gray-800">
          Explore Top <span className="text-blue-600">Study Abroad Exams</span>
        </h1>

        {loading && exams.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
            {[...Array(8)].map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : error && exams.length === 0 ? (
          <p className="text-center text-red-500 text-lg">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 max-w-7xl mx-auto">
            {exams.map((exam, index) => (
              <div
                key={exam.id || index}
                className="bg-white/40 backdrop-blur-md shadow-lg rounded-xl overflow-hidden transform hover:-translate-y-1 hover:scale-105 transition duration-300 ease-in-out border border-gray-200"
              >
                <img src={imageSrc(exam.imgpath)} alt={exam.page_name} className="w-full h-48 object-cover" loading="lazy" />
                <div className="p-5">
                  <h2 className="text-xl font-semibold text-gray-800 mb-2">{exam.page_name}</h2>
                  <p className="text-sm text-gray-600 mb-4 h-16 overflow-hidden">{exam.headline}</p>
                  {(exam.uri || exam.slug) ? (
                    <Link
                      href={`/resources/exams/${exam.uri || exam.slug}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 w-full text-center block"
                    >
                      View Details →
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="bg-gray-300 text-white px-4 py-2 rounded-lg w-full text-center block cursor-not-allowed"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
