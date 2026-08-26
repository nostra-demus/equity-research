import type { NewsDiagnostics, PipelineFlowRates, TierDiagnostics } from '../../lib/types'

export type PipelineFlowTone = 'ahead' | 'equal' | 'behind' | 'unavailable'

export interface PipelineFlowPresentation {
  tone: PipelineFlowTone
  inflowRate: string
  scanningRate: string
  gapCopy: string
  coverageCopy: string
}

interface LastCycleArrivalSplit {
  newArrivals?: number | null
  fresh: number | null
  carryover: number | null
}

function countCopy(value: number): string {
  return Number.isSafeInteger(value) && value >= 0 ? value.toLocaleString('en-US') : '—'
}

/** Loss totals come from the same saved cycle history as scoring totals. An older server can omit the
 * retirement field, so exact zero is available only when both the history and the field are proven. */
export function dailyLossTotalsAvailable(
  today: NewsDiagnostics['today'],
  backlog: NewsDiagnostics['backlog'],
): boolean {
  return today.totalsLowerBound === false
    && today.durablyCommitted === true
    && backlog.retiredToday != null
}

/** Keep the daily line readable while preserving whether the totals are exact, minimums, or older reports. */
export function todayOutcomeCopy(
  today: NewsDiagnostics['today'],
  gapMarkerUnreadable = false,
): string | null {
  const lowerBound = today.totalsLowerBound === true
  const incomplete = Number.isSafeInteger(today.incompleteCycles) && (today.incompleteCycles ?? 0) > 0
    ? today.incompleteCycles as number
    : 0
  const recorded = Number.isSafeInteger(today.recordedInterruptions) && (today.recordedInterruptions ?? 0) > 0
    ? today.recordedInterruptions as number
    : 0
  const corrupt = Number.isSafeInteger(today.corruptCycleRows) && (today.corruptCycleRows ?? 0) > 0
    ? today.corruptCycleRows as number
    : 0
  const gaps = [
    ...(gapMarkerUnreadable ? ['the record of finished checks cannot be read'] : []),
    ...(today.historyStatus === 'missing' ? ["today's saved check record is missing"] : []),
    ...(today.historyStatus === 'unreadable' || today.historyStatus === 'unavailable'
      ? ["today's saved check record cannot be read"] : []),
    ...(corrupt > 0
      ? [`${corrupt.toLocaleString('en-US')} saved check record${corrupt === 1 ? '' : 's'} cannot be read`]
      : []),
    ...(incomplete > 0
      ? [`${incomplete.toLocaleString('en-US')} check${incomplete === 1 ? '' : 's'} did not finish recording`]
      : []),
    ...(recorded > 0
      ? [`${recorded.toLocaleString('en-US')} interrupted check${recorded === 1 ? '' : 's'} ${recorded === 1 ? 'is' : 'are'} permanently recorded`]
      : []),
  ]
  const gapCopy = gaps.join('; ') || 'one or more checks did not finish recording'

  if (!(Number.isSafeInteger(today.cycles) && today.cycles > 0)) {
    return lowerBound ? `Totals are not available — ${gapCopy}.` : null
  }

  // Older reports can overstate what was saved, so they are labelled "reported" rather than "at least".
  const prefix = today.durablyCommitted === true && lowerBound ? 'at least ' : ''
  const counts = `${prefix}${countCopy(today.read)} checked · ${prefix}${countCopy(today.kept)} kept · ${prefix}${countCopy(today.dropped)} ignored`
  const warning = lowerBound
    ? `${today.durablyCommitted === true ? 'some totals may be missing' : 'older report; totals may be incomplete'}: ${gapCopy}`
    : today.durablyCommitted === true ? '' : 'older report; totals could not be fully checked'
  return [counts, warning].filter(Boolean).join(' · ')
}

/** Prefer the additive complete cause set while retaining the scalar field for an older server. Treat the
 * API payload as unknown at runtime: a damaged persisted object/string must not become an iterable crash or
 * one UI row per character. Unknown string values stay visible through the component's generic copy during
 * a forward rolling deploy. */
export function diagnosticDeferReasons(defer: NewsDiagnostics['defer']): string[] {
  const raw = (defer as { reasons?: unknown }).reasons
  const additive: string[] = []
  if (Array.isArray(raw)) {
    for (const reason of raw) {
      if (typeof reason === 'string' && reason.trim() && !additive.includes(reason)) additive.push(reason)
      // A legitimate summary has only a handful of causes. Bound a malformed/newer payload so it cannot
      // flood the panel with thousands of generic rows during deploy skew.
      if (additive.length === 32) break
    }
  }
  const rawScalar = (defer as { reason?: unknown }).reason
  const scalar = typeof rawScalar === 'string' && rawScalar.trim() ? rawScalar : null
  return additive.length ? additive : scalar ? [scalar] : []
}

