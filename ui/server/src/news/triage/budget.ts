// Groq free-tier guardrails. Two independent protections so the loop "never hits a rate limit":
//   - Budget: a persisted daily counter (requests + tokens). A cycle refuses to call Groq once
//     either daily cap is reached; the counter resets when the UTC date rolls over. Survives restarts
//     (STATE_DIR), so a server bounce can't silently reset and overspend.
//   - RateLimiter: minimum spacing between calls to stay under the requests-per-minute ceiling.
// Defaults (config.NEWS) sit under Groq's published free limits with margin; both are env-tunable.

import fs from 'node:fs'
import path from 'node:path'
import { Buffer } from 'node:buffer'
import { randomUUID } from 'node:crypto'
import { acquireRetainedFlockSync, releaseRetainedFlock } from '../../singleton-lock'

// Request-gated providers still flow through Budget's request+token contract. Give them one shared,
// deliberately unreachable daily token ceiling instead of repeating a magic sentinel across callers.
export const NON_BINDING_DAILY_TOKEN_CAP = 50_000_000

// A tokenizer-independent upper bound for one two-message chat completion. A tokenizer cannot emit
// more input tokens than there are UTF-8 bytes in the text (each ordinary token consumes at least one
// byte); the configured completion ceiling bounds output tokens. The fixed allowance covers the model's
// chat-template/BOS/EOS framing around the two messages. This is intentionally much more conservative
// than the calibrated estimates used by RateLimiter: hard daily admission must be safe even when a
// response reports unexpectedly high usage or omits its usage object altogether.
export function conservativeChatTokenBound(system: string, user: string, maxOutputTokens: number): number {
  const output = Number.isFinite(maxOutputTokens) ? Math.max(0, Math.ceil(maxOutputTokens)) : 0
  const chatEnvelope = 256
  return Buffer.byteLength(system, 'utf8') + Buffer.byteLength(user, 'utf8') + output + chatEnvelope
}

/** Provider usage may be absent or hostile JSON. Only a finite positive integer is credible evidence that
 * can reconcile a conservative reservation downward; every other shape retains the safe bound. */
export function credibleTokenUsage(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0
    ? value
    : Math.max(0, fallback)
}

/** Worst-case metered cost for one chat completion. Input and output are priced separately: UTF-8 bytes
 * plus a fixed chat envelope conservatively bound input tokens, while the configured max output tokens
 * are already a hard provider-side ceiling. Prices are dollars per million tokens. */
export function conservativeChatUsdBound(
  system: string,
  user: string,
  maxOutputTokens: number,
  inputPricePerMTok: number,
  outputPricePerMTok: number,
): number {
  const output = Number.isFinite(maxOutputTokens) ? Math.max(0, Math.ceil(maxOutputTokens)) : 0
  const total = conservativeChatTokenBound(system, user, output)
  const input = Math.max(0, total - output)
  const inputPrice = Number.isFinite(inputPricePerMTok) ? Math.max(0, inputPricePerMTok) : 0
  const outputPrice = Number.isFinite(outputPricePerMTok) ? Math.max(0, outputPricePerMTok) : 0
  return (input * inputPrice + output * outputPrice) / 1_000_000
}

// Compare USD at a fixed nano-dollar scale. Debits round UP and caps round DOWN, so binary floating-point
// noise cannot reject an exact decimal boundary (0.05 + 0.10 under 0.15) and sub-unit residue can never
// authorize a real overshoot. BigInt keeps the comparison exact even if an operator configures a large cap.
const USD_SCALE_DECIMALS = 9
const USD_SCALE_UNITS = 10n ** BigInt(USD_SCALE_DECIMALS)
function fixedUsdUnits(value: number, roundUp: boolean): bigint | null {
  if (!Number.isFinite(value) || value < 0) return null
  const match = /^(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/.exec(value.toString().toLowerCase())
  if (!match) return null
  const fraction = match[2] || ''
  const exponent = Number(match[3] || 0)
  if (!Number.isSafeInteger(exponent)) return null
  const digits = BigInt(`${match[1]}${fraction}`)
  const shift = exponent - fraction.length + USD_SCALE_DECIMALS
  if (shift >= 0) return digits * (10n ** BigInt(shift))
  const divisor = 10n ** BigInt(-shift)
  const whole = digits / divisor
  return roundUp && digits % divisor !== 0n ? whole + 1n : whole
}

/** Currency-safe hard-cap predicate shared by UsdBudget and the scheduler's read-only drain gate. */
export function usdAmountFits(usedUsd: number, estimateUsd: number, capUsd: number): boolean {
  const used = fixedUsdUnits(usedUsd, true)
  const estimate = fixedUsdUnits(estimateUsd, true)
  const cap = fixedUsdUnits(capUsd, false)
  return used !== null && estimate !== null && cap !== null && used < cap && used + estimate <= cap
}

function usdUnitsToNumber(units: bigint): number {
  const whole = units / USD_SCALE_UNITS
  const fraction = (units % USD_SCALE_UNITS).toString().padStart(USD_SCALE_DECIMALS, '0').replace(/0+$/, '')
  return Number(fraction ? `${whole}.${fraction}` : whole.toString())
}

/** Persist every debit on the same conservative scale used by admission. This prevents accumulated binary
 * artifacts from consuming a later exact boundary while still rounding any sub-nanodollar cost upward. */
function normalizedUsdDebit(value: number): number {
  const units = fixedUsdUnits(value, true)
  return units === null ? 0 : usdUnitsToNumber(units)
}

function addUsdDebits(left: number, right: number): number {
  const a = fixedUsdUnits(left, true) ?? 0n
  const b = fixedUsdUnits(right, true) ?? 0n
  return usdUnitsToNumber(a + b)
}

function reconcileUsdDebit(total: number, reserved: number, actual: number): number {
  const totalUnits = fixedUsdUnits(total, true) ?? 0n
  const reservedUnits = fixedUsdUnits(reserved, true) ?? 0n
  const actualUnits = fixedUsdUnits(actual, true) ?? 0n
  return usdUnitsToNumber((totalUnits > reservedUnits ? totalUnits - reservedUnits : 0n) + actualUnits)
}

// Day key (YYYY-MM-DD) marking the reset boundary. Default UTC; pass an IANA tz (e.g.
// 'America/Los_Angeles') for a provider whose daily quota resets in a specific zone — Gemini's
// requests-per-day resets at midnight Pacific, NOT UTC, so its Budget must key on PT or it would
// reset 7-8h early and risk busting Google's still-counting day.
function dayKey(now = Date.now(), tz?: string): string {
  if (!tz) return new Date(now).toISOString().slice(0, 10)
  return new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now)
}

const DAY_MS = 86_400_000
// Fraction of the day elapsed, clamped to [0,1]. Default UTC (Unix time has no leap seconds, so
// `now % DAY_MS` is exactly ms since UTC midnight). With a tz, the fraction is of the LOCAL day.
export function dayFraction(now = Date.now(), tz?: string): number {
  if (tz) {
    const p = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hourCycle: 'h23', hour: '2-digit', minute: '2-digit', second: '2-digit' }).formatToParts(now)
    const get = (t: string) => Number(p.find((x) => x.type === t)?.value || 0)
    const f = (get('hour') * 3600 + get('minute') * 60 + get('second')) / 86400
    return f < 0 ? 0 : f > 1 ? 1 : f
  }
  const f = (((now % DAY_MS) + DAY_MS) % DAY_MS) / DAY_MS
  return f < 0 ? 0 : f > 1 ? 1 : f
}

// A finite free tier's configured allowance is a SAFE ENGINE ENVELOPE, not a live provider-quota claim.
// The router releases that envelope against the provider's own reset clock and spends from whichever
// usable tier is furthest behind schedule. This keeps every working allowance in use without letting a
// noisy morning empty all fallbacks before the rest of the day arrives.
export type DailyQuotaMeter = 'requests' | 'tokens'

export interface DailyQuotaCandidate {
  id: string
  meter: DailyQuotaMeter
  used: number
  cap: number
  cost: number
  // The CALIBRATED expected cost of one call, used ONLY by the pacing test. `cost` stays the conservative
  // worst-case bound and keeps governing the hard cap and the caller's reservation, so the real provider
  // ceiling can never be busted. They differ by 3-8x on a token-metered tier: the conservative bound is
  // bytes(system) + bytes(user) + maxOutputTokens + 256 (~11,800 tokens for a 12-item Groq batch) while a
  // measured successful batch is ~1,554-4,000. Gating ADMISSION on the worst case makes a tier ask for 3-8x
  // the headroom it will actually use, which reads to the operator as "Saved for later today" on a provider
  // that has allowance in hand. Omitted => `cost`, i.e. byte-for-byte the previous behaviour.
  paceCost?: number
  resetTimeZone?: string
  floorFraction?: number
  priority?: number
}

export interface DailyQuotaAdmission {
  hardCapFit: boolean
  pacedFit: boolean
  released: number
  remaining: number
  deficit: number
  normalizedDeficit: number
  dayFraction: number
}

/** Pure admission/read model for one finite allowance. At least one complete call is released whenever
 * it can fit under the hard cap; otherwise tiny request pools and conservative token reservations can be
 * stranded until late in the day by fractional pacing. Quiet-time allowance carries forward because
 * `released` is cumulative, never a use-it-or-lose-it interval bucket. */
