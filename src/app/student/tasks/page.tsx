import { Metadata } from 'next'
import StudentDashboardLayout from '@/components/layout/StudentDashboardLayout'
import MyTasksClient from '@/components/student/MyTasksClient'

export const metadata: Metadata = {
  title: 'My Tasks & Document Checklist | Student Dashboard',
  description: 'Track your pending documents, profile requirements, and complete your university application checklist.',
}

export default function StudentTasksPage() {
  return (
    <StudentDashboardLayout>
      <MyTasksClient />
    </StudentDashboardLayout>
  )
}
