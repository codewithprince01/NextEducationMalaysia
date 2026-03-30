'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { X } from 'lucide-react'
import { toast } from 'react-toastify'

type PopupProps = {
  isOpen: boolean
  onClose: () => void
}

type Country = {
  id: number | string
  nicename?: string
  name?: string
  phonecode?: number | string
}

type SelectOption = {
  value: string
  label: string
}

type FormDataState = {
  name: string
  email: string
  countryCode: string
  city: string
  mobile: string
  country: string
  qualification: string
  program: string
  captcha: string
}

const ContactFormPopup = ({ isOpen, onClose }: PopupProps) => {
  const [formData, setFormData] = useState<FormDataState>({
    name: '',
    email: '',
    countryCode: '+91',
    city: '',
    mobile: '',
    country: '',
    qualification: '',
    program: '',
    captcha: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [qualifications, setQualifications] = useState<SelectOption[]>([])
  const [programs, setPrograms] = useState<SelectOption[]>([])
  const [countriesData, setCountriesData] = useState<Country[]>([])
  const [phonecodesData, setPhonecodesData] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [captchaQuestion, setCaptchaQuestion] = useState({
    num1: 0,
    num2: 0,
    answer: 0,
  })

  useEffect(() => {
    const fetchDropdownData = async () => {
      setLoading(true)
      try {
        const [levelsRes, categoriesRes, countriesRes, phonecodesRes] = await Promise.all([
          fetch('/api/v1/levels', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({})),
          fetch('/api/v1/course-categories', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({})),
          fetch('/api/v1/countries', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({})),
          fetch('/api/v1/countries/phonecodes', { cache: 'no-store' }).then((r) => r.json()).catch(() => ({})),
        ])

        if (Array.isArray(levelsRes?.data)) {
          const levelOptions = levelsRes.data.map((level: any) => ({
            value: String(level.level || level.name || level.slug || '').trim(),
            label: String(level.name || level.level || level.slug || '').trim(),
          })).filter((x: SelectOption) => x.value && x.label)
          setQualifications(levelOptions)
        }

        if (Array.isArray(categoriesRes?.data)) {
          const categoryOptions = categoriesRes.data.map((cat: any) => ({
            value: String(cat.slug || cat.name || '').trim(),
            label: String(cat.name || cat.slug || '').trim(),
          })).filter((x: SelectOption) => x.value && x.label)
          setPrograms(categoryOptions)
        }

        if (Array.isArray(countriesRes?.data)) setCountriesData(countriesRes.data)
        if (Array.isArray(phonecodesRes?.data)) setPhonecodesData(phonecodesRes.data)
      } catch (error) {
        console.error('Failed to fetch dropdown data:', error)
        setQualifications([
          { value: 'High School', label: 'High School' },
          { value: '12th Pass', label: '12th Pass' },
          { value: 'Diploma', label: 'Diploma' },
          { value: 'Bachelor', label: 'Bachelor' },
          { value: 'Master', label: 'Master' },
          { value: 'PhD', label: 'PhD' },
        ])
        setPrograms([
          { value: 'Engineering', label: 'Engineering' },
          { value: 'Business', label: 'Business' },
          { value: 'Medicine', label: 'Medicine' },
          { value: 'IT', label: 'IT' },
          { value: 'Arts', label: 'Arts' },
          { value: 'Science', label: 'Science' },
        ])
      } finally {
        setLoading(false)
      }
    }

    if (isOpen) fetchDropdownData()
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      const num1 = Math.floor(Math.random() * 10) + 1
      const num2 = Math.floor(Math.random() * 10) + 1
      setCaptchaQuestion({ num1, num2, answer: num1 + num2 })
      setFormData((prev) => ({ ...prev, captcha: '' }))
      setErrors({})
    }
  }, [isOpen])

  const countryMapping = useMemo(() => {
    const mapping: Record<string, string> = {}
    phonecodesData.forEach((country) => {
      const key = String(country.nicename || country.name || '').trim()
      const code = String(country.phonecode || '').trim()
      if (key && code) {
        mapping[key] = `+${code}`
      }
    })
    return mapping
  }, [phonecodesData])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.country) newErrors.country = 'Please select your country'
    if (!formData.countryCode) newErrors.countryCode = 'Country code is required'

    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required'
    } else if (!/^\d{7,15}$/.test(formData.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = 'Please enter a valid mobile number (7-15 digits)'
    }

    if (!formData.city.trim()) newErrors.city = 'City is required'
    if (!formData.qualification) newErrors.qualification = 'Please select your highest qualification'
    if (!formData.program) newErrors.program = 'Please select a program level'

    if (!formData.captcha.trim()) {
      newErrors.captcha = 'Please answer the security question'
    } else if (parseInt(formData.captcha, 10) !== captchaQuestion.answer) {
      newErrors.captcha = `Incorrect! ${captchaQuestion.num1} + ${captchaQuestion.num2} = ?`
    }

    return newErrors
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target

    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }

    setFormData((prev) => {
      const updates: Partial<FormDataState> = { [name]: value }

      if (name === 'country') {
        if (countryMapping[value]) {
          updates.countryCode = countryMapping[value]
        } else if (value === 'Other') {
          updates.countryCode = ''
        }
      } else if (name === 'countryCode') {
        const matchingCountry = Object.keys(countryMapping).find(
          (key) => countryMapping[key] === value,
        )
        if (matchingCountry) {
          updates.country = matchingCountry
        }
      }

      return { ...prev, ...updates }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const newErrors = validateForm()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Please fix the errors in the form')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        country_code: formData.countryCode.replace('+', ''),
        mobile: formData.mobile,
        nationality: formData.country,
        highest_qualification: formData.qualification,
        interested_course_category: formData.program,
        source_path: typeof window !== 'undefined' ? window.location.href : '/',
      }

      const response = await fetch('/api/v1/inquiry/modal-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json().catch(() => ({}))

      if (response.ok && data?.status) {
        setIsSubmitted(true)
        localStorage.setItem('scholarshipFormSubmitted', 'true')
        toast.success('Application Received! We will contact you soon.')

        setTimeout(() => {
          onClose()
        }, 3000)
      } else if (data?.errors) {
        const backendErrors: Record<string, string> = {}
        Object.entries(data.errors).forEach(([field, messages]) => {
          backendErrors[field] = Array.isArray(messages)
            ? String(messages[0] || '')
            : String(messages || '')
        })
        setErrors(backendErrors)
        toast.error('Please fix the errors below.')
      } else {
        toast.error(data?.message || 'Submission failed.')
      }
    } catch (error: any) {
      console.error('Submission error:', error)
      if (error?.response?.data?.errors) {
        const backendErrors: Record<string, string> = {}
        Object.entries(error.response.data.errors).forEach(([field, messages]) => {
          backendErrors[field] = Array.isArray(messages)
            ? String(messages[0] || '')
            : String(messages || '')
        })
        setErrors(backendErrors)
        toast.error('Please fix the errors below.')
      } else {
        toast.error('Submission failed. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full relative mt-8">
          <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-white px-6 py-2 rounded-xl shadow-lg border-2 border-blue-900">
              <img
                src="/logo.png"
                alt="Education Malaysia"
                width="160"
                height="40"
                className="h-10 w-auto"
              />
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-2 right-2 text-blue-100 hover:text-white cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="bg-blue-900 text-white p-3 pt-8 text-center rounded-t-2xl">
            <p className="text-xl font-bold leading-tight uppercase tracking-wide">
              APPLY TO TOP MALAYSIAN UNIVERSITIES
            </p>
          </div>

          <div className="p-4 sm:p-5">
            {isSubmitted ? (
              <div className="text-center py-8">
                <h4 className="text-2xl font-bold text-green-600 mb-2">
                  Application Received!
                </h4>
                <p className="text-gray-600">
                  Our team will contact you within 24 hours.
                </p>
                <p className="text-sm text-gray-500 mt-4">
                  ( SUBMIT ONCE - NO MORE POPUPS AFTER THAT! )
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none text-gray-700 text-sm ${
                        errors.name
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-gray-300 focus:border-blue-600'
                      }`}
                      placeholder="Full Name"
                    />
                    {errors.name && (
                      <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    )}
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none text-gray-700 text-sm ${
                        errors.email
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-gray-300 focus:border-blue-600'
                      }`}
                      placeholder="Email"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                </div>

                <div>
                  <div className="flex gap-2">
                    <select
                      name="countryCode"
                      aria-label="Country code"
                      value={formData.countryCode}
                      onChange={handleInputChange}
                      disabled={loading}
                      className={`w-24 px-3 py-2 border rounded-lg focus:outline-none text-gray-700 text-sm disabled:bg-gray-100 ${
                        errors.countryCode
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-gray-300 focus:border-blue-600'
                      }`}
                    >
                      <option value="">{loading ? '...' : 'Code'}</option>
                      {!loading &&
                        phonecodesData.map((country) => (
                          <option key={country.id} value={`+${country.phonecode}`}>
                            +{country.phonecode}
                          </option>
                        ))}
                    </select>
                    <input
                      type="text"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className={`flex-1 px-3 py-2 border rounded-lg focus:outline-none text-gray-700 text-sm ${
                        errors.mobile
                          ? 'border-red-500 focus:border-red-600'
                          : 'border-gray-300 focus:border-blue-600'
                      }`}
                      placeholder="Mobile Number"
                    />
                  </div>
                  {(errors.countryCode || errors.mobile) && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.countryCode || errors.mobile}
                    </p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none text-gray-700 text-sm ${
                      errors.city
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-gray-300 focus:border-blue-600'
                    }`}
                    placeholder="City"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <select
                    name="country"
                    aria-label="Country"
                    value={formData.country}
                    onChange={handleInputChange}
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none text-gray-700 text-sm disabled:bg-gray-100 ${
                      errors.country
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-gray-300 focus:border-blue-600'
                    }`}
                  >
                    <option value="">
                      {loading ? 'Loading countries...' : 'Select Country'}
                    </option>
                    {!loading &&
                      countriesData.map((country) => (
                        <option key={country.id} value={country.nicename || country.name || ''}>
                          {country.nicename || country.name || ''}
                        </option>
                      ))}
                  </select>
                  {errors.country && (
                    <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                  )}
                </div>

                <div>
                  <select
                    name="qualification"
                    aria-label="Highest qualification"
                    value={formData.qualification}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none text-gray-700 text-sm ${
                      errors.qualification
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-gray-300 focus:border-blue-600'
                    }`}
                  >
                    <option value="">Select your qualification</option>
                    {qualifications.map((qual) => (
                      <option key={qual.value} value={qual.value}>
                        {qual.label}
                      </option>
                    ))}
                  </select>
                  {errors.qualification && (
                    <p className="text-red-500 text-xs mt-1">{errors.qualification}</p>
                  )}
                </div>

                <div>
                  <select
                    name="program"
                    aria-label="Program level"
                    value={formData.program}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none text-gray-700 text-sm ${
                      errors.program
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-gray-300 focus:border-blue-600'
                    }`}
                  >
                    <option value="">Select a program level</option>
                    {programs.map((prog) => (
                      <option key={prog.value} value={prog.value}>
                        {prog.label}
                      </option>
                    ))}
                  </select>
                  {errors.program && (
                    <p className="text-red-500 text-xs mt-1">{errors.program}</p>
                  )}
                </div>

                <div>
                  <label className="block text-blue-600 font-medium mb-2 text-sm">
                    What is {captchaQuestion.num1} + {captchaQuestion.num2}?
                  </label>
                  <input
                    type="number"
                    name="captcha"
                    value={formData.captcha}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none text-gray-700 text-sm ${
                      errors.captcha
                        ? 'border-red-500 focus:border-red-600'
                        : 'border-gray-300 focus:border-blue-600'
                    }`}
                    placeholder="Your answer"
                  />
                  {errors.captcha && (
                    <p className="text-red-500 text-xs mt-1">{errors.captcha}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-900 text-white py-3 rounded-full font-semibold hover:bg-blue-800 transition-colors disabled:opacity-50 text-sm"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactFormPopup

