export interface SpotifyImage {
  url: string
  height: number | null
  width: number | null
}

export interface SpotifyShow {
  id: string
  name: string
  publisher: string
  description: string
  images: SpotifyImage[]
  external_urls: { spotify: string }
}

export interface SpotifyEpisode {
  id: string
  name: string
  duration_ms: number
  description: string
  images: SpotifyImage[]
  show: SpotifyShow
  external_urls: { spotify: string }
}

export interface RecentlyPlayedItem {
  played_at: string
  // Spotify returns episodes under `track` key (not `episode`) for recently-played
  // The item has type 'episode' when it's a podcast episode
  type?: string
  track: {
    type: string
    id: string
    name: string
    duration_ms: number
    // Present on podcast episodes
    show?: SpotifyShow
    // Present when additional_types=episode is used
    description?: string
    images?: SpotifyImage[]
    external_urls: { spotify: string }
  }
}

export interface RecentlyPlayedResponse {
  items: RecentlyPlayedItem[]
  cursors: {
    before: string
    after: string
  } | null
  next: string | null
  limit: number
}

export interface SpotifyProfile {
  id: string
  display_name: string | null
  email: string
  images: SpotifyImage[]
  external_urls: { spotify: string }
}

export interface SavedShow {
  added_at: string
  show: SpotifyShow
}

export interface FollowedShowsResponse {
  items: SavedShow[]
  next: string | null
  total: number
  limit: number
  offset: number
}

export interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
  scope: string
}

// Derived types for UI
export interface ShowStats {
  show: SpotifyShow
  episodeCount: number
  totalMinutes: number
  lastPlayed: string
}

export interface DayActivity {
  date: string
  episodes: number
}
