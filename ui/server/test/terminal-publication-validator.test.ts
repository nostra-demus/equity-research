import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { execFileSync, spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { validateAutomaticTerminalIndexRecovery, validateTerminalGitPublication } from '../scripts/validate-terminal-publication'
import { canonicalQualifiedIdeaJson, validateCompletedIdeaPublication, validateProjectionManifest } from '../src/qualified-ideas-store'

const repo = fs.mkdtempSync(path.join(os.tmpdir(), 'terminal-publication-validator-'))
const bare = fs.mkdtempSync(path.join(os.tmpdir(), 'terminal-publication-origin-'))
const freshRepo = fs.mkdtempSync(path.join(os.tmpdir(), 'terminal-publication-fresh-'))
const freshBare = fs.mkdtempSync(path.join(os.tmpdir(), 'terminal-publication-fresh-origin-'))
const runRoot = 'analyses/OLD_2026-08-13'
const runAbs = path.join(repo, runRoot)
const timestamp = '2026-08-13T10:00:00Z'
const sha = (bytes: Buffer | string): string => createHash('sha256').update(bytes).digest('hex')
const digest = (value: unknown): string => sha(canonicalQualifiedIdeaJson(value))
const publicationEnv = { ...process.env }
delete publicationEnv.ENGINE_NO_PUSH
const git = (args: string[]): string => execFileSync('git', ['-C', repo, ...args], { encoding: 'utf8' }).trim()
const write = (name: string, bytes: Buffer | string): void => {
  const target = path.join(runAbs, name)
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, bytes)
}

