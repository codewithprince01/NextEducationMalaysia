'use client'

import dynamic from 'next/dynamic'

// ssr:false isolates swiper's ~87KB from the shared chunk graph.
// This wrapper exists solely so we can use ssr:false (requires 'use client').
const HeroSwiper = dynamic(() => import('./HeroSwiper'), { ssr: false })

type Banner = {
  id?: number
  banner_path: string
  alt_text?: string | null
  title?: string | null
  description?: string | null
}

export default function HeroSwiperLoader({ banners }: { banners: Banner[] }) {
  if (banners.length <= 1) return null
  return <HeroSwiper banners={banners} />
}