export function dailyQuotaAdmission(candidate: DailyQuotaCandidate, now = Date.now()): DailyQuotaAdmission {
  const cap = Number.isFinite(candidate.cap) ? Math.max(0, candidate.cap) : 0
  const used = Number.isFinite(candidate.used) ? Math.max(0, candidate.used) : 0
  const cost = Number.isFinite(candidate.cost) ? Math.max(0, candidate.cost) : 0
  const fraction = dayFraction(now, candidate.resetTimeZone)
  const floor = Math.max(0, Math.min(1, Number(candidate.floorFraction) || 0))
  // the calibrated pacing cost, clamped so it can never be LARGER than the conservative bound (that would
  // make pacing stricter than the hard cap, the opposite of the point) nor zero on a positive-cost candidate
  const paceRaw = Number.isFinite(candidate.paceCost) ? Math.max(0, candidate.paceCost as number) : cost
  const paceCost = cost > 0 ? Math.min(cost, paceRaw > 0 ? paceRaw : cost) : cost
  const hardCapFit = cost > 0 && used + cost <= cap
  const rawRelease = cap * Math.max(fraction, floor)
  // A call is indivisible. Rounding the cumulative frontier DOWN (or leaving it fractional) strands the
  // final request until the reset instant, when the ledger rolls over and that allowance disappears.
  // Round up by one complete call instead: this leads the ideal line by at most one call, never exceeds
  // the hard cap, and makes the final safe unit usable before reset rather than after it.
  // Deliberately still aligned on the CONSERVATIVE cost, not on paceCost. Coarser rounding leads the ideal
  // line by up to one full call, which is FAVOURABLE — re-aligning on the smaller paceCost would move the
  // frontier down and admit LATER, the opposite of the intent. (Worked example on a 500k cap at mid-day:
  // ceil(250,000/11,797)*11,797 = 259,534, versus ceil(250,000/1,700)*1,700 = 251,600 — 7,934 tokens lower.)
  // What actually unblocks a stranded tier is testing admission against the calibrated cost below.
  const callAlignedRelease = cost > 0 ? Math.ceil(rawRelease / cost) * cost : rawRelease
  const released = Math.min(cap, Math.max(hardCapFit ? cost : 0, callAlignedRelease))
  const deficit = Math.max(0, released - used)
  return {
    hardCapFit,
    pacedFit: hardCapFit && used + paceCost <= released + Number.EPSILON * Math.max(1, released),
    released,
    remaining: Math.max(0, cap - used),
    deficit,
    normalizedDeficit: cap > 0 ? deficit / cap : 0,
    dayFraction: fraction,
  }
}

/** Pick the usable tier furthest behind its clock-released target. Config order is only a quality
 * tiebreak now, not a starvation policy. The function returns the original object so callers can attach
 * provider-specific state without parallel lookup maps. */
export function selectDailyQuotaCandidate<T extends DailyQuotaCandidate>(candidates: readonly T[], now = Date.now()): T | null {
  let best: { candidate: T; state: DailyQuotaAdmission; index: number } | null = null
  for (let index = 0; index < candidates.length; index++) {
    const candidate = candidates[index]
    const state = dailyQuotaAdmission(candidate, now)
    if (!state.pacedFit) continue
    if (!best) { best = { candidate, state, index }; continue }
    const deficitDelta = state.normalizedDeficit - best.state.normalizedDeficit
    const priority = Number.isFinite(candidate.priority) ? Number(candidate.priority) : index
    const bestPriority = Number.isFinite(best.candidate.priority) ? Number(best.candidate.priority) : best.index
    if (
      deficitDelta > 1e-12 ||
      (Math.abs(deficitDelta) <= 1e-12 && (
        priority < bestPriority ||
        (priority === bestPriority && (index < best.index || (index === best.index && candidate.id < best.candidate.id)))
      ))
    ) best = { candidate, state, index }
  }
  return best?.candidate || null
}

// Daily-budget PACER config. The hard caps (canSpend) stop us BUSTING the day's limit; the pacer stops
// us SPENDING IT ALL AT ONCE. targetTokens is the day's spend goal (usually a few % under the hard cap,
// so a buffer is always held); floorFrac is a small always-available slice that gives a start-of-day
// burst and keeps tiny backlogs clearing when we're exactly on schedule.
export interface PaceCfg { targetTokens: number; floorFrac: number }

/**
 * Cumulative tokens the pacer ALLOWS spent by `now`: the day's target released on a linear schedule
 * across the UTC day, never below a small floor. It is measured against the CLOCK, not against prior
 * spend — so a quiet night carries its unspent allowance forward into the next burst automatically,
 * while a heavy morning can't drain the day (the ceiling only rises as fast as the clock).
 */
export function pacedCeiling(now: number, pace: PaceCfg): number {
  if (!(pace.targetTokens > 0)) return Number.POSITIVE_INFINITY // pacer disabled
  const floor = Math.max(0, Math.min(1, pace.floorFrac))
  return pace.targetTokens * Math.max(dayFraction(now), floor)
}

/**
 * Drain-gate mirror of Budget.pacedCanSpend for callers that only have the on-disk counters (scheduler).
 * True when there is room under BOTH the hard caps AND the pacer's clock-prorated ceiling. Pass `est` (one
 * batch's estimated tokens) to reserve room for at least that batch — then the answer matches what the
 * triage loop's `Budget.pacedCanSpend(est)` will actually allow (tokens + est), instead of over-reporting
 * headroom for a provider one batch short of its ceiling. `est=0` keeps the original at-cap semantics.
 */
export function pacedHasHeadroom(
  tokens: number, requests: number, reqCap: number, tokenCap: number, pace: PaceCfg, now = Date.now(), est = 0,
  paceEst?: number,
): boolean {
  const need = Math.max(0, est)
  if (requests >= reqCap || tokens + need > tokenCap) return false // hard daily backstop (reserve one batch)
  if (need <= 0) return tokens <= pacedCeiling(now, pace)
  if (!(pace.targetTokens > 0)) return true
  return dailyQuotaAdmission({
    id: 'paced-token-budget', meter: 'tokens', used: tokens, cap: pace.targetTokens, cost: need,
    // the calibrated expected cost gates ADMISSION; `need` (the conservative bound) still gates the hard cap
    // above. This mirror MUST stay argument-for-argument identical to Budget.pacedCanSpendState, or the
    // scheduler's drain gate and the triage loop disagree about whether a tier can take a batch.
    ...(Number.isFinite(paceEst as number) ? { paceCost: Math.max(0, paceEst as number) } : {}),
    floorFraction: pace.floorFrac,
  }, now).pacedFit
}

interface PersistedBudgetReservation {
  requests: number
  tokens: number
  createdAt: number
}

const cleanExhaustionReason = (value: unknown): string | undefined => {
  if (typeof value !== 'string') return undefined
  const reason = value.trim().toLowerCase()
  return /^[a-z0-9][a-z0-9_-]{0,79}$/.test(reason) ? reason : undefined
}

interface BudgetState {
  date: string
  requests: number
  tokens: number
  /** Monotonic within one provider day. It makes the persisted ledger self-describing when operators or
   * tests need to prove that a read-modify-write actually advanced instead of overwriting another process. */
  revision?: number
  /** Reservations are durable because the provider request runs outside the ledger lock. Their ids let a
   * later reconciliation replace exactly its own estimate once and make duplicate reconciliation a no-op. */
  reservations?: Record<string, PersistedBudgetReservation>
  /** Legacy rolling-deploy gate. New writers keep it alongside the explicit reason below so an older
   * process sharing this STATE_DIR still stops, but it must never be interpreted as recorded usage. */
  exhausted?: boolean
  /** The provider explicitly reported that its day-scoped allowance is unavailable until reset. This is
   * separate from requests/tokens: those counters remain the calls and tokens the engine actually recorded. */
  providerDayExhausted?: boolean
  /** Optional sanitized reason for an explicit day-scoped close. Never persist a provider body here. */
  exhaustion_reason?: string
}

// Every in-process caller that points at the same ledger shares one snapshot. The adjacent kernel-lock file
// is the cross-PROCESS boundary: a read-only/control-plane server can still serve chat, article, and theme
// requests while another process owns the ingester singleton, so that singleton is not a budget lock.
const sharedBudgetStates = new Map<string, BudgetState>()
// Only reservations created by this process are tracked here. Arbitrary reservations may disappear when
// another process reconciles them, but disappearance of OUR still-active id is ambiguous authority loss:
// accepting that rewritten snapshot could authorize a second call while the first is still in flight.
const activeBudgetReservations = new Map<string, Map<string, string>>()

export interface BudgetReservation {
  readonly id: string
  readonly date: string
  readonly requests: number
  readonly tokens: number
  active: boolean
}

/** Why the latest authoritative reservation returned null. Callers must distinguish a real configured-cap
 * refusal from an authority failure (busy lock, failed persistence, corrupt/rolled-back ledger). The value
 * is latched on that Budget instance until another reservation attempt or a fresh instance. */
export type BudgetReserveFailure = 'allowance_unavailable' | 'authority_unavailable'

const BUDGET_LOCK_WAIT_MS = 5_000

