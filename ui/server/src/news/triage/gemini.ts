// The SECOND free-tier brain. Google Gemini (AI Studio, free tier) as an OVERFLOW triage provider:
// when the Groq daily budget is paced or spent, batches route here instead of deferring, so the day's
// total throughput = Groq free quota + Gemini free quota (two independent pools, two minute-windows).
//
// It speaks the EXACT same triage contract as the Groq path — same system prompt, same batched user
// message, same coercion — so downstream (runCycle, ranking, themes) cannot tell which brain scored a
// batch. Only the HTTP shape differs: Gemini's generateContent with JSON output instead of Groq's
// chat-completions. Never throws; one retry on a transient failure; FREE TIER ONLY (no billing).

import type { NewsItem, Triage } from '../types'
import type { RateInfo } from './budget'
import { ARTICLE_SYSTEM, type ArticleBrief, buildUserMessage, coerceArticleBrief, coerceTriage, durToMs, estimateTokens, SYSTEM, type TriageOptions, type TriageResult } from './groq'

/** Pull Gemini's RetryInfo.retryDelay (e.g. "35s") out of a 429/RESOURCE_EXHAUSTED error body → ms. */
function parseGeminiRetry(body: any): RateInfo {
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
function isPerDayQuota(body: any): boolean {
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
  if (!opts.apiKey) return { byIndex, requests: 0, tokens: 0, ok: false, note: 'no GEMINI_API_KEY' }

  let requests = 0
  let tokens = 0
  let lastNote = 'gemini fetch error'
  const url = `${opts.baseUrl}/models/${opts.model}:generateContent`
  const maxAttempts = opts.maxAttempts ?? 2
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetchFn(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': opts.apiKey },
        signal: AbortSignal.timeout(opts.timeoutMs ?? 30_000), // a hung connection must never block the cycle
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: buildUserMessage(items) }] }],
          // thinkingBudget 0 = no chain-of-thought: the 3.x flash models are "thinking" models that
          // otherwise burn the output budget reasoning (→ truncated/empty JSON) and cost extra tokens.
          // Disabling it gives clean JSON from every pool model; harmless for the non-thinking 2.5 models.
          generationConfig: { temperature: 0.1, maxOutputTokens: opts.maxTokens ?? 2000, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } },
        }),
      })
      requests++
      if (!res.ok) {
        const raw = await res.text().catch(() => '')
        let parsedErr: any
        try { parsedErr = JSON.parse(raw) } catch { parsedErr = null }
        const rate = res.status === 429 ? parseGeminiRetry(parsedErr) : {}
        const perDay = res.status === 429 && isPerDayQuota(parsedErr)
        lastNote = `gemini HTTP ${res.status}${perDay ? ' PerDay-quota-exhausted' : ''}${raw ? ': ' + raw.slice(0, 100) : ''}`
        // a per-DAY 429 won't clear by retrying this cycle — surface it so the caller skips this model
        const transient = (res.status === 429 && !perDay) || res.status >= 500
        if (transient && attempt < maxAttempts) {
          await sleep(rate.retryAfterMs || 1500 * attempt)
          continue
        }
        return { byIndex, requests, tokens, ok: false, note: lastNote, rate }
      }
      const data: any = await res.json()
      tokens += Number(data?.usageMetadata?.totalTokenCount) || estimateTokens(items.length)
      const cand = data?.candidates?.[0]
      // a safety block or a max-output truncation is deterministic — report, don't half-parse
      if (data?.promptFeedback?.blockReason) return { byIndex, requests, tokens, ok: false, note: `gemini blocked: ${data.promptFeedback.blockReason}` }
      if (cand?.finishReason && cand.finishReason !== 'STOP') {
        return { byIndex, requests, tokens, ok: false, note: `gemini: finishReason ${cand.finishReason} (lower NEWS_TRIAGE_BATCH or raise NEWS_GEMINI_MAX_TOKENS)` }
      }
      const content = Array.isArray(cand?.content?.parts) ? cand.content.parts.map((p: any) => (typeof p?.text === 'string' ? p.text : '')).join('') : ''
      if (!content) return { byIndex, requests, tokens, ok: false, note: 'gemini: empty content' }
      let parsed: any
      try { parsed = JSON.parse(content) } catch { return { byIndex, requests, tokens, ok: false, note: 'gemini: non-JSON content' } }
      const arr: any[] = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : []
      for (const row of arr) {
        const i = Number(row?.i)
        if (Number.isInteger(i) && i >= 0 && i < items.length && !byIndex.has(i)) byIndex.set(i, coerceTriage(row))
      }
      return { byIndex, requests, tokens, ok: true }
    } catch (e: any) {
      requests++
      lastNote = e?.name === 'TimeoutError' ? 'gemini: request timed out' : e?.message || 'gemini fetch error'
      if (attempt < maxAttempts) await sleep(1500 * attempt)
    }
  }
  return { byIndex, requests, tokens, ok: false, note: lastNote }
}

