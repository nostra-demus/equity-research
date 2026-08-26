import fs from 'node:fs'
import path from 'node:path'
import { spawn, spawnSync } from 'node:child_process'

const FLOCK_LEASE_PROGRAM = [
  'import fcntl, sys, time',
  'wait_ms, poll_ms, mode = int(sys.argv[1]), int(sys.argv[2]), sys.argv[3]',
  'operation = fcntl.LOCK_SH if mode == "shared" else fcntl.LOCK_EX',
  'deadline = time.monotonic() + wait_ms / 1000',
  'while True:',
  ' try:',
  '  fcntl.flock(3, operation | fcntl.LOCK_NB)',
  '  break',
  ' except BlockingIOError:',
  '  if time.monotonic() >= deadline:',
  '   print("TIMEOUT", flush=True)',
  '   raise SystemExit(3)',
  '  time.sleep(poll_ms / 1000)',
  'print("LOCKED", flush=True)',
].join('\n')

export interface RetainedFlockOptions {
  waitMs: number
  pollMs?: number
  /** Shared leases coexist with other readers but exclude deploy/restart's exclusive lease. */
  mode?: 'exclusive' | 'shared'
  busyMessage: string
}

function busyError(message: string): Error & { code: string } {
  return Object.assign(new Error(message), { code: 'EBUSY' })
}

/** Acquire a kernel-owned flock on a descriptor retained by this Node process. Python performs the
 * portable syscall on child fd 3; the inherited open-file description remains locked until Node closes
 * its copy. The pathname is stable and must never be unlinked as part of release or stale recovery. */
export function acquireRetainedFlockSync(lockPath: string, options: RetainedFlockOptions): number {
  const waitMs = Math.max(0, Math.trunc(options.waitMs))
  const pollMs = Math.max(1, Math.trunc(options.pollMs ?? 10))
  fs.mkdirSync(path.dirname(lockPath), { recursive: true })
  const fd = fs.openSync(lockPath, 'a+', 0o600)
  const result = spawnSync('python3', [
    '-c', FLOCK_LEASE_PROGRAM, String(waitMs), String(pollMs), options.mode ?? 'exclusive',
  ], {
    stdio: ['ignore', 'pipe', 'pipe', fd] as any,
    encoding: 'utf8',
    timeout: waitMs + 5_000,
    maxBuffer: 64_000,
  })
  const stdout = String(result.stdout || '')
  const stderr = String(result.stderr || '')
  if (result.status === 0 && /(?:^|\n)LOCKED(?:\n|$)/.test(stdout)) return fd
  try { fs.closeSync(fd) } catch { /* already closed */ }
  if (result.status === 3 || /(?:^|\n)TIMEOUT(?:\n|$)/.test(stdout)) throw busyError(options.busyMessage)
  const detail = result.error?.message || stderr.trim() || `exit ${result.status ?? result.signal ?? 'unknown'}`
  throw new Error(`flock acquisition helper failed: ${detail.slice(0, 200)}`)
}

/** Async variant for request paths which may wait briefly for another writer. It uses the same inherited
 * open-file description as the synchronous helper, but leaves Node's event loop free while the kernel lock
 * is busy. The returned descriptor is the lease: a crash or close releases it without pathname cleanup. */
export async function acquireRetainedFlock(lockPath: string, options: RetainedFlockOptions): Promise<number> {
  const waitMs = Math.max(0, Math.trunc(options.waitMs))
  const pollMs = Math.max(1, Math.trunc(options.pollMs ?? 10))
  fs.mkdirSync(path.dirname(lockPath), { recursive: true })
  const fd = fs.openSync(lockPath, 'a+', 0o600)
  let child: ReturnType<typeof spawn>
  try {
    child = spawn('python3', [
      '-c', FLOCK_LEASE_PROGRAM, String(waitMs), String(pollMs), options.mode ?? 'exclusive',
    ], { stdio: ['ignore', 'pipe', 'pipe', fd] })
  } catch (error) {
    releaseRetainedFlock(fd)
    throw error
  }

  let stdout = ''
  let stderr = ''
  child.stdout?.setEncoding('utf8')
  child.stderr?.setEncoding('utf8')
  child.stdout?.on('data', (chunk) => { stdout += String(chunk) })
  child.stderr?.on('data', (chunk) => { stderr += String(chunk) })

  try {
    await new Promise<void>((resolve, reject) => {
      let watchdogExpired = false
      const watchdog = setTimeout(() => {
        watchdogExpired = true
        child.kill('SIGKILL')
      }, waitMs + 5_000)
      watchdog.unref()
      child.once('error', (error) => {
        clearTimeout(watchdog)
        reject(error)
      })
      child.once('close', (code, signal) => {
        clearTimeout(watchdog)
        if (code === 0 && /(?:^|\n)LOCKED(?:\n|$)/.test(stdout)) {
          resolve()
          return
        }
        if (watchdogExpired || code === 3 || /(?:^|\n)TIMEOUT(?:\n|$)/.test(stdout)) {
          reject(busyError(options.busyMessage))
          return
        }
        const detail = stderr.trim() || `exit ${code ?? signal ?? 'unknown'}`
        reject(new Error(`flock acquisition helper failed: ${detail.slice(0, 200)}`))
      })
    })
    return fd
  } catch (error) {
    releaseRetainedFlock(fd)
    throw error
  }
}

export function releaseRetainedFlock(fd: number): void {
  try { fs.closeSync(fd) } catch { /* process exit also releases the kernel lease */ }
}

// One descriptor per canonical pathname. File contents are diagnostic only; the kernel lease is the
// authority. This avoids every stale-PID failure: PID reuse, crash residue, unlink/recreate ABA races,
// and a false "live owner" caused by unrelated reuse of a dead process's PID.
const singletonLeases = new Map<string, number>()

function canonicalLockPath(stateDir: string, lockFile: string): string {
  fs.mkdirSync(stateDir, { recursive: true })
  return path.join(fs.realpathSync.native(stateDir), lockFile)
}

/** Returns true iff this process owns the named kernel lease. Unexpected lock errors fail closed and are
 * logged: starting a second writer is more dangerous than temporarily refusing to start one. */
export function acquireSingletonLock(stateDir: string, lockFile: string): boolean {
  let lockPath = ''
  try {
    lockPath = canonicalLockPath(stateDir, lockFile)
    if (singletonLeases.has(lockPath)) return true
    const fd = acquireRetainedFlockSync(lockPath, {
      waitMs: 0,
      busyMessage: `singleton already owned: ${lockFile}`,
    })
    try {
      fs.ftruncateSync(fd, 0)
      fs.writeSync(fd, `${process.pid}\n`, 0, 'utf8')
      fs.fsyncSync(fd)
    } catch (error) {
      releaseRetainedFlock(fd)
      throw error
    }
    singletonLeases.set(lockPath, fd)
    return true
  } catch (error: any) {
    if (error?.code !== 'EBUSY') {
      // eslint-disable-next-line no-console
      console.error(`[singleton-lock] cannot acquire ${lockPath || path.join(stateDir, lockFile)}; refusing duplicate-safe startup`, error)
    }
    return false
  }
}

/** Release only this process's retained descriptor. The stable lock inode deliberately remains on disk. */
export function releaseSingletonLock(stateDir: string, lockFile: string): void {
  let lockPath = ''
  try { lockPath = canonicalLockPath(stateDir, lockFile) } catch { return }
  const fd = singletonLeases.get(lockPath)
  if (fd === undefined) return
  singletonLeases.delete(lockPath)
  releaseRetainedFlock(fd)
}
