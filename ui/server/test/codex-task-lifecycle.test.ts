// Codex native-child lifecycle normalization. The public exec stream can omit item.started, so a
// completed spawn row must still attribute the canonical orb; filesystem writes remain completion truth.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import { createRun, type RunState } from '../src/registry'
import { handleStreamLine } from '../src/stream-parser'
import type { SseEvent } from '../src/types'

const key = 'business-model/09_moat'
const run: RunState = createRun({
  kind: 'module',
  ticker: 'ZZCODEX',
  module: 'business-model',
  provider: 'codex',
  model: 'gpt-5.6-sol',
  reasoningLevel: 'max',
  profileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
  executionProfile: {
    key: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
    parentModel: 'gpt-5.6-sol',
    parentReasoning: 'max',
    specialistModel: 'gpt-5.6-terra',
    specialistReasoning: 'xhigh',
  },
  prompt: '',
  user: 'test',
  userVia: 'local',
  runRoot: null,
  willCommitToMain: true,
  writeTargetsAbs: [],
  coveredModules: ['business-model'],
  readDepsAbs: [],
  expected: new Map([[
    key,
    { key, module: 'business-model', name: 'moat', layer: 3, outputRel: 'business-model/09_moat.md' },
  ]]),
})
run.status = 'running'
const events: SseEvent[] = []
run.subscribers.add({ id: 'codex-task-lifecycle', send: (event) => events.push(event) })

// Current Codex versions may publish only a prompt-free native child activity row for the spawn. The
// compatibility contract's reversible task_name must still bind the child to its exact canonical orb.
handleStreamLine(run, JSON.stringify({
  type: 'item.completed',
  item: {
    id: 'native-moat',
    type: 'sub_agent_activity',
    kind: 'started',
    agent_thread_id: 'child-moat-native',
    agent_path: '/root/nostra_moat',
  },
}))
assert.equal(run.agents.get(key)?.status, 'running')
assert.equal(run.nativeThreadToAgent.get('child-moat-native'), key)
assert.equal(run.nativeAgentStates.get('child-moat-native'), 'running')
assert.equal(events.filter((event) => event.type === 'agent-started').length, 1)

// Regression: Codex CLI versions affected by the public-stream lifecycle gap can expose only the
// completed spawn item. That row must still move the orb out of queued and bind its native thread.
handleStreamLine(run, JSON.stringify({
  type: 'item.completed',
  item: {
    id: 'spawn-moat',
    type: 'collab_tool_call',
    tool: 'spawn_agent',
    sender_thread_id: 'parent',
    receiver_thread_ids: ['child-moat'],
    prompt: 'NOSTRA_SUBAGENT_TYPE: moat\nCanonical path: .claude/agents/business-model/09_moat.md',
    agents_states: { 'child-moat': { status: 'running', message: null } },
    status: 'completed',
  },
}))

assert.equal(run.agents.get(key)?.status, 'running')
assert.equal(run.toolUseToAgent.get('spawn-moat'), key)
assert.equal(run.nativeThreadToAgent.get('child-moat'), key)
assert.equal(run.nativeAgentStates.get('child-moat'), 'running')
assert.equal(events.filter((event) => event.type === 'agent-started').length, 1)

// Repeated updates are idempotent: they do not emit duplicate agent-started rows. A native terminal
// error is surfaced as failed, but a successful native completion would still wait for the artifact watcher.
handleStreamLine(run, JSON.stringify({
  type: 'item.updated',
  item: {
    id: 'wait-moat-complete',
    type: 'collab_tool_call',
    tool: 'wait',
    sender_thread_id: 'parent',
    receiver_thread_ids: ['child-moat'],
    prompt: null,
    agents_states: { 'child-moat': { status: 'completed', message: 'done' } },
    status: 'in_progress',
  },
}))
assert.equal(run.agents.get(key)?.status, 'running', 'native completion alone cannot replace artifact truth')

handleStreamLine(run, JSON.stringify({
  type: 'item.updated',
  item: {
    id: 'wait-moat',
    type: 'collab_tool_call',
    tool: 'wait',
    sender_thread_id: 'parent',
    receiver_thread_ids: ['child-moat'],
    prompt: null,
    agents_states: { 'child-moat': { status: 'errored', message: 'child failed' } },
    status: 'in_progress',
  },
}))

