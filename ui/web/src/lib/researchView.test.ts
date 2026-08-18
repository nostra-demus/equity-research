// The research stage's view preference (lib/researchView.ts).
//
// Both functions replace a one-liner that silently swallowed a third value, so the cases that matter are
// the ones the old code got wrong: a stored 'watchlist' surviving a reload, and surviving a browser with
// no WebGL. Run: npx tsx src/lib/researchView.test.ts
import assert from 'node:assert/strict'
import { coerceViewForWebgl, effectiveResearchView, normalizeStoredView } from './researchView'

let passed = 0
function check(name: string, fn: () => void): void {
  try { fn(); passed++; console.log('  ok ', name) } catch (e) { console.error('  FAIL', name); console.error('   ', e); process.exitCode = 1 }
}

check('every known view round-trips through storage', () => {
  assert.equal(normalizeStoredView('constellation'), 'constellation')
  assert.equal(normalizeStoredView('globe'), 'globe')
  assert.equal(normalizeStoredView('watchlist'), 'watchlist', 'the bug this replaces: watchlist became globe on reload')
})

check('anything unrecognised falls back to the globe default', () => {
  for (const junk of [null, undefined, '', 'GLOBE', 'nonsense', 42, {}]) {
    assert.equal(normalizeStoredView(junk as unknown), 'globe', String(junk))
  }
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
  assert.equal(effectiveResearchView('globe', false), 'globe', 'the globe is shared by every constellation swarm')
})

console.log(`\nresearchView.test.ts: ${passed} passed`)
