export interface YearStat {
  ms: number
  episodes: number
}

export interface ShowStat {
  name: string
  totalMs: number
  totalEpisodes: number
  byYear: Record<string, YearStat>
}

export interface HourStat {
  ms: number
  episodes: number
}

export interface PodcastStats {
  meta: {
    generated: string
    totalHours: number
    totalEpisodes: number
    uniqueShows: number
    years: number[]
  }
  shows: ShowStat[]
  /** year → hour (0–23 as string) → stats */
  hourly: Record<string, Record<string, HourStat>>
}
