'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FaCheckCircle,
  FaBolt,
  FaStar,
  FaArrowRight,
} from 'react-icons/fa'
import { KeyRound, Mail, Clock, RefreshCw, ArrowLeft, ShieldCheck } from 'lucide-react'
import { ModernInput } from '@/components/auth/AuthFormInputs'
import { toast } from 'react-toastify'

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || '/api/v1').replace(/\/$/, '')
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

export default function ConfirmedEmailClient() {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState('')
  const [errorVisible, setErrorVisible] = useState(false)
  const [studentEmail, setStudentEmail] = useState('')
  const [studentName, setStudentName] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const studentId = typeof window !== 'undefined' ? localStorage.getItem('student_id') : null
    const email = typeof window !== 'undefined' ? localStorage.getItem('student_email') : null
    const name = typeof window !== 'undefined' ? localStorage.getItem('student_name') : null
    if (email) setStudentEmail(email)
    if (name) setStudentName(name)

    if (!studentId) {
      setMessage('No registration data found. Please register or log in first.')
      setErrorVisible(true)
    }
  }, [])

  useEffect(() => {
    if (resendCooldown <= 0) return
    const interval = setInterval(() => {
      setResendCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [resendCooldown])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!otp.trim()) {
      setMessage('Please enter the OTP code.')
      setErrorVisible(true)
      return
    }

    setLoading(true)
    setMessage('')
    setErrorVisible(false)

    try {
      const studentId = localStorage.getItem('student_id')
      if (!studentId) {
        setMessage('No student ID found. Please register or log in first.')
        setErrorVisible(true)
        setLoading(false)
        return
      }

      const response = await fetch(`${API_BASE}/student/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
        body: JSON.stringify({ id: studentId, otp: otp.trim() }),
      })

      const resData = await response.json()
      const responseName =
        resData?.data?.name ||
        resData?.data?.student?.name ||
        resData?.data?.student_name ||
        studentName ||
        ''

      if (response.ok && resData?.data?.token) {
        localStorage.setItem('token', resData.data.token)
        if (resData?.data?.id) localStorage.setItem('student_id', String(resData.data.id))
        if (resData?.data?.email) localStorage.setItem('student_email', resData.data.email)
        if (responseName) localStorage.setItem('student_name', String(responseName).trim())
        
        toast.success(resData.message || 'OTP Verified Successfully!')
        setMessage(resData.message || 'OTP Verified Successfully! Redirecting...')
        setErrorVisible(false)

        setTimeout(() => {
          router.push('/student/profile')
          router.refresh()
        }, 1200)
      } else {
        setMessage(resData?.message || 'OTP Verification Failed. Please check the code.')
        setErrorVisible(true)
      }
    } catch (error) {
      console.error('OTP Verification failed:', error)
      setMessage('Network error. Please check your internet connection.')
      setErrorVisible(true)
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCooldown > 0) return

    setResending(true)
    setMessage('')
    setErrorVisible(false)

    try {
      const studentId = localStorage.getItem('student_id')
      if (!studentId) {
        setMessage('No student ID found. Please register first.')
        setErrorVisible(true)
        setResending(false)
        return
      }

      const response = await fetch(`${API_BASE}/student/resend-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
        body: JSON.stringify({ id: studentId }),
      })

      const resData = await response.json()
      if (response.ok) {
        toast.success('New OTP sent to your registered email!')
        setMessage('📩 A fresh OTP code has been sent to your email.')
        setErrorVisible(false)
        setResendCooldown(60)
      } else {
        setMessage(resData?.message || 'Failed to resend OTP. Please try again.')
        setErrorVisible(true)
      }
    } catch (error) {
      console.error('Resend OTP failed:', error)
      setMessage('Failed to resend OTP. Please try again later.')
      setErrorVisible(true)
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="w-full bg-white font-sans">
      <div className="w-full min-h-[calc(100vh-76px)] flex flex-col lg:flex-row items-stretch border-b border-slate-200/80">
        {/* ── LEFT SIDE: HERO PANEL (IDENTICAL TO LOGIN & SIGNUP) ── */}
        <div className="w-full lg:w-1/2 bg-slate-50/70 flex flex-col justify-between px-6 sm:px-10 lg:px-14 xl:px-18 pt-6 sm:pt-8 lg:pt-10 pb-8 sm:pb-12 text-left border-b lg:border-b-0 lg:border-r border-slate-200/80">
          <div className="max-w-xl w-full">
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[36px] xl:text-[40px] font-extrabold text-slate-900 leading-[1.2] tracking-tight">
              Apply to{' '}
              <span className="text-blue-600">Malaysian Universities</span>{' '}
              through one application process.
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-sm sm:text-base lg:text-[16.5px] leading-relaxed mt-3.5 mb-7 sm:mb-9 font-normal">
              Receive personalised guidance and, subject to eligibility and document verification, receive your offer letter in as little as{' '}
              <span className="font-bold text-blue-600 underline decoration-blue-300 underline-offset-4">
                7 working days
              </span>
              .
            </p>

            {/* Value Cards */}
            <div className="space-y-4 sm:space-y-4.5">
              {/* Point 1 */}
              <div className="flex items-start gap-4 p-4 sm:p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-xl border border-blue-100 shadow-2xs">
                  <FaCheckCircle className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-base sm:text-[16.5px] font-bold text-slate-900">
                    5 Universities · 1 Single Form
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                    Apply to multiple institutions without repeating details or paperwork.
                  </p>
                </div>
              </div>

              {/* Point 2 */}
              <div className="flex items-start gap-4 p-4 sm:p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 text-xl border border-blue-100 shadow-2xs">
                  <FaBolt className="text-blue-600 text-xl" />
                </div>
                <div>
                  <h3 className="text-base sm:text-[16.5px] font-bold text-slate-900">
                    Offer Letter in 7 Working Days
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                    Fast-track eligibility check and streamlined direct admissions process.
                  </p>
                </div>
              </div>

              {/* Point 3 */}
              <div className="flex items-start gap-4 p-4 sm:p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-amber-50/70 text-amber-500 flex items-center justify-center shrink-0 text-xl border border-amber-100 shadow-2xs">
                  <FaStar className="text-amber-500 text-xl" />
                </div>
                <div>
                  <h3 className="text-base sm:text-[16.5px] font-bold text-slate-900">
                    100% Free Expert Guidance
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
                    Personalised counselling from course matching to visa approval.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT SIDE: CONFIRM EMAIL FORM PANEL ── */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-10 lg:px-12 xl:px-16 py-8 sm:py-12 bg-white relative">
          <div className="w-full max-w-[460px]">
            {/* Top Icon & Heading */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-xs">
                <ShieldCheck className="w-7 h-7 text-blue-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Confirm Your Email
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                An authentication OTP has been sent to your registered email
              </p>
              {studentEmail && (
                <div className="inline-flex items-center gap-1.5 mt-2.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs font-semibold text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  <span>{studentEmail}</span>
                </div>
              )}
            </div>

            {/* Status Messages */}
            {message && (
              <div
                className={`p-3.5 rounded-xl text-xs sm:text-sm font-medium border mb-4 animate-fade-in ${
                  errorVisible
                    ? 'bg-red-50 text-red-600 border-red-100'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                }`}
              >
                {message}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <ModernInput
                label="Verification Code (OTP)"
                type="text"
                name="otp"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                onBlur={() => {}}
                icon={<KeyRound />}
                required
              />

              {/* Expiry Pill */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-0.5 px-1">
                <span className="flex items-center gap-1.5 text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>Code expires in <strong className="text-slate-700 font-semibold">5 minutes</strong></span>
                </span>
                {resendCooldown > 0 && (
                  <span className="text-slate-400 font-medium">
                    Wait {resendCooldown}s to resend
                  </span>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 sm:py-3.5 rounded-xl shadow-md hover:shadow-lg shadow-blue-500/20 transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base cursor-pointer mt-3"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verify &amp; Continue</span>
                    <FaArrowRight className="text-xs" />
                  </>
                )}
              </button>

              {/* Resend Button */}
              <button
                type="button"
                onClick={handleResend}
                disabled={resending || resendCooldown > 0}
                className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold py-2.5 sm:py-3 rounded-xl transition-all text-xs sm:text-sm disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {resending ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-slate-700 rounded-full animate-spin" />
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                    <span>
                      {resendCooldown > 0
                        ? `Resend Code (${resendCooldown}s)`
                        : 'Resend Verification Code'}
                    </span>
                  </>
                )}
              </button>
            </form>

            {/* Back to Login Footer */}
            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <Link
                href="/login"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-blue-600 hover:underline"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

