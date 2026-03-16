import { notFound } from 'next/navigation'
import { resolveExamMeta } from '@/lib/seo/metadata'
import { breadcrumbJsonLd } from '@/lib/seo/structured-data'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL } from '@/lib/constants'
import { getExamBySlug, getAllExams } from '@/lib/queries/resources'
import ExamDetailClient from './ExamDetailClient'

interface Params { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Params) {
  const { slug } = await params
  const exam = await getExamBySlug(slug)
  if (!exam) return { title: 'Exam Details | Education Malaysia' }
  return resolveExamMeta(exam)
}

export default async function ExamDetailPage({ params }: Params) {
  const { slug } = await params
  const exam = await getExamBySlug(slug)
  const allExams = await getAllExams()

  if (!exam) {
    notFound()
  }

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([
        { name: 'Home', url: SITE_URL },
        { name: 'Resources', url: `${SITE_URL}/resources` },
        { name: 'Exams', url: `${SITE_URL}/resources/exams` },
        { name: exam.page_name || '', url: `${SITE_URL}/resources/exams/${slug}` }
      ])} />
      <ExamDetailClient exam={exam as any} allExams={allExams as any} />
    </>
  )
}
