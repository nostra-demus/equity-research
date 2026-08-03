// Retained kernel lease used by the news ingester. File contents are diagnostic only: another process
// must hold flock(2) to block us, and a crash must release ownership without deleting the stable inode.
// Run: npx tsx test/ingester-lock.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawn, type ChildProcess } from 'node:child_process'
import { acquireIngesterLock, releaseIngesterLock } from '../src/news/scheduler'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'inglock-'))
const lockPath = (d: string) => path.join(d, 'news-ingester.lock')
const HOLDER_PROGRAM = [
  'import fcntl, os, sys',
  'f = open(sys.argv[1], "a+")',
  'fcntl.flock(f.fileno(), fcntl.LOCK_EX)',
  'f.seek(0); f.truncate(); f.write("foreign\\n"); f.flush(); os.fsync(f.fileno())',
  'print("LOCKED", flush=True)',
  'sys.stdin.read()',
].join('\n')

async function startForeignHolder(file: string): Promise<ChildProcess> {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.closeSync(fs.openSync(file, 'a'))
  const child = spawn('python3', ['-c', HOLDER_PROGRAM, file], { stdio: ['pipe', 'pipe', 'pipe'] })
  return await new Promise<ChildProcess>((resolve, reject) => {
    let stdout = ''
    let stderr = ''
    const timer = setTimeout(() => {
      child.kill('SIGKILL')
      reject(new Error(`foreign flock holder did not start: ${stderr || stdout || 'timeout'}`))
    }, 5_000)
    child.stdout!.on('data', (chunk) => {
      stdout += String(chunk)
      if (!stdout.includes('LOCKED')) return
      clearTimeout(timer)
      resolve(child)
    })
    child.stderr!.on('data', (chunk) => { stderr += String(chunk) })
    child.once('error', (error) => { clearTimeout(timer); reject(error) })
    child.once('exit', (code, signal) => {
      if (!stdout.includes('LOCKED')) {
        clearTimeout(timer)
        reject(new Error(`foreign flock holder exited ${code ?? signal}: ${stderr}`))
      }
    })
  })
}

async function stopHolder(child: ChildProcess, signal: NodeJS.Signals = 'SIGTERM'): Promise<void> {
  if (child.exitCode !== null || child.signalCode !== null) return
  await new Promise<void>((resolve) => {
    child.once('exit', () => resolve())
    child.kill(signal)
  })
}

await check('fresh acquire records our pid and release preserves the stable lock inode', () => {
  const d = tmp()
  assert.equal(acquireIngesterLock(d), true)
  const before = fs.statSync(lockPath(d)).ino
  assert.equal(fs.readFileSync(lockPath(d), 'utf8').trim(), String(process.pid))
  releaseIngesterLock(d)
  assert.equal(fs.existsSync(lockPath(d)), true)
  assert.equal(fs.statSync(lockPath(d)).ino, before)
})

await check('same process can re-enter one named lease', () => {
  const d = tmp()
  assert.equal(acquireIngesterLock(d), true)
  assert.equal(acquireIngesterLock(d), true)
  releaseIngesterLock(d)
})

await check('live foreign kernel owner blocks; crash releases it without unlink/reclaim races', async () => {
  const d = tmp()
  const file = lockPath(d)
  const holder = await startForeignHolder(file)
  const inode = fs.statSync(file).ino
  try {
    assert.equal(acquireIngesterLock(d), false)
    assert.equal(fs.statSync(file).ino, inode)
  } finally {
    await stopHolder(holder, 'SIGKILL')
  }
  assert.equal(acquireIngesterLock(d), true)
  assert.equal(fs.statSync(file).ino, inode)
  releaseIngesterLock(d)
})

await check('stale or reused LIVE pid text has no authority without a kernel lease', () => {
  const d = tmp()
  fs.writeFileSync(lockPath(d), '1\n') // PID 1 is live; the old implementation blocked forever here.
  const inode = fs.statSync(lockPath(d)).ino
  assert.equal(acquireIngesterLock(d), true)
  assert.equal(fs.statSync(lockPath(d)).ino, inode)
  assert.equal(fs.readFileSync(lockPath(d), 'utf8').trim(), String(process.pid))
  releaseIngesterLock(d)
})

await check('canonical state path prevents symlink aliases from creating a second lease', () => {
  const parent = tmp()
  const real = path.join(parent, 'real')
  const alias = path.join(parent, 'alias')
  fs.mkdirSync(real)
  fs.symlinkSync(real, alias, 'dir')
  assert.equal(acquireIngesterLock(real), true)
  assert.equal(acquireIngesterLock(alias), true)
  releaseIngesterLock(alias)
  assert.equal(fs.existsSync(lockPath(real)), true)
})

await check('unexpected filesystem errors fail closed instead of admitting a duplicate writer', () => {
  const parent = tmp()
  const notDirectory = path.join(parent, 'state-file')
  fs.writeFileSync(notDirectory, 'not a directory')
  const originalError = console.error
  let logged = false
  console.error = () => { logged = true }
  try { assert.equal(acquireIngesterLock(notDirectory), false) }
  finally { console.error = originalError }
  assert.equal(logged, true)
})

console.log(`\n${passed} checks passed`)
