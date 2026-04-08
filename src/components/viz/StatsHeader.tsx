interface Props {
  totalHours: number
  totalEpisodes: number
  uniqueShows: number
  years: number[]
}

export function StatsHeader({ totalHours, totalEpisodes, uniqueShows, years }: Props) {
  const stats = [
    { value: totalHours.toLocaleString(), label: 'hours listened' },
    { value: totalEpisodes.toLocaleString(), label: 'episodes played' },
    { value: uniqueShows.toLocaleString(), label: 'shows' },
    { value: String(years.length), label: 'years of history' },
  ]

  return (
    <div className="border-y border-stone-200 py-5 my-6">
      <div className="flex gap-8 flex-wrap">
        {stats.map(s => (
          <div key={s.label}>
            <div className="text-2xl font-semibold text-stone-800 tabular-nums">{s.value}</div>
            <div className="text-xs uppercase tracking-widest text-stone-400 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
