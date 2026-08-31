import fs from 'node:fs'
import crypto from 'node:crypto'
import http from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { execa } from 'execa'
import { REPO_ROOT } from '../config'
import { registerProviderAdapter } from './registry'
import {
  canonicalAgentNameFromCodexNativePath,
  CODEX_MODEL_CONTRACTS,
  CODEX_EXECUTION_PROFILES,
  CODEX_PARENT_CONTRACT,
  CODEX_PROJECT_DOC_MAX_BYTES,
  CODEX_SPECIALIST_CONTRACT,
  resolveCodexProfile,
} from './codex-contract'
import { loadCanonicalCommand, validateCodexPromptProgram } from './prompt-loader'
import type {
  ProviderAdapter,
  ProviderAvailability,
  ProviderExitClassification,
  ProviderExitContext,
  ProviderLaunchContext,
  ProviderLaunchSpec,
  ProviderStreamEvent,
  ResolvedProviderProfile,
} from './types'
import { PROVIDER_NEUTRAL_RUN_ENV_KEYS } from './types'
import type { CreditPreflight } from '../types'

const REQUIRED_GLOBAL_FLAGS = ['--strict-config', '--add-dir', '--search', '--config'] as const
const REQUIRED_EXEC_FLAGS = ['--json', 'resume'] as const
export const CODEX_COCKPIT_PERMISSION_PROFILE = 'nostra-cockpit'
// A Codex turn can run Bash. Its environment is therefore a model-visible secret boundary, not an
// ordinary subprocess inheritance boundary. Keep an explicit allowlist of OS/runtime plumbing only.
const CODEX_CHILD_ENV_ALLOWLIST = [
  'PATH', 'HOME', 'USER', 'LOGNAME', 'SHELL', 'TMPDIR', 'TMP', 'TEMP',
  'LANG', 'LC_ALL', 'LC_CTYPE', 'TZ', 'TERM', 'COLORTERM',
  'SSL_CERT_FILE', 'SSL_CERT_DIR', 'NODE_EXTRA_CA_CERTS',
  'CODEX_HOME',
] as const
// These are the only cockpit-owned values the provider subprocess and model-issued Bash may receive.
// The publication token is an opaque, run-scoped capability accepted only by the local supervisor.
const CODEX_COCKPIT_ENV_ALLOWLIST = [
  'NOSTRA_PUBLICATION_ENDPOINT',
  'NOSTRA_PUBLICATION_SOCKET',
  'NOSTRA_PUBLICATION_TOKEN',
  ...PROVIDER_NEUTRAL_RUN_ENV_KEYS,
] as const

// Homebrew's versioned Python formulae deliberately keep the unversioned `python3` shim out of
// /usr/local/bin and /opt/homebrew/bin. LaunchAgents therefore see Apple's older /usr/bin/python3 even
// when a current Python is installed. Put only an already-installed formula's libexec directory on the
// isolated child PATH; this never installs or links software and works on Intel and Apple Silicon.
const CODEX_PYTHON_FORMULAE = ['python@3.14', 'python@3.13', 'python@3.12', 'python@3.11', 'python'] as const
const CODEX_HOMEBREW_PREFIXES = process.arch === 'arm64'
  ? ['/opt/homebrew', '/usr/local'] as const
  : ['/usr/local', '/opt/homebrew'] as const

function defaultCodexPythonToolDirs(): string[] {
  return CODEX_PYTHON_FORMULAE.flatMap((formula) => CODEX_HOMEBREW_PREFIXES
    .flatMap((prefix) => [
      // Python <=3.13 exposes the unversioned shim in libexec; 3.14 moved it into bin.
      path.join(prefix, 'opt', formula, 'libexec', 'bin'),
      path.join(prefix, 'opt', formula, 'bin'),
    ]))
}

interface CatalogReasoningLevel { effort?: unknown }
interface CatalogModel {
  slug?: unknown
  visibility?: unknown
  supported_in_api?: unknown
  supported_reasoning_levels?: unknown
  supports_parallel_tool_calls?: unknown
  supports_search_tool?: unknown
  multi_agent_version?: unknown
}
export interface CodexProbe {
  command: string
  commandIdentity: string
  cliVersion: string
  models: CatalogModel[]
  /** Exact deterministic runtime proved both on the host and inside the named Codex sandbox. */
  pythonRuntime?: CodexPythonRuntime
  /** Present only on a fresh per-launch probe; display probes never retain credentials. */
  authLease?: IsolatedCodexProbeHome
}

export interface CodexPythonRuntime {
  executable: string
  identity: string
  readOnlyRoots: string[]
}

interface CodexPythonRuntimeProof {
  version: [number, number, number]
  executable: string
  prefixes: unknown[]
}

export const CODEX_AVAILABILITY_CACHE_TTL_MS = 60_000
export const CODEX_LAUNCH_PROOF_MAX_AGE_MS = 20_000
export const CODEX_LAUNCH_PROOF_REPLAY_TTL_MS = 5 * 60_000
// Keep the last *display* failure visible long enough for the cockpit to explain what needs fixing.
// A 1.5s negative cache made passive GETs miss the failure between polls and restart another expensive
// catalogue probe, leaving the browser on "being verified" indefinitely. Explicit provider checks still
// bypass this cache, and launch authority still requires its own fresh one-shot proof.
export const CODEX_NEGATIVE_CACHE_TTL_MS = 60_000
const CODEX_AUTH_MAX_BYTES = 1024 * 1024
export const CODEX_STALE_AUTH_LEASE_AGE_MS = 60 * 60_000
const CODEX_AUTH_LEASE_PREFIX = 'nostra-codex-probe-'
const CODEX_AUTH_LEASE_MARKER = '.nostra-auth-lease.json'

function catalogueUnknown(error: unknown): never {
  const tagged: any = error instanceof Error ? error : new Error(String(error))
  tagged.code = 'CODEX_CATALOGUE_UNKNOWN'
  throw tagged
}

interface CodexRateLimitWindow {
  usedPercent: number
  resetsAt?: number
  windowDurationMins?: number
}

export function resolveCodexBin(env: NodeJS.ProcessEnv = process.env): string {
  if (env.CODEX_BIN) return env.CODEX_BIN
  const candidates = [
    path.join(env.HOME || os.homedir(), '.local', 'bin', 'codex'),
    '/opt/homebrew/bin/codex',
    '/usr/local/bin/codex',
    // The desktop bundle can exist with the wrong CPU architecture on an Intel/Apple-Silicon host.
    // Prefer the explicitly installed, logged-in CLI and retain the bundle only as a last fallback.
    '/Applications/ChatGPT.app/Contents/Resources/codex',
  ]
  for (const candidate of candidates) {
    try { return resolveExecutablePath(candidate, env) } catch { /* keep looking */ }
  }
  return 'codex'
}

function pathIdentity(candidate: string): string {
  try {
    const real = fs.realpathSync(candidate)
    const info = fs.statSync(real, { bigint: true })
    return [real, info.dev, info.ino, info.size, info.mtimeNs, info.ctimeNs].map(String).join(':')
  } catch {
    return `unresolved:${candidate}`
  }
}

interface StableFileSnapshot {
  realPath: string
  identity: string
  bytes?: Buffer
}

interface StableUnixSocketSnapshot {
  path: string
  realPath: string
  identity: string
}

function statIdentity(stat: fs.BigIntStats): string {
  return [stat.dev, stat.ino, stat.mode, stat.uid, stat.gid, stat.size, stat.mtimeNs, stat.ctimeNs]
    .map(String).join(':')
}

/** Read/hash one pathname through a no-follow descriptor and prove the pathname still names that inode. */
function stableRegularFileSnapshot(
  candidate: string,
  label: string,
  options: { capture?: boolean; maxBytes?: number; allowEmpty?: boolean; requireSingleLink?: boolean } = {},
): StableFileSnapshot {
  const absolute = path.resolve(candidate)
  let descriptor: number | undefined
  try {
    descriptor = fs.openSync(absolute, fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0))
    const before = fs.fstatSync(descriptor, { bigint: true })
    if (!before.isFile()) throw new Error(`${label} must be a regular non-symlink file.`)
    if (options.requireSingleLink && before.nlink !== 1n) throw new Error(`${label} must not have hard-link aliases.`)
    const size = Number(before.size)
    const maxBytes = options.maxBytes ?? Number.MAX_SAFE_INTEGER
    if (!Number.isSafeInteger(size) || size < 0 || (!options.allowEmpty && size === 0) || size > maxBytes) {
      throw new Error(`${label} has an invalid or unsafe size.`)
    }
    const hash = crypto.createHash('sha256')
    const chunks: Buffer[] = []
    const buffer = Buffer.allocUnsafe(Math.min(64 * 1024, Math.max(1, size)))
    let position = 0
    while (position < size) {
      const read = fs.readSync(descriptor, buffer, 0, Math.min(buffer.length, size - position), position)
      if (read <= 0) throw new Error(`${label} changed while it was being read.`)
      const chunk = buffer.subarray(0, read)
      hash.update(chunk)
      if (options.capture) chunks.push(Buffer.from(chunk))
      position += read
    }
    const after = fs.fstatSync(descriptor, { bigint: true })
    const pathname = fs.lstatSync(absolute, { bigint: true })
    if (pathname.isSymbolicLink() || !pathname.isFile()
        || statIdentity(before) !== statIdentity(after)
        || statIdentity(after) !== statIdentity(pathname)) {
      throw new Error(`${label} changed while it was being verified.`)
    }
    const realPath = fs.realpathSync(absolute)
    const identity = `${realPath}:${statIdentity(after)}:sha256:${hash.digest('hex')}`
    return { realPath, identity, ...(options.capture ? { bytes: Buffer.concat(chunks, size) } : {}) }
  } catch (error: any) {
    if (String(error?.message || '').startsWith(label)) throw error
    throw new Error(`${label} is missing, unreadable, or not a regular non-symlink file.`)
  } finally {
    if (descriptor !== undefined) {
      try { fs.closeSync(descriptor) } catch { /* best effort */ }
    }
  }
}

/** Bind one supervisor-owned socket inode without following a final-component link. */
function stableUnixSocketSnapshot(candidate: string, label: string): StableUnixSocketSnapshot {
  if (!path.isAbsolute(candidate)) throw new Error(`${label} path must be absolute.`)
  const absolute = path.resolve(candidate)
  try {
    const socket = fs.lstatSync(absolute, { bigint: true })
    const parentPath = path.dirname(absolute)
    const parent = fs.lstatSync(parentPath, { bigint: true })
    const uid = typeof process.getuid === 'function' ? BigInt(process.getuid()) : socket.uid
    if (socket.isSymbolicLink() || !socket.isSocket() || socket.nlink !== 1n) {
      throw new Error(`${label} must be a single-link Unix-domain socket.`)
    }
    if (parent.isSymbolicLink() || !parent.isDirectory()) {
      throw new Error(`${label} parent must be a real directory.`)
    }
    if (socket.uid !== uid || parent.uid !== uid || (socket.mode & 0o077n) !== 0n || (parent.mode & 0o077n) !== 0n) {
      throw new Error(`${label} and its parent must be private and owned by the cockpit process.`)
    }
    const realPath = fs.realpathSync(absolute)
    const resolved = fs.lstatSync(realPath, { bigint: true })
    if (!resolved.isSocket() || statIdentity(socket) !== statIdentity(resolved)) {
      throw new Error(`${label} changed while it was being verified.`)
    }
    return {
      path: absolute,
      realPath,
      identity: `${realPath}:${statIdentity(socket)}:parent:${fs.realpathSync(parentPath)}:${statIdentity(parent)}`,
    }
  } catch (error: any) {
    if (String(error?.message || '').startsWith(label)) throw error
    throw new Error(`${label} is missing, unsafe, or not an owned private Unix-domain socket.`)
  }
}

function pathIsWithin(root: string, candidate: string): boolean {
  const relative = path.relative(path.resolve(root), path.resolve(candidate))
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
}

function resolveExecutablePath(command: string, env: NodeJS.ProcessEnv): string {
  const candidates = path.isAbsolute(command) || command.includes(path.sep)
    ? [path.resolve(command)]
    : String(env.PATH || '').split(path.delimiter).filter(Boolean).map((directory) => path.resolve(directory, command))
  for (const candidate of candidates) {
    try {
      fs.accessSync(candidate, fs.constants.X_OK)
      const real = fs.realpathSync(candidate)
      if (!fs.statSync(real).isFile()) continue
      return real
    } catch { /* keep looking */ }
  }
  throw new Error(`Codex executable '${command}' could not be resolved to one executable regular file.`)
}

export function pinCodexExecutable(command: string, env: NodeJS.ProcessEnv): { command: string; identity: string } {
  const resolved = resolveExecutablePath(command, env)
  const snapshot = stableRegularFileSnapshot(resolved, 'Codex executable')
  return { command: snapshot.realPath, identity: snapshot.identity }
}

function executableIdentity(command: string, env: NodeJS.ProcessEnv): string {
  try { return pathIdentity(resolveExecutablePath(command, env)) } catch {
    return `unresolved-command:${command}:PATH=${env.PATH || ''}`
  }
}

function codexProbeRuntimeKey(
  sourceEnv: NodeJS.ProcessEnv,
  repoRoot: string,
  profileKey: string,
): string {
  const configuredHome = sourceEnv.CODEX_HOME || path.join(sourceEnv.HOME || os.homedir(), '.codex')
  const rootIdentity = pathIdentity(path.resolve(repoRoot))
  let authIdentity: string
  try {
    authIdentity = stableRegularFileSnapshot(
      path.join(path.resolve(configuredHome), 'auth.json'), 'Codex ChatGPT auth file',
      { maxBytes: CODEX_AUTH_MAX_BYTES },
    ).identity
  } catch {
    authIdentity = `unresolved:${path.join(path.resolve(configuredHome), 'auth.json')}`
  }
  return JSON.stringify({
    executable: executableIdentity(resolveCodexBin(sourceEnv), sourceEnv),
    auth: authIdentity,
    repo: rootIdentity,
    profileKey,
  })
}

