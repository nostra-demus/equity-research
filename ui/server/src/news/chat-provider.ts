import type { ChatTurnOutcome } from '../chat-llm'
import { Budget, armCooldown, clearCooldown, conservativeChatTokenBound, credibleTokenUsage, getSharedLimiter, isCoolingDown, rateInfoForLimiter, type BudgetReservation, type RateInfo } from './triage/budget'
import { parseRate } from './triage/groq'

export interface NewsChatFallbackConfig {
  enabled: boolean
  /** False on a read-only replica. Only the retained news-engine owner may spend shared provider slots. */
  providerSpendingAllowed?: boolean
  apiKey: string
  baseUrl: string
  model: string
  timeoutMs: number
  maxTokens: number
  stateDir: string
  rpm: number
  tpm: number
  dailyReqCap: number
  dailyTokenCap: number
  dailyTokenTarget: number
  paceFloorFrac: number
  limiterWaitMs: number
  cooldownMs: number
  cooldownMaxMs: number
}

export interface NewsChatFallbackOutcome extends ChatTurnOutcome {
  attempted: boolean
  model?: string
}

function compactEvidenceBlock(block: string, maxChars = 950): string {
  const lines = block.split('\n').filter(Boolean)
  const kept = lines.filter((line, index) => index === 0 || /^(source snippet|saved article read|saved article points|saved figures|saved impact|url):/i.test(line))
  const text = kept.join('\n')
  return text.length <= maxChars ? text : `${text.slice(0, maxChars - 1).trim()}…`
}

const FINAL_QUESTION_TRAILER = 'NEWS_CHAT_FINAL_QUESTION_CHARS:'

/**
 * Put the final question at the end with an exact character count. Unlike a delimiter search, this is
 * unambiguous even when untrusted transcript text contains `QUESTION:` or copies the trailer itself.
 */
export function appendNewsChatFinalQuestion(prefix: string, question: string): string {
  const encoded = JSON.stringify(question)
  return `${prefix}\nFINAL QUESTION (JSON string; decode it exactly):\n${encoded}\n${FINAL_QUESTION_TRAILER}${encoded.length}`
}

function finalQuestionEnvelope(user: string): { head: string; block: string } | null {
  const trailerAt = user.lastIndexOf(`\n${FINAL_QUESTION_TRAILER}`)
  if (trailerAt < 0) return null
  const rawLength = user.slice(trailerAt + FINAL_QUESTION_TRAILER.length + 1)
  if (!/^\d+$/.test(rawLength)) return null
  const length = Number(rawLength)
  const encodedStart = trailerAt - length
  if (!Number.isSafeInteger(length) || encodedStart <= 0 || user[encodedStart - 1] !== '\n') return null
  const encoded = user.slice(encodedStart, trailerAt)
  try {
    if (typeof JSON.parse(encoded) !== 'string') return null
  } catch { return null }
  const label = 'FINAL QUESTION (JSON string; decode it exactly):\n'
  const labelStart = encodedStart - label.length
  if (labelStart < 0 || user.slice(labelStart, encodedStart) !== label) return null
  return { head: user.slice(0, labelStart).replace(/\n+$/, ''), block: user.slice(labelStart) }
}

