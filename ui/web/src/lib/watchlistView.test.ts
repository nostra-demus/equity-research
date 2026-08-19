// The tile grid's reading rules (lib/watchlistView.ts).
//
// The cases that matter are the ones where the two units meet: a dated trigger must never be expressed as
// a percentage, a price trigger must never be expressed in days, and a name carrying both must surface
// whichever is genuinely nearer. Run: npx tsx src/lib/watchlistView.test.ts
import assert from 'node:assert/strict'
import type { WatchRow, WatchTriggerEval } from './types'
import { absenceReason, distanceLabel, rowDistance, sortForGrid, tileBand, triggerCaption, urgencyRank } from './watchlistView'

let passed = 0
function check(name: string, fn: () => void): void {
  try { fn(); passed++; console.log('  ok ', name) } catch (e) { console.error('  FAIL', name); console.error('   ', e); process.exitCode = 1 }
}

function ev(over: Partial<WatchTriggerEval> = {}): WatchTriggerEval {
  return { trigger_id: 'T', kind: 'price_level', mode: 'auto', state: 'not_met', detail: '', gap_pct: null, days_to: null, reason: null, ...over } as WatchTriggerEval
}
function row(over: Partial<WatchRow> = {}): WatchRow {
  return {
    listing_key: 'X|USD', ticker: 'X', company_name: 'X Inc', currency: 'USD', exchange: 'NYSE',
    origin: 'manual', entry_id: 'E', why: '', conviction: 'medium', review_date: null, tags: [],
    triggers: [], attachments: [], engine: null, resurfaced: false, archive: null, quote: null,
    quote_reason: null, evals: [], state: 'armed', nearest_gap_pct: null, nearest: null,
    run_root: null, final_thesis_path: null, added_at: null, updated_at: null, engine_since: null,
    ...over,
  } as WatchRow
}

check('a dated distance stays in days and never becomes a percent', () => {
  const r = row({ nearest: { unit: 'days', value: 8 }, evals: [ev({ kind: 'event_date', mode: 'reminder', days_to: 8 })] })
  assert.deepEqual(rowDistance(r), { unit: 'days', value: 8 })
  assert.equal(distanceLabel(r), '8d')
  assert.equal(triggerCaption(r), 'date')
})

check('a date that has arrived reads "today", and one that passed says it is late', () => {
  const today = row({ state: 'due', nearest: { unit: 'days', value: 0 }, evals: [ev({ kind: 'event_date', days_to: 0, due: true })] })
  assert.equal(distanceLabel(today), 'today')
  // "−3d" would read as a distance still to travel; it is the opposite
  const late = row({ state: 'due', nearest: { unit: 'days', value: -3 }, evals: [ev({ kind: 'event_date', days_to: -3, due: true })] })
  assert.equal(distanceLabel(late), '3d late')
})

check('a dated trigger is DUE, never MET — only a human clears a date', () => {
  const r = row({ state: 'due', nearest: { unit: 'days', value: 0 }, evals: [ev({ kind: 'event_date', days_to: 0, due: true })] })
  assert.equal(tileBand(r), 'due')
})

check('a price gap keeps its sign, so "must fall" is distinguishable from "must rise"', () => {
  assert.equal(distanceLabel(row({ nearest: { unit: 'pct', value: -4.3 } })), '−4.3%')
  assert.equal(distanceLabel(row({ nearest: { unit: 'pct', value: 19.4 } })), '+19.4%')
})

check('near means within 5% OR within 7 days — both halves equally true', () => {
  assert.equal(tileBand(row({ nearest: { unit: 'pct', value: -4.9 } })), 'near')
  assert.equal(tileBand(row({ nearest: { unit: 'pct', value: -5.1 } })), 'waiting')
  assert.equal(tileBand(row({ nearest: { unit: 'days', value: 7 } })), 'near')
  assert.equal(tileBand(row({ nearest: { unit: 'days', value: 8 } })), 'waiting')
})

check('a name carrying both kinds surfaces whichever is genuinely nearer', () => {
  // 2 days out ranks ahead of 4% away: 2/7 < 4/5. The rank orders them; nothing merges them.
  const twoDaysOut = row({ nearest: { unit: 'days', value: 2 } })      // 2/7 = 0.29
  const onePctAway = row({ nearest: { unit: 'pct', value: -1 } })      // 1/5 = 0.20
  const fourPctAway = row({ nearest: { unit: 'pct', value: -4 } })     // 4/5 = 0.80
  assert.ok(urgencyRank(onePctAway) < urgencyRank(twoDaysOut), 'a 1% gap is nearer than a 2-day wait')
  assert.ok(urgencyRank(twoDaysOut) < urgencyRank(fourPctAway), 'a 2-day wait is nearer than a 4% gap')
})

