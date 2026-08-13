// Truthful projection of clusters that have not cleared the Themes thesis contract. This is diagnostics,
// not a looser admission lane: every row is explicitly non-investable and `themes[]` remains the only
// source of qualified narratives. Geo/commodity callers pass a member projector so the queue cannot leak
// evidence from outside the selected scope.

import { companiesForMembers, qualifyTheme, uniqueThemeEvidenceMembers } from './qualification'
import { exactThemeEvidenceUrl, hasExactThemeProvenance, isSupportingThemeEvidence } from './evidence'
import type {
  Theme,
  ThemeCompilerAttempt,
  ThemeCompilerBlocker,
  ThemeCompilerHealth,
  ThemeFormationCandidate,
  ThemeFormationEvidence,
  ThemeFormationQueue,
  ThemeFormationState,
  ThemeMember,
} from './types'

const MAX_FORMATION_CANDIDATES = 8
const MAX_FORMATION_EVIDENCE = 3
const MAX_FORMATION_BLOCKERS = 3
const MAX_FORMATION_AGE_MS = 72 * 3_600_000

const arr = <T>(value: T[] | null | undefined): T[] => Array.isArray(value) ? value : []
const validIso = (value: unknown): string | null => {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) return null
  return new Date(Date.parse(value)).toISOString().replace(/\.\d{3}Z$/, 'Z')
}
const count = (value: unknown): number => Number.isFinite(Number(value))
  ? Math.max(0, Math.floor(Number(value)))
  : 0

const COMPILER_STATES = new Set<ThemeCompilerAttempt['state']>(['succeeded', 'blocked', 'failed', 'skipped'])
const COMPILER_BLOCKERS = new Set<ThemeCompilerBlocker>([
  'not_configured', 'daily_cap', 'cooldown', 'rate_limiter_busy', 'provider_error', 'invalid_response',
])
const COMPILER_COUNT_KEYS = [
  'requested_count', 'attempted_count', 'validated_count', 'rejected_count', 'malformed_count', 'omitted_count',
] as const

function validCompilerCount(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0
}

/** Normalize the persisted board boundary before its last result is reused in a read-time projection. */
export function normalizeThemeCompilerAttempt(value: unknown): ThemeCompilerAttempt | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const raw = value as Record<string, unknown>
  const attemptedAt = validIso(raw.attempted_at)
  if (!attemptedAt || !COMPILER_STATES.has(raw.state as ThemeCompilerAttempt['state'])
    || typeof raw.provider !== 'string' || !raw.provider.trim()
    || typeof raw.message !== 'string'
    || COMPILER_COUNT_KEYS.some((key) => !validCompilerCount(raw[key]))) return null
  if (raw.blocker !== null && !COMPILER_BLOCKERS.has(raw.blocker as ThemeCompilerBlocker)) return null
  const state = raw.state as ThemeCompilerAttempt['state']
  const blocker = raw.blocker as ThemeCompilerBlocker | null
  // State and counts describe one observation and must reconcile. Provider fallbacks may make attempts
  // exceed requested candidates, but every classified/malformed/omitted result must bind to a sent request.
  const requested = raw.requested_count as number
  const attempted = raw.attempted_count as number
  const validated = raw.validated_count as number
  const rejected = raw.rejected_count as number
  const malformed = raw.malformed_count as number
  const omitted = raw.omitted_count as number
  const processed = validated + rejected
  if ((state === 'succeeded') !== (blocker === null)
    || processed > requested
    || processed + malformed + omitted > attempted
    || (state === 'succeeded' && processed !== requested)) return null
  return {
    attempted_at: attemptedAt,
    state,
    provider: raw.provider.trim().slice(0, 40),
    blocker,
    message: raw.message.trim().slice(0, 300),
    requested_count: requested,
    attempted_count: attempted,
    validated_count: validated,
    rejected_count: rejected,
    malformed_count: malformed,
    omitted_count: omitted,
  }
}

