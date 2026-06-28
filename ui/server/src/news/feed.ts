// Per-item live-feed persistence: one `kind:"item"` NDJSON line per TRIAGED article (kept AND
// dropped) in the same date-rotated firehose file the cycle summaries use. This is what makes the
// cockpit's "News wire" restart-proof: the SSE stream covers the live tail, this file covers the
// backfill. Existing readers (the python board builder's firehose_counts) filter by kind, so these
// lines are invisible to them. Growth is bounded by construction: items are written only for
// post-firewall, post-dedupe candidates (single digits per cycle today), the file rotates daily,
// and a per-day cap is enforced here as a backstop.

import fs from 'node:fs'
import path from 'node:path'
import type { CycleSummary, FeedItem } from './types'
import { deriveScope, deriveSourceTier } from './scope'
import { cleanText } from './clean'
import { assignDedupGroups, type DedupConfig } from './dedup'
import { reRankFromFactors, capSocialBand, capSocialScore } from './rank'
import { getRankWeights } from './rank-weights'
import { scoreToBand } from './triage/groq'
import { resolveCountry } from './geography'
import { NEWS } from '../config'

/** Hydrate a feed item on read: clean any HTML/markup left in the headline (older firehose lines were
 *  stored before ingest-time cleaning — e.g. "<a href=…>Title</a>"), fill scope/source_tier, and derive
 *  the country-level geography (news/geography.ts) for lines that predate the `country` field — so the
 *  WHOLE backlog is classified like a fresh item without any backfill. Idempotent; never drops real text. */
function hydrate(it: FeedItem): FeedItem {
  const headline = cleanText(it.headline)
  const needsClean = headline !== it.headline
  const needsGeo = it.country === undefined // older firehose line, written before the country field existed
  if (it.scope && it.source_tier && !needsClean && !needsGeo) return it
  return {
    ...it,
    headline: headline || it.headline,
    scope: it.scope || deriveScope({ ...it, headline }),
    source_tier: it.source_tier || deriveSourceTier(it),
    ...(needsGeo ? { country: resolveCountry(headline || it.headline, it.headline_en, it.companies, it.region, it.issuer_linkage) } : {}),
  }
}

/** Re-score the served window under the CURRENTLY-active scoring weights (rank-weights.ts), so a Scoring
 *  panel edit applies to the WHOLE existing wire on the next load — not only to items ingested afterward.
 *  Display-only: this never touches the persisted firehose, so the audit trail keeps each item's score as
 *  it was at ingest. Uses the breakdown captured at ingest (so it's a pure function of the weights, not the
 *  clock); at default weights every score is unchanged. Skips any pre-breakdown line. Mutates in place. */
function withActiveWeights(items: FeedItem[]): void {
  const w = getRankWeights()
  for (const it of items) {
    if (!it.rank_factors) continue // older line with no breakdown — leave its persisted score as-is
    const r = reRankFromFactors(it.rank_factors, it, w)
    // §4/§24 doctrine cap on the DISPLAY path too — same rule the ingest path applies in runCycle.ts: a
    // weight edit that re-ranks a Reddit/`social` item above the pick threshold must never show it as a
    // top pick, and capSocialScore keeps its priority below the picks so the wire ordering honors the cap.
    // caution_only social (r/wallstreetbets) stays "weighted lowest" on the display re-rank too.
    const caution = it.caution === true
    const capped = capSocialScore(r.rank_score, r.rank_factors.source_tier_id, NEWS.pickThreshold, NEWS.watchThreshold, caution)
    it.triage_score = capped
    it.rank_factors = r.rank_factors
    it.band = capSocialBand(scoreToBand(capped, NEWS.pickThreshold, NEWS.watchThreshold), r.rank_factors.source_tier_id, caution)
  }
}

/** Recompute story-cluster ids over the whole returned window, so the wire de-dupes the EXISTING
 *  backlog on load (the firehose lines were stamped against a narrower per-cycle window, or predate
 *  dedup entirely). Idempotent + fail-soft (assignDedupGroups never throws). Mutates in place. */
