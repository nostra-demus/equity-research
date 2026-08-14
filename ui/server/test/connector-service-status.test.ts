// Supervisor + scheduled-sweep proof for the Data Library service strip. No real status files are read.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const {
  classifyConnectorService, parseConnectorSupervisor, parseRunnerHeartbeat, readConnectorFetchServiceStatus,
} = await import('../src/connector-service-status')

const NOW = Date.parse('2026-08-13T12:00:00Z')
const COMMIT = 'a'.repeat(40)
const RUN = 'b'.repeat(32)
const heartbeat = (overrides: Record<string, unknown> = {}) => ({
  schema_version: 2, service: 'connector-fetcher', state: 'completed', interval_seconds: 900,
  host: 'research-mac-pro', pid: 4321, run_id: RUN, deployed_commit: COMMIT,
  sweep_started_at: '2026-08-13T11:44:00.000000Z', last_progress_at: '2026-08-13T11:45:00.000000Z',
  sweep_completed_at: '2026-08-13T11:45:00.000000Z', processed_rows: 27, failed_rows: 0,
  skipped_manifests: 2, error_code: null, ...overrides,
})
const supervisor = (overrides: Record<string, unknown> = {}) => ({
  schema_version: 1, service: 'connector-supervisor', updated_at: '2026-08-13T11:59:00.000000Z',
  state: 'online', reason: 'verified_first_sweep', role: 'doer', pool: 'ready', scheduler: 'loaded',
  ready: true, auto_retry_armed: true, activation_started_at: '2026-08-13T11:40:00.000000Z',
  last_attempt_at: '2026-08-13T11:44:00.000000Z', retry_not_before: null,
  expected_host: 'research-mac-pro', desired_commit: COMMIT, expected_run_id: RUN,
  observed_host: 'research-mac-pro', deployed_commit: COMMIT, run_id: RUN, ...overrides,
})

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error}`); process.exitCode = 1 }
}

check('exact v2 runner + exact supervisor prove Online only after a completed useful sweep', () => {
  const run = parseRunnerHeartbeat(heartbeat())
  const sup = parseConnectorSupervisor(supervisor())
  assert.ok(run && sup)
  const out = classifyConnectorService(sup, run, NOW, COMMIT, 'research-mac-pro')
  assert.equal(out.state, 'online')
  assert.equal(out.autoRetryArmed, true)
  assert.equal(out.processedRows, 27)
  assert.equal(out.host, 'research-mac-pro')
})

check('running is Checking, not Online', () => {
  const run = parseRunnerHeartbeat(heartbeat({
    state: 'running', sweep_completed_at: null, last_progress_at: '2026-08-13T11:59:00.000000Z',
  }))
  const out = classifyConnectorService(parseConnectorSupervisor(supervisor({
    state: 'starting', reason: 'sweep_in_progress', ready: false,
  })), run, NOW, COMMIT, 'research-mac-pro')
  assert.equal(out.state, 'checking')
  assert.match(out.note, /Checking feeds now/)
})

check('runner v1 is accepted only as legacy observation and never proves Online', () => {
  const { run_id: _run, deployed_commit: _commit, ...legacy } = heartbeat({ schema_version: 1 })
  const parsed = parseRunnerHeartbeat(legacy)
  assert.equal(parsed?.schema_version, 1)
  const out = classifyConnectorService(parseConnectorSupervisor(supervisor({
    state: 'starting', reason: 'heartbeat_legacy', ready: false,
  })), parsed, NOW, COMMIT, 'research-mac-pro')
  assert.equal(out.state, 'starting')
  assert.match(out.note, /legacy sweep/)
})

check('every identity, deployment, activation, completion and freshness proof fails closed', () => {
  const validSup = parseConnectorSupervisor(supervisor())!
  for (const run of [
    heartbeat({ host: 'other-mac' }),
    heartbeat({ deployed_commit: 'c'.repeat(40) }),
    heartbeat({ run_id: 'd'.repeat(32) }),
    heartbeat({ sweep_started_at: '2026-08-13T11:39:59.000000Z' }),
    heartbeat({ processed_rows: 0 }),
    heartbeat({ sweep_started_at: '2026-08-13T10:00:00.000000Z', last_progress_at: '2026-08-13T10:01:00.000000Z', sweep_completed_at: '2026-08-13T10:01:00.000000Z' }),
  ]) assert.equal(classifyConnectorService(validSup, parseRunnerHeartbeat(run), NOW, COMMIT, 'research-mac-pro').state, 'starting')
  assert.equal(classifyConnectorService(parseConnectorSupervisor(supervisor({ auto_retry_armed: false }))!, parseRunnerHeartbeat(heartbeat()), NOW, COMMIT, 'research-mac-pro').state, 'starting')
  assert.equal(classifyConnectorService(validSup, parseRunnerHeartbeat(heartbeat()), NOW, null, 'research-mac-pro').state, 'starting')
  assert.equal(classifyConnectorService(validSup, parseRunnerHeartbeat(heartbeat()), NOW, 'c'.repeat(40), 'research-mac-pro').state, 'starting')
  assert.equal(classifyConnectorService(validSup, parseRunnerHeartbeat(heartbeat()), NOW, COMMIT, 'other-mac').state, 'starting')
})

check('Online requires doer role, ready pool and loaded scheduler, not only matching IDs', () => {
  for (const patch of [
    { role: 'admin' }, { role: 'absent' }, { pool: 'unavailable' }, { scheduler: 'unloaded' },
  ]) assert.equal(parseConnectorSupervisor(supervisor(patch)), null)
})

check('disabled role semantics accept admin and absent only with their exact reason', () => {
  const admin = parseConnectorSupervisor(supervisor({
    state: 'disabled_admin', reason: 'admin_role', role: 'admin', scheduler: 'unloaded',
    ready: false, auto_retry_armed: false,
  }))
  const absent = parseConnectorSupervisor(supervisor({
    state: 'disabled_admin', reason: 'role_absent', role: 'absent', scheduler: 'missing',
    ready: false, auto_retry_armed: false,
  }))
  assert.match(classifyConnectorService(admin, null, NOW, COMMIT, 'research-mac-pro').note, /configured as an admin/)
  assert.match(classifyConnectorService(absent, null, NOW, COMMIT, 'research-mac-pro').note, /no data-writer role/)
  assert.equal(parseConnectorSupervisor(supervisor({
    state: 'disabled_admin', reason: 'role_absent', role: 'admin', scheduler: 'unloaded', ready: false,
  })), null)
  assert.equal(parseConnectorSupervisor(supervisor({
    state: 'disabled_admin', reason: 'admin_role', role: 'absent', scheduler: 'missing', ready: false,
  })), null)
})

check('transition safety has one fail-closed state and busy remains an armed Starting state', () => {
  const unsafe = parseConnectorSupervisor(supervisor({
    state: 'blocked_unsafe', reason: 'transition_unsafe', ready: false, auto_retry_armed: false,
  }))
  assert.equal(classifyConnectorService(unsafe, null, NOW, COMMIT, 'research-mac-pro').state, 'blocked_unsafe')
  assert.equal(parseConnectorSupervisor(supervisor({
    state: 'starting', reason: 'transition_unsafe', ready: false, auto_retry_armed: false,
  })), null)
  assert.equal(parseConnectorSupervisor(supervisor({
    state: 'blocked_unsafe', reason: 'transition_unsafe', ready: false, auto_retry_armed: true,
  })), null)
  assert.ok(parseConnectorSupervisor(supervisor({
    state: 'starting', reason: 'transition_busy', ready: false, auto_retry_armed: true,
  })))
  assert.equal(parseConnectorSupervisor(supervisor({
    state: 'starting', reason: 'transition_busy', ready: false, auto_retry_armed: false,
  })), null)
})

check('supervisor operational states remain distinct and retry copy has an explicit proof bit', () => {
  const rows = [
    ['paused_drive', 'drive_unavailable', 'unavailable', 'unloaded', 'doer'],
    ['disabled_admin', 'admin_role', 'ready', 'unloaded', 'admin'],
    ['blocked_unsafe', 'plist_unsafe', 'unsafe', 'unsafe', 'unsafe'],
    ['foreign_writer', 'foreign_heartbeat', 'ready', 'unloaded', 'doer'],
  ] as const
  for (const [state, reason, pool, scheduler, role] of rows) {
    const sup = parseConnectorSupervisor(supervisor({ state, reason, pool, scheduler, role, ready: false, auto_retry_armed: false }))
    assert.equal(classifyConnectorService(sup, parseRunnerHeartbeat(heartbeat()), NOW, COMMIT, 'research-mac-pro').state, state)
    assert.equal(classifyConnectorService(sup, null, NOW, COMMIT, 'research-mac-pro').autoRetryArmed, false)
  }
})

check('paused, disabled and foreign states require proof that the local scheduler is fenced', () => {
  for (const patch of [
    { state: 'paused_drive', reason: 'drive_unavailable', pool: 'unavailable', scheduler: 'loaded' },
    { state: 'disabled_admin', reason: 'admin_role', role: 'admin', scheduler: 'loaded' },
    { state: 'foreign_writer', reason: 'foreign_heartbeat', scheduler: 'loaded' },
  ]) assert.equal(parseConnectorSupervisor(supervisor({ ...patch, ready: false, auto_retry_armed: false })), null)
})

check('unknown, extra and malformed supervisor/runner fields fail closed', () => {
  assert.equal(parseConnectorSupervisor({ ...supervisor(), future: true }), null)
  assert.equal(parseConnectorSupervisor(supervisor({ state: 'future_state' })), null)
  assert.equal(parseConnectorSupervisor(supervisor({ ready: false })), null)
  assert.equal(parseConnectorSupervisor(supervisor({ updated_at: 'Thu, 13 Aug 2026 11:59:00 GMT' })), null)
  assert.equal(parseRunnerHeartbeat({ ...heartbeat(), future: true }), null)
  assert.equal(parseRunnerHeartbeat(heartbeat({ run_id: 'A'.repeat(32) })), null)
  assert.equal(parseRunnerHeartbeat(heartbeat({ host: 'research mac' })), null)
  assert.equal(parseRunnerHeartbeat(heartbeat({ deployed_commit: 'a'.repeat(39) })), null)
  assert.equal(parseRunnerHeartbeat(heartbeat({ failed_rows: 28 })), null)
  assert.equal(parseRunnerHeartbeat(heartbeat({ state: 'completed', sweep_completed_at: null })), null)
  assert.equal(parseRunnerHeartbeat(heartbeat({
    sweep_started_at: '2026-08-13T11:44:00.000001Z', last_progress_at: '2026-08-13T11:44:00.000000Z',
    sweep_completed_at: '2026-08-13T11:45:00.000000Z',
  })), null, 'progress one microsecond before start is invalid')
  assert.equal(parseRunnerHeartbeat(heartbeat({
    last_progress_at: '2026-08-13T11:45:00.000001Z', sweep_completed_at: '2026-08-13T11:45:00.000000Z',
  })), null, 'completion one microsecond before progress is invalid')
})

check('a sweep one microsecond before activation cannot prove Online', () => {
  const run = parseRunnerHeartbeat(heartbeat({
    sweep_started_at: '2026-08-13T11:39:59.999999Z', last_progress_at: '2026-08-13T11:45:00.000000Z',
  }))
  assert.equal(classifyConnectorService(parseConnectorSupervisor(supervisor()), run, NOW, COMMIT, 'research-mac-pro').state, 'starting')
})

check('stale/future supervisor proof cannot claim Online', () => {
  const run = parseRunnerHeartbeat(heartbeat())
  assert.equal(classifyConnectorService(parseConnectorSupervisor(supervisor({ updated_at: '2026-08-13T11:54:59.999999Z' })), run, NOW, COMMIT, 'research-mac-pro').state, 'starting')
  assert.equal(classifyConnectorService(parseConnectorSupervisor(supervisor({ updated_at: '2026-08-13T12:05:00.000001Z' })), run, NOW, COMMIT, 'research-mac-pro').state, 'starting')
})

check('all supervisor timing comparisons preserve the final microsecond', () => {
  assert.equal(parseConnectorSupervisor(supervisor({
    updated_at: '2026-08-13T11:59:00.000000Z', activation_started_at: '2026-08-13T11:59:00.000001Z',
  })), null)
  assert.equal(parseConnectorSupervisor(supervisor({
    updated_at: '2026-08-13T11:59:00.000000Z', last_attempt_at: '2026-08-13T11:59:00.000001Z',
  })), null)
  assert.equal(parseConnectorSupervisor(supervisor({
    updated_at: '2026-08-13T11:59:00.000000Z', retry_not_before: '2026-08-13T12:04:00.000001Z',
  })), null)
})

check('runner freshness and future tolerances preserve the final microsecond', () => {
  const earlierSupervisor = parseConnectorSupervisor(supervisor({
    activation_started_at: '2026-08-13T10:00:00.000000Z',
  }))!
  const exactlyOld = parseRunnerHeartbeat(heartbeat({
    sweep_started_at: '2026-08-13T11:14:00.000000Z',
    last_progress_at: '2026-08-13T11:15:00.000000Z',
    sweep_completed_at: '2026-08-13T11:15:00.000000Z',
  }))
  const oneMicrosecondFresh = parseRunnerHeartbeat(heartbeat({
    sweep_started_at: '2026-08-13T11:14:00.000000Z',
    last_progress_at: '2026-08-13T11:15:00.000001Z',
    sweep_completed_at: '2026-08-13T11:15:00.000001Z',
  }))
  assert.equal(classifyConnectorService(earlierSupervisor, exactlyOld, NOW, COMMIT, 'research-mac-pro').state, 'starting')
  assert.equal(classifyConnectorService(earlierSupervisor, oneMicrosecondFresh, NOW, COMMIT, 'research-mac-pro').state, 'online')

  const futureSupervisor = parseConnectorSupervisor(supervisor({
    updated_at: '2026-08-13T12:00:00.000000Z',
  }))!
  const exactFutureTolerance = parseRunnerHeartbeat(heartbeat({
    sweep_started_at: '2026-08-13T12:04:00.000000Z',
    last_progress_at: '2026-08-13T12:05:00.000000Z',
    sweep_completed_at: '2026-08-13T12:05:00.000000Z',
  }))
  const oneMicrosecondTooFuture = parseRunnerHeartbeat(heartbeat({
    sweep_started_at: '2026-08-13T12:04:00.000000Z',
    last_progress_at: '2026-08-13T12:05:00.000001Z',
    sweep_completed_at: '2026-08-13T12:05:00.000001Z',
  }))
  assert.equal(classifyConnectorService(futureSupervisor, exactFutureTolerance, NOW, COMMIT, 'research-mac-pro').state, 'online')
  assert.equal(classifyConnectorService(futureSupervisor, oneMicrosecondTooFuture, NOW, COMMIT, 'research-mac-pro').state, 'starting')
})

check('supervisor file read is owner-only, no-follow and size-bounded', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'connector-service-'))
  const ops = path.join(dir, 'ops')
  const runnerPath = path.join(dir, 'runner.json')
  const supervisorPath = path.join(ops, 'supervisor.json')
  fs.mkdirSync(ops)
  fs.chmodSync(ops, 0o700)
  fs.writeFileSync(runnerPath, JSON.stringify(heartbeat()))
  fs.writeFileSync(supervisorPath, JSON.stringify(supervisor()), { mode: 0o600 })
  assert.equal(readConnectorFetchServiceStatus(true, { runnerPath, supervisorPath, nowMs: NOW, currentCommit: COMMIT, localHost: 'research-mac-pro' }).state, 'online')
  fs.chmodSync(supervisorPath, 0o644)
  assert.equal(readConnectorFetchServiceStatus(true, { runnerPath, supervisorPath, nowMs: NOW, currentCommit: COMMIT, localHost: 'research-mac-pro' }).state, 'starting')
  fs.rmSync(supervisorPath)
  fs.symlinkSync(runnerPath, supervisorPath)
  assert.equal(readConnectorFetchServiceStatus(true, { runnerPath, supervisorPath, nowMs: NOW, currentCommit: COMMIT, localHost: 'research-mac-pro' }).state, 'starting')
  fs.rmSync(supervisorPath)
  fs.writeFileSync(supervisorPath, JSON.stringify(supervisor()), { mode: 0o600 })
  fs.chmodSync(ops, 0o722)
  assert.equal(readConnectorFetchServiceStatus(true, { runnerPath, supervisorPath, nowMs: NOW, currentCommit: COMMIT, localHost: 'research-mac-pro' }).state, 'starting')
  fs.rmSync(dir, { recursive: true, force: true })
})

check('status reads reject permission and hard-link races after the pathname check', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'connector-service-race-'))
  const ops = path.join(dir, 'ops')
  const runnerPath = path.join(dir, 'runner.json')
  const supervisorPath = path.join(ops, 'supervisor.json')
  fs.mkdirSync(ops, { mode: 0o700 })
  fs.writeFileSync(runnerPath, JSON.stringify(heartbeat()))
  fs.writeFileSync(supervisorPath, JSON.stringify(supervisor()), { mode: 0o600 })
  let fired = false
  let out = readConnectorFetchServiceStatus(true, {
    runnerPath, supervisorPath, nowMs: NOW, currentCommit: COMMIT, localHost: 'research-mac-pro',
    statusReadHook: (file, phase) => {
      if (!fired && file === supervisorPath && phase === 'after_lstat') {
        fired = true
        fs.chmodSync(supervisorPath, 0o644)
      }
    },
  })
  assert.equal(out.state, 'starting')

  fs.chmodSync(supervisorPath, 0o600)
  const extraLink = path.join(ops, 'linked-supervisor.json')
  fired = false
  out = readConnectorFetchServiceStatus(true, {
    runnerPath, supervisorPath, nowMs: NOW, currentCommit: COMMIT, localHost: 'research-mac-pro',
    statusReadHook: (file, phase) => {
      if (!fired && file === supervisorPath && phase === 'after_open') {
        fired = true
        fs.linkSync(supervisorPath, extraLink)
      }
    },
  })
  assert.equal(out.state, 'starting')
  fs.rmSync(dir, { recursive: true, force: true })
})

check('each status projection re-resolves PROD HEAD so a fast-forward clears Online immediately', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'connector-service-head-'))
  const ops = path.join(dir, 'ops')
  const runnerPath = path.join(dir, 'runner.json')
  const supervisorPath = path.join(ops, 'supervisor.json')
  fs.mkdirSync(ops, { mode: 0o700 })
  fs.writeFileSync(runnerPath, JSON.stringify(heartbeat()))
  fs.writeFileSync(supervisorPath, JSON.stringify(supervisor()), { mode: 0o600 })
  let head: string | null = COMMIT
  const options = {
    runnerPath, supervisorPath, nowMs: NOW, localHost: 'research-mac-pro',
    resolveCurrentCommit: () => head,
  }
  assert.equal(readConnectorFetchServiceStatus(true, options).state, 'online')
  head = 'c'.repeat(40)
  assert.equal(readConnectorFetchServiceStatus(true, options).state, 'starting')
  head = null
  assert.equal(readConnectorFetchServiceStatus(true, options).state, 'starting')
  fs.rmSync(dir, { recursive: true, force: true })
})

check('pool absence never fabricates Paused without a fenced supervisor certificate', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'connector-service-pool-'))
  const ops = path.join(dir, 'ops')
  const supervisorPath = path.join(ops, 'supervisor.json')
  const runnerPath = path.join(dir, 'runner.json')
  fs.mkdirSync(ops, { mode: 0o700 })
  fs.writeFileSync(runnerPath, JSON.stringify(heartbeat()))
  for (const [state, reason, role, pool, scheduler] of [
    ['disabled_admin', 'admin_role', 'admin', 'ready', 'unloaded'],
    ['blocked_unsafe', 'plist_unsafe', 'unsafe', 'unsafe', 'unsafe'],
    ['foreign_writer', 'foreign_heartbeat', 'doer', 'ready', 'unloaded'],
  ] as const) {
    fs.writeFileSync(supervisorPath, JSON.stringify(supervisor({
      state, reason, role, pool, scheduler, ready: false, auto_retry_armed: false,
    })), { mode: 0o600 })
    assert.equal(readConnectorFetchServiceStatus(false, { runnerPath, supervisorPath, nowMs: NOW, currentCommit: COMMIT, localHost: 'research-mac-pro' }).state, state)
  }
  fs.writeFileSync(supervisorPath, JSON.stringify(supervisor({
    state: 'starting', reason: 'awaiting_heartbeat', ready: false,
  })), { mode: 0o600 })
  let out = readConnectorFetchServiceStatus(false, {
    runnerPath, supervisorPath, nowMs: NOW, currentCommit: COMMIT, localHost: 'research-mac-pro',
  })
  assert.equal(out.state, 'starting')
  assert.equal(out.autoRetryArmed, false)
  assert.match(out.note, /shutdown is not verified/)

  fs.writeFileSync(supervisorPath, JSON.stringify(supervisor()), { mode: 0o600 })
  out = readConnectorFetchServiceStatus(false, {
    runnerPath, supervisorPath, nowMs: NOW, currentCommit: COMMIT, localHost: 'research-mac-pro',
  })
  assert.equal(out.state, 'starting', 'an Online/loaded certificate conflicts with a missing pool')
  assert.equal(out.autoRetryArmed, false)

  fs.rmSync(supervisorPath)
  out = readConnectorFetchServiceStatus(false, {
    runnerPath, supervisorPath, nowMs: NOW, currentCommit: COMMIT, localHost: 'research-mac-pro',
  })
  assert.equal(out.state, 'starting', 'an absent supervisor cannot prove a pause')
  assert.equal(out.autoRetryArmed, false)

  fs.writeFileSync(supervisorPath, JSON.stringify(supervisor({
    state: 'paused_drive', reason: 'drive_unavailable', pool: 'unavailable', scheduler: 'unloaded',
    ready: false, auto_retry_armed: false,
  })), { mode: 0o600 })
  out = readConnectorFetchServiceStatus(false, {
    runnerPath, supervisorPath, nowMs: NOW, currentCommit: COMMIT, localHost: 'research-mac-pro',
  })
  assert.equal(out.state, 'paused_drive', 'only an explicitly fenced supervisor may certify Paused')
  fs.rmSync(dir, { recursive: true, force: true })
})

check('failed and invalid heartbeat reasons are explicit Starting states', () => {
  for (const [reason, word] of [
    ['heartbeat_failed', /failed/], ['heartbeat_invalid', /invalid/], ['heartbeat_stale', /stale/],
  ] as const) {
    const sup = parseConnectorSupervisor(supervisor({ state: 'starting', reason, ready: false }))
    const out = classifyConnectorService(sup, parseRunnerHeartbeat(heartbeat()), NOW, COMMIT, 'research-mac-pro')
    assert.equal(out.state, 'starting')
    assert.match(out.note, word)
  }
})

console.log(`connector-service-status.test.ts: ${passed} checks passed`)