assert.equal(run.agents.get(key)?.status, 'failed')
assert.equal(run.nativeAgentStates.get('child-moat'), 'errored')
assert.equal(events.filter((event) => event.type === 'agent-started').length, 1)
assert.equal(events.filter((event) => event.type === 'agent-failed').length, 1)

// A fresh Codex process inside the same logical run adds its process-local metrics to the retained base.
run.automaticContinuationMetricBase = { costUsd: 0, numTurns: 7, durationMs: 1_000 }
handleStreamLine(run, JSON.stringify({ type: 'turn.completed', usage: { input_tokens: 10 } }))
assert.equal(run.numTurns, 8)

const malformedMetricRun = createRun({
  kind: 'module', ticker: 'ZZMETRIC', module: 'business-model', provider: 'claude',
  model: 'sonnet', reasoningLevel: 'default', profileKey: 'claude:sonnet:default',
  executionProfile: { key: 'claude:sonnet:default', parentModel: 'sonnet' },
  prompt: '', user: 'test', userVia: 'local', runRoot: null, willCommitToMain: true,
  writeTargetsAbs: [], coveredModules: ['business-model'], readDepsAbs: [], expected: new Map(),
})
malformedMetricRun.status = 'running'
malformedMetricRun.automaticContinuationMetricBase = { costUsd: 1e308, numTurns: 7, durationMs: 1_000 }
handleStreamLine(malformedMetricRun,
  '{"type":"result","subtype":"success","is_error":false,"num_turns":1e309,"total_cost_usd":1e308,"duration_ms":1e309}')
assert.equal(malformedMetricRun.numTurns, undefined, 'non-finite provider metrics cannot corrupt the logical run')
assert.equal(malformedMetricRun.costUsd, undefined, 'an overflowing accumulated metric is rejected')
assert.equal(malformedMetricRun.durationMs, undefined)

// Replayed terminal rows are idempotent. A deliberate retry is a new spawn tool-use id: it reopens
// the canonical orb, retires the failed child's binding, and cannot be poisoned by a late old update.
handleStreamLine(run, JSON.stringify({
  type: 'item.updated',
  item: {
    id: 'wait-moat-replayed',
    type: 'collab_tool_call',
    tool: 'wait',
    sender_thread_id: 'parent',
    receiver_thread_ids: ['child-moat'],
    prompt: null,
    agents_states: { 'child-moat': { status: 'errored', message: 'child failed' } },
    status: 'in_progress',
  },
}))
assert.equal(events.filter((event) => event.type === 'agent-failed').length, 1)

handleStreamLine(run, JSON.stringify({
  type: 'item.started',
  item: {
    id: 'spawn-moat-retry',
    type: 'collab_tool_call',
    tool: 'spawn_agent',
    sender_thread_id: 'parent',
    receiver_thread_ids: ['child-moat-retry'],
    prompt: 'NOSTRA_SUBAGENT_TYPE: moat\nCanonical path: .claude/agents/business-model/09_moat.md',
    agents_states: { 'child-moat-retry': { status: 'running', message: null } },
    status: 'in_progress',
  },
}))
assert.equal(run.agents.get(key)?.status, 'running')
assert.equal(run.nativeThreadToAgent.has('child-moat'), false)
assert.equal(run.nativeAgentStates.has('child-moat'), false)
assert.equal(run.nativeThreadToAgent.get('child-moat-retry'), key)
assert.equal(events.filter((event) => event.type === 'agent-started').length, 2)

handleStreamLine(run, JSON.stringify({
  type: 'item.updated',
  item: {
    id: 'late-old-wait',
    type: 'collab_tool_call',
    tool: 'wait',
    sender_thread_id: 'parent',
    receiver_thread_ids: ['child-moat'],
    prompt: null,
    agents_states: { 'child-moat': { status: 'errored', message: 'late old update' } },
    status: 'in_progress',
  },
}))
assert.equal(run.agents.get(key)?.status, 'running')
assert.equal(events.filter((event) => event.type === 'agent-failed').length, 1)

console.log('codex-task-lifecycle.test.ts: completion-only attribution, deduplication, and retry isolation pass')
