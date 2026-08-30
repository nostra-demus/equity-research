import { createHash, randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { isDeepStrictEqual } from 'node:util'
import { REPO_ROOT, STATE_DIR } from './config'
import type { RunState } from './registry'
import type { ProviderExecutionProfile, RunProvider } from './providers/types'
import { swarmById } from './swarms'
import { writeSupervisorRunFile } from './outputs'

export const EXECUTION_PROVENANCE_BASENAME = '.execution-provenance.jsonl'
export const EXECUTION_PROVENANCE_RECEIPT = 'execution_provenance.receipt.json'
const PROVIDER_ROLLOUT_CUTOFF_MS = Date.parse('2026-08-21T00:00:00Z')
const attemptsByEpoch = new Map<string, Array<Record<string, unknown>>>()
const liveSelectionByRunRoot = new Map<string, RecordedProviderSelection>()
// Canonical attempts which actually started in this supervisor process, indexed independently of a
// chain/epoch. A quota-failed attempt can therefore be carried into a later, explicitly selected
// cross-provider continuation without trusting anything the failed child left in the run folder.
const liveAttemptsByRunRoot = new Map<string, Array<Record<string, unknown>>>()
// Canonical lineage from a terminal publication remains live for a later same-root research/screener
// continuation. Terminal artifact hashes bind the rows to that sealed publication; child-writable disk
// receipts are never imported as authority. Stable commodity roots deliberately start a fresh epoch.
const sealedAttemptsByRunRoot = new Map<string, {
  rows: Array<Record<string, unknown>>
  artifactHashes: Record<string, string>
}>()
interface ParitySnapshotWatch {
  root: string
  watchers: fs.FSWatcher[]
  fingerprint: Map<string, string>
  expiresAt: number
  dirty?: string
}
const paritySnapshotWatches = new Map<string, ParitySnapshotWatch>()
const SUPERVISOR_INSTANCE_ID = randomUUID()
const parityReceiptByPair = new Map<string, {
  digest: string; registrationId: string; supervisorInstanceId: string; expiresAt: number
}>()
const PARITY_WATCH_TTL_MS = 7 * 24 * 60 * 60_000

/** Resolve immutable parity binding paths across deployed worktrees without admitting traversal. */
export function resolveParityBindingPath(value: string): string | null {
  if (!value || value.includes('\\') || (!path.isAbsolute(value) && value.split('/').includes('..'))) return null
  const repo = path.resolve(REPO_ROOT)
  const resolved = path.resolve(path.isAbsolute(value) ? value : path.join(REPO_ROOT, value))
  if (resolved !== repo && !resolved.startsWith(`${repo}${path.sep}`)) return null
  return resolved
}

function supervisorManifestForRunRoot(runRoot: string): string {
  const key = createHash('sha256').update(runRoot).digest('hex')
  return path.join(STATE_DIR, 'execution-provenance', 'run-roots', `${key}.jsonl`)
}

function supervisorSealedAuthorityForRunRoot(runRoot: string): string {
  return supervisorManifestForRunRoot(runRoot).replace(/\.jsonl$/, '.sealed.json')
}

function readProtectedJson(file: string): any | null {
  try {
    const info = fs.lstatSync(file)
    const uid = process.getuid?.()
    if (!info.isFile() || info.isSymbolicLink() || (uid !== undefined && info.uid !== uid)
        || (info.mode & 0o077) !== 0 || info.size <= 0 || info.size > 1024 * 1024
        || fs.realpathSync(file) !== file) return null
    const parent = path.dirname(file)
    const parentInfo = fs.lstatSync(parent)
    if (!parentInfo.isDirectory() || parentInfo.isSymbolicLink()
        || (uid !== undefined && parentInfo.uid !== uid) || (parentInfo.mode & 0o077) !== 0
        || fs.realpathSync(parent) !== parent) return null
    const bytes = fs.readFileSync(file)
    if (bytes.length !== info.size) return null
    return JSON.parse(bytes.toString('utf8'))
  } catch { return null }
}

function readProtectedManifestRows(runRoot: string, expectedAttemptId?: string): Array<Record<string, unknown>> {
  const file = supervisorManifestForRunRoot(runRoot)
  try {
    const info = fs.lstatSync(file)
    const uid = process.getuid?.()
    if (!info.isFile() || info.isSymbolicLink() || (uid !== undefined && info.uid !== uid)
        || (info.mode & 0o077) !== 0 || fs.realpathSync(file) !== file) return []
    const rows = fs.readFileSync(file, 'utf8').split('\n').filter(Boolean).map((line) => JSON.parse(line))
    if (!rows.length || rows.some((row) => !row || typeof row !== 'object'
        || !['claude', 'codex'].includes(row.provider)
        || !['recorded', 'configured'].includes(row.attribution))) return []
    if (expectedAttemptId && !rows.some((row) => row.attempt_id === expectedAttemptId && row.attribution === 'recorded')) return []
    return rows
  } catch { return [] }
}

const sha256File = (file: string): string | null => {
  try { return createHash('sha256').update(fs.readFileSync(file)).digest('hex') } catch { return null }
}

const sha256Bytes = (value: Buffer | string): string => `sha256:${createHash('sha256').update(value).digest('hex')}`

function readStableRegularFile(file: string, label: string): Buffer {
  let before: fs.Stats
  let value: Buffer
  let after: fs.Stats
  try {
    before = fs.lstatSync(file)
    if (!before.isFile() || before.isSymbolicLink()) throw new Error('not a regular file')
    value = fs.readFileSync(file)
    after = fs.lstatSync(file)
  } catch (error: any) {
    throw new Error(`${label} is not a readable regular file: ${error?.message || error}`)
  }
  if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size
      || before.mtimeMs !== after.mtimeMs) throw new Error(`${label} changed while the supervisor read it`)
  return value
}

function jsonObject(value: Buffer, label: string): Record<string, any> {
  try {
    const parsed = JSON.parse(value.toString('utf8'))
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('must be a JSON object')
    return parsed
  } catch (error: any) {
    throw new Error(`${label} is invalid: ${error?.message || error}`)
  }
}

function parityReceiptSelfDigest(value: Buffer): string {
  try {
    return execFileSync('python3', ['-c', [
      'import json,sys',
      'from scripts.provider_parity_freeze import receipt_digest',
      'print(receipt_digest(json.load(sys.stdin)))',
    ].join(';')], {
      cwd: REPO_ROOT, input: value, encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'],
    }).trim()
  } catch {
    throw new Error('provider-parity freeze receipt self-digest could not be verified')
  }
}

function validateParityContracts(binding: Buffer, receipt: Buffer): void {
  try {
    execFileSync('python3', ['-c', [
      'import json,sys',
      'from scripts.provider_parity_freeze import validate_against_schema,RUN_BINDING_SCHEMA_PATH,FREEZE_SCHEMA_PATH',
      'v=json.load(sys.stdin)',
      'validate_against_schema(v["binding"],RUN_BINDING_SCHEMA_PATH,label="run binding")',
      'validate_against_schema(v["receipt"],FREEZE_SCHEMA_PATH,label="freeze receipt")',
    ].join(';')], {
      cwd: REPO_ROOT,
      input: JSON.stringify({ binding: jsonObject(binding, 'provider-parity run binding'), receipt: jsonObject(receipt, 'provider-parity freeze receipt') }),
      encoding: 'utf8', stdio: ['pipe', 'ignore', 'ignore'],
    })
  } catch {
    throw new Error('provider-parity binding/freeze schema validation failed')
  }
}

function liveParitySnapshot(receipt: Record<string, any>, receiptAbsolute: string): Record<string, any> {
  const rawRoot = receipt.data_snapshot?.root
  const frozenAt = receipt.data_snapshot?.frozen_at
  if (typeof rawRoot !== 'string' || typeof frozenAt !== 'string') {
    throw new Error('provider-parity freeze receipt has no snapshot root/frozen_at')
  }
  const root = path.resolve(path.dirname(receiptAbsolute), rawRoot)
  try {
    const rendered = execFileSync('python3', ['-c', [
      'import json,sys',
      'from scripts.provider_parity_freeze import snapshot_receipt',
      'v=json.load(sys.stdin)',
      'print(json.dumps(snapshot_receipt(v["root"],v["frozen_at"]),sort_keys=True,separators=(",",":")))',
    ].join(';')], {
      cwd: REPO_ROOT, input: JSON.stringify({ root, frozen_at: frozenAt }), encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'ignore'],
    })
    return { root, receipt: JSON.parse(rendered) }
  } catch {
    throw new Error('provider-parity data snapshot could not be re-hashed before launch')
  }
}

