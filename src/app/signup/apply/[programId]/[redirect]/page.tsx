import SignUpClient from '../../../SignUpClient'
import { Suspense } from 'react'

export const metadata = {
  title: 'Apply Now | Education Malaysia',
  description: 'Complete your registration to apply for your chosen program.',
}

export default function SignUpApplyRedirectPage() {
  return (
    <Suspense fallback={null}>
      <SignUpClient />
    </Suspense>
  )
}
