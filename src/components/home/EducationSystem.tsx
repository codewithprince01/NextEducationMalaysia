'use client'

import React from 'react'
import { ArrowUp, GraduationCap, School, BookOpen } from 'lucide-react'

interface LevelItem {
  title: string
  span?: 'full'
  icon?: React.ComponentType<{ className?: string }>
}

interface Level {
  level: number
  items: LevelItem[]
}

const LEVELS: Level[] = [
  {
    level: 1,
    items: [{ title: 'Doctor of Philosophy', span: 'full', icon: GraduationCap }],
  },
  {
    level: 2,
    items: [
      { title: "Master's Degree" },
      { title: 'Postgraduate Diploma' },
      { title: 'Postgraduate Certificate' },
    ],
  },
  {
    level: 3,
    items: [{ title: "Bachelor's Degree", span: 'full', icon: School }],
  },
  {
    level: 4,
    items: [
      { title: 'Malaysian Higher School Certificate (STPM)' },
      { title: 'MOE Matriculation Certificate (KPM) / University Foundation' },
      { title: 'Polytechnic Diploma' },
      { title: 'Community College Diploma' },
    ],
  },
  {
    level: 5,
    items: [{ title: 'Community College Certificate', span: 'full' }],
  },
  {
    level: 6,
    items: [
      { title: 'Malaysian Certificate of Education (SPM)' },
      { title: 'Unified Examinations Certificate (UEC)' },
    ],
  },
  {
    level: 7,
    items: [
      { title: 'Upper Secondary Education' },
      { title: 'Chinese Independent Secondary School' },
    ],
  },
  {
    level: 8,
    items: [{ title: 'Lower Secondary Education', span: 'full' }],
  },
  {
    level: 9,
    items: [
      {
        title: 'Bahasa Melayu Assessment Literacy Test (UPLBM) or One-Year Transition Class',
        span: 'full',
      },
    ],
  },
  {
    level: 10,
    items: [
      { title: 'National School (SK)' },
      { title: 'National-Type Tamil School (SJKT)' },
      { title: 'National-Type Chinese School (SJKC)' },
    ],
  },
  {
    level: 11,
    items: [{ title: 'Preschool', span: 'full' }],
  },
]

export default function EducationSystem() {
  return (
    <section className="bg-linear-to-br from-blue-50 via-indigo-50 to-cyan-50 py-16 sm:py-24 px-4 overflow-hidden">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-4 sm:p-6 md:p-8 border border-blue-100 relative">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8 md:mb-10 relative">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 mb-3 sm:mb-4">
              Educational System
            </h2>
            <p className="text-xs sm:text-sm md:text-base text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
              Malaysia's education system provides <span className="font-semibold text-[#003893]">accessible, high-quality learning</span> from early childhood to higher education, following the <span className="font-semibold text-[#003893]">Malaysian Qualifications Framework (MQF)</span>.
            </p>
          </div>

          {/* Flowchart */}
          <div className="space-y-4">
            {LEVELS.map((level, levelIndex) => (
              <div key={level.level} className="relative group">
                {/* Cards Row */}
                <div className="flex flex-wrap justify-center gap-3">
                  {level.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className={`
                        ${item.span === 'full' ? 'w-full max-w-md mx-auto' : 'flex-1 min-w-[120px] sm:min-w-[150px] md:min-w-[180px] max-w-[250px]'}
                        bg-linear-to-br from-[#003893] to-[#0052CC] text-white 
                        rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 
                        text-center shadow-md hover:shadow-lg 
                        hover:-translate-y-1 transition-all duration-300
                        border border-white/10 relative overflow-hidden group/card
                      `}
                    >
                      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover/card:opacity-100 transition-opacity" />
                      <p className="font-medium text-xs sm:text-sm md:text-base leading-tight relative z-10">
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Arrow to next level */}
                {levelIndex < LEVELS.length - 1 && (
                  <div className="flex justify-center py-1 sm:py-1.5">
                    <ArrowUp className="w-3 h-3 sm:w-4 sm:h-4 text-[#003893]" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
