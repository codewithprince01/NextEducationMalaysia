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

export const revalidate = 86400

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
        const [total, programs, levels, categories, specializations, studyModesRaw] = await Promise.all([
          prisma.universityProgram.count({ where: { university_id: uni.id, status: 1 } as any }),
          prisma.universityProgram.findMany({
            where: { university_id: uni.id, status: 1 } as any,
            select: {
              id: true,
              course_name: true,
              slug: true,
              level: true,
              duration: true,
              tution_fee: true,
              intake: true,
              study_mode: true,
              application_deadline: true,
              accreditations: true,
              university_id: true,
            },
            orderBy: { course_name: 'asc' },
            take: 10,
          }),
          prisma.universityProgram.findMany({
            where: { university_id: uni.id, status: 1, level: { not: null } } as any,
            select: { level: true },
            distinct: ['level'],
            orderBy: { level: 'asc' },
          }),
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
