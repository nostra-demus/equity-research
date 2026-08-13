import type {
  DiscoveredFeed,
  FeedHealthPayloadState,
  FeedHealthState,
  PipelineEntry,
  PipelineSubjectStatus,
  RecommendedNeed,
  RepairStatus,
} from '../../lib/types'

// One display contract for connector-v2 outcomes.  Severity is deliberately explicit: object/subject order
// is not evidence, so the same set of subject rows must always choose the same "worst" status.
export interface FeedHealthDisplay {
  label: string
  hint: string
  severity: number
}

export const FEED_HEALTH_DISPLAY: Record<FeedHealthState, FeedHealthDisplay> = {
  current: {
    label: 'Current',
    hint: 'the last sweep found or published a valid current dataset',
    severity: 0,
  },
  no_new_release: {
    label: 'No new release',
    hint: 'the source published nothing new, but the last verified dataset is still inside its freshness window',
    severity: 10,
  },
  manual: {
    label: 'Manual feed',
    hint: 'automatic fetching is disabled; a person stages this feed and the pool file determines freshness',
    severity: 20,
  },
  pending: {
    label: 'Pending',
    hint: 'a sweep says this feed needs work, but no real fetch attempt has completed yet',
    severity: 30,
  },
  never_run: {
    label: 'Never run',
    hint: 'the fetcher has never swept this connector for this subject',
    severity: 40,
  },
  no_pool: {
    label: 'No pool',
    hint: 'the subject data folder is unavailable on the fetching host, so the connector cannot publish',
    severity: 50,
  },
  stalled: {
    label: 'Stalled',
    hint: 'the connector did not advance to a current release; it needs another fetch or a repair',
    severity: 60,
  },
  credentials_missing: {
    label: 'Credentials missing',
    hint: 'the source rejected or could not find the credentials required to fetch',
    severity: 70,
  },
  suspect: {
    label: 'Suspect — held',
    hint: 'the fetched data failed a quality or history check and was not published',
    severity: 80,
  },
  schema_failed: {
    label: 'Schema failed',
    hint: 'the fetched payload or provenance failed validation and was not published',
    severity: 90,
  },
  broken: {
    label: 'Broken',
    hint: 'the connector reached the repeated-failure threshold and needs repair',
    severity: 100,
  },
  quarantined: {
    label: 'Quarantined',
    hint: 'publishing was blocked by an integrity rule; the existing pool data was left unchanged',
    severity: 110,
  },
}

const V2_STATES = new Set<FeedHealthState>(Object.keys(FEED_HEALTH_DISPLAY) as FeedHealthState[])

export function isFeedHealthState(value: unknown): value is FeedHealthState {
  return typeof value === 'string' && V2_STATES.has(value as FeedHealthState)
}

/** Old engines send `ok` / `failing`; adapt at the display boundary instead of keeping legacy labels alive. */
export function normalizeFeedHealth(state: FeedHealthPayloadState): FeedHealthState {
  if (state === 'ok') return 'current'
  if (state === 'failing') return 'stalled'
  return state
}

/** Prefer a precise v2 outcome only when a mixed deploy still carries a legacy rolled-up health value. */
export function feedHealthOf(status: Pick<PipelineSubjectStatus, 'health' | 'fetchOutcome'>): FeedHealthState {
  if ((status.health === 'ok' || status.health === 'failing') && isFeedHealthState(status.fetchOutcome)) {
    return status.fetchOutcome
  }
  return normalizeFeedHealth(status.health)
}

export function feedHealthDisplayOf(status: Pick<PipelineSubjectStatus, 'health' | 'fetchOutcome'>): FeedHealthDisplay {
  return FEED_HEALTH_DISPLAY[feedHealthOf(status)]
}

const FILE_STATUS_SEVERITY: Record<PipelineSubjectStatus['status'], number> = {
  fresh: 0,
  stale: 1,
  missing: 2,
  unknown: 3,
}

/**
 * Pick one subject for the row tooltip without depending on manifest order.  Health is the primary key;
 * file freshness breaks a health tie; the subject name is the stable final tie-breaker.
 */
