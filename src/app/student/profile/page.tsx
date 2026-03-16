import { Metadata } from 'next'
import StudentDashboardLayout from '@/components/layout/StudentDashboardLayout'
import StudentProfileClient from './StudentProfileClient'

export const metadata: Metadata = {
  title: 'My Profile | Student Dashboard',
  description: 'Manage your personal information and student profile.',
}

export default function StudentProfilePage() {
  return (
    <StudentDashboardLayout>
      <StudentProfileClient />
    </StudentDashboardLayout>
  )
}
