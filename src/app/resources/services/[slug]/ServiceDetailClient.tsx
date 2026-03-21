'use client'

import { useEffect, useMemo, useState } from 'react'
import { GraduationCap, MapPin, FileText, Globe, CheckCircle } from 'lucide-react'
import TrendingCourses from '@/components/common/TrendingCourses'
import FeaturedUniversities from '@/components/common/FeaturedUniversities'
import OtherFeatures from '@/components/common/OtherFeatures'
import SideInquiryForm from '@/components/forms/SideInquiryForm'
import { ADMIN_URL } from '@/lib/constants'

type ServiceContent = {
  id?: number | string
  tab_title?: string
  tab_content?: string
}

type Service = {
  id?: number | string
  headline?: string
  page_name?: string
  title?: string
  description?: string
  shortnote?: string
  thumbnail_path?: string
  imgpath?: string
  contents?: ServiceContent[]
}

export default function ServiceDetailClient({ service, slug }: { service: Service; slug: string }) {
  const [activeTab, setActiveTab] = useState(0)
  const [contentTab, setContentTab] = useState<'documents' | 'additional' | 'checklist'>('documents')
  const [showSidebar, setShowSidebar] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [slug])

  const title = service?.headline || service?.page_name || service?.title || 'Service Details'
  const thumb = service?.thumbnail_path || service?.imgpath
  const image = thumb?.startsWith?.('http') ? thumb : thumb ? `${ADMIN_URL}/storage/${String(thumb).replace(/^\/+/, '')}` : null
  const contents = service?.contents || []
  const showEnhancedTabs = contents.length >= 3
  const isDiscoverMalaysia = slug === 'discover-malaysia'
  const heroClass = isDiscoverMalaysia
    ? 'relative bg-gradient-to-br from-blue-700 via-blue-800 to-blue-700 text-white overflow-hidden'
    : 'relative bg-linear-to-r from-blue-600 via-blue-500 to-blue-400 text-white overflow-hidden'
  const editionTextClass = isDiscoverMalaysia ? 'text-blue-100' : 'text-emerald-100'

  const activeContentHtml = useMemo(() => {
    if (!contents.length) return service?.description || service?.shortnote || ''

    if (showEnhancedTabs) {
      if (contentTab === 'documents') return contents[0]?.tab_content || ''
      if (contentTab === 'additional') return contents[1]?.tab_content || ''
      return contents[2]?.tab_content || ''
    }

    return contents[activeTab]?.tab_content || ''
  }, [contents, showEnhancedTabs, contentTab, activeTab, service?.description, service?.shortnote])

  return (
    <>
      <style>{`
        .content-wrapper h1 { font-size: 2rem; font-weight: 700; color: #1e40af; margin-top: 2rem; margin-bottom: 1rem; line-height: 1.2; }
        .content-wrapper h2 { font-size: 1.75rem; font-weight: 600; color: #1e3a8a; margin-top: 1.75rem; margin-bottom: 0.875rem; }
        .content-wrapper h3 { font-size: 1.5rem; font-weight: 600; color: #2563eb; margin-top: 1.5rem; margin-bottom: 0.75rem; }
        .content-wrapper h4 { font-size: 1.25rem; font-weight: 600; color: #3b82f6; margin-top: 1.25rem; margin-bottom: 0.625rem; }
        .content-wrapper p { margin-bottom: 1rem; line-height: 1.75; color: #334155; font-size: 1rem; }
        .content-wrapper ul, .content-wrapper ol { margin-left: 1.5rem; margin-bottom: 1.25rem; margin-top: 0.75rem; }
        .content-wrapper ul li, .content-wrapper ol li { margin-bottom: 0.625rem; line-height: 1.6; color: #475569; }
        .content-wrapper ul { list-style-type: disc; }
        .content-wrapper ol { list-style-type: decimal; }
        .content-wrapper table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .content-wrapper table th { background-color: #3b82f6; color: white; padding: 0.75rem; text-align: left; font-weight: 600; }
        .content-wrapper table td { padding: 0.75rem; border-bottom: 1px solid #e2e8f0; }
        .content-wrapper table tr:hover { background-color: #f1f5f9; }
      `}</style>

      <section className={heroClass}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-20 relative z-10">
          <div className="text-center">
            <div className="flex justify-center mb-4 sm:mb-6">
              <div className="bg-white/15 backdrop-blur-sm p-3 sm:p-4 rounded-2xl border border-white/20">
                <GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16" />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 tracking-tight px-2">{title}</h1>
            <div className="flex items-center justify-center space-x-2 mb-4 sm:mb-6">
              <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
              <p className={`text-base sm:text-lg md:text-xl ${editionTextClass}`}>2025 Edition</p>
            </div>
            {(service?.description || service?.shortnote) && (
              <p className="text-sm sm:text-base md:text-lg text-white/90 max-w-3xl mx-auto leading-relaxed px-4">
                {String(service?.description || service?.shortnote || '').replace(/<[^>]*>?/gm, '').slice(0, 220)}
              </p>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" className="w-full h-6 sm:h-8 md:h-12 fill-white">
            <path d="M0,30 Q360,0 720,30 T1440,30 L1440,60 L0,60 Z"></path>
          </svg>
        </div>
      </section>

      {showEnhancedTabs && (
        <div className="bg-white sticky top-[58px] z-[10] shadow-sm border-b border-gray-200 transition-all">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => setContentTab('documents')}
                className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base ${contentTab === 'documents' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}
              >
                <FileText className="w-4 h-4" />
                <span>Required Documents</span>
              </button>

              <button
                onClick={() => setContentTab('additional')}
                className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base ${contentTab === 'additional' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}
              >
                <Globe className="w-4 h-4" />
                <span>Additional Info</span>
              </button>

              <button
                onClick={() => setContentTab('checklist')}
                className={`flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg font-semibold transition-all text-sm sm:text-base ${contentTab === 'checklist' ? 'bg-emerald-600 text-white shadow-md' : 'bg-gray-100 text-slate-600 hover:bg-gray-200'}`}
              >
                <CheckCircle className="w-4 h-4" />
                <span>Checklist</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="bg-gradient-to-b from-blue-50 to-white py-6 px-4">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => setShowSidebar(!showSidebar)}
            className="md:hidden w-full bg-blue-600 text-white py-3 px-4 rounded-lg mb-4 font-semibold shadow-md hover:bg-blue-700 transition"
          >
            {showSidebar ? 'Close Menu' : 'View Other Services'}
          </button>

          <div className="md:grid md:grid-cols-12 md:gap-6 space-y-6 md:space-y-0">
            {showSidebar && (
              <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setShowSidebar(false)} />
            )}

            <aside
              className={`
                md:col-span-4 fixed md:static top-0 right-0 z-50 md:z-auto
                h-full md:h-auto w-80 md:w-auto bg-white p-4 md:p-0 overflow-y-auto
                shadow-2xl md:shadow-none transition-transform duration-300
                ${showSidebar ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
              `}
            >
              <button
                onClick={() => setShowSidebar(false)}
                className="md:hidden absolute top-4 right-4 text-2xl text-gray-600 hover:text-red-500 z-10"
              >
                ×
              </button>

              <div className="space-y-4 mt-12 md:mt-0">
                <TrendingCourses variant="sidebar" />
                <FeaturedUniversities variant="sidebar" />
                <OtherFeatures />
                <SideInquiryForm title="Get In Touch" context={`service-${slug}`} />
              </div>
            </aside>

            <main className="md:col-span-8">
              <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-blue-100">
                {image && (
                  <img src={image} alt={title} className="w-full h-48 sm:h-60 md:h-80 object-cover rounded-xl mb-6 shadow-md" />
                )}

                {contents.length > 0 && !showEnhancedTabs && (
                  <div className="overflow-x-auto -mx-4 px-4 mb-6">
                    <div className="flex gap-2 min-w-max pb-2">
                      {contents.map((item, index) => (
                        <button
                          key={String(item.id || index)}
                          onClick={() => setActiveTab(index)}
                          className={`px-4 py-2 rounded-full border text-sm font-medium whitespace-nowrap transition-all ${activeTab === index ? 'bg-blue-600 text-white shadow-md transform scale-105' : 'bg-white border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300'}`}
                        >
                          {String(item.tab_title || 'Tab').slice(0, 40)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="content-wrapper" dangerouslySetInnerHTML={{ __html: activeContentHtml }} />
              </div>
            </main>
          </div>

          <div className="mt-12 space-y-12">
            <div className="bg-white rounded-2xl shadow-xl border border-blue-50 overflow-hidden">
              <TrendingCourses variant="grid" />
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-blue-50 overflow-hidden py-10">
              <FeaturedUniversities variant="grid" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

