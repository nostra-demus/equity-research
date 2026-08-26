/**
 * One fail-closed operational verdict for the whole news scanner.
 *
 * Provider rows, queue counters, and cycle receipts already contain the truth. This module does not make
 * another provider request or invent another state store; it turns those existing signals into a small,
 * machine-readable answer the cockpit and the Mac watchdog can share. Restart advice is deliberately
 * narrow: restarting can repair a stalled scheduler, but it cannot create provider allowance, repair a
 * credential, recover lost rows, or make an unreadable ledger trustworthy.
 */

export type ScannerHealthStatus = 'healthy' | 'degraded' | 'failing' | 'idle'
export type ScannerRepairAction =
  | 'none'
  | 'restart-engine'
  | 'enable-ingester'
  | 'repair-storage'
  | 'repair-provider'
  | 'verify-provider'
  | 'increase-capacity'
  | 'wait-for-reset'
  | 'inspect-cycle-ledger'

export type ScannerHealthCode =
  | 'healthy'
  | 'ingester-disabled'
  | 'lease-not-owned'
  | 'scheduler-starting'
  | 'scheduler-not-started'
  | 'scheduler-stale'
  | 'queue-state-unreadable'
  | 'data-loss-recorded'
  | 'cycle-ledger-damaged'
  | 'flow-history-incomplete'
  | 'cycle-completion-gap'
  | 'last-cycle-aborted'
  | 'providers-unconfigured'
  | 'providers-blocked'
  | 'provider-quarantined'
  | 'provider-unproven'
  | 'backlog-pressure'
  | 'capacity-behind'

export interface ScannerHealthFinding {
  code: Exclude<ScannerHealthCode, 'healthy'>
  severity: 'warning' | 'critical'
  message: string
  action: Exclude<ScannerRepairAction, 'none'>
  restartRecommended: boolean
}

export interface ScannerHealthVerdict {
  status: ScannerHealthStatus
  code: ScannerHealthCode
  summary: string
  action: ScannerRepairAction
  restartRecommended: boolean
  findings: ScannerHealthFinding[]
}

export interface ScannerHealthInput {
  enabled: boolean
  running: boolean
  readOnly: boolean
  intervalMin: number
  lastCycleAt: string | null
  nextCycleAt: string | null
  flow: {
    history?: {
      coverage?: 'complete' | 'partial' | 'none'
      missingDates?: string[]
      unreadableDates?: string[]
      gapMarkerUnreadable?: boolean
    }
    comparison: {
      measured: boolean
      status: 'ahead' | 'equal' | 'behind' | 'unavailable'
      scanningMinusInflowItemsPerHour: number | null
    }
  }
  tiers: Array<{
    id: string
    label: string
    enabled: boolean
    spendingAllowed?: boolean
    health: string
    credentialRejected?: boolean
    quarantined?: boolean
    quarantineReason?: string
    routing?: { eligible: boolean; lastSuccessAt: string | null }
  }>
  backlog: {
    unavailable?: boolean
    count: number
    cap: number
    nearLimit: boolean
    trend: 'growing' | 'shrinking' | 'flat' | null
    lostToday: number
    retiredToday: number
  }
  today: {
    incompleteCycles: number
    totalsLowerBound: boolean
    historyStatus: 'complete' | 'missing' | 'unreadable' | 'unavailable'
    corruptCycleRows: number
  }
  lastCycle: { aborted: boolean } | null
}

const STARTUP_GRACE_MS = 5 * 60_000
const NEXT_TICK_GRACE_MS = 2 * 60_000

function finiteTimestamp(value: string | null): number | null {
  if (!value) return null
  const parsed = Date.parse(value)
  return Number.isFinite(parsed) ? parsed : null
}

function names(values: Array<{ label: string }>): string {
  return values.map((value) => value.label).join(', ')
}

function plural(count: number, singular: string, pluralForm = `${singular}s`): string {
  return count === 1 ? singular : pluralForm
}

