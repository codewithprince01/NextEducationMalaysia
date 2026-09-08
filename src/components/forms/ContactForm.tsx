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
    <div className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-200/80 shadow-lg shadow-slate-200/40 transition-all relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Send us a <span className="text-blue-600">Message</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Get personalized advice from our experienced academic counselors
          </p>
        </div>
      </div>

      {/* Success Banner (Dismissible) */}
      {submittedSuccess && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="flex-1 text-xs sm:text-sm">
            <p className="font-bold text-emerald-900">Message Sent Successfully!</p>
            <p className="text-emerald-700 mt-0.5">
              Thank you for contacting Education Malaysia. All your details have been received and our team will get back to you within 24 hours.
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
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Full Name *</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
              <input
                type="text"
                placeholder="e.g. John Doe"
                required
                value={form.name}
                onChange={e => set('name', e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Email Address *</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
              <input
                type="email"
                placeholder="e.g. name@example.com"
                required
                value={form.email}
                onChange={e => set('email', e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Phone Number (with Country Code) *</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
              <input
                type="tel"
                placeholder="e.g. +91 98185 60331"
                required
                value={form.phone}
                onChange={e => set('phone', e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all"
              />
            </div>
          </div>

          {/* Nationality / Country */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Nationality / Country *</label>
            <div className="relative group">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none group-focus-within:text-blue-600 transition-colors" />
              <select
                required
                value={form.country}
                onChange={e => set('country', e.target.value)}
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 transition-all appearance-none cursor-pointer"
              >
                <option value="">Select Your Country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Message Box */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">Your Message / Query *</label>
          <div className="relative group">
            <textarea
              required
              placeholder="Tell us about your preferred course, university, or any specific questions you have..."
              rows={4}
              value={form.message}
              onChange={e => set('message', e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all resize-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-sm sm:text-base transition-all shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Sending Your Message...</span>
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
