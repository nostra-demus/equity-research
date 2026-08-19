// The SECOND free-tier brain. Google Gemini (AI Studio, free tier) as an OVERFLOW triage provider:
// when the Groq daily budget is paced or spent, batches route here instead of deferring, so the day's
// total throughput = Groq free quota + Gemini free quota (two independent pools, two minute-windows).
//
// It speaks the EXACT same triage contract as the Groq path — same system prompt, same batched user
// message, same coercion — so downstream (runCycle, ranking, themes) cannot tell which brain scored a
// batch. Only the HTTP shape differs: Gemini's generateContent with JSON output instead of Groq's
// chat-completions. Never throws; one retry on a transient failure; FREE TIER ONLY (no billing).

import type { NewsItem, Triage } from '../types'
import { conservativeChatTokenBound, credibleTokenUsage, type RateInfo } from './budget'
import { ARTICLE_SYSTEM, articleMaxOutputTokens, type ArticleAnalysisResult, buildArticleUserMessage, buildUserMessage, caughtFailure, coerceArticleBrief, coerceCompleteTriageRows, durToMs, httpFailureKind, isArticleBodyEligible, publicHttpFailureNote, SYSTEM, triageMaxOutputTokens, type TriageOptions, type TriageResult } from './groq'

/**
 * The batch row contract as a Gemini `responseSchema`, so the ROW SHAPE is enforced by the provider's decoder
 * instead of only requested in English at the end of the prompt ("Include every index exactly once").
 *
 * Why this is opt-in (NEWS_GEMINI_RESPONSE_SCHEMA=1) rather than on by default: a schema the API rejects comes
 * back as a 400, which classifies as `request` and arms a 5-to-60-minute silent hold on the model — trading a
 * recoverable contract failure for a harder one. It cannot be proven safe from a mocked fetch either, since a
 * fake response can never demonstrate that the real decoder honours the schema. So it ships ready to switch on
 * and verify against one model, not switched on blind across the pool.
 *
 * Note what it does and does not buy. It removes the malformed-row and wrong-envelope failures. It does NOT
 * guarantee COVERAGE: a schema constrains each row's shape, not that the model emitted one row per input index,
 * so coerceCompleteTriageRows stays the authority on completeness.
 */
export const TRIAGE_RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    items: {
      type: 'ARRAY',
      items: {
        type: 'OBJECT',
        properties: {
          i: { type: 'INTEGER' },
          relevance: { type: 'STRING', enum: ['material', 'relevant_non_material', 'irrelevant'] },
          materiality_pre_score: { type: 'INTEGER' },
          event_materiality_label: { type: 'STRING', enum: ['low', 'medium', 'high', 'critical'] },
          event_direction: { type: 'STRING', enum: ['positive', 'negative', 'mixed', 'neutral', 'unknown'] },
          event_types: { type: 'ARRAY', items: { type: 'STRING' } },
          issuer_linkage: { type: 'STRING', enum: ['primary', 'secondary', 'sector', 'macro'] },
          why: { type: 'STRING' },
          companies: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: { name: { type: 'STRING' }, ticker: { type: 'STRING', nullable: true }, listing_country: { type: 'STRING', nullable: true } },
              required: ['name'],
            },
          },
          size_bucket: { type: 'STRING', enum: ['mega', 'large', 'mid', 'small', 'unknown'] },
          headline_en: { type: 'STRING', nullable: true },
          headline_lang: { type: 'STRING', nullable: true },
          event_region: { type: 'STRING', nullable: true },
        },
        required: ['i', 'relevance', 'materiality_pre_score', 'why'],
      },
    },
  },
  required: ['items'],
} as const

/** Is provider-side schema enforcement switched on? Off unless NEWS_GEMINI_RESPONSE_SCHEMA=1 — see above. */
export function geminiSchemaEnabled(env: Record<string, string | undefined> = process.env): boolean {
  return env.NEWS_GEMINI_RESPONSE_SCHEMA === '1'
}

