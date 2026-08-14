import { createHash, randomBytes } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { acquireRetainedFlockSync, releaseRetainedFlock } from './singleton-lock'

const REGISTRY_FILE = 'engine-child-leases.json'
const USED_FILE = 'engine-child-leases.used'
const LOCK_FILE = 'engine-child-leases.flock'
const VERSION = 1 as const
const TOKEN_RE = /^child-v1:[a-f0-9]{64}$/
const RUN_ID_RE = /^[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i
const SWARM_RE = /^[a-z0-9][a-z0-9-]{0,39}$/
const CONTROL_RE = /[\x00-\x1f\x7f]/
const ENTRY_KEYS = [
  'token', 'run_id', 'swarm', 'subject', 'phase', 'owner_pid', 'owner_start_id', 'reserved_at',
  'pid', 'pgid', 'child_start_id', 'armed_executable_id',
] as const

export interface ProcessBirthIdentity {
  pid: number
  pgid: number
  state: string
  startId: string
  executableId: string
}

export type Liveness = 'alive' | 'dead' | 'unknown'

export interface EngineChildLeaseRuntime {
  ownerPid: number
  inspect(pid: number): ProcessBirthIdentity | null
  processAlive(pid: number): Liveness
  groupAlive(pgid: number): Liveness
  signalGroup(pgid: number, signal: NodeJS.Signals): void
  now(): number
  token(): string
  pauseSync(ms: number): void
  sleep(ms: number): Promise<void>
}

export interface EngineChildLease {
  token: string
  run_id: string
  swarm: string
  subject: string
  phase: 'reserved' | 'active'
  owner_pid: number
  owner_start_id: string
  reserved_at: string
  pid: number | null
  pgid: number | null
  child_start_id: string | null
  armed_executable_id: string | null
}

interface LeaseState { version: typeof VERSION; entries: EngineChildLease[] }

export class EngineChildLeaseError extends Error {
  statusCode: number
  body: { code: string; reason: string; detail?: string }

  constructor(code: 'engine_child_lease_unavailable' | 'engine_child_still_running', message: string, detail?: string) {
    super(message)
    this.name = 'EngineChildLeaseError'
    this.statusCode = code === 'engine_child_still_running' ? 409 : 503
    this.body = { code, reason: code === 'engine_child_still_running' ? 'orphan_process_group_alive' : 'lease_registry_unsafe', ...(detail ? { detail } : {}) }
  }
}

function positivePid(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 1 && value <= 2 ** 31 - 1
}

function exactKeys(value: Record<string, unknown>, keys: readonly string[]): boolean {
  const actual = Object.keys(value).sort()
  return actual.length === keys.length && [...keys].sort().every((key, index) => actual[index] === key)
}

function validText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= max && !CONTROL_RE.test(value)
}

function validLease(value: unknown): value is EngineChildLease {
  if (!value || typeof value !== 'object' || Array.isArray(value) || !exactKeys(value as Record<string, unknown>, ENTRY_KEYS)) return false
  const row = value as EngineChildLease
  const reservedMs = Date.parse(row.reserved_at)
  if (!TOKEN_RE.test(row.token) || !RUN_ID_RE.test(row.run_id) || !SWARM_RE.test(row.swarm)
      || !validText(row.subject, 160) || !positivePid(row.owner_pid) || !validText(row.owner_start_id, 512)
      || !Number.isFinite(reservedMs) || new Date(reservedMs).toISOString() !== row.reserved_at
      || !['reserved', 'active'].includes(row.phase)) return false
  if (row.phase === 'reserved') {
    return row.pid === null && row.pgid === null && row.child_start_id === null && row.armed_executable_id === null
  }
  return positivePid(row.pid) && positivePid(row.pgid) && row.pid === row.pgid
    && validText(row.child_start_id, 512) && validText(row.armed_executable_id, 512)
}

function strictState(value: unknown): LeaseState | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)
      || !exactKeys(value as Record<string, unknown>, ['version', 'entries'])) return null
  const state = value as LeaseState
  if (state.version !== VERSION || !Array.isArray(state.entries) || !state.entries.every(validLease)) return null
  const tokens = new Set<string>()
  for (const entry of state.entries) {
    if (tokens.has(entry.token)) return null
    tokens.add(entry.token)
  }
  return state
}