/** Never relabel the legacy fetched-path `fresh` count as new inflow. */
export function lastCycleArrivalCopy(cycle: LastCycleArrivalSplit): string | null {
  const arrivals = cycle.newArrivals
  if (typeof arrivals !== 'number' || !Number.isSafeInteger(arrivals) || arrivals < 0) return null
  const parts = [`${arrivals.toLocaleString('en-US')} new`]
  if (typeof cycle.fresh === 'number' && Number.isSafeInteger(cycle.fresh) && cycle.fresh > arrivals) {
    const redelivered = cycle.fresh - arrivals
    parts.push(`${redelivered.toLocaleString('en-US')} waiting from before`)
  }
  if (typeof cycle.carryover === 'number' && Number.isSafeInteger(cycle.carryover) && cycle.carryover >= 0) {
    parts.push(`${cycle.carryover.toLocaleString('en-US')} carried over`)
  }
  return parts.join(' · ')
}

export const PIPELINE_FLOW_SNAPSHOT_MAX_AGE_MS = 60_000
const PIPELINE_FLOW_FUTURE_TOLERANCE_MS = 30_000

/** Keep low-but-real queue rates visible: one item/hour is 0.00028/s, so two decimals would erase it. */
export function fmtPipelineRate(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return '—'
  if (value === 0) return '0.000'
  const digits = value >= 100 ? 0 : value >= 10 ? 1 : value >= 1 ? 2 : value >= 0.1 ? 3 : 4
  return value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

function fmtItemsPerHour(value: number): string {
  return Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 1 })
}

function unavailable(gapCopy: string, coverageCopy: string): PipelineFlowPresentation {
  return { tone: 'unavailable', inflowRate: '—', scanningRate: '—', gapCopy, coverageCopy }
}

function snapshotProblem(flow: PipelineFlowRates, diagnosticsTs: string | undefined, nowMs: number): 'stale' | 'invalid' | null {
  if (!Number.isFinite(nowMs)) return 'invalid'
  const clocks = [Date.parse(flow.to), Date.parse(diagnosticsTs || '')]
  if (clocks.some((clock) => !Number.isFinite(clock) || clock > nowMs + PIPELINE_FLOW_FUTURE_TOLERANCE_MS)) return 'invalid'
  return clocks.some((clock) => nowMs - clock > PIPELINE_FLOW_SNAPSHOT_MAX_AGE_MS) ? 'stale' : null
}

/** Honest operator copy for the fixed trailing-hour queue comparison, including stale/deploy/legacy gaps. */
export function pipelineFlowPresentation(
  flow: PipelineFlowRates | undefined,
  diagnosticsTs: string | undefined,
  nowMs: number,
): PipelineFlowPresentation {
  if (!flow) {
    return unavailable(
      'We can’t tell yet.',
      'The scanner has not sent enough recent information.',
    )
  }

  const freshness = snapshotProblem(flow, diagnosticsTs, nowMs)
  if (freshness === 'stale') {
    return unavailable(
      'The numbers are out of date.',
      'Refresh to check again.',
    )
  }
  if (freshness === 'invalid') {
    return unavailable(
      'The update time looks wrong.',
      'Refresh to check again.',
    )
  }

  if (flow.history?.coverage !== 'complete') {
    if (!flow.history) {
      return unavailable(
        'We can’t tell yet.',
        'This scanner has not sent a complete recent record.',
      )
    }
    const gaps = [
      flow.history.missingDates.length ? 'Some recent records are missing' : '',
      flow.history.unreadableDates.length ? 'Some recent records cannot be read' : '',
      flow.history.corruptCycleRows ? `${flow.history.corruptCycleRows} recent record${flow.history.corruptCycleRows === 1 ? '' : 's'} cannot be read` : '',
      flow.history.incompleteCycles ? `${flow.history.incompleteCycles} recent check${flow.history.incompleteCycles === 1 ? '' : 's'} did not finish recording` : '',
      flow.history.recordedInterruptions ? `${flow.history.recordedInterruptions} interrupted check${flow.history.recordedInterruptions === 1 ? '' : 's'} permanently recorded` : '',
      flow.history.gapMarkerUnreadable ? 'The record of finished checks cannot be read' : '',
      flow.history.interruptionAuditUnreadable ? 'The permanent interrupted-check record cannot be read' : '',
    ].filter(Boolean).join(' · ')
    return unavailable(
      'We can’t tell yet.',
      gaps || 'Some recent information is missing.',
    )
  }

  const inflowPerSecond = flow.inflow?.perSecond
  const scanningPerSecond = flow.scanning?.perSecond
  if ((inflowPerSecond != null && !Number.isFinite(inflowPerSecond))
    || (scanningPerSecond != null && !Number.isFinite(scanningPerSecond))) {
    return unavailable(
      'We can’t tell yet.',
      'The scanner sent a number that cannot be read. Refresh to check again.',
    )
  }
  const inflowRate = fmtPipelineRate(inflowPerSecond)
  const scanningRate = fmtPipelineRate(scanningPerSecond)
  const totalCycles = Math.max(flow.inflow.totalCycles, flow.scanning.totalCycles)
  const rawGap = flow.comparison.scanningMinusInflowItemsPerHour
  const gapStatus = typeof rawGap !== 'number' || !Number.isFinite(rawGap)
    ? 'unavailable'
    : rawGap > 0 ? 'ahead' : rawGap < 0 ? 'behind' : 'equal'
  const comparisonReady = flow.comparison.measured
    && flow.inflow.measured
    && flow.scanning.measured
    && gapStatus !== 'unavailable'
    && flow.comparison.status === gapStatus

  if (!comparisonReady) {
    const noCycles = totalCycles === 0
    return {
      tone: 'unavailable', inflowRate, scanningRate,
      gapCopy: noCycles
        ? `No checks finished in the last ${flow.windowMinutes} minutes.`
        : 'We can’t compare the two numbers yet.',
      coverageCopy: noCycles
        ? 'There is nothing recent to measure yet.'
        : 'Some recent totals are missing.',
    }
  }

  const gap = rawGap as number
  const coverageCopy = `Based on the last ${flow.windowMinutes} minutes (${totalCycles} finished check${totalCycles === 1 ? '' : 's'}).`
  if (gap > 0) {
    return {
      tone: 'ahead', inflowRate, scanningRate,
      gapCopy: `Yes — it checks about ${fmtItemsPerHour(gap)} more item${Math.abs(gap) === 1 ? '' : 's'} each hour than arrive.`,
      coverageCopy,
    }
  }
  if (gap < 0) {
    return {
      tone: 'behind', inflowRate, scanningRate,
      gapCopy: `No — about ${fmtItemsPerHour(gap)} more item${Math.abs(gap) === 1 ? '' : 's'} arrive each hour than it checks.`,
      coverageCopy,
    }
  }
  return {
    tone: 'equal', inflowRate, scanningRate,
    gapCopy: 'Only just — it is keeping up, but there is no spare room if more news arrives.',
    coverageCopy,
  }
}

