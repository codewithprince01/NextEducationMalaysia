import { notFound } from 'next/navigation'
import { getExamBySlug } from '@/lib/queries/resources'

interface Params {
  params: Promise<{ slug: string }>
}

export default async function Head({ params }: Params) {
  const { slug } = await params
  const examData = await getExamBySlug(slug)
  if (!examData) notFound()
  return null
}
