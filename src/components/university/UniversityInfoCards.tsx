import { BsCalendar3 } from 'react-icons/bs'
import { FaGraduationCap, FaEye, FaSchool } from 'react-icons/fa'

export default function UniversityInfoCards({ universityData, cols = 4 }: { universityData: any; cols?: number }) {
  const scholarshipCount = Number(universityData?.scholarship_count || 0)
  const hasScholarship = Boolean(universityData?.Scholarship || universityData?.scholarship || scholarshipCount > 0 || Number(universityData?.scholarship_available) === 1)
  const totalCourses =
    Number(universityData?.active_programs_count || 0) ||
    Number(universityData?.courses || 0) ||
    (Array.isArray(universityData?.programs) ? universityData.programs.length : 0)

  const rawClicks = Number(universityData?.click || universityData?.clicks || 0)
  const formattedClicks = rawClicks > 0 ? rawClicks.toLocaleString() : (universityData?.click || universityData?.clicks || '0')

  const cards = [
    {
      icon: <BsCalendar3 className="text-base text-blue-600" />,
      bg: 'bg-blue-50',
      value: universityData.established_year || universityData.established || 'N/A',
      label: 'Established Year',
    },
    {
      icon: <FaGraduationCap className="text-base text-emerald-600" />,
      bg: 'bg-emerald-50',
      value: hasScholarship ? 'Yes' : 'No',
      label: 'Scholarship',
    },
    {
      icon: <FaEye className="text-base text-purple-600" />,
      bg: 'bg-purple-50',
      value: formattedClicks,
      label: 'Total Clicks',
    },
    {
      icon: <FaSchool className="text-base text-amber-600" />,
      bg: 'bg-amber-50',
      value: totalCourses || 'N/A',
      label: 'Courses',
    },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3.5 sm:p-4 w-full">
      <div className={`grid ${cols === 2 ? 'grid-cols-2 gap-3 divide-x divide-gray-100' : 'grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:divide-x divide-gray-100'}`}>
        {cards.map(({ icon, bg, value, label }, index) => (
          <div
            key={label}
            className={`flex items-center gap-3 ${index > 0 ? 'md:pl-4 sm:pl-5' : ''}`}
          >
            <div className={`w-10 h-10 shrink-0 rounded-xl ${bg} flex items-center justify-center`}>
              {icon}
            </div>
            <div className="min-w-0">
              <p className="text-base sm:text-lg font-bold text-gray-900 leading-tight truncate">
                {value}
              </p>
              <p className="text-[11px] text-gray-500 font-medium truncate mt-0.5">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
