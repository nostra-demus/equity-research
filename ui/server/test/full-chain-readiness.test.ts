// Full-chain readiness semantics + single-flight coordinator.
// Run: npx tsx test/full-chain-readiness.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  assessChainedReadinessOnce,
  applyRunPolicyEnvForTest,
  bindExactModuleReadScopeForTest,
  cancel,
  cancelledChainStateCount,
  chainedReadinessStateCount,
  clearChainedReadiness,
  CONTINUATION_RUN_ROOT_ENV,
  decideReadiness,
  durableFrozenGenerationReceiptPathForTest,
  frozenEvidenceBindingForRunForTest,
  FROZEN_EVIDENCE_ROOT_ENV,
  FROZEN_POOL_BINDING_OUT_DIR_ENV,
  FROZEN_POOL_DATA_PATH_ENV,
  FROZEN_POOL_GENERATION_ENV,
  FROZEN_POOL_OUT_DIR_ENV,
  haltChain,
  liveDataPathAliasesForTest,
  mutablePoolProjectionReadAliasesForTest,
  readinessNeedsDecision,
  readinessProvesEmpty,
  readinessScopeForRun,
  providerProtectionPathsForTest,
  prepareProviderEvidenceBoundaryForTest,
  resolveChainedReadiness,
  waitForChainedReadinessResolution,
} from '../src/launcher'
import { exactModuleContinuationOnTerminal } from '../src/continuation'
import { DATA_DIR, REPO_ROOT } from '../src/config'
import { claudeSandboxSettings } from '../src/providers/claude'
import { codexSandboxConfig } from '../src/providers/codex'
import { createRun } from '../src/registry'
import type { ProviderLaunchContext } from '../src/providers/types'
import type { ReadinessIssue, ReadinessReport, RunKind } from '../src/types'

const run = (kind: RunKind, chained: boolean, module?: string) => ({ kind, chained, module })
const report = (
  overall: ReadinessReport['overall'],
  issues: ReadinessIssue[],
  fileCount = 1,
  usableCount = 1,
  physicalState: 'empty' | 'nonempty' | 'unknown' = fileCount > 0 ? 'nonempty' : 'unknown',
): ReadinessReport => ({
  ticker: 'ZZREADY', kind: 'full', overall, fileCount, usableCount,
  physicalPool: {
    state: physicalState,
    fileCount,
    nonEmptyFileCount: physicalState === 'nonempty' ? Math.max(0, fileCount) : 0,
  },
  entities: [], issues, ts: 123456,
})

assert.deepEqual(readinessScopeForRun(run('module', true, 'earnings')), { kind: 'full' },
  'a chained module inherits the full-decision readiness contract')
assert.deepEqual(readinessScopeForRun(run('rerun', true, 'master')), { kind: 'full' },
  'the chained terminal child keeps the exact same full-chain readiness scope')
assert.deepEqual(readinessScopeForRun(run('module', false, 'earnings')), { kind: 'module', module: 'earnings' },
  'a standalone module keeps its strict target-scoped readiness contract')
assert.deepEqual(readinessScopeForRun(run('full', false)), { kind: 'full', module: undefined })

const moduleCap = report('degraded', [{
  code: 'module_insufficient', severity: 'degrade', module: 'earnings', message: 'Earnings data is insufficient.',
}])
assert.equal(readinessNeedsDecision(run('module', true, 'earnings'), moduleCap), false,
  'non-empty module insufficiency caps the chain but never pauses a child')
assert.equal(readinessNeedsDecision(run('full', false), moduleCap), true,
  'ordinary standalone full launches preserve the existing operator review')
assert.equal(readinessNeedsDecision(run('module', false, 'earnings'), moduleCap), true,
  'standalone module launches remain strict')

const disagreement = report('degraded', [{
  code: 'entity_disagreement', severity: 'degrade', message: 'Entity mismatch.',
}])
assert.equal(readinessNeedsDecision(run('module', true, 'earnings'), disagreement), false,
  'non-empty degradation is handled in-run and never pauses an admitted chain child')
const technical = report('blocked', [{
  code: 'check_failed', severity: 'blocker', message: 'Checker failed.',
}], 0, 0, 'unknown')
assert.equal(readinessNeedsDecision(run('module', true, 'earnings'), technical), false,
  'an unknown technical failure is not falsely treated as proof that the pool is empty')

const zeroFiles = report('blocked', [{ code: 'zero_files', severity: 'blocker', message: 'No files.' }], 0, 0, 'empty')
assert.equal(readinessProvesEmpty(zeroFiles), true)
assert.equal(readinessNeedsDecision(run('module', true, 'earnings'), zeroFiles), true,
  'a proven zero-file pool creates the chain\'s one allowed user gate')
const zeroUsable = report('blocked', [{
  code: 'zero_usable_data', severity: 'blocker', message: 'No usable files.',
}], 3, 0, 'nonempty')
assert.equal(readinessProvesEmpty(zeroUsable), false)
assert.equal(readinessNeedsDecision(run('module', true, 'earnings'), zeroUsable), false,
  'non-empty unreadable/corrupt/unsupported data is not mistaken for an empty pool')
const allZeroBytes = report('blocked', [{
  code: 'zero_usable_data', severity: 'blocker', message: 'Every physical input is zero bytes.',
}], 3, 0, 'empty')
assert.equal(readinessProvesEmpty(allZeroBytes), true)
assert.equal(readinessNeedsDecision(run('module', true, 'earnings'), allZeroBytes), true,
  'a complete proof that every physical input is zero bytes creates the one empty-data gate')
const contradictoryEmpty = report('blocked', [{
  code: 'zero_files', severity: 'blocker', message: 'stale issue',
}], 2, 2, 'empty')
assert.equal(readinessProvesEmpty(contradictoryEmpty), false,
  'an issue label without matching counts is not proof of absence')
const legacyEmptyWithoutPhysicalProof: ReadinessReport = {
  ticker: 'ZZREADY', kind: 'full', overall: 'blocked', fileCount: 0, usableCount: 0,
  entities: [], issues: [{ code: 'zero_files', severity: 'blocker', message: 'old event' }], ts: 1,
}
assert.equal(readinessProvesEmpty(legacyEmptyWithoutPhysicalProof), false,
  'a legacy zero count without an explicit complete physical proof is never treated as empty')

if (process.platform !== 'win32') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-live-pool-alias-'))
  const real = path.join(root, 'drive-target')
  const alias = path.join(root, 'data-link')
  fs.mkdirSync(real)
  fs.symlinkSync(real, alias, 'dir')
  try {
    const denied = liveDataPathAliasesForTest(alias)
    assert.ok(denied.includes(path.resolve(alias)), 'the lexical DATA_DIR subject path is denied')
    assert.ok(denied.includes(fs.realpathSync(alias)), 'the resolved Drive target is denied too')
    assert.ok(!denied.includes(path.join(root, 'immutable-generation')),
      'the immutable evidence root is not accidentally denied with the live aliases')
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
}

