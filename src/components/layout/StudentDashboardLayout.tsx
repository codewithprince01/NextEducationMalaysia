import React from 'react'
import StudentSidebar from '../student/StudentSidebar'

export default function StudentDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col md:flex-row gap-6">
          <StudentSidebar />
          <div className="flex-1 bg-white rounded-2xl shadow-lg p-6 md:p-8 min-h-[600px]">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
