// Live, read-only board projection for news-lead idea snapshots. The JSON snapshots are the canonical
// store; screener/board/index.json is only a generated cache and may legitimately lag when its Python
// rebuild fails. Recomputing this small slice on every board GET also makes decay_at a live expiry rather
// than a boolean frozen at the last unrelated board rebuild.

import fs from 'node:fs'
import path from 'node:path'
import { parseRfc3339Ms } from '../../rfc3339'
import { IDEA_ARCHIVE_STORAGE_LIMIT_PER_SIDE, isSurfacedIdeaSnapshot, readIdeaArchiveStore, readIdeaSnapshots, type IdeaArchiveStoreStatus, type SurfacedIdea } from './ideas-store'

const CONFIRMED = new Set(['provisional', 'full_machine'])
const PASSED = new Set([
  'watchlist_no_edge', 'watchlist_no_world_change', 'watchlist_no_source',
  'watchlist_integrity_downgrade', 'watchlist_integrity_broken',
  'LOG', 'PARK', 'suppress',
])
const TERMINAL_INTEGRITY = new Set(['watchlist_integrity_downgrade', 'watchlist_integrity_broken'])
const DIRECTIONS = new Set(['long', 'short', 'pair'])
const READINESS = new Set(['check_now', 'needs_data', 'watch_only'])
const PRICED_IN = new Set(['priced', 'room', 'unknown'])

export interface ProjectedIdeaScorecard {
  surfaced_total: number
  live_count: number
  promoted_total: number
  machine_confirmed: number
  machine_passed: number
  machine_pending: number
  resolved: number
  up_votes: number
  down_votes: number
}

export interface LiveIdeasProjection {
  ideas: Record<string, unknown>[]
  ideas_archive: ProjectedIdeasArchive
  scorecard: ProjectedIdeaScorecard
}

export interface ProjectedIdeasArchiveCount {
  total_count: number
  shown_count: number
  hidden_count: number
}

export interface ProjectedIdeasArchive extends ProjectedIdeasArchiveCount {
  schema_version: 'ideas-archive/v1'
  health: {
    status: IdeaArchiveStoreStatus
    file_count: number
    suppression_count: number
    corrupt_count: number
    invalid_count: number
    error: string | null
  }
  side_counts: {
    long: ProjectedIdeasArchiveCount
    short: ProjectedIdeasArchiveCount
  }
  /** Historical board rows that were seen but could not be proved expired. Never include them as rows. */
  unconfirmed_counts?: {
    long: number
    short: number
  }
  retention: {
    truncated: boolean
    evicted_count: number
    oldest_retained_at: string | null
    side_counts: {
      long: { evicted_count: number; oldest_retained_at: string | null }
      short: { evicted_count: number; oldest_retained_at: string | null }
    }
  }
  rows: Record<string, unknown>[]
}

/** A side cannot starve the other: each side can use the archive store's full retained capacity. */
export const IDEAS_ARCHIVE_MAX_PER_SIDE = IDEA_ARCHIVE_STORAGE_LIMIT_PER_SIDE

const HISTORY_RECOVERY_MANIFEST = 'board-history-recovery-manifest.json'
const HISTORY_RECOVERY_MANIFEST_SCHEMA = 'idea-board-recovery-manifest/v1'
const HISTORY_RECOVERY_SOURCE = 'screener/board/index.json'
const HISTORY_RECOVERY_MAX_BYTES = 1_000_000
const HISTORY_RECOVERY_MAX_OCCURRENCES = IDEA_ARCHIVE_STORAGE_LIMIT_PER_SIDE * 2 + 100
const HISTORY_RECOVERY_DECISIONS = new Set(['imported', 'skipped', 'suppressed', 'active'])
const IDEA_VERSION = /^IDEAV-[a-f0-9]{16}$/

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string') : []
}

function safeInt(value: unknown, fallback = 0): number {
  const n = Number(value)
  return Number.isFinite(n) ? Math.round(n) : fallback
}

