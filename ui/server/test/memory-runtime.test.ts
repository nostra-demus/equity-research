import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { canonicalJsonText } from '../src/canonical-json'
import { createMemoryRuntimeReader } from '../src/memory-runtime'

let pass = 0
let fail = 0
async function check(name: string, fn: () => Promise<void> | void) {
  try { await fn(); pass++; console.log(`ok  ${name}`) } catch (error: any) {
    fail++; console.error(`FAIL  ${name}\n      ${error?.stack || error}`)
  }
}

const roots: string[] = []
function fixtureRoot(): string {
  const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'memory-runtime-ui-')))
  roots.push(root)
  fs.chmodSync(root, 0o700)
  return root
}
process.once('exit', () => roots.forEach((root) => { try { fs.rmSync(root, { recursive: true, force: true }) } catch {} }))

function write(root: string, relative: string, value: unknown) {
  const file = path.join(root, relative)
  fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 })
  fs.writeFileSync(file, JSON.stringify(value), { mode: 0o600 })
}

const h = (letter: string) => `sha256:${letter.repeat(64)}`

function controls() {
  const body: Record<string, unknown> = {
    schema: 'memory-runtime-controls/v1', revision: 2, updated_at: '2026-08-26T00:00:00Z',
    updated_by: 'ops', global_disabled: false, disabled_layers: ['semantic'],
    disabled_playbooks: [{ playbook_id: 'memory-playbook-filing', version: 1, reason: 'serious-evidence-error', disabled_at: '2026-08-26T00:00:00Z' }],
    pinned_playbooks: [], candidate_intake_disabled: false,
  }
  return { ...body, control_sha256: `sha256:${createHash('sha256').update(canonicalJsonText(body)).digest('hex')}` }
}

function populate(root: string) {
  fs.writeFileSync(path.join(root, 'projection.sqlite'), 'verified-projection', { mode: 0o600 })
  write(root, 'controls/runtime-controls.json', controls())
  write(root, 'candidates/semantic/candidate.json', {
    schema: 'memory-semantic-candidate/v1', candidate_id: 'memory-semantic-candidate-1',
    candidate_type: 'lesson', status: 'candidate', created_at: '2026-08-25T10:00:00Z',
    created_by: { kind: 'adapter', id: 'seeder' }, policy: { classification: 'internal' },
    candidate_sha256: h('a'),
  })
  write(root, 'candidates/semantic/protected.sealed.json', {
    schema: 'memory-semantic-protected-queue/v1', record_id: 'SECRET_ISSUER_IDENTIFIER',
    ciphertext: 'SECRET_CIPHERTEXT', policy: { classification: 'restricted' },
  })
  write(root, 'promotions/semantic/manifest-1/manifest.json', {
    schema: 'memory-promotion-manifest/v1', manifest_sha256: h('b'),
  })
  write(root, 'promotions/semantic/manifest-1/lesson.json', {
    schema: 'memory-semantic-lesson/v1', lesson_id: 'memory-semantic-lesson-1', version: 1,
    semantic: { lesson_kind: 'exact-issuer', effect: 'current-check-required', review_due: '2027-02-01', distinct_issuer_count: 1, supporting_evidence: ['one'], contradicting_evidence: [] },
    owner: 'research-memory', status: 'active', activated_at: '2026-08-25T11:00:00Z', lesson_sha256: h('c'),
  })
  write(root, 'promotions/playbook/manifest-2/playbook.json', {
    schema: 'memory-playbook/v1', playbook_id: 'memory-playbook-filing', version: 1,
    playbook: { procedure_key: 'filing.reconcile', risk_class: 'mechanical', required: true, owner: 'research-memory', validation_case_ids: ['a', 'b', 'c', 'd'], originating_episode_ids: ['memory-task-episode-1'] },
    status: 'active', status_reason: null, activated_at: '2026-08-25T12:00:00Z', expires_at: '2027-02-01T00:00:00Z',
    playbook_sha256: h('d'), promotion_manifest_sha256: h('e'),
  })
  write(root, 'executions/playbook/execution-1.json', {
    schema: 'memory-playbook-execution/v1', playbook_id: 'memory-playbook-filing', status: 'deviated', deviation_codes: ['source-missing'],
  })
  write(root, 'execution-receipts/run-1/task/task-episode.json', {
    schema: 'memory-task-episode/v1', run_id: 'run-1', status: 'completed',
  })
  write(root, 'execution-receipts/run-1/task/memory-use.json', {
    schema: 'memory-use/v1', run_id: 'run-1', used: [{ record_id: 'x' }], checked_rejected: [{ record_id: 'y' }], contradicted: [],
  })
  write(root, 'execution-receipts/run-1/run-episode.json', {
    schema: 'memory-run-episode/v1', episode_id: 'memory-run-episode-1', run_id: 'run-1', receipt_id: 'memory-receipt-1',
    issuer_listing: { ticker: 'ABC', mic: 'XNSE' }, mode: 'enforced', status: 'completed',
    expected_task_count: 1, completed_task_count: 1, memory_coverage_pct: 100,
    started_at: '2026-08-25T09:00:00Z', completed_at: '2026-08-25T09:10:00Z',
  })
  const readiness: Record<string, unknown> = {
    schema: 'memory-operational-readiness-report/v1', status: 'met', evaluated_at: '2026-08-26T00:00:00Z',
    slos: [{ slo_id: 'context-compilation-p95', status: 'met', target: { comparison: 'less-than', value: 5000, unit: 'milliseconds', cadence: null } }],
  }
  write(root, 'operations/readiness-report.json', {
    ...readiness, report_sha256: `sha256:${createHash('sha256').update(canonicalJsonText(readiness)).digest('hex')}`,
  })
}

