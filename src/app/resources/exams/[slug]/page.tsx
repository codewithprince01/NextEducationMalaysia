import { notFound } from 'next/navigation'
import { extractMetadataText, resolveExamMeta } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/constants'
import { getExamBySlug, getAllExams } from '@/lib/queries/resources'
import ExamDetailClient from './ExamDetailClient'
import { serializeBigInt } from '@/lib/utils'

interface Params { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params) {
  const { slug } = await params
  const exam = await getExamBySlug(slug)
  if (!exam) return { title: 'Exam Details | Education Malaysia' }
  return resolveExamMeta(exam)
}

export default async function ExamDetailPage({ params }: Params) {
  const { slug } = await params
  const examData = await getExamBySlug(slug)
  const allExamsData = await getAllExams()

  if (!examData) {
    notFound()
  }

  const exam = serializeBigInt(examData)
  const allExams = serializeBigInt(allExamsData)
  const meta = await resolveExamMeta(examData as any)
  const { title, description } = extractMetadataText(meta)

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Resources', url: `${SITE_URL}/resources` },
        { name: 'Exams', url: `${SITE_URL}/resources/exams` },
        { name: (exam as any).page_name || (exam as any).name || '', url: `${SITE_URL}/resources/exams/${slug}` }
      ], { name: title, description })} />
      <ExamDetailClient exam={exam as any} allExams={allExams as any} />
    </>
  )
}
