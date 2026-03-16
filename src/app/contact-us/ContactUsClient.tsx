'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building, Home, Layers, User, PhoneCall } from 'lucide-react'
import Link from 'next/link'
import ContactForm from '@/components/forms/ContactForm'
import ContactLocation from '@/components/contact/ContactLocation'
import { LOCATIONS_DATA } from '@/lib/contact-data'

export default function ContactUsClient() {
  const [activeTab, setActiveTab] = useState('INDIA')

  return (
    <div className="bg-blue-50/30 min-h-screen pb-20">
      
      {/* Simplified Header Area */}
      <section className="pt-12 md:pt-16 pb-12 md:pb-20 px-6">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
            Get in <span className="text-blue-600">Touch</span>
          </h1>
          <p className="text-gray-500 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed">
            Have questions about studying in Malaysia? Our experts are here to help you navigate your academic journey with ease.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 mt-0 md:-mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Contact Form */}
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          {/* Info Sidebar */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Offices Section */}
            <div className="bg-white rounded-[32px] p-6 md:p-8 border border-gray-100 shadow-xl shadow-blue-900/5">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600 border border-blue-100">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 leading-none mb-1">Our Offices</h3>
                  <p className="text-xs text-gray-500 font-medium">Visit us across the globe</p>
                </div>
              </div>

              {/* Minimal Tabs */}
              <div className="flex flex-wrap gap-2 mb-6">
                {Object.keys(LOCATIONS_DATA).map((country) => (
                  <button
                    key={country}
                    onClick={() => setActiveTab(country)}
                    className={`px-5 py-2.5 rounded-xl font-bold transition-all duration-300 text-xs tracking-wide border ${
                      activeTab === country
                        ? "bg-blue-600 text-white shadow-md shadow-blue-100 border-blue-600"
                        : "bg-white text-gray-500 hover:bg-gray-50 border-gray-100"
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>

              {/* Location Cards */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ContactLocation locations={LOCATIONS_DATA[activeTab as keyof typeof LOCATIONS_DATA]} />
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Support Card */}
            <div className="bg-blue-600 rounded-[32px] p-8 text-white shadow-xl shadow-blue-600/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700" />
              <div className="relative z-10">
                <h3 className="text-xl font-bold mb-2">Quick Support</h3>
                <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                  Need immediate assistance? Our team is available to help you with your application journey.
                </p>
                
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Home, label: "Home", path: "/" },
                    { icon: Layers, label: "Programs", path: "/courses" },
                    { icon: User, label: "Universities", path: "/universities" },
                  ].map((item, i) => (
                    <Link
                      key={i}
                      href={item.path}
                      className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all text-center border border-white/5"
                    >
                      <item.icon className="w-5 h-5 text-white" />
                      <span className="text-[10px] font-bold uppercase tracking-wider leading-none">
                        {item.label}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