export function codexChildEnv(
  source: NodeJS.ProcessEnv = process.env,
  options: { pythonToolDirs?: readonly string[]; pythonRuntime?: CodexPythonRuntime } = {},
): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {}
  for (const key of CODEX_CHILD_ENV_ALLOWLIST) if (source[key] !== undefined) env[key] = source[key]
  // launchd starts the engine with an absolute Node executable, but npm-installed CLI shims use
  // `#!/usr/bin/env node`. Preserve that exact runtime directory in the scrubbed child PATH so the
  // pinned Codex shim can start even when Node lives outside launchd's static Homebrew/local paths.
  const runtimeBin = path.dirname(process.execPath)
  const pythonToolDirs = (options.pythonToolDirs ?? defaultCodexPythonToolDirs()).filter((directory) => {
    try {
      fs.accessSync(path.join(directory, 'python3'), fs.constants.X_OK)
      return true
    } catch { return false }
  })
  env.PATH = [...new Set([
    runtimeBin,
    ...(options.pythonRuntime ? [path.dirname(options.pythonRuntime.executable)] : []),
    ...pythonToolDirs,
    ...String(env.PATH || '').split(path.delimiter).filter(Boolean),
  ])]
    .join(path.delimiter)
  env.NOSTRA_COCKPIT_RUN = '1'
  env.NO_COLOR = '1'
  for (const key of CODEX_COCKPIT_ENV_ALLOWLIST) if (source[key]) env[key] = source[key]
  return env
}

/** Resolve and bind the deterministic runtime before inference; the named sandbox proves it separately. */
export function assertCodexPythonRuntime(env: NodeJS.ProcessEnv): CodexPythonRuntime {
  let executable: string
  try { executable = resolveExecutablePath('python3', env) } catch {
    throw new Error('Codex launch requires an executable Python 3.10+ runtime on the isolated child PATH.')
  }
  const snapshot = stableRegularFileSnapshot(executable, 'Codex Python runtime')
  const result = spawnSync(snapshot.realPath, [
    '-I', '-c', 'import json, os, sys; print(json.dumps({"version": list(sys.version_info[:3]), "executable": os.path.realpath(sys.executable), "prefixes": [sys.prefix, sys.exec_prefix, sys.base_prefix, sys.base_exec_prefix]}))',
  ], { env, encoding: 'utf8', timeout: 5_000 })
  let proof: CodexPythonRuntimeProof | null = null
  try {
    const parsed: unknown = JSON.parse(String(result.stdout || ''))
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const candidate = parsed as Record<string, unknown>
      const version = candidate.version
      const executable = candidate.executable
      const prefixes = candidate.prefixes
      if (Array.isArray(version) && version.length === 3
          && version.every((part) => Number.isInteger(part))
          && typeof executable === 'string' && Array.isArray(prefixes)) {
        let resolvedExecutable: string | null = null
        try { resolvedExecutable = fs.realpathSync(executable) } catch { /* invalid proof */ }
        if (resolvedExecutable === snapshot.realPath) {
          proof = {
            version: version as [number, number, number],
            executable,
            prefixes,
          }
        }
      }
    }
  } catch { /* malformed output fails closed below */ }
  if (result.status !== 0 || result.error || String(result.stderr || '').trim()
      || !proof
      || proof.version[0] !== 3 || proof.version[1] < 10
      || !proof.prefixes.length) {
    throw new Error('Codex launch requires an executable Python 3.10+ runtime on the isolated child PATH.')
  }
  const readOnlyRoots = [...new Set([
    path.dirname(snapshot.realPath),
    ...proof.prefixes.map((candidate: unknown) => {
      if (typeof candidate !== 'string' || !path.isAbsolute(candidate)) {
        throw new Error('Codex Python runtime reported one invalid import root.')
      }
      const resolved = fs.realpathSync(candidate)
      if (!fs.statSync(resolved).isDirectory()) {
        throw new Error('Codex Python runtime import root is not a directory.')
      }
      return resolved
    }),
  ])].sort()
  return {
    executable: snapshot.realPath,
    identity: `${snapshot.identity}:version:${proof.version.join('.')}:roots:${readOnlyRoots.join(',')}`,
    readOnlyRoots,
  }
}

interface LeaseDirectorySnapshot {
  directories: string[]
  files: Array<{ path: string; identity: string }>
}

function clearCodexParentRuntimeArtifacts(home: string): void {
  // Parent CLI commands (`sandbox`, and on 0.148 also the final `login status`) create transport CA files
  // and tmp/arg0 helper symlinks under CODEX_HOME. They are not credentials or catalogue evidence and may
  // not enter the strict, symlink-free one-use launch lease.
  for (const name of ['proxy', 'tmp']) {
    const transient = path.join(home, name)
    try { fs.rmSync(transient, { recursive: true, force: true }) } catch { /* the subsequent snapshot fails closed */ }
  }
}

export function clearCodexCatalogueReceiptForRefresh(home: string): void {
  // Capability probes run before the live catalogue proof and may legitimately populate
  // models_cache.json. A subsequent non-bundled `debug models` can then receive HTTP 304 and leave
  // fetched_at unchanged, making a real account refresh indistinguishable from stale cache reuse.
  // Remove only the exact lease-local regular receipt so the proof must start without a conditional
  // cache. Anything non-regular fails closed instead of being followed or recursively removed.
  const requestedRoot = path.resolve(home)
  let requestedStat: fs.Stats
  try { requestedStat = fs.lstatSync(requestedRoot) } catch (error: any) {
    if (error?.code === 'ENOENT') {
      throw new Error('Codex isolated catalogue home is missing.')
    }
    throw new Error('Codex isolated catalogue home could not be inspected.')
  }
  if (!requestedStat.isDirectory() || requestedStat.isSymbolicLink()) {
    throw new Error('Codex isolated catalogue home changed or traverses a symlink.')
  }
  // macOS exposes its temporary directory through a stable /tmp -> /private/tmp ancestor alias. Resolve
  // that ancestor while still rejecting a lease directory that was itself replaced by a symlink.
  const root = fs.realpathSync(requestedRoot)
  const receiptPath = path.join(root, 'models_cache.json')
  let receiptStat: fs.Stats
  try {
    receiptStat = fs.lstatSync(receiptPath)
  } catch (error: any) {
    if (error?.code === 'ENOENT') return
    throw new Error(`Codex isolated catalogue receipt could not be inspected: ${String(error?.message || error)}`)
  }
  if (!receiptStat.isFile() || receiptStat.isSymbolicLink()) {
    throw new Error('Codex isolated catalogue receipt is not a regular file.')
  }
  try { fs.unlinkSync(receiptPath) } catch (error: any) {
    throw new Error(`Codex isolated catalogue receipt could not be cleared: ${String(error?.message || error)}`)
  }
}

function snapshotLeaseDirectory(home: string): LeaseDirectorySnapshot {
  const root = path.resolve(home)
  const rootStat = fs.lstatSync(root)
  if (!rootStat.isDirectory() || rootStat.isSymbolicLink() || fs.realpathSync(root) !== root) {
    throw new Error('Codex auth lease home changed or traverses a symlink.')
  }
  const directories: string[] = []
  const files: Array<{ path: string; identity: string }> = []
  const visit = (directory: string, relative: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      const child = path.join(directory, entry.name)
      const childRelative = relative ? `${relative}/${entry.name}` : entry.name
      if (entry.isSymbolicLink()) throw new Error('Codex auth lease contains a symlink.')
      if (entry.isDirectory()) {
        directories.push(childRelative)
        visit(child, childRelative)
      } else if (entry.isFile()) {
        files.push({
          path: childRelative,
          identity: stableRegularFileSnapshot(child, 'Codex auth lease file', {
            allowEmpty: true,
            requireSingleLink: true,
          }).identity,
        })
      } else {
        throw new Error('Codex auth lease contains a special file.')
      }
    }
  }
  visit(root, '')
  return { directories, files }
}

export interface IsolatedCodexProbeHome {
  readonly home: string
  readonly sourceAuthPath: string
  /** Seal the post-login/catalogue bytes and bind the exact executable used for the proof. */
  seal(command: string, commandIdentity: string): void
  /** Make the sealed lease eligible for exactly one launch until this absolute timestamp. */
  arm(expiresAt: number): void
  /** Install the only user config the spawned CLI may read, then bind its bytes into the lease. */
  installLaunchSandboxConfig(
    repoRoot: string,
    dataRoot: string,
    writablePaths?: readonly string[],
    protectedWritePaths?: readonly string[],
    protectedReadPaths?: readonly string[],
    publicationSocketPath?: string,
    runtimeReadPaths?: readonly string[],
    readOnlyCapabilityPaths?: readonly string[],
  ): string
  assertValid(command: string, commandIdentity: string): void
  consumeForSpawn(command: string, commandIdentity: string): void
  cleanup(): void
}

function tomlString(value: string): string {
  // JSON basic strings are valid TOML basic strings and safely quote arbitrary absolute paths.
  return JSON.stringify(value)
}

export function codexSandboxConfig(options: {
  repoRoot: string
  dataRoot: string
  scratchRoot?: string
  leaseAuthPath: string
  sourceAuthPath: string
  writablePaths?: readonly string[]
  protectedWritePaths?: readonly string[]
  protectedReadPaths?: readonly string[]
  publicationSocketPath?: string
  runtimeReadPaths?: readonly string[]
  readOnlyCapabilityPaths?: readonly string[]
}): string {
  const normalizePaths = (values: readonly string[] | undefined, label: string): string[] => {
    const normalized = new Set<string>()
    for (const value of values ?? []) {
      if (typeof value !== 'string' || !value.trim() || !path.isAbsolute(value)) {
        throw new Error(`${label} paths must be non-empty absolute paths.`)
      }
      normalized.add(path.resolve(value))
    }
    return [...normalized].sort()
  }
  const protectedReads = normalizePaths(options.protectedReadPaths, 'Codex protected-read')
  const protectedWrites = normalizePaths(options.protectedWritePaths, 'Codex protected-write')
    .filter((candidate) => !protectedReads.some((denied) => (
      candidate === denied || candidate.startsWith(`${denied}${path.sep}`)
    )))
  const access = new Map<string, 'read' | 'write' | 'deny'>([[':minimal', 'read']])
  for (const candidate of [options.repoRoot, options.dataRoot].filter(Boolean) as string[]) {
    if (!path.isAbsolute(candidate)) throw new Error('Codex permission-profile paths must be absolute.')
    access.set(path.resolve(candidate), 'read')
  }
  for (const candidate of normalizePaths(options.runtimeReadPaths, 'Codex runtime-read')) {
    access.set(candidate, 'read')
  }
  for (const candidate of normalizePaths(options.readOnlyCapabilityPaths, 'Codex read-only capability')) {
    access.set(candidate, 'read')
  }
  if (options.scratchRoot) access.set(path.resolve(options.scratchRoot), 'write')
  for (const candidate of normalizePaths(options.writablePaths, 'Codex writable')) access.set(candidate, 'write')
  // Code/Git/archive paths stay readable but become OS read-only even if a child output grant overlaps.
  for (const candidate of protectedWrites) access.set(candidate, 'read')
  // STATE_DIR and other supervisor secrets are neither readable nor writable. More restrictive wins.
  for (const candidate of protectedReads) access.set(candidate, 'deny')
  access.set(path.resolve(options.leaseAuthPath), 'deny')
  access.set(path.dirname(path.resolve(options.sourceAuthPath)), 'deny')
  // The socket lives in the supervisor-owned, non-temporary IPC tree outside STATE_DIR. Admit metadata
  // reads for only this private parent and socket so supervisor_publication.py can verify ownership, type,
  // and mode before connecting. The broader state root remains denied, neither exact path is writable,
  // and the separate network rule still grants connect to this socket only.
  if (options.publicationSocketPath) {
    const requestedSocket = path.resolve(options.publicationSocketPath)
    const requestedParent = path.dirname(requestedSocket)
    access.set(requestedSocket, 'read')
    access.set(requestedParent, 'read')
    try {
      const canonicalParent = fs.realpathSync(requestedParent)
      access.set(path.join(canonicalParent, path.basename(requestedSocket)), 'read')
      access.set(canonicalParent, 'read')
    } catch { /* raw config fixtures may not exist */ }
  }
  const entries = [...access.entries()]
  const network = options.publicationSocketPath ? [
    `[permissions.${CODEX_COCKPIT_PERMISSION_PROFILE}.network]`,
    // `enabled` activates managed enforcement; it is not a broad network grant in this configuration.
    'enabled = true',
    'mode = "limited"',
    'allow_local_binding = false',
    'dangerously_allow_all_unix_sockets = false',
    '',
    `[permissions.${CODEX_COCKPIT_PERMISSION_PROFILE}.network.domains]`,
    '',
    `[permissions.${CODEX_COCKPIT_PERMISSION_PROFILE}.network.unix_sockets]`,
    `${tomlString(path.resolve(options.publicationSocketPath))} = "allow"`,
    '',
  ] : []
  return [
    'approval_policy = "on-request"',
    'approvals_reviewer = "auto_review"',
    // The managed proxy feature is the CLI's enforcement switch. Limited mode with no domains keeps
    // all TCP/public traffic closed while the profile's one AF_UNIX exception is compiled into Seatbelt.
    ...(options.publicationSocketPath ? ['features.network_proxy = true'] : []),
    `default_permissions = ${tomlString(CODEX_COCKPIT_PERMISSION_PROFILE)}`,
    '',
    `[permissions.${CODEX_COCKPIT_PERMISSION_PROFILE}.filesystem]`,
    ...entries.map(([candidate, permission]) => `${tomlString(candidate)} = ${tomlString(permission)}`),
    '',
    ...network,
  ].join('\n')
}

interface CodexAuthLeaseMarker {
  schemaVersion: 1
  leaseId: string
  directoryDevice: string
  directoryInode: string
  ownerUid: number
  creatorPid: number
  createdAt: number
}

function processIsAlive(pid: number): boolean {
  if (!Number.isSafeInteger(pid) || pid <= 0) return false
  try { process.kill(pid, 0); return true } catch (error: any) { return error?.code === 'EPERM' }
}

