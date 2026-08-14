import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { canonicalJsonText } from '../src/canonical-json'
import {
  automaticCallPublicationIsShared,
  clearMatchingScopedStageIntent,
  inspectAutomaticCallRecoveryWorktree,
  promoteAuditedAutomaticCallToProjectionSeal,
  recoverCompletedAutomaticCallPublication,
} from '../src/publication-recovery'
import { SCOPED_STAGE_INTENT_FILE, SCOPED_STAGE_INTENT_VERSION } from '../src/types'

const input = {
  subject: 'TEST',
  swarmId: 'research',
  sourceRunRoot: 'analyses/TEST_2026-08-13',
  targetRunRoot: 'analyses/TEST_2026-08-14',
  planPath: 'analyses/TEST_2026-08-13/intake/2026-08-14_intake_plan.json',
  planSha256: `sha256:${'a'.repeat(64)}`,
  sourceDecisionFingerprint: `sha256:${'b'.repeat(64)}`,
}
const commit = 'c'.repeat(40)
const staged = {
  staged_for_scoped_rerun: true,
  run_root: input.sourceRunRoot,
  decision_fingerprint: input.sourceDecisionFingerprint,
}

// The production hash function includes the complete authored plan. Build the expected identity once so
// these seam tests exercise binding rather than duplicating intake's canonical hashing implementation.
import { intakePlanSha256 } from '../src/intake'
input.planSha256 = intakePlanSha256(staged)!

const artifactBytes: Record<string, Buffer> = {
  'final_thesis.md': Buffer.from('# complete\n'),
  'decision_record.json': Buffer.from(JSON.stringify({
    ticker: 'TEST', run_root: input.targetRunRoot, decision_date: '2026-08-14',
  })),
}
const thesisSha = createHash('sha256').update(artifactBytes['final_thesis.md']).digest('hex')
const decisionSha = createHash('sha256').update(artifactBytes['decision_record.json']).digest('hex')
artifactBytes['verification_report.json'] = Buffer.from(JSON.stringify({
  schema_version: '1.0', ticker: 'TEST', run_root: input.targetRunRoot,
  final_thesis_path: `${input.targetRunRoot}/final_thesis.md`, decision_record_path: `${input.targetRunRoot}/decision_record.json`,
  final_thesis_sha256: thesisSha, decision_record_sha256: decisionSha,
  verified_at: '2026-08-14T10:00:00Z', verifier: 'verify-evidence', verdict: 'Clean', integrity_score: 90,
  blocking_findings: [],
}))
artifactBytes['pre_mortem.json'] = Buffer.from(JSON.stringify({
  schema_version: '1.0', ticker: 'TEST', run_root: input.targetRunRoot,
  final_thesis_path: `${input.targetRunRoot}/final_thesis.md`, decision_record_path: `${input.targetRunRoot}/decision_record.json`,
  final_thesis_sha256: thesisSha, decision_record_sha256: decisionSha,
  performed_at: '2026-08-14T10:01:00Z', auditor: 'pre-mortem', verdict: 'Survives', survives: true,
  original_confidence: 70, confidence_haircut: 0, recommended_confidence: 70, recommended_rating_cap: '',
}))
artifactBytes['expectations_gap.json'] = Buffer.from(JSON.stringify({
  schema_version: '1.0', ticker: 'TEST', run_root: input.targetRunRoot,
  final_thesis_path: `${input.targetRunRoot}/final_thesis.md`, decision_record_path: `${input.targetRunRoot}/decision_record.json`,
  final_thesis_sha256: thesisSha, decision_record_sha256: decisionSha,
  performed_at: '2026-08-14T10:02:00Z', analyst: 'expectations-gap',
  variant_perception_quality: 'Moderate', is_exploitable: true, edge_score: 60,
}))
const manifestPayload = {
  schema_version: 'idea-projection-manifest/v1', run_root: input.targetRunRoot, created_at: '2026-08-14T10:03:00Z',
  artifacts: {
    final_thesis: { path: 'final_thesis.md', sha256: createHash('sha256').update(artifactBytes['final_thesis.md']).digest('hex') },
    decision_record: { path: 'decision_record.json', sha256: createHash('sha256').update(artifactBytes['decision_record.json']).digest('hex') },
    verification: { path: 'verification_report.json', sha256: createHash('sha256').update(artifactBytes['verification_report.json']).digest('hex') },
    pre_mortem: { path: 'pre_mortem.json', sha256: createHash('sha256').update(artifactBytes['pre_mortem.json']).digest('hex') },
    expectations_gap: { path: 'expectations_gap.json', sha256: createHash('sha256').update(artifactBytes['expectations_gap.json']).digest('hex') },
  },
}
const manifest = Buffer.from(JSON.stringify({
  ...manifestPayload,
  manifest_sha256: createHash('sha256').update(canonicalJsonText(manifestPayload)).digest('hex'),
}))

