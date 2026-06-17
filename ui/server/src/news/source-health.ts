// Per-source health for the cockpit's "Sources" panel. Two cheap signals, combined:
//   1. FETCH OUTCOME — fetchRss records, per feed, the result of the last attempt (ok / unchanged /
//      empty / error) into news-source-health.json each cycle. This is the definitive "is it failing"
//      signal (a 403/timeout the firehose can't show, because a failed feed simply yields no items).
//   2. LAST DATA — derived from the firehose on disk: when an item from each source last arrived, and
//      how many in the last 24h / 7d.
// Combined into a health verdict (healthy / quiet / failing / idle) per source. Read-only + never throws.

import fs from 'node:fs'
import path from 'node:path'
import { readFeed } from './feed'

const HEALTH_FILE = 'news-source-health.json'

export type FetchStatus = 'ok' | 'unchanged' | 'empty' | 'error'
// `fails` = consecutive error cycles (reset to 0 on any successful fetch). It is what keeps a single
// transient blip — undici's network-wide "fetch failed" that hits ~every feed at once for one cycle and
// recovers the next — from flipping the whole board to "failing".
interface HealthEntry { status: FetchStatus; lastOkAt?: string; lastErrAt?: string; lastError?: string; lastItemsAt?: string; items?: number; fails?: number; at: string }
type HealthFile = Record<string, HealthEntry>

/** Merge this cycle's RSS fetch outcomes into the persisted health file (never throws). Keeps the last
 *  success time AND the last time the feed actually brought items, even across failing/empty cycles. */
export function recordRssHealth(stateDir: string, outcomes: Map<string, { status: FetchStatus; items: number; note?: string }>, nowIso: string): void {
  if (!outcomes.size) return
  try {
    const file = path.join(stateDir, HEALTH_FILE)
    let cur: HealthFile = {}
    try { cur = JSON.parse(fs.readFileSync(file, 'utf8')) || {} } catch { cur = {} }
    for (const [name, o] of outcomes) {
      const prev = cur[name] || ({} as HealthEntry)
      const e: HealthEntry = { ...prev, status: o.status, items: o.items, at: nowIso }
      if (o.status === 'error') { e.lastErrAt = nowIso; e.lastError = o.note; e.fails = (prev.fails || 0) + 1 }
      else { e.lastOkAt = nowIso; e.fails = 0 } // ok / unchanged / empty all mean the fetch itself succeeded → streak resets
      if (o.items > 0) e.lastItemsAt = nowIso // the last time this feed actually delivered news
      cur[name] = e
    }
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(file, JSON.stringify(cur))
  } catch {
    /* health is best-effort; a write miss never affects ingestion */
  }
}

export type Health = 'healthy' | 'quiet' | 'failing' | 'idle'
export interface SourceRow {
  name: string
  region: string
  feed_type: string // 'news' | 'filing' | 'recall' (RSS: inferred from source_name; adapters: fixed)
  via: string // rss | gdelt | nse | hkex | asx | gov
  health: Health
  last_data_at: string | null // when an item from this source last arrived (firehose)
  items_24h: number
  items_7d: number
  fetch_status: FetchStatus | null // last fetch outcome (RSS only)
  last_error: string | null
  last_ok_at: string | null
}
export interface SourcesReport {
  updated_at: string
  counts: { total: number; healthy: number; quiet: number; failing: number; idle: number }
  sources: SourceRow[]
}

const MS_H = 3_600_000
// "Failing" must mean a SUSTAINED problem, not one unlucky cycle. undici raises a generic "fetch failed"
// for transient host-level network blips (a momentary DNS/connectivity hiccup, the laptop waking), and
// when one lands it tends to hit ~every feed in the same cycle — then the next cycle recovers. So a feed
// is only failing once it has either errored for ≥2 cycles in a row OR not fetched OK in 2h (genuinely
// dark). A feed that errored once but succeeded minutes ago stays healthy/quiet — no false red board.
const FAIL_STREAK = 2
const STALE_OK_MS = 2 * MS_H
// rss_feeds.json carries no explicit nature field, so classify an RSS feed by its source_name.
// HIGH-PRECISION only: reclassify the unambiguous filing / recall feeds (SEC EDGAR, exchange
// filings, FDA/CPSC recalls); everything else stays 'news' to avoid mislabelling general news.
const tier = (source_name: string): string => {
  const n = source_name.toLowerCase()
  if (/\bedgar\b|exchange filing|\bsedar\b|hkexnews|\blodr\b|\bfiling\b/.test(n)) return 'filing'
  if (/\brecall/.test(n)) return 'recall'
  return 'news'
}

/** Build the full per-source report. Roster = every wired RSS feed + the JSON adapters; last-data from
 *  the firehose; fetch status from the health file. Never throws (returns an empty report on any error). */
