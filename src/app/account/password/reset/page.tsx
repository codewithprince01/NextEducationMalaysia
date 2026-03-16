import type { Metadata } from 'next'
import ResetPasswordClient from './ResetPasswordClient'

export const metadata: Metadata = {
  title: 'Recover Your Account | Education Malaysia',
  description: 'Enter your email to receive recovery instructions for your Education Malaysia account.',
}

export default function ResetPasswordPage() {
  return <ResetPasswordClient />
}
