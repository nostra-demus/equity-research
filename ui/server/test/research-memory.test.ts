import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { canonicalJsonText } from '../src/canonical-json'
import type { RunState } from '../src/registry'
import {
  clearResearchMemoryPreparationForTests,
  compileResearchMemoryPacket,
  finalizeResearchMemory,
  prepareResearchMemory,
  researchMemoryMode,
  researchMemoryTaskStatus,
  verifyResearchMemoryBeforeSpawn,
} from '../src/research-memory'

function run(): RunState {
  return {
    runId: '00000000-0000-4000-8000-000000000001', kind: 'agent', ticker: 'TEST',
    subjectId: 'TEST', swarmId: 'research', unit: 'ticker', module: 'earnings',
    agent: 'historical-financials', provider: 'codex',
    executionProfile: {
      key: 'test', parentModel: 'gpt-5.6-sol', specialistModel: 'gpt-5.6-terra',
    },
    profileKey: 'codex:test', model: 'gpt-5.6-sol', prompt: 'test', user: 'local', userVia: 'local',
    runRoot: 'analyses/MEMORYTEST_2099-01-01', child: null, status: 'starting', startedAt: Date.now(),
    willCommitToMain: false, writeTargetsAbs: [], coveredModules: ['earnings'], readDepsAbs: [],
    agents: new Map(), expected: new Map([
      ['earnings/01_historical-financials', {
        key: 'earnings/01_historical-financials', module: 'earnings', name: 'historical-financials',
        layer: 1, outputRel: 'earnings/01_historical-financials.md',
      }],
      ['earnings/99_earnings-synthesis', {
        key: 'earnings/99_earnings-synthesis', module: 'earnings', name: 'earnings-synthesis',
        layer: 99, outputRel: 'earnings/99_earnings-synthesis.md',
      }],
    ]), toolUseToAgent: new Map(), nativeThreadToAgent: new Map(), nativeAgentStates: new Map(),
    eventLog: [], activity: [], subscribers: new Set(),
    memoryIdentity: {
      legalName: 'Test Holdings Inc', venue: 'NasdaqGS', currency: 'USD', ticker: 'TEST', identifiers: [],
    },
  }
}

const configured = {
  NOSTRA_MEMORY_MODE: 'enforced', NOSTRA_MEMORY_STATE_ROOT: '/tmp/memory-state',
  NOSTRA_MEMORY_CHECKPOINT: '/tmp/checkpoint', NOSTRA_MEMORY_WRITER_OWNER_PATH: '/tmp/owner',
  NOSTRA_MEMORY_WRITER_OWNER: 'memory-canonical-writer',
  NOSTRA_MEMORY_WRITER_HEAD: '/tmp/head', NOSTRA_MEMORY_CANONICAL_LEDGER: '/tmp/memory.ndjson',
  NOSTRA_MEMORY_PROTECTED_STORE: '/tmp/protected-memory',
  NOSTRA_MEMORY_PROTECTED_MASTER_KEY: '/tmp/protected-key',
  NOSTRA_MEMORY_PROTECTED_KEY_ID: 'key:memory-projection',
  NOSTRA_MEMORY_PROJECTION_SERVICE_IDENTITY: 'memory-projection-reader',
  NOSTRA_MEMORY_CHECKPOINT_PRIVATE_KEY: '/tmp/cpk',
  NOSTRA_MEMORY_CHECKPOINT_PUBLIC_KEY: '/tmp/cpub', NOSTRA_MEMORY_CHECKPOINT_KEY_ID: 'checkpoint',
  NOSTRA_MEMORY_CONTRACT_PRIVATE_KEY: '/tmp/rpk', NOSTRA_MEMORY_CONTRACT_PUBLIC_KEY: '/tmp/rpub',
  NOSTRA_MEMORY_CONTRACT_KEY_ID: 'contract', NOSTRA_MEMORY_PROVIDER_POLICY: '/tmp/policy',
  NOSTRA_MEMORY_POLICY_PUBLIC_KEY: '/tmp/ppub', NOSTRA_MEMORY_POLICY_KEY_ID: 'policy',
  NOSTRA_MEMORY_SERVICE_IDENTITY: 'supervisor',
  NOSTRA_MEMORY_ENFORCEMENT_ACTIVATION: '/tmp/enforcement-activation.json',
  NOSTRA_MEMORY_ENFORCEMENT_READINESS: '/tmp/readiness-report.json',
  NOSTRA_MEMORY_ENFORCEMENT_THREE_LAYER: '/tmp/three-layer-report.json',
  NOSTRA_MEMORY_ENFORCEMENT_SHADOW: '/tmp/shadow-report.json',
  NOSTRA_MEMORY_ENFORCEMENT_PUBLIC_KEY: '/tmp/enforcement-public-key',
  NOSTRA_MEMORY_ENFORCEMENT_KEY_ID: 'memory-enforcement-release',
  NOSTRA_MEMORY_BENCHMARK_PUBLIC_KEY: '/tmp/benchmark-public-key',
  NOSTRA_MEMORY_BENCHMARK_KEY_ID: 'benchmark-runner-key',
  NOSTRA_MEMORY_SHADOW_ADJUDICATOR_PUBLIC_KEY: '/tmp/shadow-adjudicator-public-key',
  NOSTRA_MEMORY_SHADOW_ADJUDICATOR_KEY_ID: 'shadow-adjudicator-key',
} as NodeJS.ProcessEnv