export function sweepStaleCodexProbeHomes(options: {
  tmpRoot?: string
  now?: () => number
  minAgeMs?: number
  isProcessAlive?: (pid: number) => boolean
} = {}): { scanned: number; credentialsRemoved: number } {
  const tmpRoot = fs.realpathSync(options.tmpRoot ?? os.tmpdir())
  const now = options.now ?? Date.now
  const minAgeMs = Math.max(options.minAgeMs ?? CODEX_STALE_AUTH_LEASE_AGE_MS, 60_000)
  const alive = options.isProcessAlive ?? processIsAlive
  const expectedUid = typeof process.getuid === 'function' ? BigInt(process.getuid()) : undefined
  let scanned = 0
  let credentialsRemoved = 0
  for (const entry of fs.readdirSync(tmpRoot, { withFileTypes: true })) {
    if (!new RegExp(`^${CODEX_AUTH_LEASE_PREFIX}[A-Za-z0-9]{6}$`).test(entry.name) || !entry.isDirectory()) continue
    scanned += 1
    const candidate = path.join(tmpRoot, entry.name)
    try {
      const directory = fs.lstatSync(candidate, { bigint: true })
      if (directory.isSymbolicLink() || !directory.isDirectory()
          || (expectedUid !== undefined && directory.uid !== expectedUid)
          || (directory.mode & 0o077n) !== 0n) continue
      const markerSnapshot = stableRegularFileSnapshot(
        path.join(candidate, CODEX_AUTH_LEASE_MARKER), 'Codex auth lease marker',
        { capture: true, maxBytes: 4096, requireSingleLink: true },
      )
      let marker: CodexAuthLeaseMarker
      try { marker = JSON.parse(markerSnapshot.bytes!.toString('utf8')) } catch { continue }
      const exactKeys = [
        'createdAt', 'creatorPid', 'directoryDevice', 'directoryInode', 'leaseId', 'ownerUid', 'schemaVersion',
      ]
      if (JSON.stringify(Object.keys(marker).sort()) !== JSON.stringify(exactKeys)
          || marker.schemaVersion !== 1
          || marker.leaseId !== entry.name
          || marker.directoryDevice !== String(directory.dev)
          || marker.directoryInode !== String(directory.ino)
          || marker.ownerUid !== Number(directory.uid)
          || !Number.isSafeInteger(marker.creatorPid) || marker.creatorPid <= 0
          || !Number.isFinite(marker.createdAt) || marker.createdAt < 0) continue
      const age = now() - marker.createdAt
      if (!Number.isFinite(age) || age < minAgeMs || alive(marker.creatorPid)) continue
      const authPath = path.join(candidate, 'auth.json')
      const auth = fs.lstatSync(authPath, { bigint: true })
      if (auth.isSymbolicLink() || !auth.isFile() || auth.nlink !== 1n
          || (expectedUid !== undefined && auth.uid !== expectedUid)
          || (auth.mode & 0o077n) !== 0n || auth.size <= 0n || auth.size > BigInt(CODEX_AUTH_MAX_BYTES)) continue
      // Delete only the one credential pathname proven to belong to our stale marked lease. Never
      // recursively delete a temp-prefix match: crash debris may have been replaced after the crash.
      fs.unlinkSync(authPath)
      credentialsRemoved += 1
      try { fs.unlinkSync(path.join(candidate, CODEX_AUTH_LEASE_MARKER)) } catch { /* credential is already gone */ }
      try { fs.rmdirSync(candidate) } catch { /* retain non-secret crash diagnostics */ }
    } catch { /* malformed, raced, or foreign prefix: fail closed and leave it alone */ }
  }
  return { scanned, credentialsRemoved }
}

// Best-effort startup hygiene. Live owners and young/raced/foreign directories are never touched.
try { sweepStaleCodexProbeHomes() } catch { /* availability probing still performs exact lease cleanup */ }

/** Copy only the saved ChatGPT credential into a fresh home. User config and model caches are deliberately
 * absent, so a debug-models success can only come from a fresh account refresh under the installed CLI. */
export function createIsolatedCodexProbeHome(
  source: NodeJS.ProcessEnv = process.env,
  options: { now?: () => number; tmpRoot?: string } = {},
): IsolatedCodexProbeHome {
  const now = options.now ?? Date.now
  const configuredHome = source.CODEX_HOME
    || path.join(source.HOME || os.homedir(), '.codex')
  if (!path.isAbsolute(configuredHome)) throw new Error('Codex auth home must be absolute.')
  const authPath = path.join(configuredHome, 'auth.json')
  let sourceAuth: StableFileSnapshot
  try {
    sourceAuth = stableRegularFileSnapshot(authPath, 'Codex ChatGPT auth file', {
      capture: true, maxBytes: CODEX_AUTH_MAX_BYTES, requireSingleLink: true,
    })
  } catch {
    throw new Error('Codex ChatGPT auth file is missing. Run `codex login` and choose ChatGPT login.')
  }
  const tmpRoot = fs.realpathSync(options.tmpRoot ?? os.tmpdir())
  const home = fs.realpathSync(fs.mkdtempSync(path.join(tmpRoot, CODEX_AUTH_LEASE_PREFIX)))
  fs.chmodSync(home, 0o700)
  try {
    const directory = fs.lstatSync(home, { bigint: true })
    const createdAt = now()
    if (!Number.isFinite(createdAt) || createdAt < 0) throw new Error('Codex auth lease clock is invalid.')
    const marker: CodexAuthLeaseMarker = {
      schemaVersion: 1,
      leaseId: path.basename(home),
      directoryDevice: String(directory.dev),
      directoryInode: String(directory.ino),
      ownerUid: Number(directory.uid),
      creatorPid: process.pid,
      createdAt,
    }
    fs.writeFileSync(path.join(home, CODEX_AUTH_LEASE_MARKER), JSON.stringify(marker), { flag: 'wx', mode: 0o600 })
    fs.writeFileSync(path.join(home, 'auth.json'), sourceAuth.bytes!, { flag: 'wx', mode: 0o600 })
  } catch (error) {
    fs.rmSync(home, { recursive: true, force: true })
    throw error
  } finally {
    sourceAuth.bytes?.fill(0)
  }
  let sealedSnapshot: string | undefined
  let boundCommand: string | undefined
  let boundCommandIdentity: string | undefined
  let expiresAt: number | undefined
  let consumed = false
  let cleaned = false
  let sandboxConfigured = false

  const assertValid = (command: string, commandIdentity: string) => {
    if (cleaned) throw new Error('Codex auth lease was already cleaned up.')
    if (consumed) throw new Error('Codex auth lease was already consumed.')
    if (!sealedSnapshot || !boundCommand || !boundCommandIdentity || expiresAt === undefined) {
      throw new Error('Codex auth lease was not sealed and armed by a fresh launch proof.')
    }
    if (now() < 0 || now() > expiresAt) throw new Error('Codex auth lease expired before spawn.')
    if (command !== boundCommand || commandIdentity !== boundCommandIdentity) {
      throw new Error('Codex executable identity no longer matches the verified launch proof.')
    }
    if (pinCodexExecutable(command, { PATH: source.PATH }).identity !== boundCommandIdentity) {
      throw new Error('Codex executable changed after the verified launch proof.')
    }
    const currentSourceAuth = stableRegularFileSnapshot(authPath, 'Codex ChatGPT auth file', {
      maxBytes: CODEX_AUTH_MAX_BYTES, requireSingleLink: true,
    }).identity
    if (currentSourceAuth !== sourceAuth.identity) {
      throw new Error('Codex ChatGPT credential changed after the verified launch proof.')
    }
    if (JSON.stringify(snapshotLeaseDirectory(home)) !== sealedSnapshot) {
      throw new Error('Codex leased credential or probe state changed after verification.')
    }
  }

  return {
    home,
    sourceAuthPath: sourceAuth.realPath,
    seal(command, commandIdentity) {
      if (cleaned || consumed || sealedSnapshot) throw new Error('Codex auth lease cannot be resealed.')
      if (pinCodexExecutable(command, { PATH: source.PATH }).identity !== commandIdentity) {
        throw new Error('Codex executable changed during the verified launch proof.')
      }
      boundCommand = command
      boundCommandIdentity = commandIdentity
      sealedSnapshot = JSON.stringify(snapshotLeaseDirectory(home))
    },
    arm(value) {
      if (cleaned || consumed || !sealedSnapshot || expiresAt !== undefined
          || !Number.isFinite(value) || value < now()) {
        throw new Error('Codex auth lease cannot be armed with an invalid or stale proof.')
      }
      expiresAt = value
    },
    installLaunchSandboxConfig(
      repoRoot, dataRoot, writablePaths, protectedWritePaths, protectedReadPaths, publicationSocketPath,
      runtimeReadPaths, readOnlyCapabilityPaths,
    ) {
      if (sandboxConfigured) throw new Error('Codex launch permission profile was already installed.')
      assertValid(boundCommand!, boundCommandIdentity!)
      const configPath = path.join(home, 'config.toml')
      const scratchRoot = path.join(home, 'sandbox-tmp')
      const config = codexSandboxConfig({
        repoRoot,
        dataRoot,
        scratchRoot,
        leaseAuthPath: path.join(home, 'auth.json'),
        sourceAuthPath: sourceAuth.realPath,
        writablePaths,
        protectedWritePaths,
        protectedReadPaths,
        publicationSocketPath,
        runtimeReadPaths,
        readOnlyCapabilityPaths,
      })
      try {
        fs.mkdirSync(scratchRoot, { mode: 0o700 })
        fs.writeFileSync(configPath, config, { flag: 'wx', mode: 0o600 })
        sandboxConfigured = true
        sealedSnapshot = JSON.stringify(snapshotLeaseDirectory(home))
        return scratchRoot
      } catch (error) {
        try { fs.rmSync(configPath, { force: true }) } catch { /* best effort */ }
        try { fs.rmSync(scratchRoot, { recursive: true, force: true }) } catch { /* best effort */ }
        throw error
      }
    },
    assertValid,
    consumeForSpawn(command, commandIdentity) {
      if (!sandboxConfigured) throw new Error('Codex launch permission profile was not installed.')
      assertValid(command, commandIdentity)
      consumed = true
    },
    cleanup() {
      if (cleaned) return
      fs.rmSync(home, { recursive: true, force: true })
      cleaned = true
      sealedSnapshot = undefined
    },
  }
}

const CODEX_PERMISSION_BOUNDARY_PROBE = String.raw`
( exec 3<"$1" ) 2>/dev/null && exit 31
( exec 3<>"$1" ) 2>/dev/null && exit 32
( exec 3<"$2" ) 2>/dev/null && exit 33
( exec 3<>"$2" ) 2>/dev/null && exit 34
printf repo-write >"$3" || exit 35
printf data-write >"$4" || exit 36
printf scratch-write >"$5" || exit 37
{ printf outside-write >"$6"; } 2>/dev/null && exit 38
{ printf forged >"$7"; } 2>/dev/null && exit 39
{ printf forged >"$8"; } 2>/dev/null && exit 40
{ printf forged >"$9"; } 2>/dev/null && exit 41
shift 9
{ printf forged >"$1"; } 2>/dev/null && exit 42
{ printf forged >"$2"; } 2>/dev/null && exit 43
{ printf forged >"$3"; } 2>/dev/null && exit 44
{ printf forged >"$4"; } 2>/dev/null && exit 45
{ printf forged >"$5"; } 2>/dev/null && exit 46
{ printf forged >"$6"; } 2>/dev/null && exit 47
( exec 3<"$7" ) 2>/dev/null && exit 48
{ cat "$7" >/dev/null; } 2>/dev/null && exit 49
{ ls "$(dirname "$7")" >/dev/null; } 2>/dev/null && exit 50
{ printf forged >"$7"; } 2>/dev/null && exit 51
{ printf forged >"$8"; } 2>/dev/null && exit 52
shift 8
{ printf forged >"$1"; } 2>/dev/null && exit 53
{ printf forged >"$2"; } 2>/dev/null && exit 54
shift 2
"$5" -I -c 'import hashlib, json, sys; raise SystemExit(0 if sys.version_info >= (3, 10) else 1)' \
  >/dev/null 2>&1 || exit 55
"$5" -I -c 'import os, stat, sys; p=sys.argv[1]; s=os.stat(p, follow_symlinks=False); d=os.stat(os.path.dirname(p), follow_symlinks=False); raise SystemExit(0 if stat.S_ISSOCK(s.st_mode) and stat.S_ISDIR(d.st_mode) and s.st_uid == os.getuid() and d.st_uid == os.getuid() and not (s.st_mode & 0o077) and not (d.st_mode & 0o077) else 1)' "$1" \
  >/dev/null 2>&1 || exit 56
/usr/bin/curl --disable --fail --silent --show-error --max-time 3 \
  --unix-socket "$1" -X POST \
  -H 'X-Nostra-Publication-Token: boundary-token' \
  --data-binary '{"phase":"sandbox-boundary-probe"}' \
  http://localhost/publication >"$4" || exit 57
{ /usr/bin/curl --disable --fail --silent --max-time 2 --unix-socket "$2" http://localhost/unrelated >/dev/null 2>&1; } && exit 58
{ /usr/bin/curl --disable --fail --silent --max-time 2 "$3" >/dev/null 2>&1; } && exit 59
{ /usr/bin/curl --disable --fail --silent --max-time 2 https://api.openai.com/ >/dev/null 2>&1; } && exit 60
socket_parent=$(/usr/bin/dirname "$1")
{ /bin/chmod 0777 "$socket_parent"; } >/dev/null 2>&1 && exit 61
{ /bin/rm -f "$1"; } >/dev/null 2>&1 && exit 62
{ printf forged >"$socket_parent/forged-file"; } 2>/dev/null && exit 63
{ /bin/ln -s "$2" "$socket_parent/forged-link"; } >/dev/null 2>&1 && exit 64
( /usr/bin/printf '' | /usr/bin/nc -lU "$socket_parent/forged.sock" ) >/dev/null 2>&1 &
forged_pid=$!
/bin/sleep 0.1
if [ -S "$socket_parent/forged.sock" ]; then
  /bin/kill "$forged_pid" >/dev/null 2>&1 || :
  wait "$forged_pid" >/dev/null 2>&1 || :
  exit 65
fi
wait "$forged_pid" >/dev/null 2>&1 || :
exit 0
`

