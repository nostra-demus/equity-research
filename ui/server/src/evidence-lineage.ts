import { createHash, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT, STATE_DIR } from './config'
import { validateAgentOutputText } from '../../../scripts/agent-output-validity.mjs'

const LINEAGE_SCHEMA = 'cockpit-output-evidence-lineage/1.0' as const
const LINEAGE_DIRECTORY = 'output-evidence-lineage'
const SHA256_RE = /^sha256:[a-f0-9]{64}$/
const GENERATION_RE = /^[a-f0-9]{64}$/

export interface OutputEvidenceLineageEntry {
  output_rel: string
  sha256: string
  generation_digest: string
  attempt_id: string
  provider: string
  profile_key: string
  recorded_at: string
}

export interface OutputEvidenceLineageManifest {
  schema_version: typeof LINEAGE_SCHEMA
  root_key: string
  run_root: string
  entries: OutputEvidenceLineageEntry[]
  updated_at: string
  self_sha256: string
}

export interface OutputLineageAttempt {
  runRoot: string
  eligibleOutputRels: string[]
  monitoredOutputRels: string[]
  baselines: Record<string, string | null>
  /** Exact protected entries observed with the byte baselines. Disjoint sibling settlements may merge,
   * but a change to one of these paths means two attempts shared write ownership and must fail closed. */
  priorEntries: Record<string, OutputEvidenceLineageEntry | null>
  priorManifestDigest: string | null
  generationDigest: string | null
  attemptId: string
  provider: string
  profileKey: string
}

export interface OutputLineageOptions {
  repoRoot?: string
  stateDir?: string
  now?: () => Date
}

export interface VerifiedOutputLineageSnapshot {
  runRoot: string
  /** Self-digest of the protected manifest, or null before any supervisor lineage has been recorded. */
  manifestDigest: string | null
  /** Binds the manifest plus only entries whose current safe bytes still verify. */
  verifiedDigest: string
  entries: OutputEvidenceLineageEntry[]
}

interface StableOutput {
  sha256: string
  valid: boolean
}

function normalizedRoots(options: OutputLineageOptions): { repoRoot: string; stateDir: string } {
  return {
    repoRoot: path.resolve(options.repoRoot ?? REPO_ROOT),
    stateDir: path.resolve(options.stateDir ?? STATE_DIR),
  }
}

/** Run roots are persisted across checkout moves, so the binding is canonical repository-relative POSIX. */
export function validateLineageRunRoot(runRoot: string, repoRoot = REPO_ROOT): string {
  if (typeof runRoot !== 'string' || !runRoot || runRoot.length > 500 || runRoot.includes('\0')
      || runRoot.includes('\\') || path.posix.isAbsolute(runRoot)
      || path.posix.normalize(runRoot) !== runRoot || runRoot === '.'
      || runRoot.split('/').some((part) => !part || part === '.' || part === '..')) {
    throw new Error('output lineage requires a validated repository-relative run root')
  }
  const repo = path.resolve(repoRoot)
  const absolute = path.resolve(repo, ...runRoot.split('/'))
  if (absolute === repo || !absolute.startsWith(`${repo}${path.sep}`)) {
    throw new Error('output lineage run root escapes the repository')
  }
  return runRoot
}

function validateOutputRel(outputRel: string): string {
  if (typeof outputRel !== 'string' || !outputRel || outputRel.length > 500
      || outputRel.includes('\0') || outputRel.includes('\\') || path.posix.isAbsolute(outputRel)
      || path.posix.normalize(outputRel) !== outputRel || !outputRel.endsWith('.md')
      || outputRel.split('/').some((part) => !part || part === '.' || part === '..')) {
    throw new Error('output lineage requires an exact run-root-relative markdown path')
  }
  return outputRel
}

function rootKey(runRoot: string): string {
  return createHash('sha256').update(runRoot, 'utf8').digest('hex')
}

function lineageRoot(stateDir: string): string {
  return path.join(stateDir, LINEAGE_DIRECTORY)
}

