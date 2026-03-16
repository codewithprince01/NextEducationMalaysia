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
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">
          Find Universities Courses
        </h2>

        <div className="space-y-3">
          {courses.map((course) => {
            const IconComponent = course.icon
            return (
              <a
                key={course.id}
                href={course.link}
                className="flex items-center gap-4 p-4 rounded-lg border border-gray-100 
                           hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className={`${course.bgColor} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <IconComponent className={`w-5 h-5 ${course.color}`} />
                </div>

                <span className="text-sm font-semibold text-gray-700">
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
