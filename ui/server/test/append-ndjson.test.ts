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

  // A stuck lock must fail closed. The old helper timed out and then appended without a lock, which
  // could corrupt the ledger precisely when lock ownership was uncertain.
  const lockedLedger = path.join(root, 'locked.ndjson')
  fs.mkdirSync(`${lockedLedger}.lock`)
  await assert.rejects(
    execFileAsync('bash', [script, lockedLedger, JSON.stringify({ outcome_id: 'must-not-write' }), 'outcome_id', 'must-not-write'], {
      timeout: 20_000,
      env: { ...process.env, TMPDIR: tmpA, NDJSON_LOCK_MAX_ATTEMPTS: '2', NDJSON_LOCK_SLEEP_SECS: '0.01' },
    }),
    (error: any) => error?.code === 3 && /timed out waiting for ledger lock/.test(String(error?.stderr)),
  )
  assert.equal(fs.existsSync(lockedLedger), false, 'lock timeout must never fall back to an unlocked append')

  // If durable owner metadata cannot be completed, the writer must remove both a partial owner file and
  // the directory it just acquired before retrying. HELD is cleared on this branch, so the exit trap alone
  // cannot rescue a leaked lock.
  const ownerWriteLedger = path.join(root, 'owner-write-failure.ndjson')
  await assert.rejects(
    execFileAsync('bash', [script, ownerWriteLedger, JSON.stringify({ outcome_id: 'must-not-write' }), 'outcome_id', 'must-not-write'], {
      timeout: 20_000,
      env: { ...process.env, NDJSON_TEST_FAIL_OWNER_WRITE: '1', NDJSON_LOCK_MAX_ATTEMPTS: '2', NDJSON_LOCK_SLEEP_SECS: '0.01' },
    }),
    (error: any) => error?.code === 3 && /timed out waiting for ledger lock/.test(String(error?.stderr)),
  )
  assert.equal(fs.existsSync(`${ownerWriteLedger}.lock`), false, 'a failed owner write cannot strand its lock directory')
  assert.equal(fs.existsSync(ownerWriteLedger), false, 'a failed owner write cannot append')

  const staleLedger = path.join(root, 'stale.ndjson')
  const staleLock = `${staleLedger}.lock`
  fs.mkdirSync(staleLock)
  fs.writeFileSync(path.join(staleLock, 'owner'), `pid=99999999\nhost=${os.hostname()}\ncreated=1\n`)
  const recovered = await execFileAsync('bash', [script, staleLedger, JSON.stringify({ outcome_id: 'recovered' }), 'outcome_id', 'recovered'], {
    timeout: 20_000,
    env: { ...process.env, TMPDIR: tmpB, NDJSON_LOCK_MAX_ATTEMPTS: '5', NDJSON_LOCK_SLEEP_SECS: '0.01' },
  })
  assert.match(recovered.stdout, /^APPENDED=1\s*$/m)
  assert.equal(JSON.parse(fs.readFileSync(staleLedger, 'utf8')).outcome_id, 'recovered', 'a dead local writer cannot strand the ledger forever')

  // A malformed owner is neither a live local PID nor valid remote ownership. It fails closed while
  // young, then becomes reclaimable after the explicit malformed-owner grace instead of wedging forever.
  const malformedLedger = path.join(root, 'malformed.ndjson')
  const malformedLock = `${malformedLedger}.lock`
  fs.mkdirSync(malformedLock)
  fs.writeFileSync(path.join(malformedLock, 'owner'), `pid=not-a-pid\nhost=${os.hostname()}\ncreated=bad\ntoken=partial\n`)
  const malformedRecovered = await execFileAsync('bash', [script, malformedLedger, JSON.stringify({ outcome_id: 'malformed-recovered' }), 'outcome_id', 'malformed-recovered'], {
    timeout: 20_000,
    env: {
      ...process.env, TMPDIR: tmpA, NDJSON_LOCK_MAX_ATTEMPTS: '5', NDJSON_LOCK_SLEEP_SECS: '0.01',
      NDJSON_STALE_OWNER_GRACE_SECS: '0',
    },
  })
  assert.match(malformedRecovered.stdout, /^APPENDED=1\s*$/m)

  // Real signal race: kill a writer while it owns the lock inside the critical section. The signal trap
  // must release ownership and terminate (not resume and append); the next writer then acquires normally.
  const signalLedger = path.join(root, 'signal.ndjson')
  const signalLock = `${signalLedger}.lock`
  const child = spawn('bash', [script, signalLedger, JSON.stringify({ outcome_id: 'killed-writer' }), 'outcome_id', 'killed-writer'], {
    env: { ...process.env, TMPDIR: tmpA, NDJSON_TEST_HOLD_AFTER_LOCK_SECS: '2' },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let childStdout = ''
  child.stdout.on('data', (chunk) => { childStdout += String(chunk) })
  await waitFor(() => fs.existsSync(path.join(signalLock, 'owner')))
  assert.equal(child.kill('SIGTERM'), true)
  const close = await new Promise<{ code: number | null; signal: NodeJS.Signals | null }>((resolve) => {
    child.once('close', (code, signal) => resolve({ code, signal }))
  })
  assert.equal(close.code, 143)
  assert.equal(close.signal, null)
  assert.doesNotMatch(childStdout, /APPENDED=1/)
  assert.equal(fs.existsSync(signalLock), false, 'SIGTERM releases the exact owned lock before exiting')
  assert.equal(fs.existsSync(signalLedger), false, 'a terminated writer cannot resume and append')
  const afterSignal = await execFileAsync('bash', [script, signalLedger, JSON.stringify({ outcome_id: 'after-signal' }), 'outcome_id', 'after-signal'], {
    timeout: 20_000, env: { ...process.env, TMPDIR: tmpB },
  })
  assert.match(afterSignal.stdout, /^APPENDED=1\s*$/m)
  assert.equal(JSON.parse(fs.readFileSync(signalLedger, 'utf8')).outcome_id, 'after-signal')
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}

console.log('\n1 append-ndjson concurrency test file passed')