function snapshotFingerprint(snapshotRoot: string): Map<string, string> {
  const result = new Map<string, string>()
  const walk = (absolute: string) => {
    const info = fs.lstatSync(absolute, { bigint: true })
    const relative = path.relative(snapshotRoot, absolute).split(path.sep).join('/') || '.'
    result.set(relative, [info.dev, info.ino, info.mode, info.size, info.mtimeNs, info.ctimeNs].join(':'))
    if (info.isSymbolicLink()) throw new Error(`provider-parity snapshot contains a symlink: ${relative}`)
    if (info.isDirectory()) {
      for (const name of fs.readdirSync(absolute).sort()) walk(path.join(absolute, name))
    } else if (!info.isFile()) throw new Error(`provider-parity snapshot contains a special file: ${relative}`)
  }
  walk(snapshotRoot)
  return result
}

function watchParitySnapshot(key: string, snapshotRoot: string): ParitySnapshotWatch {
  const existing = paritySnapshotWatches.get(key)
  if (existing) {
    if (existing.root !== snapshotRoot) throw new Error('one parity freeze digest resolved to two snapshot roots')
    return existing
  }
  const watched: ParitySnapshotWatch = {
    root: snapshotRoot, watchers: [], fingerprint: snapshotFingerprint(snapshotRoot),
    expiresAt: Date.now() + PARITY_WATCH_TTL_MS,
  }
  const directories: string[] = []
  const walk = (directory: string) => {
    directories.push(directory)
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error(`provider-parity snapshot contains a symlink: ${entry.name}`)
      if (entry.isDirectory()) walk(path.join(directory, entry.name))
    }
  }
  walk(snapshotRoot)
  try {
    for (const directory of directories) {
      const watcher = fs.watch(directory, (event, filename) => {
        watched.dirty = `${event}:${filename?.toString() || path.basename(directory)}`
      })
      watcher.on('error', (error) => { watched.dirty = `watch-error:${error.message}` })
      watcher.unref?.()
      watched.watchers.push(watcher)
    }
  } catch (error) {
    for (const watcher of watched.watchers) watcher.close()
    throw new Error(`provider-parity snapshot cannot be monitored: ${String((error as any)?.message || error)}`)
  }
  paritySnapshotWatches.set(key, watched)
  const expiry = setTimeout(() => {
    const current = paritySnapshotWatches.get(key)
    if (current !== watched || current.expiresAt > Date.now()) return
    for (const watcher of current.watchers) watcher.close()
    paritySnapshotWatches.delete(key)
    for (const [pair, registration] of parityReceiptByPair) {
      if (registration.digest === key && registration.expiresAt <= Date.now()) parityReceiptByPair.delete(pair)
    }
  }, PARITY_WATCH_TTL_MS + 1000)
  expiry.unref?.()
  return watched
}

function expectedSnapshotReceipt(receipt: Record<string, any>): Record<string, unknown> {
  const source = receipt.data_snapshot ?? {}
  return Object.fromEntries(['sha256', 'file_count', 'bytes', 'frozen_at', 'files'].map((key) => [key, source[key]]))
}

function repoPath(absolute: string): string | null {
  const repo = path.resolve(REPO_ROOT)
  const resolved = path.resolve(absolute)
  if (resolved !== repo && !resolved.startsWith(`${repo}${path.sep}`)) return null
  return path.relative(repo, resolved).split(path.sep).join('/')
}

/** Validate and freeze an optional paired-canary binding before any provider child can run. */
function parityPrelaunchBinding(run: RunState): Record<string, unknown> | null {
  if (!run.runRoot) return null
  const bindingAbsolute = path.join(REPO_ROOT, run.runRoot, '.provider-parity-input.json')
  if (!fs.existsSync(bindingAbsolute)) return null
  const bindingBytes = readStableRegularFile(bindingAbsolute, 'provider-parity run binding')
  const binding = jsonObject(bindingBytes, 'provider-parity run binding')
  const expectedRoot = path.resolve(REPO_ROOT, run.runRoot)
  const expected = {
    provider: run.provider,
    expected_model: run.model,
    expected_reasoning_level: run.reasoningLevel,
    expected_profile_key: run.profileKey,
  }
  for (const [key, value] of Object.entries(expected)) {
    if (binding[key] !== value) throw new Error(`provider-parity binding ${key} does not match this launch`)
  }
  if (resolveParityBindingPath(String(binding.run_root || '')) !== expectedRoot) {
    throw new Error('provider-parity binding run_root does not match this launch')
  }
  if (binding.subject !== run.subjectId) throw new Error('provider-parity binding subject does not match this launch')
  if (!['run_a', 'run_b'].includes(binding.label)) throw new Error('provider-parity binding has an invalid run label')
  const receiptAbsolute = resolveParityBindingPath(String(binding.receipt_path || ''))
  if (!receiptAbsolute) throw new Error('provider-parity binding receipt_path is invalid')
  const receiptBytes = readStableRegularFile(receiptAbsolute, 'provider-parity freeze receipt')
  const receipt = jsonObject(receiptBytes, 'provider-parity freeze receipt')
  validateParityContracts(bindingBytes, receiptBytes)
  if (receipt.schema_version !== 'provider-parity-freeze/2.0') {
    throw new Error('provider-parity freeze receipt has the wrong schema version')
  }
  const selfDigest = parityReceiptSelfDigest(receiptBytes)
  if (binding.receipt_sha256 !== selfDigest || receipt.receipt_sha256 !== selfDigest) {
    throw new Error('provider-parity freeze receipt self-digest does not match the prelaunch binding')
  }
  if (binding.data_snapshot_sha256 !== receipt.data_snapshot?.sha256) {
    throw new Error('provider-parity snapshot digest does not match the freeze receipt')
  }
  const boundRun = Array.isArray(receipt.runs) ? receipt.runs.find((item: any) => item?.label === binding.label) : null
  if (!boundRun || boundRun.provider !== run.provider
      || path.resolve(path.dirname(receiptAbsolute), boundRun.run_root) !== expectedRoot
      || boundRun.expected_model !== run.model || boundRun.expected_reasoning_level !== run.reasoningLevel
      || boundRun.expected_profile_key !== run.profileKey) {
    throw new Error('provider-parity freeze receipt does not bind this exact provider run')
  }
  const pairRoots = (Array.isArray(receipt.runs) ? receipt.runs : []).map((item: any) =>
    path.resolve(path.dirname(receiptAbsolute), String(item?.run_root || ''))).sort()
  if (pairRoots.length !== 2 || new Set(pairRoots).size !== 2
      || pairRoots[0].startsWith(`${pairRoots[1]}${path.sep}`) || pairRoots[1].startsWith(`${pairRoots[0]}${path.sep}`)
      || pairRoots.some((item) => item === path.dirname(receiptAbsolute))) {
    throw new Error('provider-parity freeze receipt does not declare two concrete run roots')
  }
  const pairKey = pairRoots.join('\0')
  const priorReceipt = parityReceiptByPair.get(pairKey)
  if (priorReceipt && priorReceipt.expiresAt > Date.now() && priorReceipt.digest !== selfDigest) {
    throw new Error('the paired Claude/Codex roots were registered against different freeze receipts')
  }
  const pairRegistration = priorReceipt && priorReceipt.expiresAt > Date.now()
    ? priorReceipt
    : {
      digest: selfDigest,
      registrationId: randomUUID(),
      supervisorInstanceId: SUPERVISOR_INSTANCE_ID,
      expiresAt: Date.now() + PARITY_WATCH_TTL_MS,
    }
  parityReceiptByPair.set(pairKey, pairRegistration)
  const liveSnapshot = liveParitySnapshot(receipt, receiptAbsolute)
  if (!isDeepStrictEqual(liveSnapshot.receipt, expectedSnapshotReceipt(receipt))) {
    throw new Error('provider-parity data snapshot differs from its freeze receipt before launch')
  }
  const monitor = watchParitySnapshot(selfDigest, liveSnapshot.root as string)
  // Close the tiny hash->watch setup gap: mutations after this second read are caught by the watchers.
  const watchedSnapshot = liveParitySnapshot(receipt, receiptAbsolute)
  if (monitor.dirty || !isDeepStrictEqual(watchedSnapshot.receipt, expectedSnapshotReceipt(receipt))) {
    throw new Error('provider-parity data snapshot changed while prelaunch monitoring was established')
  }
  return {
    schema_version: 'provider-parity-supervisor-binding/1.0',
    supervisor_instance_id: pairRegistration.supervisorInstanceId,
    pair_registration_id: pairRegistration.registrationId,
    binding_path: repoPath(bindingAbsolute) ?? bindingAbsolute,
    binding_file_sha256: sha256Bytes(bindingBytes),
    freeze_receipt_path: repoPath(receiptAbsolute) ?? receiptAbsolute,
    freeze_receipt_file_sha256: sha256Bytes(receiptBytes),
    freeze_receipt_sha256: selfDigest,
    data_snapshot_sha256: binding.data_snapshot_sha256,
    snapshot_prelaunch_sha256: watchedSnapshot.receipt.sha256,
    snapshot_root: liveSnapshot.root,
    snapshot_monitor_key: selfDigest,
    snapshot_verified_at: new Date().toISOString(),
    price_anchor_sha256: binding.price_anchor_sha256,
    label: binding.label,
    provider: run.provider,
    run_root: run.runRoot,
    profile_key: run.profileKey,
  }
}

