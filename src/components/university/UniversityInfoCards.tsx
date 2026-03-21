import { BsCalendar3 } from 'react-icons/bs'
import { FaGraduationCap, FaEye, FaSchool } from 'react-icons/fa'

export default function UniversityInfoCards({ universityData, cols = 4 }: { universityData: any; cols?: number }) {
  const gridClass = cols === 2 ? 'grid-cols-2' : 'grid grid-cols-2 md:grid-cols-4'
  const scholarshipCount = Number(universityData?.scholarship_count || 0)
  const hasScholarship = Boolean(universityData?.Scholarship || universityData?.scholarship || scholarshipCount > 0)
  const totalCourses =
    Number(universityData?.active_programs_count || 0) ||
    Number(universityData?.courses || 0) ||
    (Array.isArray(universityData?.programs) ? universityData.programs.length : 0)

  const cards = [
    {
      icon: <BsCalendar3 className="text-xl text-blue-600" />,
      value: universityData.established_year || universityData.established || 'N/A',
      label: 'Established Year',
    },
    {
      icon: <FaGraduationCap className="text-xl text-green-600" />,
      value: hasScholarship ? 'Yes' : 'No',
      label: 'Scholarship',
    },
    {
      icon: <FaEye className="text-xl text-purple-600" />,
      value: universityData.click || universityData.clicks || '0',
      label: 'Clicks',
    },
    {
      icon: <FaSchool className="text-xl text-orange-600" />,
      value: totalCourses || 'N/A',
      label: 'Courses',
    },
  ]

  return (
    <div className={`grid ${gridClass} gap-3 md:gap-4`}>
      {cards.map(({ icon, value, label }, index) => (
        <div
          key={label}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm py-4 px-3 flex flex-col items-center text-center transition-all hover:shadow-md hover:-translate-y-1 group"
        >
          <div className="mb-2 p-2 rounded-xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <h3 className="!text-lg !font-semibold text-gray-900 mb-0.5">
            {value}
          </h3>
          <p className="text-gray-500 text-[10px] uppercase tracking-wider font-semibold">
            {label}
          </p>
        </div>
      ))}
    </div>
  )
}