const bytesFor = (overrides: { staged?: any; decision?: any; thesis?: string; metadata?: string; manifest?: Buffer | null } = {}) =>
  (_commit: string, repoPath: string): Buffer | null => {
    if (repoPath.endsWith('/intake/2026-08-14_intake_plan.json')) return Buffer.from(JSON.stringify(overrides.staged ?? staged))
    if (repoPath.endsWith('/decision_record.json')) return overrides.decision
      ? Buffer.from(JSON.stringify(overrides.decision)) : artifactBytes['decision_record.json']
    if (repoPath.endsWith('/final_thesis.md')) return overrides.thesis !== undefined
      ? Buffer.from(overrides.thesis) : artifactBytes['final_thesis.md']
    if (repoPath.endsWith('/RUN_METADATA.md')) return Buffer.from(overrides.metadata
      ?? '# Run Metadata\n\n## Publication\n\nready for one path-confined commit\n')
    if (repoPath.endsWith('/idea_projection_manifest.json')) return overrides.manifest === undefined ? manifest : overrides.manifest
    for (const [name, bytes] of Object.entries(artifactBytes)) if (repoPath.endsWith(`/${name}`)) return bytes
    return null
  }
const terminalPaths = [
  `${input.targetRunRoot}/intake/2026-08-14_intake_plan.json`,
  ...['final_thesis.md', 'decision_record.json', 'RUN_METADATA.md', 'idea_projection_manifest.json',
    'verification_report.json', 'pre_mortem.json', 'expectations_gap.json']
    .map((name) => `${input.targetRunRoot}/${name}`),
]
const testTreeDeps = {
  commitPaths: () => terminalPaths,
  sharedPaths: () => terminalPaths,
  // Canonical admission validation has its own producer/store tests. These seam cases isolate exact
  // plan binding and publication state without recreating the full qualified-idea schema in every row.
  validateTerminal: () => true,
}

{
  assert.equal(automaticCallPublicationIsShared(input, {
    ...testTreeDeps,
    sharedBytes: (repoPath) => bytesFor()(commit, repoPath),
  }), true, 'shared completion is attributed to the exact staged automatic plan')
  assert.equal(automaticCallPublicationIsShared(input, {
    ...testTreeDeps,
    sharedBytes: (repoPath) => bytesFor({
      staged: { ...staged, decision_fingerprint: `sha256:${'f'.repeat(64)}` },
    })(commit, repoPath),
  }), false, 'a different same-day staged plan cannot satisfy exact shared attribution')
}

{
  let publishCalls = 0
  let shared = false
  const recovered = await recoverCompletedAutomaticCallPublication(input, {
    ...testTreeDeps,
    candidates: () => [commit],
    commitBytes: bytesFor(),
    publish: async (_message, paths, sourceCommit) => {
      publishCalls++
      assert.deepEqual(paths, ['analyses/TEST_2026-08-14/'])
      assert.equal(sourceCommit, commit)
      shared = true
    },
    sharedBytes: (_repoPath) => shared ? bytesFor()(commit, _repoPath) : null,
  })
  assert.equal(recovered, true)
  assert.equal(publishCalls, 1, 'a saved, committed staged call retries only publication once')
}

for (const [label, commitBytes] of [
  ['wrong staged plan', bytesFor({ staged: { ...staged, run_root: 'analyses/OTHER_2026-08-13' } })],
  ['wrong ticker', bytesFor({ decision: { ticker: 'OTHER', run_root: input.targetRunRoot, decision_date: '2026-08-14' } })],
  ['wrong run root', bytesFor({ decision: { ticker: 'TEST', run_root: input.sourceRunRoot, decision_date: '2026-08-14' } })],
  ['wrong date', bytesFor({ decision: { ticker: 'TEST', run_root: input.targetRunRoot, decision_date: '2026-08-13' } })],
  ['missing thesis', bytesFor({ thesis: '' })],
  ['missing metadata', bytesFor({ metadata: '' })],
  ['unsealed metadata', bytesFor({ metadata: '# Run Metadata\n\n## Publication\n\n(filled in at end of run)\n' })],
  ['missing projection seal', bytesFor({ manifest: null })],
] as const) {
  let publishes = 0
  const recovered = await recoverCompletedAutomaticCallPublication(input, {
    ...testTreeDeps,
    candidates: () => [commit], commitBytes,
    publish: async () => { publishes++ }, sharedBytes: () => null,
  })
  assert.equal(recovered, false, label)
  assert.equal(publishes, 0, `${label} never gains publication authority`)
}

