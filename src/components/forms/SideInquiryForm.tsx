'use client'

import { useEffect, useMemo, useState } from 'react'
import { User, Mail, Phone, Flag, Send, ChevronDown, ShieldCheck } from 'lucide-react'
import { toast } from 'react-toastify'

type CountryRow = {
  id?: number | string
  name?: string
  phonecode?: string | number
}

function createSecurityCheck() {
  const first = Math.floor(Math.random() * 10) + 5
  const second = Math.floor(Math.random() * 5)
  return { first, second, answer: first - second }
}
const INITIAL_SECURITY_CHECK = { first: 10, second: 3, answer: 7 }

type Props = {
  title?: string
  type?: string
  context?: string | { slug: string; universityName?: string | null }
}

export default function SideInquiryForm({ title = 'Get In Touch', context = '', type = 'general' }: Props) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneCode: '+91',
    phone: '',
    country: '',
    captcha: '',
    agree: false
  })
  const [securityCheck, setSecurityCheck] = useState(INITIAL_SECURITY_CHECK)
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [countriesData, setCountriesData] = useState<CountryRow[]>([])
  const [phoneValid, setPhoneValid] = useState(false)

  const phoneCodeOptions = useMemo(() => {
    const s = new Set<string>()
    for (const c of countriesData) {
      const code = String(c.phonecode || '').trim()
      if (!code) continue
      s.add(`+${code.replace(/^\+/, '')}`)
    }
    if (s.size === 0) s.add('+91')
    return Array.from(s).sort((a, b) => a.localeCompare(b))
  }, [countriesData])

  useEffect(() => {
    let active = true
    const fetchCountries = async () => {
      try {
        const [resCountries, resPhoneCodes] = await Promise.all([
          fetch('/api/v1/countries'),
          fetch('/api/v1/countries/phonecodes')
        ])

        const countriesJson = await resCountries.json().catch(() => ({}))
        const phonecodesJson = await resPhoneCodes.json().catch(() => ({}))
        const countries = Array.isArray(countriesJson?.data)
          ? countriesJson.data
          : Array.isArray(countriesJson)
            ? countriesJson
            : []
        const phonecodes = Array.isArray(phonecodesJson?.data)
          ? phonecodesJson.data
          : Array.isArray(phonecodesJson)
            ? phonecodesJson
            : []

        // Prefer country records with both name+phonecode. Fallback to whatever is available.
        const merged: CountryRow[] =
          countries.length > 0
            ? countries
            : phonecodes

        if (!active) return
        setCountriesData(merged)
      } catch {
        if (!active) return
        setCountriesData([])
      }
    }
    fetchCountries()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    setSecurityCheck(createSecurityCheck())
  }, [])

  const syncNationalityFromCode = (code: string) => {
    const numericCode = code.replace(/^\+/, '')
    const match = countriesData.find((c) => String(c.phonecode || '') === numericCode)
    if (match?.name) {
      setForm((f) => ({ ...f, country: String(match.name) }))
    }
  }

  const syncCodeFromNationality = (name: string) => {
    const match = countriesData.find((c) => String(c.name || '') === name)
    if (match?.phonecode) {
      const code = `+${String(match.phonecode).replace(/^\+/, '')}`
      setForm((f) => ({ ...f, phoneCode: code }))
    }
  }

  const setField = (k: 'name' | 'email' | 'phoneCode' | 'phone' | 'country' | 'captcha', v: string) => {
    setForm(f => ({ ...f, [k]: v }))
  }

  const setAgree = (v: boolean) => setForm(f => ({ ...f, agree: v }))

  const handlePhoneChange = async (value: string) => {
    const numeric = value.replace(/\D/g, '')
    setForm((f) => ({ ...f, phone: numeric }))
    if (numeric.length < 6) {
      setPhoneValid(false)
      return
    }
    try {
      const { isValidPhoneNumber } = await import('libphonenumber-js')
      const full = `${form.phoneCode}${numeric}`
      setPhoneValid(isValidPhoneNumber(full))
    } catch {
      // If validator is unavailable, keep basic length validation.
      setPhoneValid(numeric.length >= 7)
    }
  }

  const getSource = () => {
    if (type === 'university') return 'Education Malaysia - University Profile Page'
    if (type === 'exam') return 'Education Malaysia - Exam Detail Page'
    if (type === 'contact') return 'Education Malaysia - Contact Us Page'
    const contextStr = typeof context === 'string' ? context : `${context.universityName || ''} (${context.slug})`
    return contextStr ? `Education Malaysia - General Inquiry - ${contextStr}` : 'Education Malaysia - General Inquiry'
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const captchaValid = Number(form.captcha) === securityCheck.answer

    if (!captchaValid) {
      toast.error('Captcha is incorrect.')
      setForm((f) => ({ ...f, captcha: '' }))
      setSecurityCheck(createSecurityCheck())
      return
    }
    if (!form.agree) {
      toast.error('You must agree to the Terms.')
      return
    }
    if (!form.name || !form.email || !form.phone || !form.country) {
      toast.error('Please fill all required fields.')
      return
    }
    if (!phoneValid && form.phone.length >= 7) {
      toast.error('Please enter a valid phone number.')
      return
    }

    setStatus('loading')
    try {
      const res = await fetch('/api/v1/inquiry/simple-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          country_code: form.phoneCode.replace(/^\+/, ''),
          mobile: form.phone,
          nationality: form.country,
          source: getSource(),
          formType: title || 'Get In Touch Form',
          sourceUrl: window.location.href,
          source_path: window.location.href
        })
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(json?.message || 'Failed to submit. Please try again.')
        setStatus('error')
        return
      }

      toast.success('Form submitted successfully!')
      setForm({
        name: '',
        email: '',
        phoneCode: form.phoneCode || '+91',
        phone: '',
        country: '',
        captcha: '',
        agree: false
      })
      setSecurityCheck(createSecurityCheck())
      setPhoneValid(false)
      setStatus('idle')
    } catch {
      toast.error('Failed to submit. Please try again.')
      setStatus('error')
    } finally {
      setStatus((prev) => (prev === 'error' ? 'error' : 'idle'))
    }
  }

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden"
      >
        {/* Header matching sidebar style */}
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-1 h-5 bg-blue-600 rounded-full shrink-0" />
            <h2 className="!text-base sm:!text-lg !font-semibold text-slate-800 tracking-normal whitespace-nowrap">
              {title}
            </h2>
          </div>
          <span className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Admissions
          </span>
        </div>

        <p className="text-xs text-slate-500 mb-4 leading-relaxed">
          Need expert admission guidance? Fill in your details below and our advisors will connect with you.
        </p>

        <div className="space-y-3">
          {/* Full Name */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <User className="w-4 h-4" />
            </div>
            <input
              type="text"
              required
              placeholder="Full Name"
              value={form.name}
              onChange={e => setField('name', e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Email Address */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              placeholder="Email Address"
              value={form.email}
              onChange={e => setField('email', e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Phone Code + Phone Number */}
          <div className="flex gap-2">
            <select
              required
              value={form.phoneCode}
              onChange={e => {
                setField('phoneCode', e.target.value)
                syncNationalityFromCode(e.target.value)
              }}
              className="w-24 px-2 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-bold text-slate-800 text-center cursor-pointer"
            >
              {phoneCodeOptions.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>

            <div className="relative group flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                required
                placeholder="Phone Number"
                value={form.phone}
                onChange={e => void handlePhoneChange(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>
          </div>

          {/* Nationality Dropdown */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Flag className="w-4 h-4" />
            </div>
            <select
              required
              value={form.country}
              onChange={e => {
                setField('country', e.target.value)
                syncCodeFromNationality(e.target.value)
              }}
              className="w-full pl-10 pr-8 py-2.5 bg-slate-50/50 hover:bg-white focus:bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none transition-all text-xs sm:text-sm font-medium text-slate-800 appearance-none cursor-pointer"
            >
              <option value="">Select Nationality</option>
              {countriesData.map((c, idx) => {
                const name = String(c?.name || '').trim()
                if (!name) return null
                return <option key={`${name}-${idx}`} value={name}>{name}</option>
              })}
            </select>
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>

          {/* Security Check */}
          <div className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-slate-700">
                Security Check: {securityCheck.first} - {securityCheck.second} =
              </span>
            </div>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              required
              placeholder="?"
              value={form.captcha}
              onChange={(e) => {
                if (!/^\d*$/.test(e.target.value)) return
                setField('captcha', e.target.value)
              }}
              className="w-20 px-3 py-1 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 outline-none font-bold text-center text-xs sm:text-sm text-slate-800"
            />
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start gap-2.5 pt-0.5">
            <input
              type="checkbox"
              id="side-inquiry-agree"
              checked={form.agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 transition-all cursor-pointer mt-0.5 shrink-0"
            />
            <label
              htmlFor="side-inquiry-agree"
              className="text-[11px] sm:text-xs text-slate-500 leading-snug cursor-pointer select-none"
            >
              I agree to the <span className="text-blue-600 font-semibold hover:underline">Terms & Privacy</span>. I authorize Education Malaysia to contact me.
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={status === 'loading'}
            className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 sm:py-3 rounded-xl shadow-md shadow-blue-500/20 transition-all active:scale-[0.99] flex items-center justify-center gap-2 text-xs sm:text-sm cursor-pointer ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {status === 'loading' ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>Submit Inquiry</span>
                <Send className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
