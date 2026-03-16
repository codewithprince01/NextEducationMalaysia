'use client'

import { useState } from 'react'
import { User, Mail, Phone, Globe, Send, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const COUNTRIES = ['India', 'Pakistan', 'Bangladesh', 'Nepal', 'Sri Lanka', 'Malaysia', 'Nigeria', 'Middle East', 'Other']

type Props = {
  title?: string
  type?: string
  context?: string | { slug: string; universityName?: string | null }
}

export default function SideInquiryForm({ title = "Enquire Now", context = "", type = "general" }: Props) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.country) return
    setStatus('loading')

    try {
      const contextStr = typeof context === 'string' 
        ? context 
        : `${context.universityName || ''} (${context.slug})`

      const params = new URLSearchParams()
      params.append('name', form.name)
      params.append('email', form.email)
      params.append('mobile', form.phone)
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
      <div className="bg-white p-8 rounded-[2rem] border border-green-100 shadow-xl text-center space-y-4">
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
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-2xl shadow-blue-900/5 relative overflow-hidden">
      <div className="relative z-10">
        <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
          <Send className="w-6 h-6 text-blue-600 -rotate-12" />
          {title}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text" placeholder="Full Name" required
              value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-gray-50 rounded-2xl text-sm font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-inter"
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="email" placeholder="Email Address" required
              value={form.email} onChange={e => set('email', e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-gray-50 rounded-2xl text-sm font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-inter"
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="tel" placeholder="Phone Number" required
              value={form.phone} onChange={e => set('phone', e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-gray-50 rounded-2xl text-sm font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all font-inter"
            />
          </div>

          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              required value={form.country} onChange={e => set('country', e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-gray-50 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none font-inter"
            >
              <option value="">Select Nationality</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button
            type="submit" disabled={status === 'loading'}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
          >
            {status === 'loading' ? 'Processing...' : 'Submit Inquiry'}
          </button>

          <p className="text-[10px] text-gray-400 text-center leading-relaxed font-bold">
            By submitting, you agree to our <Link href="/privacy-policy" className="text-blue-500 underline">Terms and Privacy Policy</Link>.
          </p>
        </form>
      </div>
      
      {/* Decorative Blobs */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-50 rounded-full blur-3xl opacity-50" />
    </div>
  )
}
