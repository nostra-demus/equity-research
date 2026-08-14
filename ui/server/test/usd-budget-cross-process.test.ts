import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { UsdBudget, inspectUsdLedger, resetBudgetMemory, usdAmountFits } from '../src/news/triage/budget'

const stateDir = fs.mkdtempSync(path.join(os.tmpdir(), 'usd-budget-xproc-'))
const moduleUrl = pathToFileURL(path.resolve('src/news/triage/budget.ts')).href
const at = Date.parse('2026-08-13T12:00:00Z')

interface Probe {
  child: ChildProcessWithoutNullStreams
  ready: string
  done: Promise<any>
}

function probe(id: string): Probe {
  const ready = path.join(stateDir, `${id}.ready`)
  const go = path.join(stateDir, 'go')
  const code = `
    import fs from 'node:fs';
    import { UsdBudget } from ${JSON.stringify(moduleUrl)};
    const budget = UsdBudget.load(${JSON.stringify(stateDir)}, 1, ${at}, 'shared-usd.json');
    fs.writeFileSync(${JSON.stringify(ready)}, 'ready');
    while (!fs.existsSync(${JSON.stringify(go)})) await new Promise((resolve) => setTimeout(resolve, 5));
    console.log(JSON.stringify({ reservation: budget.tryReserve(0.6, ${at}) }));
  `
  const child = spawn(process.execPath, ['--import', 'tsx', '--input-type=module', '--eval', code], {
    cwd: process.cwd(), stdio: ['ignore', 'pipe', 'pipe'],
  })
  const done = new Promise<any>((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const timer = setTimeout(() => { child.kill('SIGKILL'); reject(new Error(`${id} timed out`)) }, 20_000)
    child.stdout.setEncoding('utf8'); child.stdout.on('data', (chunk) => { stdout += String(chunk) })
    child.stderr.setEncoding('utf8'); child.stderr.on('data', (chunk) => { stderr += String(chunk) })
    child.once('error', (error) => { clearTimeout(timer); reject(error) })
    child.once('close', (code, signal) => {
      clearTimeout(timer)
      if (code !== 0) { reject(new Error(`${id} failed (${code ?? signal}): ${stderr}`)); return }
      try { resolve(JSON.parse(stdout.trim().split('\n').at(-1) || 'null')) }
      catch { reject(new Error(`${id} returned invalid JSON: ${stdout}\n${stderr}`)) }
    })
  })
  return { child, ready, done }
}

const probes = [probe('a'), probe('b')]
const deadline = Date.now() + 10_000
while (!probes.every((p) => fs.existsSync(p.ready))) {
  if (Date.now() >= deadline) throw new Error('USD budget probes did not reach the race barrier')
  await new Promise((resolve) => setTimeout(resolve, 10))
}
fs.writeFileSync(path.join(stateDir, 'go'), 'go')
const results = await Promise.all(probes.map((p) => p.done))
const winners = results.map((result) => result.reservation).filter(Boolean)
assert.equal(winners.length, 1, 'two processes cannot both reserve the final $0.60 under a $1 ceiling')

const saved = JSON.parse(fs.readFileSync(path.join(stateDir, 'shared-usd.json'), 'utf8'))
assert.equal(saved.usd, 0.6)
assert.equal(saved.calls, 1)
assert.ok(saved.reservations[winners[0].id], 'the winning in-flight charge is durable')
assert.equal(saved.revision, 1)

// Match the request/token ledger: only ENOENT is fresh zero. A present unreadable or schema-invalid USD
// ledger could conceal paid/subscription usage, so it cannot authorize or overwrite another call.
for (const [name, raw] of [
  ['truncated', '{"date":"2026-08-13","usd":0.9'],
  ['bad-date', JSON.stringify({ date: '2026-08-99', usd: 0, calls: 0 })],
  ['bad-counters', JSON.stringify({ date: '2026-08-13', usd: 'bad', calls: 0 })],
  ['bad-reservation', JSON.stringify({
    date: '2026-08-13', usd: 0.6, calls: 1,
    reservations: { hidden: { usd: 'bad', calls: 1, createdAt: at } },
  })],
  ['impossible-reservation', JSON.stringify({
    date: '2026-08-13', usd: 0.6, calls: 1,
    reservations: { hidden: { usd: 0.7, calls: 2, createdAt: at } },
  })],
] as const) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `usd-budget-${name}-`))
  const file = path.join(dir, 'shared-usd.json')
  fs.writeFileSync(file, raw)
  const corrupt = UsdBudget.load(dir, 1, at, 'shared-usd.json')
  assert.equal(corrupt.canSpend(0.1), false, `${name}: USD soft admission fails closed`)
  assert.equal(corrupt.remaining(), 0, `${name}: USD remaining allowance fails closed`)
  assert.equal(corrupt.tryReserve(0.1, at), null, `${name}: USD reservation fails closed`)
  assert.equal(fs.readFileSync(file, 'utf8'), raw, `${name}: corrupt USD authority is never overwritten as zero`)
  fs.rmSync(dir, { recursive: true, force: true })
}

