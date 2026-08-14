import assert from 'node:assert/strict'
import type { CallSummary, CallUpdate } from '../lib/types'
import {
  automationPromise,
  callUpdateToast,
  callDateLabel,
  groupCallsByTicker,
  integrityLabel,
  plainStatus,
  sortCallUpdates,
  splitCallUpdates,
  unseenCallUpdates,
  updateArtifactLabel,
  updateArtifactTitle,
  updateToneLabel,
} from './CallsTracker.logic'

function call(ticker: string, decisionDate: string | null, runRoot: string): CallSummary {
  return {
    ticker,
    company: `${ticker} Company`,
    decision_date: decisionDate,
    decision: 'Watchlist',
    basket: null,
    decision_is_post_mortem_capped: false,
    confidence: 55,
    confidence_is_post_review: false,
    integrity_status: 'verified',
    integrity_verdict: null,
    integrity_banner: false,
    time_horizon: '12 months',
    entry_price: 100,
    currency: 'USD',
    expected_return_pct: 5,
    implied_target: 105,
    downside_risk_pct: -20,
    kill_criteria_count: 1,
    forecasts: { open: 1, confirmed: 0, falsified: 0, expired: 0, other: 0 },
    run_root: runRoot,
    final_thesis_path: `${runRoot}/final_thesis.md`,
    latest_thesis_status: null,
    next_checkpoint: null,
    review_count: 0,
    timeline: [],
  }
}

const firstSameDay = call('AAA', '2026-08-14', 'analyses/AAA_first')
const secondSameDay = call('AAA', '2026-08-14', 'analyses/AAA_second')
const undatedDuplicate = call('AAA', null, 'analyses/AAA_second')
const newerOtherTicker = call('BBB', '2026-08-15', 'analyses/BBB')
const source = [firstSameDay, newerOtherTicker, secondSameDay, undatedDuplicate]
const groups = groupCallsByTicker(source)

assert.deepEqual(source, [firstSameDay, newerOtherTicker, secondSameDay, undatedDuplicate], 'grouping does not mutate the API payload')
assert.deepEqual(groups.map((group) => group.ticker), ['BBB', 'AAA'], 'ticker cards are ordered by their latest dated call')
assert.equal(groups[1].calls.length, 3, 'same-day and duplicate-path calls are all retained')
assert.equal(groups[1].latest, firstSameDay, 'same-date calls keep backend order')
assert.deepEqual(groups[1].history, [secondSameDay, undatedDuplicate], 'every non-latest call remains in collapsed history')

const update = (id: string, at: string | null): CallUpdate => ({
  id,
  ticker: 'AAA',
  company: 'AAA Company',
  at,
  kind: 'review',
  headline: 'The call was reviewed.',
  tone: 'info',
  run_root: 'analyses/AAA',
})
const duplicateUpdateOne = update('same-id', '2026-08-14T10:00:00Z')
const duplicateUpdateTwo = update('same-id', '2026-08-14T10:00:00Z')
const undatedUpdate = update('older', null)
assert.deepEqual(
  sortCallUpdates([undatedUpdate, duplicateUpdateOne, duplicateUpdateTwo]),
  [duplicateUpdateOne, duplicateUpdateTwo, undatedUpdate],
  'updates are newest first without silently removing duplicate ids',
)
const split = splitCallUpdates(Array.from({ length: 12 }, (_, index) => update(`row-${index}`, `2026-08-${String(index + 1).padStart(2, '0')}T10:00:00Z`)))
assert.equal(split.recent.length, 10)
assert.equal(split.earlier.length, 2)
assert.deepEqual([...split.recent, ...split.earlier], split.ordered, 'the earlier disclosure retains every returned update')
const sameTimeNew = update('new-same-day', '2026-08-14T10:00:00Z')
const secondNew = { ...update('second-new', '2026-08-14T09:00:00Z'), ticker: 'BBB', tone: 'worse' as const }
assert.deepEqual(
  unseenCallUpdates([duplicateUpdateOne, sameTimeNew, secondNew], new Set(['same-id'])).map(({ id }) => id),
  ['new-same-day', 'second-new'],
  'every new update is retained even when an older same-time id sorts first',
)
assert.deepEqual(callUpdateToast([sameTimeNew]), { message: sameTimeNew.headline, tone: 'info' })
assert.deepEqual(
  callUpdateToast([{ ...sameTimeNew, tone: 'better' }, secondNew]),
  { message: '2 automatic call updates for AAA, BBB are ready.', tone: 'info' },
  'a mixed batch is announced once without pretending it was wholly good or bad',
)

assert.equal(integrityLabel('verified'), 'Passed')
assert.equal(integrityLabel('provisional'), 'Not ready')
assert.equal(integrityLabel('unaudited'), 'Not checked')
assert.equal(plainStatus('at-risk'), 'At risk')
assert.equal(plainStatus(null), 'Awaiting first review')
assert.equal(callDateLabel('2026-08-04'), '4 Aug 2026')
assert.equal(callDateLabel(null), 'Not dated')
assert.equal(updateToneLabel('same'), 'No change')
assert.equal(automationPromise(undefined), 'Automatic checks are getting ready')
assert.equal(automationPromise({ enabled: false, state: 'watching', message: '', last_checked_at: null, next_check_at: null }), 'Automatic checks are off')
assert.equal(automationPromise({ enabled: true, state: 'needs_attention', message: '', last_checked_at: null, next_check_at: null }), 'Automatic checks need attention')
assert.equal(automationPromise({ enabled: true, state: 'watching', message: '', last_checked_at: null, next_check_at: null }), 'You do not need to do anything')
assert.equal(updateArtifactLabel('call'), 'Open thesis')
assert.equal(updateArtifactLabel('review'), 'Open review')
assert.equal(updateArtifactLabel('data_check'), 'Open data check')
assert.equal(updateArtifactTitle({ kind: 'review', ticker: 'AAA' }), 'Review Update — AAA')

console.log('CallsTracker grouping, history retention, and plain-English labels: ok')