/** Re-hash and attest the same frozen bytes at publication; the watcher also catches A→B→A changes. */
export function attestParitySnapshotAtPublication(run: RunState): void {
  const binding = run.parityPrelaunchBinding as Record<string, any> | undefined
  if (!binding) return
  const monitor = paritySnapshotWatches.get(binding.snapshot_monitor_key)
  if (!monitor || monitor.dirty) {
    throw new Error(`provider-parity snapshot changed during execution${monitor?.dirty ? ` (${monitor.dirty})` : ''}`)
  }
  if (!isDeepStrictEqual(snapshotFingerprint(monitor.root), monitor.fingerprint)) {
    throw new Error('provider-parity snapshot inode/stat fingerprint changed during execution')
  }
  const receiptAbsolute = resolveParityBindingPath(String(binding.freeze_receipt_path || ''))
  const bindingAbsolute = resolveParityBindingPath(String(binding.binding_path || ''))
  if (!receiptAbsolute || !bindingAbsolute) {
    throw new Error('provider-parity supervisor binding contains an invalid path')
  }
  if (sha256Bytes(readStableRegularFile(receiptAbsolute, 'provider-parity freeze receipt'))
      !== binding.freeze_receipt_file_sha256
      || sha256Bytes(readStableRegularFile(bindingAbsolute, 'provider-parity run binding'))
      !== binding.binding_file_sha256) {
    throw new Error('provider-parity binding or freeze receipt changed after prelaunch registration')
  }
  const receipt = jsonObject(fs.readFileSync(receiptAbsolute), 'provider-parity freeze receipt')
  const live = liveParitySnapshot(receipt, receiptAbsolute)
  if (!isDeepStrictEqual(live.receipt, expectedSnapshotReceipt(receipt))) {
    throw new Error('provider-parity data snapshot differs from its freeze receipt at publication')
  }
  const already = (run.currentExecutionAttempts ?? []).find((row) => row.parity_publication)?.parity_publication
  const publication = already ?? {
    schema_version: 'provider-parity-supervisor-publication/1.0',
    supervisor_instance_id: binding.supervisor_instance_id,
    pair_registration_id: binding.pair_registration_id,
    snapshot_sha256: live.receipt.sha256,
    freeze_receipt_sha256: binding.freeze_receipt_sha256,
    verified_at: new Date().toISOString(),
  }
  for (const row of run.currentExecutionAttempts ?? []) row.parity_publication = publication
}

/** Terminal parity verification consumes the live registration; aborted/one-sided pairs use the TTL. */
export function releaseParityRegistration(run: RunState): void {
  const binding = run.parityPrelaunchBinding as Record<string, any> | undefined
  if (!binding) return
  const monitor = paritySnapshotWatches.get(binding.snapshot_monitor_key)
  if (monitor) {
    for (const watcher of monitor.watchers) watcher.close()
    paritySnapshotWatches.delete(binding.snapshot_monitor_key)
  }
  for (const [pairKey, registration] of parityReceiptByPair) {
    if (registration.registrationId === binding.pair_registration_id) parityReceiptByPair.delete(pairKey)
  }
}

