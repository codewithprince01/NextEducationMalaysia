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
    <div className="bg-gray-50 min-h-screen pb-16">
      
      <section className="pt-10 md:pt-12 pb-8 px-4 md:px-6">
        <div className="max-w-7xl mx-auto text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Get in <span className="text-blue-600">Touch</span>
          </h1>
          <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Have questions about studying in Malaysia? Our experts are here to help you navigate your academic journey with ease.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-7">
            <ContactForm />
          </div>

          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-white rounded-2xl p-6 md:p-7 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600 border border-blue-100">
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 leading-none mb-1">Our Offices</h3>
                  <p className="text-xs text-gray-500">Visit us across the globe</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {Object.keys(LOCATIONS_DATA).map((country) => (
                  <button
                    key={country}
                    onClick={() => setActiveTab(country)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-xs border ${
                      activeTab === country
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-600 hover:bg-gray-50 border-gray-200"
                    }`}
                  >
                    {country}
                  </button>
                ))}
              </div>

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

            <div className="bg-blue-600 rounded-2xl p-6 text-white shadow-sm">
              <div>
                <h3 className="text-lg font-semibold mb-2">Quick Support</h3>
                <p className="text-blue-100 text-sm mb-5 leading-relaxed">
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
                      className="flex flex-col items-center gap-2 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-center border border-white/10"
                    >
                      <item.icon className="w-5 h-5 text-white" />
                      <span className="text-[10px] font-semibold uppercase tracking-wide leading-none">
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
