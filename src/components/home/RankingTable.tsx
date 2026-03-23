import Link from 'next/link'

type UniversityRank = {
  id: number
  name: string | null
  uname: string | null
  qs_rank: string | number | null
  times_rank?: string | number | null
  qs_asia_rank?: string | number | null
}

async function getRankings(): Promise<UniversityRank[]> {
  try {
    const { prisma } = await import('@/lib/db-fresh')

    // Match old project logic exactly:
    // active + homeview + all 3 ranks available, ordered by QS rank, limit 30.
    const rows = await prisma.$queryRawUnsafe(
      `
      SELECT id, name, uname, qs_rank, times_rank, qs_asia_rank
      FROM universities
      WHERE status = 1
        AND homeview = 1
        AND qs_rank IS NOT NULL AND TRIM(qs_rank) <> ''
        AND times_rank IS NOT NULL AND TRIM(times_rank) <> ''
        AND qs_asia_rank IS NOT NULL AND TRIM(qs_asia_rank) <> ''
      ORDER BY CAST(qs_rank AS UNSIGNED) ASC, qs_rank ASC
      LIMIT 30
      `,
    ) as any[]

    return rows.map((u) => ({
      id: Number(u.id),
      name: u.name ?? null,
      uname: u.uname ?? null,
      qs_rank: u.qs_rank ?? null,
      times_rank: u.times_rank ?? null,
      qs_asia_rank: u.qs_asia_rank ?? null,
    }))
  } catch (e) {
    console.error('getRankings error:', e)
    return []
  }
}

export default async function RankingTable() {
  const displayRankings = await getRankings()

  return (
    <div className="bg-gray-50 py-8 sm:py-6 md:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-2 sm:mb-2">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Malaysian University Rankings
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600 px-2">
            Compare top Malaysian universities across major international
            ranking systems
          </p>
        </div>

        {/* Mobile Card View - Hidden on md and above */}
        <div className="block md:hidden space-y-3">
          {displayRankings.map((uni) => (
            <div key={uni.id} className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
              <div className="mb-3 pb-3 border-b border-gray-100">
                <h3 className="font-semibold text-sm text-gray-900 leading-tight">{uni.name}</h3>
                <Link href={`/university/${uni.uname}`} className="text-xs text-blue-600 hover:underline mt-1 inline-block">
                  View All Courses ?
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-blue-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500 mb-1">QS World</p>
                  <span className="text-sm font-bold text-blue-700">{uni.qs_rank ?? 'N/A'}</span>
                </div>
                <div className="bg-green-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500 mb-1">Times</p>
                  <span className="text-sm font-bold text-green-700">{uni.times_rank ?? 'N/A'}</span>
                </div>
                <div className="bg-purple-50 rounded-lg p-2">
                  <p className="text-[10px] text-gray-500 mb-1">QS Asia</p>
                  <span className="text-sm font-bold text-purple-700">{uni.qs_asia_rank ?? 'N/A'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View - Hidden on mobile */}
        <div className="hidden md:block bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-[#003893]">
                <tr>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-sm font-semibold text-white">University</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-center text-sm font-semibold text-white">QS World Ranking</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-center text-sm font-semibold text-white">Times Ranking</th>
                  <th className="px-4 lg:px-6 py-3 lg:py-4 text-center text-sm font-semibold text-white">QS Asia Ranking</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayRankings.map((uni) => (
                  <tr key={uni.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-sm font-medium text-gray-900">
                      <div>{uni.name}</div>
                      <Link href={`/university/${uni.uname}`} className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1">
                        View All Courses ?
                      </Link>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {uni.qs_rank ?? 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        {uni.times_rank ?? 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3 lg:py-4 text-center">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                        {uni.qs_asia_rank ?? 'N/A'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
