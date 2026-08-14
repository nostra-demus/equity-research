import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { Budget, armCooldown, clearCooldown, inspectBudgetLedger, readCooldownUntil, resetBudgetMemory, resetCooldownMemory } from '../src/news/triage/budget'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'budget-xproc-'))
const moduleUrl = pathToFileURL(path.resolve('src/news/triage/budget.ts')).href
const day = Date.parse('2026-08-13T12:00:00Z')

interface Probe {
  child: ChildProcessWithoutNullStreams
  ready: string
  done: Promise<any>
}

function probe(id: string, stateDir: string, body: string): Probe {
  const ready = path.join(stateDir, `${id}.ready`)
  const go = path.join(stateDir, 'go')
  const code = `
    import fs from 'node:fs';
    import { Budget } from ${JSON.stringify(moduleUrl)};
    const budget = Budget.load(${JSON.stringify(stateDir)}, 1, 100, ${day}, 'shared-budget.json');
    fs.writeFileSync(${JSON.stringify(ready)}, 'ready');
    while (!fs.existsSync(${JSON.stringify(go)})) await new Promise((resolve) => setTimeout(resolve, 5));
    ${body}
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

async function releaseTogether(probes: Probe[], stateDir: string): Promise<any[]> {
  const deadline = Date.now() + 10_000
  while (!probes.every((p) => fs.existsSync(p.ready))) {
    if (Date.now() >= deadline) throw new Error('cross-process probes did not reach the pre-admission barrier')
    await new Promise((resolve) => setTimeout(resolve, 10))
  }
  fs.writeFileSync(path.join(stateDir, 'go'), 'go')
  return await Promise.all(probes.map((p) => p.done))
}

// Both processes load the same zero-use snapshot before either is released. Only a locked, fresh
// read-modify-write can keep this deterministic race under a request cap of one.
const reserveDir = path.join(root, 'reserve')
fs.mkdirSync(reserveDir, { recursive: true })
const reserveResults = await releaseTogether([
  probe('reserve-a', reserveDir, `console.log(JSON.stringify({ reservation: budget.tryReserve(10, undefined, ${day}) }));`),
  probe('reserve-b', reserveDir, `console.log(JSON.stringify({ reservation: budget.tryReserve(10, undefined, ${day}) }));`),
], reserveDir)
const winners = reserveResults.map((r) => r.reservation).filter(Boolean)
assert.equal(winners.length, 1, 'two processes cannot both reserve the final request')
assert.match(winners[0].id, /^[0-9a-f-]{36}$/i)
assert.equal(winners[0].date, '2026-08-13')
let saved = JSON.parse(fs.readFileSync(path.join(reserveDir, 'shared-budget.json'), 'utf8'))
assert.equal(saved.requests, 1)
assert.equal(saved.tokens, 10)
assert.ok(saved.reservations[winners[0].id], 'the in-flight reservation identity is durable')

// Reconciliation is a short second transaction, not a lock held across provider I/O. Replaying the same
// durable id cannot subtract twice or reopen the cap.
resetBudgetMemory()
const reconciler = Budget.load(reserveDir, 1, 100, day, 'shared-budget.json')
reconciler.reconcile(winners[0], 1, 7)
reconciler.reconcile({ ...winners[0], active: true }, 0, 0)
saved = JSON.parse(fs.readFileSync(path.join(reserveDir, 'shared-budget.json'), 'utf8'))
assert.equal(saved.requests, 1)
assert.equal(saved.tokens, 7)
assert.equal(Object.keys(saved.reservations).length, 0)
assert.equal(saved.revision, 2)

// ENOENT is the only fresh-zero case. A present but unreadable or schema-invalid current ledger may hide
// already-spent allowance, so every admission/read surface fails closed and the damaged bytes stay intact.
for (const [name, raw] of [
  ['truncated', '{"date":"2026-08-13","requests":1'],
  ['bad-date', JSON.stringify({ date: '2026-08-99', requests: 0, tokens: 0 })],
  ['bad-counters', JSON.stringify({ date: '2026-08-13', requests: 'bad', tokens: null })],
  ['bad-reservation', JSON.stringify({
    date: '2026-08-13', requests: 1, tokens: 10,
    reservations: { hidden: { requests: 'bad', tokens: 10, createdAt: day } },
  })],
  ['impossible-reservation', JSON.stringify({
    date: '2026-08-13', requests: 1, tokens: 10,
    reservations: { hidden: { requests: 2, tokens: 20, createdAt: day } },
  })],
] as const) {
  const corruptDir = path.join(root, `corrupt-${name}`)
  fs.mkdirSync(corruptDir, { recursive: true })
  const file = path.join(corruptDir, 'shared-budget.json')
  fs.writeFileSync(file, raw)
  resetBudgetMemory()
  const corrupt = Budget.load(corruptDir, 10, 100, day, 'shared-budget.json')
  assert.equal(corrupt.ledgerAvailable, false, `${name}: callers can distinguish ledger damage from spent allowance`)
  assert.equal(corrupt.canSpend(1), false, `${name}: soft admission fails closed`)
  assert.equal(corrupt.remainingRequests, 0, `${name}: request headroom fails closed`)
  assert.equal(corrupt.remainingTokens, 0, `${name}: token headroom fails closed`)
  assert.equal(corrupt.tryReserve(1, undefined, day), null, `${name}: authoritative reservation fails closed`)
  assert.equal(fs.readFileSync(file, 'utf8'), raw, `${name}: corrupt authority is never overwritten as zero`)
}

const freshDir = path.join(root, 'fresh-missing')
fs.mkdirSync(freshDir, { recursive: true })
resetBudgetMemory()
const fresh = Budget.load(freshDir, 10, 100, day, 'shared-budget.json')
assert.equal(fresh.canSpend(10), true, 'a genuinely missing ledger starts fresh')
assert.ok(fresh.tryReserve(10, undefined, day), 'missing-ledger admission creates the first durable revision')

const priorDayDir = path.join(root, 'prior-day')
fs.mkdirSync(priorDayDir, { recursive: true })
fs.writeFileSync(path.join(priorDayDir, 'shared-budget.json'), JSON.stringify({
  date: '2026-08-12', requests: 10, tokens: 100, revision: 4, reservations: {},
}))
resetBudgetMemory()
const rolled = Budget.load(priorDayDir, 10, 100, day, 'shared-budget.json')
assert.ok(rolled.tryReserve(10, undefined, day), 'a valid prior-day ledger rotates to a fresh provider day')
assert.equal(JSON.parse(fs.readFileSync(path.join(priorDayDir, 'shared-budget.json'), 'utf8')).date, '2026-08-13')

const vanishedDir = path.join(root, 'vanished-current-day')
fs.mkdirSync(vanishedDir, { recursive: true })
resetBudgetMemory()
const vanishedOwner = Budget.load(vanishedDir, 10, 100, day, 'shared-budget.json')
const vanishedReservation = vanishedOwner.tryReserve(40, undefined, day)
assert.ok(vanishedReservation)
vanishedOwner.reconcile(vanishedReservation!, 1, 30)
fs.unlinkSync(path.join(vanishedDir, 'shared-budget.json'))
const vanishedReload = Budget.load(vanishedDir, 10, 100, day, 'shared-budget.json')
assert.equal(vanishedReload.canSpend(1), false, 'a current-day ledger disappearing after use cannot reset shared counters')
assert.equal(vanishedReload.tryReserve(1, undefined, day), null, 'missing-after-use cannot recreate a zero ledger')
assert.equal(fs.existsSync(path.join(vanishedDir, 'shared-budget.json')), false)
assert.deepEqual(inspectBudgetLedger(path.join(vanishedDir, 'shared-budget.json'), '2026-08-13'), { available: false }, 'diagnostics share the missing-after-use tombstone')

const rollbackDir = path.join(root, 'same-day-rollback')
fs.mkdirSync(rollbackDir, { recursive: true })
resetBudgetMemory()
const rollbackOwner = Budget.load(rollbackDir, 1, 100, day, 'shared-budget.json')
const rollbackReservation = rollbackOwner.tryReserve(40, undefined, day)
assert.ok(rollbackReservation)
rollbackOwner.reconcile(rollbackReservation!, 1, 30)
const rollbackFile = path.join(rollbackDir, 'shared-budget.json')
fs.writeFileSync(rollbackFile, JSON.stringify({ date: '2026-08-13', requests: 0, tokens: 0, revision: 3, reservations: {} }))
const rollbackReload = Budget.load(rollbackDir, 1, 100, day, 'shared-budget.json')
assert.equal(rollbackReload.ledgerAvailable, false, 'a lower same-day revision cannot replace remembered authority')
assert.equal(rollbackReload.tryReserve(1, undefined, day), null, 'same-day rollback cannot reopen a spent request cap')
assert.equal(rollbackReload.lastReserveFailure, 'authority_unavailable')
assert.deepEqual(inspectBudgetLedger(rollbackFile, '2026-08-13'), { available: false }, 'diagnostics reject the same-day rollback too')

const vanishedReservationDir = path.join(root, 'active-reservation-vanished')
fs.mkdirSync(vanishedReservationDir, { recursive: true })
resetBudgetMemory()
const activeOwner = Budget.load(vanishedReservationDir, 1, 100, day, 'shared-budget.json')
const activeReservation = activeOwner.tryReserve(40, undefined, day)
assert.ok(activeReservation)
const activeFile = path.join(vanishedReservationDir, 'shared-budget.json')
const activeSaved = JSON.parse(fs.readFileSync(activeFile, 'utf8'))
// Equal committed floor + a higher revision used to look monotonic even though OUR in-flight envelope had
// vanished. A reload could then dispatch request two under a cap of one before request one reconciled.
fs.writeFileSync(activeFile, JSON.stringify({
  date: '2026-08-13', requests: 0, tokens: 0, revision: activeSaved.revision + 1, reservations: {},
}))
const activeReload = Budget.load(vanishedReservationDir, 1, 100, day, 'shared-budget.json')
assert.equal(activeReload.ledgerAvailable, false, 'a locally active reservation cannot disappear on reload')
assert.equal(activeReload.tryReserve(1, undefined, day), null, 'missing in-flight envelope cannot authorize a second request')
activeOwner.reconcile(activeReservation!, 1, 30)
assert.equal(activeReservation!.active, true, 'ambiguous missing reservation stays charged and retryable in memory')
assert.equal(activeOwner.lastReserveFailure, 'authority_unavailable')
assert.equal(JSON.parse(fs.readFileSync(activeFile, 'utf8')).requests, 0, 'reconcile never publishes the rolled-back snapshot')

const markerRollbackDir = path.join(root, 'same-day-marker-rollback')
fs.mkdirSync(markerRollbackDir, { recursive: true })
resetBudgetMemory()
const markerOwner = Budget.load(markerRollbackDir, 2, 100, day, 'shared-budget.json')
const markerReservation = markerOwner.tryReserve(10, undefined, day)
assert.ok(markerReservation)
markerOwner.reconcile(markerReservation!, 1, 8)
markerOwner.exhaust('requests_day')
const markerFile = path.join(markerRollbackDir, 'shared-budget.json')
const marked = JSON.parse(fs.readFileSync(markerFile, 'utf8'))
fs.writeFileSync(markerFile, JSON.stringify({ ...marked, revision: marked.revision + 1, exhausted: false, providerDayExhausted: false }))
const markerReload = Budget.load(markerRollbackDir, 2, 100, day, 'shared-budget.json')
assert.equal(markerReload.ledgerAvailable, false, 'a higher revision cannot clear a remembered provider-day stop')
assert.equal(markerReload.tryReserve(1, undefined, day), null)

const busyDir = path.join(root, 'lock-busy')
fs.mkdirSync(busyDir, { recursive: true })
resetBudgetMemory()
const busyBudget = Budget.load(busyDir, 1, 100, day, 'shared-budget.json')
const busyLockFile = path.join(busyDir, 'shared-budget.json.lock')
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
  if (Date.now() >= busyDeadline) throw new Error('budget lock holder did not become ready')
  await new Promise((resolve) => setTimeout(resolve, 10))
}
assert.equal(busyBudget.tryReserve(10, undefined, day), null, 'a busy authority fails closed before provider I/O')
assert.equal(busyBudget.lastReserveFailure, 'authority_unavailable', 'lock timeout is distinct from a spent cap')
busyHolder.kill('SIGKILL')
await new Promise<void>((resolve) => busyHolder.once('close', () => resolve()))

const exhaustBusyDir = path.join(root, 'exhaust-lock-busy')
fs.mkdirSync(exhaustBusyDir, { recursive: true })
resetBudgetMemory()
const exhaustBusyBudget = Budget.load(exhaustBusyDir, 2, 100, day, 'shared-budget.json')
const exhaustBusyReservation = exhaustBusyBudget.tryReserve(10, undefined, day)
assert.ok(exhaustBusyReservation)
exhaustBusyBudget.reconcile(exhaustBusyReservation!, 1, 8)
const exhaustLockFile = path.join(exhaustBusyDir, 'shared-budget.json.lock')
const exhaustLockReady = path.join(exhaustBusyDir, 'lock-ready')
const exhaustHolder = spawn('python3', ['-c', [
  'import fcntl, sys, time',
  'f = open(sys.argv[1], "a+")',
  'fcntl.flock(f.fileno(), fcntl.LOCK_EX)',
  'open(sys.argv[2], "w").write("ready")',
  'time.sleep(8)',
].join('\n'), exhaustLockFile, exhaustLockReady])
const exhaustDeadline = Date.now() + 5_000
while (!fs.existsSync(exhaustLockReady)) {
  if (Date.now() >= exhaustDeadline) throw new Error('exhaust lock holder did not become ready')
  await new Promise((resolve) => setTimeout(resolve, 10))
}
assert.doesNotThrow(() => exhaustBusyBudget.exhaust('requests_day'), 'provider-day close cannot throw through unscored work')
assert.equal(exhaustBusyBudget.providerDayExhausted, true)
assert.equal(exhaustBusyBudget.ledgerAvailable, false)
assert.equal(exhaustBusyBudget.lastReserveFailure, 'authority_unavailable')
exhaustHolder.kill('SIGKILL')
await new Promise<void>((resolve) => exhaustHolder.once('close', () => resolve()))

// Non-reservation accounting is also a delta transaction. Two stale preloaded snapshots must add, not
// overwrite each other with whichever process happens to save last.
const recordDir = path.join(root, 'record')
fs.mkdirSync(recordDir, { recursive: true })
await releaseTogether([
  probe('record-a', recordDir, `budget.record(1, 10); budget.save(); console.log(JSON.stringify({ ok: true }));`),
  probe('record-b', recordDir, `budget.record(1, 10); budget.save(); console.log(JSON.stringify({ ok: true }));`),
], recordDir)
saved = JSON.parse(fs.readFileSync(path.join(recordDir, 'shared-budget.json'), 'utf8'))
assert.equal(saved.requests, 2)
assert.equal(saved.tokens, 20)
assert.equal(saved.revision, 2)

// Exhaustion set by another process stays monotonic when this process later replaces its in-flight
// estimate with actual usage. The flags and real counters are independent fields in one transaction.
const exhaustDir = path.join(root, 'exhaust')
fs.mkdirSync(exhaustDir, { recursive: true })
resetBudgetMemory()
const owner = Budget.load(exhaustDir, 1, 100, day, 'shared-budget.json')
const active = owner.tryReserve(10, undefined, day)
assert.ok(active)
await releaseTogether([
  probe('exhaust', exhaustDir, `budget.exhaust(); console.log(JSON.stringify({ ok: true }));`),
], exhaustDir)
owner.reconcile(active, 1, 8)
saved = JSON.parse(fs.readFileSync(path.join(exhaustDir, 'shared-budget.json'), 'utf8'))
assert.equal(saved.requests, 1)
assert.equal(saved.tokens, 8)
assert.equal(saved.providerDayExhausted, true)
assert.equal(saved.exhausted, true)
assert.equal(Object.keys(saved.reservations).length, 0)

// A success that began before a later failure is stale evidence and cannot clear the newer provider hold.
resetCooldownMemory()
const cooldownDir = path.join(root, 'cooldown')
armCooldown(cooldownDir, 2_000, 5_000, 'groq', 5_000, 'rate-limit')
clearCooldown(cooldownDir, 'groq', 1_000)
assert.equal(readCooldownUntil(cooldownDir, 'groq'), 7_000)
clearCooldown(cooldownDir, 'groq', 2_000)
assert.equal(readCooldownUntil(cooldownDir, 'groq'), 7_000, 'same-millisecond failure is newer evidence and stays armed')
clearCooldown(cooldownDir, 'groq', 2_001)
assert.equal(readCooldownUntil(cooldownDir, 'groq'), 0)

console.log('budget cross-process checks passed')
