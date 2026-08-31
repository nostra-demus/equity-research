process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import net from 'node:net'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  assertCodexCapabilities,
  assertFreshCodexCatalogueReceipt,
  assertCodexPromptInput,
  assertCodexPythonRuntime,
  assertChatGptLogin,
  assertCodexCredentialSandboxBoundary,
  assertRequiredCodexModels,
  buildCodexLaunchSpec,
  classifyCodexExit,
  clearCodexCatalogueReceiptForRefresh,
  codexAvailabilityFromError,
  codexChildEnv,
  codexSandboxConfig,
  CODEX_COCKPIT_PERMISSION_PROFILE,
  CODEX_LAUNCH_PROOF_MAX_AGE_MS,
  CODEX_LAUNCH_PROOF_REPLAY_TTL_MS,
  CODEX_NEGATIVE_CACHE_TTL_MS,
  CODEX_STALE_AUTH_LEASE_AGE_MS,
  createCodexProbeCoordinator,
  createIsolatedCodexProbeHome,
  codexProviderAdapter,
  normalizeCodexRateLimits,
  pinCodexExecutable,
  parseCodexCatalog,
  parseCodexStreamLine,
  queryCodexRateLimits,
  resolveCodexBin,
  sweepStaleCodexProbeHomes,
} from '../src/providers/codex'
import { PROVIDER_NEUTRAL_RUN_ENV_KEYS, type ProviderLaunchContext } from '../src/providers/types'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '../../..')

const codexBinHome = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-codex-bin-home-'))
try {
  const installed = path.join(codexBinHome, '.local', 'bin', 'codex')
  fs.mkdirSync(path.dirname(installed), { recursive: true })
  fs.writeFileSync(installed, '#!/bin/sh\nexit 0\n', { mode: 0o755 })
  assert.equal(resolveCodexBin({ HOME: codexBinHome }), fs.realpathSync(installed),
    'the user-installed CLI wins over the potentially architecture-incompatible desktop bundle')
  assert.equal(resolveCodexBin({ CODEX_BIN: '/explicit/codex', HOME: codexBinHome }), '/explicit/codex',
    'an explicit operator override remains authoritative')
  fs.rmSync(installed)
  fs.mkdirSync(installed)
  assert.notEqual(resolveCodexBin({ HOME: codexBinHome }), installed,
    'an interrupted install directory is skipped in favor of the next usable CLI candidate')
} finally { fs.rmSync(codexBinHome, { recursive: true, force: true }) }

async function createTestPublicationTransport(
  template = path.join(os.homedir(), '.nostra-publication-test-'),
) {
  const root = fs.mkdtempSync(template)
  fs.chmodSync(root, 0o700)
  const socketPath = path.join(root, 'p.sock')
  const server = net.createServer()
  await new Promise<void>((resolve, reject) => {
    server.once('error', reject)
    server.listen(socketPath, () => resolve())
  })
  fs.chmodSync(socketPath, 0o600)
  const token = '12345678-1234-4234-8234-123456789abc'
  return {
    root,
    socketPath,
    token,
    env: {
      NOSTRA_PUBLICATION_ENDPOINT: 'http://localhost/publication',
      NOSTRA_PUBLICATION_SOCKET: socketPath,
      NOSTRA_PUBLICATION_TOKEN: token,
    },
    async close() {
      await new Promise<void>((resolve) => server.close(() => resolve()))
      fs.rmSync(root, { recursive: true, force: true })
    },
  }
}

