// A paid provider is never started directly by the cockpit. This tiny process becomes the detached
// process-group leader, but cannot spawn the provider until the supervisor has fsynced both its process
// lease and the matching run-plan child proof. If the supervisor dies first, recovery aborts/removes the
// gate and this process exits without invoking the provider.
import { createHash } from 'node:crypto'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const DIR_ENV = 'NOSTRA_INTERNAL_PROVIDER_SPAWN_GATE_DIR'
const TOKEN_ENV = 'NOSTRA_INTERNAL_PROVIDER_SPAWN_GATE_TOKEN'
const directory = process.env[DIR_ENV]
const token = process.env[TOKEN_ENV]
const [command, ...args] = process.argv.slice(2)
const cleanEnv = { ...process.env }
delete cleanEnv[DIR_ENV]
delete cleanEnv[TOKEN_ENV]

function digestToken(value) {
  return `sha256:${createHash('sha256').update(value).digest('hex')}`
}

function commandDigest() {
  return `sha256:${createHash('sha256').update(JSON.stringify({
    command, args, cwd: path.resolve(process.cwd()),
  })).digest('hex')}`
}

function readPrivate(absolute) {
  try {
    const info = fs.lstatSync(absolute)
    if (!info.isFile() || info.isSymbolicLink() || (info.mode & 0o077) !== 0) return null
    return fs.readFileSync(absolute, 'utf8')
  } catch { return null }
}

function fail(message, code = 78) {
  process.stderr.write(`[provider-spawn-gate] ${message}\n`)
  process.exit(code)
}

if (!directory || !path.isAbsolute(directory) || !token || !command) fail('invalid gate invocation')
let intent
try { intent = JSON.parse(readPrivate(path.join(directory, 'intent.json')) ?? '') } catch { fail('invalid gate intent') }
if (intent?.schema_version !== 'cockpit-provider-spawn-gate/1.0'
    || intent.release_token_sha256 !== digestToken(token)
    || intent.commandDigest !== commandDigest()) fail('gate does not match provider command')

// The wrapper is intentionally bounded even if the old supervisor never restarts. Timing out never starts
// paid work; normal recovery aborts it much sooner. Ten minutes is only a resource-leak ceiling.
const deadline = Date.now() + 10 * 60_000
while (true) {
  if (readPrivate(path.join(directory, 'aborted')) !== null) process.exit(75)
  const released = readPrivate(path.join(directory, 'released'))
  if (released !== null) {
    if (released.trim() !== token) fail('invalid gate release')
    let proof
    try { proof = JSON.parse(readPrivate(path.join(directory, 'process-proof.json')) ?? '') } catch {
      fail('gate release has no durable process proof')
    }
    if (proof?.schema_version !== 'cockpit-provider-spawn-proof/1.0'
        || proof.gate_id !== intent.gate_id || proof.run_id !== intent.runId
        || proof.provider_attempt_id !== intent.providerAttemptId) {
      fail('gate release process proof does not match intent')
    }
    break
  }
  if (!fs.existsSync(directory)) process.exit(75)
  if (Date.now() >= deadline) process.exit(75)
  await new Promise((resolve) => setTimeout(resolve, 20))
}

let child
try {
  child = spawn(command, args, { cwd: process.cwd(), env: cleanEnv, stdio: 'inherit' })
} catch (error) {
  fail(`provider exec failed: ${String(error?.message || error)}`, 127)
}
child.once('error', (error) => fail(`provider exec failed: ${String(error?.message || error)}`, 127))
child.once('exit', (code, signal) => {
  if (signal) process.exit(128)
  process.exit(typeof code === 'number' ? code : 1)
})
