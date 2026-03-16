'use client'

import { useState, useEffect } from 'react'
import { Maximize2, X, ImageIcon } from 'lucide-react'

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

  useEffect(() => {
    if (initialPhotos.length > 0) return

    setLoading(true)
    fetch(`/api/university/${slug}/gallery`)
      .then(r => r.json())
      .then((data: Photo[]) => {
        setPhotos(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [slug, initialPhotos])

  const getFullUrl = (path: string | null) => {
    if (!path) return ''
    if (path.startsWith('http')) return path
    return `${IMAGE_BASE}/storage/${path.replace(/^\/+/, '')}`
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="animate-pulse bg-gray-200 rounded-xl h-48" />
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Campus Gallery</h2>
        <span className="text-sm text-gray-500">{photos.length} Photos</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {photos.map((photo, i) => (
          <div
            key={photo.id}
            className="group relative aspect-video cursor-pointer overflow-hidden rounded-xl border border-gray-100 shadow-sm transition-all hover:shadow-md"
            onClick={() => setSelectedImg(getFullUrl(photo.photo_path))}
          >
            <img
              src={getFullUrl(photo.photo_path)}
              alt={`Campus view ${i + 1}`}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="rounded-full bg-white/90 p-2 text-gray-900 shadow-lg">
                <Maximize2 className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 backdrop-blur-sm animate-in fade-in duration-300">
          <button
            onClick={() => setSelectedImg(null)}
            className="absolute top-6 right-6 z-[110] rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 hover:text-red-400 cursor-pointer"
          >
            <X className="h-8 w-8" />
          </button>

          <img
            src={selectedImg}
            alt="Campus preview"
            className="max-h-[90vh] max-w-full rounded-lg object-contain shadow-2xl animate-in zoom-in-95 duration-300"
          />
        </div>
      )}
    </div>
  )
}
