import { createHash, randomBytes, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { STATE_DIR } from './config'

export interface ProviderSpawnGateIdentity {
  requestId: string
  runId: string
  /** Transaction fan-out owner (one planned child). */
  attemptId: string
  /** Exact provider process attempt recorded in execution provenance. */
  providerAttemptId: string
  runRoot: string
  commandDigest: string
}

export interface ProviderSpawnGate {
  gateId: string
  directory: string
  releaseToken: string
  identity: ProviderSpawnGateIdentity
  stateDir: string
}

export interface ProviderSpawnGateProcessProof {
  pid: number
  processStarted: string
  leaseSha256: string
}

interface StoredProviderSpawnGateProcessProof extends ProviderSpawnGateProcessProof {
  schema_version: 'cockpit-provider-spawn-proof/1.0'
  gate_id: string
  run_id: string
  provider_attempt_id: string
}

interface ProviderSpawnGateIntent extends ProviderSpawnGateIdentity {
  schema_version: 'cockpit-provider-spawn-gate/1.0'
  gate_id: string
  release_token_sha256: string
  created_at: string
}

export type ProviderSpawnGateState =
  | { state: 'waiting' | 'released' | 'aborted'; intent: ProviderSpawnGateIntent; processProof?: StoredProviderSpawnGateProcessProof }
  | { state: 'missing' | 'invalid' }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SHA256 = /^sha256:[0-9a-f]{64}$/
const RUN_ROOT = /^analyses\/[A-Z0-9.\-]{1,15}_\d{4}-\d{2}-\d{2}$/
const GATE_ROOT_NAME = 'provider-spawn-gates'
const INTENT_FILE = 'intent.json'
const RELEASE_FILE = 'released'
const ABORT_FILE = 'aborted'
const PROOF_FILE = 'process-proof.json'

export const PROVIDER_SPAWN_GATE_DIR_ENV = 'NOSTRA_INTERNAL_PROVIDER_SPAWN_GATE_DIR'
export const PROVIDER_SPAWN_GATE_TOKEN_ENV = 'NOSTRA_INTERNAL_PROVIDER_SPAWN_GATE_TOKEN'
export const PROVIDER_SPAWN_TRAMPOLINE = fileURLToPath(new URL('./provider-spawn-trampoline.mjs', import.meta.url))

function gateRoot(stateDir: string): string {
  return path.join(path.resolve(stateDir), GATE_ROOT_NAME)
}

function gateDirectory(gateId: string, stateDir: string): string {
  if (!UUID.test(gateId)) throw new Error('invalid provider spawn gate id')
  return path.join(gateRoot(stateDir), gateId.toLowerCase())
}

function tokenDigest(token: string): string {
  return `sha256:${createHash('sha256').update(token).digest('hex')}`
}

export function providerSpawnCommandDigest(command: string, args: readonly string[], cwd: string): string {
  return `sha256:${createHash('sha256').update(JSON.stringify({ command, args, cwd: path.resolve(cwd) })).digest('hex')}`
}

function syncDirectory(directory: string): void {
  if (process.platform === 'win32') return
  const descriptor = fs.openSync(directory, fs.constants.O_RDONLY)
  try { fs.fsyncSync(descriptor) } finally { fs.closeSync(descriptor) }
}

function ensurePrivateDirectory(directory: string): void {
  try {
    const info = fs.lstatSync(directory)
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('unsafe provider spawn gate directory')
  } catch (error: any) {
    if (error?.code !== 'ENOENT') throw error
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 })
  }
  fs.chmodSync(directory, 0o700)
}

function writeAtomic(directory: string, name: string, contents: string): void {
  const target = path.join(directory, name)
  const staged = path.join(directory, `.${name}.${process.pid}.${randomUUID()}.tmp`)
  let descriptor: number | null = null
  try {
    descriptor = fs.openSync(staged,
      fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW ?? 0),
      0o600)
    fs.writeFileSync(descriptor, contents)
    fs.fsyncSync(descriptor)
    fs.closeSync(descriptor)
    descriptor = null
    fs.renameSync(staged, target)
    syncDirectory(directory)
  } catch (error) {
    if (descriptor !== null) try { fs.closeSync(descriptor) } catch { /* best effort */ }
    try { fs.unlinkSync(staged) } catch { /* absent */ }
    throw error
  }
}