/**
 * Article-BODY read via Gemini — the generateContent twin of analyzeArticle (groq.ts). Same ARTICLE_SYSTEM
 * prompt, same ArticleBrief contract and coercion, so the on-demand reader can't tell which brain produced
 * the brief. This is the FALLBACK that keeps "THE STORY" populated when Groq is paced, rate-limited, or
 * down. Never throws; bounded by timeoutMs; honours maxAttempts (the reader passes 1 — one shot, then fall
 * through to the next provider). FREE TIER ONLY.
 */
export async function analyzeArticleGemini(
  body: string,
  headline: string,
  opts: TriageOptions,
  fetchFn: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): Promise<{ brief: ArticleBrief | null; tokens: number; note?: string; rate?: RateInfo }> {
  if (!opts.apiKey) return { brief: null, tokens: 0, note: 'no GEMINI_API_KEY' }
  const text = String(body || '').slice(0, 6000)
  if (text.replace(/\s+/g, ' ').trim().length < 80) return { brief: null, tokens: 0, note: 'body too thin to read' }
  const user = `HEADLINE: ${headline}\n\nARTICLE BODY:\n${text}`
  const url = `${opts.baseUrl}/models/${opts.model}:generateContent`
  let tokens = 0
  let lastNote = 'gemini fetch error'
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
          generationConfig: { temperature: 0.1, maxOutputTokens: opts.maxTokens ?? 900, responseMimeType: 'application/json', thinkingConfig: { thinkingBudget: 0 } },
        }),
      })
      if (!res.ok) {
        const raw = await res.text().catch(() => '')
        let parsedErr: any
        try { parsedErr = JSON.parse(raw) } catch { parsedErr = null }
        const rate = res.status === 429 ? parseGeminiRetry(parsedErr) : {}
        const perDay = res.status === 429 && isPerDayQuota(parsedErr)
        lastNote = `gemini HTTP ${res.status}${perDay ? ' PerDay-quota-exhausted' : ''}`
        const transient = (res.status === 429 && !perDay) || res.status >= 500
        if (transient && attempt < maxAttempts) { await sleep(rate.retryAfterMs || 1200 * attempt); continue }
        return { brief: null, tokens, note: lastNote, rate }
      }
      const data: any = await res.json()
      tokens += Number(data?.usageMetadata?.totalTokenCount) || 0
      const cand = data?.candidates?.[0]
      if (data?.promptFeedback?.blockReason) return { brief: null, tokens, note: `gemini blocked: ${data.promptFeedback.blockReason}` }
      if (cand?.finishReason && cand.finishReason !== 'STOP') return { brief: null, tokens, note: `gemini: finishReason ${cand.finishReason}` }
      const content = Array.isArray(cand?.content?.parts) ? cand.content.parts.map((p: any) => (typeof p?.text === 'string' ? p.text : '')).join('') : ''
      if (!content) return { brief: null, tokens, note: 'gemini: empty content' }
      let parsed: any
      try { parsed = JSON.parse(content) } catch { return { brief: null, tokens, note: 'gemini: non-JSON content' } }
      return { brief: coerceArticleBrief(parsed), tokens }
    } catch (e: any) {
      lastNote = e?.name === 'TimeoutError' ? 'gemini: request timed out' : e?.message || 'gemini fetch error'
      if (attempt < maxAttempts) await sleep(1200 * attempt)
    }
  }
  return { brief: null, tokens, note: lastNote }
}
