import Link from 'next/link'
import { MapPin, Clock, BookOpen, Eye, Star } from 'lucide-react'

const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? 'https://admin.educationmalaysia.in'

function imgUrl(path: string | null | undefined) {
  if (!path) return null
  const clean = String(path).replace(/^\/+/, '')
  return `${IMAGE_BASE}/storage/${clean}`
}

type University = {
  id: number
  name?: string | null
  uname?: string | null
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

export default function UniversityListCard({ uni, priority = false }: { uni: University; priority?: boolean }) {
  const slug = uni.uname
  const imageUrl = imgUrl(uni.banner_path) ?? imgUrl(uni.logo_path) ?? '/placeholder-university.jpg'
  const rating = uni.rating ? parseFloat(String(uni.rating)).toFixed(1) : '0.0'

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300">
      {/* Banner */}
      <div className="relative w-full h-48 overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={uni.name ?? 'University'}
          className="w-full h-full object-cover"
          loading={priority ? 'eager' : 'lazy'}
          width={400}
          height={192}
        />
        {/* Rating badge */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-md">
          <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-bold text-gray-800">{rating}</span>
        </div>
      </div>

      <div className="p-5">
        {/* Location + Established */}
        <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
          {uni.city && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{uni.city}</span>
            </div>
          )}
          {uni.established_year && (
            <div className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Est. {uni.established_year}</span>
            </div>
          )}
        </div>

        <Link
          href={`/university/${slug}`}
          className="font-bold text-gray-800 text-xl hover:text-blue-600 mb-3 line-clamp-2 min-h-14 block"
        >
          {uni.name}
        </Link>

        {uni.shortnote && (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-2 mb-4">{uni.shortnote}</p>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          <div className="text-center p-3 bg-blue-50 rounded-xl">
            <BookOpen className="w-5 h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-blue-600">{uni.active_programs_count ?? 0}</p>
            <p className="text-xs text-gray-600">Programs</p>
          </div>
          <div className="text-center p-3 bg-green-50 rounded-xl">
            <Eye className="w-5 h-5 text-green-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-green-600">{uni.click ?? 0}</p>
            <p className="text-xs text-gray-600">Views</p>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-xl">
            <Star className="w-5 h-5 text-yellow-600 mx-auto mb-1" />
            <p className="text-lg font-bold text-yellow-600">{rating}</p>
            <p className="text-xs text-gray-600">Rating</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <Link
            href={`/university/${slug}`}
            className="w-full py-3 px-4 bg-linear-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center"
          >
            View Details →
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/university/${slug}?action=fee`}
              className="py-2 px-3 border-2 border-blue-200 text-blue-600 rounded-xl font-medium hover:bg-blue-50 transition-all duration-200 text-sm text-center"
            >
              Fee Structure
            </Link>
            <Link
              href={`/university/${slug}?action=brochure`}
              className="py-2 px-3 border-2 border-green-200 text-green-600 rounded-xl font-medium hover:bg-green-50 transition-all duration-200 text-sm text-center"
            >
              Brochure
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
