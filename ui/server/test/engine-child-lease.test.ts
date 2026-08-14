import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import {
  EngineChildLeaseError,
  EngineChildLeaseRegistry,
  type EngineChildLeaseRuntime,
  type Liveness,
  type ProcessBirthIdentity,
} from '../src/engine-child-lease'

interface FakeSystem {
  processes: Map<number, ProcessBirthIdentity>
  processLiveness: Map<number, Liveness>
  groupLiveness: Map<number, Liveness>
  signals: Array<{ pgid: number; signal: NodeJS.Signals }>
  now: number
  nextToken: number
}

function fakeSystem(): FakeSystem {
  return {
    processes: new Map(), processLiveness: new Map(), groupLiveness: new Map(), signals: [],
    now: Date.parse('2026-08-14T00:00:00.000Z'), nextToken: 0,
  }
}

function addProcess(
  system: FakeSystem,
  pid: number,
  startId: string,
  options: { pgid?: number; state?: string; executableId?: string } = {},
): void {
  system.processes.set(pid, {
    pid,
    pgid: options.pgid ?? pid,
    state: options.state ?? 'S',
    startId,
    executableId: options.executableId ?? `sha256:${String(pid).padStart(64, '0')}`,
  })
  system.processLiveness.set(pid, 'alive')
}

function fakeRuntime(system: FakeSystem, ownerPid: number): EngineChildLeaseRuntime {
  return {
    ownerPid,
    inspect: (pid) => {
      const value = system.processes.get(pid)
      return value ? { ...value } : null
    },
    processAlive: (pid) => system.processLiveness.get(pid) ?? 'dead',
    groupAlive: (pgid) => system.groupLiveness.get(pgid) ?? 'dead',
    signalGroup: (pgid, signal) => { system.signals.push({ pgid, signal }) },
    now: () => system.now,
    token: () => `child-v1:${(++system.nextToken).toString(16).padStart(64, '0')}`,
    pauseSync: (ms) => { system.now += ms },
    sleep: async (ms) => { system.now += ms },
  }
}

function tempDir(label: string, cleanup: string[]): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `engine-child-${label}-`))
  cleanup.push(dir)
  return dir
}

function assertLeaseError(fn: () => unknown, code: string): EngineChildLeaseError {
  let caught: unknown
  try { fn() } catch (error) { caught = error }
  assert.ok(caught instanceof EngineChildLeaseError, `expected EngineChildLeaseError, got ${String(caught)}`)
  assert.equal(caught.body.code, code)
  return caught
}

