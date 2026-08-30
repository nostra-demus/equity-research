import { execa } from 'execa'
import { execFileSync } from 'node:child_process'
import { createHash, randomUUID } from 'node:crypto'
import fs from 'node:fs'
import http from 'node:http'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { CLAUDE_BIN, DATA_DIR, PUBLICATION_SOCKET_ROOT, REPO_ROOT, STATE_DIR } from '../config'
import type { CreditPreflight } from '../types'
import { registerProviderAdapter } from './registry'
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

// A tracked Claude process can execute arbitrary shell commands. Pass only OS/runtime plumbing plus
// Claude's own subscription authentication. The one supported headless credential is retained only in
// the parent CLI; CLAUDE_CODE_SUBPROCESS_ENV_SCRUB removes it from Bash, hooks, and MCP subprocesses.
// In particular, never inherit ENGINE_STATE_DIR, provider config paths, publication identities, GitHub
// credentials, or unrelated provider keys from the long-lived supervisor.
const CLAUDE_CHILD_ENV_ALLOWLIST = [
  'PATH', 'HOME', 'USER', 'LOGNAME', 'SHELL', 'TMPDIR', 'TMP', 'TEMP',
  'LANG', 'LC_ALL', 'LC_CTYPE', 'TZ', 'TERM', 'COLORTERM',
  'SSL_CERT_FILE', 'SSL_CERT_DIR', 'NODE_EXTRA_CA_CERTS',
  'CLAUDE_CONFIG_DIR',
] as const
const CLAUDE_COCKPIT_ENV_ALLOWLIST = [
  'NOSTRA_PUBLICATION_ENDPOINT', 'NOSTRA_PUBLICATION_TOKEN', 'NOSTRA_PUBLICATION_SOCKET',
  ...PROVIDER_NEUTRAL_RUN_ENV_KEYS,
] as const

let supportedFlags: Set<string> | null = null
let availability: ProviderAvailability | null = null
let availabilityProbe: Promise<ProviderAvailability> | null = null
let sandboxRuntimeProof: Promise<void> | null = null
let sandboxRuntimeProofKey: string | null = null

const unavailableReason = () =>
  `Claude CLI ('${CLAUDE_BIN}') not found on PATH — the cockpit can read the data pool but spawns the CLI to run the engine. `
  + 'Install it with `npm i -g @anthropic-ai/claude-code` (or set CLAUDE_BIN to its full path), then restart the cockpit server.'

export async function detectClaudeFlags(): Promise<Set<string>> {
  if (supportedFlags) return supportedFlags
  const flags = new Set<string>()
  try {
    const { stdout } = await execa(CLAUDE_BIN, ['--help'], {
      reject: false, timeout: 15_000, env: claudeChildEnv(process.env), extendEnv: false,
    })
    for (const match of stdout.matchAll(/--[a-z][a-z0-9-]+/g)) flags.add(match[0])
  } catch {
    // The conservative core below preserves the launcher's historical fallback.
  }
  for (const flag of ['--print', '--output-format', '--verbose', '--model', '--max-turns', '--permission-mode']) flags.add(flag)
  supportedFlags = flags
  return flags
}

export function claudeChildEnv(base: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = {}
  for (const key of CLAUDE_CHILD_ENV_ALLOWLIST) if (base[key] !== undefined) env[key] = base[key]
  // Anthropic documents setup-token/CLAUDE_CODE_OAUTH_TOKEN as the subscription-auth path for scripts
  // where an interactive browser/Keychain session is unavailable. Never pass API-key or gateway auth.
  // The CLI's own scrub keeps this inference-only credential out of every model-visible subprocess.
  if (base.CLAUDE_CODE_OAUTH_TOKEN) env.CLAUDE_CODE_OAUTH_TOKEN = base.CLAUDE_CODE_OAUTH_TOKEN
  env.CLAUDE_CODE_SUBPROCESS_ENV_SCRUB = '1'
  env.NOSTRA_COCKPIT_RUN = '1'
  env.NO_COLOR = '1'
  for (const key of CLAUDE_COCKPIT_ENV_ALLOWLIST) if (base[key]) env[key] = base[key]
  return env
}

/** Environment visible to a Bash/tool subprocess after the tracked parent CLI applies Anthropic's
 * CLAUDE_CODE_SUBPROCESS_ENV_SCRUB contract. Keep this separate from claudeChildEnv: the parent needs the
 * subscription credential to authenticate, while nested tools must never inherit it. */
export function claudeNestedToolEnv(base: NodeJS.ProcessEnv = process.env): NodeJS.ProcessEnv {
  const env = claudeChildEnv(base)
  delete env.CLAUDE_CODE_OAUTH_TOKEN
  return env
}

export function isClaudeMaxAuth(value: unknown): boolean {
  const status = value as Record<string, unknown>
  return status?.loggedIn === true && status?.authMethod === 'claude.ai'
    && status?.apiProvider === 'firstParty' && status?.subscriptionType === 'max'
}

export function isClaudeSubscriptionAuth(value: unknown, env: NodeJS.ProcessEnv): boolean {
  if (isClaudeMaxAuth(value)) return true
  const status = value as any
  // `auth status` deliberately does not report a plan name for setup-token credentials. Require both the
  // exact first-party oauth_token result and the credential in this already-sanitized child environment;
  // Anthropic's setup-token flow itself requires a paid Claude subscription and is never API-key billed.
  return typeof env.CLAUDE_CODE_OAUTH_TOKEN === 'string' && env.CLAUDE_CODE_OAUTH_TOKEN.length > 0
    && status?.loggedIn === true && status?.authMethod === 'oauth_token'
    && status?.apiProvider === 'firstParty'
}

async function assertClaudeSubscriptionAuth(env: NodeJS.ProcessEnv): Promise<void> {
  const result = await execa(CLAUDE_BIN, ['auth', 'status', '--json'], {
    cwd: REPO_ROOT, env, extendEnv: false, reject: false, timeout: 15_000,
  })
  let parsed: unknown
  try { parsed = JSON.parse(result.stdout || '') } catch { parsed = null }
  if (result.failed || result.exitCode !== 0 || !isClaudeSubscriptionAuth(parsed, env)) {
    const error: any = new Error('Tracked Claude cockpit runs require first-party Claude subscription authentication; API-key billing is disabled.')
    error.statusCode = 503
    error.code = 'CLAUDE_MAX_AUTH_REQUIRED'
    throw error
  }
}

const absolutePermissionPath = (value: string): string => `//${path.resolve(value).slice(1)}`

const canonicalPath = (value: string): string => {
  const resolved = path.resolve(value)
  try { return fs.realpathSync(resolved) } catch { return resolved }
}

