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
import {
  buildUserMessage, caughtFailure, coerceCompleteTriageRows, estimateTokens, httpFailureKind,
  parseRate, publicHttpFailureNote, SYSTEM, type TriageOptions, type TriageResult,
} from './groq'

// Default Haiku 4.5 list prices ($ / million tokens). Used ONLY to report spend on the cycle summary; the
// caller's request + token budgets are the actual guardrails. Override per deployment (config prices).
const HAIKU_IN_PER_MTOK = 1.0
const HAIKU_OUT_PER_MTOK = 5.0

/** TriageOptions plus the per-token prices used to report spend. */
export type AnthropicTriageOptions = TriageOptions & {
  inPricePerMTok?: number
  outPricePerMTok?: number
  /** Parent cycle cancellation. Kept separate from the per-attempt timeout so a cancelled cycle cannot
   * start or retry a paid request while the rest of the provider chain is already shutting down. */
  signal?: AbortSignal
}

/** `costUsd` is exact only when Anthropic returned a complete numeric usage block for every dispatched
 * attempt. Callers must keep their conservative pre-call reservation when `costUsdKnown` is false: a
 * missing usage block, network ambiguity, or in-flight abort is not evidence that the paid call cost $0. */
export type AnthropicTriageResult = TriageResult & { costUsd: number; costUsdKnown: boolean }

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
): Promise<AnthropicTriageResult> {
  const byIndex = new Map<number, Triage>()
  if (!items.length) return { byIndex, requests: 0, tokens: 0, ok: true, costUsd: 0, costUsdKnown: true }
  if (!opts.apiKey) return { byIndex, requests: 0, tokens: 0, ok: false, note: 'no NEWS_ANTHROPIC_FALLBACK_API_KEY', costUsd: 0, costUsdKnown: true, failureKind: 'request' }

  const inPrice = opts.inPricePerMTok ?? HAIKU_IN_PER_MTOK
  const outPrice = opts.outPricePerMTok ?? HAIKU_OUT_PER_MTOK
  let requests = 0
  let tokens = 0
  let costUsd = 0
  // Starts exact at $0 before I/O. Each dispatch makes the aggregate unknown until that exact attempt's
  // complete usage is observed. A later successful retry cannot erase uncertainty from an earlier call.
  let costUsdKnown = true
  let lastFailure: Required<Pick<TriageResult, 'note' | 'failureKind'>> & Pick<TriageResult, 'timedOut'> = {
    note: 'anthropic: network unavailable', failureKind: 'availability',
  }
  const maxAttempts = opts.maxAttempts ?? 2
  const abortedResult = (): AnthropicTriageResult => ({
    byIndex, requests, tokens, ok: false, note: 'anthropic: cycle aborted', costUsd, costUsdKnown,
    failureKind: 'availability', timedOut: true,
  })
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // A parent abort is an operation boundary, not a provider failure. Check it immediately before the
    // request counter/fetch so an already-cancelled cycle neither burns a paid attempt nor retries it.
    if (opts.signal?.aborted) return abortedResult()
    try {
      requests++
      costUsdKnown = false
      const timeoutSignal = AbortSignal.timeout(opts.timeoutMs ?? 30_000)
      const signal = opts.signal ? AbortSignal.any([opts.signal, timeoutSignal]) : timeoutSignal
      const res = await fetchFn(`${opts.baseUrl}/v1/messages`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-api-key': opts.apiKey, 'anthropic-version': '2023-06-01', ...(opts.headers || {}) },
        signal, // whichever comes first: the cycle wall-clock guard or this attempt's own timeout
        body: JSON.stringify({
          model: opts.model,
          max_tokens: opts.maxTokens ?? 2400,
          temperature: 0.1,
          system: SYSTEM,
          messages: [{ role: 'user', content: buildUserMessage(items) }],
        }),
      })
      if (opts.signal?.aborted) return abortedResult()
      if (!res.ok) {
        // Drain the body so the connection can be reused, but never copy it into a public cycle/UI note:
        // upstream bodies can carry account ids, balances, and request fragments. Routing uses typed fields.
        await res.text().catch(() => '')
        // Preserve every explicit provider clock. In particular, access/request responses may also carry a
        // Retry-After; runCycle decides whether that clock is provider-wide or triage-workload-only from the
        // typed failure/status rather than dropping it or widening it into the generic breaker.
        const rate: RateInfo = parseRate(res)
        const rawDayRemaining = res.headers?.get?.('x-ratelimit-remaining-requests-day')
        const dayRemaining = rawDayRemaining == null || rawDayRemaining.trim() === '' ? undefined : Number(rawDayRemaining)
        // Native Anthropic request headers are minute-window limits, not proof the whole provider day is
        // spent. Only an explicitly day-named zero (or a caller-declared generic daily header) may close the
        // durable day ledger. A plain 429 therefore remains recoverable.
        const dailyLimit = res.status === 429 && (
          (Number.isFinite(dayRemaining) && dayRemaining === 0)
          || (opts.requestRemainingHeaderIsDaily === true && rate.rpdRemaining === 0)
        )
        const failureKind = httpFailureKind(res.status)
        const note = publicHttpFailureNote('anthropic', res.status, dailyLimit)
        const transient = (res.status === 429 && !dailyLimit) || res.status >= 500
        if (transient && attempt < maxAttempts) {
          await sleep(rate.retryAfterMs || 1500 * attempt)
          continue
        }
        return {
          byIndex, requests, tokens, ok: false, note, rate, costUsd, costUsdKnown, failureKind, httpStatus: res.status,
          ...(dailyLimit ? { dailyLimit: true } : {}),
        }
      }
      const data: any = await res.json()
      const usageKnown = typeof data?.usage?.input_tokens === 'number'
        && Number.isFinite(data.usage.input_tokens) && data.usage.input_tokens >= 0
        && typeof data?.usage?.output_tokens === 'number'
        && Number.isFinite(data.usage.output_tokens) && data.usage.output_tokens >= 0
        // A non-empty dispatched request cannot credibly consume zero total tokens. Treat a zero/zero
        // usage block like omitted telemetry so the caller keeps its conservative USD reservation.
        && (data.usage.input_tokens > 0 || data.usage.output_tokens > 0)
      const inTok = usageKnown ? data.usage.input_tokens : 0
      const outTok = usageKnown ? data.usage.output_tokens : 0
      tokens += inTok + outTok || estimateTokens(items.length)
      if (usageKnown) {
        costUsd += (inTok * inPrice + outTok * outPrice) / 1_000_000
        // runCycle deliberately uses one attempt; retain the stricter aggregate rule for direct callers
        // that opt into retries so an unmetered earlier dispatch cannot be silently refunded.
        costUsdKnown = requests === 1
      }
      // a max_tokens truncation is deterministic — report it, don't half-parse (mirrors the Groq 'length' path)
      if (data?.stop_reason === 'max_tokens') {
        return { byIndex, requests, tokens, ok: false, note: 'anthropic: output truncated at max_tokens — lower NEWS_TRIAGE_BATCH or raise NEWS_ANTHROPIC_FALLBACK_MAX_TOKENS', costUsd, costUsdKnown, failureKind: 'contract' }
      }
      const content = Array.isArray(data?.content)
        ? data.content.filter((c: any) => c?.type === 'text').map((c: any) => (typeof c?.text === 'string' ? c.text : '')).join('')
        : ''
      if (!content) return { byIndex, requests, tokens, ok: false, note: 'anthropic: empty content', costUsd, costUsdKnown, failureKind: 'contract' }
      let parsed: any
      try { parsed = JSON.parse(content) } catch { parsed = braceSlice(content) }
      // must be an object or array — reject bare primitives (numbers/strings/booleans parse as valid JSON
      // but carry no rows; the array branch below is a legitimate top-level-array response, not an error)
      if (parsed === null || typeof parsed !== 'object') return { byIndex, requests, tokens, ok: false, note: 'anthropic: non-JSON content', costUsd, costUsdKnown, failureKind: 'contract' }
      const arr: any[] = Array.isArray(parsed) ? parsed : Array.isArray(parsed?.items) ? parsed.items : []
      const complete = coerceCompleteTriageRows(arr, items.length)
      if (!complete) return { byIndex, requests, tokens, ok: false, note: 'anthropic: incomplete batch response', costUsd, costUsdKnown, failureKind: 'contract' }
      return { byIndex: complete, requests, tokens, ok: true, costUsd, costUsdKnown }
    } catch (e: any) {
      // requests was incremented exactly once immediately before fetch. The old catch-side increment made
      // every thrown network/abort attempt count twice in diagnostics and the caller's provider ledger.
      if (opts.signal?.aborted) return abortedResult()
      lastFailure = caughtFailure(e, 'anthropic')
      if (attempt < maxAttempts) await sleep(1500 * attempt)
    }
  }
  return { byIndex, requests, tokens, ok: false, costUsd, costUsdKnown, ...lastFailure }
}
