import { Metadata } from 'next'
import StudentDashboardLayout from '@/components/layout/StudentDashboardLayout'
import AppliedCollegesClient from './AppliedCollegesClient'

export const metadata: Metadata = {
  title: 'Applied Colleges | Student Dashboard',
  description: 'View and manage your college applications.',
}

export default function AppliedCollegesPage() {
  return (
    <StudentDashboardLayout>
      <AppliedCollegesClient />
    </StudentDashboardLayout>
  )
}
