'use client'
import React from 'react'
import Link from 'next/link'
import { FaArrowRight } from 'react-icons/fa'
import FeaturedUniversities from '@/components/common/FeaturedUniversities'
import TrendingCourses from '@/components/common/TrendingCourses'
import SideInquiryForm from '@/components/forms/SideInquiryForm'
import Breadcrumb from '@/components/Breadcrumb'
import { storageUrl } from '@/lib/constants'

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

const formatDescription = (html: string) => {
  if (!html) return ''

  return html
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/<p>&nbsp;<\/p>/g, '')
    .replace(/<br\s*\/?>\s*<br\s*\/?>/g, '<br/>')
    .replace(/(\s*<br\s*\/?>\s*)+/g, '<br/>')
    .replace(/<p>/g, '<p class="mb-1 text-gray-700 leading-relaxed">')
    .replace(/<ul>/g, '<ul class="list-disc pl-5 mb-1 space-y-1 text-gray-700">')
    .replace(/<li>/g, '<li class="ml-4">')
    .replace(/<ol>/g, '<ol class="list-decimal pl-5 mb-1 space-y-1 text-gray-700">')
    .replace(/<strong>/g, '<strong class="font-semibold text-gray-900">')
    .replace(/<a href="(.*?)"/g, '<a href="$1" class="text-blue-600 hover:text-blue-800 underline transition">')
    .replace(/<img src="(.*?)"/g, (_match: string, src: string) => {
      const fullSrc = src.startsWith('http') ? src : storageUrl(src) || src
      return `<img src="${fullSrc}" class="w-full h-auto max-w-lg mx-auto my-2 rounded-lg shadow-md"`
    })
    .replace(
      /<h2>(.*?)<\/h2>/g,
      '<h2 class="text-xl sm:text-2xl md:text-3xl font-extrabold text-blue-900 border-l-4 border-blue-600 pl-3 sm:pl-4 mb-2 mt-4">$1</h2>',
    )
    .replace(
      /<h3>(.*?)<\/h3>/g,
      '<h3 class="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-2 mt-3">$1</h3>',
    )
    .replace(
      /<h4>(.*?)<\/h4>/g,
      '<h4 class="text-base sm:text-lg md:text-xl font-semibold text-gray-700 mb-1 mt-2">$1</h4>',
    )
    .replace(
      /<table/g,
      '<div class="responsive-table-wrapper"><table class="w-full text-xs sm:text-sm md:text-base border-collapse"',
    )
    .replace(/<\/table>/g, '</table></div>')
    .replace(/<thead>/g, '<thead class="bg-blue-600 text-white text-left">')
    .replace(
      /<th>/g,
      '<th scope="col" class="px-2 sm:px-4 md:px-6 py-2 sm:py-3 font-semibold text-xs sm:text-sm md:text-base">',
    )
    .replace(/<tbody>/g, '<tbody class="bg-white divide-y divide-gray-200">')
    .replace(/<tr>/g, '<tr class="even:bg-blue-50 hover:bg-blue-100 transition">')
    .replace(
      /<td>/g,
      '<td class="px-2 sm:px-4 md:px-6 py-2 sm:py-3 text-gray-800 text-xs sm:text-sm md:text-base border-b border-gray-200">',
    )
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
  const formattedHtml = formatDescription(exam.description || '')
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

            <div className="text-sm sm:text-base text-gray-800 prose-sm sm:prose" dangerouslySetInnerHTML={{ __html: formattedHtml }} />

            {tabContents.length > 0 && (
              <div className="mt-6 sm:mt-8 space-y-6">
                {tabContents.map((content: any, idx: number) => (
                  <div key={idx} className="border border-gray-100 rounded-lg p-4 sm:p-6 bg-white">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{content.tab_title || content.tab}</h2>
                    <div className="text-sm sm:text-base text-gray-800" dangerouslySetInnerHTML={{ __html: content.tab_content || content.description || '' }} />
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
