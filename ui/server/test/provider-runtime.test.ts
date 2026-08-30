// Provider-neutral runtime contract: supervisor-owned attempts, immutable profiles, and trusted resume.
// Run: npx tsx test/provider-runtime.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { REPO_ROOT } from '../src/config'
import { getCreditStatus, setCreditStatus } from '../src/credit'
import {
  beginExecutionAttempt, canonicalManifestJsonl, canonicalManifestPath,
  hasLegacyPriorUnattributed, readLastProviderSelection, supersedeIncompleteDecisionAuthorAttempt,
} from '../src/execution-provenance'
import {
  applySupervisorPublicationEnv, paritySnapshotRootMatchesDataSubject, providerWritablePaths,
} from '../src/launcher'
import {
  CLAUDE_TRACKED_SETTING_SOURCES, claudeChildEnv, claudeSandboxSettings, createClaudeMirrorWorkspace,
  claudeNestedToolEnv, claudeProviderAdapter, isClaudeMaxAuth, isClaudeSubscriptionAuth,
} from '../src/providers/claude'
import { codexChildEnv } from '../src/providers/codex'
import type { RunState } from '../src/registry'
import { PROVIDER_NEUTRAL_RUN_ENV_KEYS, type ProviderLaunchContext } from '../src/providers/types'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error}`); process.exitCode = 1 }
}

const runRoot = `analyses/ZZPROVIDER_${Date.now()}`
const absoluteRoot = path.join(REPO_ROOT, runRoot)
const cleanupRoots = [absoluteRoot]
const project = (manifest: string) => JSON.parse(execFileSync(
  'python3', [path.join(REPO_ROOT, 'scripts/execution_provenance.py'), 'project', '--manifest', manifest],
  { encoding: 'utf8' },
))

const baseRun = (overrides: Partial<RunState> = {}): RunState => ({
  runId: randomUUID(), kind: 'full', ticker: 'ZZPROVIDER', subjectId: 'ZZPROVIDER', swarmId: 'research', unit: 'ticker',
  provider: 'codex', model: 'gpt-5.6-sol', reasoningLevel: 'max', profileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
  executionProfile: {
    key: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh', parentModel: 'gpt-5.6-sol', parentReasoning: 'max',
    specialistModel: 'gpt-5.6-terra', specialistReasoning: 'xhigh',
  },
  cliVersion: 'test-cli', runRoot, prompt: '', user: 'test', userVia: 'local', child: null, status: 'starting',
  startedAt: Date.now(), willCommitToMain: true, writeTargetsAbs: [], coveredModules: [], readDepsAbs: [],
  agents: new Map(), expected: new Map([['business-model/01_specialist', {
    key: 'business-model/01_specialist', module: 'business-model', name: 'specialist', layer: 1,
    outputRel: 'business-model/01_specialist.md',
  }]]), toolUseToAgent: new Map(), eventLog: [], activity: [], subscribers: new Set(),
  ...overrides,
})

try {
  fs.mkdirSync(absoluteRoot, { recursive: true })

  check('Claude research defaults to Opus and only exposes research-approved frozen models', () => {
    assert.equal(claudeProviderAdapter.resolveProfile({}).profileKey, 'claude:opus:default')
    assert.deepEqual(claudeProviderAdapter.profile.profiles.map((profile) => profile.key), [
      'claude:opus:default', 'claude:sonnet:default',
    ])
    assert.equal(claudeProviderAdapter.resolveProfile({ profileKey: 'claude:sonnet:default' }).model, 'sonnet')
    assert.throws(() => claudeProviderAdapter.resolveProfile({ model: 'haiku' }), /Choose Opus or Sonnet/)
    assert.throws(
      () => claudeProviderAdapter.resolveProfile({ profileKey: 'claude:opus:default', model: 'sonnet' }),
      /disagree/,
    )
  })

  check('usage windows merge per provider without collapsing unavailable into zero', () => {
    setCreditStatus({ ok: true, checked: true, rateLimitType: 'primary', utilization: 0.2,
      windows: { primary: { utilization: 0.2, resetsAt: 100 }, secondary: { utilization: 0.74, resetsAt: 200 } } }, 'codex')
    assert.equal(getCreditStatus('codex').windows?.primary?.utilization, 0.2)
    assert.equal(getCreditStatus('codex').windows?.secondary?.utilization, 0.74)
    assert.equal(getCreditStatus('claude').checked, false)
  })

  const run = baseRun()
  check('terminal attempt is runtime-attributed and nested policy is configured-only', () => {
    beginExecutionAttempt(run)
    const [author, specialist] = run.currentExecutionAttempts ?? []
    assert.equal(author.attempt_id, run.runId)
    assert.equal(author.provider, 'codex')
    assert.equal(author.model, 'gpt-5.6-sol')
    assert.equal(author.reasoning_level, 'max')
    assert.equal(author.attribution, 'recorded')
    assert.equal(author.role, 'terminal_adjudicator')
    assert.equal(author.decision_author, true)
    assert.deepEqual(author.decision_artifacts, ['decision_record.json'])
    assert.equal(specialist.attribution, 'configured')
    assert.equal(specialist.model, 'gpt-5.6-terra')
    assert.equal(specialist.reasoning_level, 'xhigh')
    assert.equal(specialist.decision_author, false)
    assert.equal(project(canonicalManifestPath(run)).provider_mode, 'single_provider')
  })

  check('a same-run provider continuation retains a distinct process attempt id', () => {
    const priorAttemptId = (run.currentExecutionAttempts ?? [])[0]?.attempt_id
    supersedeIncompleteDecisionAuthorAttempt(run)
    run.providerAttemptId = randomUUID()
    beginExecutionAttempt(run)
    const nextAttemptId = (run.currentExecutionAttempts ?? [])[0]?.attempt_id
    assert.equal(nextAttemptId, run.providerAttemptId)
    assert.notEqual(nextAttemptId, priorAttemptId)
    const recorded = (run.executionAttempts ?? []).filter((row) => row.attribution === 'recorded')
    assert.deepEqual(new Set(recorded.map((row) => row.attempt_id)), new Set([priorAttemptId, nextAttemptId]))
    assert.equal(recorded.filter((row) => row.decision_author === true).length, 1)
    assert.equal(recorded.find((row) => row.attempt_id === priorAttemptId)?.decision_author, false)
  })

  check('canonical projector input is supervisor memory, not the child-visible path', () => {
    const fake = path.join(absoluteRoot, '.execution-provenance.jsonl')
    fs.writeFileSync(fake, '{"provider":"claude","model":"forged"}\n')
    assert.match(canonicalManifestJsonl(run), /"provider":"codex"/)
    assert.doesNotMatch(canonicalManifestJsonl(run), /forged/)
    fs.rmSync(fake)
    assert.match(canonicalManifestJsonl(run), /"provider":"codex"/)
  })

  check('resume uses live supervisor selection and ignores a forged run-root JSONL', () => {
    fs.writeFileSync(path.join(absoluteRoot, '.execution-provenance.jsonl'),
      '{"schema_version":"1.0","provider":"claude","model":"forged"}\n')
    assert.deepEqual(readLastProviderSelection(runRoot), {
      provider: 'codex', model: 'gpt-5.6-sol', reasoningLevel: 'max',
      profileKey: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh', executionProfile: run.executionProfile,
    })
  })

  check('uncommitted retained output is unknown prior lineage, never fabricated Claude', () => {
    const unknownRoot = `analyses/ZZUNKNOWN_${Date.now()}`
    const absolute = path.join(REPO_ROOT, unknownRoot)
    cleanupRoots.push(absolute)
    fs.mkdirSync(path.join(absolute, 'business-model'), { recursive: true })
    fs.writeFileSync(path.join(absolute, 'business-model', '01_prior.md'), '# retained output\n')
    assert.equal(hasLegacyPriorUnattributed(unknownRoot), true, 'diagnostic notices retained bytes')
    const continued = baseRun({ runId: randomUUID(), runRoot: unknownRoot })
    beginExecutionAttempt(continued)
    assert.equal(continued.priorExecutionUnobserved, true)
    assert.equal((continued.executionAttempts ?? []).some((row) => row.provider === 'claude'), false)
    assert.equal(project(canonicalManifestPath(continued)).provider_mode, 'partially_observed')
  })

  check('publication controls survive both provider env policies without widening Codex secrets', () => {
    const binding = { runId: randomUUID(), runRoot, token: 'opaque-capability' }
    const source = applySupervisorPublicationEnv({
      PATH: '/bin', OPENAI_API_KEY: 'do-not-leak', ANTHROPIC_API_KEY: 'no-api-billing',
      ANTHROPIC_AUTH_TOKEN: 'no-gateway-billing',
      CLAUDE_CODE_OAUTH_TOKEN: 'no-model-visible-oauth',
    }, binding)
    for (const env of [claudeChildEnv(source), codexChildEnv(source)]) {
      const final = applySupervisorPublicationEnv(env, binding)
      assert.equal(final.NOSTRA_COCKPIT_RUN, '1')
      assert.equal(final.NOSTRA_PUBLICATION_TOKEN, binding.token)
      assert.match(final.NOSTRA_PUBLICATION_ENDPOINT || '', new RegExp(binding.runId))
      assert.equal(final.NOSTRA_PROVENANCE_MANIFEST, undefined, 'the retired child-writable manifest is never exported')
    }
    assert.equal(codexChildEnv(source).OPENAI_API_KEY, undefined)
    assert.equal(claudeChildEnv(source).ANTHROPIC_API_KEY, undefined)
    assert.equal(claudeChildEnv(source).ANTHROPIC_AUTH_TOKEN, undefined)
    assert.equal(claudeChildEnv(source).CLAUDE_CODE_OAUTH_TOKEN, 'no-model-visible-oauth')
    assert.equal(claudeChildEnv(source).CLAUDE_CODE_SUBPROCESS_ENV_SCRUB, '1')
    assert.equal(claudeNestedToolEnv(source).CLAUDE_CODE_OAUTH_TOKEN, undefined)
    assert.equal(claudeNestedToolEnv(source).CLAUDE_CODE_SUBPROCESS_ENV_SCRUB, '1')
    assert.equal(claudeChildEnv({ ...source, NOSTRA_PUBLICATION_SOCKET: '/tmp/fixture.sock' }).NOSTRA_PUBLICATION_SOCKET,
      '/tmp/fixture.sock')
  })

  check('every provider and model tool receives the same exact supervisor run-policy controls', () => {
    const exactPolicy = Object.fromEntries(PROVIDER_NEUTRAL_RUN_ENV_KEYS.map((key, index) => [key, `exact-${index}`]))
    const source = { PATH: '/bin', ...exactPolicy, NOSTRA_UNREVIEWED_STALE_CONTROL: 'must-not-pass' }
    for (const env of [claudeChildEnv(source), claudeNestedToolEnv(source), codexChildEnv(source)]) {
      assert.deepEqual(
        Object.fromEntries(PROVIDER_NEUTRAL_RUN_ENV_KEYS.map((key) => [key, env[key]])),
        exactPolicy,
        'Claude, Claude tools, and Codex keep byte-identical exact-root/frozen-evidence controls',
      )
      assert.equal(env.NOSTRA_UNREVIEWED_STALE_CONTROL, undefined,
        'an unreviewed shell-level NOSTRA value is scrubbed instead of becoming a model control')
    }
  })

  check('tracked Claude accepts only first-party subscription auth and scrubs headless credentials', () => {
    const maxLogin = { loggedIn: true, authMethod: 'claude.ai', apiProvider: 'firstParty', subscriptionType: 'max' }
    const headless = { loggedIn: true, authMethod: 'oauth_token', apiProvider: 'firstParty' }
    assert.equal(isClaudeMaxAuth(maxLogin), true)
    assert.equal(isClaudeMaxAuth({ loggedIn: true, authMethod: 'apiKey', apiProvider: 'firstParty', subscriptionType: 'max' }), false)
    assert.equal(isClaudeSubscriptionAuth(maxLogin, {}), true)
    assert.equal(isClaudeSubscriptionAuth(headless, { CLAUDE_CODE_OAUTH_TOKEN: 'subscription-token' }), true)
    assert.equal(isClaudeSubscriptionAuth(headless, {}), false, 'a status label alone cannot admit headless auth')
    assert.equal(isClaudeSubscriptionAuth({ ...headless, apiProvider: 'thirdParty' },
      { CLAUDE_CODE_OAUTH_TOKEN: 'subscription-token' }), false)
    assert.equal(isClaudeSubscriptionAuth({ loggedIn: true, authMethod: 'apiKey', apiProvider: 'firstParty' },
      { CLAUDE_CODE_OAUTH_TOKEN: 'subscription-token' }), false)
  })

  check('tracked Claude OS-denies Git/code/archive writes independently of env', () => {
    const gitDir = path.join(REPO_ROOT, '.git')
    const archive = path.join(REPO_ROOT, 'commodity', 'runs', 'GOLD', 'decisions')
    const context: ProviderLaunchContext = {
      prompt: '/commodity:full GOLD', kind: 'full',
      profile: {
        provider: 'claude', profileKey: 'claude:sonnet:default', model: 'sonnet', reasoningLevel: 'default',
        executionProfile: { key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' },
      },
      cwd: REPO_ROOT, additionalWritableDataRoot: path.join(REPO_ROOT, 'data'),
      writablePaths: [path.join(REPO_ROOT, 'commodity', 'runs', 'GOLD')],
      protectedWritePaths: [gitDir, path.join(REPO_ROOT, 'scripts'), archive],
      publicationSocketPath: '/tmp/nostra-publication-fixture/p.sock',
      env: { PATH: '/bin', NOSTRA_COCKPIT_RUN: '1' }, guard: { maxTurns: 1, budgetUsd: 1 },
    }
    const settings: any = claudeSandboxSettings(context)
    assert.equal(settings.sandbox.enabled, true)
    assert.equal(settings.sandbox.failIfUnavailable, true)
    assert.equal(settings.sandbox.allowUnsandboxedCommands, false)
    assert.deepEqual(settings.sandbox.excludedCommands, [])
    assert.deepEqual(settings.sandbox.filesystem.allowWrite,
      [path.resolve(path.join(REPO_ROOT, 'commodity', 'runs', 'GOLD'))])
    const outputRoot = path.resolve(path.join(REPO_ROOT, 'commodity', 'runs', 'GOLD'))
    assert.ok(settings.permissions.allow.includes(`Write(//${outputRoot.slice(1)}/**)`)
      && settings.permissions.allow.includes(`Edit(//${outputRoot.slice(1)}/**)`),
    'canonical Write/Edit remain available only inside the admitted output root')
    assert.ok(!settings.permissions.allow.includes('Write') && !settings.permissions.allow.includes('Edit'),
      'built-in writers have no unscoped allow')
    assert.deepEqual(settings.sandbox.network.allowUnixSockets,
      ['/tmp/nostra-publication-fixture/p.sock'])
    assert.ok(settings.sandbox.filesystem.allowRead.includes('/tmp/nostra-publication-fixture')
      && settings.sandbox.filesystem.allowRead.includes('/tmp/nostra-publication-fixture/p.sock'),
    'the helper receives metadata-read access to only the private socket parent and exact socket')
    for (const target of [path.resolve(gitDir), path.resolve(path.join(REPO_ROOT, 'scripts')), path.resolve(archive)]) {
      assert.ok(settings.sandbox.filesystem.denyWrite.includes(target), `${target} must be OS write-denied`)
    }
    const childControlled = { ...context.env }
    delete childControlled.NOSTRA_COCKPIT_RUN
    assert.ok(settings.sandbox.filesystem.denyWrite.includes(path.resolve(gitDir)),
      'unsetting cockpit env cannot remove the out-of-process filesystem boundary')
  })

  check('provider write scope is current-run/kind exact and excludes sibling history', () => {
    const current = baseRun({ runRoot: 'analyses/ACME_2099-01-01' })
    assert.deepEqual(providerWritablePaths(current), [path.join(REPO_ROOT, 'analyses/ACME_2099-01-01')])
    const review = baseRun({
      kind: 'review', runRoot: 'analyses/ACME_2099-01-01',
      writeTargetsAbs: [path.join(REPO_ROOT, 'analyses/ACME_2099-01-01/reviews')],
    })
    assert.deepEqual(providerWritablePaths(review), [path.join(REPO_ROOT, 'analyses/ACME_2099-01-01/reviews')])
    assert.ok(!providerWritablePaths(review).some((candidate) => candidate.includes('OTHER_2099')))
  })

  check('parity snapshot identity accepts a canonical root behind the data parent symlink only', () => {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-parity-data-root-'))
    try {
      const mountedData = path.join(fixture, 'mounted-data')
      const repoData = path.join(fixture, 'data')
      const subjectRoot = path.join(mountedData, 'AMZN')
      fs.mkdirSync(subjectRoot, { recursive: true })
      fs.symlinkSync(mountedData, repoData, 'dir')
      assert.equal(paritySnapshotRootMatchesDataSubject(subjectRoot, repoData, 'AMZN'), true)
      fs.mkdirSync(path.join(mountedData, 'OTHER'))
      assert.equal(paritySnapshotRootMatchesDataSubject(path.join(mountedData, 'OTHER'), repoData, 'AMZN'), false)
      assert.equal(paritySnapshotRootMatchesDataSubject(path.join(mountedData, 'MISSING'), repoData, 'AMZN'), false)
      fs.symlinkSync(subjectRoot, path.join(mountedData, 'LINKED'))
      assert.equal(paritySnapshotRootMatchesDataSubject(path.join(mountedData, 'LINKED'), mountedData, 'LINKED'), false)
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true })
    }
  })

  check('tracked Claude cwd is a disposable mirror, never the durable repository', () => {
    const mirror = createClaudeMirrorWorkspace(REPO_ROOT)
    try {
      assert.notEqual(mirror.cwd, REPO_ROOT)
      assert.equal(fs.lstatSync(path.join(mirror.cwd, '.claude')).isDirectory(), true)
      assert.equal(fs.lstatSync(path.join(mirror.cwd, '.claude')).isSymbolicLink(), false)
      assert.equal(fs.lstatSync(path.join(mirror.cwd, 'CLAUDE.md')).isFile(), true)
      assert.equal(fs.lstatSync(path.join(mirror.cwd, 'CLAUDE.md')).isSymbolicLink(), false)
      assert.equal(
        fs.readFileSync(path.join(mirror.cwd, '.claude', 'commands', 'research', 'business-model.md'), 'utf8'),
        fs.readFileSync(path.join(REPO_ROOT, '.claude', 'commands', 'research', 'business-model.md'), 'utf8'),
      )
      assert.equal(fs.existsSync(path.join(mirror.cwd, '.claude', 'settings.json')), false)
      assert.equal(fs.existsSync(path.join(mirror.cwd, '.claude', 'settings.local.json')), false)
      assert.equal(fs.lstatSync(path.join(mirror.cwd, '.git')).isFile(), true)
      mirror.validate()
      fs.writeFileSync(path.join(mirror.cwd, 'forged-extra'), 'x')
      assert.throws(mirror.validate, /topology changed/)
    } finally { mirror.cleanup() }
    assert.equal(fs.existsSync(mirror.cwd), false)
  })

  check('tracked Claude enables only pinned project command discovery', () => {
    assert.equal(CLAUDE_TRACKED_SETTING_SOURCES, 'project')
    const source = fs.readFileSync(path.join(REPO_ROOT, 'ui/server/src/providers/claude.ts'), 'utf8')
    assert.match(source, /'--setting-sources', CLAUDE_TRACKED_SETTING_SOURCES/)
    assert.doesNotMatch(source, /'--setting-sources',\s*''/)
  })

  check('tracked Claude project projection is immutable and excludes interactive settings', () => {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-claude-project-program-'))
    try {
      const repo = path.join(fixture, 'repo')
      fs.mkdirSync(path.join(repo, '.claude', 'commands', 'research'), { recursive: true })
      fs.writeFileSync(path.join(repo, 'CLAUDE.md'), 'doctrine\n')
      fs.writeFileSync(path.join(repo, '.claude', 'commands', 'research', 'full.md'), 'canonical\n')
      fs.writeFileSync(path.join(repo, '.claude', 'settings.json'), '{"permissions":{"allow":["Bash"]}}\n')
      fs.writeFileSync(path.join(repo, '.claude', 'settings.local.json'), '{"hooks":{}}\n')
      fs.mkdirSync(path.join(repo, '.claude', 'tools', '.venv', 'bin'), { recursive: true })
      fs.symlinkSync(process.execPath, path.join(repo, '.claude', 'tools', '.venv', 'bin', 'python'))
      fs.writeFileSync(path.join(repo, '.claude', 'untracked-runtime-cache'), 'generated\n')
      fs.mkdirSync(path.join(repo, 'data'))
      execFileSync('git', ['init', '-q'], { cwd: repo })
      execFileSync('git', ['add', '-f', 'CLAUDE.md', '.claude/commands/research/full.md',
        '.claude/settings.json', '.claude/settings.local.json'], { cwd: repo })
      const mirror = createClaudeMirrorWorkspace(repo)
      try {
        const projected = path.join(mirror.cwd, '.claude', 'commands', 'research', 'full.md')
        assert.equal(fs.readFileSync(projected, 'utf8'), 'canonical\n')
        assert.equal(fs.existsSync(path.join(mirror.cwd, '.claude', 'settings.json')), false)
        assert.equal(fs.existsSync(path.join(mirror.cwd, '.claude', 'settings.local.json')), false)
        assert.equal(fs.existsSync(path.join(mirror.cwd, '.claude', 'tools', '.venv')), false)
        assert.equal(fs.existsSync(path.join(mirror.cwd, '.claude', 'untracked-runtime-cache')), false)
        fs.chmodSync(projected, 0o600)
        fs.writeFileSync(projected, 'forged\n')
        assert.throws(mirror.validate, /project projection changed before spawn/)
      } finally { mirror.cleanup() }

      const second = createClaudeMirrorWorkspace(repo)
      try {
        fs.writeFileSync(path.join(repo, '.claude', 'commands', 'research', 'full.md'), 'changed\n')
        assert.throws(second.validate, /project source changed before spawn/)
      } finally { second.cleanup() }

      fs.writeFileSync(path.join(repo, '.claude', 'commands', 'research', 'full.md'), 'canonical\n')
      const third = createClaudeMirrorWorkspace(repo)
      try {
        fs.writeFileSync(path.join(repo, '.claude', 'commands', 'research', 'newly-reviewed.md'), 'new\n')
        execFileSync('git', ['add', '.claude/commands/research/newly-reviewed.md'], { cwd: repo })
        assert.throws(third.validate, /project file manifest changed before spawn/)
      } finally { third.cleanup() }
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true })
    }
  })

  check('tracked Claude mirrors the declared production data symlink without widening root-link trust', () => {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-claude-mirror-'))
    try {
      const repo = path.join(fixture, 'repo')
      const pool = path.join(fixture, 'mounted-pool')
      const replacement = path.join(fixture, 'replacement-pool')
      fs.mkdirSync(repo)
      fs.mkdirSync(pool)
      fs.mkdirSync(replacement)
      fs.mkdirSync(path.join(repo, 'scripts'))
      fs.writeFileSync(path.join(pool, 'pool-sentinel'), 'canonical')
      const data = path.join(repo, 'data')
      fs.symlinkSync(pool, data, 'dir')
      const mirror = createClaudeMirrorWorkspace(repo, data)
      try {
        assert.equal(fs.readlinkSync(path.join(mirror.cwd, 'data')), fs.realpathSync(pool))
        assert.equal(fs.readFileSync(path.join(mirror.cwd, 'data', 'pool-sentinel'), 'utf8'), 'canonical')
        mirror.validate()
        fs.unlinkSync(data)
        fs.symlinkSync(replacement, data, 'dir')
        assert.throws(mirror.validate, /source link changed before spawn/,
          'a configured-link swap after mirror creation must fail closed')
      } finally { mirror.cleanup() }

      fs.symlinkSync(pool, path.join(repo, 'undeclared-root-link'), 'dir')
      assert.throws(() => createClaudeMirrorWorkspace(repo, data), /undeclared repository-root symlink/,
        'only the configured data projection may be a repository-root link')
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true })
    }
  })

  check('tracked Claude rejects an invalid configured data-root declaration before creating a mirror', () => {
    const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-claude-mirror-config-'))
    try {
      const repo = path.join(fixture, 'repo')
      fs.mkdirSync(repo)
      assert.throws(
        () => createClaudeMirrorWorkspace(repo, path.join(fixture, 'some-other-root')),
        /configured data root to be the repository data entry/,
      )
      fs.mkdirSync(path.join(repo, 'scripts'))
      fs.symlinkSync(path.join(repo, 'scripts'), path.join(repo, 'data'), 'dir')
      assert.throws(
        () => createClaudeMirrorWorkspace(repo, path.join(repo, 'data')),
        /could not pin the configured data-root symlink/,
        'the declared name cannot launder an in-repository directory into the external data capability',
      )
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true })
    }
  })

  check('canonical manifests are supervisor-state paths, independent of a child-controlled run root', () => {
    const escaped = baseRun({ runRoot: '../../outside', executionAttempts: [{}] })
    const manifest = canonicalManifestPath(escaped)
    assert.doesNotMatch(manifest, /outside/)
    assert.match(fs.readFileSync(manifest, 'utf8'), /"decision_artifacts":\[\]/)
  })
} finally {
  for (const root of cleanupRoots) fs.rmSync(root, { recursive: true, force: true })
}

console.log(`\n${passed} checks passed`)
