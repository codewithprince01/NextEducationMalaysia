import { Metadata } from 'next'
import { Suspense } from 'react'
import SignUpClient from './SignUpClient'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your Education Malaysia account to access personalized services and resources.',
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpClient />
    </Suspense>
  )
}
