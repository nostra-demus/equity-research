import assert from 'node:assert/strict'
import path from 'node:path'
import { REPO_ROOT } from '../src/config'
import { buildSwarmGraph, downstreamCascade } from '../src/roster'
import { specialistDependencies } from '../src/completion'
import { loadCanonicalAgent, loadCanonicalCommand } from '../src/providers/prompt-loader'

// Exercise the actual filesystem discovery and shared launch contracts. Adding this specialist
// must need no roster registration, provider-specific prompt, or hand-wired rerun route.
const graph = buildSwarmGraph('research', true)
const valuation = graph.modules.find((module) => module.name === 'valuation')!
assert.ok(valuation, 'Valuation must be discoverable')
const agents = Object.values(valuation.layers).flat()
const rerating = agents.find((agent) => agent.name === 'strategic-rerating')!
assert.ok(rerating, 'the cockpit must discover the Strategic Rerating orb')
assert.equal(rerating.key, 'valuation/08_strategic-rerating')
assert.equal(rerating.soloRunnable, false, 'an unanchored rerating assessment must not launch solo')
assert.equal(rerating.memoryProfile?.task, 'valuation.strategic-rerating')
assert.equal(rerating.memoryProfile?.maxContextTokens, 3000)

const fairValue = agents.find((agent) => agent.name === 'scenario-and-fair-value')!
const synthesis = agents.find((agent) => agent.isSynthesis)!
assert.ok(fairValue.layer < rerating.layer && rerating.layer < synthesis.layer,
  'fair-value levels must finish before the pivot read, and synthesis must consume both')
assert.ok(rerating.requiredUpstream.includes('valuation/07_scenario-and-fair-value.md'))
assert.ok(rerating.requiredUpstream.includes('valuation/01_price-and-capital-structure.md'))
for (const relative of rerating.requiredUpstream) {
  const upstream = agents.find((agent) => `${agent.module}/${agent.nn}_${agent.slug}.md` === relative)
  assert.ok(upstream, `required input must resolve to a live orb: ${relative}`)
  assert.ok(upstream.layer < rerating.layer, `${relative} must run in an earlier layer`)
}

const cascade = downstreamCascade('valuation', 'strategic-rerating')
assert.equal(cascade[0].outputRel, 'valuation/08_strategic-rerating.md')
assert.ok(cascade.some((node) => node.key === synthesis.key && node.kind === 'module-synthesis'))
assert.equal(cascade.at(-1)?.key, 'master/synthesizer')
assert.ok(!cascade.some((node) => node.key === fairValue.key),
  'updating the assessment must preserve the upstream fair-value owner')

const canonical = loadCanonicalAgent(rerating.name)
assert.equal(canonical.sourcePath,
  path.join(REPO_ROOT, '.claude/agents/valuation/08_strategic-rerating.md'))
assert.ok(canonical.tools.includes('Write'), 'the specialist must persist its report in either provider')
const command = loadCanonicalCommand('/research:agent valuation strategic-rerating AMZN')
assert.equal(command.arguments, 'valuation strategic-rerating AMZN')
assert.equal(command.command, 'agent')

// The reuse-freshness planner (completion.ts specialistDependencies) reads ONLY the single line
// containing `UPSTREAM_INPUTS`, not the detailed sub-lines. If 08 lists its prerequisites only on
// sub-lines, the planner parses zero dependencies and silently reuses a stale 08 when an upstream
// input is re-run into an existing run folder — presenting a stale rerating read against fresh
// fair-value inputs (§26 self-describing deps must be engine-readable; §3/§11/§17 no stale estimate
// as current). The six prerequisites below are 08's own declared REQUIRED inputs.
const reuseDeps = specialistDependencies(valuation, 'research').get('08_strategic-rerating.md')
assert.ok(reuseDeps,
  'completion.ts reuse-freshness planner must see 08 dependencies on its UPSTREAM_INPUTS line (else a stale orb is silently reused)')
for (const need of [
  '01_price-and-capital-structure.md',
  '02_multiples-own-history.md',
  '03_relative-valuation-peers.md',
  '05_reverse-dcf.md',
  '06_sum-of-the-parts.md',
  '07_scenario-and-fair-value.md',
]) {
  assert.ok(reuseDeps!.has(need),
    `08 must name ${need} on its UPSTREAM_INPUTS line so a change to it invalidates a saved rerating read`)
}

console.log('strategic rerating discovery, prerequisites, layering, provider contract and rerun cascade passed')
