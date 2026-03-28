'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { Globe, Search, MapPin, Phone, Mail, Star, CheckCircle, Shield, TrendingUp, Handshake, Target, FileText, LayoutDashboard, GraduationCap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Breadcrumb from '@/components/Breadcrumb'

const API_KEY = process.env.NEXT_PUBLIC_FRONTEND_API_KEY || ''
const IMAGE_BASE = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://admin.educationmalaysia.in'
const DEFAULT_AVATAR =
  'https://media.istockphoto.com/id/1337144146/vector/default-avatar-profile-icon-vector.jpg?s=612x612&w=0&k=20&c=BIbFwuv7FxTWvh5S3vB6bkT0Qv8Vn8N5Ffseq84ClGI='

type Partner = {
  id: number | string
  name?: string
  email?: string
  phone?: string
  mobile?: string
  contact_number?: string
  company_name?: string
  company?: string
  designation?: string
  company_addrs_country?: string
  company_addrs_city?: string
  territory?: string
  state?: string
  city?: string
  rating?: number
  average_rating?: number
  is_verified?: boolean
  profile_image?: string
  company_logo?: string
  company_logopath?: string
  students_placed?: number
  experience_years?: string | number
}

const extractList = (data: any, fallbackKeys: string[] = []) => {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    for (const key of fallbackKeys) {
      const val = data[key]
      if (Array.isArray(val)) return val
      if (val && typeof val === 'object') {
        const nested = Object.values(val).filter(Array.isArray).flat()
        if (nested.length) return nested
      }
    }
    const vals = Object.values(data).filter(Array.isArray).flat()
    if (vals.length) return vals
  }
  return []
}

const resolveImage = (partner: Partner) => {
  const raw =
    partner.profile_image ||
    partner.company_logo ||
    partner.company_logopath ||
    ''
  if (!raw || !String(raw).trim()) return DEFAULT_AVATAR
  const v = String(raw).trim()
  const base = IMAGE_BASE.replace(/\/+$/, '')

  if (v.startsWith('http://localhost/')) {
    const parsed = v.replace(/^https?:\/\/localhost\/?/i, '').replace(/^\/+/, '')
    if (!parsed) return DEFAULT_AVATAR
    if (parsed.startsWith('storage/')) return `${base}/${parsed}`
    if (parsed.startsWith('uploads/')) return `${base}/storage/${parsed}`
    if (parsed.startsWith('assets/uploadFiles/agent/')) return `${base}/${parsed}`
    return `${base}/storage/${parsed}`
  }

  if (v.startsWith('http://') || v.startsWith('https://')) return v

  const clean = v.replace(/^\/+/, '')
  if (clean.startsWith('storage/')) return `${base}/${clean}`
  if (clean.startsWith('uploads/')) return `${base}/storage/${clean}`
  if (clean.startsWith('assets/uploadFiles/agent/')) return `${base}/${clean}`

  return `${base}/storage/${clean}`
}

