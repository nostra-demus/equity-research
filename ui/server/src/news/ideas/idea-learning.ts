// Guardrailed learning from timestamped, realized idea returns.
//
// Routing, handoff status, provisional theses and thumbs are process diagnostics, not investment outcomes.
// The learning loop reads only a dedicated append-only outcome ledger whose rows carry a completed,
// defined measurement horizon and a realized strategy return. Fewer than five resolved examples means no
// adjustment.

import fs from 'node:fs'
import path from 'node:path'
import type { IdeaDirection, ThesisType } from './surface-ideas'
import type { SurfacedIdea } from './ideas-store'

export interface IdeaLearning {
  resolved: number
  positive: number
  negative: number
  neutral: number
  adjustment: number
  basis: 'not_enough_outcomes' | 'realized_returns'
  evidenceIds: string[]
}

/** One explicit period prevents five-day and one-year outcomes from becoming the same base rate. */
export const IDEA_LEARNING_HORIZON_DAYS = 30

interface IdeaOutcomeRow {
  outcome_id?: string
  idea_id?: string
  idea_version?: string
  idea_version_started_at?: string
  horizon_started_at?: string
  horizon_ended_at?: string
  resolved_at?: string
  horizon_days?: number
  realized_strategy_return?: number
}

function readLines(file: string): any[] {
  try {
    return fs.readFileSync(file, 'utf8').split('\n').map((x) => x.trim()).filter(Boolean).flatMap((line) => {
      try { return [JSON.parse(line)] } catch { return [] }
    })
  } catch { return [] }
}

function validOutcome(row: IdeaOutcomeRow, horizonDays: number): row is Required<IdeaOutcomeRow> {
  if (!row.outcome_id || !row.idea_id || !/^IDEAV-[a-f0-9]{16}$/.test(String(row.idea_version || ''))) return false
  const versionStart = Date.parse(String(row.idea_version_started_at || ''))
  const start = Date.parse(String(row.horizon_started_at || ''))
  const end = Date.parse(String(row.horizon_ended_at || ''))
  const resolved = Date.parse(String(row.resolved_at || ''))
  const days = Number(row.horizon_days)
  const realized = Number(row.realized_strategy_return)
  if (![versionStart, start, end, resolved, days, realized].every(Number.isFinite)) return false
  if (days !== horizonDays || start < versionStart || end <= start || resolved < end) return false
  // The explicit horizon must agree with its timestamps (one day tolerance for market-close/weekend rules).
  const actualDays = (end - start) / 86_400_000
  return Math.abs(actualDays - days) <= 1
}

export function learnIdeaAdjustment(repoRoot: string, ideas: SurfacedIdea[], cohort: { direction: IdeaDirection; thesisType: ThesisType; horizonDays: number }): IdeaLearning {
  // The snapshot files only contain the current version. The append-only history retains the exact old
  // thesis/source snapshot an outcome measured, so refreshed ticker+direction calls cannot inherit it.
  const snapshots = new Map<string, SurfacedIdea>()
  const history = readLines(path.join(repoRoot, 'screener', 'ledger', 'ideas.ndjson')) as SurfacedIdea[]
  for (const idea of [...history, ...ideas]) {
    if (!idea?.idea_id || !/^IDEAV-[a-f0-9]{16}$/.test(String(idea.idea_version || ''))) continue
    const versionStart = Date.parse(String(idea.idea_version_started_at || ''))
    if (!Number.isFinite(versionStart)) continue
    const key = `${idea.idea_id}|${idea.idea_version}|${idea.idea_version_started_at}`
    const prior = snapshots.get(key)
    if (!prior || Date.parse(idea.updated_at) >= Date.parse(prior.updated_at)) snapshots.set(key, idea)
  }
  const latestOutcome = new Map<string, Required<IdeaOutcomeRow>>()
  for (const row of readLines(path.join(repoRoot, 'screener', 'ledger', 'idea_outcomes.ndjson')) as IdeaOutcomeRow[]) {
    if (!validOutcome(row, cohort.horizonDays)) continue
    const key = `${row.idea_id}|${row.idea_version}|${row.idea_version_started_at}`
    const snapshot = snapshots.get(key)
    if (!snapshot || snapshot.direction !== cohort.direction || snapshot.thesis_type !== cohort.thesisType) continue
    // validOutcome already proves the holding period began after this exact version-start stamp. Using
    // updated_at here would wrongly invalidate a real outcome merely because the unchanged version was
    // refreshed later with the same evidence.
    const prior = latestOutcome.get(key)
    if (!prior || Date.parse(row.resolved_at) >= Date.parse(prior.resolved_at)) latestOutcome.set(key, row)
  }
  let positive = 0
  let negative = 0
  let neutral = 0
  const evidenceIds: string[] = []
  for (const idea of snapshots.values()) {
    if (idea.direction !== cohort.direction || idea.thesis_type !== cohort.thesisType) continue
    const outcome = latestOutcome.get(`${idea.idea_id}|${idea.idea_version}|${idea.idea_version_started_at}`)
    if (!outcome) continue
    if (outcome.realized_strategy_return > 0) positive++
    else if (outcome.realized_strategy_return < 0) negative++
    else neutral++
    evidenceIds.push(outcome.outcome_id)
  }
  const resolved = positive + negative + neutral
  if (resolved < 5) return { resolved, positive, negative, neutral, adjustment: 0, basis: 'not_enough_outcomes', evidenceIds: evidenceIds.slice(-20) }
  // Four pseudo-observations centered at zero shrink a short winning/losing streak. A flat return is
  // genuinely neutral; it counts as measured but does not quietly become a loss or a win.
  const adjustment = Math.max(-8, Math.min(8, Math.round(((positive - negative) / (resolved + 4)) * 8)))
  return { resolved, positive, negative, neutral, adjustment, basis: 'realized_returns', evidenceIds: evidenceIds.slice(-20) }
}
