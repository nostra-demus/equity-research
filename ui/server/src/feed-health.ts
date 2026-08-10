// Feed health — the ONE parse of #287's fetch ledger (`<DATA_DIR>/_connectors/run_ledger.ndjson`), which
// run_connectors.py appends one row to per connector × subject per sweep. Two very different questions read
// the same rows, so they read them through this one module (CLAUDE.md §2 — no parallel parse of the same
// truth):
//   • the repair watchdog (connector-runner.ts) asks "which feeds are broken enough to spend a repair on?"
//   • the Data Library (pipelines.ts → GET /api/pipelines) asks "is this feed live, or is it broken?"
//
// Pool freshness (is there a recent FILE) and fetch health (did the last FETCH succeed) are different facts
// and are kept separate: a feed can be fresh-but-broken (the file is inside its SLA, the source has since
// started 500ing) or stale-but-healthy (the source itself has published nothing new). pipelines.ts joins the
// two; this module never guesses at the file side.
//
// Never throws: an absent/unreadable ledger reads as "no rows", and every malformed line is skipped.

import fs from 'node:fs'
import path from 'node:path'
import { DATA_DIR } from './config'

// The decisions run_connectors.py writes. Anything else is carried through verbatim and treated as unknown.
export type FetchDecision =
  | 'refetched' // fetched now, successfully
  | 'fresh' // inside its SLA, no fetch needed
  | 'failed' // a fetch was attempted and failed (after its own in-sweep retries)
  | 'deferred' // still due, but the persisted actual-attempt clock has not reached its retry boundary
  | 'skipped_no_pool' // no data/<SUBJECT>/ on this host — nothing to write into
  | 'skipped_manual' // the manifest opted out of auto-fetch (hand-staged)
  | 'would_refetch' // --dry-run only: it WOULD have fetched
  | 'would_reproject'
  | 'reprojected'
  | 'recovered_commit'
  | 'manual_ingested'

export type FetchOutcome =
  | 'current' | 'no_new_release' | 'stalled' | 'schema_failed' | 'suspect'
  | 'credentials_missing' | 'broken' | 'quarantined' | 'manual' | 'no_pool'
  | 'pending' | string

/**
 * The health of one connector × subject, as the fetch ledger last recorded it.
 *   ok         — the last sweep succeeded (refetched) or found it already inside its SLA (fresh)
 *   failing    — the last sweep failed, but not yet for `BROKEN_THRESHOLD` sweeps in a row (could be a blip)
 *   broken     — the last sweep failed and the failure has persisted; the source has likely changed/died
 *   no_pool    — the sweep ran but there is no pool folder for this subject on the fetching host
 *   manual     — auto-fetch is off for this feed by its own manifest; a human stages the file
 *   pending    — a dry-run sweep said it would refetch; no real attempt recorded yet
 *   never_run  — the runner has never swept this connector × subject at all
 */
export type FeedHealthState =
  | 'current' | 'no_new_release' | 'stalled' | 'schema_failed' | 'suspect'
  | 'credentials_missing' | 'broken' | 'quarantined' | 'no_pool' | 'manual'
  | 'pending' | 'never_run'

export interface FeedHealth {
  connector: string
  subject: string
  state: FeedHealthState
  decision: FetchDecision | string | null // the raw last decision, or null when never swept
  outcome: FetchOutcome | null // the precise v2 result; null on a legacy/never-run row
  failureKind: string | null // technical detail: no_output/schema_error/publish_error/etc.
  lastSweepAt: string | null // ISO — when that decision was recorded
  message: string // the last row's message (the fetch error text on a failure)
  failStreak: number // consecutive actual failed acquisitions; a deferred scheduler wake preserves it
  attempts: number // attempts the last sweep made
  datasetId: string | null
  seriesId: string | null
  provider: string | null
  latestAsOf: string | null
  retrievedAt: string | null
  contentSha256: string | null
  vintageId: string | null
  connectorFingerprint: string | null
  publisherContractFingerprint: string | null
  connectorCommit: string | null
  // Independent of the feed outcome: the runner may retain valid rows while skipping damaged ledger rows.
  ledgerIntegrityWarning: string | null
}

// A feed counts as BROKEN only after this many consecutive failed acquisitions. The runner retries inside
// one acquisition and throttles later due attempts by cadence, so five-minute scheduler wakes marked
// `deferred` neither reset nor advance this streak. The repair watchdog spends real money on a repair, and
// the cockpit paints a red "broken" headline — both want the same sustained-failure definition.
export const BROKEN_THRESHOLD = 3

export const feedKey = (connector: string, subject: string): string => `${connector}::${subject}`

function stateFor(decision: string, outcome: string | null, failStreak: number, threshold: number): FeedHealthState {
  const publicState = outcome && [
    'current', 'no_new_release', 'stalled', 'schema_failed', 'suspect', 'credentials_missing',
    'broken', 'quarantined', 'manual', 'no_pool', 'pending',
  ].includes(outcome) ? outcome as FeedHealthState : null
  switch (decision) {
    case 'refetched':
      return publicState ?? 'current'
    case 'manual_ingested':
      return publicState ?? 'current'
    case 'reprojected':
    case 'recovered_commit':
      return 'current'
    case 'fresh':
      return publicState ?? 'current'
    case 'failed':
    case 'deferred':
      if (publicState === 'credentials_missing' || publicState === 'suspect' || publicState === 'quarantined') return publicState
      if (failStreak >= threshold) return 'broken'
      return publicState === 'broken' ? 'stalled' : (publicState ?? 'stalled')
    case 'skipped_no_pool':
      return 'no_pool'
    case 'skipped_manual':
      return 'manual'
    case 'would_refetch':
    case 'would_reproject':
      return 'pending'
    default:
      return 'pending'
  }
}