function gitBlob(relative: string): string | null {
  try {
    return execFileSync('git', ['show', `HEAD:${relative}`], { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
  } catch { return null }
}

function committedReceiptRows(runRoot: string): any[] {
  let paths: string[] = []
  try {
    paths = execFileSync('git', ['ls-tree', '-r', '--name-only', 'HEAD', '--', runRoot], {
      cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).split('\n').filter((item) => item === `${runRoot}/${EXECUTION_PROVENANCE_RECEIPT}`
      || item.endsWith(`/${EXECUTION_PROVENANCE_RECEIPT}`))
  } catch { return [] }
  const receipts = paths.flatMap((relative) => {
    const value = parseJson(gitBlob(relative))
    if (!value || value.source !== 'cockpit_supervisor' || !Array.isArray(value.attempts)) return []
    return [{ writtenAt: typeof value.written_at === 'string' ? value.written_at : '', attempts: value.attempts }]
  }).sort((left, right) => left.writtenAt.localeCompare(right.writtenAt))
  return receipts.flatMap((receipt) => receipt.attempts)
}

function trustedCommitTime(relative: string): number | null {
  try {
    const raw = execFileSync('git', ['log', '-1', '--format=%ct', '--', relative], {
      cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    const seconds = Number(raw)
    return Number.isFinite(seconds) && seconds > 0 ? seconds * 1000 : null
  } catch { return null }
}

/** Back-compatible diagnostic only. Manifest absence is never used to guess Claude anymore. */
export function hasLegacyPriorUnattributed(runRoot: string): boolean {
  const absoluteRoot = path.resolve(REPO_ROOT, runRoot)
  if (!repoPath(absoluteRoot)) return false
  try {
    return fs.readdirSync(absoluteRoot, { withFileTypes: true }).some((entry) => {
      if (entry.isFile()) return ['decision_record.json', 'thesis_record.json', 'final_thesis.md'].includes(entry.name)
      if (!entry.isDirectory()) return false
      return fs.readdirSync(path.join(absoluteRoot, entry.name)).some((name) => /^[0-9]{2}_.*\.md$/.test(name))
    })
  } catch { return false }
}

/**
 * There is no protected pre-rollout provider registry in this checkout. Git objects and commit
 * dates are writable by the same UID as a tracked child, so they cannot prove a provider across
 * a supervisor restart. Automatic work therefore abstains; a human may explicitly resume with a
 * selected provider, which creates an honestly mixed/partially-observed continuation.
 */
export function hasProvenLegacyClaudeLineage(_runRoot: string): boolean { return false }

/** See hasProvenLegacyClaudeLineage: an artifact's age is not provider authentication. */
export function hasProvenLegacyClaudeArtifact(_relative: string): boolean { return false }

export function isDecisionAuthor(run: RunState): boolean {
  if (run.kind === 'full' || run.kind === 'rerun' || run.kind === 'signal' || run.kind === 'parity') return true
  // `agent === synthesizer` is not sufficient: module-level synthesizers are contributors, not the
  // top-level adjudicator. Constellation swarms name terminal modules `*-thesis`/`*-decision`.
  return run.module === 'master' || /(?:thesis|decision)$/.test(run.module || '')
}

function roleFor(run: RunState): 'terminal_adjudicator' | 'specialist' | 'module_synthesis' | 'orchestrator' | 'memo' {
  if (isDecisionAuthor(run)) return 'terminal_adjudicator'
  if (run.kind === 'agent' || run.kind === 'screener-agent') return 'specialist'
  if (run.kind === 'module') return 'module_synthesis'
  if (run.kind === 'track' || run.kind === 'review') return 'memo'
  return 'orchestrator'
}

export function decisionArtifacts(run: RunState): string[] {
  if (!isDecisionAuthor(run)) return []
  if (run.kind === 'parity') return [] // adjudication receipt is issued through the live supervisor endpoint
  return [...(swarmById(run.swarmId)?.decisionArtifacts ?? [])]
}

export function provenanceManifestPath(run: RunState): string {
  if (!run.runRoot) throw new Error(`Run ${run.runId} has no resolved run root for provenance.`)
  const root = path.resolve(REPO_ROOT, run.runRoot)
  const repo = path.resolve(REPO_ROOT)
  if (root !== repo && !root.startsWith(`${repo}${path.sep}`)) {
    throw new Error(`Run ${run.runId} provenance root escapes the repository.`)
  }
  return path.join(root, EXECUTION_PROVENANCE_BASENAME)
}

function currentAttemptRows(run: RunState): Array<Record<string, unknown>> {
  const role = roleFor(run)
  // A bounded automatic continuation may be needed only to publish/memo an already-authored verdict.
  // The process that wrote the decision remains the author; the continuation is a recorded contributor.
  const decisionAuthor = role === 'terminal_adjudicator'
    && run.automaticContinuationRetainsDecisionAuthor !== true
  const model = run.model?.trim()
  const reasoningLevel = run.reasoningLevel?.trim()
  if (decisionAuthor && (!model || !reasoningLevel)) {
    throw new Error(`Terminal run ${run.runId} has no runtime-recorded model/reasoning provenance.`)
  }
  const startedAt = new Date().toISOString()
  const row = {
    schema_version: '1.0',
    event: 'attempt_started',
    attempt_id: run.providerAttemptId ?? run.runId,
    provider: run.provider,
    model: model || null,
    reasoning_level: reasoningLevel || null,
    attribution: 'recorded',
    profile_key: run.profileKey,
    cli_version: run.cliVersion ?? null,
    scope: [run.swarmId, run.kind, ...(run.module ? [run.module] : []), ...(run.agent ? [run.agent] : [])],
    role,
    decision_author: decisionAuthor,
    decision_artifacts: decisionAuthor ? decisionArtifacts(run) : [],
    // A signal process may validly stop at an early routing gate before any thesis exists. If it reaches
    // edge-definition, the same declared target becomes mandatory-by-presence and is stamped; an absent
    // conditional thesis is not treated as a failed publication.
    decision_artifacts_optional: run.kind === 'signal',
    started_at: startedAt,
  }
  const specialistModel = run.executionProfile.specialistModel?.trim() || model
  const specialistReasoning = run.executionProfile.specialistReasoning?.trim() || reasoningLevel
  // A profile's specialist tier is capability metadata until the selected command actually has a Task
  // surface. Task-free review/track/intake/sweep/handoff processes must not claim an unused contributor.
  const hasNestedTaskSurface = (run.expected.size > 0
    && ['full', 'module', 'rerun', 'signal'].includes(run.kind))
    || run.kind === 'conviction'
  const specialistConfigured = hasNestedTaskSurface
    && Boolean(run.executionProfile.specialistModel?.trim() || run.executionProfile.specialistReasoning?.trim())
  const rows: Array<Record<string, unknown>> = [row]
  if (specialistConfigured) {
    rows.push({
      ...row,
      model: specialistModel || null,
      reasoning_level: specialistReasoning || null,
      attribution: 'configured',
      scope: ['specialists'],
      role: 'specialist',
      decision_author: false,
      decision_artifacts: [],
    })
  }
  // These two canonical research roles explicitly declare `model: opus` outside the discovered SWARM
  // roster. Record the configured nested tier separately; otherwise a Sonnet parent would falsely imply
  // that all retained memo work used Sonnet. Codex maps the same explicit alias to its Sol/max contract.
  const configuredMemo = run.swarmId === 'research' && run.expected.size > 0
    ? run.kind === 'module' ? 'module-memo-writer'
      : (run.kind === 'full' || run.kind === 'rerun') ? 'memo-writer' : null
    : null
  if (configuredMemo) {
    const memoModel = run.provider === 'claude' ? 'opus' : run.executionProfile.parentModel || model
    const memoReasoning = run.provider === 'claude' ? 'default' : run.executionProfile.parentReasoning || reasoningLevel
    rows.push({
      ...row,
      model: memoModel || null,
      reasoning_level: memoReasoning || null,
      attribution: 'configured',
      scope: ['memo', configuredMemo],
      role: 'memo',
      decision_author: false,
      decision_artifacts: [],
    })
  }
  if (run.kind === 'parity') {
    rows.push({
      ...row,
      model: run.provider === 'claude' ? 'opus' : run.executionProfile.parentModel || model || null,
      reasoning_level: run.provider === 'claude' ? 'default' : run.executionProfile.parentReasoning || reasoningLevel || null,
      attribution: 'configured',
      scope: ['provider-parity-adjudicator'],
      role: 'module_synthesis',
      decision_author: false,
      decision_artifacts: [],
    })
  }
  return rows
}

function receiptRows(value: unknown, scope: string): Array<Record<string, unknown>> {
  if (!value || typeof value !== 'object') return []
  const raw = (value as any).attempts
  if (!Array.isArray(raw)) return []
  const rows: Array<Record<string, unknown>> = []
  for (const item of raw) {
    if (!item || typeof item !== 'object' || !['claude', 'codex'].includes((item as any).provider)) continue
    rows.push({
      ...item,
      attempt_id: randomUUID(),
      attribution: 'configured',
      role: 'specialist',
      decision_author: false,
      decision_artifacts: [],
      decision_artifacts_optional: false,
      scope: [scope],
    })
  }
  return rows
}

function projectionRows(value: unknown, scope: string): Array<Record<string, unknown>> {
  const provenance = value && typeof value === 'object' ? (value as any).execution_provenance ?? value : null
  if (!provenance || !Array.isArray(provenance.contributors)) return []
  const cli = provenance.cli_versions && typeof provenance.cli_versions === 'object' ? provenance.cli_versions : {}
  return provenance.contributors.flatMap((item: any) => {
    if (!item || !['claude', 'codex'].includes(item.provider)) return []
    return [{
      schema_version: '1.0', event: 'lineage_imported', attempt_id: randomUUID(),
      provider: item.provider, model: typeof item.model === 'string' ? item.model : null,
      reasoning_level: typeof item.reasoning_level === 'string' ? item.reasoning_level : null,
      attribution: 'configured', profile_key: `${item.provider}|${item.model || 'unknown-model'}:${item.reasoning_level || 'unknown-reasoning'}`,
      cli_version: typeof cli[item.provider] === 'string' ? cli[item.provider] : null,
      scope: [scope], role: 'specialist', decision_author: false, decision_artifacts: [],
      decision_artifacts_optional: false, started_at: new Date().toISOString(),
    }]
  })
}

/** Pure test seam for the durable projection -> non-author lineage contract. */
export function projectionLineageRows(value: unknown, scope = 'lineage:test'): Array<Record<string, unknown>> {
  return projectionRows(value, scope)
}

function parseJson(text: string | null): any | null {
  if (!text) return null
  try { return JSON.parse(text) } catch { return null }
}

/** Import only canonical rows retained by this live supervisor; disk/Git are same-UID child-writable. */
function trustedLineage(run: RunState): Array<Record<string, unknown>> {
  if (!run.runRoot) return []
  const durableSealed = readProtectedJson(supervisorSealedAuthorityForRunRoot(run.runRoot))
  const sealed = sealedAttemptsByRunRoot.get(run.runRoot) ?? (
    durableSealed?.schema_version === 'cockpit-sealed-lineage/1.0'
      && durableSealed.run_root === run.runRoot
      && Array.isArray(durableSealed.rows)
      && durableSealed.artifact_hashes && typeof durableSealed.artifact_hashes === 'object'
      ? { rows: durableSealed.rows, artifactHashes: durableSealed.artifact_hashes } : undefined
  )
  const sealedValid = Boolean(sealed && Object.entries(sealed.artifactHashes).every(([relative, expected]) => {
    const digest = sha256File(path.join(REPO_ROOT, relative))
    return digest !== null && `sha256:${digest}` === expected
  }))
  const selection = readProviderSelectionRecord(run.runRoot)
  const durableUnsealed = !sealed && !(liveAttemptsByRunRoot.get(run.runRoot)?.length)
    && selection?.stage === 'spawned'
    ? readProtectedManifestRows(run.runRoot, selection.run_id) : []
  const livePrior = [
    ...(sealedValid ? sealed!.rows : []),
    ...durableUnsealed,
    ...(run.protectedPriorExecutionAttempts ?? []),
    ...(liveAttemptsByRunRoot.get(run.runRoot) ?? []),
  ]
  const identities = new Set<string>()
  const liveRows = livePrior.flatMap((item) => {
    const identity = JSON.stringify([
      item.attempt_id, item.provider, item.model, item.reasoning_level, item.attribution, item.scope,
    ])
    if (identities.has(identity)) return []
    identities.add(identity)
    return [{
      ...item,
      // Preserve canonical attempt identity and observation strength across every continuation.
      event: 'lineage_imported',
      attribution: item.attribution === 'recorded' ? 'recorded' : 'configured',
      scope: ['live_prior_attempt'],
      role: 'specialist',
      decision_author: false,
      decision_artifacts: [],
      decision_artifacts_optional: false,
    }]
  })
  // Stable commodity folders contain older completed decisions, so disk lineage starts clean each epoch.
  // A canonical in-memory attempt which failed before publication is different: it belongs to this live
  // continuation and must remain visible (especially across an explicit provider switch).
  if (run.swarmId === 'commodity') return liveRows
  const root = path.join(REPO_ROOT, run.runRoot)
  let entries: fs.Dirent[] = []
  try { entries = fs.readdirSync(root, { withFileTypes: true }) } catch { return liveRows }
  const rows: Array<Record<string, unknown>> = [...liveRows]
  let unobserved = false
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const module = entry.name
    const moduleDir = path.join(root, module)
    const hasOutput = (() => {
      try { return fs.readdirSync(moduleDir).some((name) => /^[0-9]{2}_.*\.md$/.test(name)) } catch { return false }
    })()
    if (!hasOutput) continue
    // A same-UID provider can edit worktree files, raw Git commits and refs. Without an OS-protected
    // signature/service, a disk-only contributor can be reported only as unobserved, never credited to
    // whichever provider happens to finish this continuation.
    unobserved = true
  }
  run.priorExecutionUnobserved = unobserved
  return rows
}

/** Register canonical rows and freshness baselines immediately before spawn. No child-visible file is read. */
export function beginExecutionAttempt(run: RunState): void {
  if (!run.runRoot) throw new Error(`Run ${run.runId} has no run root for execution provenance.`)
  run.parityPrelaunchBinding = parityPrelaunchBinding(run) ?? undefined
  const epoch = run.provenanceEpoch || run.chainId || run.runId
  run.provenanceEpoch = epoch
  let rows = attemptsByEpoch.get(epoch)
  if (!rows) {
    rows = trustedLineage(run)
    attemptsByEpoch.set(epoch, rows)
  }
  const current = currentAttemptRows(run)
  if (run.parityPrelaunchBinding) {
    for (const item of current) item.parity_prelaunch = run.parityPrelaunchBinding
  }
  rows.push(...current)
  if (run.priorExecutionUnobserved) {
    for (const item of current) item.prior_unobserved = true
  }
  run.currentExecutionAttempts = current
  run.executionAttempts = rows
  const retained = liveAttemptsByRunRoot.get(run.runRoot) ?? []
  const identities = new Set(retained.map((item) => JSON.stringify([
    item.attempt_id, item.provider, item.model, item.reasoning_level, item.attribution, item.scope,
  ])))
  const cumulative = retained.map((item) => ({ ...item }))
  for (const item of current) {
    const identity = JSON.stringify([
      item.attempt_id, item.provider, item.model, item.reasoning_level, item.attribution, item.scope,
    ])
    if (!identities.has(identity)) { identities.add(identity); cumulative.push({ ...item }) }
  }
  liveAttemptsByRunRoot.set(run.runRoot, cumulative)
  liveSelectionByRunRoot.set(run.runRoot, {
    provider: run.provider,
    model: run.model,
    reasoningLevel: run.reasoningLevel,
    profileKey: run.profileKey,
    executionProfile: run.executionProfile,
  })
  const priorBaselines = run.publicationBaselines
  const baselines: Record<string, string | null> = {}
  for (const relative of decisionArtifacts(run)) {
    // Automatic processes belong to one admitted logical run. Preserve the first process's pre-spawn
    // bytes so a decision it authored stays fresh when a later process performs publication only.
    // A manual resume creates a new RunState and therefore captures a new baseline normally.
    baselines[relative] = priorBaselines
      && Object.prototype.hasOwnProperty.call(priorBaselines, relative)
      ? priorBaselines[relative]
      : sha256File(path.join(REPO_ROOT, run.runRoot, relative))
  }
  // Outcome reviews are append-only. Capture every pre-existing review filename before the provider
  // starts so the publication boundary can accept only files created by this exact attempt; an untrusted
  // child cannot overwrite an older review and then nominate the modified history as its new output.
  if (run.kind === 'review') {
    const reviewsDir = path.join(REPO_ROOT, run.runRoot, 'reviews')
    try {
      for (const entry of fs.readdirSync(reviewsDir, { withFileTypes: true })) {
        if (!entry.isFile() || entry.isSymbolicLink()) continue
        const relative = `reviews/${entry.name}`
        baselines[relative] = sha256File(path.join(reviewsDir, entry.name))
      }
    } catch { /* a new run may not have a reviews directory yet */ }
  }
  run.publicationBaselines = baselines
  const durable = supervisorManifestForRunRoot(run.runRoot)
  fs.mkdirSync(path.dirname(durable), { recursive: true, mode: 0o700 })
  fs.writeFileSync(durable, `${rows.map((item) => JSON.stringify(item)).join('\n')}\n`, { encoding: 'utf8', mode: 0o600 })
  const manifestDigest = protectedSelectionArtifactHash(durable)
  if (!manifestDigest) throw new Error(`Run ${run.runId} supervisor manifest could not be sealed.`)
  writeProviderSelection(run, 'spawned', { [durable]: manifestDigest })
}

/** Compatibility alias for older tests/callers; the manifest path is intentionally ignored. */
export function appendExecutionAttempt(run: RunState, _manifestPath?: string): void {
  beginExecutionAttempt(run)
}

/** A clean-but-incomplete terminal parent did not author the eventual verdict. Retain it as a recorded
 * contributor, but move decision-author authority to the continuation process that actually publishes.
 * `allRecorded` handles the defensive case where a publication-only process invalidated the retained
 * verdict: every older author is then superseded before a replacement author starts. */
export function supersedeIncompleteDecisionAuthorAttempt(run: RunState, allRecorded = false): void {
  if (!isDecisionAuthor(run)) return
  const attemptId = run.providerAttemptId ?? run.runId
  const demote = (row: Record<string, unknown>) => {
    if ((!allRecorded && row.attempt_id !== attemptId)
        || row.attribution !== 'recorded' || row.decision_author !== true) return
    row.decision_author = false
    row.decision_artifacts = []
  }
  for (const row of run.executionAttempts ?? []) demote(row)
  for (const row of (run.runRoot ? liveAttemptsByRunRoot.get(run.runRoot) : undefined) ?? []) demote(row)
}

export function canonicalManifestPath(run: RunState): string {
  const dir = path.join(STATE_DIR, 'execution-provenance')
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 })
  const file = path.join(dir, `${run.runId}.jsonl`)
  const rows = (run.executionAttempts ?? []).map((row) => ({
    ...row, decision_artifacts: [], decision_artifacts_optional: false,
  }))
  if (!rows.length) throw new Error(`Run ${run.runId} has no supervisor-owned execution attempts.`)
  fs.writeFileSync(file, `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`, { encoding: 'utf8', mode: 0o600 })
  return file
}

/** Canonical manifest bytes passed to the projector over stdin. No child-writable path is authoritative. */
export function canonicalManifestJsonl(run: RunState): string {
  const rows = (run.executionAttempts ?? []).map((row) => ({
    ...row, decision_artifacts: [], decision_artifacts_optional: false,
  }))
  if (!rows.length) throw new Error(`Run ${run.runId} has no supervisor-owned execution attempts.`)
  return `${rows.map((row) => JSON.stringify(row)).join('\n')}\n`
}

export function artifactIsFresh(run: RunState, relative: string): boolean {
  if (!run.runRoot) return false
  const current = sha256File(path.join(REPO_ROOT, run.runRoot, relative))
  return current !== null && current !== (run.publicationBaselines?.[relative] ?? null)
}

export function receiptPath(run: RunState): string | null {
  if (!run.runRoot) return null
  const parent = run.module && run.module !== 'master' ? `${run.runRoot}/${run.module}` : run.runRoot
  return `${parent}/${EXECUTION_PROVENANCE_RECEIPT}`
}

export function writeExecutionReceipt(run: RunState): { path: string; sha256: string } | null {
  const relative = receiptPath(run)
  if (!relative) return null
  const payload = JSON.stringify({
    schema_version: '1.0', source: 'cockpit_supervisor', epoch_id: run.provenanceEpoch,
    attempts: run.executionAttempts ?? [], written_at: new Date().toISOString(),
  }, null, 2) + '\n'
  const digest = `sha256:${createHash('sha256').update(payload).digest('hex')}`
  const insideRoot = path.relative(run.runRoot!, relative).split(path.sep).join('/')
  writeSupervisorRunFile(run.runRoot!, insideRoot, payload, 0o600)
  return { path: relative, sha256: digest }
}

/** Drop a completed epoch only after its terminal author safely published. Chained siblings retain it. */
export function releaseExecutionEpochAfterPublication(run: RunState): void {
  if (!run.publicationCompleted || !isDecisionAuthor(run) || !run.provenanceEpoch) return
  if (run.runRoot && run.publicationArtifactHashes && Object.keys(run.publicationArtifactHashes).length) {
    writeProviderSelection(run, 'published', run.publicationArtifactHashes)
  }
  attemptsByEpoch.delete(run.provenanceEpoch)
  if (run.runRoot) {
    if (run.swarmId === 'commodity') {
      sealedAttemptsByRunRoot.delete(run.runRoot)
    } else if (run.executionAttempts?.length && run.publicationArtifactHashes
        && Object.keys(run.publicationArtifactHashes).length > 0) {
      sealedAttemptsByRunRoot.set(run.runRoot, {
        rows: run.executionAttempts.map((row) => ({ ...row })),
        artifactHashes: { ...run.publicationArtifactHashes },
      })
      const target = supervisorSealedAuthorityForRunRoot(run.runRoot)
      const temporary = `${target}.${run.runId}.tmp`
      fs.mkdirSync(path.dirname(target), { recursive: true, mode: 0o700 })
      fs.writeFileSync(temporary, JSON.stringify({
        schema_version: 'cockpit-sealed-lineage/1.0', run_root: run.runRoot,
        rows: run.executionAttempts, artifact_hashes: run.publicationArtifactHashes,
        sealed_at: new Date().toISOString(),
      }, null, 2) + '\n', { encoding: 'utf8', mode: 0o600 })
      fs.renameSync(temporary, target)
    }
    liveAttemptsByRunRoot.delete(run.runRoot)
  }
}

/** Focused test seam for the long-lived-server epoch lifecycle. */
export function executionEpochAttemptCount(epoch: string): number {
  return attemptsByEpoch.get(epoch)?.length ?? 0
}

export interface RecordedProviderSelection {
  provider: RunProvider
  model?: string
  reasoningLevel?: string
  profileKey?: string
  executionProfile?: ProviderExecutionProfile
}

export interface ProviderInterruptionAuthority extends RecordedProviderSelection {
  /** Logical RunState identity carried by the exact supervisor-written interruption marker. */
  interruptionRunId?: string
  runId: string
  model: string
  profileKey: string
  executionProfile: ProviderExecutionProfile
}

/** Owner-only proof that the supervisor published the exact bytes which are still on disk. Reading this
 * record re-hashes every bound artifact; a copied final_thesis/decision pair or a stale mutable projection
 * is therefore not publication authority. */
export interface ProviderPublicationAuthority extends RecordedProviderSelection {
  runId: string
  model: string
  profileKey: string
  executionProfile: ProviderExecutionProfile
  artifactHashes: Record<string, string>
}

type ProviderSelectionStage = 'admitted' | 'spawned' | 'interrupted' | 'published'

function providerSelectionPath(runRoot: string): string {
  return supervisorManifestForRunRoot(runRoot).replace(/\.jsonl$/, '.selection.json')
}

interface ProviderInterruptionRecord {
  schema_version: 'cockpit-provider-interruption/1.0'
  run_root: string
  interruption_run_id: string
  provider_attempt_id: string
  recorded_at: string
  provider: RunProvider
  model: string
  reasoningLevel?: string
  profileKey: string
  executionProfile: ProviderExecutionProfile
  marker_sha256: string
  self_sha256: string
}

function providerInterruptionDirectory(runRoot: string): string {
  const rootKey = createHash('sha256').update(runRoot).digest('hex')
  return path.join(STATE_DIR, 'execution-provenance', 'interruptions', rootKey)
}

function providerInterruptionPath(runRoot: string, interruptionRunId: string): string {
  const attemptKey = createHash('sha256').update(interruptionRunId).digest('hex')
  return path.join(providerInterruptionDirectory(runRoot), `${attemptKey}.json`)
}

function providerInterruptionDigest(value: Omit<ProviderInterruptionRecord, 'self_sha256'>): string {
  return sha256Bytes(JSON.stringify(value))
}

function syncProtectedDirectory(directory: string): void {
  if (process.platform === 'win32') return
  const fd = fs.openSync(directory, fs.constants.O_RDONLY)
  try { fs.fsyncSync(fd) } finally { fs.closeSync(fd) }
}

function interruptionMarker(runRoot: string): { value: Record<string, unknown>; sha256: string } | null {
  const absoluteRoot = path.resolve(REPO_ROOT, runRoot)
  const relativeRoot = repoPath(absoluteRoot)
  if (relativeRoot !== runRoot) return null
  try {
    const bytes = readStableRegularFile(path.join(absoluteRoot, '.interrupted'), 'provider interruption marker')
    const value = jsonObject(bytes, 'provider interruption marker')
    return { value, sha256: sha256Bytes(bytes) }
  } catch { return null }
}

function readProviderInterruptionRecord(
  runRoot: string,
  interruptionRunId: string,
  marker: { value: Record<string, unknown>; sha256: string },
): ProviderInterruptionRecord | null {
  const target = providerInterruptionPath(runRoot, interruptionRunId)
  const value = readProtectedJson(target)
  if (!value || value.schema_version !== 'cockpit-provider-interruption/1.0'
      || value.run_root !== runRoot || value.interruption_run_id !== interruptionRunId
      || typeof value.provider_attempt_id !== 'string' || !value.provider_attempt_id
      || !['claude', 'codex'].includes(value.provider) || typeof value.model !== 'string'
      || typeof value.profileKey !== 'string' || !value.executionProfile
      || typeof value.executionProfile !== 'object' || typeof value.marker_sha256 !== 'string'
      || typeof value.self_sha256 !== 'string') return null
  const { self_sha256: digest, ...unsigned } = value as ProviderInterruptionRecord
  if (providerInterruptionDigest(unsigned) !== digest || value.marker_sha256 !== marker.sha256) return null
  if (marker.value.runId !== interruptionRunId
      || (typeof marker.value.attemptId === 'string'
        ? marker.value.attemptId !== value.provider_attempt_id
        : interruptionRunId !== value.provider_attempt_id)) return null
  try {
    const info = fs.lstatSync(target)
    if (info.nlink !== 1) return null
  } catch { return null }
  return value as ProviderInterruptionRecord
}

function writeProviderInterruptionRecord(run: ProviderSelectionInput): void {
  if (!run.runRoot) throw new Error(`Run ${run.runId} has no run root for interruption authority.`)
  const marker = interruptionMarker(run.runRoot)
  const interruptionRunId = typeof marker?.value.runId === 'string' ? marker.value.runId : ''
  const providerAttemptId = run.providerAttemptId ?? run.runId
  if (!marker || !interruptionRunId || interruptionRunId !== run.runId
      || (typeof marker.value.attemptId === 'string' && marker.value.attemptId !== providerAttemptId)) {
    throw new Error('cannot seal provider identity: interruption marker identity does not match this run')
  }
  const directory = providerInterruptionDirectory(run.runRoot)
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 })
  if (process.platform !== 'win32') fs.chmodSync(directory, 0o700)
  const target = providerInterruptionPath(run.runRoot, interruptionRunId)
  const unsigned: Omit<ProviderInterruptionRecord, 'self_sha256'> = {
    schema_version: 'cockpit-provider-interruption/1.0',
    run_root: run.runRoot,
    interruption_run_id: interruptionRunId,
    provider_attempt_id: providerAttemptId,
    recorded_at: new Date().toISOString(),
    provider: run.provider,
    model: run.model,
    reasoningLevel: run.reasoningLevel,
    profileKey: run.profileKey,
    executionProfile: run.executionProfile,
    marker_sha256: marker.sha256,
  }
  const record: ProviderInterruptionRecord = {
    ...unsigned,
    self_sha256: providerInterruptionDigest(unsigned),
  }
  const existing = readProtectedJson(target)
  if (existing) {
    const stable = readProviderInterruptionRecord(run.runRoot, interruptionRunId, marker)
    if (!stable || stable.provider_attempt_id !== providerAttemptId || stable.provider !== run.provider
        || stable.model !== run.model || stable.reasoningLevel !== run.reasoningLevel
        || stable.profileKey !== run.profileKey
        || !isDeepStrictEqual(stable.executionProfile, run.executionProfile)) {
      throw new Error('immutable provider interruption authority already belongs to a different attempt')
    }
    return
  }
  const temporary = path.join(directory, `.${path.basename(target)}.${process.pid}.${randomUUID()}.tmp`)
  let fd: number | null = null
  try {
    fd = fs.openSync(temporary, fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL, 0o600)
    fs.writeFileSync(fd, `${JSON.stringify(record, null, 2)}\n`, 'utf8')
    fs.fsyncSync(fd)
    fs.closeSync(fd)
    fd = null
    // Hard-link publication is create-if-absent and cannot replace another immutable interruption record.
    fs.linkSync(temporary, target)
    fs.unlinkSync(temporary)
    syncProtectedDirectory(directory)
  } catch (error: any) {
    if (fd !== null) try { fs.closeSync(fd) } catch { /* best effort */ }
    try { fs.unlinkSync(temporary) } catch { /* linked or absent */ }
    if (error?.code === 'EEXIST') {
      const stable = readProviderInterruptionRecord(run.runRoot, interruptionRunId, marker)
      if (stable && stable.provider_attempt_id === providerAttemptId && stable.provider === run.provider
          && stable.model === run.model && stable.reasoningLevel === run.reasoningLevel
          && stable.profileKey === run.profileKey
          && isDeepStrictEqual(stable.executionProfile, run.executionProfile)) return
    }
    throw error
  }
}