/** Keep the receipt, the best cited rows, and the exact question inside a small-provider TPM limit. */
export function compactNewsChatUserPrompt(user: string, maxChars = 12_000): string {
  if (user.length <= maxChars) return user
  const currentAt = user.indexOf('\nCURRENT EVIDENCE:')
  const envelope = finalQuestionEnvelope(user)
  const question = envelope?.block || ''
  // The backup must never answer a cut-off question. A caller can ask up to the API's message limit, so
  // fail explicitly when the complete final question itself leaves no useful room for the closed-book
  // receipt. This is safer than silently asking a different question after `slice(0, maxChars)`.
  const reserve = 220
  if (!question || question.length > maxChars - reserve) throw new Error('The complete question is too long for the backup provider. Ask a shorter question.')
  const rawHead = currentAt >= 0 ? user.slice(0, currentAt) : (envelope?.head || '')
  const headBudget = Math.min(3_200, Math.max(reserve, maxChars - question.length - 200))
  const head = rawHead.slice(0, headBudget)
  const evidenceArea = currentAt >= 0 ? user.slice(currentAt, envelope ? user.length - envelope.block.length : undefined) : ''
  const blocks = evidenceArea.match(/^\[(?:N|H)\d+\][\s\S]*?(?=^\[(?:N|H)\d+\]|\nOLDER EVIDENCE|$)/gm) || []
  const current = blocks.filter((b) => /^\[N/.test(b)).slice(0, 7)
  const older = blocks.filter((b) => /^\[H/.test(b)).slice(0, 2)
  const prefix = [
    head,
    '',
    'COMPACT CURRENT EVIDENCE:',
  ]
  const suffix = ['', 'COMPACT OLDER EVIDENCE:', '', question]
  const selectedCurrent: string[] = []
  const selectedOlder: string[] = []
  const fits = (nextCurrent: string[], nextOlder: string[]) => [...prefix, ...nextCurrent, ...suffix.slice(0, 2), ...(nextOlder.length ? nextOlder : ['No older row kept in the backup prompt.']), ...suffix.slice(2)].join('\n').length <= maxChars
  // Evidence is the only optional material. Keep the highest-ranked rows that fit, then older rows; the
  // full final question and receipt are fixed and can never be trimmed by this loop.
  for (const block of current.map((b) => compactEvidenceBlock(b))) if (fits([...selectedCurrent, block], selectedOlder)) selectedCurrent.push(block)
  for (const block of older.map((b) => compactEvidenceBlock(b))) if (fits(selectedCurrent, [...selectedOlder, block])) selectedOlder.push(block)
  const compact = [...prefix, ...selectedCurrent, ...suffix.slice(0, 2), ...(selectedOlder.length ? selectedOlder : ['No older row kept in the backup prompt.']), ...suffix.slice(2)].join('\n')
  if (compact.length > maxChars) throw new Error('The complete question is too long for the backup provider. Ask a shorter question.')
  return compact
}

function endpoint(baseUrl: string): string {
  return `${baseUrl.replace(/\/$/, '')}/chat/completions`
}

/** Worst-case billable tokens for one closed-book backup call. */
export function newsChatTokenBound(system: string, user: string, maxTokens: number): number {
  return conservativeChatTokenBound(system, user, Math.max(200, maxTokens))
}

/**
 * Closed-book backup for news chat only.
 *
 * The caller supplies the same locked system prompt and cited evidence block used by the primary
 * subscription model. This call has no tools and can only read those two messages. It is deliberately
 * limited to public saved-news context; research reports continue to use the stronger primary model.
 */
export async function runNewsChatFallback(opts: {
  system: string
  user: string
  signal: AbortSignal
  onToken: (text: string) => void
  config: NewsChatFallbackConfig
  fetchImpl?: typeof fetch
}): Promise<NewsChatFallbackOutcome> {
  const { config } = opts
  if (!config.enabled || !config.apiKey) return { attempted: false, costUsd: 0, error: 'News chat backup is not configured.' }
  if (config.providerSpendingAllowed === false) return { attempted: false, costUsd: 0, error: 'News chat backup is waiting for the active news engine.' }
  if (opts.signal.aborted) return { attempted: false, costUsd: 0, error: 'aborted' }

  let compactUser: string
  try { compactUser = compactNewsChatUserPrompt(opts.user) }
  catch (error: any) { return { attempted: false, costUsd: 0, error: String(error?.message || error) } }
  const estimatedTokens = Math.max(1, Math.ceil((opts.system.length + compactUser.length) / 4) + Math.max(200, config.maxTokens))
  const perAttemptTokens = newsChatTokenBound(opts.system, compactUser, config.maxTokens)
  const now = Date.now()
  const chatHoldId = 'chat:groq'
  if (isCoolingDown(config.stateDir, 'groq', now) || isCoolingDown(config.stateDir, chatHoldId, now)) return { attempted: false, costUsd: 0, error: 'News chat backup is waiting for its next engine retry after an error.' }
  const budget = Budget.load(config.stateDir, config.dailyReqCap, config.dailyTokenCap, now, 'groq-budget.json')
  if (!budget.pacedCanSpend(perAttemptTokens, { targetTokens: config.dailyTokenTarget, floorFrac: config.paceFloorFrac }, now)) {
    return { attempted: false, costUsd: 0, error: 'News chat backup has no shared Groq budget available right now.' }
  }
  const limiter = getSharedLimiter(config.rpm, config.tpm)
  const abortableSleep = (ms: number) => new Promise<void>((resolve, reject) => {
    if (opts.signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'))
      return
    }
    const timer = setTimeout(done, ms)
    const onAbort = () => done(new DOMException('Aborted', 'AbortError'))
    function done(error?: Error) {
      clearTimeout(timer)
      opts.signal.removeEventListener('abort', onAbort)
      if (error) reject(error)
      else resolve()
    }
    opts.signal.addEventListener('abort', onAbort, { once: true })
  })
  let acquired = false
  try {
    acquired = await limiter.acquire(estimatedTokens, abortableSleep, () => Date.now(), config.limiterWaitMs, opts.signal)
  } catch (error: any) {
    if (opts.signal.aborted || error?.name === 'AbortError') return { attempted: false, costUsd: 0, error: 'aborted' }
    throw error
  }
  if (!acquired) return { attempted: false, costUsd: 0, error: opts.signal.aborted ? 'aborted' : 'News chat backup is busy with the shared Groq workload.' }
  if (opts.signal.aborted) return { attempted: false, costUsd: 0, error: 'aborted' }
  if (isCoolingDown(config.stateDir, 'groq', Date.now()) || isCoolingDown(config.stateDir, chatHoldId, Date.now())) {
    return { attempted: false, costUsd: 0, error: 'News chat backup is waiting to try again after an error.' }
  }

  // Re-check and reserve only after the shared rate limiter admits this request. Concurrent chat and
  // ingester callers now see the reservation immediately instead of all spending from one stale snapshot.
  let reservation: BudgetReservation | null = budget.tryReserve(
    perAttemptTokens,
    { targetTokens: config.dailyTokenTarget, floorFrac: config.paceFloorFrac },
    Date.now(),
  )
  if (!reservation) return { attempted: false, costUsd: 0, error: 'News chat backup has no shared Groq budget available right now.' }
  if (opts.signal.aborted) {
    budget.reconcile(reservation, 0, 0)
    return { attempted: false, costUsd: 0, error: 'aborted' }
  }

  const timeout = new AbortController()
  const stop = () => timeout.abort()
  opts.signal.addEventListener('abort', stop, { once: true })
  const timer = setTimeout(stop, Math.max(1_000, config.timeoutMs))
  let requestMade = false
  let requestStartedAt = 0
  let recordedTokens = 0
  let providerReachable = false
  let chatHealthy = false
  let exhaustDay = false
  let failureHold: { id: string; baseMs: number; maxMs: number; reason: string } | null = null
  const classifyHttpFailure = (status: number, rate: RateInfo) => {
    exhaustDay = status === 429 && rate.rpdRemaining === 0
    if (exhaustDay) return
    const sharedFailure = status === 429 || status >= 500 || [401, 402, 403, 404].includes(status)
    if (!sharedFailure) {
      providerReachable = true
      const retryMs = rate.retryAfterMs != null && Number.isFinite(rate.retryAfterMs) ? Math.max(0, Math.floor(rate.retryAfterMs)) : null
      failureHold = retryMs != null
        ? retryMs > 0 ? { id: chatHoldId, baseMs: retryMs, maxMs: retryMs, reason: 'chat-request' } : null
        : { id: chatHoldId, baseMs: config.cooldownMs, maxMs: config.cooldownMaxMs, reason: 'chat-request' }
    } else if (rate.retryAfterMs != null && Number.isFinite(rate.retryAfterMs)) {
      const retryMs = Math.max(0, Math.floor(rate.retryAfterMs))
      failureHold = retryMs > 0 ? { id: 'groq', baseMs: retryMs, maxMs: retryMs, reason: status === 429 ? 'rate-limit' : 'availability' } : null
    } else if (status === 429) {
      failureHold = { id: 'groq', baseMs: 60_000, maxMs: 60_000, reason: 'rate-limit' }
    } else if (status >= 500 || [401, 402, 403, 404].includes(status)) {
      failureHold = { id: 'groq', baseMs: config.cooldownMs, maxMs: config.cooldownMaxMs, reason: status >= 500 ? 'availability' : 'provider-access' }
    }
  }
  try {
    requestMade = true
    requestStartedAt = Date.now()
    const response = await (opts.fetchImpl || fetch)(endpoint(config.baseUrl), {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: opts.system },
          { role: 'user', content: compactUser },
        ],
        temperature: 0.1,
        max_tokens: Math.max(200, config.maxTokens),
        stream: false,
      }),
      signal: timeout.signal,
    })
    const rate = parseRate(response)
    const providerWideHttp = response.status === 429 || response.status >= 500 || [401, 402, 403, 404].includes(response.status)
    limiter.learn(rateInfoForLimiter(rate, response.ok || providerWideHttp))
    if (!response.ok) {
      classifyHttpFailure(response.status, rate)
      // Provider bodies can contain account or organisation identifiers. Keep them in neither the UI nor
      // logs; the status code is enough for the operator to diagnose the configured backup.
      return { attempted: true, costUsd: 0, error: `News chat backup failed (${response.status}).` }
    }
    providerReachable = true
    const payload: any = await response.json()
    // A provider-supplied count can lower the conservative reservation only when it is a credible,
    // positive count for work that was actually sent. Negative, zero, NaN, or missing telemetry is not
    // proof that the call was free; keeping the reservation protects the daily hard limit.
    recordedTokens = credibleTokenUsage(payload?.usage?.total_tokens, perAttemptTokens)
    const choice = payload?.choices?.[0]
    const finishReason = String(choice?.finish_reason || '').toLowerCase()
    if (finishReason === 'length' || finishReason === 'max_tokens') {
      failureHold = { id: chatHoldId, baseMs: config.cooldownMs, maxMs: config.cooldownMaxMs, reason: 'chat-contract' }
      return { attempted: true, costUsd: 0, error: 'News chat backup answer was cut off by its output limit. Ask a narrower question.' }
    }
    const answer = choice?.message?.content
    if (typeof answer !== 'string' || !answer.trim()) {
      failureHold = { id: chatHoldId, baseMs: config.cooldownMs, maxMs: config.cooldownMaxMs, reason: 'chat-contract' }
      return { attempted: true, costUsd: 0, error: 'News chat backup returned no answer.' }
    }
    chatHealthy = true
    opts.onToken(answer)
    return { attempted: true, costUsd: 0, model: `groq/${config.model}` }
  } catch (error: any) {
    if (opts.signal.aborted) return { attempted: true, costUsd: 0, error: 'aborted' }
    const timedOut = error?.name === 'AbortError' || error?.name === 'TimeoutError'
    failureHold = timedOut || error instanceof SyntaxError
      ? { id: chatHoldId, baseMs: config.cooldownMs, maxMs: config.cooldownMaxMs, reason: timedOut ? 'chat-timeout' : 'chat-contract' }
      : { id: 'groq', baseMs: config.cooldownMs, maxMs: config.cooldownMaxMs, reason: 'availability' }
    const reason = timedOut ? 'timed out' : 'provider unavailable'
    return { attempted: true, costUsd: 0, error: `News chat backup ${reason}.` }
  } finally {
    clearTimeout(timer)
    opts.signal.removeEventListener('abort', stop)
    if (reservation) {
      budget.reconcile(reservation, requestMade ? 1 : 0, requestMade ? (recordedTokens || perAttemptTokens) : 0)
      reservation = null
    }
    if (requestMade) {
      if (chatHealthy) {
        clearCooldown(config.stateDir, 'groq', requestStartedAt)
        clearCooldown(config.stateDir, chatHoldId, requestStartedAt)
      } else if (!opts.signal.aborted) {
        if (providerReachable && failureHold?.id !== 'groq') clearCooldown(config.stateDir, 'groq', requestStartedAt)
        if (exhaustDay) budget.exhaust()
        else if (failureHold) armCooldown(config.stateDir, Date.now(), failureHold.baseMs, failureHold.id, failureHold.maxMs, failureHold.reason)
      }
    }
  }
}

