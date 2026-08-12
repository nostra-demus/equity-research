import type { BoardIdea, QualifiedIdeaEvaluation, QualifiedIdeasBoard, QualifiedIdeasPolicy, ScreenerBoard } from './types'

export interface IdeasSurfaceSummary {
  available: boolean
  qualifiedCount: number
  liveLeadCount: number
  headerLabel: string
}

const EXPIRING_EVIDENCE_CODES = new Set(['stale_quote', 'unverified_liquidity', 'missing_market_risk'])
const DAY_MS = 86_400_000
const CLOCK_SKEW_MS = 5 * 60_000

/** These are not new theses: the immutable assessment remains on disk but its live market evidence must
 * be refreshed by a new assessment before it can qualify again. */
export function assessmentNeedsRefresh(idea: QualifiedIdeaEvaluation): boolean {
  return idea.issues.some((issue) => EXPIRING_EVIDENCE_CODES.has(issue.code))
}

export function qualificationDetailCounts(board?: QualifiedIdeasBoard | null) {
  const needs = board?.needs_research || []
  return {
    needsEvidence: needs.length,
    refreshNeeded: needs.filter(assessmentNeedsRefresh).length,
    rejected: board?.does_not_clear?.length || 0,
    notAssessable: board?.not_assessable?.length || 0,
    total: needs.length + (board?.does_not_clear?.length || 0) + (board?.not_assessable?.length || 0),
  }
}

/** Client-side expiry backstop for a last-known board held through a network failure. The live API is
 * authoritative and recomputes this too; this prevents its last `stale:false` bit living forever while
 * the API is unreachable. Invalid expiry fails closed into the cooling lane. */
export function ideaIsStaleNow(idea: BoardIdea, nowMs = Date.now()): boolean {
  const decayMs = Date.parse(idea.decay_at)
  return idea.stale || !Number.isFinite(decayMs) || decayMs <= nowMs
}

export interface QualifiedIdeaFreshness {
  refreshRequired: boolean
  reasons: string[]
}

function expiredAt(value: string, maxAgeDays: number, nowMs: number): boolean {
  const at = Date.parse(value)
  return !Number.isFinite(at) || at > nowMs + CLOCK_SKEW_MS || nowMs - at > maxAgeDays * DAY_MS
}

/**
 * Re-run only the wall-clock-dependent qualification checks against a last-known server board. This is
 * a display safety backstop, not a new qualification decision: policy, evidence, and metrics still come
 * from the server. It prevents a cached qualified card from living forever during an API outage.
 */
export function qualifiedIdeaFreshnessNow(
  idea: QualifiedIdeaEvaluation,
  policy: Partial<QualifiedIdeasPolicy> | null | undefined,
  nowMs = Date.now(),
): QualifiedIdeaFreshness {
  const c = idea.candidate
  const reasons: string[] = []
  const quoteMaxAgeDays = Number(policy?.quoteMaxAgeDays)
  const liquidityMaxAgeDays = Number(policy?.liquidityMaxAgeDays)
  const quoteAge = Number.isFinite(quoteMaxAgeDays) && quoteMaxAgeDays >= 0 ? quoteMaxAgeDays : 0
  const liquidityAge = Number.isFinite(liquidityMaxAgeDays) && liquidityMaxAgeDays >= 0 ? liquidityMaxAgeDays : 0

  if (c.quote.stale || expiredAt(c.quote.as_of, quoteAge, nowMs)) reasons.push('quote evidence expired')
  if (expiredAt(c.liquidity.as_of, liquidityAge, nowMs)) reasons.push('liquidity evidence expired')
  if (expiredAt(c.market_risk.as_of, liquidityAge, nowMs)) reasons.push('ordinary-move evidence expired')
  if (expiredAt(c.catalyst.status_as_of, quoteAge, nowMs)) reasons.push('catalyst status is no longer current')

  const catalystStart = Date.parse(c.catalyst.window_start)
  const catalystEnd = Date.parse(c.catalyst.window_end)
  if (!Number.isFinite(catalystStart) || !Number.isFinite(catalystEnd) || catalystEnd < nowMs) {
    reasons.push('catalyst is no longer proven scheduled and unresolved')
  }
  const falsifierDeadline = Date.parse(c.falsifier.deadline)
  if (!Number.isFinite(falsifierDeadline) || falsifierDeadline < nowMs) reasons.push('falsifier deadline passed')
  const horizonEnd = Date.parse(c.horizon.end)
  if (!Number.isFinite(horizonEnd) || horizonEnd <= nowMs) reasons.push('holding horizon ended')

  return { refreshRequired: reasons.length > 0, reasons: [...new Set(reasons)] }
}

/**
 * Resolve Ideas capability and headline copy without treating an empty lead array as an investment
 * rejection. The qualified board, the lead-pass health record, and the lead list are independent
 * capabilities during a rolling deploy; any one keeps the tab inspectable.
 */
export function summarizeIdeasSurface(board?: ScreenerBoard | null): IdeasSurfaceSummary {
  const qualified = board?.qualified_ideas
    && (board.qualified_ideas.schema_version === 'qualified-ideas-board/v1'
      || board.qualified_ideas.schema_version === 'qualified-ideas-board/v2')
    ? board.qualified_ideas
    : null
  const healthAvailable = board?.ideas_health?.schema_version === 'ideas-health/v1'
  const leadsAvailable = Array.isArray(board?.ideas)
  const qualifiedCount = qualified && Array.isArray(qualified.qualified)
    ? qualified.qualified.filter((idea) => !qualifiedIdeaFreshnessNow(idea, qualified.policy).refreshRequired).length
    : 0
  const liveLeadCount = leadsAvailable ? board!.ideas!.filter((idea) => !ideaIsStaleNow(idea)).length : 0

  let headerLabel = 'qualification unavailable'
  if (qualified?.health.outcome === 'no_artifacts') headerLabel = 'no assessments yet'
  else if (qualified?.health.outcome === 'invalid_artifacts' || qualified?.health.outcome === 'storage_error') headerLabel = 'assessment error'
  else if (qualified?.health.outcome === 'none_clear') headerLabel = 'none qualified'
  else if (qualified?.health.outcome === 'qualified') headerLabel = qualifiedCount ? `${qualifiedCount} qualified` : 'refresh required'

  return {
    available: Boolean(qualified || healthAvailable || leadsAvailable),
    qualifiedCount,
    liveLeadCount,
    headerLabel,
  }
}
