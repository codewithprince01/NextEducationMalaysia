import { resolveStaticMetaAny } from '@/lib/seo/metadata'
import { getTeamEducationMalaysiaContent } from '@/lib/queries/resources'
import TeamEducationMalaysiaClient from './TeamEducationMalaysiaClient'

export async function generateMetadata() {
  return resolveStaticMetaAny(
    ['Team Education Malaysia', 'resources-guidelines-team-education-malaysia'],
    '/resources/guidelines/team-education-malaysia',
    'Team Education Malaysia | Education Malaysia',
  )
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