assert.equal(researchMemoryMode({}), 'off')
assert.throws(() => researchMemoryMode({ NOSTRA_MEMORY_MODE: 'unsafe' }))

clearResearchMemoryPreparationForTests()
const calls: string[][] = []
const executor = async (args: string[]) => {
  calls.push(args)
  if (args[0] === 'verify-enforcement') return {
    schema: 'memory-enforcement-verification/v1', ok: true,
    activation_id: 'memory-enforcement-release-1', activation_sha256: `sha256:${'c'.repeat(64)}`,
    provider_model: `${args[args.indexOf('--provider') + 1]}/${args[args.indexOf('--model') + 1]}`,
    expires_at: '2099-01-01T00:00:00.000000Z',
  }
  if (args[0] === 'prepare') return {
    ok: true, reused: false, receipt_id: 'run-receipt_00000000-0000-5000-8000-000000000001',
    receipt_path: '/tmp/receipt.json', projection_path: '/tmp/projection.sqlite',
    receipt_sha256: `sha256:${'a'.repeat(64)}`,
    authorization_id: 'provider-authorization_00000000-0000-5000-8000-000000000002',
    authorization_path: '/tmp/provider-authorization.json',
    authorization_sha256: `sha256:${'b'.repeat(64)}`,
  }
  if (args[0] === 'authorize') return {
    schema: 'research-memory-authorize-result/v1', ok: true,
    receipt_id: 'run-receipt_00000000-0000-5000-8000-000000000001',
    receipt_sha256: `sha256:${'a'.repeat(64)}`,
    provider_model: `${args[args.indexOf('--provider') + 1]}/${args[args.indexOf('--model') + 1]}`,
    authorization_id: 'provider-authorization_00000000-0000-5000-8000-000000000003',
    authorization_path: '/tmp/specialist-provider-authorization.json',
    authorization_sha256: `sha256:${'d'.repeat(64)}`,
  }
  if (args[0] === 'finalize') return { ok: true, status: 'completed', coverage_pct: 100 }
  return {
    ok: true, receipt_id: 'run-receipt_00000000-0000-5000-8000-000000000001',
    receipt_sha256: `sha256:${'a'.repeat(64)}`,
    authorization_id: 'provider-authorization_00000000-0000-5000-8000-000000000002',
    authorization_sha256: `sha256:${'b'.repeat(64)}`,
  }
}
const prepared = run()
await prepareResearchMemory(prepared, executor, configured)
assert.equal(prepared.memoryRuntime?.status, 'verified')
assert.equal(calls[0][0], 'verify-enforcement')
assert.equal(calls[1][0], 'prepare')
assert.ok(calls[1].includes('--legal-name'))
assert.equal(calls[1][calls[1].indexOf('--writer-owner') + 1], '/tmp/owner')
await verifyResearchMemoryBeforeSpawn(prepared, executor, configured)
assert.equal(calls[2][0], 'verify-enforcement')
assert.equal(calls[3][0], 'verify')
await compileResearchMemoryPacket(prepared, 'earnings/01_historical-financials', executor, configured)
assert.equal(calls[4][0], 'authorize')
assert.equal(calls[4][calls[4].indexOf('--model') + 1], 'gpt-5.6-terra')
assert.equal(calls[5][0], 'compile')
assert.equal(
  calls[5][calls[5].indexOf('--authorization') + 1],
  '/tmp/specialist-provider-authorization.json',
)
await compileResearchMemoryPacket(prepared, 'earnings/99_earnings-synthesis', executor, configured)
assert.equal(calls[6][0], 'compile')
assert.equal(calls.filter((args) => args[0] === 'authorize').length, 1, 'module synthesis does not inherit the Terra specialist authorization')
assert.equal(calls[6][calls[6].indexOf('--authorization') + 1], '/tmp/provider-authorization.json')
await assert.rejects(() => compileResearchMemoryPacket(
  prepared, 'valuation/01_price-and-capital-structure', executor, configured,
))

