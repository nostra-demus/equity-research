// Shadow-only second-look runner. It executes after the normal Ideas pass, spends a clock-paced maximum
// of identity checks, and never reads an article or creates an idea. Live work is a later rollout stage.

import { dailyQuotaAdmission } from '../triage/budget'
import {
  cleanTicker, companyNameMatches, coreCompanyName, directoryTickerMatches, searchSymbolsChecked, type FetchLike,
} from '../symbology'
import { RESCUE_SELECTOR_VERSION, selectRescueCandidates, type RescueCandidate } from './selector'
import {
  completeRescueCheck, loadRescueDay, loadRescueQueue, noteDirectoryResult,
  readRescueHealth, reconcileRescueDayLedgers, rescueAuditCanAccept, reserveRescueCheck, updateRescueHealth,
  type RescueCheckRecord, type RescueIdentityStatus,
} from './store'

export interface RescueShadowConfig {
  mode: 'off' | 'shadow'
  maxAgeHrs: number
  dailyChecks: number
  perCycle: number
  nameDailyCap: number
  paceFloorFraction: number
  auditMaxBytes: number
}

export interface RescueDiagnostics {
  mode: 'off' | 'shadow'
  selectorVersion: string
  status: 'disabled' | 'ready' | 'paused_core_work' | 'directory_paused' | 'audit_unavailable'
  reason: string
  candidatesFound: number
  primaryCandidates: number
  nameCandidates: number
  identityChecks: number
  checksReleased: number
  verified: number
  identityUnresolved: number
  directoryUnavailable: number
  articleReads: number
  ideasCreated: number
  capacityMisses: number
  queuedForLater: number
  retryExhausted: number
  auditHealthy: boolean
  circuitOpenUntil: string | null
  dailyCap: number
  reconciliation: ReturnType<typeof selectRescueCandidates>['reconciled']
}

export interface RescueShadowResult extends RescueDiagnostics {
  checkedThisCycle: number
}

const emptyReconciliation = (): RescueDiagnostics['reconciliation'] => ({
  total: 0, inboxed: 0, outside_score: 0, social: 0, routine_filing: 0,
  duplicate: 0, manually_blocked: 0, no_identity: 0, no_signal: 0, candidates: 0,
})

function utcDate(now: number): string { return new Date(now).toISOString().slice(0, 10) }

function recentUtcDates(now: number): string[] {
  return [0, 1, 2].map((daysAgo) => utcDate(now - daysAgo * 24 * 3_600_000))
}

function recentChecks(stateDir: string, now: number): { available: boolean; checks: RescueCheckRecord[] } {
  const days = recentUtcDates(now).map((date) => loadRescueDay(stateDir, date))
  return {
    available: days.every((day) => day.available),
    checks: days.flatMap((day) => day.ledger.checks),
  }
}

function directoryPaused(until: string | null, now: number): boolean {
  if (!until) return false
  const parsed = Date.parse(until)
  return Number.isFinite(parsed) && parsed > now
}

function checksForCandidate(candidate: RescueCandidate, checks: readonly RescueCheckRecord[]): RescueCheckRecord[] {
  const eventIds = new Set([candidate.event_id, ...candidate.supporting_event_ids])
  return checks.filter((check) => check.identity_key === candidate.identity_key && eventIds.has(check.event_id))
}

async function verifyCandidate(
  candidate: RescueCandidate,
  fetchImpl: FetchLike,
): Promise<{ status: RescueIdentityStatus; ticker?: string | null; companyName?: string | null; exchange?: string | null }> {
  const result = await searchSymbolsChecked(candidate.query, fetchImpl, { useCache: true })
  if (result.status === 'unavailable') return { status: 'directory_unavailable' }
  if (candidate.ticker) {
    const hit = result.groups.find((group) => {
      if (!directoryTickerMatches(candidate.ticker, group.symbol, candidate.listing_country)
        || !String(group.exchange || '').trim()) return false
      if (!candidate.company_name) return true
      const actual = String(group.name || '').toLowerCase()
      const expected = candidate.company_name.toLowerCase()
      return companyNameMatches(actual, expected) || companyNameMatches(expected, actual)
    })
    return hit
      ? { status: 'verified', ticker: cleanTicker(hit.symbol), companyName: hit.name, exchange: hit.exchange }
      : { status: 'identity_unresolved' }
  }
  const expected = coreCompanyName(candidate.company_name)
  const matches = result.groups.filter((group) => expected && coreCompanyName(group.name) === expected
    && !!cleanTicker(group.symbol) && !!String(group.exchange || '').trim())
  if (matches.length !== 1) return { status: 'identity_unresolved' }
  return {
    status: 'verified', ticker: cleanTicker(matches[0].symbol),
    companyName: matches[0].name, exchange: matches[0].exchange,
  }
}

