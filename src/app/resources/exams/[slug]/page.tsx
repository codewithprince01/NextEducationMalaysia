import { notFound } from 'next/navigation'
import { resolveExamMeta } from '@/lib/seo/metadata'
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

  return (
    <ExamDetailClient exam={exam as any} allExams={allExams as any} />
  )
}