const switchedProvider = run()
switchedProvider.provider = 'claude'
switchedProvider.model = 'claude-opus'
await prepareResearchMemory(switchedProvider, executor, configured)
const prepareCalls = calls.filter((args) => args[0] === 'prepare')
assert.equal(prepareCalls.length, 2, 'provider/model switch requires a fresh authorization decision')
assert.equal(prepareCalls[1][prepareCalls[1].indexOf('--provider') + 1], 'claude')
await prepareResearchMemory(run(), executor, configured)
assert.equal(
  calls.filter((args) => args[0] === 'prepare').length, 3,
  'switching back to the original provider requires another authorization decision',
)

clearResearchMemoryPreparationForTests()
const blockedCalls: string[][] = []
const blockedByReleaseGate = run()
await assert.rejects(
  () => prepareResearchMemory(blockedByReleaseGate, async (args) => {
    blockedCalls.push(args)
    throw new Error('enforcement activation expired')
  }, configured),
  /memory snapshot blocked before spend: enforcement activation expired/,
)
assert.deepEqual(blockedCalls.map((args) => args[0]), ['verify-enforcement'])
assert.equal(blockedByReleaseGate.memoryRuntime?.status, 'blocked')

clearResearchMemoryPreparationForTests()
const malformedGateResult = run()
await assert.rejects(
  () => prepareResearchMemory(malformedGateResult, async () => null as any, configured),
  /memory snapshot blocked before spend: signed memory enforcement activation did not verify/,
)
assert.equal(malformedGateResult.memoryRuntime?.status, 'blocked')

const shadowGateCalls: string[][] = []
const shadowWithConfig = run()
await prepareResearchMemory(shadowWithConfig, async (args) => {
  shadowGateCalls.push(args)
  return executor(args)
}, { ...configured, NOSTRA_MEMORY_MODE: 'shadow' })
assert.equal(shadowGateCalls.some((args) => args[0] === 'verify-enforcement'), false)

const statusRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'memory-status-'))
const statusConfig = { ...configured, NOSTRA_MEMORY_STATE_ROOT: statusRoot }
const output = path.resolve('../..', 'analyses/MEMORYTEST_2099-01-01/earnings/01_historical-financials.md')
fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, '# Test analysis\n')
const digest = `sha256:${createHash('sha256').update(fs.readFileSync(output)).digest('hex')}`
const receiptDir = path.join(
  statusRoot, 'execution-receipts', prepared.memoryRuntime!.logicalRunId,
  'earnings_01_historical-financials',
)
fs.mkdirSync(receiptDir, { recursive: true })
fs.writeFileSync(path.join(receiptDir, 'task-episode.json'), JSON.stringify({
  schema: 'memory-task-episode/v1', run_id: prepared.memoryRuntime!.logicalRunId,
  task_id: 'earnings/01_historical-financials', status: 'completed', output_sha256: digest,
}))
const attestedStatus = researchMemoryTaskStatus(
  prepared, 'earnings/01_historical-financials', 'earnings/01_historical-financials.md', statusConfig,
)
assert.equal(attestedStatus.attested, true, JSON.stringify(attestedStatus))
fs.writeFileSync(output, '# Changed analysis\n')
assert.equal(researchMemoryTaskStatus(
  prepared, 'earnings/01_historical-financials', 'earnings/01_historical-financials.md', statusConfig,
).attested, false)
const enforcementChecksBeforeFinalize = calls.filter((args) => args[0] === 'verify-enforcement').length
const finalized = await finalizeResearchMemory(prepared, true, executor, configured)
assert.deepEqual(finalized, { ok: true })
assert.equal(
  calls.filter((args) => args[0] === 'verify-enforcement').length,
  enforcementChecksBeforeFinalize,
  'finalization verifies the frozen receipt without requiring an unexpired dispatch activation',
)
fs.rmSync(statusRoot, { recursive: true })
fs.rmSync(path.resolve('../..', 'analyses/MEMORYTEST_2099-01-01'), { recursive: true })