const FORMATION_STATES = new Set<ThemeFormationState>([
  'awaiting_validation', 'awaiting_revalidation', 'blocked_incomplete_audit', 'building_evidence',
])

function normalizeFormationEvidence(value: unknown): ThemeFormationEvidence | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const raw = value as Record<string, unknown>
  const foundAt = validIso(raw.found_at)
  const url = exactThemeEvidenceUrl(raw.url)?.slice(0, 2_000) || ''
  const source = typeof raw.source_name === 'string' ? raw.source_name.trim().slice(0, 160) : ''
  if (typeof raw.event_id !== 'string' || !raw.event_id.trim() || typeof raw.headline !== 'string'
    || !raw.headline.trim() || !foundAt || !source || !url
    || (raw.stance !== 'supports' && raw.stance !== 'challenges' && raw.stance !== 'unclassified')) return null
  return {
    event_id: raw.event_id.trim().slice(0, 160),
    headline: raw.headline.trim().slice(0, 500),
    found_at: foundAt,
    score: Math.min(100, count(raw.score)),
    source_tier: typeof raw.source_tier === 'string' && raw.source_tier.trim() ? raw.source_tier.trim().slice(0, 60) : 'unconfirmed',
    source_name: source,
    url,
    stance: raw.stance,
  }
}

/** Normalize a persisted formation snapshot. It is a disk/API trust boundary, not a passthrough: one
 * malformed count or candidate fails the queue closed instead of exposing untrusted pseudo-theses. */
export function normalizeThemeFormationQueue(value: unknown): ThemeFormationQueue | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const raw = value as Record<string, unknown>
  if (!Array.isArray(raw.candidates)) return null
  const numericKeys = ['total', 'shown', 'hidden', 'awaiting_validation', 'awaiting_revalidation', 'blocked_incomplete_audit', 'building_evidence'] as const
  if (numericKeys.some((key) => !Number.isInteger(Number(raw[key])) || Number(raw[key]) < 0)) return null
  const candidates: ThemeFormationCandidate[] = []
  for (const value of raw.candidates.slice(0, MAX_FORMATION_CANDIDATES)) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return null
    const candidate = value as Record<string, unknown>
    if (typeof candidate.theme_id !== 'string' || !/^THM-[a-z0-9]{8}$/.test(candidate.theme_id)
      || typeof candidate.provisional_label !== 'string' || !candidate.provisional_label.trim()
      || candidate.investable !== false || !FORMATION_STATES.has(candidate.state as ThemeFormationState)
      || !Number.isInteger(Number(candidate.distinct_evidence_count)) || Number(candidate.distinct_evidence_count) < 0
      || !Number.isInteger(Number(candidate.high_quality_evidence_count)) || Number(candidate.high_quality_evidence_count) < 0
      || Number(candidate.high_quality_evidence_count) > Number(candidate.distinct_evidence_count)
      || !Array.isArray(candidate.evidence) || !Array.isArray(candidate.blockers)) return null
    const evidence = candidate.evidence.map(normalizeFormationEvidence)
    if (evidence.some((row) => row === null) || evidence.length < 2 || evidence.length > MAX_FORMATION_EVIDENCE
      || candidate.blockers.some((item) => typeof item !== 'string' || !item.trim())) return null
    const queuedAt = candidate.queued_at === null ? null : validIso(candidate.queued_at)
    const attemptedAt = candidate.attempted_at === null ? null : validIso(candidate.attempted_at)
    if ((candidate.queued_at !== null && !queuedAt) || (candidate.attempted_at !== null && !attemptedAt)) return null
    candidates.push({
      theme_id: candidate.theme_id,
      provisional_label: candidate.provisional_label.trim().slice(0, 100),
      investable: false,
      state: candidate.state as ThemeFormationState,
      queued_at: queuedAt,
      attempted_at: attemptedAt,
      distinct_evidence_count: count(candidate.distinct_evidence_count),
      high_quality_evidence_count: count(candidate.high_quality_evidence_count),
      evidence: evidence as ThemeFormationEvidence[],
      blockers: candidate.blockers.filter((item): item is string => typeof item === 'string' && Boolean(item.trim())).map((item) => item.trim().slice(0, 300)).slice(0, MAX_FORMATION_BLOCKERS),
    })
  }
  const total = count(raw.total)
  const shown = count(raw.shown)
  const hidden = count(raw.hidden)
  const awaitingValidation = count(raw.awaiting_validation)
  const awaitingRevalidation = count(raw.awaiting_revalidation)
  const blockedIncompleteAudit = count(raw.blocked_incomplete_audit)
  const buildingEvidence = count(raw.building_evidence)
  const visibleStateCount = (state: ThemeFormationState) => candidates.filter((candidate) => candidate.state === state).length
  if (shown !== candidates.length || total !== shown + hidden
    || total !== awaitingValidation + awaitingRevalidation + blockedIncompleteAudit + buildingEvidence
    || visibleStateCount('awaiting_validation') > awaitingValidation
    || visibleStateCount('awaiting_revalidation') > awaitingRevalidation
    || visibleStateCount('blocked_incomplete_audit') > blockedIncompleteAudit
    || visibleStateCount('building_evidence') > buildingEvidence) return null
  return {
    total, shown, hidden,
    awaiting_validation: awaitingValidation,
    awaiting_revalidation: awaitingRevalidation,
    blocked_incomplete_audit: blockedIncompleteAudit,
    building_evidence: buildingEvidence,
    candidates,
  }
}

