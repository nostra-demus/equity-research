// One ingest cycle, end to end: FETCH (GDELT + RSS in parallel) → NORMALIZE+FILTER+DEDUP → TRIAGE
// (Groq, batched, budget- and rate-limited) → WRITE (ranked inbox + per-item feed records + firehose
// summary + board refresh + live bus events). It NEVER throws — every stage degrades to a logged,
// counted no-op — and it NEVER spends Claude money. All I/O is dependency-injectable so the whole
// pipeline is unit-testable with mocked fetch + clock.

import path from 'node:path'
import { NEWS, REPO_ROOT, STATE_DIR } from '../config'
import { newsBus } from './bus'
import { appendFeedItems } from './feed'
import { fetchGdelt } from './sources/gdelt'
import { fetchRss } from './sources/rss'
import { fetchNse } from './sources/nse'
import { loadLedgerEventIds, normalizeAndFilter } from './normalize'
import { SeenCache } from './seen-cache'
import { Budget, getSharedLimiter } from './triage/budget'
import { estimateTokens, scoreToBand, triageBatch } from './triage/groq'
import { rankScore, preTriagePriority } from './rank'
import { deriveScope, deriveSourceTier } from './scope'
import { appendFirehoseSummary, mergeInbox, refreshBoard } from './write-inbox'
import { runThemesCycle, bumpCycleCounter, themesConfigFromNews } from './themes/engine'
import { makeThemeNamer } from './themes/llm'
import type { ThemeItemView } from './themes/types'
import type { CycleSummary, FeedItem, NewsItem, RawArticle, TriagedItem } from './types'
import fs from 'node:fs'

// Items we could NOT score this cycle (daily budget hit, or a Groq batch that failed even after
// retry) spill into this file and are re-queued next cycle. Without it they'd be silently lost:
// the sources won't hand them back (GDELT's lookback ages out; an unchanged RSS feed answers 304).
const DEFERRED_FILE = 'news-deferred.json'
// Spillover backlog of items not yet scored (budget hit / Groq hiccup). Raised with the expanded
// source set so a burst day (earnings season, many filings) doesn't truncate unscored items before
// the next cycle can pick them up.
const DEFERRED_CAP = 1000

