'use client'

import { useEffect, useMemo, useState } from 'react'
import { User, Mail, Phone, Flag, Send } from 'lucide-react'
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
    <div className="w-full max-w-2xl mx-auto">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-[40px] border border-gray-100 shadow-2xl relative overflow-hidden"
      >
        <header className="flex items-center justify-center gap-4 mb-5 pt-2">
          <Send className="text-blue-600 w-12 h-12 -rotate-12 shrink-0" />
          <h2 className="text-4xl font-black text-gray-900 tracking-tight">
            {title}
          </h2>
        </header>

        <div className="space-y-3 relative">
          <div className="space-y-3">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                placeholder="Full Name"
                value={form.name}
                onChange={e => setField('name', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold text-gray-700 placeholder:text-gray-400 placeholder:font-medium shadow-xs"
              />
            </div>

            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                required
                placeholder="Email Address"
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold text-gray-700 placeholder:text-gray-400 placeholder:font-medium shadow-xs"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <select
              required
              value={form.phoneCode}
              onChange={e => {
                setField('phoneCode', e.target.value)
                syncNationalityFromCode(e.target.value)
              }}
              className="w-24 px-3 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold text-gray-800 shadow-xs appearance-none text-center"
            >
              {phoneCodeOptions.map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>

            <div className="relative group flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <Phone className="w-5 h-5" />
              </div>
              <input
                type="tel"
                required
                placeholder="Phone Number"
                value={form.phone}
                onChange={e => void handlePhoneChange(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold text-gray-700 placeholder:text-gray-400 placeholder:font-medium shadow-xs"
              />
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
              <Flag className="w-5 h-5" />
            </div>
            <select
              required
              value={form.country}
              onChange={e => {
                setField('country', e.target.value)
                syncCodeFromNationality(e.target.value)
              }}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold text-gray-700 appearance-none shadow-xs"
            >
              <option value="">Select Nationality</option>
              {countriesData.map((c, idx) => {
                const name = String(c?.name || '').trim()
                if (!name) return null
                return <option key={`${name}-${idx}`} value={name}>{name}</option>
              })}
            </select>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-[22px] bg-linear-to-br from-gray-50 to-white border border-gray-100 shadow-sm">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600/60 whitespace-nowrap">
                Security Check:
              </span>
              <p className="text-lg font-black text-gray-900 tracking-tight whitespace-nowrap">
                {securityCheck.first} <span className="text-blue-500 mx-0.5">-</span> {securityCheck.second}{' '}
                <span className="text-blue-500 mx-0.5">=</span>
              </p>
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
              className="w-full max-w-[110px] px-4 py-2 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-black text-lg text-center text-gray-700 placeholder:text-gray-300 shadow-xs"
            />
          </div>

          <div className="flex items-start gap-3 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
            <input
              type="checkbox"
              id="side-inquiry-agree"
              checked={form.agree}
              onChange={(e) => setAgree(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all cursor-pointer mt-0.5"
            />
            <label
              htmlFor="side-inquiry-agree"
              className="text-xs text-gray-500 leading-relaxed cursor-pointer select-none"
            >
              I agree to the <span className="text-blue-600 font-bold hover:underline">Terms and Privacy Statement.</span>{' '}
              I authorize Education Malaysia to contact me regarding my inquiry.
            </label>
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className={`w-full bg-blue-600 text-white font-black py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all active:scale-[0.98] ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            <span className="flex items-center justify-center gap-2 relative z-10">
              {status === 'loading' ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  Processing...
                </>
              ) : (
                'Submit'
              )}
            </span>
          </button>
        </div>
      </form>
    </div>
  )
}
