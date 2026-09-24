import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const sourceRepo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const repo = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'research-audit-')))
process.env.ENGINE_REPO_ROOT = repo
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
process.env.ENGINE_STATE_DIR = path.join(repo, '.state')
const { validateProjectionManifest } = await import('../src/qualified-ideas-store')
const { assertResearchAuditPublication, PublicationRefusedError, SUPERVISOR_CONTROL_MARKERS, researchAuditRecoveryBlocked, planCodexAutomaticContinuation } = await import('../src/launcher')
const { RESEARCH_AUDIT_ATTEMPT_MARKERS, researchAuditFields, researchAuditsReconciled } = await import('../src/research-audit-outcome')
const root = 'analyses/TEST_2026-09-24'
const absolute = path.join(repo, root)

try {
  // Python creates the real v2 envelope. TypeScript must accept exactly the same
  // bytes and reject the same analytical changes, including after runtime stamping.
  execFileSync('python3', ['-c', `
import sys,shutil
sys.path.insert(0, sys.argv[1] + '/scripts')
from test_research_audit_outcome import AuditOutcomeTests
from research_audit_outcome import run
from create_idea_projection_manifest import create
t=AuditOutcomeTests();t.setUp()
run(t.root,'apply',t.repo);t.audit(version=2);create(t.root,t.repo)
shutil.copytree(t.path,sys.argv[2]);t.tearDown()
`, sourceRepo, absolute], { stdio: 'pipe' })
  fs.copyFileSync(path.join(absolute, 'final_thesis.md'), path.join(absolute, 'memo.md'))
  assert.ok(validateProjectionManifest(absolute, root), 'Python and runtime agree on reconciled v2')
  assert.equal(researchAuditRecoveryBlocked(root), false)
  const context = { swarmId: 'research', kind: 'full' as const, runRoot: root }
  assert.doesNotThrow(() => assertResearchAuditPublication(context))
  const validMemo = fs.readFileSync(path.join(absolute, 'memo.md'), 'utf8')
  fs.writeFileSync(path.join(absolute, 'memo.md'), '# Stale confidence: 42')
  assert.throws(() => assertResearchAuditPublication(context), /memo does not carry/)
  fs.writeFileSync(path.join(absolute, 'memo.md'), validMemo)
  const recordPath = path.join(absolute, 'decision_record.json')
  const decision = JSON.parse(fs.readFileSync(recordPath, 'utf8'))
  decision.execution_provenance = { source: 'cockpit_runtime', test: true }
  fs.writeFileSync(recordPath, JSON.stringify(decision, null, 2))
  assert.ok(validateProjectionManifest(absolute, root), 'runtime metadata cannot invalidate the sealed analysis')
  assert.doesNotThrow(() => assertResearchAuditPublication({ ...context, kind: 'rerun' }))
  for (const key of ['post_review_confidence_score', 'confidence_score', 'post_review_edge_score']) {
    fs.writeFileSync(recordPath, JSON.stringify({ ...decision, [key]: 99 }))
    assert.equal(validateProjectionManifest(absolute, root), null, `${key} remains bound`)
    assert.throws(() => assertResearchAuditPublication(context), PublicationRefusedError,
      'deterministic audit failure enters manual-only recovery, never paid automatic continuation')
  }
  assert.equal(researchAuditRecoveryBlocked(root), true, 'a consumed correction without a valid seal blocks paid recovery')
  const interrupted = { ...context, provider: 'codex', expected: new Map([['master', {}]]), status: 'running' } as any
  assert.deepEqual(planCodexAutomaticContinuation(interrupted, { exitCode: 0 }), { continue: false, reason: 'publication_refused' })
  fs.writeFileSync(recordPath, JSON.stringify(decision))
  const audits = Object.fromEntries(['pre_mortem', 'expectations_gap', 'verification'].map(name => [name,
    JSON.parse(fs.readFileSync(path.join(absolute, `${name === 'verification' ? 'verification_report' : name}_v2.json`), 'utf8'))]))
  const longDecision = { ...decision, decision: 'Buy', basket: 'Selected', post_mortem_decision: 'Buy' }
  for (const [cap, expected, basket] of [['cap at Avoid', 'Avoid', 'Rejected'], ['Watchlist', 'Watchlist', 'Watchlist'],
    ['Insufficient Data — Refuse To Rate', 'Insufficient Data — Refuse To Rate', 'Insufficient Data']]) {
    const fields = researchAuditFields(longDecision, { ...audits, pre_mortem: { ...audits.pre_mortem, recommended_rating_cap: cap } })!
    assert.equal(fields.post_mortem_decision, expected)
    assert.equal(fields.post_mortem_basket, basket)
  }
  assert.equal(researchAuditFields({ ...decision, decision: 'Pair Trade / Hedge Required', basket: 'Watchlist', post_mortem_decision: 'Pair Trade / Hedge Required' }, audits)?.post_mortem_basket, 'Watchlist')
  assert.equal(researchAuditFields(longDecision, { ...audits, pre_mortem: { ...audits.pre_mortem, recommended_rating_cap: 'perhaps Avoid if growth slows' } }), null)
  assert.equal(researchAuditsReconciled({ ...decision, post_review_is_exploitable: 0 },
    fs.readFileSync(path.join(absolute, 'final_thesis.md'), 'utf8'), audits), false)
  const hiddenWarning = '<!-- PROVISIONAL — the automated finish-gate -->\n' + validMemo.slice(validMemo.indexOf('<!-- research-review:start -->'))
  assert.equal(researchAuditsReconciled(decision, hiddenWarning, audits), false)
  const thesisPath = path.join(absolute, 'final_thesis.md')
  fs.appendFileSync(thesisPath, '\nChanged claim.\n')
  assert.equal(validateProjectionManifest(absolute, root), null, 'thesis exact bytes remain bound')
  assert.throws(() => assertResearchAuditPublication(context), PublicationRefusedError)
  assert.doesNotThrow(() => assertResearchAuditPublication({ ...context, kind: 'module' }), 'module checkpoints have no final thesis publication obligation')
  for (const provider of ['claude', 'codex']) {
    const parityRoot = `analyses/provider-parity/2026-09-24/${provider}/TEST_2026-09-24__attempt-1234abcd`
    const parityAbs = path.join(repo, parityRoot)
    execFileSync('python3', ['-c', `
import sys,shutil
from pathlib import Path
sys.path.insert(0, sys.argv[1] + '/scripts')
from test_research_audit_outcome import AuditOutcomeTests
from research_audit_outcome import run
from create_idea_projection_manifest import create
t=AuditOutcomeTests();t.setUp()
old=t.path;t.root=sys.argv[3];t.path=Path(t.repo)/t.root
shutil.copytree(old,t.path)
d=t.read('decision_record.json');d['run_root']=t.root;t.write('decision_record.json',d)
t.audit();run(t.root,'apply',t.repo);t.audit(version=2);create(t.root,t.repo)
shutil.copytree(t.path,sys.argv[2]);t.tearDown()
`, sourceRepo, parityAbs, parityRoot], { stdio: 'pipe' })
    fs.copyFileSync(path.join(parityAbs, 'final_thesis.md'), path.join(parityAbs, 'memo.md'))
    assert.ok(validateProjectionManifest(parityAbs, parityRoot), `${provider}: nested attempt seal accepted`)
    assert.doesNotThrow(() => assertResearchAuditPublication({ ...context, runRoot: parityRoot }))
    fs.appendFileSync(path.join(parityAbs, 'final_thesis.md'), '\nChanged claim.\n')
    assert.throws(() => assertResearchAuditPublication({ ...context, runRoot: parityRoot }), PublicationRefusedError)
  }
  for (const name of RESEARCH_AUDIT_ATTEMPT_MARKERS) assert.ok(SUPERVISOR_CONTROL_MARKERS.has(name))
} finally {
  fs.rmSync(repo, { recursive: true, force: true })
}
console.log('research audit outcome: cross-runtime binding, final publication refusal and checkpoint isolation passed')
