import { notFound } from 'next/navigation'
import { getAllUniversitySlugs, getUniversityFull } from '@/lib/queries/universities'
import UniversityOverview from '@/components/university/UniversityOverview'
import SideInquiryForm from '@/components/forms/SideInquiryForm'
import UniversityCoursesCard from '@/components/university/UniversityCoursesCard'
import FeaturedUniversities from '@/components/common/FeaturedUniversities'
import { serializeBigInt } from '@/lib/utils'
import { resolveUniversityMeta } from '@/lib/seo/metadata'
import type { Metadata } from 'next'

export const revalidate = 86400 // 24 hours

type Props = { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  try {
    const slugs = await getAllUniversitySlugs()
    return slugs.map((slug: string) => ({ slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const universityData = await getUniversityFull(slug)
  if (!universityData) return {}

  const university = serializeBigInt(universityData) as any
  const universityMetaSource = {
    name: university?.name || null,
    uname: university?.uname || slug,
    city: university?.city || null,
    shortnote: university?.shortnote || null,
    meta_title: university?.meta_title || null,
    meta_description: university?.meta_description || null,
    meta_keyword: university?.meta_keyword || null,
    og_image_path: university?.og_image_path || null,
  }

  return resolveUniversityMeta(universityMetaSource, 'overview')
}

export default async function UniversityPage({ params }: Props) {
  const { slug } = await params
  const university = await getUniversityFull(slug)
  if (!university) notFound()

  const mappedUniversity = serializeBigInt(university) as any
  const overviews = (mappedUniversity.overviews || []).map((ov: any) => ({
    ...ov,
    tab: ov.title || ov.tab
  }))

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <UniversityOverview
            overviews={overviews}
            universityName={university.name}
            universitySlug={slug}
          />
        </div>
        <aside className="col-span-1 space-y-8">
          <SideInquiryForm type="university" context={{ slug, universityName: university.name }} />
          <FeaturedUniversities variant="sidebar" excludeSlug={slug} />
          <UniversityCoursesCard />
        </aside>
      </div>
    </>
  )
}
