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
import { buildPrompt, childEnv } from '../src/launcher'

const FP = `sha256:${'a'.repeat(64)}`
const SOURCE_FP = `sha256:${'b'.repeat(64)}`
const PLAN_SHA = `sha256:${'c'.repeat(64)}`

// research already routed doc-intake correctly — baseline, must stay.
assert.equal(buildPrompt('research', 'doc-intake', 'AAPL'), '/research:intake AAPL')
assert.equal(buildPrompt('research', 'full', 'AAPL'), '/research:full AAPL')
assert.equal(
  buildPrompt('research', 'full', 'AAPL', undefined, undefined, undefined, { runRoot: 'analyses/AAPL_2026-08-13' }),
  '/research:full AAPL analyses/AAPL_2026-08-13',
  'automatic crash recovery carries the exact historical target into the full finalizer',
)
assert.equal(buildPrompt('research', 'review', 'AAPL', undefined, undefined, '30d'), '/research:review-decisions AAPL 30d')
assert.equal(
  buildPrompt('research', 'review', 'AAPL', undefined, undefined, '30d', { runRoot: 'analyses/AAPL_2026-08-13' }),
  '/research:review-decisions analyses/AAPL_2026-08-13 30d',
  'a scheduled review must carry the exact dated call, not resolve the ticker again inside the command',
)

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
const researchFullCommand = await import('node:fs').then(({ readFileSync }) =>
  readFileSync('../../.claude/commands/research/full.md', 'utf8'))
const researchRerunCommand = await import('node:fs').then(({ readFileSync }) =>
  readFileSync('../../.claude/commands/research/rerun.md', 'utf8'))
const researchSynthesizer = await import('node:fs').then(({ readFileSync }) =>
  readFileSync('../../.claude/agents/synthesizer.md', 'utf8'))
assert.match(researchFullCommand, /one required `<TICKER>` token[\s\S]*one optional\s*`<EXACT_RECOVERY_RUN_ROOT>` token/)
assert.match(researchFullCommand, /^argument-hint: TICKER$/m,
  'the internal exact-root form must not be advertised as an interactive command')
assert.match(researchFullCommand, /ENGINE_AUTOMATIC_RECOVERY_ROOT/)
assert.match(researchFullCommand,
  /ENGINE_AUTOMATIC_RECOVERY_PLAN_SHA256[\s\S]*exact staged plan binding changed/,
  'historical-root mode must prove the server-provided exact plan binding before any write')
assert.match(researchFullCommand, /terminal_pair_recovery[\s\S]*Do not\s*rerun modules or the master synthesizer/)
assert.match(researchFullCommand,
  /exact preliminary `not_assessable`[\s\S]*idea_market_evidence\.json[\s\S]*--write-idea-evidence[\s\S]*immutable[\s\S]*validation to succeed/,
  'projection-sealed recovery must survive a crash after the canonical market snapshot rename but before wrapper replacement')
assert.doesNotMatch(researchFullCommand, /\$\{ARGUMENTS\}/,
  'an exact two-token recovery prompt must never interpolate the whole argument string as a ticker')
assert.match(researchFullCommand,
  /master-arm <RUN_ROOT>[\s\S]*CANONICAL_RUN_ROOT[\s\S]*MASTER_OUTPUT_DIR[\s\S]*master-recover <RUN_ROOT>/,
  'ordinary full master synthesis must write only through one durable attempt-owned staging directory')
assert.match(researchFullCommand,
  /projection-arm[\s\S]*PROJECTION_OUTPUT_PATH[\s\S]*projection-recover/,
  'the final projection Task must stage one exact attempt-owned assessment before canonical promotion')
assert.doesNotMatch(researchFullCommand, /master-recover <RUN_ROOT> --replacement-requested/,
  'full crash recovery may never reinterpret an already-paid terminal pair as a requested replacement')
assert.match(researchRerunCommand,
  /master-recover <RUN_ROOT> --replacement-requested[\s\S]*master-arm <RUN_ROOT>[\s\S]*--allow-existing/,
  'only an explicit rerun may request compare-and-swap replacement of an unsealed canonical trio')
assert.match(researchRerunCommand,
  /`unarmed`[\s\S]*master-arm <RUN_ROOT>[\s\S]*\*\*without\*\* `--allow-existing`/,
  'a fresh per-module chain must arm an absent canonical trio instead of stopping before master synthesis')
assert.match(researchRerunCommand, /CANONICAL_RUN_ROOT[\s\S]*MASTER_OUTPUT_DIR/,
  'rerun master Tasks must keep canonical identity separate from physical staging')
assert.match(researchSynthesizer, /CANONICAL_RUN_ROOT[\s\S]*MASTER_OUTPUT_DIR[\s\S]*PROJECTION_OUTPUT_PATH/,
  'the synthesizer contract must require explicit canonical and attempt-owned output paths')
assert.doesNotMatch(researchSynthesizer, /Derive `<RUN_ROOT>` by removing `\/final_thesis\.md`/,
  'a staging directory must never be allowed to define the embedded run identity')
process.env.ENGINE_AUTOMATIC_RECOVERY_ROOT = 'analyses/SPOOF_2026-08-13'
try {
  assert.equal(childEnv().ENGINE_AUTOMATIC_RECOVERY_ROOT, undefined,
    'ordinary CLI children never inherit a shell-spoofed exact recovery authority')
} finally { delete process.env.ENGINE_AUTOMATIC_RECOVERY_ROOT }
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
