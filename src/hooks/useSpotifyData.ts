import { useQuery } from '@tanstack/react-query'
import { useMemo, useCallback, useState } from 'react'
import { fetchProfile, fetchRecentlyPlayed, fetchFollowedShows, SpotifyAuthError } from '@/lib/spotify'
import { useAuth } from '@/context/AuthContext'
import type { RecentlyPlayedItem, ShowStats, DayActivity } from '@/types/spotify'

function isPodcastEpisode(item: RecentlyPlayedItem): boolean {
  return (
    item.track.type === 'episode' ||
    item.track.show !== undefined
  )
}

export function useSpotifyData() {
  const { accessToken, handleTokenExpired } = useAuth()
  const [allItems, setAllItems] = useState<RecentlyPlayedItem[]>([])
  const [loadingMore, setLoadingMore] = useState(false)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)

  const handleError = useCallback((err: unknown) => {
    if (err instanceof SpotifyAuthError) handleTokenExpired()
  }, [handleTokenExpired])

  const profileQuery = useQuery({
    queryKey: ['profile', accessToken],
    queryFn: () => fetchProfile(accessToken!),
    enabled: !!accessToken,
  })

  const recentQuery = useQuery({
    queryKey: ['recently-played', accessToken],
    queryFn: async () => {
      const data = await fetchRecentlyPlayed(accessToken!)
      const episodes = data.items.filter(isPodcastEpisode)
      setAllItems(episodes)
      setCursor(data.cursors?.before ?? null)
      setHasMore(!!data.next)
      return data
    },
    enabled: !!accessToken,
  })

  const followedQuery = useQuery({
    queryKey: ['followed-shows', accessToken],
    queryFn: () => fetchFollowedShows(accessToken!),
    enabled: !!accessToken,
  })

  // Surface auth errors
  if (recentQuery.error) handleError(recentQuery.error)
  if (profileQuery.error) handleError(profileQuery.error)

  const loadMore = useCallback(async () => {
    if (!accessToken || !cursor || loadingMore) return
    setLoadingMore(true)
    try {
      const data = await fetchRecentlyPlayed(accessToken, cursor)
      const episodes = data.items.filter(isPodcastEpisode)
      setAllItems((prev) => [...prev, ...episodes])
      setCursor(data.cursors?.before ?? null)
      setHasMore(!!data.next)
    } catch (err) {
      handleError(err)
    } finally {
      setLoadingMore(false)
    }
  }, [accessToken, cursor, loadingMore, handleError])

  const topShows = useMemo((): ShowStats[] => {
    const map = new Map<string, ShowStats>()
    for (const item of allItems) {
      const show = item.track.show
      if (!show) continue
      const existing = map.get(show.id)
      if (existing) {
        existing.episodeCount++
        existing.totalMinutes += item.track.duration_ms / 60000
        if (item.played_at > existing.lastPlayed) existing.lastPlayed = item.played_at
      } else {
        map.set(show.id, {
          show,
          episodeCount: 1,
          totalMinutes: item.track.duration_ms / 60000,
          lastPlayed: item.played_at,
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.episodeCount - a.episodeCount)
  }, [allItems])

  const activityByDay = useMemo((): DayActivity[] => {
    const map = new Map<string, number>()
    for (const item of allItems) {
      const day = item.played_at.slice(0, 10)
      map.set(day, (map.get(day) ?? 0) + 1)
    }
    // Sort ascending for chart
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, episodes]) => ({ date, episodes }))
  }, [allItems])

  const stats = useMemo(() => {
    const totalEpisodes = allItems.length
    const totalMinutes = allItems.reduce((s, i) => s + i.track.duration_ms / 60000, 0)
    const uniqueShows = new Set(allItems.map((i) => i.track.show?.id).filter(Boolean)).size
    return { totalEpisodes, totalMinutes, uniqueShows }
  }, [allItems])

  const isLoading = profileQuery.isLoading || recentQuery.isLoading || followedQuery.isLoading

  return {
    profile: profileQuery.data,
    episodes: allItems,
    followedShows: followedQuery.data?.items ?? [],
    topShows,
    activityByDay,
    stats,
    isLoading,
    loadingMore,
    hasMore,
    loadMore,
    error: recentQuery.error ?? profileQuery.error ?? null,
  }
}
