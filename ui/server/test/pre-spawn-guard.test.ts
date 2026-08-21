// Final-boundary scope guards are synchronous and fail closed. The route/launcher ordering that places this
// immediately before execa is pinned in thesis-plan-module-route.test.ts; this file pins failure semantics.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import { evaluatePreSpawnGuard, evaluateTerminalGuard, finalizeRunOnClose, type PreSpawnGuard } from '../src/launcher'
import { createRun } from '../src/registry'

assert.deepEqual(evaluatePreSpawnGuard(), { ok: true }, 'ordinary launches with no guard are unchanged')
assert.deepEqual(evaluatePreSpawnGuard(() => ({ ok: true })), { ok: true }, 'a current scope proceeds')
assert.deepEqual(
  evaluatePreSpawnGuard(() => ({
    ok: false,
    reason: 'module_scope_changed',
    message: 'scope changed',
  })),
  { ok: false, reason: 'module_scope_changed', message: 'scope changed' },
  'a route-provided module scope failure keeps its actionable SSE reason',
)

const throwing: PreSpawnGuard = () => { throw new Error('filesystem race') }
const thrown = evaluatePreSpawnGuard(throwing)
assert.equal(thrown.ok, false, 'a guard read error fails closed')
if (!thrown.ok) {
  assert.equal(thrown.reason, 'launch_scope_changed')
  assert.match(thrown.message, /could not be verified.*No run was started/i)
  assert.doesNotMatch(thrown.message, /filesystem race/, 'raw internal exceptions are not exposed')
}

assert.deepEqual(await evaluateTerminalGuard(async () => ({ ok: true })), { ok: true })
const terminalFailure = await evaluateTerminalGuard(async () => ({
  ok: false,
  reason: 'module_publish_failed',
  message: 'not on origin',
}))
assert.deepEqual(terminalFailure, { ok: false, reason: 'module_publish_failed', message: 'not on origin' })
const terminalThrow = await evaluateTerminalGuard(async () => { throw new Error('secret git detail') })
assert.equal(terminalThrow.ok, false)
if (!terminalThrow.ok) assert.doesNotMatch(terminalThrow.message, /secret git detail/)

const unpublished = createRun({
  kind: 'module', ticker: 'ZZPUB', model: 'sonnet', prompt: '', user: 'test', userVia: 'local',
  runRoot: null, willCommitToMain: true, writeTargetsAbs: [], coveredModules: [], readDepsAbs: [],
  closeWatcher: undefined, expected: new Map(),
})
finalizeRunOnClose(unpublished, { exitCode: 0 }, '', terminalFailure)
assert.equal(unpublished.status, 'incomplete', 'an origin-unproven clean child is never reported done')
assert.match(unpublished.note ?? '', /module_publish_failed/)

console.log('pre/terminal guards: exact failure reasons + thrown-check fail-closed + unpublished child incomplete passed')
