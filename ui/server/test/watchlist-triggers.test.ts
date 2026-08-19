// Watchlist trigger evaluation (src/watchlist.ts evaluateTrigger / rollupState).
//
// The cases that matter are the ones where a wrong answer LOOKS fine: a boundary that should count as
// met, a short whose trigger fires the opposite way, a division that would produce Infinity, and above
// all the refusals — a currency mismatch or an absent price must return "cannot be checked", never
// "not met", because a false negative stated as fact is the §3 failure this module exists to avoid.
// Run: npx tsx test/watchlist-triggers.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { daysBetween, evaluateTrigger, nearestDistance, rollupState, triggerSetProblem, urgencyRank, type EvalContext, type WatchTrigger } from '../src/watchlist'
import type { LiveQuote } from '../src/news/equity-quote'

let passed = 0
function check(name: string, fn: () => void): void {
  try {
    fn()
    passed++
    console.log('  ok ', name)
  } catch (e) {
    console.error('  FAIL', name)
    console.error('   ', e)
    process.exitCode = 1
  }
}

const TODAY = '2026-08-18'
const quote = (price: number, currency = 'USD'): LiveQuote => ({
  ticker: 'X', symbol: 'X', name: 'X Inc', exchange: 'NYSE', currency, price,
  as_of: '2026-08-18T16:00:00Z', as_of_is_close: false, delayed: true, source: 'cnbc', stale: false,
})
const ctx = (q: LiveQuote | null, reason: EvalContext['quoteReason'] = null): EvalContext => ({ quote: q, quoteReason: reason, today: TODAY })

const priceLevel = (over: Partial<Extract<WatchTrigger, { kind: 'price_level' }>> = {}): WatchTrigger => ({
  kind: 'price_level', trigger_id: 'T1', direction: 'at_or_below', level: 190, currency: 'USD', ...over,
})
const pctDrop = (over: Partial<Extract<WatchTrigger, { kind: 'pct_drop' }>> = {}): WatchTrigger => ({
  kind: 'pct_drop', trigger_id: 'T2', drop_pct: 15,
  reference: { value: 358.12, currency: 'USD', as_of: '2026-08-18', source: 'price now' }, ...over,
})
const mos = (over: Partial<Extract<WatchTrigger, { kind: 'valuation_mos' }>> = {}): WatchTrigger => ({
  kind: 'valuation_mos', trigger_id: 'T3', run_root: 'analyses/AMZN_2026-07-10', scenario_label: 'base',
  anchor_value: 210, anchor_currency: 'USD', anchor_as_of: '2026-07-10', required_mos_pct: 20,
  direction: 'at_or_below', ...over,
})
const evt = (over: Partial<Extract<WatchTrigger, { kind: 'event_date' }>> = {}): WatchTrigger => ({
  kind: 'event_date', trigger_id: 'T4', due_date: '2026-10-30', label: 'Q3 print', ...over,
})

// ---- price level ----
check('price at the level counts as met (inclusive)', () => {
  assert.equal(evaluateTrigger(priceLevel(), ctx(quote(190))).state, 'condition_met')
})
check('price above the level is not met, and the detail shows the gap', () => {
  const r = evaluateTrigger(priceLevel(), ctx(quote(231.06)))
  assert.equal(r.state, 'not_met')
  assert.match(r.detail, /21\.6% above/)
})
check('an at_or_above trigger fires the other way — a short is not blind', () => {
  const up = priceLevel({ direction: 'at_or_above', level: 400 })
  assert.equal(evaluateTrigger(up, ctx(quote(410))).state, 'condition_met')
  assert.equal(evaluateTrigger(up, ctx(quote(390))).state, 'not_met')
})

// ---- pct drop ----
check('a drop trigger prints the threshold it computed', () => {
  const r = evaluateTrigger(pctDrop({ drop_pct: 12 }), ctx(quote(358.12)))
  assert.match(r.detail, /= USD 315\.15/, 'the arithmetic is shown, not implied')
  assert.equal(r.state, 'not_met')
})
check('a drop trigger fires once the price reaches the threshold', () => {
  assert.equal(evaluateTrigger(pctDrop({ drop_pct: 12 }), ctx(quote(315.15))).state, 'condition_met')
})
check('a zero or negative reference is not evaluable, never Infinity', () => {
  const r = evaluateTrigger(pctDrop({ reference: { value: 0, currency: 'USD', as_of: null, source: 'x' } }), ctx(quote(10)))
  assert.equal(r.state, 'not_evaluable')
  assert.equal(r.reason, 'no_reference')
  assert.ok(!/Infinity|NaN/.test(r.detail))
})

