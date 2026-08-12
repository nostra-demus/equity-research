// One ingest cycle, end to end: FETCH (GDELT + RSS in parallel) → NORMALIZE+FILTER+DEDUP → TRIAGE
// (Groq, batched, budget- and rate-limited) → WRITE (ranked inbox + per-item feed records + firehose
// summary + board refresh + live bus events). It NEVER throws — every stage degrades to a logged,
// counted no-op — and it never charges a card: the last-resort triage tier runs on the host's flat-fee
// Claude subscription (triage/claude-cli.ts), bounded by a daily $ ceiling, and only once every free brain
// is out. All I/O is dependency-injectable so the pipeline is unit-testable with mocked fetch + clock.

import path from 'node:path'
import { NEWS, REPO_ROOT, STATE_DIR } from '../config'
import { newsBus } from './bus'
import { appendFeedItems, readFeed } from './feed'
import { assignDedupGroups } from './dedup'
import { fetchGdelt } from './sources/gdelt'
import { fetchRss } from './sources/rss'
import { fetchNse } from './sources/nse'
import { fetchExchangeIntl } from './sources/exchange-intl'
import { fetchGovData } from './sources/gov-data'
import { fetchReddit } from './sources/reddit'
import { loadLedgerEventIds, normalizeAndFilter } from './normalize'
import { pickTranslation } from './lang'
import { resolveEventRegion } from './geo'
import { resolveCountry } from './geography'
import { invalidateFacets } from './facets'
import { SeenCache } from './seen-cache'
import { Budget, NON_BINDING_DAILY_TOKEN_CAP, UsdBudget, armCooldown, clearCooldown, conservativeChatTokenBound, cooldownInfo, getNamedLimiter, getSharedGeminiLimiter, getSharedLimiter, isCoolingDown, readCooldownUntil, type PaceCfg } from './triage/budget'
import { triageBatchGemini } from './triage/gemini'
import { triageBatchAnthropic } from './triage/anthropic'
import { isAuthExpiredNote, isPlanQuotaNote, isTerminalApiNote, triageBatchClaudeCli, type ClaudeCliRunner } from './triage/claude-cli'
import { SYSTEM, buildUserMessage, estimateTokens, scoreToBand, triageBatch, type TriageOptions, type TriageResult } from './triage/groq'
import { rankScore, preTriagePriority, capSocialBand, capSocialScore, deriveMaterialityLabel } from './rank'
import { deriveScope, deriveSourceTier, toEventScope } from './scope'
import { deriveCommodities } from './commodities'
import { appendFirehoseSummary, mergeInbox, refreshBoard } from './write-inbox'
import { runThemesCycle, bumpCycleCounter, themesConfigFromNews } from './themes/engine'
import { makeThemeNamer } from './themes/llm'
import type { ThemeItemView } from './themes/types'
import type { CycleSummary, FeedItem, NewsItem, RawArticle, TriagedItem } from './types'
import { updateSemanticIndex } from '../retrieval/semantic'
import fs from 'node:fs'

// Items we could NOT score this cycle (daily budget hit, or a Groq batch that failed even after
// retry) spill into this file and are re-queued next cycle. Without it they'd be silently lost:
// the sources won't hand them back (GDELT's lookback ages out; an unchanged RSS feed answers 304).
const DEFERRED_FILE = 'news-deferred.json'

/** Worst-case billable tokens for one primary-Groq triage attempt. */
export function triageGroqTokenBound(items: NewsItem[], options: TriageOptions): number {
  return conservativeChatTokenBound(SYSTEM, buildUserMessage(items), options.maxTokens ?? 2000)
}

function hardCapAttempts(budget: Budget, perAttemptTokens: number, maxAttempts: number): number {
  return Math.min(Math.max(1, maxAttempts), budget.remainingRequests, Math.floor(budget.remainingTokens / perAttemptTokens))
}

function chargedAttemptTokens(result: TriageResult | undefined, perAttemptTokens: number): { requests: number; tokens: number } {
  const requests = Number.isFinite(result?.requests) ? Math.max(0, Math.floor(result!.requests)) : 0
  const reportedTokens = Number(result?.tokens)
  const tokens = requests > 0
    ? (reportedTokens > 0 ? reportedTokens + perAttemptTokens * Math.max(0, requests - 1) : perAttemptTokens * requests)
    : 0
  return { requests, tokens }
}

/** One primary-Groq ingester batch with an atomic reservation shared by chat/read/idea callers. */
export async function triageGroqWithReservation(args: {
  budget: Budget
  pace: PaceCfg
  estimatedTokens: number
  items: NewsItem[]
  options: TriageOptions
  now?: () => number
  fetchFn?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  maxAttempts?: number
}): Promise<TriageResult | null> {
  const now = args.now || (() => Date.now())
  const perAttemptTokens = triageGroqTokenBound(args.items, args.options)
  let attempts = hardCapAttempts(args.budget, perAttemptTokens, args.maxAttempts ?? 2)
  const at = now()
  while (attempts > 0 && !args.budget.pacedCanSpend(perAttemptTokens * attempts, args.pace, at, attempts)) attempts--
  if (!attempts) return null
  const reservation = args.budget.tryReserve(perAttemptTokens * attempts, args.pace, at, attempts)
  if (!reservation) return null
  let result: TriageResult | undefined
  try {
    result = await triageBatch(args.items, { ...args.options, maxAttempts: attempts }, args.fetchFn, args.sleep)
    return result
  } finally {
    const charged = chargedAttemptTokens(result, perAttemptTokens)
    // A timeout/429/malformed reply often has no usage object even though the provider counted the call.
    // Charge the full safe bound for every sent attempt without reported usage; zero (or the empirical
    // rate-limiter estimate) is not an honest fallback for work authorized under a hard daily cap.
    args.budget.reconcile(reservation, charged.requests, charged.tokens)
  }
}
// Spillover backlog of items not yet scored (budget hit / LLM hiccup / plan quota spent). THE CAP IS A
// LOSS BOUNDARY, not a nicety: whatever sits past it when saveDeferred runs is written to no file and,
// once it ages out of its source window, is gone — never scored, never re-fetchable. 1,000 was BELOW real
// peaks (2,383 on 2026-07-07; 1,244 on 2026-07-16), so the low-priority tail was still being silently
// binned on exactly the overload days this backlog exists for. It must comfortably exceed the inflow of a
// whole exhaustion window (free tiers AND the plan out) so nothing is lost while we WAIT for quota —
// deferring is fine, dropping is not. The cost of a bigger cap is file size / write volume (~500B an item,
// rewritten each cycle), which is why it stays bounded and env-tunable rather than unlimited.
export const DEFERRED_CAP = (() => { const n = Number(process.env.NEWS_DEFERRED_CAP); return Number.isFinite(n) && n > 0 ? n : 5000 })()

