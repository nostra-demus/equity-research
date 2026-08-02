// Guardrailed learning from idea feedback and completed Signal Checks.
//
// The loop is intentionally small and explainable. It reads existing append-only votes plus each promoted
// idea's downstream signal payload, computes a shrunk cohort adjustment, and applies at most +/-8 points
// to future trade-readiness scores. Fewer than five resolved examples means no adjustment.

import fs from 'node:fs'
import path from 'node:path'
import type { IdeaDirection, ThesisType } from './surface-ideas'
import type { SurfacedIdea } from './ideas-store'

export interface IdeaLearning {
  resolved: number
  positive: number
  negative: number
  adjustment: number
  basis: 'not_enough_outcomes' | 'signal_and_human_feedback'
  evidenceIds: string[]
}

interface Vote { idea_id?: string; polarity?: string; idea_feedback_id?: string }

function readLines(file: string): any[] {
  try {
    return fs.readFileSync(file, 'utf8').split('\n').map((x) => x.trim()).filter(Boolean).flatMap((line) => {
      try { return [JSON.parse(line)] } catch { return [] }
    })
  } catch { return [] }
}

function signalOutcome(repoRoot: string, idea: SurfacedIdea): 1 | -1 | 0 {
  const sig = idea.promoted_signal_id
  if (!sig) return 0
  try {
    const payload = JSON.parse(fs.readFileSync(path.join(repoRoot, 'screener', 'runs', sig, 'signal_payload.json'), 'utf8'))
    const routing = String(payload?.routing || '').toLowerCase()
    if (routing === 'promote') return 1
    if (['park', 'log', 'suppress', 'watchlist_no_source'].includes(routing)) return -1
  } catch { /* pending or old run */ }
  try {
    const thesis = JSON.parse(fs.readFileSync(path.join(repoRoot, 'screener', 'runs', sig, 'thesis_record.json'), 'utf8'))
    const status = String(thesis?.meta?.status || '').toLowerCase()
    if (['provisional', 'full_machine', 'handed_off'].includes(status)) return 1
    if (status.startsWith('watchlist') || status === 'rejected') return -1
  } catch { /* pending */ }
  return 0
}

export function learnIdeaAdjustment(repoRoot: string, ideas: SurfacedIdea[], cohort: { direction: IdeaDirection; thesisType: ThesisType }): IdeaLearning {
  const latestVote = new Map<string, Vote>()
  for (const row of readLines(path.join(repoRoot, 'screener', 'ledger', 'ideas_feedback.ndjson')) as Vote[]) {
    if (row.idea_id && ['up', 'down', 'clear'].includes(String(row.polarity))) latestVote.set(row.idea_id, row)
  }
  let positive = 0
  let negative = 0
  const evidenceIds: string[] = []
  for (const idea of ideas) {
    if (idea.direction !== cohort.direction || idea.thesis_type !== cohort.thesisType) continue
    let outcome = signalOutcome(repoRoot, idea)
    const vote = latestVote.get(idea.idea_id)
    if (vote?.polarity === 'up') outcome = outcome >= 0 ? 1 : outcome
    if (vote?.polarity === 'down') outcome = outcome <= 0 ? -1 : outcome
    if (!outcome) continue
    if (outcome > 0) positive++
    else negative++
    evidenceIds.push(idea.promoted_signal_id || vote?.idea_feedback_id || idea.idea_id)
  }
  const resolved = positive + negative
  if (resolved < 5) return { resolved, positive, negative, adjustment: 0, basis: 'not_enough_outcomes', evidenceIds: evidenceIds.slice(-20) }
  // Beta(2,2) shrinkage keeps a tiny winning/losing streak from moving the live rank too much.
  const rate = (positive + 2) / (resolved + 4)
  const adjustment = Math.max(-8, Math.min(8, Math.round((rate - 0.5) * 16)))
  return { resolved, positive, negative, adjustment, basis: 'signal_and_human_feedback', evidenceIds: evidenceIds.slice(-20) }
}
