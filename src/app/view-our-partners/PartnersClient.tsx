'use client'

import React, { useState, useMemo, useEffect } from "react"
import { Globe, Search, MapPin, CheckCircle, Star, Phone, Mail } from "lucide-react"
import Image from "next/image"
import Breadcrumb from '@/components/Breadcrumb'

const DEFAULT_AVATAR = "https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI="

const PartnerHero = ({ onContactTeam }: { onContactTeam: () => void }) => (
  <section className="relative bg-blue-800 text-white py-24 overflow-hidden">
    <div className="absolute inset-0 bg-blue-900/40" />
    <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-10" />
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <div className="flex items-center justify-center mb-8">
          <Globe className="w-8 h-8 text-cyan-300 mr-3" />
          <span className="text-cyan-100 text-lg font-bold tracking-widest uppercase">Global Network</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight">
          Our Global <span className="text-cyan-300">Partners</span> Network
        </h1>
        <p className="text-xl text-blue-50 mb-12 max-w-4xl mx-auto leading-relaxed font-medium">
          Empowering education consultants, agents, and institutions to connect students with Malaysia&apos;s top universities.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <button className="px-10 py-5 bg-white text-blue-800 font-black rounded-2xl hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-2xl shadow-blue-900/20">
            Become a Partner
          </button>
          <button onClick={onContactTeam} className="px-10 py-5 bg-transparent border-2 border-white/50 text-white font-black rounded-2xl hover:bg-white hover:text-blue-800 hover:border-white transition-all duration-300">
            Login to Partner Portal
          </button>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            { val: "185+", label: "Student Source Countries" },
            { val: "120+", label: "Malaysian Universities" },
            { val: "100+", label: "Active Global Partners" },
            { val: "4.7/5", label: "Partner Satisfaction Rating" },
          ].map(({ val, label }) => (
            <div key={label} className="text-center p-6 bg-blue-700/30 rounded-[2rem] border border-blue-500/20 backdrop-blur-sm">
              <div className="text-4xl font-black text-white mb-2 tracking-tight">{val}</div>
              <div className="text-cyan-100 text-sm font-bold uppercase tracking-wider leading-tight">{label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
)

const PartnerCard = ({ partner, viewMode }: { partner: any, viewMode: 'grid' | 'list' }) => {
  if (viewMode === 'list') {
    return (
      <div className="bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden border border-gray-100 p-6 flex items-center gap-8 group">
        <div className="relative shrink-0">
          <Image
            src={DEFAULT_AVATAR}
            alt={partner.name}
            width={96}
            height={96}
            className="w-24 h-24 rounded-2xl object-cover"
          />
          <div className="absolute -top-2 -right-2 bg-green-500 text-white p-1 rounded-full shadow-lg">
            <CheckCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{partner.name}</h3>
              <p className="text-blue-600 font-bold text-sm uppercase tracking-widest">{partner.designation || "Counselor"}</p>
            </div>
            <div className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black text-sm uppercase tracking-widest">
              {partner.city || "Kuala Lumpur"}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-500 font-bold uppercase tracking-widest">
            <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400" /> {partner.state || "Malaysia"}</div>
            <div className="flex items-center gap-2"><Star className="w-4 h-4 text-yellow-500 fill-current" /> 4.9 Rating</div>
            <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Verified</div>
          </div>
        </div>
        <button className="bg-blue-600 text-white px-8 py-4 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          Contact Now
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden border border-gray-100 group">
      <div className="relative h-48 overflow-hidden bg-slate-100">
        <Image
          src={DEFAULT_AVATAR}
          alt={partner.name}
          width={400}
          height={192}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-blue-800 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center shadow-lg">
          <Star className="w-3 h-3 mr-1 fill-blue-800" /> 4.9 Rating
        </div>
      </div>
      <div className="p-8">
        <h3 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors uppercase tracking-tight leading-tight">{partner.name}</h3>
        <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-6">{partner.company || "Education Consultant"}</p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-slate-50 rounded-2xl p-4 text-center group-hover:bg-blue-50 transition-colors">
            <div className="text-xl font-black text-blue-600">50+</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Students Placed</div>
          </div>
          <div className="bg-slate-50 rounded-2xl p-4 text-center group-hover:bg-green-50 transition-colors">
            <div className="text-xl font-black text-green-600">8Yrs</div>
            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Experience</div>
          </div>
        </div>

        <div className="space-y-3 mb-8">
          <div className="flex items-center gap-4 text-gray-600 text-sm font-bold uppercase tracking-widest">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><MapPin size={16} /></div>
            {partner.city || "Kuala Lumpur"}
          </div>
          <div className="flex items-center gap-4 text-gray-600 text-sm font-bold uppercase tracking-widest">
            <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600"><Mail size={16} /></div>
            Verified Contact
          </div>
        </div>

        <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200">
          Contact Counselor
        </button>
      </div>
    </div>
  )
}

export default function PartnersClient() {
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [loading, setLoading] = useState(false)
  const [partners, setPartners] = useState([
    { id: 1, name: "Educational Services", city: "Dhaka", state: "Bangladesh", company: "Global Education Hub" },
    { id: 2, name: "Consultants PLC", city: "Colombo", state: "Sri Lanka", company: "Study Malaysia Experts" },
    { id: 3, name: "Malaysia Study Center", city: "Nairobi", state: "Kenya", company: "Africa Education Gateway" },
    { id: 4, name: "Premium Education", city: "Kano", state: "Nigeria", company: "Global Scholars Network" },
    { id: 5, name: "Aspire Education", city: "Lahore", state: "Pakistan", company: "South Asia Education Group" },
    { id: 6, name: "Future Path", city: "Kathmandu", state: "Nepal", company: "Universal Education" }
  ])

  useEffect(() => {
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const filteredPartners = useMemo(() => {
    return partners.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.state.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm, partners])

  return (
    <div className="min-h-screen bg-slate-50">
      <PartnerHero onContactTeam={() => {}} />

      {/* Intro section matching the old project */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-800 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
            🤝 Growing Global Network
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight tracking-tight max-w-4xl mx-auto">
            Join a Fast-Growing Network of <span className="text-blue-600">Authorized Partners</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed font-medium">
            Join a fast-growing network of authorized education partners across Asia, Africa, and the Middle East. We provide end-to-end support helping you scale student admissions confidently.
          </p>
        </div>
      </section>

      {/* Search & Filter section */}
      <section className="py-12 sticky top-0 z-40 bg-slate-50/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
            <div className="relative w-full max-w-2xl">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
              <input
                type="text"
                placeholder="SEARCH BY NAME, CITY, COUNTRY..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-5 bg-white border-2 border-transparent rounded-[2rem] focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold text-sm uppercase tracking-widest shadow-lg shadow-blue-900/5 placeholder:text-gray-300"
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-2xl shadow-lg border border-gray-100 flex gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <div className="w-5 h-5 grid grid-cols-2 gap-0.5">
                    <div className="bg-current rounded-[1px]" />
                    <div className="bg-current rounded-[1px]" />
                    <div className="bg-current rounded-[1px]" />
                    <div className="bg-current rounded-[1px]" />
                  </div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-xl transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <div className="w-5 h-5 flex flex-col gap-1 items-center justify-center">
                    <div className="bg-current h-1 w-full rounded-[1px]" />
                    <div className="bg-current h-1 w-full rounded-[1px]" />
                    <div className="bg-current h-1 w-full rounded-[1px]" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <MapPin size={24} />
            </div>
            <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tight">Active Partners</h2>
            <div className="h-0.5 flex-1 bg-blue-100" />
            <span className="px-6 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-widest">
              {filteredPartners.length} Results
            </span>
          </div>

          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10" : "space-y-6"}>
            {filteredPartners.map((partner) => (
              <PartnerCard key={partner.id} partner={partner} viewMode={viewMode} />
            ))}
          </div>

          {filteredPartners.length === 0 && (
            <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-gray-200 shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse text-gray-300">
                <Search size={48} />
              </div>
              <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-4">No Partners Found</h3>
              <p className="text-gray-500 font-bold uppercase tracking-widest">Try adjusting your filters or search term</p>
            </div>
          )}
        </div>
      </section>

      {/* Comparison Sections / Benefits from Partners.jsx */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-3xl rounded-full" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-[10px] font-black uppercase tracking-widest mb-8 border border-blue-500/30">
                Partner Benefits
              </div>
              <h2 className="text-5xl font-black mb-8 leading-tight tracking-tight">
                Why partner with <span className="text-blue-500">Education Malaysia?</span>
              </h2>
              <div className="space-y-6">
                {[
                  "Access to top-tier Malaysian universities",
                  "Transparent commission structure & reporting",
                  "Dedicated regional partner supports",
                  "Marketing materials & digital tools",
                  "Priority student visa guidance"
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center gap-6">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-lg font-bold text-slate-300 tracking-tight">{benefit}</span>
                  </div>
                ))}
              </div>
              <button className="mt-12 px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all shadow-2xl">
                Get Started Today
              </button>
            </div>
            <div className="grid grid-cols-2 gap-6">
               <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm group hover:border-blue-500/50 transition-colors">
                  <div className="text-4xl font-black text-blue-500 mb-4">12K+</div>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400 leading-relaxed">Students processed annually across the network.</p>
               </div>
               <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm mt-8 group hover:border-blue-500/50 transition-colors">
                  <div className="text-4xl font-black text-cyan-500 mb-4">98%</div>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400 leading-relaxed">Partner retention rate based on reliable services.</p>
               </div>
               <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-sm group hover:border-blue-500/50 transition-colors">
                  <div className="text-4xl font-black text-emerald-500 mb-4">24/7</div>
                  <p className="text-sm font-bold uppercase tracking-widest text-slate-400 leading-relaxed">Counselor support and digital application access.</p>
               </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
