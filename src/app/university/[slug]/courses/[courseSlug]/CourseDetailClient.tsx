"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  GraduationCap,
  Calendar,
  Clock,
  Award,
  DollarSign,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import SideInquiryForm from '@/components/forms/SideInquiryForm'
import FeaturedUniversities from '@/components/common/FeaturedUniversities'
import UniversityCoursesCard from '@/components/university/UniversityCoursesCard'
import PopularCourses from '@/components/university/PopularCourses'
import AuthModal from '@/components/modals/AuthModal'
import { toast } from 'react-toastify'
import axios from 'axios'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

interface CourseDetailClientProps {
  slug: string
  courseSlug: string
  program: any
}

const INTAKE_MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

export default function CourseDetailClient({ slug, courseSlug, program }: CourseDetailClientProps) {
  const router = useRouter()
  const [courseDetails] = useState<any>(program)
  const [isApplied, setIsApplied] = useState(false)
  
  // Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  useEffect(() => {
    const checkApplicationStatus = async () => {
      try {
        const token = localStorage.getItem('token')
        if (token && program?.id) {
           const appliedRes: any = await axios.get(`${API_BASE}/student/applied-college`, {
             headers: {
               Authorization: `Bearer ${token}`,
               ...(API_KEY ? { 'x-api-key': API_KEY } : {})
             }
           });
           const appliedCourses = Array.isArray(appliedRes?.data?.data?.applied_programs)
             ? appliedRes.data.data.applied_programs
             : Array.isArray(appliedRes?.data?.applied_programs)
               ? appliedRes.data.applied_programs
               : [];
           const alreadyApplied = appliedCourses.some((c: any) => Number(c?.prog_id) === Number(program.id));
           setIsApplied(alreadyApplied);
        }
      } catch (err) {
        console.error('Failed to check application status', err)
      }
    }
    checkApplicationStatus()
  }, [program?.id])

  const handleApplyNow = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      setIsAuthModalOpen(true)
    } else {
      applyDirectly(token);
    }
  }

  const applyDirectly = async (token: string) => {
    try {
      await axios.get(`${API_BASE}/student/apply-program/${courseDetails.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          ...(API_KEY ? { 'x-api-key': API_KEY } : {})
        }
      });
      toast.success("Applied successfully!");
      setIsApplied(true);
    } catch (err: any) {
      if (err.response?.status === 409) {
        toast.warn("Already applied!");
        setIsApplied(true);
      } else {
        toast.error("Application failed. Try again.");
      }
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      const element =
        document.getElementById('course-summary-card') ||
        document.getElementById('course-detail-section')
      if (!element) return
      const y = element.getBoundingClientRect().top + window.pageYOffset - 92
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' })
    }, 120)
    return () => clearTimeout(timer)
  }, [slug, courseSlug])

  if (!courseDetails) return null

  const formatFeeValue = (fee: any) => {
    if (!fee || fee === '0') return 'N/A'
    const s = String(fee).trim()
    if (/^\d+(\.\d+)?$/.test(s.replace(/,/g, ''))) {
      return `RM ${Number(s.replace(/,/g, '')).toLocaleString()}`
    }
    return s.startsWith('RM') ? s : `RM ${s}`
  }

  const specsList = [
    { icon: BookOpen, label: 'Study Mode', value: courseDetails.study_mode || 'Full Time' },
    { icon: Clock, label: 'Duration', value: courseDetails.duration ? (String(courseDetails.duration).toLowerCase().includes('year') ? courseDetails.duration : `${courseDetails.duration} Years`) : 'N/A' },
    { icon: Calendar, label: 'Intake', value: courseDetails.intake || 'N/A' },
    { icon: DollarSign, label: 'Tuition Fees', value: formatFeeValue(courseDetails.tuition_fee || courseDetails.tution_fee || courseDetails.fee), highlight: true },
    { icon: GraduationCap, label: 'Level', value: courseDetails.level || 'Diploma' },
    { icon: Award, label: 'Exam Accepted', value: courseDetails.exam_accepted || 'N/A' },
    { icon: Award, label: 'IELTS', value: courseDetails.ielts || 'N/A' },
    { icon: Award, label: 'TOEFL', value: courseDetails.toefl || 'N/A' },
  ]

  const contents = courseDetails.contents || []

  return (
    <div id="course-detail-section" className="min-h-screen bg-transparent scroll-mt-24">
      <div className="py-4 px-1 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* Main Left Column */}
            <div className="flex-1 w-full lg:w-[68%] space-y-4">
              {/* Back Button */}
              <div>
                <button
                  onClick={() => router.push(`/university/${slug}/courses`)}
                  className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-600 font-medium bg-white hover:bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Courses</span>
                </button>
              </div>

              {/* 1. Summary Card */}
              <div id="course-summary-card" className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
                {/* Header info */}
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                      {courseDetails.level || 'Diploma'} Course
                    </span>
                    <span className="text-xs text-gray-400">•</span>
                    <span className="text-xs text-gray-500 font-medium">
                      {courseDetails.study_mode || 'Full Time'}
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-snug">
                    {courseDetails.course_name}
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">
                    Fees Structure, Admission, Intake &amp; Deadline
                  </p>
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                  {specsList.map(({ icon: Icon, label, value, highlight }) => (
                    <div
                      key={label}
                      className={`p-2.5 rounded-lg border ${
                        highlight
                          ? 'bg-blue-50/50 border-blue-200/80'
                          : 'bg-gray-50/60 border-gray-200/70'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 mb-1">
                        <Icon className={`w-3.5 h-3.5 ${highlight ? 'text-blue-600' : 'text-gray-400'}`} />
                        <span className="text-[11px] font-medium text-gray-500">
                          {label}
                        </span>
                      </div>
                      <div className={`text-xs sm:text-sm font-semibold truncate ${
                        highlight ? 'text-blue-700' : 'text-gray-800'
                      }`}>
                        {value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2.5 pt-4 border-t border-gray-100">
                  <button
                    onClick={handleApplyNow}
                    disabled={isApplied}
                    className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isApplied 
                        ? 'bg-emerald-600 text-white cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    }`}
                  >
                    {isApplied ? (
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Applied</span>
                      </span>
                    ) : (
                      <span>Apply Now</span>
                    )}
                  </button>

                  <button
                    onClick={() => router.push(`/university/${slug}/courses`)}
                    className="px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer"
                  >
                    View all courses
                  </button>
                </div>
              </div>

              {/* 2. Course Intake Section */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <h2 className="text-base font-bold text-gray-900">
                      Course Intake
                    </h2>
                  </div>
                  {courseDetails.intake && (
                    <span className="text-xs text-gray-500">
                      Scheduled Intakes: <strong className="text-blue-700 font-semibold">{courseDetails.intake}</strong>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {INTAKE_MONTHS.map((month) => {
                    const active = courseDetails.intake?.toLowerCase().includes(month.toLowerCase())
                    return (
                      <div
                        key={month}
                        className={`py-2 px-1 text-center rounded-lg border text-xs ${
                          active
                            ? 'bg-blue-50 border-blue-200 text-blue-700 font-semibold'
                            : 'bg-gray-50/50 border-gray-100 text-gray-400 font-normal'
                        }`}
                      >
                        <span>{month}</span>
                        <span className="block text-[10px] opacity-80 mt-0.5">
                          {active ? 'Available' : 'Closed'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* 3. Course Details & Curriculum (Direct open display, no dropdowns) */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-xs space-y-6">
                {contents.length > 0 ? (
                  contents.map((section: any, idx: number) => (
                    <div key={section.id || idx} className={idx > 0 ? 'pt-5 border-t border-gray-100' : ''}>
                      {/* Section Title */}
                      <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                        <span>{section.tab_title || section.tab || 'Course Information'}</span>
                      </h3>

                      {section.heading && (
                        <h4 className="text-sm font-medium text-gray-600 mb-2">
                          {section.heading}
                        </h4>
                      )}

                      {/* Content Body */}
                      <div className="overflow-x-auto">
                        <div
                          className="text-gray-700 text-sm leading-relaxed prose prose-slate max-w-none prose-p:my-2 prose-headings:text-gray-900 prose-headings:font-semibold prose-headings:text-sm prose-ul:my-2 prose-ul:pl-5 prose-li:my-0.5 prose-table:w-full prose-table:border-collapse prose-table:my-3 prose-th:bg-gray-50 prose-th:border prose-th:border-gray-200 prose-th:p-2.5 prose-th:text-xs prose-th:font-semibold prose-th:text-gray-800 prose-td:border prose-td:border-gray-200 prose-td:p-2.5 prose-td:text-xs prose-td:text-gray-600"
                          dangerouslySetInnerHTML={{ __html: section.description || '' }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div>
                    <h3 className="text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                      <span>Course Overview</span>
                    </h3>
                    <div
                      className="text-gray-700 text-sm leading-relaxed prose prose-slate max-w-none"
                      dangerouslySetInnerHTML={{ __html: courseDetails.description || 'No detailed curriculum available.' }}
                    />
                  </div>
                )}
              </div>

              {/* 4. Popular Courses Section */}
              <PopularCourses slug={slug} />
            </div>

            {/* Sidebar — 32% approx */}
            <div className="w-full lg:w-[32%] space-y-4 sticky top-24">
              <SideInquiryForm />
              <FeaturedUniversities variant="sidebar" excludeSlug={slug} />
              <UniversityCoursesCard />
            </div>
          </div>
        </div>
      </div>

      {/* Application Form Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        courseId={courseDetails.id}
        courseData={courseDetails}
        onSuccess={() => setIsApplied(true)}
      />
    </div>
  )
}

