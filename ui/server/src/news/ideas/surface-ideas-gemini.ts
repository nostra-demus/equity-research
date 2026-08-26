// Native Gemini twin of the OpenAI-compatible Ideas skim. Gemini's free models expose separate daily
// request buckets, so leaving them out of Ideas can freeze the board behind a capped Groq/OpenRouter path
// while useful Gemini allowance sits idle. This adapter deliberately returns the same SurfaceIdeasResult
// contract as surfaceIdeasBatch; routing, budgets, cooldown isolation, and persistence stay centralized in
// run-idea-pass.ts.

import { conservativeChatTokenBound, type RateInfo } from '../triage/budget'
import { isPerDayQuota, parseGeminiRetry } from '../triage/gemini'
import { caughtFailure, durToMs, type ProviderFailureKind } from '../triage/groq'
import {
  classifyProviderContractFailure,
  classifyProviderHttpFailure,
  classifyProviderLocalStateFailure,
  clearProviderQuarantine,
  honorProviderRetryAfter,
  providerFailureFromQuarantine,
  providerRequestIdentity,
  publicProviderFailureNote,
  publicProviderQuarantineNote,
  quarantineProviderFailure,
  readProviderQuarantine,
  type ProviderFailureClassification,
  type ProviderRequestIdentity,
} from '../provider-failure'
import {
  IDEA_SYSTEM, buildIdeaUserMessage, coerceCompleteIdeaRows,
  type IdeaInputRow, type SurfaceIdeasResult,
} from './surface-ideas'

export interface GeminiIdeasOptions {
  model: string
  baseUrl: string
  apiKey: string
  maxTokens?: number
  timeoutMs?: number
  maxAttempts?: number
  signal?: AbortSignal
  providerId?: string
  providerLabel?: string
  keyEnvVar?: string
  stateDir?: string
  workload?: string
  contractVersion?: string
  nowMs?: () => number
}

export function geminiIdeaProviderRequestIdentity(opts: GeminiIdeasOptions): ProviderRequestIdentity {
  return providerRequestIdentity({
    providerId: opts.providerId || `gemini:${opts.model}`,
    baseUrl: opts.baseUrl,
    model: opts.model,
    apiKey: opts.apiKey,
    keyEnvVar: opts.keyEnvVar,
    transport: 'gemini',
    workload: opts.workload || 'ideas',
    contractVersion: opts.contractVersion || 'news-ideas-json-v1',
    request: {
      responseMimeType: 'application/json',
      temperature: 0.2,
      configuredMaxTokens: opts.maxTokens ?? 2500,
      thinkingBudget: 0,
    },
  })
}

function legacyFailureKind(failure: ProviderFailureClassification): ProviderFailureKind {
  if (failure.code === 'rate_limited') return 'rate_limit'
  if (failure.code === 'transient_upstream' || failure.code === 'timeout') return 'availability'
  if (failure.code === 'contract_invalid') return 'contract'
  return 'request'
}

async function waitOrAbort(ms: number, sleep: (ms: number) => Promise<void>, signal?: AbortSignal): Promise<boolean> {
  if (signal?.aborted) return false
  if (!signal) { await sleep(ms); return true }
  return await new Promise<boolean>((resolve, reject) => {
    let settled = false
    const finish = (value: boolean, error?: unknown) => {
      if (settled) return
      settled = true
      signal.removeEventListener('abort', onAbort)
      if (error) reject(error)
      else resolve(value)
    }
    const onAbort = () => finish(false)
    signal.addEventListener('abort', onAbort, { once: true })
    if (signal.aborted) return finish(false)
    void sleep(ms).then(() => finish(true), (error) => finish(false, error))
  })
}

