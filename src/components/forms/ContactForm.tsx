'use client'

import { useState } from 'react'
import { MessageSquare, User, Mail, Globe, MessageCircle, Send, CheckCircle } from 'lucide-react'

const COUNTRIES = ['India', 'Pakistan', 'Bangladesh', 'Nepal', 'Sri Lanka', 'Malaysia', 'Nigeria', 'Middle East', 'Other']

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.country || !form.message) return
    setStatus('loading')

    try {
      const params = new URLSearchParams()
      params.append('name', form.name)
      params.append('email', form.email)
      params.append('mobile', form.phone)
      params.append('nationality', form.country)
      params.append('source', `Contact Form - ${form.message.substring(0, 50)}...`)
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
      <div className="bg-white rounded-2xl p-8 border border-green-100 shadow-sm text-center space-y-5">
        <div className="w-16 h-16 bg-green-50 rounded-xl flex items-center justify-center mx-auto">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-semibold text-slate-900">Message Sent!</h2>
        <p className="text-slate-600 max-w-sm mx-auto leading-relaxed">Thank you for reaching out. Our experts will get back to you shortly.</p>
        <button onClick={() => setStatus('idle')} className="text-blue-600 font-medium hover:underline pt-2">Send another message</button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-200 shadow-sm transition-all">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3 bg-blue-600 rounded-lg text-white">
          <MessageSquare className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-tight">
            Send us a <span className="text-blue-600">Message</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Expert guidance for your academic journey
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative group">
            <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text" placeholder="Full Name" required
              value={form.name} onChange={e => set('name', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
            />
          </div>
          <div className="relative group">
            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
            <input
              type="email" placeholder="Email Address" required
              value={form.email} onChange={e => set('email', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="relative group">
            <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
            <select
              required value={form.country} onChange={e => set('country', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all appearance-none"
            >
              <option value="">Select Nationality</option>
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="relative group">
            <MessageCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
            <input
              type="tel" placeholder="Phone Number" required
              value={form.phone} onChange={e => set('phone', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-gray-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
            />
          </div>
        </div>

        <div className="relative group">
          <MessageCircle className="absolute left-5 top-6 text-slate-300 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
          <textarea
            required placeholder="How can we help you?" rows={5}
            value={form.message} onChange={e => set('message', e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-gray-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all resize-none"
          />
        </div>

        <button
          type="submit" disabled={status === 'loading'}
          className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {status === 'loading' ? 'Sending Message...' : <><Send className="w-4 h-4" /> Send Message</>}
        </button>
      </form>
    </div>
  )
}
