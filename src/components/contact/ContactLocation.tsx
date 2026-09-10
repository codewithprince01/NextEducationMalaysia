'use client'

import { useState } from 'react'
import { MapPin, Mail, Phone, Copy, Check, Building2, Navigation } from 'lucide-react'
import { toast } from 'react-toastify'
import type { OfficeLocation } from '@/lib/contact-data'

export default function ContactLocation({ locations }: { locations: OfficeLocation[] }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)

  const handleCopy = (address: string, idx: number) => {
    navigator.clipboard.writeText(address)
    setCopiedIndex(idx)
    toast.success('Address copied to clipboard!')
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  if (!locations || locations.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
        <p className="text-sm font-semibold text-slate-700">No offices found matching your search.</p>
        <p className="text-xs text-slate-400 mt-1">Try selecting another country or clear your search.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {locations.map((loc, index) => {
        const mapQuery = `${loc.city} ${loc.address}`
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`

        return (
          <div
            key={`${loc.city}-${index}`}
            className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-blue-400 transition-all duration-200 group flex flex-col justify-between relative"
          >
            <div>
              {/* Top Bar: City & Country */}
              <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {loc.city}
                  </h3>
                  {loc.country && (
                    <span className="text-xs font-semibold text-slate-500">
                      {loc.country}
                    </span>
                  )}
                </div>
              </div>

              {/* Address */}
              <div className="py-3.5">
                <div className="flex items-start gap-2 text-xs sm:text-[13px] text-slate-700 leading-relaxed min-h-[44px]">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{loc.address}</span>
                </div>
              </div>

              {/* Phone & Email Links */}
              <div className="space-y-2 pb-3.5 border-b border-slate-100">
                <a
                  href={`tel:${loc.contact.replace(/\s+/g, '')}`}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Phone className="w-3 h-3" />
                  </div>
                  <span className="truncate">{loc.contact}</span>
                </a>

                <a
                  href={`mailto:${loc.email.trim()}`}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-slate-50 text-slate-500 flex items-center justify-center shrink-0 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <Mail className="w-3 h-3" />
                  </div>
                  <span className="truncate">{loc.email}</span>
                </a>
              </div>
            </div>

            {/* Action Buttons: Get Directions & Copy */}
            <div className="flex items-center gap-2 pt-3">
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-100 hover:border-blue-600 text-blue-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Get Directions</span>
              </a>
              <button
                type="button"
                onClick={() => handleCopy(loc.address, index)}
                className="py-2 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-medium transition-all cursor-pointer flex items-center gap-1"
                title="Copy address"
              >
                {copiedIndex === index ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] text-emerald-600 font-bold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}



