import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ShowStat } from '@/types/history'

interface Props {
  shows: ShowStat[]
  years: number[]
  topN?: number
}

// Single-hue blue ramp: same hue (215°), varying lightness 18 → 56%
const COLORS = [
  'hsl(215,62%,18%)',
  'hsl(215,62%,22%)',
  'hsl(215,62%,27%)',
  'hsl(215,62%,32%)',
  'hsl(215,62%,37%)',
  'hsl(215,60%,42%)',
  'hsl(215,58%,47%)',
  'hsl(215,55%,52%)',
  'hsl(215,52%,56%)',
  'hsl(215,48%,60%)',
]

interface TooltipPayload {
  color: string
  name: string
  value: number
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: TooltipPayload[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  const sorted = [...payload]
    .filter(p => p.value != null)
    .sort((a, b) => a.value - b.value)

  return (
    <div className="bg-white border border-stone-200 px-3 py-2 text-xs shadow-md min-w-[160px]">
      <div className="text-stone-400 mb-2 uppercase tracking-widest">{label}</div>
      {sorted.map(p => (
        <div key={p.name} className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-stone-600 truncate max-w-[150px]">{p.name}</span>
          <span className="ml-auto text-stone-800 font-semibold">#{Math.abs(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

export function RankingsChart({ shows, years, topN = 10 }: Props) {
  // Track the top N shows by all-time ms
  const trackedShows = shows.slice(0, topN)

  // For each year, rank ALL shows by ms that year, then look up the tracked shows' positions
  const chartData = useMemo(() => {
    return years.map(year => {
      const key = String(year)

      // Sort all shows by ms played that year (descending)
      const ranked = shows
        .filter(s => s.byYear[key]?.ms > 0)
        .sort((a, b) => (b.byYear[key]?.ms ?? 0) - (a.byYear[key]?.ms ?? 0))

      const rankMap = new Map(ranked.map((s, i) => [s.name, i + 1]))

      const point: Record<string, number | string | null> = { year: key }
      for (const show of trackedShows) {
        const rank = rankMap.get(show.name)
        // Store as negative so rank 1 is highest on Y-axis (Recharts: larger = higher)
        point[show.name] = rank != null && rank <= 15 ? -rank : null
      }
      return point
    })
  }, [shows, years, trackedShows])

  // Only include years where at least one tracked show has data
  const activeYears = chartData.filter(d =>
    trackedShows.some(s => d[s.name] != null)
  )

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-stone-800 mb-1">
        How your top shows have ranked over time
      </h2>
      <p className="text-xs text-stone-400 uppercase tracking-widest mb-5">
        Position each year among all podcast plays
      </p>

      <ResponsiveContainer width="100%" height={340}>
        <LineChart
          data={activeYears}
          margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
        >
          <XAxis
            dataKey="year"
            tick={{ fontSize: 11, fill: '#a8a29e' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[-topN, -1]}
            ticks={Array.from({ length: topN }, (_, i) => -(i + 1))}
            tickFormatter={v => `#${Math.abs(v)}`}
            tick={{ fontSize: 11, fill: '#a8a29e' }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip content={<CustomTooltip />} />
          {trackedShows.map((show, i) => (
            <Line
              key={show.name}
              type="monotone"
              dataKey={show.name}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3, strokeWidth: 0, fill: COLORS[i % COLORS.length] }}
              activeDot={{ r: 4 }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>

      {/* Legend — fixed 5-col grid → always 2 rows for topN=10 */}
      <div className="grid grid-cols-5 gap-x-3 gap-y-2 mt-4">
        {trackedShows.map((show, i) => (
          <div key={show.name} className="flex items-center gap-1.5 text-xs text-stone-500 min-w-0">
            <span
              className="w-3 h-0.5 inline-block rounded shrink-0"
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className="truncate">{show.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