function resolvedClaudeBinary(env: NodeJS.ProcessEnv = process.env): string {
  const candidate = path.isAbsolute(CLAUDE_BIN)
    ? CLAUDE_BIN
    : execFileSync('which', [CLAUDE_BIN], { env, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  if (!candidate) throw new Error(`could not resolve tracked Claude executable '${CLAUDE_BIN}'`)
  const resolved = fs.realpathSync(candidate)
  const info = fs.statSync(resolved)
  if (!info.isFile()) throw new Error('tracked Claude executable is not a regular file')
  return resolved
}

/** Inline CLI settings whose deny rules are enforced by Seatbelt/bubblewrap for every Bash descendant. */
export function claudeSandboxSettings(
  context: ProviderLaunchContext,
  mirrorCwd?: string,
  claudeBinary?: string,
  scratchDir?: string,
): Record<string, unknown> {
  const protectedWrites = [...new Set((context.protectedWritePaths ?? []).map((value) => path.resolve(value)))]
  const allowedWrites = [...new Set([
    ...(context.writablePaths ?? []).map((value) => path.resolve(value)),
    ...(scratchDir ? [path.resolve(scratchDir)] : []),
  ])]
  const configDir = context.env.CLAUDE_CONFIG_DIR
    ? path.resolve(context.env.CLAUDE_CONFIG_DIR) : path.join(os.homedir(), '.claude')
  const gitPaths: string[] = [path.join(REPO_ROOT, '.git')]
  for (const args of [['rev-parse', '--absolute-git-dir'], ['rev-parse', '--git-common-dir']]) {
    try {
      const raw = execFileSync('git', args, { cwd: context.cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
      if (raw) gitPaths.push(path.resolve(context.cwd, raw))
    } catch { /* the launcher's repository checks fail separately; keep the worktree .git deny */ }
  }
  const protectedReads = [...new Set([
    ...(context.protectedReadPaths ?? []),
    ...gitPaths,
    ...(claudeBinary ? [claudeBinary] : []),
    configDir,
    path.join(os.homedir(), '.gitconfig'),
    path.join(os.homedir(), '.netrc'),
    path.join(os.homedir(), '.ssh'),
    path.join(os.homedir(), '.config', 'gh'),
    path.join(os.homedir(), '.config', 'nostra-engine'),
  ].map((value) => path.resolve(value)))]
  // Read access is deny-then-allow in Anthropic's sandbox runtime. Deny the user's home and the
  // platform temp tree broadly, then reopen only this canonical repository/data pool and the disposable
  // mirror. More-specific Git/state/auth/binary denies above remain denied inside those reopened roots.
  const broadDeniedReads = [...new Set([
    path.resolve(os.homedir()), canonicalPath(os.homedir()),
    path.resolve(os.tmpdir()), canonicalPath(os.tmpdir()),
  ])]
  // The publication helper must lstat the exact run-scoped socket and its private parent before it
  // connects. Re-open only those two metadata paths in the separate owner-only IPC tree; STATE_DIR stays
  // wholly unreadable. The supervisor owns both inodes, verifies them on every request, and grants no write.
  const publicationMetadataReads = context.publicationSocketPath ? [
    path.dirname(path.resolve(context.publicationSocketPath)),
    path.resolve(context.publicationSocketPath),
  ] : []
  const readOnlyCapabilities = (context.readOnlyCapabilityPaths ?? []).map((value) => {
    if (typeof value !== 'string' || !value.trim() || !path.isAbsolute(value)) {
      throw new Error('Claude read-only capability paths must be non-empty absolute paths')
    }
    return path.resolve(value)
  })
  const allowedReads = [...new Set([
    path.resolve(context.cwd), canonicalPath(context.cwd),
    path.resolve(context.additionalWritableDataRoot), canonicalPath(context.additionalWritableDataRoot),
    ...readOnlyCapabilities.flatMap((value) => [value, canonicalPath(value)]),
    ...(mirrorCwd ? [path.resolve(mirrorCwd), canonicalPath(mirrorCwd)] : []),
    ...publicationMetadataReads.flatMap((value) => [path.resolve(value), canonicalPath(value)]),
  ])]
  const mirrorAlias = (value: string): string[] => {
    if (!mirrorCwd) return []
    const relative = path.relative(path.resolve(context.cwd), path.resolve(value))
    return relative && !relative.startsWith('..') && !path.isAbsolute(relative)
      ? [path.resolve(mirrorCwd, relative)] : relative === '' ? [path.resolve(mirrorCwd)] : []
  }
  const protectedPermissionWrites = [...new Set(protectedWrites.flatMap((value) => [value, ...mirrorAlias(value)]))]
  const protectedPermissionReads = [...new Set(protectedReads.flatMap((value) => [value, ...mirrorAlias(value)]))]
  const builtinWritablePaths = [...new Set((context.writablePaths ?? []).flatMap((value) => {
    const resolved = path.resolve(value)
    return [resolved, ...mirrorAlias(resolved)]
  }))]
  const denyWriteRules = protectedPermissionWrites.flatMap((value) => [
    `Edit(${absolutePermissionPath(value)})`, `Edit(${absolutePermissionPath(value)}/**)`,
    `Write(${absolutePermissionPath(value)})`, `Write(${absolutePermissionPath(value)}/**)`,
  ])
  const denyReadRules = protectedPermissionReads.flatMap((value) => [
    `Read(${absolutePermissionPath(value)})`, `Read(${absolutePermissionPath(value)}/**)`,
  ])
  return {
    autoMemoryEnabled: false,
    permissions: {
      // Built-in writers execute in the trusted CLI process rather than its Bash subprocess sandbox.
      // Expose them only for the same exact output targets through both the real and mirror spelling;
      // protected real/mirror denies win for immutable descendants such as archives and ledger theses.
      // dontAsk runs only explicit allows. Read rules are path-scoped (and govern Glob/Grep's reads),
      // so the built-in tools cannot bypass the same home/tmp/state/Git boundary as Bash descendants.
      allow: [
        ...allowedReads.flatMap((value) => [
          `Read(${absolutePermissionPath(value)})`, `Read(${absolutePermissionPath(value)}/**)`,
        ]),
        ...builtinWritablePaths.flatMap((value) => [
          `Write(${absolutePermissionPath(value)})`, `Write(${absolutePermissionPath(value)}/**)`,
          `Edit(${absolutePermissionPath(value)})`, `Edit(${absolutePermissionPath(value)}/**)`,
        ]),
        'Bash', 'WebSearch', 'WebFetch', 'Task',
      ],
      deny: [...denyWriteRules, ...denyReadRules],
    },
    sandbox: {
      enabled: true,
      failIfUnavailable: true,
      autoAllowBashIfSandboxed: true,
      allowUnsandboxedCommands: false,
      excludedCommands: [],
      filesystem: {
        allowRead: allowedReads,
        denyRead: [...new Set([...broadDeniedReads, ...protectedReads])],
        allowWrite: allowedWrites,
        denyWrite: protectedWrites,
      },
      network: {
        // The model must not call the cockpit's TCP API (or any other same-host service). Publication
        // uses only the exact AF_UNIX capability below; public research fetches stay in WebFetch.
        allowedDomains: [],
        deniedDomains: ['*'],
        allowLocalBinding: false,
        allowAllUnixSockets: false,
        ...(context.publicationSocketPath ? { allowUnixSockets: [path.resolve(context.publicationSocketPath)] } : {}),
      },
    },
  }
}

export interface ClaudeMirrorWorkspace {
  cwd: string
  scratch: string
  validate: () => void
  cleanup: () => void
}

export const CLAUDE_TRACKED_SETTING_SOURCES = 'project'

interface ClaudeMirrorProjection {
  name: string
  validate: () => void
}

interface ProjectionEntry {
  relativePath: string
  kind: 'directory' | 'file'
  identity: string
  executable: boolean
  bytes?: Buffer
  digest?: string
}

interface ClaudeMirrorLink {
  name: string
  target: string
  /** Only the configured repo-root data link is allowed to originate as a symlink. Its source and
   * resolved directory identities are pinned so a pre-spawn swap fails closed. */
  sourceLink?: {
    path: string
    value: string
    identity: string
    targetIdentity: string
  }
}

const symlinkIdentity = (info: fs.BigIntStats): string => [
  info.dev, info.ino, info.mode, info.nlink, info.uid, info.gid, info.size, info.mtimeNs, info.ctimeNs,
].join(':')

// Directory contents legitimately change while the engine is preparing a run. Pin the directory object,
// ownership, and permissions without treating an unrelated new pool file as an identity change.
const directoryIdentity = (info: fs.BigIntStats): string => [
  info.dev, info.ino, info.mode, info.uid, info.gid,
].join(':')

const regularFileIdentity = (info: fs.BigIntStats): string => [
  info.dev, info.ino, info.mode, info.nlink, info.uid, info.gid, info.size, info.mtimeNs, info.ctimeNs,
].join(':')

const projectionFingerprint = (entries: ProjectionEntry[]): string => JSON.stringify(entries.map((entry) => ({
  relativePath: entry.relativePath,
  kind: entry.kind,
  identity: entry.identity,
  executable: entry.executable,
  digest: entry.digest,
})))

function readPinnedProjectionFile(sourcePath: string, relativePath: string): ProjectionEntry {
  const before = fs.lstatSync(sourcePath, { bigint: true })
  if (!before.isFile() || before.isSymbolicLink() || before.nlink !== 1n) {
    throw new Error(`tracked Claude project projection requires a single-link regular file: ${relativePath}`)
  }
  let descriptor: number | undefined
  try {
    descriptor = fs.openSync(sourcePath, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW)
    const opened = fs.fstatSync(descriptor, { bigint: true })
    const bytes = fs.readFileSync(descriptor)
    const after = fs.fstatSync(descriptor, { bigint: true })
    const named = fs.lstatSync(sourcePath, { bigint: true })
    const expected = regularFileIdentity(before)
    if (!opened.isFile() || !after.isFile() || !named.isFile() || named.isSymbolicLink()
        || regularFileIdentity(opened) !== expected || regularFileIdentity(after) !== expected
        || regularFileIdentity(named) !== expected || BigInt(bytes.length) !== opened.size) {
      throw new Error(`tracked Claude project source changed while it was read: ${relativePath}`)
    }
    return {
      relativePath,
      kind: 'file',
      identity: expected,
      executable: (Number(opened.mode) & 0o111) !== 0,
      bytes,
      digest: createHash('sha256').update(bytes).digest('hex'),
    }
  } finally {
    if (descriptor !== undefined) fs.closeSync(descriptor)
  }
}

function snapshotProjection(
  sourcePath: string,
  excludedRelativePaths: ReadonlySet<string>,
  includedRelativeFiles?: ReadonlySet<string>,
): ProjectionEntry[] {
  const rootInfo = fs.lstatSync(sourcePath, { bigint: true })
  if (rootInfo.isSymbolicLink()) throw new Error('tracked Claude project source cannot be a symlink')
  if (rootInfo.isFile()) return [readPinnedProjectionFile(sourcePath, '.')]
  if (!rootInfo.isDirectory()) throw new Error('tracked Claude project source must be a regular file or directory')
  const entries: ProjectionEntry[] = []
  const includedDirectories = new Set<string>()
  if (includedRelativeFiles) {
    for (const file of includedRelativeFiles) {
      const parts = file.split('/')
      for (let i = 1; i < parts.length; i += 1) includedDirectories.add(parts.slice(0, i).join('/'))
    }
  }
  const selected = (relative: string, directory: boolean): boolean => {
    if (!includedRelativeFiles) return true
    if (!directory) return includedRelativeFiles.has(relative)
    if (!relative) return includedRelativeFiles.size > 0
    return includedDirectories.has(relative)
  }
  const walk = (absolute: string, relative: string) => {
    if (!selected(relative, true)) return
    const info = fs.lstatSync(absolute, { bigint: true })
    if (info.isSymbolicLink()) {
      throw new Error(`tracked Claude project source contains a symlink: ${relative || '.'}`)
    }
    if (!info.isDirectory()) throw new Error(`tracked Claude project source contains a non-file entry: ${relative || '.'}`)
    entries.push({
      relativePath: relative || '.', kind: 'directory', identity: directoryIdentity(info), executable: true,
    })
    for (const name of fs.readdirSync(absolute).sort()) {
      const childRelative = relative ? `${relative}/${name}` : name
      if (excludedRelativePaths.has(childRelative)) continue
      const child = path.join(absolute, name)
      // Decide from the reviewed Git manifest before lstat: ignored runtime trees such as
      // `.claude/tools/.venv` contain interpreter symlinks by design and are not prompt-program input.
      if (includedRelativeFiles
          && !includedRelativeFiles.has(childRelative)
          && !selected(childRelative, true)) continue
      const childInfo = fs.lstatSync(child)
      if (childInfo.isSymbolicLink()) {
        throw new Error(`tracked Claude project source contains a symlink: ${childRelative}`)
      }
      if (childInfo.isDirectory()) walk(child, childRelative)
      else if (childInfo.isFile()) entries.push(readPinnedProjectionFile(child, childRelative))
      else throw new Error(`tracked Claude project source contains a non-file entry: ${childRelative}`)
    }
  }
  walk(sourcePath, '')
  return entries
}

/** Copy the discoverable Claude project program into the disposable workspace as regular, read-only
 * files. Project settings are deliberately omitted: Claude merges permission arrays from settings sources,
 * so loading the repository's interactive hooks/permissions would widen the tracked-run boundary. */
function createPinnedProjection(
  sourcePath: string,
  destinationPath: string,
  excludedRelativePaths: ReadonlySet<string> = new Set(),
  includedRelativeFiles?: ReadonlySet<string>,
  currentSelectionIdentity?: () => string,
): ClaudeMirrorProjection {
  const selectionIdentity = currentSelectionIdentity?.()
  const sourceEntries = snapshotProjection(sourcePath, excludedRelativePaths, includedRelativeFiles)
  const sourceFingerprint = projectionFingerprint(sourceEntries)
  const sourceIsFile = sourceEntries.length === 1 && sourceEntries[0].kind === 'file'
  if (sourceIsFile) {
    fs.writeFileSync(destinationPath, sourceEntries[0].bytes!, { flag: 'wx', mode: 0o400 })
  } else {
    for (const entry of sourceEntries) {
      const destination = entry.relativePath === '.'
        ? destinationPath : path.join(destinationPath, ...entry.relativePath.split('/'))
      if (entry.kind === 'directory') fs.mkdirSync(destination, { mode: 0o700 })
      else fs.writeFileSync(destination, entry.bytes!, {
        flag: 'wx', mode: entry.executable ? 0o500 : 0o400,
      })
    }
    // Seal children before parents so construction never needs to write through an already read-only dir.
    for (const entry of [...sourceEntries].reverse()) {
      if (entry.kind !== 'directory') continue
      const destination = entry.relativePath === '.'
        ? destinationPath : path.join(destinationPath, ...entry.relativePath.split('/'))
      fs.chmodSync(destination, 0o500)
    }
  }
  const destinationEntries = snapshotProjection(destinationPath, new Set())
  const destinationFingerprint = projectionFingerprint(destinationEntries)
  return {
    name: path.basename(destinationPath),
    validate: () => {
      if (currentSelectionIdentity && currentSelectionIdentity() !== selectionIdentity) {
        throw new Error(`tracked Claude project file manifest changed before spawn: ${path.basename(sourcePath)}`)
      }
      if (projectionFingerprint(snapshotProjection(sourcePath, excludedRelativePaths, includedRelativeFiles)) !== sourceFingerprint) {
        throw new Error(`tracked Claude project source changed before spawn: ${path.basename(sourcePath)}`)
      }
      if (projectionFingerprint(snapshotProjection(destinationPath, new Set())) !== destinationFingerprint) {
        throw new Error(`tracked Claude project projection changed before spawn: ${path.basename(destinationPath)}`)
      }
    },
  }
}

const CLAUDE_PROJECT_SETTINGS = new Set(['settings.json', 'settings.local.json'])

/** The deployed Git index—not whatever generated files happen to be in the checkout—is the command/agent
 * program authority. This keeps local venvs, bytecode, caches, and editor files out of command discovery,
 * while a newly tracked command changes the manifest and fails a launch already being prepared. */
function trackedClaudeProjectFiles(repoRoot: string): string[] {
  const projectRoot = path.join(repoRoot, '.claude')
  const raw = execFileSync('git', ['ls-files', '-z', '--', '.claude'], {
    cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
  })
  const files = raw.split('\0').filter(Boolean).map((tracked) => {
    if (!tracked.startsWith('.claude/')) throw new Error('tracked Claude project manifest contains an invalid path')
    const relative = tracked.slice('.claude/'.length)
    const resolved = path.resolve(projectRoot, relative)
    const inside = path.relative(projectRoot, resolved)
    if (!relative || inside === '..' || inside.startsWith(`..${path.sep}`) || path.isAbsolute(inside)) {
      throw new Error('tracked Claude project manifest escapes the project program')
    }
    return relative
  }).filter((relative) => !CLAUDE_PROJECT_SETTINGS.has(relative)).sort()
  if (!files.length) throw new Error('tracked Claude project manifest is empty')
  return files
}

function createTrackedClaudeProjectProjection(repoRoot: string, sourcePath: string, destinationPath: string): ClaudeMirrorProjection {
  const selection = () => JSON.stringify(trackedClaudeProjectFiles(repoRoot))
  const files = new Set(trackedClaudeProjectFiles(repoRoot))
  return createPinnedProjection(sourcePath, destinationPath, CLAUDE_PROJECT_SETTINGS, files, selection)
}

function makeClaudeMirrorRemovable(absolute: string): void {
  let info: fs.Stats
  try { info = fs.lstatSync(absolute) } catch { return }
  if (info.isSymbolicLink()) return
  if (!info.isDirectory()) {
    try { fs.chmodSync(absolute, 0o600) } catch { /* rmSync reports any remaining failure */ }
    return
  }
  try { fs.chmodSync(absolute, 0o700) } catch { /* continue to the bounded no-follow walk */ }
  let names: string[] = []
  try { names = fs.readdirSync(absolute) } catch { return }
  for (const name of names) makeClaudeMirrorRemovable(path.join(absolute, name))
}

/**
 * Claude's Bash sandbox always grants its process cwd. Run from a disposable symlink mirror instead of
 * the real repository so that implicit grant covers no durable bytes; real output paths are admitted only
 * through sandbox.filesystem.allowWrite. Project commands/agents and repo-relative scripts remain visible
 * through stable read-only symlinks, while its discoverable `.claude` program and root doctrine are copied
 * as pinned regular files. This lets the CLI load `project` commands without loading interactive project
 * settings and without allowing a run to mutate the canonical program.
 */
export function createClaudeMirrorWorkspace(
  repoRoot = REPO_ROOT,
  configuredDataRoot = path.join(repoRoot, 'data'),
): ClaudeMirrorWorkspace {
  const lexicalRepoRoot = path.resolve(repoRoot)
  const expectedDataLink = path.join(lexicalRepoRoot, 'data')
  if (path.resolve(configuredDataRoot) !== expectedDataLink) {
    throw new Error('tracked Claude mirror requires the configured data root to be the repository data entry')
  }
  // Bind the canonical path immediately (`/tmp` is `/private/tmp` on macOS). The sandbox rules and the
  // pre-spawn identity check must describe the same inode spelling, otherwise a legitimate mirror fails
  // closed while a provider-specific alias could be checked less narrowly.
  const root = fs.realpathSync(fs.mkdtempSync('/tmp/nostra-claude-workspace-'))
  fs.chmodSync(root, 0o700)
  const scratch = path.join(root, '.scratch')
  fs.mkdirSync(scratch, { mode: 0o700 })
  const links: ClaudeMirrorLink[] = []
  const projections: ClaudeMirrorProjection[] = []
  let gitPointer = ''
  let cleaned = false
  try {
    for (const entry of fs.readdirSync(lexicalRepoRoot, { withFileTypes: true })) {
      const sourcePath = path.join(lexicalRepoRoot, entry.name)
      const sourceInfo = fs.lstatSync(sourcePath)
      let target = sourcePath
      let sourceLink: ClaudeMirrorLink['sourceLink']
      if (sourceInfo.isSymbolicLink()) {
        // Production intentionally projects the owner-pinned external pool through repo/data. Preserve
        // that one declared topology without weakening the original guard for arbitrary root links. Point
        // the disposable mirror at the resolved directory, then prove both the source link and directory
        // identity again immediately before spawn. The provider has no write grant to either location.
        if (sourcePath !== expectedDataLink) {
          throw new Error(`tracked Claude mirror refuses undeclared repository-root symlink: ${entry.name}`)
        }
        const before = fs.lstatSync(sourcePath, { bigint: true })
        const value = fs.readlinkSync(sourcePath)
        target = fs.realpathSync(sourcePath)
        const targetInfo = fs.statSync(target, { bigint: true })
        const after = fs.lstatSync(sourcePath, { bigint: true })
        const canonicalRepoRoot = fs.realpathSync(lexicalRepoRoot)
        const currentUid = process.getuid?.()
        if (!before.isSymbolicLink() || !after.isSymbolicLink()
            || symlinkIdentity(before) !== symlinkIdentity(after)
            || fs.readlinkSync(sourcePath) !== value
            || !targetInfo.isDirectory()
            || (currentUid !== undefined && targetInfo.uid !== BigInt(currentUid))
            || target === path.parse(target).root
            || target === canonicalPath(os.homedir())
            || target === canonicalRepoRoot || target.startsWith(canonicalRepoRoot + path.sep)
            || fs.realpathSync(sourcePath) !== target) {
          throw new Error('tracked Claude mirror could not pin the configured data-root symlink')
        }
        sourceLink = {
          path: sourcePath,
          value,
          identity: symlinkIdentity(before),
          targetIdentity: directoryIdentity(targetInfo),
        }
      }
      if (entry.name === '.git') {
        const gitDir = execFileSync('git', ['rev-parse', '--absolute-git-dir'], {
          cwd: lexicalRepoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
        }).trim()
        if (!path.isAbsolute(gitDir)) throw new Error('tracked Claude mirror could not resolve the repository Git directory')
        gitPointer = `gitdir: ${gitDir}\n`
        fs.writeFileSync(path.join(root, '.git'), gitPointer, { flag: 'wx', mode: 0o400 })
        continue
      }
      if (entry.name === '.claude') {
        if (!sourceInfo.isDirectory()) throw new Error('tracked Claude project program is not a directory')
        projections.push(createTrackedClaudeProjectProjection(lexicalRepoRoot, sourcePath, path.join(root, entry.name)))
        continue
      }
      if (entry.name === 'CLAUDE.md') {
        if (!sourceInfo.isFile()) throw new Error('tracked Claude root doctrine is not a regular file')
        projections.push(createPinnedProjection(sourcePath, path.join(root, entry.name)))
        continue
      }
      fs.symlinkSync(target, path.join(root, entry.name), sourceInfo.isDirectory() || sourceLink ? 'dir' : 'file')
      links.push({ name: entry.name, target, sourceLink })
    }
  } catch (error) {
    makeClaudeMirrorRemovable(root)
    fs.rmSync(root, { recursive: true, force: true })
    throw error
  }
  const validate = () => {
    if (cleaned) throw new Error('tracked Claude mirror was already cleaned')
    const actual = fs.readdirSync(root).sort()
    const expected = [
      ...links.map((link) => link.name), ...projections.map((projection) => projection.name),
      '.scratch', ...(gitPointer ? ['.git'] : []),
    ].sort()
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('tracked Claude mirror topology changed before spawn')
    for (const link of links) {
      const candidate = path.join(root, link.name)
      const info = fs.lstatSync(candidate)
      if (!info.isSymbolicLink() || fs.readlinkSync(candidate) !== link.target) {
        throw new Error(`tracked Claude mirror link changed before spawn: ${link.name}`)
      }
      if (link.sourceLink) {
        const sourceInfo = fs.lstatSync(link.sourceLink.path, { bigint: true })
        const targetInfo = fs.statSync(link.target, { bigint: true })
        if (!sourceInfo.isSymbolicLink()
            || symlinkIdentity(sourceInfo) !== link.sourceLink.identity
            || fs.readlinkSync(link.sourceLink.path) !== link.sourceLink.value
            || fs.realpathSync(link.sourceLink.path) !== link.target
            || !targetInfo.isDirectory()
            || directoryIdentity(targetInfo) !== link.sourceLink.targetIdentity) {
          throw new Error(`tracked Claude mirror source link changed before spawn: ${link.name}`)
        }
      }
    }
    for (const projection of projections) projection.validate()
    if (gitPointer && fs.readFileSync(path.join(root, '.git'), 'utf8') !== gitPointer) {
      throw new Error('tracked Claude mirror Git pointer changed before spawn')
    }
    const scratchInfo = fs.lstatSync(scratch)
    if (!scratchInfo.isDirectory() || scratchInfo.isSymbolicLink() || fs.realpathSync(scratch) !== scratch
        || (scratchInfo.mode & 0o077) !== 0) throw new Error('tracked Claude scratch directory changed before spawn')
  }
  return {
    cwd: root,
    scratch,
    validate,
    cleanup: () => {
      if (cleaned) return
      cleaned = true
      makeClaudeMirrorRemovable(root)
      fs.rmSync(root, { recursive: true, force: true })
    },
  }
}

const SRT_PACKAGE = '@anthropic-ai/sandbox-runtime@0.0.73'
const SRT_BIN = path.join(REPO_ROOT, 'ui', 'server', 'node_modules', '.bin', 'srt')

const listen = (server: net.Server, target: string | { host: string; port: number }): Promise<void> =>
  new Promise((resolve, reject) => {
    const onError = (error: Error) => { server.off('listening', onListening); reject(error) }
    const onListening = () => { server.off('error', onError); resolve() }
    server.once('error', onError)
    server.once('listening', onListening)
    typeof target === 'string' ? server.listen(target) : server.listen(target)
  })

const closeServer = (server: net.Server): Promise<void> => new Promise((resolve) => {
  try { server.close(() => resolve()) } catch { resolve() }
})

/**
 * Prove the installed host can enforce the exact boundary without starting Claude or spending tokens.
 * The pinned official sandbox runtime executes positive and negative controls for read/write, public and
 * loopback TCP, the one publication UDS, and nested-Claude authentication denial. A proof is cached only while the
 * resolved Claude executable keeps the same inode/mtime identity; every engine restart proves again.
 */
async function assertClaudeSandboxRuntime(): Promise<void> {
  const binary = resolvedClaudeBinary(claudeChildEnv(process.env))
  const binaryInfo = fs.statSync(binary, { bigint: true })
  const srt = fs.realpathSync(SRT_BIN)
  const srtInfo = fs.statSync(srt, { bigint: true })
  if (!srtInfo.isFile()) throw new Error(`pinned ${SRT_PACKAGE} runtime is not installed`)
  const key = [SRT_PACKAGE, process.platform, binary, binaryInfo.dev, binaryInfo.ino, binaryInfo.size,
    srt, srtInfo.dev, srtInfo.ino, srtInfo.size, srtInfo.mtimeNs, srtInfo.ctimeNs,
    binaryInfo.mtimeNs, binaryInfo.ctimeNs].join(':')
  if (sandboxRuntimeProofKey === key && sandboxRuntimeProof) return sandboxRuntimeProof
  const proof = (async () => {
    fs.mkdirSync(STATE_DIR, { recursive: true, mode: 0o700 })
    fs.chmodSync(STATE_DIR, 0o700)
    fs.mkdirSync(PUBLICATION_SOCKET_ROOT, { recursive: true, mode: 0o700 })
    fs.chmodSync(PUBLICATION_SOCKET_ROOT, 0o700)
    const id = randomUUID()
    const supervisorDir = fs.mkdtempSync(path.join(PUBLICATION_SOCKET_ROOT, 'claude-srt-proof-'))
    // SRT creates its proxy/multiplexer socket below TMPDIR. Keep this exact disposable path short
    // enough for Darwin's 103-byte sockaddr_un ceiling; broad /tmp remains denied except this root.
    const mirrorDir = fs.mkdtempSync('/tmp/nostra-claude-srt-')
    const scratchDir = path.join(mirrorDir, '.scratch')
    fs.chmodSync(supervisorDir, 0o700)
    fs.chmodSync(mirrorDir, 0o700)
    fs.mkdirSync(scratchDir, { mode: 0o700 })
    const socketPath = path.join(supervisorDir, 'p.sock')
    const deniedSocketPath = path.join(supervisorDir, 'denied.sock')
    const settingsPath = path.join(supervisorDir, 'settings.json')
    const stateSentinel = path.join(STATE_DIR, `.claude-srt-state-${id}`)
    const homeSentinel = path.join(os.homedir(), `.nostra-claude-srt-home-${id}`)
    const tempSentinel = path.join(os.tmpdir(), `.nostra-claude-srt-tmp-${id}`)
    const deniedRepoWrite = path.join(REPO_ROOT, `.nostra-claude-srt-write-${id}`)
    const allowedWrite = path.join(scratchDir, 'allowed-write')
    const gitDir = execFileSync('git', ['rev-parse', '--absolute-git-dir'], {
      cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    const gitSentinel = path.join(gitDir, 'HEAD')
    const publicationToken = randomUUID()
    const unixServer = http.createServer((request, response) => {
      let body = ''
      request.setEncoding('utf8')
      request.on('data', (chunk) => { if (body.length <= 4096) body += chunk })
      request.on('end', () => {
        const token = request.headers['x-nostra-publication-token']
        const valid = request.method === 'POST' && request.url === '/publication'
          && token === publicationToken && body === '{"phase":"sandbox-boundary-probe"}'
        response.writeHead(valid ? 200 : 400, { 'content-type': 'application/json' })
        response.end(JSON.stringify(valid ? { ok: true, probe: true } : { error: 'invalid probe' }))
      })
    })
    const deniedUnixServer = net.createServer((socket) => socket.end())
    const tcpServer = net.createServer((socket) => socket.end())
    try {
      for (const sentinel of [stateSentinel, homeSentinel, tempSentinel]) {
        fs.writeFileSync(sentinel, `sandbox-probe-${id}\n`, { flag: 'wx', mode: 0o600 })
      }
      await listen(unixServer, socketPath)
      await listen(deniedUnixServer, deniedSocketPath)
      fs.chmodSync(socketPath, 0o600)
      fs.chmodSync(deniedSocketPath, 0o600)
      await listen(tcpServer, { host: '127.0.0.1', port: 0 })
      const address = tcpServer.address()
      if (!address || typeof address === 'string') throw new Error('could not bind Claude sandbox loopback control')
      const context: ProviderLaunchContext = {
        prompt: '', kind: 'full', cwd: REPO_ROOT, additionalWritableDataRoot: DATA_DIR,
        profile: resolveProfile({}), env: claudeChildEnv(process.env), guard: { maxTurns: 1, budgetUsd: 1 },
        writablePaths: [], protectedWritePaths: [STATE_DIR, gitDir, path.join(REPO_ROOT, 'scripts')],
        protectedReadPaths: [STATE_DIR, gitDir], publicationSocketPath: socketPath,
      }
      const settings: any = claudeSandboxSettings(context, mirrorDir, binary, scratchDir)
      fs.writeFileSync(settingsPath, JSON.stringify({
        filesystem: settings.sandbox.filesystem,
        network: settings.sandbox.network,
      }, null, 2) + '\n', { flag: 'wx', mode: 0o600 })
      // The probe executes the nested CLI directly instead of spending quota on a parent Claude turn.
      // Mirror the environment Anthropic's parent-side scrub presents to Bash/tools; otherwise the proof
      // would hand its direct child the parent's setup-token and fail for the wrong reason.
      const probeEnv = claudeNestedToolEnv(process.env)
      probeEnv.TMPDIR = scratchDir
      probeEnv.TMP = scratchDir
      probeEnv.TEMP = scratchDir
      probeEnv.XDG_CACHE_HOME = scratchDir
      probeEnv.PYTHONDONTWRITEBYTECODE = '1'
      probeEnv.NOSTRA_PUBLICATION_ENDPOINT = 'http://localhost/publication'
      probeEnv.NOSTRA_PUBLICATION_SOCKET = socketPath
      probeEnv.NOSTRA_PUBLICATION_TOKEN = publicationToken
      const result = await execa(srt, [
        '-s', settingsPath,
        'python3', path.join(REPO_ROOT, 'scripts', 'ops', 'claude-sandbox-probe.py'),
        '--allow-read', path.join(REPO_ROOT, 'AGENTS.md'),
        '--allow-write', allowedWrite,
        '--deny-read', stateSentinel,
        '--deny-read', homeSentinel,
        '--deny-read', tempSentinel,
        '--deny-read', gitSentinel,
        '--deny-write', stateSentinel,
        '--deny-write', deniedRepoWrite,
        '--deny-exec', binary,
        '--unix-socket', socketPath,
        '--denied-unix-socket', deniedSocketPath,
        '--loopback-port', String(address.port),
        '--publication-helper', path.join(REPO_ROOT, 'scripts', 'supervisor_publication.py'),
      ], { cwd: mirrorDir, env: probeEnv, extendEnv: false, reject: false, timeout: 45_000 })
      if (result.failed || result.exitCode !== 0 || !result.stdout.includes('CLAUDE_SANDBOX_BOUNDARY_OK=1')) {
        throw new Error(`tracked Claude OS boundary proof failed: ${(result.stderr || result.stdout || 'unknown error').slice(-1000)}`)
      }
      if (fs.existsSync(deniedRepoWrite)) throw new Error('tracked Claude boundary probe created a forbidden repository file')
      if (fs.readFileSync(stateSentinel, 'utf8') !== `sandbox-probe-${id}\n`) {
        throw new Error('tracked Claude boundary probe changed supervisor state')
      }
    } finally {
      await Promise.all([closeServer(unixServer), closeServer(deniedUnixServer), closeServer(tcpServer)])
      for (const candidate of [stateSentinel, homeSentinel, tempSentinel, deniedRepoWrite]) {
        try { fs.unlinkSync(candidate) } catch { /* absent */ }
      }
      fs.rmSync(mirrorDir, { recursive: true, force: true })
      fs.rmSync(supervisorDir, { recursive: true, force: true })
    }
  })()
  sandboxRuntimeProofKey = key
  sandboxRuntimeProof = proof.catch((error) => {
    sandboxRuntimeProof = null
    sandboxRuntimeProofKey = null
    throw error
  })
  return sandboxRuntimeProof
}

async function probeAvailability(): Promise<ProviderAvailability> {
  try {
    const env = claudeChildEnv(process.env)
    const version: any = await execa(CLAUDE_BIN, ['--version'], {
      reject: false, timeout: 15_000, env, extendEnv: false,
    })
    if (version.failed || version.exitCode !== 0) {
      return { available: false, availability: 'unavailable', reason: unavailableReason() }
    }
    const auth: any = await execa(CLAUDE_BIN, ['auth', 'status', '--json'], {
      cwd: REPO_ROOT, env, extendEnv: false, reject: false, timeout: 15_000,
    })
    let parsed: unknown
    try { parsed = JSON.parse(auth.stdout || '') } catch { parsed = null }
    if (auth.failed || auth.exitCode !== 0 || !isClaudeSubscriptionAuth(parsed, env)) {
      return {
        available: false,
        availability: 'unavailable',
        cliVersion: String(version.stdout || '').trim() || undefined,
        reason: 'Claude is installed, but the cockpit requires first-party Claude subscription authentication. Run `claude auth login` or configure a setup-token for the headless service; API-key billing is disabled.',
      }
    }
    await assertClaudeSandboxRuntime()
    return {
      available: true,
      availability: 'available',
      cliVersion: String(version.stdout || '').trim() || undefined,
    }
  } catch (error: any) {
    return {
      available: false,
      availability: 'unavailable',
      reason: String(error?.message || '').trim() || unavailableReason(),
    }
  }
}

async function getAvailability(options: { refresh?: boolean } = {}): Promise<ProviderAvailability> {
  if (!options.refresh && availability) return { ...availability }
  // Explicit checks and launch preflights share only an already-running probe. A completed result is
  // useful for display, but launch-time callers still re-prove first-party Max auth.
  if (!availabilityProbe) {
    availabilityProbe = probeAvailability().then((result) => {
      availability = result
      return result
    }).finally(() => { availabilityProbe = null })
  }
  const result = await availabilityProbe
  return { ...result }
}

export const CLAUDE_DEFAULT_RUN_MODEL = 'opus'
export const CLAUDE_RUN_MODELS = [
  { model: 'opus', label: 'Opus', description: 'Highest quality · Opus across the research swarm' },
  { model: 'sonnet', label: 'Sonnet', description: 'Balanced · Sonnet swarm with Opus memo roles' },
] as const

function resolveProfile(request: { model?: string; reasoningLevel?: string; profileKey?: string }): ResolvedProviderProfile {
  const requestedModel = String(request.model || '').trim().toLowerCase()
  const requestedKey = String(request.profileKey || '').trim()
  const keyedModel = requestedKey.match(/^claude:(opus|sonnet):default$/)?.[1]
  if (requestedKey && !keyedModel) {
    const error: any = new Error(`Unsupported Claude execution profile '${request.profileKey}'.`)
    error.statusCode = 400
    error.code = 'CLAUDE_PROFILE_INVALID'
    throw error
  }
  const model = keyedModel || requestedModel || CLAUDE_DEFAULT_RUN_MODEL
  if (!CLAUDE_RUN_MODELS.some((candidate) => candidate.model === model)) {
    const error: any = new Error(`Unsupported Claude research model '${request.model}'. Choose Opus or Sonnet.`)
    error.statusCode = 400
    error.code = 'CLAUDE_PROFILE_INVALID'
    throw error
  }
  if (keyedModel && requestedModel && requestedModel !== keyedModel) {
    const error: any = new Error('Claude model and execution-profile key disagree.')
    error.statusCode = 409
    error.code = 'CLAUDE_PROFILE_CHANGED'
    throw error
  }
  const reasoningLevel = request.reasoningLevel || 'default'
  if (reasoningLevel !== 'default') {
    const error: any = new Error(`Claude's cockpit profile uses its CLI default reasoning; received '${reasoningLevel}'.`)
    error.statusCode = 400
    error.code = 'CLAUDE_PROFILE_INVALID'
    throw error
  }
  const profileKey = `claude:${model}:default`
  return {
    provider: 'claude', profileKey, model, reasoningLevel,
    executionProfile: { key: profileKey, parentModel: model, parentReasoning: reasoningLevel },
  }
}

async function buildLaunch(context: ProviderLaunchContext): Promise<ProviderLaunchSpec> {
  const flags = await detectClaudeFlags()
  for (const required of ['--permission-mode', '--settings', '--setting-sources', '--strict-mcp-config', '--tools']) {
    if (!flags.has(required)) throw new Error(`Claude CLI lacks required tracked-run isolation flag ${required}.`)
  }
  const env = claudeChildEnv(context.env)
  await assertClaudeSubscriptionAuth(env)
  await assertClaudeSandboxRuntime()
  if (!context.writablePaths?.length) throw new Error('Tracked Claude launch has no exact writable output scope.')
  const mirror = createClaudeMirrorWorkspace(context.cwd, context.additionalWritableDataRoot)
  env.TMPDIR = mirror.scratch
  env.TMP = mirror.scratch
  env.TEMP = mirror.scratch
  env.XDG_CACHE_HOME = mirror.scratch
  env.PYTHONDONTWRITEBYTECODE = '1'
  // Resolve the subscription CLI before adding any generated tool runtime to descendant PATH lookup.
  const binary = resolvedClaudeBinary(env)
  // The reviewed Python tools intentionally keep their generated dependency environment out of Git.
  // It must not enter project command discovery, but using its interpreter through PATH preserves the
  // established extractor behavior. The canonical `.claude` tree is read-only to every tracked child.
  const toolsVenvBin = path.join(context.cwd, '.claude', 'tools', '.venv', 'bin')
  let toolsVenvPresent = false
  try {
    const venvInfo = fs.lstatSync(toolsVenvBin)
    toolsVenvPresent = true
    const venvPython = fs.statSync(path.join(toolsVenvBin, 'python'))
    if (!venvInfo.isDirectory() || venvInfo.isSymbolicLink() || !venvPython.isFile()) {
      throw new Error('invalid generated Claude tools environment')
    }
    env.PATH = env.PATH ? `${toolsVenvBin}${path.delimiter}${env.PATH}` : toolsVenvBin
  } catch (error: any) {
    if (error?.code !== 'ENOENT' || toolsVenvPresent) {
      mirror.cleanup()
      throw error
    }
  }
  const binaryInfo = fs.statSync(binary, { bigint: true })
  const binaryIdentity = [binaryInfo.dev, binaryInfo.ino, binaryInfo.mode, binaryInfo.size,
    binaryInfo.mtimeNs, binaryInfo.ctimeNs].join(':')
  const settings = JSON.stringify(claudeSandboxSettings(context, mirror.cwd, binary, mirror.scratch))
  const args: string[] = ['--print', context.prompt, '--output-format', 'stream-json', '--verbose']
  args.push(
    '--permission-mode', 'dontAsk',
    '--tools', 'Read,Glob,Grep,Write,Edit,Bash,WebSearch,WebFetch,Task',
    // Load only the pinned project program in the disposable mirror. User/local state stays disabled, and
    // the project settings files are absent from the projection so their merging permission arrays/hooks
    // cannot widen the inline tracked-run sandbox.
    '--setting-sources', CLAUDE_TRACKED_SETTING_SOURCES,
    '--settings', settings,
    '--strict-mcp-config',
    '--mcp-config', JSON.stringify({ mcpServers: {} }),
  )
  if (context.resumeSessionId) args.push('--resume', context.resumeSessionId)
  if (flags.has('--model')) args.push('--model', context.profile.model)
  if (flags.has('--max-turns')) args.push('--max-turns', String(context.guard.maxTurns))
  if (flags.has('--max-budget-usd')) args.push('--max-budget-usd', String(context.guard.budgetUsd))
  try {
    const status = await getAvailability()
    return {
      command: binary,
      args,
      cwd: mirror.cwd,
      env,
      cliVersion: status.cliVersion,
      beforeSpawn: () => {
        mirror.validate()
        const current = fs.statSync(binary, { bigint: true })
        if ([current.dev, current.ino, current.mode, current.size, current.mtimeNs, current.ctimeNs].join(':')
            !== binaryIdentity || fs.realpathSync(binary) !== binary) {
          throw new Error('tracked Claude executable changed after the sandbox boundary proof')
        }
        const inline = args[args.indexOf('--settings') + 1]
        if (inline !== settings || JSON.stringify(JSON.parse(inline)) !== settings) {
          throw new Error('tracked Claude inline sandbox settings changed before spawn')
        }
      },
      cleanup: mirror.cleanup,
    }
  } catch (error) {
    mirror.cleanup()
    throw error
  }
}

function creditFromRateLimit(info: any): CreditPreflight {
  return {
    ok: info.status !== 'rejected' && info.status !== 'blocked',
    checked: true,
    status: info.status,
    rateLimitType: info.rateLimitType,
    utilization: typeof info.utilization === 'number' ? info.utilization : undefined,
    resetsAt: typeof info.resetsAt === 'number' ? info.resetsAt : undefined,
    isUsingOverage: info.isUsingOverage,
    reason: info.overageDisabledReason || info.status,
  }
}

function parseStreamLine(line: string): ProviderStreamEvent[] {
  const text = line.trim()
  if (!text) return []
  let value: any
  try { value = JSON.parse(text) } catch { return [] }

  if (value.type === 'system' && value.subtype === 'init' && typeof value.session_id === 'string') {
    return [{ type: 'session', sessionId: value.session_id }]
  }
  if (value.type === 'assistant' && Array.isArray(value.message?.content)) {
    return value.message.content.flatMap((block: any): ProviderStreamEvent[] => {
      if (block?.type === 'text' && typeof block.text === 'string' && block.text.trim()) {
        return [{ type: 'assistant-message', message: block.text }]
      }
      if (block?.type === 'tool_use' && typeof block.name === 'string') {
        return [{ type: 'tool-use', tool: block.name, toolUseId: typeof block.id === 'string' ? block.id : undefined, input: block.input }]
      }
      return []
    })
  }
  if (value.type === 'user' && Array.isArray(value.message?.content)) {
    return value.message.content
      .filter((block: any) => block?.type === 'tool_result')
      .map((block: any) => ({ type: 'tool-result' as const, toolUseId: typeof block.tool_use_id === 'string' ? block.tool_use_id : undefined, isError: block.is_error === true }))
  }
  if (value.type === 'rate_limit_event') {
    return [{ type: 'usage', usage: creditFromRateLimit(value.rate_limit_info || {}) }]
  }
  if (value.type === 'result') {
    return [{
      type: 'result',
      cliResult: {
        subtype: typeof value.subtype === 'string' ? value.subtype : undefined,
        isError: value.is_error === true,
        apiErrorStatus: typeof value.api_error_status === 'number' ? value.api_error_status : undefined,
      },
      costUsd: typeof value.total_cost_usd === 'number' ? value.total_cost_usd : undefined,
      numTurns: typeof value.num_turns === 'number' ? value.num_turns : undefined,
      durationMs: typeof value.duration_ms === 'number' ? value.duration_ms : undefined,
      message: typeof value.result === 'string' ? value.result : undefined,
    }]
  }
  return []
}

function classifyExit(context: ProviderExitContext): ProviderExitClassification {
  const result: any = context.result || {}
  const code = result.exitCode ?? result.code
  const terminated = result.isTerminated === true || result.killed === true || !!result.signal
  if (terminated) return { outcome: 'terminated', reason: `terminated_${result.signal || 'signal'}`, message: context.stderr }
  if ((code && code !== 0) || result.failed === true) {
    const outOfCredits = /rate limit|usage limit|overage|credit/i.test(context.stderr)
    return { outcome: 'error', reason: outOfCredits ? 'out_of_credits' : 'nonzero_exit', message: context.stderr, outOfCredits }
  }
  return { outcome: 'success' }
}

async function checkUsage(): Promise<CreditPreflight | null> {
  const flags = await detectClaudeFlags()
  const args: string[] = ['--print', 'ok', '--output-format', 'stream-json', '--verbose', '--model', 'haiku']
  args.push('--tools', '')
  if (flags.has('--max-turns')) args.push('--max-turns', '1')
  try {
    const child = execa(CLAUDE_BIN, args, {
      cwd: REPO_ROOT, env: claudeChildEnv(process.env), extendEnv: false, reject: false, timeout: 30_000,
    })
    const { stdout } = await child
    let lastUsage: CreditPreflight | null = null
    let sawRateLimit = false
    for (const line of stdout.split('\n')) {
      let raw: any
      try { raw = JSON.parse(line) } catch { raw = null }
      const events = parseStreamLine(line)
      for (const event of events) {
        if (event.type === 'usage') { lastUsage = event.usage; sawRateLimit = true }
        if (event.type === 'result' && !sawRateLimit) {
          // Preserve the legacy probe's whole-result match: Claude may put the quota diagnostic in a
          // structured field other than `result`, while ordinary run streaming stays normalized above.
          if (event.cliResult.isError && /credit|overage|rate/i.test(JSON.stringify(raw ?? event.message ?? ''))) {
            lastUsage = { ok: false, reason: 'rate_limited', checked: true }
          } else if (!event.cliResult.isError) {
            lastUsage = { ok: true, reason: 'ok', checked: true }
          }
        }
      }
    }
    return lastUsage
  } catch {
    return null
  }
}

export const claudeProviderAdapter: ProviderAdapter = {
  profile: {
    provider: 'claude',
    label: 'Claude',
    description: 'Run the cockpit through Claude Code.',
    defaultProfileKey: `claude:${CLAUDE_DEFAULT_RUN_MODEL}:default`,
    profiles: CLAUDE_RUN_MODELS.map(({ model, label, description }) => {
      const resolved = resolveProfile({ model })
      return {
        key: resolved.profileKey, label, description, model: resolved.model,
        reasoningLevel: resolved.reasoningLevel, executionProfile: resolved.executionProfile,
      }
    }),
    supportsUsage: true,
  },
  resolveProfile,
  getAvailability,
  buildLaunch,
  parseStreamLine,
  classifyExit,
  checkUsage,
  warmup: async () => {
    await getAvailability()
    await detectClaudeFlags()
  },
}

registerProviderAdapter(claudeProviderAdapter)