function formationState(
  theme: Theme,
  members: ThemeMember[] = arr(theme.members),
  scoped = false,
): ThemeFormationState | null {
  if (theme.status !== 'live') return null
  if (theme.narrative_update_overflow) return 'blocked_incomplete_audit'
  if (theme.narrative && (theme.needs_narrative_update || theme.needs_rename || theme.needs_validation)) {
    // A geo/commodity projection must not advertise update debt whose exact pending rows all live outside
    // the selected evidence slice. Identity-wide rename debt still applies to every slice carrying proof.
    if (scoped && theme.needs_narrative_update && !theme.needs_rename && !theme.needs_validation) {
      const scopedIds = new Set(members.map((member) => member.event_id))
      if (!arr(theme.pending_narrative_event_ids).some((eventId) => scopedIds.has(eventId))) return null
    }
    return 'awaiting_revalidation'
  }
  if (!theme.narrative) {
    // Pre-contract Claude/Groq rows can carry a polished model label yet no versioned narrative or queue
    // flag. They are migration work, not proof that nothing formed and not an already validated theme.
    const legacyModelNamed = theme.status === 'live'
      && (theme.generation === 'claude' || theme.generation === 'groq' || theme.generation === 'llm')
    if (theme.needs_validation || theme.needs_rename || legacyModelNamed) return 'awaiting_validation'
    if (theme.generation === 'deterministic') return 'building_evidence'
  }
  return null
}

function stateBlocker(state: ThemeFormationState): string {
  switch (state) {
    case 'awaiting_validation':
      return 'Awaiting a compiler pass; this provisional cluster is not an investment thesis.'
    case 'awaiting_revalidation':
      return 'New or changed evidence still needs compiler classification before this narrative can seed an idea.'
    case 'blocked_incomplete_audit':
      return 'The bounded audit is incomplete; the cluster cannot be compiled until its evidence is rebuilt.'
    case 'building_evidence':
      return 'The pattern is still building enough evidence to enter the bounded validation queue.'
  }
}

