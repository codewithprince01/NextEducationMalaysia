'use client'

import { useState, useCallback, useMemo } from 'react'
import {
  MapPin, Navigation, Star, Building, BedDouble,
  Users, Phone, Mail, Printer, Image as ImageIcon,
  Check
} from 'lucide-react'
import UniversityInfoCards from './UniversityInfoCards'
import UniversityActionButtons from './UniversityActionButtons'
import UniversityRankings from './UniversityRankings'
import Breadcrumb from '@/components/Breadcrumb'

const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? 'https://admin.educationmalaysia.in'

function imgUrl(path: string | null | undefined) {
  if (!path) return null
  const clean = String(path).replace(/^\/+/, '')
  return `${IMAGE_BASE}/storage/${clean}`
}

type Photo = { id?: number; photo_path: string; photo_name?: string | null; title?: string | null }

type UniversityData = {
  id: number
  name: string | null
  uname?: string | null
  city?: string | null
  state?: string | null
  banner_path?: string | null
  logo_path?: string | null
  qs_rank?: number | string | null
  times_rank?: number | string | null
  qs_asia_rank?: number | string | null
  rating?: number | null
  local_students?: string | null
  international_students?: string | null
  institute_type?: { type?: string | null } | null
  inst_type?: string | null
  offeredCourses?: string[]
  accredited_by?: string | string[]
  hostel_facility?: string | string[]
  google_map_link?: string | null
  Scholarship?: boolean
  clicks?: number
}

