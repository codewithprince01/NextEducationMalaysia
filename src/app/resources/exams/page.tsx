import { Metadata } from 'next'
import { SITE_URL } from '@/lib/constants'
import ExamsClient from './ExamsClient'
import { getAllExams } from '@/lib/queries/resources'

export const metadata: Metadata = {
  title: 'English Language Exams Guide - IELTS, PTE, MUET, TOEFL | Education Malaysia',
  description: 'Complete guide to English language exams for studying in Malaysia. Learn about IELTS, PTE Academic, MUET and TOEFL requirements and preparation tips.',
  alternates: { canonical: `${SITE_URL}/resources/exams` },
}

export default async function ExamsPage() {
  const exams = await getAllExams()
  return <ExamsClient initialExams={(exams || []) as any} />
}
