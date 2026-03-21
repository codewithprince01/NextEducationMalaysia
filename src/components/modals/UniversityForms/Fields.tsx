'use client'

import React from 'react'

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
  onNationalityChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  onCountryCodeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  countriesData: any[]
  phonecode: any[]
  levels: any[]
  accentColor?: AccentColor
}

export function CommonFields({
  nationality,
  countryCode,
  onNationalityChange,
  onCountryCodeChange,
  countriesData,
  phonecode,
  levels,
  accentColor = 'blue',
}: CommonFieldsProps) {
  const a = accent[accentColor]
  const cls = `w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white ${a.ring} transition-all outline-none text-sm text-gray-800 font-medium`
  const label = 'text-[10px] font-bold text-gray-500 uppercase tracking-wide ml-1'

  return (
    <>
      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={label}>Full Name</label>
          <input type="text" name="name" required placeholder="Full Name*" className={cls} />
        </div>
        <div className="space-y-1">
          <label className={label}>Email Address</label>
          <input type="email" name="email" required placeholder="Email*" className={cls} />
        </div>
      </div>

      <div className="space-y-1">
        <label className={label}>Phone Number</label>
        <div className="flex gap-2">
          <select
            name="c_code"
            required
            value={countryCode}
            onChange={onCountryCodeChange}
            className={`w-28 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white ${a.ring} transition-all outline-none text-sm text-gray-800 font-medium appearance-none`}
          >
            <option value="">Code</option>
            {(phonecode || []).map((c: any, i: number) => (
              <option key={i} value={String(c.phonecode || c.phone_code || '')}>+{String(c.phonecode || c.phone_code || '')}</option>
            ))}
          </select>
          <input name="mobile" required type="tel" placeholder="Mobile/WhatsApp No*" className={`flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white ${a.ring} transition-all outline-none text-sm text-gray-800 placeholder:text-gray-400 font-medium`} />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className={label}>Nationality</label>
          <select name="nationality" required value={nationality} onChange={onNationalityChange} className={`${cls} appearance-none`}>
            <option value="">Nationality*</option>
            {(countriesData || []).map((c: any, i: number) => (
              <option key={i} value={c.name}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <label className={label}>Highest Qualification</label>
          <select name="highest_qualification" required className={`${cls} appearance-none`}>
            <option value="">Highest Qualification*</option>
            {(levels || []).map((l: any, i: number) => (
              <option key={i} value={l.level || l.name}>{l.level || l.name}</option>
            ))}
          </select>
        </div>
      </div>
    </>
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
      <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${a.captchaBox} shadow-sm`}>
        <p className={`text-sm font-bold ${a.captchaText} whitespace-nowrap`}>
          What is {captchaQuestion.num1} + {captchaQuestion.num2}?
        </p>
        <div className="flex items-center gap-2">
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
            className={`w-24 md:w-32 px-3 py-2 border rounded-lg focus:ring-2 outline-none font-bold text-center text-sm md:text-base shadow-sm transition-all ${captchaError ? 'border-red-500 bg-red-50' : `${a.inputBorder} bg-white`}`}
          />
          <button type="button" onClick={generateCaptcha} className={`p-2 transition-colors bg-white rounded-lg border shadow-sm hover:shadow-md active:scale-95 ${a.btnText}`} title="Refresh Captcha">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      {captchaError && <p className="text-red-600 text-[10px] font-bold text-center -mt-1">Incorrect answer</p>}
    </>
  )
}
