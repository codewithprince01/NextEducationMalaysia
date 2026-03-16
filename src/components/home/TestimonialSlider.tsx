'use client'

import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import { MapPin } from 'lucide-react'
import 'swiper/css'

const PHOTOS = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
]

export type Testimonial = {
  id: number
  name: string | null
  review: string | null
  country?: string | null
  program?: string | null
  university?: string | null
}

export default function TestimonialSlider({ testimonials }: { testimonials: Testimonial[] }) {
  if (testimonials.length === 0) return null

  // Duplicate to fill the carousel (min 9 items for seamless loop)
  let items = testimonials.map((t, i) => ({ ...t, image: PHOTOS[i % PHOTOS.length] }))
  while (items.length < 9) items = [...items, ...items]
  items = items.slice(0, 20)

  return (
    <section className="bg-linear-to-b from-white to-blue-50 px-4 sm:px-8 lg:px-20 py-8">
      <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-slate-900 mb-8 leading-tight">
        What Our{' '}
        <span className="text-transparent bg-clip-text bg-linear-to-r from-[#003893] to-[#1b61ca]">Students Say</span>
      </h2>

      <Swiper
        slidesPerView={1.1}
        loop
        speed={800}
        autoplay={{ delay: 2000, disableOnInteraction: false, pauseOnMouseEnter: true }}
        centeredSlides
        spaceBetween={30}
        breakpoints={{
          0: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 30 },
          1024: { slidesPerView: 3, spaceBetween: 40 },
        }}
        modules={[Autoplay]}
        className="pb-12 pt-8 px-6"
      >
        {items.map((t, index) => (
          <SwiperSlide key={`testimonial-${index}`} className="h-full py-4 transition-all duration-500">
            {({ isActive }) => (
              <div
                className={`flex flex-col rounded-2xl overflow-hidden transition-all duration-500 border w-full bg-white ${isActive ? 'scale-105 shadow-xl border-white ring-4 ring-blue-50 z-20 opacity-100 grayscale-0' : 'scale-90 shadow-none border-slate-100 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-100 z-10'}`}
                style={{ height: '300px' }}
              >
                <div className={`p-4 flex items-center gap-3 transition-colors duration-500 ${isActive ? 'bg-linear-to-r from-[#003893] to-[#1b61ca]' : 'bg-slate-100'}`}>
                  <img
                    src={t.image}
                    alt={t.name || 'Student'}
                    width={48} height={48}
                    loading="lazy"
                    className={`w-12 h-12 rounded-full object-cover border-2 shadow-sm ${isActive ? 'border-white' : 'border-slate-300'}`}
                  />
                  <div>
                    <h3 className={`text-sm font-bold uppercase tracking-wide leading-tight ${isActive ? 'text-white' : 'text-slate-600'}`}>{t.name}</h3>
                    {t.country && (
                      <div className={`flex items-center gap-1.5 text-xs font-medium mt-1 ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                        <MapPin className={`w-3.5 h-3.5 ${isActive ? 'text-blue-200' : 'text-slate-400'}`} />
                        {t.country}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-5 pt-4 flex-1 flex flex-col bg-white justify-between">
                  <div>
                    <div className="flex gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-3.5 h-3.5 ${isActive ? 'text-yellow-400' : 'text-slate-300'} fill-current`} viewBox="0 0 20 20">
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                    <p className={`text-[15px] leading-snug italic line-clamp-4 ${isActive ? 'text-slate-700' : 'text-slate-500'}`}>
                      &ldquo;{t.review}&rdquo;
                    </p>
                  </div>
                  <div className={`mt-3 pt-2 border-t ${isActive ? 'border-slate-50' : 'border-slate-100'}`}>
                    <div className="flex flex-col gap-0.5">
                      {t.program && <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-[#003893]' : 'text-slate-400'}`}>{t.program}</span>}
                      {t.university && <span className="text-[10px] text-slate-400 truncate">{t.university}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  )
}
