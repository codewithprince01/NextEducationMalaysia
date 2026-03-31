'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import { FaWhatsapp } from 'react-icons/fa'

const WHATSAPP_URL =
  'https://wa.me/60176472057?text=Hello!%20I%20need%20assistance%20regarding%20Education%20Malaysia'

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
          <FaWhatsapp
            size={28}
            className="transform transition-all duration-300 group-hover:rotate-12 filter drop-shadow-lg"
          />
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
      <ArrowUp className="text-xl" />
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

