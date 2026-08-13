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

const FP = `sha256:${'a'.repeat(64)}`
const SOURCE_FP = `sha256:${'b'.repeat(64)}`
const PLAN_SHA = `sha256:${'c'.repeat(64)}`

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
const commodityRerunCommand = await import('node:fs').then(({ readFileSync }) =>
  readFileSync('../../.claude/commands/commodity/rerun.md', 'utf8'))
assert.match(commodityRerunCommand,
  /\*\*2 tokens\*\*[^\n]*`<MODULE>` = first[^\n]*`<COMMODITY>` = second[^\n]*`<AGENT>` = \*\(none\)\*/,
  'the whole-module parser must explicitly bind the second token to COMMODITY')

// A selected decision is rebound to its exact immutable run folder. The launcher independently checks
// the decision fingerprint immediately before spawn; the command receives this root so it cannot drift
// to a newer decision while resolving "latest".
assert.equal(
  buildPrompt('research', 'rerun', 'AAPL', 'valuation', 'valuation-synthesis', undefined, { runRoot: 'analyses/AAPL_2026-08-13', decisionFingerprint: FP }),
  `/research:rerun valuation valuation-synthesis AAPL analyses/AAPL_2026-08-13 ${FP}`,
)
assert.equal(
  buildPrompt('research', 'doc-intake', 'AAPL', undefined, undefined, undefined, { runRoot: 'analyses/AAPL_2026-08-13', decisionFingerprint: FP }),
  `/research:intake AAPL analyses/AAPL_2026-08-13 ${FP}`,
)
assert.equal(
  buildPrompt('commodity', 'rerun', 'GOLD', 'market-structure', 'curve-reader', undefined, { runRoot: 'commodity/runs/GOLD', decisionFingerprint: FP }),
  `/commodity:rerun market-structure curve-reader GOLD commodity/runs/GOLD ${FP}`,
)
assert.equal(
  buildPrompt('commodity', 'doc-intake', 'GOLD', undefined, undefined, undefined, { runRoot: 'commodity/runs/GOLD', decisionFingerprint: FP }),
  `/commodity:intake GOLD commodity/runs/GOLD ${FP}`,
)

// A live intake-plan orb carries the exact content-bound receipt intent after the current-call binding.
// Ordinary graph reruns omit it, so the command never guesses a latest plan.
assert.equal(
  buildPrompt('research', 'rerun', 'AAPL', 'valuation', 'valuation-synthesis', undefined, {
    runRoot: 'analyses/AAPL_2026-08-13', decisionFingerprint: FP,
    intakeReceipt: {
      planPath: 'analyses/AAPL_2026-08-13/intake/2026-08-14_intake_plan.json',
      planSha256: PLAN_SHA,
      sourceDecisionFingerprint: SOURCE_FP,
    },
  }),
  `/research:rerun valuation valuation-synthesis AAPL analyses/AAPL_2026-08-13 ${FP} analyses/AAPL_2026-08-13/intake/2026-08-14_intake_plan.json ${PLAN_SHA} ${SOURCE_FP}`,
)

console.log('✓ build-prompt: constellation doc-intake never falls through to :full (cost bug pinned)')
