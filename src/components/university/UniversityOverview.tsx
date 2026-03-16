import Link from 'next/link'

type Section = {
  id: number
  tab?: string | null
  description?: string | null
  position?: number | null
}

type Props = {
  overviews: Section[]
  universityName: string | null
  universitySlug: string | null
}

export default function UniversityOverview({ overviews, universityName, universitySlug }: Props) {
  if (overviews.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center text-gray-500">
        <p className="text-lg">No overview information available for {universityName}.</p>
        <Link href="/universities/universities-in-malaysia" className="mt-4 inline-flex text-blue-600 hover:underline text-sm">
          ← Browse all universities
        </Link>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm space-y-6">
      {overviews.map(section => (
        <div key={section.id}>
          {section.tab && (
            <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">{section.tab}</h2>
          )}
          {section.description && (
            <div
              className="content-html prose prose-sm max-w-none text-gray-700 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: section.description }}
            />
          )}
        </div>
      ))}
    </div>
  )
}