{
  let publishes = 0
  const recovered = await recoverCompletedAutomaticCallPublication(input, {
    ...testTreeDeps,
    candidates: () => [], commitBytes: bytesFor(),
    publish: async () => { publishes++ }, sharedBytes: () => null,
  })
  assert.equal(recovered, false)
  assert.equal(publishes, 0, 'pre-commit thesis and decision files are not completion proof')
}

{
  let publishes = 0
  const shared = bytesFor()
  const recovered = await recoverCompletedAutomaticCallPublication(input, {
    ...testTreeDeps,
    candidates: () => [], commitBytes: () => null,
    publish: async () => { publishes++ },
    sharedBytes: (repoPath) => shared(commit, repoPath),
  })
  assert.equal(recovered, true, 'an exact call already present in shared Git completes verification')
  assert.equal(publishes, 0, 'an already-published call never runs a second publication or model job')
}

{
  let publishes = 0
  const shared = bytesFor()
  const recovered = await recoverCompletedAutomaticCallPublication(input, {
    ...testTreeDeps,
    candidates: () => [commit], commitBytes: bytesFor(),
    publish: async () => { publishes++ },
    sharedBytes: (repoPath) => shared(commit, repoPath),
  })
  assert.equal(recovered, true)
  assert.equal(publishes, 1,
    'a matching ahead metadata commit is published even when its main thesis and decision are already shared')
}

{
  await assert.rejects(() => recoverCompletedAutomaticCallPublication(input, {
    ...testTreeDeps,
    candidates: () => [commit], commitBytes: bytesFor(),
    publish: async () => {}, sharedBytes: () => null,
  }), /still not available/)
}

