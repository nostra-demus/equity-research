import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { RunState } from '../src/registry'
import {
  clearResearchMemoryPreparationForTests,
  compileResearchMemoryPacket,
  prepareResearchMemory,
  researchMemoryMode,
  researchMemoryTaskStatus,
  verifyResearchMemoryBeforeSpawn,
} from '../src/research-memory'

function run(): RunState {
  return {
    runId: '00000000-0000-4000-8000-000000000001', kind: 'agent', ticker: 'TEST',
    subjectId: 'TEST', swarmId: 'research', unit: 'ticker', module: 'earnings',
    agent: 'historical-financials', provider: 'codex', executionProfile: { key: 'test' },
    profileKey: 'codex:test', model: 'gpt-5.5', prompt: 'test', user: 'local', userVia: 'local',
    runRoot: 'analyses/MEMORYTEST_2099-01-01', child: null, status: 'starting', startedAt: Date.now(),
    willCommitToMain: false, writeTargetsAbs: [], coveredModules: ['earnings'], readDepsAbs: [],
    agents: new Map(), expected: new Map([['earnings/01_historical-financials', {
      key: 'earnings/01_historical-financials', module: 'earnings', name: 'historical-financials',
      layer: 1, outputRel: 'earnings/01_historical-financials.md',
    }]]), toolUseToAgent: new Map(), nativeThreadToAgent: new Map(), nativeAgentStates: new Map(),
    eventLog: [], activity: [], subscribers: new Set(),
    memoryIdentity: {
      legalName: 'Test Holdings Inc', venue: 'NasdaqGS', currency: 'USD', ticker: 'TEST', identifiers: [],
    },
  }
}

const configured = {
  NOSTRA_MEMORY_MODE: 'enforced', NOSTRA_MEMORY_STATE_ROOT: '/tmp/memory-state',
  NOSTRA_MEMORY_CHECKPOINT: '/tmp/checkpoint', NOSTRA_MEMORY_WRITER_OWNER: '/tmp/owner',
  NOSTRA_MEMORY_WRITER_HEAD: '/tmp/head', NOSTRA_MEMORY_CHECKPOINT_PRIVATE_KEY: '/tmp/cpk',
  NOSTRA_MEMORY_CHECKPOINT_PUBLIC_KEY: '/tmp/cpub', NOSTRA_MEMORY_CHECKPOINT_KEY_ID: 'checkpoint',
  NOSTRA_MEMORY_CONTRACT_PRIVATE_KEY: '/tmp/rpk', NOSTRA_MEMORY_CONTRACT_PUBLIC_KEY: '/tmp/rpub',
  NOSTRA_MEMORY_CONTRACT_KEY_ID: 'contract', NOSTRA_MEMORY_PROVIDER_POLICY: '/tmp/policy',
  NOSTRA_MEMORY_POLICY_PUBLIC_KEY: '/tmp/ppub', NOSTRA_MEMORY_POLICY_KEY_ID: 'policy',
  NOSTRA_MEMORY_SERVICE_IDENTITY: 'supervisor',
} as NodeJS.ProcessEnv

assert.equal(researchMemoryMode({}), 'off')
assert.throws(() => researchMemoryMode({ NOSTRA_MEMORY_MODE: 'unsafe' }))

clearResearchMemoryPreparationForTests()
const calls: string[][] = []
const executor = async (args: string[]) => {
  calls.push(args)
  if (args[0] === 'prepare') return {
    ok: true, reused: false, receipt_id: 'run-receipt_00000000-0000-5000-8000-000000000001',
    receipt_path: '/tmp/receipt.json', projection_path: '/tmp/projection.sqlite',
    receipt_sha256: `sha256:${'a'.repeat(64)}`,
    authorization_id: 'provider-authorization_00000000-0000-5000-8000-000000000002',
    authorization_path: '/tmp/provider-authorization.json',
    authorization_sha256: `sha256:${'b'.repeat(64)}`,
  }
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
assert.equal(calls[0][0], 'prepare')
assert.ok(calls[0].includes('--legal-name'))
await verifyResearchMemoryBeforeSpawn(prepared, executor, configured)
assert.equal(calls[1][0], 'verify')
await compileResearchMemoryPacket(prepared, 'earnings/01_historical-financials', executor, configured)
assert.equal(calls[2][0], 'compile')
assert.ok(calls[2].includes('--authorization'))
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
fs.rmSync(statusRoot, { recursive: true })
fs.rmSync(path.resolve('../..', 'analyses/MEMORYTEST_2099-01-01'), { recursive: true })

const missing = run()
await assert.rejects(() => prepareResearchMemory(missing, executor, { NOSTRA_MEMORY_MODE: 'enforced' }))
assert.equal(missing.memoryRuntime?.status, 'blocked')

const shadow = run()
delete shadow.memoryIdentity
await prepareResearchMemory(shadow, executor, { NOSTRA_MEMORY_MODE: 'shadow' })
assert.equal(shadow.memoryRuntime?.status, 'unavailable')

console.log('research memory supervisor tests passed')
