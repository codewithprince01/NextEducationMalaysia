import { Metadata } from 'next'
import SignUpClient from './SignUpClient'

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create your Education Malaysia account to access personalized services and resources.',
}

export default function SignUpPage() {
  return <SignUpClient />
}
