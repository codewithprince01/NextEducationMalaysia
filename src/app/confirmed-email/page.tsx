import { Suspense } from 'react'
import ConfirmedEmailClient from './ConfirmedEmailClient'

export const metadata = {
  title: 'Confirm Email | Education Malaysia',
  description: 'Verify your email address to complete your registration.',
}

export default function ConfirmedEmailPage() {
  return (
    <Suspense fallback={null}>
      <ConfirmedEmailClient />
    </Suspense>
  )
}