const DECISION_OUTCOMES: Record<string, Set<string>> = {
  refetched: new Set(['current', 'no_new_release', 'stalled']),
  manual_ingested: new Set(['current', 'no_new_release', 'stalled']),
  reprojected: new Set(['current']),
  recovered_commit: new Set(['current']),
  fresh: new Set(['current']),
  failed: new Set(['stalled', 'schema_failed', 'suspect', 'credentials_missing', 'broken', 'quarantined']),
  deferred: new Set(['current', 'no_new_release', 'stalled', 'schema_failed', 'suspect', 'credentials_missing', 'broken', 'quarantined']),
  skipped_no_pool: new Set(['no_pool']),
  skipped_manual: new Set(['manual']),
  would_refetch: new Set(['pending', 'dry_run']),
  would_reproject: new Set(['pending']),
}

function validDecisionOutcome(decision: string, outcome: string | null): boolean {
  const allowed = DECISION_OUTCOMES[decision]
  if (!allowed) return false
  return outcome != null && allowed.has(outcome)
}

/**
 * PURE: fold the raw ledger text into one FeedHealth per connector × subject, keyed `<connector>::<subject>`.
 * Rows are in append (chronological) order, so the last row for a key wins and the failure streak is the
 * trailing run of actual `failed` decisions. `deferred` preserves that streak because no acquisition ran;
 * every other accepted decision resets it. Malformed lines are skipped; a row counts only when it carries
 * string `connector` + `subject` and a non-null `decision`.
 */
export function feedHealthFromLedger(ledgerText: string, threshold: number = BROKEN_THRESHOLD): Map<string, FeedHealth> {
  const out = new Map<string, FeedHealth>()
  for (const line of (ledgerText || '').split('\n')) {
    const t = line.trim()
    if (!t) continue
    let row: any
    try { row = JSON.parse(t) } catch { continue }
    if (!row || typeof row !== 'object' || Array.isArray(row)) continue
    if (typeof row.connector !== 'string' || typeof row.subject !== 'string' || row.decision == null) continue
    const decision = String(row.decision)
    const outcome = typeof row.outcome === 'string' ? row.outcome : null
    if (!validDecisionOutcome(decision, outcome)) continue
    const key = feedKey(row.connector, row.subject)
    const prior = out.get(key)
    const nonEscalating = outcome === 'credentials_missing' || outcome === 'suspect' || outcome === 'quarantined'
    const failStreak = decision === 'deferred'
      ? (prior?.failStreak ?? 0)
      : decision === 'failed' && !nonEscalating ? (prior?.failStreak ?? 0) + 1 : 0
    const ts = Number(row.ts)
    const attempts = Number(row.attempts)
    out.set(key, {
      connector: row.connector,
      subject: row.subject,
      state: stateFor(decision, outcome, failStreak, threshold),
      decision,
      outcome,
      failureKind: typeof row.failure_kind === 'string' ? row.failure_kind : null,
      lastSweepAt: Number.isFinite(ts) && ts > 0 ? new Date(ts * 1000).toISOString().replace(/\.\d{3}Z$/, 'Z') : null,
      message: String(row.message || ''),
      failStreak,
      attempts: Number.isFinite(attempts) ? attempts : 0,
      datasetId: typeof row.dataset_id === 'string' ? row.dataset_id : null,
      seriesId: typeof row.series_id === 'string' ? row.series_id : null,
      provider: typeof row.provider === 'string' ? row.provider : null,
      latestAsOf: typeof row.latest_as_of === 'string' ? row.latest_as_of : null,
      retrievedAt: typeof row.retrieved_at === 'string' ? row.retrieved_at : null,
      contentSha256: typeof row.content_sha256 === 'string' ? row.content_sha256 : null,
      vintageId: typeof row.vintage_id === 'string' ? row.vintage_id : null,
      connectorFingerprint: typeof row.connector_fingerprint === 'string' ? row.connector_fingerprint : null,
      publisherContractFingerprint: typeof row.publisher_contract_fingerprint === 'string'
        ? row.publisher_contract_fingerprint : null,
      connectorCommit: typeof row.connector_commit === 'string' ? row.connector_commit : null,
      ledgerIntegrityWarning: typeof row.ledger_integrity_warning === 'string' && row.ledger_integrity_warning.trim()
        ? row.ledger_integrity_warning : null,
    })
  }
  return out
}

/** The health of every connector × subject the fetch ledger knows about. Empty map when it is unreadable. */
export function readFeedHealth(threshold: number = BROKEN_THRESHOLD): Map<string, FeedHealth> {
  let text = ''
  try { text = fs.readFileSync(path.join(DATA_DIR, '_connectors', 'run_ledger.ndjson'), 'utf8') } catch { return new Map() }
  return feedHealthFromLedger(text, threshold)
}

/** The health of ONE connector × subject, or the never_run default when the ledger has no row for it. */
export function feedHealthOf(
  health: Map<string, FeedHealth>, connector: string, subject: string,
): FeedHealth {
  return health.get(feedKey(connector, subject)) ?? {
    connector, subject, state: 'never_run', decision: null, outcome: null, failureKind: null, lastSweepAt: null, message: '', failStreak: 0, attempts: 0,
    datasetId: null, seriesId: null, provider: null, latestAsOf: null, retrievedAt: null, contentSha256: null,
    vintageId: null,
    connectorFingerprint: null, publisherContractFingerprint: null, connectorCommit: null,
    ledgerIntegrityWarning: null,
  }
}
