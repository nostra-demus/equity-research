import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const GENERATION_RE = /^[a-f0-9]{64}$/

export interface FrozenGenerationSource {
  dataPath: string
  outDir: string
  generationDigest: string
  generationDir: string
  evidenceRoot: string
}

export interface FrozenEvidenceReadCapability {
  root: string
  poolOutDir: string
  generationDir: string
  evidenceRoot: string
  generationDigest: string
  sourceGenerationDir: string
  files: Readonly<Record<string, string>>
  directories: readonly string[]
}

export interface FrozenEvidenceCapabilityOptions {
  capabilityRoot: string
  forbiddenRoots: readonly string[]
}

export interface FrozenEvidenceCapabilitySweepIssue {
  entry: string
  reason: string
}

export interface FrozenEvidenceCapabilitySweepResult {
  removed: string[]
  unsafe: FrozenEvidenceCapabilitySweepIssue[]
}

function pathIsWithin(candidate: string, parent: string): boolean {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate))
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative))
}

function assertOwnedDirectory(
  candidate: string,
  label: string,
  requireReadOnly: boolean,
  requireOwnerOnly = true,
): fs.Stats {
  const info = fs.lstatSync(candidate)
  if (!info.isDirectory() || info.isSymbolicLink() || fs.realpathSync(candidate) !== path.resolve(candidate)) {
    throw new Error(`${label} is not a plain canonical directory`)
  }
  if (typeof process.getuid === 'function' && info.uid !== process.getuid()) {
    throw new Error(`${label} is not owned by the supervisor user`)
  }
  if (process.platform !== 'win32') {
    if (requireOwnerOnly && (info.mode & 0o077) !== 0) throw new Error(`${label} is not owner-only`)
    if (requireReadOnly && (info.mode & 0o222) !== 0) throw new Error(`${label} is writable`)
  }
  return info
}

function stableReadOnlyFile(candidate: string, label: string): Buffer {
  let descriptor: number | null = null
  try {
    descriptor = fs.openSync(candidate, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW ?? 0))
    const before = fs.fstatSync(descriptor)
    const lexical = fs.lstatSync(candidate)
    if (!before.isFile() || before.nlink !== 1 || lexical.isSymbolicLink() || !lexical.isFile()
        || lexical.nlink !== 1 || lexical.dev !== before.dev || lexical.ino !== before.ino
        || fs.realpathSync(candidate) !== path.resolve(candidate)) {
      throw new Error(`${label} is not one plain canonical file`)
    }
    if (typeof process.getuid === 'function' && before.uid !== process.getuid()) {
      throw new Error(`${label} is not owned by the supervisor user`)
    }
    if (process.platform !== 'win32' && (before.mode & 0o222) !== 0) {
      throw new Error(`${label} is writable`)
    }
    const bytes = fs.readFileSync(descriptor)
    const after = fs.fstatSync(descriptor)
    if (before.dev !== after.dev || before.ino !== after.ino || before.size !== after.size
        || before.mode !== after.mode || before.mtimeMs !== after.mtimeMs || before.ctimeMs !== after.ctimeMs) {
      throw new Error(`${label} changed while it was read`)
    }
    return bytes
  } finally {
    if (descriptor !== null) fs.closeSync(descriptor)
  }
}

