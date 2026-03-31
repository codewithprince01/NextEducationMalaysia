'use client'

import { useState, useEffect, useCallback } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

type PhotoLike = {
  id?: number | string
  photo_path?: string
  photo_name?: string | null
} | string

type Props = {
  open: boolean
  onClose: () => void
  universityName?: string
  photos: PhotoLike[]
  getImageUrl: (path: string) => string
}

export default function GalleryModal({
  open,
  onClose,
  universityName,
  photos,
  getImageUrl,
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (open) {
      setActiveIndex(0)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (!open || !photos?.length) return
    if (e.key === 'ArrowRight') setActiveIndex((i) => (i + 1) % photos.length)
    if (e.key === 'ArrowLeft') setActiveIndex((i) => (i - 1 + photos.length) % photos.length)
    if (e.key === 'Escape') onClose()
  }, [open, photos?.length, onClose])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!open) return null

  const pics = photos?.length > 0 ? photos : []
  const current = pics[activeIndex]
  const activePath = typeof current === 'string' ? current : (current?.photo_path || '')
  const activeUrl = activePath ? getImageUrl(activePath) : ''

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-2" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50" />

      <div
        className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{universityName || 'University'}</h3>
            <p className="text-sm text-gray-400 mt-0.5">
              Photo Gallery · {pics.length > 0 ? activeIndex + 1 : 0} / {pics.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition"
          >
            <X size={16} />
          </button>
        </div>

        <div className="relative bg-gray-50 flex items-center justify-center h-[380px]">
          {pics.length === 0 ? (
            <p className="text-gray-400 text-sm">No photos available.</p>
          ) : (
            <>
              <img
                key={activeUrl}
                src={activeUrl}
                alt={`${universityName || 'University'} photo ${activeIndex + 1}`}
                className="max-w-full max-h-full object-contain px-2"
                style={{ maxHeight: '380px' }}
              />

              {pics.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveIndex((i) => (i - 1 + pics.length) % pics.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md hover:shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-600 transition"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setActiveIndex((i) => (i + 1) % pics.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-md hover:shadow-lg flex items-center justify-center text-gray-600 hover:text-blue-600 transition"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {pics.length > 1 && (
          <div className="px-4 py-3 border-t border-gray-100">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {pics.map((photo, i) => {
                const path = typeof photo === 'string' ? photo : (photo?.photo_path || '')
                const url = getImageUrl(path)
                const key = typeof photo === 'string' ? `${photo}-${i}` : (photo.id || i)
                return (
                  <button
                    key={key}
                    onClick={() => setActiveIndex(i)}
                    className={`shrink-0 rounded-lg overflow-hidden border-2 transition-all ${
                      i === activeIndex ? 'border-blue-500' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                    style={{ width: 72, height: 50 }}
                  >
                    <img
                      src={url}
                      alt={`Thumb ${i + 1}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