function validIntent(value: unknown, gateId: string): value is ProviderSpawnGateIntent {
  if (!value || typeof value !== 'object') return false
  const intent = value as Record<string, unknown>
  return intent.schema_version === 'cockpit-provider-spawn-gate/1.0'
    && intent.gate_id === gateId.toLowerCase()
    && typeof intent.requestId === 'string' && UUID.test(intent.requestId)
    && typeof intent.runId === 'string' && UUID.test(intent.runId)
    && typeof intent.attemptId === 'string' && intent.attemptId.length > 0 && intent.attemptId.length <= 200
    && typeof intent.providerAttemptId === 'string' && UUID.test(intent.providerAttemptId)
    && typeof intent.runRoot === 'string' && RUN_ROOT.test(intent.runRoot)
    && typeof intent.commandDigest === 'string' && SHA256.test(intent.commandDigest)
    && typeof intent.release_token_sha256 === 'string' && SHA256.test(intent.release_token_sha256)
    && typeof intent.created_at === 'string' && Number.isFinite(Date.parse(intent.created_at))
}

function readPrivateFile(absolute: string): string | null {
  try {
    const info = fs.lstatSync(absolute)
    if (!info.isFile() || info.isSymbolicLink() || (info.mode & 0o077) !== 0) return null
    return fs.readFileSync(absolute, 'utf8')
  } catch { return null }
}

function readProcessProof(directory: string, gateId: string, intent: ProviderSpawnGateIntent): StoredProviderSpawnGateProcessProof | null | false {
  const raw = readPrivateFile(path.join(directory, PROOF_FILE))
  if (raw === null) return null
  try {
    const proof = JSON.parse(raw) as StoredProviderSpawnGateProcessProof
    if (proof?.schema_version !== 'cockpit-provider-spawn-proof/1.0' || proof.gate_id !== gateId.toLowerCase()
        || proof.run_id !== intent.runId || proof.provider_attempt_id !== intent.providerAttemptId
        || !Number.isSafeInteger(proof.pid) || proof.pid <= 1 || !proof.processStarted
        || !SHA256.test(String(proof.leaseSha256))) return false
    return proof
  } catch { return false }
}

export function createProviderSpawnGate(
  identity: ProviderSpawnGateIdentity,
  stateDir: string = STATE_DIR,
): ProviderSpawnGate {
  if (!UUID.test(identity.requestId) || !UUID.test(identity.runId)
      || !identity.attemptId || identity.attemptId.length > 200
      || !UUID.test(identity.providerAttemptId)
      || !RUN_ROOT.test(identity.runRoot) || !SHA256.test(identity.commandDigest)) {
    throw new Error('invalid provider spawn gate identity')
  }
  const root = gateRoot(stateDir)
  ensurePrivateDirectory(root)
  const gateId = randomUUID()
  const directory = gateDirectory(gateId, stateDir)
  fs.mkdirSync(directory, { mode: 0o700 })
  const releaseToken = randomBytes(32).toString('hex')
  const intent: ProviderSpawnGateIntent = {
    schema_version: 'cockpit-provider-spawn-gate/1.0',
    gate_id: gateId,
    ...identity,
    release_token_sha256: tokenDigest(releaseToken),
    created_at: new Date().toISOString(),
  }
  try {
    writeAtomic(directory, INTENT_FILE, `${JSON.stringify(intent, null, 2)}\n`)
    syncDirectory(root)
  } catch (error) {
    fs.rmSync(directory, { recursive: true, force: true })
    throw error
  }
  return { gateId, directory, releaseToken, identity, stateDir: path.resolve(stateDir) }
}

export function inspectProviderSpawnGate(gateId: string, stateDir: string = STATE_DIR): ProviderSpawnGateState {
  let directory: string
  try { directory = gateDirectory(gateId, stateDir) } catch { return { state: 'invalid' } }
  try {
    const info = fs.lstatSync(directory)
    if (!info.isDirectory() || info.isSymbolicLink()) return { state: 'invalid' }
  } catch (error: any) {
    return { state: error?.code === 'ENOENT' ? 'missing' : 'invalid' }
  }
  const raw = readPrivateFile(path.join(directory, INTENT_FILE))
  if (raw === null) return { state: 'invalid' }
  let intent: unknown
  try { intent = JSON.parse(raw) } catch { return { state: 'invalid' } }
  if (!validIntent(intent, gateId)) return { state: 'invalid' }
  const processProof = readProcessProof(directory, gateId, intent)
  if (processProof === false) return { state: 'invalid' }
  const released = readPrivateFile(path.join(directory, RELEASE_FILE))
  const aborted = readPrivateFile(path.join(directory, ABORT_FILE))
  if (released !== null && aborted !== null) return { state: 'invalid' }
  if (released !== null) {
    return tokenDigest(released.trim()) === intent.release_token_sha256
      ? { state: 'released', intent, ...(processProof ? { processProof } : {}) }
      : { state: 'invalid' }
  }
  if (aborted !== null) return aborted.trim() === gateId.toLowerCase()
    ? { state: 'aborted', intent, ...(processProof ? { processProof } : {}) }
    : { state: 'invalid' }
  return { state: 'waiting', intent, ...(processProof ? { processProof } : {}) }
}

