'use client'

import { useState, useEffect, useCallback, useMemo, type SyntheticEvent } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin, Navigation, Star, Building, Image as ImageIcon,
  Check
} from 'lucide-react'
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
import { storageUrl } from '@/lib/constants'



function imgUrl(path: string | null | undefined) {
  return storageUrl(path)
}

function setFallbackImage(
  e: SyntheticEvent<HTMLImageElement, Event>,
  fallback: string = '/placeholder-university.jpg'
) {
  const img = e.currentTarget
  if (img.dataset.fallbackApplied === '1') return
  img.dataset.fallbackApplied = '1'
  img.src = fallback
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



export default function UniversityHeroClient({ university, photos }: { university: any; photos: Photo[] }) {
  const pathname = usePathname()
  const [showGallery, setShowGallery] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [popupType, setPopupType] = useState<'brochure' | 'fee' | 'counselling' | 'apply' | 'review'>('brochure')
  const [showFormSuccess, setShowFormSuccess] = useState(false)
  const [formSuccessMessage, setFormSuccessMessage] = useState('Your inquiry has been submitted successfully. We will contact you soon.')

  // ── Breadcrumb Logic ──────────────────────────────────────────────────────
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

  // ── Data Prep ────────────────────────────────────────────────────────────
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
  const approvedBy = university.approved_by || 'MQA'

  const [fetchedCategories, setFetchedCategories] = useState<Array<{ id: number; name: string }>>([])

  useEffect(() => {
    if (university?.course_categories && university.course_categories.length > 0) return
    if (!university?.uname) return

    fetch(`/api/university/${university.uname}/courses`)
      .then(res => res.json())
      .then(d => {
        if (Array.isArray(d?.categories) && d.categories.length > 0) {
          setFetchedCategories(d.categories)
        }
      })
      .catch(() => {})
  }, [university?.uname, university?.course_categories])

  const categoriesList = useMemo(() => {
    if (Array.isArray(university?.course_categories) && university.course_categories.length > 0) {
      return university.course_categories
    }
    if (Array.isArray(university?.faculties) && university.faculties.length > 0) {
      return university.faculties
    }
    return fetchedCategories
  }, [university?.course_categories, university?.faculties, fetchedCategories])

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

      {/* ── DESKTOP HERO ── */}
      <div className="hidden sm:block site-container py-4 bg-white">
        {/* Logo + Info Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          {/* Left: Logo + Title + Location & Action */}
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-20 h-20 shrink-0 border border-slate-200/90 rounded-2xl overflow-hidden flex items-center justify-center bg-white shadow-xs p-1.5">
              <img
                src={logoSrc || '/placeholder-logo.png'}
                alt="Logo"
                className="w-full h-full object-contain"
                fetchPriority="high"
                onError={(e) => setFallbackImage(e, '/placeholder-logo.png')}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight">
                {university.name}
              </h1>
              <div className="flex items-center gap-2.5 text-sm text-slate-600 flex-wrap">
                <div className="flex items-center gap-1.5 text-slate-600 text-xs sm:text-sm font-medium">
                  <MapPin className="text-blue-600 shrink-0 w-4 h-4" />
                  <span>Location: <strong className="text-slate-900 font-semibold">{university.city || 'Malaysia'}</strong></span>
                </div>
                <button
                  onClick={handleDirections}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg font-semibold transition-all shadow-xs hover:shadow-sm active:scale-95 text-xs cursor-pointer border border-blue-600"
                >
                  <Navigation size={12} className="rotate-45" />
                  Get Directions
                </button>
                <div className="inline-flex items-center gap-1.5 bg-emerald-50/90 border border-emerald-200/80 px-2.5 py-1.5 rounded-lg text-xs font-medium text-emerald-900 shadow-2xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600 font-bold shrink-0" />
                  <span>Approved by <strong className="font-extrabold">{approvedBy}</strong></span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Status & Rating Badges */}
          <div className="flex flex-wrap items-center lg:justify-end gap-2 shrink-0">
            {/* Type */}
            <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 shadow-2xs">
              <Building className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>{typeLabel}</span>
            </div>

            {/* Featured */}
            <div className="inline-flex items-center gap-1.5 bg-blue-50/80 border border-blue-200/90 px-3 py-1.5 rounded-lg text-xs font-semibold text-blue-700 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Featured</span>
            </div>

            {/* SETARA Rating */}
            <div className="inline-flex items-center gap-1.5 bg-amber-50/80 border border-amber-200/90 px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-900 shadow-2xs">
              <span className="font-extrabold text-[10px] tracking-wider uppercase text-amber-900">SETARA</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 49% / 2x2 Photo Grid - Force exactly 360px height and 10px gap */}
        <div className="flex gap-[10px] mb-5 h-[360px]">
          <div className="relative group rounded-xl overflow-hidden shadow-md border border-gray-100 flex-none w-[49%]">
            <img
              src={bannerSrc || '/placeholder-university.jpg'}
              alt="Banner"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              fetchPriority="high"
              onError={(e) => setFallbackImage(e, '/placeholder-university.jpg')}
            />
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
                  <img
                    src={imgUrl(p.photo_path) || '/placeholder-university.jpg'}
                    alt="Photo"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => setFallbackImage(e, '/placeholder-university.jpg')}
                  />
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
          {/* Left Column: Info Cards, Rankings & Course Categories */}
          <div className="col-span-2 space-y-4">
            <UniversityInfoCards universityData={university} cols={4} />

            {/* Global Rankings */}
            <UniversityRankings qs_rank={university.qs_rank} times_rank={university.times_rank} qs_asia_rank={university.qs_asia_rank} />

            {/* Course Categories */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3.5 sm:p-4">
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm sm:text-base font-bold text-gray-900">Course Categories</h3>
                <Link
                  href={`/university/${university.uname}/courses`}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                >
                  View All Courses →
                </Link>
              </div>
              <div className="flex flex-wrap gap-2">
                {categoriesList.length > 0 ? (
                  categoriesList.map((cat: any) => (
                    <Link
                      key={cat.id || cat.name}
                      href={`/university/${university.uname}/courses?course_category_id=${cat.id}`}
                      // These chips are how Google found the filtered course URLs in the
                      // first place — every university page linked one per category, and
                      // each target is a filtered view of /courses that canonicalises back
                      // to it. Useful to a visitor, nothing to crawl: nofollow keeps the
                      // crawler out of the filter space instead of having it discover the
                      // URLs and then find them blocked in robots.txt.
                      rel="nofollow"
                      className="inline-flex items-center bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 border border-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer shadow-2xs"
                    >
                      {cat.name}
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No course categories available</p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Actions & Location Map */}
          <div className="col-span-1 flex flex-col gap-4 h-full">
             <UniversityActionButtons
               variant="desktop"
               onBrochure={() => openPopup('brochure')}
               onFeeStructure={() => openPopup('fee')}
               onCounselling={() => openPopup('counselling')}
               onReview={() => openPopup('review')}
             />

             {/* Google Maps Card - Clean full-bleed map matching remaining height */}
             <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex-1 min-h-0 bg-slate-100">
               <iframe
                 title={`Map of ${university.name}`}
                 src={`https://maps.google.com/maps?q=${encodeURIComponent(`${university.name} ${university.city || ''} Malaysia`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                 className="absolute inset-0 w-full h-full border-0"
                 loading="lazy"
                 referrerPolicy="no-referrer-when-downgrade"
               />
             </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE HERO ── */}
      <div className="sm:hidden px-4 pt-3 pb-6">
        <div className="space-y-3">
          {/* Logo + Name */}
          <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
            <div className="w-14 h-14 shrink-0 border border-gray-100 rounded-xl overflow-hidden flex items-center justify-center bg-white p-1">
              <img
                src={logoSrc || '/placeholder-logo.png'}
                alt="Logo"
                className="w-full h-full object-contain"
                fetchPriority="high"
                onError={(e) => setFallbackImage(e, '/placeholder-logo.png')}
              />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base font-bold text-gray-900 leading-tight line-clamp-2">{university.name}</h1>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={11} className="text-blue-600" />
                  {university.city || 'Malaysia'}
                </span>
                <span className="text-[11px] bg-blue-50 text-blue-700 font-medium px-2 py-0.5 rounded-full border border-blue-100">
                  {typeLabel}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid (2x2) */}
          <UniversityActionButtons
            variant="mobile"
            onBrochure={() => openPopup('brochure')}
            onFeeStructure={() => openPopup('fee')}
            onCounselling={() => openPopup('counselling')}
            onReview={() => openPopup('review')}
          />

          {/* Banner Photo */}
          <div className="relative rounded-xl overflow-hidden shadow-sm aspect-16/9 bg-gray-100">
             <img
               src={bannerSrc || '/placeholder-university.jpg'}
               alt="Banner"
               className="w-full h-full object-cover"
               fetchPriority="high"
               onError={(e) => setFallbackImage(e, '/placeholder-university.jpg')}
             />
             <div className="absolute inset-0 bg-linear-to-t from-black/40 to-transparent pointer-events-none" />
             <button onClick={openGallery} className="absolute bottom-3 left-3 z-10 bg-white/90 backdrop-blur-md text-blue-800 px-3 py-1.5 rounded-lg text-xs font-bold shadow-md border border-white/20 flex items-center gap-1.5">
               <ImageIcon size={14} />
               View Photos
             </button>
          </div>

          <div className="space-y-3">
             <UniversityInfoCards universityData={university} cols={2} />

             {/* Mobile Course Categories */}
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Course Categories:</h3>
                <div className="flex flex-wrap gap-1.5">
                  {categoriesList.length > 0 ? (
                    categoriesList.map((cat: any) => (
                      <Link
                        key={cat.id || cat.name}
                        href={`/university/${university.uname}/courses?course_category_id=${cat.id}`}
                        rel="nofollow"
                        className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-medium"
                      >
                        {cat.name}
                      </Link>
                    ))
                  ) : (
                    <p className="text-gray-500 text-xs">No course categories available</p>
                  )}
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

             {/* Mobile Google Maps Card */}
             <div className="relative rounded-xl overflow-hidden border border-gray-100 shadow-sm h-[160px] bg-slate-100">
               <iframe
                 title={`Map of ${university.name}`}
                 src={`https://maps.google.com/maps?q=${encodeURIComponent(`${university.name} ${university.city || ''} Malaysia`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                 className="w-full h-full border-0"
                 loading="lazy"
                 referrerPolicy="no-referrer-when-downgrade"
               />
             </div>
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
