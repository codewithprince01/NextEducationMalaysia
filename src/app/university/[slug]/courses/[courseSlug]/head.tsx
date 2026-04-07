import { courseJsonLd } from '@/lib/seo/structured-data'
import { getProgramBySlug } from '@/lib/queries/courses'
import { serializeBigInt } from '@/lib/utils'

type Props = { params: Promise<{ slug: string; courseSlug: string }> }

export default async function Head({ params }: Props) {
  try {
    const { slug, courseSlug } = await params
    if (courseSlug.startsWith('page-')) return null

    const programData = await getProgramBySlug(courseSlug, slug)
    if (!programData) return null

    const program = serializeBigInt(programData) as any
    const schema = courseJsonLd(program, program?.university?.name || '', slug)

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
