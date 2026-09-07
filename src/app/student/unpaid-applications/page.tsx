import { Metadata } from 'next'
import StudentDashboardLayout from '@/components/layout/StudentDashboardLayout'
import UnpaidApplicationsClient from './UnpaidApplicationsClient'

export const metadata: Metadata = {
  title: 'Unpaid Applications | Student Dashboard',
  description: 'View and manage your pending unpaid college applications.',
}

export default function UnpaidApplicationsPage() {
  return (
    <StudentDashboardLayout>
      <UnpaidApplicationsClient />
    </StudentDashboardLayout>
  )
}
