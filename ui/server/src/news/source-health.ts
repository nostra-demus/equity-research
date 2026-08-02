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
interface HealthEntry {
  status: FetchStatus
  lastOkAt?: string
  lastErrAt?: string
  lastError?: string
  lastItemsAt?: string
  items?: number
  fails?: number
  at: string
  sourceName?: string
  activeUrl?: string
  fallbackActive?: boolean
}
type HealthFile = Record<string, HealthEntry>

/** Merge this cycle's RSS fetch outcomes into the persisted health file (never throws). Keeps the last
 *  success time AND the last time the feed actually brought items, even across failing/empty cycles. */
export function recordRssHealth(stateDir: string, outcomes: Map<string, {
  status: FetchStatus
  items: number
  note?: string
  sourceName?: string
  activeUrl?: string
  fallbackActive?: boolean
}>, nowIso: string): void {
  if (!outcomes.size) return
  try {
    const file = path.join(stateDir, HEALTH_FILE)
    let cur: HealthFile = {}
    try { cur = JSON.parse(fs.readFileSync(file, 'utf8')) || {} } catch { cur = {} }
    for (const [name, o] of outcomes) {
      const prev = cur[name] || ({} as HealthEntry)
      const e: HealthEntry = {
        ...prev,
        status: o.status,
        items: o.items,
        at: nowIso,
        ...(o.sourceName ? { sourceName: o.sourceName } : {}),
        ...(o.activeUrl ? { activeUrl: o.activeUrl } : {}),
        fallbackActive: Boolean(o.fallbackActive),
      }
      if (o.status === 'error') { e.lastErrAt = nowIso; e.lastError = o.note; e.fails = (prev.fails || 0) + 1 }
      else {
        e.lastOkAt = nowIso // ok / unchanged / empty all mean the fetch itself succeeded → streak resets
        e.fails = 0
        // RECOVERED: the fetch worked this cycle, so any earlier error is no longer the current state —
        // clear it. Without this, one bad cycle (e.g. a momentary network blip that makes every feed's
        // fetch throw at once) leaves a "fetch failed" note pinned on every feed forever, so a now-healthy
        // feed keeps reading as broken in the Sources panel.
        delete e.lastError
        delete e.lastErrAt
      }
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
  id?: string // stable per connection; RSS uses the configured primary URL, so duplicate publishers stay separate
  name: string
  url?: string | null
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
  repair?: {
    state: 'none' | 'fallback_active' | 'covered_by_peer' | 'retrying' | 'needs_attention' | 'unverified'
    fallback_covered: boolean
    action: string | null
  }
}
export interface SourceCoverageGroup {
  id: string
  label: string
  total: number
  working: number
  failing: number
  unverified: number
  covered: boolean
}
export interface SourcesReport {
  updated_at: string
  counts: { total: number; healthy: number; quiet: number; failing: number; idle: number }
  coverage?: {
    connection_coverage_pct: number
    groups: SourceCoverageGroup[]
    critical_gaps: string[]
    repair_active: number
  }
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
  const empty: SourcesReport = {
    updated_at: now.toISOString(),
    counts: { total: 0, healthy: 0, quiet: 0, failing: 0, idle: 0 },
    coverage: { connection_coverage_pct: 0, groups: [], critical_gaps: [], repair_active: 0 },
    sources: [],
  }
  try {
    // 1. roster — every RSS feed (by source_name) + the fixed JSON-adapter sources
    const feedsDoc = JSON.parse(fs.readFileSync(path.join(repoRoot, 'frameworks/screener/rss_feeds.json'), 'utf8'))
    const roster = new Map<string, { name: string; url: string | null; region: string; feed_type: string; via: string }>()
    for (const f of feedsDoc.feeds || []) {
      if (!f?.url) continue
      const name = String(f.source_name || f.url)
      // URL, not publisher name, is the connection identity. A publisher can expose many independent
      // feeds (Bloomberg currently has six); collapsing them made one good endpoint hide five failures.
      roster.set(`rss:${f.url}`, { name, url: f.url, region: String(f.region || '—'), feed_type: tier(name), via: 'rss' })
    }
    const ADAPTERS: { name: string; via: string; feed_type: string; region: string }[] = [
      { name: 'GDELT — global press index', via: 'gdelt', feed_type: 'news', region: 'GLOBAL' },
      { name: 'BSE / NSE Exchange Filing', via: 'nse', feed_type: 'filing', region: 'IN' },
      { name: 'HKEXnews (HK Exchange Filing)', via: 'hkex', feed_type: 'filing', region: 'HK' },
      { name: 'ASX (Australia Exchange Filing)', via: 'asx', feed_type: 'filing', region: 'AU' },
      { name: 'openFDA — drug/device recalls + clearances', via: 'gov', feed_type: 'recall', region: 'US' },
      { name: 'Reddit — social discovery (capped)', via: 'reddit', feed_type: 'social', region: 'GLOBAL' },
    ]
    for (const a of ADAPTERS) roster.set(`adapter:${a.via}`, { name: a.name, url: null, region: a.region, feed_type: a.feed_type, via: a.via })

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
    for (const [id, meta] of roster) {
      const name = meta.name
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
        // URL-keyed health is the current contract. The name lookup is a one-way migration bridge for
        // health files written before per-connection identity existed.
        const h = health[meta.url || ''] || health[name]
        fetch_status = h?.status || null
        // Surface the error ONLY when the LATEST fetch errored. A feed that has since recovered
        // (status ok / unchanged / empty) must never show a stale error from an earlier bad cycle —
        // that is the bug where one network blip left every recovered feed reading "fetch failed" under
        // Healthy. recordRssHealth now clears the error on recovery too; this stays as a defensive gate
        // (the report is recomputed on every request, so it also heals a health file written before that fix).
        last_error = fetch_status === 'error' ? (h?.lastError || null) : null
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

      rows.push({
        id,
        name,
        url: meta.url,
        region: meta.region,
        feed_type: meta.feed_type,
        via: meta.via,
        health: healthV,
        last_data_at: lastData,
        items_24h: items24h,
        items_7d: items7d,
        fetch_status,
        last_error,
        last_ok_at,
        repair: { state: 'none', fallback_covered: false, action: null },
      })
    }

    // Redundancy is judged by function + region, not publisher name. It does not claim the source set is
    // complete; it answers the narrower operational question: if one connection is down, is another live
    // connection still covering the same class of data?
    const grouped = new Map<string, SourceRow[]>()
    for (const row of rows) {
      const key = `${row.feed_type}:${row.region}`
      if (!grouped.has(key)) grouped.set(key, [])
      grouped.get(key)!.push(row)
    }
    const groups: SourceCoverageGroup[] = []
    const criticalGaps: string[] = []
    let repairActive = 0
    for (const [id, members] of grouped) {
      const working = members.filter((r) => r.health === 'healthy' || r.health === 'quiet').length
      const failing = members.filter((r) => r.health === 'failing').length
      const unverified = members.filter((r) => r.health === 'idle').length
      const label = `${members[0]?.feed_type || 'source'} · ${members[0]?.region || '—'}`
      const covered = working > 0
      groups.push({ id, label, total: members.length, working, failing, unverified, covered })
      if (!covered && failing > 0) criticalGaps.push(label)
      for (const row of members) {
        const h = row.url ? (health[row.url] || health[row.name]) : undefined
        const peerCovered = members.some((p) => p !== row && (p.health === 'healthy' || p.health === 'quiet'))
        if (h?.fallbackActive && row.health !== 'failing') {
          row.repair = { state: 'fallback_active', fallback_covered: true, action: `Using fallback endpoint${h.activeUrl ? `: ${h.activeUrl}` : ''}.` }
          repairActive++
        } else if (row.health === 'failing' && peerCovered) {
          row.repair = { state: 'covered_by_peer', fallback_covered: true, action: 'Retry this feed; another live connection covers the same data group.' }
          repairActive++
        } else if (row.health === 'failing') {
          row.repair = { state: (h?.fails || 0) >= 3 ? 'needs_attention' : 'retrying', fallback_covered: false, action: (h?.fails || 0) >= 3 ? 'Replace or add a fallback endpoint.' : 'Automatic retry is active.' }
          repairActive++
        } else if (row.health === 'idle') {
          row.repair = { state: 'unverified', fallback_covered: peerCovered, action: 'Waiting for the first verified fetch.' }
        }
      }
    }

    // sort: failing first (the problems, pinned at the very top), then the healthy bulk, then quiet,
    // then idle; within a tier, freshest data first.
    const order: Record<Health, number> = { failing: 0, healthy: 1, quiet: 2, idle: 3 }
    rows.sort((a, b) => order[a.health] - order[b.health] || (Date.parse(b.last_data_at || '0') || 0) - (Date.parse(a.last_data_at || '0') || 0) || a.name.localeCompare(b.name))

    const counts = { total: rows.length, healthy: 0, quiet: 0, failing: 0, idle: 0 }
    for (const r of rows) counts[r.health]++
    const workingConnections = counts.healthy + counts.quiet
    return {
      updated_at: now.toISOString(),
      counts,
      coverage: {
        connection_coverage_pct: counts.total ? Math.round((workingConnections / counts.total) * 1000) / 10 : 0,
        groups: groups.sort((a, b) => Number(a.covered) - Number(b.covered) || b.failing - a.failing || a.label.localeCompare(b.label)),
        critical_gaps: criticalGaps,
        repair_active: repairActive,
      },
      sources: rows,
    }
  } catch {
    return empty
  }
}
