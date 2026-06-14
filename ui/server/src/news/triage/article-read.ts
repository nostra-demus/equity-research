// The on-demand article read, made bulletproof. The cheap title-triage is one thing; when a HUMAN opens
// an event we read the article BODY with an LLM and lead with its substance ("THE STORY", who gains / who's
// exposed, the real companies). That read used to be Groq-only with no fallback and no deadline — so when
// the background ingester had Groq's 6k-tokens/min free window saturated, the read blocked in the shared
// rate limiter for up to two minutes and the reader showed a forever-spinning shimmer.
//
// This orchestrator fixes that for good. It runs the SAME provider chain the ingester uses — Groq →
// OpenAI-compatible overflow (OpenRouter, NVIDIA, …) → Gemini pool — but tuned for a user waiting in real
// time:
//   - a HARD wall-clock DEADLINE for the whole read (default ~14s). Past it we stop and let the caller fall
//     back to the deterministic story floor — never a hang.
//   - a SHORT per-provider wait on its rate limiter (default ~2.5s). If a provider's minute window is busy
//     (the ingester is mid-cycle), we skip it in milliseconds and try the NEXT provider, whose free pool
//     has its own independent window. The read flows AROUND whatever provider is momentarily throttled.
//   - ONE shot per provider (maxAttempts: 1): don't retry the same brain, move to the next — faster and
//     more resilient than hammering a struggling provider.
//   - the SAME file-backed daily budgets and process-wide limiters as the ingester, so the two paths share
//     one honest free-tier accounting and never collectively bust a quota.
// Never throws. Returns the first usable brief, or null (→ the caller synthesises the floor).

import { Budget, getNamedLimiter, getSharedGeminiLimiter, getSharedLimiter } from './budget'
import { analyzeArticle, type ArticleBrief } from './groq'
import { analyzeArticleGemini } from './gemini'

// One entry in the article-read fallback chain. Built from config (config.ts → buildArticleReadProviders),
// in priority order. The shapes mirror the ingester's so the two share budgets + limiters exactly.
export interface ArticleReadProvider {
  id: string
  kind: 'openai' | 'gemini' // openai = chat/completions (Groq, OpenRouter, NVIDIA); gemini = generateContent
  apiKey: string
  baseUrl: string
  model: string // primary/lead model
  models?: string[] // OpenAI fallback chain (OpenRouter routes around its own 429s)
  pool?: { model: string; dailyReqCap: number }[] // Gemini rotation pool — each model its own daily bucket
  maxTokens?: number
  rpm: number
  tpm: number
  dailyReqCap: number
  dailyTokenCap: number
  budgetFile: string // STATE_DIR budget file — share the ingester's exact name (use {model} for the Gemini pool)
  dayTz?: string
  headers?: Record<string, string>
  extraBody?: Record<string, unknown>
  // which process-wide limiter to share with the ingester: 'groq' | 'gemini' | <named overflow id>
  limiter: 'groq' | 'gemini' | string
}

export interface ArticleReadDeps {
  stateDir: string
  fetchFn?: typeof fetch
  sleep?: (ms: number) => Promise<void>
  now?: () => number
  deadlineMs?: number // absolute wall-clock ms the whole read must finish by (default now + 14s)
  limiterWaitMs?: number // max wait on each provider's limiter before skipping it (default 2500)
  perCallTimeoutMs?: number // hard ceiling for a single provider HTTP call (default 9000, clamped to the deadline)
  log?: (m: string) => void
}

export interface ArticleReadResult {
  brief: ArticleBrief | null
  provider?: string // which provider/model answered (for logs/telemetry)
  note?: string // why no brief, when brief is null
}

const EST_TOKENS = 3500 // a body read's rough input+output cost (capped); used for budget + limiter sizing

function hasContent(b: ArticleBrief): boolean {
  return !!(b.gist.length || b.companies.length || b.beneficiaries.length || b.exposed.length)
}

/**
 * Read one article body into an ArticleBrief, trying providers in order until one answers or the deadline
 * passes. Each provider is budget-checked, then given a short slot on its (ingester-shared) rate limiter;
 * if the slot can't be had within limiterWaitMs the provider is skipped and we move on. Never throws.
 */
