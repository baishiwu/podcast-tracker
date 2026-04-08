#!/usr/bin/env node
// scripts/processHistory.mjs
// Reads Spotify Extended Streaming History, filters to podcasts,
// strips IP addresses, aggregates by show+year, writes public/data/podcast-stats.json

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const historyDir = join(__dirname, '..', 'Spotify Extended Streaming History')
const outputDir = join(__dirname, '..', 'public', 'data')
const outputPath = join(outputDir, 'podcast-stats.json')

const audioFiles = readdirSync(historyDir)
  .filter(f => f.startsWith('Streaming_History_Audio_') && f.endsWith('.json'))
  .sort()

console.log(`Found ${audioFiles.length} audio history files`)

// show name → { totalMs, totalEpisodes, byYear: Map<year, { ms, episodes }> }
const showMap = new Map()
// year → hour (0-23) → { ms, episodes }
const hourlyMap = new Map()
let totalEntries = 0

for (const file of audioFiles) {
  const raw = readFileSync(join(historyDir, file), 'utf-8')
  const entries = JSON.parse(raw)
  totalEntries += entries.length

  for (const entry of entries) {
    if (!entry.episode_show_name) continue

    const date = new Date(entry.ts)
    const year = date.getFullYear().toString()
    const hour = date.getHours().toString()
    const show = entry.episode_show_name
    const ms = entry.ms_played || 0

    // Per-show aggregation
    if (!showMap.has(show)) {
      showMap.set(show, { totalMs: 0, totalEpisodes: 0, byYear: new Map() })
    }
    const stats = showMap.get(show)
    stats.totalMs += ms
    stats.totalEpisodes += 1
    if (!stats.byYear.has(year)) stats.byYear.set(year, { ms: 0, episodes: 0 })
    const ys = stats.byYear.get(year)
    ys.ms += ms
    ys.episodes += 1

    // Hourly aggregation (local time via getHours())
    if (!hourlyMap.has(year)) hourlyMap.set(year, new Map())
    const yearHours = hourlyMap.get(year)
    if (!yearHours.has(hour)) yearHours.set(hour, { ms: 0, episodes: 0 })
    const hs = yearHours.get(hour)
    hs.ms += ms
    hs.episodes += 1
  }
}

// Convert to sorted array (desc totalMs)
const shows = [...showMap.entries()]
  .map(([name, s]) => ({
    name,
    totalMs: s.totalMs,
    totalEpisodes: s.totalEpisodes,
    byYear: Object.fromEntries(s.byYear),
  }))
  .sort((a, b) => b.totalMs - a.totalMs)

// All years present across all shows
const allYears = [...new Set(shows.flatMap(s => Object.keys(s.byYear)))].sort()

const totalMs = shows.reduce((sum, s) => sum + s.totalMs, 0)
const totalEpisodes = shows.reduce((sum, s) => sum + s.totalEpisodes, 0)

// Convert hourly map to plain object
const hourly = Object.fromEntries(
  [...hourlyMap.entries()].map(([year, hours]) => [
    year,
    Object.fromEntries(hours),
  ])
)

const output = {
  meta: {
    generated: new Date().toISOString(),
    totalHours: Math.round(totalMs / 3_600_000),
    totalEpisodes,
    uniqueShows: shows.length,
    years: allYears.map(Number),
  },
  shows,
  hourly,
}

mkdirSync(outputDir, { recursive: true })
writeFileSync(outputPath, JSON.stringify(output))

const sizeKb = Math.round(Buffer.byteLength(JSON.stringify(output)) / 1024)
console.log(`✓ ${totalEntries.toLocaleString()} total entries → ${shows.length} podcast shows`)
console.log(`✓ ${(totalMs / 3_600_000).toFixed(0)} hours across ${allYears.length} years`)
console.log(`✓ Written to ${outputPath} (${sizeKb} KB)`)
