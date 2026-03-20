import { notFound, redirect } from 'next/navigation'
import BlogDetailClient from '../../[category]/[slugWithId]/BlogDetailClient'
import { prisma } from '@/lib/db-fresh'

type Props = { params: Promise<{ slugWithId: string }> }

function parseSlugWithId(slugWithId: string) {
  const lastDash = slugWithId.lastIndexOf('-')
  if (lastDash === -1) return null
  const id = Number.parseInt(slugWithId.slice(lastDash + 1), 10)
  if (!Number.isFinite(id)) return null
  const slug = slugWithId.slice(0, lastDash)
  return { slug, id }
}

export default async function BlogAllDetailFallbackPage({ params }: Props) {
  const { slugWithId } = await params
  const parsed = parseSlugWithId(slugWithId)
  if (!parsed) return notFound()

  const canonical = await prisma.blog.findFirst({
    where: { id: parsed.id, status: 1 },
    select: {
      id: true,
      slug: true,
      category: { select: { category_slug: true } },
    },
  })

  if (canonical?.slug && canonical?.category?.category_slug) {
    redirect(`/blog/${canonical.category.category_slug}/${canonical.slug}-${canonical.id}`)
  }

  return <BlogDetailClient category="all" slugWithId={slugWithId} />
}