function formationEvidenceRow(member: ThemeMember, stance: ThemeFormationEvidence['stance']): ThemeFormationEvidence | null {
  const foundAt = validIso(member.found_at)
  const source = typeof member.source_name === 'string' ? member.source_name.trim().slice(0, 160) : ''
  const url = exactThemeEvidenceUrl(member.url)?.slice(0, 2_000) || ''
  const headline = String((member.headline_en && member.headline_en.trim()) || member.headline || '').trim().slice(0, 500)
  if (!member.event_id?.trim() || !headline || !foundAt || !source || !url) return null
  return {
    event_id: member.event_id.trim().slice(0, 160),
    headline,
    found_at: foundAt,
    score: Math.min(100, count(member.score)),
    source_tier: typeof member.tier === 'string' && member.tier.trim() ? member.tier.trim().slice(0, 60) : 'unconfirmed',
    source_name: source,
    url,
    stance,
  }
}

function candidateFor(
  theme: Theme,
  members: ThemeMember[],
  now: Date,
  scoped: boolean,
): ThemeFormationCandidate | null {
  const state = formationState(theme, members, scoped)
  if (!state || !members.length) return null
  // Diagnostic visibility still carries an evidence bar: at least two distinct, non-routine, exactly
  // sourced rows, with one current observation. An old/noisy keyword bag remains internal even if it has
  // compiler debt. `uniqueThemeEvidenceMembers` applies the same routine filing/law-firm exclusions and
  // family dedupe as qualification; exact provenance requires both a named source and an HTTP(S) URL.
  const displayEvidence = uniqueThemeEvidenceMembers(members).filter(hasExactThemeProvenance)
  if (displayEvidence.length < 2) return null
  const nowMs = now.getTime()
  if (!displayEvidence.some((member) => {
    const foundMs = Date.parse(member.found_at)
    return Number.isFinite(foundMs) && foundMs <= nowMs + 5 * 60_000 && nowMs - foundMs <= MAX_FORMATION_AGE_MS
  })) return null
  const companies = companiesForMembers(theme, members)
  const qualified = qualifyTheme(theme, now, members, companies, scoped)
  const pendingIds = state === 'awaiting_revalidation' ? new Set(arr(theme.pending_narrative_event_ids)) : new Set<string>()
  const memberById = new Map(members.map((member) => [member.event_id, member]))
  // Pin the exact observations that quarantined an existing narrative ahead of the prior classified proof.
  // Their status is deliberately `unclassified`: appearing here must never let new evidence masquerade as
  // support or disconfirmation before the compiler has adjudicated it. Scoped callers can resolve IDs only
  // against their projected member set, so an out-of-slice pending row cannot leak through this excerpt.
  const pendingEvidence = [...pendingIds].flatMap((eventId) => {
    const member = memberById.get(eventId)
    const row = member ? formationEvidenceRow(member, 'unclassified') : null
    return row ? [row] : []
  })
  const classifiedEvidence = qualified.evidence.flatMap((row) => {
    if (!row.source_name || !exactThemeEvidenceUrl(row.url)) return []
    return [{ ...row, url: exactThemeEvidenceUrl(row.url), stance: row.stance } satisfies ThemeFormationEvidence]
  })
  const exactEvidence: ThemeFormationEvidence[] = []
  const seenEvidence = new Set<string>()
  for (const row of [...pendingEvidence, ...classifiedEvidence]) {
    if (seenEvidence.has(row.event_id)) continue
    seenEvidence.add(row.event_id)
    exactEvidence.push(row)
    if (exactEvidence.length >= MAX_FORMATION_EVIDENCE) break
  }
  if (exactEvidence.length < 2) return null
  const blockers = [stateBlocker(state), ...qualified.assessment.blockers]
    .filter((value, index, all) => value && all.indexOf(value) === index)
    .slice(0, MAX_FORMATION_BLOCKERS)
  return {
    theme_id: theme.theme_id,
    provisional_label: String(theme.name || 'Emerging cluster').trim().slice(0, 100) || 'Emerging cluster',
    investable: false,
    state,
    queued_at: validIso(theme.validation_queued_at),
    attempted_at: validIso(theme.validation_attempted_at),
    distinct_evidence_count: displayEvidence.length,
    high_quality_evidence_count: displayEvidence.filter(isSupportingThemeEvidence).length,
    // Raw rows only. Do not expose an old narrative's thesis, expression or conviction through this
    // provisional lane. Qualification already binds each excerpt back to the exact member provenance.
    evidence: exactEvidence,
    blockers,
  }
}

