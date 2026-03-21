'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, ImageIcon } from 'lucide-react'

const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? 'https://admin.educationmalaysia.in'

type Photo = {
  id: number
  photo_path: string | null
}

type Props = {
  slug: string
  initialPhotos?: Photo[]
}

export default function UniversityGalleryClient({ slug, initialPhotos = [] }: Props) {
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [loading, setLoading] = useState(initialPhotos.length === 0)
  const [selectedImg, setSelectedImg] = useState<string | null>(null)
  const fetchedForSlug = useRef<string | null>(null)

  useEffect(() => {
    if (initialPhotos.length > 0) {
      fetchedForSlug.current = slug
      return
    }
    if (fetchedForSlug.current === slug) return

    setLoading(true)
    fetchedForSlug.current = slug
    fetch(`/api/university/${slug}/gallery`)
      .then(r => r.json())
      .then((json: any) => {
        const data: Photo[] = Array.isArray(json) ? json : (json?.data || json?.universityPhotos || [])
        setPhotos(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(() => {
        fetchedForSlug.current = null
        setLoading(false)
      })
  }, [slug, initialPhotos.length])

  const getFullUrl = (path: string | null) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `${IMAGE_BASE}/storage/${path.replace(/^\/+/, '')}`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-lg h-48" />
        ))}
      </div>
    )
  }

  if (photos.length === 0) {
    return (
      <div className="bg-white rounded-xl p-12 text-center text-gray-400">
        <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
        <p>No gallery images available for this university.</p>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl! font-bold! text-gray-800">Gallery</h2>
        <span className="text-sm text-gray-500">{photos.length} Photos</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className="group relative cursor-pointer"
            onClick={() => setSelectedImg(getFullUrl(photo.photo_path))}
          >
            <img
              src={getFullUrl(photo.photo_path)}
              alt={`Campus ${i + 1}`}
              className="rounded-lg shadow-md object-cover w-full h-48 transition-transform duration-200"
              loading="lazy"
            />
            {/* Zoom Icon on Hover */}
            <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
              <Search className="text-white text-2xl" size={28} />
            </div>
          </div>
        ))}
      </div>

      {/* Modal (Full screen view) */}
      {selectedImg && (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[100] animate-in fade-in duration-200">
          <button
            onClick={() => setSelectedImg(null)}
            className="absolute top-6 right-6 text-white text-4xl hover:text-red-500 transition-colors z-[110] cursor-pointer"
            aria-label="Close image preview"
          >
            <X size={40} />
          </button>

          <img
            src={selectedImg}
            alt="Zoomed campus"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
          />
        </div>
      )}
    </div>
  )
}
