// Background body-read pass — REPAIR the reads that went wrong, and DISCOVER the ones nobody ever asked for.
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
// It also does the other half, which is what stops good stories staying buried. A body read used to happen
// ONLY when a human opened an event — and a human only opens what already surfaced — so an item whose
// headline undersold it was never read, and its headline-only score was the only score it would ever get.
// coldReadCandidates below breaks that circle: each cycle the pass also gives a first read to the handful of
// never-read items most likely to be mis-ranked by their headline, and news/impact-floor.ts turns the
// resulting verdict into a floor on their rank.
//
// Cheap and bounded by design: capped at maxPerCycle (repair) + coldMaxPerCycle (discovery), gated on
// free-tier budget headroom, paced between reads, hard-stopped by a wall clock, and it NEVER throws (a
// failure here must never wedge a cycle).

import { NEWS, REPO_ROOT, STATE_DIR } from '../config'
import { ARTICLE_READ_PROVIDERS, FILING_READ_PROVIDERS } from '../config'
import { readFeed } from './feed'
import { enrichEvent, isEnrichmentComplete, type EventEnrichment } from './enrich'
import { isFilingEvent } from './story-floor'
import { sourceTierRank } from './rank'
import { deriveSourceTier } from './scope'
import { bodyVerdicts } from './impact-floor'
import fs from 'node:fs'
import path from 'node:path'
import { loadThemes } from './themes/store'

const CACHE_FILE = 'news-enrich-cache.json'
const CACHE_BACKUP_FILE = 'news-enrich-cache.bak.json'

export interface HealDeps {
  repoRoot?: string
  stateDir?: string
  fetchFn?: typeof fetch
  now?: () => Date
  sleep?: (ms: number) => Promise<void>
  maxPerCycle?: number // how many degraded reads to re-attempt per call (default NEWS.enrichHealMaxPerCycle)
  coldMaxPerCycle?: number // how many NEVER-read items to give a first read per call (default NEWS.enrichColdMaxPerCycle; 0 disables discovery, leaving repair untouched)
  maxAgeMs?: number // skip entries degraded longer than this — structural failures, not transient (default NEWS.enrichHealMaxAgeMs)
  totalBudgetMs?: number // hard wall-clock cap for the WHOLE pass — it runs under the cycle lock, so this bounds how much it can extend a cycle (default 120s)
  gapMs?: number // pause between re-reads, so a heal burst doesn't spike the source hosts (default 400)
  hasBudget?: () => boolean // skip the whole pass when no free LLM budget is left (gate from the scheduler)
  log?: (m: string) => void
}

export interface HealSummary {
  scanned: number // cache entries examined
  degraded: number // degraded entries still on the live wire (heal candidates)
  attempted: number // how many we re-read this call
  healed: number // re-reads that became complete (a rich brief, or the floor accepted as final)
  cold: number // NEVER-read items picked for a first read (the under-rated tail — see coldReadCandidates)
  note?: string
}

/**
 * THE UNDER-RATED TAIL — items whose HEADLINE told the engine nothing, so nobody ever opened them, so their
 * body was never read, so the headline-only score is all they will ever have. That circle is exactly how a
 * substantive story behind a weak headline stays buried: the wire ranks on a title read (rank.ts), a body
 * read only ever happened when a HUMAN opened an item, and a human only opens what already surfaced.
 *
 * So this pass no longer only REPAIRS reads that went wrong — it also spends its leftover, budget-gated
 * slots reading the items most likely to be mis-ranked by their headline, whose verdict then floors their
 * score on the next wire load (news/impact-floor.ts). The selection is deliberately narrow, and every
 * clause is a free, already-computed signal:
 *   • no event type was detected in the headline — the discriminator. The headline named nothing the
 *     taxonomy recognises, which is precisely the "the title is not the story" case.
 *   • a named company and a real source tier — actionable, and never a Reddit post (CLAUDE.md §4/§24).
 *   • not a filing — a filing's body IS its headline (story-floor.ts), so a read adds nothing.
 *   • already below the pick line — an item that is surfacing does not need rescuing.
 *   • above a junk floor — the wire's bottom decile is noise; a read would not change that.
 * Ordered by how much a read could plausibly move it: source tier first (§4), then company size, then
 * score, then freshness.
 */
