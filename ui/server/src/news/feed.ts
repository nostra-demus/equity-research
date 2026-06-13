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

/** Fill scope/source_tier on a feed item that predates them (older firehose lines), so the whole
 *  backlog is classified the same way as a fresh item. Idempotent: only fills what's missing. */
function withScope(it: FeedItem): FeedItem {
  if (it.scope && it.source_tier) return it
  return {
    ...it,
    scope: it.scope || deriveScope(it),
    source_tier: it.source_tier || deriveSourceTier(it),
  }
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
export function readFeed(repoRoot: string, days = 2, opts: { now?: () => Date; maxItems?: number } = {}): FeedSnapshot {
  const now = opts.now || (() => new Date())
  const maxItems = opts.maxItems && opts.maxItems > 0 ? opts.maxItems : 1000
  const items: FeedItem[] = []
  const cycles: CycleSummary[] = []
  for (let d = 0; d < Math.max(1, days); d++) {
    const date = new Date(now().getTime() - d * 86_400_000).toISOString().slice(0, 10)
    let text: string
    try {
      text = fs.readFileSync(firehosePath(repoRoot, date), 'utf8')
    } catch {
      continue
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
  }
  items.sort((a, b) => (b.ts || '').localeCompare(a.ts || ''))
  cycles.sort((a, b) => (b.ts || '').localeCompare(a.ts || ''))
  return { items: items.slice(0, maxItems), cycles }
}