export function buildSourcesReport(repoRoot: string, stateDir: string, opts: { now?: () => Date } = {}): SourcesReport {
  const now = (opts.now || (() => new Date()))()
  const nowMs = now.getTime()
  const empty: SourcesReport = { updated_at: now.toISOString(), counts: { total: 0, healthy: 0, quiet: 0, failing: 0, idle: 0 }, sources: [] }
  try {
    // 1. roster — every RSS feed (by source_name) + the fixed JSON-adapter sources
    const feedsDoc = JSON.parse(fs.readFileSync(path.join(repoRoot, 'frameworks/screener/rss_feeds.json'), 'utf8'))
    const roster = new Map<string, { region: string; feed_type: string; via: string }>()
    for (const f of feedsDoc.feeds || []) {
      if (f?.source_name && !roster.has(f.source_name)) roster.set(f.source_name, { region: '—', feed_type: tier(f.source_name), via: 'rss' })
    }
    const ADAPTERS: { name: string; via: string; feed_type: string; region: string }[] = [
      { name: 'GDELT — global press index', via: 'gdelt', feed_type: 'news', region: 'GLOBAL' },
      { name: 'BSE / NSE Exchange Filing', via: 'nse', feed_type: 'filing', region: 'IN' },
      { name: 'HKEXnews (HK Exchange Filing)', via: 'hkex', feed_type: 'filing', region: 'HK' },
      { name: 'ASX (Australia Exchange Filing)', via: 'asx', feed_type: 'filing', region: 'AU' },
      { name: 'openFDA — drug/device recalls + clearances', via: 'gov', feed_type: 'recall', region: 'US' },
    ]
    for (const a of ADAPTERS) roster.set(a.name, { region: a.region, feed_type: a.feed_type, via: a.via })

    // 2. adapter last-data, aggregated BY VIA from the firehose (their items carry the per-publisher
    //    firewall name, not the adapter label, so we can't match by name — but `via` is exact).
    const items = readFeed(repoRoot, 7, { now: opts.now }).items
    const lastByVia = new Map<string, string>()
    const c24Via = new Map<string, number>()
    const c7Via = new Map<string, number>()
    for (const it of items) {
      const tms = Date.parse(it.ts)
      const via = it.via || 'rss'
      if (!lastByVia.has(via) || it.ts > lastByVia.get(via)!) lastByVia.set(via, it.ts)
      c7Via.set(via, (c7Via.get(via) || 0) + 1)
      if (nowMs - tms <= 24 * MS_H) c24Via.set(via, (c24Via.get(via) || 0) + 1)
    }

    // 3. per-FEED fetch outcomes (RSS) — the definitive signal, keyed by the feed's own source_name
    let health: HealthFile = {}
    try { health = JSON.parse(fs.readFileSync(path.join(stateDir, HEALTH_FILE), 'utf8')) || {} } catch { health = {} }

    // 4. classify each source
    const rows: SourceRow[] = []
    for (const [name, meta] of roster) {
      const isAdapter = meta.via !== 'rss'
      let healthV: Health
      let lastData: string | null
      let items24h = 0
      let items7d = 0
      let fetch_status: FetchStatus | null = null
      let last_error: string | null = null
      let last_ok_at: string | null = null

      if (isAdapter) {
        lastData = lastByVia.get(meta.via) || null
        items24h = c24Via.get(meta.via) || 0
        items7d = c7Via.get(meta.via) || 0
        const dataMs = lastData ? Date.parse(lastData) : NaN
        healthV = items24h > 0 ? 'healthy' : items7d > 0 || (!Number.isNaN(dataMs) && nowMs - dataMs <= 7 * 24 * MS_H) ? 'quiet' : 'idle'
      } else {
        const h = health[name]
        fetch_status = h?.status || null
        last_error = h?.lastError || null
        last_ok_at = h?.lastOkAt || null
        lastData = h?.lastItemsAt || null // when this feed last actually delivered news
        const okMs = h?.lastOkAt ? Date.parse(h.lastOkAt) : NaN
        const errMs = h?.lastErrAt ? Date.parse(h.lastErrAt) : NaN
        const itemMs = lastData ? Date.parse(lastData) : NaN
        // sustained: ≥2 error cycles in a row, OR no successful fetch in the last 2h (also covers a
        // pre-existing health file written before `fails` was tracked, where the streak is still 0).
        const sustained = (h?.fails || 0) >= FAIL_STREAK || Number.isNaN(okMs) || nowMs - okMs > STALE_OK_MS
        if (fetch_status === 'error' && (Number.isNaN(okMs) || errMs >= okMs) && sustained) {
          healthV = 'failing' // last fetch errored, hasn't recovered, and the failure is sustained
        } else if (!fetch_status) {
          healthV = 'idle' // engine hasn't fetched it yet (fresh start / just wired)
        } else if (fetch_status === 'ok' || fetch_status === 'unchanged' || (h?.items || 0) > 0 || (!Number.isNaN(itemMs) && nowMs - itemMs <= 3 * 24 * MS_H)) {
          // ok = items right now; unchanged (304) = the feed has content and we're up to date — both healthy
          healthV = 'healthy'
        } else {
          healthV = 'quiet' // status 'empty' — fetched fine but returned no items (dry / low-frequency)
        }
      }

      rows.push({ name, region: meta.region, feed_type: meta.feed_type, via: meta.via, health: healthV, last_data_at: lastData, items_24h: items24h, items_7d: items7d, fetch_status, last_error, last_ok_at })
    }

    // sort: failing first (the problems, pinned at the very top), then the healthy bulk, then quiet,
    // then idle; within a tier, freshest data first.
    const order: Record<Health, number> = { failing: 0, healthy: 1, quiet: 2, idle: 3 }
    rows.sort((a, b) => order[a.health] - order[b.health] || (Date.parse(b.last_data_at || '0') || 0) - (Date.parse(a.last_data_at || '0') || 0) || a.name.localeCompare(b.name))

    const counts = { total: rows.length, healthy: 0, quiet: 0, failing: 0, idle: 0 }
    for (const r of rows) counts[r.health]++
    return { updated_at: now.toISOString(), counts, sources: rows }
  } catch {
    return empty
  }
}
