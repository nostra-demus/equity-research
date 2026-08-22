import assert from 'node:assert/strict'
import {
  actionNowForCall, buildCallsScorecard, decisionMemoryBlock, directionAdjusted, isEquityCallMemorySwarm,
  latestDoneReview, selectCallMemories,
} from '../src/call-learning'

const reviewed = (ticker: string, decisionQuality: string, confidence: number, rel: number, basket = 'Selected') => ({
  ticker, company: `${ticker} Holdings`, decision_date: '2026-07-01', decision: basket === 'Rejected' ? 'Avoid' : 'Buy',
  basket, confidence, entry_price: 100, currency: 'USD', final_thesis_path: `analyses/${ticker}_2026-07-01/final_thesis.md`,
  timeline: [{
    window: '30d', status: 'done', review_date: '2026-08-01', review_price: 100 + rel,
    absolute_return_pct: rel, benchmark_relative_return_pct: rel, thesis_status: decisionQuality === 'genuine miss' ? 'broken' : 'confirmed',
    decision_quality: decisionQuality, review_file: `analyses/${ticker}_2026-07-01/reviews/review.json`,
  }],
})

assert.equal(directionAdjusted('Short', -12), 12)
assert.equal(directionAdjusted('Rejected', -8), null)
assert.equal(directionAdjusted('Watchlist', 15), null)
assert.equal(directionAdjusted('Selected', -8), -8)
assert.equal(isEquityCallMemorySwarm('research'), true)
assert.equal(isEquityCallMemorySwarm('screener'), true)
assert.equal(isEquityCallMemorySwarm('commodity'), false, 'commodity symbols cannot read the equity Calls ledger')

const selectedAtRisk = reviewed('RISK', '', 70, 0)
selectedAtRisk.timeline[0].thesis_status = 'at-risk'
selectedAtRisk.timeline[0].decision_quality = ''
assert.equal(actionNowForCall(selectedAtRisk).label, 'Exit', 'the canonical at-risk enum triggers the defensive action')
selectedAtRisk.timeline[0].thesis_status = 'at risk'
assert.equal(actionNowForCall(selectedAtRisk).label, 'Hold', 'an invalid near-spelling is not silently accepted as a schema enum')

const calls = [
  reviewed('LOW1', 'genuine miss', 40, -10), reviewed('LOW2', 'skill', 45, 5),
  reviewed('MID1', 'skill', 60, 8), reviewed('MID2', 'skill', 65, 10),
  reviewed('HIGH1', 'skill', 75, 12), reviewed('HIGH2', 'skill', 80, 14),
  reviewed('TOP1', 'skill', 90, 15), reviewed('TOP2', 'skill', 95, 18),
  reviewed('LUCK', 'luck', 70, 4),
  { ...reviewed('SHORT', 'skill', 72, -20, 'Short'), timeline: [
    { ...reviewed('SHORT', 'skill', 72, -20, 'Short').timeline[0], absolute_return_pct: -20, benchmark_relative_return_pct: -15 },
    { ...reviewed('SHORT', 'skill', 72, -20, 'Short').timeline[0], window: 'ad-hoc', review_date: '2026-08-05', absolute_return_pct: -22, benchmark_relative_return_pct: -17 },
  ] },
]
const score = buildCallsScorecard(calls)
assert.equal(score.worked, 8, 'one latest review per call is scored; repeat reviews do not double-count a call')
assert.equal(score.failed, 1)
assert.equal(score.mixed, 1)
assert.equal(score.horizons.find((row) => row.window === '30d')?.reviewed, 10)
assert.equal(score.confidence_check.status, 'aligned')
assert.ok((score.average_vs_benchmark_pct || 0) > 0, 'short returns are direction-adjusted in aggregate')
const repeatedTickerScore = buildCallsScorecard(Array.from({ length: 8 }, (_, index) => ({
  ...reviewed('REPEAT', index % 2 ? 'skill' : 'genuine miss', index < 4 ? 60 : 80, index),
  decision_date: `2026-07-${String(index + 1).padStart(2, '0')}`,
  run_root: `analyses/REPEAT_2026-07-${String(index + 1).padStart(2, '0')}`,
})))
assert.equal(repeatedTickerScore.confidence_check.status, 'too_little_data')
assert.equal(repeatedTickerScore.confidence_check.scored_calls, 1,
  'repeat runs on one ticker count as one independent confidence-calibration observation')