function nonNegative(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? Math.max(0, n) : 0
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function isCanonicalDay(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const ms = Date.parse(`${value}T00:00:00Z`)
  return Number.isFinite(ms) && new Date(ms).toISOString().slice(0, 10) === value
}

function isNonNegativeNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

function isNonNegativeInteger(value: unknown): value is number {
  return isNonNegativeNumber(value) && Number.isSafeInteger(value)
}

function emptyBudgetState(date: string): BudgetState {
  return { date, requests: 0, tokens: 0, revision: 0, reservations: {} }
}

function parseBudgetState(raw: unknown): BudgetState | null {
  if (!isPlainRecord(raw) || !isCanonicalDay(raw.date)
    || !isNonNegativeInteger(raw.requests) || !isNonNegativeNumber(raw.tokens)
    || (raw.revision !== undefined && !isNonNegativeInteger(raw.revision))
    || (raw.exhausted !== undefined && typeof raw.exhausted !== 'boolean')
    || (raw.providerDayExhausted !== undefined && typeof raw.providerDayExhausted !== 'boolean')
    || (raw.exhaustion_reason !== undefined && cleanExhaustionReason(raw.exhaustion_reason) === undefined)
    || (raw.reservations !== undefined && !isPlainRecord(raw.reservations))) return null
  const reservations: Record<string, PersistedBudgetReservation> = {}
  let reservedRequests = 0
  let reservedTokens = 0
  if (raw.reservations) {
    for (const [id, value] of Object.entries(raw.reservations)) {
      if (!id || id.length > 128 || !isPlainRecord(value)
        || !isNonNegativeInteger(value.requests) || !isNonNegativeNumber(value.tokens)
        || !isNonNegativeNumber(value.createdAt)) return null
      reservations[id] = {
        requests: value.requests,
        tokens: value.tokens,
        createdAt: value.createdAt,
      }
      reservedRequests += value.requests
      reservedTokens += value.tokens
    }
  }
  if (!Number.isSafeInteger(reservedRequests) || !Number.isFinite(reservedTokens)
    || reservedRequests > raw.requests || reservedTokens > raw.tokens) return null
  return {
    date: raw.date,
    requests: raw.requests,
    tokens: raw.tokens,
    revision: raw.revision ?? 0,
    reservations,
    ...(raw.exhausted === true ? { exhausted: true } : {}),
    ...(raw.providerDayExhausted === true ? { providerDayExhausted: true } : {}),
    ...(cleanExhaustionReason(raw.exhaustion_reason) ? { exhaustion_reason: cleanExhaustionReason(raw.exhaustion_reason) } : {}),
  }
}

function budgetStateRegressed(current: BudgetState, incoming: BudgetState): boolean {
  const currentRevision = current.revision ?? 0
  const incomingRevision = incoming.revision ?? 0
  if (incomingRevision < currentRevision) return true
  if (current.exhausted === true && incoming.exhausted !== true) return true
  if (current.providerDayExhausted === true && incoming.providerDayExhausted !== true) return true
  const committed = (state: BudgetState): { requests: number; tokens: number } => {
    let reservedRequests = 0
    let reservedTokens = 0
    for (const reservation of Object.values(state.reservations || {})) {
      reservedRequests += reservation.requests
      reservedTokens += reservation.tokens
    }
    return { requests: state.requests - reservedRequests, tokens: state.tokens - reservedTokens }
  }
  const before = committed(current)
  const after = committed(incoming)
  // Gross counters may legitimately fall when a conservative in-flight reservation is replaced with
  // actual use. The committed floor (gross minus every live reservation) cannot fall on the same day.
  return after.requests < before.requests || after.tokens < before.tokens
}

function trackBudgetReservation(file: string, id: string, date: string): void {
  let active = activeBudgetReservations.get(file)
  if (!active) { active = new Map(); activeBudgetReservations.set(file, active) }
  active.set(id, date)
}

function untrackBudgetReservation(file: string, id: string): void {
  const active = activeBudgetReservations.get(file)
  if (!active) return
  active.delete(id)
  if (!active.size) activeBudgetReservations.delete(file)
}

function budgetAuthorityRegressed(file: string, current: BudgetState, incoming: BudgetState): boolean {
  if (budgetStateRegressed(current, incoming)) return true
  const active = activeBudgetReservations.get(file)
  if (!active) return false
  for (const [id, date] of active) {
    if (date === incoming.date && !incoming.reservations?.[id]) return true
  }
  return false
}

export type BudgetLedgerInspection =
  | {
      available: true
      requests: number
      tokens: number
      dayUnavailable: boolean
      providerDayExhausted: boolean
    }
  | { available: false }

/** Read-only view of the same durable authority Budget uses for admission. Only ENOENT and a valid prior-
 * day ledger mean fresh zero. Bad JSON, bad schema, other I/O errors, and a future day are unavailable: a
 * diagnostics/drain reader must not turn damage into invented zero usage and apparent allowance. */
export function inspectBudgetLedger(file: string, expectedDay: string): BudgetLedgerInspection {
  const resolved = path.resolve(file)
  const read = readBudgetFile(resolved)
  const shared = sharedBudgetStates.get(resolved)
  const sharedHasCurrentUse = shared?.date === expectedDay
    && ((shared.revision ?? 0) > 0 || shared.requests > 0 || shared.tokens > 0)
  if (read.status === 'missing') {
    if (sharedHasCurrentUse) return { available: false }
    return { available: true, requests: 0, tokens: 0, dayUnavailable: false, providerDayExhausted: false }
  }
  const parsed = read.status === 'ok' ? parseBudgetState(read.value) : null
  if (!parsed || parsed.date > expectedDay) return { available: false }
  if (parsed.date === expectedDay && shared?.date === expectedDay && budgetAuthorityRegressed(resolved, shared, parsed)) {
    return { available: false }
  }
  if (parsed.date < expectedDay) {
    if (sharedHasCurrentUse) return { available: false }
    return { available: true, requests: 0, tokens: 0, dayUnavailable: false, providerDayExhausted: false }
  }
  return {
    available: true,
    requests: parsed.requests,
    tokens: parsed.tokens,
    dayUnavailable: parsed.providerDayExhausted === true || parsed.exhausted === true,
    providerDayExhausted: parsed.providerDayExhausted === true,
  }
}

function overwriteBudgetState(target: BudgetState, source: BudgetState): void {
  target.date = source.date
  target.requests = source.requests
  target.tokens = source.tokens
  target.revision = source.revision
  target.reservations = source.reservations
  if (source.exhausted === true) target.exhausted = true
  else delete target.exhausted
  if (source.providerDayExhausted === true) target.providerDayExhausted = true
  else delete target.providerDayExhausted
  if (source.exhaustion_reason) target.exhaustion_reason = source.exhaustion_reason
  else delete target.exhaustion_reason
}

type BudgetFileRead =
  | { status: 'missing'; value: null }
  | { status: 'corrupt'; value: null }
  | { status: 'ok'; value: unknown }

function readBudgetFile(file: string): BudgetFileRead {
  let text: string
  try { text = fs.readFileSync(file, 'utf8') }
  catch (error: any) {
    return error?.code === 'ENOENT'
      ? { status: 'missing', value: null }
      : { status: 'corrupt', value: null }
  }
  try { return { status: 'ok', value: JSON.parse(text) } }
  catch { return { status: 'corrupt', value: null } }
}

/** Rename a complete temp file while the ledger lock is held. Unlocked diagnostic reads therefore see
 * either the prior complete revision or the next complete revision, never a partially written JSON file. */
function writeBudgetFile<T>(file: string, state: T): void {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const tmp = `${file}.${process.pid}.${randomUUID()}.tmp`
  try {
    fs.writeFileSync(tmp, JSON.stringify(state), { mode: 0o600 })
    fs.renameSync(tmp, file)
  } finally {
    try { fs.rmSync(tmp, { force: true }) } catch { /* rename already consumed it, or cleanup is best-effort */ }
  }
}

export class Budget {
  private state!: BudgetState
  private ledgerReadable = true
  private reserveFailure: BudgetReserveFailure | null = null
  constructor(private file: string, private reqCap: number, private tokenCap: number, now = Date.now(), private dayTz?: string) {
    this.file = path.resolve(file)
    const today = dayKey(now, dayTz)
    const shared = sharedBudgetStates.get(this.file)
    const read = readBudgetFile(this.file)
    const parsed = read.status === 'ok' ? parseBudgetState(read.value) : null
    this.ledgerReadable = read.status === 'missing' || parsed !== null
    const sharedHasCurrentUsage = shared?.date === today
      && ((shared.revision ?? 0) > 0 || shared.requests > 0 || shared.tokens > 0)
    const authorityRolledBackAfterUse = Boolean(sharedHasCurrentUsage && parsed && parsed.date < today)
    const sameDayAuthorityRollback = Boolean(shared?.date === today && parsed?.date === today && budgetAuthorityRegressed(this.file, shared, parsed))
    const missingAfterUse = Boolean(sharedHasCurrentUsage && read.status === 'missing')
    if ((!this.ledgerReadable || missingAfterUse || authorityRolledBackAfterUse || sameDayAuthorityRollback) && shared?.date === today) {
      // Keep the last in-memory counters for diagnostics, but never let them authorize a mutation while the
      // durable authority is unreadable. Another process may already have spent the remaining allowance.
      this.ledgerReadable = false
      this.state = shared
    } else if (parsed?.date === today) {
      if (shared?.date === today) { this.state = shared; overwriteBudgetState(shared, parsed) }
      else this.installState(parsed)
    } else if ((parsed && parsed.date < today) || read.status === 'missing') {
      this.installState(emptyBudgetState(today))
    } else {
      // A future-dated ledger is not this process's authority. Keep this instance on its requested day but
      // fail closed; each mutation re-reads the future authority and rejects it.
      this.ledgerReadable = false
      this.installState(emptyBudgetState(today))
    }
  }

  static load(stateDir: string, reqCap: number, tokenCap: number, now = Date.now(), fileName = 'groq-budget.json', dayTz?: string): Budget {
    return new Budget(path.join(stateDir, fileName), reqCap, tokenCap, now, dayTz)
  }

  /** A newer provider day replaces this file's shared state object. Any older instance becomes inert so
   *  a late request completion cannot write yesterday's counters over today's already-persisted usage. */
  private ownsCurrentState(): boolean { return sharedBudgetStates.get(this.file) === this.state }

  private installState(next: BudgetState): void {
    const shared = sharedBudgetStates.get(this.file)
    if (shared?.date === next.date) {
      overwriteBudgetState(shared, next)
      this.state = shared
      return
    }
    this.state = next
    sharedBudgetStates.set(this.file, next)
  }

  /** Refresh a soft preflight/getter from the atomically-renamed disk snapshot. Admission still re-reads
   * under the kernel lock, so this unlocked read is only an up-to-date routing hint, never the authority. */
  private refreshCurrentDay(): void {
    if (!this.ownsCurrentState()) return
    const read = readBudgetFile(this.file)
    if (read.status === 'missing') {
      // Missing is fresh-zero authority only before the ledger has ever been created. Once this instance
      // observed/published a current-day file, disappearance is damage and cannot reopen the cap.
      this.ledgerReadable = (this.state.revision ?? 0) === 0 && this.state.requests === 0 && this.state.tokens === 0
      return
    }
    const parsed = read.status === 'ok' ? parseBudgetState(read.value) : null
    if (!parsed) { this.ledgerReadable = false; return }
    if (parsed.date === this.state.date) {
      if (budgetAuthorityRegressed(this.file, this.state, parsed)) { this.ledgerReadable = false; return }
      this.ledgerReadable = true
      this.installState(parsed)
    } else if (parsed.date > this.state.date) {
      this.ledgerReadable = false
    } else {
      // A prior-day file is a legitimate first-day rotation only while this instance still has a pristine
      // zero snapshot. Once today's revision/usage exists, rolling the authority backwards must close it.
      this.ledgerReadable = (this.state.revision ?? 0) === 0
        && this.state.requests === 0 && this.state.tokens === 0
    }
  }

  private withLedgerLock<T>(fn: () => T): T {
    const fd = acquireRetainedFlockSync(`${this.file}.lock`, {
      waitMs: BUDGET_LOCK_WAIT_MS,
      busyMessage: `daily provider budget is busy: ${path.basename(this.file)}`,
    })
    try { return fn() }
    finally { releaseRetainedFlock(fd) }
  }

  private stateForMutation(date: string): BudgetState | null {
    const read = readBudgetFile(this.file)
    if (read.status === 'corrupt') { this.ledgerReadable = false; return null }
    if (read.status === 'missing') {
      const cleanStart = this.state.date === date && (this.state.revision ?? 0) === 0
        && this.state.requests === 0 && this.state.tokens === 0
      this.ledgerReadable = cleanStart
      return cleanStart ? emptyBudgetState(date) : null
    }
    const raw = parseBudgetState(read.value)
    if (!raw) { this.ledgerReadable = false; return null }
    // A stale process must never replace a later provider day. Lexical ordering is chronological for the
    // canonical YYYY-MM-DD keys emitted by dayKey, including provider-local reset zones.
    if (raw.date > date) { this.ledgerReadable = false; return null }
    if (raw.date < date) {
      const cleanStart = this.state.date === date && (this.state.revision ?? 0) === 0
        && this.state.requests === 0 && this.state.tokens === 0
      this.ledgerReadable = cleanStart
      return cleanStart ? emptyBudgetState(date) : null
    }
    if (this.state.date === date && budgetAuthorityRegressed(this.file, this.state, raw)) {
      this.ledgerReadable = false
      return null
    }
    this.ledgerReadable = true
    return raw
  }

  private publishMutation(next: BudgetState): void {
    next.revision = Math.floor(nonNegative(next.revision)) + 1
    writeBudgetFile(this.file, next)
    const shared = sharedBudgetStates.get(this.file)
    if (!shared || shared.date <= next.date) this.installState(next)
  }

  /** Rotate a long-lived Budget at the provider's actual reset boundary before admission. A request can
   * wait behind the shared minute limiter across midnight; reserving against yesterday after that wait
   * would then let a freshly loaded Budget spend the new day a second time. Replacing the shared object
   * also makes any yesterday reservation inert when it eventually reconciles. */
  private rotateDay(now: number): void {
    const today = dayKey(now, this.dayTz)
    if (this.state.date === today) { this.refreshCurrentDay(); return }
    const current = sharedBudgetStates.get(this.file)
    if (current?.date === today) { this.state = current; this.refreshCurrentDay(); return }
    const read = readBudgetFile(this.file)
    const parsed = read.status === 'ok' ? parseBudgetState(read.value) : null
    if (read.status === 'missing' || (parsed && parsed.date < today)) {
      this.ledgerReadable = true
      this.installState(emptyBudgetState(today))
    } else if (parsed?.date === today) {
      this.ledgerReadable = true
      this.installState(parsed)
    } else {
      this.ledgerReadable = false
      this.installState(parsed || emptyBudgetState(today))
    }
  }

  /** Record an explicit provider-day exhaustion signal without forging configured-cap usage. Active
   * reservations still reconcile to their actual usage, but this monotonic marker keeps admission closed. */
  exhaust(reason?: string): void {
    if (!this.ownsCurrentState()) return
    const date = this.state.date
    let published = false
    try {
      this.withLedgerLock(() => {
        const next = this.stateForMutation(date)
        if (!next) return
        next.providerDayExhausted = true
        // Rolling-deploy compatibility: an older process knows only `exhausted`. It will still stop admitting
        // calls, while new diagnostics use providerDayExhausted and keep the real counters visible.
        next.exhausted = true
        const safeReason = cleanExhaustionReason(reason)
        if (safeReason) next.exhaustion_reason = safeReason
        this.publishMutation(next)
        published = true
      })
    } catch { /* handled below */ }
    if (!published) {
      // The provider already said its day is closed. Failing to persist that marker cannot throw away the
      // unscored batch or reopen this process; keep the monotonic stop in memory and fail later admission.
      this.state.providerDayExhausted = true
      this.state.exhausted = true
      const safeReason = cleanExhaustionReason(reason)
      if (safeReason) this.state.exhaustion_reason = safeReason
      this.ledgerReadable = false
      this.reserveFailure = 'authority_unavailable'
    }
  }

  private providerDayUnavailable(state = this.state): boolean {
    return state.providerDayExhausted === true || state.exhausted === true
  }

  private canSpendState(state: BudgetState, estTokens: number, requests = 1): boolean {
    if (this.providerDayUnavailable(state)) return false
    if (state.requests + Math.max(0, requests) > this.reqCap) return false
    if (state.tokens + Math.max(0, estTokens) > this.tokenCap) return false
    return true
  }

  private pacedCanSpendState(state: BudgetState, estTokens: number, pace: PaceCfg, now: number, requests = 1, paceTokens?: number): boolean {
    if (!this.canSpendState(state, estTokens, requests)) return false
    const need = Math.max(0, estTokens)
    if (need <= 0) return state.tokens <= pacedCeiling(now, pace)
    if (!(pace.targetTokens > 0)) return true
    return dailyQuotaAdmission({
      id: 'paced-token-budget', meter: 'tokens', used: state.tokens, cap: pace.targetTokens,
      cost: need,
      // ADMISSION on the calibrated cost, hard cap on the conservative bound (canSpendState above).
      ...(Number.isFinite(paceTokens as number) ? { paceCost: Math.max(0, paceTokens as number) } : {}),
      floorFraction: pace.floorFrac,
    }, now).pacedFit
  }

  /** Headroom for one more call expected to cost ~estTokens. False when either daily cap is reached. */
  canSpend(estTokens: number, requests = 1): boolean {
    if (!this.ownsCurrentState()) return false
    this.refreshCurrentDay()
    return this.ledgerReadable && this.canSpendState(this.state, estTokens, requests)
  }

  /**
   * Headroom under the hard cap AND the daily pacer: spend only while today's running total stays under
   * the clock-prorated ceiling. On a normal-volume day the ceiling outruns demand and this never bites
   * (items triage promptly); on an overload day it meters spend into an even drip so the budget lasts
   * the whole day instead of going dark by noon. `pace.targetTokens <= 0` disables the pacer (falls back
   * to the plain hard-cap canSpend).
   */
  pacedCanSpend(estTokens: number, pace: PaceCfg, now = Date.now(), requests = 1, paceTokens?: number): boolean {
    this.rotateDay(now)
    if (!this.ownsCurrentState() || !this.ledgerReadable) return false
    return this.pacedCanSpendState(this.state, estTokens, pace, now, requests, paceTokens)
  }

  /**
   * Atomically reserve across every process sharing this ledger, then release the lock before network I/O.
   *
   * `paceTokens` is the CALIBRATED cost, forwarded only to the pacer. The hard cap
   * (`canSpendState`) and the amount actually debited both stay on the conservative `estTokens`, so a
   * daily ceiling still cannot be busted. Without it the reservation paced on the worst case while the
   * admission test paced on the real cost, and the two disagreed: admission said yes, the reservation
   * said no, and the batch was dropped with nothing reporting why.
   */
  tryReserve(estTokens: number, pace?: PaceCfg, now = Date.now(), requests = 1, paceTokens?: number): BudgetReservation | null {
    this.reserveFailure = null
    this.rotateDay(now)
    if (!this.ownsCurrentState() || !this.ledgerReadable) {
      this.reserveFailure = 'authority_unavailable'
      return null
    }
    const tokens = Math.max(0, estTokens)
    const requestCount = Math.max(0, requests)
    const date = dayKey(now, this.dayTz)
    try {
      return this.withLedgerLock(() => {
        const next = this.stateForMutation(date)
        if (!next) { this.reserveFailure = 'authority_unavailable'; return null }
        const allowed = pace
          ? this.pacedCanSpendState(next, tokens, pace, now, requestCount, paceTokens)
          : this.canSpendState(next, tokens, requestCount)
        if (!allowed) { this.reserveFailure = 'allowance_unavailable'; this.installState(next); return null }
        const id = randomUUID()
        const reservation: BudgetReservation = { id, date, requests: requestCount, tokens, active: true }
        next.requests += requestCount
        next.tokens += tokens
        ;(next.reservations ||= {})[id] = { requests: requestCount, tokens, createdAt: now }
        this.publishMutation(next)
        trackBudgetReservation(this.file, id, date)
        return reservation
      })
    } catch {
      // Admission must fail closed when the cross-process authority cannot be acquired or persisted.
      this.reserveFailure = 'authority_unavailable'
      return null
    }
  }

  /** Replace a reservation with actual usage, or release it when no provider request was made. */
  reconcile(reservation: BudgetReservation, requests: number, tokens: number): void {
    if (!reservation.active) return
    try {
      this.withLedgerLock(() => {
        const read = readBudgetFile(this.file)
        const raw = read.status === 'ok' ? parseBudgetState(read.value) : null
        // A late completion from yesterday is intentionally inert after the ledger has rolled forward.
        if (!raw || raw.date !== reservation.date) {
          if (!raw) { this.ledgerReadable = false; this.reserveFailure = 'authority_unavailable' }
          return
        }
        const next = raw
        if (this.state.date === reservation.date && budgetAuthorityRegressed(this.file, this.state, next)) {
          this.ledgerReadable = false
          this.reserveFailure = 'authority_unavailable'
          return
        }
        const persisted = next.reservations?.[reservation.id]
        if (!persisted) { reservation.active = false; this.installState(next); return }
        delete next.reservations![reservation.id]
        // A per-day quota response can close admission while another call still owns a reservation. Reconcile
        // the call normally; the independent day marker remains monotonic and keeps admission closed.
        next.requests = Math.max(0, next.requests - persisted.requests + Math.max(0, requests))
        next.tokens = Math.max(0, next.tokens - persisted.tokens + Math.max(0, tokens))
        this.publishMutation(next)
        reservation.active = false
        untrackBudgetReservation(this.file, reservation.id)
      })
    } catch {
      // Keep `active` true and the durable estimate charged. A caller may retry reconciliation safely; if it
      // does not, conservative reserved usage is safer than reopening allowance after an uncertain request.
      this.ledgerReadable = false
      this.reserveFailure = 'authority_unavailable'
    }
  }

  record(requests: number, tokens: number): void {
    if (!this.ownsCurrentState()) return
    const date = this.state.date
    const chargedRequests = Number.isFinite(requests) ? Math.max(0, Math.floor(requests)) : 0
    const chargedTokens = Number.isFinite(tokens) ? Math.max(0, tokens) : 0
    let published = false
    try {
      this.withLedgerLock(() => {
        const next = this.stateForMutation(date)
        if (!next) return
        next.requests += chargedRequests
        next.tokens += chargedTokens
        this.publishMutation(next)
        published = true
      })
    } catch { /* handled below */ }
    if (!published) {
      // Legacy post-call telemetry cannot undo a completed provider response. Do not throw through the caller
      // and lose already-scored work. Retain a conservative process-local tombstone so deleting/replacing the
      // failed durable write cannot make a new Budget instance mistake this for first use.
      this.state.requests += chargedRequests
      this.state.tokens += chargedTokens
      this.state.revision = Math.floor(nonNegative(this.state.revision)) + 1
      this.ledgerReadable = false
      this.reserveFailure = 'authority_unavailable'
    }
  }

  /** Mutations are durable at record/reserve/reconcile/exhaust time. Retained for legacy callers that
   * still finish a cycle with save(); refreshing cannot overwrite a newer process's revision. */
  save(): void {
    this.refreshCurrentDay()
  }

  get requests(): number { this.refreshCurrentDay(); return this.state.requests }
  get tokens(): number { this.refreshCurrentDay(); return this.state.tokens }
  /** Whether the durable ledger can currently authorize decisions. False distinguishes damage/I/O failure
   * from a valid ledger whose configured allowance is genuinely used. */
  get ledgerAvailable(): boolean {
    if (!this.ownsCurrentState()) return false
    this.refreshCurrentDay()
    return this.ownsCurrentState() && this.ledgerReadable
  }
  get lastReserveFailure(): BudgetReserveFailure | null { return this.reserveFailure }
  /** True only for the new, typed provider-day signal. The legacy `exhausted` bit still closes admission,
   * but older builds also used it for generic 4xx failures, so it cannot truthfully support this diagnosis. */
  get providerDayExhausted(): boolean { this.refreshCurrentDay(); return this.ownsCurrentState() && this.state.providerDayExhausted === true }
  get exhaustionReason(): string | undefined {
    this.refreshCurrentDay()
    return this.ownsCurrentState() && this.providerDayUnavailable()
      ? cleanExhaustionReason(this.state.exhaustion_reason)
      : undefined
  }
  get remainingRequests(): number { this.refreshCurrentDay(); return !this.ownsCurrentState() || !this.ledgerReadable || this.providerDayUnavailable() ? 0 : Math.max(0, this.reqCap - this.state.requests) }
  get remainingTokens(): number { this.refreshCurrentDay(); return !this.ownsCurrentState() || !this.ledgerReadable || this.providerDayUnavailable() ? 0 : Math.max(0, this.tokenCap - this.state.tokens) }
}

/** Test hook only — callers use unique state directories, then clear process-shared ledger snapshots. */
export function resetBudgetMemory(): void {
  sharedBudgetStates.clear()
  sharedUsdStates.clear()
  activeBudgetReservations.clear()
  activeUsdReservations.clear()
}

// Cross-cycle PER-PROVIDER cooldown — a third free-tier guardrail, sitting alongside Budget and RateLimiter.
// The in-cycle "stop poking a down provider" flags (runCycle groqDownThisCycle / ov.failed) only live for
// ONE cycle; the scheduler runs many cycles/day, so a sustained outage would still burn one failed probe on
// every cycle — and a 429 / timeout still counts as a request against the daily cap. This marker persists an
// "unhealthy until T" timestamp per provider id in STATE_DIR (`<id>-health.json`) so repeated cycles STOP
// probing a provider that keeps failing (routing to the next provider / deferring) until the window lapses.
// It is armed ONLY on a real failure and cleared on the very next success, so a HEALTHY provider is never
// touched. Shared by EVERY Groq/overflow/Gemini seam (triage, the article-read + auto-heal path, the themes
// namer) so one down provider is skipped everywhere at once, not just in triage.
//
// Two robustness properties matter:
//   - EXPONENTIAL BACKOFF: each consecutive failed probe doubles the window (base, 2×, 4×, … capped at
//     maxMs), so the daily failed-probe count grows only LOGARITHMICALLY with outage length — a sustained
//     outage falls from thousands of probes to a few dozen. That fully protects a large cap (Groq's 13,000
//     — ~50 probes is noise) and drastically cuts waste on the small-cap fallbacks. It does NOT make a
//     TINY-cap provider un-drainable: a >~day-long continuous outage of an overflow provider (~45/day) or a
//     single Gemini model (~20/day) can still APPROACH its cap late in the day — but never EXCEED it
//     (budget.canSpend gates further calls once the cap is reached), and it self-heals at the daily reset,
//     while every other provider (and the primary Groq path) keeps serving.
//   - IN-MEMORY FALLBACK: the marker is mirrored in a process-lifetime map. If the STATE_DIR write fails
//     (e.g. disk full — which correlates with a long outage as backlogs/logs grow), the in-memory marker
//     still gates THIS process, so a persistent write failure can't silently reopen the request-cap burn.
//
// NOTE (per-STATE_DIR scope): markers + budgets are keyed on STATE_DIR. A single-instance ingester lock
// (scheduler.ts) prevents a duplicate ingester in the SAME STATE_DIR. A second engine pointed at a DIFFERENT
// STATE_DIR but the SAME provider account keeps its own markers/budget — bounded ~2× the (already few-dozen)
// per-day probe count, but the two budget mirrors under-count real org spend; avoid running two full
// ingesters against one account.
// `reason` is an OPTIONAL free-form tag naming the failure class that armed the window (e.g. 'auth-expired').
// It exists because the failure NOTE lives only in the cycle that failed: a later cycle sees nothing but the
// marker, so without this it can only say "backing off after an error" — the vague line that sent the
// operator to ask what was actually wrong. Optional and absent-tolerant on purpose: a marker written by an
// older build simply has no reason and reads exactly as it did before.
// `firstFailureAt` is the instant the CURRENT unbroken failure streak began (carried forward on every re-arm,
// cleared with the marker on a success). Without it, "46 consecutive failures" cannot be turned into "dead for
// 42 hours": the backoff pins flat at maxMs from the 5th failure, so the streak counter stops carrying any time
// information exactly when the operator most needs it. `observedMs` is how long the last failing call actually
// took before it failed — the one number that answers "is our timeout too short, or did the provider refuse?".
// All three are optional and absent-tolerant: a marker written by an older build reads exactly as it did before.
interface CooldownState { unhealthyUntil: number; fails: number; accessFails?: number; reason?: string; armedAt?: number; firstFailureAt?: number; observedMs?: number }
const cooldownMem = new Map<string, CooldownState>() // `${stateDir}\0${id}` → state; process-lifetime fallback

function healthFile(id: string): string { return `${id.replace(/[^a-z0-9]+/gi, '-')}-health.json` }
function memKey(stateDir: string, id: string): string { return `${stateDir}\u0000${id}` } // \u0000 (NUL) separator: absent from any path/id, so the key never collides

/** The live cooldown state for a provider: whichever of the on-disk marker and the in-memory fallback is
 *  LATER (disk is the source of truth; the fallback covers a failed write). Absent/unreadable → healthy. */
function readCooldownState(stateDir: string, id: string): CooldownState {
  const mem = cooldownMem.get(memKey(stateDir, id))
  let disk: CooldownState | null = null
  try {
    const s = JSON.parse(fs.readFileSync(path.join(stateDir, healthFile(id)), 'utf8')) as CooldownState
    const until = Number(s?.unhealthyUntil)
    if (Number.isFinite(until) && until > 0) {
      const fails = Number(s?.fails)
      disk = {
        unhealthyUntil: until,
        fails: Number.isFinite(fails) && fails > 0 ? fails : 1,
        ...(Number.isFinite(Number(s?.accessFails)) && Number(s.accessFails) > 0 ? { accessFails: Number(s.accessFails) } : {}),
        ...(typeof s?.reason === 'string' && s.reason ? { reason: s.reason } : {}),
        ...(Number.isFinite(Number(s?.armedAt)) ? { armedAt: Number(s.armedAt) } : {}),
        ...(Number.isFinite(Number(s?.firstFailureAt)) && Number(s.firstFailureAt) > 0 ? { firstFailureAt: Number(s.firstFailureAt) } : {}),
        ...(Number.isFinite(Number(s?.observedMs)) && Number(s.observedMs) >= 0 ? { observedMs: Number(s.observedMs) } : {}),
      }
    }
  } catch {
    // no marker / unreadable → nothing on disk
  }
  if (disk && mem) return disk.unhealthyUntil >= mem.unhealthyUntil ? disk : mem
  return disk || mem || { unhealthyUntil: 0, fails: 0 }
}

/** Epoch ms the provider is considered unhealthy until (0 when there is no live marker). Never throws. */
export function readCooldownUntil(stateDir: string, id = 'groq'): number {
  return readCooldownState(stateDir, id).unhealthyUntil
}

/** True while the provider is still inside its cooldown window — callers skip probing it. */
export function isCoolingDown(stateDir: string, id = 'groq', now = Date.now()): boolean {
  return readCooldownUntil(stateDir, id) > now
}

/** The live cooldown snapshot for a provider — its unhealthy-until epoch (0 = healthy) plus the consecutive
 *  failure count driving the current backoff window. For status/diagnostics readers that need the fail count
 *  `readCooldownUntil` doesn't expose. Never throws. */
export function cooldownInfo(stateDir: string, id = 'groq'): { until: number; fails: number; accessFails?: number; reason?: string; firstFailureAt?: number; observedMs?: number } {
  const s = readCooldownState(stateDir, id)
  return {
    until: s.unhealthyUntil,
    fails: s.fails,
    ...(s.accessFails ? { accessFails: s.accessFails } : {}),
    ...(s.reason ? { reason: s.reason } : {}),
    ...(s.firstFailureAt ? { firstFailureAt: s.firstFailureAt } : {}),
    ...(s.observedMs != null ? { observedMs: s.observedMs } : {}),
  }
}

/** Arm/extend the cooldown on a real failure, with exponential backoff: each consecutive failed probe
 *  doubles the window (baseMs, 2×, 4×, …) capped at maxMs. Persisted to disk AND the in-memory fallback.
 *  `observedMs` is how long the failing call ran before it failed — carried on the marker so a later cycle can
 *  still say "timed out at 30.0s" instead of only "an error". */
export function armCooldown(stateDir: string, now: number, baseMs: number, id = 'groq', maxMs = 3_600_000, reason?: string, observedMs?: number): void {
  if (!(baseMs > 0)) return
  const prior = readCooldownState(stateDir, id)
  const fails = prior.fails + 1 // consecutive failures so far (0 when healthy/cleared) + this one
  // A SEPARATE streak for provider-access rejections. `fails` counts every failure class and drives the
  // backoff window, so reading it as an access streak meant two ordinary timeouts followed by one 403
  // declared the credential dead on the FIRST access rejection. Resetting `fails` on a reason change would
  // fix the count and break the backoff, so the access streak is tracked apart.
  const accessFails = reason === 'provider-access' ? (prior.accessFails ?? 0) + 1 : 0
  const window = Math.min(baseMs * Math.pow(2, fails - 1), Math.max(baseMs, maxMs))
  // Carry the streak's START forward. The backoff window pins flat at maxMs from the 5th failure, so `fails`
  // alone cannot tell the operator whether a provider has been down for an hour or for two days.
  const firstFailureAt = prior.firstFailureAt && prior.fails > 0 ? prior.firstFailureAt : now
  const state: CooldownState = {
    unhealthyUntil: now + window, fails, armedAt: now, firstFailureAt,
    ...(accessFails ? { accessFails } : {}),
    ...(reason ? { reason } : {}),
    ...(Number.isFinite(observedMs as number) && (observedMs as number) >= 0 ? { observedMs: Math.round(observedMs as number) } : {}),
  }
  cooldownMem.set(memKey(stateDir, id), state) // in-memory first — survives a disk-write failure below
  try {
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(path.join(stateDir, healthFile(id)), JSON.stringify(state))
  } catch {
    // disk write failed (e.g. disk full during a long outage) — the in-memory marker still gates this
    // process, so the cooldown holds until restart instead of silently reopening the request-cap burn
  }
}

/** Clear the marker (provider recovered) — resets the backoff counter. No-op when none exists. */
export function clearCooldown(stateDir: string, id = 'groq', attemptStartedAt?: number): void {
  const current = readCooldownState(stateDir, id)
  // A slow success that started before a newer failure is stale evidence. Keep the newer marker; otherwise
  // concurrent workloads can turn a real 429/outage into an immediately re-opened provider and retry storm.
  if (attemptStartedAt != null && current.armedAt != null && current.armedAt >= attemptStartedAt) return
  cooldownMem.delete(memKey(stateDir, id))
  try {
    fs.rmSync(path.join(stateDir, healthFile(id)), { force: true })
  } catch {
    // best-effort — a stale marker with a PAST timestamp already reads as healthy anyway
  }
}

/** Test hook only — clears the process-wide in-memory cooldown fallback between hermetic cases. */
export function resetCooldownMemory(): void { cooldownMem.clear() }

interface PersistedUsdReservation {
  usd: number
  calls: number
  createdAt: number
}

interface UsdState {
  date: string
  /** Includes conservative charges for every in-flight reservation. A process crash therefore leaves
   * uncertain provider work charged instead of silently reopening the operator's hard ceiling. */
  usd: number
  calls: number
  revision?: number
  reservations?: Record<string, PersistedUsdReservation>
  /** Monotonic provider-day stop (terminal key/credit/quota response). Kept separate from cost so an
   * in-flight reconciliation cannot accidentally reopen admission after another caller exhausts it. */
  exhausted?: boolean
}

// Match the request/token ledger's same-process authority. A second UsdBudget instance must not interpret
// an unlinked current-day file as first use after another instance already charged it; the last shared
// snapshot is a conservative tombstone until durable authority becomes readable again.
const sharedUsdStates = new Map<string, UsdState>()
const activeUsdReservations = new Map<string, Map<string, string>>()

function overwriteUsdState(target: UsdState, source: UsdState): void {
  target.date = source.date
  target.usd = source.usd
  target.calls = source.calls
  target.revision = source.revision
  target.reservations = source.reservations
  if (source.exhausted === true) target.exhausted = true
  else delete target.exhausted
}

export interface UsdBudgetReservation {
  readonly id: string
  readonly date: string
  readonly usd: number
  readonly calls: number
  active: boolean
}

function emptyUsdState(date: string): UsdState {
  return { date, usd: 0, calls: 0, revision: 0, reservations: {} }
}

function parseUsdState(raw: unknown): UsdState | null {
  if (!isPlainRecord(raw) || !isCanonicalDay(raw.date)
    || !isNonNegativeNumber(raw.usd) || !isNonNegativeInteger(raw.calls)
    || (raw.revision !== undefined && !isNonNegativeInteger(raw.revision))
    || (raw.exhausted !== undefined && typeof raw.exhausted !== 'boolean')
    || (raw.reservations !== undefined && !isPlainRecord(raw.reservations))) return null
  const reservations: Record<string, PersistedUsdReservation> = {}
  let reservedCalls = 0
  let reservedUsdUnits = 0n
  if (raw.reservations) {
    for (const [id, value] of Object.entries(raw.reservations)) {
      if (!id || id.length > 128 || !isPlainRecord(value)
        || !isNonNegativeNumber(value.usd) || !isNonNegativeInteger(value.calls)
        || !isNonNegativeNumber(value.createdAt)) return null
      reservations[id] = {
        usd: value.usd,
        calls: value.calls,
        createdAt: value.createdAt,
      }
      reservedCalls += value.calls
      reservedUsdUnits += fixedUsdUnits(value.usd, true) ?? 0n
    }
  }
  const totalUsdUnits = fixedUsdUnits(raw.usd, true)
  if (!Number.isSafeInteger(reservedCalls) || totalUsdUnits === null
    || reservedCalls > raw.calls || reservedUsdUnits > totalUsdUnits) return null
  return {
    date: raw.date,
    usd: raw.usd,
    calls: raw.calls,
    revision: raw.revision ?? 0,
    reservations,
    ...(raw.exhausted === true ? { exhausted: true } : {}),
  }
}

function usdStateRegressed(current: UsdState, incoming: UsdState): boolean {
  const currentRevision = current.revision ?? 0
  const incomingRevision = incoming.revision ?? 0
  if (incomingRevision < currentRevision) return true
  if (current.exhausted === true && incoming.exhausted !== true) return true
  const committed = (state: UsdState): { usd: bigint; calls: number } => {
    let reservedUsd = 0n
    let reservedCalls = 0
    for (const reservation of Object.values(state.reservations || {})) {
      reservedUsd += fixedUsdUnits(reservation.usd, true) ?? 0n
      reservedCalls += reservation.calls
    }
    return {
      usd: (fixedUsdUnits(state.usd, true) ?? 0n) - reservedUsd,
      calls: state.calls - reservedCalls,
    }
  }
  const before = committed(current)
  const after = committed(incoming)
  return after.usd < before.usd || after.calls < before.calls
}

function trackUsdReservation(file: string, id: string, date: string): void {
  let active = activeUsdReservations.get(file)
  if (!active) { active = new Map(); activeUsdReservations.set(file, active) }
  active.set(id, date)
}

function untrackUsdReservation(file: string, id: string): void {
  const active = activeUsdReservations.get(file)
  if (!active) return
  active.delete(id)
  if (!active.size) activeUsdReservations.delete(file)
}

function usdAuthorityRegressed(file: string, current: UsdState, incoming: UsdState): boolean {
  if (usdStateRegressed(current, incoming)) return true
  const active = activeUsdReservations.get(file)
  if (!active) return false
  for (const [id, date] of active) {
    if (date === incoming.date && !incoming.reservations?.[id]) return true
  }
  return false
}

export type UsdLedgerInspection =
  | { available: true; usd: number; calls: number }
  | { available: false }

/** Read-only view of the same durable authority UsdBudget uses for admission. Only ENOENT and a valid
 * prior-day ledger are fresh zero; malformed, unreadable, or future-dated authority is unavailable. */
export function inspectUsdLedger(file: string, expectedDay: string): UsdLedgerInspection {
  const resolved = path.resolve(file)
  const read = readBudgetFile(resolved)
  const shared = sharedUsdStates.get(resolved)
  const sharedHasCurrentUse = shared?.date === expectedDay
    && ((shared.revision ?? 0) > 0 || shared.usd > 0 || shared.calls > 0)
  if (read.status === 'missing') return sharedHasCurrentUse ? { available: false } : { available: true, usd: 0, calls: 0 }
  const parsed = read.status === 'ok' ? parseUsdState(read.value) : null
  if (!parsed || parsed.date > expectedDay) return { available: false }
  if (parsed.date === expectedDay && shared?.date === expectedDay && usdAuthorityRegressed(resolved, shared, parsed)) {
    return { available: false }
  }
  if (parsed.date < expectedDay && sharedHasCurrentUse) return { available: false }
  return parsed.date === expectedDay
    ? { available: true, usd: parsed.usd, calls: parsed.calls }
    : { available: true, usd: 0, calls: 0 }
}

/**
 * A daily DOLLAR ledger — the guardrail for the paid/subscription last-resort tier, whose cost is reported
 * per call (the `claude` CLI's total_cost_usd, or an API usage×price calc) rather than in tokens. The Budget
 * class above meters requests+tokens; this meters spend, which is the unit the operator actually reasons in
 * ("score the overflow, but stop at $5/day and defer the rest").
 *
 * On the SUBSCRIPTION path no card is charged (the plan is flat-fee) — there the reported cost is a proxy
 * for how much of the shared plan quota this tier has drawn, so the same ceiling doubles as the governor
 * that stops news triage starving the research runs. Persisted in STATE_DIR, keyed on the day, so a server
 * restart cannot silently reset the counter and overspend.
 */
export class UsdBudget {
  private state!: UsdState
  private ledgerReadable = true
  private reserveFailure: BudgetReserveFailure | null = null
  constructor(private file: string, private capUsd: number, now = Date.now(), private dayTz?: string) {
    this.file = path.resolve(file)
    const date = dayKey(now, dayTz)
    const shared = sharedUsdStates.get(this.file)
    const read = readBudgetFile(this.file)
    const parsed = read.status === 'ok' ? parseUsdState(read.value) : null
    this.ledgerReadable = read.status === 'missing' || parsed !== null
    const sharedHasCurrentUsage = shared?.date === date
      && ((shared.revision ?? 0) > 0 || shared.usd > 0 || shared.calls > 0)
    const missingAfterUse = Boolean(sharedHasCurrentUsage && read.status === 'missing')
    const authorityRolledBackAfterUse = Boolean(sharedHasCurrentUsage && parsed && parsed.date < date)
    const sameDayAuthorityRollback = Boolean(shared?.date === date && parsed?.date === date && usdAuthorityRegressed(this.file, shared, parsed))
    if ((!this.ledgerReadable || missingAfterUse || authorityRolledBackAfterUse || sameDayAuthorityRollback) && shared?.date === date) {
      this.ledgerReadable = false
      this.state = shared
    } else if (parsed?.date === date) {
      if (shared?.date === date) { this.state = shared; overwriteUsdState(shared, parsed) }
      else this.installState(parsed)
    } else if (read.status === 'missing' || (parsed && parsed.date < date)) {
      this.installState(emptyUsdState(date))
    } else {
      this.ledgerReadable = false
      this.installState(emptyUsdState(date))
    }
  }

  static load(stateDir: string, capUsd: number, now = Date.now(), fileName = 'anthropic-triage-budget.json', dayTz?: string): UsdBudget {
    return new UsdBudget(path.join(stateDir, fileName), capUsd, now, dayTz)
  }

  private ownsCurrentState(): boolean { return sharedUsdStates.get(this.file) === this.state }

  private installState(next: UsdState): void {
    const shared = sharedUsdStates.get(this.file)
    if (shared?.date === next.date) {
      overwriteUsdState(shared, next)
      this.state = shared
      return
    }
    this.state = next
    sharedUsdStates.set(this.file, next)
  }

  private withLedgerLock<T>(fn: () => T): T {
    const fd = acquireRetainedFlockSync(`${this.file}.lock`, {
      waitMs: BUDGET_LOCK_WAIT_MS,
      busyMessage: `daily USD provider budget is busy: ${path.basename(this.file)}`,
    })
    try { return fn() }
    finally { releaseRetainedFlock(fd) }
  }

  private refreshCurrentDay(): void {
    if (!this.ownsCurrentState()) return
    const read = readBudgetFile(this.file)
    if (read.status === 'missing') {
      this.ledgerReadable = (this.state.revision ?? 0) === 0 && this.state.usd === 0 && this.state.calls === 0
      return
    }
    const parsed = read.status === 'ok' ? parseUsdState(read.value) : null
    if (!parsed) { this.ledgerReadable = false; return }
    if (parsed.date === this.state.date) {
      if (usdAuthorityRegressed(this.file, this.state, parsed)) { this.ledgerReadable = false; return }
      this.ledgerReadable = true
      this.installState(parsed)
    }
    else if (parsed.date > this.state.date) { this.ledgerReadable = false }
    else {
      this.ledgerReadable = (this.state.revision ?? 0) === 0
        && this.state.usd === 0 && this.state.calls === 0
    }
  }

  private rotateDay(now: number): void {
    const date = dayKey(now, this.dayTz)
    if (date === this.state.date) { this.refreshCurrentDay(); return }
    const current = sharedUsdStates.get(this.file)
    if (current?.date === date) { this.state = current; this.refreshCurrentDay(); return }
    const read = readBudgetFile(this.file)
    const parsed = read.status === 'ok' ? parseUsdState(read.value) : null
    if (read.status === 'missing' || (parsed && parsed.date < date)) {
      this.ledgerReadable = true
      this.installState(emptyUsdState(date))
    } else if (parsed?.date === date) {
      this.ledgerReadable = true
      this.installState(parsed)
    } else {
      this.ledgerReadable = false
      this.installState(parsed || emptyUsdState(date))
    }
  }

  private stateForMutation(date: string): UsdState | null {
    const read = readBudgetFile(this.file)
    if (read.status === 'corrupt') { this.ledgerReadable = false; return null }
    if (read.status === 'missing') {
      const cleanStart = this.state.date === date && (this.state.revision ?? 0) === 0
        && this.state.usd === 0 && this.state.calls === 0
      this.ledgerReadable = cleanStart
      return cleanStart ? emptyUsdState(date) : null
    }
    const raw = parseUsdState(read.value)
    if (!raw || raw.date > date) { this.ledgerReadable = false; return null }
    if (raw.date < date) {
      const cleanStart = this.state.date === date && (this.state.revision ?? 0) === 0
        && this.state.usd === 0 && this.state.calls === 0
      this.ledgerReadable = cleanStart
      return cleanStart ? emptyUsdState(date) : null
    }
    if (this.state.date === date && usdAuthorityRegressed(this.file, this.state, raw)) {
      this.ledgerReadable = false
      return null
    }
    this.ledgerReadable = true
    return raw
  }

  private publishMutation(next: UsdState): void {
    next.usd = normalizedUsdDebit(next.usd)
    next.revision = Math.floor(nonNegative(next.revision)) + 1
    writeBudgetFile(this.file, next)
    const shared = sharedUsdStates.get(this.file)
    if (!shared || shared.date <= next.date) this.installState(next)
  }

  private canSpendState(state: UsdState, estUsd = 0): boolean {
    const estimate = Math.max(0, Number(estUsd) || 0)
    if (state.exhausted === true) return false
    return usdAmountFits(state.usd, estimate, this.capUsd)
  }

  /** Room for one more call expected to cost ~estUsd. False once the day's ceiling is reached. NB the
   *  `>=` guard is load-bearing: with the default estUsd=0 a plain `usd + est <= cap` would still answer
   *  TRUE at exactly the ceiling, letting one extra call through every cycle after the budget was spent. */
  canSpend(estUsd = 0): boolean {
    if (!this.ownsCurrentState()) return false
    this.refreshCurrentDay()
    return this.ownsCurrentState() && this.ledgerReadable && this.canSpendState(this.state, estUsd)
  }

  /** Atomically reserve the worst-case charge, then release the kernel lock before provider I/O. The
   * durable estimate deliberately survives a crash: after an uncertain request, reopening the allowance
   * would be less safe than conservatively keeping it charged. */
  tryReserve(estUsd: number, now = Date.now(), calls = 1): UsdBudgetReservation | null {
    this.reserveFailure = null
    this.rotateDay(now)
    if (!this.ownsCurrentState() || !this.ledgerReadable) {
      this.reserveFailure = 'authority_unavailable'
      return null
    }
    const usd = normalizedUsdDebit(Math.max(0, Number(estUsd) || 0))
    const callCount = Math.max(0, Math.floor(Number(calls) || 0))
    // A zero/unknown upper bound cannot enforce a dollar ceiling. Legacy callers may still use canSpend(0),
    // but authoritative pre-call admission fails closed until a finite positive bound is configured.
    if (!(usd > 0) || !(this.capUsd > 0)) {
      this.reserveFailure = 'allowance_unavailable'
      return null
    }
    const date = dayKey(now, this.dayTz)
    try {
      return this.withLedgerLock(() => {
        const next = this.stateForMutation(date)
        if (!next) {
          this.reserveFailure = 'authority_unavailable'
          return null
        }
        if (!this.canSpendState(next, usd)) {
          this.reserveFailure = 'allowance_unavailable'
          if (next) this.installState(next)
          return null
        }
        const id = randomUUID()
        const reservation: UsdBudgetReservation = { id, date, usd, calls: callCount, active: true }
        next.usd = addUsdDebits(next.usd, usd)
        next.calls += callCount
        ;(next.reservations ||= {})[id] = { usd, calls: callCount, createdAt: now }
        this.publishMutation(next)
        trackUsdReservation(this.file, id, date)
        return reservation
      })
    } catch {
      // Lock or persistence failure must never turn into permission to start paid provider I/O.
      this.reserveFailure = 'authority_unavailable'
      return null
    }
  }

  /** Replace this request's conservative charge with the provider-reported actual. Passing calls=0 also
   * releases an admission that was cancelled before provider I/O. Duplicate/late reconciliation is inert. */
  reconcile(reservation: UsdBudgetReservation, actualUsd: number, calls = 1): void {
    if (!reservation.active) return
    try {
      this.withLedgerLock(() => {
        const read = readBudgetFile(this.file)
        const raw = read.status === 'ok' ? parseUsdState(read.value) : null
        if (!raw || raw.date !== reservation.date) {
          if (!raw) { this.ledgerReadable = false; this.reserveFailure = 'authority_unavailable' }
          return
        }
        const next = raw
        if (this.state.date === reservation.date && usdAuthorityRegressed(this.file, this.state, next)) {
          this.ledgerReadable = false
          this.reserveFailure = 'authority_unavailable'
          return
        }
        const persisted = next.reservations?.[reservation.id]
        if (!persisted) { reservation.active = false; this.installState(next); return }
        delete next.reservations![reservation.id]
        next.usd = reconcileUsdDebit(next.usd, persisted.usd, Math.max(0, Number(actualUsd) || 0))
        if (next.exhausted === true) next.usd = Math.max(next.usd, this.capUsd)
        next.calls = Math.max(0, next.calls - persisted.calls + Math.max(0, Math.floor(Number(calls) || 0)))
        this.publishMutation(next)
        reservation.active = false
        untrackUsdReservation(this.file, reservation.id)
      })
    } catch {
      // Keep the durable estimate charged and the handle active so reconciliation can be retried safely.
      this.ledgerReadable = false
      this.reserveFailure = 'authority_unavailable'
    }
  }

  /** Mark the day's ceiling as reached — e.g. a terminal auth/quota error that won't recover today. */
  exhaust(): void {
    if (!this.ownsCurrentState()) return
    const date = this.state.date
    let published = false
    try {
      this.withLedgerLock(() => {
        const next = this.stateForMutation(date)
        if (!next) return
        next.exhausted = true
        next.usd = Math.max(next.usd, this.capUsd)
        this.publishMutation(next)
        published = true
      })
    } catch { /* handled below */ }
    if (!published) {
      // Preserve fail-closed behavior in this process even if the durable ledger is temporarily busy.
      this.state.usd = Math.max(this.state.usd, this.capUsd)
      this.state.exhausted = true
      this.ledgerReadable = false
      this.reserveFailure = 'authority_unavailable'
    }
  }

  /** Dollars left before today's ceiling (0 once spent). The single pre-batch `canSpend()` gate lets one
   *  call through near the ceiling by design; passing this into an adapter that self-retries lets it stop
   *  billing a SECOND attempt once the first already consumed the remaining allowance, so the retry can't
   *  add a second soft-cap overshoot past the operator's daily governor (Codex review, PR #316). */
  remaining(): number {
    this.refreshCurrentDay()
    return this.ownsCurrentState() && this.ledgerReadable ? Math.max(0, this.capUsd - this.state.usd) : 0
  }

  record(usd: number): void {
    if (!this.ownsCurrentState()) return
    const date = this.state.date
    const chargedUsd = normalizedUsdDebit(Math.max(0, Number(usd) || 0))
    let published = false
    try {
      this.withLedgerLock(() => {
        const next = this.stateForMutation(date)
        if (!next) return
        next.usd = addUsdDebits(next.usd, chargedUsd)
        next.calls += 1
        this.publishMutation(next)
        published = true
      })
    } catch { /* handled below */ }
    if (!published) {
      // Legacy post-call accounting cannot undo provider I/O; retain the amount in memory for this process.
      this.state.usd = addUsdDebits(this.state.usd, chargedUsd)
      this.state.calls += 1
      this.state.revision = Math.floor(nonNegative(this.state.revision)) + 1
      this.ledgerReadable = false
      this.reserveFailure = 'authority_unavailable'
    }
  }

  /** Mutations are durable immediately. Retained as a refresh-only compatibility shim for old callers. */
  save(): void {
    this.refreshCurrentDay()
  }

  get usd(): number { this.refreshCurrentDay(); return this.state.usd }
  get calls(): number { this.refreshCurrentDay(); return this.state.calls }
  /** False distinguishes an unreadable/missing-after-use authority from a valid ledger at its $ ceiling. */
  get ledgerAvailable(): boolean {
    if (!this.ownsCurrentState()) return false
    this.refreshCurrentDay()
    return this.ownsCurrentState() && this.ledgerReadable
  }
  get lastReserveFailure(): BudgetReserveFailure | null { return this.reserveFailure }
}

// What Groq tells us about the live rate-limit state, parsed from the response headers (groq.ts).
export interface RateInfo {
  tpmLimit?: number // x-ratelimit-limit-tokens — the per-MINUTE token ceiling (the binding free-tier limit)
  tpmRemaining?: number // x-ratelimit-remaining-tokens
  tpmResetMs?: number // x-ratelimit-reset-tokens, in ms
  rpdRemaining?: number // x-ratelimit-remaining-requests — DAILY requests left
  retryAfterMs?: number // retry-after on a 429
}

/** Keep live RPM/TPM observations while preventing a workload-scoped Retry-After from becoming a hidden
 * provider-wide hold inside a shared RateLimiter. Callers decide scope from the typed HTTP/failure class;
 * the limiter should learn the retry clock only when that class is provider-wide. */
export function rateInfoForLimiter(rate: RateInfo | undefined, providerWide: boolean): RateInfo | undefined {
  if (!rate || providerWide || rate.retryAfterMs == null) return rate
  const { retryAfterMs: _scopedRetry, ...sharedRate } = rate
  return sharedRate
}

/**
 * Adaptive pacer. Two controls, both active:
 *   - a minimum gap between calls (requests/min), and
 *   - a sliding 60-second TOKEN window capped at the per-minute ceiling (the limit that actually bites).
 * The ceiling LEARNS from Groq's response headers (learn()), so it tracks the real account limit and a
 * tier upgrade is picked up automatically. On a 429 / near-empty minute it backs off until reset. The
 * wait loop is bounded so an injected no-op clock (tests) can never hang it.
 */
export class RateLimiter {
  private last = 0
  private minGapMs: number
  private tpm: number
  private window: { t: number; tokens: number }[] = []
  private retryUntil = 0
  // `acquire` may be called concurrently by title triage, article repair, Themes, Ideas, and interactive
  // reads. Serialize the admission calculation itself: without this gate, two callers observe the same
  // `last`/token window, sleep for the same gap, and both reserve the same slot when they wake. Apart from
  // bursting the provider's RPM, their simultaneous failures each arm the breaker and can inflate one
  // incident into the maximum retry hold.
  private acquireTail: Promise<void> = Promise.resolve()
  constructor(rpm: number, tpm = 0) {
    this.minGapMs = rpm > 0 ? Math.ceil(60_000 / rpm) : 0
    this.tpm = tpm > 0 ? tpm : 0
  }

  private prune(now: number): void {
    const cut = now - 60_000
    while (this.window.length && this.window[0].t < cut) this.window.shift()
  }
  private spent60(now: number): number {
    this.prune(now)
    return this.window.reduce((s, w) => s + w.tokens, 0)
  }

  /**
   * Block until both the request gap AND the per-minute token window have room for ~estTokens, then
   * reserve the slot. Resolves `true` once acquired.
   *
   * With `maxWaitMs` set, it gives up and resolves `false` the moment the NEXT required wait would push
   * past that budget — without sleeping it out. This is the lever a USER-FACING caller pulls: when the
   * background ingester has the per-minute Groq window saturated, the on-demand article read skips Groq
   * in milliseconds and falls through to the next provider, instead of blocking the HTTP response for up
   * to two minutes. Without `maxWaitMs` (the ingester) the wait is unbounded exactly as before, and the
   * resolved value is simply ignored — so every existing caller is byte-for-byte unaffected.
   */
  async acquire(
    estTokens = 0,
    sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
    now = () => Date.now(),
    maxWaitMs?: number,
    signal?: AbortSignal,
  ): Promise<boolean> {
    const waitStartedAt = Date.now()
    const deadline = maxWaitMs != null && maxWaitMs >= 0 ? now() + maxWaitMs : Number.POSITIVE_INFINITY
    const prior = this.acquireTail
    let release!: () => void
    this.acquireTail = new Promise<void>((resolve) => { release = resolve })
    const finiteWait = maxWaitMs != null && maxWaitMs >= 0
    const turn = await new Promise<boolean>((resolve) => {
      let settled = false
      let timer: ReturnType<typeof setTimeout> | undefined
      const finish = (value: boolean) => {
        if (settled) return
        settled = true
        if (timer) clearTimeout(timer)
        signal?.removeEventListener('abort', onAbort)
        resolve(value)
      }
      const onAbort = () => finish(false)
      if (finiteWait) timer = setTimeout(() => finish(false), Math.max(0, maxWaitMs!))
      if (signal) {
        signal.addEventListener('abort', onAbort, { once: true })
        if (signal.aborted) finish(false)
      }
      prior.then(() => finish(true), () => finish(true))
    })
    if (!turn) {
      // Preserve FIFO serialization even though this caller has given up: later callers remain behind the
      // predecessor, then pass straight through this cancelled queue node without reserving a slot.
      void prior.then(release, release)
      return false
    }
    const waitOrAbort = async (ms: number): Promise<boolean> => {
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
        if (signal.aborted) finish(false)
        void sleep(ms).then(() => finish(true), (error) => finish(false, error))
      })
    }
    try {
      if (signal?.aborted) return false
      const remainingWallWait = () => finiteWait ? Math.max(0, maxWaitMs! - (Date.now() - waitStartedAt)) : Number.POSITIVE_INFINITY
    // request spacing
    const gap = this.last + this.minGapMs - now()
    if (gap > 0) {
      if (now() + gap > deadline || gap > remainingWallWait()) return false // can't even satisfy request spacing within the budget
      if (!await waitOrAbort(gap)) return false
    }
    // Retry-After applies even to request-gated providers whose TPM is deliberately zero. The old gate
    // lived inside the token-window branch, so Mistral/OpenRouter/NVIDIA learned a provider reset and then
    // ignored it, falling back to the blunt 5→60 minute circuit breaker instead.
    for (let i = 0; i < 600; i++) {
      const t = now()
      if (t >= this.retryUntil) break
      const wait = Math.max(200, this.retryUntil - t)
      if (t + wait > deadline || wait > remainingWallWait()) return false
      if (!await waitOrAbort(wait)) return false
      if (i === 599 && now() < this.retryUntil) return false
    }
    // token-per-minute pacing (bounded loop → never hangs on a frozen test clock)
    if (this.tpm > 0 && estTokens > 0) {
      const cost = Math.min(estTokens, this.tpm) // a single est larger than the whole minute can't deadlock
      for (let i = 0; i < 600; i++) {
        const t = now()
        if (this.spent60(t) + cost <= this.tpm) break
        const oldest = this.window.length ? this.window[0].t + 60_000 - t : 0
        const wait = Math.max(200, Math.max(0, oldest) || 250)
        if (t + wait > deadline || wait > remainingWallWait()) return false // the next wait would blow the budget → let the caller move on
        if (!await waitOrAbort(wait)) return false
      }
      this.window.push({ t: now(), tokens: estTokens })
    }
    this.last = now()
    return true
    } finally {
      release()
    }
  }

  /** Update the live ceiling + backoff from a response's rate headers. */
  learn(rate?: RateInfo, now = () => Date.now()): void {
    if (!rate) return
    if (rate.tpmLimit && rate.tpmLimit > 0) this.tpm = rate.tpmLimit
    const at = now()
    if (rate.tpmRemaining != null && this.tpm > 0) {
      // The provider's remaining counter is stronger evidence than our prompt estimate. Reconcile hidden
      // output tokens and spend from other account clients into this sliding window so the very next call
      // cannot be admitted when the provider has already said it will not fit. The synthetic entry expires
      // on the provider's reset clock when supplied; retaining local estimates as well is conservative under
      // concurrent responses and never understates observed spend.
      const observedSpent = Math.max(0, this.tpm - Math.max(0, rate.tpmRemaining))
      const localSpent = this.spent60(at)
      if (observedSpent > localSpent) {
        const resetMs = rate.tpmResetMs && rate.tpmResetMs > 0 ? rate.tpmResetMs : 60_000
        this.window.push({ t: at + resetMs - 60_000, tokens: observedSpent - localSpent })
        this.window.sort((a, b) => a.t - b.t)
      }
    }
    if (rate.retryAfterMs && rate.retryAfterMs > 0) this.retryUntil = Math.max(this.retryUntil, at + rate.retryAfterMs)
    else if (rate.tpmRemaining != null && this.tpm > 0 && rate.tpmRemaining < this.tpm * 0.04 && rate.tpmResetMs) {
      this.retryUntil = Math.max(this.retryUntil, at + rate.tpmResetMs) // this minute is nearly spent — wait for reset
    }
  }
  /** Explicit 429 backoff. */
  note429(retryAfterMs = 2000, now = () => Date.now()): void {
    this.retryUntil = Math.max(this.retryUntil, now() + Math.max(1000, retryAfterMs))
  }
}