export function loadDeferred(stateDir: string): NewsItem[] {
  try {
    const arr = JSON.parse(fs.readFileSync(path.join(stateDir, DEFERRED_FILE), 'utf8'))
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
}

// ATOMIC write: this file OWNS the loss boundary — the whole backlog lives here. A plain truncating write
// that fails mid-way (e.g. ENOSPC during a long outage, exactly when the backlog is largest) would leave a
// truncated/corrupt file that next loadDeferred parses as [] — silently dropping up to DEFERRED_CAP held
// items with no trace. So write a temp file in the same dir and rename it over the target (atomic on one
// filesystem): a failed temp write leaves the last-good backlog intact, and the error is LOGGED, not swallowed.
// Returns true when the backlog was persisted this cycle, false when the write failed and the last-good file
// was kept instead. The caller surfaces a false as `deferred_write_failed` on the cycle summary, so the
// backlog/deferred counts are not reported as safely-on-disk when the new list never reached the file — an
// ENOSPC mid-outage could otherwise show items "waiting" that were actually only in memory (Codex review, PR #316).
export function saveDeferred(stateDir: string, items: NewsItem[], log: (m: string) => void = () => {}): boolean {
  const target = path.join(stateDir, DEFERRED_FILE)
  const tmp = `${target}.tmp`
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(tmp, JSON.stringify(items.slice(0, DEFERRED_CAP)) + '\n')
    fs.renameSync(tmp, target)
    return true
  } catch (e: any) {
    log(`saveDeferred failed (${e?.message || e}) — kept the last-good backlog; ${items.length} item(s) not re-persisted this cycle`)
    try { fs.rmSync(tmp, { force: true }) } catch { /* best-effort temp cleanup */ }
    return false
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
  // drain-only mode: skip the FETCH layers and just triage the deferred backlog (the scheduler runs
  // this between fetch cycles so Groq never sits idle while there's a backlog + daily budget left).
  skipFetch?: boolean
  // the cycle's abort signal (from runAbortableCycle's wall-clock guard). When it fires, the triage loop
  // stops starting new batches/provider calls instead of grinding the whole backlog — see the break below.
  signal?: AbortSignal
  // The subscription last-resort tier SPAWNS the `claude` CLI, which `fetchFn` cannot stub. Inject a fake
  // here to exercise that tier without a real process (and without drawing the host's plan quota); a test
  // that doesn't care should instead set config.anthropicFallbackEnabled=false. Undefined ⇒ the real CLI.
  claudeCliRunner?: ClaudeCliRunner
}

/** Maintain Themes on EVERY scanner clock, including a fetch that produced no new on-list items. Theme
 * admission and retirement depend on wall time, and validation retries depend on discovery cadence; tying
 * this stage to a non-empty triage queue leaves open clients with stale actionable rows on quiet days. */
async function runThemesStage(input: {
  cfg: Cfg
  repoRoot: string
  stateDir: string
  picks: TriagedItem[]
  fetchFn: typeof fetch
  now: () => Date
  log: (m: string) => void
}): Promise<void> {
  const { cfg, repoRoot, stateDir, picks, fetchFn, now, log } = input
  if (!cfg.themesEnabled) return
  try {
    const themeItems: ThemeItemView[] = picks
      .filter((t) => t.triage_score >= cfg.themesMinScore)
      .map((t) => ({
        event_id: t.event_id,
        dedup_group: t.dedup_group, // one underlying story across publisher copies — Themes counts it once
        headline: t.headline,
        headline_en: t.headline_en,
        found_at: t.found_at,
        companies: t.companies,
        event_types: t.event_types,
        issuer_linkage: t.issuer_linkage,
        triage_score: t.triage_score,
        materiality_pre_score: t.materiality_pre_score,
        source_tier: deriveSourceTier(t),
        source_name: t.source_name,
        url: t.url,
        scope: deriveScope(t),
        region: t.region,
        country: resolveCountry(t.headline, t.headline_en, t.companies, t.region, t.issuer_linkage),
        commodities: deriveCommodities(t),
      }))
    const n = bumpCycleCounter(stateDir)
    let themesTimeout: ReturnType<typeof setTimeout> | undefined
    const res = await Promise.race([
      runThemesCycle({
        repoRoot,
        stateDir,
        items: themeItems,
        runDiscovery: n % Math.max(1, cfg.themesDiscoverEveryCycles) === 0,
        minScore: cfg.themesMinScore,
        now,
        cfg: themesConfigFromNews(cfg),
        llmNamer: makeThemeNamer(cfg, fetchFn, stateDir, log),
      }),
      new Promise<never>((_, reject) => {
        themesTimeout = setTimeout(() => reject(new Error('themes stage exceeded 90s — skipped')), 90_000)
        themesTimeout.unref?.()
      }),
    ]).finally(() => { if (themesTimeout) clearTimeout(themesTimeout) })
    for (const summary of res.changed) newsBus.emit({ type: 'theme-update', theme: summary })
    for (const removal of res.removed) newsBus.emit({ type: 'theme-remove', removal })
    if (res.changed.length || res.removed.length) log(`themes: ${res.changed.length} updated, ${res.removed.length} removed`)
  } catch (e: any) {
    log(`themes stage error: ${e?.message || e}`)
  }
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

  const phase: 'fetch' | 'drain' = deps.skipFetch ? 'drain' : 'fetch'
  const blank: CycleSummary = { ts, ok: false, fetched: 0, candidates: 0, picked: 0, watched: 0, dropped: 0, inboxed: 0, groq_requests: 0, groq_tokens: 0, phase }

  if (!cfg.groqApiKey) {
    await runThemesStage({ cfg, repoRoot, stateDir, picks: [], fetchFn, now, log })
    return { ...blank, note: 'no GROQ_API_KEY — ingester idle' }
  }

  // Announce the cycle BEFORE any network work, so the cockpit can say "looking now" for its whole
  // duration rather than staying blind until the summary lands ~minutes later. Every exit path below
  // emits a matching news-cycle, so a start is never left dangling.
  newsBus.emit({ type: 'news-cycle-start', ts, phase })

  // 1. FETCH — GDELT, RSS and the NSE primary-disclosure API in parallel; one layer failing never
  // blocks the others. Merge by URL (first wins; order is only a tiebreak — each carries its own
  // `via` provenance for the live feed). In drain-only mode we skip the network entirely and just
  // work the deferred backlog (no re-fetch → never hammers the upstream feeds between fetch cycles).
  const fetches = deps.skipFetch ? [] as PromiseSettledResult<RawArticle[]>[] : await Promise.allSettled([
    fetchGdelt({ lookbackMin: cfg.gdeltLookbackMin, baseUrl: cfg.gdeltBaseUrl, chunkSize: cfg.gdeltChunkSize, chunkGapMs: cfg.gdeltChunkGapMs, timeoutMs: cfg.rssTimeoutMs, cycleMs: cfg.pollIntervalMin * 60_000, backoffCyclesOn429: cfg.gdeltBackoffCyclesOn429 }, { fetchFn, sleep, log }),
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
    cfg.exchangeIntlEnabled
      ? fetchExchangeIntl({ lookbackHours: cfg.exchangeIntlLookbackHours, timeoutMs: cfg.rssTimeoutMs, userAgent: cfg.rssUserAgent || undefined }, { fetchFn, sleep, now, log })
      : Promise.resolve([] as RawArticle[]),
    cfg.govDataEnabled
      ? fetchGovData({ lookbackDays: cfg.govDataLookbackDays, timeoutMs: cfg.rssTimeoutMs }, { fetchFn, sleep, now, log })
      : Promise.resolve([] as RawArticle[]),
    cfg.redditEnabled
      ? fetchReddit(
          {
            feedsPath: path.join(repoRoot, cfg.redditFeedsPath),
            lookbackHours: cfg.redditLookbackHours,
            timeoutMs: cfg.rssTimeoutMs,
            perHostGapMs: cfg.redditPerHostGapMs,
            mirrorTemplate: cfg.redditMirrorTemplate || undefined,
            cycleMs: cfg.pollIntervalMin * 60_000,
            backoffCyclesOn429: cfg.redditBackoffCyclesOn429,
            overallBudgetMs: cfg.redditOverallBudgetMs,
          },
          { fetchFn, sleep, now, log },
        )
      : Promise.resolve([] as RawArticle[]),
  ])
  const raws: RawArticle[] = []
  const seenUrl = new Set<string>()
  // per-source delivery for THIS cycle, keyed by `via` — the live counterpart to the on-open source
  // health snapshot. A layer that fetched nothing simply never appears.
  const bySource: Record<string, number> = {}
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
        const via = a.via || 'other'
        bySource[via] = (bySource[via] || 0) + 1
      }
    }
  }
  // A drain fetches nothing, so `sources` stays absent there rather than reporting a misleading all-zero row.
  const sources = phase === 'fetch' ? bySource : undefined

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
    saveDeferred(stateDir, [], log) // any stale spillover was consumed by the filters above
    const summary: CycleSummary = { ...blank, ok: true, fetched: raws.length, fresh: fresh.length, carryover: requeued.length, backlog: 0, backlog_cap: DEFERRED_CAP, note: 'no new on-list items', ...(sources ? { sources } : {}) }
    appendFirehoseSummary(repoRoot, date, summary)
    newsBus.emit({ type: 'news-cycle', summary })
    await runThemesStage({ cfg, repoRoot, stateDir, picks: [], fetchFn, now, log })
    return summary
  }

  // 3. TRIAGE (batched, budget + adaptive token-per-minute pacing). The pacer is SHARED with the
  // on-demand enrichment read so the two never collectively blow the per-minute ceiling, and it LEARNS
  // the live ceiling from Groq's response headers (no 429 bursts; full sustainable throughput).
  const budget = Budget.load(stateDir, cfg.groqDailyReqCap, cfg.groqDailyTokenCap, now().getTime())
  const limiter = getSharedLimiter(cfg.groqRpm, cfg.groqTpm)
  // Gemini OVERFLOW — a ROTATION POOL of free models. Each model is a SEPARATE per-project-per-model
  // free daily bucket (resets midnight Pacific), so the pool stacks the (tiny, ~20/day) per-model
  // trickles. When Groq is paced/capped, a batch goes to the first pool model with room instead of
  // deferring; a per-DAY 429 marks that model done for the day. Inactive (empty) when no key — the
  // Groq-only path is byte-for-byte unchanged.
  const geminiOn = cfg.geminiEnabled && !!cfg.geminiApiKey && cfg.geminiModels.length > 0
  // Each pool model also carries a per-cycle `failed` flag AND a cross-cycle cooldown (id `gemini:<model>`),
  // so a transient Gemini failure isn't re-picked every batch (it had no per-cycle flag before — the audit's
  // intra-cycle burn) NOR re-probed every cycle during an outage (draining the tiny ~20/day bucket).
  const geminiPool = geminiOn
    ? cfg.geminiModels.map((e) => ({
        model: e.model,
        budget: Budget.load(stateDir, e.dailyReqCap, cfg.geminiDailyTokenCap, now().getTime(), `gemini-budget-${e.model.replace(/[^a-z0-9]+/gi, '-')}.json`, cfg.geminiDayTz),
        failed: false,
        coolingDown: isCoolingDown(stateDir, `gemini:${e.model}`, now().getTime()),
        cooldownWasSet: readCooldownUntil(stateDir, `gemini:${e.model}`),
      }))
    : []
  const geminiLimiter = geminiOn ? getSharedGeminiLimiter(cfg.geminiRpm, cfg.geminiTpm) : null
  // OpenAI-compatible OVERFLOW registry (Cerebras, OpenRouter, NVIDIA, …) — each its own budget + per-minute
  // limiter, tried in config order after Groq. Adding a provider is a config entry; this loop needs no change.
  // A token-gated provider (Cerebras) sets dailyTokenCap + tpm so it paces on its BINDING limit (tokens); a
  // request-gated one omits them → a non-binding 50M token cap + tpm 0 (request-spacing only), as before.
  const overflow = cfg.overflowProviders.map((p) => ({
    p,
    budget: Budget.load(stateDir, p.dailyReqCap, p.dailyTokenCap ?? NON_BINDING_DAILY_TOKEN_CAP, now().getTime(), p.budgetFile, p.dayTz),
    limiter: getNamedLimiter(p.id, p.rpm, p.tpm ?? 0),
    requests: 0,
    tokens: 0,
    failed: false, // set when a call errors this cycle → skip it so the batch flows to the next provider
    // cross-cycle cooldown (read once at cycle start, same as Groq's): skip a provider that a PRIOR cycle
    // marked unhealthy so a sustained outage can't re-probe it every cycle and drain its (small) daily cap.
    coolingDown: isCoolingDown(stateDir, p.id, now().getTime()),
    cooldownWasSet: readCooldownUntil(stateDir, p.id), // >0 → a marker existed at start; clear it if we recover
  }))
  // The overflow chain runs in TWO segments around Gemini. A DEMOTED local tier (NEWS_LOCAL_PRIMARY=0) joins
  // this chain as its last entry (config.buildOverflowProviders), but "last in the array" was still ahead of
  // Gemini, because the whole loop below runs BEFORE the Gemini block. Local is unlimited-but-slow while
  // Gemini is fast and free — putting the slow tier first starved the fast one, so a batch that Gemini could
  // have scored in seconds sat behind a minutes-long local call. Split the walk: cloud providers first, the
  // local tier only after Gemini has had its turn. Order within each segment is unchanged.
  const overflowCloud = overflow.filter((o) => o.p.id !== 'local')
  const overflowLocal = overflow.filter((o) => o.p.id === 'local')
  // LAST-RESORT tier (Claude Haiku). Default backend = the host's flat-fee SUBSCRIPTION via the local
  // `claude` CLI, which needs NO key — so it is ON by default; `api` mode instead needs a dedicated metered
  // key. Bounded by a daily $ LEDGER (restart-safe) rather than request counts, because that is the unit the
  // operator reasons in and the unit the CLI reports. Own per-minute limiter + cross-cycle cooldown, exactly
  // like the free providers — but it draws real (plan or metered) budget, so it is the LAST thing tried
  // before a batch defers. Ceiling reached ⇒ null-op ⇒ the defer path below is unchanged.
  const anthropicOn = cfg.anthropicFallbackEnabled && (cfg.anthropicFallbackMode === 'subscription' || !!cfg.anthropicApiKey)
  const anthropicBudget = anthropicOn
    ? UsdBudget.load(stateDir, cfg.anthropicDailyUsd, now().getTime(), 'anthropic-triage-budget.json')
    : null
  const anthropicLimiter = anthropicOn ? getNamedLimiter('anthropic-triage', cfg.anthropicRpm, 0) : null
  const anthropicCooldownWasSet = anthropicOn ? readCooldownUntil(stateDir, 'anthropic-triage') : 0
  const anthropicCoolingDown = anthropicOn && isCoolingDown(stateDir, 'anthropic-triage', now().getTime())
  // WHY the tier is cooling, carried on the marker itself. The failure note only exists in the cycle that
  // actually failed, so a later cycle — the one the operator is usually looking at — could otherwise only
  // say "backing off after an error". With this, an expired sign-in keeps naming itself (and its fix) on
  // every subsequent cycle until it clears.
  const anthropicCooldownReason = anthropicOn ? cooldownInfo(stateDir, 'anthropic-triage').reason || '' : ''
  // LOCAL PRIMARY BRAIN. cfg.localProvider is non-null ONLY when local is enabled AND primary (the default once
  // enabled) — it is then tried FIRST for every batch below, ahead of Groq, with NO daily cap and no per-minute
  // spacing. Its budget file (local-budget.json) is still recorded so the cockpit can show live tokens/requests
  // processed today. When null (local off, or demoted to a fallback via NEWS_LOCAL_PRIMARY=0 → it rejoins the
  // overflow chain), this whole path is inert and the Groq-first chain is byte-for-byte unchanged.
  const localProvider = cfg.localProvider
  const localOn = !!localProvider
  const localLimiter = localOn ? getNamedLimiter('local', localProvider!.rpm, localProvider!.tpm ?? 0) : null
  const localBudget = localOn ? Budget.load(stateDir, localProvider!.dailyReqCap, localProvider!.dailyTokenCap ?? NON_BINDING_DAILY_TOKEN_CAP, now().getTime(), localProvider!.budgetFile, localProvider!.dayTz) : null
  const localCoolingDown = localOn && isCoolingDown(stateDir, 'local', now().getTime())
  const localCooldownWasSet = localOn ? readCooldownUntil(stateDir, 'local') : 0
  let localRequests = 0
  let localTokens = 0
  let localDownThisCycle = false // once the local box fails this cycle, stop poking it and use the cloud fallback
  const triaged: TriagedItem[] = []
  const deferred: NewsItem[] = [] // unscored this cycle (budget hit / batch failed) — re-queued next cycle
  let groqRequests = 0
  let groqTokens = 0
  let geminiRequests = 0
  let geminiTokens = 0
  let anthropicRequests = 0
  let anthropicTokens = 0
  let anthropicCostUsd = 0
  let anthropicDownThisCycle = false // once the paid tier fails this cycle, stop poking it (save the cap)
  let anthropicFailNote = '' // the Haiku tier's failure note this cycle → distinguishes plan-quota from a transient error
  let budgetHit = false
  let paceHit = false
  let batchFailed = false
  let aborted = false // the wall-clock guard killed this cycle mid-way and dumped the remainder to the backlog
  // Once Groq fails this cycle (org 429 / network), STOP poking it for the rest of the cycle and go
  // straight to overflow — otherwise a sustained Groq outage burns the whole daily request cap on
  // failed calls (each 429 still counts as a request), locking Groq out even after the outage clears.
  let groqDownThisCycle = false
  // CROSS-CYCLE cooldown: `groqDownThisCycle` only lives for one cycle, but the scheduler runs many
  // cycles/day — so a sustained outage would still burn one failed probe PER cycle across thousands of
  // cycles, which is exactly what emptied the request cap on 2026-07-11 (13,000 req / ~14,100 tok). A
  // prior cycle that failed persists an "unhealthy until T" marker; while it's live we skip Groq entirely
  // this cycle (straight to overflow / defer) and don't touch the marker (it decays by time). We read it
  // once here: `groqCooldownUntil` is the persisted value (0 = none) — kept so that when the window has
  // lapsed (marker present but NOT in the future) we probe once and clear the stale marker if it recovers.
  const groqCooldownUntil = readCooldownUntil(stateDir, 'groq')
  const groqCoolingDown = groqCooldownUntil > now().getTime()
  const pace = { targetTokens: cfg.groqDailyTokenTarget, floorFrac: cfg.groqPaceFloorFrac }

  for (let i = 0; i < items.length; i += cfg.triageBatch) {
    // The wall-clock guard fired: stop starting new batches. The wrapped fetchFn already fails fast, but
    // without this the loop walks every remaining batch retrying each provider (burning daily LLM quota on
    // doomed calls and holding the cycle lock past the abort). Requeue the untriaged remainder to the
    // deferred backlog FIRST (same as the budget-exhausted path below) so the abort loses nothing, then stop.
    if (deps.signal?.aborted) {
      aborted = true
      deferred.push(...items.slice(i))
      log(`cycle aborted — deferring ${items.length - i} remaining item(s) to the next cycle`)
      break
    }
    const batch = items.slice(i, i + cfg.triageBatch)
    const est = estimateTokens(batch.length)
    const groqOptions: TriageOptions = { model: cfg.groqModel, baseUrl: cfg.groqBaseUrl, apiKey: cfg.groqApiKey, maxTokens: cfg.triageMaxTokens }
    const groqAttemptTokenBound = triageGroqTokenBound(batch, groqOptions)
    // PROVIDER PICK. Prefer Groq while it's on-schedule (the pacer keeps it spread across the day); when
    // Groq is paced/capped, overflow to Gemini's separate free pool; defer only when BOTH are out.
    // PROVIDER PICK, in order: Groq (primary, paced across the day) → OpenAI-compatible overflow registry
    // (OpenRouter, NVIDIA, …, best first) → Gemini pool → defer when all are out.
    let groqAttempts = Math.min(2, budget.remainingRequests, Math.floor(budget.remainingTokens / groqAttemptTokenBound))
    const groqAdmissionAt = now().getTime()
    while (groqAttempts > 0 && !budget.pacedCanSpend(groqAttemptTokenBound * groqAttempts, pace, groqAdmissionAt, groqAttempts)) groqAttempts--
    const groqOk = groqAttempts > 0
    // RESILIENT PROVIDER CHAIN: try Groq (primary) → overflow registry → Gemini pool, falling to the
    // NEXT provider whenever the current one is unavailable OR was tried and FAILED. The old code only
    // reached overflow when Groq was capped — so a Groq outage (org 429 / network blip) just deferred
    // every batch AND burned the daily request cap on failures. Now a single provider being down can
    // never stall triage: the batch flows to whoever is up. `res` stays undefined only when NOTHING
    // was even attempted (all daily budgets out) → that's the genuine "defer the rest" case.
    let res
    // LOCAL PRIMARY BRAIN, tried FIRST: unlimited, $0, no cap. When the local box is up it scores the WHOLE
    // scan and the Groq → overflow → Gemini → Haiku chain below never fires — no ceiling, no daily-cap loss.
    // When it is down this cycle (box asleep / unreachable / error), we arm a SHORT cooldown and fall straight
    // through to that chain, exactly as before. Inert when local is off or demoted (localProvider is null),
    // so the Groq-first path is unchanged: `res` stays undefined and the gate below runs Groq first.
    if (localProvider && !localDownThisCycle && !localCoolingDown) {
      await localLimiter!.acquire(est, sleep, () => now().getTime()) // rpm 0 → returns immediately (no spacing)
      res = await triageBatch(batch, { model: localProvider.model, models: localProvider.models, baseUrl: localProvider.baseUrl, apiKey: localProvider.apiKey, maxTokens: localProvider.maxTokens, headers: localProvider.headers, extraBody: localProvider.extraBody, timeoutMs: localProvider.timeoutMs, maxAttempts: localProvider.maxAttempts }, fetchFn, sleep)
      localRequests += res.requests
      localTokens += res.tokens
      localBudget!.record(res.requests, res.tokens) // record to local-budget.json so the cockpit shows live throughput
      localLimiter!.learn(res.rate, () => now().getTime())
      if (res.ok) {
        if (localCooldownWasSet) clearCooldown(stateDir, 'local') // box recovered after a prior failure → drop the marker
      } else {
        localDownThisCycle = true // box is down this cycle → stop poking it, fall through to the cloud fallback chain
        // SHORT, FLAT cooldown (base == max flattens the exponential) so the NEXT cycle re-probes quickly when the
        // box wakes — local has no daily cap to protect from failed-probe burn, so fast recovery beats sparing a probe.
        armCooldown(stateDir, now().getTime(), cfg.localCooldownMs, 'local', cfg.localCooldownMs)
      }
    }
    // Groq (now the FIRST FALLBACK when local is primary; the primary when local is off/demoted). Gated on
    // `!res || !res.ok` so it runs only when local didn't already score the batch — when local is off, `res` is
    // undefined here and this is byte-for-byte the old Groq-first behaviour.
    if ((!res || !res.ok) && groqOk && !groqDownThisCycle && !groqCoolingDown) {
      await limiter.acquire(est, sleep, () => now().getTime())
      const reservedResult = await triageGroqWithReservation({
        budget, pace, estimatedTokens: est, items: batch,
        options: groqOptions,
        now: () => now().getTime(), fetchFn, sleep, maxAttempts: 2,
      })
      if (reservedResult) {
        res = reservedResult
        groqRequests += res.requests
        groqTokens += res.tokens
        limiter.learn(res.rate, () => now().getTime()) // track the live per-minute ceiling + back off on 429
        if (!res.ok) {
          groqDownThisCycle = true // Groq is having a bad cycle → skip it for the rest of THIS cycle, save the cap
          // …and across cycles until the window lapses — EXCEPT on a cycle abort, where the wall-clock guard
          // cancelled an in-flight call. That is not a Groq failure, and cooling on it strands the primary tier.
          if (!deps.signal?.aborted) armCooldown(stateDir, now().getTime(), cfg.llmCooldownMs, 'groq', cfg.llmCooldownMaxMs)
        } else if (groqCooldownUntil) {
          clearCooldown(stateDir, 'groq') // a probe after the window lapsed SUCCEEDED → Groq recovered, drop the stale marker
        }
      }
    }
    // Walk a SEGMENT of the overflow chain for THIS SAME batch: a failing/exhausted provider advances to the
    // NEXT one in order, rather than stopping at the first pick. Without this, a one-batch backlog could trap
    // on a dead first provider — its in-cycle `failed` flag resets on the next drain, so the rebuilt chain
    // picks the same dead provider again and never reaches Mistral/OpenRouter (the drain just re-cycles
    // news-deferred.json). The 4xx-exhaust below persists the skip across drains; this loop covers the
    // non-terminal failures (429 / 5xx / network) that don't exhaust, by trying the rest in the same batch.
    const walkOverflow = async (segment: typeof overflow) => {
      for (const ov of segment) {
        // skip already-failed (this cycle), cross-cycle cooling-down, or out-of-budget providers
        if (ov.failed || ov.coolingDown) continue
        const options: TriageOptions = { model: ov.p.model, models: ov.p.models, baseUrl: ov.p.baseUrl, apiKey: ov.p.apiKey, maxTokens: ov.p.maxTokens, headers: ov.p.headers, extraBody: ov.p.extraBody, timeoutMs: ov.p.timeoutMs, maxAttempts: ov.p.maxAttempts }
        const perAttemptTokens = triageGroqTokenBound(batch, options)
        if (!hardCapAttempts(ov.budget, perAttemptTokens, ov.p.maxAttempts ?? 2)) continue
        await ov.limiter.acquire(est, sleep, () => now().getTime())
        const attempts = hardCapAttempts(ov.budget, perAttemptTokens, ov.p.maxAttempts ?? 2)
        const reservation = attempts > 0 ? ov.budget.tryReserve(perAttemptTokens * attempts, undefined, now().getTime(), attempts) : null
        if (!reservation) continue
        // timeoutMs/maxAttempts: undefined for every provider except one that opts into a longer-than-generic
        // call guard (e.g. the local tier — see its OverflowProvider entry) — triageBatch's own defaults
        // (30_000ms, 2 attempts) apply exactly as before when omitted.
        let overflowResult: TriageResult | undefined
        try {
          overflowResult = await triageBatch(batch, { ...options, maxAttempts: attempts }, fetchFn, sleep)
          res = overflowResult
        } finally {
          const charged = chargedAttemptTokens(overflowResult, perAttemptTokens)
          ov.budget.reconcile(reservation, charged.requests, charged.tokens)
        }
        ov.requests += res.requests
        ov.tokens += res.tokens
        if (res.ok) {
          if (ov.cooldownWasSet) clearCooldown(stateDir, ov.p.id) // recovered after a prior cycle's failure → drop the marker
          break // scored — stop walking the chain
        }
        ov.failed = true // skip this provider for the rest of the cycle so the batch can flow to the next
        // a terminal 4xx (auth / out-of-credits / quota) won't recover today — exhaust its daily budget so it's
        // skipped across cycles too (e.g. NVIDIA's finite credit pool running dry), until the daily reset.
        if (/HTTP (400|401|402|403|404|413)/.test(res.note || '')) ov.budget.exhaust()
        // not terminal (429 / 5xx / network): arm the CROSS-CYCLE cooldown so later cycles stop re-probing this
        // provider (draining its small daily cap on failures), then fall through to the NEXT provider this batch.
        // NOT when the cycle was ABORTED: the wall-clock guard cancels an in-flight call, which surfaces here as
        // a generic failure even though the provider is perfectly healthy. Cooling it then strands a good tier in
        // "cooling" for the whole window — the tier never actually failed, the cycle just ran out of time.
        else if (!deps.signal?.aborted) armCooldown(stateDir, now().getTime(), cfg.llmCooldownMs, ov.p.id, cfg.llmCooldownMaxMs)
      }
    }
    // Cloud overflow FIRST — everything except the local tier.
    if (!res || !res.ok) await walkOverflow(overflowCloud)
    if ((!res || !res.ok) && geminiOn) {
      // first pool model with daily room that isn't failed-this-cycle or cross-cycle cooling down
      const geminiOptions: TriageOptions = { model: '', baseUrl: cfg.geminiBaseUrl, apiKey: cfg.geminiApiKey, maxTokens: cfg.geminiMaxTokens }
      const geminiAttemptTokenBound = triageGroqTokenBound(batch, geminiOptions)
      const gemPick = geminiPool.find((g) => !g.failed && !g.coolingDown && hardCapAttempts(g.budget, geminiAttemptTokenBound, 2) > 0)
      if (gemPick) {
        await geminiLimiter!.acquire(est, sleep, () => now().getTime())
        const attempts = hardCapAttempts(gemPick.budget, geminiAttemptTokenBound, 2)
        const reservation = attempts > 0 ? gemPick.budget.tryReserve(geminiAttemptTokenBound * attempts, undefined, now().getTime(), attempts) : null
        if (reservation) {
          let geminiResult: TriageResult | undefined
          try {
            geminiResult = await triageBatchGemini(batch, { ...geminiOptions, model: gemPick.model, maxAttempts: attempts }, fetchFn, sleep)
            res = geminiResult
          } finally {
            const charged = chargedAttemptTokens(geminiResult, geminiAttemptTokenBound)
            gemPick.budget.reconcile(reservation, charged.requests, charged.tokens)
          }
          geminiRequests += res.requests
          geminiTokens += res.tokens
          geminiLimiter!.learn(res.rate, () => now().getTime())
          if (res.ok) {
            if (gemPick.cooldownWasSet) clearCooldown(stateDir, `gemini:${gemPick.model}`) // recovered → drop the marker
          } else {
            gemPick.failed = true // don't re-pick this model for the rest of THIS cycle (the intra-cycle burn fix)
            if (/PerDay/i.test(res.note || '')) gemPick.budget.exhaust() // model's free day is spent → rotation skips it until midnight PT
            // transient → cross-cycle backoff, but NOT on a cycle abort (see the overflow loop above: an aborted
            // in-flight call is not a provider failure, and cooling on it strands a healthy Gemini model).
            else if (!deps.signal?.aborted) armCooldown(stateDir, now().getTime(), cfg.llmCooldownMs, `gemini:${gemPick.model}`, cfg.llmCooldownMaxMs)
          }
        }
      }
    }
    // LOCAL LAST: a demoted local tier is unlimited but slow, so it only gets the batch once Gemini has passed.
    if (!res || !res.ok) await walkOverflow(overflowLocal)
    // LAST-RESORT: every free brain is paced/capped/cooling/failed for this batch → score it on Claude Haiku
    // (the host's subscription by default) rather than deferring and risking the 1,000-cap drop under
    // sustained overload. This is what keeps RECENCY: the item is scored now, not next reset. Gated: enabled
    // + not-already-failed-this-cycle + not cross-cycle cooling + daily $ ceiling not reached + the batch's
    // lead item clears the priority floor. The queue is priority-sorted, so batch[0] is this batch's most
    // material item — gating on it spends the scarce budget on what matters first.
    if (
      (!res || !res.ok) && anthropicOn && !anthropicDownThisCycle && !anthropicCoolingDown &&
      anthropicBudget!.canSpend() && preTriagePriority(batch[0], nowDate) >= cfg.anthropicMinPriority
    ) {
      await anthropicLimiter!.acquire(est, sleep, () => now().getTime())
      const ar = cfg.anthropicFallbackMode === 'subscription'
        ? await triageBatchClaudeCli(batch, { model: cfg.anthropicModel, timeoutMs: cfg.anthropicTimeoutMs, budgetUsd: cfg.anthropicPerCallUsd, budgetRemainingUsd: anthropicBudget!.remaining(), signal: deps.signal }, deps.claudeCliRunner)
        : await triageBatchAnthropic(
            batch,
            { model: cfg.anthropicApiModel, baseUrl: cfg.anthropicBaseUrl, apiKey: cfg.anthropicApiKey, maxTokens: cfg.anthropicMaxTokens, inPricePerMTok: cfg.anthropicInPricePerMTok, outPricePerMTok: cfg.anthropicOutPricePerMTok },
            fetchFn,
            sleep,
          )
      res = ar
      anthropicRequests += ar.requests
      anthropicTokens += ar.tokens
      anthropicCostUsd += ar.costUsd
      anthropicBudget!.record(ar.costUsd) // the $ ledger meters on what the call actually reported
      anthropicLimiter!.learn(ar.rate, () => now().getTime())
      if (ar.ok) {
        if (anthropicCooldownWasSet) clearCooldown(stateDir, 'anthropic-triage') // recovered → drop the marker
      } else {
        anthropicDownThisCycle = true // bad cycle → skip this tier for the rest of it (don't burn the budget)
        anthropicFailNote = ar.note || '' // keep the reason so the cycle note can say plan-quota vs a transient error
        // FOUR failure classes, four responses — because this is the LAST line of defence and its cooldown
        // must fit the actual cause (all keep the same 'anthropic-triage' marker id, so the diagnostics + the
        // drain's anthropicHasHeadroom read it unchanged):
        //   1. an EXPIRED SIGN-IN (HTTP 401 / "authenticate") — checked FIRST, because the terminal-4xx regex
        //      below also matches 401 and used to swallow it. It is not terminal at all: `claude login` on the
        //      host fixes it in seconds. Treating it as terminal did real damage — exhaust() force-marks the
        //      day's $ ledger as fully spent, so (a) the tier stayed dark until the UTC rollover even after the
        //      sign-in was repaired, and (b) the cockpit reported the whole daily ceiling as SPENT when the
        //      failing calls cost $0. So: the SHORT flat cooldown instead, tagged with its reason. The tier
        //      then re-probes ~once a drain and resumes on its own within one drain of the operator signing
        //      back in — and the $0 it actually spent stays $0.
        //   2. terminal 4xx (api mode: bad key / no credits) — won't recover today → exhaust the day's ledger.
        //   3. real plan-quota ("usage limit reached" — the plan's 5-hour/weekly pool is spent) → the LONG
        //      exponential backoff, so later cycles wait for the plan to reset instead of re-spawning the CLI.
        //   4. a TRANSIENT blip (timeout / rate-limit / one-off non-JSON, after the adapter's own in-call
        //      retry already failed) → a SHORT, FLAT cooldown (base==max flattens the exponential to a
        //      constant), so the paid tier re-probes ~once a drain and keeps draining the backlog rather than
        //      going dark for up to an hour while data drops past the cap.
        if (isAuthExpiredNote(ar.note || '')) armCooldown(stateDir, now().getTime(), cfg.anthropicTransientCooldownMs, 'anthropic-triage', cfg.anthropicTransientCooldownMs, 'auth-expired')
        else if (isTerminalApiNote(ar.note || '')) anthropicBudget!.exhaust()
        else if (isPlanQuotaNote(ar.note || '')) armCooldown(stateDir, now().getTime(), cfg.llmCooldownMs, 'anthropic-triage', cfg.llmCooldownMaxMs)
        else armCooldown(stateDir, now().getTime(), cfg.anthropicTransientCooldownMs, 'anthropic-triage', cfg.anthropicTransientCooldownMs)
      }
    }
    if (!res) {
      // NOTHING was attempted: Groq capped/paced AND no overflow or Gemini has daily room left → all out.
      budgetHit = !budget.canSpend(est)
      paceHit = !budgetHit
      deferred.push(...items.slice(i)) // everything from here on waits for the next cycle / drain
      break
    }
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
      // reads the active weight set (rank-weights.ts) — boost_weight included — so a Scoring-panel edit
      // changes ingest scoring with no redeploy. cfg.rankBoostWeight still seeds the default boost.
      const ranked = rankScore(
        { materiality_pre_score: score, issuer_linkage: t?.issuer_linkage, companies: t?.companies, event_types: t?.event_types, input_nature: it.input_nature, headline: it.headline, headline_en: t?.headline_en, size_bucket: t?.size_bucket, found_at: it.found_at, event_materiality_label: t?.event_materiality_label },
        now(),
      )
      // §4/§24 doctrine cap: a Reddit/`social` item can never be a top pick NOR out-rank filings for a
      // scarce inbox slot. capSocialScore clamps the composite priority below the pick threshold so the
      // band cap AND the score-ordering both hold; capSocialBand is then belt-and-suspenders on the band.
      // caution_only social (r/wallstreetbets) is "weighted lowest" — clamp below the watch line / to `drop`.
      const caution = it.caution === true
      const cappedScore = capSocialScore(ranked.rank_score, ranked.rank_factors.source_tier_id, cfg.pickThreshold, cfg.watchThreshold, caution)
      const band = capSocialBand(scoreToBand(cappedScore, cfg.pickThreshold, cfg.watchThreshold), ranked.rank_factors.source_tier_id, caution)
      seen.add(it.event_id, score)
      // English translation of a non-English headline — kept for a non-Latin original OR a model-named
      // non-English source language (news/lang.ts pickTranslation); else null → the UI shows the original.
      const headline_en = pickTranslation(it.headline, t?.headline_en, t?.headline_lang)
      triaged.push({
        ...it,
        triage_score: cappedScore,
        triage_reason: t?.why || 'not material',
        relevance: t?.relevance || 'irrelevant',
        materiality_pre_score: score,
        event_types: t?.event_types || [],
        issuer_linkage: t?.issuer_linkage || 'sector',
        companies: t?.companies || [],
        size_bucket: t?.size_bucket || 'unknown',
        band,
        // the FINAL event-materiality classifier fields: the label is re-derived from cappedScore (the
        // SHOWN score) so it can never contradict it; scope reuses the scope_id the ranker already won
        // (ranked.rank_factors.scope_id) instead of re-deriving, so the two can't disagree.
        event_materiality_label: deriveMaterialityLabel(cappedScore),
        event_direction: t?.event_direction || 'unknown',
        event_scope: toEventScope(ranked.rank_factors.scope_id),
        rank_factors: ranked.rank_factors,
        headline_en,
        // the source language named — only when a translation was actually kept (for the "original · X" label)
        ...(headline_en && t?.headline_lang ? { headline_lang: t.headline_lang } : {}),
        // Geography = where the EVENT is, not where it was published: re-derive region from the triage
        // read (news/geo.ts), keeping the publisher's domain region as source_region. Falls back to the
        // domain region when the read gives no signal, so an unscored/omitted item never regresses.
        region: resolveEventRegion(t, it.region),
        source_region: it.region,
      })
    }
  }
  budget.save()
  if (localBudget) localBudget.save() // persist local's daily tokens/requests so the cockpit reads live throughput
  for (const g of geminiPool) g.budget.save()
  for (const o of overflow) o.budget.save()
  if (anthropicBudget) anthropicBudget.save()
  seen.save()
  const deferredPersisted = saveDeferred(stateDir, deferred, log)

  // 3b. DEDUP — micro-cluster this cycle's items against the recent firehose into STORIES (finer than
  // themes), so the firehose line + the SSE event each carry a stable story-cluster id and the wire
  // shows one row per story. Uses the cycle ts for fresh items so it matches the read-side recompute
  // (feed.ts withDedup). Fully guarded — a dedup bug never blocks or corrupts the core pipeline.
  if (cfg.dedupEnabled && triaged.length) {
    try {
      const recent = readFeed(repoRoot, 2, { now }).items
      const views = [
        ...recent.map((it) => ({ event_id: it.event_id, headline: it.headline, ts: it.ts, companies: it.companies, source_name: it.source_name })),
        ...triaged.map((t) => ({ event_id: t.event_id, headline: t.headline, ts, companies: t.companies, source_name: t.source_name })),
      ]
      const groups = assignDedupGroups(views, { windowHours: cfg.dedupWindowHours, jaccard: cfg.dedupJaccard, verbatimJaccard: cfg.dedupVerbatimJaccard, maxScan: cfg.dedupMaxScan })
      for (const t of triaged) t.dedup_group = groups.get(t.event_id) || t.event_id
    } catch (e: any) {
      log(`dedup stage error: ${e?.message || e}`)
    }
  }

  // 4. WRITE
  const picks = triaged.filter((t) => t.band !== 'drop')
  const picked = triaged.filter((t) => t.band === 'pick').length
  const watched = triaged.filter((t) => t.band === 'watch').length
  const dropped = triaged.filter((t) => t.band === 'drop').length
  let inboxed = 0
  if (picks.length) {
    inboxed = mergeInbox(repoRoot, date, picks, { maxRows: cfg.inboxMaxRows, now })
    await refreshBoard(repoRoot, log)
  }

  // per-item feed records — for KEPT and DROPPED alike, so the live wire shows everything the
  // scanner read and why; then stream each to live listeners
  const feedItems: FeedItem[] = triaged.map((t) => ({
    kind: 'item',
    ts,
    found_at: t.found_at, // source publication/discovery time; `ts` above remains the triage audit clock
    event_id: t.event_id,
    headline: t.headline,
    headline_en: t.headline_en, // English translation of a non-English headline (news/lang.ts); null when English
    ...(t.headline_lang ? { headline_lang: t.headline_lang } : {}),
    url: t.url,
    domain: t.domain,
    source_name: t.source_name,
    via: t.via || 'gdelt',
    region: t.region, // the EVENT's market (news/geo.ts) — the legacy 8-bucket region
    // the publisher's region, persisted only when it differs from the event region (e.g. an SCMP/CN
    // domain piece about Bangladesh → region OTHER, source_region CN) — the override's audit trail
    ...(t.source_region && t.source_region !== t.region ? { source_region: t.source_region } : {}),
    // the EVENT's country (ISO alpha-2, news/geography.ts) — the country-level Geography filter's key.
    // null when no confident signal ("Global / unspecified"). Re-derived on read for older lines (feed.ts).
    country: resolveCountry(t.headline, t.headline_en, t.companies, t.region, t.issuer_linkage),
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
    // canonical commodity tag(s) (news/commodities.ts) — absent when the headline names none
    ...(() => { const cs = deriveCommodities(t); return cs ? { commodity: cs[0], commodities: cs } : {} })(),
    // event-materiality classifier's final fields — already resolved onto t in the TRIAGE loop above
    event_materiality_label: t.event_materiality_label,
    event_direction: t.event_direction,
    event_scope: t.event_scope,
    snippet: t.snippet, // the feed's own lede — fetch-free body for on-open enrichment
    rank_factors: t.rank_factors, // the composite-priority breakdown (rank.ts) — for the WHY in the UI
    dedup_status: t.dedup_status,
    dedup_group: t.dedup_group, // story-cluster id (news/dedup.ts) — the live wire collapses on it
    inboxed: t.band !== 'drop',
    caution: t.caution, // caution_only social — preserved so the display re-rank (feed.ts) re-applies the lowest cap
  }))
  // emit exactly what was persisted, so the live wire and a later backfill agree
  const written = appendFeedItems(repoRoot, date, feedItems, cfg.feedItemsDailyCap)
  if (written) invalidateFacets() // a fresh cycle changed the archive — drop the facet index so new items/countries show up before the TTL
  for (const fi of feedItems.slice(0, written)) newsBus.emit({ type: 'news-item', item: fi })
  // Optional neural index. It runs only when explicitly configured, only over newly persisted items, and
  // is fully fail-open: provider trouble can never block the wire or turn an item into a false non-match.
  if (written && cfg.retrievalEmbeddingEnabled) {
    try {
      const indexed = await updateSemanticIndex({
        stateDir,
        items: feedItems.slice(0, written),
        fetchFn,
        config: {
          enabled: cfg.retrievalEmbeddingEnabled,
          apiKey: cfg.retrievalEmbeddingApiKey,
          baseUrl: cfg.retrievalEmbeddingBaseUrl,
          model: cfg.retrievalEmbeddingModel,
          timeoutMs: cfg.retrievalEmbeddingTimeoutMs,
          batchSize: cfg.retrievalEmbeddingBatchSize,
          maxItemsPerCycle: cfg.retrievalEmbeddingMaxItemsPerCycle,
        },
      })
      if (indexed.indexed) log(`semantic index: added ${indexed.indexed} event${indexed.indexed === 1 ? '' : 's'}`)
      if (indexed.status === 'provider_error') log(`semantic index: ${indexed.note || 'provider error'} — hybrid search remains active`)
    } catch (e: any) {
      log(`semantic index error: ${e?.message || e} — hybrid search remains active`)
    }
  }

  const overflowReq = overflow.reduce((s, o) => s + o.requests, 0)
  const overflowTok = overflow.reduce((s, o) => s + o.tokens, 0)
  const overflowLog = overflow.filter((o) => o.requests).map((o) => ` · ${o.p.id} ${o.requests} req / ${o.tokens} tok`).join('')

  // The Haiku last-resort tier's state at cycle end — the piece that was invisible when "Groq in failure
  // cooldown" printed with no hint the paid fallback had ALSO tapped out (the reported surprise). `usd-cap`
  // is checked before `scored` on purpose: a tier that scored a few batches and THEN hit its ceiling is
  // exactly why the rest still deferred, so the ceiling is the honest reason to show.
  // Only the plan's OWN quota being spent is 'plan-quota' (the subscription CLI canonicalises a 429 to
  // "usage limit reached — plan quota spent", claude-cli.ts). A transient per-minute rate-limit or an
  // api-mode billing/credit error is NOT the shared plan resetting — those fall through to 'cooling', so we
  // don't tell the operator to "wait for the plan to reset" when there is no plan quota to reset.
  const planQuotaHit = isPlanQuotaNote(anthropicFailNote)
  // An expired sign-in is named from this cycle's own failure note when there IS one, and otherwise from the
  // reason carried on the cooldown marker — so every cycle after the first keeps telling the operator the real
  // cause (and the one-line fix) instead of degrading to a nameless "backing off after an error". The live
  // note takes precedence deliberately: once the tier probes again and fails a DIFFERENT way (a timeout, say),
  // that new cause is the honest one to show, not the stale reason left on the marker by the previous failure.
  const authExpiredHit = anthropicFailNote
    ? isAuthExpiredNote(anthropicFailNote)
    : anthropicCooldownReason === 'auth-expired'
  const lastResort: CycleSummary['last_resort'] = !anthropicOn
    ? 'off'
    : anthropicCoolingDown || anthropicDownThisCycle
      ? (planQuotaHit ? 'plan-quota' : authExpiredHit ? 'auth-expired' : 'cooling')
      : !anthropicBudget?.canSpend()
        ? 'usd-cap'
        : anthropicRequests > 0
          ? 'scored'
          : 'available'
  // When items deferred, name the LAST-RESORT tier's state too, so a defer note can't read as if Groq were
  // the only blocker. Added only when the tier genuinely could NOT absorb the spillover (never for
  // 'scored'/'available', which weren't the reason anything deferred).
  const lastResortClause = !deferred.length
    ? ''
    : lastResort === 'off'
      ? ' · Haiku last-resort is off'
      : lastResort === 'usd-cap'
        ? ` · Haiku last-resort at its $${cfg.anthropicDailyUsd}/day ceiling`
        : lastResort === 'plan-quota'
          ? ' · Haiku last-resort paused — Claude plan quota spent, waiting for it to reset'
          : lastResort === 'auth-expired'
            ? " · Haiku last-resort paused — the engine's Claude sign-in has expired; run `claude login` on the engine host and it resumes on the next look"
            : lastResort === 'cooling'
              ? ' · Haiku last-resort backing off after an error'
              : ''

  const defCount = deferred.length
  const defPlural = defCount === 1 ? '' : 's'
  // Items past the loss boundary. saveDeferred keeps only the first DEFERRED_CAP of the priority-sorted
  // backlog, so anything beyond the cap is DROPPED — never scored, and not re-fetchable once its source
  // window ages out (GDELT's lookback expires; an unchanged RSS feed answers 304). It was derivable as
  // `deferred − backlog` but never named, logged, or counted, so the loss was invisible while the panel's
  // trend read "steady". Surface it: `deferred = backlog + dropped_at_cap` is now an explicit invariant.
  const droppedAtCap = Math.max(0, defCount - DEFERRED_CAP)
  if (droppedAtCap > 0) {
    log(`LOSS: ${droppedAtCap} lowest-priority item${droppedAtCap === 1 ? '' : 's'} dropped past the ${DEFERRED_CAP}-item backlog cap — not deferred; gone once their source window ages out`)
  }
  const baseNote = aborted && defCount
    ? `cycle hit its time guard — ${defCount} item${defPlural} dumped to the backlog for the next look${lastResortClause}`
    : budgetHit
      ? `free-tier daily LLM budget reached — ${defCount} item${defPlural} deferred; they clear when the daily quotas reset${lastResortClause}`
      : groqCoolingDown && defCount
        // A prior cycle failed and armed the cross-cycle cooldown; we skipped Groq this cycle and had no
        // overflow room. Say so honestly (and name the fallback's state) — otherwise this reads as the
        // "paced for the day" note below, wrongly implying a healthy budget being spread rather than a Groq
        // outage being ridden out with the paid fallback also tapped.
        ? `Groq in failure cooldown — ${defCount} item${defPlural} deferred (protecting the daily request cap after a Groq outage)${lastResortClause}`
        : paceHit
          ? `paced for the day — ${defCount} item${defPlural} held for the next drain (spreading the budget evenly)${lastResortClause}`
          : batchFailed
            ? `${defCount} item${defPlural} not scored (LLM hiccup) — deferred to next cycle${lastResortClause}`
            : undefined
  // Append the honest loss clause so a defer note never reads as if everything was merely postponed when part
  // of it was actually dropped (the reported "clears when quotas reset" is false for the lost tail).
  const coreNote = droppedAtCap > 0
    ? `${baseNote ? `${baseNote} · ` : ''}${droppedAtCap} item${droppedAtCap === 1 ? '' : 's'} DROPPED past the ${DEFERRED_CAP}-item cap (not deferred — lost)`
    : baseNote
  // Surface a down PRIMARY brain even when the fallback coped and nothing deferred: the operator wants to know the
  // local box is asleep/unreachable, because the scan is then spending capped cloud/paid budget and risks a ceiling.
  const localDownNote = localOn && localDownThisCycle
    ? 'LOCAL primary brain unreachable this look — running on the capped cloud fallback; check the box'
    : ''
  const note = [localDownNote, coreNote].filter(Boolean).join(' · ') || undefined
  // Structured twin of the note, in the same precedence, so the cockpit can reason about the defer reason
  // without parsing free text.
  const deferReason: CycleSummary['defer_reason'] = !defCount
    ? undefined
    : aborted
      ? 'aborted'
      : budgetHit
        ? 'free-budget-spent'
        : groqCoolingDown
          ? 'groq-cooldown'
          : paceHit
            ? 'paced'
            : batchFailed
              ? 'batch-failed'
              : undefined

  const summary: CycleSummary = {
    ts, ok: true, fetched: raws.length, candidates: items.length,
    picked, watched, dropped, inboxed, groq_requests: groqRequests, groq_tokens: groqTokens,
    // end-to-end transparency: split the read balloon (fresh vs re-queued backlog), and always carry the
    // backlog depth + its loss boundary + the fallback's state so the cockpit never has to infer them.
    fresh: fresh.length, carryover: requeued.length,
    ...(defCount ? { deferred: defCount } : {}),
    backlog: Math.min(defCount, DEFERRED_CAP), backlog_cap: DEFERRED_CAP,
    ...(droppedAtCap ? { dropped_at_cap: droppedAtCap } : {}),
    ...(deferredPersisted ? {} : { deferred_write_failed: true }),
    ...(aborted ? { aborted: true } : {}),
    ...(deferReason ? { defer_reason: deferReason } : {}),
    last_resort: lastResort,
    ...(localRequests ? { local_requests: localRequests, local_tokens: localTokens } : {}),
    ...(localOn && localDownThisCycle ? { local_down: true } : {}),
    ...(geminiRequests ? { gemini_requests: geminiRequests, gemini_tokens: geminiTokens } : {}),
    ...(overflowReq ? { overflow_requests: overflowReq, overflow_tokens: overflowTok } : {}),
    ...(anthropicRequests ? { anthropic_requests: anthropicRequests, anthropic_tokens: anthropicTokens, anthropic_cost_usd: Math.round(anthropicCostUsd * 10_000) / 10_000 } : {}),
    ...(sources ? { sources } : {}),
    phase,
    note,
  }
  appendFirehoseSummary(repoRoot, date, summary)
  newsBus.emit({ type: 'news-cycle', summary })
  log(`news cycle: fetched ${raws.length}, ${items.length} new, picked ${picked}, watched ${watched}, dropped ${dropped}; ${localRequests ? `local ${localRequests} req / ${localTokens} tok · ` : ''}groq ${groqRequests} req / ${groqTokens} tok${geminiRequests ? ` · gemini ${geminiRequests} req / ${geminiTokens} tok` : ''}${overflowLog}${anthropicRequests ? ` · haiku ${anthropicRequests} req / $${anthropicCostUsd.toFixed(3)}` : ''}`)

  // 5. THEMES — bucket material items and run the same maintenance clock used by quiet cycles. Fully
  // guarded so a themes bug can never block or corrupt the core wire.
  await runThemesStage({ cfg, repoRoot, stateDir, picks, fetchFn, now, log })
  return summary
}
