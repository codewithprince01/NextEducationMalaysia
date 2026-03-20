'use client'

import React from 'react'
import axios from 'axios'
import ModalWrapper from './ModalWrapper'
import { useFormState } from './useFormState'
import { useFetchFormData } from './useFetchFormData'
import { CommonFields, CaptchaWidget } from './Fields'

const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

function withStorageFallback(url?: string | null) {
  if (!url) return null
  if (!/^https?:\/\//i.test(url)) return url
  try {
    const u = new URL(url)
    const p = u.pathname.replace(/^\/+/, '')
    if (!p || p.startsWith('storage/')) return url
    return `${u.origin}/storage/${p}`
  } catch {
    return url
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

export function FeeStructureForm({ universityId, universityName, universityLogo, isOpen, onClose, onSuccess }: Props) {
  const form = useFormState(isOpen)
  const { phonecode, levels, courseCategories, countriesData } = useFetchFormData()
  const [logoSrc, setLogoSrc] = React.useState<string | null>(universityLogo || null)

  React.useEffect(() => {
    setLogoSrc(universityLogo || null)
  }, [universityLogo])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!form.validateCaptcha()) return

    const fd = new FormData(e.currentTarget)
    form.setLoading(true)

    try {
      await axios.post('/api/v1/inquiry/brochure-request', {
        name: fd.get('firstName'),
        email: fd.get('email'),
        country_code: String(fd.get('countryCode') || '91').replace('+', ''),
        mobile: fd.get('phone'),
        nationality: fd.get('nationality'),
        highest_qualification: fd.get('level'),
        interested_course_category: fd.get('course'),
        university_id: universityId || null,
        requestfor: 'fee_structure',
        source_path: typeof window !== 'undefined' ? window.location.href : '',
      }, {
        headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
      })

      onClose()
      onSuccess?.('Fee Structure sent successfully!')
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
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden p-2 shrink-0">
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
              <span className="text-3xl">PDF</span>
            )}
          </div>
          <h3 className="text-lg md:text-2xl font-bold text-gray-900 leading-snug">
            Download <span className="text-blue-700">{universityName}</span> Fee Structure
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
            courseCategories={courseCategories}
            onNationalityChange={form.handleNationalityChange}
            onCountryCodeChange={form.handleCountryCodeChange}
            accentColor="blue"
          />
          <CaptchaWidget
            captchaQuestion={form.captchaQuestion}
            captchaInput={form.captchaInput}
            setCaptchaInput={form.setCaptchaInput}
            captchaError={form.captchaError}
            setCaptchaError={form.setCaptchaError}
            generateCaptcha={form.generateCaptcha}
            accentColor="blue"
          />

          <div className="pt-1 flex gap-2">
            <button
              type="submit"
              disabled={form.loading}
              className={`w-full py-2.5 sm:py-3 px-4 rounded-lg text-white font-bold text-sm sm:text-base transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-blue-200 ${
                form.loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:shadow-blue-300'
              }`}
            >
              {form.loading ? 'Applying...' : 'Request Fee Structure'}
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 font-semibold text-sm">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </ModalWrapper>
  )
}
