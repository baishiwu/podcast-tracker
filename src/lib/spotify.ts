import type {
  SpotifyProfile,
  RecentlyPlayedResponse,
  FollowedShowsResponse,
  TokenResponse,
} from '@/types/spotify'

const SPOTIFY_API = 'https://api.spotify.com/v1'
const SPOTIFY_ACCOUNTS = 'https://accounts.spotify.com'

function getRedirectUri(): string {
  if (import.meta.env.VITE_REDIRECT_URI) {
    return import.meta.env.VITE_REDIRECT_URI as string
  }
  return window.location.origin + import.meta.env.BASE_URL
}

export function getAuthUrl(challenge: string, state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID as string,
    scope: [
      'user-read-recently-played',
      'user-library-read',
      'user-read-private',
      'user-read-email',
    ].join(' '),
    redirect_uri: getRedirectUri(),
    state,
    code_challenge_method: 'S256',
    code_challenge: challenge,
  })
  return `${SPOTIFY_ACCOUNTS}/authorize?${params}`
}

export async function exchangeCodeForToken(code: string, verifier: string): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: getRedirectUri(),
    client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID as string,
    code_verifier: verifier,
  })

  const response = await fetch(`${SPOTIFY_ACCOUNTS}/api/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`Token exchange failed: ${text}`)
  }

  return response.json() as Promise<TokenResponse>
}

async function spotifyFetch<T>(path: string, token: string): Promise<T> {
  const response = await fetch(`${SPOTIFY_API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (response.status === 401) {
    throw new SpotifyAuthError('Token expired or invalid')
  }

  if (!response.ok) {
    throw new Error(`Spotify API error ${response.status}: ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export class SpotifyAuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SpotifyAuthError'
  }
}

export function fetchProfile(token: string): Promise<SpotifyProfile> {
  return spotifyFetch<SpotifyProfile>('/me', token)
}

export function fetchRecentlyPlayed(token: string, before?: string): Promise<RecentlyPlayedResponse> {
  const params = new URLSearchParams({
    limit: '50',
    additional_types: 'episode',
  })
  if (before) params.set('before', before)
  return spotifyFetch<RecentlyPlayedResponse>(`/me/player/recently-played?${params}`, token)
}

export function fetchFollowedShows(token: string, offset = 0): Promise<FollowedShowsResponse> {
  const params = new URLSearchParams({ limit: '50', offset: String(offset) })
  return spotifyFetch<FollowedShowsResponse>(`/me/shows?${params}`, token)
}
