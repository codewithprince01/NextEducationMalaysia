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
  headline?: string
  imgpath?: string
  description?: string
  uri?: string
  exam_page_contents?: any[]
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
    .replace(/<p>/g, `<p class="mb-4 text-gray-700 leading-relaxed text-base md:text-lg">`)
    .replace(/<ul>/g, `<ul class="list-disc pl-5 mb-6 space-y-2 text-gray-700">`)
    .replace(/<li>/g, `<li class="ml-4">`)
    .replace(/<ol>/g, `<ol class="list-decimal pl-5 mb-6 space-y-2 text-gray-700">`)
    .replace(/<strong>/g, `<strong class="font-bold text-gray-900 border-b-2 border-blue-100 pb-0.5">`)
    .replace(/<a href="(.*?)"/g, `<a href="$1" class="text-blue-600 hover:text-blue-800 underline transition font-semibold">`)
    .replace(/<img src="(.*?)"/g, (_m: string, src: string) => {
      return `<img src="${src}" class="w-full h-auto max-w-2xl mx-auto my-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300"`
    })
    .replace(/<h2>(.*?)<\/h2>/g, `<h2 class="text-2xl sm:text-3xl font-extrabold text-blue-900 border-l-8 border-blue-600 pl-4 mb-6 mt-12">$1</h2>`)
    .replace(/<h3>(.*?)<\/h3>/g, `<h3 class="text-xl sm:text-2xl font-bold text-gray-800 border-b-4 border-blue-50 pb-3 mb-5 mt-10">$1</h3>`)
    .replace(/<h4>(.*?)<\/h4>/g, `<h4 class="text-lg sm:text-xl font-bold text-blue-800/80 mb-4 mt-8 uppercase tracking-wide">$1</h4>`)
    .replace(/<table/g, `<div class="responsive-table-wrapper my-8 overflow-hidden rounded-2xl border border-blue-100 shadow-sm"><table class="w-full text-sm md:text-base border-collapse"`)
    .replace(/<\/table>/g, `</table></div>`)
    .replace(/<thead>/g, `<thead class="bg-blue-600 text-white text-left font-bold">`)
    .replace(/<th>/g, `<th scope="col" class="px-4 md:px-6 py-4 font-bold tracking-wider">`)
    .replace(/<tbody>/g, `<tbody class="bg-white divide-y divide-blue-50">`)
    .replace(/<tr>/g, `<tr class="even:bg-blue-50/50 hover:bg-blue-100/30 transition-colors">`)
    .replace(/<td>/g, `<td class="px-4 md:px-6 py-4 text-gray-700 font-medium">`)
}

const Sidebar = ({ exam, allExams }: { exam: Exam, allExams: Exam[] }) => (
  <div className="space-y-6 lg:sticky lg:top-24">
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-blue-50 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-1 opacity-50" />
      <h2 className="text-2xl font-black text-blue-900 border-b-2 border-blue-100 pb-4 mb-6 flex items-center gap-2">
        <span className="w-2 h-8 bg-blue-600 rounded-full" />
        Explore Exams
      </h2>
      <div className="space-y-2">
        {allExams.slice(0, 6).map(e => (
          <Link
            key={e.id}
            href={`/resources/exams/${e.uri}`}
            className={`flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-300 group ${
                exam.uri === e.uri 
                ? 'bg-blue-600 text-white shadow-blue-200 shadow-lg' 
                : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 border border-transparent hover:border-blue-100'
            }`}
          >
            <span className="font-bold text-base group-hover:translate-x-1 transition-transform">{e.page_name}</span>
            <FaArrowRight className={`${exam.uri === e.uri ? 'text-white' : 'text-blue-500'} group-hover:translate-x-1 transition-transform`} size={16} />
          </Link>
        ))}
      </div>
    </div>
    <TrendingCourses variant="sidebar" />
    <FeaturedUniversities variant="sidebar" />
    <SideInquiryForm context={`exam-${exam.id}`} />
  </div>
)