const missing = run()
await assert.rejects(() => prepareResearchMemory(missing, executor, { NOSTRA_MEMORY_MODE: 'enforced' }))
assert.equal(missing.memoryRuntime?.status, 'blocked')

const shadow = run()
delete shadow.memoryIdentity
await prepareResearchMemory(shadow, executor, { NOSTRA_MEMORY_MODE: 'shadow' })
assert.equal(shadow.memoryRuntime?.status, 'unavailable')

const controlRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'memory-controls-'))
const controlConfig = { ...configured, NOSTRA_MEMORY_STATE_ROOT: controlRoot }
function writeControls(patch: Record<string, unknown>) {
  const body = {
    schema: 'memory-runtime-controls/v1', revision: 1, updated_at: '2026-08-26T00:00:00Z',
    updated_by: 'ops', global_disabled: false, disabled_layers: [], disabled_playbooks: [],
    pinned_playbooks: [], candidate_intake_disabled: false, ...patch,
  }
  const value = { ...body, control_sha256: `sha256:${createHash('sha256').update(canonicalJsonText(body)).digest('hex')}` }
  const file = path.join(controlRoot, 'controls', 'runtime-controls.json')
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 })
  fs.writeFileSync(file, JSON.stringify(value), { mode: 0o600 })
}
writeControls({ global_disabled: true })
const killed = run()
await prepareResearchMemory(killed, executor, controlConfig)
assert.equal(killed.memoryRuntime?.status, 'off', 'the global kill switch stops memory before preparation')

writeControls({
  disabled_layers: ['semantic'],
  disabled_playbooks: [{ playbook_id: 'memory-playbook-filing', version: 2, reason: 'stale-fact', disabled_at: '2026-08-26T00:00:00Z' }],
  pinned_playbooks: [{ playbook_id: 'memory-playbook-governance', version: 1, pinned_at: '2026-08-26T00:00:00Z' }],
})
clearResearchMemoryPreparationForTests()
const controlled = run()
await prepareResearchMemory(controlled, executor, controlConfig)
await compileResearchMemoryPacket(controlled, 'earnings/01_historical-financials', executor, controlConfig)
const controlledCompile = calls.at(-1)!
assert.deepEqual(controlledCompile.slice(controlledCompile.indexOf('--disable-layer'), controlledCompile.indexOf('--disable-layer') + 2), ['--disable-layer', 'semantic'])
assert.ok(controlledCompile.includes('memory-playbook-filing@2'))
assert.ok(controlledCompile.includes('memory-playbook-governance@1'))
const controlsFile = path.join(controlRoot, 'controls', 'runtime-controls.json')
const tamperedControls = JSON.parse(fs.readFileSync(controlsFile, 'utf8'))
fs.writeFileSync(controlsFile, JSON.stringify({ ...tamperedControls, global_disabled: true }), { mode: 0o600 })
clearResearchMemoryPreparationForTests()
await assert.rejects(
  () => prepareResearchMemory(run(), executor, controlConfig),
  /memory snapshot blocked before spend/,
  'an existing control file that fails integrity must block enforced dispatch',
)
fs.rmSync(controlRoot, { recursive: true })

console.log('research memory supervisor tests passed')
