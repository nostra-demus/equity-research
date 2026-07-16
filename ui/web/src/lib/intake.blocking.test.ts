// blockingRunForIntake truth table — plain tsx-assert (run: npx tsx src/lib/intake.blocking.test.ts),
// the same standalone style as wire.test.ts / themes.momentum.test.ts (no node_modules needed — intake.ts
// is a pure lib importing only a type). Guards the fix in analyzeIntake (store.ts): when POST
// /api/intake/:ticker/analyze returns 409 subject_busy, the client must decide "poll for a plan" vs
// "stop and say a run is in flight" from SERVER-truth active runs, not the tab-local adopted set.
//
// Expected values are pinned to the SERVER contract, NOT to current client behaviour:
//   ui/server/src/server.ts (/api/intake/:ticker/analyze) — 409 subject_busy fires for ANY in-flight run
//   on the subject; only a `doc-intake` run's write IS the intake plan the poll loop is waiting for. So a
//   non-doc-intake run in flight on the SAME ticker means no plan is coming → the caller must stop.

import assert from 'node:assert'
import { blockingRunForIntake } from './intake'

type Run = { ticker: string; kind: string }
let passed = 0
const check = (name: string, fn: () => void) => { fn(); passed++ }

const T = 'ACME'

// --- the poll-vs-stop truth table (server contract above) ---
check('no runs in flight → not blocking (the racing intake just finished; poll for its plan)', () => {
  assert.equal(blockingRunForIntake([] as Run[], T), false)
})
check('only a doc-intake racing on the ticker → not blocking (its write IS the plan; poll)', () => {
  assert.equal(blockingRunForIntake([{ ticker: T, kind: 'doc-intake' }], T), false)
})
check('a module run in flight on the ticker → blocking (no plan is coming; stop)', () => {
  assert.equal(blockingRunForIntake([{ ticker: T, kind: 'module' }], T), true)
})
check('a full run in flight on the ticker → blocking (stop)', () => {
  assert.equal(blockingRunForIntake([{ ticker: T, kind: 'full' }], T), true)
})
check('a run on a DIFFERENT subject → not blocking (globalActive spans subjects; scope to ticker)', () => {
  assert.equal(blockingRunForIntake([{ ticker: 'OTHER', kind: 'full' }], T), false)
})
check('mixed doc-intake + module on the ticker → blocking (a real run is in flight → stop; the racing intake plan still lands on disk for the next refresh)', () => {
  assert.equal(blockingRunForIntake([{ ticker: T, kind: 'doc-intake' }, { ticker: T, kind: 'module' }], T), true)
})

// --- the actual bug this fix closes: STALE DATA SOURCE, not the predicate ---
// The old code fed the predicate the tab-local activeRuns (only runs THIS tab adopted a stream for). In the
// cross-tab / headless case that set is EMPTY while the server (globalActive) has the module run it 409'd on.
// Same real function, two different inputs — the input is the bug. Old path returned false (→ polled 3 min
// for a plan that never comes); the fix reads globalActive first, so the same function returns true (→ stops).
check('cross-tab regression: server-truth has a module run the tab has not adopted → old(local)=poll, new(server)=stop', () => {
  const serverTruth: Run[] = [{ ticker: T, kind: 'module' }] // what the server saw and 409'd on
  const tabLocalAdopted: Run[] = []                          // what the OLD code read (stale — not adopted)
  assert.equal(blockingRunForIntake(tabLocalAdopted, T), false) // reproduces the buggy cell (would poll)
  assert.equal(blockingRunForIntake(serverTruth, T), true)      // fixed behaviour (stops, per server contract)
})

console.log(`intake.blocking.test: ${passed} checks passed`)