type ProviderSelectionRecord = Omit<RecordedProviderSelection, 'model' | 'profileKey' | 'executionProfile'> & {
  schema_version: 'cockpit-provider-selection/3.0'
  stage: ProviderSelectionStage
  run_id: string
  run_root: string
  recorded_at: string
  model: string
  profileKey: string
  executionProfile: ProviderExecutionProfile
  authority: {
    kind: 'protected_admission' | 'protected_manifest' | 'interruption_artifact' | 'published_artifacts'
    artifact_hashes: Record<string, string>
  }
  self_sha256: string
}

function providerSelectionDigest(value: Omit<ProviderSelectionRecord, 'self_sha256'>): string {
  return sha256Bytes(JSON.stringify(value))
}

function protectedSelectionArtifactHash(artifact: string): string | null {
  const absolute = path.isAbsolute(artifact) ? path.resolve(artifact) : path.resolve(REPO_ROOT, artifact)
  const state = path.resolve(STATE_DIR)
  const repo = path.resolve(REPO_ROOT)
  if (absolute !== state && !absolute.startsWith(`${state}${path.sep}`)
      && absolute !== repo && !absolute.startsWith(`${repo}${path.sep}`)) return null
  try {
    const info = fs.lstatSync(absolute)
    if (!info.isFile() || info.isSymbolicLink() || fs.realpathSync(absolute) !== absolute) return null
    return sha256Bytes(fs.readFileSync(absolute))
  } catch { return null }
}

