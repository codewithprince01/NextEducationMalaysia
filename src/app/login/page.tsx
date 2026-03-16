import { Metadata } from 'next'
import LoginClient from './LoginClient'

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login to your Education Malaysia account to access personalized services and resources.',
}

export default function LoginPage() {
  return <LoginClient />
}
