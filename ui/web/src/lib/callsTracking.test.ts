import assert from 'node:assert/strict'
import { callTrackingSnapshot, humanDate } from './callsTracking'
import type { CallSummary } from './types'

const baseCall = (): CallSummary => ({
  ticker: 'EMAAR', company: 'Emaar Properties PJSC', decision_date: '2026-07-10', decision: 'Watchlist',
  basket: 'Watchlist', decision_is_post_mortem_capped: false, confidence: 52,
  confidence_is_post_review: false, integrity_status: 'verified', integrity_verdict: null,
  integrity_banner: false, time_horizon: '12 months', entry_price: 12.2, currency: 'AED',
  expected_return_pct: 17.7, implied_target: 14.36, downside_risk_pct: null, kill_criteria_count: 3,
  forecasts: { open: 4, confirmed: 1, falsified: 1, expired: 0, other: 0 },
  run_root: 'analyses/EMAAR_2026-07-10',
  final_thesis_path: 'analyses/EMAAR_2026-07-10/final_thesis.md',
  latest_thesis_status: 'confirmed', latest_review_summary: 'The named cycle risk fired.',
  latest_review_date: '2026-08-09', review_count: 1,
  next_checkpoint: { window: '90d', due_date: '2026-10-08', status: 'upcoming' },
  timeline: [{
    window: '30d', due_date: '2026-08-09', status: 'done', review_date: '2026-08-09',
    review_price: 11.5, absolute_return_pct: -5.74, benchmark_relative_return_pct: -5.11,
    thesis_status: 'confirmed', decision_quality: 'skill', thesis_delta_verdict: 'strengthened',
    memo_delta_summary: 'Pre-sales fell sharply and the named kill criterion fired.',
  }],
  needs_attention: { forecasts_overdue: [], kill_criteria_overdue: [] },
})

assert.equal(humanDate('2026-07-10'), '10 Jul 2026')
assert.equal(humanDate('2026-02-30'), 'date not recorded')
const tracked = callTrackingSnapshot(baseCall())
assert.equal(tracked.originalSentence,
  'Nostra said Watchlist on 10 Jul 2026 at AED 12.2. Target: AED 14.36.')
assert.deepEqual(tracked.checkpoint, {
  label: '30-day check · 9 Aug 2026', price: 'AED 11.5', returnFromCall: '−5.7%',
  returnTone: 'bad', benchmarkDelta: '5.1pp behind benchmark',
})
assert.deepEqual(tracked.situation, {
  headline: 'Call working as intended', detail: 'Thesis confirmed · delta strengthened', tone: 'good',
})
assert.equal(tracked.evidence, 'Pre-sales fell sharply and the named kill criterion fired.')
assert.deepEqual(tracked.nextCheck, {
  date: '8 Oct 2026', detail: '90-day review · upcoming', tone: 'neutral',
})

const unreviewed = baseCall()
unreviewed.entry_price = null
unreviewed.implied_target = null
unreviewed.timeline = []
unreviewed.latest_thesis_status = null
unreviewed.latest_review_summary = null
unreviewed.next_checkpoint = null
const awaiting = callTrackingSnapshot(unreviewed)
assert.equal(awaiting.originalSentence,
  'Nostra said Watchlist on 10 Jul 2026 with no recorded entry price.')
assert.equal(awaiting.checkpoint, null)
assert.equal(awaiting.situation.headline, 'Awaiting first review')
assert.equal(awaiting.situation.detail, 'No reviews recorded yet')
assert.equal(awaiting.nextCheck, null)

const dueToday = baseCall()
dueToday.next_checkpoint = { window: '90d', due_date: '2026-10-08', status: 'due' }
assert.equal(callTrackingSnapshot(dueToday).nextCheck?.tone, 'neutral')

const completedWithoutStatus = baseCall()
completedWithoutStatus.latest_thesis_status = null
completedWithoutStatus.timeline[0].thesis_status = null
completedWithoutStatus.timeline[0].thesis_delta_verdict = null
assert.equal(callTrackingSnapshot(completedWithoutStatus).situation.detail, 'Review completed')

const shortCall = baseCall()
shortCall.decision = 'Short Candidate'
shortCall.basket = 'Short'
shortCall.timeline[0].absolute_return_pct = -12.34
shortCall.timeline[0].benchmark_relative_return_pct = -10.25
assert.deepEqual(callTrackingSnapshot(shortCall).checkpoint, {
  label: '30-day check · 9 Aug 2026', price: 'AED 11.5', returnFromCall: '+12.3%',
  returnTone: 'good', benchmarkDelta: '10.3pp ahead of benchmark',
})

const rejectedCall = baseCall()
rejectedCall.decision = 'Avoid'
rejectedCall.basket = 'Rejected'
rejectedCall.timeline[0].absolute_return_pct = -8.4
rejectedCall.timeline[0].benchmark_relative_return_pct = -4.2
assert.deepEqual(callTrackingSnapshot(rejectedCall).checkpoint, {
  label: '30-day check · 9 Aug 2026', price: 'AED 11.5', returnFromCall: '+8.4%',
  returnTone: 'good', benchmarkDelta: '4.2pp ahead of benchmark',
})

const roundedZero = baseCall()
roundedZero.timeline[0].absolute_return_pct = -0.04
roundedZero.timeline[0].benchmark_relative_return_pct = -0.04
assert.equal(callTrackingSnapshot(roundedZero).checkpoint?.returnFromCall, '0.0%')
assert.equal(callTrackingSnapshot(roundedZero).checkpoint?.benchmarkDelta, 'even with benchmark')

const lateScheduled = baseCall()
lateScheduled.timeline = [
  { ...lateScheduled.timeline[0], review_date: '2026-08-20', review_file: 'reviews/late.json', memo_delta_summary: 'Newest evidence.' },
  { ...lateScheduled.timeline[0], window: 'ad-hoc', due_date: '2026-08-15', review_date: '2026-08-15', review_file: 'reviews/adhoc.json', memo_delta_summary: 'Older evidence.' },
]
const lateTracked = callTrackingSnapshot(lateScheduled)
assert.equal(lateTracked.checkpoint?.label, '30-day check · 20 Aug 2026')
assert.equal(lateTracked.evidence, 'Newest evidence.')

const expired = baseCall()
expired.timeline[0].decision_quality = null
expired.timeline[0].thesis_status = 'expired'
expired.timeline[0].thesis_delta_verdict = null
assert.deepEqual(callTrackingSnapshot(expired).situation, {
  headline: 'Thesis expired', detail: 'The recorded thesis window has ended', tone: 'neutral',
})

const contradictory = baseCall()
contradictory.timeline[0].thesis_status = 'broken'
assert.deepEqual(callTrackingSnapshot(contradictory).situation, {
  headline: 'Thesis broken',
  detail: 'Review fields disagree: thesis broken, decision quality skill, delta strengthened',
  tone: 'bad',
})

const brokenDelta = baseCall()
brokenDelta.timeline[0].thesis_delta_verdict = 'broken'
assert.deepEqual(callTrackingSnapshot(brokenDelta).situation, {
  headline: 'Thesis broken',
  detail: 'Review fields disagree: thesis confirmed, decision quality skill, delta broken',
  tone: 'bad',
})

const prematureDelta = baseCall()
prematureDelta.timeline[0].thesis_delta_verdict = 'too_early'
assert.deepEqual(callTrackingSnapshot(prematureDelta).situation, {
  headline: 'Review fields disagree',
  detail: 'Review fields disagree: thesis confirmed, decision quality skill, delta too early',
  tone: 'bad',
})

console.log('ok  Calls scorecard tells the original call, result, present read, and next check')
