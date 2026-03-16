'use client'

import React, { useEffect, useState } from 'react'
import { MapPin, GraduationCap, ArrowRight, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { storageUrl } from '@/lib/constants'

interface University {
  id: number
  name: string
  uname: string
  city: string
  logo_path?: string
  logo?: string
}

interface FeaturedUniversitiesProps {
  variant?: 'grid' | 'sidebar'
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL

export default function FeaturedUniversities({ variant = 'grid' }: FeaturedUniversitiesProps) {
  const [universities, setUniversities] = useState<University[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUnis = async () => {
      try {
        const res = await fetch(`${API_BASE}/featured-universities`)
        if (!res.ok) throw new Error('Failed to fetch')
        const json = await res.json()
        const list = json.data?.universities || json.universities || []
        setUniversities(variant === 'sidebar' ? list.slice(0, 5) : list)
      } catch (error) {
        console.error('Error fetching featured universities:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUnis()
  }, [variant])

  if (loading) {
    if (variant === 'sidebar') {
      return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mt-8 animate-pulse">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-1.5 h-6 bg-gray-200 rounded-full"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-50 bg-gray-50 flex gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-xl shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }
    return (
      <div className="bg-white px-4 md:px-10 lg:px-24 py-16 flex justify-center">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
          <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        </div>
      </div>
    )
  }

  if (universities.length === 0) return null

  if (variant === 'sidebar') {
    return (
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mt-8 overflow-hidden">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">
            Featured Universities
          </h2>
        </div>

        <div className="space-y-4">
          {universities.map((uni) => {
            const logo = uni.logo_path || uni.logo
            const img = logo ? storageUrl(logo) : null
            return (
              <Link key={uni.id} href={`/university/${uni.uname}`} className="block group">
                <div className="p-4 rounded-xl border border-gray-50 bg-gray-50 group-hover:bg-white group-hover:border-blue-200 group-hover:shadow-lg group-hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex gap-4 items-center">
                    <div className="w-16 h-16 shrink-0 rounded-xl border border-white p-2.5 flex items-center justify-center bg-white shadow-xs group-hover:border-blue-50 transition-colors overflow-hidden relative">
                      {img ? (
                        <Image
                          src={img}
                          alt={uni.name}
                          fill
                          className="object-contain p-2.5"
                          loading="lazy"
                          sizes="64px"
                        />
                      ) : (
                        <GraduationCap className="text-gray-300 w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-800 text-sm mb-1.5 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                        {uni.name}
                      </h4>
                      <div className="flex items-center text-[11px] text-gray-500 font-medium mb-1.5">
                        <MapPin className="mr-1.5 text-red-400 shrink-0 w-2.5 h-2.5" />
                        <span className="truncate">{uni.city}</span>
                      </div>
                      <div className="flex items-center text-[10px] uppercase tracking-wider text-blue-600 font-bold bg-blue-50 w-fit px-2 py-0.5 rounded-md">
                        <span>Best Choice</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <Link
          href="/universities"
          className="flex items-center justify-center gap-2 mt-6 py-2.5 w-full text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-all border border-blue-50"
        >
          <span>Explore All Institutions</span>
          <ChevronRight className="w-2.5 h-2.5" />
        </Link>
      </div>
    )
  }

  return (
    <section className="bg-white px-4 md:px-10 lg:px-24">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Featured Universities
          </h2>
          <div className="w-20 h-1.5 bg-blue-600 mx-auto rounded-full mb-6" />
          <p className="text-gray-600 max-w-2xl mx-auto text-base">
            Explore world-class educational institutions in Malaysia with proven excellence in global rankings and student satisfaction.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {universities.map((uni) => {
            const logo = uni.logo_path || uni.logo
            const img = logo ? storageUrl(logo) : null
            return (
              <div
                key={uni.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 bg-white border border-gray-100 rounded-xl p-3 flex items-center justify-center mb-6 shadow-xs group-hover:border-blue-100 transition-colors relative overflow-hidden">
                  {img ? (
                    <Image
                      src={img}
                      alt={uni.name}
                      fill
                      className="object-contain p-3"
                      loading="lazy"
                      sizes="(max-width: 640px) 96px, 96px"
                    />
                  ) : (
                    <GraduationCap className="text-gray-300 w-12 h-12" />
                  )}
                </div>

                <div className="flex-1 mb-6">
                  <Link href={`/university/${uni.uname}`}>
                    <h3 className="font-bold text-gray-900 text-lg mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {uni.name}
                    </h3>
                  </Link>
                  {uni.city && (
                    <p className="inline-flex items-center text-sm font-medium text-gray-500">
                      <MapPin className="mr-2 text-red-500 w-3 h-3" />
                      {uni.city}
                    </p>
                  )}
                </div>

                <Link
                  href={`/university/${uni.uname}`}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2 group/btn"
                >
                  Explore Campus
                  <ArrowRight className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
