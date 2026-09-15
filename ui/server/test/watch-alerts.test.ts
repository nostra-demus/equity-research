// When a condition becomes a message (src/watch/alerts.ts): once, and again only after a real move away.
// The failures this guards against are the two a naive "is it true now?" check makes — a message on every
// check while a price hovers at its line, and a flood of "news" about things that were already true on the
// day the watcher was switched on.
// Run: npx tsx test/watch-alerts.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { stepAlerts, type NameAlertState } from '../src/watch/alerts'
import type { Condition, ConditionType } from '../src/watch/evaluate'

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

const cond = (id: string, type: ConditionType, line: number | null = null): Condition =>
  ({ id, type, urgent: false, title: id, detail: '', quote: null, source: null, line })
const at = (minute: number) => new Date(Date.UTC(2026, 8, 15, 14, minute))
const step = (prev: NameAlertState | undefined, conditions: Condition[], price: number | null, minute: number, run = 'analyses/A_2026-07-10|read') =>
  stepAlerts(prev, { listing_key: 'A|USD', run_root: run, conditions, price, now: at(minute) })
const BUY = () => cond('buy_price_reached:p1', 'buy_price_reached', 200)

check('first sight sets the starting point and tells nothing', () => {
  const s = step(undefined, [BUY()], 199, 0)
  assert.equal(s.baseline, true)
  assert.equal(s.events.length, 0)
  assert.ok(s.state.fired[BUY().id])
})

check('a condition that stays true is told once', () => {
  let s = step(undefined, [], 230, 0)
  s = step(s.state, [BUY()], 199, 5)
  assert.equal(s.events.length, 1)
  s = step(s.state, [BUY()], 198, 10)
  assert.equal(s.events.length, 0)
})

check('hovering around the line never re-tells; a clear 3% move away re-arms it', () => {
  let s = step(undefined, [], 230, 0)
  s = step(s.state, [BUY()], 199, 5)
  assert.equal(s.events.length, 1)
  s = step(s.state, [], 203, 10) // back above, but under 200 × 1.03 = 206
  assert.equal(s.events.length, 0)
  assert.ok(s.state.fired[BUY().id], 'still told')
  s = step(s.state, [BUY()], 199.5, 15)
  assert.equal(s.events.length, 0, 'a wobble back under is not news')
  s = step(s.state, [], 207, 20) // a clear move away
  assert.ok(!s.state.fired[BUY().id], 're-armed')
  s = step(s.state, [BUY()], 198, 25)
  assert.equal(s.events.length, 1, 'crossing again after a real move is news')
})

check('with no price this check, a told price line stays told', () => {
  let s = step(undefined, [BUY()], 199, 0)
  s = step(s.state, [], null, 5)
  assert.ok(s.state.fired[BUY().id])
})

check('"No price" is shown, never sent', () => {
  let s = step(undefined, [], 230, 0)
  s = step(s.state, [cond('cant_check:price', 'cant_check')], null, 5)
  assert.equal(s.events.length, 0)
})

check('a date condition is told once, and again only if it comes back', () => {
  let s = step(undefined, [], 230, 0)
  const soon = cond('coming_up:d1', 'coming_up')
  s = step(s.state, [soon], 230, 5)
  assert.equal(s.events.length, 1)
  s = step(s.state, [soon], 230, 10)
  assert.equal(s.events.length, 0)
})

check('new research starts over: a new starting point, flagged as changed', () => {
  let s = step(undefined, [], 230, 0)
  s = step(s.state, [BUY()], 199, 5)
  s = step(s.state, [BUY(), cond('coming_up:d2', 'coming_up')], 199, 10, 'analyses/A_2026-09-14|read')
  assert.equal(s.baseline, true)
  assert.equal(s.researchChanged, true)
  assert.equal(s.events.length, 0)
})

check('a line reached by a RISE re-arms after a clear move back BELOW it', () => {
  // Your own "at or above USD 400": a fall re-arms it, the way a rise re-arms a line reached by a fall.
  const UP = (): Condition => ({ ...cond('your_level_reached:T1', 'your_level_reached', 400), rises: true })
  let s = step(undefined, [], 380, 0)
  s = step(s.state, [UP()], 401, 5)
  assert.equal(s.events.length, 1)
  s = step(s.state, [], 395, 10) // back under, but above 400 × 0.97 = 388
  assert.ok(s.state.fired[UP().id], 'a wobble under it is not a re-arm')
  s = step(s.state, [], 350, 15)
  assert.ok(!s.state.fired[UP().id], 're-armed by a real fall')
  s = step(s.state, [UP()], 405, 20)
  assert.equal(s.events.length, 1, 'rising past it again is news')
})

console.log(`\n${passed} passed${process.exitCode ? ' — FAILURES above' : ''}`)
