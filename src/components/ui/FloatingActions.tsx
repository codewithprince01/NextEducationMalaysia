'use client'

import { useEffect, useState } from 'react'

const WHATSAPP_URL =
  'https://wa.me/60176472057?text=Hello!%20I%20need%20assistance%20regarding%20Education%20Malaysia'

// Inline SVGs to avoid pulling in react-icons/fa and lucide-react bundles
const WhatsAppIcon = () => (
  <svg viewBox="0 0 448 512" fill="currentColor" width="28" height="28">
    <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
  </svg>
)

const ArrowUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20">
    <path d="m18 15-6-6-6 6"/>
  </svg>
)

function WhatsAppButton() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="fixed bottom-60 right-1 z-50 pointer-events-none">
      <div className="absolute inset-0 animate-ping">
        <div className="w-12 h-12 bg-green-400 rounded-full opacity-20" />
      </div>
      <div className="absolute inset-0 animate-pulse">
        <div className="w-12 h-12 bg-green-300 rounded-full opacity-30" />
      </div>

      <a
        href={WHATSAPP_URL}
        className="ed_whatsapp relative block w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white rounded-full shadow-2xl transform transition-all duration-300 hover:scale-110 hover:rotate-12 group pointer-events-auto"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="ed_whatsapp flex items-center justify-center w-full h-full transform transition-transform duration-300 group-hover:scale-110">
          <WhatsAppIcon />
        </div>

        <div className="ed_whatsapp absolute inset-0 rounded-full bg-gradient-to-r from-green-300 to-green-500 opacity-0 group-hover:opacity-30 blur-lg transition-opacity duration-300" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-bounce" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white rounded-full opacity-0 group-hover:opacity-80 transition-opacity duration-300 animate-ping" />
      </a>

      <div
        className={`absolute right-20 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
        }`}
      >
        <div className="bg-gray-800 text-white px-4 py-2 rounded-lg shadow-xl relative whitespace-nowrap text-sm font-medium">
          Need any help? Chat with us!
          <div className="absolute left-full top-1/2 transform -translate-y-1/2 border-l-8 border-l-gray-800 border-t-4 border-b-4 border-t-transparent border-b-transparent" />
        </div>
      </div>
    </div>
  )
}

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => setIsVisible(window.pageYOffset > 200)
    window.addEventListener('scroll', toggleVisibility)
    return () => window.removeEventListener('scroll', toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  if (!isVisible) return null

  return (
    <button
      onClick={scrollToTop}
      className="fixed bottom-6 right-6 z-50 bg-blue-700 hover:bg-blue-800 text-white p-3 rounded-full shadow-md transition-all duration-300"
      aria-label="Scroll to top"
    >
      <ArrowUpIcon />
    </button>
  )
}

export default function FloatingActions() {
  return (
    <>
      <ScrollToTopButton />
      <WhatsAppButton />
    </>
  )
}