/** One Gemini generateContent call over the ranked Ideas input. Never throws. */
export async function surfaceIdeasBatchGemini(
  rows: IdeaInputRow[],
  opts: GeminiIdeasOptions,
  fetchFn: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
): Promise<SurfaceIdeasResult> {
  if (!rows.length) return { ideas: [], requests: 0, tokens: 0, ok: true }
  const provider = opts.providerLabel || opts.providerId || `Gemini · ${opts.model}`
  const identity = geminiIdeaProviderRequestIdentity(opts)
  if (!opts.apiKey) {
    const failure = classifyProviderLocalStateFailure()
    return {
      ideas: [], requests: 0, tokens: 0, ok: false, note: 'gemini idea: provider not configured',
      failureKind: 'request', failure, providerIdentity: identity,
    }
  }
  if (opts.signal?.aborted) {
    return {
      ideas: [], requests: 0, tokens: 0, ok: false, note: 'gemini idea: provider-chain deadline reached',
      failureKind: 'request', providerIdentity: identity,
    }
  }
  const standing = opts.stateDir ? readProviderQuarantine(opts.stateDir, identity) : null
  if (standing) {
    const failure = providerFailureFromQuarantine(standing)
    return {
      ideas: [], requests: 0, tokens: 0, ok: false, quarantined: true,
      note: publicProviderQuarantineNote(provider, standing), failureKind: legacyFailureKind(failure),
      failure, providerIdentity: identity,
    }
  }

  const user = buildIdeaUserMessage(rows)
  const maxOutputTokens = opts.maxTokens ?? 2500
  const maxAttempts = opts.maxAttempts ?? 2
  const url = `${opts.baseUrl}/models/${opts.model}:generateContent`
  let requests = 0
  let tokens = 0
  let lastNote = 'gemini idea: network unavailable'
  let lastFailure: { failureKind: ProviderFailureKind; failure: ProviderFailureClassification; timedOut?: boolean } = {
    failureKind: 'availability',
    failure: { code: 'transient_upstream', scope: 'provider', action: 'cooldown', providerWide: true },
  }
  const clock = opts.nowMs ?? (() => Date.now())

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    if (opts.signal?.aborted) break
    const concurrentStanding = opts.stateDir ? readProviderQuarantine(opts.stateDir, identity) : null
    if (concurrentStanding) {
      const failure = providerFailureFromQuarantine(concurrentStanding)
      return {
        ideas: [], requests, tokens, ok: false, quarantined: true,
        note: publicProviderQuarantineNote(provider, concurrentStanding), failureKind: legacyFailureKind(failure),
        failure, providerIdentity: identity,
      }
    }
    const attemptStartedAt = clock()
    try {
      requests++
      const timeoutSignal = AbortSignal.timeout(opts.timeoutMs ?? 30_000)
      const signal = opts.signal ? AbortSignal.any([opts.signal, timeoutSignal]) : timeoutSignal
      const res = await fetchFn(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-goog-api-key': opts.apiKey },
        signal,
        body: JSON.stringify({
          system_instruction: { parts: [{ text: IDEA_SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: user }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens,
            responseMimeType: 'application/json',
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      })
      if (opts.signal?.aborted) break
      if (!res.ok) {
        const raw = await res.text().catch(() => '')
        let parsedError: any
        try { parsedError = JSON.parse(raw) } catch { parsedError = null }
        const bodyRate = res.status === 429 ? parseGeminiRetry(parsedError) : {}
        const headerRetryAfterMs = (res.status === 429 || res.status === 503)
          ? durToMs(res.headers?.get?.('retry-after'))
          : undefined
        const rate: RateInfo = headerRetryAfterMs != null
          ? { ...bodyRate, retryAfterMs: headerRetryAfterMs }
          : bodyRate
        const dailyLimit = res.status === 429 && isPerDayQuota(parsedError)
        const failure = honorProviderRetryAfter(classifyProviderHttpFailure(res.status, parsedError ?? raw), rate.retryAfterMs)
        const failureKind = legacyFailureKind(failure)
        lastNote = publicProviderFailureNote(provider, failure, dailyLimit)
        lastFailure = { failureKind, failure }
        const transient = ((failure.code === 'rate_limited' && !dailyLimit) || failure.code === 'transient_upstream')
        if (transient && attempt < maxAttempts) {
          if (!await waitOrAbort(rate.retryAfterMs || 1500 * attempt, sleep, opts.signal)) break
          continue
        }
        if (opts.stateDir) quarantineProviderFailure(opts.stateDir, identity, failure, clock())
        return {
          ideas: [], requests, tokens, ok: false, note: lastNote, rate, failureKind,
          failure, providerIdentity: identity, httpStatus: res.status, ...(dailyLimit ? { dailyLimit: true } : {}),
        }
      }

      let data: any
      try { data = await res.json() }
      catch (error: any) {
        if (error?.name === 'SyntaxError') {
          const failure = classifyProviderContractFailure()
          return {
            ideas: [], requests, tokens, ok: false, note: 'gemini idea: malformed provider response JSON',
            failureKind: 'contract', failure, providerIdentity: identity,
          }
        }
        throw error
      }
      tokens += Number(data?.usageMetadata?.totalTokenCount)
        || conservativeChatTokenBound(IDEA_SYSTEM, user, maxOutputTokens)
      const candidate = data?.candidates?.[0]
      if (data?.promptFeedback?.blockReason) {
        const failure = classifyProviderContractFailure()
        return { ideas: [], requests, tokens, ok: false, note: 'gemini idea: response blocked', failureKind: 'contract', failure, providerIdentity: identity }
      }
      if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
        const failure = classifyProviderContractFailure()
        return { ideas: [], requests, tokens, ok: false, note: 'gemini idea: output truncated or incomplete', failureKind: 'contract', failure, providerIdentity: identity }
      }
      const content = Array.isArray(candidate?.content?.parts)
        ? candidate.content.parts.map((part: any) => typeof part?.text === 'string' ? part.text : '').join('')
        : ''
      if (!content) {
        const failure = classifyProviderContractFailure()
        return { ideas: [], requests, tokens, ok: false, note: 'gemini idea: empty content', failureKind: 'contract', failure, providerIdentity: identity }
      }
      let parsed: any
      try { parsed = JSON.parse(content) }
      catch {
        const failure = classifyProviderContractFailure()
        return { ideas: [], requests, tokens, ok: false, note: 'gemini idea: non-JSON content', failureKind: 'contract', failure, providerIdentity: identity }
      }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed) || !Array.isArray(parsed.ideas)) {
        const failure = classifyProviderContractFailure()
        return {
          ideas: [], requests, tokens, ok: false, note: 'gemini idea: invalid response schema (expected top-level ideas array)',
          failureKind: 'contract', failure, providerIdentity: identity,
        }
      }
      const ideas = coerceCompleteIdeaRows(parsed.ideas, rows.length)
      if (!ideas) {
        const failure = classifyProviderContractFailure()
        return {
          ideas: [], requests, tokens, ok: false, note: 'gemini idea: invalid, duplicate, or excess idea rows',
          failureKind: 'contract', failure, providerIdentity: identity,
        }
      }
      if (opts.stateDir) clearProviderQuarantine(opts.stateDir, identity, attemptStartedAt)
      return { ideas, requests, tokens, ok: true, providerIdentity: identity }
    } catch (error: any) {
      const caught = caughtFailure(error, provider)
      lastNote = caught.note
      lastFailure = caught
      if (opts.stateDir) quarantineProviderFailure(opts.stateDir, identity, caught.failure, clock())
      if (opts.signal?.aborted) break
      if (caught.failure.action === 'quarantine') break
      if (attempt < maxAttempts && !await waitOrAbort(1500 * attempt, sleep, opts.signal)) break
    }
  }
  return { ideas: [], requests, tokens, ok: false, note: lastNote, providerIdentity: identity, ...lastFailure }
}
