import { notFound, redirect } from 'next/navigation'
import { getCourseCategory, getAllCourseCategorySlugs } from '@/lib/queries/courses'
import { resolveCourseCategoryMeta } from '@/lib/seo/metadata'
import QualificationLevelClient from './QualificationLevelClient'
import CourseCategoryDetailClient from './CourseCategoryDetailClient'

// Rendered per request so an edit saved in the admin panel is live immediately.
// The expensive queries behind this page stay cached and are keyed on a cheap
// database freshness probe, so they only re-run when the content actually
// changed. See src/lib/queries/contentVersion.ts.
export const revalidate = 0

type Props = { params: Promise<{ slug: string }> }

const QUALIFICATION_LEVEL_SLUGS = [
  'certificate',
  'pre-university',
  'diploma',
  'under-graduate',
  'post-graduate',
  'phd'
]

export async function generateStaticParams() {
  const slugs = await getAllCourseCategorySlugs()
  return slugs.map((slug: string) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  
  // If it's a top level qual slug, we might need a different meta fetcher or just return {} for now
  if (QUALIFICATION_LEVEL_SLUGS.includes(slug.toLowerCase())) {
    return { title: `${slug.replace(/-/g, ' ').toUpperCase()} | Education Malaysia` }
  }

  const category = await getCourseCategory(slug)
  if (!category) return {}
  return resolveCourseCategoryMeta(category)
}

export default async function CourseCategoryPage({ params }: Props) {
  const { slug } = await params
  
  // 1. Top-level qualification level (listing of categories)
  if (QUALIFICATION_LEVEL_SLUGS.includes(slug.toLowerCase())) {
     return <QualificationLevelClient slug={slug} />
  }

  // 2. Specific course category (detail page with tabs)
  const category = await getCourseCategory(slug)
  if (!category) notFound()
  if (category?.slug && category.slug !== slug) {
    redirect(`/course/${category.slug}`)
  }

  return <CourseCategoryDetailClient slug={slug} />
}
