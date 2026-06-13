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
import { buildUserMessage, coerceTriage, durToMs, estimateTokens, SYSTEM, type TriageOptions, type TriageResult } from './groq'

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
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const res = await fetchFn(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': opts.apiKey },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: buildUserMessage(items) }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: opts.maxTokens ?? 2000, responseMimeType: 'application/json' },
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
        if (transient && attempt < 2) {
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
      lastNote = e?.message || 'gemini fetch error'
      if (attempt < 2) await sleep(1500 * attempt)
    }
  }
  return { byIndex, requests, tokens, ok: false, note: lastNote }
}
