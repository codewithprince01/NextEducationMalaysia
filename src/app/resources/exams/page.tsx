import { resolveStaticMetaAny } from '@/lib/seo/metadata'
import ExamsClient from './ExamsClient'
import { getAllExams } from '@/lib/queries/resources'

export async function generateMetadata() {
  return resolveStaticMetaAny(
    ['exams', 'Exams', 'resources/exams'],
    '/resources/exams',
    'English Language Exams Guide - IELTS, PTE, MUET, TOEFL | Education Malaysia',
  )
}

export default async function ExamsPage() {
  const exams = await getAllExams()
  return <ExamsClient initialExams={(exams || []) as any} />
}
