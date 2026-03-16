'use client'

import React, { useState, useEffect } from 'react'
import { Trophy, Award, TrendingUp, Info, BarChart3, Globe } from 'lucide-react'

interface Ranking {
  id: number
  ranking_body: string
  rank: string
  year: string
}

interface RankingsData {
  rankings: Ranking[]
  qs_rank: string | null
  times_rank: string | null
  qs_asia_rank: string | null
}

export default function UniversityRankingClient({ uname }: { uname: string }) {
  const [data, setData] = useState<RankingsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch(`/api/university/${uname}/rankings`)
        const json = await response.json()
        if (json.data) {
          setData(json.data)
        }
      } catch (error) {
        console.error('Error fetching rankings:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRankings()
  }, [uname])

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-40 bg-gray-100 rounded-[2.5rem]" />
        <div className="h-80 bg-gray-100 rounded-[2.5rem]" />
      </div>
    )
  }

  return (
    <div className="space-y-16">
      {/* Introduction */}
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          <TrendingUp className="w-4 h-4" />
          Academic standing
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">Global Academic <span className="text-blue-600">Rankings</span></h2>
        <p className="text-gray-500 text-lg leading-relaxed">
          University rankings reflect academic excellence, research impact, and global reputation. 
          The higher education landscape in Malaysia is characterized by rapid growth and increasing global recognition.
        </p>
      </div>

      {/* Primary Rankings Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'QS World Ranking', value: data?.qs_rank, color: 'blue', icon: Globe },
          { label: 'Times Higher Education', value: data?.times_rank, color: 'emerald', icon: Trophy },
          { label: 'QS Asia Ranking', value: data?.qs_asia_rank, color: 'purple', icon: Award },
        ].map((item, idx) => (
          <div key={idx} className="relative group">
            <div className={`absolute inset-0 bg-${item.color}-600 rounded-[2rem] translate-y-2 translate-x-1 group-hover:translate-y-1 group-hover:translate-x-0.5 transition-transform opacity-10`} />
            <div className="relative bg-white border border-gray-100 rounded-[2rem] p-8 space-y-4">
              <div className={`w-12 h-12 bg-${item.color}-50 rounded-2xl flex items-center justify-center text-${item.color}-600`}>
                <item.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{item.label}</p>
                <p className="text-3xl font-black text-gray-900 mt-1">{item.value || 'N/A'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Historical & Specialized Rankings */}
      {data?.rankings && data.rankings.length > 0 && (
        <div className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden shadow-2xl shadow-blue-900/5">
          <div className="px-8 py-6 bg-slate-900 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h3 className="text-white font-bold uppercase tracking-widest text-sm">Historical Data & NIRF Rankings</h3>
            </div>
            <span className="text-slate-400 text-xs font-medium">Updated 2024-2025</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-8 py-6 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Category / Body</th>
                  <th className="px-8 py-6 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">Rank</th>
                  <th className="px-8 py-6 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {data.rankings.map((rank) => (
                  <tr key={rank.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-8 py-6">
                      <span className="font-bold text-gray-900">{rank.ranking_body}</span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 font-black text-sm border border-blue-100">
                        {rank.rank}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <span className="text-sm font-bold text-gray-400">{rank.year}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Insight Section */}
      <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center gap-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 space-y-6 flex-1">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
             <Info className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-2xl font-black">Interpreting the Data</h3>
          <p className="text-slate-400 leading-relaxed max-w-xl">
             Rankings are based on various metrics including employer reputation, research citations per faculty, and international student ratio. 
             While rankings provide a snapshot, we recommend considering campus facilities, course specializations, and career support services when making your final decision.
          </p>
        </div>
        <div className="relative z-10 w-full md:w-auto">
           <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-sm">
              <div className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-4">Quick Fact</div>
              <p className="text-xl font-bold leading-tight">Malaysia aims to host over <span className="text-blue-500">250,000 international students</span> by 2025.</p>
           </div>
        </div>
      </div>
    </div>
  )
}
