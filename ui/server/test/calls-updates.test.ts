process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { buildCallUpdates, safeRunArtifact, type CallUpdateInput, type ReviewFile } from '../src/outputs'
import type { AutomaticIntakeEvent } from '../src/auto-intake-status'

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

check('turns review delta into one plain-English automatic update', () => {
  const updates = buildCallUpdates([row('2026-08-01', 'Watchlist', 5, [review()])])
  const update = updates.find((u) => u.kind === 'review')
  assert.equal(update?.headline, 'ACME: the call looks stronger')
  assert.equal(update?.detail, 'Sales beat the level the call said would matter. Price since the call: +10.0% · 1 forecast right · 0 wrong.')
  assert.equal(update?.tone, 'better')
})

check('compares consecutive calls without deleting either dated record', () => {
  const updates = buildCallUpdates([
    row('2026-08-10', 'Buy', 18),
    row('2026-08-01', 'Watchlist', 5),
  ])
  assert.equal(updates.filter((u) => u.kind === 'call').length, 2)
  const change = updates.find((u) => u.headline.includes('Watchlist → Buy'))
  assert.ok(change, 'the newer call explains the exact move')
  assert.equal(change?.run_root, 'analyses/ACME_2026-08-10')
})

check('uses stable ids so polling cannot create duplicate notifications', () => {
  const rows = [row('2026-08-01', 'Watchlist', 5, [review()])]
  assert.deepEqual(
    buildCallUpdates(rows).map((u) => u.id),
    buildCallUpdates(rows).map((u) => u.id),
  )
})

check('shows a successful note-only automatic check even when no call field changed', () => {
  const event: AutomaticIntakeEvent = {
    id: 'a'.repeat(24),
    ticker: 'ACME',
    run_root: 'analyses/ACME_2026-08-01',
    plan_path: 'analyses/ACME_2026-08-01/intake/2026-08-13_intake_plan.json',
    plan_sha256: `sha256:${'b'.repeat(64)}`,
    decision_fingerprint: `sha256:${'c'.repeat(64)}`,
    verdict: 'note_only',
    at: '2026-08-13T10:00:00.000Z',
    headline: 'Checked new data. The call did not change.',
    detail: null,
  }
  const updates = buildCallUpdates([row('2026-08-01', 'Watchlist', 5)], [event, event])
  const checks = updates.filter((update) => update.kind === 'data_check')
  assert.equal(checks.length, 1, 'even a duplicated input projection cannot duplicate the notification')
  assert.equal(checks[0].headline, 'Checked new data. The call did not change.')
  assert.equal(checks[0].tone, 'same')
  assert.equal(checks[0].source_path, event.plan_path)
})

check('does not attach an automatic check to a different or corrected-away call', () => {
  const event: AutomaticIntakeEvent = {
    id: 'd'.repeat(24), ticker: 'ACME', run_root: 'analyses/ACME_2026-07-01',
    plan_path: 'analyses/ACME_2026-07-01/intake/plan.json',
    plan_sha256: `sha256:${'e'.repeat(64)}`, decision_fingerprint: `sha256:${'f'.repeat(64)}`,
    verdict: 'note_only', at: '2026-08-13T10:00:00.000Z',
    headline: 'Checked new data. The call did not change.', detail: null,
  }
  assert.equal(buildCallUpdates([row('2026-08-01', 'Watchlist', 5)], [event]).some((update) => update.kind === 'data_check'), false)
})

check('reports a broken review in simple words', () => {
  const updates = buildCallUpdates([row('2026-08-01', 'Watchlist', 5, [review({
    thesis_delta_verdict: 'broken',
    thesis_status: 'broken',
  })])])
  assert.equal(updates.find((u) => u.kind === 'review')?.headline, 'ACME: the call no longer holds')
})

check('a decision downgrade stays red even when expected return rose', () => {
  const updates = buildCallUpdates([
    row('2026-08-10', 'Avoid', 12),
    row('2026-08-01', 'Watchlist', 5),
  ])
  const change = updates.find((u) => u.headline.includes('Watchlist → Avoid'))
  assert.equal(change?.tone, 'worse')
})

check('a decision upgrade stays green even when expected return fell', () => {
  const updates = buildCallUpdates([
    row('2026-08-10', 'Buy', 6),
    row('2026-08-01', 'Watchlist', 12),
  ])
  const change = updates.find((u) => u.headline.includes('Watchlist → Buy'))
  assert.equal(change?.tone, 'better')
})

check('prompt-authored artifact paths cannot escape the selected run', () => {
  assert.equal(safeRunArtifact('.env', 'analyses/ACME_2026-08-01'), null)
  assert.equal(safeRunArtifact('analyses/ACME_2026-08-01/../../../.env', 'analyses/ACME_2026-08-01'), null)
  assert.equal(safeRunArtifact('analyses/OTHER_2026-08-01/final_thesis.md', 'analyses/ACME_2026-08-01'), null)
})

console.log(`\n${passed} calls-update checks passed`)