const PartnerGridCard = ({ partner }: { partner: Partner }) => {
  const phone = partner.phone || partner.mobile || partner.contact_number || 'Not Available'
  const students = partner.students_placed ?? 0
  const exp = partner.experience_years ?? 'N/A'
  const rating = partner.rating || partner.average_rating || 0
  const isVerified = partner.is_verified === true
  const image = resolveImage(partner)
  const city = partner.city || partner.company_addrs_city || 'Kuala Lumpur'
  const company = partner.company || partner.company_name || 'Education Consultant'

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1 border border-gray-100">
      <div className="relative">
        <img
          src={image}
          alt={partner.name || 'Partner'}
          className="w-full h-48 object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = DEFAULT_AVATAR
          }}
        />
        <div className="absolute top-4 right-4 flex space-x-2">
          {isVerified && (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <CheckCircle className="w-3 h-3 mr-1" /> Verified
            </div>
          )}
          {rating > 0 && (
            <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Star className="w-3 h-3 mr-1 fill-current" /> {rating}
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-1">{partner.name || 'Partner'}</h3>
        <p className="text-blue-600 font-medium text-sm">{partner.designation || 'Partner'}</p>
        <p className="text-gray-600 text-sm mb-4">{company}</p>

        <div className="space-y-2 mb-4 text-sm text-gray-600">
          <div className="flex items-center"><MapPin className="w-4 h-4 mr-2 text-gray-400" />{city}</div>
          <div className="flex items-center"><Phone className="w-4 h-4 mr-2 text-gray-400" />{phone}</div>
          <div className="flex items-center"><Mail className="w-4 h-4 mr-2 text-gray-400" />{partner.email || 'Not Available'}</div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4 text-center">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-blue-600">{students}</div>
            <div className="text-xs text-gray-600">Students Placed</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-2xl font-bold text-green-600">{exp}</div>
            <div className="text-xs text-gray-600">Experience</div>
          </div>
        </div>

        <button className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
          Contact Now
        </button>
      </div>
    </div>
  )
}