/** A short countdown for the engine's next retry eligibility. */
export function fmtRetryDuration(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 90) return `${s}s`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}

/** Health-marker reasons are bounded internal tags. Unknown/free-form values are deliberately not echoed:
 * upstream error text can contain account details, and the public UI needs only the actionable class. */
export function retryReasonLabel(reason?: string): string {
  switch (reason) {
    case 'rate_limit':
    case 'rate-limit': return 'the service asked it to wait'
    case 'availability': return 'a service or internet error'
    case 'timeout': return 'a request took too long'
    case 'request': return 'a rejected request'
    case 'contract': return 'an answer it could not use'
    case 'provider-access': return 'a sign-in error'
    // Both hold the whole provider like a 401/403, but neither is a broken credential: 402 is a spent
    // balance, 404 a retired model or endpoint. Naming them apart is what stops an operator rotating a
    // key that was fine.
    case 'provider-credits': return 'the account ran out of credit'
    case 'provider-endpoint': return 'the chosen model is no longer available'
    case 'theme-rate_limit': return 'the Themes service asked it to wait'
    case 'theme-availability': return 'a Themes service or internet error'
    // Persisted markers from older engines used theme-access for 401/402/403/404. Keep its public
    // wording conservative; new engines write the precise credits/endpoint tags below.
    case 'theme-access': return 'a Themes access error'
    case 'theme-credits': return 'the Themes account ran out of credit'
    case 'theme-endpoint': return 'the Themes model is no longer available'
    case 'triage-contract': return 'an answer it could not use'
    case 'triage-request': return 'a rejected request'
    case 'auth-expired': return 'an expired sign-in'
    case 'plan-quota': return 'the plan usage limit'
    default: return 'an error'
  }
}

/** How long a failure streak has been running, in words. Reads the streak's own age, not the backoff window. */
export function fmtFailingFor(ms: number): string {
  const m = Math.max(0, Math.round(ms / 60_000))
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  if (h < 48) return `${h}h`
  return `${Math.floor(h / 24)}d`
}

/** Operator-facing state. “Cooling” is intentionally absent: this timer is created by the engine after a
 * failure and says nothing about the provider account's quota or reset window. */
