import { useMemo, useState } from 'react'
import type { HourStat } from '@/types/history'

interface Props {
  /** year → hour string → stats */
  hourly: Record<string, Record<string, HourStat>>
  years: number[]
}

const HOURS = Array.from({ length: 24 }, (_, i) => i)

function formatHour(h: number): string {
  if (h === 0) return '12a'
  if (h === 12) return '12p'
  if (h < 12) return `${h}a`
  return `${h - 12}p`
}

function msToHours(ms: number) {
  return (ms / 3_600_000).toFixed(1)
}

/** Blue hue ramp: no data = stone-100, max = dark navy */
function cellColor(intensity: number): string {
  if (intensity === 0) return '#f5f5f4'
  // hsl(215, 40%, 88%) → hsl(215, 62%, 18%)
  const lightness = Math.round(88 - intensity * 70)
  const saturation = Math.round(40 + intensity * 22)
  return `hsl(215, ${saturation}%, ${lightness}%)`
}

type TooltipAlign = 'left' | 'center' | 'right'

interface CellProps {
  intensity: number
  ms: number
  episodes: number
  year: number
  hour: number
  align: TooltipAlign
}

function Cell({ intensity, ms, episodes, year, hour, align }: CellProps) {
  const [hovered, setHovered] = useState(false)

  const tooltipPos =
    align === 'left' ? 'left-0' :
    align === 'right' ? 'right-0' :
    'left-1/2 -translate-x-1/2'

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div
        className="w-full rounded-sm transition-opacity"
        style={{
          height: 22,
          backgroundColor: cellColor(intensity),
          opacity: hovered ? 0.75 : 1,
        }}
      />
      {hovered && (
        <div className={`absolute z-10 bottom-full ${tooltipPos} mb-1.5 bg-white border border-stone-200 shadow-md px-2.5 py-1.5 text-xs whitespace-nowrap pointer-events-none`}>
          <div className="font-semibold text-stone-700 mb-0.5">
            {year} · {formatHour(hour)}
          </div>
          <div className="text-stone-500">{msToHours(ms)}h · {episodes} episodes</div>
        </div>
      )}
    </div>
  )
}

export function HourlyHeatmap({ hourly, years }: Props) {
  const globalMax = useMemo(() => {
    let max = 0
    for (const year of years) {
      const yData = hourly[String(year)] ?? {}
      for (const h of HOURS) {
        max = Math.max(max, yData[String(h)]?.ms ?? 0)
      }
    }
    return max
  }, [hourly, years])

  const labelHours = [0, 3, 6, 9, 12, 15, 18, 21]

  return (
    <div>
      <h2 className="font-display text-xl font-semibold text-stone-800 mb-1">
        When you listen
      </h2>
      <p className="text-xs text-stone-400 uppercase tracking-widest mb-6">
        Hours listened by time of day · local time
      </p>

      <div className="overflow-x-auto">
        <div style={{ minWidth: 560 }}>
          {/* Hour axis labels */}
          <div className="flex mb-1 ml-10">
            {HOURS.map(h => (
              <div key={h} className="flex-1 text-center">
                {labelHours.includes(h) && (
                  <span className="text-[10px] text-stone-400">{formatHour(h)}</span>
                )}
              </div>
            ))}
          </div>

          {/* Rows — one per year */}
          <div className="space-y-1">
            {years.map(year => {
              const yData = hourly[String(year)] ?? {}
              return (
                <div key={year} className="flex items-center gap-1">
                  <div className="w-9 shrink-0 text-right text-[11px] text-stone-400 pr-1">
                    {year}
                  </div>
                  {HOURS.map(h => {
                    const stat = yData[String(h)]
                    const ms = stat?.ms ?? 0
                    const episodes = stat?.episodes ?? 0
                    const intensity = globalMax > 0 ? ms / globalMax : 0
                    const align: TooltipAlign =
                      h <= 5 ? 'left' : h >= 17 ? 'right' : 'center'
                    return (
                      <div key={h} className="flex-1">
                        <Cell
                          intensity={intensity}
                          ms={ms}
                          episodes={episodes}
                          year={year}
                          hour={h}
                          align={align}
                        />
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>

          {/* Color scale legend */}
          <div className="flex items-center gap-2 mt-4 ml-10">
            <span className="text-[10px] text-stone-400">Less</span>
            <div className="flex gap-0.5">
              {[0, 0.2, 0.4, 0.6, 0.8, 1].map(v => (
                <div
                  key={v}
                  className="w-4 h-3 rounded-sm"
                  style={{ backgroundColor: cellColor(v) }}
                />
              ))}
            </div>
            <span className="text-[10px] text-stone-400">More</span>
          </div>
        </div>
      </div>
    </div>
  )
}