assert.deepEqual(codexProviderAdapter.resolveProfile({}), {
  provider: 'codex', profileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh', model: 'gpt-5.6-sol', reasoningLevel: 'max',
  executionProfile: {
    key: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh', parentModel: 'gpt-5.6-sol', parentReasoning: 'max',
    specialistModel: 'gpt-5.6-terra', specialistReasoning: 'xhigh',
  },
})
assert.deepEqual(codexProviderAdapter.resolveProfile({
  profileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-sol:max',
  model: 'gpt-5.6-sol',
  reasoningLevel: 'max',
}), {
  provider: 'codex', profileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-sol:max', model: 'gpt-5.6-sol', reasoningLevel: 'max',
  executionProfile: {
    key: 'codex|gpt-5.6-sol:max|gpt-5.6-sol:max', parentModel: 'gpt-5.6-sol', parentReasoning: 'max',
    specialistModel: 'gpt-5.6-sol', specialistReasoning: 'max',
  },
})
assert.equal(codexProviderAdapter.profile.defaultProfileKey, 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh')
assert.deepEqual(codexProviderAdapter.profile.profiles.map((profile) => profile.key), [
  'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
  'codex|gpt-5.6-sol:max|gpt-5.6-sol:max',
])
assert.throws(
  () => codexProviderAdapter.resolveProfile({ profileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-sol:max', model: 'terra' }),
  /disagree/,
)
assert.throws(() => codexProviderAdapter.resolveProfile({ model: 'terra' }), /pinned to gpt-5.6-sol/)
assert.throws(() => codexProviderAdapter.resolveProfile({ model: 'sonnet' }), /Unsupported Codex parent model/)
assert.throws(
  () => codexProviderAdapter.resolveProfile({ model: 'gpt-5.6-sol', reasoningLevel: 'xhigh' }),
  /pinned to reasoning 'max'/,
)

const scrubbed = codexChildEnv({
  PATH: '/bin',
  OPENAI_API_KEY: 'must-not-leak',
  CODEX_API_KEY: 'must-not-leak',
  OPENAI_BASE_URL: 'https://untrusted.invalid',
  CODEX_ACCESS_TOKEN: 'must-not-leak',
  OPENAI_IDENTITY_TOKEN_FILE: '/tmp/must-not-leak',
  CODEX_HOME: '/tmp/codex-auth-home',
  NOSTRA_PROVENANCE_MANIFEST: '/tmp/provenance.json',
  NOSTRA_PUBLICATION_ENDPOINT: 'http://localhost/publication',
  NOSTRA_PUBLICATION_SOCKET: '/Users/example/.nostra-publication-fixture/p.sock',
  NOSTRA_PUBLICATION_TOKEN: '12345678-1234-4234-8234-123456789abc',
  NOSTRA_DEFER_MODULE_MEMO: '1',
  NOSTRA_EXACT_MODULE_RESUME: '1',
  NOSTRA_EXACT_MODULE_INPUTS: '["decision_record.json"]',
  NOSTRA_EXACT_MODULE_RUN_ROOT: 'analyses/AAPL_2026-08-26',
  NOSTRA_EXACT_MODULE_NAME: 'valuation',
  NOSTRA_EXACT_MODULE_WRITABLE_ORBS: 'valuation/01_price-and-capital-structure.md',
  NOSTRA_EXACT_MODULE_SYNTHESIS_ORBS: 'valuation/99_valuation-synthesis.md',
  NOSTRA_MEMORY_MODE: 'shadow',
  NOSTRA_PARITY_CANARY_CONTINUATION: '1',
  NOSTRA_UNRELATED_SECRET: 'must-not-leak',
  GH_TOKEN: 'must-not-leak',
  GOOGLE_DRIVE_OAUTH_TOKEN: 'must-not-leak',
  SMTP_PASSWORD: 'must-not-leak',
  ANTHROPIC_API_KEY: 'must-not-leak',
  GITHUB_ACTIONS: 'must-not-leak',
})
assert.equal(scrubbed.PATH?.split(path.delimiter)[0], path.dirname(process.execPath),
  'the scrubbed launchd child PATH starts with the exact Node runtime directory')
assert.equal(scrubbed.PATH?.split(path.delimiter).includes('/bin'), true,
  'the source PATH remains available after the pinned runtime directory')

const testPythonRuntime = assertCodexPythonRuntime(codexChildEnv(process.env))
const pythonPathFixture = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-codex-python-path-'))
try {
  const pythonToolDir = path.join(pythonPathFixture, 'python@3.12', 'libexec', 'bin')
  fs.mkdirSync(pythonToolDir, { recursive: true })
  fs.symlinkSync(testPythonRuntime.executable, path.join(pythonToolDir, 'python3'))
  const withVersionedPython = codexChildEnv({ PATH: '/usr/bin:/bin' }, { pythonToolDirs: [pythonToolDir] })
  assert.equal(withVersionedPython.PATH?.split(path.delimiter)[1], pythonToolDir,
    'an installed versioned Homebrew Python wins over the older launchd/system python')
  const pinnedRuntime = assertCodexPythonRuntime(withVersionedPython)
  assert.equal(pinnedRuntime.executable, testPythonRuntime.executable,
    'the launch preflight accepts an executable supported runtime from the isolated child PATH')
  fs.unlinkSync(path.join(pythonToolDir, 'python3'))
  fs.writeFileSync(path.join(pythonToolDir, 'python3'), '#!/bin/sh\nexit 0\n', { mode: 0o644 })
  const withoutBrokenPython = codexChildEnv({ PATH: '/usr/bin:/bin' }, { pythonToolDirs: [pythonToolDir] })
  assert.equal(withoutBrokenPython.PATH?.split(path.delimiter).includes(pythonToolDir), false,
    'a non-executable Python candidate never enters model-visible PATH')
  assert.throws(() => assertCodexPythonRuntime({ PATH: pythonToolDir }), /requires an executable Python 3\.10\+/,
    'the launch fails closed before inference when no supported Python can execute')
  fs.writeFileSync(path.join(pythonToolDir, 'python3'), '#!/bin/sh\nprintf "[]"\n', { mode: 0o755 })
  fs.chmodSync(path.join(pythonToolDir, 'python3'), 0o755)
  const malformedProofPython = codexChildEnv(
    { PATH: '/usr/bin:/bin' }, { pythonToolDirs: [pythonToolDir] },
  )
  assert.throws(
    () => assertCodexPythonRuntime(malformedProofPython),
    /requires an executable Python 3\.10\+/,
    'non-object runtime proof JSON fails closed with the provider error instead of throwing on properties',
  )
} finally { fs.rmSync(pythonPathFixture, { recursive: true, force: true }) }
assert.equal(scrubbed.OPENAI_API_KEY, undefined)
assert.equal(scrubbed.CODEX_API_KEY, undefined)
assert.equal(scrubbed.OPENAI_BASE_URL, undefined)
assert.equal(scrubbed.CODEX_ACCESS_TOKEN, undefined)
assert.equal(scrubbed.OPENAI_IDENTITY_TOKEN_FILE, undefined)
assert.equal(scrubbed.CODEX_HOME, '/tmp/codex-auth-home', 'saved ChatGPT auth location is available only to create a probe lease')
assert.equal(scrubbed.NOSTRA_COCKPIT_RUN, '1')
assert.equal(scrubbed.NOSTRA_PROVENANCE_MANIFEST, undefined, 'model-authored provenance paths are never release authority')
assert.equal(scrubbed.NOSTRA_PUBLICATION_ENDPOINT, 'http://localhost/publication')
assert.equal(scrubbed.NOSTRA_PUBLICATION_SOCKET, '/Users/example/.nostra-publication-fixture/p.sock')
assert.equal(scrubbed.NOSTRA_PUBLICATION_TOKEN, '12345678-1234-4234-8234-123456789abc')
assert.equal(scrubbed.NOSTRA_PARITY_CANARY_CONTINUATION, '1')
assert.equal(scrubbed.NOSTRA_MEMORY_MODE, 'shadow')
assert.equal(scrubbed.NOSTRA_UNRELATED_SECRET, undefined)
for (const key of ['GH_TOKEN', 'GOOGLE_DRIVE_OAUTH_TOKEN', 'SMTP_PASSWORD', 'ANTHROPIC_API_KEY', 'GITHUB_ACTIONS']) {
  assert.equal(scrubbed[key], undefined, `${key} must not reach model-visible Bash`)
}
assert.deepEqual(Object.keys(scrubbed).sort(), [
  'CODEX_HOME', 'NO_COLOR', 'NOSTRA_COCKPIT_RUN', 'NOSTRA_PUBLICATION_ENDPOINT',
  'NOSTRA_PUBLICATION_SOCKET', 'NOSTRA_PUBLICATION_TOKEN', 'NOSTRA_DEFER_MODULE_MEMO',
  'NOSTRA_EXACT_MODULE_RESUME', 'NOSTRA_EXACT_MODULE_INPUTS', 'NOSTRA_EXACT_MODULE_RUN_ROOT',
  'NOSTRA_EXACT_MODULE_NAME', 'NOSTRA_EXACT_MODULE_WRITABLE_ORBS',
  'NOSTRA_EXACT_MODULE_SYNTHESIS_ORBS', 'NOSTRA_MEMORY_MODE',
  'NOSTRA_PARITY_CANARY_CONTINUATION', 'PATH',
].sort())

const npmShimFixture = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-codex-node-shim-'))
try {
  const shim = path.join(npmShimFixture, 'codex-shim')
  fs.writeFileSync(shim, '#!/usr/bin/env node\nprocess.stdout.write("codex-cli fixture\\n")\n', { mode: 0o755 })
  const output = execFileSync(shim, [], {
    encoding: 'utf8',
    env: codexChildEnv({ PATH: '/usr/bin:/bin' }),
  })
  assert.equal(output.trim(), 'codex-cli fixture',
    'an npm-style Codex shim resolves Node under the launchd-scrubbed child environment')
} finally { fs.rmSync(npmShimFixture, { recursive: true, force: true }) }

const sourceCodexHome = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-codex-source-home-'))
try {
  fs.writeFileSync(path.join(sourceCodexHome, 'auth.json'), '{"auth_mode":"chatgpt"}', { mode: 0o600 })
  fs.writeFileSync(path.join(sourceCodexHome, 'config.toml'), 'model_catalog_json = "/tmp/static.json"\n')
  fs.writeFileSync(path.join(sourceCodexHome, 'models_cache.json'), '{"models":[]}')
  const isolated = createIsolatedCodexProbeHome({ CODEX_HOME: sourceCodexHome })
  try {
    assert.equal(fs.readFileSync(path.join(isolated.home, 'auth.json'), 'utf8'), '{"auth_mode":"chatgpt"}')
    assert.equal(fs.existsSync(path.join(isolated.home, 'config.toml')), false, 'static config override must not enter catalogue probe')
    assert.equal(fs.existsSync(path.join(isolated.home, 'models_cache.json')), false, 'cached catalogue must not enter live probe')
    const installedCodex = [
      process.env.CODEX_BIN,
      path.join(os.homedir(), '.local', 'bin', 'codex'),
      '/opt/homebrew/bin/codex',
      '/usr/local/bin/codex',
      '/Applications/ChatGPT.app/Contents/Resources/codex',
    ].find((candidate): candidate is string => Boolean(candidate && fs.existsSync(candidate)))
    if (installedCodex) {
      await assertCodexCredentialSandboxBoundary({
        command: fs.realpathSync(installedCodex),
        env: codexChildEnv({ PATH: process.env.PATH, CODEX_HOME: isolated.home }, { pythonRuntime: testPythonRuntime }),
        leaseHome: isolated.home,
        sourceAuthPath: isolated.sourceAuthPath,
        pythonRuntime: testPythonRuntime,
      })
      assert.equal(fs.existsSync(path.join(isolated.home, 'config.toml')), false,
        'capability probing must remove its transient permission profile before sealing the lease')
      assert.equal(fs.existsSync(path.join(isolated.home, 'tmp')), false,
        'capability probing must remove parent-CLI helper symlinks before the strict lease snapshot')
      assert.equal(fs.existsSync(path.join(isolated.home, 'proxy')), false,
        'capability probing must remove transient network-proxy material before the strict lease snapshot')
      assert.equal(fs.readFileSync(path.join(sourceCodexHome, 'auth.json'), 'utf8'), '{"auth_mode":"chatgpt"}',
        'model-equivalent sandbox probing cannot read or mutate the original credential')
    }
  } finally { isolated.cleanup() }
} finally {
  fs.rmSync(sourceCodexHome, { recursive: true, force: true })
}

const hardLinkedAuthHome = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-codex-hardlink-auth-'))
try {
  const auth = path.join(hardLinkedAuthHome, 'auth.json')
  fs.writeFileSync(auth, '{"auth_mode":"chatgpt"}', { mode: 0o600 })
  fs.linkSync(auth, path.join(hardLinkedAuthHome, 'auth-alias'))
  assert.throws(() => createIsolatedCodexProbeHome({ CODEX_HOME: hardLinkedAuthHome }), /missing/,
    'a hard-link alias could bypass a path-scoped credential deny and must fail closed')
} finally { fs.rmSync(hardLinkedAuthHome, { recursive: true, force: true }) }

const sweepFixture = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-codex-sweeper-test-'))
const sweepSource = path.join(sweepFixture, 'source')
fs.mkdirSync(sweepSource)
fs.writeFileSync(path.join(sweepSource, 'auth.json'), '{"auth_mode":"chatgpt","token":"stale"}', { mode: 0o600 })
try {
  const stale = createIsolatedCodexProbeHome({ CODEX_HOME: sweepSource }, { now: () => 1_000, tmpRoot: sweepFixture })
  const staleHome = stale.home
  const swept = sweepStaleCodexProbeHomes({
    tmpRoot: sweepFixture,
    now: () => 1_000 + CODEX_STALE_AUTH_LEASE_AGE_MS + 1,
    isProcessAlive: () => false,
  })
  assert.equal(swept.credentialsRemoved, 1)
  assert.equal(fs.existsSync(path.join(staleHome, 'auth.json')), false,
    'startup hygiene removes only the credential from an old lease whose creator is gone')
  stale.cleanup()

  const live = createIsolatedCodexProbeHome({ CODEX_HOME: sweepSource }, { now: () => 2_000, tmpRoot: sweepFixture })
  const liveSweep = sweepStaleCodexProbeHomes({
    tmpRoot: sweepFixture,
    now: () => 2_000 + CODEX_STALE_AUTH_LEASE_AGE_MS + 1,
    isProcessAlive: () => true,
  })
  assert.equal(liveSweep.credentialsRemoved, 0)
  assert.equal(fs.existsSync(path.join(live.home, 'auth.json')), true, 'a live lease owner is never swept')
  live.cleanup()

  const aliased = createIsolatedCodexProbeHome({ CODEX_HOME: sweepSource }, { now: () => 3_000, tmpRoot: sweepFixture })
  fs.linkSync(path.join(aliased.home, 'auth.json'), path.join(aliased.home, 'auth-alias'))
  const aliasSweep = sweepStaleCodexProbeHomes({
    tmpRoot: sweepFixture,
    now: () => 3_000 + CODEX_STALE_AUTH_LEASE_AGE_MS + 1,
    isProcessAlive: () => false,
  })
  assert.equal(aliasSweep.credentialsRemoved, 0)
  assert.equal(fs.existsSync(path.join(aliased.home, 'auth.json')), true,
    'a raced or hard-linked credential is left untouched rather than following aliases')
  aliased.cleanup()

  const foreign = path.join(sweepFixture, 'nostra-codex-probe-Ab12Cd')
  fs.mkdirSync(foreign, { mode: 0o700 })
  fs.writeFileSync(path.join(foreign, 'auth.json'), 'foreign', { mode: 0o600 })
  sweepStaleCodexProbeHomes({
    tmpRoot: sweepFixture,
    now: () => Number.MAX_SAFE_INTEGER,
    isProcessAlive: () => false,
  })
  assert.equal(fs.readFileSync(path.join(foreign, 'auth.json'), 'utf8'), 'foreign',
    'a lookalike directory without the inode-bound ownership marker is never deleted')
} finally { fs.rmSync(sweepFixture, { recursive: true, force: true }) }

const configFixture = codexSandboxConfig({
  repoRoot: '/private/tmp/nostra-repo',
  dataRoot: '/private/tmp/nostra-data',
  scratchRoot: '/private/tmp/nostra-scratch',
  leaseAuthPath: '/private/tmp/nostra-lease/auth.json',
  sourceAuthPath: '/Users/example/.codex/auth.json',
  writablePaths: ['/private/tmp/nostra-repo/analyses/PROBE_run'],
  publicationSocketPath: '/Users/example/.nostra-publication-fixture/p.sock',
  protectedWritePaths: ['/private/tmp/nostra-repo/scripts', '/private/tmp/nostra-state'],
  protectedReadPaths: ['/private/tmp/nostra-state'],
})
assert.match(configFixture, /":minimal" = "read"/)
assert.match(configFixture, /"\/private\/tmp\/nostra-repo" = "read"/)
assert.match(configFixture, /"\/private\/tmp\/nostra-data" = "read"/)
assert.match(configFixture, /"\/private\/tmp\/nostra-repo\/analyses\/PROBE_run" = "write"/)
assert.doesNotMatch(configFixture, /filesystem\.":workspace_roots"/,
  'workspace/add-dir roots must not become broad write grants')
assert.match(configFixture, /"\/Users\/example\/\.codex" = "deny"/,
  'the entire mutable original Codex home is outside the model shell boundary')
assert.match(configFixture, /"\/private\/tmp\/nostra-repo\/scripts" = "read"/,
  'protected-write paths remain readable and override any overlapping output grant')
assert.match(configFixture, /"\/private\/tmp\/nostra-state" = "deny"/,
  'protected-read paths override an overlapping protected-write path')
assert.match(configFixture, /features\.network_proxy = true/)
assert.match(configFixture, /\[permissions\.nostra-cockpit\.network\]\nenabled = true\nmode = "limited"/)
assert.match(configFixture, /allow_local_binding = false/)
assert.match(configFixture, /dangerously_allow_all_unix_sockets = false/)
assert.match(configFixture, /\[permissions\.nostra-cockpit\.network\.domains\]\n\n/,
  'the model shell receives no TCP or public-domain allowlist')
assert.match(configFixture, /\[permissions\.nostra-cockpit\.network\.unix_sockets\]\n"\/Users\/example\/\.nostra-publication-fixture\/p\.sock" = "allow"/)
assert.doesNotMatch(configFixture, /sandbox_mode|workspace-write/,
  'legacy sandbox configuration must never override the named permission profile')

assert.doesNotThrow(() => assertChatGptLogin('Logged in using ChatGPT\n'))
assert.throws(() => assertChatGptLogin('Logged in using an API key'), /not authenticated with ChatGPT/)
const uncertainCatalogueError: any = new Error('Codex live model catalogue was empty.')
uncertainCatalogueError.code = 'CODEX_CATALOGUE_UNKNOWN'
assert.deepEqual(codexAvailabilityFromError(uncertainCatalogueError), {
  available: false, availability: 'unknown', reason: 'Codex live model catalogue was empty.',
})
assert.equal(codexAvailabilityFromError(new Error('Codex binary missing')).availability, 'unavailable')

function mockAuthLease(home: string) {
  let armed = false
  let consumed = false
  let cleaned = false
  return {
    home,
    seal() {},
    arm() {
      if (cleaned || armed) throw new Error('invalid mock lease arm')
      armed = true
    },
    assertValid() {
      if (!armed || consumed || cleaned) throw new Error('invalid mock auth lease')
    },
    consumeForSpawn() {
      if (!armed || consumed || cleaned) throw new Error('invalid mock auth lease')
      consumed = true
    },
    cleanup() { cleaned = true },
  }
}

function launchProbe(
  authHome: string,
  command = process.execPath,
  options: { now?: () => number; expiresAt?: number } = {},
) {
  const clock = options.now ?? Date.now
  const lease = createIsolatedCodexProbeHome({ CODEX_HOME: authHome }, { now: clock })
  const pinned = pinCodexExecutable(command, { PATH: process.env.PATH })
  lease.seal(pinned.command, pinned.identity)
  lease.arm(options.expiresAt ?? clock() + CODEX_LAUNCH_PROOF_MAX_AGE_MS)
  return {
    command: pinned.command,
    commandIdentity: pinned.identity,
    cliVersion: 'codex-cli test',
    models: [],
    pythonRuntime: testPythonRuntime,
    authLease: lease,
  }
}

let cacheNow = 1_000
let cacheProbeCalls = 0
let releaseDisplayProbe!: () => void
let releaseFirstLaunchProbe!: () => void
const displayProbeGate = new Promise<void>((resolve) => { releaseDisplayProbe = resolve })
const firstLaunchProbeGate = new Promise<void>((resolve) => { releaseFirstLaunchProbe = resolve })
const probeCoordinator = createCodexProbeCoordinator({
  now: () => cacheNow,
  probe: async (env, _root, options) => {
    cacheProbeCalls++
    if (cacheProbeCalls === 1) await displayProbeGate
    if (cacheProbeCalls === 2) await firstLaunchProbeGate
    return {
      command: env.CODEX_BIN || 'codex', commandIdentity: `fixture-command-${cacheProbeCalls}`,
      cliVersion: `codex-cli fixture-${cacheProbeCalls}`, models: [],
      ...(options?.retainAuthLease ? { authLease: mockAuthLease(`/tmp/fixture-lease-${cacheProbeCalls}`) } : {}),
    }
  },
})
const cacheEnv = { CODEX_BIN: '/missing/fixture-codex', PATH: '/bin', CODEX_HOME: '/missing/fixture-home' }
const proof1 = '11111111-1111-4111-8111-111111111111'
const proof2 = '22222222-2222-4222-8222-222222222222'
const proof3 = '33333333-3333-4333-8333-333333333333'
const pendingAvailability = await probeCoordinator.getAvailability(
  { refresh: false }, cacheEnv, repoRoot, 'codex|fixture-profile',
)
assert.deepEqual(pendingAvailability, {
  available: false,
  availability: 'unknown',
  reason: 'Codex availability is being verified from the live ChatGPT account catalogue.',
})
assert.equal(cacheProbeCalls, 1, 'a nonblocking GET starts one background proof')
const launchAssert = probeCoordinator.getAvailability(
  { refresh: true, proofId: proof1 }, cacheEnv, repoRoot, 'codex|fixture-profile',
)
const immediateLaunch = probeCoordinator.probeForLaunch(cacheEnv, repoRoot, 'codex|fixture-profile', proof1)
assert.equal(cacheProbeCalls, 2, 'a display probe is never execution authority; the launch owns a fresh proof')
releaseFirstLaunchProbe()
assert.equal((await launchAssert).available, true)
const firstLaunch = await immediateLaunch
assert.equal(firstLaunch.cliVersion, 'codex-cli fixture-2')
firstLaunch.authLease?.cleanup()
assert.equal(cacheProbeCalls, 2, 'assert and build dedupe the same minted launch proof')
await assert.rejects(
  () => probeCoordinator.probeForLaunch(cacheEnv, repoRoot, 'codex|fixture-profile', proof1),
  /already consumed/,
  'one launch proof cannot authorize a second spawn',
)
releaseDisplayProbe()
await new Promise((resolve) => setImmediate(resolve))

assert.equal((await probeCoordinator.getAvailability(
  { refresh: true, proofId: proof2 }, cacheEnv, repoRoot, 'codex|fixture-profile',
)).available, true)
const secondLaunch = await probeCoordinator.probeForLaunch(cacheEnv, repoRoot, 'codex|fixture-profile', proof2)
assert.equal(secondLaunch.cliVersion, 'codex-cli fixture-3')
secondLaunch.authLease?.cleanup()
assert.equal((await probeCoordinator.getAvailability(
  { refresh: true, proofId: proof3 }, cacheEnv, repoRoot, 'codex|fixture-profile',
)).available, true)
const thirdLaunch = await probeCoordinator.probeForLaunch(cacheEnv, repoRoot, 'codex|fixture-profile', proof3)
assert.equal(thirdLaunch.cliVersion, 'codex-cli fixture-4')
thirdLaunch.authLease?.cleanup()
assert.equal(cacheProbeCalls, 4, 'two sequential launches always perform two independent live refreshes')

const staleProof = '44444444-4444-4444-8444-444444444444'
assert.equal((await probeCoordinator.getAvailability(
  { refresh: true, proofId: staleProof }, cacheEnv, repoRoot, 'codex|fixture-profile',
)).available, true)
cacheNow += CODEX_LAUNCH_PROOF_MAX_AGE_MS + 1
const refreshedLaunch = await probeCoordinator.probeForLaunch(cacheEnv, repoRoot, 'codex|fixture-profile', staleProof)
assert.equal(refreshedLaunch.cliVersion, 'codex-cli fixture-6',
  'an expired same-launch proof is refreshed before spawn, never reused stale')
refreshedLaunch.authLease?.cleanup()
assert.equal(cacheProbeCalls, 6)

const changedRuntimeProof = '55555555-5555-4555-8555-555555555555'
assert.equal((await probeCoordinator.getAvailability(
  { refresh: true, proofId: changedRuntimeProof }, cacheEnv, repoRoot, 'codex|fixture-profile',
)).available, true)
await assert.rejects(
  () => probeCoordinator.probeForLaunch(
    { ...cacheEnv, CODEX_BIN: '/different/fixture-codex' }, repoRoot, 'codex|fixture-profile', changedRuntimeProof,
  ),
  /runtime\/profile changed/,
)
cacheNow += CODEX_LAUNCH_PROOF_REPLAY_TTL_MS + 1
assert.equal((await probeCoordinator.getAvailability(
  { refresh: true, proofId: proof1 }, cacheEnv, repoRoot, 'codex|fixture-profile',
)).available, true)
const replayWindowLaunch = await probeCoordinator.probeForLaunch(cacheEnv, repoRoot, 'codex|fixture-profile', proof1)
assert.match(replayWindowLaunch.cliVersion, /^codex-cli fixture-/,
  'consumed proof tombstones are pruned after the bounded replay window')
replayWindowLaunch.authLease?.cleanup()

let failedProbeCalls = 0
const failedProbeCoordinator = createCodexProbeCoordinator({
  probe: async () => {
    failedProbeCalls++
    const error: any = new Error('live catalogue unavailable')
    error.code = 'CODEX_CATALOGUE_UNKNOWN'
    throw error
  },
})
assert.equal((await failedProbeCoordinator.getAvailability(
  { refresh: true }, cacheEnv, repoRoot, 'codex|fixture-profile',
)).availability, 'unknown')
assert.equal((await failedProbeCoordinator.getAvailability(
  { refresh: true }, cacheEnv, repoRoot, 'codex|fixture-profile',
)).availability, 'unknown')
assert.equal(failedProbeCalls, 2, 'an explicit retry never green-lights or indefinitely caches a failed probe')

let negativeNow = 10_000
let passiveFailureCalls = 0
const visibleFailureCoordinator = createCodexProbeCoordinator({
  now: () => negativeNow,
  probe: async () => {
    passiveFailureCalls++
    const error: any = new Error('live catalogue unavailable')
    error.code = 'CODEX_CATALOGUE_UNKNOWN'
    throw error
  },
})
assert.equal((await visibleFailureCoordinator.getAvailability(
  { refresh: true }, cacheEnv, repoRoot, 'codex|visible-failure',
)).availability, 'unknown')
assert.equal(passiveFailureCalls, 1)
negativeNow += CODEX_NEGATIVE_CACHE_TTL_MS - 1
assert.equal((await visibleFailureCoordinator.getAvailability(
  { refresh: false }, cacheEnv, repoRoot, 'codex|visible-failure',
)).availability, 'unknown')
assert.equal(passiveFailureCalls, 1,
  'passive status retains the last actionable failure instead of returning to an endless probe spinner')
negativeNow += 2
await visibleFailureCoordinator.getAvailability(
  { refresh: false }, cacheEnv, repoRoot, 'codex|visible-failure',
)
await new Promise((resolve) => setImmediate(resolve))
assert.equal(passiveFailureCalls, 2, 'an expired display failure is retried without becoming launch authority')

const catalogue = JSON.stringify({
  models: [
    {
      slug: 'gpt-5.6-sol', visibility: 'list', supported_in_api: true,
      supported_reasoning_levels: [{ effort: 'low' }, { effort: 'max' }],
      multi_agent_version: 'v2', supports_search_tool: true, supports_parallel_tool_calls: true,
    },
    {
      slug: 'gpt-5.6-terra', visibility: 'list', supported_in_api: true,
      supported_reasoning_levels: [{ effort: 'medium' }, { effort: 'xhigh' }],
      multi_agent_version: 'v2', supports_search_tool: true, supports_parallel_tool_calls: true,
    },
  ],
})
assert.doesNotThrow(() => assertRequiredCodexModels(parseCodexCatalog(catalogue)))
assert.throws(() => parseCodexCatalog('{'), /not valid JSON/)
assert.throws(() => parseCodexCatalog('{"models":[]}'), /empty or malformed/)
assert.throws(
  () => parseCodexCatalog(`Warning: using cached bundled catalogue\n${catalogue}`),
  /warning, auth failure, or cached\/bundled fallback/,
)
assert.throws(
  () => parseCodexCatalog(`Falling back to bundled models after authentication failed\n${catalogue}`),
  /warning, auth failure, or cached\/bundled fallback/,
)
assert.throws(
  () => parseCodexCatalog(catalogue, 'Warning: authentication failed; falling back to cache'),
  /emitted a diagnostic/,
)
assert.throws(
  () => parseCodexCatalog(JSON.stringify({ ...JSON.parse(catalogue), warning: 'fallback to bundled cache' })),
  /unknown metadata/,
)
assert.throws(
  () => assertRequiredCodexModels(parseCodexCatalog(JSON.stringify({ models: [JSON.parse(catalogue).models[0]] }))),
  /exactly one gpt-5.6-terra/,
)
for (const capability of ['multi_agent_version', 'supports_search_tool', 'supports_parallel_tool_calls']) {
  const broken = JSON.parse(catalogue)
  delete broken.models[0][capability]
  assert.throws(() => assertRequiredCodexModels(parseCodexCatalog(JSON.stringify(broken))), /capability/)
}
const codex0149Catalogue = JSON.parse(catalogue)
for (const model of codex0149Catalogue.models) delete model.supports_parallel_tool_calls
assert.doesNotThrow(() => assertRequiredCodexModels(
  parseCodexCatalog(JSON.stringify(codex0149Catalogue)),
  'codex-cli 0.149.0',
), 'the exact 0.149.0 catalogue omission is accepted after every remaining live capability gate')
assert.throws(() => assertRequiredCodexModels(
  parseCodexCatalog(JSON.stringify(codex0149Catalogue)),
  'codex-cli 0.149.1',
), /parallel-tool capability/, 'the omission does not silently expand to later CLI versions')
const codex0149False = JSON.parse(catalogue)
codex0149False.models[0].supports_parallel_tool_calls = false
assert.throws(() => assertRequiredCodexModels(
  parseCodexCatalog(JSON.stringify(codex0149False)),
  'codex-cli 0.149.0',
), /parallel-tool capability/, 'an explicit negative capability never passes the version exception')
const duplicate = JSON.parse(catalogue)
duplicate.models.push({ ...duplicate.models[0] })
assert.throws(() => assertRequiredCodexModels(parseCodexCatalog(JSON.stringify(duplicate))), /exactly one gpt-5.6-sol/)

const receiptHome = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-codex-receipt-'))
try {
  const models = parseCodexCatalog(catalogue)
  const now = Date.now()
  fs.writeFileSync(path.join(receiptHome, 'models_cache.json'), JSON.stringify({
    fetched_at: new Date(now).toISOString(), etag: 'W/"account-catalogue"', client_version: 'test', models,
  }))
  assert.doesNotThrow(() => assertFreshCodexCatalogueReceipt(receiptHome, models, now - 1_000, now))
  const stale = { fetched_at: new Date(now - 60_000).toISOString(), etag: 'etag', models }
  fs.writeFileSync(path.join(receiptHome, 'models_cache.json'), JSON.stringify(stale))
  assert.throws(() => assertFreshCodexCatalogueReceipt(receiptHome, models, now - 1_000, now), /fresh non-bundled refresh/)
  fs.writeFileSync(path.join(receiptHome, 'models_cache.json'), JSON.stringify({ ...stale, fetched_at: new Date(now).toISOString(), etag: '' }))
  assert.throws(() => assertFreshCodexCatalogueReceipt(receiptHome, models, now - 1_000, now), /account ETag/)
} finally { fs.rmSync(receiptHome, { recursive: true, force: true }) }

const refreshHome = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-codex-refresh-'))
try {
  const receiptPath = path.join(refreshHome, 'models_cache.json')
  assert.doesNotThrow(() => clearCodexCatalogueReceiptForRefresh(refreshHome),
    'a lease with no probe-created receipt is already ready for a live refresh')
  fs.writeFileSync(receiptPath, JSON.stringify({ fetched_at: new Date(0).toISOString() }))
  assert.doesNotThrow(() => clearCodexCatalogueReceiptForRefresh(refreshHome))
  assert.equal(fs.existsSync(receiptPath), false,
    'the exact regular probe-created receipt is cleared before the live account refresh')

  const outsideReceipt = path.join(refreshHome, 'outside-receipt.json')
  fs.writeFileSync(outsideReceipt, 'do not follow')
  fs.symlinkSync(outsideReceipt, receiptPath)
  assert.throws(() => clearCodexCatalogueReceiptForRefresh(refreshHome), /not a regular file/,
    'a substituted receipt symlink fails closed')
  assert.equal(fs.readFileSync(outsideReceipt, 'utf8'), 'do not follow')
} finally { fs.rmSync(refreshHome, { recursive: true, force: true }) }

const promptInput = JSON.stringify([{ type: 'message', content: [{ type: 'input_text', text: 'The twins must match. NOSTRA_RUNTIME_PROMPT_TAIL_PROBE' }] }])
assert.doesNotThrow(() => assertCodexPromptInput(promptInput))
assert.throws(() => assertCodexPromptInput('[]'), /empty or malformed/)
assert.throws(() => assertCodexPromptInput(promptInput.replace('The twins must match.', 'tail missing')), /tail sentinel/)

const globalHelp = `
  --strict-config
  --add-dir <DIR>
  --search
  --config <key=value>
`
const execHelp = '--json\nCommands: resume'
const modelsHelp = '--bundled\n  Skip refresh and dump only the bundled catalog shipped with this binary'
const sandboxHelp = '--permission-profile <PERMISSION_PROFILE>'
assert.doesNotThrow(() => assertCodexCapabilities(globalHelp, execHelp, modelsHelp, sandboxHelp))
assert.throws(
  () => assertCodexCapabilities(globalHelp, execHelp, modelsHelp, 'sandbox without named profiles'),
  /cannot select.*credential-deny permission profile/,
)
assert.throws(() => assertCodexCapabilities(globalHelp, execHelp.replace('--json', ''), modelsHelp, sandboxHelp), /missing required flag/)
assert.throws(
  () => assertCodexCapabilities(globalHelp, execHelp, '--bundled\nUse bundled data', sandboxHelp),
  /does not prove.*live model-catalogue refresh/,
)

const dataRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-codex-data-'))
const writableOutputRoot = path.join(dataRoot, 'PROBE_run')
fs.mkdirSync(writableOutputRoot)
const launchAuthHome = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-codex-launch-auth-'))
const protectedStateRoot = fs.mkdtempSync(path.join(os.homedir(), '.nostra-codex-state-test-'))
const publicationCapabilityRoot = fs.mkdtempSync(path.join(os.homedir(), '.nostra-codex-ipc-test-'))
const frozenCapabilityRoot = fs.mkdtempSync(path.join(publicationCapabilityRoot, 'frozen-evidence-'))
const publicationSocketRoot = fs.mkdtempSync(path.join(publicationCapabilityRoot, 'r-'))
fs.chmodSync(publicationSocketRoot, 0o700)
const publicationSocketPath = path.join(publicationSocketRoot, 'p.sock')
let publicationSocketServer = net.createServer()
await new Promise<void>((resolve, reject) => {
  publicationSocketServer.once('error', reject)
  publicationSocketServer.listen(publicationSocketPath, () => resolve())
})
fs.chmodSync(publicationSocketPath, 0o600)
const publicationToken = '12345678-1234-4234-8234-123456789abc'
fs.writeFileSync(path.join(launchAuthHome, 'auth.json'), '{"auth_mode":"chatgpt","token":"verified-snapshot"}', { mode: 0o600 })
fs.writeFileSync(path.join(protectedStateRoot, 'supervisor-secret'), 'must-never-reach-child\n', { mode: 0o600 })
const gitPointer = path.join(repoRoot, '.git')
const absoluteGitDir = execFileSync('git', ['rev-parse', '--absolute-git-dir'], { cwd: repoRoot, encoding: 'utf8' }).trim()
const commonGitDirRaw = execFileSync('git', ['rev-parse', '--git-common-dir'], { cwd: repoRoot, encoding: 'utf8' }).trim()
const commonGitDir = path.resolve(repoRoot, commonGitDirRaw)
const commodityDecisions = path.join(repoRoot, 'commodity', 'PROBE', 'decisions')
const protectedWritePaths = [
  path.join(repoRoot, 'scripts'), gitPointer, absoluteGitDir, commonGitDir, commodityDecisions, protectedStateRoot,
]
const protectedReadPaths = [protectedStateRoot]
let baseSpec: ReturnType<typeof buildCodexLaunchSpec> | undefined
let resumeSpec: ReturnType<typeof buildCodexLaunchSpec> | undefined
let solOnlySpec: ReturnType<typeof buildCodexLaunchSpec> | undefined
let frozenCapabilitySpec: ReturnType<typeof buildCodexLaunchSpec> | undefined
try {
  const exactRunPolicyEnv = Object.fromEntries(
    PROVIDER_NEUTRAL_RUN_ENV_KEYS.map((key, index) => [key, `supervisor-exact-${index}`]),
  )
  exactRunPolicyEnv.NOSTRA_PARITY_CANARY_CONTINUATION = '1'
  exactRunPolicyEnv.NOSTRA_MEMORY_MODE = 'shadow'
  const context: ProviderLaunchContext = {
    prompt: '/research:full AAPL',
    kind: 'full',
    profile: codexProviderAdapter.resolveProfile({ model: 'gpt-5.6-sol' }),
    cwd: repoRoot,
    additionalWritableDataRoot: dataRoot,
    writablePaths: [writableOutputRoot],
    protectedWritePaths,
    protectedReadPaths,
    env: {
      PATH: '/bin', OPENAI_API_KEY: 'must-not-leak', CODEX_HOME: launchAuthHome,
      NOSTRA_PROVENANCE_MANIFEST: '/tmp/provenance.json',
      NOSTRA_PUBLICATION_ENDPOINT: 'http://localhost/publication',
      NOSTRA_PUBLICATION_SOCKET: publicationSocketPath,
      NOSTRA_PUBLICATION_TOKEN: publicationToken,
      NOSTRA_PARITY_CANARY_CONTINUATION: '1',
      NOSTRA_MEMORY_MODE: 'shadow',
      ...exactRunPolicyEnv,
      NOSTRA_UNREVIEWED_STALE_CONTROL: 'must-not-pass',
    },
    guard: { maxTurns: 2_000, budgetUsd: 100 },
    publicationSocketPath,
  }
  const probe = launchProbe(launchAuthHome)
  const spec = baseSpec = buildCodexLaunchSpec(context, probe)
  assert.equal(spec.command, fs.realpathSync(process.execPath))
  assert.equal(spec.cwd, repoRoot)
  assert.equal(spec.env.OPENAI_API_KEY, undefined)
  assert.equal(spec.env.NOSTRA_COCKPIT_RUN, '1')
  for (const key of PROVIDER_NEUTRAL_RUN_ENV_KEYS) {
    assert.equal(spec.env[key], exactRunPolicyEnv[key], `${key} reaches the tracked Codex parent exactly`)
    assert.ok(spec.args.includes(`shell_environment_policy.set.${key}=${JSON.stringify(exactRunPolicyEnv[key])}`),
      `${key} reaches model-issued Codex Bash exactly`)
  }
  assert.equal(spec.env.NOSTRA_UNREVIEWED_STALE_CONTROL, undefined,
    'unreviewed stale NOSTRA values are absent from the tracked parent')
  assert.ok(!spec.args.some((arg) => arg.includes('NOSTRA_UNREVIEWED_STALE_CONTROL')),
    'unreviewed stale NOSTRA values are absent from model-issued Bash')
  assert.equal(spec.env.CODEX_HOME, probe.authLease.home,
    'spawn must use the exact isolated credential snapshot verified by the launch proof')
  assert.notEqual(spec.env.CODEX_HOME, launchAuthHome, 'spawn must never reread the mutable original CODEX_HOME')
  assert.equal(fs.readFileSync(path.join(String(spec.env.CODEX_HOME), 'auth.json'), 'utf8'),
    '{"auth_mode":"chatgpt","token":"verified-snapshot"}')
  assert.equal(spec.env.TMPDIR, path.join(probe.authLease.home, 'sandbox-tmp'))
  assert.equal(spec.env.TMP, spec.env.TMPDIR)
  assert.equal(spec.env.TEMP, spec.env.TMPDIR)
  assert.doesNotMatch(JSON.stringify(spec.args), /verified-snapshot|CODEX_HOME/,
    'credential bytes and lease location must never enter model-visible CLI arguments')
  assert.ok(spec.args.includes('--json'))
  const solOnlyProbe = launchProbe(launchAuthHome)
  solOnlySpec = buildCodexLaunchSpec({
    ...context,
    profile: codexProviderAdapter.resolveProfile({ profileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-sol:max' }),
  }, solOnlyProbe)
  assert.ok(solOnlySpec.args.includes('agents.default_subagent_model="gpt-5.6-sol"'))
  assert.ok(solOnlySpec.args.includes('agents.default_subagent_reasoning_effort="max"'))
  assert.match(solOnlySpec.input || '', /use claude-sol-specialist-loader/)
  assert.ok(!spec.args.includes('--approve-for-me'), 'legacy workspace-write shorthand would override the named permission profile')
  assert.ok(!spec.args.includes('--sandbox'), 'legacy sandbox flags would override the named permission profile')
  assert.ok(!spec.args.includes('--ignore-user-config'), 'the isolated sanitized config is the credential boundary and must be loaded')
  assert.deepEqual(spec.args.slice(spec.args.indexOf('--add-dir'), spec.args.indexOf('--add-dir') + 2), ['--add-dir', fs.realpathSync(dataRoot)])
  assert.ok(spec.args.some((arg, index) => arg === '--add-dir' && spec.args[index + 1] === spec.env.TMPDIR),
    'the dedicated TMPDIR must be an admitted writable workspace root')
  assert.ok(spec.args.includes('--search'))

  const frozenCapabilityProbe = launchProbe(launchAuthHome)
  frozenCapabilitySpec = buildCodexLaunchSpec({
    ...context,
    protectedWritePaths: [...protectedWritePaths, frozenCapabilityRoot],
    readOnlyCapabilityPaths: [frozenCapabilityRoot],
  }, frozenCapabilityProbe)
  assert.deepEqual(
    frozenCapabilitySpec.args.slice(
      frozenCapabilitySpec.args.indexOf('--add-dir'), frozenCapabilitySpec.args.indexOf('--add-dir') + 2,
    ),
    ['--add-dir', fs.realpathSync(frozenCapabilityRoot)],
    'a frozen Codex child receives the isolated capability—not live data—as its model data root',
  )
  const frozenConfig = fs.readFileSync(path.join(frozenCapabilityProbe.authLease.home, 'config.toml'), 'utf8')
  assert.ok(frozenConfig.includes(`${JSON.stringify(fs.realpathSync(frozenCapabilityRoot))} = "read"`),
    'the capability is read-only in the installed Codex sandbox policy')
  assert.ok(spec.args.indexOf('--search') < spec.args.indexOf('exec'), '--search is a global flag in the installed CLI')
  assert.ok(spec.args.indexOf('--json') > spec.args.indexOf('exec'), '--json belongs to the exec subcommand')
  assert.ok(spec.args.includes('project_doc_max_bytes=131072'))
  assert.ok(spec.args.includes('model_reasoning_effort="max"'))
  assert.ok(spec.args.includes('model_provider="openai"'))
  assert.ok(spec.args.includes('agents.enabled=true'))
  assert.ok(spec.args.includes('agents.default_subagent_model="gpt-5.6-terra"'))
  assert.ok(spec.args.includes('agents.default_subagent_reasoning_effort="xhigh"'))
  assert.ok(spec.args.includes('shell_environment_policy.inherit="none"'), 'model-issued Bash inherits no parent/auth environment')
  assert.ok(!spec.args.some((arg) => arg.startsWith('shell_environment_policy.set.CODEX_HOME=')))
  assert.ok(!spec.args.some((arg) => arg.startsWith('shell_environment_policy.set.HOME=')))
  assert.ok(spec.args.some((arg) => arg === `shell_environment_policy.set.PATH=${JSON.stringify(spec.env.PATH)}`))
  assert.ok(spec.args.some((arg) => arg === `shell_environment_policy.set.TMPDIR=${JSON.stringify(spec.env.TMPDIR)}`))
  assert.ok(spec.args.some((arg) => arg === 'shell_environment_policy.set.NOSTRA_PUBLICATION_ENDPOINT="http://localhost/publication"'))
  assert.ok(spec.args.some((arg) => arg === `shell_environment_policy.set.NOSTRA_PUBLICATION_SOCKET=${JSON.stringify(publicationSocketPath)}`))
  assert.ok(spec.args.some((arg) => arg === `shell_environment_policy.set.NOSTRA_PUBLICATION_TOKEN=${JSON.stringify(publicationToken)}`))
  assert.ok(spec.args.includes('shell_environment_policy.set.NOSTRA_PARITY_CANARY_CONTINUATION="1"'))
  assert.ok(spec.args.includes('shell_environment_policy.set.NOSTRA_MEMORY_MODE="shadow"'))
  assert.ok(!spec.args.some((arg) => arg.includes('NOSTRA_PROVENANCE_MANIFEST')), 'child-authored provenance paths must be scrubbed')
  const isolatedConfig = fs.readFileSync(path.join(probe.authLease.home, 'config.toml'), 'utf8')
  assert.match(isolatedConfig, /approval_policy = "on-request"/)
  assert.match(isolatedConfig, /approvals_reviewer = "auto_review"/)
  assert.match(isolatedConfig, new RegExp(`default_permissions = "${CODEX_COCKPIT_PERMISSION_PROFILE}"`))
  assert.doesNotMatch(isolatedConfig, /filesystem\.":workspace_roots"/)
  assert.match(isolatedConfig, new RegExp(`${JSON.stringify(fs.realpathSync(repoRoot)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} = "read"`))
  assert.match(isolatedConfig, new RegExp(`${JSON.stringify(fs.realpathSync(dataRoot)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} = "read"`))
  for (const runtimeRoot of testPythonRuntime.readOnlyRoots) {
    assert.match(isolatedConfig, new RegExp(`${JSON.stringify(runtimeRoot).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} = "read"`),
      'the exact host-proved Python runtime tree must be read-only inside model-issued Bash')
  }
  assert.match(isolatedConfig, new RegExp(`${JSON.stringify(fs.realpathSync(writableOutputRoot)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} = "write"`))
  assert.match(isolatedConfig, /features\.network_proxy = true/)
  assert.match(isolatedConfig, /\[permissions\.nostra-cockpit\.network\]\nenabled = true\nmode = "limited"/)
  assert.match(isolatedConfig, new RegExp(`${JSON.stringify(fs.realpathSync(publicationSocketPath)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} = "allow"`))
  assert.match(isolatedConfig, new RegExp(`${JSON.stringify(fs.realpathSync(publicationSocketPath)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} = "read"`),
    'the publication helper may verify the exact socket metadata but cannot mutate it')
  assert.match(isolatedConfig, new RegExp(`${JSON.stringify(fs.realpathSync(publicationSocketRoot)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} = "read"`),
    'the publication helper may verify only the private socket parent outside denied state')
  assert.match(isolatedConfig, new RegExp(`${JSON.stringify(path.join(probe.authLease.home, 'auth.json')).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} = "deny"`))
  assert.match(isolatedConfig, new RegExp(`${JSON.stringify(fs.realpathSync(launchAuthHome)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} = "deny"`))
  for (const protectedPath of [...new Set(protectedWritePaths.filter((candidate) => candidate !== protectedStateRoot))]) {
    assert.match(isolatedConfig, new RegExp(`${JSON.stringify(path.resolve(protectedPath)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} = "read"`),
      `${protectedPath} must override any overlapping output write permission`)
  }
  assert.match(isolatedConfig, new RegExp(`${JSON.stringify(path.resolve(protectedStateRoot)).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} = "deny"`),
    'STATE_DIR must be unreadable and unwritable even though it also appears in protected-write paths')
  assert.equal(spec.args.at(-1), 'never', 'new-run argv must end at exec flags, never include the canonical prompt')
  const expandedPrompt = spec.input || ''
  assert.ok(!spec.args.some((arg) => arg.includes('CANONICAL COMMAND SOURCE')), 'canonical prompt must never enter argv')
  assert.match(expandedPrompt, /CANONICAL COMMAND SOURCE: \.claude\/commands\/research\/full\.md/)
  assert.match(expandedPrompt, /SUBAGENT COMPLETION BARRIER — MANDATORY/)
  assert.match(expandedPrompt, /zero live\/unresolved children/)
  assert.match(expandedPrompt, /never say that work is "still in flight" and then end the turn/)
  assert.match(expandedPrompt, /The ticker is `AAPL`\./)
  assert.doesNotMatch(
    expandedPrompt.split('BEGIN CANONICAL COMMAND (expanded verbatim)')[1] || '',
    /\$\{?ARGUMENTS\}?/,
    'the canonical command body must be expanded before Codex sees it',
  )

  const resumedProbe = launchProbe(launchAuthHome)
  const resumed = resumeSpec = buildCodexLaunchSpec(
    { ...context, resumeSessionId: 'thread-existing' },
    resumedProbe,
  )
  assert.deepEqual(resumed.args.slice(-3), ['resume', 'thread-existing', '-'])
  assert.equal(resumed.input, expandedPrompt, 'resume bootstrap prompt must also travel on stdin')
  assert.ok(!resumed.args.some((arg) => arg.includes('CANONICAL COMMAND SOURCE')), 'resume prompt must never enter argv')
  const continuationProbe = launchProbe(launchAuthHome)
  const continued = buildCodexLaunchSpec({
    ...context,
    automaticContinuation: {
      index: 2,
      completedOutputs: ['business-model/00_data-triage.md'],
      unresolvedOutputs: ['business-model/09_moat.md', 'business-model/99_business-model-synthesis.md'],
    },
  }, continuationProbe)
  assert.ok(!continued.args.includes('resume'), 'automatic continuation uses a fresh isolated session')
  assert.match(continued.input || '', /continuation process 2 of the SAME already-admitted Codex cockpit run/)
  assert.match(continued.input || '', /Completed canonical outputs \(1\):\n- business-model\/00_data-triage\.md/)
  assert.match(continued.input || '', /Unresolved canonical outputs \(2\):/)
  assert.match(continued.input || '', /Do not end the parent turn after announcing future work/)
  assert.match(continued.input || '', /CANONICAL COMMAND SOURCE: \.claude\/commands\/research\/full\.md/)
  const invalidContinuationProbe = launchProbe(launchAuthHome)
  assert.throws(() => buildCodexLaunchSpec({
    ...context,
    automaticContinuation: { index: 1, completedOutputs: [], unresolvedOutputs: ['../prompt-injection'] },
  }, invalidContinuationProbe), /continuation inventory is invalid/)
  assert.equal(fs.existsSync(invalidContinuationProbe.authLease.home), false)
  const windowsTraversalProbe = launchProbe(launchAuthHome)
  assert.throws(() => buildCodexLaunchSpec({
    ...context,
    automaticContinuation: { index: 1, completedOutputs: [], unresolvedOutputs: ['business-model\\..\\secret'] },
  }, windowsTraversalProbe), /continuation inventory is invalid/)
  assert.equal(fs.existsSync(windowsTraversalProbe.authLease.home), false)
  spec.beforeSpawn?.()
  assert.throws(() => spec.beforeSpawn?.(), /already consumed/, 'a bound auth lease can authorize only one spawn')
  spec.cleanup?.()
  assert.equal(fs.existsSync(probe.authLease.home), false, 'child-close cleanup deletes the verified credential lease')
  resumed.cleanup?.()
  assert.equal(fs.existsSync(resumedProbe.authLease.home), false, 'pre-spawn abort cleanup deletes the credential lease')
  continued.cleanup?.()
  assert.equal(fs.existsSync(continuationProbe.authLease.home), false, 'continuation cleanup deletes its credential lease')

  for (const [label, override, expected] of [
    ['missing context socket', { publicationSocketPath: undefined }, /requires one matching supervisor socket/],
    ['TCP endpoint', { env: { ...context.env, NOSTRA_PUBLICATION_ENDPOINT: 'http://127.0.0.1:3434/publication' } }, /endpoint-scoped Unix-socket URL/],
    ['forged token', { env: { ...context.env, NOSTRA_PUBLICATION_TOKEN: 'not-a-supervisor-uuid' } }, /run-scoped UUID/],
  ] as const) {
    const rejectedProbe = launchProbe(launchAuthHome)
    assert.throws(() => buildCodexLaunchSpec({ ...context, ...override }, rejectedProbe), expected, label)
    assert.equal(fs.existsSync(rejectedProbe.authLease.home), false, `${label} rejection cleans its credential lease`)
  }
  const broadWriteProbe = launchProbe(launchAuthHome)
  assert.throws(() => buildCodexLaunchSpec({ ...context, writablePaths: [dataRoot] }, broadWriteProbe), /Refusing broad/,
    'repo/data roots can never be restored as broad model write grants')
  assert.equal(fs.existsSync(broadWriteProbe.authLease.home), false)

  const dataRootAlias = path.join(os.tmpdir(), `nostra-codex-data-link-${randomUUID()}`)
  fs.symlinkSync(dataRoot, dataRootAlias, 'dir')
  try {
    const linkedDataProbe = launchProbe(launchAuthHome)
    const linkedDataSpec = buildCodexLaunchSpec({ ...context, additionalWritableDataRoot: dataRootAlias }, linkedDataProbe)
    assert.deepEqual(
      linkedDataSpec.args.slice(linkedDataSpec.args.indexOf('--add-dir'), linkedDataSpec.args.indexOf('--add-dir') + 2),
      ['--add-dir', fs.realpathSync(dataRoot)],
      'Codex must resolve the same sanctioned external data projection used by the production checkout',
    )
    linkedDataSpec.beforeSpawn?.()
    linkedDataSpec.cleanup?.()
  } finally {
    fs.unlinkSync(dataRootAlias)
  }

  const tempPublication = await createTestPublicationTransport('/tmp/nostra-publication-test-')
  try {
    const tempProbe = launchProbe(launchAuthHome)
    assert.throws(() => buildCodexLaunchSpec({
      ...context,
      env: { ...context.env, ...tempPublication.env },
      protectedReadPaths: [tempPublication.root],
      publicationSocketPath: tempPublication.socketPath,
    }, tempProbe), /platform-writable temporary root/,
    'a /tmp socket is mutable despite exact permission-profile denies and must fail closed')
    assert.equal(fs.existsSync(tempProbe.authLease.home), false)
  } finally { await tempPublication.close() }

  const socketMutationProbe = launchProbe(launchAuthHome)
  const socketMutationSpec = buildCodexLaunchSpec(context, socketMutationProbe)
  await new Promise<void>((resolve) => publicationSocketServer.close(() => resolve()))
  try { fs.unlinkSync(publicationSocketPath) } catch { /* Node may already unlink AF_UNIX endpoints */ }
  publicationSocketServer = net.createServer()
  await new Promise<void>((resolve, reject) => {
    publicationSocketServer.once('error', reject)
    publicationSocketServer.listen(publicationSocketPath, () => resolve())
  })
  fs.chmodSync(publicationSocketPath, 0o600)
  assert.throws(() => socketMutationSpec.beforeSpawn?.(), /publication socket changed/,
    'replacing the supervisor socket inode after config sealing invalidates the one-use launch')
  socketMutationSpec.cleanup?.()
} finally {
  baseSpec?.cleanup?.()
  resumeSpec?.cleanup?.()
  solOnlySpec?.cleanup?.()
  frozenCapabilitySpec?.cleanup?.()
  fs.rmSync(dataRoot, { recursive: true, force: true })
  fs.rmSync(launchAuthHome, { recursive: true, force: true })
  await new Promise<void>((resolve) => publicationSocketServer.close(() => resolve()))
  fs.rmSync(protectedStateRoot, { recursive: true, force: true })
  fs.rmSync(publicationCapabilityRoot, { recursive: true, force: true })
}

const leaseSecurityRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-codex-lease-security-'))
const leaseSecurityPublication = await createTestPublicationTransport()
try {
  const authHome = path.join(leaseSecurityRoot, 'auth')
  const writableRoot = path.join(leaseSecurityRoot, 'data')
  const writableOutput = path.join(writableRoot, 'run-output')
  const executable = path.join(leaseSecurityRoot, 'codex-fixture')
  fs.mkdirSync(authHome)
  fs.mkdirSync(writableRoot)
  fs.mkdirSync(writableOutput)
  const writeSourceAuth = (token: string) => fs.writeFileSync(
    path.join(authHome, 'auth.json'), JSON.stringify({ auth_mode: 'chatgpt', token }), { mode: 0o600 },
  )
  const writeExecutable = (suffix = '') => {
    fs.writeFileSync(executable, `#!/bin/sh\nexit 0\n${suffix}`, { mode: 0o700 })
    fs.chmodSync(executable, 0o700)
  }
  writeSourceAuth('source-token')
  writeExecutable()
  const securityContext = (): ProviderLaunchContext => ({
    prompt: '/research:full AAPL', kind: 'full', profile: codexProviderAdapter.resolveProfile({}),
    cwd: repoRoot, additionalWritableDataRoot: writableRoot,
    writablePaths: [writableOutput],
    protectedReadPaths: [leaseSecurityPublication.root],
    env: {
      PATH: '/bin', CODEX_HOME: authHome, OPENAI_API_KEY: 'must-never-reach-spawn',
      ...leaseSecurityPublication.env,
    },
    guard: { maxTurns: 2_000, budgetUsd: 100 },
    publicationSocketPath: leaseSecurityPublication.socketPath,
  })

  const spawnFailureProbe = launchProbe(authHome, executable)
  const spawnFailureSpec = buildCodexLaunchSpec(securityContext(), spawnFailureProbe)
  const spawnFailureHome = spawnFailureProbe.authLease.home
  spawnFailureSpec.beforeSpawn?.()
  spawnFailureSpec.cleanup?.()
  assert.equal(fs.existsSync(spawnFailureHome), false,
    'spawn-failure cleanup deletes a lease even after final validation consumed it')

  writeSourceAuth('source-token')
  const policyPaths = [path.join(repoRoot, 'scripts')]
  const policyMutationProbe = launchProbe(authHome, executable)
  const policyMutationSpec = buildCodexLaunchSpec({
    ...securityContext(), protectedWritePaths: policyPaths, protectedReadPaths: [leaseSecurityPublication.root],
  }, policyMutationProbe)
  policyPaths.push(path.join(repoRoot, 'frameworks'))
  assert.throws(() => policyMutationSpec.beforeSpawn?.(), /protected-path policy changed/,
    'the exact supervisor path lists are immutable between config proof and spawn')
  policyMutationSpec.cleanup?.()

  writeSourceAuth('source-token')
  const writablePolicyPaths = [writableOutput]
  const writablePolicyProbe = launchProbe(authHome, executable)
  const writablePolicySpec = buildCodexLaunchSpec({
    ...securityContext(), writablePaths: writablePolicyPaths,
  }, writablePolicyProbe)
  writablePolicyPaths.push(path.join(writableRoot, 'late-injected-output'))
  assert.throws(() => writablePolicySpec.beforeSpawn?.(), /writable\/protected-path policy changed/,
    'the supervisor cannot widen exact output grants after the sealed config is built')
  writablePolicySpec.cleanup?.()

  writeSourceAuth('source-token')
  const configMutationProbe = launchProbe(authHome, executable)
  const configMutationSpec = buildCodexLaunchSpec({
    ...securityContext(), protectedWritePaths: [path.join(repoRoot, 'scripts')],
  }, configMutationProbe)
  fs.appendFileSync(path.join(configMutationProbe.authLease.home, 'config.toml'), '\n# forged protected-path policy\n')
  assert.throws(() => configMutationSpec.beforeSpawn?.(), /leased credential or probe state changed/,
    'mutating the sealed permission policy after build must invalidate the spawn')
  configMutationSpec.cleanup?.()

  writeSourceAuth('source-token')
  const leasedMutationProbe = launchProbe(authHome, executable)
  const leasedMutationSpec = buildCodexLaunchSpec(securityContext(), leasedMutationProbe)
  fs.writeFileSync(path.join(leasedMutationProbe.authLease.home, 'auth.json'), '{"forged":true}', { mode: 0o600 })
  assert.throws(() => leasedMutationSpec.beforeSpawn?.(), /leased credential or probe state changed/,
    'mutating the credential snapshot after build must fail at the last pre-spawn boundary')
  leasedMutationSpec.cleanup?.()

  writeSourceAuth('source-token')
  const sourceMutationProbe = launchProbe(authHome, executable)
  const sourceMutationSpec = buildCodexLaunchSpec(securityContext(), sourceMutationProbe)
  writeSourceAuth('rotated-after-proof')
  assert.throws(() => sourceMutationSpec.beforeSpawn?.(), /credential changed after the verified launch proof/,
    'mutating the original login after proof but before spawn must invalidate the launch')
  sourceMutationSpec.cleanup?.()

  writeSourceAuth('source-token')
  writeExecutable()
  const binaryMutationProbe = launchProbe(authHome, executable)
  const binaryMutationSpec = buildCodexLaunchSpec(securityContext(), binaryMutationProbe)
  writeExecutable('# mutation')
  assert.throws(() => binaryMutationSpec.beforeSpawn?.(), /executable changed after the verified launch proof/,
    'changing the pinned executable bytes before spawn must fail closed')
  binaryMutationSpec.cleanup?.()

  writeSourceAuth('source-token')
  writeExecutable()
  let leaseNow = 10_000
  const expiryProbe = launchProbe(authHome, executable, { now: () => leaseNow, expiresAt: leaseNow + 100 })
  const expirySpec = buildCodexLaunchSpec(securityContext(), expiryProbe)
  leaseNow += 101
  assert.throws(() => expirySpec.beforeSpawn?.(), /lease expired before spawn/)
  expirySpec.cleanup?.()

  writeSourceAuth('source-token')
  const envMutationProbe = launchProbe(authHome, executable)
  const envMutationSpec = buildCodexLaunchSpec(securityContext(), envMutationProbe)
  envMutationSpec.env.CODEX_HOME = authHome
  envMutationSpec.env.OPENAI_API_KEY = 'injected-after-build'
  assert.throws(() => envMutationSpec.beforeSpawn?.(), /launch environment changed/,
    'post-build environment mutation cannot replace the lease or reintroduce API-key auth')
  envMutationSpec.cleanup?.()
} finally {
  await leaseSecurityPublication.close()
  fs.rmSync(leaseSecurityRoot, { recursive: true, force: true })
}

const invalidPromptRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-codex-invalid-prompt-'))
const invalidDataRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-codex-invalid-data-'))
const invalidAuthHome = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-codex-invalid-auth-'))
const invalidPublication = await createTestPublicationTransport()
try {
  fs.mkdirSync(path.join(invalidPromptRoot, '.claude', 'commands', 'research'), { recursive: true })
  fs.mkdirSync(path.join(invalidPromptRoot, '.claude', 'agents'), { recursive: true })
  fs.writeFileSync(path.join(invalidPromptRoot, 'AGENTS.md'), 'Runtime instruction fixture.\n')
  fs.writeFileSync(path.join(invalidPromptRoot, '.claude', 'commands', 'research', 'full.md'), [
    '---', 'description: Runtime validation fixture', 'argument-hint: <ticker>', 'allowed-tools: Read, Task', '---',
    'Run Task with subagent_type: "bad-model-agent" for $ARGUMENTS.',
  ].join('\n'))
  fs.writeFileSync(path.join(invalidPromptRoot, '.claude', 'agents', 'bad-model-agent.md'), [
    '---', 'name: bad-model-agent', 'description: Runtime validation fixture', 'tools: Read', 'model: sonnet', '---',
    'Fixture.',
  ].join('\n'))
  fs.writeFileSync(path.join(invalidAuthHome, 'auth.json'), '{"auth_mode":"chatgpt"}', { mode: 0o600 })
  const invalidContext: ProviderLaunchContext = {
    prompt: '/research:full AAPL', kind: 'full', profile: codexProviderAdapter.resolveProfile({}),
    cwd: invalidPromptRoot, additionalWritableDataRoot: invalidDataRoot,
    writablePaths: [path.join(invalidDataRoot, 'run-output')],
    protectedReadPaths: [invalidPublication.root],
    env: { CODEX_HOME: invalidAuthHome, ...invalidPublication.env },
    guard: { maxTurns: 1, budgetUsd: 1 },
    publicationSocketPath: invalidPublication.socketPath,
  }
  const invalidModelProbe = launchProbe(invalidAuthHome)
  assert.throws(
    () => buildCodexLaunchSpec(invalidContext, invalidModelProbe),
    /canonical model alias 'sonnet' has no Codex compatibility mapping/,
    'runtime launch validation must disable Codex for an unmapped canonical model alias',
  )
  assert.equal(fs.existsSync(invalidModelProbe.authLease.home), false,
    'a build-time prompt-contract rejection must not strand the verified credential lease')
  for (const [label, frontmatter, expected] of [
    ['missing tools', ['---', 'name: bad-model-agent', 'description: fixture', '---', 'Fixture.'], /missing 'tools'/],
    ['unsafe name', ['---', 'name: ../escape', 'description: fixture', 'tools: Read', '---', 'Fixture.'], /unsafe or empty canonical agent name/],
    ['empty tools', ['---', 'name: bad-model-agent', 'description: fixture', 'tools: []', '---', 'Fixture.'], /tools must not be empty/],
    ['malformed YAML', ['---', 'name: [unterminated', 'description: fixture', 'tools: Read', '---', 'Fixture.'], /malformed YAML frontmatter/],
  ] as const) {
    fs.writeFileSync(path.join(invalidPromptRoot, '.claude', 'agents', 'bad-model-agent.md'), frontmatter.join('\n'))
    assert.throws(
      () => buildCodexLaunchSpec(invalidContext, launchProbe(invalidAuthHome)),
      expected,
      `${label} must fail runtime discovery rather than silently skip the agent`,
    )
  }
  fs.writeFileSync(path.join(invalidPromptRoot, '.claude', 'agents', 'bad-model-agent.md'), 'Fixture without frontmatter.\n')
  assert.throws(
    () => buildCodexLaunchSpec(invalidContext, launchProbe(invalidAuthHome)),
    /missing YAML frontmatter/,
  )
  fs.writeFileSync(path.join(invalidPromptRoot, '.claude', 'agents', 'bad-model-agent.md'), [
    '---', 'name: bad-model-agent', 'description: Runtime validation fixture', 'tools: Read', '---', 'Fixture.',
  ].join('\n'))
  fs.writeFileSync(path.join(invalidPromptRoot, '.claude', 'commands', 'research', 'full.md'), [
    '---', 'description: Runtime validation fixture', 'argument-hint: <ticker>', 'allowed-tools: Read, MysteryTool', '---',
    'Fixture $ARGUMENTS.',
  ].join('\n'))
  assert.throws(
    () => buildCodexLaunchSpec(invalidContext, launchProbe(invalidAuthHome)),
    /no Codex compatibility mapping for: MysteryTool/,
    'runtime launch validation must disable Codex for an unmapped canonical tool',
  )
} finally {
  await invalidPublication.close()
  fs.rmSync(invalidPromptRoot, { recursive: true, force: true })
  fs.rmSync(invalidDataRoot, { recursive: true, force: true })
  fs.rmSync(invalidAuthHome, { recursive: true, force: true })
}

const rateLimitFixture = {
  rateLimits: {
    planType: 'pro',
    limitId: 'codex',
    limitName: 'Codex',
    primary: { usedPercent: 14, windowDurationMins: 300, resetsAt: 1_787_322_000 },
    secondary: { usedPercent: 74, windowDurationMins: 10_080, resetsAt: 1_787_600_000 },
    rateLimitReachedType: null,
    spendControlReached: false,
  },
}
assert.deepEqual(normalizeCodexRateLimits(rateLimitFixture), {
  ok: true,
  checked: true,
  status: 'allowed',
  rateLimitType: 'seven_day',
  utilization: 0.74,
  resetsAt: 1_787_600_000,
  windows: {
    five_hour: { utilization: 0.14, resetsAt: 1_787_322_000, status: 'allowed' },
    seven_day: { utilization: 0.74, resetsAt: 1_787_600_000, status: 'allowed' },
  },
})
assert.deepEqual(normalizeCodexRateLimits({
  rateLimits: {
    primary: { usedPercent: 100, windowDurationMins: 300, resetsAt: 123 },
    secondary: null,
    rateLimitReachedType: 'rate_limit_reached',
    spendControlReached: false,
  },
}), {
  ok: false,
  checked: true,
  status: 'rejected',
  reason: 'rate_limit_reached',
  rateLimitType: 'five_hour',
  utilization: 1,
  resetsAt: 123,
  windows: { five_hour: { utilization: 1, resetsAt: 123, status: 'rejected' } },
})
assert.equal(normalizeCodexRateLimits({ rateLimits: { primary: { usedPercent: 101 } } }), null)
assert.deepEqual(normalizeCodexRateLimits({
  rateLimits: rateLimitFixture.rateLimits,
  rateLimitsByLimitId: {
    'gpt-5.6-sol': {
      limitId: 'gpt-5.6-sol',
      limitName: 'Sol',
      primary: { usedPercent: 88, windowDurationMins: 300, resetsAt: 222 },
      secondary: null,
      rateLimitReachedType: 'rate_limit_reached',
      spendControlReached: false,
    },
  },
}), {
  ok: true,
  checked: true,
  status: 'allowed',
  rateLimitType: 'seven_day',
  utilization: 0.74,
  resetsAt: 1_787_600_000,
  windows: {
    five_hour: { utilization: 0.14, resetsAt: 1_787_322_000, status: 'allowed' },
    seven_day: { utilization: 0.74, resetsAt: 1_787_600_000, status: 'allowed' },
    named_sol_gpt_5_6_sol_five_hour: { utilization: 0.88, resetsAt: 222, status: 'rejected' },
  },
}, 'named App Server buckets must be preserved without changing the backward-compatible headline')
assert.equal(normalizeCodexRateLimits({
  rateLimits: rateLimitFixture.rateLimits,
  rateLimitsByLimitId: { codex: { limitId: 42, primary: { usedPercent: 1 } } },
}), null, 'malformed named buckets fail closed rather than fabricating usage')

const fakeAppServer = `
let buffer = ''
let initializeReplied = false
let clientInitialized = false
process.stdin.setEncoding('utf8')
process.stdin.on('data', (chunk) => {
  buffer += chunk
  while (buffer.includes('\\n')) {
    const cut = buffer.indexOf('\\n')
    const line = buffer.slice(0, cut)
    buffer = buffer.slice(cut + 1)
    if (!line.trim()) continue
    const message = JSON.parse(line)
    if (message.method === 'initialize') {
      if (initializeReplied || clientInitialized) process.exit(71)
      initializeReplied = true
      process.stdout.write(JSON.stringify({ id: message.id, result: { userAgent: 'fixture' } }) + '\\n')
    } else if (message.method === 'initialized') {
      if (!initializeReplied || clientInitialized || Object.hasOwn(message, 'id') || Object.hasOwn(message, 'params')) process.exit(72)
      clientInitialized = true
    } else if (message.method === 'account/rateLimits/read') {
      if (!clientInitialized || Object.hasOwn(message, 'params')) process.exit(73)
      process.stdout.write(JSON.stringify({ id: message.id, result: ${JSON.stringify(rateLimitFixture)} }) + '\\n')
    } else {
      process.exit(74)
    }
  }
})
`
assert.deepEqual(
  await queryCodexRateLimits({ command: process.execPath, args: ['-e', fakeAppServer], timeoutMs: 2_000 }),
  normalizeCodexRateLimits(rateLimitFixture),
)
const timeoutStarted = Date.now()
assert.equal(
  await queryCodexRateLimits({ command: process.execPath, args: ['-e', 'setInterval(() => {}, 1000)'], timeoutMs: 100 }),
  null,
)
assert.ok(Date.now() - timeoutStarted < 1_500, 'App Server usage probe must be timeout-bounded')

assert.deepEqual(parseCodexStreamLine('{"type":"thread.started","thread_id":"thread-1"}'), [
  { type: 'session', sessionId: 'thread-1' },
])
assert.deepEqual(parseCodexStreamLine(JSON.stringify({
  type: 'item.started', item: { id: 'item-1', type: 'command_execution', command: 'rg --files', status: 'in_progress' },
})), [{ type: 'tool-use', tool: 'Bash', input: { command: 'rg --files', cwd: undefined }, toolUseId: 'item-1' }])
assert.deepEqual(parseCodexStreamLine(JSON.stringify({
  type: 'item.completed', item: { id: 'item-1', type: 'command_execution', command: 'rg --files', status: 'completed' },
})), [{ type: 'tool-result', tool: 'Bash', input: { command: 'rg --files', cwd: undefined }, toolUseId: 'item-1', isError: false }])
assert.deepEqual(parseCodexStreamLine(JSON.stringify({
  type: 'item.completed', item: { id: 'message-1', type: 'agent_message', text: 'Stopped because the canonical command was unavailable.' },
})), [{ type: 'assistant-message', message: 'Stopped because the canonical command was unavailable.' }])
assert.deepEqual(parseCodexStreamLine(JSON.stringify({
  type: 'item.started',
  item: {
    id: 'item-2', type: 'collab_tool_call', tool: 'spawn_agent', status: 'in_progress',
    prompt: 'NOSTRA_SUBAGENT_TYPE: memo-writer\nCanonical path: .claude/agents/memo-writer.md',
    receiver_thread_ids: [],
  },
})), [{
  type: 'tool-use',
  tool: 'Task',
  input: {
    tool: 'spawn_agent',
    prompt: 'NOSTRA_SUBAGENT_TYPE: memo-writer\nCanonical path: .claude/agents/memo-writer.md',
    receiverThreadIds: [],
    subagent_type: 'memo-writer',
    description: 'Dispatch memo-writer',
  },
  toolUseId: 'item-2',
}])
assert.deepEqual(parseCodexStreamLine(JSON.stringify({
  type: 'item.updated',
  item: {
    id: 'item-2', type: 'collab_tool_call', tool: 'spawn_agent', status: 'in_progress',
    prompt: 'NOSTRA_SUBAGENT_TYPE: memo-writer\nCanonical path: .claude/agents/memo-writer.md',
    receiver_thread_ids: ['thread-child'],
    agents_states: { 'thread-child': { status: 'running', message: null } },
  },
})), [{
  type: 'tool-progress',
  tool: 'Task',
  input: {
    tool: 'spawn_agent',
    prompt: 'NOSTRA_SUBAGENT_TYPE: memo-writer\nCanonical path: .claude/agents/memo-writer.md',
    receiverThreadIds: ['thread-child'],
    agentStates: { 'thread-child': { status: 'running', message: null } },
    subagent_type: 'memo-writer',
    description: 'Dispatch memo-writer',
  },
  toolUseId: 'item-2',
}])
assert.deepEqual(parseCodexStreamLine(JSON.stringify({
  type: 'item.completed',
  item: {
    id: 'item-3', type: 'collab_tool_call', tool: 'spawn_agent', status: 'completed',
    prompt: 'NOSTRA_SUBAGENT_TYPE: memo-writer\nCanonical path: .claude/agents/memo-writer.md',
    receiver_thread_ids: ['thread-child'],
    agents_states: { 'thread-child': { status: 'running', message: null } },
  },
})), [{
  type: 'tool-result',
  tool: 'Task',
  input: {
    tool: 'spawn_agent',
    prompt: 'NOSTRA_SUBAGENT_TYPE: memo-writer\nCanonical path: .claude/agents/memo-writer.md',
    receiverThreadIds: ['thread-child'],
    agentStates: { 'thread-child': { status: 'running', message: null } },
    subagent_type: 'memo-writer',
    description: 'Dispatch memo-writer',
  },
  toolUseId: 'item-3',
  isError: false,
}])
assert.deepEqual(parseCodexStreamLine(JSON.stringify({
  type: 'item.started',
  item: {
    id: 'native-child-1', type: 'sub_agent_activity', kind: 'started',
    agent_thread_id: 'thread-native-child', agent_path: '/root/nostra_data_triage',
  },
})), [{
  type: 'tool-use',
  tool: 'Task',
  input: {
    tool: 'spawn_agent',
    agentPath: '/root/nostra_data_triage',
    receiverThreadIds: ['thread-native-child'],
    agentStates: { 'thread-native-child': { status: 'running' } },
    subagent_type: 'data-triage',
    description: 'Dispatch data-triage',
  },
  toolUseId: 'native-child-1',
}])
assert.deepEqual(parseCodexStreamLine(JSON.stringify({
  type: 'item.updated',
  item: {
    id: 'native-child-1', type: 'subAgentActivity', kind: 'interrupted',
    agentThreadId: 'thread-native-child', agentPath: '/root/nostra_data_triage',
  },
})), [{
  type: 'tool-progress',
  tool: 'Task',
  input: {
    tool: 'subagent_activity',
    agentPath: '/root/nostra_data_triage',
    receiverThreadIds: ['thread-native-child'],
    agentStates: { 'thread-native-child': { status: 'interrupted' } },
    subagent_type: 'data-triage',
    description: 'Dispatch data-triage',
  },
  toolUseId: 'native-child-1',
}])
assert.deepEqual(parseCodexStreamLine('{"type":"turn.completed","usage":{"input_tokens":10}}'), [
  { type: 'result', cliResult: { subtype: 'success', isError: false }, numTurns: 1 },
])
assert.deepEqual(parseCodexStreamLine('{"type":"turn.failed","error":{"message":"weekly usage limit exceeded"}}'), [
  { type: 'result', cliResult: { subtype: 'out_of_credits', isError: true }, message: 'weekly usage limit exceeded' },
])
assert.deepEqual(parseCodexStreamLine('{"type":"turn.failed","error":{"message":"Selected model is at capacity. Please try a different model."}}'), [
  { type: 'result', cliResult: { subtype: 'model_capacity', isError: true }, message: 'Selected model is at capacity. Please try a different model.' },
])
assert.deepEqual(parseCodexStreamLine('{"type":"error","message":"429: quota exhausted"}'), [
  { type: 'result', cliResult: { subtype: 'out_of_credits', isError: true }, message: '429: quota exhausted' },
])
assert.equal(parseCodexStreamLine('not-json')[0]?.type, 'result')

assert.deepEqual(
  classifyCodexExit({ result: { exitCode: 0 }, stderr: '', status: 'running' }),
  { outcome: 'error', reason: 'codex_missing_turn_completed', message: 'Codex exited without a successful result.' },
)
assert.deepEqual(
  classifyCodexExit({ result: { exitCode: 0 }, stderr: '', status: 'running', cliResult: { subtype: 'success', isError: false } }),
  { outcome: 'success' },
)
assert.deepEqual(
  classifyCodexExit({ result: { exitCode: undefined, isTerminated: true, signal: 'SIGTERM' }, stderr: 'stopped', status: 'running' }),
  { outcome: 'terminated', reason: 'terminated_sigterm', message: 'stopped' },
)
assert.deepEqual(
  classifyCodexExit({
    result: { exitCode: 1 }, stderr: 'Your weekly usage limit exceeded', status: 'running',
    cliResult: { subtype: 'turn_failed', isError: true },
  }),
  { outcome: 'error', reason: 'out_of_credits', message: 'Your weekly usage limit exceeded', outOfCredits: true },
)

console.log('codex-provider.test.ts: profiles, ChatGPT-only auth, live-catalogue contract, launch flags, and JSONL normalization pass')
