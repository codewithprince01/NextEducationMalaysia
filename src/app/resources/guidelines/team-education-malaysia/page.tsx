import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'
import { getTeamEducationMalaysiaContent } from '@/lib/queries/resources'
import TeamEducationMalaysiaClient from './TeamEducationMalaysiaClient'

export const metadata: Metadata = {
  title: 'Team Education Malaysia | Education Malaysia',
  description: 'Meet the dedicated team behind Education Malaysia who support international students in their academic journey.',
  alternates: { canonical: `${SITE_URL}/resources/guidelines/team-education-malaysia` },
}

export default async function TeamEducationMalaysiaPage() {
  const raw = (await getTeamEducationMalaysiaContent()) as any
  const content = raw
    ? {
        ...raw,
        heading:
          raw.heading ??
          raw.title ??
          'Study in Malaysia: Discover Universities, Expenses, Programs, Visa, Admission Criteria, Scholarships',
        description:
          raw.description ??
          raw.page_content ??
          raw.page_contents ??
          '',
      }
    : null

  return <TeamEducationMalaysiaClient initialContent={content} />
}
