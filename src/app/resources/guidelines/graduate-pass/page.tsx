import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'
import GraduatePassClient from './GraduatePassClient'

export const metadata: Metadata = {
  title: 'Graduate Pass — Your Gateway to 12 Months in Malaysia | Education Malaysia',
  description: 'Stay, work, and explore opportunities in Malaysia for up to one year after graduation — no employer sponsorship required.',
  alternates: { canonical: `${SITE_URL}/resources/guidelines/graduate-pass` },
}

export default function GraduatePassPage() {
  return <GraduatePassClient />
}