// ---- margin of safety ----
check('margin of safety shows its subtraction and its required threshold', () => {
  const r = evaluateTrigger(mos(), ctx(quote(231.06)))
  assert.equal(r.state, 'not_met')
  assert.match(r.detail, /-10% vs 20% required/)
})
check('margin of safety fires at the required discount', () => {
  assert.equal(evaluateTrigger(mos(), ctx(quote(168))).state, 'condition_met')
})
check('no pinned anchor is a reminder, not a false negative', () => {
  const r = evaluateTrigger(mos({ anchor_value: 0 }), ctx(quote(100)))
  assert.equal(r.state, 'not_evaluable')
  assert.equal(r.reason, 'no_anchor')
})

// ---- refusals ----
check('a trigger set in another currency REFUSES rather than comparing', () => {
  const r = evaluateTrigger(priceLevel({ currency: 'INR', level: 520 }), ctx(quote(231.06, 'USD')))
  assert.equal(r.state, 'not_evaluable')
  assert.equal(r.reason, 'currency_mismatch_trigger')
  assert.match(r.detail, /FX rate and date/)
})
check('no price at all carries the feed’s own reason through', () => {
  const r = evaluateTrigger(priceLevel(), ctx(null, 'no_currency'))
  assert.equal(r.state, 'not_evaluable')
  assert.equal(r.reason, 'no_currency')
})
check('every auto trigger without a price refuses — none silently reads not_met', () => {
  for (const t of [priceLevel(), pctDrop(), mos()]) {
    assert.equal(evaluateTrigger(t, ctx(null, 'feed_unavailable')).state, 'not_evaluable', t.kind)
  }
})

// ---- event date ----
check('an event date is never met — it comes due', () => {
  const past = evaluateTrigger(evt({ due_date: '2026-08-01' }), ctx(null))
  assert.equal(past.state, 'not_met')
  assert.equal(past.due, true)
  assert.equal(past.mode, 'reminder')
})
check('a future event is not due, and today IS due', () => {
  assert.equal(evaluateTrigger(evt({ due_date: '2026-12-01' }), ctx(null)).due, false)
  assert.equal(evaluateTrigger(evt({ due_date: TODAY }), ctx(null)).due, true)
})
check('an event never auto-clears — only an acknowledgement clears it', () => {
  const r = evaluateTrigger(evt({ due_date: '2026-08-01', acknowledged_at: '2026-08-02T00:00:00Z' }), ctx(null))
  assert.equal(r.due, false)
  assert.match(r.detail, /acknowledged/)
})
check('a date compares correctly across a year boundary', () => {
  assert.equal(evaluateTrigger(evt({ due_date: '2025-12-31' }), ctx(null)).due, true)
  assert.equal(evaluateTrigger(evt({ due_date: '2027-01-01' }), ctx(null)).due, false)
})

// ---- rollup ----
check('rollup ranks anything actionable above anything quiet', () => {
  const met = evaluateTrigger(priceLevel(), ctx(quote(180)))
  const armed = evaluateTrigger(priceLevel(), ctx(quote(400)))
  const due = evaluateTrigger(evt({ due_date: '2026-08-01' }), ctx(null))
  const un = evaluateTrigger(priceLevel(), ctx(null, 'no_currency'))
  assert.equal(rollupState([armed, met]), 'condition_met')
  assert.equal(rollupState([un, due]), 'due')
  assert.equal(rollupState([un, armed]), 'armed')
  assert.equal(rollupState([un]), 'not_evaluable')
  assert.equal(rollupState([]), 'watching')
})

// ---- the same question must not be asked twice ----

check('a second drop or margin-of-safety trigger is refused', () => {
  assert.equal(triggerSetProblem([{ kind: 'pct_drop' }]), null)
  assert.match(String(triggerSetProblem([{ kind: 'pct_drop' }, { kind: 'pct_drop' }])), /only one drop/)
  assert.match(String(triggerSetProblem([{ kind: 'valuation_mos' }, { kind: 'valuation_mos' }])), /only one margin/)
})

check('repeats that MEAN something stay allowed', () => {
  // several dated reminders on one name is ordinary — a print, then a court date
  assert.equal(triggerSetProblem([{ kind: 'event_date' }, { kind: 'event_date' }, { kind: 'event_date' }]), null)
  // a floor and a ceiling are two different questions
  assert.equal(triggerSetProblem([
    { kind: 'price_level', direction: 'at_or_below' },
    { kind: 'price_level', direction: 'at_or_above' },
  ]), null)
})