await check('exposes only curated metadata, lineage counts, controls and measured SLO state', () => {
  const root = fixtureRoot(); populate(root)
  const reader = createMemoryRuntimeReader({
    repoRoot: '/repo', stateRoot: root, mode: 'enforced', now: () => Date.parse('2026-08-26T01:00:00Z'),
    serviceIdentities: { 'projection-query': 'reader-service', 'emergency-quarantine': '' },
  })
  const runtime = reader.runtime()
  assert.equal(runtime.contract_version, 'memory-runtime-ui/1')
  assert.equal(runtime.readiness.status, 'met')
  assert.equal(runtime.counts.runs, 1)
  assert.equal(runtime.counts.lessons, 1)
  assert.equal(runtime.counts.playbooks, 1)
  assert.deepEqual(runtime.controls.disabled_layers, ['semantic'])
  assert.equal(runtime.services.find((item) => item.role === 'projection-query')?.configured, true)
  assert.equal(reader.runs('run-1')?.task_summary.used, 1)
  assert.equal(reader.runs('run-1')?.task_summary.rejected, 1)
  assert.equal(reader.lessons()[0].supporting_evidence_count, 1)
  assert.equal(reader.playbooks()[0].status, 'quarantined-local')
  assert.equal(reader.playbooks()[0].execution_count, 1)
  assert.equal(reader.playbooks()[0].deviation_count, 1)
  assert.equal(reader.candidates().length, 1)
  const serialized = JSON.stringify({ runtime, lessons: reader.lessons(), playbooks: reader.playbooks(), candidates: reader.candidates() })
  assert.doesNotMatch(serialized, /SECRET_ISSUER_IDENTIFIER|SECRET_CIPHERTEXT|statement|required_inputs|steps/)
})

await check('fails closed when enabled runtime state is absent', () => {
  const reader = createMemoryRuntimeReader({ repoRoot: '/repo', stateRoot: path.join(fixtureRoot(), 'missing'), mode: 'enforced' })
  const runtime = reader.runtime()
  assert.equal(runtime.available, false)
  assert.equal(runtime.state, 'unavailable')
  assert.equal(runtime.effective_mode, 'off')
  assert.equal(runtime.alerts[0].severity, 'critical')
})

await check('fails closed when an existing control or readiness record is unsafe', () => {
  const controlRoot = fixtureRoot(); populate(controlRoot)
  fs.chmodSync(path.join(controlRoot, 'controls', 'runtime-controls.json'), 0o644)
  const controlRuntime = createMemoryRuntimeReader({ repoRoot: '/repo', stateRoot: controlRoot, mode: 'enforced' }).runtime()
  assert.equal(controlRuntime.available, false)
  assert.equal(controlRuntime.effective_mode, 'off')

  const readinessRoot = fixtureRoot(); populate(readinessRoot)
  const readinessFile = path.join(readinessRoot, 'operations', 'readiness-report.json')
  const value = JSON.parse(fs.readFileSync(readinessFile, 'utf8'))
  fs.writeFileSync(readinessFile, JSON.stringify({ ...value, status: 'failed' }), { mode: 0o600 })
  const readinessRuntime = createMemoryRuntimeReader({ repoRoot: '/repo', stateRoot: readinessRoot, mode: 'enforced' }).runtime()
  assert.equal(readinessRuntime.available, false)
  assert.equal(readinessRuntime.effective_mode, 'off')
})

await check('sends only validated bounded operations to the control process', async () => {
  const root = fixtureRoot(); populate(root)
  const calls: string[][] = []
  const reader = createMemoryRuntimeReader({
    repoRoot: '/repo', stateRoot: root, mode: 'shadow',
    controlExec: async (args) => { calls.push(args); return { ok: true } },
  })
  await reader.control({ operation: 'playbook-quarantine', playbook_id: 'memory-playbook-filing', version: 1, reason: 'stale-fact' })
  assert.deepEqual(calls, [['playbook-quarantine', '--playbook-id', 'memory-playbook-filing', '--version', '1', '--reason', 'stale-fact']])
  await assert.rejects(() => reader.control({ operation: 'playbook-pin', playbook_id: '../escape', version: 1 }), /invalid playbook id/)
})

console.log(`\n${pass}/${pass + fail} memory runtime UI checks passed${fail ? ` — ${fail} FAILED` : ''}`)
process.exitCode = fail ? 1 : 0
