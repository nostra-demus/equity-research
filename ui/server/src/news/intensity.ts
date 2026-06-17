// Lightweight, time-windowed intensity rollup for the screener's ThemeMap. The map's "N this scan · ~X/s"
// readout reflected only the latest 5-min cycle; this lets it follow a CHOSEN window (last hour … full
// day … 7 days) for a real sense of intake intensity. It returns only AGGREGATES (per-tier counts + a small
// hourly histogram + totals), never raw rows — so a full day stays a sub-2 KB payload and the browser never
// loads thousands of items. Reads the same date-rotated firehose the feed uses, with the Drive-archive
// fallback for pruned days; one streaming pass, counts only.
import fs from 'node:fs'
import path from 'node:path'
import { NEWS, REPO_ROOT } from '../config'
import { deriveSourceTier } from './scope'
import type { CycleSummary, FeedItem } from './types'

export type IntensityWindow = 'scan' | '1h' | '4h' | 'day' | '7d'
export const INTENSITY_WINDOWS: IntensityWindow[] = ['scan', '1h', '4h', 'day', '7d']

export interface IntensityStats {
  window: IntensityWindow
  from: string | null // ISO start of the window (null for 'scan' = latest cycle only)
  to: string // ISO 'now'
  scans: number // ingest cycles counted in the window
  totalFetched: number // raw articles scanned (Σ cycle.fetched) — the intensity VOLUME
  ratePerSec: number // totalFetched ÷ window seconds — the average intake rate
  byTier: Record<string, number> // candidate items by source_tier in the window — the real source mix
  hourly: { t: string; fetched: number }[] // intake bucketed over the window (≤ ~48 points)
}

function firehosePath(date: string): string {
  return path.join(REPO_ROOT, 'screener', 'inbox', `${date}_firehose.ndjson`)
}

function windowMs(w: IntensityWindow): number | null {
  switch (w) {
    case '1h': return 3_600_000
    case '4h': return 4 * 3_600_000
    case 'day': return 24 * 3_600_000
    case '7d': return 7 * 24 * 3_600_000
    default: return null // 'scan'
  }
}

// hour buckets for ≤2-day windows, day buckets beyond — keeps the histogram ≤ ~48 points either way.
function bucketCycles(cycles: CycleSummary[], span: number | null): { t: string; fetched: number }[] {
  if (!cycles.length) return []
  const bucketMs = span != null && span > 2 * 86_400_000 ? 86_400_000 : 3_600_000
  const map = new Map<number, number>()
  for (const c of cycles) {
    const ts = c.ts ? Date.parse(c.ts) : NaN
    if (!Number.isFinite(ts)) continue
    const key = Math.floor(ts / bucketMs) * bucketMs
    map.set(key, (map.get(key) || 0) + (c.fetched || 0))
  }
  const out = [...map.entries()].sort((a, b) => a[0] - b[0]).map(([k, v]) => ({ t: new Date(k).toISOString(), fetched: v }))
  return out.length > 48 ? out.slice(-48) : out
}

export function getIntensity(window: IntensityWindow, now: Date = new Date()): IntensityStats {
  const span = windowMs(window)
  const toMs = now.getTime()
  // 'scan' reads a day of files but keeps only the latest cycle; windowed reads exactly the span (+1 day
  // so a window crossing midnight is fully covered).
  const fromMs = span == null ? toMs - 86_400_000 : toMs - span
  const days = span == null ? 1 : Math.ceil(span / 86_400_000) + 1
  const archiveDir = NEWS.newsArchiveDir

  const cycles: CycleSummary[] = []
  const byTier: Record<string, number> = {}
  for (let d = 0; d < Math.max(1, days); d++) {
    const date = new Date(toMs - d * 86_400_000).toISOString().slice(0, 10)
    let text: string
    try {
      text = fs.readFileSync(firehosePath(date), 'utf8')
    } catch {
      if (archiveDir) {
        try { text = fs.readFileSync(path.join(archiveDir, `${date}_firehose.ndjson`), 'utf8') } catch { continue }
      } else continue
    }
    for (const ln of text.split('\n')) {
      const t = ln.trim()
      if (!t) continue
      try {
        const o = JSON.parse(t)
        if (o?.kind === 'cycle_summary') {
          cycles.push(o as CycleSummary)
        } else if (o?.kind === 'item') {
          const ts = o?.ts ? Date.parse(o.ts) : NaN
          if (Number.isFinite(ts) && ts >= fromMs && ts <= toMs) {
            const tier = (o.source_tier as string) || deriveSourceTier(o as FeedItem) || 'news'
            byTier[tier] = (byTier[tier] || 0) + 1
          }
        }
      } catch { /* corrupt line — skip, never break the rollup */ }
    }
  }

  // 'scan' = the single most-recent cycle; windowed = every cycle whose ts falls in range.
  let windowCycles: CycleSummary[]
  if (span == null) {
    const latest = cycles.filter((c) => c.ts).sort((a, b) => (b.ts || '').localeCompare(a.ts || ''))[0]
    windowCycles = latest ? [latest] : []
  } else {
    windowCycles = cycles.filter((c) => {
      const ts = c.ts ? Date.parse(c.ts) : NaN
      return Number.isFinite(ts) && ts >= fromMs && ts <= toMs
    })
  }

  const totalFetched = windowCycles.reduce((a, c) => a + (c.fetched || 0), 0)
  const spanSec = span == null ? Math.max(60, NEWS.pollIntervalMin * 60) : span / 1000
  const ratePerSec = Math.round((totalFetched / Math.max(1, spanSec)) * 100) / 100

  return {
    window,
    from: span == null ? null : new Date(fromMs).toISOString(),
    to: now.toISOString(),
    scans: windowCycles.length,
    totalFetched,
    ratePerSec,
    byTier,
    hourly: bucketCycles(windowCycles, span),
  }
}