export function worstPipelineStatus(statuses: PipelineSubjectStatus[]): PipelineSubjectStatus | undefined {
  return [...statuses].sort((a, b) => {
    const health = feedHealthDisplayOf(b).severity - feedHealthDisplayOf(a).severity
    if (health) return health
    const freshness = FILE_STATUS_SEVERITY[b.status] - FILE_STATUS_SEVERITY[a.status]
    return freshness || a.subject.localeCompare(b.subject)
  })[0]
}

/** Ledger damage is independent of fetch health, so collect it even when every subject is current. */
export function ledgerIntegrityWarningOf(statuses: PipelineSubjectStatus[]): string | null {
  const warnings = [...new Set(statuses
    .map((status) => status.ledgerIntegrityWarning?.trim())
    .filter((warning): warning is string => Boolean(warning)))].sort()
  return warnings.length ? warnings.join('\n') : null
}

const USABLE_HEALTH = new Set<FeedHealthState>(['current', 'no_new_release', 'manual'])

/** The same proof `built_by` represents: a fresh file plus a current/usable connector outcome. */
export function pipelineIsUsable(pipeline: PipelineEntry, subject?: string): boolean {
  const statuses = subject ? pipeline.statuses.filter((s) => s.subject === subject) : pipeline.statuses
  return statuses.length > 0 && statuses.every((s) => s.status === 'fresh' && USABLE_HEALTH.has(feedHealthOf(s)))
}

/**
 * A first sweep is a queue state, not 27 independent incidents.  Keep this classification at the display
 * boundary: the server must still report the feeds as non-usable for sufficiency until a real sweep validates
 * them, but the operations UI should reserve "Action required" for an actual source/data failure.
 */
export function pipelineIsWaitingForFirstCheck(pipeline: PipelineEntry): boolean {
  // `unknown` is what a host without the shared pool reports.  Its default never_run rows are not proof that
  // the doer is waiting; only the server's observable `attention` projection may enter this display bucket.
  if (pipeline.verdict !== 'attention') return false
  if (!pipeline.statuses.length) return false
  let waiting = false
  for (const status of pipeline.statuses) {
    const health = feedHealthOf(status)
    if (health === 'never_run' || health === 'pending') {
      waiting = true
      continue
    }
    if (!USABLE_HEALTH.has(health) || status.status !== 'fresh' || status.projectionIntact === false) return false
  }
  return waiting
}

export interface RepairDisplay {
  label: string
  row: string
  detail: string | null
}

export const REPAIR_DISPLAY: Record<RepairStatus, RepairDisplay> = {
  none: {
    label: 'No repair',
    row: '',
    detail: null,
  },
  repairing: {
    label: 'Repair running',
    row: 'auto-repair running',
    detail: 'Auto-repair is working on this connector now. The feed remains unavailable until a later fetch proves the fix.',
  },
  pr_open: {
    label: 'Repair PR open',
    row: 'repair PR open',
    detail: 'A repair pull request is open. The feed is not fixed yet; it becomes usable only after the change is merged, deployed, and a successful fetch verifies it.',
  },
  verified: {
    label: 'Repair verified',
    row: 'repair verified',
    detail: 'The repair was verified by a successful fetch after the merged fix was deployed.',
  },
  assessed: {
    label: 'Repair assessed',
    row: 'repair inactive — needs attention',
    detail: 'No automatic repair is running. The feed still needs manual attention before it can become usable.',
  },
  source_gone: {
    label: 'Source unavailable',
    row: 'source unavailable',
    detail: 'Auto-repair confirmed that the source is permanently unavailable. This connector cannot recover until its source contract is replaced.',
  },
}

export interface PipelineRepairState { status: RepairStatus; prUrl: string | null }

/** Subject-specific state wins; `repair` is the old connector-wide wire fallback. */
export function repairForSubject(pipeline: PipelineEntry, subject: string): PipelineRepairState {
  return pipeline.repairs?.[subject] ?? pipeline.repair
}

const REPAIR_SEVERITY: Record<RepairStatus, number> = {
  none: 0, verified: 1, assessed: 2, repairing: 3, pr_open: 4, source_gone: 5,
}

/** Deterministic row-level repair summary without hiding a scoped repair behind `repair:none`. */
export function worstPipelineRepair(pipeline: PipelineEntry): { subject: string; repair: PipelineRepairState } {
  const rows = pipeline.subjects.map((subject) => ({ subject, repair: repairForSubject(pipeline, subject) }))
  return rows.sort((a, b) => REPAIR_SEVERITY[b.repair.status] - REPAIR_SEVERITY[a.repair.status]
    || a.subject.localeCompare(b.subject))[0] ?? { subject: '', repair: pipeline.repair }
}

