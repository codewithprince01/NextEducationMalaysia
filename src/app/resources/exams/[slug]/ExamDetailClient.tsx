'use client'
import React from 'react'
import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'
import FeaturedUniversities from '@/components/common/FeaturedUniversities'
import TrendingCourses from '@/components/common/TrendingCourses'
import SideInquiryForm from '@/components/forms/SideInquiryForm'
import Breadcrumb from '@/components/Breadcrumb'
import { storageUrl } from '@/lib/constants'
import { formatRichText } from '@/lib/richText'

type Exam = {
  id: any
  page_name: string
  name?: string
  headline?: string
  imgpath?: string
  banner_path?: string
  description?: string
  uri?: string
  slug?: string
  exam_page_contents?: any[]
  contents?: any[]
  faqs?: any[]
}

type Props = {
  exam: Exam
  allExams: Exam[]
}

const Sidebar = ({ exam, allExams }: { exam: Exam; allExams: Exam[] }) => (
  <div className="space-y-4 sm:space-y-6 lg:sticky lg:top-20">
    <div className="bg-white rounded-xl sm:rounded-2xl shadow p-4 sm:p-6">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 border-b pb-3 sm:pb-4 mb-4 sm:mb-5">
        Important Exams
      </h2>

      {allExams.slice(0, 6).map((item) => {
        const itemSlug = item.uri || item.slug
        const active = (exam.uri || exam.slug) === itemSlug
        return (
          <Link
            key={item.id}
            href={`/resources/exams/${itemSlug}`}
            className={`flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition group border-b border-gray-100 last:border-b-0 ${
              active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            <span className="font-medium text-sm sm:text-base group-hover:translate-x-1 transition">{item.page_name}</span>
            <FaArrowRight className="text-blue-500 group-hover:translate-x-1 transition" size={14} />
          </Link>
        )
      })}
    </div>

    <TrendingCourses variant="sidebar" />
    <FeaturedUniversities variant="sidebar" />
    <SideInquiryForm context={`exam-${exam?.id}`} />
  </div>
)

export default function ExamDetailClient({ exam, allExams }: Props) {
  const title = exam.page_name || exam.name || ''
  const formattedHtml = formatRichText(exam.description)
  const tabContents = exam.exam_page_contents || exam.contents || []
  const examImg = exam.imgpath || exam.banner_path
  const imgSrc = examImg?.startsWith?.('http') ? examImg : storageUrl(examImg) || '/girl-banner.webp'

  return (
    <div className="min-h-screen bg-gray-50">
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Resources', href: '/resources' },
          { label: 'Exams', href: '/resources/exams' },
          { label: title },
        ]}
      />

      <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-8 md:py-12">
        <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-10">
          <div className="lg:col-span-2 bg-white p-4 sm:p-6 md:p-8 rounded-xl shadow-lg">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3 sm:mb-4 md:mb-6 leading-tight">
              {title} - Exam Details
            </h1>

            {examImg && (
              <img
                src={imgSrc}
                alt={title}
                className="w-full max-h-48 sm:max-h-64 md:max-h-96 object-cover rounded-lg shadow-md mb-4 sm:mb-6 md:mb-8"
              />
            )}

            {exam.headline && (
              <p className="text-gray-700 mb-4 sm:mb-6 md:mb-8 text-sm sm:text-base md:text-lg lg:text-xl font-medium leading-relaxed">
                {exam.headline}
              </p>
            )}

            <div className="cms-content" dangerouslySetInnerHTML={{ __html: formattedHtml }} />

            {tabContents.length > 0 && (
              <div className="mt-6 sm:mt-8 space-y-6">
                {tabContents.map((content: any, idx: number) => (
                  <div key={idx} className="border border-gray-100 rounded-lg p-4 sm:p-6 bg-white">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{content.tab_title || content.tab}</h2>
                    <div className="cms-content" dangerouslySetInnerHTML={{ __html: formatRichText(content.tab_content || content.description) }} />
                  </div>
                ))}
              </div>
            )}

            <Link
              href="/resources/exams"
              className="inline-flex items-center mt-6 sm:mt-8 md:mt-10 px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-blue-700 transition duration-300 ease-in-out shadow-md hover:shadow-lg"
            >
              <FaArrowRight className="rotate-180 mr-2" size={14} /> Back to Exams
            </Link>
          </div>

            <Sidebar exam={exam} allExams={allExams} />
          </div>

          <div className="space-y-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <TrendingCourses variant="grid" />
            </div>
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden py-10">
              <FeaturedUniversities variant="grid" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