export default function ExamDetailClient({ exam, allExams }: Props) {
  const formattedHtml = formatDescription(exam.description || '')

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'Resources', href: '/resources' },
        { label: 'Exams', href: '/resources/exams' },
        { label: exam.page_name }
      ]} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
          <main className="lg:w-2/3">
            <div className="bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-blue-50 p-6 sm:p-10 md:p-14 overflow-hidden">
              <div className="inline-block px-4 py-1.5 bg-blue-600 text-white text-xs font-black rounded-full uppercase tracking-widest mb-6">
                Official Exam Portal 2025
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-blue-950 mb-8 leading-[1.15]">
                {exam.page_name}
              </h1>

              {exam.imgpath && (
                <div className="relative group mb-12 rounded-4xl overflow-hidden shadow-2xl border-4 border-white">
                  <img
                    src={storageUrl(exam.imgpath) || '/default-banner.jpg'}
                    alt={exam.page_name}
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/40 to-transparent pointer-events-none" />
                </div>
              )}

              {exam.headline && (
                <div className="bg-blue-50/50 border-l-8 border-blue-600 rounded-2xl p-8 mb-12 italic">
                  <p className="text-blue-900 text-lg sm:text-xl font-bold leading-relaxed">
                    "{exam.headline}"
                  </p>
                </div>
              )}

              <div className="space-y-12">
                {/* Main Body */}
                <div
                  className="content-rich text-gray-800"
                  dangerouslySetInnerHTML={{ __html: formattedHtml }}
                />

                {/* Tabs / Sections */}
                {exam.exam_page_contents && exam.exam_page_contents.length > 0 && (
                  <div className="space-y-10 pt-10 border-t border-blue-50">
                    {exam.exam_page_contents.map((content: any, idx: number) => (
                      <div key={idx} className="group">
                        <h2 className="text-2xl md:text-3xl font-black text-blue-900 mb-6 flex items-baseline gap-4">
                          <span className="text-blue-200 text-5xl font-black leading-none opacity-50 group-hover:opacity-100 transition-opacity">0{idx + 1}</span>
                          <span className="border-b-4 border-blue-600/20 group-hover:border-blue-600 transition-all">{content.tab_title}</span>
                        </h2>
                        <div 
                          className="prose prose-lg max-w-none text-gray-700 font-medium leading-[1.8]"
                          dangerouslySetInnerHTML={{ __html: content.tab_content }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-16 flex flex-wrap gap-4 pt-10 border-t border-blue-50">
                <Link
                  href="/resources/exams"
                  className="inline-flex items-center px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition duration-300 shadow-xl shadow-blue-200 hover:-translate-y-1 active:translate-y-0"
                >
                  <FaArrowRight className="rotate-180 mr-3" size={18} /> BACK TO EXAMS
                </Link>
                <Link
                  href="/contact-us"
                  className="inline-flex items-center px-10 py-5 bg-white text-blue-900 border-4 border-blue-900 font-black rounded-2xl hover:bg-blue-50 transition duration-300 hover:-translate-y-1 active:translate-y-0"
                >
                  GET FREE COUNSELLING <FaArrowRight className="ml-3" size={18} />
                </Link>
              </div>
            </div>
          </main>

          <aside className="lg:w-1/3">
            <Sidebar exam={exam} allExams={allExams} />
          </aside>
        </div>
      </div>

      <div className="bg-gray-50/50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-24">
          <TrendingCourses variant="grid" />
          <FeaturedUniversities variant="grid" />
        </div>
      </div>

      <style jsx global>{`
        .content-rich p { margin-bottom: 1.5rem; line-height: 1.8; color: #374151; font-weight: 500; font-size: 1.125rem; }
        .content-rich h2 { font-size: 1.875rem; font-weight: 800; color: #1e3a8a; margin-top: 2.5rem; margin-bottom: 1.25rem; }
        .content-rich h3 { font-size: 1.5rem; font-weight: 700; color: #1e40af; margin-top: 2rem; margin-bottom: 1rem; }
        .content-rich ul, .content-rich ol { margin-bottom: 2rem; }
        .content-rich li { margin-bottom: 0.75rem; color: #4b5563; }
      `}</style>
    </div>
  )
}
