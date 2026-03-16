import { Calendar, GraduationCap, Eye, School } from 'lucide-react'

export default function UniversityInfoCards({ universityData, cols = 4 }: { universityData: any; cols?: number }) {
  const gridClass = cols === 2 ? 'grid-cols-2' : 'grid grid-cols-2 md:grid-cols-4'

  const cards = [
    {
      icon: <Calendar className="text-xl text-blue-600" size={20} />,
      value: universityData.established || '1970',
      label: 'Established Year',
    },
    {
      icon: <GraduationCap className="text-xl text-green-600" size={20} />,
      value: universityData.Scholarship ? 'Yes' : 'No',
      label: 'Scholarship',
    },
    {
      icon: <Eye className="text-xl text-purple-600" size={20} />,
      value: universityData.clicks || '0',
      label: 'Clicks',
    },
    {
      icon: <School className="text-xl text-orange-600" size={20} />,
      value: universityData.courses || 'N/A',
      label: 'Courses',
    },
  ]

  return (
    <div className={`grid ${gridClass} gap-3 md:gap-4`}>
      {cards.map(({ icon, value, label }) => (
        <div
          key={label}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm py-4 px-3 flex flex-col items-center text-center transition-all hover:shadow-md hover:-translate-y-1 group"
        >
          <div className="mb-2 p-2 rounded-xl group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <h3 className="text-lg font-extrabold text-gray-900 mb-0.5">
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
