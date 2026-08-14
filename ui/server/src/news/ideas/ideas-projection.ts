// Live, read-only board projection for news-lead idea snapshots. The JSON snapshots are the canonical
// store; screener/board/index.json is only a generated cache and may legitimately lag when its Python
// rebuild fails. Recomputing this small slice on every board GET also makes decay_at a live expiry rather
// than a boolean frozen at the last unrelated board rebuild.

import fs from 'node:fs'
import path from 'node:path'
import { parseRfc3339Ms } from '../../rfc3339'
import { isSurfacedIdeaSnapshot, readIdeaSnapshots, type SurfacedIdea } from './ideas-store'

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
  scorecard: ProjectedIdeaScorecard
}

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

  const ideas = latestUniqueSnapshots(repoRoot).map((rec) => {
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
    const row = {
      idea_id: rec.idea_id,
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
      source_headlines: stringArray(rec.source_headlines),
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

    scorecard.surfaced_total++
    if (!stale) scorecard.live_count++
    if (vote === 'up') scorecard.up_votes++
    if (vote === 'down') scorecard.down_votes++
    if (status === 'promoted') {
      scorecard.promoted_total++
      const grade = deepGrade(index, promotedSignalId)
      if (grade === 'confirmed') scorecard.machine_confirmed++
      else if (grade === 'passed') scorecard.machine_passed++
      else scorecard.machine_pending++
    }
    return row
  })

  scorecard.resolved = scorecard.machine_confirmed + scorecard.machine_passed
  ideas.sort((a: any, b: any) => Number(a.stale) - Number(b.stale) || b.trade_score - a.trade_score || b.materiality_max - a.materiality_max)
  return { ideas, scorecard }
}