const PartnerListCard = ({ partner }: { partner: Partner }) => {
  const phone = partner.phone || partner.mobile || partner.contact_number || 'Not Available'
  const rating = partner.rating || partner.average_rating || 0
  const image = resolveImage(partner)

  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden flex items-center p-6">
      <div className="flex-shrink-0 mr-6 relative">
        <img
          src={image}
          alt={partner.name || 'Partner'}
          className="w-24 h-24 rounded-xl object-cover"
          onError={(e) => {
            ;(e.target as HTMLImageElement).src = DEFAULT_AVATAR
          }}
        />
        {partner.is_verified && (
          <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">{partner.name || 'Partner'}</h3>
          <p className="text-blue-600 font-medium text-sm">{partner.designation || 'Partner'}</p>
          <p className="text-gray-600 text-sm">{partner.company_name || partner.company || 'Education Consultant'}</p>
        </div>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{partner.company_addrs_city || partner.city || 'Kuala Lumpur'}</div>
          <div className="flex items-center"><Phone className="w-3 h-3 mr-1" />{phone}</div>
          <div className="flex items-center"><Mail className="w-3 h-3 mr-1" />{partner.email || 'Not Available'}</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{partner.students_placed ?? 0}</div>
          <div className="text-xs text-gray-600">Students Placed</div>
          <div className="flex items-center justify-center mt-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current mr-1" />
            <span className="text-sm font-medium">{rating || 'N/A'}</span>
          </div>
        </div>
        <div className="text-right">
          <button className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
            Contact Now
          </button>
        </div>
      </div>
    </div>
  )
}

export default function PartnersClient() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCountry, setSelectedCountry] = useState('IN')
  const [selectedState, setSelectedState] = useState('All States')
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const [partners, setPartners] = useState<Partner[]>([])
  const [countries, setCountries] = useState<string[]>(['All Countries'])
  const [states, setStates] = useState<string[]>(['All States'])
  const [cities, setCities] = useState<string[]>(['All Cities'])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch('/api/v1/our-partners/countries', {
          headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
          cache: 'no-store',
        })
        const json = await res.json()
        const list = extractList(json, ['countries', 'data'])
        if (list.length) {
          const merged = ['All Countries', ...list]
          setCountries(merged)
          if (merged.includes('IN')) setSelectedCountry('IN')
          else if (!merged.includes(selectedCountry)) setSelectedCountry('All Countries')
        }
      } catch {
        // keep defaults
      }
    }
    init()
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' })
  }, [])

  useEffect(() => {
    const fetchStates = async () => {
      if (selectedCountry === 'All Countries') {
        setStates(['All States'])
        setSelectedState('All States')
        return
      }
      try {
        const res = await fetch(`/api/v1/our-partners/states?country=${encodeURIComponent(selectedCountry)}`, {
          headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
          cache: 'no-store',
        })
        const json = await res.json()
        const list = extractList(json, ['states', 'data'])
        setStates(['All States', ...list])
        setSelectedState('All States')
      } catch {
        setStates(['All States'])
      }
    }
    fetchStates()
  }, [selectedCountry])

  useEffect(() => {
    const fetchCities = async () => {
      if (selectedState === 'All States') {
        setCities(['All Cities'])
        setSelectedCity('All Cities')
        return
      }
      try {
        const res = await fetch(`/api/v1/our-partners/cities?country=${encodeURIComponent(selectedCountry)}&state=${encodeURIComponent(selectedState)}`, {
          headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
          cache: 'no-store',
        })
        const json = await res.json()
        const list = extractList(json, ['cities', 'data'])
        setCities(['All Cities', ...list])
        setSelectedCity('All Cities')
      } catch {
        setCities(['All Cities'])
      }
    }
    fetchCities()
  }, [selectedCountry, selectedState])

  useEffect(() => {
    const id = setTimeout(async () => {
      setLoading(true)
      try {
        const qs = new URLSearchParams()
        if (searchTerm) qs.set('search', searchTerm)
        if (selectedCountry !== 'All Countries') qs.set('country', selectedCountry)
        if (selectedState !== 'All States') qs.set('state', selectedState)
        if (selectedCity !== 'All Cities') qs.set('city', selectedCity)

        const res = await fetch(`/api/v1/our-partners${qs.toString() ? `?${qs.toString()}` : ''}`, {
          headers: API_KEY ? { 'x-api-key': API_KEY } : undefined,
          cache: 'no-store',
        })
        const json = await res.json()
        const flat = extractList(json, ['data', 'partners', 'items']) as Partner[]
        setPartners(flat)
      } catch {
        setPartners([])
      } finally {
        setLoading(false)
      }
    }, 450)

    return () => clearTimeout(id)
  }, [searchTerm, selectedCountry, selectedState, selectedCity])

  const partnersByState = useMemo(() => {
    const grouped = partners.reduce((acc: Record<string, Partner[]>, p) => {
      const key = p.state || p.territory || p.company_addrs_country || 'Other'
      if (!acc[key]) acc[key] = []
      acc[key].push(p)
      return acc
    }, {})
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
  }, [partners])

  const BENEFITS = [
    { icon: Shield, title: 'Authorized University Access', description: 'Direct tie-ups with Malaysian public & private universities', iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
    { icon: TrendingUp, title: 'Transparent Commission Structure', description: 'Clear, course-wise & university-wise commissions', iconBg: 'bg-green-100', iconColor: 'text-green-600' },
    { icon: Handshake, title: 'Dedicated Partner Support', description: 'Application, offer letter, visa & EMGS guidance', iconBg: 'bg-purple-100', iconColor: 'text-purple-600' },
    { icon: Target, title: 'Partner CRM & Dashboard', description: 'Track applications, commissions & student status', iconBg: 'bg-cyan-100', iconColor: 'text-cyan-600' },
    { icon: Globe, title: 'Marketing & Training Support', description: 'University brochures, webinars & regular updates', iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
    { icon: CheckCircle, title: 'High Visa Success Rate', description: 'Structured documentation & compliance process', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
  ]

  const JOIN_STEPS = [
    { step: '01', title: 'Register Online', description: 'Submit your organization and credential details', icon: FileText, gradient: 'from-blue-500 to-cyan-500' },
    { step: '02', title: 'Verification & Approval', description: 'Compliance and background review', icon: Shield, gradient: 'from-purple-500 to-pink-500' },
    { step: '03', title: 'Access Partner Dashboard', description: 'View universities, courses and commissions', icon: LayoutDashboard, gradient: 'from-green-500 to-teal-500' },
    { step: '04', title: 'Start Submitting Students', description: 'Dedicated support from application to enrollment', icon: GraduationCap, gradient: 'from-orange-500 to-red-500' },
  ]

  const CATEGORIES = [
    {
      icon: '🎓',
      title: 'Education Consultants & Overseas Agents',
      description: 'Individual consultants and agencies helping students with study abroad guidance',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: '🏫',
      title: 'Universities & Colleges',
      description: 'Educational institutions seeking international collaboration opportunities',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: '🧑‍💼',
      title: 'Career Counselors & Study Abroad Advisors',
      description: 'Professional counselors guiding students on academic and career paths',
      gradient: 'from-green-500 to-teal-500',
    },
    {
      icon: '🌐',
      title: 'EdTech Platforms & Recruitment Aggregators',
      description: 'Technology platforms connecting students with educational opportunities',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: '🏢',
      title: 'Franchise & Regional Admission Offices',
      description: 'Franchise operations and regional centers for student recruitment',
      gradient: 'from-indigo-500 to-blue-500',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Our Partners' }]} />

      <section className="relative bg-blue-800 text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-blue-900/30" />
        <div className="absolute inset-0 bg-[url('https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1920')] bg-cover bg-center opacity-10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-6">
            <Globe className="w-8 h-8 text-cyan-300 mr-3" />
            <span className="text-cyan-100 text-lg font-medium">Global Network</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">Our Global <span className="text-cyan-300">Partners</span> Network</h1>
          <p className="text-xl text-blue-50 mb-8 max-w-4xl mx-auto leading-relaxed">
            Empowering education consultants, agents, and institutions to connect students with Malaysia&apos;s top universities.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button onClick={() => router.push('/become-a-partner')} className="px-8 py-4 bg-white text-blue-800 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg">
              Become a Partner
            </button>
            <button className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-blue-800 transition-all duration-200">
              Login to Partner Portal
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {[
              { val: '185+', label: 'Student Source Countries' },
              { val: '120+', label: 'Malaysian Universities' },
              { val: '100+', label: 'Active Global Partners' },
              { val: '4.7/5', label: 'Partner Satisfaction Rating' },
            ].map(({ val, label }) => (
              <div key={label} className="text-center">
                <div className="text-4xl font-bold text-cyan-300 mb-2">{val}</div>
                <div className="text-blue-100">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-4">
            Growing Global Network
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            Join a Fast-Growing Network of <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Authorized Education Partners</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Join a fast-growing network of authorized education partners across Asia, Africa, and the Middle East.
            We provide end-to-end support from university access and transparent commissions to visa guidance and partner tools.
          </p>
        </div>
      </section>

      <section className="py-8 bg-gray-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
              <div className="md:col-span-2">
                <label className="text-sm font-bold text-gray-800 mb-3 flex items-center"><Search className="w-4 h-4 mr-2 text-blue-600" /> Search Partners</label>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                  <input
                    type="text"
                    placeholder="Search by name, company, city..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 mb-3 flex items-center"><Globe className="w-4 h-4 mr-2 text-blue-600" /> Country</label>
                <select value={selectedCountry} onChange={(e) => { setSelectedCountry(e.target.value); setSelectedState('All States'); setSelectedCity('All Cities') }} className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white cursor-pointer">
                  {countries.map((opt, i) => <option key={`${opt}-${i}`} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 mb-3 flex items-center"><MapPin className="w-4 h-4 mr-2 text-blue-600" /> State</label>
                <select value={selectedState} onChange={(e) => { setSelectedState(e.target.value); setSelectedCity('All Cities') }} className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white cursor-pointer">
                  {states.map((opt, i) => <option key={`${opt}-${i}`} value={opt}>{opt}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-800 mb-3 flex items-center"><MapPin className="w-4 h-4 mr-2 text-blue-600" /> City</label>
                <select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white cursor-pointer">
                  {cities.map((opt, i) => <option key={`${opt}-${i}`} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="text-gray-600">Showing <span className="font-semibold text-blue-600">{partners.length}</span> partners</div>
              <div className="flex items-center space-x-2">
                <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  <div className="w-4 h-4 grid grid-cols-2 gap-0.5"><div className="bg-current rounded-sm" /><div className="bg-current rounded-sm" /><div className="bg-current rounded-sm" /><div className="bg-current rounded-sm" /></div>
                </button>
                <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                  <div className="w-4 h-4 flex flex-col gap-0.5"><div className="bg-current h-0.5 rounded" /><div className="bg-current h-0.5 rounded" /><div className="bg-current h-0.5 rounded" /></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : partnersByState.length > 0 ? (
            partnersByState.map(([state, statePartners]) => (
              <div key={state} className="mb-16">
                <div className="flex items-center mb-8">
                  <MapPin className="w-6 h-6 text-blue-600 mr-3" />
                  <h2 className="text-3xl font-bold text-gray-900">{state}</h2>
                  <span className="ml-4 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">{statePartners.length} Partners</span>
                </div>
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8' : 'space-y-6'}>
                  {statePartners.filter((p) => p && p.id).map((partner) =>
                    viewMode === 'grid' ? (
                      <PartnerGridCard key={partner.id} partner={partner} />
                    ) : (
                      <PartnerListCard key={partner.id} partner={partner} />
                    )
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No Partners Found</h3>
              <p className="text-gray-500 mt-2">Try adjusting your search criteria or filters.</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-cyan-100 text-cyan-800 rounded-full text-sm font-semibold mb-6">
              <Target className="w-4 h-4 mr-2" /> Partner Categories
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Who Can Partner with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                Education Malaysia
              </span>
              ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you are an individual counselor or a large recruitment organization, our partner program is designed to grow with you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {CATEGORIES.map(({ icon, title, description, gradient }) => (
              <div
                key={title}
                className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div
                  className={`w-20 h-20 bg-gradient-to-r ${gradient} rounded-2xl flex items-center justify-center mb-6 text-4xl group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                >
                  {icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
              <CheckCircle className="w-4 h-4 mr-2" /> Core Benefits
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Why Partner with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Education Malaysia</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Get access to exclusive benefits and comprehensive support to grow your business</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BENEFITS.map(({ icon: Icon, title, description, iconBg, iconColor }) => (
              <div key={title} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <div className={`w-16 h-16 ${iconBg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-8 h-8 ${iconColor}`} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 rounded-full text-sm font-semibold mb-6">
              <Target className="w-4 h-4 mr-2" /> Partnership Process
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              How to Join Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Partner Network</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Simple 4-step process to become an authorized education partner</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            {JOIN_STEPS.map(({ step, title, description, icon: Icon, gradient }, index) => (
              <div key={step} className="relative group h-full">
                <div className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-gray-100 hover:border-blue-300 h-full flex flex-col items-center">
                  <div className={`absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg`}>{step}</div>
                  <div className="flex justify-center mb-4 mt-3 group-hover:scale-110 transition-transform duration-300">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center bg-gradient-to-r ${gradient} shadow-lg shadow-blue-100`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">{title}</h3>
                  <p className="text-gray-600 text-sm text-center leading-relaxed">{description}</p>
                </div>
                {index < 3 && <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10 text-blue-300 text-3xl">→</div>}
              </div>
            ))}
          </div>

          <div className="text-center">
            <button onClick={() => router.push('/become-a-partner')} className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg rounded-2xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl">
              <Handshake className="w-6 h-6 mr-3" /> Apply to Become a Partner
            </button>
          </div>
        </div>
      </section>

      <section className="py-10 bg-gradient-to-r from-blue-800 via-blue-900 to-cyan-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Join Our Network?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Become a trusted partner and help students achieve their dreams of studying in Malaysia.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => router.push('/become-a-partner')} className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105">
              Become a Partner
            </button>
            <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200">
              Contact Our Team
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
