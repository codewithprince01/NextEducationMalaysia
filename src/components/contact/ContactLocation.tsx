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
          className="bg-slate-50 p-5 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-white transition-all duration-200 group"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white text-blue-600 rounded-lg border border-blue-100 shadow-sm shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h4 className="text-base font-semibold text-slate-900 mb-1 leading-tight">
                {loc.city}
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {loc.address}
              </p>

              <div className="flex flex-col sm:flex-row sm:items-center gap-y-3 gap-x-6 pt-3 border-t border-gray-200/60">
                <a
                  href={`tel:${loc.contact}`}
                  className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-blue-600 transition-colors group/link"
                >
                  <Phone className="text-blue-500 w-3.5 h-3.5 group-hover/link:scale-110 transition-transform" />
                  {loc.contact}
                </a>
                <a
                  href={`mailto:${loc.email}`}
                  className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-blue-600 transition-colors group/link"
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