/**
 * Prove the installed CLI enforces the same named profile the run will use. This is an OS-sandbox
 * probe, not a chmod check: the parent CLI can still read auth.json, while a model-equivalent child
 * process must be unable to open either credential for reading or mutation.
 */
export async function assertCodexCredentialSandboxBoundary(options: {
  command: string
  env: NodeJS.ProcessEnv
  leaseHome: string
  sourceAuthPath: string
  pythonRuntime: CodexPythonRuntime
  timeoutMs?: number
}): Promise<void> {
  const leaseHome = fs.realpathSync(options.leaseHome)
  const leaseAuthPath = path.join(leaseHome, 'auth.json')
  const configPath = path.join(leaseHome, 'config.toml')
  if (fs.existsSync(configPath)) throw new Error('Codex credential-boundary probe found an unexpected user config.')
  const fixtureRoot = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-codex-sandbox-')))
  const repoRoot = path.join(fixtureRoot, 'repo')
  const dataRoot = path.join(fixtureRoot, 'data')
  const scratchRoot = path.join(fixtureRoot, 'scratch')
  const outsideRoot = path.join(fixtureRoot, 'outside')
  const runRoot = path.join(repoRoot, 'analyses', 'PROBE_run')
  const dataOutputRoot = path.join(dataRoot, 'PROBE_run')
  const codeRoot = path.join(repoRoot, 'scripts')
  const decisionsRoot = path.join(repoRoot, 'commodity', 'PROBE', 'decisions')
  const resolvedGitDir = path.join(fixtureRoot, 'git-dir')
  const commonGitDir = path.join(fixtureRoot, 'git-common-dir')
  const stateRoot = path.join(repoRoot, '.state')
  // Darwin AF_UNIX paths are short. Use a non-platform-writable parent, matching the supervisor's
  // protected STATE_DIR transport rather than /tmp (whose implicit write grant defeats path denies).
  const socketRoot = fs.mkdtempSync(path.join(os.homedir(), '.nostra-codex-ipc-'))
  for (const directory of [
    repoRoot, dataRoot, dataOutputRoot, scratchRoot, outsideRoot, runRoot, codeRoot, decisionsRoot,
    resolvedGitDir, commonGitDir, stateRoot,
  ]) {
    fs.mkdirSync(directory, { recursive: true, mode: 0o700 })
  }
  const gitPointer = path.join(repoRoot, '.git')
  const codeSentinel = path.join(codeRoot, 'engine-code')
  const decisionsSentinel = path.join(decisionsRoot, 'archived-decision')
  const resolvedGitSentinel = path.join(resolvedGitDir, 'HEAD')
  const commonGitSentinel = path.join(commonGitDir, 'config')
  const stateSentinel = path.join(stateRoot, 'supervisor-secret')
  fs.writeFileSync(gitPointer, 'gitdir: /must/not/mutate\n', { mode: 0o600 })
  fs.writeFileSync(codeSentinel, 'engine-code\n', { mode: 0o600 })
  fs.writeFileSync(decisionsSentinel, 'archived-decision\n', { mode: 0o600 })
  fs.writeFileSync(resolvedGitSentinel, 'ref: refs/heads/main\n', { mode: 0o600 })
  fs.writeFileSync(commonGitSentinel, '[core]\n', { mode: 0o600 })
  fs.writeFileSync(stateSentinel, 'must-not-be-readable\n', { mode: 0o600 })
  const repoFile = path.join(runRoot, 'write-proof')
  const dataFile = path.join(dataOutputRoot, 'write-proof')
  const scratchFile = path.join(scratchRoot, 'write-proof')
  const outsideFile = path.join(outsideRoot, 'must-not-exist')
  const repoRootForbidden = path.join(repoRoot, 'must-not-create-at-root')
  const dataRootForbidden = path.join(dataRoot, 'must-not-create-at-root')
  const publicationSocket = path.join(socketRoot, 'p.sock')
  const unrelatedSocket = path.join(socketRoot, 'unrelated.sock')
  const transportOutput = path.join(runRoot, 'publication-response')
  let publicationRequest: { method?: string; url?: string; token?: string; body: string } | undefined
  let unrelatedUnixRequests = 0
  let unrelatedTcpRequests = 0
  const publicationServer = http.createServer((request, response) => {
    let body = ''
    request.setEncoding('utf8')
    request.on('data', (chunk) => { if (body.length <= 4096) body += chunk })
    request.on('end', () => {
      publicationRequest = {
        method: request.method,
        url: request.url,
        token: typeof request.headers['x-nostra-publication-token'] === 'string'
          ? request.headers['x-nostra-publication-token'] : undefined,
        body,
      }
      const valid = publicationRequest.method === 'POST'
        && publicationRequest.url === '/publication'
        && publicationRequest.token === 'boundary-token'
        && publicationRequest.body === '{"phase":"sandbox-boundary-probe"}'
      response.writeHead(valid ? 200 : 400, { 'content-type': 'text/plain' })
      response.end(valid ? 'publication-transport-ok' : 'invalid')
    })
  })
  const unrelatedUnixServer = http.createServer((_request, response) => {
    unrelatedUnixRequests += 1
    response.writeHead(200).end('must-not-connect')
  })
  const unrelatedTcpServer = http.createServer((_request, response) => {
    unrelatedTcpRequests += 1
    response.writeHead(200).end('must-not-connect')
  })
  const listen = (server: http.Server, target: string | { host: string; port: number }) => new Promise<void>((resolve, reject) => {
    const onError = (error: Error) => { server.off('listening', onListening); reject(error) }
    const onListening = () => { server.off('error', onError); resolve() }
    server.once('error', onError)
    server.once('listening', onListening)
    if (typeof target === 'string') server.listen(target)
    else server.listen(target.port, target.host)
  })
  const close = (server: http.Server) => new Promise<void>((resolve) => {
    if (!server.listening) { resolve(); return }
    server.close(() => resolve())
  })
  const leaseBefore = stableRegularFileSnapshot(leaseAuthPath, 'Codex leased credential', {
    maxBytes: CODEX_AUTH_MAX_BYTES, requireSingleLink: true,
  }).identity
  const sourceBefore = stableRegularFileSnapshot(options.sourceAuthPath, 'Codex source credential', {
    maxBytes: CODEX_AUTH_MAX_BYTES, requireSingleLink: true,
  }).identity
  const timeout = Math.max(1_000, Math.min(options.timeoutMs ?? 15_000, 30_000))
  try {
    await Promise.all([
      listen(publicationServer, publicationSocket),
      listen(unrelatedUnixServer, unrelatedSocket),
      listen(unrelatedTcpServer, { host: '127.0.0.1', port: 0 }),
    ])
    fs.chmodSync(publicationSocket, 0o600)
    fs.chmodSync(unrelatedSocket, 0o600)
    const publicationSocketBefore = stableUnixSocketSnapshot(publicationSocket, 'Codex boundary-probe publication socket')
    const tcpAddress = unrelatedTcpServer.address()
    if (!tcpAddress || typeof tcpAddress === 'string') throw new Error('Could not bind the TCP denial probe.')
    fs.writeFileSync(configPath, codexSandboxConfig({
      repoRoot,
      dataRoot,
      scratchRoot,
      leaseAuthPath,
      sourceAuthPath: options.sourceAuthPath,
      writablePaths: [runRoot, dataOutputRoot],
      protectedWritePaths: [codeRoot, gitPointer, decisionsRoot, resolvedGitDir, commonGitDir],
      protectedReadPaths: [stateRoot],
      publicationSocketPath: publicationSocket,
      runtimeReadPaths: options.pythonRuntime.readOnlyRoots,
    }), { flag: 'wx', mode: 0o600 })
    const env = { ...options.env, CODEX_HOME: leaseHome }

    const result = await execa(options.command, [
      '--cd', repoRoot,
      '--add-dir', dataRoot,
      '--add-dir', scratchRoot,
      'sandbox', '--', '/bin/sh', '-c', CODEX_PERMISSION_BOUNDARY_PROBE, 'nostra-boundary-probe',
      leaseAuthPath, options.sourceAuthPath, repoFile, dataFile, scratchFile, outsideFile,
      codeSentinel, path.join(codeRoot, 'must-not-create'), gitPointer,
      decisionsSentinel, path.join(decisionsRoot, 'must-not-create'),
      resolvedGitSentinel, path.join(resolvedGitDir, 'must-not-create'),
      commonGitSentinel, path.join(commonGitDir, 'must-not-create'),
      stateSentinel, path.join(stateRoot, 'must-not-create'),
      repoRootForbidden, dataRootForbidden,
      publicationSocket, unrelatedSocket, `http://127.0.0.1:${tcpAddress.port}/unrelated`, transportOutput,
      options.pythonRuntime.executable,
    ], { cwd: repoRoot, env, reject: false, timeout })
    const protectedTreeIntact = fs.readFileSync(codeSentinel, 'utf8') === 'engine-code\n'
        && fs.readFileSync(gitPointer, 'utf8') === 'gitdir: /must/not/mutate\n'
        && fs.readFileSync(decisionsSentinel, 'utf8') === 'archived-decision\n'
        && fs.readFileSync(resolvedGitSentinel, 'utf8') === 'ref: refs/heads/main\n'
        && fs.readFileSync(commonGitSentinel, 'utf8') === '[core]\n'
        && fs.readFileSync(stateSentinel, 'utf8') === 'must-not-be-readable\n'
        && fs.readdirSync(codeRoot).length === 1
        && fs.readdirSync(decisionsRoot).length === 1
        && fs.readdirSync(resolvedGitDir).length === 1
        && fs.readdirSync(commonGitDir).length === 1
        && fs.readdirSync(stateRoot).length === 1
    if (!protectedTreeIntact) {
      throw new Error('Installed Codex CLI allowed a protected code, Git, archive, or supervisor-state mutation.')
    }
    if (result.exitCode !== 0 || result.failed || String(result.stdout || '').trim() || String(result.stderr || '').trim()) {
      const diagnostic = String(result.stderr || result.stdout || '').trim().split(/\r?\n/)[0]?.slice(0, 240)
      throw new Error(`Installed Codex CLI failed the credential sandbox boundary probe (exit ${result.exitCode ?? 'unknown'}${diagnostic ? `: ${diagnostic}` : ''}).`)
    }
    if (fs.readFileSync(repoFile, 'utf8') !== 'repo-write'
        || fs.readFileSync(dataFile, 'utf8') !== 'data-write'
        || fs.readFileSync(scratchFile, 'utf8') !== 'scratch-write'
        || fs.existsSync(outsideFile) || fs.existsSync(repoRootForbidden) || fs.existsSync(dataRootForbidden)) {
      throw new Error('Installed Codex CLI did not enforce the exact read/write permission-profile boundaries.')
    }
    if (fs.readFileSync(transportOutput, 'utf8') !== 'publication-transport-ok'
        || !publicationRequest
        || publicationRequest.method !== 'POST'
        || publicationRequest.url !== '/publication'
        || publicationRequest.token !== 'boundary-token'
        || publicationRequest.body !== '{"phase":"sandbox-boundary-probe"}'
        || unrelatedUnixRequests !== 0
        || unrelatedTcpRequests !== 0
        || fs.readdirSync(socketRoot).sort().join(',') !== 'p.sock,unrelated.sock'
        || stableUnixSocketSnapshot(publicationSocket, 'Codex boundary-probe publication socket').identity
          !== publicationSocketBefore.identity) {
      throw new Error('Installed Codex CLI did not enforce the endpoint-scoped publication socket boundary.')
    }
    if (stableRegularFileSnapshot(leaseAuthPath, 'Codex leased credential', {
      maxBytes: CODEX_AUTH_MAX_BYTES, requireSingleLink: true,
    }).identity !== leaseBefore
        || stableRegularFileSnapshot(options.sourceAuthPath, 'Codex source credential', {
          maxBytes: CODEX_AUTH_MAX_BYTES, requireSingleLink: true,
        }).identity !== sourceBefore) {
      throw new Error('Codex credential changed during the sandbox boundary probe.')
    }
  } catch (error: any) {
    if (/^Installed Codex CLI|^Codex credential/.test(String(error?.message || ''))) throw error
    throw new Error(`Installed Codex CLI could not prove its credential sandbox boundary: ${String(error?.message || error)}`)
  } finally {
    await Promise.all([close(publicationServer), close(unrelatedUnixServer), close(unrelatedTcpServer)])
    try { fs.rmSync(configPath, { force: true }) } catch { /* cleanup below remains best effort */ }
    // `codex sandbox` creates parent-CLI transport material under CODEX_HOME while enforcing the child
    // profile: proxy CA files plus tmp/arg0 helper symlinks. They are expected implementation debris, not
    // launch credentials or catalogue proof, and cannot be sealed into the one-use lease (which correctly
    // rejects every symlink). Remove only these two fixed lease-local namespaces after the sandbox process
    // has exited; the later login/catalogue probes then seal their own strict regular-file state.
    clearCodexParentRuntimeArtifacts(leaseHome)
    fs.rmSync(fixtureRoot, { recursive: true, force: true })
    fs.rmSync(socketRoot, { recursive: true, force: true })
  }
}

