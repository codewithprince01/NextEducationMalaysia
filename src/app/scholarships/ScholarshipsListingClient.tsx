'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, ExternalLink, Award } from 'lucide-react'
import { NEXT_PUBLIC_IMAGE_BASE_URL } from '@/lib/constants'

interface Scholarship {
  id: number
  title: string
  slug: string
  shortnote?: string | null
  thumbnail_path: string | null
  // The Prisma model might not have page_type or landing_page_link, checking DB schema later if needed
  // For now, mapping to what's in Prisma
}

const ScholarshipCard = ({ scholarship, index }: { scholarship: any; index: number }) => {
  const imageUrl = scholarship.thumbnail_path
    ? scholarship.thumbnail_path.startsWith('http') 
        ? scholarship.thumbnail_path 
        : `${NEXT_PUBLIC_IMAGE_BASE_URL}${scholarship.thumbnail_path.startsWith('/') ? '' : '/'}${scholarship.thumbnail_path}`
    : 'https://via.placeholder.com/400x300'

  return (
    <Link href={`/scholarships/${scholarship.slug}`}>
      <div className="group cursor-pointer bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:border-blue-200 hover:-translate-y-3 transition-all duration-500 ease-out h-full animate-fade-in-up" 
           style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}>
        <div className="relative h-64 overflow-hidden">
          <img
            src={imageUrl}
            alt={scholarship.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300' }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent group-hover:from-black/40 transition-all duration-300"></div>
          <div className="absolute top-4 left-4">
            <span className="inline-flex items-center gap-1 bg-white/95 backdrop-blur-sm text-gray-800 font-medium text-xs px-3 py-1.5 rounded-full border border-white/50 shadow-md">
              <Award size={12} />
              Scholarship
            </span>
          </div>
        </div>
        <div className="p-6">
          <h3 className="text-gray-900 font-bold text-lg leading-tight group-hover:text-blue-600 transition-colors line-clamp-2 mb-4">
            {scholarship.title}
          </h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">
            {scholarship.shortnote || 'Explore scholarship opportunities and take the first step toward your academic future.'}
          </p>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold px-6 py-3 rounded-full shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 group/btn">
            <span>Explore More</span>
            <ArrowRight
              size={16}
              className="group-hover/btn:translate-x-1 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

export default function ScholarshipsListingClient({ scholarships }: { scholarships: any[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {scholarships.map((scholarship, index) => (
        <ScholarshipCard key={scholarship.id} scholarship={scholarship} index={index} />
      ))}
    </div>
  )
}
