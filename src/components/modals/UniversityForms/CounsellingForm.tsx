'use client'

import React from 'react'
import axios from 'axios'
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
  const form = useFormState(isOpen)
  const { phonecode, levels, courseCategories, countriesData } = useFetchFormData()
  const [logoSrc, setLogoSrc] = React.useState<string | null>(normalizeLogoUrl(universityLogo))

  React.useEffect(() => {
    setLogoSrc(normalizeLogoUrl(universityLogo))
  }, [universityLogo])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.validateCaptcha()) return

    const fd = new FormData(e.currentTarget)
    form.setLoading(true)

    try {
      await axios.post('/api/v1/inquiry/book-session', {
        name: fd.get('name'),
        email: fd.get('email'),
        country_code: String(fd.get('c_code') || '91').replace('+', ''),
        mobile: fd.get('mobile'),
        nationality: fd.get('nationality'),
        highest_qualification: fd.get('highest_qualification'),
        interested_course_category: fd.get('interested_course_category'),
        university_id: universityId || null,
        requestfor: 'counselling',
        dayslot: fd.get('preferred_date'),
        timeslot: fd.get('preferred_time'),
        time_zone: fd.get('time_zone'),
        message: fd.get('message'),
        source_path: typeof window !== 'undefined' ? window.location.href : '',
      }, {
        headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
      })

      onClose()
      onSuccess?.('Counselling session booked successfully!')
      e.currentTarget.reset()
      form.reset()
    } catch {
      alert('Something went wrong. Please try again.')
    } finally {
      form.setLoading(false)
    }
  }

  return (
    <ModalWrapper open={isOpen} onClose={onClose} wide>
      <div className="w-full px-2">
        <div className="mb-5 px-1 flex flex-row md:flex-col items-center justify-center gap-4 md:gap-3 text-left md:text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl shadow-sm border border-emerald-100 overflow-hidden p-2 shrink-0">
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
              <span className="text-3xl">BOOK</span>
            )}
          </div>
          <h3 className="text-lg md:text-2xl font-bold text-gray-900 leading-snug">
            Book Your <span className="text-emerald-700">Counselling Session</span>
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input type="hidden" name="university" value={universityName || ''} />

          <CommonFields
            nationality={form.nationality}
            countryCode={form.countryCode}
            countriesData={countriesData}
            phonecode={phonecode}
            levels={levels}
            onNationalityChange={form.handleNationalityChange}
            onCountryCodeChange={form.handleCountryCodeChange}
            accentColor="green"
          />
          <CourseCategoryField courseCategories={courseCategories} accentColor="green" />

          <div className="grid md:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide ml-1">Preferred Date</label>
              <input
                type="date"
                name="preferred_date"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-sm text-gray-800 font-medium"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide ml-1">Preferred Time</label>
              <select
                name="preferred_time"
                required
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-sm text-gray-800 font-medium appearance-none"
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
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide ml-1">Time Zone</label>
            <select
              name="time_zone"
              required
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-sm text-gray-800 font-medium appearance-none"
            >
              <option value="">Select your timezone</option>
              <option value="GMT+00:00">(GMT+00:00) London, Dublin, Lisbon</option>
              <option value="GMT-12:00">(GMT-12:00) International Date Line West</option>
              <option value="GMT-11:00">(GMT-11:00) Midway Island, Samoa</option>
              <option value="GMT-10:00">(GMT-10:00) Hawaii</option>
              <option value="GMT-09:00">(GMT-09:00) Alaska</option>
              <option value="GMT-08:00">(GMT-08:00) Pacific Time (US &amp; Canada)</option>
              <option value="GMT-07:00">(GMT-07:00) Mountain Time (US &amp; Canada)</option>
              <option value="GMT-06:00">(GMT-06:00) Central Time (US &amp; Canada)</option>
              <option value="GMT-05:00">(GMT-05:00) Eastern Time (US &amp; Canada)</option>
              <option value="GMT-04:00">(GMT-04:00) Atlantic Time (Canada)</option>
              <option value="GMT-03:30">(GMT-03:30) Newfoundland</option>
              <option value="GMT-03:00">(GMT-03:00) Brasilia, Buenos Aires</option>
              <option value="GMT-02:00">(GMT-02:00) Mid-Atlantic</option>
              <option value="GMT-01:00">(GMT-01:00) Azores, Cape Verde Islands</option>
              <option value="GMT+01:00">(GMT+01:00) Berlin, Paris, Rome</option>
              <option value="GMT+02:00">(GMT+02:00) Cairo, Athens, Helsinki</option>
              <option value="GMT+03:00">(GMT+03:00) Moscow, Kuwait, Riyadh</option>
              <option value="GMT+03:30">(GMT+03:30) Tehran</option>
              <option value="GMT+04:00">(GMT+04:00) Abu Dhabi, Muscat, Baku</option>
              <option value="GMT+04:30">(GMT+04:30) Kabul</option>
              <option value="GMT+05:00">(GMT+05:00) Islamabad, Karachi, Tashkent</option>
              <option value="GMT+05:30">(GMT+05:30) Mumbai, Kolkata, New Delhi</option>
              <option value="GMT+05:45">(GMT+05:45) Kathmandu</option>
              <option value="GMT+06:00">(GMT+06:00) Dhaka, Almaty</option>
              <option value="GMT+06:30">(GMT+06:30) Yangon (Rangoon)</option>
              <option value="GMT+07:00">(GMT+07:00) Bangkok, Hanoi, Jakarta</option>
              <option value="GMT+08:00">(GMT+08:00) Beijing, Hong Kong, Singapore, Kuala Lumpur</option>
              <option value="GMT+09:00">(GMT+09:00) Tokyo, Seoul, Osaka</option>
              <option value="GMT+09:30">(GMT+09:30) Adelaide, Darwin</option>
              <option value="GMT+10:00">(GMT+10:00) Sydney, Melbourne, Brisbane</option>
              <option value="GMT+11:00">(GMT+11:00) Solomon Islands, New Caledonia</option>
              <option value="GMT+12:00">(GMT+12:00) Auckland, Wellington, Fiji</option>
              <option value="GMT+13:00">(GMT+13:00) Nuku'alofa</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide ml-1">Message (Optional)</label>
            <textarea
              name="message"
              rows={3}
              placeholder="Write your query..."
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-green-500/20 focus:border-green-500 transition-all outline-none text-sm text-gray-800 placeholder:text-gray-400 font-medium resize-none"
            />
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
            className={`w-full py-2.5 sm:py-3 px-4 rounded-lg text-white font-bold text-sm sm:text-base transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-green-200 ${
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
