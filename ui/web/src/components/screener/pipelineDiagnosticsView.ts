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

/** Daily counters come only from persisted summary rows. A started look with no summary makes every component
 * a lower bound; feed_commit_version separately distinguishes legacy outcomes from durable-feed proof. */
export function todayOutcomeCopy(
  today: NewsDiagnostics['today'],
  gapMarkerUnreadable = false,
): string | null {
  const lowerBound = today.totalsLowerBound === true
  const incomplete = Number.isSafeInteger(today.incompleteCycles) && (today.incompleteCycles ?? 0) > 0
    ? today.incompleteCycles as number
    : 0
  const corrupt = Number.isSafeInteger(today.corruptCycleRows) && (today.corruptCycleRows ?? 0) > 0
    ? today.corruptCycleRows as number
    : 0
  const proofDebts = [
    ...(gapMarkerUnreadable ? ['the cycle-completion safety record is unreadable'] : []),
    ...(today.historyStatus === 'missing' ? ["today's cycle-summary partition is missing"] : []),
    ...(today.historyStatus === 'unreadable' || today.historyStatus === 'unavailable'
      ? ["today's cycle-summary partition is unreadable"] : []),
    ...(corrupt > 0
      ? [`${corrupt.toLocaleString('en-US')} malformed cycle-summary row${corrupt === 1 ? '' : 's'} today`]
      : []),
    ...(incomplete > 0
      ? [`${incomplete.toLocaleString('en-US')} started look${incomplete === 1 ? '' : 's'} ${incomplete === 1 ? 'has' : 'have'} no durable completion summary`]
      : []),
  ]
  const proofDebt = proofDebts.join('; ') || 'one or more looks lack durable completion proof'

  if (!(Number.isSafeInteger(today.cycles) && today.cycles > 0)) {
    return lowerBound ? `Daily totals unavailable — ${proofDebt}.` : null
  }

  const counts = today.durablyCommitted === true
    ? `${lowerBound ? 'at least ' : ''}${countCopy(today.read)} durably saved · ${lowerBound ? 'at least ' : ''}${countCopy(today.kept)} inbox-eligible · ${lowerBound ? 'at least ' : ''}${countCopy(today.dropped)} dropped`
    // A legacy summary can itself overstate feed persistence, so even when omitted summaries make the set
    // incomplete its reported values are not safe mathematical lower bounds. Label; never prefix "at least".
    : `legacy report · ${countCopy(today.read)} reported outcomes · ${countCopy(today.kept)} reported inbox-eligible · ${countCopy(today.dropped)} reported dropped`
  return [
    counts,
    ...(lowerBound ? [`daily totals incomplete (${proofDebt})`] : []),
    ...(today.durablyCommitted === true ? [] : ['feed durability unverified']),
  ].join(' · ')
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
  const parts = [`${arrivals.toLocaleString('en-US')} new arrivals`]
  if (typeof cycle.fresh === 'number' && Number.isSafeInteger(cycle.fresh) && cycle.fresh > arrivals) {
    const redelivered = cycle.fresh - arrivals
    parts.push(`${redelivered.toLocaleString('en-US')} backlog redeliver${redelivered === 1 ? 'y' : 'ies'}`)
  }
  if (typeof cycle.carryover === 'number' && Number.isSafeInteger(cycle.carryover) && cycle.carryover >= 0) {
    parts.push(`${cycle.carryover.toLocaleString('en-US')} carried`)
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
      'Rate comparison is not available from this scanner yet.',
      'Scanning and inflow are not compared until the server reports like-for-like queue flow.',
    )
  }

  const freshness = snapshotProblem(flow, diagnosticsTs, nowMs)
  if (freshness === 'stale') {
    return unavailable(
      'Rate snapshot is stale — values and capacity comparison are hidden.',
      'The diagnostics or flow timestamp is over 60 seconds old. Refresh must succeed before rates return.',
    )
  }
  if (freshness === 'invalid') {
    return unavailable(
      'Rate snapshot time cannot be verified — values and capacity comparison are hidden.',
      'Refresh diagnostics before using these rates.',
    )
  }

  if (flow.history?.coverage !== 'complete') {
    if (!flow.history) {
      return unavailable(
        'Required rate-history coverage is not reported — capacity is not compared.',
        'Waiting for the server to prove every partition in the trailing window.',
      )
    }
    const debt = [
      flow.history.missingDates.length ? `missing ${flow.history.missingDates.join(', ')}` : '',
      flow.history.unreadableDates.length ? `unreadable ${flow.history.unreadableDates.join(', ')}` : '',
      flow.history.corruptCycleRows ? `${flow.history.corruptCycleRows} corrupt cycle row${flow.history.corruptCycleRows === 1 ? '' : 's'}` : '',
      flow.history.incompleteCycles ? `${flow.history.incompleteCycles} started cycle${flow.history.incompleteCycles === 1 ? '' : 's'} without a durable completion summary` : '',
      flow.history.gapMarkerUnreadable ? 'cycle-completion safety record unreadable' : '',
    ].filter(Boolean).join(' · ')
    return unavailable(
      'Required rate history is incomplete — capacity is not compared.',
      debt || 'One or more required trailing-window history records are not proven complete.',
    )
  }

  const inflowRate = fmtPipelineRate(flow.inflow.perSecond)
  const scanningRate = fmtPipelineRate(flow.scanning.perSecond)
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
        ? `No completed scanner looks in the trailing ${flow.windowMinutes} minutes.`
        : 'Like-for-like coverage is incomplete — scanning and inflow are not compared.',
      coverageCopy: noCycles
        ? 'The rate is unmeasured, not zero.'
        : `Coverage: ${flow.inflow.knownCycles}/${totalCycles} completed cycles prove unique new arrivals; ${flow.scanning.knownCycles}/${totalCycles} prove scanning.`,
    }
  }

  const gap = rawGap as number
  const coverageCopy = `Trailing ${flow.windowMinutes} minutes · ${totalCycles} completed cycle${totalCycles === 1 ? '' : 's'} · fixed ${(flow.windowMinutes * 60).toLocaleString('en-US')}-second wall-clock average.`
  if (gap > 0) {
    return {
      tone: 'ahead', inflowRate, scanningRate,
      gapCopy: `Ahead by ${fmtItemsPerHour(gap)} items/hour of scanning capacity — before any queued item reaches the age limit.`,
      coverageCopy,
    }
  }
  if (gap < 0) {
    return {
      tone: 'behind', inflowRate, scanningRate,
      gapCopy: `Falling behind by ${fmtItemsPerHour(gap)} items/hour — queue pressure grows at this rate before any queued item reaches the age limit.`,
      coverageCopy,
    }
  }
  return {
    tone: 'equal', inflowRate, scanningRate,
    gapCopy: 'Equal — 0 items/hour of capacity headroom before age-based retirement. Scanning must stay above inflow to reduce the backlog.',
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
    case 'rate-limit': return 'a rate-limit response'
    case 'availability': return 'a service or network error'
    case 'timeout': return 'a request timeout'
    case 'request': return 'a rejected request'
    case 'contract': return 'an unusable response'
    case 'provider-access': return 'rejected provider access'
    // Both hold the whole provider like a 401/403, but neither is a broken credential: 402 is a spent
    // balance, 404 a retired model or endpoint. Naming them apart is what stops an operator rotating a
    // key that was fine.
    case 'provider-credits': return 'the account credit limit'
    case 'provider-endpoint': return 'a retired model or endpoint'
    case 'triage-contract': return 'an unusable triage response'
    case 'triage-request': return 'a rejected triage request'
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
  if (tier.spendingAllowed === false) return 'News engine is not running'
  if (tier.enabled && tier.providerDayExhausted) return "Provider says today's limit is used"
  // A REJECTED CREDENTIAL OUTRANKS THE COUNTDOWN. This branch sits above the retry timer deliberately: the
  // timer is the truth about when the engine will next probe, but it is the WRONG headline for a fault that
  // probing cannot fix. Shown as a countdown, a dead key reads as patience — which is how one went unnoticed
  // for 46 consecutive failures and two days while the panel repeated "try again in ~43m".
  if (tier.credentialRejected) {
    const forMs = tier.failingForMs
    const since = forMs != null ? `, failing for ${fmtFailingFor(forMs)}` : ''
    const zero = tier.triageScoredBatchesToday === 0 ? ', 0 scored today' : ''
    return `Key rejected${since}${zero} — waiting won't fix it${tier.keyEnvVar ? `; check ${tier.keyEnvVar}` : ''}`
  }
  if (retryRemainingMs > 0) {
    // Name the measured duration on a timeout. "timed out at 30.0s" against a 30s ceiling says WE cut the call
    // off and a longer deadline may work; "at 1.2s" says the provider refused and the deadline is irrelevant.
    const at = tier.cooldownReason === 'timeout' && tier.lastFailureMs != null ? ` at ${(tier.lastFailureMs / 1000).toFixed(1)}s` : ''
    return `Waiting after ${retryReasonLabel(tier.cooldownReason)}${at} · try again in ~${fmtRetryDuration(retryRemainingMs)}`
  }
  switch (tier.health) {
    case 'healthy': return 'Ready to try'
    case 'paced': return 'Saved for later today'
    case 'cooling': return 'Ready to try again'
    case 'budget-spent': return "This app's daily amount is used"
    case 'unavailable': return "Can't read today's usage"
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
    retryHeld: names(diag.defer.retryHeldTiers ?? diag.tiers.filter((t) => t.enabled && t.spendingAllowed !== false && t.health === 'cooling' && !t.providerDayExhausted).map((t) => t.id)),
    providerDayLimited: names(diag.defer.providerDayExhaustedTiers ?? diag.tiers.filter((t) => t.enabled && t.spendingAllowed !== false && t.providerDayExhausted).map((t) => t.id)),
    allowanceUsed: names(diag.defer.allowanceExhaustedTiers ?? diag.tiers.filter((t) => t.enabled && t.spendingAllowed !== false && t.health === 'budget-spent' && !t.providerDayExhausted).map((t) => t.id)),
    needsAttention: names(diag.defer.unavailableTiers ?? diag.tiers.filter((t) => t.enabled && t.spendingAllowed !== false && t.health === 'unavailable').map((t) => t.id)),
    paced: names(diag.defer.pacedTiers ?? diag.tiers.filter((t) => t.enabled && t.spendingAllowed !== false && t.health === 'paced').map((t) => t.id)),
    // Derived from the per-tier flag when an older engine omits the group, so the fault surfaces during a
    // rolling deploy rather than waiting for both halves to land.
    needsCredential: names(diag.defer.needsCredentialTiers ?? diag.tiers.filter((t) => t.enabled && t.spendingAllowed !== false && t.credentialRejected === true).map((t) => t.id)),
  }
}