/** Pure and deterministic. `observedSinceMs` is the process-local moment the scheduler module loaded. */
export function evaluateScannerHealth(
  input: ScannerHealthInput,
  nowMs = Date.now(),
  observedSinceMs = nowMs,
): ScannerHealthVerdict {
  if (!input.enabled) {
    const finding: ScannerHealthFinding = {
      code: 'ingester-disabled', severity: 'warning',
      message: 'The incoming-news scanner is off. Saved research remains readable, but no new news is being collected.',
      action: 'enable-ingester', restartRecommended: false,
    }
    return {
      status: 'idle', code: finding.code, summary: finding.message, action: finding.action,
      restartRecommended: false, findings: [finding],
    }
  }

  const findings: ScannerHealthFinding[] = []
  const add = (finding: ScannerHealthFinding) => findings.push(finding)

  if (input.readOnly) {
    add({
      code: 'lease-not-owned', severity: 'warning',
      message: 'This engine is only observing the scanner because another process owns the one allowed scanner lease.',
      action: 'inspect-cycle-ledger', restartRecommended: false,
    })
  } else {
    const next = finiteTimestamp(input.nextCycleAt)
    const last = finiteTimestamp(input.lastCycleAt)
    const intervalMs = Math.max(1, Number(input.intervalMin) || 1) * 60_000
    const lastCompletionGraceMs = Math.max(STARTUP_GRACE_MS, intervalMs * 2)
    const processAgeMs = Math.max(0, nowMs - observedSinceMs)

    if (next === null) {
      add(processAgeMs <= STARTUP_GRACE_MS
        ? {
            code: 'scheduler-starting', severity: 'warning',
            message: 'The scanner process is still inside its startup window and has not scheduled its first look yet.',
            action: 'inspect-cycle-ledger', restartRecommended: false,
          }
        : {
            code: 'scheduler-not-started', severity: 'critical',
            message: 'The engine is up, but the scanner never scheduled its first look.',
            action: 'restart-engine', restartRecommended: true,
          })
    } else if (nowMs - next > NEXT_TICK_GRACE_MS) {
      add({
        code: 'scheduler-stale', severity: 'critical',
        message: `The scanner's next-look clock is ${Math.max(1, Math.round((nowMs - next) / 60_000))} minutes overdue.`,
        action: 'restart-engine', restartRecommended: true,
      })
    } else if (last === null && processAgeMs > lastCompletionGraceMs) {
      add({
        code: 'scheduler-stale', severity: 'critical',
        message: 'The scanner has been scheduled long enough to finish a look, but no completed look has been recorded.',
        action: 'restart-engine', restartRecommended: true,
      })
    } else if (last !== null && nowMs - last > lastCompletionGraceMs) {
      add({
        code: 'scheduler-stale', severity: 'critical',
        message: `No scanner look has completed for ${Math.max(1, Math.round((nowMs - last) / 60_000))} minutes.`,
        action: 'restart-engine', restartRecommended: true,
      })
    }
  }

  if (input.backlog.unavailable) {
    add({
      code: 'queue-state-unreadable', severity: 'critical',
      message: 'The scanner cannot prove what is waiting because its saved queue is unreadable.',
      action: 'repair-storage', restartRecommended: false,
    })
  }

  const lost = Math.max(0, input.backlog.lostToday || 0)
  const retired = Math.max(0, input.backlog.retiredToday || 0)
  if (lost > 0 || retired > 0) {
    const lowerBound = input.today.totalsLowerBound ? 'At least ' : ''
    const missed = lost + retired
    add({
      code: 'data-loss-recorded', severity: 'critical',
      message: `${lowerBound}${missed} ${plural(missed, 'item')} ${missed === 1 ? 'was' : 'were'} not scored today (${lost} lost by an older queue limit; ${retired} expired while waiting).`,
      action: 'increase-capacity', restartRecommended: false,
    })
  }

  if (input.today.historyStatus === 'unreadable' || input.today.historyStatus === 'unavailable'
    || input.today.corruptCycleRows > 0 || input.flow.history?.gapMarkerUnreadable) {
    add({
      code: 'cycle-ledger-damaged', severity: 'critical',
      message: `Today's scanner history is damaged or unreadable${input.today.corruptCycleRows > 0 ? ` (${input.today.corruptCycleRows} malformed ${plural(input.today.corruptCycleRows, 'record')})` : ''}.`,
      action: 'inspect-cycle-ledger', restartRecommended: false,
    })
  }

  if (input.flow.history?.coverage && input.flow.history.coverage !== 'complete') {
    const missing = input.flow.history.missingDates?.length || 0
    const unreadable = input.flow.history.unreadableDates?.length || 0
    add({
      code: 'flow-history-incomplete', severity: 'warning',
      message: `The last-hour capacity check cannot prove complete scanner history${missing || unreadable ? ` (${missing} missing date ${plural(missing, 'file')}; ${unreadable} unreadable)` : ''}.`,
      action: 'repair-storage', restartRecommended: false,
    })
  }

  const allowedIncomplete = input.running ? 1 : 0
  if (input.today.incompleteCycles > allowedIncomplete) {
    const incomplete = input.today.incompleteCycles - allowedIncomplete
    add({
      code: 'cycle-completion-gap', severity: 'critical',
      message: `${incomplete} earlier scanner ${plural(incomplete, 'look')} started without a durable completion record.`,
      action: 'inspect-cycle-ledger', restartRecommended: false,
    })
  }

  if (input.lastCycle?.aborted) {
    add({
      code: 'last-cycle-aborted', severity: 'warning',
      message: 'The latest scanner look ran out of time; its unfinished work was saved for another try.',
      action: 'increase-capacity', restartRecommended: false,
    })
  }

  const configured = input.tiers.filter((tier) => tier.enabled)
  const spendable = configured.filter((tier) => tier.spendingAllowed !== false)
  const available = spendable.filter((tier) => {
    if (tier.routing) return tier.routing.eligible === true
    const healthyOrPaced = tier.health === 'healthy' || tier.health === 'paced'
    return healthyOrPaced && !tier.quarantined && !tier.credentialRejected
  })
  const quarantined = spendable.filter((tier) => tier.quarantined || tier.credentialRejected)
  if (configured.length === 0) {
    add({
      code: 'providers-unconfigured', severity: 'critical',
      message: 'No checking service is configured for incoming news.',
      action: 'repair-provider', restartRecommended: false,
    })
  } else if (input.backlog.count > 0 && spendable.length > 0 && available.length === 0) {
    add({
      code: 'providers-blocked', severity: input.backlog.nearLimit ? 'critical' : 'warning',
      message: `All ${spendable.length} active checking ${plural(spendable.length, 'service')} ${spendable.length === 1 ? 'is' : 'are'} blocked while ${input.backlog.count} ${plural(input.backlog.count, 'item')} ${input.backlog.count === 1 ? 'waits' : 'wait'}.`,
      action: quarantined.length === spendable.length ? 'repair-provider' : 'wait-for-reset',
      restartRecommended: false,
    })
  }

  if (quarantined.length > 0) {
    add({
      code: 'provider-quarantined', severity: 'warning',
      message: `${names(quarantined)} ${quarantined.length === 1 ? 'has' : 'have'} a standing key, account, model, or configuration fault.`,
      action: 'repair-provider', restartRecommended: false,
    })
  }

  const unproven = spendable.filter((tier) => tier.id !== 'anthropic-triage'
    && !tier.quarantined && !tier.credentialRejected && tier.routing && !tier.routing.lastSuccessAt)
  if (unproven.length > 0) {
    add({
      code: 'provider-unproven', severity: 'warning',
      message: `${names(unproven)} ${unproven.length === 1 ? 'has' : 'have'} no successful contract proof in the last seven days.`,
      action: 'verify-provider', restartRecommended: false,
    })
  }

  if (!input.backlog.unavailable && input.backlog.nearLimit) {
    add({
      code: 'backlog-pressure', severity: 'warning',
      message: `${input.backlog.count} items are waiting, using at least 80% of the scanner's ${input.backlog.cap}-item active work window.`,
      action: 'increase-capacity', restartRecommended: false,
    })
  }

  if (input.flow.comparison.measured && input.flow.comparison.status === 'behind') {
    const gap = input.flow.comparison.scanningMinusInflowItemsPerHour
    add({
      code: 'capacity-behind', severity: 'warning',
      message: gap == null
        ? 'New items are arriving faster than the scanner is finishing them.'
        : `New items are arriving about ${Math.abs(Math.round(gap)).toLocaleString()} per hour faster than the scanner is finishing them.`,
      action: 'increase-capacity', restartRecommended: false,
    })
  }

  if (findings.length === 0) {
    return {
      status: 'healthy', code: 'healthy', summary: 'The scanner is completing work, its queue is readable, and no provider fault is blocking queued work.',
      action: 'none', restartRecommended: false, findings: [],
    }
  }

  const primary = findings.find((finding) => finding.severity === 'critical') || findings[0]
  return {
    status: findings.some((finding) => finding.severity === 'critical') ? 'failing' : 'degraded',
    code: primary.code,
    summary: primary.message,
    action: primary.action,
    restartRecommended: findings.some((finding) => finding.restartRecommended),
    findings,
  }
}
