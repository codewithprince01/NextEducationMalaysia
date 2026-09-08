'use client'

import React from 'react'
import axios from 'axios'
import { FaUser, FaEnvelope, FaMobileAlt, FaBriefcase, FaPen } from 'react-icons/fa'
import { toast } from 'react-toastify'
import ModalWrapper from './ModalWrapper'

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

const PROGRAM_OPTIONS = ['MBA', 'BBA', 'B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBBS', 'Other']

export function ReviewForm({ universityId, universityName, universityLogo, isOpen, onClose, onSuccess }: Props) {
  const [loading, setLoading] = React.useState(false)
  const [rating, setRating] = React.useState(0)
  const [logoSrc, setLogoSrc] = React.useState<string | null>(normalizeLogoUrl(universityLogo))
  const [form, setForm] = React.useState({
    name: '',
    email: '',
    mobile: '',
    program: '',
    passing_year: '',
    review_title: '',
    description: '',
  })

  React.useEffect(() => {
    setLogoSrc(normalizeLogoUrl(universityLogo))
  }, [universityLogo])

  const years = React.useMemo(() => {
    const current = new Date().getFullYear()
    return Array.from({ length: 15 }, (_, i) => String(current - i))
  }, [])

  const setField = (name: string, value: string) => {
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setForm({
      name: '',
      email: '',
      mobile: '',
      program: '',
      passing_year: '',
      review_title: '',
      description: '',
    })
    setRating(0)
  }

  const validate = () => {
    if (!form.name || !form.email || !form.mobile) {
      toast.error('Please fill in Name, Email and Mobile.')
      return false
    }
    if (!form.program || !form.passing_year) {
      toast.error('Please select Program and Passing Year.')
      return false
    }
    if (!rating) {
      toast.error('Please provide your rating.')
      return false
    }
    if (form.review_title.length < 20 || form.review_title.length > 100) {
      toast.error('Review title must be between 20 and 100 characters.')
      return false
    }
    if (form.description.length < 150) {
      toast.error('Review description must be at least 150 characters.')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setLoading(true)
    try {
      await axios.post('/api/v1/add-review', {
        university_id: universityId,
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        program: form.program,
        passing_year: form.passing_year,
        review_title: form.review_title,
        review: form.description,
        description: form.description,
        rating,
      }, {
        headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
      })

      resetForm()
      const msg = 'Review submitted successfully! Pending approval.'
      if (onSuccess) onSuccess(msg)
      else toast.success(msg)
      onClose()
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        'Failed to submit review. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
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
        <div className="mb-2 flex items-center justify-center gap-2.5 py-1 px-3 bg-amber-50/70 border border-amber-200/80 rounded-xl w-fit mx-auto">
          <div className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-white rounded-lg shadow-2xs border border-amber-100 overflow-hidden p-0.5 shrink-0">
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
              <span className="text-[10px] font-bold text-amber-600">REV</span>
            )}
          </div>
          <h3 className="text-xs sm:text-sm font-bold text-gray-900 leading-none">
            Write a Review {universityName ? `· ${universityName}` : ''}
          </h3>
        </div>

        <div className="mb-2.5 bg-blue-50/70 p-2 sm:p-2.5 rounded-xl border border-blue-100 text-center">
          <h4 className="text-xs sm:text-sm font-bold text-blue-600">Your Review of Your Experience Can Help Others</h4>
          <p className="text-[11px] sm:text-xs text-slate-600 mt-0.5">
            Thank you for writing a review for <strong>{universityName || 'this university'}</strong>.
          </p>
        </div>

        <div className="p-3 sm:p-4 bg-white rounded-xl shadow-xs border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 mb-2.5">
            <div className="relative">
              <FaUser className="absolute top-2.5 left-3 text-gray-400 text-xs" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Enter your name *"
                className="w-full pl-8 pr-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 font-medium"
              />
            </div>
            <div className="relative">
              <FaEnvelope className="absolute top-2.5 left-3 text-gray-400 text-xs" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="Enter your email *"
                className="w-full pl-8 pr-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 font-medium"
              />
            </div>
            <div className="relative">
              <FaMobileAlt className="absolute top-2.5 left-3 text-gray-400 text-xs" />
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => setField('mobile', e.target.value)}
                placeholder="Enter your mobile no. *"
                className="w-full pl-8 pr-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 sm:gap-3 mb-2.5">
            <select className="w-full px-3 py-1.5 sm:py-2 border border-gray-200 rounded-lg text-gray-600 bg-gray-100 cursor-not-allowed text-xs sm:text-sm font-medium" disabled>
              <option>{universityName || 'University'}</option>
            </select>

            <select
              value={form.program}
              onChange={(e) => setField('program', e.target.value)}
              className="w-full px-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-xs sm:text-sm font-medium appearance-none cursor-pointer"
            >
              <option value="">Select Program</option>
              {PROGRAM_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>

            <select
              value={form.passing_year}
              onChange={(e) => setField('passing_year', e.target.value)}
              className="w-full px-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-xs sm:text-sm font-medium appearance-none cursor-pointer"
            >
              <option value="">Select Passing Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="relative mb-2.5">
            <FaBriefcase className="absolute top-2.5 left-3 text-gray-400 text-xs" />
            <input
              type="text"
              value={form.review_title}
              onChange={(e) => setField('review_title', e.target.value.slice(0, 100))}
              placeholder="How would you sum up your experience? (Title)"
              className="w-full pl-8 pr-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 font-medium"
            />
            <div className="flex justify-between mt-0.5 ml-1">
              <p className="text-[10px] text-blue-600">(Min 20, Max 100 characters)</p>
              <p className={`text-[10px] ${form.review_title.length > 100 || (form.review_title.length > 0 && form.review_title.length < 20) ? 'text-red-500' : 'text-gray-400'}`}>
                {form.review_title.length} / 100
              </p>
            </div>
          </div>

          <div className="relative mb-2.5">
            <FaPen className="absolute top-2.5 left-3 text-gray-400 text-xs" />
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Share your experience at this institution..."
              className="w-full pl-8 pr-3 py-1.5 sm:py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-xs sm:text-sm text-gray-800 placeholder:text-gray-400 font-medium resize-y"
            />
            <div className="flex justify-between mt-0.5 ml-1">
              <p className="text-[10px] text-blue-600">(Min 150 characters)</p>
              <p className={`text-[10px] ${form.description.length > 0 && form.description.length < 150 ? 'text-red-500' : 'text-gray-400'}`}>
                {form.description.length} chars
              </p>
            </div>
          </div>

          {/* ── SINGLE ROW: RATING ON LEFT, SUBMIT ON RIGHT ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-1 sm:space-x-1.5">
              <span className="text-xs sm:text-sm font-bold text-gray-700 mr-1">Your Rating:</span>
              {[...Array(5)].map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className={`text-2xl sm:text-[26px] cursor-pointer transition-transform hover:scale-115 outline-none leading-none select-none ${
                    i < rating ? 'text-amber-400' : 'text-gray-300'
                  }`}
                  aria-label={`Rate ${i + 1} stars`}
                >
                  ★
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md shadow-blue-500/20 hover:shadow-lg flex items-center justify-center cursor-pointer active:scale-[0.98] ${
                loading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>SUBMITTING...</span>
                </div>
              ) : (
                'SUBMIT YOUR REVIEW'
              )}
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
