import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { SavedShow } from '@/types/spotify'

interface FollowedShowsProps {
  shows: SavedShow[]
  isLoading: boolean
}

export function FollowedShows({ shows, isLoading }: FollowedShowsProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          Subscriptions
          {!isLoading && shows.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted-foreground">({shows.length})</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-md" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-3 w-3/5" />
              </div>
            ))}
          </div>
        ) : shows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No followed shows found. Follow podcasts in Spotify to see them here.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {shows.map(({ show }) => (
              <a
                key={show.id}
                href={show.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="group space-y-1.5 text-sm"
              >
                <img
                  src={show.images[0]?.url}
                  alt={show.name}
                  className="aspect-square w-full rounded-md object-cover bg-muted group-hover:opacity-80 transition-opacity"
                />
                <p className="font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {show.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{show.publisher}</p>
              </a>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
