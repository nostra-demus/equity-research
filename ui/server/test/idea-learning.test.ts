process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { IDEA_LEARNING_HORIZON_DAYS, learnIdeaAdjustment } from '../src/news/ideas/idea-learning'
import type { SurfacedIdea } from '../src/news/ideas/ideas-store'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'idea-learning-'))
const ledger = path.join(root, 'screener', 'ledger')
fs.mkdirSync(ledger, { recursive: true })
const ideas: SurfacedIdea[] = Array.from({ length: 6 }, (_, i) => ({
  idea_id: `IDEA-${String(i).padStart(12, '0')}`,
  idea_version: `IDEAV-${String(i).padStart(16, '0')}`,
  idea_version_started_at: '2026-05-31T00:00:00Z',
  updated_at: '2026-05-31T00:00:00Z',
  promoted_signal_id: `SIG-${i}`,
  direction: 'long',
  thesis_type: 'company_specific',
} as SurfacedIdea))

// Process states and human votes are intentionally ignored: neither is a realized investment return.
for (let i = 0; i < 6; i++) {
  const run = path.join(root, 'screener', 'runs', `SIG-${i}`)
  fs.mkdirSync(run, { recursive: true })
  fs.writeFileSync(path.join(run, 'signal_payload.json'), JSON.stringify({ routing: 'PROMOTE' }))
}
fs.writeFileSync(path.join(ledger, 'ideas_feedback.ndjson'), ideas.map((idea, i) => JSON.stringify({ idea_id: idea.idea_id, polarity: i ? 'up' : 'down' })).join('\n') + '\n')
const cohort = { direction: 'long' as const, thesisType: 'company_specific' as const, horizonDays: IDEA_LEARNING_HORIZON_DAYS }
const processOnly = learnIdeaAdjustment(root, ideas, cohort)
assert.equal(processOnly.resolved, 0)
assert.equal(processOnly.adjustment, 0)

const rows = ideas.slice(0, 5).map((idea, i) => ({
  outcome_id: `OUT-${i}`,
  idea_id: idea.idea_id,
  idea_version: idea.idea_version,
  idea_version_started_at: idea.idea_version_started_at,
  horizon_started_at: '2026-06-01T00:00:00Z',
  horizon_ended_at: '2026-07-01T00:00:00Z',
  resolved_at: '2026-07-02T00:00:00Z',
  horizon_days: 30,
  realized_strategy_return: 0.05 + i / 100,
}))
// Invalid: "resolved" before the defined horizon ended. It must not train the scorer.
rows.push({ ...rows[0], outcome_id: 'OUT-invalid', idea_id: ideas[5].idea_id, resolved_at: '2026-06-15T00:00:00Z' })
rows.push({ ...rows[0], outcome_id: 'OUT-stale-version', idea_id: ideas[5].idea_id, idea_version: 'IDEAV-ffffffffffffffff' })
rows.push({ ...rows[0], outcome_id: 'OUT-stale-start', idea_id: ideas[5].idea_id, idea_version: ideas[5].idea_version, idea_version_started_at: '2026-05-01T00:00:00Z' })
rows.push({ ...rows[0], outcome_id: 'OUT-wrong-period', idea_id: ideas[5].idea_id, idea_version: ideas[5].idea_version, horizon_ended_at: '2026-06-08T00:00:00Z', resolved_at: '2026-06-09T00:00:00Z', horizon_days: 7 })
rows.push({ ...rows[0], outcome_id: 'OUT-before-version', idea_id: ideas[5].idea_id, idea_version: ideas[5].idea_version, horizon_started_at: '2026-05-01T00:00:00Z', horizon_ended_at: '2026-05-31T00:00:00Z', resolved_at: '2026-06-01T00:00:00Z' })
fs.writeFileSync(path.join(ledger, 'idea_outcomes.ndjson'), rows.map((row) => JSON.stringify(row)).join('\n') + '\n')

const learned = learnIdeaAdjustment(root, ideas, cohort)
assert.equal(learned.resolved, 5)
assert.equal(learned.positive, 5)
assert.equal(learned.neutral, 0)
assert.equal(learned.adjustment, 4, 'five realized wins are shrunk rather than treated as certainty')
assert.equal(learned.basis, 'realized_returns')
assert.deepEqual(learned.evidenceIds, ['OUT-0', 'OUT-1', 'OUT-2', 'OUT-3', 'OUT-4'])

const tooSmall = learnIdeaAdjustment(root, ideas.slice(0, 4), cohort)
assert.equal(tooSmall.adjustment, 0)
assert.equal(tooSmall.basis, 'not_enough_outcomes')

console.log('\n1 idea-learning test file passed')
