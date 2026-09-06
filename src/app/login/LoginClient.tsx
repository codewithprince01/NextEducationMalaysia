'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaCheckCircle,
  FaBolt,
  FaStar,
} from 'react-icons/fa'
import { useAuth } from '@/context/AuthContext'
import { ModernInput, PasswordInput } from '@/components/auth/AuthFormInputs'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://admin.educationmalaysia.in/api'
const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''

export default function LoginClient() {
  const { login } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<any>({})
  const [touched, setTouched] = useState<any>({})

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required'
    if (!/\S+@\S+\.\S+/.test(email)) return 'Email is invalid'
    return ''
  }

  const validateRequired = (value: string, fieldName: string) => {
    if (!value) return `${fieldName} is required`
    return ''
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })

    if (errors[name]) {
      setErrors({ ...errors, [name]: '' })
    }

    if (touched[name]) {
      validateField(name, value)
    }
  }

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTouched({ ...touched, [name]: true })
    validateField(name, value)
  }

  const validateField = (name: string, value: string) => {
    let error = ''
    if (name === 'email') {
      error = validateEmail(value)
    } else if (name === 'password') {
      error = validateRequired(value, 'Password')
    }
    setErrors((prev: any) => ({ ...prev, [name]: error }))
    return error
  }

  const validateForm = () => {
    const newErrors: any = {}
    newErrors.email = validateEmail(formData.email)
    newErrors.password = validateRequired(formData.password, 'Password')
    setErrors(newErrors)
    setTouched({ email: true, password: true })
    return !Object.values(newErrors).some((error) => error !== '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setLoading(true)

    try {
      const response = await fetch(`${API_BASE}/student/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
        body: JSON.stringify(formData),
      })

      const resData: any = await response.json()
      const responseData = resData.data || resData
      const responseName =
        responseData?.name ||
        responseData?.student?.name ||
        responseData?.student_name ||
        ''

      if (response.ok && responseData.token) {
        if (responseName) localStorage.setItem('student_name', String(responseName).trim())
        login(responseData.token, String(responseData.id), responseData.email, responseName)
        router.push('/student/profile')
      } else if (
        response.ok &&
        (responseData.needs_otp || responseData.otp_required || responseData.id)
      ) {
        if (responseData.id) localStorage.setItem('student_id', String(responseData.id))
        if (responseData.email) localStorage.setItem('student_email', String(responseData.email))
        if (responseName) localStorage.setItem('student_name', String(responseName).trim())
        router.push('/confirmed-email')
      } else {
        setErrors({ form: resData.message || 'Login failed. Please try again.' })
      }
    } catch (error) {
      setErrors({ form: 'Login failed. Please check your connection.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full bg-white font-sans">
      <div className="w-full min-h-[calc(100vh-76px)] flex flex-col lg:flex-row items-stretch border-b border-slate-200/80">
        {/* ── LEFT SIDE: HERO PANEL (IDENTICAL TO SIGNUP) ── */}
        <div className="w-full lg:w-1/2 bg-slate-50/70 flex flex-col justify-between px-6 sm:px-10 lg:px-14 xl:px-18 pt-6 sm:pt-8 lg:pt-10 pb-8 sm:pb-12 text-left border-b lg:border-b-0 lg:border-r border-slate-200/80">
          <div className="max-w-xl w-full">
            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-[36px] xl:text-[40px] font-extrabold text-slate-900 leading-[1.2] tracking-tight">
              Apply to up to{' '}
              <span className="text-[#003893]">5 Malaysian Universities</span>{' '}
              through one application process.
            </h1>

            {/* Subtitle */}
            <p className="text-slate-600 text-sm sm:text-base lg:text-[16.5px] leading-relaxed mt-3.5 mb-7 sm:mb-9 font-normal">
              Receive personalised guidance and, subject to eligibility and document verification, receive your offer letter in as little as{' '}
              <span className="font-bold text-[#003893] underline decoration-blue-300 underline-offset-4">
                7 working days
              </span>
              .
            </p>

            {/* Value Cards with Generous Spacing */}
            <div className="space-y-4 sm:space-y-4.5">
              {/* Point 1 */}
              <div className="flex items-start gap-4 p-4 sm:p-4.5 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 hover:shadow-md transition-all duration-200">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-[#003893] flex items-center justify-center shrink-0 text-xl border border-blue-100 shadow-2xs">
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
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-blue-50 text-[#003893] flex items-center justify-center shrink-0 text-xl border border-blue-100 shadow-2xs">
                  <FaBolt className="text-[#003893] text-xl" />
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

        {/* ── RIGHT SIDE: LOGIN FORM ── */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-6 sm:px-10 lg:px-12 xl:px-16 py-8 sm:py-12 bg-white relative">
          <div className="w-full max-w-[460px]">
            {/* Top Heading */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Welcome Back
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                Please enter your details to sign in to your student account
              </p>
            </div>

            <form className="space-y-4 sm:space-y-4.5" onSubmit={handleSubmit}>
              {errors.form && (
                <div className="bg-red-50 text-red-600 p-3.5 rounded-xl text-xs sm:text-sm font-medium border border-red-100 animate-fade-in">
                  {errors.form}
                </div>
              )}

              <ModernInput
                label="Email Address"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                icon={<FaEnvelope />}
                required
                error={errors.email}
              />

              <div className="space-y-2">
                <PasswordInput
                  label="Password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  icon={<FaLock />}
                  required
                  error={errors.password}
                />

                <div className="flex items-center justify-between pt-1 font-medium text-xs sm:text-sm">
                  <label className="flex items-center gap-2 text-slate-500 cursor-pointer select-none hover:text-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      id="remember"
                      className="w-4 h-4 rounded border-slate-300 text-[#003893] focus:ring-[#003893]/20"
                    />
                    <span>Remember for 30 days</span>
                  </label>
                  <Link
                    href="/account/password/reset"
                    className="text-[#003893] hover:underline font-semibold transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#003893] to-blue-700 hover:from-blue-800 hover:to-blue-900 text-white font-bold py-3 sm:py-3.5 rounded-xl shadow-md hover:shadow-lg shadow-blue-900/15 transition-all transform active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed text-sm sm:text-base cursor-pointer mt-2"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <FaArrowRight className="text-xs" />
                  </>
                )}
              </button>


            </form>

            <p className="text-center text-xs sm:text-sm text-slate-500 mt-6 sm:mt-7">
              Don&apos;t have an account?{' '}
              <Link
                href="/signup"
                className="font-bold text-[#003893] hover:underline"
              >
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
