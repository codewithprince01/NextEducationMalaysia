'use client'

import { useState } from 'react'
import { MessageSquare, User, Mail, Globe, Phone, Send, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { showInquirySuccessToast } from '@/components/common/inquiryToast'

const COUNTRIES = [
  'India',
  'Malaysia',
  'Pakistan',
  'Bangladesh',
  'Nepal',
  'Sri Lanka',
  'Indonesia',
  'Nigeria',
  'Ghana',
  'Egypt',
  'United Arab Emirates',
  'Saudi Arabia',
  'United Kingdom',
  'Other Country'
]

export default function ContactForm() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    message: ''
  })
  const [loading, setLoading] = useState(false)
  const [submittedSuccess, setSubmittedSuccess] = useState(false)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.message.trim()) {
      toast.warning('Please fill in all required fields.')
      return
    }

    setLoading(true)
    setSubmittedSuccess(false)

    try {
      const res = await fetch('/api/v1/inquiry/contact-us', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          mobile: form.phone.trim(),
          nationality: form.country || 'International',
          interested_program: 'Contact Us Inquiry',
          message: form.message.trim(),
          formType: 'Contact Us Form',
          sourceUrl: typeof window !== 'undefined' ? window.location.href : '/contact-us',
          source_path: typeof window !== 'undefined' ? window.location.pathname : '/contact-us',
          source: 'Contact Us Page',
        }),
      })

      if (res.ok) {
        // Reset all fields immediately as requested by user
        setForm({
          name: '',
          email: '',
          phone: '',
          country: '',
          message: ''
        })
        setSubmittedSuccess(true)
        showInquirySuccessToast('Thank you! Your message has been sent successfully. Our education advisors will contact you shortly.')
      } else {
        toast.error('Failed to submit message. Please try again or contact us directly.')
      }
    } catch {
      toast.error('An error occurred. Please check your internet connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-7 md:p-8 border border-slate-200/90 shadow-sm transition-all relative overflow-hidden">
      {/* Decorative top accent gradient */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500" />

      {/* Header matching modern brand aesthetic */}
      <div className="pb-5 mb-6 border-b border-slate-100">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold uppercase tracking-wider mb-2.5">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Quick Inquiry</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Send us a <span className="text-blue-600">Message</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium leading-relaxed">
          Get 100% free personalized counseling & admission assistance.
        </p>
      </div>

      {/* Success Banner (Dismissible) */}
      {submittedSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold text-emerald-900">Message Sent Successfully!</p>
            <p className="text-emerald-700 mt-0.5">
              Thank you for contacting Education Malaysia. Our team will get back to you within 24 hours.
            </p>
          </div>
          <button 
            type="button" 
            onClick={() => setSubmittedSuccess(false)}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Full Name <span className="text-red-500">*</span></label>
          <div className="relative group">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
            <input
              type="text"
              placeholder="e.g. John Doe"
              required
              value={form.name}
              onChange={e => set('name', e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 outline-none transition-all font-medium"
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Email Address <span className="text-red-500">*</span></label>
          <div className="relative group">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
            <input
              type="email"
              placeholder="e.g. name@example.com"
              required
              value={form.email}
              onChange={e => set('email', e.target.value)}
              className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 outline-none transition-all font-medium"
            />
          </div>
        </div>

        {/* Phone & Country Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Phone Number <span className="text-red-500">*</span></label>
            <div className="relative group">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
              <input
                type="tel"
                placeholder="e.g. +91 98185 60331"
                required
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 outline-none transition-all font-medium"
              />
            </div>
          </div>

          {/* Nationality / Country */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">Country <span className="text-red-500">*</span></label>
            <div className="relative group">
              <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
              <select
                required
                value={form.country}
                onChange={e => set('country', e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 transition-all font-medium appearance-none cursor-pointer"
              >
                <option value="">Select Country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Message Box */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">Your Query / Preferred Course <span className="text-red-500">*</span></label>
          <div className="relative group">
            <textarea
              required
              placeholder="Tell us about the courses, university preferences or any queries..."
              rows={3}
              value={form.message}
              onChange={e => set('message', e.target.value)}
              className="w-full p-3.5 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-3 focus:ring-blue-600/10 outline-none transition-all resize-none font-medium"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sending Message...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Send Message</span>
            </>
          )}
        </button>
      </form>
    </div>
  )
}