function readProviderSelectionRecord(runRoot: string): ProviderSelectionRecord | null {
  const value = readProtectedJson(providerSelectionPath(runRoot))
  if (!value || value.schema_version !== 'cockpit-provider-selection/3.0'
      || !['admitted', 'spawned', 'interrupted', 'published'].includes(value.stage)
      || value.run_root !== runRoot
      || typeof value.run_id !== 'string' || !['claude', 'codex'].includes(value.provider)
      || typeof value.model !== 'string' || typeof value.profileKey !== 'string'
      || !value.executionProfile || typeof value.executionProfile !== 'object'
      || !value.authority || typeof value.authority !== 'object'
      || !value.authority.artifact_hashes || typeof value.authority.artifact_hashes !== 'object'
      || typeof value.self_sha256 !== 'string') return null
  const { self_sha256: digest, ...unsigned } = value as ProviderSelectionRecord
  if (providerSelectionDigest(unsigned) !== digest) return null
  const entries = Object.entries(value.authority.artifact_hashes as Record<string, unknown>)
  if (entries.some(([artifact, expected]) => typeof expected !== 'string'
      || protectedSelectionArtifactHash(artifact) !== expected)) return null
  if (value.stage === 'spawned' && (value.authority.kind !== 'protected_manifest' || entries.length !== 1)) return null
  if (value.stage === 'interrupted' && (value.authority.kind !== 'interruption_artifact' || entries.length !== 1)) return null
  if (value.stage === 'published' && (value.authority.kind !== 'published_artifacts' || entries.length === 0)) return null
  if (value.stage === 'admitted' && (value.authority.kind !== 'protected_admission' || entries.length !== 0)) return null
  return value as ProviderSelectionRecord
}