const withProvisional = buildCallsScorecard([...calls, { ...reviewed('PROVISIONAL', 'skill', 99, 90), integrity_status: 'provisional' }])
assert.equal(withProvisional.excluded_provisional, 1)
assert.equal(withProvisional.worked, score.worked)
assert.equal(withProvisional.average_return_pct, score.average_return_pct,
  'provisional calls stay visible outside the scorecard but cannot change its accuracy or returns')
assert.deepEqual(withProvisional.confidence_check, score.confidence_check,
  'provisional calls cannot change confidence calibration')

const sameDayReviews = [
  { window: '30d', status: 'done', review_date: '2026-08-09', decision_quality: 'genuine miss', absolute_return_pct: -4, review_file: 'reviews/a.json' },
  { window: '30d', status: 'done', review_date: '2026-08-09', decision_quality: 'skill', absolute_return_pct: 6, review_file: 'reviews/b.json' },
]
assert.equal(latestDoneReview(sameDayReviews)?.review_file, 'reviews/b.json')
assert.equal(latestDoneReview([...sameDayReviews].reverse())?.review_file, 'reviews/b.json',
  'same-day review selection is independent of input order')
assert.equal(latestDoneReview([null as never, undefined as never, ...sameDayReviews])?.review_file, 'reviews/b.json',
  'legacy null timeline rows cannot crash review selection')
const sameDayCall = { ...reviewed('TIE', 'skill', 70, 1), timeline: sameDayReviews }
assert.deepEqual(buildCallsScorecard([sameDayCall]), buildCallsScorecard([{ ...sameDayCall, timeline: [...sameDayReviews].reverse() }]),
  'aggregate and horizon scorecards use the same deterministic review winner')
assert.doesNotThrow(() => buildCallsScorecard([{ ...sameDayCall, timeline: {} as never }]),
  'schema-less non-array timelines degrade safely instead of crashing the Calls dashboard')

const memoryCall = {
  ticker: 'AMZN', company: 'Amazon.com, Inc.', decision_date: '2026-07-10', decision: 'Watchlist', basket: 'Watchlist',
  confidence: 52, entry_price: 238.34, currency: 'USD', exchange: 'NASDAQ', final_thesis_path: 'analyses/AMZN_2026-07-10/final_thesis.md',
  run_root: 'analyses/AMZN_2026-07-10', frozen_call: { confidence: 72, source_path: 'analyses/AMZN_2026-07-10/decision_record.json' },
  timeline: [{
    window: '30d', status: 'done', review_date: '2026-08-09', review_price: 274.48,
    absolute_return_pct: 15.16, benchmark_relative_return_pct: 11.49, thesis_status: 'broken', decision_quality: 'genuine miss',
    action_now: { label: 'Keep watching', reason: 'Re-run earnings before acting.', recorded: true },
    confidence_update: { before: 72, after: 45, change_reason: 'AWS margin expanded.' },
    learning: { why_right_or_wrong: 'Nostra underestimated AWS growth.', error_source: 'bad base rate', rule_for_future: 'Use the AWS segment base rate.', future_research_check: 'Recheck AWS growth and margin.' },
    error_taxonomy: ['bad base rate'], next_check: { date: '2026-10-30', label: 'Q3 AWS growth and margin', trigger: 'AWS growth' },
    review_file: 'analyses/AMZN_2026-07-10/reviews/2026-08-09_30d_decision_review.json',
  }],
}
const matched = selectCallMemories([memoryCall, reviewed('MSFT', 'skill', 70, 5)], ['Amazon.com, Inc.'])
assert.equal(matched.length, 1)
assert.equal(matched[0].ticker, 'AMZN')
assert.equal(matched[0].original_confidence, 72, 'frozen confidence beats a drifted projected copy')
assert.equal(selectCallMemories([memoryCall], ['Amazon']).length, 1, 'structured short issuer names match the same legal-form-normalized company')
assert.equal(selectCallMemories([memoryCall], ['Amazonian rainforest']).length, 0, 'company matching is exact, not fuzzy')
const oracleCall = { ...memoryCall, ticker: 'ORCL', company: 'Oracle Corporation', decision_date: '2026-08-20' }
assert.deepEqual(selectCallMemories([oracleCall, memoryCall], ['ORCL'], 3, 'What changed at Amazon?').map((row) => row.ticker), ['AMZN', 'ORCL'],
  'the issuer named in the question ranks ahead of incidental companies in retrieved evidence')
