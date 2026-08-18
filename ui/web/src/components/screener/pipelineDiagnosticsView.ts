import type { NewsDiagnostics, TierDiagnostics } from '../../lib/types'

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
  if (!tier.enabled) return 'Off'
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
