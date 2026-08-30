// Continue reused-output write boundary.
// Run: npx tsx test/continue-output-protection.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import {
  bindPreparedImmutableReusedOutputsForTest,
  potentialOutputLineagePathsForTest,
  providerProtectionPathsForTest,
  providerWritablePaths,
  verifyPreparedImmutableReusedOutputsForTest,
} from '../src/launcher'
import { DATA_DIR, REPO_ROOT } from '../src/config'
import { claudeSandboxSettings } from '../src/providers/claude'
import { codexSandboxConfig } from '../src/providers/codex'
import { createRun } from '../src/registry'
import type { ExpectedAgent, RunState } from '../src/registry'
import type { ProviderLaunchContext, RunProvider } from '../src/providers/types'

const fixtureRoot = path.join(REPO_ROOT, 'analyses', `.continue-output-protection-${process.pid}`)

const executionProfile = (provider: RunProvider) => provider === 'claude'
  ? { key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' as const }
  : { key: 'codex:gpt-test:default', parentModel: 'gpt-test', parentReasoning: 'default' as const }

const buildRun = (
  provider: RunProvider,
  kind: 'full' | 'module',
  runRoot: string,
  expected: Map<string, ExpectedAgent>,
): RunState => createRun({
  kind,
  ticker: 'ZZIMMUTABLE',
  ...(kind === 'module' ? { module: 'earnings' } : {}),
  provider,
  model: provider === 'claude' ? 'sonnet' : 'gpt-test',
  reasoningLevel: 'default',
  profileKey: provider === 'claude' ? 'claude:sonnet:default' : 'codex:gpt-test:default',
  executionProfile: executionProfile(provider),
  prompt: kind === 'full' ? '/research:full ZZIMMUTABLE' : '/research:earnings ZZIMMUTABLE',
  user: 'tester',
  userVia: 'local',
  runRoot,
  willCommitToMain: true,
  writeTargetsAbs: [],
  coveredModules: kind === 'full' ? ['earnings'] : ['earnings'],
  readDepsAbs: [],
  expected: new Map(expected),
})

const providerContext = (run: RunState, protection: ReturnType<typeof providerProtectionPathsForTest>): ProviderLaunchContext => ({
  prompt: run.prompt,
  kind: run.kind,
  profile: {
    provider: run.provider,
    profileKey: run.profileKey,
    model: run.model,
    reasoningLevel: run.reasoningLevel,
    executionProfile: run.executionProfile,
  },
  cwd: REPO_ROOT,
  additionalWritableDataRoot: DATA_DIR,
  writablePaths: providerWritablePaths(run),
  protectedWritePaths: protection.protectedWritePaths,
  protectedReadPaths: protection.protectedReadPaths,
  readOnlyCapabilityPaths: [],
  env: { PATH: '/bin', NOSTRA_COCKPIT_RUN: '1' },
  guard: { maxTurns: 1, budgetUsd: 1 },
})

try {
  fs.rmSync(fixtureRoot, { recursive: true, force: true })
  fs.mkdirSync(fixtureRoot, { recursive: true })

  for (const kind of ['full', 'module'] as const) {
    const caseRoot = path.join(fixtureRoot, kind)
    const runRoot = path.relative(REPO_ROOT, caseRoot)
    const reused: ExpectedAgent = {
      key: 'earnings/01_reused', module: 'earnings', name: 'Reused', layer: 1,
      outputRel: 'earnings/01_reused.md',
    }
    const payable: ExpectedAgent = {
      key: 'earnings/02_payable', module: 'earnings', name: 'Payable', layer: 2,
      outputRel: 'earnings/02_payable.md',
    }
    const expected = new Map([[reused.key, reused], [payable.key, payable]])
    const reusedAbs = path.join(caseRoot, reused.outputRel)
    const payableAbs = path.join(caseRoot, payable.outputRel)
    fs.mkdirSync(path.dirname(reusedAbs), { recursive: true })
    fs.writeFileSync(reusedAbs, 'lineage-attested reused bytes\n')
    fs.writeFileSync(payableAbs, 'old payable bytes may be replaced\n')

    const protections = new Map<RunProvider, ReturnType<typeof providerProtectionPathsForTest>>()
    for (const provider of ['claude', 'codex'] as const) {
      const run = buildRun(provider, kind, runRoot, expected)
      bindPreparedImmutableReusedOutputsForTest(run, [reused.key])
      verifyPreparedImmutableReusedOutputsForTest(run)

      const protection = providerProtectionPathsForTest(run)
      protections.set(provider, protection)
      assert.ok(protection.protectedWritePaths.includes(reusedAbs),
        `${provider} ${kind} Continue protects an already-paid exact output`)
      assert.ok(!protection.protectedWritePaths.includes(payableAbs),
        `${provider} ${kind} Continue leaves the payable exact output writable`)
      assert.ok(!potentialOutputLineagePathsForTest(run).includes(reused.outputRel),
        `${provider} ${kind} Continue cannot re-attest a reused output`)
      assert.ok(potentialOutputLineagePathsForTest(run).includes(payable.outputRel),
        `${provider} ${kind} Continue still settles newly payable output lineage`)

      if (provider === 'claude') {
        const settings: any = claudeSandboxSettings(providerContext(run, protection))
        assert.ok(settings.sandbox.filesystem.denyWrite.includes(reusedAbs),
          'Claude OS-denies writes to the reused exact file')
        assert.ok(!settings.sandbox.filesystem.denyWrite.includes(payableAbs),
          'Claude does not deny the payable exact file')
      } else {
        const config = codexSandboxConfig({
          repoRoot: REPO_ROOT,
          dataRoot: DATA_DIR,
          leaseAuthPath: path.join(fixtureRoot, 'codex-lease', 'auth.json'),
          sourceAuthPath: path.join(fixtureRoot, 'codex-source', 'auth.json'),
          writablePaths: providerWritablePaths(run),
          protectedWritePaths: protection.protectedWritePaths,
          protectedReadPaths: protection.protectedReadPaths,
          readOnlyCapabilityPaths: [],
        })
        assert.ok(config.includes(`${JSON.stringify(reusedAbs)} = "read"`),
          'Codex reduces the reused exact file from its writable parent to read-only')
        assert.ok(!config.includes(`${JSON.stringify(payableAbs)} = "read"`),
          'Codex leaves the payable exact file under the writable parent')
      }
    }
    assert.deepEqual(
      protections.get('claude')?.protectedWritePaths,
      protections.get('codex')?.protectedWritePaths,
      `${kind} Continue gives Claude and Codex the identical immutable-output boundary`,
    )

    const tamperRun = buildRun('codex', kind, runRoot, expected)
    bindPreparedImmutableReusedOutputsForTest(tamperRun, [reused.key])
    fs.writeFileSync(reusedAbs, 'tampered reused bytes\n')
    assert.throws(
      () => verifyPreparedImmutableReusedOutputsForTest(tamperRun),
      /reused Continue output changed across the paid child boundary/,
      `${kind} Continue fails its post-child exact-byte proof after any reused-output change`,
    )
  }

  const launcherSource = fs.readFileSync(path.join(REPO_ROOT, 'ui/server/src/launcher.ts'), 'utf8')
  assert.match(launcherSource,
    /await transaction\.activate\(\)[\s\S]*?bindPreparedImmutableReusedOutputs\(run, transaction\.preparation\.doneOrbKeys\)/,
    'every prepared Continue binds its immutable reused-output set before provider construction')
  assert.match(launcherSource,
    /function captureRunOutputLineage[\s\S]*?verifyPreparedImmutableReusedOutputs\(run\)[\s\S]*?captureOutputLineageAttempt/,
    'the final synchronous pre-spawn boundary verifies immutable reused bytes')
  assert.match(launcherSource,
    /function settleRunOutputLineage[\s\S]*?verifyPreparedImmutableReusedOutputs\(run\)[\s\S]*?settleOutputLineageAttempt/,
    'the post-process-extinction boundary verifies immutable reused bytes before settlement')

  console.log('continue output protection tests passed')
} finally {
  fs.rmSync(fixtureRoot, { recursive: true, force: true })
}
