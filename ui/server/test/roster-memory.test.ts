import assert from 'node:assert/strict'
import { buildSwarmGraph } from '../src/roster'

const graph = buildSwarmGraph('research', true)
const agents = graph.modules.flatMap((module) => Object.values(module.layers).flat())

assert.ok(agents.length > 0, 'research roster must contain analytical agents')
assert.ok(agents.every((agent) => agent.memoryProfile?.version === 1),
  'every analytical agent must self-declare a valid memory profile')
assert.ok(agents.filter((agent) => agent.isSynthesis)
  .every((agent) => agent.memoryProfile?.maxContextTokens === 4000),
  'module synthesizers must use the 4,000-token budget')
assert.ok(agents.filter((agent) => !agent.isSynthesis)
  .every((agent) => agent.memoryProfile?.maxContextTokens === 3000),
  'specialists must use the 3,000-token budget')
assert.equal(graph.masterSynthesizer.memoryProfile?.maxContextTokens, 6000,
  'the master synthesizer must use the 6,000-token budget')

console.log('roster memory profile tests passed')