function assertOwnerOnlyDirectory(directory: string, label: string): void {
  const info = fs.lstatSync(directory)
  if (!info.isDirectory() || info.isSymbolicLink() || fs.realpathSync(directory) !== path.resolve(directory)) {
    throw new Error(`${label} is unsafe`)
  }
  if (process.platform !== 'win32') {
    if (typeof process.getuid === 'function' && info.uid !== process.getuid()) {
      throw new Error(`${label} is not owned by the supervisor user`)
    }
    fs.chmodSync(directory, 0o700)
    if ((fs.lstatSync(directory).mode & 0o077) !== 0) throw new Error(`${label} is not owner-only`)
  }
}

function ensureLineageRoot(stateDir: string): string {
  fs.mkdirSync(stateDir, { recursive: true, mode: 0o700 })
  assertOwnerOnlyDirectory(stateDir, 'output lineage state root')
  const directory = lineageRoot(stateDir)
  fs.mkdirSync(directory, { recursive: true, mode: 0o700 })
  assertOwnerOnlyDirectory(directory, 'output lineage manifest directory')
  return directory
}

function syncDirectory(directory: string): void {
  if (process.platform === 'win32') return
  const descriptor = fs.openSync(directory, fs.constants.O_RDONLY)
  try { fs.fsyncSync(descriptor) } finally { fs.closeSync(descriptor) }
}

function manifestPath(runRoot: string, stateDir: string): string {
  return path.join(lineageRoot(stateDir), `${rootKey(runRoot)}.json`)
}

/** Test/diagnostic seam. The path is keyed only after the repository-relative root is validated. */
export function outputLineageManifestPath(
  runRoot: string,
  options: OutputLineageOptions = {},
): string {
  const roots = normalizedRoots(options)
  return manifestPath(validateLineageRunRoot(runRoot, roots.repoRoot), roots.stateDir)
}

function unsignedManifest(manifest: OutputEvidenceLineageManifest): Omit<OutputEvidenceLineageManifest, 'self_sha256'> {
  return {
    schema_version: manifest.schema_version,
    root_key: manifest.root_key,
    run_root: manifest.run_root,
    entries: [...manifest.entries].sort((left, right) => left.output_rel.localeCompare(right.output_rel)),
    updated_at: manifest.updated_at,
  }
}

function manifestDigest(unsigned: Omit<OutputEvidenceLineageManifest, 'self_sha256'>): string {
  return `sha256:${createHash('sha256').update(JSON.stringify(unsigned), 'utf8').digest('hex')}`
}

function sameLineageEntry(
  left: OutputEvidenceLineageEntry | null,
  right: OutputEvidenceLineageEntry | null,
): boolean {
  if (left === null || right === null) return left === right
  return left.output_rel === right.output_rel
    && left.sha256 === right.sha256
    && left.generation_digest === right.generation_digest
    && left.attempt_id === right.attempt_id
    && left.provider === right.provider
    && left.profile_key === right.profile_key
    && left.recorded_at === right.recorded_at
}

function exactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  const actual = Object.keys(value).sort()
  return actual.length === keys.length && actual.every((key, index) => key === [...keys].sort()[index])
}

function validIso(value: string): boolean {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value
}

