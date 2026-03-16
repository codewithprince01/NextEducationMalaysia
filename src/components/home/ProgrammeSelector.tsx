import Link from 'next/link'
import { FaBookOpen, FaArrowRight } from 'react-icons/fa'

type Specialization = {
  id: number
  name: string | null
  slug: string | null
}

async function getSpecializations(): Promise<Specialization[]> {
  try {
    const { prisma } = await import('@/lib/db')
    return (await (prisma as any).specialization.findMany({
      where: { status: true },
      select: { id: true, name: true, slug: true },
      orderBy: { id: 'asc' },
      take: 8,
    })) as Specialization[]
  } catch {
    return []
  }
}

export default async function ProgrammeSelector() {
  const courses = await getSpecializations()
  if (courses.length === 0) return null

  return (
    <section className="bg-white px-4 pt-6 pb-4 md:px-10 lg:px-24">
      <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6">
        Choose Your <span className="text-[#003893]">Favourite Programme</span> in Malaysia
      </h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {courses.map((course, i) => (
          <Link
            key={course.id || i}
            href={`/specialization/${course.slug}`}
            className="group bg-gray-50 rounded-2xl shadow-md hover:shadow-xl p-4 transition-all duration-300 border border-gray-100 hover:border-blue-200 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-gray-700 font-medium text-sm">Study</span>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-teal-500 text-white flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-md">
                    <FaBookOpen className="h-5 w-5" />
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center transition-all duration-300 transform group-hover:translate-x-1">
                  <FaArrowRight className="text-white text-sm" />
                </div>
              </div>
              <h3 className="text-gray-800 font-semibold text-base mb-2 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 min-h-[3rem]">
                {course.name}
              </h3>
              <div className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                In Malaysia
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center mt-6">
        <Link
          href="/specialization"
          className="inline-flex items-center border-2 border-blue-800 text-blue-800 font-semibold px-6 py-2 rounded-full transition hover:bg-blue-800 hover:text-white"
        >
          Browse All Programmes
        </Link>
      </div>
    </section>
  )
}
