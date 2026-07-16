// The PAID last-resort brain. Metered Anthropic Haiku as the FINAL triage tier: it fires only when every
// FREE provider (Groq, the OpenAI-compatible overflow registry, and the Gemini pool) is paced, capped, or
// failing for a batch — the exact point a batch would otherwise DEFER and risk the 1,000-item backlog cap
// dropping it. So the day's throughput becomes "free quotas + a bounded metered top-up", and the
// low-priority tail is no longer silently lost on an overload day.
//
// Unlike the free brains this SPENDS MONEY, so the caller keeps it OFF unless a DEDICATED metered API key
// is set (never the subscription OAuth, never the themes key), and gates it behind a daily request+token
// budget and a priority floor. It speaks the EXACT same triage contract as the Groq/Gemini paths — same
// SYSTEM prompt, same batched user message, same coercion — so downstream (runCycle, ranking, themes)
// cannot tell which brain scored a batch. Only the HTTP shape differs: the Anthropic Messages API instead
// of chat-completions / generateContent. Never throws; one retry on a transient; returns the spend it made
// (costUsd) so the cycle can surface it.

import type { NewsItem, Triage } from '../types'
import type { RateInfo } from './budget'
import { buildUserMessage, coerceTriage, durToMs, estimateTokens, SYSTEM, type TriageOptions, type TriageResult } from './groq'

// Default Haiku 4.5 list prices ($ / million tokens). Used ONLY to report spend on the cycle summary; the
// caller's request + token budgets are the actual guardrails. Override per deployment (config prices).
const HAIKU_IN_PER_MTOK = 1.0
const HAIKU_OUT_PER_MTOK = 5.0

/** TriageOptions plus the per-token prices used to report spend. */
export type AnthropicTriageOptions = TriageOptions & { inPricePerMTok?: number; outPricePerMTok?: number }

/** Pull the first {…} or […] JSON blob out of a text response. The Messages API has no JSON-mode flag, so
 *  the model can wrap the object in prose — this is the defensive twin of the JSON.parse fast path. */
function braceSlice(text: string): any {
  for (const [open, close] of [['{', '}'], ['[', ']']] as const) {
    const s = text.indexOf(open)
    const e = text.lastIndexOf(close)
    if (s >= 0 && e > s) {
      try { return JSON.parse(text.slice(s, e + 1)) } catch { /* try the other bracket */ }
    }
  }
  return null
}

/**
 * Triage one batch via the Anthropic Messages API. Returns the same TriageResult shape as the free
 * providers, plus costUsd (the metered spend this call made). On ok:false the caller treats the batch as
 * UNSCORED (defer it), never scored-zero — identical fail-soft posture to the Groq/Gemini paths.
 */
export async function triageBatchAnthropic(
  items: NewsItem[],
  opts: AnthropicTriageOptions,
  fetchFn: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): Promise<TriageResult & { costUsd: number }> {
  const byIndex = new Map<number, Triage>()
  if (!items.length) return { byIndex, requests: 0, tokens: 0, ok: true, costUsd: 0 }
  if (!opts.apiKey) return { byIndex, requests: 0, tokens: 0, ok: false, note: 'no NEWS_ANTHROPIC_FALLBACK_API_KEY', costUsd: 0 }

  const inPrice = opts.inPricePerMTok ?? HAIKU_IN_PER_MTOK
  const outPrice = opts.outPricePerMTok ?? HAIKU_OUT_PER_MTOK
  let requests = 0
  let tokens = 0
  let costUsd = 0
  let lastNote = 'anthropic fetch error'
  const maxAttempts = opts.maxAttempts ?? 2
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      requests++
      const res = await fetchFn(`${opts.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': opts.apiKey, 'anthropic-version': '2023-06-01', ...(opts.headers || {}) },
        signal: AbortSignal.timeout(opts.timeoutMs ?? 30_000), // a hung connection must never block the cycle
        body: JSON.stringify({
          model: opts.model,
          max_tokens: opts.maxTokens ?? 2400,
          temperature: 0.1,
          system: SYSTEM,
          messages: [{ role: 'user', content: buildUserMessage(items) }],
        }),
      })
      if (!res.ok) {
        const raw = await res.text().catch(() => '')
        const rate: RateInfo = res.status === 429 ? { retryAfterMs: durToMs(res.headers?.get?.('retry-after')) } : {}
        lastNote = `anthropic HTTP ${res.status}${raw ? ': ' + raw.slice(0, 120) : ''}`
        // 429 (rate limit) and 5xx are transient — retry once; a terminal 4xx (bad key / no credits / quota)
        // is surfaced so the caller can skip this provider for the day instead of re-billing failed calls.
        const transient = res.status === 429 || res.status >= 500
        if (transient && attempt < maxAttempts) {
          await sleep(rate.retryAfterMs || 1500 * attempt)
          continue
        }
        return { byIndex, requests, tokens, ok: false, note: lastNote, rate, costUsd }
      }
      const data: any = await res.json()
      const inTok = Number(data?.usage?.input_tokens) || 0
      const outTok = Number(data?.usage?.output_tokens) || 0
      tokens += inTok + outTok || estimateTokens(items.length)
      costUsd += (inTok * inPrice + outTok * outPrice) / 1_000_000
      // a max_tokens truncation is deterministic — report it, don't half-parse (mirrors the Groq 'length' path)
      if (data?.stop_reason === 'max_tokens') {
        return { byIndex, requests, tokens, ok: false, note: 'anthropic: output truncated at max_tokens — lower NEWS_TRIAGE_BATCH or raise NEWS_ANTHROPIC_FALLBACK_MAX_TOKENS', costUsd }
      }
      const content = Array.isArray(data?.content)
        ? data.content.filter((c: any) => c?.type === 'text').map((c: any) => (typeof c?.text === 'string' ? c.text : '')).join('')
        : ''
      if (!content) return { byIndex, requests, tokens, ok: false, note: 'anthropic: empty content', costUsd }
      let parsed: any
      try { parsed = JSON.parse(content) } catch { parsed = braceSlice(content) }
      // must be an object or array — reject bare primitives (numbers/strings/booleans parse as valid JSON
      // but carry no rows; the array branch below is a legitimate top-level-array response, not an error)
      if (parsed === null || typeof parsed !== 'object') return { byIndex, requests, tokens, ok: false, note: 'anthropic: non-JSON content', costUsd }
      const arr: any[] = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : []
      for (const row of arr) {
        const i = Number(row?.i)
        if (Number.isInteger(i) && i >= 0 && i < items.length && !byIndex.has(i)) byIndex.set(i, coerceTriage(row))
      }
      return { byIndex, requests, tokens, ok: true, costUsd }
    } catch (e: any) {
      requests++
      lastNote = e?.name === 'TimeoutError' ? 'anthropic: request timed out' : e?.message || 'anthropic fetch error'
      if (attempt < maxAttempts) await sleep(1500 * attempt)
    }
  }
  return { byIndex, requests, tokens, ok: false, note: lastNote, costUsd }
}
