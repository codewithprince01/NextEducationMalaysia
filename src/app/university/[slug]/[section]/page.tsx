import { notFound } from 'next/navigation'
import { getUniversityFull } from '@/lib/queries/universities'
import UniversityCoursesClient from '@/components/university/UniversityCoursesClient'
import UniversityGalleryClient from '@/components/university/UniversityGalleryClient'
import UniversityVideosClient from '@/components/university/tabs/UniversityVideosClient'
import UniversityRankingClient from '@/components/university/tabs/UniversityRankingClient'
import UniversityReviewsClient from '@/components/university/tabs/UniversityReviewsClient'
import UniversitySectionContainer from '@/components/university/UniversitySectionContainer'
import { serializeBigInt } from '@/lib/utils'
import { prisma } from '@/lib/db'
import { resolveUniversityMeta } from '@/lib/seo/metadata'
import type { Metadata } from 'next'

export const revalidate = 300

type Props = { params: Promise<{ slug: string; section: string }> }

const VALID_SECTIONS = ['courses', 'gallery', 'videos', 'ranking', 'reviews', 'scholarships']

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, section } = await params
  if (!VALID_SECTIONS.includes(section)) return {}

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
    // Real fallbacks for the social preview: most og_image_path values point at
    // the retired upload location and 404.
    banner_path: university?.banner_path || null,
    logo_path: university?.logo_path || null,
  }

  return resolveUniversityMeta(universityMetaSource, section)
}

export default async function UniversitySectionPage({ params }: Props) {
  const { slug, section } = await params
  if (!VALID_SECTIONS.includes(section)) notFound()

  const universityData = await getUniversityFull(slug)
  if (!universityData) notFound()

  const university = serializeBigInt(universityData) as any

  let initialCourseData: any = undefined
  if (section === 'courses') {
    try {
      const uni = await prisma.university.findFirst({
        where: { uname: slug, status: 1 },
        select: { id: true, name: true },
      })

      if (uni) {
        const [totalRes, programsRaw, levelsRaw, categories, specializations, studyModesRaw] = await Promise.all([
          prisma.$queryRawUnsafe(
            `SELECT COUNT(*) as total FROM university_programs WHERE university_id = ? AND status = 1`,
            uni.id
          ) as Promise<any[]>,
          prisma.$queryRawUnsafe(
            `SELECT id, course_name, slug, level, duration, tution_fee, intake, study_mode, application_deadline, accreditations, university_id
             FROM university_programs
             WHERE university_id = ? AND status = 1
             ORDER BY course_name ASC
             LIMIT 10`,
            uni.id
          ) as Promise<any[]>,
          prisma.$queryRawUnsafe(
            `SELECT DISTINCT level FROM university_programs WHERE university_id = ? AND status = 1 AND level IS NOT NULL ORDER BY level ASC`,
            uni.id
          ) as Promise<any[]>,
          prisma.$queryRawUnsafe(
            `SELECT DISTINCT cc.id, cc.name
             FROM university_programs up
             JOIN course_categories cc ON up.course_category_id = cc.id
             WHERE up.university_id = ? AND up.status = 1 AND up.course_category_id IS NOT NULL
             ORDER BY cc.name ASC`,
            uni.id
          ) as Promise<any[]>,
          prisma.$queryRawUnsafe(
            `SELECT DISTINCT cs.id, cs.name
             FROM university_programs up
             JOIN course_specializations cs ON up.specialization_id = cs.id
             WHERE up.university_id = ? AND up.status = 1 AND up.specialization_id IS NOT NULL
             ORDER BY cs.name ASC`,
            uni.id
          ) as Promise<any[]>,
          prisma.$queryRawUnsafe(
            `SELECT DISTINCT study_mode
             FROM university_programs
             WHERE university_id = ? AND status = 1 AND study_mode IS NOT NULL AND study_mode <> ''`,
            uni.id
          ) as Promise<any[]>,
        ])

        const total = Number(totalRes[0]?.total || 0)
        const programs = (programsRaw || []).map((p: any) => ({
          ...p,
          id: Number(p.id),
          university_id: Number(p.university_id),
          tution_fee: p.tution_fee != null ? String(p.tution_fee) : '',
        }))
        const levels = levelsRaw || []

        const study_modes = Array.from(
          new Set(
            studyModesRaw
              .flatMap((r: any) => String(r.study_mode || '').split(','))
              .map((v: string) => v.trim())
              .filter(Boolean)
          )
        ).sort((a: string, b: string) => a.localeCompare(b)).map((study_mode: string) => ({ study_mode }))

        initialCourseData = {
          programs: {
            data: programs,
            current_page: 1,
            last_page: Math.ceil(total / 10),
            total,
          },
          levels: levels,
          categories: categories,
          specializations: specializations,
          study_modes: study_modes,
          university: { id: uni.id, name: uni.name },
        }
      }
    } catch (e) {
      console.error('Failed to fetch initial course data:', e)
    }
  }

  const renderContent = () => {
    switch (section) {
      case 'courses': return <UniversityCoursesClient slug={slug} initialData={initialCourseData} />
      case 'gallery': return <UniversityGalleryClient slug={slug} />
      case 'videos': return <UniversityVideosClient slug={slug} />
      case 'ranking': return <UniversityRankingClient slug={slug} />
      case 'reviews': return <UniversityReviewsClient slug={slug} />
      default: return notFound()
    }
  }

  return (
    <>
      <UniversitySectionContainer
        slug={slug}
        universityName={university.name}
        fullWidth={section === 'courses'}
      >
        {renderContent()}
      </UniversitySectionContainer>
    </>
  )
}