export function recordProviderSpawnGateProcessProof(
  gate: ProviderSpawnGate,
  proof: ProviderSpawnGateProcessProof,
): void {
  const state = inspectProviderSpawnGate(gate.gateId, gate.stateDir)
  if (state.state !== 'waiting') throw new Error('provider spawn process proof requires one waiting gate')
  if (!Number.isSafeInteger(proof.pid) || proof.pid <= 1 || !proof.processStarted
      || !SHA256.test(proof.leaseSha256)) throw new Error('invalid provider spawn process proof')
  const stored: StoredProviderSpawnGateProcessProof = {
    schema_version: 'cockpit-provider-spawn-proof/1.0',
    gate_id: gate.gateId,
    run_id: gate.identity.runId,
    provider_attempt_id: gate.identity.providerAttemptId,
    ...proof,
  }
  writeAtomic(gate.directory, PROOF_FILE, `${JSON.stringify(stored, null, 2)}\n`)
}

export function releaseProviderSpawnGate(gate: ProviderSpawnGate): void {
  const state = inspectProviderSpawnGate(gate.gateId, gate.stateDir)
  if (state.state === 'released') return
  if (state.state !== 'waiting'
      || !state.processProof
      || state.intent.release_token_sha256 !== tokenDigest(gate.releaseToken)
      || state.intent.commandDigest !== gate.identity.commandDigest) {
    throw new Error('provider spawn gate is not safely releasable')
  }
  writeAtomic(gate.directory, RELEASE_FILE, `${gate.releaseToken}\n`)
}

/** Mark an unreleased gate as abandoned. The trampoline observes this before provider exec; a released
 * gate is deliberately immutable because a provider may already have spent. */
export function abortProviderSpawnGate(gateId: string, stateDir: string = STATE_DIR): boolean {
  const state = inspectProviderSpawnGate(gateId, stateDir)
  if (state.state === 'aborted') return true
  if (state.state !== 'waiting') return false
  writeAtomic(gateDirectory(gateId, stateDir), ABORT_FILE, `${gateId.toLowerCase()}\n`)
  return true
}

export function removeProviderSpawnGate(gateId: string, stateDir: string = STATE_DIR): void {
  const directory = gateDirectory(gateId, stateDir)
  try {
    const info = fs.lstatSync(directory)
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('unsafe provider spawn gate cleanup target')
    fs.rmSync(directory, { recursive: true, force: true })
    const root = gateRoot(stateDir)
    if (fs.existsSync(root)) syncDirectory(root)
  } catch (error: any) {
    if (error?.code !== 'ENOENT') throw error
  }
}

/** Startup-only cleanup for trampolines that were created before their process lease could be persisted.
 * Released or malformed gates are retained fail-closed; only proof that provider exec was still blocked is
 * removable without an interruption record. */
export function sweepUnreleasedProviderSpawnGates(stateDir: string = STATE_DIR): number {
  const root = gateRoot(stateDir)
  if (!fs.existsSync(root)) return 0
  const rootInfo = fs.lstatSync(root)
  if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink()) throw new Error('unsafe provider spawn gate root')
  let removed = 0
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    if (!UUID.test(entry.name) || !entry.isDirectory() || entry.isSymbolicLink()) {
      throw new Error(`unsafe provider spawn gate entry: ${entry.name}`)
    }
    const state = inspectProviderSpawnGate(entry.name, stateDir)
    if (state.state !== 'waiting' && state.state !== 'aborted') continue
    if (state.state === 'waiting') abortProviderSpawnGate(entry.name, stateDir)
    removeProviderSpawnGate(entry.name, stateDir)
    removed++
  }
  return removed
}
