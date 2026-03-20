'use client'

import { useState } from 'react'
import { User, Mail, Phone, Flag, Send, CheckCircle } from 'lucide-react'

const COUNTRIES = ['India', 'Pakistan', 'Bangladesh', 'Nepal', 'Sri Lanka', 'Malaysia', 'Nigeria', 'Middle East', 'Other']
const PHONE_CODES = ['+91', '+60', '+92', '+880', '+977', '+94', '+971']

function createSecurityCheck() {
  const first = Math.floor(Math.random() * 9) + 1
  const second = Math.floor(Math.random() * first)
  return { first, second, answer: first - second }
}

type Props = {
  title?: string
  type?: string
  context?: string | { slug: string; universityName?: string | null }
}

export default function SideInquiryForm({ title = "Get In Touch", context = "", type = "general" }: Props) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneCode: '+91',
    phone: '',
    country: '',
    captcha: '',
    agree: false
  })
  const [securityCheck, setSecurityCheck] = useState(createSecurityCheck)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const set = (k: 'name' | 'email' | 'phoneCode' | 'phone' | 'country' | 'captcha', v: string) =>
    setForm(f => ({ ...f, [k]: v }))
  const setAgree = (v: boolean) => setForm(f => ({ ...f, agree: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const captchaValid = Number(form.captcha) === securityCheck.answer
    if (!form.name || !form.email || !form.phone || !form.country || !form.agree || !captchaValid) {
      if (!captchaValid) {
        setForm((f) => ({ ...f, captcha: '' }))
        setSecurityCheck(createSecurityCheck())
      }
      return
    }
    setStatus('loading')

    try {
      const contextStr = typeof context === 'string' 
        ? context 
        : `${context.universityName || ''} (${context.slug})`

      const params = new URLSearchParams()
      params.append('name', form.name)
      params.append('email', form.email)
      params.append('mobile', `${form.phoneCode}${form.phone}`)
      params.append('nationality', form.country)
      params.append('source', `${type === 'university' ? 'University' : 'Scholarship'} Inquiry - ${contextStr}`)
      params.append('source_path', window.location.href)
      
      const res = await fetch('/api/inquiry/simple-form', { method: 'POST', body: params })
      if (res.ok) setStatus('done')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'done') {
    return (
      <div className="bg-white p-8 rounded-[40px] border border-green-100 shadow-xl text-center space-y-4">
        <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h4 className="text-xl font-black text-gray-900">Request Received!</h4>
        <p className="text-gray-500 text-sm">Our counselor will contact you shortly regarding the details.</p>
        <button onClick={() => setStatus('idle')} className="text-blue-600 font-bold text-xs hover:underline cursor-pointer">Send another inquiry</button>
      </div>
    )
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
                onChange={e => set('name', e.target.value)}
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
                onChange={e => set('email', e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold text-gray-700 placeholder:text-gray-400 placeholder:font-medium shadow-xs"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <select
              required
              value={form.phoneCode}
              onChange={e => set('phoneCode', e.target.value)}
              className="w-24 px-3 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold text-gray-800 shadow-xs appearance-none text-center"
            >
              {PHONE_CODES.map((code) => (
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
                onChange={e => set('phone', e.target.value.replace(/\D/g, ''))}
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
              onChange={e => set('country', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm font-bold text-gray-700 appearance-none shadow-xs"
            >
              <option value="">Select Nationality</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
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
                set('captcha', e.target.value)
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