async function waitFor(predicate: () => boolean, label: string, timeoutMs = 12_000): Promise<void> {
  const deadline = Date.now() + timeoutMs
  while (!predicate()) {
    if (Date.now() >= deadline) throw new Error(`timed out waiting for ${label}`)
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
}

const cleanup: string[] = []
const racers: ChildProcessWithoutNullStreams[] = []
try {
  // A fresh server sees the exact old child birth identity and blocks while any member of its detached
  // process group remains. Once the group is dead, reconciliation retires the lease and admits normally.
  {
    const dir = tempDir('orphan', cleanup)
    const system = fakeSystem()
    addProcess(system, 101, 'owner-old')
    addProcess(system, 201, 'child-old', { pgid: 201, state: 'S', executableId: 'sha256:armed-old' })
    system.groupLiveness.set(201, 'alive')
    const oldServer = new EngineChildLeaseRegistry(dir, fakeRuntime(system, 101))
    const lease = oldServer.reserve({ runId: randomUUID(), swarm: 'research', subject: 'HAIER' })
    oldServer.activate(lease.token, 201, 201)

    system.processLiveness.set(101, 'dead')
    addProcess(system, 102, 'owner-new')
    const freshServer = new EngineChildLeaseRegistry(dir, fakeRuntime(system, 102))
    const blocked = assertLeaseError(
      () => freshServer.assertSubjectAvailable('research', 'HAIER'),
      'engine_child_still_running',
    )
    assert.match(blocked.message, /process group 201/)

    system.processLiveness.set(201, 'dead')
    system.groupLiveness.set(201, 'dead')
    freshServer.assertSubjectAvailable('research', 'HAIER')
    assert.deepEqual(freshServer.entries(), [], 'a dead orphan group is durably retired')
  }

  // A live process at the old PID/PGID is not enough: a changed kernel birth identity proves PID reuse,
  // so the stale fence is retired instead of blocking an unrelated process forever.
  {
    const dir = tempDir('pid-reuse', cleanup)
    const system = fakeSystem()
    addProcess(system, 111, 'owner-before-restart')
    addProcess(system, 211, 'child-original', { pgid: 211 })
    system.groupLiveness.set(211, 'alive')
    const oldServer = new EngineChildLeaseRegistry(dir, fakeRuntime(system, 111))
    const lease = oldServer.reserve({ runId: randomUUID(), swarm: 'research', subject: 'DHER' })
    oldServer.activate(lease.token, 211, 211)

    system.processLiveness.set(111, 'dead')
    addProcess(system, 112, 'owner-after-restart')
    addProcess(system, 211, 'unrelated-reused-pid', { pgid: 211 })
    const freshServer = new EngineChildLeaseRegistry(dir, fakeRuntime(system, 112))
    freshServer.assertSubjectAvailable('research', 'DHER')
    assert.deepEqual(freshServer.entries(), [], 'PID reuse cannot impersonate the fenced child')
  }

  // Close/release is exact-token CAS: a duplicated callback from an old process cannot remove the newer
  // replacement reservation, and unrelated rows survive every read-modify-write transaction.
  {
    const dir = tempDir('stale-callback', cleanup)
    const system = fakeSystem()
    addProcess(system, 121, 'owner-current')
    addProcess(system, 221, 'first-child', { pgid: 221 })
    system.groupLiveness.set(221, 'alive')
    const registry = new EngineChildLeaseRegistry(dir, fakeRuntime(system, 121))
    const oldLease = registry.reserve({ runId: randomUUID(), swarm: 'research', subject: 'UBER' })
    registry.activate(oldLease.token, 221, 221)
    system.processLiveness.set(221, 'dead')
    system.groupLiveness.set(221, 'dead')
    assert.equal(registry.releaseAfterClose(oldLease.token), true)
    const unrelated = registry.reserve({ runId: randomUUID(), swarm: 'research', subject: 'SMPL' })
    const replacement = registry.reserve(
      { runId: randomUUID(), swarm: 'research', subject: 'UBER' },
      new Set([unrelated.token]),
    )
    assert.equal(registry.releaseAfterClose(oldLease.token), false)
    assert.equal(registry.releaseReservation(oldLease.token), false)
    assert.deepEqual(new Set(registry.entries().map((entry) => entry.token)), new Set([unrelated.token, replacement.token]))
  }

  // Once the registry has been used, corrupt or missing authority is a hard 503 and is never overwritten
  // with a fresh empty ledger that could reopen paid admission.
  {
    const corruptDir = tempDir('corrupt', cleanup)
    const system = fakeSystem()
    addProcess(system, 131, 'owner-corrupt')
    const registry = new EngineChildLeaseRegistry(corruptDir, fakeRuntime(system, 131))
    registry.reserve({ runId: randomUUID(), swarm: 'research', subject: 'CORRUPT' })
    const registryFile = path.join(corruptDir, 'engine-child-leases.json')
    fs.writeFileSync(registryFile, '{bad')
    assertLeaseError(() => registry.entries(), 'engine_child_lease_unavailable')
    assert.equal(fs.readFileSync(registryFile, 'utf8'), '{bad')

    const missingDir = tempDir('missing', cleanup)
    addProcess(system, 132, 'owner-missing')
    const missing = new EngineChildLeaseRegistry(missingDir, fakeRuntime(system, 132))
    missing.reserve({ runId: randomUUID(), swarm: 'research', subject: 'MISSING' })
    fs.unlinkSync(path.join(missingDir, 'engine-child-leases.json'))
    assertLeaseError(
      () => missing.reserve({ runId: randomUUID(), swarm: 'research', subject: 'MISSING' }),
      'engine_child_lease_unavailable',
    )
    assert.equal(fs.existsSync(path.join(missingDir, 'engine-child-leases.json')), false)
  }

  // Graceful shutdown signals only groups owned by this exact server birth identity. A second live
  // server's durable entry in the shared registry is preserved and never receives TERM/KILL.
  {
    const dir = tempDir('shutdown-owner', cleanup)
    const system = fakeSystem()
    addProcess(system, 141, 'owner-one')
    addProcess(system, 142, 'owner-two')
    addProcess(system, 241, 'child-one', { pgid: 241 })
    addProcess(system, 242, 'child-two', { pgid: 242 })
    system.groupLiveness.set(241, 'alive')
    system.groupLiveness.set(242, 'alive')
    const one = new EngineChildLeaseRegistry(dir, fakeRuntime(system, 141))
    const first = one.reserve({ runId: randomUUID(), swarm: 'research', subject: 'ONE' })
    one.activate(first.token, 241, 241)
    const two = new EngineChildLeaseRegistry(dir, fakeRuntime(system, 142))
    const second = two.reserve({ runId: randomUUID(), swarm: 'research', subject: 'TWO' })
    two.activate(second.token, 242, 242)

    await one.terminateAll(0)
    assert.deepEqual(system.signals, [
      { pgid: 241, signal: 'SIGTERM' },
      { pgid: 241, signal: 'SIGKILL' },
    ])
    assert.deepEqual(new Set(one.entries().map((entry) => entry.token)), new Set([first.token, second.token]),
      'shutdown does not retire leases, so saved-result recovery remains exact')
  }

  // Two independent Node processes begin from the same diagnostic preflight and race the authoritative
  // reserve. The retained flock makes reconcile+claim indivisible: exactly one wins, and a pre-existing
  // unrelated row is not lost to last-writer-wins.
  {
    const dir = tempDir('process-race', cleanup)
    const seed = new EngineChildLeaseRegistry(dir)
    const unrelated = seed.reserve({ runId: randomUUID(), swarm: 'research', subject: 'UNRELATED' })
    const barrier = path.join(dir, 'race.go')
    const release = path.join(dir, 'winner.release')
    const moduleUrl = pathToFileURL(path.join(process.cwd(), 'src', 'engine-child-lease.ts')).href
    const childCode = `
      import fs from 'node:fs';
      import { EngineChildLeaseRegistry } from ${JSON.stringify(moduleUrl)};
      const pause = new Int32Array(new SharedArrayBuffer(4));
      const waitFor = (file) => { while (!fs.existsSync(file)) Atomics.wait(pause, 0, 0, 5); };
      const registry = new EngineChildLeaseRegistry(process.env.RACE_DIR);
      fs.writeFileSync(process.env.RACE_READY, 'ready\\n');
      waitFor(process.env.RACE_BARRIER);
      try {
        const lease = registry.reserve({
          runId: process.env.RACE_RUN_ID, swarm: 'research', subject: 'RACE',
        });
        console.log('CLAIM ' + lease.token);
        waitFor(process.env.RACE_RELEASE);
      } catch (error) {
        console.log('BLOCK ' + String(error?.body?.code || error?.message || error));
      }
    `
    const outputs = ['', '']
    const errors = ['', '']
    const exits: Array<Promise<number | null>> = []
    for (let index = 0; index < 2; index++) {
      const ready = path.join(dir, `ready-${index}`)
      const child = spawn(process.execPath, ['--import', 'tsx', '--input-type=module', '-e', childCode], {
        cwd: process.cwd(),
        env: {
          ...process.env,
          RACE_DIR: dir,
          RACE_READY: ready,
          RACE_BARRIER: barrier,
          RACE_RELEASE: release,
          RACE_RUN_ID: randomUUID(),
        },
      })
      racers.push(child)
      child.stdout.setEncoding('utf8')
      child.stderr.setEncoding('utf8')
      child.stdout.on('data', (chunk) => { outputs[index] += String(chunk) })
      child.stderr.on('data', (chunk) => { errors[index] += String(chunk) })
      exits.push(new Promise((resolve, reject) => {
        child.once('error', reject)
        child.once('close', resolve)
      }))
    }
    await waitFor(
      () => fs.existsSync(path.join(dir, 'ready-0')) && fs.existsSync(path.join(dir, 'ready-1')),
      'both Node racers to reach the barrier',
    )
    fs.writeFileSync(barrier, 'go\n')
    await waitFor(
      () => outputs.filter((output) => /CLAIM /.test(output)).length === 1
        && outputs.filter((output) => /BLOCK engine_child_still_running/.test(output)).length === 1,
      `one claim and one block (${JSON.stringify(outputs)}; ${JSON.stringify(errors)})`,
    )
    fs.writeFileSync(release, 'release\n')
    assert.deepEqual(await Promise.all(exits), [0, 0], errors.join('\n'))
    assert.equal(outputs.filter((output) => /CLAIM /.test(output)).length, 1)
    assert.equal(outputs.filter((output) => /BLOCK engine_child_still_running/.test(output)).length, 1)
    const rows = seed.entries()
    assert.equal(rows.length, 2, 'the winner and unrelated pre-existing row are both durable')
    assert.ok(rows.some((entry) => entry.token === unrelated.token), 'the race never loses an unrelated row')
  }

  // Pin the narrow production wiring without importing server.ts (which would start listeners and loops).
  const launcher = fs.readFileSync(path.join(process.cwd(), 'src', 'launcher.ts'), 'utf8')
  const spawnAt = launcher.indexOf("child = execa('/bin/sh', ['-c', 'kill -STOP \"$$\"; exec \"$@\"'")
  const activateAt = launcher.indexOf('engineChildLeaseRegistry().activate(', spawnAt)
  const continueAt = launcher.indexOf("process.kill(-child.pid, 'SIGCONT')", activateAt)
  assert.ok(spawnAt >= 0 && activateAt > spawnAt && continueAt > activateAt,
    'the detached wrapper stops before paid exec and continues only after durable PID/PGID activation')
  assert.match(launcher, /reserve\(\{[\s\S]*?runId: run\.runId, swarm: swarmId, subject: subjectId,[\s\S]*?\}, locallyOwnedEngineChildTokens\(\)\)/,
    'the authoritative reserve receives exact local tokens and performs the atomic same-subject claim')
  const shutdownStart = launcher.indexOf('export async function terminateEngineChildrenForShutdown()')
  const shutdownEnd = launcher.indexOf('\n/** Stop ONE subject', shutdownStart)
  assert.ok(shutdownStart >= 0 && shutdownEnd > shutdownStart)
  const shutdown = launcher.slice(shutdownStart, shutdownEnd)
  assert.match(shutdown, /engineChildLeaseRegistry\(\)\.terminateAll\(\)/)
  assert.doesNotMatch(shutdown, /cancel\(|\.aborted/,
    'restart shutdown signals groups without recording a deliberate user abort')
  const server = fs.readFileSync(path.join(process.cwd(), 'src', 'server.ts'), 'utf8')
  const childDrainAt = server.indexOf('await terminateEngineChildrenForShutdown()')
  const appCloseAt = server.indexOf('await app.close()', childDrainAt)
  assert.ok(childDrainAt >= 0 && appCloseAt > childDrainAt,
    'graceful server shutdown drains owned detached groups before process exit')

  console.log('durable engine child leases are flocked, restart-safe, owner-exact and race-safe: ok')
} finally {
  for (const child of racers) {
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL')
  }
  for (const dir of cleanup) fs.rmSync(dir, { recursive: true, force: true })
}
