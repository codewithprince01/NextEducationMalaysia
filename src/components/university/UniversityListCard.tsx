'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MapPin, Clock, BookOpen, Eye, Star, ChevronDown } from 'lucide-react'
import { storageUrl } from '@/lib/constants'

function imgUrl(path: string | null | undefined) {
  return storageUrl(path)
}

type University = {
  id: number
  name?: string | null
  uname?: string | null
  slug?: string | null
  banner_path?: string | null
  logo_path?: string | null
  city?: string | null
  state?: string | null
  established_year?: string | null
  rating?: string | null
  qs_rank?: string | number | null
  shortnote?: string | null
  active_programs_count?: number | null
  click?: number | null
}

type Props = {
  uni: University
  priority?: boolean
  onOpenFeeModal?: (uni: University) => void
  onOpenBrochureModal?: (uni: University) => void
  onOpenCompareModal?: () => void
}

export default function UniversityListCard({ uni, priority = false, onOpenFeeModal, onOpenBrochureModal, onOpenCompareModal }: Props) {
  const [isExpanded, setIsExpanded] = useState(false)
  const slug = uni.uname || uni.slug
  const imageUrl = imgUrl(uni.banner_path) ?? imgUrl(uni.logo_path) ?? '/placeholder-university.jpg'
  const rating = uni.rating ? parseFloat(String(uni.rating)).toFixed(1) : '0.0'

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 relative group border border-gray-100">
      {/* Banner */}
      <div className="relative w-full h-48 overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={uni.name ?? 'University'}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading={priority ? 'eager' : 'lazy'}
          width={400}
          height={192}
        />
        {/* Rating badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md z-10">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-bold text-gray-800">{rating}</span>
        </div>
      </div>

      <div className="p-5">
        {/* Location + Established */}
        <div className="flex items-center gap-3 mb-3 text-[11px] font-medium text-gray-500 uppercase tracking-wider">
          <div className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-500" />
            <span>{uni.city || 'Kuala Lumpur'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-500" />
            <span>Est. {uni.established_year || 'N/A'}</span>
          </div>
        </div>

        <Link
          href={`/university/${slug}`}
          className="font-bold text-gray-800 text-xl group-hover:text-blue-600 mb-2.5 transition-colors line-clamp-2 min-h-14 block"
        >
          {uni.name}
        </Link>

        {/* Shortnote with Show More/Less */}
        <div className="mb-4">
          <p className={`text-gray-600 text-sm leading-relaxed transition-all duration-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
            {uni.shortnote || "No description available"}
          </p>
          {uni.shortnote && uni.shortnote.length > 100 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 text-xs font-bold hover:underline mt-1.5 flex items-center gap-0.5 cursor-pointer uppercase tracking-tight"
            >
              {isExpanded ? (
                <>Show Less <ChevronDown className="w-3.5 h-3.5 rotate-180" /></>
              ) : (
                <>Show More <ChevronDown className="w-3.5 h-3.5" /></>
              )}
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center p-2.5 bg-blue-50/50 rounded-xl border border-blue-100/50">
            <BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{uni.active_programs_count ?? 0}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Programs</p>
          </div>
          <div className="text-center p-2.5 bg-green-50/50 rounded-xl border border-green-100/50">
            <Eye className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">{uni.click ?? 0}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Views</p>
          </div>
          <div className="text-center p-2.5 bg-yellow-50/50 rounded-xl border border-yellow-100/50">
            <Star className="w-5 h-5 text-yellow-600 mx-auto mb-1 fill-yellow-600" />
            <p className="text-lg font-bold text-yellow-600">{rating}</p>
            <p className="text-[10px] font-bold text-gray-500 uppercase">Rating</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Link
            href={`/university/${slug}`}
            className="w-full py-3 px-4 bg-linear-to-r from-blue-600 via-blue-600 to-blue-700 text-white rounded-xl font-bold text-sm shadow-[0_4px_12px_rgba(37,99,235,0.2)] hover:shadow-[0_8px_20px_rgba(37,99,235,0.3)] transition-all duration-300 flex items-center justify-center transform hover:scale-[1.02] active:scale-95"
          >
            View Details →
          </Link>
          <div className="grid grid-cols-2 gap-2">
            {onOpenFeeModal ? (
              <button
                type="button"
                onClick={() => onOpenFeeModal(uni)}
                className="py-2.5 px-3 border-2 border-blue-200 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-50 transition-all duration-200 text-center uppercase tracking-wide cursor-pointer"
              >
                Fee Structure
              </button>
            ) : (
              <Link
                href={`/university/${slug}?action=fee`}
                className="py-2.5 px-3 border-2 border-blue-200 text-blue-600 rounded-xl font-bold text-xs hover:bg-blue-50 transition-all duration-200 text-center uppercase tracking-wide"
              >
                Fee Structure
              </Link>
            )}
            {onOpenBrochureModal ? (
              <button
                type="button"
                onClick={() => onOpenBrochureModal(uni)}
                className="py-2.5 px-3 border-2 border-green-200 text-green-600 rounded-xl font-bold text-xs hover:bg-green-50 transition-all duration-200 text-center uppercase tracking-wide cursor-pointer"
              >
                Brochure
              </button>
            ) : (
              <Link
                href={`/university/${slug}?action=brochure`}
                className="py-2.5 px-3 border-2 border-green-200 text-green-600 rounded-xl font-bold text-xs hover:bg-green-50 transition-all duration-200 text-center uppercase tracking-wide"
              >
                Brochure
              </Link>
            )}
          </div>
          <button
            type="button"
            onClick={onOpenCompareModal}
            className="cursor-pointer w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 text-sm"
          >
            Compare Universities
          </button>
        </div>
      </div>
    </div>
  )
}
