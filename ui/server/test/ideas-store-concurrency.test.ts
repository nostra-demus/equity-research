// Real-process regression coverage for Ideas persistence. The snapshot and repository leases must be
// kernel-owned, and the one shared history ledger must refuse an append while another process owns it.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import { execFile, spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath, pathToFileURL } from 'node:url'
import {
  ideaId, ideaSnapshotRevision, readIdeaById, writeIdea, writeIdeaIfRevision,
} from '../src/news/ideas/ideas-store'
import { validIdeaSnapshot } from './ideas-fixture'

const execFileAsync = promisify(execFile)
const wait = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))
const testDir = path.dirname(fileURLToPath(import.meta.url))
const serverDir = path.dirname(testDir)

async function waitFor(predicate: () => boolean, timeoutMs = 5_000): Promise<void> {
  const started = Date.now()
  while (!predicate()) {
    if (Date.now() - started > timeoutMs) throw new Error('timed out waiting for flock holder')
    await wait(10)
  }
}

async function holdFlock(file: string): Promise<ChildProcessWithoutNullStreams> {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const child = spawn('python3', ['-c', [
    'import fcntl, sys, time',
    'lock = open(sys.argv[1], "a+")',
    'fcntl.flock(lock.fileno(), fcntl.LOCK_EX)',
    'print("LOCKED", flush=True)',
    'time.sleep(30)',
  ].join('\n'), file], { stdio: ['pipe', 'pipe', 'pipe'] })
  let stdout = ''
  let stderr = ''
  child.stdout.on('data', (chunk) => { stdout += String(chunk) })
  child.stderr.on('data', (chunk) => { stderr += String(chunk) })
  await waitFor(() => stdout.includes('LOCKED') || child.exitCode !== null)
  if (!stdout.includes('LOCKED')) throw new Error(`flock holder failed: ${stderr || child.exitCode}`)
  return child
}

async function stop(child: ChildProcessWithoutNullStreams | null): Promise<void> {
  if (!child || child.exitCode !== null || child.signalCode !== null) return
  const closed = new Promise<void>((resolve) => child.once('close', () => resolve()))
  child.kill('SIGTERM')
  await closed
}

const root = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'ideas-store-race-')))
let holder: ChildProcessWithoutNullStreams | null = null

