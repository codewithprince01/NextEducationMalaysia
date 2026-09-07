import { Metadata } from 'next'
import StudentDashboardLayout from '@/components/layout/StudentDashboardLayout'
import ApplicationDetailClient from './ApplicationDetailClient'

export const metadata: Metadata = {
  title: 'Application Details & Real-Time Tracking | Student Portal',
  description: 'Track your university application status, pending requirements, and admission stages.',
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  return (
    <StudentDashboardLayout>
      <ApplicationDetailClient applicationId={resolvedParams.id} />
    </StudentDashboardLayout>
  )
}