function diagnosticsFromState(
  stateDir: string,
  config: RescueShadowConfig,
  now: number,
  coreReady: boolean,
  blockedEventIds: ReadonlySet<string>,
): RescueDiagnostics {
  const health = readRescueHealth(stateDir)
  const queue = loadRescueQueue(stateDir)
  const date = utcDate(now)
  const day = loadRescueDay(stateDir, date)
  const history = recentChecks(stateDir, now)
  const selection = queue.available
    ? selectRescueCandidates(queue.items, now, config.maxAgeHrs, blockedEventIds)
    : { candidates: [], primary_count: 0, name_count: 0, reconciled: emptyReconciliation() }
  const checks = day.available ? day.ledger.checks : []
  const released = Math.floor(dailyQuotaAdmission({
    id: 'news-rescue-shadow', meter: 'requests', used: checks.length, cap: config.dailyChecks,
    cost: 1, paceCost: 1, floorFraction: config.paceFloorFraction,
  }, now).released)
  const complete = checks.filter((check) => !!check.identity_status)
  const verified = complete.filter((check) => check.identity_status === 'verified').length
  const unresolved = complete.filter((check) => check.identity_status === 'identity_unresolved').length
  const unavailable = complete.filter((check) => check.identity_status === 'directory_unavailable').length
  const candidateStates = selection.candidates.map((candidate) => {
    const matching = checksForCandidate(candidate, history.checks)
    const terminal = matching.some((check) => check.identity_status !== 'directory_unavailable')
    const unavailableAttempts = matching.filter((check) => check.identity_status === 'directory_unavailable').length
    return { candidate, terminal, retryExhausted: !terminal && unavailableAttempts >= 2 }
  })
  const remaining = candidateStates.filter((state) => !state.terminal && !state.retryExhausted).length
  const auditHealthy = health.audit_healthy && queue.available && day.available && history.available
  let status: RescueDiagnostics['status'] = 'ready'
  let reason = 'The second look is running in shadow mode. It checks company identity but reads no articles and creates no ideas.'
  if (config.mode === 'off') { status = 'disabled'; reason = 'The second look is turned off.' }
  else if (!auditHealthy) { status = 'audit_unavailable'; reason = health.audit_error || 'The second-look record cannot be safely read or written.' }
  else if (!coreReady) { status = 'paused_core_work'; reason = 'Normal news or Ideas work is still waiting, so the second look did no work.' }
  else if (directoryPaused(health.directory_pause_until, now)) {
    status = 'directory_paused'
    reason = 'The stock-listing lookup failed three times. It is paused for 30 minutes before trying again.'
  }
  return {
    mode: config.mode,
    selectorVersion: RESCUE_SELECTOR_VERSION,
    status,
    reason,
    candidatesFound: selection.candidates.length,
    primaryCandidates: selection.primary_count,
    nameCandidates: selection.name_count,
    identityChecks: checks.length,
    checksReleased: released,
    verified,
    identityUnresolved: unresolved,
    directoryUnavailable: unavailable,
    articleReads: 0,
    ideasCreated: 0,
    capacityMisses: checks.length >= config.dailyChecks ? Math.max(0, remaining) : 0,
    queuedForLater: remaining,
    retryExhausted: candidateStates.filter((state) => state.retryExhausted).length,
    auditHealthy,
    circuitOpenUntil: health.directory_pause_until,
    dailyCap: config.dailyChecks,
    reconciliation: selection.reconciled,
  }
}

export function getRescueDiagnostics(
  stateDir: string,
  config: RescueShadowConfig,
  now = Date.now(),
  coreReady = true,
  blockedEventIds: ReadonlySet<string> = new Set(),
): RescueDiagnostics {
  return diagnosticsFromState(stateDir, config, now, coreReady, blockedEventIds)
}