function parseManifest(raw: string, expectedRoot: string): OutputEvidenceLineageManifest {
  let value: unknown
  try { value = JSON.parse(raw) } catch { throw new Error('output lineage manifest is not valid JSON') }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('output lineage manifest is malformed')
  }
  const record = value as Record<string, unknown>
  if (!exactKeys(record, ['schema_version', 'root_key', 'run_root', 'entries', 'updated_at', 'self_sha256'])
      || record.schema_version !== LINEAGE_SCHEMA || record.run_root !== expectedRoot
      || record.root_key !== rootKey(expectedRoot) || !Array.isArray(record.entries)
      || typeof record.updated_at !== 'string' || !validIso(record.updated_at)
      || typeof record.self_sha256 !== 'string' || !SHA256_RE.test(record.self_sha256)) {
    throw new Error('output lineage manifest does not match its exact run root')
  }
  const seen = new Set<string>()
  const entries: OutputEvidenceLineageEntry[] = record.entries.map((candidate) => {
    if (!candidate || typeof candidate !== 'object' || Array.isArray(candidate)) {
      throw new Error('output lineage entry is malformed')
    }
    const entry = candidate as Record<string, unknown>
    if (!exactKeys(entry, [
      'output_rel', 'sha256', 'generation_digest', 'attempt_id', 'provider', 'profile_key', 'recorded_at',
    ]) || typeof entry.output_rel !== 'string' || typeof entry.sha256 !== 'string'
        || typeof entry.generation_digest !== 'string' || typeof entry.attempt_id !== 'string'
        || typeof entry.provider !== 'string' || typeof entry.profile_key !== 'string'
        || typeof entry.recorded_at !== 'string') {
      throw new Error('output lineage entry is malformed')
    }
    const outputRel = validateOutputRel(entry.output_rel)
    if (seen.has(outputRel) || !SHA256_RE.test(entry.sha256)
        || !GENERATION_RE.test(entry.generation_digest)
        || !entry.attempt_id || entry.attempt_id.length > 200
        || !entry.provider || entry.provider.length > 50
        || !entry.profile_key || entry.profile_key.length > 300
        || !validIso(entry.recorded_at)) {
      throw new Error('output lineage entry has an invalid identity')
    }
    seen.add(outputRel)
    return {
      output_rel: outputRel,
      sha256: entry.sha256,
      generation_digest: entry.generation_digest,
      attempt_id: entry.attempt_id,
      provider: entry.provider,
      profile_key: entry.profile_key,
      recorded_at: entry.recorded_at,
    }
  }).sort((left, right) => left.output_rel.localeCompare(right.output_rel))
  const manifest: OutputEvidenceLineageManifest = {
    schema_version: LINEAGE_SCHEMA,
    root_key: record.root_key as string,
    run_root: expectedRoot,
    entries,
    updated_at: record.updated_at,
    self_sha256: record.self_sha256,
  }
  if (manifest.self_sha256 !== manifestDigest(unsignedManifest(manifest))) {
    throw new Error('output lineage manifest self-digest is invalid')
  }
  return manifest
}

function readManifest(runRoot: string, options: OutputLineageOptions): OutputEvidenceLineageManifest | null {
  const roots = normalizedRoots(options)
  const validatedRoot = validateLineageRunRoot(runRoot, roots.repoRoot)
  const absolute = manifestPath(validatedRoot, roots.stateDir)
  let descriptor: number | null = null
  try {
    descriptor = fs.openSync(absolute, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0))
  } catch (error: any) {
    if (error?.code === 'ENOENT') return null
    throw error
  }
  try {
    const before = fs.fstatSync(descriptor)
    if (!before.isFile() || before.nlink !== 1 || (process.platform !== 'win32' && (before.mode & 0o077) !== 0)
        || (typeof process.getuid === 'function' && before.uid !== process.getuid())) {
      throw new Error('output lineage manifest is not one owner-only regular file')
    }
    const raw = fs.readFileSync(descriptor, 'utf8')
    const after = fs.fstatSync(descriptor)
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size
        || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs) {
      throw new Error('output lineage manifest changed while being read')
    }
    return parseManifest(raw, validatedRoot)
  } finally {
    fs.closeSync(descriptor)
  }
}

