import { execa } from 'execa'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { CLAUDE_BIN, DATA_DIR, DEFAULT_MODEL, REPO_ROOT, STATE_DIR } from '../config'
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

// A tracked Claude process can execute arbitrary shell commands under bypassPermissions. Treat its
// environment as model-visible and pass only OS/runtime plumbing plus Claude's own authentication.
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
  // Tracked cockpit runs are Max-plan runs. API/OAuth billing tokens must never enter model-visible Bash;
  // the CLI authenticates through its first-party claude.ai login instead.
  env.NOSTRA_COCKPIT_RUN = '1'
  env.NO_COLOR = '1'
  for (const key of CLAUDE_COCKPIT_ENV_ALLOWLIST) if (base[key]) env[key] = base[key]
  return env
}

export function isClaudeMaxAuth(value: unknown): boolean {
  const status = value as any
  return status?.loggedIn === true && status?.authMethod === 'claude.ai'
    && status?.apiProvider === 'firstParty' && status?.subscriptionType === 'max'
}

async function assertClaudeMaxAuth(env: NodeJS.ProcessEnv): Promise<void> {
  const result = await execa(CLAUDE_BIN, ['auth', 'status', '--json'], {
    cwd: REPO_ROOT, env, extendEnv: false, reject: false, timeout: 15_000,
  })
  let parsed: unknown
  try { parsed = JSON.parse(result.stdout || '') } catch { parsed = null }
  if (result.failed || result.exitCode !== 0 || !isClaudeMaxAuth(parsed)) {
    const error: any = new Error('Tracked Claude cockpit runs require a first-party Claude Max login; API-token billing is disabled.')
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
  const allowedReads = [...new Set([
    path.resolve(context.cwd), canonicalPath(context.cwd),
    path.resolve(context.additionalWritableDataRoot), canonicalPath(context.additionalWritableDataRoot),
    ...(mirrorCwd ? [path.resolve(mirrorCwd), canonicalPath(mirrorCwd)] : []),
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

/**
 * Claude's Bash sandbox always grants its process cwd. Run from a disposable symlink mirror instead of
 * the real repository so that implicit grant covers no durable bytes; real output paths are admitted only
 * through sandbox.filesystem.allowWrite. Project commands/agents and repo-relative scripts remain visible
 * through stable read-only symlinks, while built-in Write/Edit are disabled above.
 */
export function createClaudeMirrorWorkspace(repoRoot = REPO_ROOT): ClaudeMirrorWorkspace {
  // Bind the canonical path immediately (`/tmp` is `/private/tmp` on macOS). The sandbox rules and the
  // pre-spawn identity check must describe the same inode spelling, otherwise a legitimate mirror fails
  // closed while a provider-specific alias could be checked less narrowly.
  const root = fs.realpathSync(fs.mkdtempSync('/tmp/nostra-claude-workspace-'))
  fs.chmodSync(root, 0o700)
  const scratch = path.join(root, '.scratch')
  fs.mkdirSync(scratch, { mode: 0o700 })
  const links: Array<{ name: string; target: string }> = []
  let gitPointer = ''
  let cleaned = false
  try {
    for (const entry of fs.readdirSync(repoRoot, { withFileTypes: true })) {
      if (entry.isSymbolicLink()) throw new Error(`tracked Claude mirror refuses repository-root symlink: ${entry.name}`)
      const target = path.join(repoRoot, entry.name)
      if (entry.name === '.git') {
        const gitDir = execFileSync('git', ['rev-parse', '--absolute-git-dir'], {
          cwd: repoRoot, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
        }).trim()
        if (!path.isAbsolute(gitDir)) throw new Error('tracked Claude mirror could not resolve the repository Git directory')
        gitPointer = `gitdir: ${gitDir}\n`
        fs.writeFileSync(path.join(root, '.git'), gitPointer, { flag: 'wx', mode: 0o400 })
        continue
      }
      fs.symlinkSync(target, path.join(root, entry.name), entry.isDirectory() ? 'dir' : 'file')
      links.push({ name: entry.name, target })
    }
  } catch (error) {
    fs.rmSync(root, { recursive: true, force: true })
    throw error
  }
  const validate = () => {
    if (cleaned) throw new Error('tracked Claude mirror was already cleaned')
    const actual = fs.readdirSync(root).sort()
    const expected = [...links.map((link) => link.name), '.scratch', ...(gitPointer ? ['.git'] : [])].sort()
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error('tracked Claude mirror topology changed before spawn')
    for (const link of links) {
      const candidate = path.join(root, link.name)
      const info = fs.lstatSync(candidate)
      if (!info.isSymbolicLink() || fs.readlinkSync(candidate) !== link.target) {
        throw new Error(`tracked Claude mirror link changed before spawn: ${link.name}`)
      }
    }
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
    const id = randomUUID()
    const supervisorDir = fs.mkdtempSync(path.join(STATE_DIR, 'claude-srt-proof-'))
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
    const stateSentinel = path.join(supervisorDir, 'state-secret')
    const homeSentinel = path.join(os.homedir(), `.nostra-claude-srt-home-${id}`)
    const tempSentinel = path.join(os.tmpdir(), `.nostra-claude-srt-tmp-${id}`)
    const deniedRepoWrite = path.join(REPO_ROOT, `.nostra-claude-srt-write-${id}`)
    const allowedWrite = path.join(scratchDir, 'allowed-write')
    const gitDir = execFileSync('git', ['rev-parse', '--absolute-git-dir'], {
      cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
    const gitSentinel = path.join(gitDir, 'HEAD')
    const unixServer = net.createServer((socket) => socket.end())
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
      const probeEnv = claudeChildEnv(process.env)
      probeEnv.TMPDIR = scratchDir
      probeEnv.TMP = scratchDir
      probeEnv.TEMP = scratchDir
      probeEnv.XDG_CACHE_HOME = scratchDir
      probeEnv.PYTHONDONTWRITEBYTECODE = '1'
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
      for (const candidate of [homeSentinel, tempSentinel, deniedRepoWrite]) {
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
    if (auth.failed || auth.exitCode !== 0 || !isClaudeMaxAuth(parsed)) {
      return {
        available: false,
        availability: 'unavailable',
        cliVersion: String(version.stdout || '').trim() || undefined,
        reason: 'Claude is installed, but the cockpit requires a first-party Claude Max login. Run `claude auth login`, then check again; API-token billing is disabled.',
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

function resolveProfile(request: { model?: string; reasoningLevel?: string }): ResolvedProviderProfile {
  const model = request.model || DEFAULT_MODEL
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
  await assertClaudeMaxAuth(env)
  await assertClaudeSandboxRuntime()
  if (!context.writablePaths?.length) throw new Error('Tracked Claude launch has no exact writable output scope.')
  const mirror = createClaudeMirrorWorkspace(context.cwd)
  env.TMPDIR = mirror.scratch
  env.TMP = mirror.scratch
  env.TEMP = mirror.scratch
  env.XDG_CACHE_HOME = mirror.scratch
  env.PYTHONDONTWRITEBYTECODE = '1'
  const binary = resolvedClaudeBinary(env)
  const binaryInfo = fs.statSync(binary, { bigint: true })
  const binaryIdentity = [binaryInfo.dev, binaryInfo.ino, binaryInfo.mode, binaryInfo.size,
    binaryInfo.mtimeNs, binaryInfo.ctimeNs].join(':')
  const settings = JSON.stringify(claudeSandboxSettings(context, mirror.cwd, binary, mirror.scratch))
  const args: string[] = ['--print', context.prompt, '--output-format', 'stream-json', '--verbose']
  args.push(
    '--permission-mode', 'dontAsk',
    '--tools', 'Read,Glob,Grep,Write,Edit,Bash,WebSearch,WebFetch,Task',
    // No user/project/local settings are loaded. Their arrays merge rather than replace and could widen
    // sandbox writes or Unix sockets; the canonical project commands/agents remain visible in the mirror.
    '--setting-sources', '',
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
    return value.message.content
      .filter((block: any) => block?.type === 'tool_use' && typeof block.name === 'string')
      .map((block: any) => ({ type: 'tool-use' as const, tool: block.name, toolUseId: typeof block.id === 'string' ? block.id : undefined, input: block.input }))
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
    defaultModel: DEFAULT_MODEL,
    reasoningLevels: ['default'],
    models: [
      { id: 'sonnet', label: 'Sonnet' },
      { id: 'opus', label: 'Opus' },
      { id: 'haiku', label: 'Haiku' },
    ],
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
