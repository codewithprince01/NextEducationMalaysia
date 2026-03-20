'use client'

import React, { useState, useEffect } from 'react'

interface Ranking {
  id: number
  ranking_body: string
  rank: string
  year: string
  score?: string
}

interface RankingsData {
  rankings: Ranking[]
  qs_rank: string | null
  times_rank: string | null
  qs_asia_rank: string | null
}

const staticRankings2024 = [
  { category: "Overall", rank: "1", score: "86.42", year: "2024" },
  { category: "Engineering", rank: "1", score: "89.46", year: "2024" },
  { category: "Innovation", rank: "2", score: "-", year: "2024" },
  { category: "Research", rank: "2", score: "83.29", year: "2024" },
];

const pastRankings = [
  { category: "Overall", rank: "1", year: "2024" },
  { category: "Engineering", rank: "1", year: "2023" },
  { category: "Research", rank: "2", year: "2023" },
  { category: "Management", rank: "15", year: "2023" },
  { category: "Management", rank: "10", year: "2022" },
];

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
      <div className="max-w-6xl mx-auto py-12 animate-pulse space-y-8">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-24 bg-gray-100 rounded" />
        <div className="h-64 bg-gray-100 rounded" />
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-5">
      <div className="max-w-6xl mx-auto font-sans">
        {/* Main Heading */}
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          University Rankings 2025
        </h1>

        {/* Intro Paragraph */}
        <p className="text-gray-700 mb-10 leading-relaxed text-base">
          University rankings are an important indicator of academic excellence
          and global and national rankings. These rankings reflect the strength
          of Malaysian higher education in areas like Teaching, Learning and
          Resources (TLR), Graduation Outcomes (GO), Research and Professional
          Practice (RP), Perception (PR), and Outreach & Inclusivity (OI).
          Malaysian institutions continue to rise as leaders in Asia and beyond.
        </p>

        {/* Dynamic Global Rankings From API */}
        {(data?.qs_rank || data?.times_rank || data?.qs_asia_rank) && (
           <div className="mb-12">
             <h2 className="text-2xl font-semibold text-gray-900 mb-4">
               Global Academic Standings
             </h2>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
               {[
                 { label: 'QS World Rank', value: data.qs_rank, color: 'text-blue-700' },
                 { label: 'Times Rank', value: data.times_rank, color: 'text-purple-700' },
                 { label: 'QS Asia Rank', value: data.qs_asia_rank, color: 'text-emerald-700' },
               ].map((item, i) => item.value && (
                 <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center transform transition hover:scale-105">
                   <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">{item.label}</p>
                   <p className={`text-3xl font-black ${item.color}`}>{item.value}</p>
                 </div>
               ))}
             </div>
           </div>
        )}

        {/* 2024 Ranking */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          University NIRF Ranking 2024
        </h2>
        <div className="overflow-x-auto mb-10">
          <table className="w-full border border-gray-200 rounded-lg shadow-md bg-white">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 border-b">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 border-b">NIRF Rank</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 border-b">NIRF Score</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 border-b">Year</th>
              </tr>
            </thead>
            <tbody>
              {staticRankings2024.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 text-sm text-gray-700 border-b">{row.category}</td>
                  <td className="px-6 py-4 text-sm font-bold text-blue-700 border-b">{row.rank}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 border-b">{row.score !== "-" ? row.score : "Not Available"}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 border-b">{row.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Historical Rankings */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Previous Year Rankings (2022 - 2023)
        </h2>
        <div className="overflow-x-auto mb-10">
          <table className="w-full border border-gray-200 rounded-lg shadow-md bg-white">
            <thead className="bg-blue-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 border-b">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 border-b">NIRF Rank</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-800 border-b">Year</th>
              </tr>
            </thead>
            <tbody>
              {pastRankings.map((row, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 text-sm text-gray-700 border-b">{row.category}</td>
                  <td className="px-6 py-4 text-sm font-bold text-indigo-700 border-b">{row.rank}</td>
                  <td className="px-6 py-4 text-sm text-gray-700 border-b">{row.year}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Additional Analysis */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Analysis of Rankings
        </h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          The steady performance of Malaysian universities indicates their
          strong focus on quality education, innovation, and global
          collaborations. Engineering and research have consistently been the
          strongest areas, ensuring Malaysia's universities remain highly
          competitive. The rise of innovation as a ranking category further
          reflects Malaysia's drive to build future-ready graduates and
          impactful research.
        </p>

        <h2 className="text-2xl font-semibold text-gray-900 mb-4">
          Future Outlook
        </h2>
        <p className="text-gray-700 mb-6 leading-relaxed">
          With continuous government support, industry-academia partnerships,
          and international collaborations, Malaysian universities are expected
          to climb even higher in global rankings. Future priorities will focus
          on digital transformation in education, research funding, and
          enhancing student employability on a global scale.
        </p>
      </div>
    </div>
  )
}
