'use client'

import React from 'react'
import axios from 'axios'
import { FaUser, FaEnvelope, FaMobileAlt, FaBriefcase, FaPen } from 'react-icons/fa'
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
      alert('Please fill in Name, Email and Mobile.')
      return false
    }
    if (!form.program || !form.passing_year) {
      alert('Please select Program and Passing Year.')
      return false
    }
    if (!rating) {
      alert('Please provide your rating.')
      return false
    }
    if (form.review_title.length < 20 || form.review_title.length > 100) {
      alert('Review title must be between 20 and 100 characters.')
      return false
    }
    if (form.description.length < 150) {
      alert('Review description must be at least 150 characters.')
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

      onClose()
      onSuccess?.('Review submitted successfully! Pending approval.')
      resetForm()
    } catch {
      alert('Failed to submit review. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ModalWrapper open={isOpen} onClose={onClose} wide>
      <div className="w-full px-2">
        <div className="mb-4 flex flex-col items-center gap-3 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden p-2 shrink-0">
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
              <span className="text-xl">REV</span>
            )}
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            {universityName ? `${universityName} - ` : ''}Write a Review
          </h3>
        </div>

        <div className="mb-4 bg-gray-100 p-4 rounded-md border">
          <h4 className="text-lg font-bold mb-1 text-blue-500">Your Review of Your Institution Experience Can Help Others</h4>
          <p className="text-sm text-gray-700">
            Thank you for writing a review of your experience at <strong>{universityName || 'this university'}</strong>.
          </p>
        </div>

        <div className="p-4 bg-white rounded-md shadow-sm border">
          <h4 className="text-base font-semibold mb-2">Rate the University -</h4>
          <p className="text-sm text-gray-600 mb-4">
            Your email address will not be published. Required fields are marked <span className="text-red-500">*</span>
          </p>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <FaUser className="absolute top-3 left-3 text-gray-500" />
              <input
                type="text"
                value={form.name}
                onChange={(e) => setField('name', e.target.value)}
                placeholder="Enter your name *"
                className="w-full pl-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm text-gray-800 placeholder:text-gray-500 font-medium"
              />
            </div>
            <div className="relative">
              <FaEnvelope className="absolute top-3 left-3 text-gray-500" />
              <input
                type="email"
                value={form.email}
                onChange={(e) => setField('email', e.target.value)}
                placeholder="Enter your email *"
                className="w-full pl-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm text-gray-800 placeholder:text-gray-500 font-medium"
              />
            </div>
            <div className="relative">
              <FaMobileAlt className="absolute top-3 left-3 text-gray-500" />
              <input
                type="tel"
                value={form.mobile}
                onChange={(e) => setField('mobile', e.target.value)}
                placeholder="Enter your mobile no. *"
                className="w-full pl-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm text-gray-800 placeholder:text-gray-500 font-medium"
              />
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-4">
            <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-gray-600 bg-gray-100 cursor-not-allowed text-sm font-medium" disabled>
              <option>{universityName || 'University'}</option>
            </select>

            <select
              value={form.program}
              onChange={(e) => setField('program', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm font-medium appearance-none"
            >
              <option value="">Select Program</option>
              {PROGRAM_OPTIONS.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>

            <select
              value={form.passing_year}
              onChange={(e) => setField('passing_year', e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm font-medium appearance-none"
            >
              <option value="">Select Passing Year</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div className="relative mb-4">
            <FaBriefcase className="absolute top-3 left-3 text-gray-500" />
            <input
              type="text"
              value={form.review_title}
              onChange={(e) => setField('review_title', e.target.value.slice(0, 100))}
              placeholder="How would you sum up your experience? (Title)"
              className="w-full pl-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm text-gray-800 placeholder:text-gray-500 font-medium"
            />
            <div className="flex justify-between mt-1 ml-1">
              <p className="text-xs text-blue-600">(Min 20, Max 100 characters)</p>
              <p className={`text-xs ${form.review_title.length > 100 || (form.review_title.length > 0 && form.review_title.length < 20) ? 'text-red-500' : 'text-gray-400'}`}>
                {form.review_title.length} / 100
              </p>
            </div>
          </div>

          <div className="relative mb-4">
            <FaPen className="absolute top-3 left-3 text-gray-500" />
            <textarea
              rows={6}
              value={form.description}
              onChange={(e) => setField('description', e.target.value)}
              placeholder="Share your experience at this institution..."
              className="w-full pl-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-sm text-gray-800 placeholder:text-gray-500 font-medium resize-y"
            />
            <div className="flex justify-between mt-1 ml-1">
              <p className="text-xs text-blue-600">(Min 150 characters)</p>
              <p className={`text-xs ${form.description.length > 0 && form.description.length < 150 ? 'text-red-500' : 'text-gray-400'}`}>
                {form.description.length} chars
              </p>
            </div>
          </div>

          <div className="flex items-center mb-6 space-x-2">
            <span className="font-semibold mr-2">Your Rating:</span>
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                onClick={() => setRating(i + 1)}
                className={`text-2xl cursor-pointer transition-transform hover:scale-110 ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}
              >
                  ★
              </span>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold transition-all flex items-center justify-center min-w-[180px] ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'SUBMITTING...' : 'SUBMIT YOUR REVIEW'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-2 rounded font-semibold"
            >
              CANCEL
            </button>
          </div>
        </div>
      </div>
    </ModalWrapper>
  )
}
