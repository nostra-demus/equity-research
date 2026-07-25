// THE BODY READ'S VERDICT, fed back into the score.
//
// The wire's priority is anchored on a TITLE-only model read (runCycle.ts → rank.ts): the triage batch is
// handed headlines, never article bodies. That is the right first pass — it is cheap and it runs on
// everything — but it was also the LAST pass. When the engine later read the whole article (enrich.ts, on
// open or via the background heal), the read produced its own materiality verdict —
// `news_impact.impact_magnitude`, on the SAME low/medium/high/critical scale rank.ts already uses for the
// headline label — and that verdict went to the display only. It never reached the score, so an article
// whose body proves it matters stayed ranked on whatever its headline happened to promise, for ever.
//
// This module closes that loop. It exposes the body verdict per event so the read path (feed.ts) can floor
// the item's rank with it, exactly the way materialityLabelBoost already floors on the headline label.
//
// Three deliberate properties:
//  • LIFT ONLY. A body read can raise an item to the floor its own verdict implies; it never lowers one.
//    The engine's job is to stop burying what matters (CLAUDE.md §24 — an error of omission is the one to
//    avoid), and letting a model read talk a score DOWN would be a new way to hide things.
//  • CONFIDENCE-GATED. The read states its own confidence (0-100); below MIN_CONFIDENCE the verdict is not
//    firm enough to move a ranking, so it is ignored rather than half-applied.
//  • READ-TIME, never a rewrite. Like the country / topics / junk-ticker derivations in feed.ts, this is
//    applied when the wire is served, so the WHOLE existing backlog gets it with no backfill and the
//    append-only firehose keeps each item's score exactly as it was at ingest.
//
// Source of truth is the enrich cache itself (news-enrich-cache.json — what enrichEvent already writes), so
// there is no second store to keep in step. Read is TTL-cached, bounded, and never throws.

import fs from 'node:fs'
import path from 'node:path'

const CACHE_FILE = 'news-enrich-cache.json'
const CACHE_BACKUP_FILE = 'news-enrich-cache.bak.json'
const TTL_MS = 60_000
// A read that is not reasonably sure of its own verdict must not move a ranking. Live reads cluster at
// 70-100; this only excludes the genuinely hedged ones.
export const MIN_CONFIDENCE = 60

export interface BodyVerdict {
  label: string // low | medium | high | critical — the body read's own materiality call
  confidence: number
}

// keyed by stateDir so tests and a second repo never share an index
const cache = new Map<string, { at: number; map: Map<string, BodyVerdict> }>()

function loadRaw(stateDir: string): Record<string, any> {
  for (const file of [CACHE_FILE, CACHE_BACKUP_FILE]) {
    try {
      const o = JSON.parse(fs.readFileSync(path.join(stateDir, file), 'utf8'))
      if (o && typeof o === 'object') return o as Record<string, any>
    } catch { /* try the backup, then give up */ }
  }
  return {}
}

const LABELS = new Set(['low', 'medium', 'high', 'critical'])

/** Every event whose ARTICLE BODY has been read into a firm materiality verdict. TTL-cached; never throws
 *  (a missing/corrupt cache simply means "no body verdicts", i.e. today's headline-only behaviour). */
export function bodyVerdicts(stateDir: string, now: () => number = Date.now): Map<string, BodyVerdict> {
  const hit = cache.get(stateDir)
  const t = now()
  if (hit && t - hit.at < TTL_MS) return hit.map
  const map = new Map<string, BodyVerdict>()
  for (const [eventId, entry] of Object.entries(loadRaw(stateDir))) {
    const ni = (entry as any)?.news_impact
    if (!ni || typeof ni !== 'object') continue
    const label = String(ni.impact_magnitude ?? '').toLowerCase()
    if (!LABELS.has(label)) continue
    const confidence = Number(ni.confidence)
    if (!Number.isFinite(confidence) || confidence < MIN_CONFIDENCE) continue
    map.set(eventId, { label, confidence })
  }
  cache.set(stateDir, { at: t, map })
  return map
}

/** Drop the cached index — call after an enrichment write so a fresh body verdict reaches the wire
 *  immediately rather than at the next TTL lapse. */
export function invalidateBodyVerdicts(): void { cache.clear() }