export function parseCodexCatalog(stdout: string, stderr = ''): CatalogModel[] {
  if (stderr.trim()) {
    throw new Error(`Codex live model catalogue emitted a diagnostic: ${stderr.trim().split(/\r?\n/)[0].slice(0, 240)}`)
  }
  // A successful refresh is one strict JSON document. Do not accept a warning/fallback/auth/cache banner
  // followed by otherwise-valid JSON; those are precisely the stale or unauthenticated paths this probe
  // exists to reject. JSON string contents are not scanned, because model descriptions may discuss these
  // concepts legitimately.
  if (/^\s*(?:warning\b|warn\b|error\b|fallback\b|falling\s+back\b|using\s+(?:a\s+)?(?:cached|bundled)\b|cache(?:d)?\b|unauthenticated\b|auth(?:entication)?\s+(?:failed|required|error)\b)/im.test(stdout)) {
    throw new Error('Codex live model catalogue reported a warning, auth failure, or cached/bundled fallback.')
  }
  let decoded: unknown
  try { decoded = JSON.parse(stdout) } catch {
    throw new Error('Codex live model catalogue was not valid JSON.')
  }
  if (!decoded || typeof decoded !== 'object' || Array.isArray(decoded)) {
    throw new Error('Codex live model catalogue was empty or malformed.')
  }
  const keys = Object.keys(decoded as Record<string, unknown>)
  if (keys.length !== 1 || keys[0] !== 'models') {
    throw new Error('Codex live model catalogue included fallback, cache, auth, warning, or unknown metadata.')
  }
  if (!Array.isArray((decoded as any).models) || !(decoded as any).models.length) {
    throw new Error('Codex live model catalogue was empty or malformed.')
  }
  return (decoded as any).models as CatalogModel[]
}

function reasoningEfforts(model: CatalogModel): string[] {
  if (!Array.isArray(model.supported_reasoning_levels)) return []
  return model.supported_reasoning_levels
    .map((level: CatalogReasoningLevel) => typeof level?.effort === 'string' ? level.effort : '')
    .filter(Boolean)
}

// Codex CLI 0.149.0 stopped serializing `supports_parallel_tool_calls` in `debug models`, even though the
// same account catalogue still advertises v2 multi-agent + search and the GPT-5.6 contract supports
// parallel tool calls. Keep this exception exact and temporary: `false` always fails, an omitted field
// fails on every other CLI version, and all remaining live catalogue gates remain mandatory.
const CODEX_PARALLEL_CAPABILITY_OMISSION_VERSION = /^codex-cli\s+0\.149\.0$/i

export function assertRequiredCodexModels(models: CatalogModel[], cliVersion = ''): void {
  for (const required of CODEX_MODEL_CONTRACTS) {
    const matches = models.filter((candidate) => candidate.slug === required.model)
    if (matches.length !== 1) throw new Error(`Codex live model catalogue must contain exactly one ${required.model} entry; found ${matches.length}.`)
    const model = matches[0]
    if (model.visibility !== 'list' || model.supported_in_api !== true) {
      throw new Error(`${required.model} is not list-visible and API-supported in the live Codex catalogue.`)
    }
    if (!reasoningEfforts(model).includes(required.reasoningLevel)) {
      throw new Error(`${required.model} does not advertise reasoning '${required.reasoningLevel}' in the live Codex catalogue.`)
    }
    if (model.multi_agent_version !== 'v2') {
      throw new Error(`${required.model} does not advertise the required v2 multi-agent capability.`)
    }
    if (model.supports_search_tool !== true) {
      throw new Error(`${required.model} does not advertise the required search-tool capability.`)
    }
    const parallelCapabilityAdvertised = model.supports_parallel_tool_calls === true
    const knownCliOmission = model.supports_parallel_tool_calls === undefined
      && CODEX_PARALLEL_CAPABILITY_OMISSION_VERSION.test(cliVersion)
    if (!parallelCapabilityAdvertised && !knownCliOmission) {
      throw new Error(`${required.model} does not advertise the required parallel-tool capability.`)
    }
  }
}

export function assertFreshCodexCatalogueReceipt(
  probeHome: string,
  models: CatalogModel[],
  refreshStartedAt: number,
  now = Date.now(),
): void {
  const receiptPath = path.join(probeHome, 'models_cache.json')
  let stat: fs.Stats
  try { stat = fs.lstatSync(receiptPath) } catch { throw new Error('Codex live catalogue refresh wrote no account-cache receipt.') }
  if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Codex live catalogue receipt is not a regular file.')
  let receipt: any
  try { receipt = JSON.parse(fs.readFileSync(receiptPath, 'utf8')) } catch { throw new Error('Codex live catalogue receipt was not valid JSON.') }
  const fetchedAt = typeof receipt?.fetched_at === 'string' ? Date.parse(receipt.fetched_at) : Number.NaN
  if (!Number.isFinite(fetchedAt) || fetchedAt < refreshStartedAt - 5_000 || fetchedAt > now + 5_000) {
    throw new Error('Codex account catalogue did not prove a fresh non-bundled refresh.')
  }
  if (typeof receipt.etag !== 'string' || !receipt.etag.trim()) throw new Error('Codex live catalogue receipt omitted its account ETag.')
  if (!Array.isArray(receipt.models)) {
    throw new Error('Codex live catalogue output disagreed with its fresh account receipt.')
  }
  const slugs = (rows: CatalogModel[]) => rows.map((row) => row.slug).filter((slug): slug is string => typeof slug === 'string').sort()
  if (JSON.stringify(slugs(receipt.models)) !== JSON.stringify(slugs(models))) {
    throw new Error('Codex live catalogue output disagreed with its fresh account receipt.')
  }
  for (const required of CODEX_MODEL_CONTRACTS) {
    const project = (row: CatalogModel | undefined) => row && ({
      slug: row.slug,
      visibility: row.visibility,
      supported_in_api: row.supported_in_api,
      reasoning: reasoningEfforts(row),
      multi_agent_version: row.multi_agent_version,
      supports_search_tool: row.supports_search_tool,
      supports_parallel_tool_calls: row.supports_parallel_tool_calls,
    })
    if (JSON.stringify(project(receipt.models.find((row: CatalogModel) => row.slug === required.model)))
        !== JSON.stringify(project(models.find((row) => row.slug === required.model)))) {
      throw new Error('Codex live catalogue output disagreed with its fresh account receipt.')
    }
  }
}

export function assertCodexCapabilities(
  globalHelp: string,
  execHelp: string,
  modelsHelp: string,
  sandboxHelp: string,
): void {
  const missingGlobal = REQUIRED_GLOBAL_FLAGS.filter((flag) => !globalHelp.includes(flag))
  const missingExec = REQUIRED_EXEC_FLAGS.filter((flag) => !execHelp.includes(flag))
  if (missingGlobal.length || missingExec.length) {
    throw new Error(`Installed Codex CLI is missing required flag(s): ${[...missingGlobal, ...missingExec].join(', ')}.`)
  }
  if (!sandboxHelp.includes('--permission-profile')) {
    throw new Error('Installed Codex CLI cannot select the named credential-deny permission profile.')
  }
  const compactModelsHelp = modelsHelp.replace(/\s+/g, ' ')
  if (!/--bundled\b.{0,240}\bskip refresh\b.{0,240}\bbundled catalog\b/i.test(compactModelsHelp)) {
    throw new Error('Installed Codex CLI does not prove that omitting --bundled performs a live model-catalogue refresh.')
  }
}

export const CODEX_PROMPT_INPUT_MARKER = 'NOSTRA_RUNTIME_PROMPT_TAIL_PROBE'
export const CODEX_DOCTRINE_TAIL_SENTINEL = 'The twins must match.'

export function assertCodexPromptInput(stdout: string, stderr = '', marker = CODEX_PROMPT_INPUT_MARKER): void {
  if (stderr.trim()) throw new Error(`Codex prompt-input probe emitted a diagnostic: ${stderr.trim().slice(0, 240)}`)
  let decoded: unknown
  try { decoded = JSON.parse(stdout) } catch { throw new Error('Codex prompt-input probe was not strict JSON.') }
  if (!Array.isArray(decoded) || !decoded.length) throw new Error('Codex prompt-input probe was empty or malformed.')
  const serialized = JSON.stringify(decoded)
  if (!serialized.includes(CODEX_DOCTRINE_TAIL_SENTINEL)) {
    throw new Error('Installed Codex CLI omitted the doctrine tail sentinel from model-visible prompt input.')
  }
  if (!serialized.includes(marker)) throw new Error('Installed Codex CLI omitted the runtime probe marker from model-visible prompt input.')
}

export function assertChatGptLogin(stdout: string): void {
  if (!/^Logged in using ChatGPT\s*$/i.test(stdout.trim())) {
    throw new Error('Codex is not authenticated with ChatGPT. Run `codex login` and choose ChatGPT login; API-key auth is not accepted by the cockpit.')
  }
}

function parseRateLimitWindow(value: unknown): CodexRateLimitWindow | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as any
  if (!Number.isInteger(raw.usedPercent) || raw.usedPercent < 0 || raw.usedPercent > 100) return null
  if (raw.resetsAt != null && (!Number.isInteger(raw.resetsAt) || raw.resetsAt < 0)) return null
  if (raw.windowDurationMins != null && (!Number.isInteger(raw.windowDurationMins) || raw.windowDurationMins <= 0)) return null
  return {
    usedPercent: raw.usedPercent,
    ...(raw.resetsAt != null ? { resetsAt: raw.resetsAt } : {}),
    ...(raw.windowDurationMins != null ? { windowDurationMins: raw.windowDurationMins } : {}),
  }
}

function rateLimitWindowKey(window: CodexRateLimitWindow, fallback: 'primary' | 'secondary'): string {
  if (window.windowDurationMins === 300) return 'five_hour'
  if (window.windowDurationMins === 10_080) return 'seven_day'
  if (window.windowDurationMins) return `${window.windowDurationMins}_minute`
  return fallback
}

function safeRateLimitBucketPrefix(mapKey: string, snapshot: any): string | null {
  if (snapshot.limitName != null && typeof snapshot.limitName !== 'string') return null
  if (snapshot.limitId != null && typeof snapshot.limitId !== 'string') return null
  const values = [snapshot.limitName, snapshot.limitId, mapKey]
    .filter((value): value is string => typeof value === 'string' && Boolean(value.trim()))
    .map((value) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, ''))
    .filter(Boolean)
  const parts = [...new Set(values)]
  return parts.length ? parts.join('_').slice(0, 120) : null
}

/** Normalize only fields defined by the generated v2 GetAccountRateLimitsResponse schema. */
export function normalizeCodexRateLimits(result: unknown): CreditPreflight | null {
  if (!result || typeof result !== 'object') return null
  const snapshot = (result as any).rateLimits
  if (!snapshot || typeof snapshot !== 'object') return null
  if (snapshot.rateLimitReachedType != null && typeof snapshot.rateLimitReachedType !== 'string') return null
  if (snapshot.spendControlReached != null && typeof snapshot.spendControlReached !== 'boolean') return null

  const primary = snapshot.primary == null ? null : parseRateLimitWindow(snapshot.primary)
  const secondary = snapshot.secondary == null ? null : parseRateLimitWindow(snapshot.secondary)
  if ((snapshot.primary != null && !primary) || (snapshot.secondary != null && !secondary)) return null

  const reachedReason = typeof snapshot.rateLimitReachedType === 'string'
    ? snapshot.rateLimitReachedType
    : snapshot.spendControlReached === true ? 'spend_control_reached' : undefined
  const status = reachedReason ? 'rejected' : 'allowed'
  const windows: NonNullable<CreditPreflight['windows']> = {}
  const ranked: Array<{ key: string; window: CodexRateLimitWindow }> = []
  for (const [fallback, window] of [['primary', primary], ['secondary', secondary]] as const) {
    if (!window) continue
    let key = rateLimitWindowKey(window, fallback)
    if (windows[key]) key = fallback
    windows[key] = {
      utilization: window.usedPercent / 100,
      resetsAt: window.resetsAt,
      status,
    }
    ranked.push({ key, window })
  }

  const byLimitId = (result as any).rateLimitsByLimitId
  if (byLimitId != null) {
    if (typeof byLimitId !== 'object' || Array.isArray(byLimitId)) return null
    for (const [mapKey, namedSnapshot] of Object.entries(byLimitId)) {
      if (!namedSnapshot || typeof namedSnapshot !== 'object' || Array.isArray(namedSnapshot)) return null
      const named: any = namedSnapshot
      if (named.rateLimitReachedType != null && typeof named.rateLimitReachedType !== 'string') return null
      if (named.spendControlReached != null && typeof named.spendControlReached !== 'boolean') return null
      const prefix = safeRateLimitBucketPrefix(mapKey, named)
      if (!prefix) return null
      const namedReached = typeof named.rateLimitReachedType === 'string'
        ? named.rateLimitReachedType
        : named.spendControlReached === true ? 'spend_control_reached' : undefined
      const namedStatus = namedReached ? 'rejected' : 'allowed'
      for (const fallback of ['primary', 'secondary'] as const) {
        const rawWindow = named[fallback]
        if (rawWindow == null) continue
        const window = parseRateLimitWindow(rawWindow)
        if (!window) return null
        const key = `named_${prefix}_${rateLimitWindowKey(window, fallback)}`
        if (windows[key]) return null
        windows[key] = {
          utilization: window.usedPercent / 100,
          resetsAt: window.resetsAt,
          status: namedStatus,
        }
      }
    }
  }
  ranked.sort((a, b) => b.window.usedPercent - a.window.usedPercent)
  const headline = ranked[0]
  return {
    ok: !reachedReason,
    checked: true,
    status,
    ...(reachedReason ? { reason: reachedReason } : {}),
    ...(headline ? {
      rateLimitType: headline.key,
      utilization: headline.window.usedPercent / 100,
      resetsAt: headline.window.resetsAt,
    } : {}),
    ...(Object.keys(windows).length ? { windows } : {}),
  }
}

