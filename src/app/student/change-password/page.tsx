import { Metadata } from 'next'
import StudentDashboardLayout from '@/components/layout/StudentDashboardLayout'
import ChangePasswordClient from './ChangePasswordClient'

export const metadata: Metadata = {
  title: 'Change Password | Student Dashboard',
  description: 'Update your account password securely.',
}

export default function ChangePasswordPage() {
  return (
    <StudentDashboardLayout>
      <ChangePasswordClient />
    </StudentDashboardLayout>
  )
}