try {
  fs.mkdirSync(runAbs, { recursive: true })
  execFileSync('git', ['init', '-q', '-b', 'main', repo])
  git(['config', 'user.name', 'Test'])
  git(['config', 'user.email', 'test@example.com'])
  fs.writeFileSync(path.join(repo, 'base.txt'), 'base\n')
  git(['add', '--', 'base.txt'])
  git(['commit', '-q', '-m', 'base'])

  write('RUN_METADATA.md', '# Run Metadata\n\n## Publication\nready for one path-confined commit\n')
  write('final_thesis.md', '# Frozen thesis\n')
  const decision = {
    run_root: runRoot, ticker: 'OLD', decision_date: '2026-08-13', company_name: '',
    data_needs_schema_version: '2.0',
    data_needs: [{
      need_id: 'retired-route', priority: 1, series: 'A filed series with a retired route',
      why_it_caps: 'the terminal historical decision depended on this exact old route',
      expected_impact: {
        if_supportive: 'supportive data would strengthen the historical case',
        if_adverse: 'adverse data would weaken the historical case',
      },
      filing_required: true,
      entry_orbs: [{ module: 'fixture-module', agent: 'retired-agent', why: 'historical owner', confidence: 0.9 }],
      suggested_source: {
        name: 'Official filing', acquisition: 'manual', access: 'public', licensing_basis: 'official public filing',
      },
      tier: 5, cadence: 'quarterly', next_release: '2026-11-13',
    }],
  }
  write('decision_record.json', JSON.stringify(decision))
  const thesisSha = sha(fs.readFileSync(path.join(runAbs, 'final_thesis.md')))
  const decisionSha = sha(fs.readFileSync(path.join(runAbs, 'decision_record.json')))
  const auditIdentity = {
    schema_version: '1.0', ticker: 'OLD', run_root: runRoot,
    final_thesis_path: `${runRoot}/final_thesis.md`, decision_record_path: `${runRoot}/decision_record.json`,
    final_thesis_sha256: thesisSha, decision_record_sha256: decisionSha,
  }
  write('verification_report.json', JSON.stringify({
    ...auditIdentity, verified_at: timestamp, verifier: 'verify-evidence', verdict: 'Clean',
    integrity_score: 90, blocking_findings: [],
  }))
  write('pre_mortem.json', JSON.stringify({
    ...auditIdentity, performed_at: timestamp, auditor: 'pre-mortem', verdict: 'Survives', survives: true,
    original_confidence: 70, confidence_haircut: 0, recommended_confidence: 70, recommended_rating_cap: '',
  }))
  write('expectations_gap.json', JSON.stringify({
    ...auditIdentity, performed_at: timestamp, analyst: 'expectations-gap',
    variant_perception_quality: 'Moderate', is_exploitable: true, edge_score: 60,
  }))
  const artifacts = {
    final_thesis: { path: 'final_thesis.md', sha256: thesisSha },
    decision_record: { path: 'decision_record.json', sha256: decisionSha },
    verification: { path: 'verification_report.json', sha256: sha(fs.readFileSync(path.join(runAbs, 'verification_report.json'))) },
    pre_mortem: { path: 'pre_mortem.json', sha256: sha(fs.readFileSync(path.join(runAbs, 'pre_mortem.json'))) },
    expectations_gap: { path: 'expectations_gap.json', sha256: sha(fs.readFileSync(path.join(runAbs, 'expectations_gap.json'))) },
  }
  const manifest: any = {
    schema_version: 'idea-projection-manifest/v1', run_root: runRoot, created_at: timestamp, artifacts,
  }
  manifest.manifest_sha256 = digest(manifest)
  write('idea_projection_manifest.json', JSON.stringify(manifest))
  const assessment = {
    schema_version: 'idea-assessment/v1', assessment_id: 'OLD-not-assessable', run_root: runRoot,
    created_at: '2026-08-13T10:01:00Z', ticker: 'OLD', company: null,
    status: 'not_assessable', gaps: ['No current market evidence is available.'], candidate: null,
  }
  write('idea_3_6m.json', JSON.stringify(assessment))
  const admission: any = {
    schema_version: 'qualified-idea-admission/v1', admission_id: 'OLD-not-applicable', status: 'not_applicable',
    run_root: runRoot, frozen_at: '2026-08-13T10:02:00Z', assessment,
    assessment_sha256: digest(assessment), candidate: null, candidate_sha256: null,
    decision_authority: null, decision_authority_sha256: null, market_evidence_sha256: null,
    market_evidence: null, projection_manifest_sha256: manifest.manifest_sha256,
    integrity_evidence: null, integrity_evidence_sha256: null, gaps: assessment.gaps,
  }
  admission.admission_sha256 = digest(admission)
  write('idea_admission.json', JSON.stringify(admission))
  assert.ok(validateProjectionManifest(runAbs, runRoot), 'projection fixture is canonical')
  assert.ok(validateCompletedIdeaPublication(runAbs, runRoot), 'terminal fixture is canonical')
  git(['add', '--', runRoot])
  assert.equal(validateTerminalGitPublication(repo, { kind: 'index' }, runRoot), true)
  git(['commit', '-q', '-m', 'valid old-roster terminal publication'])
  const commit = git(['rev-parse', 'HEAD'])
  assert.equal(validateTerminalGitPublication(repo, { kind: 'commit', oid: commit }, runRoot), true)

  const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../scripts/validate-terminal-publication.ts')
  const tsx = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../node_modules/.bin/tsx')
  const command = spawnSync(tsx, [script, '--repo', repo, '--commit', commit, runRoot], { encoding: 'utf8' })
  assert.equal(command.status, 0)
  assert.match(command.stdout, /TERMINAL_PUBLICATION_VALID=1/)

  // Missing paid-work seals are not a compatibility claim. A fully canonical-looking current-date tree
  // with only one audit trio must be rejected at the privileged Git boundary; otherwise a crash after the
  // diagnostic pass could skip its deterministic transforms, prewrite, and required final audit pass.
  const currentRoot = 'analyses/NEW_2026-08-14'
  const currentAbs = path.join(repo, currentRoot)
  const writeCurrent = (name: string, bytes: Buffer | string): void => {
    const target = path.join(currentAbs, name)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, bytes)
  }
  writeCurrent('RUN_METADATA.md', '# Run Metadata\n\n## Publication\nready for one path-confined commit\n')
  writeCurrent('final_thesis.md', '# Current unsealed thesis\n')
  const currentDecision = { ...decision, run_root: currentRoot, ticker: 'NEW', decision_date: '2026-08-14' }
  writeCurrent('decision_record.json', JSON.stringify(currentDecision))
  const currentThesisSha = sha(fs.readFileSync(path.join(currentAbs, 'final_thesis.md')))
  const currentDecisionSha = sha(fs.readFileSync(path.join(currentAbs, 'decision_record.json')))
  const currentAuditIdentity = {
    schema_version: '1.0', ticker: 'NEW', run_root: currentRoot,
    final_thesis_path: `${currentRoot}/final_thesis.md`,
    decision_record_path: `${currentRoot}/decision_record.json`,
    final_thesis_sha256: currentThesisSha, decision_record_sha256: currentDecisionSha,
  }
  writeCurrent('verification_report.json', JSON.stringify({
    ...currentAuditIdentity, verified_at: '2026-08-14T10:00:00Z', verifier: 'verify-evidence',
    verdict: 'Clean', integrity_score: 90, blocking_findings: [],
  }))
  writeCurrent('pre_mortem.json', JSON.stringify({
    ...currentAuditIdentity, performed_at: '2026-08-14T10:00:00Z', auditor: 'pre-mortem',
    verdict: 'Survives', survives: true, original_confidence: 70, confidence_haircut: 0,
    recommended_confidence: 70, recommended_rating_cap: '',
  }))
  writeCurrent('expectations_gap.json', JSON.stringify({
    ...currentAuditIdentity, performed_at: '2026-08-14T10:00:00Z', analyst: 'expectations-gap',
    variant_perception_quality: 'Moderate', is_exploitable: true, edge_score: 60,
  }))
  const currentArtifacts = {
    final_thesis: { path: 'final_thesis.md', sha256: currentThesisSha },
    decision_record: { path: 'decision_record.json', sha256: currentDecisionSha },
    verification: { path: 'verification_report.json', sha256: sha(fs.readFileSync(path.join(currentAbs, 'verification_report.json'))) },
    pre_mortem: { path: 'pre_mortem.json', sha256: sha(fs.readFileSync(path.join(currentAbs, 'pre_mortem.json'))) },
    expectations_gap: { path: 'expectations_gap.json', sha256: sha(fs.readFileSync(path.join(currentAbs, 'expectations_gap.json'))) },
  }
  const currentManifest: any = {
    schema_version: 'idea-projection-manifest/v1', run_root: currentRoot,
    created_at: '2026-08-14T10:00:00Z', artifacts: currentArtifacts,
  }
  currentManifest.manifest_sha256 = digest(currentManifest)
  writeCurrent('idea_projection_manifest.json', JSON.stringify(currentManifest))
  const currentAssessment = {
    schema_version: 'idea-assessment/v1', assessment_id: 'NEW-not-assessable', run_root: currentRoot,
    created_at: '2026-08-14T10:01:00Z', ticker: 'NEW', company: null,
    status: 'not_assessable', gaps: ['No current market evidence is available.'], candidate: null,
  }
  writeCurrent('idea_3_6m.json', JSON.stringify(currentAssessment))
  const currentAdmission: any = {
    schema_version: 'qualified-idea-admission/v1', admission_id: 'NEW-not-applicable', status: 'not_applicable',
    run_root: currentRoot, frozen_at: '2026-08-14T10:02:00Z', assessment: currentAssessment,
    assessment_sha256: digest(currentAssessment), candidate: null, candidate_sha256: null,
    decision_authority: null, decision_authority_sha256: null, market_evidence_sha256: null,
    market_evidence: null, projection_manifest_sha256: currentManifest.manifest_sha256,
    integrity_evidence: null, integrity_evidence_sha256: null, gaps: currentAssessment.gaps,
  }
  currentAdmission.admission_sha256 = digest(currentAdmission)
  writeCurrent('idea_admission.json', JSON.stringify(currentAdmission))
  assert.ok(validateCompletedIdeaPublication(currentAbs, currentRoot),
    'the current-date negative fixture is otherwise canonical')
  git(['add', '--', currentRoot])
  assert.equal(validateTerminalGitPublication(repo, { kind: 'index' }, currentRoot), false,
    'a current-date terminal tree cannot infer legacy authority from missing paid-work seals')
  git(['commit', '-q', '-m', 'invalid current terminal without paid completion seals'])
  const currentUnsealedCommit = git(['rev-parse', 'HEAD'])
  assert.equal(validateTerminalGitPublication(repo, { kind: 'commit', oid: currentUnsealedCommit }, currentRoot), false,
    'saved publication cannot replay a current-date terminal commit without the paid-work protocol')
  git(['reset', '-q', '--hard', commit])

  // The saved terminal source remains publishable after its route disappears from today's roster.
  const sourceRepo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
  fs.mkdirSync(path.join(repo, 'scripts'), { recursive: true })
  fs.copyFileSync(path.join(sourceRepo, 'scripts/eval.py'), path.join(repo, 'scripts/eval.py'))
  fs.copyFileSync(path.join(sourceRepo, 'scripts/data_need_contract.py'), path.join(repo, 'scripts/data_need_contract.py'))
  fs.mkdirSync(path.join(repo, '.claude/agents/fixture-module'), { recursive: true })
  fs.writeFileSync(path.join(repo, '.claude/agents/fixture-module/99_fixture-module-synthesis.md'), '# Current roster\n')
  const staleGate = spawnSync('python3', ['scripts/eval.py', '--data-needs-prewrite', `${runRoot}/decision_record.json`], {
    cwd: repo, encoding: 'utf8',
  })
  assert.notEqual(staleGate.status, 0, 'today\'s roster rejects the retired terminal route')

  // A newly staged complete run does NOT get the saved-history exception: it still runs today's gate.
  execFileSync('git', ['init', '-q', '-b', 'main', freshRepo])
  execFileSync('git', ['-C', freshRepo, 'config', 'user.name', 'Test'])
  execFileSync('git', ['-C', freshRepo, 'config', 'user.email', 'test@example.com'])
  fs.writeFileSync(path.join(freshRepo, 'base.txt'), 'base\n')
  execFileSync('git', ['-C', freshRepo, 'add', 'base.txt'])
  execFileSync('git', ['-C', freshRepo, 'commit', '-q', '-m', 'base'])
  execFileSync('git', ['init', '--bare', '-q', '-b', 'main', freshBare])
  execFileSync('git', ['-C', freshRepo, 'remote', 'add', 'origin', freshBare])
  execFileSync('git', ['-C', freshRepo, 'push', '-q', 'origin', 'main'])
  for (const name of fs.readdirSync(runAbs)) {
    const bytes = execFileSync('git', ['-C', repo, 'show', `${commit}:${runRoot}/${name}`])
    const target = path.join(freshRepo, runRoot, name)
    fs.mkdirSync(path.dirname(target), { recursive: true })
    fs.writeFileSync(target, bytes)
  }
  fs.mkdirSync(path.join(freshRepo, 'scripts'), { recursive: true })
  fs.copyFileSync(path.join(sourceRepo, 'scripts/eval.py'), path.join(freshRepo, 'scripts/eval.py'))
  fs.copyFileSync(path.join(sourceRepo, 'scripts/data_need_contract.py'), path.join(freshRepo, 'scripts/data_need_contract.py'))
  fs.mkdirSync(path.join(freshRepo, '.claude/agents/fixture-module'), { recursive: true })
  fs.writeFileSync(path.join(freshRepo, '.claude/agents/fixture-module/99_fixture-module-synthesis.md'), '# Current roster\n')
  const freshBefore = execFileSync('git', ['-C', freshRepo, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  const commitRun = path.join(sourceRepo, 'scripts/commit-run.sh')
  const freshAttempt = spawnSync('bash', [commitRun, 'test: fresh retired route', '--', runRoot], {
    cwd: freshRepo, encoding: 'utf8', env: { ...process.env, ENGINE_NO_PUSH: '1' },
  })
  const freshAfter = execFileSync('git', ['-C', freshRepo, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
  assert.equal(freshAttempt.status, 5)
  assert.match(freshAttempt.stderr, /DATA-NEEDS-PREWRITE: FAIL/)
  assert.equal(freshAfter, freshBefore)

  // The same immutable terminal set may bypass today's drifted roster only when it is the exact scoped
  // continuation of a source plan already published to shared Git. This is the READY crash-recovery shape:
  // no model rerun, no historical re-grade, and no general/manual escape from the creation-time gate.
  const sourceRunRoot = 'analyses/OLD_2026-08-12'
  const planName = '2026-08-13_intake_plan.json'
  const sourcePlan = {
    schema_version: '1.1', swarm: 'research', subject: 'OLD', ticker: 'OLD', run_root: sourceRunRoot,
    decision_fingerprint: `sha256:${'a'.repeat(64)}`,
    scan_date: '2026-08-13', scanned_at: '2026-08-13T00:00:00Z', evidence_files: [], new_docs: [],
    rerun_plan: { materiality_gate: 60, entry_orbs: [], commands: [], note_only: [] },
    verdict: 'note_only', summary: 'No material change.',
  }
  const sourcePlanAbs = path.join(freshRepo, sourceRunRoot, 'intake', planName)
  fs.mkdirSync(path.dirname(sourcePlanAbs), { recursive: true })
  fs.writeFileSync(sourcePlanAbs, JSON.stringify(sourcePlan) + '\n')
  execFileSync('git', ['-C', freshRepo, 'add', '--', sourceRunRoot])
  execFileSync('git', ['-C', freshRepo, 'commit', '-q', '-m', 'published exact automatic plan'])
  execFileSync('git', ['-C', freshRepo, 'push', '-q', 'origin', 'main'])
  const stagedPlanAbs = path.join(freshRepo, runRoot, 'intake', planName)
  fs.mkdirSync(path.dirname(stagedPlanAbs), { recursive: true })
  fs.writeFileSync(stagedPlanAbs, JSON.stringify({ ...sourcePlan, staged_for_scoped_rerun: true }) + '\n')
  execFileSync('git', ['-C', freshRepo, 'add', '--', runRoot])
  assert.equal(validateAutomaticTerminalIndexRecovery(freshRepo, runRoot), true,
    'canonical READY index plus exact shared source plan proves automatic historical recovery')
  execFileSync('git', ['-C', freshRepo, 'reset', '-q'])
  const boundAttempt = spawnSync('bash', [commitRun, 'test: exact automatic retired route recovery', '--', runRoot], {
    cwd: freshRepo, encoding: 'utf8', env: {
      ...process.env, ENGINE_NO_PUSH: '1', ENGINE_PUBLISHED_GIT_REF: 'refs/remotes/origin/main',
    },
  })
  assert.equal(boundAttempt.status, 0, boundAttempt.stderr)
  assert.match(boundAttempt.stdout, /AUTOMATIC_TERMINAL_RECOVERY_VALID=/)

  execFileSync('git', ['init', '--bare', '-q', '-b', 'main', bare])
  git(['remote', 'add', 'origin', bare])
  const baseCommit = git(['rev-parse', `${commit}^`])
  const pendingIndex = path.join(repo, '.git', 'pending-publication-index')
  const pendingEnv = { ...process.env, GIT_INDEX_FILE: pendingIndex }
  execFileSync('git', ['-C', repo, 'read-tree', commit], { env: pendingEnv })
  const pendingBytes = Buffer.from('# Run Metadata\n\n## Publication\npending\n')
  const pendingBlob = execFileSync('git', ['-C', repo, 'hash-object', '-w', '--stdin'], {
    input: pendingBytes, encoding: 'utf8',
  }).trim()
  execFileSync('git', ['-C', repo, 'update-index', '--cacheinfo', '100644', pendingBlob, `${runRoot}/RUN_METADATA.md`], {
    env: pendingEnv,
  })
  const pendingTree = execFileSync('git', ['-C', repo, 'write-tree'], { env: pendingEnv, encoding: 'utf8' }).trim()
  const pendingCommit = execFileSync('git', ['-C', repo, 'commit-tree', pendingTree, '-p', baseCommit], {
    input: 'terminal publication pending\n', encoding: 'utf8',
  }).trim()
  git(['push', '-q', 'origin', `${pendingCommit}:refs/heads/main`])
  const publisher = path.join(sourceRepo, 'scripts/publish-saved-research.sh')
  const replay = spawnSync('bash', [publisher, 'test: replay old-roster terminal', '--source-commit', commit, '--', runRoot], {
    cwd: repo, encoding: 'utf8', env: publicationEnv,
  })
  assert.equal(replay.status, 0, replay.stdout + replay.stderr)
  assert.match(replay.stdout, new RegExp(`TERMINAL_PUBLICATION_REPLAY=${runRoot}`))

  write('memo.md', '# Derived recovery after roster rename\n')
  const derivedCommit = spawnSync('bash', [commitRun, 'test: derived recovery after roster rename', '--', `${runRoot}/memo.md`], {
    cwd: repo, encoding: 'utf8', env: { ...process.env, ENGINE_NO_PUSH: '1' },
  })
  assert.equal(derivedCommit.status, 0, derivedCommit.stdout + derivedCommit.stderr)
  assert.doesNotMatch(derivedCommit.stdout + derivedCommit.stderr, /DATA-NEEDS-PREWRITE/)

  const sharedReady = git(['rev-parse', 'refs/remotes/origin/main'])
  for (const operation of ['change', 'delete'] as const) {
    git(['reset', '--hard', '-q', sharedReady])
    if (operation === 'change') {
      write('RUN_METADATA.md', '# Run Metadata\n\n## Publication\nready for one path-confined commit\nchanged later\n')
      git(['add', '--', `${runRoot}/RUN_METADATA.md`])
    } else {
      git(['rm', '-q', '--', `${runRoot}/RUN_METADATA.md`])
    }
    git(['commit', '-q', '-m', `${operation} ready metadata`])
    const badMetadataSource = git(['rev-parse', 'HEAD'])
    const rejected = spawnSync('bash', [publisher, `test: reject ${operation} ready metadata`,
      '--source-commit', badMetadataSource, '--', `${runRoot}/RUN_METADATA.md`], {
      cwd: repo, encoding: 'utf8', env: publicationEnv,
    })
    assert.equal(rejected.status, 5)
    assert.match(rejected.stderr, /IMMUTABLE_SEALED_RUN_CONFLICT=/)
  }
  git(['reset', '--hard', '-q', commit])

  // Neither mode may read later mutable worktree bytes.
  write('idea_admission.json', '{damaged mutable copy')
  assert.equal(validateTerminalGitPublication(repo, { kind: 'index' }, runRoot), true)
  assert.equal(validateTerminalGitPublication(repo, { kind: 'commit', oid: commit }, runRoot), true)

  git(['rm', '-q', '--cached', `${runRoot}/idea_admission.json`])
  assert.equal(validateTerminalGitPublication(repo, { kind: 'index' }, runRoot), false)
  assert.equal(validateTerminalGitPublication(repo, { kind: 'commit', oid: commit }, runRoot), true)
  git(['reset', '-q', '--hard', commit])

  // A newer direct audit is canonical authority and invalidates a manifest still pinning v1.
  write('verification_report_v2.json', JSON.stringify({ stale: true }))
  git(['add', '--', `${runRoot}/verification_report_v2.json`])
  assert.equal(validateTerminalGitPublication(repo, { kind: 'index' }, runRoot), false)
  git(['reset', '-q', '--hard', commit])

  // Nested authorities are outside the terminal projection, including a nested gitlink.
  git(['update-index', '--add', '--cacheinfo', '160000', commit, `${runRoot}/nested/module`])
  assert.equal(validateTerminalGitPublication(repo, { kind: 'index' }, runRoot), true)
  git(['reset', '-q', '--hard', commit])

  write('RUN_METADATA.md', '# Run Metadata\n\n## Publication\npending\n')
  git(['add', '--', `${runRoot}/RUN_METADATA.md`])
  assert.equal(validateTerminalGitPublication(repo, { kind: 'index' }, runRoot), false)
  console.log('terminal-publication-validator: ok')
} finally {
  fs.rmSync(repo, { recursive: true, force: true })
  fs.rmSync(bare, { recursive: true, force: true })
  fs.rmSync(freshRepo, { recursive: true, force: true })
  fs.rmSync(freshBare, { recursive: true, force: true })
}