function canonicalGenerationJson(value: unknown): string {
  if (value === null) return 'null'
  if (typeof value === 'string' || typeof value === 'boolean' || typeof value === 'number') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(canonicalGenerationJson).join(',')}]`
  const record = value as Record<string, unknown>
  const compareCodePoints = (left: string, right: string) => {
    const a = [...left].map((item) => item.codePointAt(0) ?? 0)
    const b = [...right].map((item) => item.codePointAt(0) ?? 0)
    for (let index = 0; index < Math.min(a.length, b.length); index++) {
      if (a[index] !== b[index]) return a[index] - b[index]
    }
    return a.length - b.length
  }
  return `{${Object.keys(record).sort(compareCodePoints).map((key) =>
    `${JSON.stringify(key)}:${canonicalGenerationJson(record[key])}`).join(',')}}`
}

function makeTreeWritable(root: string): void {
  if (process.platform === 'win32' || !fs.existsSync(root)) return
  const visit = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && !entry.isSymbolicLink()) visit(path.join(directory, entry.name))
    }
    fs.chmodSync(directory, 0o755)
  }
  visit(root)
}

function writeFrozenReceipt(
  binding: { ticker: string; runRoot: string },
  rawRels: string[] = ['sample.txt'],
  options: {
    sourceExtras?: Record<string, unknown>
    entities?: unknown[]
    bindingJsonTransform?: (value: string) => string
  } = {},
) {
  const dataPath = path.join(DATA_DIR, binding.ticker)
  const outDir = path.join(REPO_ROOT, binding.runRoot, '_pool_extracts')
  const rawPrefix = `raw/${binding.ticker}`
  const rawEntries = rawRels.map((rawRel) => {
    const raw = Buffer.from(`immutable sample evidence: ${rawRel}\n`)
    return { rawRel, raw, digest: createHash('sha256').update(raw).digest('hex') }
  })
  const inputs = Object.fromEntries(rawEntries.map(({ rawRel, digest }) => [rawRel, digest]))
  const artifacts = Object.fromEntries(rawEntries.map(({ rawRel, digest }) => [`${rawPrefix}/${rawRel}`, digest]))
  const localizedSources = rawEntries.map(({ rawRel }) => ({
    ...(options.sourceExtras ?? {}),
    file: rawRel, path: rawRel, extract: `${rawPrefix}/${rawRel}`, sheets: [],
  }))
  const entities: unknown[] = options.entities ?? []
  const bindingPayload = {
    schema_version: 'pool-generation/v2',
    binding_format: 'python-json-sort-keys-compact-utf8/v1',
    data_path: dataPath,
    out_dir: outDir,
    vision_mode: false,
    offline_extraction_complete: true,
    raw_prefix: rawPrefix,
    inputs,
    sources: localizedSources,
    entities,
    artifacts,
  }
  const defaultBindingJson = canonicalGenerationJson(bindingPayload)
  const bindingJson = options.bindingJsonTransform?.(defaultBindingJson) ?? defaultBindingJson
  const generationDigest = createHash('sha256').update(bindingJson, 'utf8').digest('hex')
  const generationDir = path.join(outDir, '.extract-generations', generationDigest)
  fs.mkdirSync(path.join(generationDir, rawPrefix), { recursive: true })
  for (const { rawRel, raw } of rawEntries) {
    fs.mkdirSync(path.dirname(path.join(generationDir, rawPrefix, rawRel)), { recursive: true })
    fs.writeFileSync(path.join(generationDir, rawPrefix, rawRel), raw)
  }
  fs.writeFileSync(path.join(generationDir, 'manifest.json'), JSON.stringify({
    data_path: dataPath,
    out_dir: outDir,
    vision_mode: false,
    offline_extraction_complete: true,
    sources: localizedSources.map((source) => ({
      ...source,
      extract: `.extract-generations/${generationDigest}/${source.extract}`,
    })),
    entities,
    generation: {
      schema_version: 'pool-generation/v2',
      digest: generationDigest,
      binding_json: bindingJson,
      raw_prefix: rawPrefix,
      inputs,
      artifacts,
    },
  }))
  if (process.platform !== 'win32') {
    for (const root of [path.join(generationDir, rawPrefix), path.join(generationDir, 'raw'), generationDir]) {
      for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
        if (entry.isFile()) fs.chmodSync(path.join(root, entry.name), 0o444)
      }
      fs.chmodSync(root, 0o555)
    }
  }
  return {
    dataPath,
    outDir,
    generationDigest,
    generationDir,
    evidenceRoot: path.join(generationDir, rawPrefix),
  }
}

async function durableRestartChecks() {
  const stateDir = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-frozen-receipt-')))
  const roots: string[] = []
  const liveRoots: string[] = []
  const cleanupBinding = (binding: { ticker: string; runRoot: string }) => {
    clearChainedReadiness(`persist-${binding.ticker}`)
    clearChainedReadiness(`restart-${binding.ticker}`)
    clearChainedReadiness(`failure-${binding.ticker}`)
  }
  try {
    // Simulate a process restart by dropping the in-memory chain map while retaining STATE_DIR. The saved
    // root is deliberately yesterday-shaped and the live pool changes before Continue. No evaluator call
    // is permitted on the second chain: only the exact immutable generation may be re-verified and reused.
    const retainedBinding = { ticker: 'ZZDURABLE', runRoot: 'analyses/ZZDURABLE_2099-02-01' }
    roots.push(retainedBinding.runRoot)
    const retainedFrozen = writeFrozenReceipt(retainedBinding)
    const retainedReport: ReadinessReport = {
      ...disagreement,
      ticker: retainedBinding.ticker,
      frozenPool: retainedFrozen,
    }
    let freshEvaluations = 0
    const initial = await assessChainedReadinessOnce(
      `persist-${retainedBinding.ticker}`,
      'initial-owner',
      retainedBinding,
      async () => { freshEvaluations++; return retainedReport },
      { stateDir },
    )
    assert.equal(freshEvaluations, 1)
    assert.equal(initial.frozenPool?.generationDigest, retainedFrozen.generationDigest)
    const receiptPath = durableFrozenGenerationReceiptPathForTest(retainedBinding, stateDir)
    const distinctPath = durableFrozenGenerationReceiptPathForTest({
      ticker: retainedBinding.ticker,
      runRoot: 'analyses/ZZDURABLE_2099-02-02',
    }, stateDir)
    assert.notEqual(receiptPath, distinctPath, 'two dated roots for one ticker can never share a receipt key')
    assert.throws(
      () => durableFrozenGenerationReceiptPathForTest({
        ticker: retainedBinding.ticker,
        runRoot: 'analyses/ZZDURABLE_2099-02-01/../ZZDURABLE_2099-02-02',
      }, stateDir),
      /invalid exact run-root binding/,
      'run-root aliases and traversal are rejected instead of acquiring a second receipt identity',
    )
    const receiptStat = fs.lstatSync(receiptPath)
    assert.ok(receiptStat.isFile() && !receiptStat.isSymbolicLink())
    if (process.platform !== 'win32') {
      assert.equal(receiptStat.mode & 0o077, 0, 'the restart receipt is owner-only')
    }
    clearChainedReadiness(`persist-${retainedBinding.ticker}`)
    assert.equal(fs.existsSync(receiptPath), true,
      'normal chain cleanup retains the receipt for restart and cross-midnight Continue')

    const liveRoot = path.join(DATA_DIR, retainedBinding.ticker)
    liveRoots.push(liveRoot)
    fs.mkdirSync(liveRoot, { recursive: true })
    fs.writeFileSync(path.join(liveRoot, 'arrived-after-first-attempt.txt'), 'new live evidence\n')
    const restartChainId = `restart-${retainedBinding.ticker}`
    const retainedRun = createRun({
      kind: 'module', ticker: retainedBinding.ticker, module: 'earnings',
      provider: 'claude', model: 'haiku', reasoningLevel: 'default', profileKey: 'claude:haiku:default',
      executionProfile: { key: 'claude:haiku:default', parentModel: 'haiku', parentReasoning: 'default' },
      prompt: 'x', user: 'tester', userVia: 'local', runRoot: retainedBinding.runRoot,
      willCommitToMain: true, writeTargetsAbs: [], coveredModules: [], readDepsAbs: [],
      chained: true, chainId: restartChainId,
    })
    let restartEvaluations = 0
    const observedLiveReads: string[] = []
    const mutableFs = fs as unknown as Record<string, (...args: any[]) => any>
    const observedMethods = ['lstatSync', 'statSync', 'readdirSync', 'openSync', 'readFileSync', 'realpathSync']
    const originals = new Map<string, (...args: any[]) => any>()
    for (const name of observedMethods) {
      const original = mutableFs[name]
      originals.set(name, original)
      mutableFs[name] = (...args: any[]) => {
        if (typeof args[0] === 'string') {
          const candidate = path.resolve(args[0])
          if (candidate === liveRoot || candidate.startsWith(`${liveRoot}${path.sep}`)) {
            observedLiveReads.push(`${name}:${candidate}`)
          }
        }
        return Reflect.apply(original, fs, args)
      }
    }
    let restarted: Awaited<ReturnType<typeof assessChainedReadinessOnce>>
    try {
      restarted = await assessChainedReadinessOnce(
        restartChainId,
        retainedRun.runId,
        retainedBinding,
        async () => {
          restartEvaluations++
          throw new Error('Continue must not read or re-freeze the changed live pool')
        },
        { stateDir, requireExistingReceipt: true },
      )
    } finally {
      for (const [name, original] of originals) mutableFs[name] = original
    }
    assert.equal(restartEvaluations, 0,
      'cross-midnight/restart Continue never invokes the live-pool evaluator')
    assert.deepEqual(observedLiveReads, [],
      'loading and verifying a retained receipt performs zero filesystem reads inside live DATA_DIR')
    assert.equal(restarted.frozenPool?.generationDigest, retainedFrozen.generationDigest,
      'cross-midnight/restart Continue reuses the exact original generation')
    assert.equal(readinessNeedsDecision(retainedRun, restarted.report), false,
      'exact module Continue auto-proceeds with non-empty saved evidence and never asks for a human decision')
    const receiptBeforeRejectedRecheck = fs.readFileSync(receiptPath)
    retainedRun.status = 'awaiting-readiness-decision'
    const rejectedRecheck = await decideReadiness(retainedRun.runId, 'recheck', 'tester')
    assert.equal(rejectedRecheck.ok, false)
    assert.equal(rejectedRecheck.httpStatus, 409,
      'Continue cannot initiate a live-data re-check that would replace its saved generation')
    assert.deepEqual(fs.readFileSync(receiptPath), receiptBeforeRejectedRecheck,
      'a rejected Continue re-check leaves the durable receipt byte-identical')
    const cancelledRetainedRun = await decideReadiness(retainedRun.runId, 'cancel', 'tester')
    assert.equal(cancelledRetainedRun.ok, true)
    clearChainedReadiness(restartChainId)
    assert.deepEqual(fs.readFileSync(receiptPath), receiptBeforeRejectedRecheck,
      'cancelling an unfinished run retains its exact receipt for a later explicit Continue')

    const copiedBinding = { ticker: 'ZZCOPYGEN', runRoot: 'analyses/ZZCOPYGEN_2099-02-05' }
    roots.push(copiedBinding.runRoot)
    writeFrozenReceipt(copiedBinding)
    const copiedPath = durableFrozenGenerationReceiptPathForTest(copiedBinding, stateDir)
    fs.copyFileSync(receiptPath, copiedPath)
    if (process.platform !== 'win32') fs.chmodSync(copiedPath, 0o600)
    let copiedEvaluations = 0
    await assert.rejects(
      assessChainedReadinessOnce(
        `failure-${copiedBinding.ticker}`,
        'copied-owner',
        copiedBinding,
        async () => { copiedEvaluations++; return retainedReport },
        { stateDir, requireExistingReceipt: true },
      ),
      /corrupt or belongs to another run/,
      'copying or renaming another root receipt cannot authorize saved output',
    )
    assert.equal(copiedEvaluations, 0, 'a copied receipt fails before live extraction')
    clearChainedReadiness(`failure-${copiedBinding.ticker}`)

    const missingBinding = { ticker: 'ZZMISSGEN', runRoot: 'analyses/ZZMISSGEN_2099-02-02' }
    roots.push(missingBinding.runRoot)
    writeFrozenReceipt(missingBinding)
    let missingEvaluations = 0
    await assert.rejects(
      assessChainedReadinessOnce(
        `failure-${missingBinding.ticker}`,
        'missing-owner',
        missingBinding,
        async () => { missingEvaluations++; return { ...retainedReport, ticker: missingBinding.ticker } },
        { stateDir, requireExistingReceipt: true },
      ),
      /no frozen generation receipt/,
      'saved output without its durable receipt fails before provider spend',
    )
    assert.equal(missingEvaluations, 0, 'a missing receipt never falls back to live extraction')
    clearChainedReadiness(`failure-${missingBinding.ticker}`)

    const corruptBinding = { ticker: 'ZZBADGEN', runRoot: 'analyses/ZZBADGEN_2099-02-03' }
    roots.push(corruptBinding.runRoot)
    const corruptFrozen = writeFrozenReceipt(corruptBinding)
    const corruptReport: ReadinessReport = {
      ...retainedReport, ticker: corruptBinding.ticker, frozenPool: corruptFrozen,
    }
    await assessChainedReadinessOnce(
      `persist-${corruptBinding.ticker}`,
      'corrupt-initial-owner',
      corruptBinding,
      async () => corruptReport,
      { stateDir },
    )
    clearChainedReadiness(`persist-${corruptBinding.ticker}`)
    fs.writeFileSync(durableFrozenGenerationReceiptPathForTest(corruptBinding, stateDir), '{broken\n', {
      mode: 0o600,
    })
    let corruptEvaluations = 0
    await assert.rejects(
      assessChainedReadinessOnce(
        `failure-${corruptBinding.ticker}`,
        'corrupt-restart-owner',
        corruptBinding,
        async () => { corruptEvaluations++; return corruptReport },
        { stateDir, requireExistingReceipt: true },
      ),
      /receipt is corrupt/,
      'a corrupt durable receipt fails closed before provider spend',
    )
    assert.equal(corruptEvaluations, 0, 'a corrupt receipt never falls back to live extraction')
    clearChainedReadiness(`failure-${corruptBinding.ticker}`)

    const vanishedBinding = { ticker: 'ZZVANISHGEN', runRoot: 'analyses/ZZVANISHGEN_2099-02-04' }
    roots.push(vanishedBinding.runRoot)
    const vanishedFrozen = writeFrozenReceipt(vanishedBinding)
    const vanishedReport: ReadinessReport = {
      ...retainedReport, ticker: vanishedBinding.ticker, frozenPool: vanishedFrozen,
    }
    await assessChainedReadinessOnce(
      `persist-${vanishedBinding.ticker}`,
      'vanished-initial-owner',
      vanishedBinding,
      async () => vanishedReport,
      { stateDir },
    )
    clearChainedReadiness(`persist-${vanishedBinding.ticker}`)
    makeTreeWritable(vanishedFrozen.generationDir)
    fs.rmSync(path.join(vanishedFrozen.generationDir, 'manifest.json'), { force: true })
    if (process.platform !== 'win32') fs.chmodSync(vanishedFrozen.generationDir, 0o555)
    let vanishedEvaluations = 0
    await assert.rejects(
      assessChainedReadinessOnce(
        `failure-${vanishedBinding.ticker}`,
        'vanished-restart-owner',
        vanishedBinding,
        async () => { vanishedEvaluations++; return vanishedReport },
        { stateDir, requireExistingReceipt: true },
      ),
      /manifest is unavailable/,
      'a durable receipt whose immutable generation vanished fails before provider spend',
    )
    assert.equal(vanishedEvaluations, 0, 'a vanished generation never falls back to live extraction')
    clearChainedReadiness(`failure-${vanishedBinding.ticker}`)

    const writeFailBinding = { ticker: 'ZZWRITEFAIL', runRoot: 'analyses/ZZWRITEFAIL_2099-02-06' }
    roots.push(writeFailBinding.runRoot)
    const writeFailFrozen = writeFrozenReceipt(writeFailBinding)
    const writeFailReport: ReadinessReport = {
      ...retainedReport, ticker: writeFailBinding.ticker, frozenPool: writeFailFrozen,
    }
    const blockedReceiptPath = durableFrozenGenerationReceiptPathForTest(writeFailBinding, stateDir)
    fs.mkdirSync(blockedReceiptPath)
    let writeFailEvaluations = 0
    await assert.rejects(
      assessChainedReadinessOnce(
        `failure-${writeFailBinding.ticker}`,
        'write-fail-owner',
        writeFailBinding,
        async () => { writeFailEvaluations++; return writeFailReport },
        { stateDir },
      ),
      /existing frozen generation receipt is unsafe/,
      'a receipt persistence failure rejects the readiness boundary before any provider can start',
    )
    assert.equal(writeFailEvaluations, 1, 'the free extractor completed exactly once before persistence failed')
    clearChainedReadiness(`failure-${writeFailBinding.ticker}`)
  } finally {
    for (const binding of [
      { ticker: 'ZZDURABLE', runRoot: 'analyses/ZZDURABLE_2099-02-01' },
      { ticker: 'ZZMISSGEN', runRoot: 'analyses/ZZMISSGEN_2099-02-02' },
      { ticker: 'ZZBADGEN', runRoot: 'analyses/ZZBADGEN_2099-02-03' },
      { ticker: 'ZZVANISHGEN', runRoot: 'analyses/ZZVANISHGEN_2099-02-04' },
      { ticker: 'ZZCOPYGEN', runRoot: 'analyses/ZZCOPYGEN_2099-02-05' },
      { ticker: 'ZZWRITEFAIL', runRoot: 'analyses/ZZWRITEFAIL_2099-02-06' },
    ]) cleanupBinding(binding)
    for (const runRoot of roots) {
      const absolute = path.join(REPO_ROOT, runRoot)
      try { makeTreeWritable(absolute) } catch { /* already absent */ }
      fs.rmSync(absolute, { recursive: true, force: true })
    }
    for (const liveRoot of liveRoots) fs.rmSync(liveRoot, { recursive: true, force: true })
    fs.rmSync(stateDir, { recursive: true, force: true })
  }
}

async function coordinatorChecks() {
  const baseline = chainedReadinessStateCount()
  const cancelledBaseline = cancelledChainStateCount()
  const chainId = `chain-single-${process.pid}`
  const binding = { ticker: 'ZZREADY', runRoot: 'analyses/ZZREADY_2099-01-01' }
  const exactFrozen = writeFrozenReceipt(binding)
  const frozenReport: ReadinessReport = {
    ...disagreement,
    frozenPool: exactFrozen,
  }
  let evaluations = 0
  let releaseEvaluation!: () => void
  const hold = new Promise<void>((resolve) => { releaseEvaluation = resolve })
  const evaluate = async () => { evaluations++; await hold; return frozenReport }
  const calls = [
    assessChainedReadinessOnce(chainId, 'run-a', binding, evaluate),
    assessChainedReadinessOnce(chainId, 'run-b', binding, evaluate),
    assessChainedReadinessOnce(chainId, 'run-c', binding, evaluate),
  ]
  await Promise.resolve()
  assert.equal(evaluations, 1, 'simultaneous children start exactly one evaluator')
  releaseEvaluation()
  const assessed = await Promise.all(calls)
  assert.equal(assessed.filter((item) => item.owner).length, 1,
    'simultaneous children elect exactly one decision owner')
  assert.ok(assessed.every((item) => item.report === frozenReport),
    'every child reuses the exact same report object')
  assert.ok(assessed.every((item) => item.frozenPool?.generationDigest === exactFrozen.generationDigest),
    'every child receives the one immutable extractor generation')

  let mismatchedEvaluations = 0
  await assert.rejects(
    assessChainedReadinessOnce(chainId, 'wrong-root', {
      ticker: 'ZZREADY', runRoot: 'analyses/ZZREADY_2099-01-02',
    }, async () => { mismatchedEvaluations++; return frozenReport }),
    /different ticker or run root/,
    'a reused chain id cannot cross an exact run-root binding',
  )
  assert.equal(mismatchedEvaluations, 0, 'binding mismatch rejects before evaluation or provider work')

  let laterEvaluations = 0
  const later = await assessChainedReadinessOnce(chainId, 'run-terminal-master', binding, async () => {
    laterEvaluations++
    throw new Error('a later child must never evaluate')
  })
  assert.equal(laterEvaluations, 0, 'a later dependency wave and terminal master never re-scan the pool')
  assert.equal(later.report, frozenReport, 'the terminal master gets the original exact chain receipt')
  assert.equal(later.owner, false)
  const envRun = createRun({
    kind: 'module', ticker: binding.ticker, module: 'earnings',
    provider: 'claude', model: 'haiku', reasoningLevel: 'default', profileKey: 'claude:haiku:default',
    executionProfile: { key: 'claude:haiku:default', parentModel: 'haiku', parentReasoning: 'default' },
    prompt: 'x', user: 'tester', userVia: 'local', runRoot: binding.runRoot,
    willCommitToMain: true, writeTargetsAbs: [], coveredModules: [], readDepsAbs: [],
    chained: true, chainId,
  })
  const frozenEnv = applyRunPolicyEnvForTest({
    [FROZEN_POOL_DATA_PATH_ENV]: '/stale/injected/data',
    [FROZEN_POOL_OUT_DIR_ENV]: '/stale/injected/out',
    [FROZEN_POOL_BINDING_OUT_DIR_ENV]: '/stale/injected/binding-out',
    [FROZEN_POOL_GENERATION_ENV]: 'f'.repeat(64),
    [FROZEN_EVIDENCE_ROOT_ENV]: '/stale/injected/evidence',
  }, envRun)
  assert.equal(frozenEnv[CONTINUATION_RUN_ROOT_ENV], binding.runRoot,
    'a fresh Claude Full child is pinned to the scheduler-captured root across midnight')
  const isolatedEvidence = frozenEvidenceBindingForRunForTest(envRun)!
  assert.equal(frozenEnv[FROZEN_POOL_DATA_PATH_ENV], frozenReport.frozenPool!.dataPath)
  assert.equal(frozenEnv[FROZEN_POOL_OUT_DIR_ENV], isolatedEvidence.capability.poolOutDir)
  assert.equal(frozenEnv[FROZEN_POOL_BINDING_OUT_DIR_ENV], frozenReport.frozenPool!.outDir,
    'the relocated capability retains the original logical generation binding')
  assert.equal(frozenEnv[FROZEN_POOL_GENERATION_ENV], frozenReport.frozenPool!.generationDigest,
    'the provider gets the supervisor receipt, never stale shell-level frozen values')
  assert.equal(frozenEnv[FROZEN_EVIDENCE_ROOT_ENV], isolatedEvidence.capability.evidenceRoot,
    'the provider sees only the private read capability evidence root')
  assert.ok(!path.resolve(isolatedEvidence.capability.root).startsWith(`${path.resolve(REPO_ROOT)}${path.sep}`),
    'the capability is outside the mutable repository namespace')
  assert.equal(
    fs.readFileSync(path.join(isolatedEvidence.capability.evidenceRoot, 'sample.txt'), 'utf8'),
    fs.readFileSync(path.join(frozenReport.frozenPool!.evidenceRoot, 'sample.txt'), 'utf8'),
    'the capability exposes the exact admitted evidence bytes',
  )
  assert.notEqual(frozenEnv[FROZEN_EVIDENCE_ROOT_ENV], frozenReport.frozenPool!.dataPath,
    'the evidence env never exposes the live Google Drive ticker folder')
  const codexRun = createRun({
    kind: 'module', ticker: binding.ticker, module: 'earnings',
    provider: 'codex', model: 'gpt-test', reasoningLevel: 'default', profileKey: 'codex:gpt-test:default',
    executionProfile: { key: 'codex:gpt-test:default', parentModel: 'gpt-test', parentReasoning: 'default' },
    prompt: 'x', user: 'tester', userVia: 'local', runRoot: binding.runRoot,
    willCommitToMain: true, writeTargetsAbs: [], coveredModules: [], readDepsAbs: [],
    chained: true, chainId,
  })
  const codexEnv = applyRunPolicyEnvForTest({}, codexRun)
  assert.equal(codexEnv[CONTINUATION_RUN_ROOT_ENV], binding.runRoot,
    'a fresh Codex Full child and terminal master use the same exact-root command contract')
  const parentRelationships = path.join(REPO_ROOT, binding.runRoot, 'relationships.json')
  fs.writeFileSync(parentRelationships, 'mutable parent compatibility projection\n')
  const mutableProjectionAliases = mutablePoolProjectionReadAliasesForTest(exactFrozen)
  const claudeProtection = providerProtectionPathsForTest(envRun)
  const codexProtection = providerProtectionPathsForTest(codexRun)
  assert.ok(mutableProjectionAliases.includes(path.resolve(exactFrozen.outDir)),
    'the whole original extract namespace is denied, including children created after spawn')
  assert.ok(mutableProjectionAliases.includes(path.resolve(parentRelationships)),
    'the mutable run-root compatibility projection is denied')
  for (const protection of [claudeProtection, codexProtection]) {
    assert.ok(protection.protectedReadPaths.includes(path.resolve(DATA_DIR)),
      'the provider cannot read any current or future company in the live data namespace')
    assert.ok(protection.protectedReadPaths.includes(exactFrozen.dataPath),
      'the provider cannot reopen the live Google Drive ticker folder')
    assert.ok(protection.protectedReadPaths.includes(path.resolve(exactFrozen.outDir)),
      'the provider cannot read any current or future original extract projection')
    assert.ok(protection.protectedWritePaths.includes(exactFrozen.generationDir),
      'the provider cannot mutate the original immutable generation')
    assert.ok(protection.protectedWritePaths.includes(isolatedEvidence.capability.root),
      'the provider cannot mutate its private read capability')
  }
  assert.deepEqual(claudeProtection, codexProtection,
    'Claude and Codex receive the identical frozen-evidence sandbox boundary')

  const exactModuleRun = (provider: 'claude' | 'codex') => createRun({
    kind: 'module', ticker: binding.ticker, module: 'earnings',
    provider,
    model: provider === 'claude' ? 'sonnet' : 'gpt-test',
    reasoningLevel: 'default',
    profileKey: provider === 'claude' ? 'claude:sonnet:default' : 'codex:gpt-test:default',
    executionProfile: provider === 'claude'
      ? { key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' }
      : { key: 'codex:gpt-test:default', parentModel: 'gpt-test', parentReasoning: 'default' },
    prompt: 'x', user: 'tester', userVia: 'local', runRoot: binding.runRoot,
    willCommitToMain: true, writeTargetsAbs: [], coveredModules: [], readDepsAbs: [],
    chained: true, chainId,
  })
  const exactClaudeRun = exactModuleRun('claude')
  const exactCodexRun = exactModuleRun('codex')
  const historicalSibling = path.resolve(REPO_ROOT, binding.runRoot, 'retired-historical-module')
  fs.mkdirSync(historicalSibling, { recursive: true })
  for (const exactRun of [exactClaudeRun, exactCodexRun]) {
    bindExactModuleReadScopeForTest(exactRun, ['business-model'])
  }
  const exactClaudeProtection = providerProtectionPathsForTest(exactClaudeRun)
  const exactCodexProtection = providerProtectionPathsForTest(exactCodexRun)
  const selectedModule = path.resolve(REPO_ROOT, binding.runRoot, 'earnings')
  const allowedInput = path.resolve(REPO_ROOT, binding.runRoot, 'business-model')
  const unrelatedSibling = path.resolve(REPO_ROOT, binding.runRoot, 'management-governance')
  for (const protection of [exactClaudeProtection, exactCodexProtection]) {
    assert.ok(protection.protectedReadPaths.includes(unrelatedSibling),
      'an exact module provider cannot read an unrelated, unverified sibling module')
    assert.ok(protection.protectedReadPaths.includes(historicalSibling),
      'an exact module provider cannot read a historical sibling absent from today\'s graph')
    assert.ok(!protection.protectedReadPaths.includes(selectedModule),
      'the selected module remains readable/writable inside its exact artifact scope')
    assert.ok(!protection.protectedReadPaths.includes(allowedInput),
      'a lineage-verified exact saved input remains readable')
  }
  assert.deepEqual(exactClaudeProtection.protectedReadPaths, exactCodexProtection.protectedReadPaths,
    'Claude and Codex receive the identical exact-module sibling deny boundary')

  const sandboxContext = (provider: 'claude' | 'codex'): ProviderLaunchContext => ({
    prompt: '/research:earnings ZZREADY', kind: 'module',
    profile: provider === 'claude' ? {
      provider, profileKey: 'claude:sonnet:default', model: 'sonnet', reasoningLevel: 'default',
      executionProfile: { key: 'claude:sonnet:default', parentModel: 'sonnet', parentReasoning: 'default' },
    } : {
      provider, profileKey: 'codex:gpt-test:default', model: 'gpt-test', reasoningLevel: 'default',
      executionProfile: { key: 'codex:gpt-test:default', parentModel: 'gpt-test', parentReasoning: 'default' },
    },
    cwd: REPO_ROOT, additionalWritableDataRoot: DATA_DIR,
    writablePaths: [path.join(REPO_ROOT, binding.runRoot)],
    protectedWritePaths: claudeProtection.protectedWritePaths,
    protectedReadPaths: claudeProtection.protectedReadPaths,
    readOnlyCapabilityPaths: [isolatedEvidence.capability.root],
    env: { PATH: '/bin', NOSTRA_COCKPIT_RUN: '1' }, guard: { maxTurns: 1, budgetUsd: 1 },
  })
  const exactClaudeSettings: any = claudeSandboxSettings({
    ...sandboxContext('claude'),
    protectedReadPaths: exactClaudeProtection.protectedReadPaths,
  })
  const exactCodexConfig = codexSandboxConfig({
    repoRoot: REPO_ROOT,
    dataRoot: isolatedEvidence.capability.root,
    leaseAuthPath: path.join(REPO_ROOT, '.test-codex-lease', 'auth.json'),
    sourceAuthPath: path.join(REPO_ROOT, '.test-codex-source', 'auth.json'),
    writablePaths: [path.join(REPO_ROOT, binding.runRoot)],
    protectedWritePaths: exactCodexProtection.protectedWritePaths,
    protectedReadPaths: exactCodexProtection.protectedReadPaths,
    readOnlyCapabilityPaths: [isolatedEvidence.capability.root],
  })
  assert.ok(exactClaudeSettings.sandbox.filesystem.denyRead.includes(unrelatedSibling),
    'Claude OS-denies unrelated exact-module siblings')
  assert.ok(exactCodexConfig.includes(`${JSON.stringify(unrelatedSibling)} = "deny"`),
    'Codex OS-denies unrelated exact-module siblings')

  const claudeSettings: any = claudeSandboxSettings(sandboxContext('claude'))
  assert.ok(claudeSettings.sandbox.filesystem.denyRead.includes(path.resolve(exactFrozen.outDir)),
    'Claude OS-denies the original generation parent as one future-proof subtree')
  assert.ok(claudeSettings.sandbox.filesystem.denyRead.includes(path.resolve(exactFrozen.dataPath)),
    'Claude OS-denies the exact live ticker data')
  assert.ok(claudeSettings.sandbox.filesystem.denyRead.includes(path.resolve(DATA_DIR)),
    'Claude OS-denies the entire live data namespace')
  assert.ok(claudeSettings.sandbox.filesystem.allowRead.includes(path.resolve(isolatedEvidence.capability.root)),
    'Claude reads only the external capability')

  const codexConfig = codexSandboxConfig({
    repoRoot: REPO_ROOT,
    dataRoot: isolatedEvidence.capability.root,
    leaseAuthPath: path.join(REPO_ROOT, '.test-codex-lease', 'auth.json'),
    sourceAuthPath: path.join(REPO_ROOT, '.test-codex-source', 'auth.json'),
    writablePaths: [path.join(REPO_ROOT, binding.runRoot)],
    protectedWritePaths: codexProtection.protectedWritePaths,
    protectedReadPaths: codexProtection.protectedReadPaths,
    readOnlyCapabilityPaths: [isolatedEvidence.capability.root],
  })
  assert.ok(codexConfig.includes(`${JSON.stringify(path.resolve(exactFrozen.outDir))} = "deny"`),
    'Codex OS-denies the original generation parent as one future-proof subtree')
  assert.ok(codexConfig.includes(`${JSON.stringify(path.resolve(exactFrozen.dataPath))} = "deny"`),
    'Codex OS-denies the exact live ticker data')
  assert.ok(codexConfig.includes(`${JSON.stringify(path.resolve(DATA_DIR))} = "deny"`),
    'Codex OS-denies the entire live data namespace')
  assert.ok(codexConfig.includes(`${JSON.stringify(path.resolve(isolatedEvidence.capability.root))} = "read"`),
    'Codex receives the external capability as its data root')

  // Build both provider policies first, then add a new sibling beneath the denied original namespace.
  // Parent-level denies continue to cover it without a spawn-time name enumeration or config rebuild.
  const futureProjection = path.join(exactFrozen.outDir, 'created-after-sandbox-config.json')
  fs.writeFileSync(futureProjection, '{"new":true}\n')
  assert.equal(fs.existsSync(path.join(isolatedEvidence.capability.root, 'created-after-sandbox-config.json')), false)
  assert.ok(path.resolve(futureProjection).startsWith(`${path.resolve(exactFrozen.outDir)}${path.sep}`))
  assert.ok(claudeSettings.sandbox.filesystem.denyRead.includes(path.resolve(exactFrozen.outDir)))
  assert.ok(codexConfig.includes(`${JSON.stringify(path.resolve(exactFrozen.outDir))} = "deny"`))
  const manifestPath = path.join(exactFrozen.generationDir, 'manifest.json')
  const heldManifestPath = `${manifestPath}.held`
  if (process.platform !== 'win32') fs.chmodSync(exactFrozen.generationDir, 0o755)
  fs.renameSync(manifestPath, heldManifestPath)
  if (process.platform !== 'win32') fs.chmodSync(exactFrozen.generationDir, 0o555)
  try {
    assert.throws(() => applyRunPolicyEnvForTest({}, envRun), /changed after readiness admission|unavailable/,
      'a generation removed between readiness and a later dependency wave fails before provider spend')
  } finally {
    if (process.platform !== 'win32') fs.chmodSync(exactFrozen.generationDir, 0o755)
    fs.renameSync(heldManifestPath, manifestPath)
    if (process.platform !== 'win32') fs.chmodSync(exactFrozen.generationDir, 0o555)
  }
  envRun.runRoot = 'analyses/ZZREADY_2099-01-04'
  assert.throws(() => applyRunPolicyEnvForTest({}, envRun), /does not match its exact chained readiness binding/,
    'the final provider-env boundary rejects a run-root mismatch before spend')
  exactModuleContinuationOnTerminal(chainId)('done')
  assert.equal(fs.existsSync(isolatedEvidence.capability.root), false,
    'successful exact-module terminal cleanup removes the external capability')
  assert.equal(chainedReadinessStateCount(), baseline, 'terminal cleanup removes the chain receipt')

  for (const status of ['error', 'cancelled'] as const) {
    const terminalChain = `${chainId}-${status}`
    const terminalState = await assessChainedReadinessOnce(
      terminalChain,
      `run-${status}`,
      binding,
      async () => frozenReport,
      { requireExistingReceipt: true },
    )
    const terminalCapability = frozenEvidenceBindingForRunForTest(createRun({
      kind: 'module', ticker: binding.ticker, module: 'earnings',
      provider: 'claude', model: 'haiku', reasoningLevel: 'default', profileKey: 'claude:haiku:default',
      executionProfile: { key: 'claude:haiku:default', parentModel: 'haiku', parentReasoning: 'default' },
      prompt: 'x', user: 'tester', userVia: 'local', runRoot: binding.runRoot,
      willCommitToMain: true, writeTargetsAbs: [], coveredModules: [], readDepsAbs: [],
      chained: true, chainId: terminalChain,
    }))
    assert.ok(terminalState.frozenPool && terminalCapability,
      `${status} exact-module fixture owns frozen readiness state before terminal cleanup`)
    exactModuleContinuationOnTerminal(terminalChain)(status)
    assert.equal(fs.existsSync(terminalCapability!.capability.root), false,
      `${status} exact-module terminal cleanup removes its frozen evidence capability`)
    assert.equal(chainedReadinessStateCount(), baseline,
      `${status} exact-module terminal cleanup returns readiness state to baseline`)
  }
  makeTreeWritable(path.join(REPO_ROOT, binding.runRoot))
  fs.rmSync(path.join(REPO_ROOT, binding.runRoot), { recursive: true, force: true })

  const unicodeChain = `chain-unicode-generation-${process.pid}`
  const unicodeBinding = { ticker: 'ZZREADY', runRoot: 'analyses/ZZREADY_2099-01-07' }
  // The exact retained bytes use Python's valid spelling for floats/exponents,
  // which JSON.stringify cannot reproduce. Unicode keys also exercise a
  // different order under Python code points vs JavaScript UTF-16. The server
  // must hash the retained bytes and compare their parsed meaning — never
  // reserialize the binding with JavaScript.
  let javascriptBindingJson = ''
  const unicodeFrozen = writeFrozenReceipt(unicodeBinding, ['\uE000.txt', '😀.txt'], {
    sourceExtras: { provenance: { '\uE000': 5, '😀': 1e-7 } },
    entities: [{ name: 'Unicode Co', '\uE000': 5, '😀': 1e-7 }],
    bindingJsonTransform: (value) => {
      javascriptBindingJson = value
      return value.replace(/:5(?=[,}])/g, ':5.0').replace(/:1e-7(?=[,}])/g, ':1e-07')
    },
  })
  const retainedManifest = JSON.parse(fs.readFileSync(
    path.join(unicodeFrozen.generationDir, 'manifest.json'), 'utf8',
  ))
  assert.notEqual(
    createHash('sha256').update(javascriptBindingJson, 'utf8').digest('hex'),
    unicodeFrozen.generationDigest,
    'the fixture actually differs from a JSON.stringify-compatible number spelling',
  )
  assert.match(retainedManifest.generation.binding_json, /:5\.0(?:[,}])/, 'Python float spelling is retained')
  assert.match(retainedManifest.generation.binding_json, /:1e-07(?:[,}])/, 'Python exponent spelling is retained')
  try {
    const unicodeReport: ReadinessReport = { ...disagreement, frozenPool: unicodeFrozen }
    const unicodeAssessed = await assessChainedReadinessOnce(
      unicodeChain, 'unicode-owner', unicodeBinding, async () => unicodeReport,
    )
    assert.equal(unicodeAssessed.frozenPool?.generationDigest, unicodeFrozen.generationDigest,
      'valid Python floats, exponents, and Unicode keys verify without JavaScript reserialization')
  } finally {
    clearChainedReadiness(unicodeChain)
    makeTreeWritable(path.join(REPO_ROOT, unicodeBinding.runRoot))
    fs.rmSync(path.join(REPO_ROOT, unicodeBinding.runRoot), { recursive: true, force: true })
  }

  const tamperChain = `chain-tamper-generation-${process.pid}`
  const tamperBinding = { ticker: 'ZZREADY', runRoot: 'analyses/ZZREADY_2099-01-08' }
  const tamperFrozen = writeFrozenReceipt(tamperBinding)
  try {
    const tamperReport: ReadinessReport = { ...disagreement, frozenPool: tamperFrozen }
    await assessChainedReadinessOnce(tamperChain, 'tamper-owner', tamperBinding, async () => tamperReport)
    const tamperRun = createRun({
      kind: 'module', ticker: tamperBinding.ticker, module: 'earnings',
      provider: 'claude', model: 'haiku', reasoningLevel: 'default', profileKey: 'claude:haiku:default',
      executionProfile: { key: 'claude:haiku:default', parentModel: 'haiku', parentReasoning: 'default' },
      prompt: 'x', user: 'tester', userVia: 'local', runRoot: tamperBinding.runRoot,
      willCommitToMain: true, writeTargetsAbs: [], coveredModules: [], readDepsAbs: [],
      chained: true, chainId: tamperChain,
    })
    const firstBoundary = prepareProviderEvidenceBoundaryForTest(tamperRun)!
    assert.equal(firstBoundary.frozenPool.generationDigest, tamperFrozen.generationDigest)
    const nextRun = createRun({
      kind: 'module', ticker: tamperBinding.ticker, module: 'valuation',
      provider: 'codex', model: 'gpt-test', reasoningLevel: 'default', profileKey: 'codex:gpt-test:default',
      executionProfile: { key: 'codex:gpt-test:default', parentModel: 'gpt-test', parentReasoning: 'default' },
      prompt: 'x', user: 'tester', userVia: 'local', runRoot: tamperBinding.runRoot,
      willCommitToMain: true, writeTargetsAbs: [], coveredModules: [], readDepsAbs: [],
      chained: true, chainId: tamperChain,
    })
    const capabilityPath = path.join(firstBoundary.capability.evidenceRoot, 'sample.txt')
    if (process.platform !== 'win32') fs.chmodSync(capabilityPath, 0o600)
    fs.writeFileSync(capabilityPath, 'owner-mutated capability bytes\n')
    if (process.platform !== 'win32') fs.chmodSync(capabilityPath, 0o400)
    let adapterBuilds = 0
    const buildNextAdapter = () => {
      prepareProviderEvidenceBoundaryForTest(nextRun)
      adapterBuilds++
    }
    assert.throws(
      buildNextAdapter,
      /capability content changed/,
      'capability tampering after one child fails at the next child adapter-build boundary',
    )
    assert.equal(adapterBuilds, 0, 'a tampered capability fails before the next provider adapter is built')
  } finally {
    clearChainedReadiness(tamperChain)
    makeTreeWritable(path.join(REPO_ROOT, tamperBinding.runRoot))
    fs.rmSync(path.join(REPO_ROOT, tamperBinding.runRoot), { recursive: true, force: true })
  }

  const forgedChain = `chain-forged-generation-${process.pid}`
  const forgedBinding = { ticker: 'ZZREADY', runRoot: 'analyses/ZZREADY_2099-01-09' }
  const forgedFrozen = writeFrozenReceipt(forgedBinding)
  const forgedManifestPath = path.join(forgedFrozen.generationDir, 'manifest.json')
  if (process.platform !== 'win32') {
    fs.chmodSync(forgedFrozen.generationDir, 0o755)
    fs.chmodSync(forgedManifestPath, 0o644)
  }
  const forgedManifest = JSON.parse(fs.readFileSync(forgedManifestPath, 'utf8'))
  forgedManifest.vision_mode = true
  fs.writeFileSync(forgedManifestPath, JSON.stringify(forgedManifest))
  if (process.platform !== 'win32') {
    fs.chmodSync(forgedManifestPath, 0o444)
    fs.chmodSync(forgedFrozen.generationDir, 0o555)
  }
  try {
    await assert.rejects(
      assessChainedReadinessOnce(forgedChain, 'forged-owner', forgedBinding, async () => ({
        ...disagreement, frozenPool: forgedFrozen,
      })),
      /generation binding does not match its manifest/,
      'a well-shaped manifest cannot forge the digest that binds its exact content',
    )
  } finally {
    clearChainedReadiness(forgedChain)
    makeTreeWritable(path.join(REPO_ROOT, forgedBinding.runRoot))
    fs.rmSync(path.join(REPO_ROOT, forgedBinding.runRoot), { recursive: true, force: true })
  }

  const unboundChain = `chain-unbound-${process.pid}`
  let unboundEvaluations = 0
  await assert.rejects(
    assessChainedReadinessOnce(
      unboundChain,
      'legacy-owner',
      { ticker: 'ZZREADY', runRoot: 'analyses/ZZREADY_2099-01-05' },
      async () => { unboundEvaluations++; return disagreement },
    ),
    /did not produce a verified frozen evidence generation/,
    'a legacy successful report without a generation fails before provider spend',
  )
  assert.equal(unboundEvaluations, 1)
  clearChainedReadiness(unboundChain)

  const missingGenerationChain = `chain-missing-generation-${process.pid}`
  const missingBinding = { ticker: 'ZZREADY', runRoot: 'analyses/ZZREADY_2099-01-06' }
  const missingOut = path.join(REPO_ROOT, missingBinding.runRoot, '_pool_extracts')
  await assert.rejects(
    assessChainedReadinessOnce(missingGenerationChain, 'missing-generation-owner', missingBinding, async () => ({
      ...disagreement,
      frozenPool: {
        dataPath: path.join(DATA_DIR, missingBinding.ticker),
        outDir: missingOut,
        generationDigest: 'c'.repeat(64),
        generationDir: path.join(missingOut, '.extract-generations', 'c'.repeat(64)),
        evidenceRoot: path.join(missingOut, '.extract-generations', 'c'.repeat(64), 'raw', missingBinding.ticker),
      },
    })),
    /generation parent is unavailable/,
    'a missing/legacy generation directory cannot start a provider unbound',
  )
  clearChainedReadiness(missingGenerationChain)

  const emptyChain = `chain-empty-${process.pid}`
  const emptyBinding = { ticker: 'ZZREADY', runRoot: 'analyses/ZZREADY_2099-01-03' }
  let emptyEvaluations = 0
  const emptyAssessed = await Promise.all([
    assessChainedReadinessOnce(emptyChain, 'empty-owner', emptyBinding, async () => { emptyEvaluations++; return zeroFiles }),
    assessChainedReadinessOnce(emptyChain, 'empty-sibling-a', emptyBinding, async () => { emptyEvaluations++; return zeroFiles }),
    assessChainedReadinessOnce(emptyChain, 'empty-sibling-b', emptyBinding, async () => { emptyEvaluations++; return zeroFiles }),
  ])
  assert.equal(emptyEvaluations, 1, 'an empty pool is evaluated once')
  assert.deepEqual(emptyAssessed.filter((item) => item.owner).map(() => 'owner'), ['owner'],
    'an empty pool has one modal owner, never one per sibling')
  const siblingReleaseA = waitForChainedReadinessResolution(emptyChain)
  const siblingReleaseB = waitForChainedReadinessResolution(emptyChain)
  assert.equal(resolveChainedReadiness(emptyChain, 'empty-sibling-a', {
    action: 'override', user: 'wrong-owner', report: zeroFiles,
  }), false, 'a sibling cannot resolve the owner\'s gate')
  assert.equal(resolveChainedReadiness(emptyChain, 'empty-owner', {
    action: 'override', user: 'tester', acknowledgedText: 'ZZREADY', report: zeroFiles,
  }), false, 'even the owner cannot override a physically empty chain')
  assert.equal(resolveChainedReadiness(emptyChain, 'empty-owner', {
    action: 'cancel', user: 'tester', report: zeroFiles,
  }), true, 'the one owner can cancel and release the whole empty chain once')
  const releases = await Promise.all([siblingReleaseA, siblingReleaseB])
  assert.ok(releases.every((item) => item.action === 'cancel' && item.user === 'tester'),
    'all siblings inherit the one owner cancellation')
  clearChainedReadiness(emptyChain)
  assert.equal(chainedReadinessStateCount(), baseline, 'empty-chain terminal cleanup leaves no state')

  // The gate panel calls decideReadiness(), but the Activity row's ordinary Cancel button calls cancel().
  // Both must release same-wave siblings; otherwise the latter leaves them waiting forever.
  const cancelChain = `chain-cancel-${process.pid}`
  const cancelRoot = 'analyses/ZZCHAINCANCEL_2099-01-01'
  const cancelAbsolute = path.join(REPO_ROOT, cancelRoot)
  fs.mkdirSync(cancelAbsolute, { recursive: true })
  try {
    const owner = createRun({
      kind: 'module', ticker: 'ZZCHAINCANCEL', module: 'business-model',
      provider: 'claude', model: 'haiku', reasoningLevel: 'default', profileKey: 'claude:haiku:default',
      executionProfile: { key: 'claude:haiku:default', parentModel: 'haiku', parentReasoning: 'default' },
      prompt: 'x', user: 'tester', userVia: 'local', runRoot: cancelRoot,
      willCommitToMain: true, writeTargetsAbs: [], coveredModules: [], readDepsAbs: [],
      chained: true, chainId: cancelChain,
    })
    owner.status = 'awaiting-readiness-decision'
    owner.readiness = zeroFiles
    const cancelReport = { ...zeroFiles, ticker: owner.ticker }
    const assessedOwner = await assessChainedReadinessOnce(
      cancelChain,
      owner.runId,
      { ticker: owner.ticker, runRoot: cancelRoot },
      async () => cancelReport,
    )
    assert.equal(assessedOwner.owner, true)
    const siblingWaiting = assessedOwner.resolution
    assert.equal(await cancel(owner.runId), true, 'generic cancel accepts the chain gate owner')
    assert.equal((await siblingWaiting).action, 'cancel',
      'generic owner cancel releases waiting siblings with a chain cancellation')
    assert.equal(owner.status, 'cancelled')
  } finally {
    clearChainedReadiness(cancelChain)
    fs.rmSync(cancelAbsolute, { recursive: true, force: true })
  }
  assert.equal(chainedReadinessStateCount(), baseline, 'generic-cancel cleanup leaves no chain state')

  const leakChain = `chain-cancelled-set-${process.pid}`
  haltChain(leakChain)
  assert.equal(cancelledChainStateCount(), cancelledBaseline + 1,
    'a stopped chain is retained only until its terminal cleanup')
  clearChainedReadiness(leakChain)
  assert.equal(cancelledChainStateCount(), cancelledBaseline,
    'terminal cleanup deletes the cancelled-chain kill switch instead of leaking forever')
}

await coordinatorChecks()
await durableRestartChecks()
console.log('PASS: chain readiness is one exact assessment, one empty-data gate, and no child re-scan')