function stableOutput(
  repoRoot: string,
  runRoot: string,
  outputRel: string,
): StableOutput | null {
  const root = path.resolve(repoRoot, ...runRoot.split('/'))
  let rootInfo: fs.Stats
  try { rootInfo = fs.lstatSync(root) } catch { return null }
  if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink() || fs.realpathSync(root) !== root) return null
  const absolute = path.resolve(root, ...validateOutputRel(outputRel).split('/'))
  if (!absolute.startsWith(`${root}${path.sep}`)) return null
  let descriptor: number | null = null
  try {
    descriptor = fs.openSync(absolute, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0))
  } catch { return null }
  try {
    const before = fs.fstatSync(descriptor)
    if (!before.isFile() || before.nlink !== 1) return null
    let lexicalInfo: fs.Stats
    try { lexicalInfo = fs.lstatSync(absolute) } catch { return null }
    if (!lexicalInfo.isFile() || lexicalInfo.isSymbolicLink() || lexicalInfo.nlink !== 1
        || fs.realpathSync(absolute) !== absolute
        || lexicalInfo.dev !== before.dev || lexicalInfo.ino !== before.ino) return null
    const content = fs.readFileSync(descriptor)
    const after = fs.fstatSync(descriptor)
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size
        || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs) return null
    return {
      sha256: `sha256:${createHash('sha256').update(content).digest('hex')}`,
      valid: validateAgentOutputText(content.toString('utf8')).valid,
    }
  } finally {
    fs.closeSync(descriptor)
  }
}

function writeManifest(
  runRoot: string,
  entries: OutputEvidenceLineageEntry[],
  options: OutputLineageOptions,
): OutputEvidenceLineageManifest {
  const roots = normalizedRoots(options)
  const directory = ensureLineageRoot(roots.stateDir)
  const updatedAt = (options.now?.() ?? new Date()).toISOString()
  const unsigned: Omit<OutputEvidenceLineageManifest, 'self_sha256'> = {
    schema_version: LINEAGE_SCHEMA,
    root_key: rootKey(runRoot),
    run_root: runRoot,
    entries: [...entries].sort((left, right) => left.output_rel.localeCompare(right.output_rel)),
    updated_at: updatedAt,
  }
  const manifest: OutputEvidenceLineageManifest = {
    ...unsigned,
    self_sha256: manifestDigest(unsigned),
  }
  const target = manifestPath(runRoot, roots.stateDir)
  if (fs.existsSync(target)) {
    const existing = fs.lstatSync(target)
    if (!existing.isFile() || existing.isSymbolicLink() || existing.nlink !== 1) {
      throw new Error('refusing to replace an unsafe output lineage manifest')
    }
  }
  const temporary = path.join(directory, `.${path.basename(target)}.${process.pid}.${randomUUID()}.tmp`)
  let descriptor: number | null = null
  try {
    descriptor = fs.openSync(
      temporary,
      fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW ?? 0),
      0o600,
    )
    fs.writeFileSync(descriptor, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
    fs.fsyncSync(descriptor)
    fs.closeSync(descriptor)
    descriptor = null
    fs.renameSync(temporary, target)
    if (process.platform !== 'win32') fs.chmodSync(target, 0o600)
    syncDirectory(directory)
    return manifest
  } catch (error) {
    if (descriptor !== null) try { fs.closeSync(descriptor) } catch { /* best effort */ }
    try { fs.unlinkSync(temporary) } catch { /* renamed or never created */ }
    throw error
  }
}

