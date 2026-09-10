'use client'

import React from 'react'
import { FiChevronDown } from 'react-icons/fi'

const accent = {
  blue: {
    ring: 'focus:ring-blue-500/20 focus:border-blue-500',
    captchaBox: 'border-blue-100 bg-blue-50/80',
    captchaText: 'text-blue-900',
    inputBorder: 'border-blue-200 text-blue-900',
    btnText: 'text-blue-500 hover:text-blue-700 border-blue-100',
  },
  green: {
    ring: 'focus:ring-green-500/20 focus:border-green-500',
    captchaBox: 'border-green-100 bg-green-50/80',
    captchaText: 'text-green-900',
    inputBorder: 'border-green-200 text-green-900',
    btnText: 'text-green-500 hover:text-green-700 border-green-100',
  },
  slate: {
    ring: 'focus:ring-slate-500/20 focus:border-slate-500',
    captchaBox: 'border-slate-100 bg-slate-50/80',
    captchaText: 'text-slate-900',
    inputBorder: 'border-slate-200 text-slate-900',
    btnText: 'text-slate-500 hover:text-slate-700 border-slate-100',
  },
} as const

type AccentColor = keyof typeof accent

type CommonFieldsProps = {
  nationality: string
  countryCode: string
  course?: string
  level?: string
  onNationalityChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onCountryCodeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onCourseChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onLevelChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  countriesData: any[]
  phonecode: any[]
  levels: any[]
  courseCategories: any[]
  accentColor?: AccentColor
}

export function CommonFields({
  nationality,
  countryCode,
  course = '',
  level = '',
  onNationalityChange,
  onCountryCodeChange,
  onCourseChange,
  onLevelChange,
  countriesData,
  phonecode,
  levels,
  courseCategories,
  accentColor = 'blue',
}: CommonFieldsProps) {
  const a = accent[accentColor]
  const cls = `w-full px-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white ${a.ring} transition-all outline-none text-xs sm:text-sm text-gray-800 font-medium`
  const label = 'text-[10.5px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wide ml-0.5'

  return (
    <div className="space-y-2.5 sm:space-y-3">
      {/* Row 1: Full Name & Email Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1">
          <label className={label}>Full Name</label>
          <input type="text" name="firstName" required placeholder="Enter your full name" autoComplete="off" className={cls} />
        </div>
        <div className="space-y-1">
          <label className={label}>Email Address</label>
          <input type="email" name="email" required placeholder="Enter your email" autoComplete="off" className={cls} />
        </div>
      </div>

      {/* Row 2: Phone Number & Nationality */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1">
          <label className={label}>Phone Number</label>
          <div className="flex gap-2 sm:gap-2.5">
            <div className="relative w-22 sm:w-24 shrink-0">
              <select
                name="countryCode"
                required
                value={countryCode}
                onChange={onCountryCodeChange}
                className={`w-full pl-2 sm:pl-2.5 pr-5 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white ${a.ring} transition-all outline-none text-xs sm:text-sm text-gray-800 font-medium appearance-none cursor-pointer`}
              >
                <option value="">Code</option>
                {(phonecode || []).map((c: any, i: number) => (
                  <option key={i} value={String(c.phonecode || c.phone_code || '')}>+{String(c.phonecode || c.phone_code || '')}</option>
                ))}
              </select>
              <FiChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
            </div>
            <input
              name="phone"
              required
              type="tel"
              placeholder="Enter your mobile number"
              autoComplete="off"
              className={`flex-1 min-w-0 px-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white ${a.ring} transition-all outline-none text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 font-medium`}
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className={label}>Nationality</label>
          <div className="relative">
            <select name="nationality" required value={nationality} onChange={onNationalityChange} className={`${cls} pr-7 appearance-none cursor-pointer`}>
              <option value="">Select Nationality</option>
              {(countriesData || []).map((c: any, i: number) => (
                <option key={i} value={c.name}>{c.name}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
          </div>
        </div>
      </div>

      {/* Row 3: Education Level & Interested Course */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="space-y-1">
          <label className={label}>Education Level</label>
          <div className="relative">
            <select
              name="level"
              required
              value={level}
              onChange={onLevelChange}
              className={`${cls} pr-7 appearance-none cursor-pointer`}
            >
              <option value="">Select Education Level</option>
              {(levels || []).map((l: any, i: number) => (
                <option key={i} value={l.level || l.name}>{l.level || l.name}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
          </div>
        </div>

        <div className="space-y-1">
          <label className={label}>Interested Course</label>
          <div className="relative">
            <select
              name="course"
              required
              value={course}
              onChange={onCourseChange}
              className={`${cls} pr-7 appearance-none cursor-pointer`}
            >
              <option value="">Select Course Category</option>
              {(courseCategories || []).map((c: any, i: number) => (
                <option key={i} value={c.name}>{c.name}</option>
              ))}
            </select>
            <FiChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
          </div>
        </div>
      </div>
    </div>
  )
}

type CourseCategoryFieldProps = {
  courseCategories: any[]
  accentColor?: AccentColor
  className?: string
}

export function CourseCategoryField({ courseCategories, accentColor = 'blue', className = '' }: CourseCategoryFieldProps) {
  const a = accent[accentColor]
  const cls = `w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white ${a.ring} transition-all outline-none text-sm text-gray-800 font-medium appearance-none`
  const label = 'text-[10px] font-bold text-gray-500 uppercase tracking-wide ml-1'

  return (
    <div className={`space-y-1 ${className}`}>
      <label className={label}>Interested Course Category</label>
      <select name="interested_course_category" required className={cls}>
        <option value="">Interested Course Category*</option>
        {(courseCategories || []).map((c: any, i: number) => (
          <option key={i} value={c.name}>{c.name}</option>
        ))}
      </select>
    </div>
  )
}

type CaptchaWidgetProps = {
  captchaQuestion: { num1: number; num2: number }
  captchaInput: string
  setCaptchaInput: (v: string) => void
  captchaError: boolean
  setCaptchaError: (v: boolean) => void
  generateCaptcha: () => void
  accentColor?: AccentColor
}

export function CaptchaWidget({
  captchaQuestion,
  captchaInput,
  setCaptchaInput,
  captchaError,
  setCaptchaError,
  generateCaptcha,
  accentColor = 'blue',
}: CaptchaWidgetProps) {
  const a = accent[accentColor]

  return (
    <>
      <div className={`flex items-center justify-between gap-3 p-2 sm:p-2.5 rounded-xl border ${a.captchaBox} shadow-xs`}>
        <p className={`text-xs sm:text-sm font-bold ${a.captchaText} whitespace-nowrap`}>
          What is {captchaQuestion.num1} + {captchaQuestion.num2}?
        </p>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={captchaInput}
            onChange={(e) => {
              if (!/^\d*$/.test(e.target.value)) return
              setCaptchaInput(e.target.value)
              setCaptchaError(false)
            }}
            required
            placeholder="?"
            className={`w-20 sm:w-28 px-2.5 py-1.5 sm:py-2 border rounded-lg focus:ring-2 outline-none font-bold text-center text-xs sm:text-sm shadow-xs transition-all ${captchaError ? 'border-red-500 bg-red-50' : `${a.inputBorder} bg-white`}`}
          />
          <button type="button" onClick={generateCaptcha} className={`p-1.5 sm:p-2 transition-colors bg-white rounded-lg border shadow-xs hover:shadow-md active:scale-95 ${a.btnText}`} title="Refresh Captcha">
            <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      {captchaError && <p className="text-red-600 text-[10px] font-bold text-center -mt-1">Incorrect answer</p>}
    </>
  )
}