{
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'automatic-call-stage-'))
  const target = path.join(repoRoot, input.targetRunRoot)
  const intakeDir = path.join(target, 'intake')
  const source = { ...staged }
  delete (source as any).staged_for_scoped_rerun
  const inspectionDeps = {
    repoRoot,
    sourceBytes: (repoPath) => repoPath === input.planPath ? Buffer.from(JSON.stringify(source)) : null,
    validateTerminal: () => true,
  }
  const stage = () => inspectAutomaticCallRecoveryWorktree(input, inspectionDeps)
  const intent = {
    schema_version: SCOPED_STAGE_INTENT_VERSION,
    swarm: input.swarmId,
    subject: input.subject,
    source_run_root: input.sourceRunRoot,
    target_run_root: input.targetRunRoot,
    plan_path: input.planPath,
    plan_sha256: input.planSha256,
    source_decision_fingerprint: input.sourceDecisionFingerprint,
  }
  try {
    fs.mkdirSync(path.join(repoRoot, 'analyses'))
    assert.equal(stage(), 'none')
    fs.mkdirSync(target)
    assert.throws(() => inspectAutomaticCallRecoveryWorktree(input, {
      ...inspectionDeps,
      sourceBytes: () => { throw Object.assign(new Error('shared ref temporarily unavailable'), { code: 'CALLS_AUTHORITY_UNAVAILABLE' }) },
    }), (error: any) => error?.code === 'CALLS_AUTHORITY_UNAVAILABLE',
    'a transient shared-authority outage remains retryable instead of becoming an unsafe permanent hold')
    assert.equal(inspectAutomaticCallRecoveryWorktree(input, { ...inspectionDeps, sourceBytes: () => null }), 'unsafe',
      'a positively-readable authority with no exact source plan is an unsafe deterministic mismatch')
    assert.equal(stage(), 'none', 'an empty target with no transaction witness contains no saved work')
    fs.writeFileSync(path.join(target, 'manual-partial.md'), 'manual bytes\n')
    assert.equal(stage(), 'unsafe', 'arbitrary unstamped work is never overwritten as automatic staging')
    fs.rmSync(path.join(target, 'manual-partial.md'))
    fs.writeFileSync(path.join(target, SCOPED_STAGE_INTENT_FILE), JSON.stringify(intent, null, 2) + '\n')
    assert.equal(stage(), 'unstamped_partial',
      'only the exact durable transaction witness authorizes reconstruction before the plan stamp')
    fs.writeFileSync(path.join(target, SCOPED_STAGE_INTENT_FILE), JSON.stringify({ ...intent, plan_sha256: `sha256:${'f'.repeat(64)}` }))
    assert.equal(stage(), 'unsafe', 'a mismatched stage witness fails closed')
    fs.writeFileSync(path.join(target, SCOPED_STAGE_INTENT_FILE), JSON.stringify(intent, null, 2) + '\n')
    fs.mkdirSync(intakeDir, { recursive: true })
    assert.equal(stage(), 'unstamped_partial', 'an empty intake directory is still an unstamped transaction')
    fs.writeFileSync(path.join(intakeDir, 'other_intake_plan.json'), '{}')
    assert.equal(stage(), 'unsafe', 'a different plan in the target is never overwritten by reconstruction')
    fs.rmSync(path.join(intakeDir, 'other_intake_plan.json'))
    fs.writeFileSync(path.join(intakeDir, path.basename(input.planPath)), JSON.stringify(staged))
    assert.equal(stage(), 'partial', 'a server-staged target remains exact resumable work before master output')
    assert.equal(clearMatchingScopedStageIntent(input, inspectionDeps), true,
      'an exact stamped plan heals the crash cut after plan rename but before intent removal')
    assert.equal(fs.existsSync(path.join(target, SCOPED_STAGE_INTENT_FILE)), false)
    assert.equal(clearMatchingScopedStageIntent(input, inspectionDeps), false, 'intent cleanup is idempotent')
    assert.equal(stage(), 'partial', 'removing the matched intent preserves the exact runnable stage')
    fs.rmSync(path.join(intakeDir, path.basename(input.planPath)))
    fs.writeFileSync(path.join(target, 'final_thesis.md'), '# unbound partial thesis\n')
    assert.equal(stage(), 'unsafe', 'terminal-looking bytes without the exact stamp cannot be restaged over')
    fs.rmSync(path.join(target, 'final_thesis.md'))
    fs.writeFileSync(path.join(intakeDir, path.basename(input.planPath)), JSON.stringify(staged))
    fs.writeFileSync(path.join(target, 'final_thesis.md'), '# thesis\n')
    fs.writeFileSync(path.join(target, 'decision_record.json'), JSON.stringify({
      ticker: input.subject, run_root: input.targetRunRoot, decision_date: '2026-08-14',
    }))
    assert.equal(stage(), 'preseal_pair', 'the visible pair resumes final gates and is not completion proof')
    assert.equal(await promoteAuditedAutomaticCallToProjectionSeal(input, {
      ...inspectionDeps, run: async () => { throw new Error('one audit is missing') },
    }), false, 'an incomplete audit trio falls back to the existing terminal-pair recovery path')
    assert.equal(stage(), 'preseal_pair')
    let promoted = 0
    assert.equal(await promoteAuditedAutomaticCallToProjectionSeal(input, {
      ...inspectionDeps,
      run: async () => {
        promoted++
        fs.writeFileSync(path.join(target, 'idea_projection_manifest.json'), '{}')
      },
    }), true, 'a canonical audit producer can promote the exact pair without another model turn')
    assert.equal(promoted, 1)
    fs.rmSync(path.join(target, 'idea_projection_manifest.json'))
    fs.writeFileSync(path.join(target, 'idea_projection_manifest.json'), '{}')
    assert.equal(stage(), 'projection_sealed')
    fs.writeFileSync(path.join(target, 'idea_admission.json'), '{}')
    assert.equal(stage(), 'admission_sealed')
    fs.writeFileSync(path.join(target, 'RUN_METADATA.md'), '# Run Metadata\n\n## Publication\n\nready for one path-confined commit\n')
    assert.equal(stage(), 'ready_worktree', 'only the canonical validator plus READY marker earns commit-only recovery')
    const recoverySource = fs.readFileSync(path.join(process.cwd(), 'src/publication-recovery.ts'), 'utf8')
    assert.match(recoverySource,
      /\['\.interrupted', '\.aborted', '\.defer_module_memos', 'RUN_FAILURE\.md'\]/,
      'commit-only recovery must remove the stale failure note before it publishes a READY run')
    const wrong = { ...staged, run_root: 'analyses/OTHER_2026-08-13' }
    fs.writeFileSync(path.join(intakeDir, path.basename(input.planPath)), JSON.stringify(wrong))
    assert.equal(stage(), 'unsafe', 'a target staged for another plan never enters automatic recovery')
  } finally {
    fs.rmSync(repoRoot, { recursive: true, force: true })
  }
}

console.log('publication-recovery.test.ts: all assertions passed')
