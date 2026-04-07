import { getUniversityFull } from '@/lib/queries/universities'
import { serializeBigInt } from '@/lib/utils'
import { universityJsonLd } from '@/lib/seo/structured-data'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function Head({ params }: Props) {
  try {
    const { slug } = await params
    const universityData = await getUniversityFull(slug)
    if (!universityData) return null

    const university = serializeBigInt(universityData) as any
    const schema = universityJsonLd(university, { path: `/university/${slug}` })

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </>
    )
  } catch {
    return null
  }
}
