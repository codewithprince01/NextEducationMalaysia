'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { Quote, User, Globe, Briefcase, Send, Star, ChevronRight } from 'lucide-react'
import Breadcrumb from '@/components/Breadcrumb'

const initialTestimonials = [
  { name: 'HASEEB', role: 'Student', country: 'PAKISTAN', rating: 5, text: 'As a student I am really thankful that I got contacted with them. Their co-operation with students is really impressive and my overall experience is excellent with them.', date: '2 months ago' },
  { name: 'Rohit', role: 'Student', country: 'INDIA', rating: 5, text: 'I am studying accountancy in Malaysia and got a very good help from their Gurgaon office regarding choosing the right course.', date: '1 month ago' },
  { name: 'Aman', role: 'Student', country: 'NEPAL', rating: 4, text: 'They guided me at every step from selecting the university to the visa process. The team is really helpful.', date: '3 weeks ago' },
  { name: 'Siti', role: 'Student', country: 'MALAYSIA', rating: 5, text: 'Very professional and responsive. Their assistance helped me a lot in getting into the course I dreamed of.', date: '1 week ago' },
]

interface Review { name: string; role: string; country: string; rating: number; text: string; date: string }
interface FormData { name: string; email: string; phone: string; role: string; country: string; review: string; rating: number }

export default function WhatPeopleSayClient() {
  const [reviews, setReviews] = useState<Review[]>(initialTestimonials)
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', phone: '', role: 'Student', country: '', review: '', rating: 5 })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleRating = (r: number) => setFormData({ ...formData, rating: r })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone || !formData.country || !formData.review) {
      alert('Please fill all required fields')
      return
    }
    if (formData.phone.length < 10) { alert('Please enter a valid phone number'); return }

    setLoading(true)
    const newReview: Review = { name: formData.name, role: formData.role, country: formData.country, rating: formData.rating, text: formData.review, date: 'Just now' }
    setReviews([newReview, ...reviews])
    setSubmitted(true)
    setFormData({ name: '', email: '', phone: '', role: 'Student', country: '', review: '', rating: 5 })
    setLoading(false)

    try {
      const params = new URLSearchParams()
      params.append('name', formData.name)
      params.append('email', formData.email)
      params.append('mobile', formData.phone)
      params.append('nationality', formData.country)
      params.append('source', `Testimonial - Role: ${formData.role} | Rating: ${formData.rating}/5 | Review: ${formData.review}`)
      params.append('source_path', window.location.href)
      await fetch('/api/inquiry/simple-form', { method: 'POST', body: params })
    } catch (err) { console.error('Sync failed:', err) }
  }

  return (
    <div className="min-h-screen bg-gray-50/50 font-sans">
      <Breadcrumb items={[
        { label: 'Home', href: '/' },
        { label: 'About Us', href: '/resources/about' },
        { label: 'What People Say' }
      ]} />

      {/* Hero Header */}
      <section className="relative py-20 px-4 overflow-hidden bg-gradient-to-br from-blue-900 to-blue-700 text-white">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight uppercase">What People Are Saying</h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Hear directly from our global community of students and parents about their journey with Education Malaysia.
            </p>
          </motion.div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20 pb-20">
        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          <AnimatePresence>
            {reviews.map((review, index) => (
              <motion.div key={index} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.4 }}
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 p-8 flex flex-col justify-between border border-gray-100">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                        {review.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{review.name}</h3>
                        <p className="text-xs text-blue-600 font-semibold uppercase">{review.role}</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center text-blue-600">
                      <Quote size={24} className="opacity-20" />
                    </div>
                  </div>
                  <div className="flex text-yellow-400 mb-4 text-sm">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={16} className={i < (review.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'} />
                    ))}
                  </div>
                  <p className="text-gray-600 leading-relaxed italic mb-6">&quot;{review.text}&quot;</p>
                </div>
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400">🌎</span>
                    <span className="font-medium">{review.country}</span>
                  </div>
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">{review.date}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Submission Form Section */}
        <section className="bg-white rounded-3xl shadow-2xl overflow-hidden md:flex">
          {/* Left Side: Context */}
          <div className="hidden md:flex md:w-1/3 bg-blue-900 text-white p-12 flex-col justify-center relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-6">Share Your Story</h2>
              <p className="text-blue-100 mb-8 leading-relaxed">Your feedback helps us improve and inspires others to pursue their dreams in Malaysia. Let the world know about your experience!</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center"><span className="text-yellow-400">💼</span></div>
                  <div><h4 className="font-semibold">Professional Support</h4><p className="text-sm text-blue-200">Guidance at every step</p></div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center"><span className="text-yellow-400">🌎</span></div>
                  <div><h4 className="font-semibold">Global Community</h4><p className="text-sm text-blue-200">Join students from everywhere</p></div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="p-8 md:p-12 md:w-2/3">
            <h3 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
              Write a Review{' '}
              <span className="text-blue-600 text-sm font-normal bg-blue-50 px-3 py-1 rounded-full">It only takes a minute</span>
            </h3>
            {submitted && <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium">✓ Review submitted successfully!</div>}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="John Doe" className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1 uppercase tracking-wider">Your Role</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <select name="role" value={formData.role} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white appearance-none font-bold uppercase tracking-widest text-xs">
                      <option value="Student">Student</option>
                      <option value="Parent">Parent</option>
                      <option value="Counselor">Counselor</option>
                      <option value="Alumni">Alumni</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1 uppercase tracking-wider">Email Address</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="john@example.com" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white font-bold" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1 uppercase tracking-wider">Phone Number</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white font-bold" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1 uppercase tracking-wider">Country</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-3.5 text-gray-400" size={18} />
                    <select name="country" value={formData.country} onChange={handleChange} className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white appearance-none font-bold uppercase tracking-widest text-xs">
                      <option value="">Select Country</option>
                      {['India','Pakistan','Bangladesh','Nepal','Sri Lanka','Malaysia','Nigeria','Middle East','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1 uppercase tracking-wider">Rating</label>
                  <div className="flex gap-2 pt-2">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button key={s} type="button" onClick={() => handleRating(s)}
                        className={`text-2xl transition-transform hover:scale-110 ${formData.rating >= s ? 'text-yellow-400' : 'text-gray-300'}`}><Star size={24} className={formData.rating >= s ? 'fill-yellow-400 text-yellow-400' : ''} /></button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 ml-1 uppercase tracking-wider">Your Review</label>
                <textarea name="review" rows={4} value={formData.review} onChange={handleChange} placeholder="Share your experience..." className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-gray-50 focus:bg-white resize-none font-medium" />
              </div>
              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white font-black py-5 rounded-2xl shadow-xl hover:shadow-blue-200 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest text-sm">
                {loading ? 'Submitting...' : <>Submit Review <Send size={20} /></>}
              </button>
            </form>
          </div>
        </section>
      </div>
    </div>
  )
}