function withDedup(items: FeedItem[]): void {
  if (!NEWS.dedupEnabled || items.length < 2) return
  const cfg: DedupConfig = { windowHours: NEWS.dedupWindowHours, jaccard: NEWS.dedupJaccard, verbatimJaccard: NEWS.dedupVerbatimJaccard, maxScan: NEWS.dedupMaxScan }
  const groups = assignDedupGroups(items.map((it) => ({ event_id: it.event_id, headline: it.headline, ts: it.ts, companies: it.companies, source_name: it.source_name })), cfg)
  for (const it of items) it.dedup_group = groups.get(it.event_id) || it.event_id
}

function firehosePath(repoRoot: string, date: string): string {
  return path.join(repoRoot, 'screener', 'inbox', `${date}_firehose.ndjson`)
}

/** Read one day's firehose text — local inbox first, then the cloud archive (Drive mount) after a local
 *  prune. Returns null when the day is on neither (a real gap, or never ingested). Never throws. */
function readFirehoseText(repoRoot: string, date: string, archiveDir: string): string | null {
  try {
    return fs.readFileSync(firehosePath(repoRoot, date), 'utf8')
  } catch {
    if (archiveDir) {
      try { return fs.readFileSync(path.join(archiveDir, `${date}_firehose.ndjson`), 'utf8') } catch { /* fall through */ }
    }
    return null
  }
}

/** Read + hydrate one day's `kind:"item"` lines (newest-first within the day is NOT guaranteed — the
 *  caller sorts). Returns the items and how many lines were parsed (the scan-budget unit). Corrupt lines
 *  skipped. Shared by searchFeed and the facet index so they read the archive identically to the wire. */
export function readDayItems(repoRoot: string, date: string, archiveDir: string): { items: FeedItem[]; lines: number } {
  const text = readFirehoseText(repoRoot, date, archiveDir)
  if (text == null) return { items: [], lines: 0 }
  const items: FeedItem[] = []
  let lines = 0
  for (const ln of text.split('\n')) {
    const t = ln.trim()
    if (!t) continue
    lines++
    try {
      const o = JSON.parse(t)
      if (o?.kind === 'item') items.push(hydrate(o as FeedItem))
    } catch { /* corrupt line — skip, never break the scan */ }
  }
  return { items, lines }
}

/** Every date (YYYY-MM-DD) that has a firehose file, across the local inbox AND the cloud archive,
 *  newest-first. The floor for an archive-spanning scan: searchFeed walks these so it knows when there
 *  is genuinely no older data (exhausted) vs when it stopped on a budget. */
export function listFirehoseDates(repoRoot: string, archiveDir = ''): string[] {
  const dates = new Set<string>()
  const scan = (dir: string) => {
    try {
      for (const f of fs.readdirSync(dir)) {
        const m = /^(\d{4}-\d{2}-\d{2})_firehose\.ndjson$/.exec(f)
        if (m) dates.add(m[1])
      }
    } catch { /* dir missing — skip */ }
  }
  scan(path.join(repoRoot, 'screener', 'inbox'))
  if (archiveDir) scan(archiveDir)
  return [...dates].sort((a, b) => (a < b ? 1 : -1)) // newest-first
}

function countItemLines(fp: string): number {
  try {
    let n = 0
    for (const ln of fs.readFileSync(fp, 'utf8').split('\n')) {
      if (ln.includes('"kind":"item"') || ln.includes('"kind": "item"')) n++
    }
    return n
  } catch {
    return 0
  }
}

/**
 * Append per-item records, honoring the daily cap. Returns how many were written.
 * Never throws — a missed feed line only loses a wire row, never the ingest cycle.
 */
export function appendFeedItems(repoRoot: string, date: string, items: FeedItem[], dailyCap = 1500): number {
  if (!items.length) return 0
  const fp = firehosePath(repoRoot, date)
  try {
    fs.mkdirSync(path.dirname(fp), { recursive: true })
    const room = Math.max(0, dailyCap - countItemLines(fp))
    const toWrite = items.slice(0, room)
    if (!toWrite.length) return 0
    fs.appendFileSync(fp, toWrite.map((it) => JSON.stringify(it)).join('\n') + '\n')
    return toWrite.length
  } catch {
    return 0
  }
}

export interface FeedSnapshot {
  items: FeedItem[]
  cycles: CycleSummary[]
}

/**
 * Read the last `days` firehose files (today first) and split records by kind. Items come back
 * newest-first, capped, corrupt lines skipped — same tolerance discipline as the ledger readers.
 */
