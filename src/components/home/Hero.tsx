import Image from 'next/image'
import Link from 'next/link'
import { getHeroBanners } from '@/lib/queries/home'
import HeroSwiper from './HeroSwiper'

type Banner = {
  id: number
  title: string | null
  description: string | null
  banner_path: string
  alt_text: string | null
}

const DEFAULT_BANNER: Banner = {
  id: 0,
  title: 'Explore Top Universities',
  description:
    'Begin your study journey in Malaysia with expert guidance for admissions, course selection, and fast-track visa processing.',
  banner_path: '/girl-banner.webp',
  alt_text: 'Education Malaysia',
}

function src(bannerPath: string) {
  const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? 'https://admin.educationmalaysia.in'
  return bannerPath.startsWith('/') || bannerPath.startsWith('http')
    ? bannerPath
    : `${IMAGE_BASE}/storage/${bannerPath}`
}

export default async function Hero() {
  const banners = await getHeroBanners() as unknown as Banner[]
  const firstBanner = banners[0] || DEFAULT_BANNER

  return (
    <section className="relative w-full overflow-hidden" style={{ height: '100dvh', minHeight: 480 }}>
      {/* First banner image for LCP optimization */}
      <div className="absolute inset-0 z-0">
        <Image
          src={src(firstBanner.banner_path)}
          alt={firstBanner.alt_text || 'Hero banner'}
          fill
          className="object-cover"
          priority
          fetchPriority="high"
          sizes="100vw"
          placeholder="blur"
          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwA/wA=="
        />
      </div>

      {/* Overlay - EXACT match to OLD */}
      <div className="absolute inset-0 bg-linear-to-r from-black/80 to-blue-900/60 z-10 pointer-events-none" />

      {/* Server-rendered hero text - EXACT match to OLD */}
      <div className="relative z-20 flex items-center h-full px-6 md:px-20 pointer-events-none">
        <div className="text-white max-w-3xl">
          <p className="text-sm md:text-base text-blue-400 tracking-widest font-semibold uppercase mb-3 md:mb-4">
            Study in Malaysia
          </p>

          <h1 className="text-4xl md:text-6xl lg:text-6xl font-bold leading-tight mb-4 md:mb-6">
            <span className="block">{firstBanner.title}</span>
          </h1>

          <p className="text-base md:text-lg text-gray-100 max-w-2xl mb-8 md:mb-10 leading-relaxed">
            {firstBanner.description}
          </p>

          <div className="flex flex-wrap gap-4 pointer-events-auto">
            <Link href="/who-we-are">
              <button className="cursor-pointer bg-[#003893] hover:bg-[#002966] text-white font-bold px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 hover:scale-105 active:scale-95 flex items-center gap-2">
                ABOUT US
              </button>
            </Link>

            <Link href="/courses-in-malaysias">
              <button className="cursor-pointer bg-transparent border-2 border-white hover:bg-white/10 text-white font-bold px-8 py-3 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-105 active:scale-95 flex items-center gap-2">
                EXPLORE COURSES
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Interactive Swiper for additional banners */}
      {banners.length > 1 && (
        <HeroSwiper banners={banners} />
      )}
    </section>
  )
}