export async function queryCodexRateLimits(options: {
  command?: string
  args?: string[]
  env?: NodeJS.ProcessEnv
  timeoutMs?: number
} = {}): Promise<CreditPreflight | null> {
  const sourceEnv = options.env ?? process.env
  const command = options.command ?? resolveCodexBin(sourceEnv)
  const args = options.args ?? ['app-server', '--stdio', '--strict-config', '--config', 'model_provider="openai"']
  const timeoutMs = Math.max(100, Math.min(options.timeoutMs ?? 8_000, 30_000))

  return await new Promise((resolve) => {
    let child: any
    try {
      child = execa(command, args, {
        env: codexChildEnv(sourceEnv),
        reject: false,
        stdin: 'pipe',
        stdout: 'pipe',
        stderr: 'pipe',
      })
    } catch {
      resolve(null)
      return
    }

    let settled = false
    let initialized = false
    let buffer = ''
    const finish = (value: CreditPreflight | null) => {
      if (settled) return
      settled = true
      clearTimeout(timer)
      try { child.stdin?.end() } catch { /* already closed */ }
      try { if (child.exitCode == null) child.kill('SIGTERM') } catch { /* already gone */ }
      resolve(value)
    }
    const timer = setTimeout(() => finish(null), timeoutMs)
    timer.unref?.()
    void child.catch(() => finish(null))
    child.on('close', () => finish(null))
    child.on('error', () => finish(null))
    child.stdin?.on('error', () => finish(null))
    child.stdout?.setEncoding('utf8')
    child.stdout?.on('data', (chunk: string) => {
      buffer += chunk
      while (buffer.includes('\n')) {
        const newline = buffer.indexOf('\n')
        const line = buffer.slice(0, newline).trim()
        buffer = buffer.slice(newline + 1)
        if (!line) continue
        let message: any
        try { message = JSON.parse(line) } catch { finish(null); return }
        if (message.id === 1) {
          if (message.error || !message.result || initialized) { finish(null); return }
          initialized = true
          child.stdin?.write(`${JSON.stringify({ method: 'initialized' })}\n`)
          child.stdin?.write(`${JSON.stringify({ id: 2, method: 'account/rateLimits/read' })}\n`)
        } else if (message.id === 2) {
          finish(message.error ? null : normalizeCodexRateLimits(message.result))
          return
        }
      }
    })
    child.stdin?.write(`${JSON.stringify({
      id: 1,
      method: 'initialize',
      params: {
        clientInfo: { name: 'nostra-research-cockpit', version: '1.0.0' },
        capabilities: { experimentalApi: true },
      },
    })}\n`)
  })
}

interface CodexProbeOptions { retainAuthLease?: boolean }

async function probeCodex(
  sourceEnv: NodeJS.ProcessEnv = process.env,
  repoRoot: string = REPO_ROOT,
  options: CodexProbeOptions = {},
): Promise<CodexProbe> {
  validateCodexPromptProgram(repoRoot)
  const pinned = pinCodexExecutable(resolveCodexBin(sourceEnv), sourceEnv)
  const command = pinned.command
  const pythonRuntime = assertCodexPythonRuntime(codexChildEnv(sourceEnv))
  const isolatedHome = createIsolatedCodexProbeHome(sourceEnv)
  const env = { ...codexChildEnv(sourceEnv, { pythonRuntime }), CODEX_HOME: isolatedHome.home }
  let handedOff = false
  const run = async (args: string[], label: string, timeout = 20_000): Promise<{ stdout: string; stderr: string }> => {
    let result: any
    try {
      result = await execa(command, args, { cwd: repoRoot, env, reject: false, timeout })
    } catch (error: any) {
      throw new Error(`${label} failed: ${String(error?.shortMessage || error?.message || error)}`)
    }
    if (result.exitCode !== 0 || result.failed) {
      const detail = [result.stderr, result.stdout, result.shortMessage, result.message]
        .map((value) => String(value || '').trim())
        .find(Boolean)?.split(/\r?\n/)[0] || ''
      throw new Error(`${label} failed${detail ? `: ${detail.slice(0, 240)}` : ` (exit ${result.exitCode})`}`)
    }
    return { stdout: String(result.stdout || ''), stderr: String(result.stderr || '') }
  }

  try {
    const versionResult = await run(['--version'], 'Codex version probe')
    const version = (versionResult.stdout || versionResult.stderr).trim()
    if (!/^codex-cli\s+\S+/i.test(version)) throw new Error(`Unexpected Codex version response: ${version.slice(0, 120)}`)

    const login = await run(['login', 'status'], 'Codex ChatGPT login probe')
    assertChatGptLogin(`${login.stdout}\n${login.stderr}`)

    let modelsHelpResult: { stdout: string; stderr: string }
    try {
      modelsHelpResult = await run(['debug', 'models', '--help'], 'Codex model-catalogue capability probe')
    } catch (error) {
      catalogueUnknown(error)
    }
    const [globalHelpResult, execHelpResult, sandboxHelpResult, promptInputResult] = await Promise.all([
      run(['--help'], 'Codex global capability probe'),
      run(['exec', '--help'], 'Codex exec capability probe'),
      run(['sandbox', '--help'], 'Codex permission-profile capability probe'),
      run([
        '--cd', repoRoot,
        '--config', `project_doc_max_bytes=${CODEX_PROJECT_DOC_MAX_BYTES}`,
        'debug', 'prompt-input', CODEX_PROMPT_INPUT_MARKER,
      ], 'Codex installed-binary prompt-input probe', 30_000),
    ])
    const globalHelp = `${globalHelpResult.stdout}\n${globalHelpResult.stderr}`
    const execHelp = `${execHelpResult.stdout}\n${execHelpResult.stderr}`
    const sandboxHelp = `${sandboxHelpResult.stdout}\n${sandboxHelpResult.stderr}`
    const modelsHelp = `${modelsHelpResult.stdout}\n${modelsHelpResult.stderr}`
    try {
      assertCodexCapabilities(globalHelp, execHelp, modelsHelp, sandboxHelp)
      assertCodexPromptInput(promptInputResult.stdout, promptInputResult.stderr)
    } catch (error: any) {
      if (/live model-catalogue refresh/i.test(String(error?.message || error))) catalogueUnknown(error)
      throw error
    }
    await assertCodexCredentialSandboxBoundary({
      command,
      env,
      leaseHome: isolatedHome.home,
      sourceAuthPath: isolatedHome.sourceAuthPath,
      pythonRuntime,
    })

    // The isolated CODEX_HOME started with auth.json only, but the capability probes above may have
    // populated models_cache.json. Clear that exact regular receipt so this proof cannot be satisfied by
    // a conditional 304 against probe-created cache; the command must write a fresh account receipt.
    let models: CatalogModel[]
    try {
      clearCodexCatalogueReceiptForRefresh(isolatedHome.home)
      const refreshStartedAt = Date.now()
      const modelsResult = await run(
        ['debug', 'models', '--config', 'model_provider="openai"'],
        'Codex live model catalogue probe',
        30_000,
      )
      models = parseCodexCatalog(modelsResult.stdout, modelsResult.stderr)
      assertRequiredCodexModels(models, version)
      assertFreshCodexCatalogueReceipt(isolatedHome.home, models, refreshStartedAt)
    } catch (error) {
      catalogueUnknown(error)
    }

    // Bind the final credential state, not merely the initial copied bytes. A refresh may legitimately
    // rotate the lease token; the final login probe proves those exact post-refresh bytes are ChatGPT auth.
    const finalLogin = await run(['login', 'status'], 'Codex final ChatGPT login probe')
    assertChatGptLogin(`${finalLogin.stdout}\n${finalLogin.stderr}`)
    clearCodexParentRuntimeArtifacts(isolatedHome.home)
    const finalPinned = pinCodexExecutable(command, sourceEnv)
    if (finalPinned.command !== command || finalPinned.identity !== pinned.identity) {
      throw new Error('Codex executable changed during capability probing.')
    }
    isolatedHome.seal(command, pinned.identity)
    if (options.retainAuthLease) {
      handedOff = true
      return { command, commandIdentity: pinned.identity, cliVersion: version, models, pythonRuntime, authLease: isolatedHome }
    }
    return { command, commandIdentity: pinned.identity, cliVersion: version, models, pythonRuntime }
  } finally {
    if (!handedOff) isolatedHome.cleanup()
  }
}

export function codexAvailabilityFromError(error: unknown): ProviderAvailability {
  const unknown = (error as any)?.code === 'CODEX_CATALOGUE_UNKNOWN'
  return {
    available: false,
    availability: unknown ? 'unknown' : 'unavailable',
    reason: String((error as any)?.message || error || 'Codex preflight failed.'),
  }
}

interface VerifiedCodexProbe {
  probe: CodexProbe
  verifiedAt: number
}

interface CachedCodexFailure {
  availability: ProviderAvailability
  checkedAt: number
}

interface LaunchProofEntry {
  runtimeKey: string
  promise: Promise<VerifiedCodexProbe>
  verified?: VerifiedCodexProbe
  consumed: boolean
}

export interface CodexProbeCoordinator {
  getAvailability(
    options: { refresh?: boolean; proofId?: string } | undefined,
    sourceEnv?: NodeJS.ProcessEnv,
    repoRoot?: string,
    profileKey?: string,
  ): Promise<ProviderAvailability>
  probeForLaunch(sourceEnv: NodeJS.ProcessEnv, repoRoot: string, profileKey: string, proofId: string): Promise<CodexProbe>
  warmup(sourceEnv?: NodeJS.ProcessEnv, repoRoot?: string, profileKey?: string): Promise<void>
}

/**
 * One process-wide proof coordinator. Status GETs only peek and start a background refresh; explicit
 * checks refresh the display status. Execution proofs are a separate capability: one minted proof id
 * binds the launch's assert/build calls to one exact in-flight/result tuple, is short-lived, and is
 * consumed once. A last-known-good display result can never green-light a different launch.
 */
export function createCodexProbeCoordinator(options: {
  probe?: (sourceEnv: NodeJS.ProcessEnv, repoRoot: string, options?: CodexProbeOptions) => Promise<CodexProbe>
  now?: () => number
  availabilityTtlMs?: number
  launchProofMaxAgeMs?: number
  consumedReplayTtlMs?: number
  negativeTtlMs?: number
} = {}): CodexProbeCoordinator {
  const runProbe = options.probe ?? probeCodex
  const now = options.now ?? Date.now
  const availabilityTtlMs = options.availabilityTtlMs ?? CODEX_AVAILABILITY_CACHE_TTL_MS
  const launchProofMaxAgeMs = options.launchProofMaxAgeMs ?? CODEX_LAUNCH_PROOF_MAX_AGE_MS
  const consumedReplayTtlMs = Math.max(
    options.consumedReplayTtlMs ?? CODEX_LAUNCH_PROOF_REPLAY_TTL_MS,
    launchProofMaxAgeMs,
  )
  const negativeTtlMs = options.negativeTtlMs ?? CODEX_NEGATIVE_CACHE_TTL_MS
  const displaySuccesses = new Map<string, VerifiedCodexProbe>()
  const failures = new Map<string, CachedCodexFailure>()
  const checkInFlight = new Map<string, Promise<VerifiedCodexProbe>>()
  const launchProofs = new Map<string, LaunchProofEntry>()
  const consumedProofIds = new Map<string, number>()

  const fresh = (entry: VerifiedCodexProbe | undefined, maxAgeMs: number): boolean => {
    if (!entry) return false
    const age = now() - entry.verifiedAt
    return age >= 0 && age <= maxAgeMs
  }
  const keyFor = (sourceEnv: NodeJS.ProcessEnv, repoRoot: string, profileKey: string) =>
    codexProbeRuntimeKey(sourceEnv, repoRoot, profileKey)

  const runVerifiedProbe = async (
    sourceEnv: NodeJS.ProcessEnv,
    repoRoot: string,
    profileKey: string,
    expectedKey: string,
    retainAuthLease: boolean,
  ): Promise<VerifiedCodexProbe> => {
    const probeEnv = { ...sourceEnv }
    let probe: CodexProbe | undefined
    try {
      probe = await runProbe(probeEnv, repoRoot, { retainAuthLease })
      if (keyFor(probeEnv, repoRoot, profileKey) !== expectedKey) {
        throw new Error('Codex executable, auth, or repository identity changed during capability probing.')
      }
      const verifiedAt = now()
      if (retainAuthLease) {
        if (!probe.authLease) throw new Error('Codex launch probe did not preserve its verified ChatGPT credential lease.')
        probe.authLease.arm(verifiedAt + launchProofMaxAgeMs)
      } else {
        probe.authLease?.cleanup()
        probe = { ...probe, authLease: undefined }
      }
      const entry = { probe, verifiedAt }
      // Status display is deliberately credential-free. Only the proof-id entry owns a launch lease.
      displaySuccesses.set(expectedKey, {
        verifiedAt,
        probe: { ...probe, authLease: undefined },
      })
      failures.delete(expectedKey)
      return entry
    } catch (error) {
      try { probe?.authLease?.cleanup() } catch { /* do not mask the proof failure */ }
      failures.set(expectedKey, { availability: codexAvailabilityFromError(error), checkedAt: now() })
      throw error
    }
  }

  const refreshDisplay = (
    sourceEnv: NodeJS.ProcessEnv,
    repoRoot: string,
    profileKey: string,
  ): Promise<VerifiedCodexProbe> => {
    const key = keyFor(sourceEnv, repoRoot, profileKey)
    const running = checkInFlight.get(key)
    if (running) return running
    const promise = runVerifiedProbe(sourceEnv, repoRoot, profileKey, key, false)
      .finally(() => { checkInFlight.delete(key) })
    checkInFlight.set(key, promise)
    return promise
  }

  const launchProof = (
    proofId: string,
    sourceEnv: NodeJS.ProcessEnv,
    repoRoot: string,
    profileKey: string,
  ) => {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(proofId)) {
      throw new Error('Codex launch availability proof id is missing or invalid.')
    }
    for (const [candidate, expiresAt] of consumedProofIds) {
      if (expiresAt <= now()) consumedProofIds.delete(candidate)
    }
    if ((consumedProofIds.get(proofId) ?? 0) > now()) {
      throw new Error('Codex launch availability proof was already consumed.')
    }
    const runtimeKey = keyFor(sourceEnv, repoRoot, profileKey)
    const discard = (entry: LaunchProofEntry) => {
      if (launchProofs.get(proofId) === entry) launchProofs.delete(proofId)
      if (!entry.consumed) {
        void entry.promise.then((verified) => {
          try { verified.probe.authLease?.cleanup() } catch { /* expiry cleanup is best effort */ }
        }).catch(() => undefined)
      }
    }
    const existing = launchProofs.get(proofId)
    if (existing) {
      if (existing.runtimeKey !== runtimeKey) {
        discard(existing)
        consumedProofIds.set(proofId, now() + consumedReplayTtlMs)
        throw new Error('Codex launch runtime/profile changed after its availability proof was minted.')
      }
      if (existing.consumed) throw new Error('Codex launch availability proof was already consumed.')
      if (!existing.verified || fresh(existing.verified, launchProofMaxAgeMs)) return existing
      discard(existing)
    }
    const entry = {
      runtimeKey,
      consumed: false,
      promise: undefined as unknown as Promise<VerifiedCodexProbe>,
      verified: undefined as VerifiedCodexProbe | undefined,
    }
    entry.promise = runVerifiedProbe(sourceEnv, repoRoot, profileKey, runtimeKey, true)
      .then((verified) => {
        entry.verified = verified
        const expiry = setTimeout(() => {
          if (launchProofs.get(proofId) === entry && !entry.consumed) discard(entry)
        }, launchProofMaxAgeMs + 1)
        expiry.unref?.()
        return verified
      })
      .catch((error) => {
        if (launchProofs.get(proofId) === entry) launchProofs.delete(proofId)
        throw error
      })
    launchProofs.set(proofId, entry)
    return entry
  }

  const defaults = (sourceEnv?: NodeJS.ProcessEnv, repoRoot?: string, profileKey?: string) => ({
    env: sourceEnv ?? process.env,
    root: repoRoot ?? REPO_ROOT,
    profile: profileKey ?? resolveCodexProfile({}).profileKey,
  })

  return {
    async getAvailability(readOptions, sourceEnv, repoRoot, profileKey) {
      const runtime = defaults(sourceEnv, repoRoot, profileKey)
      const key = keyFor(runtime.env, runtime.root, runtime.profile)
      if (readOptions?.refresh) {
        try {
          const entry = readOptions.proofId
            ? await launchProof(readOptions.proofId, runtime.env, runtime.root, runtime.profile).promise
            : await refreshDisplay(runtime.env, runtime.root, runtime.profile)
          return { available: true, availability: 'available', cliVersion: entry.probe.cliVersion }
        } catch (error) {
          return codexAvailabilityFromError(error)
        }
      }
      const cached = displaySuccesses.get(key)
      if (cached && fresh(cached, availabilityTtlMs)) {
        return { available: true, availability: 'available', cliVersion: cached.probe.cliVersion }
      }
      const failed = failures.get(key)
      if (failed) {
        const age = now() - failed.checkedAt
        if (age >= 0 && age <= negativeTtlMs) return failed.availability
        failures.delete(key)
      }
      if (!checkInFlight.has(key)) void refreshDisplay(runtime.env, runtime.root, runtime.profile).catch(() => undefined)
      return {
        available: false,
        availability: 'unknown',
        reason: 'Codex availability is being verified from the live ChatGPT account catalogue.',
      }
    },
    async probeForLaunch(sourceEnv, repoRoot, profileKey, proofId) {
      const entry = launchProof(proofId, sourceEnv, repoRoot, profileKey)
      const verified = await entry.promise
      if (entry.consumed || launchProofs.get(proofId) !== entry) {
        throw new Error('Codex launch availability proof is no longer valid for this spawn.')
      }
      if (!fresh(verified, launchProofMaxAgeMs)) {
        try { verified.probe.authLease?.cleanup() } catch { /* fail closed below */ }
        launchProofs.delete(proofId)
        consumedProofIds.set(proofId, now() + consumedReplayTtlMs)
        throw new Error('Codex launch availability proof expired before spawn; retry the launch.')
      }
      if (!verified.probe.authLease) {
        launchProofs.delete(proofId)
        consumedProofIds.set(proofId, now() + consumedReplayTtlMs)
        throw new Error('Codex launch proof has no verified ChatGPT credential lease.')
      }
      try {
        verified.probe.authLease.assertValid(verified.probe.command, verified.probe.commandIdentity)
      } catch (error) {
        try { verified.probe.authLease.cleanup() } catch { /* do not mask lease validation */ }
        launchProofs.delete(proofId)
        consumedProofIds.set(proofId, now() + consumedReplayTtlMs)
        throw error
      }
      entry.consumed = true
      launchProofs.delete(proofId)
      consumedProofIds.set(proofId, now() + consumedReplayTtlMs)
      return verified.probe
    },
    async warmup(sourceEnv, repoRoot, profileKey) {
      const runtime = defaults(sourceEnv, repoRoot, profileKey)
      await refreshDisplay(runtime.env, runtime.root, runtime.profile)
    },
  }
}

