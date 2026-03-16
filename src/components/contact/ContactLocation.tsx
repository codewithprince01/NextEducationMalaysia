'use client'

import { MapPin, Mail, Phone } from 'lucide-react'

interface Location {
  city: string
  address: string
  contact: string
  email: string
}

export default function ContactLocation({ locations }: { locations: Location[] }) {
  return (
    <div className="space-y-4">
      {locations.map((loc, index) => (
        <div
          key={index}
          className="bg-slate-50 p-6 rounded-3xl border border-gray-100 hover:border-blue-200 hover:bg-white transition-all duration-300 group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white text-blue-600 rounded-2xl border border-blue-100 shadow-sm shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-black text-slate-900 mb-1 leading-tight">
                {loc.city}
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed mb-6 font-medium italic">
                {loc.address}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-y-3 gap-x-8 pt-4 border-t border-gray-200/50">
                <a
                  href={`tel:${loc.contact}`}
                  className="flex items-center gap-2 text-[11px] font-black text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-widest group/link"
                >
                  <Phone className="text-blue-500 w-3.5 h-3.5 group-hover/link:scale-110 transition-transform" />
                  {loc.contact}
                </a>
                <a
                  href={`mailto:${loc.email}`}
                  className="flex items-center gap-2 text-[11px] font-black text-slate-600 hover:text-blue-600 transition-colors uppercase tracking-widest group/link"
                >
                  <Mail className="text-blue-500 w-3.5 h-3.5 group-hover/link:scale-110 transition-transform" />
                  {loc.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
