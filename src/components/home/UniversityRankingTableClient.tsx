'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Trophy, Globe, GraduationCap, ArrowRight, ExternalLink } from 'lucide-react'

interface UniversityRank {
  id: number
  name: string
  uname: string
  qs_rank: string | null
  times_rank: string | null
  qs_asia_rank: string | null
  _count?: {
    programs: number
  }
}

export default function UniversityRankingTableClient() {
  const [rankings, setRankings] = useState<UniversityRank[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch('/api/home')
        const json = await response.json()
        if (json.data?.universityRanks) {
          setRankings(json.data.universityRanks)
        }
      } catch (error) {
        console.error('Error fetching university rankings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRankings()
  }, [])

  if (loading) {
    return <div className="min-h-[400px] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  }

  if (rankings.length === 0) return null

  return (
    <section className="bg-slate-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
           <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Trophy className="w-4 h-4" />
              Academic Excellence
           </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Malaysian University <span className="text-blue-600">Rankings</span>
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto text-lg">
            Compare top Malaysian universities across major international ranking systems including QS World and Times Higher Education.
          </p>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-[2.5rem] shadow-2xl shadow-blue-900/5 overflow-hidden border border-gray-100">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="px-8 py-6 text-left text-sm font-bold uppercase tracking-wider">University</th>
                <th className="px-8 py-6 text-center text-sm font-bold uppercase tracking-wider">
                   <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-blue-400">QS World</span>
                      <span>2025 Rank</span>
                   </div>
                </th>
                <th className="px-8 py-6 text-center text-sm font-bold uppercase tracking-wider">
                   <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-emerald-400">Times</span>
                      <span>2025 Rank</span>
                   </div>
                </th>
                <th className="px-8 py-6 text-center text-sm font-bold uppercase tracking-wider">
                   <div className="flex flex-col items-center gap-1">
                      <span className="text-[10px] text-purple-400">QS Asia</span>
                      <span>2025 Rank</span>
                   </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rankings.map((uni) => (
                <tr key={uni.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex flex-col">
                       <span className="font-black text-lg text-gray-900 group-hover:text-blue-600 transition-colors">{uni.name}</span>
                       <Link
                         href={`/university/${uni.uname}`}
                         className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-blue-600 mt-1 transition-colors uppercase tracking-widest"
                       >
                         Academic Profile <ArrowRight className="w-3 h-3" />
                       </Link>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="inline-flex items-center px-5 py-2 rounded-2xl text-base font-black bg-blue-50 text-blue-700 border border-blue-100 min-w-[80px] justify-center">
                      {uni.qs_rank || 'N/A'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="inline-flex items-center px-5 py-2 rounded-2xl text-base font-black bg-emerald-50 text-emerald-700 border border-emerald-100 min-w-[80px] justify-center">
                      {uni.times_rank || 'N/A'}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className="inline-flex items-center px-5 py-2 rounded-2xl text-base font-black bg-purple-50 text-purple-700 border border-purple-100 min-w-[80px] justify-center">
                      {uni.qs_asia_rank || 'N/A'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile & Tablet Card View */}
        <div className="lg:hidden grid grid-cols-1 md:grid-cols-2 gap-6">
          {rankings.map((uni) => (
            <div key={uni.id} className="bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 border border-gray-100 flex flex-col">
              <h3 className="font-black text-xl text-gray-900 mb-2 truncate">{uni.name}</h3>
              <Link
                href={`/university/${uni.uname}`}
                className="text-xs font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2 mb-6"
              >
                View Profile <ArrowRight className="w-3 h-3" />
              </Link>
              
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50/50 rounded-2xl p-3 text-center border border-blue-100/50">
                   <div className="text-[10px] font-bold text-blue-500 uppercase mb-1">QS World</div>
                   <div className="text-lg font-black text-blue-700">{uni.qs_rank || '—'}</div>
                </div>
                <div className="bg-emerald-50/50 rounded-2xl p-3 text-center border border-emerald-100/50">
                   <div className="text-[10px] font-bold text-emerald-500 uppercase mb-1">Times</div>
                   <div className="text-lg font-black text-emerald-700">{uni.times_rank || '—'}</div>
                </div>
                <div className="bg-purple-50/50 rounded-2xl p-3 text-center border border-purple-100/50">
                   <div className="text-[10px] font-bold text-purple-500 uppercase mb-1">QS Asia</div>
                   <div className="text-lg font-black text-purple-700">{uni.qs_asia_rank || '—'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