const codexProbeCoordinator = createCodexProbeCoordinator()

function assertDataRoot(root: string): string {
  if (!path.isAbsolute(root)) throw new Error('Codex additional data root must be absolute.')
  let resolved: string
  try { resolved = fs.realpathSync(root) } catch {
    throw new Error(`Codex additional data root does not exist: ${root}`)
  }
  if (!fs.statSync(resolved).isDirectory()) throw new Error(`Codex additional data root is not a directory: ${root}`)
  const parsed = path.parse(resolved)
  if (resolved === parsed.root || resolved === os.homedir()) throw new Error(`Refusing broad Codex data root: ${resolved}`)
  return resolved
}

function resolveCodexWritablePaths(
  values: readonly string[] | undefined,
  workspaceRoot: string,
  dataRoot: string,
): string[] {
  if (!values?.length) throw new Error('Codex launch has no supervisor-declared writable output paths.')
  const roots = [path.resolve(workspaceRoot), path.resolve(dataRoot)]
  const resolved = new Set<string>()
  for (const value of values) {
    if (typeof value !== 'string' || !value.trim() || !path.isAbsolute(value)) {
      throw new Error('Codex writable output paths must be non-empty absolute paths.')
    }
    const requested = path.resolve(value)
    let existing = requested
    while (!fs.existsSync(existing)) {
      const parent = path.dirname(existing)
      if (parent === existing) break
      existing = parent
    }
    let existingReal: string
    try { existingReal = fs.realpathSync(existing) } catch {
      throw new Error(`Codex writable output path has no verifiable ancestor: ${requested}`)
    }
    const candidate = path.resolve(existingReal, path.relative(existing, requested))
    const containingRoot = roots.find((root) => pathIsWithin(root, candidate))
    if (!containingRoot || candidate === containingRoot) {
      throw new Error(`Refusing broad or out-of-scope Codex writable output path: ${requested}`)
    }
    if (!pathIsWithin(containingRoot, existingReal)) {
      throw new Error(`Codex writable output path escapes its admitted root through a symlink: ${requested}`)
    }
    if (fs.existsSync(requested)) {
      const info = fs.lstatSync(requested)
      if (info.isSymbolicLink()) throw new Error(`Codex writable output path must not be a symlink: ${requested}`)
    }
    resolved.add(candidate)
  }
  return [...resolved].sort()
}

interface CodexPublicationTransport {
  socket: StableUnixSocketSnapshot
  endpoint: string
  token: string
}

function resolveCodexPublicationTransport(
  context: ProviderLaunchContext,
  writableRoots: readonly string[],
): CodexPublicationTransport {
  const contextSocket = context.publicationSocketPath
  const envSocket = context.env.NOSTRA_PUBLICATION_SOCKET
  const endpoint = context.env.NOSTRA_PUBLICATION_ENDPOINT
  const token = context.env.NOSTRA_PUBLICATION_TOKEN
  const supplied = [contextSocket, envSocket, endpoint, token].filter((value) => value !== undefined)
  if (supplied.length !== 4 || !contextSocket || !envSocket || !endpoint || !token || contextSocket !== envSocket) {
    throw new Error('Codex publication transport requires one matching supervisor socket, endpoint, and token binding.')
  }
  if (endpoint !== 'http://localhost/publication') {
    throw new Error('Codex publication transport must use the endpoint-scoped Unix-socket URL.')
  }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token)) {
    throw new Error('Codex publication transport token is not a run-scoped UUID capability.')
  }
  const socket = stableUnixSocketSnapshot(contextSocket, 'Codex supervisor publication socket')
  const unsafeTempRoots = new Set<string>()
  for (const candidate of ['/tmp', os.tmpdir()]) {
    try { unsafeTempRoots.add(fs.realpathSync(candidate)) } catch { /* absent platform alias */ }
  }
  if ([...unsafeTempRoots].some((root) => pathIsWithin(root, socket.realPath))) {
    throw new Error('Codex supervisor publication socket cannot use a platform-writable temporary root.')
  }
  if (socket.path !== socket.realPath
      || path.basename(socket.realPath) !== 'p.sock'
      || Buffer.byteLength(socket.path) > 103) {
    throw new Error('Codex supervisor publication socket has an unexpected name.')
  }
  if (writableRoots.some((root) => pathIsWithin(root, socket.realPath))) {
    throw new Error('Codex supervisor publication socket must stay outside every model-writable root.')
  }
  const capabilityDirectory = path.dirname(socket.realPath)
  if (pathIsWithin(context.cwd, capabilityDirectory)
      || pathIsWithin(context.additionalWritableDataRoot, capabilityDirectory)) {
    throw new Error('Codex supervisor publication socket root must stay outside repository and data roots.')
  }
  return { socket, endpoint, token }
}

export function buildCodexLaunchSpec(
  context: ProviderLaunchContext,
  probe: CodexProbe,
): ProviderLaunchSpec {
  const lease = probe.authLease
  if (!lease) throw new Error('Codex launch requires the one-use ChatGPT credential lease from its fresh proof.')
  const pythonRuntime = probe.pythonRuntime
  if (!pythonRuntime) throw new Error('Codex launch proof did not bind its deterministic Python runtime.')
  try {
    lease.assertValid(probe.command, probe.commandIdentity)
    const profile = resolveCodexProfile({
      model: context.profile.model,
      reasoningLevel: context.profile.reasoningLevel,
      profileKey: context.profile.profileKey,
    })
    validateCodexPromptProgram(context.cwd, profile)
    const dataRoot = assertDataRoot(context.additionalWritableDataRoot)
    const capabilityRoots = [...(context.readOnlyCapabilityPaths ?? [])]
    if (capabilityRoots.length > 1) {
      throw new Error('Codex launch accepts at most one exact frozen evidence capability.')
    }
    // In supervisor-frozen mode, the model's additional workspace is the isolated capability—not the
    // live repository data tree. Writable research outputs remain constrained by workspaceRoot below.
    const modelDataRoot = capabilityRoots.length ? assertDataRoot(capabilityRoots[0]) : dataRoot
    const workspaceRoot = fs.realpathSync(context.cwd)
    if (!fs.statSync(workspaceRoot).isDirectory()) throw new Error('Codex workspace root is not a directory.')
    const writablePaths = resolveCodexWritablePaths(context.writablePaths, workspaceRoot, dataRoot)
    const canonical = loadCanonicalCommand(context.prompt, context.cwd, profile)
    const continuation = context.automaticContinuation
    if (continuation && context.resumeSessionId) {
      throw new Error('Codex automatic continuation cannot also resume a prior CLI session.')
    }
    if (continuation) {
      const safeOutput = (value: unknown): value is string => typeof value === 'string'
        && value.length > 0 && value.length <= 500 && !value.includes('\n') && !value.includes('\r')
        // Canonical roster paths are POSIX on every host. Reject (rather than reinterpret) a Windows
        // separator so the validated value is exactly the value inserted into the model prompt.
        && !value.includes('\\')
        && !path.posix.isAbsolute(value) && path.posix.normalize(value) === value && !value.startsWith('../')
      if (!Number.isSafeInteger(continuation.index) || continuation.index < 1
          || !continuation.completedOutputs.every(safeOutput)
          || !continuation.unresolvedOutputs.length
          || !continuation.unresolvedOutputs.every(safeOutput)) {
        throw new Error('Codex automatic continuation inventory is invalid.')
      }
    }
    const continuationPrompt = continuation ? [
      '# Cockpit automatic continuation',
      '',
      `This is continuation process ${continuation.index} of the SAME already-admitted Codex cockpit run.`,
      'The run id, run root, frozen inputs, provider, and execution profile have not changed. Existing valid',
      'canonical artifacts are authoritative. Do not redo or overwrite a completed output. Inspect them only',
      'when a dependency requires it, then continue from the first unresolved canonical output.',
      '',
      `Completed canonical outputs (${continuation.completedOutputs.length}):`,
      ...(continuation.completedOutputs.length ? continuation.completedOutputs.map((item) => `- ${item}`) : ['- (none)']),
      '',
      `Unresolved canonical outputs (${continuation.unresolvedOutputs.length}):`,
      ...continuation.unresolvedOutputs.map((item) => `- ${item}`),
      '',
      'Keep the native child pool within its live capacity, wait for each wave, validate its files, and launch',
      'the next ready wave. Do not end the parent turn after announcing future work, after one child, or between',
      'waves. Return only after the canonical filesystem completion barrier and publication contract pass, or',
      'after a real provider/tool failure that prevents further work. Never publish an intermediate module.',
      '',
      '# Canonical command (still authoritative)',
      '',
    ].join('\n') : ''
    const publication = resolveCodexPublicationTransport(context, [...writablePaths, lease.home])
    const protectedPathBinding = JSON.stringify({
      writable: [...(context.writablePaths ?? [])],
      write: [...(context.protectedWritePaths ?? [])],
      read: [...(context.protectedReadPaths ?? [])],
      runtime: pythonRuntime.readOnlyRoots,
      capabilities: [...(context.readOnlyCapabilityPaths ?? [])],
    })
    const scratchRoot = lease.installLaunchSandboxConfig(
      workspaceRoot,
      modelDataRoot,
      writablePaths,
      context.protectedWritePaths,
      context.protectedReadPaths,
      publication.socket.realPath,
      pythonRuntime.readOnlyRoots,
      context.readOnlyCapabilityPaths,
    )
    // Override the mutable caller home with the exact credential snapshot used by login/catalogue proof.
    const env: NodeJS.ProcessEnv = {
      ...codexChildEnv(context.env, { pythonRuntime }),
      CODEX_HOME: lease.home,
      TMPDIR: scratchRoot,
      TMP: scratchRoot,
      TEMP: scratchRoot,
    }
    const shellSet = [
      'PATH', 'TMPDIR', 'TMP', 'TEMP', 'LANG', 'LC_ALL', 'LC_CTYPE', 'TZ', 'TERM', 'NO_COLOR', 'NOSTRA_COCKPIT_RUN',
      ...CODEX_COCKPIT_ENV_ALLOWLIST,
    ]
      .flatMap((key) => env[key] === undefined ? [] : ['--config', `shell_environment_policy.set.${key}=${JSON.stringify(env[key])}`])
    const args = [
      '--strict-config',
      '--add-dir', modelDataRoot,
      '--add-dir', scratchRoot,
      '--search',
      '--model', profile.model,
      '--config', 'model_provider="openai"',
      '--config', `model_reasoning_effort="${profile.reasoningLevel}"`,
      '--config', `project_doc_max_bytes=${CODEX_PROJECT_DOC_MAX_BYTES}`,
      '--config', 'agents.enabled=true',
      '--config', `agents.default_subagent_model="${profile.executionProfile.specialistModel}"`,
      '--config', `agents.default_subagent_reasoning_effort="${profile.executionProfile.specialistReasoning}"`,
      // The Codex process gets the lease through CODEX_HOME. Model-issued Bash inherits nothing and the
      // explicit shell set below intentionally omits both HOME and CODEX_HOME.
      '--config', 'shell_environment_policy.inherit="none"',
      ...shellSet,
      '--cd', workspaceRoot,
      'exec',
      '--json',
      '--color', 'never',
    ]
    if (context.resumeSessionId) args.push('resume', context.resumeSessionId, '-')
    const spec: ProviderLaunchSpec = {
      command: probe.command,
      args,
      input: continuationPrompt ? `${continuationPrompt}${canonical.prompt}` : canonical.prompt,
      cwd: workspaceRoot,
      env,
      cliVersion: probe.cliVersion,
      cleanup: () => lease.cleanup(),
    }
    const launchEnv = JSON.stringify(Object.entries(env).sort(([left], [right]) => left.localeCompare(right)))
    spec.beforeSpawn = () => {
      const currentEnv = JSON.stringify(Object.entries(spec.env).sort(([left], [right]) => left.localeCompare(right)))
      if (currentEnv !== launchEnv || spec.env.CODEX_HOME !== lease.home) {
        throw new Error('Codex launch environment changed after the credential proof was bound.')
      }
      if (JSON.stringify({
        writable: [...(context.writablePaths ?? [])],
        write: [...(context.protectedWritePaths ?? [])],
        read: [...(context.protectedReadPaths ?? [])],
        runtime: pythonRuntime.readOnlyRoots,
        capabilities: [...(context.readOnlyCapabilityPaths ?? [])],
      }) !== protectedPathBinding) {
        throw new Error('Codex writable/protected-path policy changed after the credential proof was bound.')
      }
      if (assertCodexPythonRuntime(spec.env).identity !== pythonRuntime.identity) {
        throw new Error('Codex Python runtime changed after the launch proof was bound.')
      }
      const currentSocket = stableUnixSocketSnapshot(
        context.publicationSocketPath!, 'Codex supervisor publication socket',
      )
      if (currentSocket.identity !== publication.socket.identity
          || spec.env.NOSTRA_PUBLICATION_SOCKET !== publication.socket.path
          || spec.env.NOSTRA_PUBLICATION_ENDPOINT !== publication.endpoint
          || spec.env.NOSTRA_PUBLICATION_TOKEN !== publication.token) {
        throw new Error('Codex supervisor publication socket changed after the launch proof was bound.')
      }
      lease.consumeForSpawn(spec.command, probe.commandIdentity)
    }
    return spec
  } catch (error) {
    try { lease.cleanup() } catch { /* preserve the fail-closed validation error */ }
    throw error
  }
}

