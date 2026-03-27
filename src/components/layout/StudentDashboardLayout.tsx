import React from 'react'
import StudentSidebar from '../student/StudentSidebar'

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row bg-gray-100 min-h-screen p-4 md:p-6 md:items-start">
      <StudentSidebar />
      <div className="relative w-full md:w-3/4 bg-white rounded-2xl mt-6 md:mt-0 md:ml-6 shadow-xl p-6">
        {children}
      </div>
        </div>
  )
}
