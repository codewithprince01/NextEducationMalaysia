'use client'

import { useState, useCallback, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import {
  MapPin, Navigation, Star, Building, BedDouble,
  Phone, Mail, Image as ImageIcon,
  Check
} from 'lucide-react'
import { FaBuilding, FaBed, FaUsers, FaPhoneAlt, FaFax, FaEnvelope } from 'react-icons/fa'
import UniversityInfoCards from './UniversityInfoCards'
import UniversityActionButtons from './UniversityActionButtons'
import UniversityRankings from './UniversityRankings'
import GalleryModal from './GalleryModal'
import Breadcrumb, { BreadcrumbItem } from '@/components/Breadcrumb'
import FormSuccessPopup from '@/components/common/FormSuccessPopup'
import PopupForm from '@/components/modals/PopupForm'
import { BrochureForm } from '@/components/modals/UniversityForms/BrochureForm'
import { FeeStructureForm } from '@/components/modals/UniversityForms/FeeStructureForm'
import { CounsellingForm } from '@/components/modals/UniversityForms/CounsellingForm'
import { ReviewForm } from '@/components/modals/UniversityForms/ReviewForm'

const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL ?? 'https://admin.educationmalaysia.in'
const DEFAULT_PHONE_1 = '+60 1121376171'
const DEFAULT_PHONE_2 = '+91 9818560331'
const DEFAULT_EMAIL = 'info@educationmalaysia.in'

function imgUrl(path: string | null | undefined) {
  if (!path) return null
  const clean = String(path).replace(/^\/+/, '')
  return `${IMAGE_BASE}/storage/${clean}`
}

function parseListValue(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String).map(v => v.trim()).filter(Boolean)
  if (typeof value !== 'string') return []
  const text = value.trim()
  if (!text) return []

  try {
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) return parsed.map(String).map(v => v.trim()).filter(Boolean)
  } catch {}

  return text
    .replace(/<[^>]+>/g, ' ')
    .split(/\r?\n|,|;|\u2022|\*/g)
    .map(item => item.trim())
    .filter(Boolean)
}

function toInt(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0
  if (typeof value !== 'string') return 0
  const n = parseInt(value.replace(/[^\d]/g, ''), 10)
  return Number.isFinite(n) ? n : 0
}

type Photo = { id?: number; photo_path: string; photo_name?: string | null; title?: string | null }

