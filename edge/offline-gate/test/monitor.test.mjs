// node:test — pure uptime-monitor logic. Zero deps, zero network. Runs in CI via `node --test`.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { STATE_VERSION, initialState, interpretProbe, decide } from '../src/monitor.mjs'

const CFG = { threshold: 3, remindMs: 0 }
const T0 = 1_700_000_000_000 // fixed epoch so tests are deterministic

// helper: run a sequence of probes, collecting every alert kind emitted, threading state.
function run(probes, cfg = CFG, startAt = T0, stepMs = 60_000) {
  let s = initialState(startAt)
  const kinds = []
  probes.forEach((p, i) => {
    const now = startAt + (i + 1) * stepMs
    const { next, alerts } = decide(s, p, now, cfg)
    s = next
    for (const a of alerts) kinds.push(a.kind)
  })
  return { state: s, kinds }
}

test('interpretProbe classifies each signal', () => {
  assert.equal(interpretProbe(200, null, null), 'up')
  assert.equal(interpretProbe(204, null, null), 'up')
  assert.equal(interpretProbe(503, 'offline', null), 'down') // offline-gate marker wins
  assert.equal(interpretProbe(530, null, null), 'down') // tunnel down
  assert.equal(interpretProbe(521, null, null), 'down')
  assert.equal(interpretProbe(502, null, null), 'down')
  assert.equal(interpretProbe(504, null, null), 'down')
  assert.equal(interpretProbe(null, null, null), 'error') // fetch threw
  assert.equal(interpretProbe(503, null, null), 'error') // bare 503, no marker → inconclusive
  assert.equal(interpretProbe(404, null, null), 'error')
  assert.equal(interpretProbe(302, null, 'https://black-night.cloudflareaccess.com/login'), 'auth')
  assert.equal(interpretProbe(302, null, 'https://example.com/elsewhere'), 'error')
  assert.equal(interpretProbe(401, null, null), 'auth') // Access: no service token → NOT a false outage
  assert.equal(interpretProbe(403, null, null), 'auth') // Access: rejected / expired service token
})

test('a persistent Access rejection (401/403) never fires a false DOWN', () => {
  const probes = [401, 403, 401, 403, 401].map((s) => interpretProbe(s, null, null))
  const { state, kinds } = run(probes)
  assert.deepEqual(kinds, ['auth']) // warned once, never paged
  assert.notEqual(state.status, 'down')
  assert.equal(state.consecutiveDown, 0)
})

test('a healthy stream never alerts and reports up', () => {
  const { state, kinds } = run(['up', 'up', 'up', 'up'])
  assert.deepEqual(kinds, [])
  assert.equal(state.status, 'up')
  assert.equal(state.consecutiveDown, 0)
})

test('a short blip below threshold never alerts (redeploy grace)', () => {
  // 2 failures then recovery — threshold is 3, so no DOWN, no RECOVERY.
  const { state, kinds } = run(['up', 'down', 'down', 'up', 'up'])
  assert.deepEqual(kinds, [])
  assert.equal(state.status, 'up')
})

test('a real outage alerts exactly once at the threshold', () => {
  const { state, kinds } = run(['up', 'down', 'down', 'down', 'down', 'down'])
  assert.deepEqual(kinds, ['down']) // one alert only, on the 3rd consecutive failure
  assert.equal(state.status, 'down')
  assert.equal(state.alertedDown, true)
  assert.equal(state.consecutiveDown, 5)
})

test('recovery fires once after an alerted outage', () => {
  const { state, kinds } = run(['down', 'down', 'down', 'down', 'up'])
  assert.deepEqual(kinds, ['down', 'recovery'])
  assert.equal(state.status, 'up')
  assert.equal(state.alertedDown, false)
  assert.equal(state.downSince, null)
})

test('recovery does NOT fire if the outage never crossed the threshold', () => {
  const { kinds } = run(['down', 'down', 'up']) // 2 fails, never alerted → no recovery
  assert.deepEqual(kinds, [])
})

test('errors count toward the streak like downs', () => {
  const { kinds, state } = run(['error', 'error', 'error'])
  assert.deepEqual(kinds, ['down'])
  assert.equal(state.status, 'down')
})

test('reminder cadence repeats while down when enabled', () => {
  // threshold 3, remind every 2 min. Steps are 60s. Alert on step 3; reminders when >=2min since last.
  const cfg = { threshold: 3, remindMs: 2 * 60_000 }
  const { kinds } = run(['down', 'down', 'down', 'down', 'down', 'down', 'down'], cfg)
  // step3: down. step5: 2min later → reminder. step7: 2min later → reminder.
  assert.deepEqual(kinds, ['down', 'reminder', 'reminder'])
})

test('reminders are OFF by default (remindMs 0)', () => {
  const { kinds } = run(['down', 'down', 'down', 'down', 'down', 'down', 'down'])
  assert.deepEqual(kinds, ['down'])
})

test("auth holds status and warns once — never fabricates an outage", () => {
  const { state, kinds } = run(['auth', 'auth', 'auth', 'auth'])
  assert.deepEqual(kinds, ['auth']) // warned exactly once
  assert.equal(state.status, 'unknown') // never flipped to down
  assert.equal(state.consecutiveDown, 0) // auth does not count as a failure
})

test('a good probe clears the auth warning so it can warn again later', () => {
  let s = initialState(T0)
  ;({ next: s } = decide(s, 'auth', T0 + 60_000, CFG))
  assert.equal(s.authWarned, true)
  ;({ next: s } = decide(s, 'up', T0 + 120_000, CFG))
  assert.equal(s.authWarned, false)
  const { alerts } = decide(s, 'auth', T0 + 180_000, CFG)
  assert.deepEqual(alerts.map((a) => a.kind), ['auth']) // warns again after recovery
})

test('down alert carries the first-failure timestamp (downSince), not the threshold time', () => {
  let s = initialState(T0)
  const firstFail = T0 + 60_000
  ;({ next: s } = decide(s, 'down', firstFail, CFG))
  ;({ next: s } = decide(s, 'down', T0 + 120_000, CFG))
  const { alerts } = decide(s, 'down', T0 + 180_000, CFG)
  assert.equal(alerts.length, 1)
  assert.equal(alerts[0].downSince, firstFail)
})

test('state carries the schema version', () => {
  const { state } = run(['up'])
  assert.equal(state.v, STATE_VERSION)
})

test('decide never mutates the prior state', () => {
  const prev = initialState(T0)
  const snapshot = JSON.stringify(prev)
  decide(prev, 'down', T0 + 60_000, CFG)
  assert.equal(JSON.stringify(prev), snapshot)
})
