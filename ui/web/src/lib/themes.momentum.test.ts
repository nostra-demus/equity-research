// Theme momentum (lib/themes.ts momentumOf): the fix for "everything shows quiet". A theme's velocity
// (is news still landing?) is read from time-since-last-item + a recent-burst check — NOT the always-0
// fresh_flow 1h window. Fixtures mirror the real live themes the bug was found on. No DOM, no network.
// Run: npx tsx src/lib/themes.momentum.test.ts
import assert from 'node:assert/strict'
import { momentumOf, recentFlow } from './themes'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const NOW = Date.parse('2026-06-13T21:00:00Z')
const ago = (h: number) => new Date(NOW - h * 3_600_000).toISOString()

// the exact case the user flagged: US-Iran, hot, last news ~1.4h ago — must NOT be "quiet"
check('US-Iran-style (last item 1.4h ago) → active, never quiet', () => {
  const m = momentumOf({ flow_series: [0, 1, 1, 0, 0, 2, 0, 6, 15, 13, 1, 0], last_flow: ago(1.4) }, NOW)
  assert.equal(m, 'active')
})

check('genuinely silent for 7.8h (Continental-style) → quiet', () => {
  assert.equal(momentumOf({ flow_series: [0, 0, 0, 10, 3, 0, 0, 0, 0, 0, 0, 0], last_flow: ago(7.8) }, NOW), 'quiet')
})

check('last item 3.5h ago (SpaceX-style) → cooling', () => {
  assert.equal(momentumOf({ flow_series: [0, 0, 0, 0, 0, 4, 1, 4, 4, 0, 0, 0], last_flow: ago(3.5) }, NOW), 'cooling')
})

check('a real burst right now (3+ in the last hour) → surging', () => {
  assert.equal(momentumOf({ flow_series: [0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 4], last_flow: ago(0.2) }, NOW), 'surging')
})

check('6+ across the last two hours → surging', () => {
  assert.equal(momentumOf({ flow_series: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 3], last_flow: ago(0.5) }, NOW), 'surging')
})

check('the active/cooling/quiet boundaries hold (2.5h, 5h)', () => {
  assert.equal(momentumOf({ flow_series: [0, 0, 1], last_flow: ago(2.4) }, NOW), 'active')
  assert.equal(momentumOf({ flow_series: [0, 1, 0], last_flow: ago(2.6) }, NOW), 'cooling')
  assert.equal(momentumOf({ flow_series: [0, 1, 0], last_flow: ago(4.9) }, NOW), 'cooling')
  assert.equal(momentumOf({ flow_series: [1, 0, 0], last_flow: ago(5.1) }, NOW), 'quiet')
})

check('a recent burst beats the since-clock (surging even if since rounds high)', () => {
  // 4 in the last hour but last_flow stamped 3h ago would be inconsistent data; the burst wins
  assert.equal(momentumOf({ flow_series: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 4], last_flow: ago(3) }, NOW), 'surging')
})

check('empty / malformed never throws → quiet', () => {
  assert.equal(momentumOf({ flow_series: [], last_flow: '' as any }, NOW), 'quiet')
  assert.equal(momentumOf({ flow_series: undefined as any, last_flow: undefined as any }, NOW), 'quiet')
  assert.equal(momentumOf({ flow_series: [0, 0, 0], last_flow: 'not-a-date' }, NOW), 'quiet')
})

check('future last_flow (clock skew) clamps to now → active, never negative', () => {
  assert.equal(momentumOf({ flow_series: [0, 0, 1], last_flow: ago(-2) }, NOW), 'active')
})

check('recentFlow sums the newest buckets', () => {
  assert.equal(recentFlow([1, 2, 3, 4, 5], 2), 9) // last two
  assert.equal(recentFlow([1, 2, 3], 10), 6) // more than length → all
  assert.equal(recentFlow(undefined, 4), 0)
})

console.log(`\n${passed} checks passed`)
