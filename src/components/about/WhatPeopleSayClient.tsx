'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, Quote, Globe, Send, User, Briefcase, Mail, Phone, Plane } from 'lucide-react'

const INITIAL_REVIEWS = [
  { name: "HASEEB", role: "Student", country: "PAKISTAN", rating: 5, text: "As a student I am really thankful that I got contacted with them. Their co-operation with students is really impressive and my overall experience is excellent with them." },
  { name: "Rohit", role: "Student", country: "INDIA", rating: 5, text: "I am studying accountancy in Malaysia and got a very good help from their Gurgaon office regarding choosing the right course." },
  { name: "Aman", role: "Student", country: "NEPAL", rating: 4, text: "They guided me at every step from selecting the university to the visa process. The team is really helpful." },
  { name: "Siti", role: "Student", country: "MALAYSIA", rating: 5, text: "Very professional and responsive. Their assistance helped me a lot in getting into the course I dreamed of." },
]

const COUNTRIES = ['India', 'Pakistan', 'Bangladesh', 'Nepal', 'Sri Lanka', 'Malaysia', 'Nigeria', 'Middle East', 'Other']

export default function WhatPeopleSayClient() {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS)
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'Student', country: '', review: '', rating: 5 })
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.phone || !form.country || !form.review) return
    setStatus('loading')

    // Optimistic UI update which is what the old project did
    setReviews(r => [{ name: form.name, role: form.role, country: form.country, rating: form.rating, text: form.review }, ...r])
    
    try {
      const params = new URLSearchParams()
      params.append('name', form.name)
      params.append('email', form.email)
      params.append('mobile', form.phone)
      params.append('nationality', form.country)
      params.append('source', `Testimonial - Role: ${form.role} | Rating: ${form.rating}/5 | Review: ${form.review}`)
      params.append('source_path', window.location.href)
      
      await fetch('/api/inquiry/simple-form', { method: 'POST', body: params })
      setStatus('done')
    } catch {
      setStatus('done') // Silently succeed as per old project logic
    }
    
    setForm({ name: '', email: '', phone: '', role: 'Student', country: '', review: '', rating: 5 })
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Header matching old project's cubepattern overlay */}
      <section className="relative py-24 px-4 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 border-b border-white/10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
              What People Are <br /><span className="text-blue-400">Saying About Us</span>
            </h1>
            <p className="text-lg md:text-2xl text-blue-100 max-w-2xl mx-auto leading-relaxed font-medium">
              Hear directly from our global community of students and parents about their journey with Education Malaysia.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-[1400px] mx-auto px-4 py-20">
        <div className="flex flex-col gap-24">
          {/* Reviews Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence>
              {reviews.map((review, idx) => (
                <motion.div
                  key={idx}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl shadow-blue-900/5 p-10 flex flex-col hover:-translate-y-2 transition-all group overflow-hidden relative"
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-black text-gray-900 text-lg leading-none mb-1">{review.name}</h3>
                          <p className="text-xs text-blue-500 font-bold uppercase tracking-widest">{review.role}</p>
                        </div>
                      </div>
                      <Quote className="w-10 h-10 text-slate-50 group-hover:text-blue-50 transition-colors" />
                    </div>

                    <div className="flex gap-1 mb-6">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-yellow-400 fill-current' : 'text-slate-100'}`} />
                      ))}
                    </div>

                    <p className="text-slate-600 leading-relaxed italic grow mb-8 text-[15px] font-medium">"{review.text}"</p>

                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-sm text-slate-400 font-bold">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-blue-400" />
                        {review.country}
                      </div>
                      <span className="text-[10px] bg-slate-50 px-3 py-1 rounded-full text-slate-300">verified review</span>
                    </div>
                  </div>
                  
                  {/* Decorative element */}
                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-50/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Submission Form Section */}
          <section className="bg-white rounded-[4rem] shadow-2xl shadow-blue-900/10 overflow-hidden lg:flex border border-gray-100">
            {/* Left Side: Context */}
            <div className="lg:w-1/3 bg-slate-900 text-white p-16 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-blue-600 opacity-10 mix-blend-overlay" />
              <div className="relative z-10 space-y-10">
                <div className="inline-block px-5 py-2 bg-blue-600/20 border border-blue-500/30 rounded-full text-blue-400 font-black text-[10px] uppercase tracking-widest">Feedback matters</div>
                <h2 className="text-5xl font-black mb-6 leading-tight">Share Your <br /><span className="text-blue-400">Story</span></h2>
                <p className="text-slate-400 text-lg leading-relaxed font-medium">
                  Your feedback helps us improve and inspires others to pursue their dreams in Malaysia. Let the world know about your experience!
                </p>
                <div className="space-y-6">
                  <div className="flex items-center gap-5 group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <Briefcase className="w-5 h-5 text-blue-400 group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-sm">Professional Support</h4>
                      <p className="text-xs text-slate-500 font-bold">Guidance at every step</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-5 group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                      <Plane className="w-5 h-5 text-blue-400 group-hover:text-white" />
                    </div>
                    <div>
                      <h4 className="font-black text-white text-sm">Global Community</h4>
                      <p className="text-xs text-slate-500 font-bold">Join students from everywhere</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Form */}
            <div className="lg:w-2/3 p-10 md:p-20">
              <div className="flex items-center gap-4 mb-12">
                <h3 className="text-3xl font-black text-gray-900">Write a Review</h3>
                <span className="text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full border border-blue-100">takes 1 minute</span>
              </div>

              {status === 'done' ? (
                 <div className="py-20 text-center space-y-6">
                    <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                      <Star className="w-10 h-10 text-green-600 fill-current" />
                    </div>
                    <h4 className="text-3xl font-black text-slate-900 tracking-tight">Thank You For Your Voice!</h4>
                    <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed text-lg">Your review has been successfully submitted and made part of our global community.</p>
                    <button onClick={() => setStatus('idle')} className="text-blue-600 font-black text-xs uppercase tracking-widest hover:underline pt-4">Write another review</button>
                 </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                          type="text" placeholder="John Doe" required
                          value={form.name} onChange={e => set('name', e.target.value)}
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Your Role</label>
                      <div className="relative">
                        <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                        <select
                          required value={form.role} onChange={e => set('role', e.target.value)}
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all appearance-none"
                        >
                          {['Student', 'Parent', 'Counselor', 'Alumni'].map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1 text-blue-900 ">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                          type="email" placeholder="john@example.com" required
                          value={form.email} onChange={e => set('email', e.target.value)}
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                        <input
                          type="tel" placeholder="+91 98765 43210" required
                          value={form.phone} onChange={e => set('phone', e.target.value)}
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl text-sm font-bold text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Country</label>
                      <div className="relative">
                        <Globe className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                        <select
                          required value={form.country} onChange={e => set('country', e.target.value)}
                          className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-50 rounded-2xl text-sm font-bold text-slate-900 outline-none focus:ring-2 focus:ring-blue-600/10 transition-all appearance-none"
                        >
                          <option value="">Select Country</option>
                          {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Rating</label>
                      <div className="flex gap-2 pt-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button key={star} type="button" onClick={() => set('rating', star)} className="transition-transform hover:scale-125">
                            <Star className={`w-8 h-8 ${form.rating >= star ? 'text-yellow-400 fill-current' : 'text-slate-100'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-900 uppercase tracking-widest ml-1">Your Review</label>
                    <textarea
                      rows={5} required
                      value={form.review} onChange={e => set('review', e.target.value)}
                      placeholder="Share your experience..."
                      className="w-full p-6 bg-slate-50 border border-slate-50 rounded-[2rem] text-sm font-bold text-slate-900 placeholder-slate-300 focus:ring-2 focus:ring-blue-600/10 outline-none transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit" disabled={status === 'loading'}
                    className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all active:scale-[0.98] shadow-2xl shadow-blue-600/20 disabled:opacity-50 flex items-center justify-center gap-3"
                  >
                    {status === 'loading' ? 'Sending Review...' : <><Send className="w-4 h-4" /> Submit Your Story</>}
                  </button>
                </form>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