export type ThemeFormationMemberProjector = (theme: Theme) => ThemeMember[]

export interface ThemeCompilerDebt {
  total: number
  awaiting_validation: number
  awaiting_revalidation: number
  blocked_incomplete_audit: number
  oldest_queued_at: string | null
}

/** Normalize persisted queue counts independently from the public formation excerpt. */
export function normalizeThemeCompilerDebt(value: unknown): ThemeCompilerDebt | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const raw = value as Record<string, unknown>
  const keys = ['total', 'awaiting_validation', 'awaiting_revalidation', 'blocked_incomplete_audit'] as const
  if (keys.some((key) => !Number.isInteger(Number(raw[key])) || Number(raw[key]) < 0)) return null
  const debt = {
    total: count(raw.total),
    awaiting_validation: count(raw.awaiting_validation),
    awaiting_revalidation: count(raw.awaiting_revalidation),
    blocked_incomplete_audit: count(raw.blocked_incomplete_audit),
    oldest_queued_at: raw.oldest_queued_at === null ? null : validIso(raw.oldest_queued_at),
  }
  if ((raw.oldest_queued_at !== null && !debt.oldest_queued_at)
    || debt.total !== debt.awaiting_validation + debt.awaiting_revalidation + debt.blocked_incomplete_audit) return null
  return debt
}

/** Compiler health describes ALL durable work, including old or source-incomplete rows that are unsafe
 * to show in formation_queue. Hiding those rows from the PM surface must not make the compiler look idle. */
export function compilerDebtForThemes(
  themes: Theme[],
  projectMembers?: ThemeFormationMemberProjector,
): ThemeCompilerDebt {
  let awaitingValidation = 0
  let awaitingRevalidation = 0
  let blockedIncompleteAudit = 0
  const queueTimes: string[] = []
  for (const theme of themes) {
    const members = projectMembers ? arr(projectMembers(theme)) : arr(theme.members)
    if (!members.length) continue
    const state = formationState(theme, members, Boolean(projectMembers))
    if (state === 'awaiting_validation') awaitingValidation++
    else if (state === 'awaiting_revalidation') awaitingRevalidation++
    else if (state === 'blocked_incomplete_audit') blockedIncompleteAudit++
    else continue
    const queuedAt = validIso(theme.validation_queued_at)
    if (queuedAt) queueTimes.push(queuedAt)
  }
  return {
    total: awaitingValidation + awaitingRevalidation + blockedIncompleteAudit,
    awaiting_validation: awaitingValidation,
    awaiting_revalidation: awaitingRevalidation,
    blocked_incomplete_audit: blockedIncompleteAudit,
    oldest_queued_at: queueTimes.sort()[0] || null,
  }
}

/** Build a bounded queue while retaining full state counts so the UI never mistakes the excerpt for all
 * outstanding work. A scoped projector must return only evidence inside the requested slice. */
