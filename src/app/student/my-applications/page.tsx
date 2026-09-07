import { Metadata } from 'next'
import StudentDashboardLayout from '@/components/layout/StudentDashboardLayout'
import AppliedCollegesClient from '../applied-colleges/AppliedCollegesClient'

export const metadata: Metadata = {
  title: 'My Applications | Student Dashboard',
  description: 'View and manage your college applications.',
}

export default function MyApplicationsPage() {
  return (
    <StudentDashboardLayout>
      <AppliedCollegesClient />
    </StudentDashboardLayout>
  )
}
