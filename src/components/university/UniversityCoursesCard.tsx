import React from 'react'
import { Award, FileText, GraduationCap, BookOpen, School } from 'lucide-react'

export default function UniversityCoursesCard() {
  const courses = [
    {
      id: 1,
      title: 'Certificate Course in Malaysia',
      icon: Award,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      link: '/courses/pre-university',
    },
    {
      id: 2,
      title: 'Diploma Course in Malaysia',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      link: '/courses/diploma',
    },
    {
      id: 3,
      title: 'Bachelor Course in Malaysia',
      icon: GraduationCap,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      link: '/courses/under-graduate',
    },
    {
      id: 4,
      title: 'Master Degree in Malaysia',
      icon: BookOpen,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      link: '/courses/post-graduate',
    },
    {
      id: 5,
      title: 'PHD Courses in Malaysia',
      icon: School,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      link: '/courses/phd',
    },
  ]

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-4">
        <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-slate-100">
          <span className="w-1 h-5 bg-blue-600 rounded-full" />
          <h2 className="!text-base sm:!text-lg !font-semibold text-slate-800 tracking-normal whitespace-nowrap">
            Find Universities Courses
          </h2>
        </div>

        <div className="space-y-2">
          {courses.map((course) => {
            const IconComponent = course.icon
            return (
              <a
                key={course.id}
                href={course.link}
                className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 
                           hover:bg-slate-50 hover:border-slate-200/80 transition-all cursor-pointer group"
              >
                <div className={`${course.bgColor} p-2 rounded-lg group-hover:scale-105 transition-transform shrink-0`}>
                  <IconComponent className={`w-4 h-4 ${course.color}`} />
                </div>

                <span className="text-xs sm:text-[13px] font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                  {course.title}
                </span>
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}
