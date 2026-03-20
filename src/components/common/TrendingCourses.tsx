'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, ArrowRight } from 'lucide-react'

type Course = {
  id: number
  name: string
  slug: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

export default function TrendingCourses({ variant = 'grid' }: { variant?: 'grid' | 'sidebar' }) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(`${API_BASE}/home`, {
          headers: { 'x-api-key': API_KEY },
        })
        const json = await res.json()
        const fromHome = json?.data?.specializationsWithContent || json?.data?.specializations_with_content
        if (Array.isArray(fromHome) && fromHome.length > 0) {
          const limit = variant === 'sidebar' ? 11 : 12
          setCourses(fromHome.slice(0, limit))
          return
        }

        // Fallback for environments where /home does not include specializationsWithContent
        const fallbackRes = await fetch(`${API_BASE}/specializations?limit=12&orderBy=name&orderIn=asc`, {
          headers: { 'x-api-key': API_KEY },
        })
        const fallbackJson = await fallbackRes.json()
        const fallbackRows = Array.isArray(fallbackJson?.data) ? fallbackJson.data : []
        const normalized = fallbackRows
          .filter((row: any) => row?.id && row?.name && row?.slug)
          .map((row: any) => ({ id: Number(row.id), name: String(row.name), slug: String(row.slug) }))
        const limit = variant === 'sidebar' ? 11 : 12
        setCourses(normalized.slice(0, limit))
      } catch (error) {
        console.error('Failed to load trending courses:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [variant])

  if (variant === 'sidebar') {
    if (loading) {
      return (
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
          <div className="h-px bg-gray-200 w-full mb-6" />
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-50 rounded-lg w-full" />
            ))}
          </div>
        </div>
      )
    }
    if (courses.length === 0) return null

    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xl">🔥</span>
          <h3 className="text-xl font-bold text-gray-800">Trending Courses</h3>
        </div>
        <div className="h-px bg-gray-200 w-full mb-6" />
        <ul className="space-y-1">
          {courses.map((course) => (
            <li key={course.id}>
              <Link
                href={`/specialization/${course.slug}`}
                className="flex items-center justify-between py-3 px-2 rounded-lg hover:bg-orange-50 transition-colors group"
              >
                <span className="text-gray-700 font-medium group-hover:text-blue-700 transition-colors">
                  {course.name}
                </span>
                <ArrowRight className="text-orange-500 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  // Grid variant
  if (loading) {
    return (
      <section className="bg-white px-4 md:px-10 lg:px-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-10">
          List of Top Trending <span className="text-blue-600">Courses in Malaysia</span>
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl shadow-md p-5 border border-gray-100">
              <div className="h-5 bg-gray-300 rounded w-3/4 mb-4" />
              <div className="h-10 bg-gray-200 rounded-full w-24" />
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white px-4 md:px-10 lg:px-24">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-10">
        List of Top Trending <span className="text-blue-600">Courses in Malaysia</span>
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((course, index) => (
          <Link
            key={course.id || index}
            href={`/specialization/${course.slug}`}
            className="group bg-gray-50 rounded-2xl shadow-md hover:shadow-xl p-5 transition-all duration-300 border border-gray-100 hover:border-blue-200 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-700 font-medium text-sm">Study</span>
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-teal-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-md">
                    <BookOpen className="h-5 w-5" />
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center transition-all duration-300 transform group-hover:translate-x-1">
                  <ArrowRight className="text-white w-4 h-4" />
                </div>
              </div>
              <h3 className="text-gray-800 font-semibold text-base mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 min-h-12">
                {course.name}
              </h3>
              <div className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full">
                In Malaysia
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="text-center mt-12">
        <Link
          href="/specialization"
          className="inline-flex items-center border-2 border-blue-800 text-blue-800 font-semibold px-6 py-2 rounded-full transition hover:bg-blue-800 hover:text-white"
        >
          Browse All Courses
        </Link>
      </div>
    </section>
  )
}
