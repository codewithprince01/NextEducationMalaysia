'use client'

import React from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import { INQUIRY_SUCCESS_MESSAGE, showInquirySuccessToast } from '@/components/common/inquiryToast'
import ModalWrapper from './ModalWrapper'
import { useFormState } from './useFormState'
import { useFetchFormData } from './useFetchFormData'
import { CommonFields, CourseCategoryField, CaptchaWidget } from './Fields'

const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''
const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://admin.educationmalaysia.in'

function normalizeLogoUrl(url?: string | null) {
  if (!url) return null
  const value = String(url).trim()
  if (!value) return null
  if (/^https?:\/\//i.test(value)) return value
  const base = IMAGE_BASE.replace(/\/+$/, '')
  const clean = value.replace(/^\/+/, '')
  if (clean.startsWith('storage/')) return `${base}/${clean}`
  if (clean.startsWith('uploads/')) return `${base}/${clean}`
  return `${base}/storage/${clean}`
}

function withStorageFallback(url?: string | null) {
  if (!url) return null
  if (!/^https?:\/\//i.test(url)) return normalizeLogoUrl(url)
  try {
    const u = new URL(url)
    const p = u.pathname.replace(/^\/+/, '')
    if (!p || p.startsWith('storage/')) return url
    if (p.startsWith('uploads/')) return url
    return `${u.origin}/storage/${p}`
  } catch {
    return normalizeLogoUrl(url)
  }
}

type Props = {
  universityId?: number | null
  universityName?: string | null
  universityLogo?: string | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: (message: string) => void
}

export function CounsellingForm({ universityId, universityName, universityLogo, isOpen, onClose, onSuccess }: Props) {
  const { phonecode, levels, courseCategories, countriesData } = useFetchFormData(universityName)
  const form = useFormState(isOpen, countriesData as any[], phonecode as any[])
  const [logoSrc, setLogoSrc] = React.useState<string | null>(normalizeLogoUrl(universityLogo))

  React.useEffect(() => {
    setLogoSrc(normalizeLogoUrl(universityLogo))
  }, [universityLogo])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.validateCaptcha()) return

    const formEl = e.currentTarget
    const fd = new FormData(formEl)
    form.setLoading(true)

    try {
      const response = await axios.post('/api/v1/inquiry/book-session', {
        name: fd.get('firstName'),
        email: fd.get('email'),
        country_code: String(fd.get('countryCode') || '91').replace('+', ''),
        mobile: fd.get('phone'),
        nationality: fd.get('nationality'),
        highest_qualification: fd.get('level'),
        interested_course_category: fd.get('interested_course_category') || fd.get('course'),
        university: universityName || '',
        university_id: universityId || null,
        university_name: universityName || '',
        requestfor: 'counselling',
        dayslot: fd.get('preferred_date'),
        timeslot: fd.get('preferred_time'),
        time_zone: fd.get('time_zone'),
        message: fd.get('message'),
        formType: 'Counselling Form',
        sourceUrl: typeof window !== 'undefined' ? window.location.href : '',
        source_path: typeof window !== 'undefined' ? window.location.href : '',
      }, {
        headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
      })

      if (response?.status < 200 || response?.status >= 300) {
        throw new Error('Submission failed')
      }

      const successMessage = INQUIRY_SUCCESS_MESSAGE
      formEl.reset()
      form.reset()
      if (onSuccess) onSuccess(successMessage)
      else showInquirySuccessToast(successMessage)
      onClose()
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.response?.data?.details ||
        'Something went wrong. Please try again.'
      toast.error(msg)
    } finally {
      form.setLoading(false)
    }
  }

  return (
    <ModalWrapper open={isOpen} onClose={onClose} wide>
      <div className="w-full">
        {/* ── TOP HEADLINE & SUBTITLE ── */}
        <div className="text-center mb-2 px-1 sm:px-4">
          <h2 className="text-[15px] sm:text-[17px] md:text-[19px] font-extrabold text-slate-900 tracking-tight leading-snug max-w-md mx-auto">
            Apply to <span className="text-blue-600">Malaysian Universities</span>
            <br className="hidden sm:inline" /> through one application process.
          </h2>
          <p className="text-[11px] sm:text-[12px] text-slate-500 mt-1 leading-relaxed max-w-md mx-auto font-normal">
            Receive personalised guidance and, subject to eligibility and document verification, receive your offer letter in as little as{' '}
            <span className="font-semibold text-blue-600 whitespace-nowrap">7 working days.</span>
          </p>
        </div>

        {/* ── COMPACT UNIVERSITY BADGE ── */}
        <div className="mb-2.5 flex items-center justify-center gap-2.5 py-1.5 px-3 bg-emerald-50/70 border border-emerald-100/90 rounded-xl w-fit mx-auto">
          <div className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-white rounded-lg shadow-2xs border border-emerald-100 overflow-hidden p-0.5 shrink-0">
            {logoSrc ? (
              <img
                src={logoSrc}
                alt={universityName || 'University'}
                className="w-full h-full object-contain"
                onError={() => {
                  const fallback = withStorageFallback(logoSrc)
                  if (fallback && fallback !== logoSrc) setLogoSrc(fallback)
                  else setLogoSrc(null)
                }}
              />
            ) : (
              <span className="text-[10px] font-bold text-emerald-600">BOOK</span>
            )}
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-none">
            Direct University <span className="text-emerald-700">Counselling Session</span> {universityName ? `· ${universityName}` : ''}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2.5 sm:space-y-3">
          <input type="hidden" name="university" value={universityName || ''} />

          <CommonFields
            nationality={form.nationality}
            countryCode={form.countryCode}
            course={form.course}
            level={form.level}
            countriesData={countriesData}
            phonecode={phonecode}
            levels={levels}
            courseCategories={courseCategories}
            onNationalityChange={form.handleNationalityChange}
            onCountryCodeChange={form.handleCountryCodeChange}
            onCourseChange={form.handleCourseChange}
            onLevelChange={form.handleLevelChange}
            accentColor="green"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <label className="text-[10.5px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wide ml-0.5">Time Zone</label>
              <div className="relative">
                <select
                  name="time_zone"
                  required
                  className="w-full px-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-xs sm:text-sm text-gray-800 font-medium appearance-none cursor-pointer"
                >
                  <option value="">Select your timezone</option>
                  <option value="GMT+05:30">(GMT+05:30) India (IST)</option>
                  <option value="GMT+08:00">(GMT+08:00) Malaysia (MYT)</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10.5px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wide ml-0.5">Preferred Date</label>
              <input
                type="date"
                name="preferred_date"
                required
                className="w-full px-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-xs sm:text-sm text-gray-800 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1">
              <label className="text-[10.5px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wide ml-0.5">Preferred Time</label>
              <div className="relative">
                <select
                  name="preferred_time"
                  required
                  className="w-full px-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-xs sm:text-sm text-gray-800 font-medium appearance-none cursor-pointer"
                >
                  <option value="">Choose time slot</option>
                  <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                  <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                  <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                  <option value="02:00 PM - 03:00 PM">02:00 PM - 03:00 PM</option>
                  <option value="03:00 PM - 04:00 PM">03:00 PM - 04:00 PM</option>
                  <option value="04:00 PM - 05:00 PM">04:00 PM - 05:00 PM</option>
                </select>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[10.5px] sm:text-[11px] font-bold text-gray-500 uppercase tracking-wide ml-0.5">Message (Optional)</label>
              <input
                type="text"
                name="message"
                placeholder="Write your query (optional)..."
                className="w-full px-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 font-medium"
              />
            </div>
          </div>

          <CaptchaWidget
            captchaQuestion={form.captchaQuestion}
            captchaInput={form.captchaInput}
            setCaptchaInput={form.setCaptchaInput}
            captchaError={form.captchaError}
            setCaptchaError={form.setCaptchaError}
            generateCaptcha={form.generateCaptcha}
            accentColor="green"
          />

          <button
            type="submit"
            disabled={form.loading}
            className={`w-full py-2 sm:py-2.5 px-4 rounded-lg text-white font-bold text-xs sm:text-sm transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-md shadow-green-200 ${
              form.loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 hover:shadow-green-300'
            }`}
          >
            {form.loading ? 'Booking Session...' : 'Book Session Now'}
          </button>
        </form>
      </div>
    </ModalWrapper>
  )
}
