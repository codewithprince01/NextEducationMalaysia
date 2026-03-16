import { Metadata } from 'next'
import StudentDashboardLayout from '@/components/layout/StudentDashboardLayout'
import ConversationsClient from './ConversationsClient'

export const metadata: Metadata = {
  title: 'Conversation | Student Dashboard',
  description: 'Chat with Education Malaysia advisors.',
}

export default function ConversationPage() {
  return (
    <StudentDashboardLayout>
      <ConversationsClient />
    </StudentDashboardLayout>
  )
}
