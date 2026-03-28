'use client'

import React from 'react'
import {
  FaCalendarAlt,
  FaClipboardList,
  FaEye,
  FaDownload,
  FaFileAlt,
} from 'react-icons/fa'
import { VscGitStashApply } from 'react-icons/vsc'
import { MdCompareArrows } from 'react-icons/md'
import Link from 'next/link'

interface CourseCardProps {
  course: any
  title: string
  mode: string
  deadline: string
  intakes: string
  tuitionFee: string
  onViewDetail?: (course: any) => void
  isSelected?: boolean
  appliedCourses: Set<number>
  onApplyNow: (course: any) => void
  onBrochureClick: (course: any) => void
  onFeeStructureClick: (course: any) => void
  accreditations: string[]
  universitySlug: string
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  title,
  mode,
  deadline,
  intakes,
  tuitionFee,
  onViewDetail,
  isSelected,
  appliedCourses,
  onApplyNow,
  onBrochureClick,
  onFeeStructureClick,
  accreditations,
  universitySlug
}) => {
  const cSlug =
    course.slug ||
    (course.course_name
      ? course.course_name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^a-z0-9-]/g, '')
          .trim()
      : '')

  const isApplied = appliedCourses.has(course.id)

  return (
    <div
      className="bg-white rounded-xl shadow-md p-6 w-full border border-gray-200 flex flex-col gap-4 cursor-pointer hover:border-blue-300 transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <h3
          onClick={() => onViewDetail?.(course)}
          className="text-xl font-bold text-gray-900 flex-1 cursor-pointer hover:text-blue-600 transition-colors duration-200"
        >
          {title || 'Untitled Course'}
        </h3>
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-linear-to-br from-amber-50 to-yellow-50 px-3 py-2 rounded-lg border border-amber-200 shadow-sm">
            <span className="text-lg font-bold text-gray-900">4.5</span>
            <svg
              className="w-5 h-5 text-amber-400 fill-amber-400"
              viewBox="0 0 20 20"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          </div>
          <button className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200 hover:border-red-300">
            <svg
              className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        </div>
      </div>

      <hr className="border-t border-gray-200" />

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-700">
        {[
          { Icon: FaFileAlt, label: 'Mode', value: mode },
          { Icon: FaCalendarAlt, label: 'App deadline', value: deadline },
          { Icon: FaClipboardList, label: 'Intakes', value: intakes },
          { Icon: FaCalendarAlt, label: 'Tuition Fee', value: tuitionFee },
        ].map(({ Icon, label, value }) => (
          <div key={label} className="flex items-start gap-2">
            <Icon className="text-blue-600 text-lg mt-0.5 shrink-0" />
            <div>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="font-semibold">{value || 'N/A'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Accreditation badges */}
      {Array.isArray(accreditations) && accreditations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {accreditations.map((a, i) => (
            <span
              key={i}
              className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-green-300"
            >
              {a}
            </span>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 w-full">
        <Link
          href={`/university/${universitySlug}/courses/${cSlug}`}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border font-medium transition text-sm ${
            isSelected
              ? 'bg-blue-600 text-white border-blue-600'
              : 'border-blue-600 text-blue-700 hover:bg-blue-50'
          }`}
        >
          <FaEye className={isSelected ? 'text-white' : 'text-blue-700'} />
          {isSelected ? 'Hide Details' : 'View Detail'}
        </Link>

        <button
          onClick={() => onApplyNow(course)}
          disabled={isApplied}
          className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl border font-medium transition text-sm ${
            isApplied
              ? 'bg-green-600 text-white border-green-600 cursor-not-allowed'
              : 'border-blue-600 text-blue-700 hover:bg-blue-50'
          }`}
        >
          <VscGitStashApply
            className={isApplied ? 'text-white' : 'text-blue-700'}
          />
          {isApplied ? 'Applied' : 'Apply Now'}
        </button>

        <button
          onClick={() => onBrochureClick(course)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-blue-600 text-blue-700 font-medium hover:bg-blue-50 transition text-sm"
        >
          <FaDownload className="text-blue-700" />
          Brochure
        </button>

        <button
          onClick={() => onFeeStructureClick(course)}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-blue-600 text-blue-700 font-medium hover:bg-blue-50 transition text-sm"
        >
          <MdCompareArrows className="text-blue-700" />
          Fee Structure
        </button>
      </div>
    </div>
  )
}

export default CourseCard