// One process-wide pacer shared by the ingester's triage AND the on-demand enrichment read, so the two
// never collectively blow the per-minute ceiling (the cause of the 429 bursts). Created once; both
// callers pass the same config values, so the args only seed the singleton.
let shared: RateLimiter | null = null
export function getSharedLimiter(rpm: number, tpm: number): RateLimiter {
  if (!shared) shared = new RateLimiter(rpm, tpm)
  return shared
}

// A SEPARATE process-wide pacer for the Gemini overflow provider (its own per-minute ceiling, isolated
// from the Groq limiter so the two free pools run their minute windows in parallel — that parallelism
// is the throughput gain). Only triage calls Gemini; enrichment stays on Groq.
let sharedGemini: RateLimiter | null = null
export function getSharedGeminiLimiter(rpm: number, tpm: number): RateLimiter {
  if (!sharedGemini) sharedGemini = new RateLimiter(rpm, tpm)
  return sharedGemini
}

// Process-wide pacer per named OVERFLOW provider (OpenRouter, NVIDIA, …) — one RateLimiter per id, so each
// provider's per-minute window is isolated and they run in parallel. Created once per id (rpm/tpm seed it).
const namedLimiters = new Map<string, RateLimiter>()
export function getNamedLimiter(id: string, rpm: number, tpm: number): RateLimiter {
  let lim = namedLimiters.get(id)
  if (!lim) { lim = new RateLimiter(rpm, tpm); namedLimiters.set(id, lim) }
  return lim
}

// Test hook only — clears the process-wide limiter singletons. In production these are deliberately shared
// across the ingester AND the on-demand article read (so the two never collectively bust the per-minute
// ceiling). In unit tests that run many cases in ONE process with DIFFERENT injected clocks, that sharing
// would otherwise leak a window entry between cases; reset between cases to keep each hermetic.
export function resetSharedLimiters(): void {
  shared = null
  sharedGemini = null
  namedLimiters.clear()
}
