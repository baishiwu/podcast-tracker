import { useState, useEffect } from 'react'
import type { PodcastStats } from '@/types/history'

interface State {
  data: PodcastStats | null
  loading: boolean
  error: string | null
}

export function useHistoryData() {
  const [state, setState] = useState<State>({ data: null, loading: true, error: null })

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}data/podcast-stats.json`)
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json() as Promise<PodcastStats>
      })
      .then(data => setState({ data, loading: false, error: null }))
      .catch(e => setState({ data: null, loading: false, error: e.message }))
  }, [])

  return state
}
