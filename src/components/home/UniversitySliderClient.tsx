'use client'

import { useRef, useState, useCallback } from 'react'
import Link from 'next/link'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { 
  ChevronLeft, ChevronRight, MapPin, BookOpen, 
  Eye, Star, ChevronDown, ChevronUp 
} from 'lucide-react'
import type { Swiper as SwiperType } from 'swiper'
import 'swiper/css'

const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://admin.educationmalaysia.in'

type University = {
  id: number
  name: string | null
  uname: string | null
  city?: string | null
  state?: string | null
  qs_rank?: number | null
  banner_path?: string | null
  logo_path?: string | null
  shortnote?: string | null
  active_programs_count?: number | null
  click?: number | null
  rating?: string | number | null
  institute_type?: { type?: string | null } | null
}

function imageSrc(path: string | null | undefined) {
  if (!path) return '/default-university.jpg'
  if (path.startsWith('http') || path.startsWith('/')) return path
  return `${IMAGE_BASE}/storage/${path}`
}

function UniversityCard({ uni }: { uni: University }) {
  const [expanded, setExpanded] = useState(false)
  const banner = imageSrc(uni.banner_path || uni.logo_path)
  const logo = imageSrc(uni.logo_path)
  const typeLabel = uni.institute_type?.type || 'University'
  const isPublic = typeLabel.toLowerCase().includes('public')
  
  const shortNote = uni.shortnote || "Explore this university's world-class facilities and academic programs in Malaysia."
  const shouldTruncate = shortNote.length > 100

  return (
    <div className="group bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col h-full mx-1">
      {/* University Image */}
      <div className="h-48 overflow-hidden relative bg-gray-100 shrink-0">
        <img
          src={banner}
          alt={uni.name || "University Banner"}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        {/* Type Badge */}
        <div className="absolute top-4 left-4">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${isPublic ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
            <span className="mr-1">{isPublic ? '🏛️' : '🏢'}</span>
            {typeLabel}
          </span>
        </div>

        {/* Ranking Badge */}
        {uni.qs_rank && (
          <div className="absolute top-4 right-4">
            <div className="bg-linear-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              #{uni.qs_rank}
            </div>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex flex-col grow">
        <Link href={`/university/${uni.uname}`}>
          <h3 className="font-bold text-blue-900 text-sm mb-1.5 line-clamp-2 hover:text-blue-700 transition-colors leading-tight">
            {uni.name}
          </h3>
        </Link>

        <div className="flex items-center text-gray-600 mb-1.5">
          <MapPin className="w-4 h-4 mr-2 text-blue-500" />
          <span className="text-sm font-medium">
            {[uni.city, uni.state].filter(Boolean).join(', ') || "Malaysia"}
          </span>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className={`text-gray-600 text-sm leading-relaxed ${!expanded && shouldTruncate ? "line-clamp-2" : ""}`}>
            {shortNote}
          </p>
          {shouldTruncate && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1 flex items-center gap-1 transition-colors"
            >
              {expanded ? (
                <>Show Less <ChevronUp className="w-4 h-4" /></>
              ) : (
                <>Show More <ChevronDown className="w-4 h-4" /></>
              )}
            </button>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4 mt-auto">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-blue-600">
              {uni.active_programs_count || 0}
            </div>
            <div className="text-xs text-gray-600">Programs</div>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <Eye className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <div className="text-lg font-bold text-green-600">
              {uni.click || 0}
            </div>
            <div className="text-xs text-gray-600">Views</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-xl">
            <Star className="w-5 h-5 text-yellow-600 mx-auto mb-1 fill-current" />
            <div className="text-lg font-bold text-yellow-600">
              {uni.rating ? Number(uni.rating).toFixed(1) : "0.0"}
            </div>
            <div className="text-xs text-gray-600">Rating</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 mt-4">
          <Link href={`/university/${uni.uname}`} className="block">
            <button className="cursor-pointer w-full py-3 px-4 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center group">
              <span>View Details</span>
              <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link href={`/university/${uni.uname}#forms`} className="flex-1">
              <button className="cursor-pointer w-full py-2 px-3 border-2 border-blue-200 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-all duration-200 text-sm">
                Fee Structure
              </button>
            </Link>
            <Link href={`/university/${uni.uname}#forms`} className="flex-1">
              <button className="cursor-pointer w-full py-2 px-3 border-2 border-green-200 text-green-600 rounded-xl font-medium hover:bg-green-50 transition-all duration-200 text-sm">
                Brochure
              </button>
            </Link>
          </div>

          <Link href="/universities" className="block">
            <button className="cursor-pointer w-full py-2 px-4 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all duration-200 text-sm">
              Compare Universities
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function UniversitySliderClient({ universities }: { universities: University[] }) {
  const swiperRef = useRef<SwiperType | null>(null)

  return (
    <div className="relative px-2 sm:px-6 py-4 bg-linear-to-b from-blue-50 to-white">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-black mt-6 mb-8 text-shadow-sm">
          🎓 Top Trending Universities <span className="text-blue-600">in Malaysia</span>
        </h2>

        <div className="relative group/slider px-0 sm:px-10">
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-blue-100 shadow-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 text-blue-600 transition-all duration-300 group/arrow"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 transition-transform duration-200 group-hover/arrow:-translate-x-0.5" />
          </button>
          <button
            onClick={() => swiperRef.current?.slideNext()}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white border-2 border-blue-100 shadow-lg hover:bg-blue-600 hover:text-white hover:border-blue-600 text-blue-600 transition-all duration-300 group/arrow"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 transition-transform duration-200 group-hover/arrow:translate-x-0.5" />
          </button>

          <Swiper
            modules={[Autoplay]}
            spaceBetween={16}
            slidesPerView={1}
            loop={universities.length > 3}
            onSwiper={(swiper) => { swiperRef.current = swiper }}
            autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 20 },
            }}
            className="pb-6"
          >
            {universities.map((uni, idx) => (
              <SwiperSlide key={uni.id || idx} className="h-auto pb-4">
                <UniversityCard uni={uni} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="text-center mt-6">
          <Link
            href="/universities/universities-in-malaysia"
            className="cursor-pointer inline-flex items-center border-2 border-blue-800 text-blue-800 font-semibold px-8 py-3 rounded-full transition hover:bg-blue-800 hover:text-white shadow-md hover:shadow-lg"
          >
            EXPLORE ALL MALAYSIAN UNIVERSITIES
          </Link>
        </div>
      </div>
    </div>
  )
}