/** Snapshot exact potential outputs immediately before one provider process is spawned. */
export function captureOutputLineageAttempt(
  input: {
    runRoot: string
    outputRels: Iterable<string>
    generationDigest: string | null
    attemptId: string
    provider: string
    profileKey: string
  },
  options: OutputLineageOptions = {},
): OutputLineageAttempt {
  const roots = normalizedRoots(options)
  const runRoot = validateLineageRunRoot(input.runRoot, roots.repoRoot)
  if (input.generationDigest !== null && !GENERATION_RE.test(input.generationDigest)) {
    throw new Error('output lineage generation digest is invalid')
  }
  if (!input.attemptId || input.attemptId.length > 200 || !input.provider || input.provider.length > 50
      || !input.profileKey || input.profileKey.length > 300) {
    throw new Error('output lineage attempt identity is incomplete')
  }
  const eligibleOutputRels = [...new Set([...input.outputRels].map(validateOutputRel))].sort()
  const prior = readManifest(runRoot, options)
  // One provider attempt owns only the output paths admitted in its sandbox write scope. Monitoring every
  // historical manifest entry makes disjoint parallel modules look like overlapping writers when a Continue
  // transaction has removed stale outputs: each sibling then observes the other's legitimate rewrite and
  // revokes both entries. Out-of-scope writes are mechanically denied by the provider sandbox; lineage must
  // therefore compare/revoke only this attempt's exact eligible paths.
  const monitoredOutputRels = [...eligibleOutputRels]
  const baselines: Record<string, string | null> = {}
  const priorEntries: Record<string, OutputEvidenceLineageEntry | null> = {}
  const priorByOutput = new Map((prior?.entries ?? []).map((entry) => [entry.output_rel, entry]))
  for (const outputRel of monitoredOutputRels) {
    baselines[outputRel] = stableOutput(roots.repoRoot, runRoot, outputRel)?.sha256 ?? null
    priorEntries[outputRel] = priorByOutput.has(outputRel) ? { ...priorByOutput.get(outputRel)! } : null
  }
  return {
    runRoot,
    eligibleOutputRels,
    monitoredOutputRels,
    baselines,
    priorEntries,
    priorManifestDigest: prior?.self_sha256 ?? null,
    generationDigest: input.generationDigest,
    attemptId: input.attemptId,
    provider: input.provider,
    profileKey: input.profileKey,
  }
}

/**
 * Settle only after the detached provider group is extinct. Changed valid markdown is attested only when
 * the attempt carried a frozen generation. An unbound/invalid rewrite instead revokes prior trust.
 */
export function settleOutputLineageAttempt(
  attempt: OutputLineageAttempt,
  options: OutputLineageOptions = {},
): OutputEvidenceLineageManifest {
  const roots = normalizedRoots(options)
  const runRoot = validateLineageRunRoot(attempt.runRoot, roots.repoRoot)
  const settlementKey = `${roots.stateDir}\0${runRoot}`
  if (activeLineageSettlements.has(settlementKey)) {
    throw new Error('output lineage settlement is already active for this exact run root')
  }
  activeLineageSettlements.add(settlementKey)
  try {
    return settleOutputLineageAttemptSerialized(attempt, options)
  } finally {
    activeLineageSettlements.delete(settlementKey)
  }
}

// All filesystem work below is synchronous. Combined with this exact-root guard, one supervisor always
// completes read/compare/merge/atomic-rename before another sibling can enter for the same run root.
const activeLineageSettlements = new Set<string>()

function settleOutputLineageAttemptSerialized(
  attempt: OutputLineageAttempt,
  options: OutputLineageOptions,
): OutputEvidenceLineageManifest {
  const roots = normalizedRoots(options)
  const runRoot = validateLineageRunRoot(attempt.runRoot, roots.repoRoot)
  const prior = readManifest(runRoot, options)
  if ((prior?.self_sha256 ?? null) !== attempt.priorManifestDigest) {
    // Parallel modules legitimately share the same initial whole-manifest digest. Re-read under the
    // supervisor's synchronous per-root settlement boundary and merge when every path this attempt could
    // write still has its exact captured entry. A changed entry on one of those paths proves overlapping
    // write ownership. Revoke that path before failing so neither attempt's bytes remain reusable.
    const currentByOutput = new Map((prior?.entries ?? []).map((entry) => [entry.output_rel, entry]))
    const conflicts = attempt.monitoredOutputRels.map(validateOutputRel).filter((outputRel) => {
      if (!Object.prototype.hasOwnProperty.call(attempt.priorEntries, outputRel)) {
        throw new Error('output lineage attempt lost its protected entry baseline')
      }
      return !sameLineageEntry(
        currentByOutput.get(outputRel) ? { ...currentByOutput.get(outputRel)! } : null,
        attempt.priorEntries[outputRel],
      )
    })
    if (conflicts.length) {
      const conflictSet = new Set(conflicts)
      writeManifest(runRoot, (prior?.entries ?? []).filter((entry) => !conflictSet.has(entry.output_rel)), options)
      throw new Error(`output lineage write ownership overlapped: ${conflicts.join(', ')}`)
    }
  }
  const eligible = new Set(attempt.eligibleOutputRels.map(validateOutputRel))
  const entries = new Map((prior?.entries ?? []).map((entry) => [entry.output_rel, entry]))
  const recordedAt = (options.now?.() ?? new Date()).toISOString()
  for (const outputRel of attempt.monitoredOutputRels.map(validateOutputRel)) {
    if (!Object.prototype.hasOwnProperty.call(attempt.baselines, outputRel)) {
      throw new Error('output lineage attempt lost a pre-spawn baseline')
    }
    const baseline = attempt.baselines[outputRel]
    const current = stableOutput(roots.repoRoot, runRoot, outputRel)
    const currentSha = current?.sha256 ?? null
    const previous = entries.get(outputRel)
    if (currentSha === baseline) {
      // Byte-identical output retains its actual prior lineage. It is never credited to a later generation.
      if (previous && previous.sha256 !== currentSha) entries.delete(outputRel)
      continue
    }
    if (attempt.generationDigest && eligible.has(outputRel) && current?.valid) {
      entries.set(outputRel, {
        output_rel: outputRel,
        sha256: current.sha256,
        generation_digest: attempt.generationDigest,
        attempt_id: attempt.attemptId,
        provider: attempt.provider,
        profile_key: attempt.profileKey,
        recorded_at: recordedAt,
      })
    } else {
      // Deletion, malformed output, out-of-scope mutation, or an unbound standalone rewrite revokes trust.
      entries.delete(outputRel)
    }
  }
  return writeManifest(runRoot, [...entries.values()], options)
}

