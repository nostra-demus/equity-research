// Story-level de-duplication for the news wire. The exact-hash event_id (normalize.ts) only collapses
// byte-identical headline+url pairs, so the SAME story slips through as many rows: reworded across a
// cycle ("Bank of Canada Interest Rate Announcement" vs "…and Monetary Policy Report") and re-reported
// across sources (Reuters + FT + CNBC). This MICRO-clusters the wire into stories (finer than themes),
// so the UI shows ONE row per story with a "+N sources" badge, and multi-source corroboration can lift
// the rank. It reuses the EXACT matching the rest of the engine uses (text-match.ts) + the union-find
// shape from themes/discover.ts — one matching implementation, deterministic, cheap, and fail-soft
// (any throw → every item is its own group = no collapse, never breaks a cycle).
//
// TIGHT by design (the chosen behaviour — "same story only"). Two items merge only when, within a
// short window, their topic+company token sets are highly similar AND they share a company OR a source
// (mirrors the signal-gate near-dup band + its issuer-overlap rule) — OR they're verbatim-ish alone.
// A shared company WITHOUT high token overlap is NOT merged, so "Apple earnings" and "Apple lawsuit"
// stay separate rows.

import type { CompanyGuess } from './types'
import { companyKeys, topicTokens, intersectionSize, jaccard } from './text-match'

// The minimal view dedup needs from an item, so it runs over a fresh TriagedItem (ts = found_at) or a
// backfilled FeedItem (ts = the firehose line's ts) without coupling to either full shape.
export interface DedupItemView {
  event_id: string
  headline: string
  ts: string // ISO — the window axis
  companies?: CompanyGuess[] | null
  source_name?: string | null
}

export interface DedupConfig {
  windowHours: number // two items can only be the same story if their timestamps are within this
  jaccard: number // token-set similarity floor for a same-story match (with the company/source guard)
  verbatimJaccard: number // a similarity this high merges on its own (a verbatim repost, no guard)
  maxScan: number // cap the O(n²) clustering to the most recent N items
}

export const DEFAULT_DEDUP_CONFIG: DedupConfig = {
  windowHours: 48,
  jaccard: 0.55,
  verbatimJaccard: 0.82,
  maxScan: 1500,
}

const tsMs = (s: string): number => {
  const t = Date.parse(s || '')
  return Number.isFinite(t) ? t : 0
}

// memo: each item's company keys + topic tokens (computed once for the clustering graph)
interface Sig {
  keys: Set<string>
  toks: Set<string>
  src: string
  t: number
}
function sigOf(it: DedupItemView): Sig {
  return {
    keys: companyKeys(it.companies),
    toks: topicTokens(it.headline, it.companies),
    src: String(it.source_name || '').trim().toLowerCase(),
    t: tsMs(it.ts),
  }
}

/** Are i and j the SAME STORY? TIGHT predicate (see file header). */
function sameStory(a: Sig, b: Sig, cfg: DedupConfig): boolean {
  const j = jaccard(a.toks, b.toks)
  if (j >= cfg.verbatimJaccard) return true // verbatim-ish repost — merge on its own
  if (j < cfg.jaccard) return false
  // a strong-but-not-verbatim overlap needs a corroborating anchor: the same company in play, or the
  // same publisher reworking its own story. (No anchor → keep separate, e.g. two different events that
  // happen to share generic words.)
  if (intersectionSize(a.keys, b.keys) >= 1) return true
  if (a.src && a.src === b.src) return true
  return false
}

/**
 * Assign each item a `dedup_group` = the earliest member's event_id of the story it belongs to.
 * Union-find over the most recent `maxScan` items, pairwise within the time window. Deterministic.
 * Returns a Map event_id → group id. Never throws: on any error every item maps to its own id.
 */
export function assignDedupGroups(items: DedupItemView[], cfg: DedupConfig = DEFAULT_DEDUP_CONFIG): Map<string, string> {
  const out = new Map<string, string>()
  try {
    if (!items.length) return out
    // newest-first scan cap, then sort ASCENDING by ts so a left-pointer sweep can skip out-of-window
    // pairs (sorted → once a neighbour is older than the window, all earlier ones are too).
    const scan = (items.length > cfg.maxScan ? items.slice(0, cfg.maxScan) : items.slice()).filter((it) => it && it.event_id)
    scan.sort((a, b) => tsMs(a.ts) - tsMs(b.ts) || (a.event_id < b.event_id ? -1 : 1))
    const n = scan.length
    const sigs = scan.map(sigOf)
    const windowMs = Math.max(0, cfg.windowHours) * 3_600_000

    const parent = Array.from({ length: n }, (_, i) => i)
    const find = (x: number): number => (parent[x] === x ? x : (parent[x] = find(parent[x])))
    const union = (a: number, b: number) => {
      const ra = find(a), rb = find(b)
      if (ra !== rb) parent[ra] = rb
    }
    for (let i = 0; i < n; i++) {
      for (let j = i - 1; j >= 0; j--) {
        if (sigs[i].t - sigs[j].t > windowMs) break // sorted ASC → everything earlier is out of window
        if (sameStory(sigs[i], sigs[j], cfg)) union(i, j)
      }
    }

    // group id = the earliest (min ts, then smallest event_id) member's event_id — stable across runs
    const groupRep = new Map<number, number>() // root → index of representative
    for (let i = 0; i < n; i++) {
      const r = find(i)
      const cur = groupRep.get(r)
      if (cur === undefined) groupRep.set(r, i)
      else {
        const a = sigs[i], b = sigs[cur]
        if (a.t < b.t || (a.t === b.t && scan[i].event_id < scan[cur].event_id)) groupRep.set(r, i)
      }
    }
    for (let i = 0; i < n; i++) {
      const rep = groupRep.get(find(i))!
      out.set(scan[i].event_id, scan[rep].event_id)
    }
    return out
  } catch {
    // fail-soft: no dedup is always safe (every item its own group)
    for (const it of items) if (it?.event_id) out.set(it.event_id, it.event_id)
    return out
  }
}
