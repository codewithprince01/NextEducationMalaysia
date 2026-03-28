'use client'

import { useEffect, useMemo, useState } from 'react'
import { Plus, Minus } from 'lucide-react'

type FaqCategory = {
  id: number
  category_name: string
  category_slug: string
}

type FaqItem = {
  id: number
  question: string
  answer: string
}

interface FaqsClientProps {
  initialCategories?: FaqCategory[]
  initialFaqsByCategory?: Record<string, FaqItem[]>
}

const formatHTML = (html?: string | null) => {
  if (!html) return ''
  return String(html)
    .replace(/&nbsp;/gi, ' ')
    .replace(/<span[^>]*>/gi, '')
    .replace(/<\/span>/gi, '')
    .replace(/style="[^"]*"/gi, '')
    .replace(/<p>\s*<\/p>/gi, '')
    .trim()
}

export default function FaqsClient({
  initialCategories = [],
  initialFaqsByCategory = {},
}: FaqsClientProps) {
  const [categories, setCategories] = useState<FaqCategory[]>(initialCategories)
  const [activeTab, setActiveTab] = useState<string>(initialCategories[0]?.category_slug || '')
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqsByCategory[initialCategories[0]?.category_slug || ''] || [])
  const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(null)
  const [loading, setLoading] = useState(initialCategories.length === 0)
  const [faqLoading, setFaqLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [faqError, setFaqError] = useState<string | null>(null)
  const apiKey = useMemo(() => (process.env.NEXT_PUBLIC_FRONTEND_API_KEY || '').trim(), [])

  const toggleQuestion = (index: number) => {
    setOpenQuestionIndex((prev) => (prev === index ? null : index))
  }

  useEffect(() => {
    if (initialCategories.length > 0) return

    const fetchCategories = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/v1/faqs', {
          headers: apiKey ? { 'x-api-key': apiKey } : {},
          cache: 'no-store',
        })

        if (!res.ok) throw new Error('Failed to fetch faq categories')
        const json = await res.json()
        const cats = Array.isArray(json?.data?.categories) ? json.data.categories : []

        const normalized: FaqCategory[] = cats.map((cat: any) => ({
          id: Number(cat?.id),
          category_name: String(cat?.category_name || '').trim(),
          category_slug: String(cat?.category_slug || '').trim(),
        })).filter((cat: FaqCategory) => !!cat.category_slug)

        setCategories(normalized)
        if (normalized.length > 0) setActiveTab(normalized[0].category_slug)
        setError(null)
      } catch (err) {
        console.error('Error fetching FAQ categories:', err)
        setError('Could not load FAQ categories. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [apiKey, initialCategories.length])

  useEffect(() => {
    if (!activeTab) return
    if (initialFaqsByCategory[activeTab]) {
      setFaqs(initialFaqsByCategory[activeTab] || [])
      return
    }

    const fetchFaqs = async () => {
      try {
        setFaqLoading(true)
        setFaqError(null)
        const res = await fetch(`/api/v1/faqs/${activeTab}`, {
          headers: apiKey ? { 'x-api-key': apiKey } : {},
          cache: 'no-store',
        })
        if (!res.ok) throw new Error('Failed to fetch faqs')

        const json = await res.json()
        const list = Array.isArray(json?.data?.faqs) ? json.data.faqs : []
        const normalized: FaqItem[] = list.map((item: any) => ({
          id: Number(item?.id),
          question: String(item?.question || '').trim(),
          answer: String(item?.answer || '').trim(),
        })).filter((item: FaqItem) => !!item.question)

        setFaqs(normalized)
      } catch (err) {
        console.error('Error fetching FAQs:', err)
        setFaqError('Could not load questions for this category.')
      } finally {
        setFaqLoading(false)
      }
    }

    fetchFaqs()
  }, [activeTab, apiKey, initialFaqsByCategory])

  if (loading) {
    return <div className="py-10 text-center text-lg text-gray-600">Loading...</div>
  }

  if (error) {
    return <div className="py-10 text-center text-lg text-red-600">{error}</div>
  }

  if (!categories || categories.length === 0) {
    return <div className="py-10 text-center text-lg text-red-600">No FAQ Categories available.</div>
  }

  return (
    <div className="py-10 px-4 max-w-5xl mx-auto">
      <h2 className="text-center text-2xl md:text-3xl font-semibold mb-6">
        Frequently Asked Questions
      </h2>

      <div className="flex flex-wrap justify-center gap-3 mb-6">
        {categories.map((cat) => (
          <button
            key={cat.category_slug}
            onClick={() => {
              setActiveTab(cat.category_slug)
              setOpenQuestionIndex(null)
            }}
            className={`px-4 py-2 rounded-2xl font-medium text-sm capitalize ${
              activeTab === cat.category_slug
                ? 'bg-blue-800 text-white'
                : 'bg-gray-100 text-blue-700'
            }`}
          >
            {cat.category_name}
          </button>
        ))}
      </div>

      {faqLoading ? (
        <div className="text-center text-gray-600">Loading questions...</div>
      ) : faqError ? (
        <div className="text-center text-red-600">{faqError}</div>
      ) : (
        <div className="space-y-4">
          {faqs.map((item, index) => (
            <div
              key={item.id || index}
              className="bg-white border rounded-2xl shadow-sm hover:shadow transition duration-300"
            >
              <button
                className="w-full flex justify-between items-center px-5 py-4 text-left text-blue-800 font-medium"
                onClick={() => toggleQuestion(index)}
              >
                <span>{item.question}</span>
                {openQuestionIndex === index ? (
                  <Minus className="text-blue-600 w-4 h-4" />
                ) : (
                  <Plus className="text-blue-600 w-4 h-4" />
                )}
              </button>

              {openQuestionIndex === index && (
                <div
                  className="px-5 pb-4 text-sm text-gray-700 whitespace-pre-line"
                  dangerouslySetInnerHTML={{ __html: formatHTML(item.answer) }}
                />
              )}
            </div>
          ))}

          {faqs.length === 0 && (
            <div className="text-center text-gray-500">
              No FAQs found for this category.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