type ProviderSelectionInput = Pick<RunState,
  'runId' | 'providerAttemptId' | 'runRoot' | 'provider' | 'model'
  | 'reasoningLevel' | 'profileKey' | 'executionProfile'>

function writeProviderSelection(
  run: ProviderSelectionInput,
  stage: ProviderSelectionStage,
  artifactHashes: Record<string, string> = {},
): void {
  if (!run.runRoot) throw new Error(`Run ${run.runId} has no run root for provider selection.`)
  const target = providerSelectionPath(run.runRoot)
  const directory = path.dirname(target)
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 })
  if (process.platform !== 'win32') fs.chmodSync(directory, 0o700)
  const temporary = path.join(directory, `.${path.basename(target)}.${process.pid}.${randomUUID()}.tmp`)
  const authorityKind: ProviderSelectionRecord['authority']['kind'] = stage === 'admitted'
    ? 'protected_admission' : stage === 'spawned' ? 'protected_manifest'
      : stage === 'interrupted' ? 'interruption_artifact' : 'published_artifacts'
  const unsigned: Omit<ProviderSelectionRecord, 'self_sha256'> = {
    schema_version: 'cockpit-provider-selection/3.0', stage,
    run_id: run.providerAttemptId ?? run.runId, run_root: run.runRoot,
    recorded_at: new Date().toISOString(), provider: run.provider, model: run.model,
    reasoningLevel: run.reasoningLevel, profileKey: run.profileKey, executionProfile: run.executionProfile,
    authority: { kind: authorityKind, artifact_hashes: artifactHashes },
  } as Omit<ProviderSelectionRecord, 'self_sha256'>
  const record: ProviderSelectionRecord = { ...unsigned, self_sha256: providerSelectionDigest(unsigned) }
  let descriptor: number | null = null
  try {
    descriptor = fs.openSync(
      temporary,
      fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW ?? 0),
      0o600,
    )
    fs.writeFileSync(descriptor, JSON.stringify(record, null, 2) + '\n', 'utf8')
    fs.fsyncSync(descriptor)
    fs.closeSync(descriptor)
    descriptor = null
    fs.renameSync(temporary, target)
    if (process.platform !== 'win32') fs.chmodSync(target, 0o600)
    syncProtectedDirectory(directory)
  } finally {
    if (descriptor !== null) try { fs.closeSync(descriptor) } catch { /* best effort */ }
    try { fs.rmSync(temporary, { force: true }) } catch { /* renamed or absent */ }
  }
}

/** Seal the current provider identity to the exact supervisor-written interruption marker. */
export function recordProviderInterruptionAuthority(run: ProviderSelectionInput): void {
  if (!run.runRoot) return
  const relative = `${run.runRoot}/.interrupted`
  const digest = protectedSelectionArtifactHash(relative)
  if (!digest) throw new Error('cannot seal provider identity: interruption marker is not a regular file')
  // Keep one immutable owner-only record per logical interrupted RunState. The mutable "last selection"
  // projection below remains useful for diagnostics, but a later sibling's admitted/spawned/published stage
  // can no longer erase the exact stopped process selected by the run-root marker.
  writeProviderInterruptionRecord(run)
  writeProviderSelection(run, 'interrupted', { [relative]: digest })
}