/** Find the existing code path even when an older `/api/pipelines` row omits `connector_exists`. */
export function connectorForNeed(need: RecommendedNeed, pipelines: PipelineEntry[]): PipelineEntry | undefined {
  const explicit = need.built_by || need.connector_exists
  if (explicit) return pipelines.find((p) => p.id === explicit)
  return pipelines.find((p) => p.subjects.includes(need.subject) && p.satisfies.includes(need.need_id))
}

/**
 * A discovery result that names an already-covered need is a repair/replacement candidate, not authority to
 * create a second primary connector.  The subject and exact need ids are the only safe client-side join:
 * source hosts can publish many unrelated datasets, and loose series-name matching would suppress valid feeds.
 */
export function connectorForCandidate(
  feed: Pick<DiscoveredFeed, 'verdict'>,
  subject: string,
  pipelines: PipelineEntry[],
): PipelineEntry | undefined {
  const needIds = new Set(feed.verdict.matched_need_ids)
  if (!needIds.size) return undefined
  const target = subject.trim().toUpperCase()
  return pipelines.find((pipeline) => (
    pipeline.subjects.includes(target)
    && pipeline.satisfies.some((needId) => needIds.has(needId))
  ))
}

/** Server coverage survives a stale pipeline read; local manifest matching is only the fallback. */
export function connectorIdForCandidate(
  feed: Pick<DiscoveredFeed, 'verdict' | 'connector_exists'>,
  subject: string,
  pipelines: PipelineEntry[],
): string | undefined {
  return feed.connector_exists || connectorForCandidate(feed, subject, pipelines)?.id
}

export type ExistingConnectorAction = 'usable' | 'wait' | 'repair' | 'replace'
export interface ExistingConnectorGuidance {
  id: string
  action: ExistingConnectorAction
  message: string
}

/**
 * An unhealthy connector keeps the need open, but it must never create a second "Find & build" invitation.
 * Explicit server fields win; manifest coverage is only the deploy-skew fallback.
 */
export function existingConnectorGuidance(
  need: RecommendedNeed,
  pipelines: PipelineEntry[],
): ExistingConnectorGuidance | null {
  const pipeline = connectorForNeed(need, pipelines)
  const id = need.built_by || need.connector_exists || pipeline?.id
  if (!id) return null
  if (need.built_by) return { id, action: 'usable', message: 'current and usable; this need is already closed' }
  if (!pipeline) return { id, action: 'wait', message: 'waiting for its feed health; do not build a duplicate' }

  switch (repairForSubject(pipeline, need.subject).status) {
    case 'repairing':
      return { id, action: 'wait', message: 'repair is running; wait for a verified fetch' }
    case 'pr_open':
      return { id, action: 'wait', message: 'repair PR is open; wait for merge, deploy, and a verified fetch' }
    case 'verified':
      return { id, action: 'wait', message: 'repair is verified; wait for the pool read to become current' }
    case 'source_gone':
      return { id, action: 'replace', message: 'source is unavailable; replace this connector’s source contract' }
    case 'assessed':
      return { id, action: 'repair', message: 'repair found no code fix; this feed still needs attention' }
    case 'none':
      break
  }

  const worst = worstPipelineStatus(pipeline.statuses)
  const state = worst ? feedHealthOf(worst) : 'never_run'
  if (state === 'pending' || state === 'never_run') {
    return { id, action: 'wait', message: 'waiting for its first completed fetch; do not build a duplicate' }
  }
  if (state === 'current' || state === 'no_new_release' || state === 'manual') {
    return { id, action: 'wait', message: 'waiting for a fresh pool file; do not build a duplicate' }
  }
  if (state === 'no_pool') {
    return { id, action: 'repair', message: 'restore its pool access; do not build a duplicate' }
  }
  if (state === 'credentials_missing') {
    return { id, action: 'repair', message: 'add or repair its credentials; do not build a duplicate' }
  }
  return { id, action: 'repair', message: 'repair this feed; do not build a duplicate' }
}
