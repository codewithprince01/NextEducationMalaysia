type FaqItem = {
  question: string
  answer: string
}

type Props = {
  title?: string
  faqs: FaqItem[]
}

export default function FaqSection({ title = 'Frequently Asked Questions', faqs }: Props) {
  if (!Array.isArray(faqs) || faqs.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6 md:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">{title}</h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <details
              key={`${faq.question}-${index}`}
              className="group rounded-xl border border-gray-200 bg-gray-50/50 p-4 open:bg-white"
            >
              <summary className="cursor-pointer list-none flex items-start justify-between gap-3">
                <span className="font-semibold text-gray-900">{faq.question}</span>
                <span className="text-blue-600 shrink-0 font-bold group-open:rotate-45 transition-transform">+</span>
              </summary>
              <p className="mt-3 text-gray-700 leading-relaxed whitespace-pre-line">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