/** Atomic process-local admission for the whole news-chat request, not just the LLM subprocess. */
export class NewsChatRequestGate {
  private active = 0
  constructor(private readonly max: number) {}

  tryAcquire(): (() => void) | null {
    if (this.active >= Math.max(1, this.max)) return null
    this.active++
    let released = false
    return () => {
      if (released) return
      released = true
      this.active = Math.max(0, this.active - 1)
    }
  }

  get inFlight(): number { return this.active }
}

interface CloseEmitter {
  once(event: string, listener: () => void): unknown
  removeListener(event: string, listener: () => void): unknown
  aborted?: boolean
  destroyed?: boolean
  closed?: boolean
}

/** Bind one controller before retrieval starts; a vanished client cancels archive work and both LLMs. */
export function bindNewsChatRequestAbort(
  request: CloseEmitter,
  response: CloseEmitter & { writableEnded: boolean },
): { controller: AbortController; dispose: () => void } {
  const controller = new AbortController()
  const abortRequest = () => controller.abort()
  const abortPrematureResponse = () => { if (!response.writableEnded) controller.abort() }
  const disconnected = () => Boolean(
    request.aborted
    || request.destroyed
    || (!response.writableEnded && (response.destroyed || response.closed)),
  )
  // Snapshot on both sides of listener registration. A socket can disappear in the tiny interval between
  // the route acquiring its request gate and attaching these handlers; checking only future events misses
  // that close forever and lets retrieval continue without a client.
  const goneBeforeRegistration = disconnected()
  request.once('aborted', abortRequest)
  response.once('close', abortPrematureResponse)
  if (goneBeforeRegistration || disconnected()) controller.abort()
  return {
    controller,
    dispose: () => {
      request.removeListener('aborted', abortRequest)
      response.removeListener('close', abortPrematureResponse)
    },
  }
}

export function shouldUseNewsChatFallback(error?: string): boolean {
  return Boolean(error && /usage limit|rate limit|busy|authenticate|no answer|took too long/i.test(error))
}
