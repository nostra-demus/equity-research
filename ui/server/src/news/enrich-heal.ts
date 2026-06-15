// Background self-heal for THE STORY — the "auto fix" half of the anti-poisoning layer.
//
// The on-demand read (enrich.ts) is best-effort: when a HUMAN opens an event we read the article body with a
// free LLM, but a momentary miss (the ingester saturating Groq's per-minute window, an empty parse, the time
// budget) degrades to a deterministic fallback. The cache-quality changes mean a degraded read now expires
// fast and self-heals on the NEXT open — but a story a reader hasn't reopened would still sit degraded.
//
// This pass closes that gap WITHOUT a human in the loop: each ingest cycle it scans the enrich cache for
// degraded reads whose event is still on the live wire, and re-reads the highest-signal ones through the SAME
// provider chain + budgets the reader uses. enrichEvent's no-clobber guard means a re-read that misses again
// can never destroy a good brief, and its attempt bookkeeping accepts the floor as final after MAX attempts —
// so a genuinely unreadable article (hard paywall, JS shell) is tried a few times, then left alone.
//
// Cheap and bounded by design: capped at maxPerCycle, gated on free-tier budget headroom, paced between
// re-reads, and it NEVER throws (a heal failure must never wedge a cycle).

import { NEWS, REPO_ROOT, STATE_DIR } from '../config'
import { ARTICLE_READ_PROVIDERS } from '../config'
import { readFeed } from './feed'
import { enrichEvent, isEnrichmentComplete, type EventEnrichment } from './enrich'
import fs from 'node:fs'
import path from 'node:path'

const CACHE_FILE = 'news-enrich-cache.json'
const CACHE_BACKUP_FILE = 'news-enrich-cache.bak.json'

export interface HealDeps {
  repoRoot?: string
  stateDir?: string
  fetchFn?: typeof fetch
  now?: () => Date
  sleep?: (ms: number) => Promise<void>
  maxPerCycle?: number // how many degraded reads to re-attempt per call (default NEWS.enrichHealMaxPerCycle)
  gapMs?: number // pause between re-reads, so a heal burst doesn't spike the source hosts (default 400)
  hasBudget?: () => boolean // skip the whole pass when no free LLM budget is left (gate from the scheduler)
  log?: (m: string) => void
}

export interface HealSummary {
  scanned: number // cache entries examined
  degraded: number // degraded entries still on the live wire (heal candidates)
  attempted: number // how many we re-read this call
  healed: number // re-reads that became complete (a rich brief, or the floor accepted as final)
  note?: string
}

/** Read the enrich cache directly (the live file, then the backup). Never throws. */
function loadCache(stateDir: string): Record<string, EventEnrichment> {
  for (const file of [CACHE_FILE, CACHE_BACKUP_FILE]) {
    try {
      const o = JSON.parse(fs.readFileSync(path.join(stateDir, file), 'utf8'))
      if (o && typeof o === 'object') return o as Record<string, EventEnrichment>
    } catch {}
  }
  return {}
}

/**
 * One self-heal pass. Re-reads the highest-signal degraded stories that are still on the live wire, in place,
 * through the reader's own provider chain + budgets. Returns a small summary for the cockpit's status note.
 */
export async function healEnrichCache(deps: HealDeps = {}): Promise<HealSummary> {
  const repoRoot = deps.repoRoot ?? REPO_ROOT
  const stateDir = deps.stateDir ?? STATE_DIR
  const now = deps.now ?? (() => new Date())
  const sleep = deps.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)))
  const maxPerCycle = deps.maxPerCycle ?? NEWS.enrichHealMaxPerCycle
  const gapMs = deps.gapMs ?? 400
  const log = deps.log ?? (() => {})

  if (maxPerCycle <= 0 || !ARTICLE_READ_PROVIDERS.length) return { scanned: 0, degraded: 0, attempted: 0, healed: 0, note: 'heal disabled / no LLM provider' }
  if (deps.hasBudget && !deps.hasBudget()) return { scanned: 0, degraded: 0, attempted: 0, healed: 0, note: 'no free-tier budget — heal deferred' }

  const cache = loadCache(stateDir)
  const scanned = Object.keys(cache).length
  if (!scanned) return { scanned: 0, degraded: 0, attempted: 0, healed: 0 }

  // only heal events still in the 2-day firehose window — enrichEvent reconstructs the url/body from there,
  // so an aged-out event can't be re-read anyway. Map event_id → triage_score to heal the strongest first.
  let scoreById = new Map<string, number>()
  try {
    const feed = readFeed(repoRoot, 2, { now, maxItems: 2000 })
    for (const it of feed.items as any[]) scoreById.set(it.event_id, Number(it.triage_score) || 0)
  } catch {}

  const candidates = Object.entries(cache)
    .filter(([id, e]) => !isEnrichmentComplete(e) && scoreById.has(id))
    .sort((a, b) => (scoreById.get(b[0]) || 0) - (scoreById.get(a[0]) || 0) || String(b[1].fetched_at).localeCompare(String(a[1].fetched_at)))

  const degraded = candidates.length
  const batch = candidates.slice(0, maxPerCycle)
  let attempted = 0
  let healed = 0
  for (const [id] of batch) {
    attempted++
    try {
      const r = await enrichEvent(
        { event_id: id },
        {
          repoRoot,
          stateDir,
          fetchFn: deps.fetchFn,
          now,
          sleep,
          force: true, // bypass the degraded entry's short TTL and re-run the real read
          articleProviders: ARTICLE_READ_PROVIDERS,
          llmBudgetMs: NEWS.enrichLlmBudgetMs,
          limiterWaitMs: NEWS.enrichLimiterWaitMs,
        },
      )
      if (isEnrichmentComplete(r)) healed++
    } catch {
      // enrichEvent never throws, but stay defensive — a single heal failure must not abort the pass
    }
    if (gapMs > 0 && attempted < batch.length) await sleep(gapMs)
  }

  if (attempted) log(`enrich heal — ${healed}/${attempted} reads recovered (${degraded} degraded on the wire)`)
  return { scanned, degraded, attempted, healed }
}
