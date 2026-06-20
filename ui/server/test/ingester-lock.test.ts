// Single-instance ingester lock (news/scheduler.ts): a second engine pointed at the same STATE_DIR must
// NOT run a duplicate ingester (the 2026-06-20 :8799 incident). Filesystem-only, no network/server.
// Run: npx tsx test/ingester-lock.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { acquireIngesterLock, releaseIngesterLock } from '../src/news/scheduler'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'inglock-'))
const lockPath = (d: string) => path.join(d, 'news-ingester.lock')

check('acquire: a fresh data dir → acquires and records our pid', () => {
  const d = tmp()
  assert.equal(acquireIngesterLock(d), true)
  assert.equal(fs.readFileSync(lockPath(d), 'utf8').trim(), String(process.pid))
})

check('acquire: re-entrant — the same process re-acquires its own lock', () => {
  const d = tmp()
  assert.equal(acquireIngesterLock(d), true)
  assert.equal(acquireIngesterLock(d), true)
})

check('acquire: a LIVE foreign owner BLOCKS (false) — the duplicate stays read-only', () => {
  const d = tmp()
  fs.writeFileSync(lockPath(d), '1') // pid 1 (launchd/init): always alive, not us → kill(1,0) succeeds or EPERM
  assert.equal(acquireIngesterLock(d), false)
  assert.equal(fs.readFileSync(lockPath(d), 'utf8').trim(), '1') // foreign lock left untouched
})

check('acquire: a STALE lock (dead pid) is stolen', () => {
  const d = tmp()
  fs.writeFileSync(lockPath(d), '2147483646') // a pid that does not exist → ESRCH on kill(,0)
  assert.equal(acquireIngesterLock(d), true)
  assert.equal(fs.readFileSync(lockPath(d), 'utf8').trim(), String(process.pid)) // now ours
})

check('acquire: an unreadable/garbage lock body is treated as stale and stolen', () => {
  const d = tmp()
  fs.writeFileSync(lockPath(d), 'not-a-pid')
  assert.equal(acquireIngesterLock(d), true)
  assert.equal(fs.readFileSync(lockPath(d), 'utf8').trim(), String(process.pid))
})

check('release: removes OUR lock but never a foreign one', () => {
  const d = tmp()
  acquireIngesterLock(d)
  releaseIngesterLock(d)
  assert.equal(fs.existsSync(lockPath(d)), false)
  fs.writeFileSync(lockPath(d), '1')
  releaseIngesterLock(d)
  assert.equal(fs.existsSync(lockPath(d)), true) // not ours → left alone
})

console.log(`\n${passed} checks passed`)
