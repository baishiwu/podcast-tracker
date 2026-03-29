import { AlertCircle } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Header } from '@/components/layout/Header'
import { StatsBar } from './StatsBar'
import { ActivityChart } from './ActivityChart'
import { TopShows } from './TopShows'
import { RecentEpisodes } from './RecentEpisodes'
import { FollowedShows } from './FollowedShows'
import { useSpotifyData } from '@/hooks/useSpotifyData'

export function DashboardPage() {
  const {
    profile,
    episodes,
    followedShows,
    topShows,
    activityByDay,
    stats,
    isLoading,
    loadingMore,
    hasMore,
    loadMore,
    error,
  } = useSpotifyData()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header profile={profile} />

      <main className="flex-1 container mx-auto px-4 py-6 space-y-6 max-w-4xl">
        {error && !(error instanceof Error && error.message === 'session_expired') && (
          <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Failed to load data. Check your connection and try reconnecting.</span>
          </div>
        )}

        <StatsBar
          totalEpisodes={stats.totalEpisodes}
          totalMinutes={stats.totalMinutes}
          uniqueShows={stats.uniqueShows}
          isLoading={isLoading}
        />

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="shows">Shows</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <ActivityChart data={activityByDay} isLoading={isLoading} />
            <TopShows shows={topShows} isLoading={isLoading} />
          </TabsContent>

          <TabsContent value="recent" className="mt-4">
            <RecentEpisodes
              episodes={episodes}
              isLoading={isLoading}
              hasMore={hasMore}
              loadingMore={loadingMore}
              onLoadMore={loadMore}
            />
          </TabsContent>

          <TabsContent value="shows" className="mt-4">
            <FollowedShows shows={followedShows} isLoading={isLoading} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
