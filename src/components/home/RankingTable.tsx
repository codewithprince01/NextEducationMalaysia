import Link from 'next/link'

type UniversityRank = {
  id: number
  name: string | null
  uname: string | null
  qs_rank: number | null
  times_rank?: number | null
  qs_asia_rank?: number | null
}

async function getRankings(): Promise<UniversityRank[]> {
  try {
    const { prisma } = await import('@/lib/db')
    
    console.log('Starting rankings query...')
    
    // First, try to get any universities to test connection
    const allUnis = await prisma.university.findMany({
      select: { 
        id: true, 
        name: true, 
        uname: true, 
        qs_rank: true,
        times_rank: true,
        qs_asia_rank: true 
      },
      orderBy: { name: 'asc' },
      take: 10,
    })
    
    console.log('Total universities found:', allUnis.length)
    
    if (allUnis.length > 0) {
      console.log('Sample university:', allUnis[0])
    }
    
    return allUnis.map((u) => ({
      ...u,
      id: Number(u.id),
      qs_rank: u.qs_rank,
      times_rank: u.times_rank,
      qs_asia_rank: u.qs_asia_rank
    })) as UniversityRank[]
  } catch (e) {
    console.error('getRankings error:', e)
    return []
  }
}

export default async function RankingTable() {
  const rankings = await getRankings()
  console.log('RankingTable component - rankings length:', rankings.length)
  
  // All universities with full ranking data like OLD project
  const displayRankings = rankings.length > 0 ? rankings : [
    {
      id: 1,
      name: 'University of Malaya',
      uname: 'university-of-malaya',
      qs_rank: 65,
      times_rank: 301,
      qs_asia_rank: 9
    },
    {
      id: 2,
      name: 'Universiti Teknologi Malaysia',
      uname: 'universiti-teknologi-malaysia',
      qs_rank: 188,
      times_rank: 401,
      qs_asia_rank: 33
    },
    {
      id: 3,
      name: 'Universiti Putra Malaysia',
      uname: 'universiti-putra-malaysia',
      qs_rank: 187,
      times_rank: 351,
      qs_asia_rank: 36
    },
    {
      id: 4,
      name: 'Universiti Sains Malaysia',
      uname: 'universiti-sains-malaysia',
      qs_rank: 137,
      times_rank: 401,
      qs_asia_rank: 43
    },
    {
      id: 5,
      name: 'Universiti Kebangsaan Malaysia',
      uname: 'universiti-kebangsaan-malaysia',
      qs_rank: 129,
      times_rank: 351,
      qs_asia_rank: 36
    },
    {
      id: 6,
      name: 'Universiti Teknologi MARA',
      uname: 'universiti-teknologi-mara',
      qs_rank: 145,
      times_rank: 401,
      qs_asia_rank: 100
    },
    {
      id: 7,
      name: 'Universiti Utara Malaysia',
      uname: 'universiti-utara-malaysia',
      qs_rank: 194,
      times_rank: 401,
      qs_asia_rank: 120
    },
    {
      id: 8,
      name: 'Universiti Malaysia Sarawak',
      uname: 'universiti-malaysia-sarawak',
      qs_rank: 1201,
      times_rank: 401,
      qs_asia_rank: 150
    },
    {
      id: 9,
      name: 'Universiti Malaysia Sabah',
      uname: 'universiti-malaysia-sabah',
      qs_rank: 1001,
      times_rank: 401,
      qs_asia_rank: 180
    },
    {
      id: 10,
      name: 'Universiti Pendidikan Sultan Idris',
      uname: 'universiti-pendidikan-sultan-idris',
      qs_rank: 1201,
      times_rank: 401,
      qs_asia_rank: 200
    }
  ]
  
  console.log('Final display data length:', displayRankings.length)

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
                  View All Courses →
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
                        View All Courses →
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
