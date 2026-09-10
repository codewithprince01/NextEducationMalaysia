'use client'

import { type ReactNode, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowLeft,
  Award,
  BookOpen,
  Calendar,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  GraduationCap,
  Info,
  Lightbulb,
  MapPin,
  Target,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
import FeaturedUniversities from '@/components/common/FeaturedUniversities'
import TrendingCourses from '@/components/common/TrendingCourses'
import SideInquiryForm from '@/components/forms/SideInquiryForm'
import { storageUrl } from '@/lib/constants'
import { formatRichText } from '@/lib/richText'

type SpecializationContent = {
  id?: number | string
  tab?: string | null
  title?: string | null
  description?: string | null
}

type SpecializationFaq = {
  id?: number | string
  question?: string | null
  answer?: string | null
}

type SpecializationLevel = {
  id?: number | string
  level?: string | null
  level_name?: string | null
  level_slug?: string | null
  url_slug?: string | null
  duration?: string | null
  tuition_fees?: string | null
  intake?: string | null
  accreditation?: string | null
}

type RelatedUniversity = {
  id?: number | string
  name?: string | null
  uname?: string | null
  city?: string | null
  logo_path?: string | null
  inst_type?: string | null
  qs_rank?: string | null
  allspcprograms?: number | string | null
}

type Specialization = {
  id?: number | string
  name?: string | null
  slug?: string | null
  duration?: string | null
  avrg_fees?: string | null
  contents?: SpecializationContent[]
  faqs?: SpecializationFaq[]
  specializationLevels?: SpecializationLevel[]
  specializationlevels?: SpecializationLevel[]
  specialization_levels?: SpecializationLevel[]
}

type SpecializationDetailData = {
  specialization?: Specialization
  related_universities?: RelatedUniversity[]
  featured_universities?: RelatedUniversity[]
  other_specializations?: Array<{ id?: number | string; name?: string | null; slug?: string | null }>
}

type LevelDetailData = {
  id?: number | string
  contents?: SpecializationContent[]
}

type Props = {
  slug: string
  levelSlug?: string
  initialData: SpecializationDetailData
  initialLevelData?: LevelDetailData | null
}

const tabIcons = {
  'About Course': <Info size={16} />,
  Duration: <Info size={16} />,
  Cost: <Info size={16} />,
  Career: <Info size={16} />,
  Branches: <Info size={16} />,
  'Entry Requirement': <Info size={16} />,
} as const

const statStyles = {
  blue: {
    wrapper: 'bg-blue-100',
    icon: 'text-blue-600',
  },
  green: {
    wrapper: 'bg-green-100',
    icon: 'text-green-600',
  },
  purple: {
    wrapper: 'bg-purple-100',
    icon: 'text-purple-600',
  },
  orange: {
    wrapper: 'bg-orange-100',
    icon: 'text-orange-600',
  },
} as const

function toLevelSlug(value: string) {
  return (value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/** "POST-GRADUATE-DIPLOMA" -> "Post-Graduate-Diploma", "PHD" -> "PhD" */
function toTitleCase(value: string) {
  return (value || '')
    .toLowerCase()
    .replace(/\b[a-z]/g, (char) => char.toUpperCase())
    .replace(/\bPhd\b/g, 'PhD')
}

function toTitleFromSlug(value: string) {
  return (value || '')
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function getLevelConfig(levelSlug: string, level: SpecializationLevel) {
  const normalized = (levelSlug || '').toLowerCase().trim()

  if (normalized.includes('pre-university') || normalized.includes('pre-u')) {
    return { key: 'pre-university', label: 'Pre-University', icon: 'FileText', order: 1 }
  }
  if (normalized.includes('certificates') || normalized.includes('certificate')) {
    return { key: 'certificates', label: 'Certificates', icon: 'BookOpen', order: 2 }
  }
  if (normalized.includes('diploma') && !normalized.includes('post-graduate') && !normalized.includes('postgraduate')) {
    return { key: 'diploma', label: 'Diploma', icon: 'FileText', order: 3 }
  }
  if (normalized.includes('under-graduate') || normalized.includes('undergraduate')) {
    return { key: 'undergraduate', label: 'Undergraduate', icon: 'GraduationCap', order: 4 }
  }
  if (normalized.includes('post-graduate-diploma') || normalized.includes('postgraduate-diploma')) {
    return { key: 'postgraduate-diploma', label: 'Postgraduate Diploma', icon: 'Award', order: 5 }
  }
  if (normalized.includes('post-graduate') || normalized.includes('postgraduate')) {
    return { key: 'postgraduate', label: 'Postgraduate', icon: 'Award', order: 6 }
  }
  if (normalized.includes('phd')) {
    return { key: 'phd', label: 'PhD', icon: 'Target', order: 7 }
  }

  return {
    key: toLevelSlug(levelSlug || level.level || ''),
    label: toTitleCase(level.level || level.level_name || levelSlug || ''),
    icon: 'GraduationCap',
    order: 8,
  }
}

function sectionId(name: string) {
  return `tab-${name.toLowerCase().replace(/\s+/g, '-')}`
}

export default function SpecializationDetailClient({
  slug,
  levelSlug,
  initialData,
  initialLevelData = null,
}: Props) {
  const [activeTab, setActiveTab] = useState('')
  const [tabsScrolled, setTabsScrolled] = useState(false)

  const detail = initialData || {}
  const specialization = detail.specialization || {}
  const relatedUniversities = detail.related_universities || []
  const faqs = specialization.faqs || []
  const specializationLevels =
    specialization.specializationLevels ||
    specialization.specializationlevels ||
    specialization.specialization_levels ||
    []

  const levelConfigs = useMemo(() => {
    const specNameSlug = toLevelSlug(specialization.name || '')
    const mappedLevels: Record<
      string,
      {
        id?: number | string
        title: string
        duration: string
        fees: string
        intake: string
        accreditation: string
      }
    > = {}
    const buttons: Array<{
      key: string
      label: string
      icon: string
      order: number
      actualSlug: string
    }> = []

    specializationLevels.forEach((level) => {
      const rawLevelSlug = level.level_slug || toLevelSlug(level.level || level.level_name || '')
      const actualSlug =
        level.url_slug ||
        (rawLevelSlug && specNameSlug ? `${rawLevelSlug}-in-${specNameSlug}` : rawLevelSlug)

      const config = getLevelConfig(rawLevelSlug, level)
      if (!config || !actualSlug) return

      mappedLevels[actualSlug] = {
        id: level.id,
        title: level.level || level.level_name || 'N/A',
        duration: level.duration || 'N/A',
        fees: level.tuition_fees || 'Contact for Fees',
        intake: level.intake || 'Contact for Intake',
        accreditation: level.accreditation || 'MQA',
      }

      if (!buttons.find((item) => item.actualSlug === actualSlug)) {
        buttons.push({
          ...config,
          actualSlug,
        })
      }
    })

    return {
      map: mappedLevels,
      buttons: buttons.sort((a, b) => a.order - b.order),
    }
  }, [specialization.name, specializationLevels])

  const currentLevel =
    (levelSlug ? levelConfigs.map[levelSlug] : null) || {
      title: '',
      duration: '',
      fees: '',
      intake: '',
      accreditation: '',
    }

  const rawContents = useMemo(() => {
    if (levelSlug && initialLevelData?.contents?.length) {
      return initialLevelData.contents.map((item) => ({
        tab: item.title || item.tab,
        description: item.description,
      }))
    }

    return specialization.contents || []
  }, [initialLevelData?.contents, levelSlug, specialization.contents])

  const { tabs, contentMap } = useMemo(() => {
    const dynamicTabs: Array<{ name: string; icon: ReactNode }> = []
    const mappedContents: Record<string, string> = {}

    rawContents.forEach((item) => {
      const tabName = item.tab || ('title' in item ? item.title : undefined)
      const description = item.description

      if (!tabName || !description || mappedContents[tabName]) return

      mappedContents[tabName] = description
      dynamicTabs.push({
        name: tabName,
        icon: tabIcons[tabName as keyof typeof tabIcons] || <Info size={16} />,
      })
    })

    return { tabs: dynamicTabs, contentMap: mappedContents }
  }, [rawContents])

  useEffect(() => {
    setActiveTab(tabs[0]?.name || '')
  }, [tabs])

  useEffect(() => {
    const handleScroll = () => {
      setTabsScrolled(window.scrollY > 100)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const hashId = window.location.hash.replace('#', '').trim()
    if (!hashId) return

    // Tab links write `#about-course` while the section id is `tab-about-course`,
    // so fall back to the prefixed id before giving up.
    const target = document.getElementById(hashId) || document.getElementById(`tab-${hashId}`)
    if (!target) return

    const navOffset = 52
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navOffset
    window.scrollTo({ top: Math.max(0, targetTop), left: 0, behavior: 'auto' })
  }, [slug, levelSlug])

  // When a level page is opened, start viewport from the level summary card
  // (Course Information) instead of jumping to page top.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!levelSlug) return

    const scrollToCourseInfo = () => {
      const target = document.getElementById('course-information')
      if (!target) return
      const navOffset = 52
      const targetTop = target.getBoundingClientRect().top + window.scrollY - navOffset
      window.scrollTo({ top: Math.max(0, targetTop), left: 0, behavior: 'auto' })
    }

    // Run after paint to ensure section height/content has settled.
    const timer = window.setTimeout(scrollToCourseInfo, 0)
    return () => window.clearTimeout(timer)
  }, [levelSlug])

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName)
    window.history.pushState(null, '', `#${tabName.toLowerCase().replace(/\s+/g, '-')}`)

    const element = document.getElementById(sectionId(tabName))
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  if (!specialization?.name) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 to-blue-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn&apos;t find this specialization.</p>
          <Link
            href="/specialization"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Specializations
          </Link>
        </div>
      </div>
    )
  }

  // A level page must not reuse the specialization's <h1> — that would give all
  // seven level URLs the same heading. Level pages get a level-specific one.
  const pageHeading =
    levelSlug && currentLevel.title
      ? `${toTitleCase(currentLevel.title)} in ${specialization.name || toTitleFromSlug(slug)}`
      : specialization.name || toTitleFromSlug(slug)

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Specializations', href: '/specialization' },
    { label: specialization.name || slug, href: levelSlug ? `/specialization/${slug}` : undefined },
    ...(levelSlug ? [{ label: toTitleFromSlug(levelSlug) }] : []),
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50">
      <Breadcrumb items={breadcrumbItems} />

      <div className="site-container pt-3 pb-5">
        {/* HERO BANNER CARD */}
        <div className="bg-white rounded-2xl shadow-md border border-slate-200/80 overflow-hidden mb-4">
          <div className="relative h-52 sm:h-64 md:h-80 lg:h-96 overflow-hidden bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900">
            <Image
              src="/study-in-malaysia.webp"
              alt={specialization.name || 'Specialization'}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1280px"
              className="object-cover object-top sm:object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7 md:p-10">
              <div className="max-w-4xl">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-2 leading-tight">
                  {pageHeading}
                </h1>
                <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-white/90 text-xs sm:text-sm">
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-300" />
                    <span className="font-medium">Study in Malaysia</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-blue-300" />
                    <span>Top Universities</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* STANDALONE COURSE STATS & STUDY LEVEL CARD */}
        <div id="course-information" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 scroll-mt-24 space-y-4">
          {/* STATS TILES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                icon: Clock,
                label: 'Duration',
                value: currentLevel.duration || specialization.duration || 'Varies',
                iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
              },
              {
                icon: DollarSign,
                label: 'Tuition Fees',
                value: currentLevel.fees || specialization.avrg_fees || 'Contact Us',
                iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
              },
              {
                icon: Calendar,
                label: 'Intake',
                value: currentLevel.intake || 'Multiple',
                iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
              },
              {
                icon: Award,
                label: 'Accreditation',
                value: currentLevel.accreditation || 'MQA',
                iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
              },
            ].map(({ icon: Icon, label, value, iconBg }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:bg-white hover:shadow-xs transition-all duration-200">
                <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0 border shadow-2xs`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase block">{label}</span>
                  <span className="font-extrabold text-slate-800 text-xs sm:text-sm md:text-base truncate block">{value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* SELECT STUDY LEVEL BAR */}
          {levelConfigs.buttons.length > 0 && (
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-blue-600 text-white flex items-center justify-center text-xs shadow-xs">
                  <GraduationCap className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-800 tracking-wide">
                  Select Your Study Level
                </h3>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2 sm:gap-2.5 w-full">
                {levelConfigs.buttons.map((levelItem) => {
                  const iconMap = { FileText, GraduationCap, Award, Target, BookOpen }
                  const Icon = iconMap[levelItem.icon as keyof typeof iconMap] || FileText
                  const isActive = levelSlug === levelItem.actualSlug
                  const levelPath = isActive
                    ? `/specialization/${slug}`
                    : `/specialization/${slug}/${levelItem.actualSlug}`

                  return (
                    <Link
                      key={levelItem.actualSlug}
                      href={levelPath}
                      scroll={false}
                      className={`group flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 text-center w-full ${
                        isActive
                          ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-600/20'
                          : 'bg-slate-50 hover:bg-white text-slate-700 hover:text-blue-600 border border-slate-200/80 hover:border-blue-300 hover:shadow-xs'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-white text-slate-500 border border-slate-200/60 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="truncate">{levelItem.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {tabs.length > 0 && (
        <div
          className={`hidden lg:block new-scoll-links scroll-sticky ${
            tabsScrolled ? 'shadow-[0_4px_12px_rgba(0,0,0,0.12)]' : 'shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
          }`}
          style={{
            position: 'sticky',
            top: '76px',
            zIndex: 9998,
            backgroundColor: 'white',
            margin: 0,
            paddingTop: 0,
          }}
        >
          <div className="site-container">
            <ul className="links scrollTo vertically-scrollbar flex gap-0 m-0 p-0 list-none overflow-x-auto overflow-y-hidden">
              {tabs.map(({ name, icon }) => (
                <li
                  key={name}
                  className={`flex-shrink-0 border-b-2 transition-all duration-200 ${
                    activeTab === name ? 'border-blue-600 text-blue-600 font-bold' : 'border-transparent text-gray-600 font-medium'
                  }`}
                >
                  <a
                    href={`#${name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={(event) => {
                      event.preventDefault()
                      handleTabClick(name)
                    }}
                    className={`flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm whitespace-nowrap transition-all duration-200 hover:text-blue-700 hover:bg-blue-50/50`}
                  >
                    {icon}
                    <span>{name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="site-container pb-8 sm:pb-12 pt-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          <div className="lg:col-span-9 space-y-4 sm:space-y-6">
            {tabs.length > 0 ? (
              tabs.map(({ name }) => (
                <section key={name} id={sectionId(name)} className="scroll-mt-24">
                  <div className="bg-white rounded-xl p-4 sm:p-5 md:p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div
                      className="cms-content max-w-none"
                      dangerouslySetInnerHTML={{ __html: formatRichText(contentMap[name]) }}
                    />
                  </div>
                </section>
              ))
            ) : (
              <div className="bg-white rounded-xl p-6 border border-gray-200 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">Course details coming soon.</p>
              </div>
            )}

              <section className="space-y-4 px-4 py-5 bg-white rounded-xl border border-slate-100 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900">Related Universities</h2>

                {relatedUniversities.length === 0 ? (
                  <p className="text-gray-500 text-center">No universities found.</p>
                ) : (
                  <div className="grid grid-cols-1 gap-5">
                    {relatedUniversities.map((university) => {
                      const universitySlug =
                        university.uname ||
                        university.name
                          ?.toLowerCase()
                          .replace(/\s+/g, '-')
                          .replace(/[^a-z0-9-]/g, '') ||
                        ''
                      const imageUrl = storageUrl(university.logo_path)

                      return (
                        <div
                          key={`${university.id}-${universitySlug}`}
                          className="bg-white p-5 rounded-xl shadow-md hover:shadow-lg transition border border-gray-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-5"
                        >
                          <div className="flex items-start gap-4 w-full">
                            <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-lg border bg-gray-50">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={university.name || 'University'}
                                  fill
                                  className="object-contain p-2"
                                  sizes="80px"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <GraduationCap className="w-8 h-8 text-gray-300" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1">
                              <Link
                                href={`/university/${universitySlug}`}
                                className="text-lg md:text-xl font-semibold text-blue-700 hover:text-blue-900 transition-colors"
                              >
                                {university.name}
                              </Link>

                              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin size={16} />
                                  {university.city || 'Malaysia'}
                                </span>

                                <span className="flex items-center gap-1">
                                  <GraduationCap size={16} />
                                  {university.inst_type || 'Institution'}
                                </span>
                              </div>

                              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold">Courses:</span>
                                  <span>{university.allspcprograms || 'N/A'}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <span className="font-semibold">QS Rank:</span>
                                  <span>{university.qs_rank || 'N/A'}</span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <span className="font-semibold">Scholarship:</span>
                                  <span>Yes</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <Link
                            href={`/university/${universitySlug}`}
                            className="bg-blue-800 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-900 transition whitespace-nowrap w-full md:w-auto text-center"
                          >
                            View Details
                          </Link>
                        </div>
                      )
                    })}
                  </div>
                )}

                <div className="flex justify-center pt-3">
                  <Link
                    href="/universities"
                    className="bg-blue-800 text-white px-6 py-3 rounded-lg font-medium text-sm hover:bg-blue-900 transition"
                  >
                    Browse All Universities
                  </Link>
                </div>
              </section>

              {faqs.length > 0 && (
                <section className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-md">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-3 sm:space-y-4">
                    {faqs.map((faq, index) => (
                      <details
                        key={`${faq.id || index}-${faq.question || 'faq'}`}
                        className="group bg-linear-to-r from-blue-50 to-cyan-50 rounded-xl overflow-hidden border border-blue-100"
                      >
                        <summary className="cursor-pointer font-semibold text-gray-900 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-blue-100 transition-colors text-sm sm:text-base">
                          <span className="pr-2">{faq.question}</span>
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 group-open:rotate-90 transition-transform shrink-0" />
                        </summary>
                        <div
                          className="cms-content max-w-none px-4 sm:px-6 pb-3 sm:pb-4"
                          dangerouslySetInnerHTML={{ __html: formatRichText(faq.answer) }}
                        />
                      </details>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="lg:col-span-3 space-y-6 lg:space-y-8">
              <div className="min-h-[400px]">
                <TrendingCourses variant="sidebar" />
              </div>
              <div className="min-h-[550px]" id="get-in-touch">
                <SideInquiryForm title="Get In Touch" context={specialization.name || slug} />
              </div>
              <div className="min-h-[400px]">
                <FeaturedUniversities variant="sidebar" />
              </div>
            </div>
          </div>
        </div>
      </div>
  )
}