export function readFeed(repoRoot: string, days = 2, opts: { now?: () => Date; maxItems?: number; archiveDir?: string; applyActiveWeights?: boolean } = {}): FeedSnapshot {
  const now = opts.now || (() => new Date())
  const maxItems = opts.maxItems && opts.maxItems > 0 ? opts.maxItems : 1000
  const archiveDir = opts.archiveDir || '' // Google Drive mount folder — read older days from here after local prune
  const items: FeedItem[] = []
  const cycles: CycleSummary[] = []
  for (let d = 0; d < Math.max(1, days); d++) {
    const date = new Date(now().getTime() - d * 86_400_000).toISOString().slice(0, 10)
    const text = readFirehoseText(repoRoot, date, archiveDir)
    if (text == null) continue // not on local disk or in the archive (pruned, gap, or never here)
    for (const ln of text.split('\n')) {
      const t = ln.trim()
      if (!t) continue
      try {
        const o = JSON.parse(t)
        if (o?.kind === 'item') items.push(hydrate(o as FeedItem))
        else if (o?.kind === 'cycle_summary') cycles.push(o as CycleSummary)
      } catch {
        // corrupt line — skip, never break the wire
      }
    }
    // Days are read NEWEST-first (d=0 is today), so once we have maxItems the older days can only add
    // older items that the slice below would drop anyway — stop early. Keeps a 6-month / all-time window
    // from parsing hundreds of files: it reads just enough recent days to fill the cap.
    if (items.length >= maxItems) break
  }
  items.sort((a, b) => (b.ts || '').localeCompare(a.ts || ''))
  cycles.sort((a, b) => (b.ts || '').localeCompare(a.ts || ''))
  const capped = items.slice(0, maxItems)
  // Re-score under the CURRENT weights so a panel edit reaches the served wire — but ONLY for the display
  // path. Theme discovery (readRecentThemeItems) opts OUT so a weight edit can't retroactively change which
  // items qualify for clustering: it uses the persisted ingest-time scores (which already reflect the
  // weights in force when each item was ingested). Default on, so every display consumer is unaffected.
  if (opts.applyActiveWeights !== false) withActiveWeights(capped)
  withDedup(capped) // story-cluster the served window so the wire shows one row per story
  return { items: capped, cycles }
}

// ---- archive-spanning filtered search ----------------------------------------------------------------
// Unlike readFeed (which returns the newest N items in a day-window and early-stops at maxItems REGARDLESS
// of any filter), searchFeed keeps walking OLDER days until it has filled a page of items that actually
// MATCH the predicate — or it reaches the archive floor / a scan budget. That is what kills the "false
// nothing": a sparse filter (e.g. Aerospace & Defense in the UAE) finds matches buried deep in history
// instead of stopping at the newest 6,000 items. Paging is a stable compound (ts, event_id) cursor, so
// same-minute items are never skipped or duplicated across pages.

export interface SearchCursor {
  ts: string
  id: string // event_id — breaks ts ties so paging is loss-free at minute granularity
}
export interface SearchOpts {
  predicate: (it: FeedItem) => boolean
  now?: () => Date
  archiveDir?: string
  limit?: number // page size (matches to return); default 60
  maxDaysScan?: number // hard ceiling on calendar days walked; default 400 (~archive depth)
  maxLinesScan?: number // hard ceiling on lines parsed per call (the fs-read DoS guard); default 300k
  fromDate?: string // YYYY-MM-DD inclusive older bound; omit = walk to the archive floor
  toDate?: string // YYYY-MM-DD inclusive newer bound; omit = today
  cursor?: SearchCursor | null // resume strictly AFTER this (ts,id) in (ts desc, id desc) order
  applyActiveWeights?: boolean // re-score the returned page under current weights (default on, like readFeed)
}
export interface SearchSnapshot {
  items: FeedItem[]
  nextCursor: SearchCursor | null // null = no more pages (archive floor reached within budget)
  scannedThroughDate: string | null // the OLDEST day actually parsed — what "searched all history back to <date>" shows
  exhausted: boolean // true = reached the archive floor / fromDate; false = stopped on a page or a budget
}

const dayKey = (now: () => Date) => now().toISOString().slice(0, 10)
// item is strictly AFTER the cursor in (ts desc, event_id desc) order → belongs on a later page
function afterCursor(it: FeedItem, c: SearchCursor | null | undefined): boolean {
  if (!c) return true
  if (it.ts !== c.ts) return it.ts < c.ts
  return (it.event_id || '') < c.id
}

