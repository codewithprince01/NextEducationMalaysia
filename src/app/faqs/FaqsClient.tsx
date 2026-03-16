'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Search, HelpCircle, GraduationCap, FileCheck, Landmark, Globe } from 'lucide-react'
import Link from 'next/link'

const FAQ_CATEGORIES = [
  { slug: 'general', name: 'General Questions', icon: HelpCircle },
  { slug: 'admission', name: 'Admission & Entry', icon: GraduationCap },
  { slug: 'visa', name: 'Visa & EMGS', icon: FileCheck },
  { slug: 'scholarship', name: 'Scholarships', icon: Landmark },
  { slug: 'living', name: 'Living in Malaysia', icon: Globe },
]

const FAQ_DATA: Record<string, any[]> = {
  general: [
    { question: "Why should I study in Malaysia?", answer: "Malaysia offers high-quality education, affordable living costs, and a multicultural environment. Many international universities have campuses here." },
    { question: "Is English widely spoken in Malaysia?", answer: "Yes, English is widely spoken and is the primary medium of instruction in most private higher education institutions." },
  ],
  admission: [
    { question: "What are the entry requirements?", answer: "Entry requirements vary by course and university. Generally, for a Bachelor's degree, you need high school completion with good grades." },
    { question: "How do I apply for a course?", answer: "You can apply through Education Malaysia by submitting your academic documents, passport copy, and application fee." },
  ],
  visa: [
    { question: "How long does the student visa process take?", answer: "The EMGS visa approval letter (VAL) process typically takes 4-8 weeks. We recommend applying at least 2-3 months before intake." },
    { question: "Can I work while studying?", answer: "International students are allowed to work part-time for up to 20 hours per week during semester breaks or holidays of more than 7 days." },
  ],
  scholarship: [
    { question: "Are there any scholarships available?", answer: "Yes, many Malaysian universities offer merit-based scholarships. Some cover up to 50% or even 100% of tuition fees." },
  ],
  living: [
    { question: "How much is the average living cost?", answer: "The average living cost for a student in Malaysia is around USD $300 - $500 per month, depending on lifestyle and location." },
  ],
}

export default function FaqsClient() {
  const [activeTab, setActiveTab] = useState('general')
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const [search, setSearch] = useState('')

  const currentFaqs = FAQ_DATA[activeTab] || []
  const filteredFaqs = currentFaqs.filter(f => 
    f.question.toLowerCase().includes(search.toLowerCase()) || 
    f.answer.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* Search Header Section */}
      <section className="pt-24 pb-32 px-4 relative overflow-hidden bg-gradient-to-br from-blue-950 to-blue-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]" />
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
              Frequently Asked <span className="text-blue-400">Questions</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed font-medium">
              Find answers to common questions about studying in Malaysia, visas, universities, and more.
            </p>
          </motion.div>

          {/* Search Box */}
          <div className="relative max-w-2xl mx-auto group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search for answers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-8 py-6 bg-white rounded-[2rem] shadow-2xl shadow-blue-900/40 border-none outline-none text-slate-900 font-bold placeholder-slate-300 focus:ring-4 focus:ring-blue-600/20 transition-all text-lg"
            />
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-20 -mt-16 relative z-20">
        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-20 overflow-x-auto pb-4 no-scrollbar">
          {FAQ_CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => {
                setActiveTab(cat.slug)
                setOpenIndex(0)
              }}
              className={`flex items-center gap-3 px-8 py-4 rounded-[2rem] font-black uppercase tracking-widest text-[10px] transition-all whitespace-nowrap ${
                activeTab === cat.slug
                  ? "bg-blue-600 text-white shadow-2xl shadow-blue-600/30 -translate-y-1"
                  : "bg-white text-slate-400 border border-transparent hover:border-blue-100 hover:text-blue-600 shadow-xl shadow-blue-900/5"
              }`}
            >
              <cat.icon className="w-4 h-4" />
              {cat.name}
            </button>
          ))}
        </div>

        {/* Faq Items */}
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab + search}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className={`bg-white rounded-[2.5rem] border transition-all duration-300 overflow-hidden ${
                        openIndex === idx 
                        ? 'border-blue-200 shadow-2xl shadow-blue-900/5 ring-1 ring-blue-50' 
                        : 'border-gray-50 shadow-lg shadow-blue-900/2 hover:border-blue-100'
                      }`}
                    >
                      <button
                        onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                        className="w-full flex items-center justify-between p-8 text-left group"
                      >
                        <span className={`text-lg font-black transition-colors ${openIndex === idx ? 'text-blue-600' : 'text-slate-900 group-hover:text-blue-500'}`}>
                          {faq.question}
                        </span>
                        <div className={`p-3 rounded-2xl transition-all ${openIndex === idx ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600'}`}>
                          {openIndex === idx ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </div>
                      </button>
                      
                      <AnimatePresence initial={false}>
                        {openIndex === idx && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="px-8 pb-8 pt-0">
                                <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-50">
                                    <p className="text-slate-500 font-medium leading-relaxed italic text-[15px]">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))
              ) : (
                <div className="text-center py-20 bg-white rounded-[4rem] border border-gray-100 shadow-xl">
                    <HelpCircle className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                    <h4 className="text-2xl font-black text-slate-900">No matching questions found</h4>
                    <p className="text-slate-400 font-medium mt-2">Try searching with different keywords</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Support CTA */}
        <div className="mt-24 text-center space-y-8">
            <h3 className="text-2xl font-black text-slate-900">Still have more questions?</h3>
            <p className="text-slate-500 font-medium max-w-sm mx-auto">Our experts are just a message away. We are happy to help you with any further queries.</p>
            <Link href="/contact-us" className="inline-flex items-center gap-3 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-blue-600 transition-all shadow-2xl hover:shadow-blue-600/20 active:scale-95">
                Contact Support Now
            </Link>
        </div>
      </div>
    </div>
  )
}