/** Pull Gemini's RetryInfo.retryDelay (e.g. "35s") out of a 429/RESOURCE_EXHAUSTED error body → ms. */
export function parseGeminiRetry(body: any): RateInfo {
  try {
    const details: any[] = body?.error?.details || []
    for (const d of details) {
      const delay = d?.retryDelay
      if (typeof delay === 'string') return { retryAfterMs: durToMs(delay) }
    }
  } catch {
    // best-effort
  }
  return {}
}

/** True when a 429 body's QuotaFailure is a per-DAY violation (RPD) — the model is done until midnight PT. */
export function isPerDayQuota(body: any): boolean {
  try {
    for (const d of body?.error?.details || []) {
      for (const v of d?.violations || []) {
        if (/PerDay|RequestsPerDay|InputTokens.*PerDay/i.test(String(v?.quotaId || ''))) return true
      }
    }
  } catch {
    // best-effort
  }
  return false
}

/**
 * Triage one batch via Gemini. Returns the same TriageResult shape as triageBatch (Groq). On ok:false
 * the caller treats the batch as UNSCORED (defer it), never scored-zero — identical to the Groq path.
 */
export async function triageBatchGemini(
  items: NewsItem[],
  opts: TriageOptions,
  fetchFn: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): Promise<TriageResult> {
  const byIndex = new Map<number, Triage>()
  if (!items.length) return { byIndex, requests: 0, tokens: 0, ok: true }
  if (!opts.apiKey) return { byIndex, requests: 0, tokens: 0, ok: false, note: 'gemini: provider not configured', failureKind: 'request' }

  let requests = 0
  let tokens = 0
  let lastFailure: Required<Pick<TriageResult, 'note' | 'failureKind'>> & Pick<TriageResult, 'timedOut'> = {
    note: 'gemini: network unavailable', failureKind: 'availability',
  }
  const url = `${opts.baseUrl}/models/${opts.model}:generateContent`
  const maxAttempts = opts.maxAttempts ?? 2
  const clock = opts.nowMs ?? (() => Date.now())
  const timeoutMs = opts.timeoutMs ?? 30_000
  // Batch-sized, not a flat constant: the reply is one row per headline, so a fixed ceiling truncates the
  // larger batches and the completeness contract then discards the WHOLE answer (see triageMaxOutputTokens).
  // Safe to raise here without a second thought: the Gemini pool is REQUEST-metered, so a bigger output
  // allowance costs nothing against its binding limit.
  const maxOut = triageMaxOutputTokens(items.length, opts.maxTokens)
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const startedAt = clock()
    try {
      requests++ // one count per fetch invocation, including network/response-decoding failures below
      const res = await fetchFn(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': opts.apiKey },
        signal: AbortSignal.timeout(timeoutMs), // a hung connection must never block the cycle
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: buildUserMessage(items) }] }],
          // thinkingBudget 0 = no chain-of-thought: the 3.x flash models are "thinking" models that
          // otherwise burn the output budget reasoning (→ truncated/empty JSON) and cost extra tokens.
          // Disabling it gives clean JSON from every pool model; harmless for the non-thinking 2.5 models.
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: maxOut,
            responseMimeType: 'application/json',
            ...(geminiSchemaEnabled() ? { responseSchema: TRIAGE_RESPONSE_SCHEMA } : {}),
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      })
      if (!res.ok) {
        const raw = await res.text().catch(() => '')
        let parsedErr: any
        try { parsedErr = JSON.parse(raw) } catch { parsedErr = null }
        const bodyRate = res.status === 429 ? parseGeminiRetry(parsedErr) : {}
        // Google commonly puts RetryInfo in a 429 body, but gateways and transient 503s use the standard
        // header. Preserve the provider's exact clock for either status; the header is authoritative when
        // both exist so the outer cooldown policy never inflates a precise wait into generic minutes.
        const headerRetryAfterMs = (res.status === 429 || res.status === 503)
          ? durToMs(res.headers?.get?.('retry-after'))
          : undefined
        const rate: RateInfo = headerRetryAfterMs != null ? { ...bodyRate, retryAfterMs: headerRetryAfterMs } : bodyRate
        const perDay = res.status === 429 && isPerDayQuota(parsedErr)
        const note = publicHttpFailureNote('gemini', res.status, perDay)
        const failureKind = httpFailureKind(res.status)
        // a per-DAY 429 won't clear by retrying this cycle — surface it so the caller skips this model
        const transient = (res.status === 429 && !perDay) || res.status >= 500
        if (transient && attempt < maxAttempts) {
          await sleep(rate.retryAfterMs || 1500 * attempt)
          continue
        }
        return { byIndex, requests, tokens, ok: false, note, rate, failureKind, httpStatus: res.status, elapsedMs: Math.max(0, clock() - startedAt), ...(perDay ? { dailyLimit: true } : {}) }
      }
      const data: any = await res.json()
      tokens += credibleTokenUsage(
        data?.usageMetadata?.totalTokenCount,
        conservativeChatTokenBound(SYSTEM, buildUserMessage(items), maxOut),
      )
      const took = { elapsedMs: Math.max(0, clock() - startedAt) }
      const cand = data?.candidates?.[0]
      // a safety block or a max-output truncation is deterministic — report, don't half-parse
      if (data?.promptFeedback?.blockReason) return { byIndex, requests, tokens, ok: false, note: 'gemini: response blocked', failureKind: 'contract', ...took }
      // MAX_TOKENS is split out from the other non-STOP reasons on purpose. Collapsing them made the one
      // finish reason with a KNOWN fix (the output ceiling was too small for this batch) indistinguishable
      // from a safety stop or a recitation block, which need entirely different responses.
      if (cand?.finishReason === 'MAX_TOKENS') {
        return { byIndex, requests, tokens, ok: false, note: `gemini: output truncated at maxOutputTokens (${maxOut} for ${items.length} items) — lower NEWS_TRIAGE_BATCH or raise NEWS_GEMINI_MAX_TOKENS`, failureKind: 'contract', ...took }
      }
      if (cand?.finishReason && cand.finishReason !== 'STOP') {
        return { byIndex, requests, tokens, ok: false, note: `gemini: response stopped early (${String(cand.finishReason).slice(0, 32)})`, failureKind: 'contract', ...took }
      }
      const content = Array.isArray(cand?.content?.parts) ? cand.content.parts.map((p: any) => (typeof p?.text === 'string' ? p.text : '')).join('') : ''
      if (!content) return { byIndex, requests, tokens, ok: false, note: 'gemini: empty content', failureKind: 'contract', ...took }
      let parsed: any
      try { parsed = JSON.parse(content) } catch { return { byIndex, requests, tokens, ok: false, note: 'gemini: non-JSON content', failureKind: 'contract', ...took } }
      const arr: any[] = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : []
      const complete = coerceCompleteTriageRows(arr, items.length)
      if (!complete) return { byIndex, requests, tokens, ok: false, note: `gemini: incomplete batch response (expected ${items.length} rows, got ${arr.length})`, failureKind: 'contract', ...took }
      return { byIndex: complete, requests, tokens, ok: true }
    } catch (e: any) {
      lastFailure = caughtFailure(e, 'gemini', Math.max(0, clock() - startedAt), timeoutMs)
      if (attempt < maxAttempts) await sleep(1500 * attempt)
    }
  }
  return { byIndex, requests, tokens, ok: false, ...lastFailure }
}

