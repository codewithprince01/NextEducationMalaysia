'use client'

import Image from 'next/image'
import { useRef, useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, EffectFade } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Swiper as SwiperType } from 'swiper'
import { IMAGE_DELIVERY_BASE_URL } from '@/lib/constants'

type Banner = {
  id?: number
  banner_path: string
  alt_text?: string | null
  title?: string | null
  description?: string | null
}

type Props = { banners: Banner[] }

export default function HeroSwiper({ banners }: Props) {
  const swiperRef = useRef<SwiperType | null>(null)
  const [isDesktop, setIsDesktop] = useState(false)
  const showArrows = isDesktop && banners.length > 1

  useEffect(() => {
    // Defer Swiper CSS loading off the critical path
     
    // @ts-expect-error: CSS module import is resolved by bundler at runtime.
    import('swiper/css')
    // @ts-expect-error: CSS module import is resolved by bundler at runtime.
    import('swiper/css/pagination')
    // @ts-expect-error: CSS module import is resolved by bundler at runtime.
    import('swiper/css/effect-fade')

    const mediaQuery = window.matchMedia("(min-width: 768px)")
    const handleChange = (e: MediaQueryListEvent) => setIsDesktop(e.matches)

    setIsDesktop(mediaQuery.matches)
    mediaQuery.addEventListener("change", handleChange)
    return () => mediaQuery.removeEventListener("change", handleChange)
  }, [])

  const src = (path: string) =>
    path.startsWith('/') || path.startsWith('http') ? path : `${IMAGE_DELIVERY_BASE_URL}/storage/${path}`

  return (
    <>
      {/* Swiper background */}
      <div className="absolute inset-0 z-0">
        <Swiper
          modules={[Pagination, EffectFade, Autoplay]}
          effect="fade"
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={banners.length > 1}
          onSwiper={(swiper) => { swiperRef.current = swiper }}
          className="w-full h-full hero-swiper"
        >
          {banners.map((banner, i) => (
            <SwiperSlide key={banner.id || i}>
              <Image
                src={src(banner.banner_path)}
                alt={banner.alt_text || `Banner ${i + 1}`}
                fill
                className="object-cover"
                priority={i === 0}
                fetchPriority={i === 0 ? 'high' : 'auto'}
                loading={i === 0 ? 'eager' : 'lazy'}
                sizes="100vw"
                quality={60}
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.style.display = "none"
                  target.parentElement!.style.background = "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                }}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Navigation arrows */}
      {showArrows && (
        <>
          <button
            onClick={() => swiperRef.current?.slidePrev()}
            aria-label="Previous slide"
            className="absolute left-5 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm border-2 border-white/30 text-white shadow-xl hover:bg-white hover:text-blue-700 hover:border-white hover:scale-110 transition-all duration-300 group"
          >
            <ChevronLeft className="w-6 h-6 transition-transform duration-200 group-hover:-translate-x-0.5" />
          </button>
          <button
            onClick={() => swiperRef.current?.slideNext()}
            aria-label="Next slide"
            className="absolute right-5 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-12 h-12 rounded-full bg-white/15 backdrop-blur-sm border-2 border-white/30 text-white shadow-xl hover:bg-white hover:text-blue-700 hover:border-white hover:scale-110 transition-all duration-300 group"
          >
            <ChevronRight className="w-6 h-6 transition-transform duration-200 group-hover:translate-x-0.5" />
          </button>
        </>
      )}
    </>
  )
}
