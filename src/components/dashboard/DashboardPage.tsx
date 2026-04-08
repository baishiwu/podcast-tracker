import { useHistoryData } from '@/hooks/useHistoryData'
import { StatsHeader } from '@/components/viz/StatsHeader'
import { TopShowsChart } from '@/components/viz/TopShowsChart'
import { RankingsChart } from '@/components/viz/RankingsChart'
import { HourlyHeatmap } from '@/components/viz/HourlyHeatmap'

export function DashboardPage() {
  const { data, loading, error } = useHistoryData()

  const years = data?.meta.years.filter(y => y < 2026) ?? []

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-stone-50">
        <div className="max-w-4xl mx-auto px-6 py-5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400 mb-1">
            Personal archive
          </div>
          <h1 className="font-display text-3xl font-semibold text-stone-900 leading-tight">
            Podcast Listening History
          </h1>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 pb-20">
        {loading && (
          <div className="py-24 text-center text-stone-400 text-sm">Loading your history…</div>
        )}

        {error && (
          <div className="py-24 text-center text-stone-400 text-sm">
            Could not load data. Run <code className="font-mono bg-stone-100 px-1">npm run process</code> first.
          </div>
        )}

        {data && (
          <>
            <StatsHeader
              totalHours={data.meta.totalHours}
              totalEpisodes={data.meta.totalEpisodes}
              uniqueShows={data.meta.uniqueShows}
              years={years}
            />

            <div className="space-y-16">
              <RankingsChart shows={data.shows} years={years} />
              <HourlyHeatmap hourly={data.hourly} years={years} />
              <TopShowsChart shows={data.shows} years={years} />
            </div>
          </>
        )}
      </main>
    </div>
  )
}