const STUDY_OPTIONS = [
  { label: 'Study Online', bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', icon: 'text-green-500' },
  { label: 'Part Time', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', icon: 'text-blue-500' },
  { label: 'Full Time', bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', icon: 'text-purple-500' },
]

export default function UniversityHeroClient({ university, photos }: { university: any; photos: Photo[] }) {
  const [showGallery, setShowGallery] = useState(false)

  // ── Data Prep ──────────────────────────────────────────────────────────────
  const { mainPhoto, otherPhotos } = useMemo(() => {
    const seen = new Set<string>()
    const unique: Photo[] = []
    for (const p of photos) {
      if (p.photo_path && !seen.has(p.photo_path)) {
        seen.add(p.photo_path)
        unique.push(p)
      }
    }
    const main = unique.find(p => p.title?.toLowerCase() === 'main') || unique[0]
    const others = unique.filter(p => p.photo_path !== main?.photo_path).slice(0, 4)
    return { mainPhoto: main, otherPhotos: others }
  }, [photos])

  const bannerSrc = imgUrl(university.banner_path) || imgUrl(mainPhoto?.photo_path)
  const logoSrc = imgUrl(university.logo_path)
  const typeLabel = university.inst_type || university.institute_type?.type || 'University'
  const stars = Math.round(Number(university.rating) || 4)

  const handleDirections = useCallback(() => {
    if (university.google_map_link) {
      window.open(university.google_map_link, '_blank', 'noopener,noreferrer')
    } else if (university.name) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(university.name + ' Malaysia')}`, '_blank', 'noopener,noreferrer')
    }
  }, [university])

  return (
    <div className="bg-white">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Universities', href: '/universities' }, { label: university.name || 'University' }]} />

      {/* ── DESKTOP HERO ── */}
      <div className="hidden sm:block max-w-[1400px] mx-auto px-2 md:px-4 py-4">
        {/* Logo + Info Row */}
        <div className="flex flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 shrink-0 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center p-1 bg-white">
              <img src={logoSrc || '/placeholder-logo.png'} alt="Logo" className="w-full h-full object-contain" fetchPriority="high" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">{university.name}</h1>
              <div className="flex flex-row items-center gap-2 text-sm text-gray-600 flex-wrap">
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin className="text-blue-500 shrink-0 w-4 h-4" />
                  <span className="text-blue-600 font-medium truncate">Location: {university.city}</span>
                </div>
                <button
                  onClick={handleDirections}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200/50 transform hover:-translate-y-0.5 active:translate-y-0 text-sm cursor-pointer"
                >
                  <Navigation size={14} />
                  Get Directions
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4 text-sm">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm">Type:</span>
                <span className="bg-blue-700 text-white px-2.5 py-1 rounded-full font-medium text-sm">{typeLabel}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-bold text-xs uppercase tracking-widest">SETARA</span>
                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full font-medium gap-2 text-sm">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />
                <span>Featured</span>
              </div>
              <div className="text-gray-500 text-[10px] font-bold uppercase tracking-tighter">
                Approved By: <span className="text-gray-900 font-black">MQA</span>
              </div>
            </div>
          </div>
        </div>

        {/* 49% / 2x2 Photo Grid */}
        <div className="flex gap-2.5 mb-5 h-[360px]">
          <div className="relative group rounded-xl overflow-hidden shadow-sm flex-none w-[49%]">
            <img src={bannerSrc || '/placeholder-university.jpg'} alt="Banner" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" fetchPriority="high" />
            <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />
            <button
              onClick={() => setShowGallery(true)}
              className="absolute bottom-4 left-4 z-10 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-all shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <ImageIcon size={16} />
              View All Photos
            </button>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-2.5">
            {otherPhotos.length > 0 ? (
              otherPhotos.map((p, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden shadow-sm bg-gray-100 cursor-pointer">
                  <img src={imgUrl(p.photo_path) || ''} alt="Photo" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))
            ) : (
              [...Array(4)].map((_, i) => <div key={i} className="animate-pulse bg-gray-200 rounded-xl" />)
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 -mt-12 relative z-20">
          <div className="col-span-2 space-y-4">
            <UniversityInfoCards universityData={university} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Building className="text-blue-600" size={18} />
                  <h3 className="font-semibold text-gray-900 text-sm">Accredited By</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-gray-700">
                  <li className="flex items-start gap-2"><Check className="text-blue-600 mt-0.5" size={14} /><span>MQA (Malaysian Qualifications Agency)</span></li>
                  <li className="flex items-start gap-2"><Check className="text-blue-600 mt-0.5" size={14} /><span>Ministry of Higher Education Malaysia</span></li>
                </ul>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <BedDouble className="text-green-600" size={18} />
                  <h3 className="font-semibold text-gray-900 text-sm">Hostel Facility</h3>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed">
                  Both on-campus and off-campus accommodation provided with 24/7 security and high-speed Wi-Fi.
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Users className="text-purple-600" size={18} />
                  <h3 className="font-semibold text-gray-900 text-sm">Student Demographics</h3>
                </div>
                <div className="space-y-4 pt-1">
                   <div>
                     <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
                       <span>Local Students</span>
                       <span>75%</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-purple-600 h-1.5 rounded-full" style={{ width: '75%' }} /></div>
                   </div>
                   <div>
                     <div className="flex justify-between text-[11px] font-bold text-gray-600 mb-1">
                       <span>International Students</span>
                       <span>25%</span>
                     </div>
                     <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '25%' }} /></div>
                   </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Phone className="text-orange-600" size={18} />
                  <h3 className="font-semibold text-gray-900 text-sm">Contact Info</h3>
                </div>
                <div className="space-y-2 text-xs text-gray-700">
                   <div className="flex items-center gap-2"><Phone size={14} className="text-emerald-500" /><span>+60 1121376171</span></div>
                   <div className="flex items-center gap-2"><Printer size={14} className="text-gray-400" /><span>+91 9811213xxxx</span></div>
                   <div className="flex items-center gap-2"><Mail size={14} className="text-blue-500" /><span>info@educationmalaysia.in</span></div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-1 space-y-3">
             <UniversityActionButtons variant="desktop" />
             <UniversityRankings qs_rank={university.qs_rank} times_rank={university.times_rank} qs_asia_rank={university.qs_asia_rank} />
             <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
               <h3 className="text-sm font-bold text-gray-900 mb-3">Study Options</h3>
               <div className="grid grid-cols-3 gap-2">
                 {STUDY_OPTIONS.map(opt => (
                   <div key={opt.label} className={`flex flex-col items-center gap-1.5 py-2.5 rounded-lg border-2 ${opt.bg} ${opt.border}`}>
                     <Check size={14} className={opt.icon} />
                     <span className={`text-[10px] font-bold text-center leading-tight ${opt.text}`}>{opt.label}</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE HERO ── */}
      <div className="sm:hidden bg-gray-50 p-3">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-16 h-16 shrink-0 bg-white border border-gray-100 rounded-xl p-1.5 flex items-center justify-center shadow-sm">
            <img src={logoSrc || '/placeholder-logo.png'} alt="Logo" className="max-w-full max-h-full object-contain" fetchPriority="high" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 leading-tight mb-1">{university.name}</h1>
            <div className="flex items-center gap-1 mb-1">
              <MapPin className="text-blue-500 w-3 h-3 shrink-0" />
              <span className="text-gray-600 text-xs font-medium truncate">{university.city}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-bold text-[10px] uppercase tracking-wider text-gray-500">SETARA:</span>
              <div className="flex gap-0.5 ml-1">
                {[...Array(5)].map((_, i) => <Star key={i} className={`w-2.5 h-2.5 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />)}
              </div>
            </div>
          </div>
        </div>

        <div className="relative mb-5 rounded-2xl overflow-hidden shadow-lg border border-gray-100 aspect-video bg-gray-200">
           <img src={bannerSrc || '/placeholder-university.jpg'} alt="Banner" className="w-full h-full object-cover" fetchPriority="high" />
           <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent pointer-events-none" />
           <button onClick={() => setShowGallery(true)} className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-md text-blue-800 px-3 py-1.5 rounded-lg text-[10px] font-bold shadow-md border border-white/20 flex items-center gap-1.5">
             <ImageIcon size={12} />
             View Photos
           </button>
        </div>

        <div className="space-y-3">
           <UniversityInfoCards universityData={university} cols={2} />
           <UniversityRankings qs_rank={university.qs_rank} times_rank={university.times_rank} compact={true} />
           <UniversityActionButtons variant="mobile" />
        </div>
      </div>
    </div>
  )
}
