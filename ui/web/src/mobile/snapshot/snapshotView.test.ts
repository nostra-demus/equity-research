// The snapshot card's per-swarm derivations. The §5-shaped rule under test: an absent field is OMITTED,
// never invented — a commodity has no entry price, a signal has no ticker quote, a never-run subject has
// nothing at all, and the card must degrade to exactly what the run recorded.
// Fixtures mirror REAL records on disk (GOLD's capped Trim/39-over-52, the SIG board join).
// Run: npx tsx src/mobile/snapshot/snapshotView.test.ts
import assert from 'node:assert/strict'
import { commoditySnapshot, researchSnapshot, signalSnapshot } from './snapshotView'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

check('research: full card from decision + quote', () => {
  const s = researchSnapshot(
    { decision: 'Watchlist', confidence_score: 57, entry_price: 238.34, currency: 'USD' },
    { ticker: 'AMZN', quote: { price: 235.5 }, call: { move_since_call_pct: -1.2 } } as any,
  )
  assert.deepEqual(s, { kind: 'research', verdict: 'Watchlist', confidence: 57, entry: 238.34, currency: 'USD', live: 235.5, movePct: -1.2 })
})

check('research: a dead quote degrades to the decision-only card — no live cell, no move', () => {
  const s: any = researchSnapshot({ decision: 'Watchlist', confidence_score: 57, entry_price: 238.34 }, null)
  assert.equal(s.live, undefined)
  assert.equal(s.movePct, undefined)
  assert.equal(s.verdict, 'Watchlist')
})

check('research: no entry price in the record → the field is simply absent', () => {
  const s: any = researchSnapshot({ decision: 'Watchlist', confidence_score: 57, entry_price: null }, null)
  assert.equal(s.entry, undefined)
})

check('research: no decision record at all → never-run', () => {
  assert.equal(researchSnapshot(null, null).kind, 'never-run')
})

check('research: a stale quote suppresses movePct and flags liveStale (mirrors desktop priceQualifier)', () => {
  const s: any = researchSnapshot(
    { decision: 'Watchlist', confidence_score: 57, entry_price: 238.34, currency: 'USD' },
    { ticker: 'AMZN', quote: { price: 235.5, stale: true }, call: { move_since_call_pct: -1.2 } } as any,
  )
  assert.equal(s.live, 235.5)
  assert.equal(s.liveStale, true)
  assert.equal(s.movePct, undefined) // a stale price re-based against entry is not a real "move"
})

check('research: a delayed-but-fresh quote keeps movePct and flags liveDelayed', () => {
  const s: any = researchSnapshot(
    { decision: 'Watchlist', confidence_score: 57, entry_price: 238.34, currency: 'USD' },
    { ticker: 'AMZN', quote: { price: 235.5, delayed: true }, call: { move_since_call_pct: -1.2 } } as any,
  )
  assert.equal(s.liveDelayed, true)
  assert.equal(s.liveStale, undefined)
  assert.equal(s.movePct, -1.2)
})

check('research: a settled close is flagged liveIsClose, not left indistinguishable from a live tick', () => {
  const s: any = researchSnapshot(
    { decision: 'Watchlist', confidence_score: 57, entry_price: 238.34, currency: 'USD' },
    { ticker: 'AMZN', quote: { price: 235.5, as_of_is_close: true, as_of: '2026-08-07T21:00:00Z' } } as any,
  )
  assert.equal(s.liveIsClose, true)
  assert.equal(s.liveAsOf, '2026-08-07T21:00:00Z')
})

check('signal: thesis headline beats the signal headline (which can be empty on the board)', () => {
  const s: any = signalSnapshot(
    { signal_id: 'SIG-1', headline: '', status: 'promoted' } as any,
    { thesis_id: 'T1', signal_id: 'SIG-1', headline: 'Yunnan power rationing curbs smelting', status: 'provisional', edge_score: 67 } as any,
  )
  assert.equal(s.headline, 'Yunnan power rationing curbs smelting')
  assert.equal(s.edge, 67)
})

check('signal: the live conviction edge beats the locked edge score', () => {
  const s: any = signalSnapshot(undefined, { thesis_id: 'T1', signal_id: 'SIG-1', edge_score: 67, conviction: { edge_score_live: 82 } } as any)
  assert.equal(s.edge, 82)
})

check('signal: nothing on the board → never-run', () => {
  assert.equal(signalSnapshot(undefined, undefined).kind, 'never-run')
})

check('commodity: GOLD-shaped — the CAPPED verdict, the raw confidence shown beside it, price, 4 chips', () => {
  const s: any = commoditySnapshot(
    { subject: 'GOLD', hasRun: true, verdict: 'Trim', confidence: 39, verdictIsPostMortemCapped: true, confidenceIsPostReview: true } as any,
    { action: 'Hold', confidence: 52, current_price: { value: 4192.4, currency: 'USD', unit: 'troy oz', as_of: '2026-07-03' }, curve: 'contango', balance: 'balanced', net_macro: 'headwind', positioning: 'crowded long' },
  )
  assert.equal(s.verdict, 'Trim')                 // never the record's raw Hold
  assert.equal(s.confidence, 39)
  assert.equal(s.confidenceRaw, 52)
  assert.equal(s.capped, true)
  assert.equal(s.price, 4192.4)
  assert.equal(s.priceUnit, 'USD/troy oz')
  assert.deepEqual(s.chips, ['contango', 'balanced', 'macro headwind', 'crowded long'])
})

check('commodity: an uncapped record shows no "(before cap)" figure', () => {
  const s: any = commoditySnapshot(
    { subject: 'COPPER', hasRun: true, verdict: 'Avoid', confidence: 55 } as any,
    { action: 'Avoid', confidence: 55, curve: 'backwardation' },
  )
  assert.equal(s.capped, undefined)
  assert.equal(s.confidenceRaw, undefined)
  assert.deepEqual(s.chips, ['backwardation'])   // only what the record carries
})

check('commodity: 8 of 12 have no run today — never-run is a first-class state', () => {
  const s = commoditySnapshot({ subject: 'SUGAR', hasRun: false, verdict: null, confidence: null } as any, null)
  assert.equal(s.kind, 'never-run')
})

const EXPECTED_CHECKS = 13
assert.ok(passed >= EXPECTED_CHECKS, `only ${passed} checks ran, expected at least ${EXPECTED_CHECKS}`)
console.log(`\nsnapshotView.test.ts: ${passed} checks passed`)