function loadDeferred(stateDir: string): NewsItem[] {
  try {
    const arr = JSON.parse(fs.readFileSync(path.join(stateDir, DEFERRED_FILE), 'utf8'))
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

function saveDeferred(stateDir: string, items: NewsItem[]): void {
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(path.join(stateDir, DEFERRED_FILE), JSON.stringify(items.slice(0, DEFERRED_CAP)) + '\n')
  } catch {
    // losing the spillover only costs a re-fetch chance — never the cycle
  }
}

// Tracking-param-insensitive key for the GDELT↔RSS merge ONLY (event_id keeps hashing the verbatim
// URL — that recipe is shared with Gate-0 and must not drift). Stops the same story arriving once
// via GDELT's canonical URL and once via an RSS link with ?utm_… from being scored twice.
function urlKey(u: string): string {
  try {
    const x = new URL(u)
    x.hash = ''
    const drop: string[] = []
    x.searchParams.forEach((_v, k) => {
      if (/^utm_/i.test(k) || /^(fbclid|gclid|cmpid|mc_cid|mc_eid|ref)$/i.test(k)) drop.push(k)
    })
    for (const k of drop) x.searchParams.delete(k)
    return x.toString().replace(/\/+$/, '')
  } catch {
    return u
  }
}

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

  // 1. FETCH — GDELT, RSS and the NSE primary-disclosure API in parallel; one layer failing never
  // blocks the others. Merge by URL (first wins; order is only a tiebreak — each carries its own
  // `via` provenance for the live feed).
  const fetches = await Promise.allSettled([
    fetchGdelt({ lookbackMin: cfg.gdeltLookbackMin, baseUrl: cfg.gdeltBaseUrl }, { fetchFn, sleep, log }),
    cfg.rssEnabled
      ? fetchRss(
          {
            feedsPath: path.join(repoRoot, cfg.rssFeedsPath),
            lookbackMin: cfg.gdeltLookbackMin,
            timeoutMs: cfg.rssTimeoutMs,
            stateDir,
            userAgent: cfg.rssUserAgent || undefined,
            concurrency: cfg.rssConcurrency,
            perHostGapMs: cfg.rssPerHostGapMs,
          },
          { fetchFn, sleep, now, log },
        )
      : Promise.resolve([] as RawArticle[]),
    cfg.nseEnabled
      ? fetchNse({ baseUrl: cfg.nseBaseUrl, lookbackHours: cfg.nseLookbackHours, timeoutMs: cfg.rssTimeoutMs, userAgent: cfg.rssUserAgent || undefined }, { fetchFn, sleep, now, log })
      : Promise.resolve([] as RawArticle[]),
  ])
  const raws: RawArticle[] = []
  const seenUrl = new Set<string>()
  for (const f of fetches) {
    if (f.status !== 'fulfilled') {
      log(`fetch layer failed: ${(f as PromiseRejectedResult).reason?.message || f.reason}`)
      continue
    }
    for (const a of f.value) {
      const key = a.url && urlKey(a.url)
      if (key && !seenUrl.has(key)) {
        seenUrl.add(key)
        raws.push(a)
      }
    }
  }

  // 2. NORMALIZE + FILTER + DEDUP — plus the previous cycle's deferred (unscored) spillover
  const seen = SeenCache.load(stateDir)
  const ledgerIds = loadLedgerEventIds(path.join(repoRoot, 'screener', 'ledger', 'events.ndjson'))
  const fresh = normalizeAndFilter(raws, { ledgerEventIds: ledgerIds, seen, now })
  const freshIds = new Set(fresh.map((i) => i.event_id))
  const requeued = loadDeferred(stateDir).filter((d) => d?.event_id && !freshIds.has(d.event_id) && !seen.has(d.event_id))
  // Order the triage queue by a cheap deterministic pre-priority so the SCARCE Groq budget scores the
  // most promising items first (a material keyword / primary filing / fresh item before routine news).
  // Whatever the budget can't reach this cycle defers to the next — never lost, but now the tail that
  // defers is the low-priority tail, not a random one. (rank.ts preTriagePriority.)
  const nowDate = now()
  const items = [...requeued, ...fresh].sort((a, b) => preTriagePriority(b, nowDate) - preTriagePriority(a, nowDate))

  if (!items.length) {
    saveDeferred(stateDir, []) // any stale spillover was consumed by the filters above
    const summary: CycleSummary = { ...blank, ok: true, fetched: raws.length, note: 'no new on-list items' }
    appendFirehoseSummary(repoRoot, date, summary)
    newsBus.emit({ type: 'news-cycle', summary })
    return summary
  }

  // 3. TRIAGE (batched, budget + adaptive token-per-minute pacing). The pacer is SHARED with the
  // on-demand enrichment read so the two never collectively blow the per-minute ceiling, and it LEARNS
  // the live ceiling from Groq's response headers (no 429 bursts; full sustainable throughput).
  const budget = Budget.load(stateDir, cfg.groqDailyReqCap, cfg.groqDailyTokenCap, now().getTime())
  const limiter = getSharedLimiter(cfg.groqRpm, cfg.groqTpm)
  const triaged: TriagedItem[] = []
  const deferred: NewsItem[] = [] // unscored this cycle (budget hit / batch failed) — re-queued next cycle
  let groqRequests = 0
  let groqTokens = 0
  let budgetHit = false
  let batchFailed = false

  for (let i = 0; i < items.length; i += cfg.triageBatch) {
    const batch = items.slice(i, i + cfg.triageBatch)
    if (!budget.canSpend(estimateTokens(batch.length))) {
      budgetHit = true
      deferred.push(...items.slice(i)) // everything from here on waits for the next cycle
      break
    }
    await limiter.acquire(estimateTokens(batch.length), sleep, () => now().getTime())
    const res = await triageBatch(batch, { model: cfg.groqModel, baseUrl: cfg.groqBaseUrl, apiKey: cfg.groqApiKey, maxTokens: cfg.triageMaxTokens }, fetchFn, sleep)
    groqRequests += res.requests
    groqTokens += res.tokens
    budget.record(res.requests, res.tokens)
    limiter.learn(res.rate, () => now().getTime()) // track the live per-minute ceiling + back off on 429
    if (!res.ok) {
      // a failed batch is UNSCORED, not scored-zero: do NOT mark seen (the 7-day cache would make
      // the drop permanent) — defer the whole batch and try again next cycle
      batchFailed = true
      deferred.push(...batch)
      log(`triage batch @${i}: ${res.note || 'failed'} — ${batch.length} item${batch.length === 1 ? '' : 's'} deferred to next cycle`)
      continue
    }
    for (let j = 0; j < batch.length; j++) {
      const it = batch[j]
      const t = res.byIndex.get(j)
      // a missing index on an OK response is a deliberate model omission → score 0 (drop), marked
      // seen so we don't pay to re-score it next cycle
      const score = t ? t.materiality_pre_score : 0
      // composite PRIORITY: the Groq read, lifted/lowered by the §4 source tier, company-vs-broad
      // scope, strongest event, size and recency — the deterministic, no-extra-cost re-rank that
      // stops terse primary filings being buried under verbose news (see rank.ts). triage_score
      // becomes this priority; materiality_pre_score keeps the raw Groq read for transparency.
      const ranked = rankScore(
        { materiality_pre_score: score, issuer_linkage: t?.issuer_linkage, companies: t?.companies, event_types: t?.event_types, input_nature: it.input_nature, headline: it.headline, size_bucket: t?.size_bucket, found_at: it.found_at },
        now(),
        cfg.rankBoostWeight,
      )
      const band = scoreToBand(ranked.rank_score, cfg.pickThreshold, cfg.watchThreshold)
      seen.add(it.event_id, score)
      triaged.push({
        ...it,
        triage_score: ranked.rank_score,
        triage_reason: t?.why || 'not material',
        relevance: t?.relevance || 'irrelevant',
        materiality_pre_score: score,
        event_types: t?.event_types || [],
        issuer_linkage: t?.issuer_linkage || 'sector',
        companies: t?.companies || [],
        size_bucket: t?.size_bucket || 'unknown',
        band,
        rank_factors: ranked.rank_factors,
      })
    }
  }
  budget.save()
  seen.save()
  saveDeferred(stateDir, deferred)

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

  // per-item feed records — for KEPT and DROPPED alike, so the live wire shows everything the
  // scanner read and why; then stream each to live listeners
  const feedItems: FeedItem[] = triaged.map((t) => ({
    kind: 'item',
    ts,
    event_id: t.event_id,
    headline: t.headline,
    url: t.url,
    domain: t.domain,
    source_name: t.source_name,
    via: t.via || 'gdelt',
    region: t.region,
    input_nature: t.input_nature,
    triage_score: t.triage_score,
    band: t.band,
    triage_reason: t.triage_reason,
    relevance: t.relevance,
    event_types: t.event_types,
    issuer_linkage: t.issuer_linkage,
    companies: t.companies,
    size_bucket: t.size_bucket,
    // derived, zero-cost classification — persisted so the wire + a later backfill agree
    scope: deriveScope(t),
    source_tier: deriveSourceTier(t),
    snippet: t.snippet, // the feed's own lede — fetch-free body for on-open enrichment
    rank_factors: t.rank_factors, // the composite-priority breakdown (rank.ts) — for the WHY in the UI
    dedup_status: t.dedup_status,
    inboxed: t.band !== 'drop',
  }))
  // emit exactly what was persisted, so the live wire and a later backfill agree
  const written = appendFeedItems(repoRoot, date, feedItems, cfg.feedItemsDailyCap)
  for (const fi of feedItems.slice(0, written)) newsBus.emit({ type: 'news-item', item: fi })

  const note = budgetHit
    ? `daily Groq budget reached — ${deferred.length} item${deferred.length === 1 ? '' : 's'} deferred to next cycle`
    : batchFailed
      ? `${deferred.length} item${deferred.length === 1 ? '' : 's'} not scored (Groq hiccup) — deferred to next cycle`
      : undefined
  const summary: CycleSummary = {
    ts, ok: true, fetched: raws.length, candidates: items.length,
    picked, watched, dropped, inboxed, groq_requests: groqRequests, groq_tokens: groqTokens,
    note,
  }
  appendFirehoseSummary(repoRoot, date, summary)
  newsBus.emit({ type: 'news-cycle', summary })
  log(`news cycle: fetched ${raws.length}, ${items.length} new, picked ${picked}, watched ${watched}, dropped ${dropped}; groq ${groqRequests} req / ${groqTokens} tok`)

  // 5. THEMES — bucket the material items into living, ranked investment themes (assign every cycle,
  // discover periodically, decay automatically). Runs AFTER the write and is fully guarded, so a themes
  // bug can never block or corrupt the core pipeline (same fail-soft posture as every other stage).
  if (cfg.themesEnabled) {
    try {
      const themeItems: ThemeItemView[] = picks
        .filter((t) => t.triage_score >= cfg.themesMinScore)
        .map((t) => ({
        event_id: t.event_id,
        headline: t.headline,
        found_at: t.found_at,
        companies: t.companies,
        event_types: t.event_types,
        issuer_linkage: t.issuer_linkage,
        triage_score: t.triage_score,
        materiality_pre_score: t.materiality_pre_score,
        source_tier: deriveSourceTier(t),
        scope: deriveScope(t),
        region: t.region,
      }))
      const n = bumpCycleCounter(stateDir)
      const res = await runThemesCycle({
        repoRoot,
        stateDir,
        items: themeItems,
        runDiscovery: n % Math.max(1, cfg.themesDiscoverEveryCycles) === 0,
        minScore: cfg.themesMinScore,
        now,
        cfg: themesConfigFromNews(cfg),
        llmNamer: makeThemeNamer(cfg, fetchFn, stateDir, log),
      })
      for (const s of res.changed) newsBus.emit({ type: 'theme-update', theme: s })
      if (res.changed.length) log(`themes: ${res.changed.length} updated`)
    } catch (e: any) {
      log(`themes stage error: ${e?.message || e}`)
    }
  }
  return summary
}
