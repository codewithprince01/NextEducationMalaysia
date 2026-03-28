'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, Filter, X } from 'lucide-react'
import { IoFilter, IoClose } from 'react-icons/io5'
import { MdSearch, MdSchool, MdLocationOn } from 'react-icons/md'
import CoursesSidebar from './CoursesSidebar'
import CourseCard from './CourseCard'
import AuthModal from '@/components/modals/AuthModal'
import { BrochureForm } from '@/components/modals/UniversityForms/BrochureForm'
import { FeeStructureForm } from '@/components/modals/UniversityForms/FeeStructureForm'
import FormSuccessPopup from '@/components/common/FormSuccessPopup'
import { toast } from 'react-toastify'
import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

type Course = {
  id: number
  course_name: string
  slug?: string | null
  level?: string | null
  duration?: string | null
  tuition_fee?: string | null
  intake?: string | null
  study_mode?: string | null
  application_deadline?: string | null
  accreditations?: string | string[] | null
  university_id?: number
  university_name?: string
  university_logo?: string
}

type FilterOptions = {
  [key: string]: Array<{ id: string | number; name: string }>
}

type CoursesData = {
  programs: {
    data: Course[]
    current_page: number
    last_page: number
    total: number
  }
  levels: any[]
  categories: any[]
  specializations: any[]
  study_modes: any[]
  university?: { name: string; id: number }
}

type Props = {
  slug: string
  initialPage?: number
  initialData?: CoursesData
}

const filterKeyMap: { [key: string]: string } = {
  'Study Level': 'level',
  'Course Category': 'course_category_id',
  Stream: 'specialization_id',
  'Study Mode': 'study_mode',
}

const normalizeAccreditations = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.map(v => String(v).trim()).filter(Boolean)
  if (typeof value !== 'string') return []
  const raw = value.trim()
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return parsed.map(v => String(v).trim()).filter(Boolean)
  } catch {}
  return raw
    .split(/,|\r?\n|;|\|/g)
    .map(v => v.trim())
    .filter(Boolean)
}

