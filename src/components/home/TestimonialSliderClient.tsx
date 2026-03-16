'use client'

import React, { useEffect, useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination } from 'swiper/modules'
import { MapPin, Quote, Star } from 'lucide-react'
import Image from 'next/image'

import 'swiper/css'
import 'swiper/css/autoplay'
import 'swiper/css/pagination'

interface Testimonial {
  id: number
  name: string
  review: string
  country: string | null
  program: string | null
  university: string | null
  image?: string
}

const PROFESSIONAL_PHOTOS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
]

export default function TestimonialSliderClient() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('/api/home')
        const json = await res.json()
        const items = json.data?.testimonials?.filter((t: any) => t.name && t.review) || []
        
        const withImages = items.map((t: any, i: number) => ({
          ...t,
          image: PROFESSIONAL_PHOTOS[i % PROFESSIONAL_PHOTOS.length]
        }))

        setTestimonials(withImages)
      } catch (err) {
        console.error('Error fetching testimonials:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTestimonials()
  }, [])

  if (loading) {
    return (
      <div className="max-w-[1400px] mx-auto px-4 py-20 flex gap-6 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 w-full md:w-[400px] h-[350px] bg-gray-100 rounded-[2.5rem] animate-pulse" />
        ))}
      </div>
    )
  }

  if (testimonials.length === 0) return null

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex flex-col items-center text-center mb-16 space-y-4">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full text-xs font-bold text-blue-600 uppercase tracking-widest">
              Success Stories
           </div>
           <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
             What Our <span className="text-blue-600">Students Say</span>
           </h2>
           <p className="text-slate-500 max-w-2xl text-lg">
             Hear from thousands of international students who started their global journey with our guidance.
           </p>
        </div>

        <Swiper
          modules={[Autoplay, Pagination]}
          spaceBetween={30}
          slidesPerView={1}
          centeredSlides={true}
          loop={true}
          autoplay={{
            delay: 4000,
            disableOnInteraction: false,
          }}
          pagination={{ clickable: true }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1200: { slidesPerView: 3 },
          }}
          className="testimonial-swiper !pb-16"
        >
          {testimonials.map((t, idx) => (
            <SwiperSlide key={idx} className="h-auto py-10">
               <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 h-full flex flex-col relative group hover:bg-white hover:border-blue-200 transition-all duration-500 shadow-xl shadow-blue-900/0 hover:shadow-blue-900/5">
                  <div className="absolute top-8 right-8">
                     <Quote className="w-12 h-12 text-blue-100 group-hover:text-blue-50 transition-colors" />
                  </div>

                  <div className="flex items-center gap-4 mb-8">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-md">
                       <Image 
                         src={t.image || ''} 
                         alt={t.name} 
                         fill 
                         className="object-cover"
                         unoptimized
                       />
                    </div>
                    <div>
                       <h4 className="font-black text-slate-900 text-lg uppercase tracking-tight">{t.name}</h4>
                       {t.country && (
                         <div className="flex items-center gap-1 text-slate-400 text-sm font-bold">
                            <MapPin className="w-3 h-3" />
                            {t.country}
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="flex gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>

                  <p className="text-lg text-slate-600 italic leading-relaxed mb-8 grow">
                    "{t.review}"
                  </p>

                  <div className="pt-6 border-t border-slate-200/60 mt-auto">
                     {t.program && (
                       <p className="text-xs font-black text-blue-600 uppercase tracking-widest truncate">{t.program}</p>
                     )}
                     {t.university && (
                       <p className="text-xs font-bold text-slate-400 truncate mt-1">{t.university}</p>
                     )}
                  </div>
               </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <style jsx global>{`
        .testimonial-swiper .swiper-pagination-bullet {
          width: 8px;
          height: 8px;
          background: #cbd5e1;
          opacity: 1;
          transition: all 0.3s ease;
        }
        .testimonial-swiper .swiper-pagination-bullet-active {
          width: 24px;
          background: #2563eb;
          border-radius: 4px;
        }
      `}</style>
    </section>
  )
}
