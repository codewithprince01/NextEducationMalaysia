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
  const cards = [
    {
      label: 'World Rank',
      value: rank ? `#${rank}` : '#397',
      from: 'from-blue-500',
      to: 'to-blue-600',
    },
    {
      label: 'QS Rank',
      value: qs_rank || '1001-1400',
      from: 'from-emerald-500',
      to: 'to-emerald-600',
    },
    {
      label: 'Times Rank',
      value: times_rank || '1501+',
      from: 'from-purple-500',
      to: 'to-purple-600',
    },
    ...(qs_asia_rank
      ? [
          {
            label: 'QS Asia Rank',
            value: qs_asia_rank,
            from: 'from-amber-500',
            to: 'to-orange-500',
          },
        ]
      : []),
  ]

  return (
    <div className="bg-white rounded-2xl shadow-sm p-3.5 w-full border border-gray-100">
      <h3 className="text-sm font-bold text-gray-900 mb-2.5">
        Global Rankings
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {cards.map(({ label, value, from, to }) => (
          <div
            key={label}
            className={`bg-gradient-to-r ${from} ${to} rounded-xl py-2 px-2 text-white shadow-xs text-center transition-all hover:shadow-md`}
          >
            <p className="text-base sm:text-lg font-black tracking-tight leading-tight mb-0.5">{value}</p>
            <p className="text-[10px] sm:text-[11px] font-medium text-white/90 truncate">{label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