export function searchFeed(repoRoot: string, opts: SearchOpts): SearchSnapshot {
  const now = opts.now || (() => new Date())
  const archiveDir = opts.archiveDir || ''
  const limit = opts.limit && opts.limit > 0 ? opts.limit : 60
  const maxDaysScan = opts.maxDaysScan && opts.maxDaysScan > 0 ? opts.maxDaysScan : 400
  const maxLinesScan = opts.maxLinesScan && opts.maxLinesScan > 0 ? opts.maxLinesScan : 300_000
  const startDate = opts.cursor?.ts.slice(0, 10) || opts.toDate || dayKey(now)
  // The real archive floor: the OLDEST day that actually has a firehose file (local or in the cloud
  // archive). Bounding the walk to it makes `exhausted` honest — we know when there is genuinely no older
  // data, instead of walking maxDaysScan empty days and reporting a false "maybe more".
  const available = listFirehoseDates(repoRoot, archiveDir)
  const floorDate = opts.fromDate || available[available.length - 1] || startDate

  const matches: FeedItem[] = []
  let linesScanned = 0
  let scannedThroughDate: string | null = null
  let reachedFloor = false
  let budgetStop = false

  for (let d = 0; d < maxDaysScan; d++) {
    const date = new Date(new Date(`${startDate}T00:00:00Z`).getTime() - d * 86_400_000).toISOString().slice(0, 10)
    if (date < floorDate) { reachedFloor = true; break }
    const { items, lines } = readDayItems(repoRoot, date, archiveDir)
    linesScanned += lines
    if (lines > 0) scannedThroughDate = date // the oldest day we actually parsed
    for (const it of items) {
      if (afterCursor(it, opts.cursor) && opts.predicate(it)) matches.push(it)
    }
    // Stop AFTER fully parsing a day (never mid-file) so newest-first ordering is exact: older days can
    // only add items older than everything scanned, so once we have a full page it is complete + correct.
    // Break on `> limit` (overflow by at least one), NOT `>= limit`: landing EXACTLY on `limit` must keep
    // walking older days, otherwise a day that brings the running total to exactly `limit` while older
    // matching days remain would stop here with `matches.length === limit` and report nextCursor=null —
    // silently hiding the deeper matches (the very "false nothing" this function exists to kill). Overflowing
    // by one guarantees "more exists ⟺ matches.length > limit"; landing exactly on `limit` instead continues
    // until the next match (→ overflow → cursor) or the archive floor (→ exhausted).
    if (matches.length > limit) break
    if (linesScanned >= maxLinesScan) { budgetStop = true; break }
    if (d === maxDaysScan - 1) budgetStop = true // walked the whole window without filling a page
  }

  // newest-first, ties broken by event_id desc — the same total order the cursor encodes
  matches.sort((a, b) => (a.ts !== b.ts ? (a.ts < b.ts ? 1 : -1) : (a.event_id || '') < (b.event_id || '') ? 1 : -1))
  const page = matches.slice(0, limit)
  if (opts.applyActiveWeights !== false) withActiveWeights(page)
  withDedup(page)

  const hasMore = matches.length > limit || (budgetStop && !reachedFloor)
  const last = page[page.length - 1]
  const fullPage = page.length >= limit
  // when we stopped on budget with a partial page, resume from the oldest day we scanned so older data is reachable
  const budgetCursor: SearchCursor | null = budgetStop && page.length < limit && scannedThroughDate ? { ts: `${scannedThroughDate}T00:00:00Z`, id: '' } : null
  // A FULL page always resumes strictly AFTER its last (oldest) item — every match beyond the page is by
  // construction older than it, so this is loss-free. This also covers a full page that stopped on budget
  // (matches.length === limit exactly): without it, budgetCursor would be null (it requires a partial page)
  // and the deeper data would be unreachable. A PARTIAL page that stopped on budget resumes from the oldest
  // scanned day instead.
  const nextCursor = !hasMore ? null : fullPage && last ? { ts: last.ts, id: last.event_id || '' } : budgetCursor
  return { items: page, nextCursor, scannedThroughDate, exhausted: reachedFloor && matches.length <= limit }
}
