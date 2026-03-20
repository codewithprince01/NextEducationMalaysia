export default function UniversityRankings({
  rank,
  qs_rank,
  times_rank,
  qs_asia_rank,
  compact = false,
}: {
  rank?: string | number | null
  qs_rank?: string | number | null
  times_rank?: string | number | null
  qs_asia_rank?: string | number | null
  compact?: boolean
}) {
  const cardPad = compact ? 'p-3' : 'p-5'
  const textSize = compact ? 'text-xl' : 'text-2xl'

  const cards = [
    {
      label: 'World Rank',
      value: rank ? `#${rank}` : '#397',
      from: 'from-blue-400',
      to: 'to-blue-500',
    },
    {
      label: 'QS Rank',
      value: qs_rank || '1001-1400',
      from: 'from-green-400',
      to: 'to-green-500',
    },
    {
      label: 'Times Rank',
      value: times_rank || '1501+',
      from: 'from-purple-400',
      to: 'to-purple-500',
    },
    ...(qs_asia_rank
      ? [
          {
            label: 'QS Asia Rank',
            value: qs_asia_rank,
            from: 'from-orange-400',
            to: 'to-orange-500',
          },
        ]
      : []),
  ]

  return (
    <div className="bg-white rounded-xl shadow-md p-4 w-full border border-gray-100">
      <h3 className={`${compact ? 'text-base' : 'text-lg'} font-semibold text-gray-900 mb-3`}>
        Global Rankings
      </h3>
      <div className={`grid ${compact ? 'grid-cols-2 gap-3' : 'grid-cols-1 sm:grid-cols-2 gap-4'}`}>
        {cards.map(({ label, value, from, to }) => (
          <div
            key={label}
            className={`bg-linear-to-r ${from} ${to} rounded-lg ${cardPad} text-white shadow text-center transition-all hover:shadow-lg hover:scale-[1.02]`}
          >
            <p className={`${textSize} font-bold`}>{value}</p>
            <p className="text-xs opacity-90">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