export default function UniversityCoursesClient({ slug, initialPage = 1, initialData }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [data, setData] = useState<CoursesData | null>(initialData || null)
  const [loading, setLoading] = useState(!initialData)
  const [currentFilters, setCurrentFilters] = useState<{ [key: string]: any[] }>({})
  const [page, setPage] = useState(initialPage)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [appliedPrograms, setAppliedPrograms] = useState<number[]>([])

  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isBrochureOpen, setIsBrochureOpen] = useState(false)
  const [isFeeOpen, setIsFeeOpen] = useState(false)
  const [selectedCourseId, setSelectedCourseId] = useState<number | string | null>(null)
  const [popupUniversityData, setPopupUniversityData] = useState<{ id?: number | null; name?: string; logo_path?: string | null } | null>(null)
  const [showFormSuccess, setShowFormSuccess] = useState(false)
  const [formSuccessMessage, setFormSuccessMessage] = useState('Your inquiry has been submitted successfully. We will contact you soon.')

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [])

  // Initial filters from URL
  useEffect(() => {
    const init: { [key: string]: any[] } = {}
    const catId = searchParams.get('course_category_id')
    const specId = searchParams.get('specialization_id')
    if (catId) init['Course Category'] = [isNaN(Number(catId)) ? catId : Number(catId)]
    if (specId) init['Stream'] = [isNaN(Number(specId)) ? specId : Number(specId)]
    if (Object.keys(init).length) setCurrentFilters(init)
  }, [searchParams])

  useEffect(() => {
    if (initialData && page === initialPage && Object.keys(currentFilters).length === 0) {
      return
    }
    const fetchCourses = async () => {
      setLoading(true)
      const params = new URLSearchParams()
      params.set('page', String(page))
      Object.entries(currentFilters).forEach(([title, values]) => {
        const key = filterKeyMap[title]
        if (key && values?.length) {
          values.forEach(v => params.append(key, String(v)))
        }
      })

      try {
        const res = await fetch(`/api/university/${slug}/courses?${params.toString()}`)
        const d = await res.json()
        const payload = d?.data || d
        setData({
          programs: payload?.programs || { data: [], current_page: 1, last_page: 1, total: 0 },
          levels: payload?.levels || (payload?.filterOptions?.levels || []).map((level: string) => ({ level })),
          categories: payload?.categories || payload?.filterOptions?.categories || [],
          specializations: payload?.specializations || payload?.filterOptions?.specializations || [],
          study_modes: payload?.study_modes || (payload?.filterOptions?.study_modes || []).map((study_mode: string) => ({ study_mode })),
          university: payload?.university || (payload?.universityName ? { name: payload.universityName, id: 0 } : undefined)
        })
      } catch (error) {
        console.error('Failed to fetch courses:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [slug, page, currentFilters])

  useEffect(() => {
    const fetchAppliedStatus = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const headers: Record<string, string> = {
            Authorization: `Bearer ${token}`,
          }
          if (API_KEY) headers['x-api-key'] = API_KEY

          const res = await axios.get(`${API_BASE}/student/applied-college`, {
            headers
          }) as any;
          const appliedList = Array.isArray(res.data?.data?.applied_programs)
            ? res.data.data.applied_programs
            : Array.isArray(res.data?.applied_programs)
              ? res.data.applied_programs
              : Array.isArray(res.data?.data)
                ? res.data.data
                : [];

          const programs = Array.from(
            new Set(
              appliedList
                .map((item: any) => Number(item?.prog_id ?? item?.program_id ?? item?.university_program?.id))
                .filter((id: number) => Number.isFinite(id) && id > 0)
            )
          );

          setAppliedPrograms(programs);
        } catch (err) {
          console.error("Failed to fetch applied programs:", err);
        }
      }
    };
    fetchAppliedStatus();
  }, []);

  const courses = (data?.programs?.data ?? []).map((course: any) => ({
    ...course,
    tuition_fee: course?.tuition_fee ?? course?.tution_fee ?? '',
    accreditations: normalizeAccreditations(course?.accreditations),
  }))
  const pagination = data?.programs ?? { current_page: 1, last_page: 1, total: 0 }
  const universityName = data?.university?.name ?? slug
  const university = data?.university

  const filterOptions: FilterOptions = {
    'Study Level': data?.levels?.map((i: any) => ({ id: i.level, name: i.level })) || [],
    'Course Category': data?.categories?.map((i: any) => ({ id: i.id, name: i.name })) || [],
    Stream: data?.specializations?.map((i: any) => ({ id: i.id, name: i.name })) || [],
    'Study Mode': data?.study_modes?.map((i: any) => ({ id: i.study_mode, name: i.study_mode })) || [],
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
    const url = newPage === 1 ? `/university/${slug}/courses` : `/university/${slug}/courses/page-${newPage}`
    startTransition(() => router.replace(url, { scroll: false }))
  }

  const handleFiltersChange = (filters: { [key: string]: any[] }) => {
    setCurrentFilters(filters)
    setPage(1)
    startTransition(() => router.replace(`/university/${slug}/courses`, { scroll: false }))
  }

  const handleClearAllFilters = () => {
    setCurrentFilters({})
    setPage(1)
    startTransition(() => router.replace(`/university/${slug}/courses`, { scroll: false }))
  }

  const getFilterNameById = (category: string, id: any) => {
    const opt = filterOptions[category]?.find(o => o.id === id)
    return opt ? opt.name : id
  }

  const applyDirectly = async (token: string, courseId: number | string) => {
    try {
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
      }
      if (API_KEY) headers['x-api-key'] = API_KEY

      await axios.get(`${API_BASE}/student/apply-program/${courseId}`, {
        headers
      });
      toast.success("Applied successfully!");
      setAppliedPrograms(prev => (prev.includes(Number(courseId)) ? prev : [...prev, Number(courseId)]));
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.warn("Already applied!");
        setAppliedPrograms(prev => (prev.includes(Number(courseId)) ? prev : [...prev, Number(courseId)]));
      } else if (err.response?.status === 401) {
        localStorage.removeItem('token')
        setIsAuthModalOpen(true)
      } else {
        toast.error("Application failed. Try again.");
      }
    }
  }

  const handleApplyNow = (course: any) => {
    const courseId = course.id
    setSelectedCourseId(courseId)
    const token = localStorage.getItem('token')
    if (!token) {
      setIsAuthModalOpen(true)
    } else {
      applyDirectly(token, courseId);
    }
  }

  const handleBrochure = (course: any) => {
    setSelectedCourseId(course.id)
    setPopupUniversityData({
      id: course?.university_id ?? university?.id ?? null,
      name: course?.university_name || university?.name || '',
      logo_path: course?.university_logo || null,
    })
    setIsBrochureOpen(true)
  }

  const handleFeeStructure = (course: any) => {
    setSelectedCourseId(course.id)
    setPopupUniversityData({
      id: course?.university_id ?? university?.id ?? null,
      name: course?.university_name || university?.name || '',
      logo_path: course?.university_logo || null,
    })
    setIsFeeOpen(true)
  }

  const handleFormSuccess = (message: string) => {
    setFormSuccessMessage(message || 'Your inquiry has been submitted successfully. We will contact you soon.')
    setShowFormSuccess(true)
  }

  if (loading && courses.length === 0) {
    return (
      <div className="flex flex-col lg:flex-row gap-6 w-full animate-pulse">
        <div className="w-full lg:w-64 bg-gray-100 h-96 rounded-xl" />
        <div className="flex-1 space-y-4">
          <div className="h-8 bg-gray-100 w-1/2 rounded" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div id="courses-list-container" className="bg-gray-100 py-6 w-full">
      <div className="mx-auto">
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          <CoursesSidebar
            filterOptions={filterOptions}
            selectedFilters={currentFilters}
            onFiltersChange={handleFiltersChange}
            onClearAll={handleClearAllFilters}
          />

          <div className="flex-1 space-y-4 w-full">
            <h2 className="text-xl font-semibold text-gray-800">
              <span className="text-blue-700 font-bold">{pagination.total}</span> Programmes offered by{' '}
              <span className="text-blue-700 font-bold">{universityName}</span>
            </h2>
            <p className="text-gray-600 mb-4">
              Showing page {pagination.current_page} of {pagination.last_page}
            </p>

            {Object.values(currentFilters).some(f => f.length > 0) && (
              <div className="bg-white border border-gray-200 rounded-xl mb-5 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-gray-800 text-sm">Active Filters</span>
                  </div>
                  <button onClick={handleClearAllFilters} className="text-xs font-semibold text-red-500 hover:text-red-700 px-2 py-1 rounded flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(currentFilters).map(([key, values]) =>
                    values?.length ? values.map(value => (
                      <div key={`${key}-${value}`} className="flex items-center gap-1.5 bg-blue-50 border border-blue-100 rounded-lg px-2 py-1 text-xs">
                        <span className="text-gray-500 text-[10px] uppercase">{key}:</span>
                        <span className="font-semibold text-blue-900">{getFilterNameById(key, value)}</span>
                        <button
                          onClick={() => handleFiltersChange({ ...currentFilters, [key]: [] })}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )) : null
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-6 w-full">
              {courses.map((course: any) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  title={course.course_name}
                  mode={course.study_mode || ''}
                  deadline={course.application_deadline || ''}
                  intakes={course.intake || ''}
                  tuitionFee={course.tuition_fee || ''}
                  appliedCourses={new Set(appliedPrograms)}
                  onApplyNow={handleApplyNow}
                  onBrochureClick={handleBrochure}
                  onFeeStructureClick={handleFeeStructure}
                  accreditations={course.accreditations}
                  universitySlug={slug}
                />
              ))}
            </div>

            {pagination.last_page > 1 && (
              <div className="flex justify-center items-center gap-3 mt-6">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronLeft />
                </button>
                {[...Array(pagination.last_page)].map((_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => handlePageChange(i + 1)}
                    className={`w-10 h-10 flex items-center justify-center rounded-full border text-sm font-medium ${page === i + 1 ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 text-gray-700 hover:bg-gray-100'}`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= pagination.last_page}
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 disabled:opacity-40"
                >
                  <ChevronRight />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        courseId={selectedCourseId}
        onSuccess={() => {
          if (selectedCourseId) {
            setAppliedPrograms(prev => [...prev, Number(selectedCourseId)]);
          }
        }}
      />

      <BrochureForm
        universityId={popupUniversityData?.id ?? university?.id ?? null}
        universityName={popupUniversityData?.name || university?.name || ''}
        universityLogo={popupUniversityData?.logo_path || null}
        isOpen={isBrochureOpen}
        onClose={() => setIsBrochureOpen(false)}
        onSuccess={handleFormSuccess}
      />

      <FeeStructureForm
        universityId={popupUniversityData?.id ?? university?.id ?? null}
        universityName={popupUniversityData?.name || university?.name || ''}
        universityLogo={popupUniversityData?.logo_path || null}
        isOpen={isFeeOpen}
        onClose={() => setIsFeeOpen(false)}
        onSuccess={handleFormSuccess}
      />

      <FormSuccessPopup
        open={showFormSuccess}
        message={formSuccessMessage}
        onClose={() => setShowFormSuccess(false)}
      />
    </div>
  )
}
