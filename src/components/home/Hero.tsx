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
  banner_path: '/default-banner.jpg',
  alt_text: 'Education Malaysia',
}

export default async function Hero() {
  const banners = await getHeroBanners() as unknown as Banner[]
  const allBanners: Banner[] = banners.length > 0 ? banners : [DEFAULT_BANNER]
  const first = allBanners[0]
  const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? 'https://admin.educationmalaysia.in'
  const bannerPath = first.banner_path ?? '/default-banner.jpg'
  const firstSrc = bannerPath.startsWith('/') || bannerPath.startsWith('http')
    ? bannerPath
    : `${IMAGE_BASE}/storage/${bannerPath}`

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: '100dvh', minHeight: 480 }}
    >
      {/* SSR first image for instant LCP — no JS needed */}
      <div className="absolute inset-0 z-0">
        <Image
          src={firstSrc}
          alt={first.alt_text ?? 'Education Malaysia'}
          fill
          className="object-cover"
          priority
          fetchPriority="high"
          sizes="100vw"
        />
      </div>

      {/* Client-side Swiper overlays after hydration */}
      <HeroSwiper banners={allBanners} />

      {/* Dark gradient overlay */}
      <div className="absolute inset-0 bg-linear-to-r from-black/80 to-blue-900/60 z-10 pointer-events-none" />

      {/* Text content — fully server-rendered for best LCP */}
      <div className="relative z-20 flex items-center h-full px-6 md:px-20 pointer-events-none">
        <div className="text-white max-w-3xl hero-text-container hero-stagger">
          <p className="text-sm md:text-base text-blue-400 tracking-widest font-semibold uppercase mb-3 md:mb-4">
            Study in Malaysia
          </p>
          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-4 md:mb-6">
            <span className="block">{first.title ?? DEFAULT_BANNER.title}</span>
          </h1>
          <p className="text-base md:text-lg text-gray-100 max-w-2xl mb-8 md:mb-10 leading-relaxed">
            {first.description ?? DEFAULT_BANNER.description}
          </p>
          <div className="flex flex-wrap gap-4 pointer-events-auto">
            <Link href="/who-we-are">
              <button className="cursor-pointer bg-[#003893] hover:bg-[#002966] text-white font-bold px-8 py-3.5 rounded-full transition-all duration-300 shadow-lg hover:scale-105 active:scale-95">
                ABOUT US
              </button>
            </Link>
            <Link href="/courses-in-malaysia">
              <button className="cursor-pointer bg-transparent border-2 border-white hover:bg-white/10 text-white font-bold px-8 py-3 rounded-full transition-all duration-300 backdrop-blur-sm hover:scale-105 active:scale-95">
                EXPLORE COURSES
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