function toolEvent(item: any): { tool: string; input?: unknown } | null {
  switch (item?.type) {
    case 'command_execution': return { tool: 'Bash', input: { command: item.command, cwd: item.cwd } }
    case 'file_change': return { tool: 'Write', input: item.changes ?? item }
    case 'web_search': return { tool: 'WebSearch', input: { query: item.query } }
    case 'mcp_tool_call': return { tool: String(item.tool || item.name || 'MCP'), input: item.arguments ?? item.input }
    case 'collab_tool_call': {
      const prompt = typeof item.prompt === 'string' ? item.prompt : ''
      const canonicalType = prompt.match(/(?:^|\n)NOSTRA_SUBAGENT_TYPE:\s*([a-z][a-z0-9-]*)\s*(?:\n|$)/)?.[1]
      return {
        tool: 'Task',
        input: {
          tool: item.tool,
          prompt,
          receiverThreadIds: item.receiver_thread_ids,
          ...(item.agents_states && typeof item.agents_states === 'object'
            ? { agentStates: item.agents_states }
            : {}),
          ...(canonicalType ? { subagent_type: canonicalType, description: `Dispatch ${canonicalType}` } : {}),
        },
      }
    }
    case 'sub_agent_activity':
    case 'subAgentActivity': {
      const agentThreadId = typeof item.agent_thread_id === 'string'
        ? item.agent_thread_id
        : typeof item.agentThreadId === 'string' ? item.agentThreadId : undefined
      const agentPath = typeof item.agent_path === 'string'
        ? item.agent_path
        : typeof item.agentPath === 'string' ? item.agentPath : undefined
      const kind = typeof item.kind === 'string' ? item.kind : ''
      const canonicalType = canonicalAgentNameFromCodexNativePath(agentPath)
      const status = kind === 'interrupted' ? 'interrupted' : 'running'
      return {
        tool: 'Task',
        input: {
          tool: kind === 'started' ? 'spawn_agent' : 'subagent_activity',
          agentPath,
          receiverThreadIds: agentThreadId ? [agentThreadId] : [],
          ...(agentThreadId ? { agentStates: { [agentThreadId]: { status } } } : {}),
          ...(canonicalType ? { subagent_type: canonicalType, description: `Dispatch ${canonicalType}` } : {}),
        },
      }
    }
    default: return null
  }
}

function itemFailed(item: any): boolean {
  return item?.status === 'failed' || item?.status === 'error' || item?.is_error === true || Boolean(item?.error)
}

function codexUsageLimitMessage(message: string): boolean {
  return /(?:\b(?:rate|usage|quota)\s*(?:limit|exceeded|exhausted|reached)\b|\bweekly\s+(?:usage\s+)?limit\b|\b5-hour\s+limit\b|too many requests|\b429\b)/i.test(message)
}

function codexModelCapacityMessage(message: string): boolean {
  return /\b(?:selected\s+)?model\s+is\s+(?:currently\s+)?at\s+capacity\b/i.test(message)
}

export function parseCodexStreamLine(line: string): ProviderStreamEvent[] {
  const trimmed = line.trim()
  if (!trimmed) return []
  let event: any
  try { event = JSON.parse(trimmed) } catch {
    return [{
      type: 'result',
      cliResult: { subtype: 'malformed_jsonl', isError: true },
      message: 'Codex emitted a non-JSON line on stdout while --json was active.',
    }]
  }
  if (!event || typeof event.type !== 'string') {
    return [{ type: 'result', cliResult: { subtype: 'malformed_event', isError: true }, message: 'Codex emitted a JSONL event without a type.' }]
  }
  if (event.type === 'thread.started') {
    if (typeof event.thread_id !== 'string' || !event.thread_id) {
      return [{ type: 'result', cliResult: { subtype: 'malformed_session', isError: true }, message: 'Codex thread.started omitted thread_id.' }]
    }
    return [{ type: 'session', sessionId: event.thread_id }]
  }
  if (event.type === 'item.started') {
    const normalized = toolEvent(event.item)
    return normalized ? [{ type: 'tool-use', ...normalized, toolUseId: typeof event.item?.id === 'string' ? event.item.id : undefined }] : []
  }
  if (event.type === 'item.updated') {
    const normalized = toolEvent(event.item)
    return normalized ? [{ type: 'tool-progress', ...normalized, toolUseId: typeof event.item?.id === 'string' ? event.item.id : undefined }] : []
  }
  if (event.type === 'item.completed') {
    if (event.item?.type === 'agent_message' && typeof event.item.text === 'string' && event.item.text.trim()) {
      return [{ type: 'assistant-message', message: event.item.text }]
    }
    const normalized = toolEvent(event.item)
    return normalized ? [{
      type: 'tool-result', ...normalized,
      toolUseId: typeof event.item?.id === 'string' ? event.item.id : undefined,
      isError: itemFailed(event.item),
    }] : []
  }
  if (event.type === 'turn.failed') {
    const message = typeof event.error?.message === 'string' ? event.error.message : 'Codex turn failed.'
    return [{
      type: 'result',
      cliResult: {
        subtype: codexUsageLimitMessage(message)
          ? 'out_of_credits'
          : codexModelCapacityMessage(message) ? 'model_capacity' : 'turn_failed',
        isError: true,
      },
      message,
    }]
  }
  if (event.type === 'error') {
    const message = typeof event.message === 'string' ? event.message : 'Codex emitted an error event.'
    return [{
      type: 'result',
      cliResult: {
        subtype: codexUsageLimitMessage(message)
          ? 'out_of_credits'
          : codexModelCapacityMessage(message) ? 'model_capacity' : 'codex_error',
        isError: true,
      },
      message,
    }]
  }
  if (event.type === 'turn.completed') {
    return [{ type: 'result', cliResult: { subtype: 'success', isError: false }, numTurns: 1 }]
  }
  return []
}

function exitCode(result: unknown): number | undefined {
  const value = (result as any)?.exitCode
  return typeof value === 'number' ? value : undefined
}

function failureMessage(context: ProviderExitContext): string {
  const stderr = String(context.stderr || '').trim()
  return stderr ? stderr.split(/\r?\n/).slice(-3).join('\n').slice(0, 800) : 'Codex exited without a successful result.'
}

export function classifyCodexExit(context: ProviderExitContext): ProviderExitClassification {
  if (context.status === 'cancelled') return { outcome: 'terminated', reason: 'cancelled' }
  if (context.status === 'incomplete') return { outcome: 'terminated', reason: 'incomplete' }
  const processResult = context.result as any
  if (processResult?.isTerminated || processResult?.killed || processResult?.signal) {
    const signal = typeof processResult?.signal === 'string' && processResult.signal
      ? processResult.signal.toLowerCase()
      : 'unknown'
    return { outcome: 'terminated', reason: `terminated_${signal}`, message: failureMessage(context) }
  }
  const code = exitCode(context.result)
  if (context.cliResult?.isError) {
    const message = failureMessage(context)
    const limited = context.cliResult.subtype === 'out_of_credits' || codexUsageLimitMessage(message)
    return { outcome: 'error', reason: limited ? 'out_of_credits' : context.cliResult.subtype || 'codex_error', message, ...(limited ? { outOfCredits: true } : {}) }
  }
  if (code === 0 && context.cliResult?.subtype === 'success' && context.cliResult.isError === false) {
    return { outcome: 'success' }
  }
  const message = failureMessage(context)
  const limited = codexUsageLimitMessage(message)
  const missingTerminal = code === 0 ? 'codex_missing_turn_completed' : `codex_exit_${code ?? 'unknown'}`
  return { outcome: 'error', reason: limited ? 'out_of_credits' : missingTerminal, message, ...(limited ? { outOfCredits: true } : {}) }
}

export const codexProviderAdapter: ProviderAdapter = {
  profile: {
    provider: 'codex',
    label: 'Codex',
    description: 'Uses the local Codex CLI with ChatGPT plan authentication.',
    defaultProfileKey: CODEX_EXECUTION_PROFILES[0].key,
    profiles: CODEX_EXECUTION_PROFILES.map(({ key, label, description }) => {
      const resolved = resolveCodexProfile({ profileKey: key })
      return {
        key, label, description, model: resolved.model, reasoningLevel: resolved.reasoningLevel,
        executionProfile: resolved.executionProfile,
      }
    }),
    supportsUsage: true,
  },
  resolveProfile: resolveCodexProfile,
  async getAvailability(options) {
    return await codexProbeCoordinator.getAvailability(options)
  },
  async buildLaunch(context) {
    const profile = resolveCodexProfile({
      model: context.profile.model,
      reasoningLevel: context.profile.reasoningLevel,
      profileKey: context.profile.profileKey,
    })
    if (context.profile.provider !== 'codex' || context.profile.profileKey !== profile.profileKey) {
      throw new Error('Codex launch profile does not match the pinned runtime contract.')
    }
    if (!context.availabilityProofId) throw new Error('Codex launch is missing its fresh availability proof id.')
    // This deterministic program dependency must clear before credential/catalogue work and paid inference.
    const requestedPython = assertCodexPythonRuntime(codexChildEnv(context.env))
    const probe = await codexProbeCoordinator.probeForLaunch(
      context.env, context.cwd, profile.profileKey, context.availabilityProofId,
    )
    if (!probe.pythonRuntime || probe.pythonRuntime.identity !== requestedPython.identity) {
      probe.authLease?.cleanup()
      throw new Error('Codex Python runtime changed during the verified launch preflight.')
    }
    return buildCodexLaunchSpec(context, probe)
  },
  parseStreamLine: parseCodexStreamLine,
  classifyExit: classifyCodexExit,
  async checkUsage() {
    // This is the installed v2 App Server contract, not a scraped UI or inferred allowance. A missing,
    // malformed, or timed-out response stays null so the cockpit never renders it as zero usage.
    return await queryCodexRateLimits()
  },
  async warmup() {
    await codexProbeCoordinator.warmup()
  },
}

registerProviderAdapter(codexProviderAdapter)

export function isCodexProfile(value: ResolvedProviderProfile): boolean {
  try {
    const resolved = resolveCodexProfile({
      model: value.model, reasoningLevel: value.reasoningLevel, profileKey: value.profileKey,
    })
    return value.provider === 'codex' && value.profileKey === resolved.profileKey
  } catch {
    return false
  }
}
