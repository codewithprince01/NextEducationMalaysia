import { Metadata } from 'next'
import StudentDashboardLayout from '@/components/layout/StudentDashboardLayout'
import OfficialDocumentsClient from '@/components/student/OfficialDocumentsClient'

export const metadata: Metadata = {
  title: 'Official Documents Issued | Student Dashboard',
  description: 'Official university letters, admission offers, joining letters, visa approval letters (VAL), and fee receipts issued directly by your counselor and university admissions desk.',
}

export default function OfficialDocumentsPage() {
  return (
    <StudentDashboardLayout>
      <OfficialDocumentsClient />
    </StudentDashboardLayout>
  )
}