function digest(bytes: Buffer): string {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`
}

function safeRelative(root: string, candidate: string, label: string): string {
  const relative = path.relative(path.resolve(root), path.resolve(candidate))
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error(`${label} escapes its exact frozen generation`)
  }
  return relative.split(path.sep).join('/')
}

function assertCapabilityParentNamespace(options: FrozenEvidenceCapabilityOptions): string {
  const parent = path.resolve(options.capabilityRoot)
  for (const forbidden of options.forbiddenRoots) {
    if (pathIsWithin(parent, forbidden) || pathIsWithin(forbidden, parent)) {
      throw new Error('frozen evidence capability root overlaps a mutable or protected namespace')
    }
  }
  return parent
}

function ensureCanonicalDirectory(candidate: string): void {
  const resolved = path.resolve(candidate)
  if (resolved === path.parse(resolved).root) return
  try {
    const info = fs.lstatSync(resolved)
    if (!info.isDirectory() || info.isSymbolicLink() || fs.realpathSync(resolved) !== resolved) {
      throw new Error('frozen evidence capability path contains a non-canonical directory')
    }
    return
  } catch (error: any) {
    if (error?.code !== 'ENOENT') throw error
  }
  ensureCanonicalDirectory(path.dirname(resolved))
  fs.mkdirSync(resolved, { mode: 0o700 })
  const created = fs.lstatSync(resolved)
  if (!created.isDirectory() || created.isSymbolicLink() || fs.realpathSync(resolved) !== resolved) {
    throw new Error('frozen evidence capability path was replaced while it was created')
  }
}

function ensureCapabilityParent(options: FrozenEvidenceCapabilityOptions): string {
  const parent = assertCapabilityParentNamespace(options)
  ensureCanonicalDirectory(parent)
  assertOwnedDirectory(parent, 'frozen evidence capability parent', false)
  if (process.platform !== 'win32') fs.chmodSync(parent, 0o700)
  return parent
}

function existingCapabilityParent(options: FrozenEvidenceCapabilityOptions): string | null {
  const parent = assertCapabilityParentNamespace(options)
  try {
    assertOwnedDirectory(parent, 'frozen evidence capability parent', false)
  } catch (error: any) {
    if (error?.code === 'ENOENT') return null
    throw error
  }
  if (process.platform !== 'win32') fs.chmodSync(parent, 0o700)
  return parent
}

function sourceInventory(source: FrozenGenerationSource): {
  files: Array<{ relative: string; sha256: string }>
  directories: string[]
  evidenceRelative: string
} {
  if (!GENERATION_RE.test(source.generationDigest)) throw new Error('frozen evidence generation digest is invalid')
  const sourceRoot = path.resolve(source.generationDir)
  assertOwnedDirectory(sourceRoot, 'frozen evidence source generation', true, false)
  const evidenceRelative = safeRelative(sourceRoot, source.evidenceRoot, 'frozen evidence source root')
  const files: Array<{ relative: string; sha256: string }> = []
  const directories: string[] = ['']
  const walk = (directory: string, relative: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const absolute = path.join(directory, entry.name)
      const next = relative ? `${relative}/${entry.name}` : entry.name
      const info = fs.lstatSync(absolute)
      if (info.isSymbolicLink()) throw new Error(`frozen evidence source contains a symlink: ${next}`)
      if (info.isDirectory()) {
        assertOwnedDirectory(absolute, `frozen evidence source directory ${next}`, true, false)
        directories.push(next)
        walk(absolute, next)
      } else if (info.isFile()) {
        const bytes = stableReadOnlyFile(absolute, `frozen evidence source file ${next}`)
        files.push({ relative: next, sha256: digest(bytes) })
        bytes.fill(0)
      } else {
        throw new Error(`frozen evidence source contains a non-file member: ${next}`)
      }
    }
  }
  walk(sourceRoot, '')
  if (!files.some((file) => file.relative === 'manifest.json')) {
    throw new Error('frozen evidence source has no bound manifest')
  }
  if (!directories.includes(evidenceRelative)) {
    throw new Error('frozen evidence source root is not a bound directory')
  }
  return { files, directories: directories.sort(), evidenceRelative }
}

/**
 * Copy one already-verified immutable generation into a private, read-only capability outside every
 * mutable repository/data namespace. No symlink or hard-link points back to the source generation.
 */
export function createFrozenEvidenceReadCapability(
  source: FrozenGenerationSource,
  options: FrozenEvidenceCapabilityOptions,
): FrozenEvidenceReadCapability {
  const parent = ensureCapabilityParent(options)
  const inventory = sourceInventory(source)
  const root = fs.realpathSync(fs.mkdtempSync(path.join(parent, 'chain-')))
  fs.chmodSync(root, 0o700)
  const poolOutDir = path.join(root, 'pool')
  const generationDir = path.join(poolOutDir, '.extract-generations', source.generationDigest)
  try {
    for (const relative of inventory.directories) {
      const directory = relative
        ? path.join(generationDir, ...relative.split('/'))
        : generationDir
      fs.mkdirSync(directory, { recursive: true, mode: 0o700 })
    }
    for (const file of inventory.files) {
      const sourceFile = path.join(source.generationDir, ...file.relative.split('/'))
      const bytes = stableReadOnlyFile(sourceFile, `frozen evidence source file ${file.relative}`)
      if (digest(bytes) !== file.sha256) {
        bytes.fill(0)
        throw new Error(`frozen evidence source changed while capability was copied: ${file.relative}`)
      }
      const target = path.join(generationDir, ...file.relative.split('/'))
      const descriptor = fs.openSync(
        target,
        fs.constants.O_WRONLY | fs.constants.O_CREAT | fs.constants.O_EXCL | (fs.constants.O_NOFOLLOW ?? 0),
        0o600,
      )
      try {
        fs.writeFileSync(descriptor, bytes)
        fs.fsyncSync(descriptor)
      } finally {
        fs.closeSync(descriptor)
        bytes.fill(0)
      }
      if (process.platform !== 'win32') fs.chmodSync(target, 0o400)
    }
    if (process.platform !== 'win32') {
      const allDirectories = [root, poolOutDir, path.dirname(generationDir),
        ...inventory.directories.map((relative) => relative
          ? path.join(generationDir, ...relative.split('/')) : generationDir)]
      for (const directory of allDirectories.sort((left, right) => right.length - left.length)) {
        fs.chmodSync(directory, 0o500)
      }
    }
    const capability: FrozenEvidenceReadCapability = Object.freeze({
      root,
      poolOutDir,
      generationDir,
      evidenceRoot: path.join(generationDir, ...inventory.evidenceRelative.split('/')),
      generationDigest: source.generationDigest,
      sourceGenerationDir: path.resolve(source.generationDir),
      files: Object.freeze(Object.fromEntries(inventory.files.map((file) => [file.relative, file.sha256]))),
      directories: Object.freeze([...inventory.directories]),
    })
    verifyFrozenEvidenceReadCapability(capability, source, options)
    return capability
  } catch (error) {
    try { destroyFrozenEvidenceReadCapability({ root } as FrozenEvidenceReadCapability, options) } catch { /* preserve cause */ }
    throw error
  }
}

/** Re-hash every capability byte at each provider boundary against the source-derived exact inventory. */
export function verifyFrozenEvidenceReadCapability(
  capability: FrozenEvidenceReadCapability,
  source: FrozenGenerationSource,
  options: FrozenEvidenceCapabilityOptions,
): FrozenEvidenceReadCapability {
  const parent = ensureCapabilityParent(options)
  const root = path.resolve(capability.root)
  if (!pathIsWithin(root, parent) || root === parent || fs.realpathSync(root) !== root
      || capability.generationDigest !== source.generationDigest
      || capability.sourceGenerationDir !== path.resolve(source.generationDir)
      || path.resolve(capability.poolOutDir) !== path.join(root, 'pool')
      || path.resolve(capability.generationDir) !== path.join(
        root, 'pool', '.extract-generations', source.generationDigest,
      ) || !pathIsWithin(capability.evidenceRoot, capability.generationDir)) {
    throw new Error('frozen evidence capability lost its exact source binding')
  }
  for (const forbidden of options.forbiddenRoots) {
    if (pathIsWithin(root, forbidden) || pathIsWithin(forbidden, root)) {
      throw new Error('frozen evidence capability overlaps a forbidden namespace')
    }
  }
  const expectedDirectories = new Set([
    root,
    path.join(root, 'pool'),
    path.join(root, 'pool', '.extract-generations'),
    ...capability.directories.map((relative) => relative
      ? path.join(capability.generationDir, ...relative.split('/')) : capability.generationDir),
  ].map((value) => path.resolve(value)))
  const expectedFiles = new Map(Object.entries(capability.files).map(([relative, sha256]) => [
    path.resolve(capability.generationDir, ...relative.split('/')), sha256,
  ]))
  const foundDirectories = new Set<string>()
  const foundFiles = new Set<string>()
  const walk = (directory: string) => {
    assertOwnedDirectory(directory, 'frozen evidence capability directory', true)
    foundDirectories.add(path.resolve(directory))
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const candidate = path.join(directory, entry.name)
      if (entry.isSymbolicLink()) throw new Error('frozen evidence capability contains a symlink')
      if (entry.isDirectory()) walk(candidate)
      else if (entry.isFile()) {
        const absolute = path.resolve(candidate)
        const expected = expectedFiles.get(absolute)
        if (!expected) throw new Error('frozen evidence capability contains an unbound file')
        if (digest(stableReadOnlyFile(absolute, 'frozen evidence capability file')) !== expected) {
          throw new Error('frozen evidence capability content changed')
        }
        foundFiles.add(absolute)
      } else throw new Error('frozen evidence capability contains a non-file member')
    }
  }
  walk(root)
  if (foundDirectories.size !== expectedDirectories.size
      || [...foundDirectories].some((directory) => !expectedDirectories.has(directory))
      || foundFiles.size !== expectedFiles.size
      || [...expectedFiles.keys()].some((file) => !foundFiles.has(file))) {
    throw new Error('frozen evidence capability inventory changed')
  }
  return capability
}

interface AuditedCapabilityTree {
  directories: string[]
  files: string[]
}

function auditCapabilityTree(root: string): AuditedCapabilityTree {
  const directories: string[] = []
  const files: string[] = []
  const visit = (candidate: string) => {
    const info = fs.lstatSync(candidate)
    if (info.isSymbolicLink() || fs.realpathSync(candidate) !== path.resolve(candidate)) {
      throw new Error('refusing to remove a capability containing a symlink or non-canonical member')
    }
    if (typeof process.getuid === 'function' && info.uid !== process.getuid()) {
      throw new Error('refusing to remove a capability member owned by another user')
    }
    if (process.platform !== 'win32' && (info.mode & 0o077) !== 0) {
      throw new Error('refusing to remove a capability member that is not owner-only')
    }
    if (info.isDirectory()) {
      directories.push(candidate)
      for (const entry of fs.readdirSync(candidate, { withFileTypes: true })) {
        visit(path.join(candidate, entry.name))
      }
      return
    }
    if (!info.isFile()) throw new Error('refusing to remove a capability containing a non-file member')
    if (info.nlink !== 1) throw new Error('refusing to remove a hard-linked capability file')
    files.push(candidate)
  }
  visit(root)
  return { directories, files }
}

/** Delete only the exact private capability root after auditing the complete tree without following links. */
export function destroyFrozenEvidenceReadCapability(
  capability: Pick<FrozenEvidenceReadCapability, 'root'>,
  options: FrozenEvidenceCapabilityOptions,
): void {
  const parent = assertCapabilityParentNamespace(options)
  const root = path.resolve(capability.root)
  if (root === parent || !pathIsWithin(root, parent) || !/^chain-[A-Za-z0-9]+$/.test(path.basename(root))) {
    throw new Error('refusing to remove an unbound frozen evidence capability')
  }
  let rootInfo: fs.Stats
  try { rootInfo = fs.lstatSync(root) } catch (error: any) {
    if (error?.code === 'ENOENT') return
    throw error
  }
  if (!rootInfo.isDirectory() || rootInfo.isSymbolicLink()) {
    throw new Error('refusing to remove an unsafe frozen evidence capability directory')
  }
  const audited = auditCapabilityTree(root)
  if (process.platform !== 'win32') {
    for (const directory of audited.directories) fs.chmodSync(directory, 0o700)
    for (const file of audited.files) fs.chmodSync(file, 0o600)
  }
  fs.rmSync(root, { recursive: true, force: false })
}

/**
 * Remove hard-crash leftovers only after orphan provider groups are gone. Unknown, linked, shared,
 * non-canonical, or non-owner entries are retained and reported so startup can fail closed.
 */
export function sweepStaleFrozenEvidenceCapabilities(
  options: FrozenEvidenceCapabilityOptions,
): FrozenEvidenceCapabilitySweepResult {
  const removed: string[] = []
  const unsafe: FrozenEvidenceCapabilitySweepIssue[] = []
  let parent: string | null
  try {
    parent = existingCapabilityParent(options)
  } catch (error: any) {
    return { removed, unsafe: [{ entry: '<capability-parent>', reason: String(error?.message || error) }] }
  }
  if (!parent) return { removed, unsafe }
  for (const entry of fs.readdirSync(parent, { withFileTypes: true }).sort((left, right) => left.name.localeCompare(right.name))) {
    if (!/^chain-[A-Za-z0-9]+$/.test(entry.name)) {
      unsafe.push({ entry: entry.name, reason: 'unrecognized entry under the frozen evidence capability parent' })
      continue
    }
    const root = path.join(parent, entry.name)
    try {
      destroyFrozenEvidenceReadCapability({ root }, options)
      removed.push(entry.name)
    } catch (error: any) {
      unsafe.push({ entry: entry.name, reason: String(error?.message || error) })
    }
  }
  return { removed, unsafe }
}
