import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { ShowStat } from '@/types/history'

interface Props {
  shows: ShowStat[]
  years: number[]
  topN?: number
}

const msToHours = (ms: number) => Math.round(ms / 3_600_000)

/** Blue ramp matching heatmap/bump chart: rank 1 = dark navy, last = pale blue */
function barColor(i: number, total: number): string {
  const t = total > 1 ? i / (total - 1) : 0
  const lightness = Math.round(18 + t * 44) // 18% → 62%
  const saturation = Math.round(62 - t * 14) // 62% → 48%
  return `hsl(215, ${saturation}%, ${lightness}%)`
}

function niceMax(value: number): number {
  if (value <= 10) return Math.ceil(value)
  if (value <= 100) return Math.ceil(value / 10) * 10
  if (value <= 500) return Math.ceil(value / 50) * 50
  if (value <= 1000) return Math.ceil(value / 100) * 100
  if (value <= 5000) return Math.ceil(value / 500) * 500
  return Math.ceil(value / 1000) * 1000
}

interface TooltipPayload {
  value: number
  payload: { name: string; hours: number; episodes: number }
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="bg-white border border-stone-200 px-3 py-2 text-xs shadow-md">
      <div className="font-semibold text-stone-800 mb-1">{d.name}</div>
      <div className="text-stone-500">{d.hours.toLocaleString()} hours</div>
      <div className="text-stone-400">{d.episodes.toLocaleString()} episodes</div>
    </div>
  )
}

export function TopShowsChart({ shows, years, topN = 25 }: Props) {
  const [selectedYear, setSelectedYear] = useState<number | null>(null)

  const data = useMemo(() => {
    const key = selectedYear ? String(selectedYear) : null
    return shows
      .map(s => ({
        name: s.name,
        hours: key ? msToHours(s.byYear[key]?.ms ?? 0) : msToHours(s.totalMs),
        episodes: key ? (s.byYear[key]?.episodes ?? 0) : s.totalEpisodes,
      }))
      .filter(s => s.hours > 0)
      .sort((a, b) => b.hours - a.hours)
      .slice(0, topN)
    // rank 1 is first → renders at top of horizontal bar chart
  }, [shows, selectedYear, topN])

  const maxHours = data[0]?.hours ?? 1

  return (
    <div>
      <div className="flex items-baseline justify-between flex-wrap gap-3 mb-1">
        <h2 className="font-display text-xl font-semibold text-stone-800">
          {selectedYear ? `Top shows in ${selectedYear}` : 'All-time top shows'}
        </h2>
      </div>
      <p className="text-xs text-stone-400 uppercase tracking-widest mb-4">
        Ranked by hours listened
      </p>

      {/* Year filter */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-6 text-xs">
        <button
          onClick={() => setSelectedYear(null)}
          className={`pb-0.5 transition-colors ${
            selectedYear === null
              ? 'text-stone-800 border-b border-stone-800'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          All time
        </button>
        {years.map(y => (
          <button
            key={y}
            onClick={() => setSelectedYear(y)}
            className={`pb-0.5 transition-colors ${
              selectedYear === y
                ? 'text-stone-800 border-b border-stone-800'
                : 'text-stone-400 hover:text-stone-600'
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={Math.min(data.length, topN) * 28 + 40}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 64, bottom: 0, left: 0 }}
          barCategoryGap="30%"
        >
          <XAxis
            type="number"
            domain={[0, niceMax(maxHours)]}
            tickFormatter={v => `${v}h`}
            tick={{ fontSize: 11, fill: '#a8a29e' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={200}
            tick={{ fontSize: 12, fill: '#44403c' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={name => name.length > 28 ? name.slice(0, 27) + '…' : name}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f5f4' }} />
          <Bar dataKey="hours" radius={[0, 2, 2, 0]}>
            {data.map((_, i) => (
              <Cell
                key={i}
                fill={barColor(i, data.length)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
