import { Loader2 } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { formatRelativeDate, formatMinutes } from '@/lib/utils'
import type { RecentlyPlayedItem } from '@/types/spotify'

interface RecentEpisodesProps {
  episodes: RecentlyPlayedItem[]
  isLoading: boolean
  hasMore: boolean
  loadingMore: boolean
  onLoadMore: () => void
}

export function RecentEpisodes({ episodes, isLoading, hasMore, loadingMore, onLoadMore }: RecentEpisodesProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Recent episodes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="h-12 w-12 rounded-md shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-3 w-10 shrink-0" />
            </div>
          ))
        ) : episodes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No recent podcast episodes found</p>
        ) : (
          <>
            {episodes.map((item, index) => {
              const show = item.track.show
              const imageUrl = show?.images[0]?.url ?? item.track.images?.[0]?.url
              return (
                <div
                  key={`${item.played_at}-${index}`}
                  className="flex items-start gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={show?.name ?? ''}
                      className="h-12 w-12 rounded-md object-cover shrink-0 bg-muted"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-md bg-muted shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm leading-snug line-clamp-2">{item.track.name}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {show?.name}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-muted-foreground">{formatRelativeDate(item.played_at)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatMinutes(item.track.duration_ms / 60000)}
                    </p>
                  </div>
                </div>
              )
            })}

            {hasMore && (
              <div className="pt-2 text-center">
                <Button variant="outline" size="sm" onClick={onLoadMore} disabled={loadingMore}>
                  {loadingMore && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Load more
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
