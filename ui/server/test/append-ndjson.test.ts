// Real-process concurrency test for the shared NDJSON ledger append helper. This catches a duplicate
// check done before lock acquisition: all writers would observe a missing id, then append it in turn.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { execFile, spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

const execFileAsync = promisify(execFile)
const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'append-ndjson-')))
const ledger = path.join(root, 'ledger.ndjson')
const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../scripts/append-ndjson.sh')
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
async function waitFor(predicate: () => boolean, timeoutMs = 5_000): Promise<void> {
  const started = Date.now()
  while (!predicate()) {
    if (Date.now() - started > timeoutMs) throw new Error('timed out waiting for signal-race state')
    await wait(10)
  }
}

try {
  await assert.rejects(
    execFileAsync('bash', [script, path.join(root, 'invalid.ndjson'), '{"outcome_id":"bad","value":NaN}'], { timeout: 20_000 }),
    (error: any) => error?.code === 2 && /not a JSON object/.test(String(error?.stderr)),
    'non-finite JSON extensions cannot enter an append-only evidence ledger',
  )

  const typedLedger = path.join(root, 'typed.ndjson')
  await execFileAsync('bash', [script, typedLedger, JSON.stringify({ outcome_id: 1 }), 'outcome_id', '1'], { timeout: 20_000 })
  const typedString = await execFileAsync('bash', [script, typedLedger, JSON.stringify({ outcome_id: '1' }), 'outcome_id', '1'], { timeout: 20_000 })
  assert.match(typedString.stdout, /^APPENDED=1\s*$/m, 'a numeric field must not collide with a string idempotency key')

  const tmpA = path.join(root, 'tmp-a')
  const tmpB = path.join(root, 'tmp-b')
  fs.mkdirSync(tmpA)
  fs.mkdirSync(tmpB)
  const sameIdRuns = await Promise.all(Array.from({ length: 20 }, (_, writer) =>
    execFileAsync('bash', [script, ledger, JSON.stringify({ outcome_id: 'same-id', writer }), 'outcome_id', 'same-id'], {
      timeout: 20_000, env: { ...process.env, TMPDIR: writer % 2 ? tmpA : tmpB },
    })))
  assert.equal(sameIdRuns.filter((r) => /^APPENDED=1\s*$/m.test(r.stdout)).length, 1)
  assert.equal(sameIdRuns.filter((r) => /^DUPLICATE=1\s*$/m.test(r.stdout)).length, 19)

  let lines = fs.readFileSync(ledger, 'utf8').trim().split('\n')
  assert.equal(lines.length, 1, 'twenty racing writers must produce one idempotent record')
  assert.equal(JSON.parse(lines[0]).outcome_id, 'same-id')

  const uniqueRuns = await Promise.all(Array.from({ length: 12 }, (_, writer) => {
    const id = `unique-${writer}`
    return execFileAsync('bash', [script, ledger, JSON.stringify({ outcome_id: id, writer }), 'outcome_id', id], {
      timeout: 20_000,
    })
  }))
  assert.equal(uniqueRuns.filter((r) => /^APPENDED=1\s*$/m.test(r.stdout)).length, 12)
  lines = fs.readFileSync(ledger, 'utf8').trim().split('\n')
  assert.equal(lines.length, 13, 'distinct records must all survive concurrent serialization')
  assert.equal(new Set(lines.map((line) => JSON.parse(line).outcome_id)).size, 13)

  // The ledger inode is the mutex: real, symlink, and hard-link spellings of the same evidence file
  // cannot split into separate sidecar locks and double-admit one id.
  const aliasedLedger = path.join(root, 'aliased.ndjson')
  fs.writeFileSync(aliasedLedger, JSON.stringify({ outcome_id: 'seed' }) + '\n')
  const symlinkLedger = path.join(root, 'aliased-symlink.ndjson')
  const hardlinkLedger = path.join(root, 'aliased-hardlink.ndjson')
  fs.symlinkSync(aliasedLedger, symlinkLedger)
  fs.linkSync(aliasedLedger, hardlinkLedger)
  const aliasRuns = await Promise.all(Array.from({ length: 18 }, (_, writer) => {
    const target = [aliasedLedger, symlinkLedger, hardlinkLedger][writer % 3]
    return execFileAsync('bash', [script, target, JSON.stringify({ outcome_id: 'one-inode', writer }), 'outcome_id', 'one-inode'], { timeout: 20_000 })
  }))
  assert.equal(aliasRuns.filter((r) => /^APPENDED=1\s*$/m.test(r.stdout)).length, 1)
  assert.equal(aliasRuns.filter((r) => /^DUPLICATE=1\s*$/m.test(r.stdout)).length, 17)
  assert.equal(fs.readFileSync(aliasedLedger, 'utf8').trim().split('\n').length, 2)

  // A live kernel-held lock must fail closed. The old helper timed out and then appended without a
  // lock, which could corrupt the ledger precisely when ownership was uncertain.
  const lockedLedger = path.join(root, 'locked.ndjson')
  const holder = spawn('python3', ['-c', [
    'import fcntl, sys, time',
    'lock = open(sys.argv[1], "a+")',
    'fcntl.flock(lock.fileno(), fcntl.LOCK_EX)',
    'print("LOCKED", flush=True)',
    'time.sleep(5)',
  ].join(';'), lockedLedger], { stdio: ['ignore', 'pipe', 'pipe'] })
  let holderStdout = ''
  holder.stdout.on('data', (chunk) => { holderStdout += String(chunk) })
  await waitFor(() => holderStdout.includes('LOCKED'))
  await assert.rejects(
    execFileAsync('bash', [script, lockedLedger, JSON.stringify({ outcome_id: 'must-not-write' }), 'outcome_id', 'must-not-write'], {
      timeout: 20_000,
      env: { ...process.env, TMPDIR: tmpA, NDJSON_LOCK_MAX_ATTEMPTS: '2', NDJSON_LOCK_SLEEP_SECS: '0.01' },
    }),
    (error: any) => error?.code === 3 && /timed out waiting for ledger lock/.test(String(error?.stderr)),
  )
  assert.equal(fs.readFileSync(lockedLedger, 'utf8'), '', 'lock timeout must never fall back to an unlocked append')
  const holderClosed = new Promise<void>((resolve) => holder.once('close', () => resolve()))
  assert.equal(holder.kill('SIGTERM'), true)
  await holderClosed

  // The persistent lock inode is harmless after its owner dies: the kernel drops the lease without any
  // PID probe, stale-owner deletion, or pathname reclamation.
  const recovered = await execFileAsync('bash', [script, lockedLedger, JSON.stringify({ outcome_id: 'recovered' }), 'outcome_id', 'recovered'], {
    timeout: 20_000, env: { ...process.env, TMPDIR: tmpB },
  })
  assert.match(recovered.stdout, /^APPENDED=1\s*$/m)
  assert.equal(JSON.parse(fs.readFileSync(lockedLedger, 'utf8')).outcome_id, 'recovered')

  // Real signal race: kill a writer while it owns the critical section. The kernel must release the
  // lease and terminate the writer (not resume and append); the next writer then acquires normally.
  const signalLedger = path.join(root, 'signal.ndjson')
  const child = spawn('bash', [script, signalLedger, JSON.stringify({ outcome_id: 'killed-writer' }), 'outcome_id', 'killed-writer'], {
    env: { ...process.env, TMPDIR: tmpA, NDJSON_TEST_HOLD_AFTER_LOCK_SECS: '2' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let childStdout = ''
  child.stdout.on('data', (chunk) => { childStdout += String(chunk) })
  await waitFor(() => childStdout.includes('LOCKED=1'))
  const childClosed = new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve) => {
    child.once('close', (code, signal) => resolve({ code, signal }))
  })
  assert.equal(child.kill('SIGTERM'), true)
  const close = await childClosed
  assert.equal(close.code, null)
  assert.equal(close.signal, 'SIGTERM')
  assert.doesNotMatch(childStdout, /APPENDED=1/)
  assert.equal(fs.existsSync(signalLedger), true, 'the ledger inode persists while the kernel lease is released')
  assert.equal(fs.readFileSync(signalLedger, 'utf8'), '', 'a terminated pre-write holder cannot resume and append')
  const afterSignal = await execFileAsync('bash', [script, signalLedger, JSON.stringify({ outcome_id: 'after-signal' }), 'outcome_id', 'after-signal'], {
    timeout: 20_000, env: { ...process.env, TMPDIR: tmpB },
  })
  assert.match(afterSignal.stdout, /^APPENDED=1\s*$/m)
  assert.equal(JSON.parse(fs.readFileSync(signalLedger, 'utf8')).outcome_id, 'after-signal')

  // A crash or storage fault can leave only the last line torn. The next exclusive owner removes that
  // uncommitted fragment before checking idempotency or appending, preserving every complete record.
  const tornLedger = path.join(root, 'torn.ndjson')
  fs.writeFileSync(tornLedger, [
    JSON.stringify({ outcome_id: 'committed' }),
    '{"outcome_id":"uncommitted-fragment"',
  ].join('\n'))
  const afterTorn = await execFileAsync('bash', [script, tornLedger, JSON.stringify({ outcome_id: 'after-torn' }), 'outcome_id', 'after-torn'], {
    timeout: 20_000,
  })
  assert.match(afterTorn.stdout, /^APPENDED=1\s*$/m)
  const healedRows = fs.readFileSync(tornLedger, 'utf8').trim().split('\n').map((line) => JSON.parse(line))
  assert.deepEqual(healedRows.map((row) => row.outcome_id), ['committed', 'after-torn'])
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}

console.log('\n1 append-ndjson concurrency test file passed')
