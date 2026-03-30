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

function formatHTML(html: string): string {
  if (!html) return ''

  return html
    .replace(/<a /g, '<a style="color:#2563eb;text-decoration:underline;font-weight:500;" ')
    .replace(
      /<table\b[^>]*>/gi,
      '<div style="overflow-x:auto;width:100%;display:block;"><table style="width:100%;border-collapse:collapse;">',
    )
    .replace(/<\/table>/gi, '</table></div>')
    .replace(
      /<th>/g,
      '<th style="background:#2563eb;color:#fff;padding:8px 12px;font-size:0.8rem;font-weight:600;text-align:left;border-bottom:1px solid #1d4ed8;">',
    )
    .replace(
      /<td>/g,
      '<td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;color:#374151;font-size:0.875rem;">',
    )
}

function toLevelSlug(value: string) {
  return (value || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
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
    return { key: 'pre-university', label: level.level || 'Pre-University', icon: 'FileText', order: 1 }
  }
  if (normalized.includes('certificates') || normalized.includes('certificate')) {
    return { key: 'certificates', label: level.level || 'Certificates', icon: 'BookOpen', order: 2 }
  }
  if (normalized.includes('diploma') && !normalized.includes('post-graduate') && !normalized.includes('postgraduate')) {
    return { key: 'diploma', label: level.level || 'Diploma', icon: 'FileText', order: 3 }
  }
  if (normalized.includes('under-graduate') || normalized.includes('undergraduate')) {
    return { key: 'undergraduate', label: level.level || 'UNDER-GRADUATE', icon: 'GraduationCap', order: 4 }
  }
  if (normalized.includes('post-graduate-diploma') || normalized.includes('postgraduate-diploma')) {
    return { key: 'postgraduate-diploma', label: level.level || 'POST-GRADUATE-DIPLOMA', icon: 'Award', order: 5 }
  }
  if (normalized.includes('post-graduate') || normalized.includes('postgraduate')) {
    return { key: 'postgraduate', label: level.level || 'Postgraduate', icon: 'Award', order: 6 }
  }
  if (normalized.includes('phd')) {
    return { key: 'phd', label: level.level || 'PhD', icon: 'Target', order: 7 }
  }

  return null
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

    const target = document.getElementById(hashId)
    if (!target) return

    const navOffset = 92
    const targetTop = target.getBoundingClientRect().top + window.scrollY - navOffset
    window.scrollTo({ top: Math.max(0, targetTop), left: 0, behavior: 'auto' })
  }, [slug, levelSlug])

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

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Specializations', href: '/specialization' },
    { label: specialization.name || slug, href: levelSlug ? `/specialization/${slug}` : undefined },
    ...(levelSlug ? [{ label: toTitleFromSlug(levelSlug) }] : []),
  ]

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-blue-50">
      <Breadcrumb items={breadcrumbItems} />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pt-4 pb-12 sm:pb-16">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 overflow-hidden bg-linear-to-br from-blue-900 via-indigo-800 to-purple-900">
            <Image
              src="/study-in-malaysia.webp"
              alt={specialization.name || 'Specialization'}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 1280px"
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8 lg:p-12">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 md:mb-4 leading-tight">
                  {specialization.name}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 md:gap-6 text-white/90">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    <span className="text-xs sm:text-sm md:text-base font-medium">Study in Malaysia</span>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                    <span className="text-xs sm:text-sm md:text-base">Top Universities</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="course-information" className="bg-linear-to-br from-blue-50 to-cyan-50 border-b border-blue-100 scroll-mt-24">
            <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
                {currentLevel.title || 'Course Information'}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {[
                  {
                    icon: Clock,
                    color: 'blue' as const,
                    label: 'Duration',
                    value: currentLevel.duration || specialization.duration || 'Varies',
                  },
                  {
                    icon: DollarSign,
                    color: 'green' as const,
                    label: 'Tuition Fees',
                    value: currentLevel.fees || specialization.avrg_fees || 'Contact Us',
                  },
                  {
                    icon: Calendar,
                    color: 'purple' as const,
                    label: 'Intake',
                    value: currentLevel.intake || 'Multiple',
                  },
                  {
                    icon: Award,
                    color: 'orange' as const,
                    label: 'Accreditation',
                    value: currentLevel.accreditation || 'MQA',
                  },
                ].map(({ icon: Icon, color, label, value }) => (
                  <div key={label} className="flex items-center gap-2 sm:gap-3">
                    <div className={`${statStyles[color].wrapper} p-1.5 sm:p-2 rounded-lg shrink-0`}>
                      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${statStyles[color].icon}`} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm text-gray-600">{label}</div>
                      <div className="font-semibold text-gray-900 text-xs sm:text-sm break-words">{value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-6 sm:mb-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-slate-50/50 border-b border-gray-100">
            <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 sm:mb-6">
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <h3 className="text-sm sm:text-base font-bold text-gray-900">Select Your Study Level</h3>
                </div>
              </div>

              {levelConfigs.buttons.length > 0 ? (
                <div className="flex flex-wrap gap-2.5 sm:gap-4">
                  {levelConfigs.buttons.map((levelItem) => {
                    const iconMap = { FileText, GraduationCap, Award, Target, BookOpen }
                    const Icon = iconMap[levelItem.icon as keyof typeof iconMap] || FileText
                    const isActive = levelSlug === levelItem.actualSlug
                    const levelPath = isActive
                      ? `/specialization/${slug}`
                      : `/specialization/${slug}/${levelItem.actualSlug}`
                    const href = `${levelPath}#course-information`

                    return (
                      <Link
                        key={levelItem.actualSlug}
                        href={href}
                        scroll={false}
                        className={`group inline-flex items-center gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-300 border-2 ${
                          isActive
                            ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200 ring-2 ring-blue-100 ring-offset-1'
                            : 'bg-white text-gray-600 border-gray-100 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-700 shadow-sm'
                        }`}
                      >
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'
                          }`}
                        />
                        <span className="whitespace-nowrap">{levelItem.label}</span>
                      </Link>
                    )
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-white/50 rounded-2xl border border-dashed border-gray-200">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p className="text-sm text-gray-500">No education levels available for this specialization.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {tabs.length > 0 && (
        <div
          className={`hidden lg:block new-scoll-links scroll-sticky ${
            tabsScrolled ? 'shadow-[0_4px_12px_rgba(0,0,0,0.15)]' : 'shadow-[0_2px_8px_rgba(0,0,0,0.08)]'
          }`}
          style={{
            position: 'sticky',
            top: '56px',
            zIndex: 9998,
            backgroundColor: 'white',
            margin: 0,
            paddingTop: 0,
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ul className="links scrollTo vertically-scrollbar flex gap-0 m-0 p-0 list-none overflow-x-auto overflow-y-hidden">
              {tabs.map(({ name, icon }) => (
                <li
                  key={name}
                  className={`flex-shrink-0 border-b-[3px] transition-all duration-300 ${
                    activeTab === name ? 'border-blue-600' : 'border-transparent'
                  }`}
                >
                  <a
                    href={`#${name.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={(event) => {
                      event.preventDefault()
                      handleTabClick(name)
                    }}
                    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm whitespace-nowrap transition-all duration-300 ${
                      activeTab === name
                        ? 'text-blue-600'
                        : 'text-gray-500 hover:text-blue-800 hover:bg-blue-600/5'
                    }`}
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

      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-8 sm:pb-12 lg:pb-16">
        <div className="space-y-8 sm:space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
              {tabs.length > 0 ? (
                tabs.map(({ name }) => (
                  <section key={name} id={sectionId(name)} className="scroll-mt-24">
                    <div className="bg-linear-to-br from-white to-blue-50 rounded-lg sm:rounded-xl p-3 sm:p-5 md:p-6 border border-blue-100 shadow-md hover:shadow-lg transition-shadow">
                      <div
                        className="prose prose-sm sm:prose prose-blue max-w-none text-gray-700 leading-relaxed [&_a]:text-blue-600 [&_a]:font-medium [&_a:hover]:underline [&_a_span]:text-blue-600!"
                        dangerouslySetInnerHTML={{ __html: formatHTML(contentMap[name] || '') }}
                      />
                    </div>
                  </section>
                ))
              ) : (
                <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-gray-200 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Course details coming soon.</p>
                </div>
              )}

              <section className="space-y-5 px-4 py-6 bg-gray-50 rounded-xl border border-gray-200">
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
                          className="px-4 sm:px-6 pb-3 sm:pb-4 text-gray-700 leading-relaxed prose prose-sm max-w-none text-xs sm:text-sm [&_a]:text-blue-600 [&_a]:font-medium [&_a:hover]:underline"
                          dangerouslySetInnerHTML={{ __html: formatHTML(faq.answer || '') }}
                        />
                      </details>
                    ))}
                  </div>
                </section>
              )}
            </div>

            <div className="lg:col-span-1 space-y-6 lg:space-y-8">
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
    </div>
  )
}
