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
import { NEWS } from '../config'

/** Hydrate a feed item on read: clean any HTML/markup left in the headline (older firehose lines were
 *  stored before ingest-time cleaning — e.g. "<a href=…>Title</a>"), and fill scope/source_tier so the
 *  whole backlog is classified like a fresh item. Idempotent; never drops the real text. */
function withScope(it: FeedItem): FeedItem {
  const headline = cleanText(it.headline)
  const needsClean = headline !== it.headline
  if (it.scope && it.source_tier && !needsClean) return it
  return {
    ...it,
    headline: headline || it.headline,
    scope: it.scope || deriveScope({ ...it, headline }),
    source_tier: it.source_tier || deriveSourceTier(it),
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
    let text: string
    try {
      text = fs.readFileSync(firehosePath(repoRoot, date), 'utf8')
    } catch {
      // not on local disk (pruned or never here) → fall back to the cloud archive (Drive mount) if set
      if (archiveDir) {
        try { text = fs.readFileSync(path.join(archiveDir, `${date}_firehose.ndjson`), 'utf8') } catch { continue }
      } else continue
    }
    for (const ln of text.split('\n')) {
      const t = ln.trim()
      if (!t) continue
      try {
        const o = JSON.parse(t)
        if (o?.kind === 'item') items.push(withScope(o as FeedItem))
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