const freshDir = fs.mkdtempSync(path.join(os.tmpdir(), 'usd-budget-fresh-'))
const fresh = UsdBudget.load(freshDir, 1, at, 'shared-usd.json')
assert.equal(fresh.canSpend(0.6), true, 'a genuinely missing USD ledger starts fresh')
assert.ok(fresh.tryReserve(0.6, at), 'missing USD ledger creates the first durable revision')
fs.rmSync(freshDir, { recursive: true, force: true })

const priorDayDir = fs.mkdtempSync(path.join(os.tmpdir(), 'usd-budget-prior-day-'))
fs.writeFileSync(path.join(priorDayDir, 'shared-usd.json'), JSON.stringify({
  date: '2026-08-12', usd: 1, calls: 4, revision: 4, reservations: {},
}))
const rolled = UsdBudget.load(priorDayDir, 1, at, 'shared-usd.json')
assert.ok(rolled.tryReserve(0.6, at), 'a valid prior-day USD ledger rotates to a fresh provider day')
assert.equal(JSON.parse(fs.readFileSync(path.join(priorDayDir, 'shared-usd.json'), 'utf8')).date, '2026-08-13')
fs.rmSync(priorDayDir, { recursive: true, force: true })

const vanishedDir = fs.mkdtempSync(path.join(os.tmpdir(), 'usd-budget-vanished-current-day-'))
resetBudgetMemory()
const vanishedOwner = UsdBudget.load(vanishedDir, 1, at, 'shared-usd.json')
const vanishedReservation = vanishedOwner.tryReserve(0.8, at)
assert.ok(vanishedReservation)
vanishedOwner.reconcile(vanishedReservation!, 0.8, 1)
fs.unlinkSync(path.join(vanishedDir, 'shared-usd.json'))
const vanishedReload = UsdBudget.load(vanishedDir, 1, at, 'shared-usd.json')
assert.equal(vanishedReload.ledgerAvailable, false, 'a current-day USD ledger disappearing after use is unavailable')
assert.equal(vanishedReload.canSpend(0.8), false, 'missing-after-use cannot reopen same-process USD headroom')
assert.equal(vanishedReload.tryReserve(0.8, at), null, 'missing-after-use cannot recreate a zero USD ledger')
assert.equal(fs.existsSync(path.join(vanishedDir, 'shared-usd.json')), false)
assert.deepEqual(inspectUsdLedger(path.join(vanishedDir, 'shared-usd.json'), '2026-08-13'), { available: false }, 'diagnostics share the missing-after-use USD tombstone')
fs.rmSync(vanishedDir, { recursive: true, force: true })

const rollbackDir = fs.mkdtempSync(path.join(os.tmpdir(), 'usd-budget-same-day-rollback-'))
resetBudgetMemory()
const rollbackOwner = UsdBudget.load(rollbackDir, 1, at, 'shared-usd.json')
const rollbackReservation = rollbackOwner.tryReserve(0.8, at)
assert.ok(rollbackReservation)
rollbackOwner.reconcile(rollbackReservation!, 0.8, 1)
const rollbackFile = path.join(rollbackDir, 'shared-usd.json')
fs.writeFileSync(rollbackFile, JSON.stringify({ date: '2026-08-13', usd: 0, calls: 0, revision: 3, reservations: {} }))
const rollbackReload = UsdBudget.load(rollbackDir, 1, at, 'shared-usd.json')
assert.equal(rollbackReload.ledgerAvailable, false, 'a lower same-day USD revision cannot replace remembered authority')
assert.equal(rollbackReload.tryReserve(0.8, at), null, 'same-day rollback cannot reopen the hard $ ceiling')
assert.equal(rollbackReload.lastReserveFailure, 'authority_unavailable')
assert.deepEqual(inspectUsdLedger(rollbackFile, '2026-08-13'), { available: false }, 'USD diagnostics reject the same-day rollback too')
fs.rmSync(rollbackDir, { recursive: true, force: true })

const vanishedReservationDir = fs.mkdtempSync(path.join(os.tmpdir(), 'usd-budget-active-reservation-vanished-'))
resetBudgetMemory()
const activeOwner = UsdBudget.load(vanishedReservationDir, 1, at, 'shared-usd.json')
const activeReservation = activeOwner.tryReserve(0.8, at)
assert.ok(activeReservation)
const activeFile = path.join(vanishedReservationDir, 'shared-usd.json')
const activeSaved = JSON.parse(fs.readFileSync(activeFile, 'utf8'))
fs.writeFileSync(activeFile, JSON.stringify({
  date: '2026-08-13', usd: 0, calls: 0, revision: activeSaved.revision + 1, reservations: {},
}))
const activeReload = UsdBudget.load(vanishedReservationDir, 1, at, 'shared-usd.json')
assert.equal(activeReload.ledgerAvailable, false, 'a locally active USD reservation cannot disappear on reload')
assert.equal(activeReload.tryReserve(0.8, at), null, 'missing paid envelope cannot authorize a second call')
activeOwner.reconcile(activeReservation!, 0.8, 1)
assert.equal(activeReservation!.active, true, 'ambiguous USD reservation remains conservatively active')
assert.equal(activeOwner.lastReserveFailure, 'authority_unavailable')
assert.equal(JSON.parse(fs.readFileSync(activeFile, 'utf8')).usd, 0, 'USD reconcile never publishes the rolled-back snapshot')
fs.rmSync(vanishedReservationDir, { recursive: true, force: true })