export function buildThemeFormationQueue(
  themes: Theme[],
  now: Date,
  projectMembers?: ThemeFormationMemberProjector,
): ThemeFormationQueue {
  const scoped = Boolean(projectMembers)
  const candidates = themes.flatMap((theme) => {
    const members = projectMembers ? arr(projectMembers(theme)) : arr(theme.members)
    const candidate = candidateFor(theme, members, now, scoped)
    return candidate ? [candidate] : []
  }).sort((a, b) => {
    const newest = (candidate: ThemeFormationCandidate) => Math.max(0, ...candidate.evidence.map((row) => Date.parse(row.found_at) || 0))
    // PM diagnostics prioritize the newest safely displayable facts. Compiler FIFO/fairness is a separate
    // engine concern; surfacing the oldest queue clock first would foreground stale debt over current flow.
    return newest(b) - newest(a)
      || b.high_quality_evidence_count - a.high_quality_evidence_count
      || b.distinct_evidence_count - a.distinct_evidence_count
      || a.theme_id.localeCompare(b.theme_id)
  })
  const shown = candidates.slice(0, MAX_FORMATION_CANDIDATES)
  const stateCount = (state: ThemeFormationState) => candidates.filter((candidate) => candidate.state === state).length
  return {
    total: candidates.length,
    shown: shown.length,
    hidden: Math.max(0, candidates.length - shown.length),
    awaiting_validation: stateCount('awaiting_validation'),
    awaiting_revalidation: stateCount('awaiting_revalidation'),
    blocked_incomplete_audit: stateCount('blocked_incomplete_audit'),
    building_evidence: stateCount('building_evidence'),
    candidates: shown,
  }
}

/** Pair the latest durable compiler observation with queue debt recomputed from the current ledger/slice.
 * A read-time projection may advance `observed_at`, but the last attempt clock never does. */
export function buildThemeCompilerHealth(
  queue: ThemeFormationQueue,
  now: Date,
  attemptValue?: ThemeCompilerAttempt | null,
  debt: ThemeCompilerDebt = {
    total: queue.awaiting_validation + queue.awaiting_revalidation + queue.blocked_incomplete_audit,
    awaiting_validation: queue.awaiting_validation,
    awaiting_revalidation: queue.awaiting_revalidation,
    blocked_incomplete_audit: queue.blocked_incomplete_audit,
    oldest_queued_at: queue.candidates
      .filter((candidate) => candidate.state !== 'building_evidence' && candidate.queued_at)
      .map((candidate) => candidate.queued_at as string)
      .sort()[0] || null,
  },
): ThemeCompilerHealth {
  const attempt = normalizeThemeCompilerAttempt(attemptValue)
  const runnable = debt.awaiting_validation + debt.awaiting_revalidation

  let state: ThemeCompilerHealth['state'] = 'idle'
  let blocker: ThemeCompilerBlocker | null = null
  let message = queue.building_evidence
    ? `${queue.building_evidence} provisional pattern${queue.building_evidence === 1 ? ' is' : 's are'} still building evidence.`
    : 'No theme compilation work is queued.'
  if (runnable > 0) {
    if (attempt && (attempt.state === 'blocked' || attempt.state === 'skipped') && attempt.blocker) {
      state = 'blocked'
      blocker = attempt.blocker
      message = attempt.message || `${runnable} theme candidate${runnable === 1 ? ' is' : 's are'} waiting for compiler capacity.`
    } else if (attempt?.state === 'failed') {
      state = 'degraded'
      blocker = attempt.blocker
      message = attempt.message || 'The last compiler attempt failed; queued candidates remain non-investable.'
    } else {
      state = 'ready'
      message = attempt?.state === 'succeeded'
        ? `${runnable} theme candidate${runnable === 1 ? ' remains' : 's remain'} queued after the last bounded compiler pass.`
        : `${runnable} theme candidate${runnable === 1 ? ' is' : 's are'} queued; no compiler attempt is recorded yet.`
    }
  } else if (debt.blocked_incomplete_audit > 0) {
    state = 'degraded'
    message = `${debt.blocked_incomplete_audit} cluster${debt.blocked_incomplete_audit === 1 ? ' has' : 's have'} an incomplete audit and must be rebuilt before compilation.`
  }

  return {
    state,
    observed_at: now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
    provider: attempt?.provider || 'none',
    blocker,
    message,
    queue: {
      ...debt,
    },
    last_attempt: attempt,
  }
}