export async function runRescueShadowPass(deps: {
  stateDir: string
  config: RescueShadowConfig
  coreReady: boolean
  fetchImpl?: FetchLike
  now?: () => number
  log?: (message: string) => void
  blockedEventIds?: ReadonlySet<string>
}): Promise<RescueShadowResult> {
  const now = deps.now?.() ?? Date.now()
  const log = deps.log || (() => {})
  const blockedEventIds = deps.blockedEventIds || new Set<string>()
  // A crash can happen after the monthly append fsync but before the day ledger clears audit_pending.
  // Repair that bounded record before consulting the stale health latch, otherwise a recoverable write
  // failure would prevent its own repair forever. Unrelated queue/overflow failures are never cleared here.
  const repairHistory = deps.config.mode === 'shadow' ? recentChecks(deps.stateDir, now) : null
  if (repairHistory?.available && repairHistory.checks.some((check) => check.audit_pending && check.identity_status)) {
    const before = readRescueHealth(deps.stateDir)
    const repaired = reconcileRescueDayLedgers(deps.stateDir, now, deps.config.auditMaxBytes)
    if (repaired && (!before.audit_error || before.audit_error.startsWith('The detailed second-look'))) {
      updateRescueHealth(deps.stateDir, { audit_healthy: true, audit_error: null }, now)
    } else if (!repaired) {
      updateRescueHealth(deps.stateDir, {
        audit_healthy: false,
        audit_error: 'The detailed second-look record is full or could not be saved.',
      }, now)
    }
  }
  let diagnostic = diagnosticsFromState(deps.stateDir, deps.config, now, deps.coreReady, blockedEventIds)
  if (diagnostic.status !== 'ready') return { ...diagnostic, checkedThisCycle: 0 }
  const date = utcDate(now)
  if (!reconcileRescueDayLedgers(deps.stateDir, now, deps.config.auditMaxBytes)) {
    updateRescueHealth(deps.stateDir, {
      audit_healthy: false,
      audit_error: 'The detailed second-look record is full or could not be saved.',
    }, now)
    diagnostic = diagnosticsFromState(deps.stateDir, deps.config, now, deps.coreReady, blockedEventIds)
    return { ...diagnostic, checkedThisCycle: 0 }
  }

  const queue = loadRescueQueue(deps.stateDir)
  const day = loadRescueDay(deps.stateDir, date)
  const history = recentChecks(deps.stateDir, now)
  if (!queue.available || !day.available || !history.available) return { ...diagnosticsFromState(deps.stateDir, deps.config, now, deps.coreReady, blockedEventIds), checkedThisCycle: 0 }
  const selection = selectRescueCandidates(queue.items, now, deps.config.maxAgeHrs, blockedEventIds)
  const checks = [...day.ledger.checks]
  // A bare reservation may have crossed the network boundary before a crash. Treat it as spent and do
  // not repeat it after restart. If a better article later becomes the cluster representative, the old
  // representative remains a supporting id and therefore reuses this same check.
  const eligible = selection.candidates.filter((candidate) => {
    const matching = checksForCandidate(candidate, history.checks)
    if (matching.some((check) => check.identity_status !== 'directory_unavailable')) return false
    if (matching.length >= 2) return false
    const unavailableAt = Math.max(0, ...matching
      .filter((check) => check.identity_status === 'directory_unavailable')
      .map((check) => Date.parse(check.completed_at || check.reserved_at) || 0))
    return !unavailableAt || now - unavailableAt >= 30 * 60_000
  })
  const ticker = eligible.filter((candidate) => candidate.pool === 'ticker')
  const name = eligible.filter((candidate) => candidate.pool === 'name')
  let used = checks.length
  let nameUsed = checks.filter((check) => check.pool === 'name').length
  let checkedThisCycle = 0

  while (checkedThisCycle < deps.config.perCycle) {
    const admission = dailyQuotaAdmission({
      id: 'news-rescue-shadow', meter: 'requests', used, cap: deps.config.dailyChecks,
      cost: 1, paceCost: 1, floorFraction: deps.config.paceFloorFraction,
    }, now)
    if (!admission.pacedFit) break
    if (!rescueAuditCanAccept(deps.stateDir, now, deps.config.auditMaxBytes)) {
      updateRescueHealth(deps.stateDir, {
        audit_healthy: false,
        audit_error: 'The detailed second-look record is full or cannot accept another result.',
      }, now)
      break
    }
    const wantName = (used + 1) % 5 === 0 && nameUsed < deps.config.nameDailyCap
    let candidate = wantName ? name.shift() : ticker.shift()
    if (!candidate) candidate = ticker.shift()
    if (!candidate && nameUsed < deps.config.nameDailyCap) candidate = name.shift()
    if (!candidate) break

    const attempt = checksForCandidate(candidate, history.checks).length + 1
    const reservation = reserveRescueCheck(deps.stateDir, date, candidate, RESCUE_SELECTOR_VERSION, now, attempt)
    if (!reservation) {
      updateRescueHealth(deps.stateDir, { audit_healthy: false, audit_error: 'The app could not reserve a second-look check.' }, now)
      break
    }
    used++
    if (candidate.pool === 'name') nameUsed++
    checkedThisCycle++
    const result = await verifyCandidate(candidate, deps.fetchImpl || fetch)
    if (!completeRescueCheck(deps.stateDir, date, reservation.key, result, deps.config.auditMaxBytes, deps.now?.() ?? Date.now())) {
      updateRescueHealth(deps.stateDir, {
        audit_healthy: false,
        audit_error: 'The detailed second-look result could not be saved. Further checks are stopped.',
      }, deps.now?.() ?? Date.now())
      break
    }
    const health = noteDirectoryResult(deps.stateDir, result.status, deps.now?.() ?? Date.now())
    log(`second look shadow: ${candidate.event_id} → ${result.status}`)
    if (directoryPaused(health.directory_pause_until, deps.now?.() ?? Date.now())) break
  }
  diagnostic = diagnosticsFromState(deps.stateDir, deps.config, deps.now?.() ?? Date.now(), deps.coreReady, blockedEventIds)
  return { ...diagnostic, checkedThisCycle }
}
