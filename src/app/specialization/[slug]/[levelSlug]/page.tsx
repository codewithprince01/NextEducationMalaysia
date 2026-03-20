import { notFound } from 'next/navigation'
import { getSpecializationLevel } from '@/lib/queries/specializations'
import { SITE_URL } from '@/lib/constants'
import { serializeBigInt } from '@/lib/utils'

export const revalidate = 86400

type Props = { params: Promise<{ slug: string; levelSlug: string }> }

export async function generateMetadata({ params }: Props) {
  const { slug, levelSlug } = await params
  const level = await getSpecializationLevel(slug, levelSlug)
  if (!level) return {}
  return {
    title: `${level.level} - ${level.specialization?.name}`,
    alternates: { canonical: `${SITE_URL}/specialization/${slug}/${levelSlug}` },
  }
}

export default async function SpecializationLevelPage({ params }: Props) {
  const { slug, levelSlug } = await params
  const levelData = await getSpecializationLevel(slug, levelSlug)
  if (!levelData) notFound()

  const level = serializeBigInt(levelData)

  return (
    <main className="container mx-auto py-6">
      <a href={`/specialization/${slug}`} className="text-blue-600 text-sm hover:underline">
        ← {level.specialization?.name}
      </a>
      <h1 className="text-2xl font-bold text-gray-800 mt-2">
        {level.level}
      </h1>

      {level.contents?.map(content => (
        <section key={content.id} className="mt-6">
          {content.title && <h2 className="text-xl font-semibold mb-3">{content.title}</h2>}
          <div
            className="content-html prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content.description || '' }}
          />
        </section>
      ))}
    </main>
  )
}
