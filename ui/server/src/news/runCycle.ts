// One ingest cycle, end to end: FETCH (GDELT) → NORMALIZE+FILTER+DEDUP → TRIAGE (Groq, batched,
// budget- and rate-limited) → WRITE (ranked inbox + firehose summary + board refresh). It NEVER
// throws — every stage degrades to a logged, counted no-op — and it NEVER spends Claude money. All
// I/O is dependency-injectable so the whole pipeline is unit-testable with mocked fetch + clock.

import path from 'node:path'
import { NEWS, REPO_ROOT, STATE_DIR } from '../config'
import { fetchGdelt } from './sources/gdelt'
import { loadLedgerEventIds, normalizeAndFilter } from './normalize'
import { SeenCache } from './seen-cache'
import { Budget, RateLimiter } from './triage/budget'
import { estimateTokens, scoreToBand, triageBatch } from './triage/groq'
import { appendFirehoseSummary, mergeInbox, refreshBoard } from './write-inbox'
import type { CycleSummary, TriagedItem } from './types'

type Cfg = typeof NEWS

export interface RunCycleDeps {
  repoRoot?: string
  stateDir?: string
  config?: Partial<Cfg>
  fetchFn?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  now?: () => Date
  log?: (m: string) => void
}

export async function runIngestCycle(deps: RunCycleDeps = {}): Promise<CycleSummary> {
  const cfg: Cfg = { ...NEWS, ...(deps.config || {}) }
  const repoRoot = deps.repoRoot || REPO_ROOT
  const stateDir = deps.stateDir || STATE_DIR
  const fetchFn = deps.fetchFn || fetch
  const sleep = deps.sleep || ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)))
  const now = deps.now || (() => new Date())
  const log = deps.log || (() => {})
  const ts = now().toISOString().replace(/\.\d{3}Z$/, 'Z')
  const date = ts.slice(0, 10)

  const blank: CycleSummary = { ts, ok: false, fetched: 0, candidates: 0, picked: 0, watched: 0, dropped: 0, inboxed: 0, groq_requests: 0, groq_tokens: 0 }

  if (!cfg.groqApiKey) {
    return { ...blank, note: 'no GROQ_API_KEY — ingester idle' }
  }

  // 1. FETCH
  let raws
  try {
    raws = await fetchGdelt({ lookbackMin: cfg.gdeltLookbackMin, baseUrl: cfg.gdeltBaseUrl }, { fetchFn, sleep, log })
  } catch (e: any) {
    return { ...blank, note: `fetch failed: ${e?.message || e}` }
  }

  // 2. NORMALIZE + FILTER + DEDUP
  const seen = SeenCache.load(stateDir)
  const ledgerIds = loadLedgerEventIds(path.join(repoRoot, 'screener', 'ledger', 'events.ndjson'))
  const items = normalizeAndFilter(raws, { ledgerEventIds: ledgerIds, seen, now })

  if (!items.length) {
    const summary: CycleSummary = { ...blank, ok: true, fetched: raws.length, note: 'no new on-list items' }
    appendFirehoseSummary(repoRoot, date, summary)
    return summary
  }

  // 3. TRIAGE (batched, budget + throttle)
  const budget = Budget.load(stateDir, cfg.groqDailyReqCap, cfg.groqDailyTokenCap, now().getTime())
  const limiter = new RateLimiter(cfg.groqRpm)
  const triaged: TriagedItem[] = []
  let groqRequests = 0
  let groqTokens = 0
  let budgetHit = false

  for (let i = 0; i < items.length; i += cfg.triageBatch) {
    const batch = items.slice(i, i + cfg.triageBatch)
    if (!budget.canSpend(estimateTokens(batch.length))) { budgetHit = true; break }
    await limiter.acquire(sleep, () => now().getTime())
    const res = await triageBatch(batch, { model: cfg.groqModel, baseUrl: cfg.groqBaseUrl, apiKey: cfg.groqApiKey }, fetchFn)
    groqRequests += res.requests
    groqTokens += res.tokens
    budget.record(res.requests, res.tokens)
    for (let j = 0; j < batch.length; j++) {
      const it = batch[j]
      const t = res.byIndex.get(j)
      // a missing index (model omission) or a failed call → score 0 (drop), but still mark seen so we
      // don't pay to re-score it next cycle
      const score = t ? t.materiality_pre_score : 0
      const band = scoreToBand(score, cfg.pickThreshold, cfg.watchThreshold)
      seen.add(it.event_id, score)
      triaged.push({
        ...it,
        triage_score: score,
        triage_reason: t?.why || (res.ok ? 'not material' : 'not scored this cycle'),
        relevance: t?.relevance || 'irrelevant',
        materiality_pre_score: score,
        event_types: t?.event_types || [],
        issuer_linkage: t?.issuer_linkage || 'sector',
        band,
      })
    }
    if (!res.ok) log(`triage batch @${i}: ${res.note || 'failed'}`)
  }
  budget.save()
  seen.save()

  // 4. WRITE
  const picks = triaged.filter((t) => t.band !== 'drop')
  const picked = triaged.filter((t) => t.band === 'pick').length
  const watched = triaged.filter((t) => t.band === 'watch').length
  const dropped = triaged.filter((t) => t.band === 'drop').length
  let inboxed = 0
  if (picks.length) {
    inboxed = mergeInbox(repoRoot, date, picks, { maxRows: cfg.inboxMaxRows, now })
    refreshBoard(repoRoot, log)
  }

  const summary: CycleSummary = {
    ts, ok: true, fetched: raws.length, candidates: items.length,
    picked, watched, dropped, inboxed, groq_requests: groqRequests, groq_tokens: groqTokens,
    note: budgetHit ? 'daily Groq budget reached — remaining items deferred to next cycle' : undefined,
  }
  appendFirehoseSummary(repoRoot, date, summary)
  log(`news cycle: fetched ${raws.length}, ${items.length} new, picked ${picked}, watched ${watched}, dropped ${dropped}; groq ${groqRequests} req / ${groqTokens} tok`)
  return summary
}