/** Planner-facing fail-closed proof: returns an entry only while the protected current bytes still match. */
export function verifyReusableOutputLineage(
  runRoot: string,
  outputRel: string,
  options: OutputLineageOptions = {},
): OutputEvidenceLineageEntry | null {
  const roots = normalizedRoots(options)
  const validatedRoot = validateLineageRunRoot(runRoot, roots.repoRoot)
  const validatedOutput = validateOutputRel(outputRel)
  const manifest = readManifest(validatedRoot, options)
  const entry = manifest?.entries.find((candidate) => candidate.output_rel === validatedOutput)
  if (!entry) return null
  const current = stableOutput(roots.repoRoot, validatedRoot, validatedOutput)
  return current?.valid && current.sha256 === entry.sha256 ? { ...entry } : null
}

/** Exact-generation convenience for planners. A valid file from another frozen pool is not reusable. */
export function verifyReusableOutputLineageForGeneration(
  runRoot: string,
  outputRel: string,
  generationDigest: string,
  options: OutputLineageOptions = {},
): OutputEvidenceLineageEntry | null {
  if (!GENERATION_RE.test(generationDigest)) throw new Error('expected output lineage generation digest is invalid')
  const entry = verifyReusableOutputLineage(runRoot, outputRel, options)
  return entry?.generation_digest === generationDigest ? entry : null
}

/** Safe planner snapshot. Tampered/missing current files are omitted and therefore become payable work. */
export function readVerifiedOutputLineage(
  runRoot: string,
  options: OutputLineageOptions = {},
): VerifiedOutputLineageSnapshot {
  const roots = normalizedRoots(options)
  const validatedRoot = validateLineageRunRoot(runRoot, roots.repoRoot)
  const manifest = readManifest(validatedRoot, options)
  const entries = (manifest?.entries ?? []).filter((entry) => {
    const current = stableOutput(roots.repoRoot, validatedRoot, entry.output_rel)
    return current?.valid === true && current.sha256 === entry.sha256
  }).map((entry) => ({ ...entry }))
    .sort((left, right) => left.output_rel.localeCompare(right.output_rel))
  const manifestDigestValue = manifest?.self_sha256 ?? null
  const verifiedDigest = `sha256:${createHash('sha256').update(JSON.stringify({
    run_root: validatedRoot,
    manifest_digest: manifestDigestValue,
    entries,
  }), 'utf8').digest('hex')}`
  return { runRoot: validatedRoot, manifestDigest: manifestDigestValue, verifiedDigest, entries }
}