const STUDY_OPTIONS = [
  { label: 'Study Online', bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', icon: 'text-green-500' },
  { label: 'Part Time', bg: 'bg-blue-50', border: 'border-blue-300', text: 'text-blue-700', icon: 'text-blue-500' },
  { label: 'Full Time', bg: 'bg-purple-50', border: 'border-purple-300', text: 'text-purple-700', icon: 'text-purple-500' },
]

export default function UniversityHeroClient({ university, photos }: { university: any; photos: Photo[] }) {
  const pathname = usePathname()
  const [showGallery, setShowGallery] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [popupType, setPopupType] = useState<'brochure' | 'fee' | 'counselling' | 'apply' | 'review'>('brochure')
  const [showFormSuccess, setShowFormSuccess] = useState(false)
  const [formSuccessMessage, setFormSuccessMessage] = useState('Your inquiry has been submitted successfully. We will contact you soon.')

  // â”€â”€ Breadcrumb Logic â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const breadcrumbItems = useMemo<BreadcrumbItem[]>(() => {
    const items: BreadcrumbItem[] = [
      { label: 'Home', href: '/' },
      { label: 'Universities', href: '/universities' },
      { label: university.name || 'University', href: `/university/${university.uname}` }
    ]

    const segments = pathname.split('/').filter(Boolean)
    if (segments.length > 2) {
      const section = segments[2]
      if (section !== 'courses' || segments.length === 3) {
        items.push({ label: section.charAt(0).toUpperCase() + section.slice(1), href: undefined })
      } else if (section === 'courses' && segments.length > 3) {
        items[2].href = `/university/${university.uname}`
        items.push({ label: 'Courses', href: `/university/${university.uname}/courses` })
        items.push({ label: 'Course Detail', href: undefined })
      }
    }
    return items
  }, [pathname, university])

  // â”€â”€ Data Prep â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const { mainPhoto, otherPhotos, allPhotos } = useMemo(() => {
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
    return { mainPhoto: main, otherPhotos: others, allPhotos: unique }
  }, [photos])

  const bannerSrc = imgUrl(university.banner_path) || imgUrl(mainPhoto?.photo_path)
  const logoSrc = imgUrl(university.logo_path)
  const typeLabel = university.inst_type || university.institute_type?.type || 'University'
  const stars = Math.round(Number(university.rating) || 4)
  const accreditedBy = parseListValue(university.accredited_by)
  const hostelFacility = parseListValue(university.hostel_facility)
  const phone1 = university.contact_number1 || DEFAULT_PHONE_1
  const phone2 = university.contact_number2 || DEFAULT_PHONE_2
  const email = university.email || DEFAULT_EMAIL
  const approvedBy = university.approved_by || 'MQA'
  const localStudents = toInt(university.local_students)
  const internationalStudents = toInt(university.international_students)
  const totalStudents = Math.max(localStudents + internationalStudents, 1)
  const localWidth = `${Math.round((localStudents / totalStudents) * 100)}%`
  const internationalWidth = `${Math.round((internationalStudents / totalStudents) * 100)}%`

  const handleDirections = useCallback(() => {
    if (university.google_map_link) {
      window.open(university.google_map_link, '_blank', 'noopener,noreferrer')
    } else if (university.name) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(university.name + ' Malaysia')}`, '_blank', 'noopener,noreferrer')
    }
  }, [university])

  const openGallery = useCallback(() => {
    if (!allPhotos.length) return
    setShowGallery(true)
  }, [allPhotos.length])

  const closeGallery = useCallback(() => {
    setShowGallery(false)
  }, [])

  const openPopup = useCallback((type: 'brochure' | 'fee' | 'counselling' | 'apply' | 'review') => {
    setPopupType(type)
    setIsPopupOpen(true)
  }, [])
  const handleFormSuccess = useCallback((message: string) => {
    setFormSuccessMessage(message || 'Your inquiry has been submitted successfully. We will contact you soon.')
    setShowFormSuccess(true)
  }, [])

  const popupLogo = logoSrc || bannerSrc || null

  return (
    <div className="bg-gray-50 sm:bg-white overflow-x-hidden">
      <div className="hidden sm:block">
        <Breadcrumb items={breadcrumbItems} />
      </div>

      {/* â”€â”€ DESKTOP HERO â”€â”€ */}
      <div className="hidden sm:block max-w-[1400px] mx-auto px-2 md:px-4 py-4 bg-white">
        {/* Logo + Info Row */}
        <div className="flex flex-row items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 shrink-0 border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center bg-white shadow-sm">
              <img src={logoSrc || '/placeholder-logo.png'} alt="Logo" className="w-full h-full object-contain" fetchPriority="high" />
            </div>
            <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 tracking-tight">{university.name}</h1>
            <div className="flex flex-row items-center gap-2 text-sm text-gray-600 flex-wrap">
              <div className="flex items-center gap-1 min-w-0">
                <MapPin className="text-blue-600 shrink-0 w-4 h-4" />
                <span className="text-blue-600 font-bold truncate">Location: {university.city}</span>
              </div>
              <button
                onClick={handleDirections}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200/50 transform hover:-translate-y-0.5 active:translate-y-0 text-sm cursor-pointer"
              >
                <Navigation size={14} className="rotate-45" />
                Get Directions
              </button>
            </div>
            </div>
          </div>

          <div className="flex items-start gap-4 text-sm">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <span className="text-gray-600 text-sm font-medium">Type:</span>
                <span className="bg-blue-700 text-white px-2.5 py-1 rounded-full font-medium text-sm">{typeLabel}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="font-bold text-xs uppercase tracking-widest">SETARA</span>
                <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-100">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 pt-0.5">
              <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full font-medium gap-2 text-[13px] border border-blue-100">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                <span>Featured</span>
              </div>
              <div className="text-gray-500 text-[10px] font-bold uppercase tracking-tighter ml-1">
                Approved By: <span className="text-gray-900 font-black">{approvedBy}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 49% / 2x2 Photo Grid - Force exactly 360px height and 10px gap */}
        <div className="flex gap-[10px] mb-5 h-[360px]">
          <div className="relative group rounded-xl overflow-hidden shadow-md border border-gray-100 flex-none w-[49%]">
            <img src={bannerSrc || '/placeholder-university.jpg'} alt="Banner" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" fetchPriority="high" />
            <div className="absolute inset-0 bg-linear-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />
            <button
              onClick={openGallery}
              className="absolute bottom-4 left-4 z-10 bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-800 transition-all shadow-lg flex items-center gap-2 cursor-pointer border border-blue-600"
            >
              <ImageIcon size={16} />
              View All Photos
            </button>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-[10px]">
            {otherPhotos.length > 0 ? (
              otherPhotos.map((p, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-100 bg-gray-100 cursor-pointer">
                  <img src={imgUrl(p.photo_path) || ''} alt="Photo" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Navigation className="text-white drop-shadow rotate-45" size={24} />
                  </div>
                </div>
              ))
            ) : (
              [...Array(4)].map((_, i) => <div key={i} className="animate-pulse bg-gray-200 rounded-xl" />)
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 relative z-20 pb-8">
          <div className="col-span-2 space-y-4">
            <UniversityInfoCards universityData={university} cols={4} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 -mt-2">
              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FaBuilding className="text-blue-600 text-lg" />
                  <h3 className="text-base font-semibold text-gray-900">Accredited By</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  {accreditedBy.length > 0 ? (
                    accreditedBy.map((a: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>{a}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{approvedBy}</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FaBed className="text-green-600 text-lg" />
                  <h3 className="text-base font-semibold text-gray-900">Hostel Facility</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-700">
                  {hostelFacility.length > 0 ? (
                    hostelFacility.map((f: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">•</span>
                        <span>{f}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>Available</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FaUsers className="text-purple-600 text-lg" />
                  <h3 className="text-base font-semibold text-gray-900">Total Students</h3>
                </div>
                <div className="space-y-4">
                   <div>
                     <div className="flex justify-between items-center mb-2">
                       <span>Local Students</span>
                       <span className="text-sm font-bold text-purple-700">{localStudents}</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2">
                       <div className="bg-purple-600 h-2 rounded-full transition-all duration-1000" style={{ width: localStudents > 0 ? localWidth : '0%' }} />
                     </div>
                   </div>
                   <div>
                     <div className="flex justify-between items-center mb-2">
                       <span>International Students</span>
                       <span className="text-sm font-bold text-blue-700">{internationalStudents}</span>
                     </div>
                     <div className="w-full bg-gray-200 rounded-full h-2">
                       <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" style={{ width: internationalStudents > 0 ? internationalWidth : '0%' }} />
                     </div>
                   </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex items-center gap-2 mb-4">
                  <FaPhoneAlt className="text-orange-600 text-lg" />
                  <h3 className="text-base font-semibold text-gray-900">Contact Info</h3>
                </div>
                <div className="space-y-4 text-sm text-gray-700">
                   <div className="flex items-center gap-3 group">
                     <FaPhoneAlt className="text-orange-500" />
                     <span>{phone1}</span>
                   </div>
                   <div className="flex items-center gap-3 group">
                     <FaFax className="text-gray-500" />
                     <span>{phone2}</span>
                   </div>
                   <div className="flex items-center gap-3 group">
                     <FaEnvelope className="text-blue-500" />
                     <span>{email}</span>
                   </div>
                </div>
              </div>
            </div>

            {university.offeredCourses && university.offeredCourses.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl shadow-md border border-gray-100 p-4 w-full">
                <h3 className="text-md font-bold text-gray-900 mb-4">Faculties:</h3>
                <div className="flex flex-wrap gap-2">
                  {university.offeredCourses.map((course: string, i: number) => (
                    <div
                      key={i}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-xl text-sm font-medium transition cursor-default"
                    >
                      {course}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="col-span-1 space-y-3">
             <UniversityActionButtons
               variant="desktop"
               onBrochure={() => openPopup('brochure')}
               onFeeStructure={() => openPopup('fee')}
               onCounselling={() => openPopup('counselling')}
               onReview={() => openPopup('review')}
             />
             <UniversityRankings qs_rank={university.qs_rank} times_rank={university.times_rank} qs_asia_rank={university.qs_asia_rank} />
             <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
               <h3 className="text-lg font-semibold text-gray-900 mb-4">Study Options</h3>
               <div className="grid grid-cols-3 gap-2">
                 {STUDY_OPTIONS.map(opt => (
                   <div key={opt.label} className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border-2 ${opt.bg} ${opt.border}`}>
                     <Check size={14} className={opt.icon} />
                     <span className={`text-sm font-medium whitespace-nowrap ${opt.text}`}>{opt.label}</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        </div>
      </div>

      {/* â”€â”€ MOBILE HERO â”€â”€ */}
      <div className="sm:hidden bg-gray-50 pb-8">
        <div className="bg-white p-3">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-20 h-20 shrink-0 bg-white border border-gray-100 rounded-2xl p-1.5 flex items-center justify-center shadow-sm">
              <img src={logoSrc || '/placeholder-logo.png'} alt="Logo" className="max-w-full max-h-full object-contain" fetchPriority="high" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 leading-tight mb-1">{university.name}</h1>
              <div className="flex items-center gap-1.5 mb-1.5">
                <MapPin className="text-blue-500 w-3.5 h-3.5 shrink-0" />
                <span className="text-gray-600 text-sm font-medium truncate">{university.city}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-[10px] uppercase tracking-wider text-gray-500">SETARA:</span>
              <div className="flex gap-1 ml-1 items-center bg-yellow-50 px-1.5 py-0.5 rounded-md border border-yellow-100">
                  {[...Array(5)].map((_, i) => <Star key={i} className={`w-3 h-3 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />)}
                </div>
              </div>
            </div>
          </div>

          <div className="relative mb-6 rounded-2xl overflow-hidden shadow-lg border border-gray-100 aspect-16/10 bg-gray-200">
             <img src={bannerSrc || '/placeholder-university.jpg'} alt="Banner" className="w-full h-full object-cover" fetchPriority="high" />
             <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent pointer-events-none" />
             <button onClick={openGallery} className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-md text-blue-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md border border-white/20 flex items-center gap-1.5">
               <ImageIcon size={14} />
               View Photos
             </button>
          </div>

          <div className="space-y-3">
             <UniversityInfoCards universityData={university} cols={2} />
             
             {/* Mobile Info Cards (Accredited, Hostel, Contact) */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="text-blue-600" size={16} />
                  <h3 className="text-sm font-semibold text-gray-900">Accredited By</h3>
                </div>
                <ul className="space-y-1 text-xs text-gray-700">
                  {accreditedBy.length > 0 ? (
                    accreditedBy.slice(0, 3).map((a: string, i: number) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-0.5">•</span>
                        <span>{a}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600 mt-0.5">•</span>
                      <span>{approvedBy}</span>
                    </li>
                  )}
                </ul>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BedDouble className="text-green-600" size={16} />
                  <h3 className="text-sm font-semibold text-gray-900">Hostel Facility</h3>
                </div>
                <p className="text-xs text-gray-700">{hostelFacility[0] || 'Available'}</p>
             </div>

             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Phone className="text-orange-600" size={16} />
                  <h3 className="text-sm font-semibold text-gray-900">Contact Info</h3>
                </div>
                <div className="space-y-1.5 text-xs text-gray-700">
                   <div className="flex items-center gap-2"><Phone size={12} className="text-orange-500" /><span>{phone1}</span></div>
                   <div className="flex items-center gap-2"><Mail size={12} className="text-blue-500" /><span>{email}</span></div>
                </div>
             </div>

             <UniversityRankings qs_rank={university.qs_rank} times_rank={university.times_rank} compact={true} />
             <UniversityActionButtons
               variant="mobile"
               onBrochure={() => openPopup('brochure')}
               onFeeStructure={() => openPopup('fee')}
               onCounselling={() => openPopup('counselling')}
               onReview={() => openPopup('review')}
             />
          </div>
        </div>
      </div>

      <BrochureForm
        universityId={university?.id}
        universityName={university?.name}
        universityLogo={popupLogo}
        isOpen={isPopupOpen && popupType === 'brochure'}
        onClose={() => setIsPopupOpen(false)}
        onSuccess={handleFormSuccess}
      />

      <FeeStructureForm
        universityId={university?.id}
        universityName={university?.name}
        universityLogo={popupLogo}
        isOpen={isPopupOpen && popupType === 'fee'}
        onClose={() => setIsPopupOpen(false)}
        onSuccess={handleFormSuccess}
      />

      <CounsellingForm
        universityId={university?.id}
        universityName={university?.name}
        universityLogo={popupLogo}
        isOpen={isPopupOpen && popupType === 'counselling'}
        onClose={() => setIsPopupOpen(false)}
        onSuccess={handleFormSuccess}
      />

      <ReviewForm
        universityId={university?.id}
        universityName={university?.name}
        universityLogo={popupLogo}
        isOpen={isPopupOpen && popupType === 'review'}
        onClose={() => setIsPopupOpen(false)}
        onSuccess={handleFormSuccess}
      />

      <PopupForm
        isOpen={isPopupOpen && popupType === 'apply'}
        onClose={() => setIsPopupOpen(false)}
        universityData={university}
        formType="apply"
      />

      <GalleryModal
        open={showGallery}
        onClose={closeGallery}
        universityName={university?.name}
        photos={allPhotos}
        getImageUrl={(path) => imgUrl(path) || '/placeholder-university.jpg'}
      />

      <FormSuccessPopup
        open={showFormSuccess}
        message={formSuccessMessage}
        onClose={() => setShowFormSuccess(false)}
      />
    </div>
  )
}