function validId(value: unknown): value is string {
  return typeof value === 'string' && /^IDEA-[a-f0-9]{12}$/.test(value)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

/**
 * The recovery manifest records board-history occurrences that could not safely be restored. Return
 * no count unless the complete bounded manifest is readable and every occurrence identity is valid;
 * an absent/broken manifest must never be presented as zero missing history.
 */
function readUnconfirmedHistoryCounts(repoRoot: string): { long: number; short: number } | null {
  const manifestPath = path.join(repoRoot, 'screener', 'ledger', 'ideas_archive', HISTORY_RECOVERY_MANIFEST)
  try {
    const stat = fs.lstatSync(manifestPath)
    if (!stat.isFile() || stat.size <= 0 || stat.size > HISTORY_RECOVERY_MAX_BYTES) return null
    const value: unknown = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
    if (!isRecord(value)
      || value.schema_version !== HISTORY_RECOVERY_MANIFEST_SCHEMA
      || value.source_path !== HISTORY_RECOVERY_SOURCE
      || !Array.isArray(value.occurrences)
      || value.occurrences.length > HISTORY_RECOVERY_MAX_OCCURRENCES
    ) return null
    const counts = { long: 0, short: 0 }
    const seen = new Set<string>()
    for (const occurrence of value.occurrences) {
      if (!isRecord(occurrence)
        || !validId(occurrence.idea_id)
        || typeof occurrence.idea_version !== 'string' || !IDEA_VERSION.test(occurrence.idea_version)
        || !Number.isFinite(parseRfc3339Ms(occurrence.idea_version_started_at))
        || !DIRECTIONS.has(String(occurrence.direction))
        || !HISTORY_RECOVERY_DECISIONS.has(String(occurrence.decision))
        || typeof occurrence.reason !== 'string'
      ) return null
      const occurrenceKey = `${occurrence.idea_id}|${occurrence.idea_version}|${occurrence.idea_version_started_at}|${occurrence.direction}`
      if (seen.has(occurrenceKey)) return null
      seen.add(occurrenceKey)
      if (occurrence.decision !== 'skipped' || occurrence.reason !== 'no_committed_expiry_evidence') continue
      if (occurrence.direction === 'long' || occurrence.direction === 'pair') counts.long++
      if (occurrence.direction === 'short' || occurrence.direction === 'pair') counts.short++
    }
    return counts
  } catch {
    return null
  }
}

/** The projection uses the same complete persisted contract as the store; there is no looser UI shape. */
export function isProjectableIdeaSnapshot(value: unknown): value is SurfacedIdea {
  return isSurfacedIdeaSnapshot(value)
}

function readLatestFeedback(repoRoot: string): Map<string, 'up' | 'down' | null> {
  const latest = new Map<string, 'up' | 'down' | null>()
  let lines: string[]
  try {
    lines = fs.readFileSync(path.join(repoRoot, 'screener', 'ledger', 'ideas_feedback.ndjson'), 'utf8').split('\n')
  } catch {
    return latest
  }
  for (const line of lines) {
    if (!line.trim()) continue
    try {
      const row: any = JSON.parse(line)
      if (!validId(row?.idea_id)) continue
      if (row.polarity === 'up' || row.polarity === 'down') latest.set(row.idea_id, row.polarity)
      else if (row.polarity === 'clear') latest.set(row.idea_id, null)
    } catch {
      // One malformed append-only row cannot hide the remaining snapshots.
    }
  }
  return latest
}

function deepGrade(index: any, signalId: string | null): 'confirmed' | 'passed' | 'pending' {
  if (!signalId) return 'pending'
  const signal = Array.isArray(index?.signals) ? index.signals.find((x: any) => x?.signal_id === signalId) : null
  const thesis = Array.isArray(index?.theses) ? index.theses.find((x: any) => x?.signal_id === signalId) : null
  const integrity = thesis?.integrity_review?.routing
  const status = TERMINAL_INTEGRITY.has(integrity) ? integrity : signal?.status
  if (CONFIRMED.has(status)) return 'confirmed'
  if (PASSED.has(status)) return 'passed'
  return 'pending'
}

function latestUniqueSnapshots(repoRoot: string): SurfacedIdea[] {
  const byId = new Map<string, SurfacedIdea>()
  const rows = readIdeaSnapshots(repoRoot)
    .filter(isProjectableIdeaSnapshot)
    .sort((a, b) => String(a.updated_at || '').localeCompare(String(b.updated_at || '')))
  for (const row of rows) byId.set(row.idea_id, row)
  return [...byId.values()]
}

function projectIdeaRow(rec: SurfacedIdea, feedback: Map<string, 'up' | 'down' | null>, nowMs: number): any {
  const decayMs = parseRfc3339Ms(rec.decay_at)
  // Missing/malformed expiry can never create an immortal live lead. Keep the row visible in the
  // cooling lane so the malformed data is inspectable, but fail it closed as stale.
  const stale = !Number.isFinite(decayMs) || decayMs <= nowMs
  const vote = feedback.get(rec.idea_id) ?? null
  const status = rec.status === 'promoted' ? 'promoted' : 'live'
  const promotedSignalId = typeof rec.promoted_signal_id === 'string' && rec.promoted_signal_id ? rec.promoted_signal_id : null
  const conviction = safeInt(rec.conviction)
  const legacyEvidenceGate = rec.trade_score_basis === 'evidence_gate_v1'
  const legacyMissingChecks = legacyEvidenceGate
    ? ['live price, liquidity, and consensus', ...stringArray(rec.missing_checks)]
    : stringArray(rec.missing_checks)
  return {
    idea_id: rec.idea_id,
    idea_version: rec.idea_version,
    idea_version_started_at: rec.idea_version_started_at,
    ticker: rec.ticker.trim(),
    company: typeof rec.company === 'string' ? rec.company : null,
    exchange: typeof rec.exchange === 'string' ? rec.exchange : null,
    direction: DIRECTIONS.has(rec.direction) ? rec.direction : 'long',
    pair_with: typeof rec.pair_with === 'string' ? rec.pair_with : null,
    reason: typeof rec.reason === 'string' ? rec.reason : '',
    why_now: typeof rec.why_now === 'string' ? rec.why_now : '',
    conviction,
    conviction_basis: 'pre_edge_proxy',
    // V1 could call directory presence "liquidity" and emit check_now. During a rolling deploy its
    // cached score is not comparable with V2's always-needs-live-data ceiling, so demote it explicitly.
    trade_score: legacyEvidenceGate ? Math.min(safeInt(rec.trade_score, conviction), 44) : safeInt(rec.trade_score, conviction),
    trade_score_basis: rec.trade_score_basis === 'evidence_gate_v1' || rec.trade_score_basis === 'evidence_gate_v2'
      ? rec.trade_score_basis : 'pre_edge_proxy_legacy',
    trade_score_breakdown: rec.trade_score_breakdown && typeof rec.trade_score_breakdown === 'object' ? rec.trade_score_breakdown : null,
    trade_readiness: legacyEvidenceGate
      ? 'watch_only'
      : READINESS.has(rec.trade_readiness) ? rec.trade_readiness : 'needs_data',
    missing_checks: [...new Set(legacyMissingChecks)],
    learning: rec.learning && typeof rec.learning === 'object' ? rec.learning : null,
    priced_in: PRICED_IN.has(rec.priced_in) ? rec.priced_in : 'unknown',
    thesis_type: typeof rec.thesis_type === 'string' ? rec.thesis_type : 'company_specific',
    ...(rec.origin_type === undefined ? {} : {
      origin_type: rec.origin_type,
      source_themes: (rec.source_themes || []).map((theme) => ({ ...theme })),
    }),
    source_event_ids: stringArray(rec.source_event_ids),
    primary_source_event_id: typeof rec.primary_source_event_id === 'string' ? rec.primary_source_event_id : null,
    source_headlines: stringArray(rec.source_headlines),
    source_headline: typeof rec.source_headline === 'string' ? rec.source_headline : null,
    source_url: typeof rec.source_url === 'string' ? rec.source_url : null,
    source_name: typeof rec.source_name === 'string' ? rec.source_name : null,
    materiality_max: safeInt(rec.materiality_max),
    newest_source_at: typeof rec.newest_source_at === 'string' ? rec.newest_source_at : '',
    prior_coverage: rec.prior_coverage && typeof rec.prior_coverage === 'object' ? rec.prior_coverage : null,
    surfaced_at: typeof rec.surfaced_at === 'string' ? rec.surfaced_at : '',
    updated_at: typeof rec.updated_at === 'string' ? rec.updated_at : '',
    decay_at: typeof rec.decay_at === 'string' ? rec.decay_at : '',
    status,
    promoted_signal_id: promotedSignalId,
    feedback: vote,
    stale,
  }
}

function sideIncludes(row: any, side: 'long' | 'short'): boolean {
  return row.direction === side || (row.direction === 'pair' && typeof row.pair_with === 'string' && row.pair_with.length > 0)
}

function archiveRowKey(row: any): string { return `${row.idea_id}|${row.idea_version}|${row.idea_version_started_at}` }

function projectImportedArchiveRow(rec: Record<string, unknown>, archivedAt: string): Record<string, unknown> {
  const conviction = safeInt(rec.conviction)
  const legacyEvidenceGate = rec.trade_score_basis === 'evidence_gate_v1'
  const missingChecks = legacyEvidenceGate
    ? ['live price, liquidity, and consensus', ...stringArray(rec.missing_checks)]
    : stringArray(rec.missing_checks)
  return {
    idea_id: rec.idea_id,
    idea_version: rec.idea_version,
    idea_version_started_at: rec.idea_version_started_at,
    ticker: rec.ticker,
    company: rec.company,
    exchange: rec.exchange,
    direction: rec.direction,
    pair_with: rec.pair_with,
    reason: rec.reason,
    why_now: rec.why_now,
    conviction,
    conviction_basis: 'pre_edge_proxy',
    trade_score: legacyEvidenceGate ? Math.min(safeInt(rec.trade_score, conviction), 44) : safeInt(rec.trade_score, conviction),
    trade_score_basis: rec.trade_score_basis === 'evidence_gate_v1' || rec.trade_score_basis === 'evidence_gate_v2'
      ? rec.trade_score_basis : 'pre_edge_proxy_legacy',
    trade_score_breakdown: rec.trade_score_breakdown && typeof rec.trade_score_breakdown === 'object' ? rec.trade_score_breakdown : null,
    trade_readiness: legacyEvidenceGate ? 'watch_only'
      : typeof rec.trade_readiness === 'string' && READINESS.has(rec.trade_readiness) ? rec.trade_readiness : 'watch_only',
    missing_checks: [...new Set(missingChecks)],
    learning: rec.learning && typeof rec.learning === 'object' ? rec.learning : null,
    priced_in: typeof rec.priced_in === 'string' && PRICED_IN.has(rec.priced_in) ? rec.priced_in : 'unknown',
    thesis_type: rec.thesis_type,
    ...(rec.origin_type === 'wire' ? { origin_type: 'wire', source_themes: [] } : {}),
    source_event_ids: stringArray(rec.source_event_ids),
    primary_source_event_id: typeof rec.primary_source_event_id === 'string' ? rec.primary_source_event_id : null,
    source_headlines: stringArray(rec.source_headlines),
    source_headline: typeof rec.source_headline === 'string' ? rec.source_headline : null,
    source_url: rec.source_url,
    source_name: rec.source_name,
    materiality_max: safeInt(rec.materiality_max),
    newest_source_at: rec.newest_source_at,
    prior_coverage: rec.prior_coverage && typeof rec.prior_coverage === 'object' ? rec.prior_coverage : null,
    surfaced_at: rec.surfaced_at,
    updated_at: rec.updated_at,
    decay_at: rec.decay_at,
    status: 'expired',
    promoted_signal_id: null,
    feedback: rec.feedback === 'up' || rec.feedback === 'down' ? rec.feedback : null,
    stale: true,
    archived_at: archivedAt,
    archive_reason: 'historical_board_recovery',
    audit_only: true,
    recovery_only: true,
    promotion_available: false,
  }
}

function countForSide(rows: any[], shownKeys: Set<string>, side: 'long' | 'short'): ProjectedIdeasArchiveCount {
  const eligible = rows.filter((row) => sideIncludes(row, side))
  const shown = eligible.filter((row) => shownKeys.has(archiveRowKey(row))).length
  return { total_count: eligible.length, shown_count: shown, hidden_count: eligible.length - shown }
}

/** Project canonical snapshots over the generated board cache. No writes and no provider calls. */
export function projectLiveIdeas(repoRoot: string, index: any = {}, nowMs = Date.now()): LiveIdeasProjection {
  const feedback = readLatestFeedback(repoRoot)
  const scorecard: ProjectedIdeaScorecard = {
    surfaced_total: 0,
    live_count: 0,
    promoted_total: 0,
    machine_confirmed: 0,
    machine_passed: 0,
    machine_pending: 0,
    resolved: 0,
    up_votes: 0,
    down_votes: 0,
  }

  const snapshots = latestUniqueSnapshots(repoRoot)
  const snapshotIds = new Set(snapshots.map((row) => row.idea_id))
  const snapshotVersions = new Set(snapshots.map((row) => `${row.idea_id}|${row.idea_version}|${row.idea_version_started_at}`))
  const ideas = snapshots.map((rec) => {
    const row = projectIdeaRow(rec, feedback, nowMs)

    if (row.feedback === 'up') scorecard.up_votes++
    if (row.feedback === 'down') scorecard.down_votes++
    if (row.status === 'promoted') {
      scorecard.promoted_total++
      const grade = deepGrade(index, row.promoted_signal_id)
      if (grade === 'confirmed') scorecard.machine_confirmed++
      else if (grade === 'passed') scorecard.machine_passed++
      else scorecard.machine_pending++
    }
    return row
  })

  scorecard.resolved = scorecard.machine_confirmed + scorecard.machine_passed
  ideas.sort((a: any, b: any) => Number(a.stale) - Number(b.stale) || b.trade_score - a.trade_score || b.materiality_max - a.materiality_max)

  // Recently expired snapshots are visible immediately. Once hard-pruned, their durable archive copy
  // takes over. Any current snapshot (including a promoted one) shadows the old copy for the same stable
  // ticker+direction id, so a refreshed call never appears twice and a promotion stays lifecycle-owned.
  const archiveRows: any[] = snapshots
    .map((rec) => ({ rec, projected: projectIdeaRow(rec, feedback, nowMs) }))
    .filter(({ rec, projected }) => rec.status === 'live' && projected.stale)
    .map(({ rec, projected }) => ({
      ...projected,
      status: 'expired', promoted_signal_id: null, stale: true,
      archived_at: rec.decay_at, archive_reason: 'expired', audit_only: true,
    }))
  const archiveStore = readIdeaArchiveStore(repoRoot)
  for (const archived of archiveStore.snapshots) {
    if (snapshotVersions.has(`${archived.snapshot.idea_id}|${archived.snapshot.idea_version}|${archived.snapshot.idea_version_started_at}`)) continue
    archiveRows.push({
      ...projectIdeaRow(archived.snapshot, feedback, nowMs),
      status: 'expired', promoted_signal_id: null, stale: true,
      archived_at: archived.archived_at, archive_reason: archived.archive_reason, audit_only: true,
    })
  }
  const recoveryIdeas: Record<string, unknown>[] = []
  for (const imported of archiveStore.imports) {
    const row = imported.board_row
    if (snapshotVersions.has(`${row.idea_id}|${row.idea_version}|${row.idea_version_started_at}`)) continue
    const projected = projectImportedArchiveRow(row, imported.recovered_at)
    const expiredNow = parseRfc3339Ms(row.decay_at) <= nowMs
    // A canonical occurrence is authoritative for the stable ticker+side identity. An older unexpired
    // board recovery stays hidden (not falsely labelled expired) until its own shelf life ends; later
    // canonical archive/tombstone state remains a durable barrier after the raw snapshot disappears.
    const stableIdBarrier = snapshotIds.has(String(row.idea_id))
      || archiveStore.lifecycle_barriers.some((entry) => entry.idea_id === row.idea_id
        && (entry.idea_version_started_at === null
          || parseRfc3339Ms(entry.idea_version_started_at) > parseRfc3339Ms(row.idea_version_started_at)))
    if (imported.recovery_reason === 'latest_board_current' && !expiredNow && !stableIdBarrier) {
      recoveryIdeas.push({
        ...projected, status: 'live', stale: false, archived_at: undefined, archive_reason: undefined,
        audit_only: undefined, recovery_only: true, promotion_available: false,
      })
    } else if (expiredNow || imported.recovery_reason === 'historical_board_expired') {
      archiveRows.push({ ...projected, archive_reason: imported.recovery_reason })
    }
  }
  archiveRows.sort((a, b) => String(b.decay_at).localeCompare(String(a.decay_at))
    || String(b.archived_at).localeCompare(String(a.archived_at))
    || b.trade_score - a.trade_score || String(a.idea_id).localeCompare(String(b.idea_id)))

  const shownKeys = new Set<string>()
  const shownBySide = { long: 0, short: 0 }
  for (const row of archiveRows) {
    const sides = (['long', 'short'] as const).filter((side) => sideIncludes(row, side))
    if (sides.some((side) => shownBySide[side] >= IDEAS_ARCHIVE_MAX_PER_SIDE)) continue
    shownKeys.add(archiveRowKey(row))
    for (const side of sides) shownBySide[side]++
  }
  const shownRows = archiveRows.filter((row) => shownKeys.has(archiveRowKey(row)))
  const sideCounts = {
    long: countForSide(archiveRows, shownKeys, 'long'),
    short: countForSide(archiveRows, shownKeys, 'short'),
  }
  const unconfirmedCounts = readUnconfirmedHistoryCounts(repoRoot)
  const ideasArchive: ProjectedIdeasArchive = {
    schema_version: 'ideas-archive/v1',
    health: {
      status: archiveStore.status,
      file_count: archiveStore.file_count,
      suppression_count: archiveStore.suppression_count,
      corrupt_count: archiveStore.corrupt_count,
      invalid_count: archiveStore.invalid_count,
      error: archiveStore.error,
    },
    total_count: archiveRows.length,
    shown_count: shownRows.length,
    hidden_count: archiveRows.length - shownRows.length,
    side_counts: sideCounts,
    ...(unconfirmedCounts ? { unconfirmed_counts: unconfirmedCounts } : {}),
    retention: archiveStore.retention,
    rows: shownRows,
  }
  const allIdeas = [...ideas, ...recoveryIdeas]
  allIdeas.sort((a: any, b: any) => Number(a.stale) - Number(b.stale)
    || b.trade_score - a.trade_score || b.materiality_max - a.materiality_max
    || String(b.updated_at).localeCompare(String(a.updated_at)) || String(a.idea_id).localeCompare(String(b.idea_id)))
  scorecard.live_count = allIdeas.filter((row: any) => !row.stale).length
  scorecard.surfaced_total = new Set([
    ...snapshots,
    ...archiveStore.snapshots.map((entry) => entry.snapshot),
    ...archiveStore.imports.map((entry) => entry.board_row),
  ].map(archiveRowKey)).size
    + archiveStore.suppression_count + archiveStore.retention.evicted_count
  return { ideas: allIdeas, ideas_archive: ideasArchive, scorecard }
}