export function coldReadCandidates(
  items: any[],
  opts: { pickThreshold: number; minScore: number; enriched: Set<string> },
): string[] {
  const eligible = items.filter((it) => {
    if (!it?.event_id || opts.enriched.has(it.event_id)) return false
    if (!it.url) return false // nothing to read
    if (!it.rank_factors) return false // no ingest breakdown → the display re-rank (feed.ts applyActiveWeightsTo) no-ops, so a body verdict could never reach its score. Reading it would spend a slot for nothing AND cache-key it out of a future attempt.
    if (isFilingEvent(it)) return false // the disclosure IS the headline — a body read adds nothing
    if (String(it.source_tier || '') === 'social') return false // §4/§24 — never spend a read on chatter
    if (Array.isArray(it.event_types) && it.event_types.length > 0) return false // the headline already named an event
    if (!Array.isArray(it.companies) || !it.companies.length) return false // no named issuer → not actionable
    const s = Number(it.triage_score) || 0
    return s >= opts.minScore && s < opts.pickThreshold
  })
  eligible.sort((a, b) =>
    sourceTierRank(deriveSourceTier(b)) - sourceTierRank(deriveSourceTier(a)) ||
    SIZE_ORDER.indexOf(String(b.size_bucket || 'unknown')) - SIZE_ORDER.indexOf(String(a.size_bucket || 'unknown')) ||
    (Number(b.triage_score) || 0) - (Number(a.triage_score) || 0) ||
    String(b.ts || '').localeCompare(String(a.ts || '')),
  )
  return eligible.map((it) => it.event_id)
}

// ascending investability — index position is the sort key, so `mega` ranks highest
const SIZE_ORDER = ['unknown', 'small', 'mid', 'large', 'mega']

/** Which enrich-cache keys COLD DISCOVERY should not touch. A cache key existing is not the same as
 *  "this event is done": a DEGRADED entry is repair's job, and a COMPLETE entry with no usable body
 *  verdict (a legacy line from before news_impact existed, or a read whose brief happened to omit it)
 *  must NOT be treated as already-covered — otherwise it sits forever excluded from both the repair queue
 *  (not degraded) and cold discovery (already "enriched"), never getting the read that would let it earn
 *  a floor (Codex review, PR #350). Exclude only what discovery genuinely cannot improve: a real body
 *  verdict already on file (`verdicts` — news/impact-floor.ts's own definition, so a corroborated-only
 *  entry does NOT count), or a still-degraded entry (repair already owns it this cycle). Exported for the
 *  test suite. */
export function coldExclusionSet(cache: Record<string, EventEnrichment>, verdicts: Map<string, { label: string }>): Set<string> {
  return new Set(
    Object.entries(cache)
      .filter(([id, e]) => verdicts.has(id) || !isEnrichmentComplete(e))
      .map(([id]) => id),
  )
}

/** Player verification lane: no more than four article reads per scanner cycle and two per theme. Cached
 * complete reads cost no slot. Legacy themes are naturally drained in ledger order without hand edits. */
