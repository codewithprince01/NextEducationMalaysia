import QualificationLevelClient from '../../course/[slug]/QualificationLevelClient'

export const metadata = {
  title: 'Courses in Malaysia | Education Malaysia',
  description: 'Explore various course categories and programs available at this qualification level.',
}

export default async function CourseLevelListingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <QualificationLevelClient slug={slug} />
}