function sha256(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

function linuxIdentity(pid: number): ProcessBirthIdentity | null {
  try {
    const stat = fs.readFileSync(`/proc/${pid}/stat`, 'utf8')
    const close = stat.lastIndexOf(')')
    if (close < 1) return null
    const fields = stat.slice(close + 2).trim().split(/\s+/)
    const pgid = Number(fields[2])
    const state = fields[0]
    const startTicks = fields[19]
    const bootId = fs.readFileSync('/proc/sys/kernel/random/boot_id', 'utf8').trim()
    const executable = fs.realpathSync(`/proc/${pid}/exe`)
    if (!positivePid(pgid) || !state || !startTicks || !bootId || !executable) return null
    return {
      pid, pgid, state,
      startId: `linux:${bootId}:${startTicks}`,
      executableId: `sha256:${sha256(executable)}`,
    }
  } catch { return null }
}

function psField(pid: number, field: string): string | null {
  try {
    const value = execFileSync('ps', ['-p', String(pid), '-o', `${field}=`], {
      encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024,
    }).trim()
    return value || null
  } catch { return null }
}

function psIdentity(pid: number): ProcessBirthIdentity | null {
  const pgid = Number(psField(pid, 'pgid'))
  const state = psField(pid, 'stat')
  const started = psField(pid, 'lstart')
  const executable = psField(pid, 'comm')
  if (!positivePid(pgid) || !state || !started || !executable) return null
  return {
    pid, pgid, state,
    // macOS ps exposes the kernel process birth wall-clock to whole seconds. Pair it with the boot-scoped
    // PID/PGID and executable hash below; this is the strongest dependency-free local identity available.
    startId: `${process.platform}:${started}`,
    executableId: `sha256:${sha256(executable)}`,
  }
}

function defaultInspect(pid: number): ProcessBirthIdentity | null {
  return process.platform === 'linux' ? linuxIdentity(pid) : psIdentity(pid)
}

function killProbe(pid: number): Liveness {
  try { process.kill(pid, 0); return 'alive' } catch (error: any) {
    if (error?.code === 'ESRCH') return 'dead'
    if (error?.code === 'EPERM') return 'alive'
    return 'unknown'
  }
}

const pauseArray = new Int32Array(new SharedArrayBuffer(4))
const defaultRuntime = (): EngineChildLeaseRuntime => ({
  ownerPid: process.pid,
  inspect: defaultInspect,
  processAlive: (pid) => killProbe(pid),
  groupAlive: (pgid) => killProbe(-pgid),
  signalGroup: (pgid, signal) => { process.kill(-pgid, signal) },
  now: Date.now,
  token: () => `child-v1:${randomBytes(32).toString('hex')}`,
  pauseSync: (ms) => { Atomics.wait(pauseArray, 0, 0, Math.max(0, ms)) },
  sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
})

export class EngineChildLeaseRegistry {
  private readonly registryPath: string
  private readonly usedPath: string
  private readonly lockPath: string
  private readonly runtime: EngineChildLeaseRuntime
  private readonly ownerStartId: string

  constructor(private readonly stateDir: string, runtime: EngineChildLeaseRuntime = defaultRuntime()) {
    this.registryPath = path.join(stateDir, REGISTRY_FILE)
    this.usedPath = path.join(stateDir, USED_FILE)
    this.lockPath = path.join(stateDir, LOCK_FILE)
    this.runtime = runtime
    const owner = runtime.inspect(runtime.ownerPid)
    if (!owner || owner.pid !== runtime.ownerPid || !validText(owner.startId, 512)) {
      throw new EngineChildLeaseError('engine_child_lease_unavailable',
        'The server process identity could not be verified, so paid engine launches are disabled.')
    }
    this.ownerStartId = owner.startId
  }

  private unsafe(detail: string): never {
    throw new EngineChildLeaseError(
      'engine_child_lease_unavailable',
      'The durable engine child-process registry is missing or unreadable after prior use. No paid launch was started.',
      detail,
    )
  }

  private verifyStateDir(): void {
    try {
      fs.mkdirSync(this.stateDir, { recursive: true, mode: 0o700 })
      const stat = fs.lstatSync(this.stateDir)
      if (!stat.isDirectory() || stat.isSymbolicLink()) this.unsafe('state directory is not a real directory')
    } catch (error: any) {
      if (error instanceof EngineChildLeaseError) throw error
      this.unsafe(`state directory unavailable: ${String(error?.message || error)}`)
    }
  }

  /** Every registry decision is one kernel-fenced transaction. The stable lock inode is retained by
   * the Node process's descriptor until the callback returns; a crash releases it automatically. */
  private withLock<T>(fn: () => T): T {
    this.verifyStateDir()
    let lock: number | null = null
    try {
      lock = acquireRetainedFlockSync(this.lockPath, {
        waitMs: 5_000,
        busyMessage: 'engine child-process admission is being reconciled by another server',
      })
      const descriptor = fs.fstatSync(lock)
      const pathname = fs.lstatSync(this.lockPath)
      if (!descriptor.isFile() || !pathname.isFile() || pathname.isSymbolicLink()
          || descriptor.dev !== pathname.dev || descriptor.ino !== pathname.ino) {
        this.unsafe('process-registry lock inode changed during acquisition')
      }
      return fn()
    } catch (error: any) {
      if (error instanceof EngineChildLeaseError) throw error
      throw new EngineChildLeaseError(
        'engine_child_lease_unavailable',
        'The durable engine child-process registry could not be locked safely. No paid launch was started.',
        error?.code === 'EBUSY' ? 'another server retained the registry lock too long' : String(error?.message || error),
      )
    } finally {
      if (lock !== null) releaseRetainedFlock(lock)
    }
  }

  private regularFile(file: string): boolean {
    try {
      const stat = fs.lstatSync(file)
      if (!stat.isFile() || stat.isSymbolicLink()) this.unsafe(`${path.basename(file)} is not a regular file`)
      const max = file === this.usedPath ? 128 : 2 * 1024 * 1024
      if (stat.size > max) this.unsafe(`${path.basename(file)} exceeds its safety limit`)
      return true
    } catch (error: any) {
      if (error?.code === 'ENOENT') return false
      this.unsafe(`cannot inspect ${path.basename(file)}`)
    }
  }

  private readUnlocked(): LeaseState {
    this.verifyStateDir()
    const used = this.regularFile(this.usedPath)
    const registry = this.regularFile(this.registryPath)
    if (!used && !registry) return { version: VERSION, entries: [] }
    if (used !== registry) this.unsafe(used ? 'registry missing after use' : 'registry has no use witness')
    try {
      if (fs.readFileSync(this.usedPath, 'utf8') !== 'engine-child-leases/v1\n') this.unsafe('invalid use witness')
      const parsed = strictState(JSON.parse(fs.readFileSync(this.registryPath, 'utf8')))
      if (!parsed) this.unsafe('invalid registry schema')
      return parsed
    } catch (error: any) {
      if (error instanceof EngineChildLeaseError) throw error
      this.unsafe(`registry parse failed: ${String(error?.message || error)}`)
    }
  }

  private atomicWrite(file: string, bytes: string): void {
    const temp = path.join(this.stateDir, `.${path.basename(file)}.${process.pid}.${randomBytes(8).toString('hex')}.tmp`)
    let fd: number | undefined
    try {
      fd = fs.openSync(temp, 'wx', 0o600)
      fs.writeFileSync(fd, bytes, 'utf8')
      fs.fsyncSync(fd)
      fs.closeSync(fd); fd = undefined
      fs.renameSync(temp, file)
      try {
        const dir = fs.openSync(this.stateDir, 'r')
        try { fs.fsyncSync(dir) } finally { fs.closeSync(dir) }
      } catch { /* directory fsync is unavailable on some filesystems; file+rename remains atomic */ }
    } catch (error) {
      if (fd !== undefined) try { fs.closeSync(fd) } catch {}
      try { fs.unlinkSync(temp) } catch {}
      throw error
    }
  }

  private writeUnlocked(state: LeaseState): void {
    this.verifyStateDir()
    try {
      this.atomicWrite(this.registryPath, JSON.stringify(state) + '\n')
      if (!this.regularFile(this.usedPath)) this.atomicWrite(this.usedPath, 'engine-child-leases/v1\n')
    } catch (error: any) {
      if (error instanceof EngineChildLeaseError) throw error
      this.unsafe(`registry write failed: ${String(error?.message || error)}`)
    }
  }

  private ownerStatus(entry: EngineChildLease): 'current' | 'alive' | 'dead' | 'unknown' {
    const liveness = this.runtime.processAlive(entry.owner_pid)
    if (liveness === 'dead') return 'dead'
    if (liveness === 'unknown') return 'unknown'
    const identity = this.runtime.inspect(entry.owner_pid)
    if (!identity) return 'unknown'
    if (identity.startId !== entry.owner_start_id) return 'dead' // PID reuse, not the recorded owner
    return entry.owner_pid === this.runtime.ownerPid && entry.owner_start_id === this.ownerStartId ? 'current' : 'alive'
  }

  private activeStatus(entry: EngineChildLease): 'alive' | 'dead' | 'mismatch' | 'unknown' | 'abandoned-armed' {
    if (entry.phase !== 'active' || !entry.pid || !entry.pgid || !entry.child_start_id || !entry.armed_executable_id) return 'unknown'
    const group = this.runtime.groupAlive(entry.pgid)
    if (group !== 'alive') return group
    const leader = this.runtime.processAlive(entry.pid)
    if (leader === 'dead') return 'alive' // the original group survives in descendants; its PGID cannot be reused yet
    if (leader === 'unknown') return 'unknown'
    const identity = this.runtime.inspect(entry.pid)
    if (!identity) return 'unknown'
    if (identity.pgid !== entry.pgid || identity.startId !== entry.child_start_id) return 'mismatch'
    const owner = this.ownerStatus(entry)
    if (/T/.test(identity.state) && identity.executableId === entry.armed_executable_id
        && owner !== 'current' && owner !== 'alive') return 'abandoned-armed'
    return 'alive'
  }

  private reconcileUnlocked(
    state: LeaseState,
    swarm: string,
    subject: string,
    locallyOwnedTokens: ReadonlySet<string>,
  ): { state: LeaseState; blocked: EngineChildLease | null; changed: boolean } {
    const keep: EngineChildLease[] = []
    let blocked: EngineChildLease | null = null
    for (const entry of state.entries) {
      const owner = this.ownerStatus(entry)
      if (owner === 'current' && locallyOwnedTokens.has(entry.token)) { keep.push(entry); continue }
      if (entry.phase === 'reserved') {
        if (owner === 'dead') continue // old server died before the stopped wrapper could begin paid work
        if (owner === 'unknown') this.unsafe(`cannot verify owner of reserved run ${entry.run_id}`)
        keep.push(entry)
        if (entry.swarm === swarm && entry.subject === subject) blocked = entry
        continue
      }
      let status = this.activeStatus(entry)
      if (status === 'abandoned-armed') {
        try { this.runtime.signalGroup(entry.pgid!, 'SIGKILL') } catch { /* the follow-up probe decides */ }
        for (let waited = 0; waited < 500 && this.runtime.groupAlive(entry.pgid!) === 'alive'; waited += 10) {
          this.runtime.pauseSync(10)
        }
        status = this.runtime.groupAlive(entry.pgid!) === 'dead' ? 'dead' : 'alive'
      }
      if (status === 'dead' || status === 'mismatch') continue
      if (status === 'unknown') this.unsafe(`cannot verify process group ${entry.pgid} for run ${entry.run_id}`)
      keep.push(entry)
      if (entry.swarm === swarm && entry.subject === subject) blocked = entry
    }
    return {
      state: keep.length === state.entries.length ? state : { version: VERSION, entries: keep },
      blocked,
      changed: keep.length !== state.entries.length,
    }
  }

  private throwBlocked(subject: string, blocked: EngineChildLease): never {
    const group = blocked.pgid ? `process group ${blocked.pgid}` : 'an unretired launch reservation'
    throw new EngineChildLeaseError(
      'engine_child_still_running',
      `${subject} still has ${group} from an earlier server. Another paid engine run will wait until it exits.`,
      blocked.run_id,
    )
  }

  /** Reconcile only previous-server leases. Tokens belonging to this live process remain governed by the
   * in-memory dependency-aware admission rules and may validly share a subject. */
  assertSubjectAvailable(swarm: string, subject: string, locallyOwnedTokens: ReadonlySet<string> = new Set()): void {
    this.withLock(() => {
      const reconciled = this.reconcileUnlocked(this.readUnlocked(), swarm, subject, locallyOwnedTokens)
      if (reconciled.changed) this.writeUnlocked(reconciled.state)
      if (reconciled.blocked) this.throwBlocked(subject, reconciled.blocked)
    })
  }

  reserve(
    input: { runId: string; swarm: string; subject: string },
    locallyOwnedTokens: ReadonlySet<string> = new Set(),
  ): EngineChildLease {
    if (!RUN_ID_RE.test(input.runId) || !SWARM_RE.test(input.swarm) || !validText(input.subject, 160)) {
      this.unsafe('invalid launch reservation identity')
    }
    return this.withLock(() => {
      // Reconcile, reject a live same-subject lease, and append the new claim while retaining ONE flock.
      // This is the paid-admission authority; a preceding assertSubjectAvailable() is diagnostic only.
      const reconciled = this.reconcileUnlocked(
        this.readUnlocked(), input.swarm, input.subject, locallyOwnedTokens,
      )
      if (reconciled.changed) this.writeUnlocked(reconciled.state)
      if (reconciled.blocked) this.throwBlocked(input.subject, reconciled.blocked)
      const token = this.runtime.token()
      if (!TOKEN_RE.test(token) || reconciled.state.entries.some((entry) => entry.token === token)) {
        this.unsafe('invalid or duplicate lease token')
      }
      const lease: EngineChildLease = {
        token, run_id: input.runId, swarm: input.swarm, subject: input.subject, phase: 'reserved',
        owner_pid: this.runtime.ownerPid, owner_start_id: this.ownerStartId,
        reserved_at: new Date(this.runtime.now()).toISOString(),
        pid: null, pgid: null, child_start_id: null, armed_executable_id: null,
      }
      this.writeUnlocked({ version: VERSION, entries: [...reconciled.state.entries, lease] })
      return lease
    })
  }

  activate(token: string, pid: number, pgid: number): EngineChildLease {
    if (!TOKEN_RE.test(token) || !positivePid(pid) || pid !== pgid) this.unsafe('invalid child activation identity')
    return this.withLock(() => {
      const state = this.readUnlocked()
      const index = state.entries.findIndex((entry) => entry.token === token)
      if (index < 0 || state.entries[index].phase !== 'reserved') this.unsafe('launch reservation disappeared before child activation')
      const identity = this.runtime.inspect(pid)
      if (!identity || identity.pid !== pid || identity.pgid !== pgid
          || this.runtime.processAlive(pid) !== 'alive' || this.runtime.groupAlive(pgid) !== 'alive') {
        this.unsafe('spawned process group identity could not be verified')
      }
      const active: EngineChildLease = {
        ...state.entries[index], phase: 'active', pid, pgid,
        child_start_id: identity.startId, armed_executable_id: identity.executableId,
      }
      const entries = [...state.entries]; entries[index] = active
      this.writeUnlocked({ version: VERSION, entries })
      return active
    })
  }

  waitUntilStopped(lease: EngineChildLease, timeoutMs = 2_000): boolean {
    if (lease.phase !== 'active' || !lease.pid || !lease.child_start_id) return false
    const deadline = this.runtime.now() + timeoutMs
    do {
      const identity = this.runtime.inspect(lease.pid)
      if (!identity || identity.startId !== lease.child_start_id || identity.pgid !== lease.pgid) return false
      if (/T/.test(identity.state)) return true
      this.runtime.pauseSync(5)
    } while (this.runtime.now() < deadline)
    return false
  }

  releaseReservation(token: string): boolean {
    return this.withLock(() => {
      const state = this.readUnlocked()
      const target = state.entries.find((entry) => entry.token === token)
      if (!target || target.phase !== 'reserved') return false
      this.writeUnlocked({ version: VERSION, entries: state.entries.filter((entry) => entry.token !== token) })
      return true
    })
  }

  /** Close callbacks are fenced by the exact token. A leader close does not release a still-live descendant
   * group; the next admission keeps blocking until that group actually disappears. */
  releaseAfterClose(token: string): boolean {
    return this.withLock(() => {
      const state = this.readUnlocked()
      const target = state.entries.find((entry) => entry.token === token)
      if (!target || target.phase !== 'active') return false
      const status = this.activeStatus(target)
      if (status === 'alive' || status === 'unknown' || status === 'abandoned-armed') return false
      this.writeUnlocked({ version: VERSION, entries: state.entries.filter((entry) => entry.token !== token) })
      return true
    })
  }

  async terminateAll(graceMs = 1_200): Promise<void> {
    const active = this.withLock(() => {
      // Shutdown owns only children fenced by this exact server birth identity. A shared state directory
      // may also contain a healthy child belonging to another live server; never signal that process.
      const targets = this.readUnlocked().entries.filter((entry) => entry.phase === 'active' && entry.pgid
        && entry.owner_pid === this.runtime.ownerPid && entry.owner_start_id === this.ownerStartId)
      for (const entry of targets) {
        if (['alive', 'abandoned-armed'].includes(this.activeStatus(entry))) {
          try { this.runtime.signalGroup(entry.pgid!, 'SIGTERM') } catch {}
        }
      }
      return targets.map((entry) => ({ ...entry }))
    })
    if (graceMs > 0) await this.runtime.sleep(graceMs)
    this.withLock(() => {
      const current = this.readUnlocked()
      for (const prior of active) {
        const entry = current.entries.find((candidate) => candidate.token === prior.token)
        if (!entry || entry.phase !== 'active' || entry.pid !== prior.pid || entry.pgid !== prior.pgid
            || entry.child_start_id !== prior.child_start_id) continue
        if (['alive', 'abandoned-armed'].includes(this.activeStatus(entry))) {
          try { this.runtime.signalGroup(entry.pgid!, 'SIGKILL') } catch {}
        }
      }
    })
  }

  /** Focused-test/read-only diagnostics. Production admission uses the strict methods above. */
  entries(): EngineChildLease[] {
    return this.withLock(() => this.readUnlocked().entries.map((entry) => ({ ...entry })))
  }
}