const sameRankOracle = { ...oracleCall, decision_date: memoryCall.decision_date }
assert.deepEqual(selectCallMemories([sameRankOracle, memoryCall], ['AMZN ORCL']).map((row) => row.ticker), ['AMZN', 'ORCL'])
assert.deepEqual(selectCallMemories([memoryCall, sameRankOracle], ['AMZN ORCL']).map((row) => row.ticker), ['AMZN', 'ORCL'],
  'same-rank, same-date memories have a stable ticker tie-break independent of input order')
const freshCall = { ...memoryCall, decision_date: '2026-08-20', decision: 'Buy', run_root: 'analyses/AMZN_2026-08-20', timeline: [] }
const currentAndLesson = selectCallMemories([memoryCall, freshCall], ['AMZN'])
assert.deepEqual(currentAndLesson.map((row) => row.decision_date), ['2026-08-20', '2026-07-10'])
assert.equal(currentAndLesson[1].why_right_or_wrong, 'Nostra underestimated AWS growth.',
  'a fresh unreviewed call cannot erase the newest reviewed same-ticker lesson')
const unsupportedAdd = { ...memoryCall, decision: 'Buy', basket: 'Selected', timeline: [{
  ...memoryCall.timeline[0], thesis_status: 'confirmed', decision_quality: 'skill',
  action_now: { label: 'Add', reason: '', recorded: true },
}] }
assert.equal(actionNowForCall(unsupportedAdd).label, 'Hold', 'an action without an evidence reason is ignored')
const venueTwin = { ...memoryCall, company: 'Amazon Europe plc', exchange: 'LSE', run_root: 'analyses/AMZN_LSE_2026-07-10' }
assert.deepEqual(selectCallMemories([venueTwin, memoryCall], ['AMZN']).map((row) => row.exchange), ['LSE', 'NASDAQ'],
  'same ticker on different venues remains two issuer/listing memories')
const nowCall = { ...memoryCall, ticker: 'NOW', company: 'ServiceNow, Inc.' }
assert.equal(selectCallMemories([nowCall], [], 3, 'What should I do now?').length, 0,
  'a lowercase common word cannot be mistaken for a ticker in a free-form question')
assert.equal(selectCallMemories([nowCall], [], 3, 'What changed at NOW?').length, 1)
assert.equal(selectCallMemories([nowCall], [], 3, 'What changed at $now?').length, 1,
  'uppercase and cashtag ticker syntax remain explicit question matches')
const block = decisionMemoryBlock(matched)
assert.match(block, /FROZEN ORIGINAL: Nostra rated it Watchlist/)
assert.match(block, /AMZN @ NASDAQ — Amazon\.com, Inc\./)
assert.doesNotMatch(block, /said enter/i)
assert.match(block, /RECHECK NOW: Recheck AWS growth and margin/)
assert.match(block, /72 → 45\/100/)
assert.match(block, /ORIGINAL SOURCE: analyses\/AMZN_2026-07-10\/decision_record\.json/)
assert.match(block, /REVIEW SOURCE: analyses\/AMZN_2026-07-10\/reviews\/2026-08-09_30d_decision_review\.json/)
const undatedMemoryCall = { ...memoryCall, timeline: [{ ...memoryCall.timeline[0], next_check: { date: null, label: 'Q3 AWS results', trigger: 'AWS growth' } }] }
assert.match(decisionMemoryBlock(selectCallMemories([undatedMemoryCall], ['AMZN'])), /NEXT CHECK: date not proven — Q3 AWS results/)

console.log('ok  self-correcting call memory is immutable, direction-aware, calibrated, and exact-matched')
