// The research stage's view preference (lib/researchView.ts).
//
// These functions replace a one-liner that silently swallowed cross-company values, so the cases that
// matter are the ones the old code got wrong: destinations never becoming the next landing page, and
// non-WebGL views surviving a browser without WebGL. Run: npx tsx src/lib/researchView.test.ts
import assert from 'node:assert/strict'
import { coerceViewForWebgl, effectiveResearchView, isPersistableView, normalizeStoredView } from './researchView'

let passed = 0
function check(name: string, fn: () => void): void {
  try { fn(); passed++; console.log('  ok ', name) } catch (e) { console.error('  FAIL', name); console.error('   ', e); process.exitCode = 1 }
}

check('the two canvas stage views round-trip through storage', () => {
  assert.equal(normalizeStoredView('constellation'), 'constellation')
  assert.equal(normalizeStoredView('globe'), 'globe')
})

check('the watchlist is never restored as a landing view', () => {
  // it is a destination, not a home — restoring it made a list the app's home screen for anyone who
  // opened it once, instead of the company they were actually working on
  assert.equal(normalizeStoredView('watchlist'), 'constellation')
  assert.equal(isPersistableView('watchlist'), false, 'so it is never written in the first place')
  assert.equal(normalizeStoredView('tasks'), 'constellation')
  assert.equal(isPersistableView('tasks'), false, 'the shared task board is a destination too')
  assert.equal(isPersistableView('constellation'), true)
  assert.equal(isPersistableView('globe'), true)
})

check('nothing stored, or junk, opens on the flat constellation', () => {
  // the globe is the same scene wrapped onto a sphere and the costlier one to paint; it is remembered
  // once chosen, but it is not what a first visit lands on
  for (const junk of [null, undefined, '', 'GLOBE', 'nonsense', 42, {}]) {
    assert.equal(normalizeStoredView(junk as unknown), 'constellation', String(junk))
  }
  assert.equal(normalizeStoredView('globe'), 'globe', 'an explicit choice is still honoured')
})

check('no WebGL coerces the globe away — and ONLY the globe', () => {
  assert.equal(coerceViewForWebgl('globe', false), 'constellation')
  assert.equal(coerceViewForWebgl('watchlist', false), 'watchlist', 'the bug this replaces: the watchlist was stolen on every boot')
  assert.equal(coerceViewForWebgl('constellation', false), 'constellation')
})

check('with WebGL present nothing is coerced', () => {
  for (const v of ['globe', 'constellation', 'watchlist'] as const) assert.equal(coerceViewForWebgl(v, true), v)
})

check('a non-research swarm falls back rather than rendering an empty stage', () => {
  assert.equal(effectiveResearchView('watchlist', false), 'constellation')
  assert.equal(effectiveResearchView('watchlist', true), 'watchlist')
  assert.equal(effectiveResearchView('tasks', false), 'constellation')
  assert.equal(effectiveResearchView('tasks', true), 'tasks')
  assert.equal(effectiveResearchView('globe', false), 'globe', 'the globe is shared by every constellation swarm')
})

console.log(`\nresearchView.test.ts: ${passed} passed`)