const markerRollbackDir = fs.mkdtempSync(path.join(os.tmpdir(), 'usd-budget-marker-rollback-'))
resetBudgetMemory()
const markerOwner = UsdBudget.load(markerRollbackDir, 2, at, 'shared-usd.json')
const markerReservation = markerOwner.tryReserve(0.8, at)
assert.ok(markerReservation)
markerOwner.reconcile(markerReservation!, 0.7, 1)
markerOwner.exhaust()
const markerFile = path.join(markerRollbackDir, 'shared-usd.json')
const marked = JSON.parse(fs.readFileSync(markerFile, 'utf8'))
fs.writeFileSync(markerFile, JSON.stringify({ ...marked, revision: marked.revision + 1, exhausted: false }))
const markerReload = UsdBudget.load(markerRollbackDir, 2, at, 'shared-usd.json')
assert.equal(markerReload.ledgerAvailable, false, 'a higher USD revision cannot clear a remembered day stop')
assert.equal(markerReload.tryReserve(0.1, at), null)
fs.rmSync(markerRollbackDir, { recursive: true, force: true })

const busyDir = fs.mkdtempSync(path.join(os.tmpdir(), 'usd-budget-lock-busy-'))
resetBudgetMemory()
const busyBudget = UsdBudget.load(busyDir, 1, at, 'shared-usd.json')
const busyLockFile = path.join(busyDir, 'shared-usd.json.lock')
const busyLockReady = path.join(busyDir, 'lock-ready')
const busyHolder = spawn('python3', ['-c', [
  'import fcntl, os, sys, time',
  'f = open(sys.argv[1], "a+")',
  'fcntl.flock(f.fileno(), fcntl.LOCK_EX)',
  'open(sys.argv[2], "w").write("ready")',
  'time.sleep(8)',
].join('\n'), busyLockFile, busyLockReady])
const busyDeadline = Date.now() + 5_000
while (!fs.existsSync(busyLockReady)) {
  if (Date.now() >= busyDeadline) throw new Error('USD budget lock holder did not become ready')
  await new Promise((resolve) => setTimeout(resolve, 10))
}
assert.equal(busyBudget.tryReserve(0.8, at), null, 'a busy USD authority fails closed before provider I/O')
assert.equal(busyBudget.lastReserveFailure, 'authority_unavailable', 'USD lock timeout is distinct from a spent $ cap')
busyHolder.kill('SIGKILL')
await new Promise<void>((resolve) => busyHolder.once('close', () => resolve()))
fs.rmSync(busyDir, { recursive: true, force: true })

const exactBoundaryDir = fs.mkdtempSync(path.join(os.tmpdir(), 'usd-budget-exact-boundary-'))
assert.equal(usdAmountFits(0.05, 0.10, 0.15), true)
assert.equal(usdAmountFits(0.05, 0.1000000001, 0.15), false, 'a real tenth-nanodollar overshoot rounds closed')
const exactBoundary = UsdBudget.load(exactBoundaryDir, 0.15, at, 'shared-usd.json')
exactBoundary.record(0.05)
assert.equal(exactBoundary.canSpend(0.10), true, 'decimal 0.05 + 0.10 fits an exact $0.15 ceiling')
assert.ok(exactBoundary.tryReserve(0.10, at), 'exact decimal headroom is admitted despite binary float noise')
assert.equal(exactBoundary.canSpend(0.000000001), false, 'the exact ceiling remains closed after admission')
const overBoundary = UsdBudget.load(exactBoundaryDir, 0.15, at, 'shared-usd.json')
assert.equal(overBoundary.tryReserve(0.000000001, at), null, 'fixed-scale comparison never admits a real overshoot')
fs.rmSync(exactBoundaryDir, { recursive: true, force: true })

const accumulatedBoundaryDir = fs.mkdtempSync(path.join(os.tmpdir(), 'usd-budget-accumulated-boundary-'))
const accumulatedBoundary = UsdBudget.load(accumulatedBoundaryDir, 0.25, at, 'shared-usd.json')
accumulatedBoundary.record(0.05)
accumulatedBoundary.record(0.10)
assert.equal(accumulatedBoundary.usd, 0.15, 'persisted debits normalize binary addition to the fixed money scale')
assert.ok(accumulatedBoundary.tryReserve(0.10, at), 'a later call can use the exact remaining decimal headroom')
assert.equal(JSON.parse(fs.readFileSync(path.join(accumulatedBoundaryDir, 'shared-usd.json'), 'utf8')).usd, 0.25)
fs.rmSync(accumulatedBoundaryDir, { recursive: true, force: true })

fs.rmSync(stateDir, { recursive: true, force: true })
console.log('USD budget cross-process checks passed')
