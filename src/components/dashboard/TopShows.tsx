import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatMinutes } from '@/lib/utils'
import type { ShowStats } from '@/types/spotify'

interface TopShowsProps {
  shows: ShowStats[]
  isLoading: boolean
}

export function TopShows({ shows, isLoading }: TopShowsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Top shows</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-md shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : shows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No podcast listens found</p>
        ) : (
          shows.map(({ show, episodeCount, totalMinutes }, index) => (
            <div key={show.id} className="flex items-center gap-3 group">
              <span className="text-xs text-muted-foreground w-4 text-right shrink-0">{index + 1}</span>
              <img
                src={show.images[0]?.url}
                alt={show.name}
                className="h-12 w-12 rounded-md object-cover shrink-0 bg-muted"
              />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm truncate">{show.name}</p>
                <p className="text-xs text-muted-foreground truncate">{show.publisher}</p>
              </div>
              <div className="text-right shrink-0 space-y-0.5">
                <Badge variant="secondary" className="text-xs">
                  {episodeCount} ep{episodeCount !== 1 ? 's' : ''}
                </Badge>
                <p className="text-xs text-muted-foreground">{formatMinutes(totalMinutes)}</p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