try {
  await execFileAsync('git', ['init', '-q', root], { timeout: 20_000 })
  const seed = validIdeaSnapshot('SEED')
  writeIdea(root, seed)
  const ledger = path.join(root, 'screener', 'ledger', 'ideas.ndjson')
  assert.equal(fs.readFileSync(ledger, 'utf8').trim().split('\n').length, 1)
  writeIdea(root, seed)
  assert.equal(fs.readFileSync(ledger, 'utf8').trim().split('\n').length, 1, 'an exact retry reprojects but never duplicates its journal event')

  // A stale-looking pathname is not proof that its live kernel owner is gone. The legacy PID reclaimer
  // unlinked this inode and entered on a new one (ABA), while the original writer still held it.
  const snapshotFile = path.join(root, 'screener', 'ledger', 'ideas', `${seed.idea_id}.json`)
  const snapshotLock = `${snapshotFile}.lock`
  fs.writeFileSync(snapshotLock, '999999 0\n')
  const old = new Date(Date.now() - 120_000)
  fs.utimesSync(snapshotLock, old, old)
  holder = await holdFlock(snapshotLock)
  const heldInode = fs.statSync(snapshotLock).ino
  const revision = ideaSnapshotRevision(readIdeaById(root, seed.idea_id))
  const changed = { ...seed, updated_at: '2026-08-03T06:01:00Z' }
  assert.equal(writeIdeaIfRevision(root, changed, revision), false, 'a live flock cannot be reclaimed from stale PID text')
  assert.equal(readIdeaById(root, seed.idea_id)?.updated_at, seed.updated_at)
  assert.equal(fs.statSync(snapshotLock).ino, heldInode, 'the stable lock inode is never deleted or replaced')
  await stop(holder); holder = null

  // Every tracked Ideas mutation joins the same repository lease as commit/deploy. A checkout cannot
  // replace the journal or projection midway through the transaction.
  const { stdout: lockOutput } = await execFileAsync('git', [
    '-C', root, 'rev-parse', '--git-path', 'nostra-engine-mutation.flock',
  ], { timeout: 20_000 })
  const rawRepositoryLock = lockOutput.trim()
  const repositoryLock = path.isAbsolute(rawRepositoryLock) ? rawRepositoryLock : path.join(root, rawRepositoryLock)
  holder = await holdFlock(repositoryLock)
  const blockedByCheckout = validIdeaSnapshot('GITBUSY')
  assert.throws(
    () => writeIdea(root, blockedByCheckout),
    (error: any) => error?.code === 'EBUSY' && /repository mutation/.test(String(error?.message)),
  )
  assert.equal(readIdeaById(root, blockedByCheckout.idea_id), null)
  assert.equal(fs.readFileSync(ledger, 'utf8').trim().split('\n').length, 1)
  await stop(holder); holder = null

  // Per-snapshot locks are insufficient for one shared ideas.ndjson. The canonical appender must honor
  // the ledger inode lease and fail visibly; it must not publish a snapshot with a missing history event.
  holder = await holdFlock(ledger)
  const priorAttempts = process.env.NDJSON_LOCK_MAX_ATTEMPTS
  const priorSleep = process.env.NDJSON_LOCK_SLEEP_SECS
  process.env.NDJSON_LOCK_MAX_ATTEMPTS = '2'
  process.env.NDJSON_LOCK_SLEEP_SECS = '0.01'
  const blockedByLedger = validIdeaSnapshot('LOGBUSY')
  try {
    assert.throws(
      () => writeIdea(root, blockedByLedger),
      (error: any) => error?.code === 'EIDEA_APPEND' && /timed out waiting for ledger lock/.test(String(error?.message)),
    )
  } finally {
    if (priorAttempts === undefined) delete process.env.NDJSON_LOCK_MAX_ATTEMPTS
    else process.env.NDJSON_LOCK_MAX_ATTEMPTS = priorAttempts
    if (priorSleep === undefined) delete process.env.NDJSON_LOCK_SLEEP_SECS
    else process.env.NDJSON_LOCK_SLEEP_SECS = priorSleep
  }
  assert.equal(readIdeaById(root, blockedByLedger.idea_id), null)
  assert.equal(fs.readFileSync(ledger, 'utf8').trim().split('\n').length, 1)
  await stop(holder); holder = null

  // Different Idea ids have different snapshot locks, so only a real shared repository/ledger mutex can
  // preserve every line. Exercise the complete public writer from independent Node processes.
  const storeUrl = pathToFileURL(path.join(serverDir, 'src', 'news', 'ideas', 'ideas-store.ts')).href
  const fixtureUrl = pathToFileURL(path.join(testDir, 'ideas-fixture.ts')).href
  const childProgram = [
    `import { writeIdea } from ${JSON.stringify(storeUrl)}`,
    `import { validIdeaSnapshot } from ${JSON.stringify(fixtureUrl)}`,
    'const [root, ticker] = process.argv.slice(1)',
    // One acquisition deliberately gives up after two seconds so a checkout cannot wedge a caller.
    // The complete burst takes longer than that on fsync-heavy hosts, so retry the explicitly retryable
    // EBUSY result at the child boundary just as the production CAS writer does at its pass boundary.
    'for (let attempt = 0; attempt < 4; attempt++) {',
    " try { writeIdea(root, validIdeaSnapshot(ticker)); break } catch (error) { if (error?.code !== 'EBUSY' || attempt === 3) throw error }",
    '}',
  ].join(';')
  const tickers = Array.from({ length: 8 }, (_, i) => `RACE${i}`)
  await Promise.all(tickers.map((ticker) => execFileAsync(process.execPath, [
    '--import', 'tsx', '--input-type=module', '-e', childProgram, root, ticker,
  ], { cwd: serverDir, timeout: 30_000, maxBuffer: 1_000_000 })))

  const lines = fs.readFileSync(ledger, 'utf8').trim().split('\n')
  assert.equal(lines.length, tickers.length + 1)
  const rows = lines.map((line) => JSON.parse(line))
  assert.equal(new Set(rows.map((row) => row.idea_history_id)).size, rows.length, 'each journal event is complete and unique')
  for (const ticker of tickers) assert.equal(readIdeaById(root, ideaId(ticker, 'long'))?.ticker, ticker)
} finally {
  await stop(holder)
  fs.rmSync(root, { recursive: true, force: true })
}

console.log('\n1 Ideas-store concurrency test file passed')