check('two price levels pointing the SAME way are refused', () => {
  assert.match(String(triggerSetProblem([
    { kind: 'price_level', direction: 'at_or_below' },
    { kind: 'price_level', direction: 'at_or_below' },
  ])), /different directions/)
  assert.match(String(triggerSetProblem([
    { kind: 'price_level', direction: 'at_or_below' },
    { kind: 'price_level', direction: 'at_or_above' },
    { kind: 'price_level', direction: 'at_or_below' },
  ])), /at most two/)
})

check('a mixed, sensible set passes', () => {
  assert.equal(triggerSetProblem([
    { kind: 'price_level', direction: 'at_or_below' },
    { kind: 'pct_drop' },
    { kind: 'valuation_mos' },
    { kind: 'event_date' },
    { kind: 'event_date' },
  ]), null)
})


// ---- distance carries its unit (the tile grid's one number) ----

check('a dated trigger measures in DAYS and never borrows the price gap field', () => {
  const e = evaluateTrigger(evt({ due_date: '2026-08-26' }), ctx(quote(200)))
  assert.equal(e.days_to, 8, 'eight calendar days ahead of TODAY')
  assert.equal(e.gap_pct, null, 'a date has no percentage — leaving gap_pct null is the honest answer')
})

check('a price trigger measures in PERCENT and never borrows the day field', () => {
  const e = evaluateTrigger(priceLevel({ level: 180 }), ctx(quote(200)))
  assert.ok(e.gap_pct != null && e.gap_pct < 0, 'the price must fall, so the gap is negative')
  assert.equal(e.days_to, null)
})

check('daysBetween counts calendar days and is stable across a DST boundary', () => {
  assert.equal(daysBetween('2026-08-18', '2026-08-18'), 0, 'today is zero, not one')
  assert.equal(daysBetween('2026-08-18', '2026-08-19'), 1)
  assert.equal(daysBetween('2026-08-18', '2026-08-11'), -7, 'a passed date is negative')
  // Europe/US clocks change between these dates; a local-midnight parse drifts by one here
  assert.equal(daysBetween('2026-10-20', '2026-11-20'), 31)
  assert.equal(daysBetween('nonsense', '2026-08-19'), null, 'an unparseable date yields null, never a guess')
})

check('a row carrying BOTH kinds surfaces whichever trigger is genuinely nearer', () => {
  // 1% away outranks 2 days away (1/5 < 2/7); 4% away does not (4/5 > 2/7). Ordered, never merged.
  const near1pct = evaluateTrigger(priceLevel({ level: 198 }), ctx(quote(200)))
  const in2days = evaluateTrigger(evt({ due_date: '2026-08-20' }), ctx(quote(200)))
  const far4pct = evaluateTrigger(priceLevel({ trigger_id: 'T9', level: 192 }), ctx(quote(200)))
  assert.ok(urgencyRank(near1pct) < urgencyRank(in2days))
  assert.ok(urgencyRank(in2days) < urgencyRank(far4pct))
  assert.deepEqual(nearestDistance([in2days, near1pct]), { unit: 'pct', value: near1pct.gap_pct })
  assert.deepEqual(nearestDistance([far4pct, in2days]), { unit: 'days', value: 2 })
})

check('a met condition outranks everything, and an unmeasurable row reports no distance at all', () => {
  const met = evaluateTrigger(priceLevel({ level: 200 }), ctx(quote(200)))
  const other = evaluateTrigger(priceLevel({ trigger_id: 'T8', level: 150 }), ctx(quote(200)))
  assert.equal(met.state, 'condition_met')
  assert.equal(urgencyRank(met), 0)
  assert.deepEqual(nearestDistance([other, met]), { unit: 'pct', value: 0 })
  // no price at all: the refusal must not become a zero distance
  const blind = evaluateTrigger(priceLevel(), ctx(null, 'feed_unavailable'))
  assert.equal(blind.state, 'not_evaluable')
  assert.equal(nearestDistance([blind]), null)
  assert.equal(nearestDistance([]), null)
})

check('an overdue date still carries its distance, as a negative day count', () => {
  const e = evaluateTrigger(evt({ due_date: '2026-08-15' }), ctx(quote(200)))
  assert.equal(e.days_to, -3)
  assert.equal(e.due, true)
  assert.deepEqual(nearestDistance([e]), { unit: 'days', value: -3 })
})

console.log(`\nwatchlist-triggers.test.ts: ${passed} passed`)