export function tierStatusCopy(tier: TierDiagnostics, retryRemainingMs: number): string {
  if (!tier.enabled) return tier.disabledReason || 'Off'
  if (tier.spendingAllowed === false) return 'News scanner is not running'
  if (tier.enabled && tier.providerDayExhausted) return "Service says today's limit is used"
  if (tier.quarantined) {
    const variable = tier.keyEnvVar ? ` (${tier.keyEnvVar})` : ''
    switch (tier.quarantineReason) {
      case 'auth': return `API key rejected${variable} — replace it; waiting will not help`
      case 'entitlement': return `Account permission denied${variable} — enable access; waiting will not help`
      case 'billing': return 'Billing or credits are unavailable — repair the provider account'
      case 'model_terminal': return 'Configured model is unavailable — change the model or endpoint'
      case 'request_invalid': return 'Provider endpoint/request configuration is invalid — repair it'
      case 'local_state': return 'Saved provider health state is unreadable — repair the local state file'
      default: return `Provider is quarantined after ${tier.quarantineReason || 'a standing fault'} — waiting will not help`
    }
  }
  // A REJECTED CREDENTIAL OUTRANKS THE COUNTDOWN. This branch sits above the retry timer deliberately: the
  // timer is the truth about when the engine will next probe, but it is the WRONG headline for a fault that
  // probing cannot fix. Shown as a countdown, a dead key reads as patience — which is how one went unnoticed
  // for 46 consecutive failures and two days while the panel repeated "try again in ~43m".
  if (tier.credentialRejected) {
    const forMs = tier.failingForMs
    const since = forMs != null ? `, failing for ${fmtFailingFor(forMs)}` : ''
    const zero = tier.triageScoredBatchesToday === 0 ? ', 0 checked today' : ''
    return `Needs a working key${since}${zero} — waiting won't fix it${tier.keyEnvVar ? `; replace ${tier.keyEnvVar}` : ''}`
  }
  if (retryRemainingMs > 0) {
    // Name the measured duration on a timeout. "timed out at 30.0s" against a 30s ceiling says WE cut the call
    // off and a longer deadline may work; "at 1.2s" says the provider refused and the deadline is irrelevant.
    const at = tier.cooldownReason === 'timeout' && tier.lastFailureMs != null ? ` at ${(tier.lastFailureMs / 1000).toFixed(1)}s` : ''
    return `Paused after ${retryReasonLabel(tier.cooldownReason)}${at} · try again in ~${fmtRetryDuration(retryRemainingMs)}`
  }
  switch (tier.health) {
    case 'healthy': return 'Ready'
    case 'paced': return 'Saved for later today'
    case 'cooling': return 'Ready again'
    case 'budget-spent': return "Today's app limit is used"
    case 'unavailable': return "Can't check today's use"
    case 'disabled': return 'Off'
  }
}

export interface DiagnosticBlockers {
  retryHeld: string[]
  providerDayLimited: string[]
  allowanceUsed: string[]
  needsAttention: string[]
  paced: string[]
  // Kept separate from `needsAttention`, which means "Can't read today's usage" (a local ledger problem).
  // A rejected credential is a different fault with a different fix, and the only one on this list that
  // cannot resolve itself.
  needsCredential: string[]
}

/** Normalize old- and new-engine diagnostics. New engines send disjoint reason groups. With an older
 * engine, derive those groups from tier health instead of reusing its ambiguous `blockingTiers` sentence. */
export function diagnosticBlockers(diag: NewsDiagnostics): DiagnosticBlockers {
  const labels = new Map(diag.tiers.map((tier) => [tier.id, tier.label]))
  const names = (ids: string[]) => [...new Set(ids)].map((id) => labels.get(id) || id)
  return {
    retryHeld: names(diag.defer.retryHeldTiers ?? diag.tiers.filter((t) => t.enabled && t.spendingAllowed !== false && t.health === 'cooling' && !t.providerDayExhausted && t.quarantined !== true).map((t) => t.id)),
    providerDayLimited: names(diag.defer.providerDayExhaustedTiers ?? diag.tiers.filter((t) => t.enabled && t.spendingAllowed !== false && t.providerDayExhausted).map((t) => t.id)),
    allowanceUsed: names(diag.defer.allowanceExhaustedTiers ?? diag.tiers.filter((t) => t.enabled && t.spendingAllowed !== false && t.health === 'budget-spent' && !t.providerDayExhausted).map((t) => t.id)),
    needsAttention: names(diag.defer.unavailableTiers ?? diag.tiers.filter((t) => t.enabled && t.spendingAllowed !== false && t.health === 'unavailable' && t.quarantined !== true).map((t) => t.id)),
    paced: names(diag.defer.pacedTiers ?? diag.tiers.filter((t) => t.enabled && t.spendingAllowed !== false && t.health === 'paced').map((t) => t.id)),
    // Derived from the per-tier flag when an older engine omits the group, so the fault surfaces during a
    // rolling deploy rather than waiting for both halves to land.
    needsCredential: names(diag.defer.needsCredentialTiers ?? diag.tiers.filter((t) => t.enabled && t.spendingAllowed !== false && t.credentialRejected === true).map((t) => t.id)),
  }
}
