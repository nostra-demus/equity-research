import assert from 'node:assert/strict'
import {
  buildCallsScorecard, decisionMemoryBlock, directionAdjusted, latestDoneReview, selectCallMemories,
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
assert.equal(directionAdjusted('Rejected', -8), 8)
assert.equal(directionAdjusted('Selected', -8), -8)

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

const sameDayReviews = [
  { window: '30d', status: 'done', review_date: '2026-08-09', decision_quality: 'genuine miss', absolute_return_pct: -4, review_file: 'reviews/a.json' },
  { window: '30d', status: 'done', review_date: '2026-08-09', decision_quality: 'skill', absolute_return_pct: 6, review_file: 'reviews/b.json' },
]
assert.equal(latestDoneReview(sameDayReviews)?.review_file, 'reviews/b.json')
assert.equal(latestDoneReview([...sameDayReviews].reverse())?.review_file, 'reviews/b.json',
  'same-day review selection is independent of input order')
const sameDayCall = { ...reviewed('TIE', 'skill', 70, 1), timeline: sameDayReviews }
assert.deepEqual(buildCallsScorecard([sameDayCall]), buildCallsScorecard([{ ...sameDayCall, timeline: [...sameDayReviews].reverse() }]),
  'aggregate and horizon scorecards use the same deterministic review winner')

const memoryCall = {
  ticker: 'AMZN', company: 'Amazon.com, Inc.', decision_date: '2026-07-10', decision: 'Watchlist', basket: 'Watchlist',
  confidence: 72, entry_price: 238.34, currency: 'USD', final_thesis_path: 'analyses/AMZN_2026-07-10/final_thesis.md',
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
assert.equal(selectCallMemories([memoryCall], ['Amazon']).length, 1, 'structured short issuer names match the same legal-form-normalized company')
assert.equal(selectCallMemories([memoryCall], ['Amazonian rainforest']).length, 0, 'company matching is exact, not fuzzy')
const oracleCall = { ...memoryCall, ticker: 'ORCL', company: 'Oracle Corporation', decision_date: '2026-08-20' }
assert.deepEqual(selectCallMemories([oracleCall, memoryCall], ['What changed at Amazon?', 'ORCL']).map((row) => row.ticker), ['AMZN', 'ORCL'],
  'the issuer named in the question ranks ahead of incidental companies in retrieved evidence')
const sameRankOracle = { ...oracleCall, decision_date: memoryCall.decision_date }
assert.deepEqual(selectCallMemories([sameRankOracle, memoryCall], ['AMZN ORCL']).map((row) => row.ticker), ['AMZN', 'ORCL'])
assert.deepEqual(selectCallMemories([memoryCall, sameRankOracle], ['AMZN ORCL']).map((row) => row.ticker), ['AMZN', 'ORCL'],
  'same-rank, same-date memories have a stable ticker tie-break independent of input order')
const block = decisionMemoryBlock(matched)
assert.match(block, /FROZEN ORIGINAL: Nostra rated it Watchlist/)
assert.doesNotMatch(block, /said enter/i)
assert.match(block, /RECHECK NOW: Recheck AWS growth and margin/)
assert.match(block, /72 → 45\/100/)

console.log('ok  self-correcting call memory is immutable, direction-aware, calibrated, and exact-matched')