export async function readArticleBrief(
  body: string,
  headline: string,
  providers: ArticleReadProvider[],
  deps: ArticleReadDeps,
): Promise<ArticleReadResult> {
  const now = deps.now || (() => Date.now())
  const sleep = deps.sleep || ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)))
  const fetchFn = deps.fetchFn || fetch
  const deadline = deps.deadlineMs ?? now() + 14_000
  const limiterWaitMs = deps.limiterWaitMs ?? 2500
  const log = deps.log || (() => {})
  let lastNote = 'no LLM provider configured'

  for (const p of providers) {
    if (now() >= deadline) { lastNote = 'deadline reached before a provider answered'; break }
    if (!p.apiKey) continue

    // a single provider call must fit inside what's left of the deadline (minus the limiter-wait slice)
    const callTimeout = Math.min(deps.perCallTimeoutMs ?? 9000, Math.max(0, deadline - now() - limiterWaitMs))
    if (callTimeout < 1500) { lastNote = 'deadline too close to safely try another provider'; break }

    const limiter = p.limiter === 'groq' ? getSharedLimiter(p.rpm, p.tpm)
      : p.limiter === 'gemini' ? getSharedGeminiLimiter(p.rpm, p.tpm)
      : getNamedLimiter(p.limiter, p.rpm, p.tpm)
    const waitBudget = () => Math.max(0, Math.min(limiterWaitMs, deadline - now()))

    if (p.kind === 'gemini') {
      // rotate the pool: first model with daily room. A per-DAY 429 marks that model done; try the next.
      const pool = p.pool && p.pool.length ? p.pool : [{ model: p.model, dailyReqCap: p.dailyReqCap }]
      for (const m of pool) {
        if (now() >= deadline) break
        const file = p.budgetFile.replace('{model}', m.model.replace(/[^a-z0-9]+/gi, '-'))
        const budget = Budget.load(deps.stateDir, m.dailyReqCap, p.dailyTokenCap, now(), file, p.dayTz)
        if (!budget.canSpend(EST_TOKENS)) { lastNote = `${p.id}:${m.model} daily budget reached`; continue }
        const got = await limiter.acquire(EST_TOKENS, sleep, now, waitBudget())
        if (!got) { lastNote = `${p.id} rate-limited — skipped`; break } // shared minute window busy → next provider
        const r = await analyzeArticleGemini(body, headline, { model: m.model, baseUrl: p.baseUrl, apiKey: p.apiKey, maxTokens: p.maxTokens, timeoutMs: callTimeout, maxAttempts: 1 }, fetchFn, sleep)
        budget.record(1, r.tokens || EST_TOKENS); budget.save()
        limiter.learn(r.rate, now)
        if (r.brief && hasContent(r.brief)) { log(`article read via ${p.id}:${m.model}`); return { brief: r.brief, provider: `${p.id}:${m.model}` } }
        lastNote = r.note || `${p.id}:${m.model} returned no usable brief`
        if (r.note && /PerDay/i.test(r.note)) { budget.exhaust(); budget.save(); continue } // this model's day is spent → next pool model
        break // a non-quota miss: don't churn the pool — fall through to the next provider
      }
    } else {
      const budget = Budget.load(deps.stateDir, p.dailyReqCap, p.dailyTokenCap, now(), p.budgetFile, p.dayTz)
      if (!budget.canSpend(EST_TOKENS)) { lastNote = `${p.id} daily budget reached`; continue }
      const got = await limiter.acquire(EST_TOKENS, sleep, now, waitBudget())
      if (!got) { lastNote = `${p.id} rate-limited — skipped`; continue } // minute window busy → next provider
      const r = await analyzeArticle(body, headline, { model: p.model, models: p.models, baseUrl: p.baseUrl, apiKey: p.apiKey, maxTokens: p.maxTokens, headers: p.headers, extraBody: p.extraBody, timeoutMs: callTimeout, maxAttempts: 1 }, fetchFn, sleep)
      budget.record(1, r.tokens || EST_TOKENS); budget.save()
      limiter.learn(r.rate, now)
      if (r.brief && hasContent(r.brief)) { log(`article read via ${p.id}`); return { brief: r.brief, provider: p.id } }
      lastNote = r.note || `${p.id} returned no usable brief`
      // a 4xx (auth / out-of-credits / quota) won't recover today — exhaust the daily budget so the chain
      // skips this provider across reads until the daily reset, exactly like the ingester does.
      if (r.note && /HTTP (400|401|402|403|404|413|429)/.test(r.note)) { budget.exhaust(); budget.save() }
    }
  }
  return { brief: null, note: lastNote }
}