export function themePlayerReadCandidates(
  themes: ReturnType<typeof loadThemes>,
  cache: Record<string, EventEnrichment>,
  maxPerCycle = 4,
  maxPerTheme = 2,
): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const theme of themes) {
    if (out.length >= maxPerCycle) break
    if (theme.status !== 'live' || !theme.narrative) continue
    const support = new Set(theme.narrative.evidence.filter((row) => row.stance === 'supports').map((row) => row.event_id))
    const priorities = [
      theme.narrative.why_now_event_id,
      ...theme.narrative.expressions.flatMap((expression) => expression.evidence_event_ids),
      ...theme.members.slice().sort((a, b) => {
        const aTime = Date.parse(a.found_at)
        const bTime = Date.parse(b.found_at)
        const byTime = (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0)
        return byTime || a.event_id.localeCompare(b.event_id)
      }).map((member) => member.event_id),
    ]
    let picked = 0
    for (const eventId of priorities) {
      if (picked >= maxPerTheme || out.length >= maxPerCycle || seen.has(eventId) || !support.has(eventId)) continue
      const member = theme.members.find((row) => row.event_id === eventId)
      if (!member?.url || (cache[eventId] && isEnrichmentComplete(cache[eventId]))) continue
      seen.add(eventId)
      out.push(eventId)
      picked++
    }
  }
  return out
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
  const maxAgeMs = deps.maxAgeMs ?? NEWS.enrichHealMaxAgeMs
  const totalBudgetMs = deps.totalBudgetMs ?? 120_000
  const gapMs = deps.gapMs ?? 400
  const log = deps.log ?? (() => {})

  const coldMax = deps.coldMaxPerCycle ?? NEWS.enrichColdMaxPerCycle
  // Repair (maxPerCycle) and discovery (coldMax) are independent, separately-tunable controls
  // (NEWS_ENRICH_HEAL_MAX_PER_CYCLE / NEWS_ENRICH_COLD_MAX_PER_CYCLE) — an operator disabling one must
  // not silently disable the other (Codex review, PR #350). Only skip the whole pass when BOTH are off,
  // or when there is no provider to read with at all (neither can run without one).
  if (!ARTICLE_READ_PROVIDERS.length) return { scanned: 0, degraded: 0, attempted: 0, healed: 0, cold: 0, note: 'no LLM provider' }
  if (deps.hasBudget && !deps.hasBudget()) return { scanned: 0, degraded: 0, attempted: 0, healed: 0, cold: 0, note: 'no free-tier budget — heal deferred' }

  const cache = loadCache(stateDir)
  const scanned = Object.keys(cache).length

  // Only heal events still in the 2-day firehose window. This is a deliberate bound on BACKGROUND work,
  // not a capability limit: enrichEvent can now find an event's record anywhere in the archive, so an
  // aged-out story is still fully re-readable — it just waits for a human to open it (the on-demand path)
  // rather than occupying one of this pass's capped slots. Archive-aware so a locally-pruned day still
  // yields candidates. Map event_id → triage_score to heal the strongest first. The items themselves are
  // kept: they are also the pool the never-read (cold) candidates come from.
  let scoreById = new Map<string, number>()
  let wire: any[] = []
  try {
    const feed = readFeed(repoRoot, 2, { now, maxItems: 2000, archiveDir: NEWS.newsArchiveDir })
    wire = feed.items as any[]
    for (const it of wire) scoreById.set(it.event_id, Number(it.triage_score) || 0)
  } catch {}

  const nowMs = now().getTime()
  const candidates = Object.entries(cache)
    // degraded, still on the wire, and not so old it's clearly a structural failure (those keep the on-demand
    // retry but stop occupying the capped background slots, so fresher degraded stories get healed instead).
    .filter(([id, e]) => !isEnrichmentComplete(e) && scoreById.has(id) && nowMs - new Date(e.fetched_at).getTime() < maxAgeMs)
    .sort((a, b) => (scoreById.get(b[0]) || 0) - (scoreById.get(a[0]) || 0) || String(b[1].fetched_at).localeCompare(String(a[1].fetched_at)))

  const degraded = candidates.length
  // REPAIR FIRST, DISCOVER SECOND: a story whose read is known-broken is a surer win than a speculative
  // first read, so the degraded queue fills the slots and cold reads take what is left (capped separately,
  // so an operator can tune or switch off discovery — NEWS_ENRICH_COLD_MAX_PER_CYCLE=0 — without touching
  // repair). Both share the one budget gate and the one wall clock already guarding this pass.
  const repairBatch = candidates.slice(0, maxPerCycle).map(([id]) => id)
  let playerBatch: string[] = []
  try { playerBatch = themePlayerReadCandidates(loadThemes(repoRoot), cache, 4, 2) } catch { /* fail-soft */ }
  const verdicts = bodyVerdicts(stateDir, () => nowMs)
  const coldBatch = coldMax > 0
    ? coldReadCandidates(wire, { pickThreshold: NEWS.pickThreshold, minScore: NEWS.enrichColdMinScore, enriched: coldExclusionSet(cache, verdicts) }).slice(0, coldMax)
    : []
  const batch = [...new Set([...repairBatch, ...playerBatch, ...coldBatch])]
  const deadline = now().getTime() + totalBudgetMs
  let attempted = 0
  let healed = 0
  for (const id of batch) {
    if (now().getTime() >= deadline) break // hard wall-clock cap so the pass can't extend the cycle lock
    attempted++
    try {
      const r = await enrichEvent(
        { event_id: id },
        {
          repoRoot,
          stateDir,
          archiveDir: NEWS.newsArchiveDir, // same archive the candidate scan above reads
          fetchFn: deps.fetchFn,
          now,
          sleep,
          force: true, // bypass the degraded entry's short TTL and re-run the real read
          articleProviders: ARTICLE_READ_PROVIDERS,
          // A floored FILING must re-read on the strong filing chain too — healing on the article-only chain
          // re-floors it and locks complete=true for ~12h, so the configured stronger model would never be
          // consulted after a first-open miss (limiter busy / deadline / 429 / mangled PDF). [PR #220 audit MEDIUM-1]
          filingReadProviders: FILING_READ_PROVIDERS,
          llmBudgetMs: NEWS.enrichLlmBudgetMs,
          limiterWaitMs: NEWS.enrichLimiterWaitMs,
          // same OPERATOR-configured cooldown as the on-demand reader (server.ts) — the heal pass shares the
          // reader's provider chain + budgets, so it must share the configured cooldown too (NEWS_LLM_COOLDOWN_SEC
          // / _MAX_SEC), not fall back to readArticleBrief's hardcoded default.
          cooldownMs: NEWS.llmCooldownMs,
          cooldownMaxMs: NEWS.llmCooldownMaxMs,
          backgroundPacing: true,
        },
      )
      if (isEnrichmentComplete(r)) healed++
    } catch {
      // enrichEvent never throws, but stay defensive — a single heal failure must not abort the pass
    }
    if (gapMs > 0 && attempted < batch.length) await sleep(gapMs)
  }

  if (attempted) log(`enrich heal — ${healed}/${attempted} reads recovered (${degraded} degraded on the wire, ${coldBatch.length} never-read picked up)`)
  return { scanned, degraded, attempted, healed, cold: coldBatch.length }
}
