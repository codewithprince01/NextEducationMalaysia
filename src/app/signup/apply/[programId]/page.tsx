import SignUpClient from '../../SignUpClient'

export const metadata = {
  title: 'Apply Now | Education Malaysia',
  description: 'Complete your registration to apply for your chosen program.',
}

export default function SignUpApplyPage({ 
  params 
}: { 
  params: Promise<{ programId: string }> 
}) {
  return <SignUpClient />
}