/**
 * Article-BODY read via Gemini — the generateContent twin of analyzeArticle (groq.ts). Same ARTICLE_SYSTEM
 * prompt, same ArticleBrief contract and coercion, so the on-demand reader can't tell which brain produced
 * the brief. This is the FALLBACK that keeps "THE STORY" populated when Groq is paced, rate-limited, or
 * down. Never throws; bounded by timeoutMs; honours maxAttempts (the reader passes 1 — one shot, then fall
 * through to the next provider). FREE TIER ONLY.
 */
// `attempted` distinguishes a genuine provider-call failure from a PRE-FLIGHT short-circuit (no key, or the
// body too thin to ever feed an LLM) that never reached the network — explicitly false for those two, absent
// (≡ true) everywhere else. Mirrors analyzeArticle (groq.ts); see its comment for why the caller needs this.
export async function analyzeArticleGemini(
  body: string,
  headline: string,
  opts: TriageOptions,
  fetchFn: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): Promise<ArticleAnalysisResult> {
  if (!opts.apiKey) return { brief: null, tokens: 0, note: 'gemini: provider not configured', attempted: false, failureKind: 'request' }
  if (!isArticleBodyEligible(body)) return { brief: null, tokens: 0, note: 'body too thin to read', attempted: false, failureKind: 'request' }
  const user = buildArticleUserMessage(body, headline)
  const url = `${opts.baseUrl}/models/${opts.model}:generateContent`
  let tokens = 0
  let lastFailure: Required<Pick<ArticleAnalysisResult, 'note' | 'failureKind'>> & Pick<ArticleAnalysisResult, 'timedOut'> = {
    note: 'gemini: network unavailable', failureKind: 'availability',
  }
  const maxAttempts = opts.maxAttempts ?? 2
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetchFn(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': opts.apiKey },
        signal: AbortSignal.timeout(opts.timeoutMs ?? 30_000),
        body: JSON.stringify({
          system_instruction: { parts: [{ text: ARTICLE_SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: user }] }],
          // floor at 3500 output tokens so a worst-case rich transmission brief (now including news_impact's
          // ~9 fields) can't truncate (a length-cut drops the whole brief); a provider asking for more keeps
          // its larger budget. Matches groq.ts + EST_TOKENS.
          generationConfig: { temperature: 0.1, maxOutputTokens: articleMaxOutputTokens(opts.maxTokens), responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } },
        }),
      })
      if (!res.ok) {
        const raw = await res.text().catch(() => '')
        let parsedErr: any
        try { parsedErr = JSON.parse(raw) } catch { parsedErr = null }
        const bodyRate = res.status === 429 ? parseGeminiRetry(parsedErr) : {}
        const headerRetryAfterMs = (res.status === 429 || res.status === 503)
          ? durToMs(res.headers?.get?.('retry-after'))
          : undefined
        const rate: RateInfo = headerRetryAfterMs != null ? { ...bodyRate, retryAfterMs: headerRetryAfterMs } : bodyRate
        const perDay = res.status === 429 && isPerDayQuota(parsedErr)
        const note = publicHttpFailureNote('gemini', res.status, perDay)
        const failureKind = httpFailureKind(res.status)
        const transient = (res.status === 429 && !perDay) || res.status >= 500
        if (transient && attempt < maxAttempts) { await sleep(rate.retryAfterMs || 1200 * attempt); continue }
        return { brief: null, tokens, note, rate, failureKind, httpStatus: res.status, ...(perDay ? { dailyLimit: true } : {}) }
      }
      const data: any = await res.json()
      tokens += credibleTokenUsage(data?.usageMetadata?.totalTokenCount, 0)
      const cand = data?.candidates?.[0]
      if (data?.promptFeedback?.blockReason) return { brief: null, tokens, note: 'gemini: response blocked', failureKind: 'contract' }
      if (cand?.finishReason && cand.finishReason !== 'STOP') return { brief: null, tokens, note: 'gemini: incomplete response', failureKind: 'contract' }
      const content = Array.isArray(cand?.content?.parts) ? cand.content.parts.map((p: any) => (typeof p?.text === 'string' ? p.text : '')).join('') : ''
      if (!content) return { brief: null, tokens, note: 'gemini: empty content', failureKind: 'contract' }
      let parsed: any
      try { parsed = JSON.parse(content) } catch { return { brief: null, tokens, note: 'gemini: non-JSON content', failureKind: 'contract' } }
      return { brief: coerceArticleBrief(parsed), tokens }
    } catch (e: any) {
      lastFailure = caughtFailure(e, 'gemini')
      if (attempt < maxAttempts) await sleep(1200 * attempt)
    }
  }
  return { brief: null, tokens, ...lastFailure }
}
