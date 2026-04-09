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
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'
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
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({ 0: true })
  
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

  const toggleSection = (id: string) =>
    setExpandedSections((prev) => ({ ...prev, [id]: !prev[id] }))

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

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Universities', href: '/universities' },
    ...(courseDetails?.university?.name || courseDetails?.university_name
      ? [{ label: courseDetails?.university?.name || courseDetails?.university_name, href: `/university/${slug}` }]
      : []),
    { label: courseDetails?.course_name || 'Course Details' },
  ]

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

  return (
    <div id="course-detail-section" className="min-h-screen bg-transparent scroll-mt-24">
      
      <div className="py-6 px-1 lg:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {/* Main Content — 70% approx */}
            <div className="flex-1 w-full lg:w-[68%] space-y-6">
              <button
                onClick={() => router.push(`/university/${slug}/courses`)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-sm bg-blue-50 px-4 py-2 rounded-lg transition-all active:scale-95 group mb-2 cursor-pointer"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span>
                Back to Courses
              </button>

              {/* Summary card */}
              <div id="course-summary-card" className="bg-white rounded-lg p-6 border border-gray-300 shadow-sm">
                <h1 className="text-xl font-medium text-gray-800 mb-6">
                  {courseDetails.course_name} Fees Structure, Admission, Intake, Deadline
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    {[
                      { icon: BookOpen, label: 'Study Mode', value: courseDetails.study_mode },
                      { icon: GraduationCap, label: 'Level', value: courseDetails.level },
                      { icon: Calendar, label: 'Intake', value: courseDetails.intake },
                      { icon: Award, label: 'IELTS', value: 'N/A' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-600">{label}:</p>
                          <p className="text-gray-700">{value || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-4">
                    {[
                      { icon: Clock, label: 'Duration', value: courseDetails.duration },
                      { icon: Award, label: 'Exam Accepted', value: courseDetails.exam_accepted },
                      { icon: DollarSign, label: 'Tuition Fees', value: courseDetails.tuition_fee || courseDetails.tution_fee },
                      { icon: Award, label: 'TOEFL', value: 'N/A' },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-blue-600 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-blue-600">{label}:</p>
                          <p className="text-gray-700">{value || 'N/A'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                  <button
                    onClick={handleApplyNow}
                    disabled={isApplied}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                      isApplied ? 'bg-green-600 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {isApplied ? 'Applied' : 'Apply Now'}
                  </button>
                  <button
                    onClick={() => router.push(`/university/${slug}/courses`)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-center cursor-pointer"
                  >
                    View all courses
                  </button>
                </div>
              </div>

              {/* Intake calendar */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <h4 className="text-lg font-medium text-gray-800 mb-4">Course Intake</h4>
                <div className="grid grid-cols-4 gap-3">
                  {INTAKE_MONTHS.map((month) => {
                    const active = courseDetails.intake?.toLowerCase().includes(month.toLowerCase())
                    return (
                      <div
                        key={month}
                        className={`p-3 text-center rounded-lg border text-sm ${
                          active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-blue-600 border-gray-300'
                        }`}
                      >
                        {month}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Content Sections */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="space-y-3">
                  {courseDetails.contents?.map((section: any) => (
                    <div key={section.id} className="border border-gray-300 rounded-lg bg-gray-50 overflow-hidden">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="w-full flex justify-between items-center p-4 text-left hover:bg-gray-100 transition-colors cursor-pointer"
                      >
                        <h2 className="text-lg font-medium text-blue-600">{section.tab_title || section.tab || 'Details'}</h2>
                        <div className="text-blue-600">
                          {expandedSections[section.id] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      </button>
                      {expandedSections[section.id] && (
                        <div className="p-4 border-t border-gray-200 bg-white">
                          {section.heading && (
                            <div className="bg-blue-100 p-3 rounded-lg mb-4">
                              <h3 className="text-lg font-medium text-blue-800">{section.heading}</h3>
                            </div>
                          )}
                          <div
                            className="space-y-4 text-gray-700 prose max-w-none prose-sm"
                            dangerouslySetInnerHTML={{ __html: section.description || '' }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                  {!courseDetails.contents?.length && (
                    <div className="border border-gray-300 rounded-lg bg-gray-50">
                      <div className="p-4">
                        <div
                          className="space-y-4 text-gray-700 prose max-w-none prose-sm"
                          dangerouslySetInnerHTML={{ __html: courseDetails.description || '' }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Popular Courses Section */}
                  <PopularCourses slug={slug} />
                </div>
              </div>
            </div>

            {/* Sidebar — 32% approx */}
            <div className="w-full lg:w-[32%] space-y-6 sticky top-24">
              <SideInquiryForm />
              <FeaturedUniversities variant="sidebar" excludeSlug={slug} />
              <UniversityCoursesCard />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        courseId={courseDetails.id}
        onSuccess={() => setIsApplied(true)}
      />
    </div>
  )
}
