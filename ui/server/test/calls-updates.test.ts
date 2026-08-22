process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { buildCallUpdates, safeRunArtifact, type CallUpdateInput, type ReviewFile } from '../src/outputs'

let passed = 0
function check(name: string, fn: () => void) {
  fn()
  passed++
  console.log(`ok  ${name}`)
}

const review = (overrides: Partial<ReviewFile> = {}): ReviewFile => ({
  file: 'analyses/ACME_2026-08-01/reviews/2026-08-13_30d_decision_review.json',
  basename: '2026-08-13_30d_decision_review.json',
  review_window: '30d',
  review_date: '2026-08-13',
  review_price: 110,
  absolute_return_pct: 10,
  thesis_status: 'confirmed',
  forecasts_confirmed: 1,
  forecasts_falsified: 0,
  memo_delta_file: 'analyses/ACME_2026-08-01/reviews/2026-08-13_30d_memo_delta.md',
  stage_one_comment: null,
  memo_delta_summary: 'Sales beat the level the call said would matter.',
  thesis_delta_verdict: 'strengthened',
  ...overrides,
})

const row = (date: string, decision: string, expected: number, reviews: ReviewFile[] = []): CallUpdateInput => ({
  call: {
    ticker: 'ACME', company: 'Acme Corp', decision_date: date, decision,
    expected_return_pct: expected, run_root: `analyses/ACME_${date}`,
    final_thesis_path: `analyses/ACME_${date}/final_thesis.md`,
  },
  record: { ticker: 'ACME', decision_date: date, decision, expected_return_pct: expected },
  reviews,
})

check('turns a review delta into one plain-English update', () => {
  const update = buildCallUpdates([row('2026-08-01', 'Watchlist', 5, [review()])])
    .find((candidate) => candidate.kind === 'review')
  assert.equal(update?.headline, 'ACME: the call looks stronger')
  assert.equal(update?.detail,
    'Sales beat the level the call said would matter. Price since the call: +10.0% · 1 forecast right · 0 wrong.')
  assert.equal(update?.tone, 'better')
})

check('compares consecutive calls without deleting either dated record', () => {
  const updates = buildCallUpdates([
    row('2026-08-10', 'Buy', 18),
    row('2026-08-01', 'Watchlist', 5),
  ])
  assert.equal(updates.filter((update) => update.kind === 'call').length, 2)
  const change = updates.find((update) => update.headline.includes('Watchlist → Buy'))
  assert.ok(change, 'the newer call explains the exact move')
  assert.equal(change.run_root, 'analyses/ACME_2026-08-10')
  assert.equal(change.tone, 'better')
})

check('uses stable ids so polling cannot create duplicate notifications', () => {
  const rows = [row('2026-08-01', 'Watchlist', 5, [review()])]
  assert.deepEqual(buildCallUpdates(rows).map((update) => update.id), buildCallUpdates(rows).map((update) => update.id))
})

check('reports a broken review in simple words', () => {
  const updates = buildCallUpdates([row('2026-08-01', 'Watchlist', 5, [review({
    thesis_delta_verdict: 'broken', thesis_status: 'broken',
  })])])
  assert.equal(updates.find((update) => update.kind === 'review')?.headline, 'ACME: the call no longer holds')
  assert.equal(updates.find((update) => update.kind === 'review')?.tone, 'worse')
})

check('non-finite returns never leak into update text', () => {
  const updates = buildCallUpdates([row('2026-08-01', 'Watchlist', Infinity, [review({
    absolute_return_pct: Infinity,
  })])])
  assert.equal(updates.find((update) => update.kind === 'call')?.detail, null)
  assert.equal(updates.find((update) => update.kind === 'review')?.detail,
    'Sales beat the level the call said would matter. 1 forecast right · 0 wrong.')
})

check('a decision downgrade stays red even when expected return rose', () => {
  const updates = buildCallUpdates([
    row('2026-08-10', 'Avoid', 12),
    row('2026-08-01', 'Watchlist', 5),
  ])
  assert.equal(updates.find((update) => update.headline.includes('Watchlist → Avoid'))?.tone, 'worse')
})

check('prompt-authored artifact paths cannot escape the selected run', () => {
  const paths = new Set([
    'analyses/ACME_2026-08-01/final_thesis.md',
    'analyses/ACME_2026-08-01/private-notes.md',
  ])
  assert.equal(safeRunArtifact('.env', 'analyses/ACME_2026-08-01', paths), null)
  assert.equal(safeRunArtifact('analyses/ACME_2026-08-01/../../../.env', 'analyses/ACME_2026-08-01', paths), null)
  assert.equal(safeRunArtifact('analyses/OTHER_2026-08-01/final_thesis.md', 'analyses/ACME_2026-08-01', paths), null)
  assert.equal(safeRunArtifact('analyses/ACME_2026-08-01/not-published.md', 'analyses/ACME_2026-08-01', paths), null)
  assert.equal(safeRunArtifact('analyses/ACME_2026-08-01/private-notes.md', 'analyses/ACME_2026-08-01', paths), null,
    'a published file is still refused when it is outside the narrow Calls artifact surface')
  assert.equal(safeRunArtifact('analyses/ACME_2026-08-01/final_thesis.md', 'analyses/ACME_2026-08-01', paths),
    'analyses/ACME_2026-08-01/final_thesis.md')
})

console.log(`\n${passed} calls-update checks passed`)