check('an unmeasurable row shows an absence with a reason, never a zero', () => {
  const r = row({ state: 'not_evaluable', evals: [ev({ state: 'not_evaluable', detail: 'Set in USD, priced in CNY — comparing them needs an FX rate.' })] })
  assert.equal(distanceLabel(r), '—')
  assert.equal(tileBand(r), 'noeval')
  assert.match(String(absenceReason(r)), /FX rate/)
  assert.equal(absenceReason(row({ nearest: { unit: 'pct', value: -3 } })), null, 'a measurable row has no absence to explain')
})

check('a row with no triggers at all says so rather than looking evaluated', () => {
  assert.equal(absenceReason(row()), 'No trigger set — reminder only.')
  assert.equal(triggerCaption(row()), 'no trigger')
})

check('the grid orders fired first, then nearest, then the unmeasurable', () => {
  const rows = [
    row({ ticker: 'FAR', nearest: { unit: 'pct', value: -22 } }),
    row({ ticker: 'DEAD', state: 'not_evaluable' }),
    row({ ticker: 'FIRED', state: 'condition_met', nearest: { unit: 'pct', value: 0 } }),
    row({ ticker: 'SOON', nearest: { unit: 'days', value: 3 } }),
    row({ ticker: 'CLOSE', nearest: { unit: 'pct', value: -1.2 } }),
  ]
  assert.deepEqual(sortForGrid(rows).map((r) => r.ticker), ['FIRED', 'CLOSE', 'SOON', 'FAR', 'DEAD'])
})

check('an older engine without the unit-tagged field still shows its price gaps', () => {
  // deploy skew: a newer bundle against an engine that only sends nearest_gap_pct
  const legacy = row({ nearest: undefined, nearest_gap_pct: -6.5 })
  assert.deepEqual(rowDistance(legacy), { unit: 'pct', value: -6.5 })
  assert.equal(distanceLabel(legacy), '−6.5%')
  assert.equal(tileBand(legacy), 'waiting')
})

check('sorting is stable by ticker so the grid does not shuffle between refreshes', () => {
  const a = row({ ticker: 'BBB', nearest: { unit: 'pct', value: -3 } })
  const b = row({ ticker: 'AAA', nearest: { unit: 'pct', value: -3 } })
  assert.deepEqual(sortForGrid([a, b]).map((r) => r.ticker), ['AAA', 'BBB'])
})

check('a malformed distance is an absence, not a NaN on the tile', () => {
  // both fields cross the wire, and static mode builds them in a separate program — so a null, a string
  // or a NaN is reachable without anyone writing a bug in this file
  for (const bad of [null, undefined, NaN, 'soon', Infinity]) {
    const r = row({ nearest: { unit: 'pct', value: bad as unknown as number } })
    assert.equal(rowDistance(r), null, `value ${String(bad)} is not a distance`)
    assert.equal(distanceLabel(r), '—')
  }
  assert.equal(rowDistance(row({ nearest: { unit: 'weeks' as 'pct', value: 3 } })), null, 'an unknown unit is refused')
  assert.equal(rowDistance(row({ nearest: undefined, nearest_gap_pct: NaN as unknown as number })), null, 'the legacy field is checked too')
})

check('the grid comparator stays consistent when a row cannot be ranked', () => {
  // an inconsistent comparator does not throw — V8 just returns an arbitrary order, which shows up as a
  // grid that reshuffles between refreshes and is very hard to trace back to a sort function
  const rows = [
    row({ ticker: 'BAD', nearest: { unit: 'pct', value: NaN as unknown as number } }),
    row({ ticker: 'NEAR', nearest: { unit: 'pct', value: -1 } }),
    row({ ticker: 'ALSOBAD', nearest: { unit: 'days', value: 'x' as unknown as number } }),
    row({ ticker: 'FAR', nearest: { unit: 'pct', value: -30 } }),
  ]
  const once = sortForGrid(rows).map((r) => r.ticker)
  const twice = sortForGrid([...rows].reverse()).map((r) => r.ticker)
  assert.deepEqual(once, ['NEAR', 'FAR', 'ALSOBAD', 'BAD'], 'measurable first, unmeasurable last by ticker')
  assert.deepEqual(once, twice, 'and the order does not depend on the input order')
})

check('a row missing evals entirely still reports an absence rather than throwing', () => {
  const r = row({ evals: undefined as unknown as [] })
  assert.equal(absenceReason(r), 'No trigger set — reminder only.')
  assert.equal(triggerCaption(r), 'no trigger')
})

console.log(`\nwatchlistView.test.ts: ${passed} passed`)
