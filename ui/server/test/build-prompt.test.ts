// buildPrompt routing — pins the fix for the latent full-run COST bug.
//
// A NON-research (constellation) swarm's `doc-intake` is the CHEAP advisory plan-writer (a clone of
// 'review'). It must dispatch the swarm's own `:intake` command. Before the fix, the generic-swarm block
// handled module/agent/rerun and then fell through to `/<ns>:full` for everything else — so a commodity
// `doc-intake` (the auto-analyze-on-landing signal) would launch a full PAID run: the loop's own success
// signal triggering the exact expensive run it exists to avoid. This test guarantees it never regresses.
// (Also carried by PR #239; folded here because the commodity re-score tail depends on it.)
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { buildPrompt } from '../src/launcher'

// research already routed doc-intake correctly — baseline, must stay.
assert.equal(buildPrompt('research', 'doc-intake', 'AAPL'), '/research:intake AAPL')
assert.equal(buildPrompt('research', 'full', 'AAPL'), '/research:full AAPL')

// THE FIX: a constellation swarm's doc-intake routes to the cheap `:intake`, NEVER to `:full`.
// Cover both a real swarm id and an unregistered one (which falls back to the id as the namespace),
// so the guarantee holds regardless of registry state.
for (const sw of ['commodity', 'zztest-swarm']) {
  const p = buildPrompt(sw, 'doc-intake', 'WHEAT')
  assert.match(p, /:intake WHEAT$/, `${sw} doc-intake must route to :intake, got: ${p}`)
  assert.doesNotMatch(p, /:full/, `${sw} doc-intake must NEVER route to :full (a paid run), got: ${p}`)
}

// The other generic-swarm kinds are unchanged.
assert.match(buildPrompt('commodity', 'full', 'WHEAT'), /:full WHEAT$/)
assert.match(buildPrompt('commodity', 'module', 'WHEAT', 'market-structure'), /:market-structure WHEAT$/)
assert.match(buildPrompt('commodity', 'rerun', 'WHEAT', 'market-structure'), /:rerun market-structure WHEAT$/)

console.log('✓ build-prompt: constellation doc-intake never falls through to :full (cost bug pinned)')