/** Seal a providerless publication retry only after the protected ready receipt and every committed blob
 * have been re-verified by the supervisor. No child-authored marker can call this path. */
export function recordRecoveredPublicationAuthority(input: {
  runId: string
  runRoot: string
  provider: RunProvider
  model: string
  reasoningLevel?: string
  profileKey: string
  executionProfile: ProviderExecutionProfile
}, artifactHashes: Record<string, string>): void {
  if (!Object.keys(artifactHashes).length) throw new Error('recovered publication has no bound artifacts')
  writeProviderSelection({
    runId: input.runId, runRoot: input.runRoot, provider: input.provider, model: input.model,
    reasoningLevel: input.reasoningLevel, profileKey: input.profileKey,
    executionProfile: input.executionProfile,
  }, 'published', artifactHashes)
}

/** Freeze the selected provider/profile as soon as admission succeeds, before run-root mutation. */
export function recordAdmittedProviderSelection(run: RunState): void {
  if (!run.runRoot) throw new Error(`Run ${run.runId} has no run root for provider selection.`)
  const selection: RecordedProviderSelection = {
    provider: run.provider,
    model: run.model,
    reasoningLevel: run.reasoningLevel,
    profileKey: run.profileKey,
    executionProfile: run.executionProfile,
  }
  liveSelectionByRunRoot.set(run.runRoot, selection)
  writeProviderSelection(run, 'admitted')
}

/** Focused restart seam: production process restarts naturally clear this map. */
export function forgetLiveProviderSelectionForTest(runRoot: string): void {
  liveSelectionByRunRoot.delete(runRoot)
}

/** Last observed process selection for a disk-only interrupted run. Legacy folders have no manifest. */
export function readLastProviderSelection(
  runRoot: string,
  requiredAuthority: 'any' | 'interrupted' | 'published' = 'any',
): RecordedProviderSelection | null {
  const absoluteRoot = path.resolve(REPO_ROOT, runRoot)
  const repo = path.resolve(REPO_ROOT)
  if (absoluteRoot !== repo && !absoluteRoot.startsWith(`${repo}${path.sep}`)) return null
  const durable = readProviderSelectionRecord(runRoot)
  const requiredStage = requiredAuthority === 'any' ? null : requiredAuthority
  if (requiredAuthority === 'interrupted') {
    const interruption = readProviderInterruptionAuthority(runRoot)
    if (interruption) {
      return {
        provider: interruption.provider,
        model: interruption.model,
        reasoningLevel: interruption.reasoningLevel,
        profileKey: interruption.profileKey,
        executionProfile: { ...interruption.executionProfile },
      }
    }
  }
  if (durable && (!requiredStage || durable.stage === requiredStage)) {
    return {
      provider: durable.provider, model: durable.model, reasoningLevel: durable.reasoningLevel,
      profileKey: durable.profileKey, executionProfile: { ...durable.executionProfile! },
    }
  }
  // Live state is authoritative only inside this supervisor process. Restart-sensitive automatic work
  // asks for an artifact-bound durable stage and therefore never falls through to this map.
  if (requiredStage) return null
  const live = liveSelectionByRunRoot.get(runRoot)
  if (!live) return null
  return {
    ...live, executionProfile: live.executionProfile ? { ...live.executionProfile } : undefined,
  }
}

/** Exact durable terminal-publication authority for restart reconciliation. */
export function readProviderPublicationAuthority(runRoot: string): ProviderPublicationAuthority | null {
  const absoluteRoot = path.resolve(REPO_ROOT, runRoot)
  const repo = path.resolve(REPO_ROOT)
  if (absoluteRoot !== repo && !absoluteRoot.startsWith(`${repo}${path.sep}`)) return null
  const durable = readProviderSelectionRecord(runRoot)
  if (!durable || durable.stage !== 'published') return null
  return {
    runId: durable.run_id,
    provider: durable.provider,
    model: durable.model,
    reasoningLevel: durable.reasoningLevel,
    profileKey: durable.profileKey,
    executionProfile: { ...durable.executionProfile },
    artifactHashes: { ...durable.authority.artifact_hashes },
  }
}

/** Exact durable authority for an interrupted process. Unlike the general selection reader, this retains
 * the supervisor-signed run id so an operator continuation can bind to one specific stopped process. */
export function readProviderInterruptionAuthority(
  runRoot: string,
  expectedInterruptionRunId?: string,
): ProviderInterruptionAuthority | null {
  const absoluteRoot = path.resolve(REPO_ROOT, runRoot)
  const repo = path.resolve(REPO_ROOT)
  if (absoluteRoot !== repo && !absoluteRoot.startsWith(`${repo}${path.sep}`)) return null
  const marker = interruptionMarker(runRoot)
  const markerRunId = typeof marker?.value.runId === 'string' ? marker.value.runId : null
  if (!marker || !markerRunId
      || (expectedInterruptionRunId !== undefined && expectedInterruptionRunId !== markerRunId)) return null
  const immutable = readProviderInterruptionRecord(runRoot, markerRunId, marker)
  if (immutable) {
    return {
      interruptionRunId: immutable.interruption_run_id,
      runId: immutable.provider_attempt_id,
      provider: immutable.provider,
      model: immutable.model,
      reasoningLevel: immutable.reasoningLevel,
      profileKey: immutable.profileKey,
      executionProfile: { ...immutable.executionProfile },
    }
  }
  // Compatibility for interruptions sealed before the immutable per-attempt store shipped. This fallback
  // remains safe only while the legacy last-selection projection itself is still interruption-bound; every
  // newly sealed interruption takes the immutable path above.
  const durable = readProviderSelectionRecord(runRoot)
  if (!durable || durable.stage !== 'interrupted') return null
  const markerAttemptId = typeof marker.value.attemptId === 'string' ? marker.value.attemptId : markerRunId
  if (durable.run_id !== markerAttemptId) return null
  return {
    interruptionRunId: markerRunId,
    runId: durable.run_id,
    provider: durable.provider,
    model: durable.model,
    reasoningLevel: durable.reasoningLevel,
    profileKey: durable.profileKey,
    executionProfile: { ...durable.executionProfile },
  }
}

/** A continuation can fail after admission but before `beginExecutionAttempt`/spawn. In that exact state
 * the protected selection has advanced to `admitted`, while the protected manifest still contains only
 * older observed rows. That negative proof is safe to re-arm after the launcher defect is corrected; a
 * spawned/current attempt (or a fresh root with no prior lineage) never qualifies. */
export function readProviderPreSpawnFailureAuthority(runRoot: string): ProviderInterruptionAuthority | null {
  const durable = readProviderSelectionRecord(runRoot)
  if (!durable || durable.stage !== 'admitted') return null
  const rows = readProtectedManifestRows(runRoot)
  if (!rows.length || rows.some((row) =>
    typeof row['attempt_id'] === 'string' && row['attempt_id'] === durable.run_id
      && typeof row['attribution'] === 'string' && row['attribution'] === 'recorded')) return null
  return {
    runId: durable.run_id,
    provider: durable.provider,
    model: durable.model,
    reasoningLevel: durable.reasoningLevel,
    profileKey: durable.profileKey,
    executionProfile: { ...durable.executionProfile },
  }
}

/** Bind a newly written interruption marker to the exact protected pre-spawn admission above. */
export function sealProviderPreSpawnFailureAuthority(runRoot: string, expectedRunId: string): void {
  const durable = readProviderSelectionRecord(runRoot)
  const authority = readProviderPreSpawnFailureAuthority(runRoot)
  if (!durable || !authority || authority.runId !== expectedRunId) {
    throw new Error('provider pre-spawn recovery authority changed before it could be sealed')
  }
  recordProviderInterruptionAuthority({
    runId: authority.runId,
    providerAttemptId: authority.runId,
    runRoot,
    provider: authority.provider,
    model: authority.model,
    reasoningLevel: authority.reasoningLevel,
    profileKey: authority.profileKey,
    executionProfile: authority.executionProfile,
  })
}

/** Capture canonical interrupted rows before a recovery admission advances the protected selection stage. */
export function protectedInterruptedExecutionLineage(runRoot: string): Array<Record<string, unknown>> {
  const selection = readProviderSelectionRecord(runRoot)
  if (!selection || selection.stage !== 'interrupted') return []
  return readProtectedManifestRows(runRoot, selection.run_id).map((row) => ({ ...row }))
}
