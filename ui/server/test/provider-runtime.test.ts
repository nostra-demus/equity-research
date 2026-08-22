// Provider-neutral runtime contract: supervisor-owned attempts, immutable profiles, and trusted resume.
// Run: npx tsx test/provider-runtime.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { REPO_ROOT } from '../src/config'
import { getCreditStatus, setCreditStatus } from '../src/credit'
import {
  beginExecutionAttempt, canonicalManifestJsonl, canonicalManifestPath,
  hasLegacyPriorUnattributed, readLastProviderSelection,
} from '../src/execution-provenance'
import { applySupervisorPublicationEnv, providerWritablePaths } from '../src/launcher'
import { claudeChildEnv, claudeSandboxSettings, createClaudeMirrorWorkspace, isClaudeMaxAuth } from '../src/providers/claude'
import { codexChildEnv } from '../src/providers/codex'
import type { RunState } from '../src/registry'
import type { ProviderLaunchContext } from '../src/providers/types'

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
    assert.equal(claudeChildEnv(source).CLAUDE_CODE_OAUTH_TOKEN, undefined)
    assert.equal(claudeChildEnv({ ...source, NOSTRA_PUBLICATION_SOCKET: '/tmp/fixture.sock' }).NOSTRA_PUBLICATION_SOCKET,
      '/tmp/fixture.sock')
  })

  check('tracked Claude is Max-auth-only and OS-denies Git/code/archive writes independently of env', () => {
    assert.equal(isClaudeMaxAuth({ loggedIn: true, authMethod: 'claude.ai', apiProvider: 'firstParty', subscriptionType: 'max' }), true)
    assert.equal(isClaudeMaxAuth({ loggedIn: true, authMethod: 'apiKey', apiProvider: 'firstParty', subscriptionType: 'max' }), false)
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
      publicationSocketPath: '/tmp/nostra-publication-fixture/publication.sock',
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
      ['/tmp/nostra-publication-fixture/publication.sock'])
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

  check('tracked Claude cwd is a disposable mirror, never the durable repository', () => {
    const mirror = createClaudeMirrorWorkspace(REPO_ROOT)
    try {
      assert.notEqual(mirror.cwd, REPO_ROOT)
      assert.equal(fs.lstatSync(path.join(mirror.cwd, '.claude')).isSymbolicLink(), true)
      assert.equal(fs.lstatSync(path.join(mirror.cwd, '.git')).isFile(), true)
      mirror.validate()
      fs.writeFileSync(path.join(mirror.cwd, 'forged-extra'), 'x')
      assert.throws(mirror.validate, /topology changed/)
    } finally { mirror.cleanup() }
    assert.equal(fs.existsSync(mirror.cwd), false)
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
