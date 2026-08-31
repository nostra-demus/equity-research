process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { REPO_ROOT } from '../src/config'
import { planCodexAutomaticContinuation, providerWritablePaths } from '../src/launcher'
import { createRun, type RunState } from '../src/registry'
import { handleStreamLine } from '../src/stream-parser'

const profile = {
  key: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
  parentModel: 'gpt-5.6-sol', parentReasoning: 'max',
  specialistModel: 'gpt-5.6-terra', specialistReasoning: 'xhigh',
}

function makeRun(provider: 'claude' | 'codex' = 'codex'): RunState {
  const expected = new Map([
    ['business-model/00_data-triage', {
      key: 'business-model/00_data-triage', module: 'business-model', name: 'data-triage', layer: 0,
      outputRel: 'business-model/00_data-triage.md',
    }],
    ['business-model/09_moat', {
      key: 'business-model/09_moat', module: 'business-model', name: 'moat', layer: 1,
      outputRel: 'business-model/09_moat.md',
    }],
    ['business-model/99_business-model-synthesis', {
      key: 'business-model/99_business-model-synthesis', module: 'business-model',
      name: 'business-model-synthesis', layer: 2, outputRel: 'business-model/99_business-model-synthesis.md',
    }],
  ])
  const run = createRun({
    kind: 'module', ticker: `ZZCONT${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
    module: 'business-model', provider,
    model: provider === 'codex' ? 'gpt-5.6-sol' : 'sonnet', reasoningLevel: provider === 'codex' ? 'max' : 'default',
    profileKey: provider === 'codex' ? profile.key : 'claude:sonnet:default',
    executionProfile: provider === 'codex' ? profile : { key: 'claude:sonnet:default', parentModel: 'sonnet' },
    prompt: '', user: 'test', userVia: 'local',
    runRoot: 'analyses/ZZ_NO_SUCH_CODEX_CONTINUATION_2099-01-01',
    willCommitToMain: true, writeTargetsAbs: [], coveredModules: ['business-model'], readDepsAbs: [], expected,
  })
  for (const item of expected.values()) {
    run.agents.set(item.key, {
      key: item.key, module: item.module, name: item.name, layer: item.layer, status: 'queued',
    })
  }
  run.status = 'running'
  return run
}

const cleanExit = { exitCode: 0 }

{
  const run = makeRun()
  run.agents.get('business-model/00_data-triage')!.status = 'done'
  const first = planCodexAutomaticContinuation(run, cleanExit)
  assert.equal(first.continue, true)
  assert.equal(first.index, 1)
  assert.equal(first.stagnantTurns, 0)
  assert.deepEqual(first.completedOutputs, ['business-model/00_data-triage.md'])
  assert.deepEqual(first.unresolvedOutputs, [
    'business-model/09_moat.md', 'business-model/99_business-model-synthesis.md',
  ])

  run.automaticContinuationCount = first.index
  run.automaticContinuationCheckpoint = first.checkpoint
  run.automaticContinuationStagnantTurns = first.stagnantTurns
  const oneStagnantBoundary = planCodexAutomaticContinuation(run, cleanExit)
  assert.equal(oneStagnantBoundary.continue, true, 'one no-progress continuation is tolerated')
  assert.equal(oneStagnantBoundary.stagnantTurns, 1)

  run.automaticContinuationCount = oneStagnantBoundary.index
  run.automaticContinuationCheckpoint = oneStagnantBoundary.checkpoint
  run.automaticContinuationStagnantTurns = oneStagnantBoundary.stagnantTurns
  const secondStagnantBoundary = planCodexAutomaticContinuation(run, cleanExit)
  assert.deepEqual(secondStagnantBoundary, { continue: false, reason: 'no_artifact_progress' })

  run.agents.get('business-model/09_moat')!.status = 'done'
  const progressResetsGuard = planCodexAutomaticContinuation(run, cleanExit)
  assert.equal(progressResetsGuard.continue, true)
  assert.equal(progressResetsGuard.stagnantTurns, 0)
}

{
  const run = makeRun()
  assert.equal(planCodexAutomaticContinuation(run, cleanExit, '', true).reason, 'descendant_writer_observed')
  assert.equal(planCodexAutomaticContinuation(run, undefined).reason, 'provider_process_nonclean')
  assert.equal(planCodexAutomaticContinuation(run, { exitCode: 0, failed: true }).reason, 'provider_process_nonclean')
  assert.equal(planCodexAutomaticContinuation(run, { exitCode: 7 }).reason, 'provider_process_nonclean')
  run.cliResult = { subtype: 'out_of_credits', isError: true }
  assert.equal(planCodexAutomaticContinuation(run, cleanExit).reason, 'provider_error')
}

{
  const run = makeRun()
  run.agents.get('business-model/00_data-triage')!.status = 'done'
  handleStreamLine(run,
    '{"type":"turn.failed","error":{"message":"Selected model is at capacity. Please try a different model."}}')
  const capacityRetry = planCodexAutomaticContinuation(run, { exitCode: 1, failed: true })
  assert.equal(capacityRetry.continue, true,
    'a model-capacity turn failure continues the exact admitted run instead of stranding saved work')
  assert.equal(capacityRetry.reason, 'model_capacity_retry')
  assert.deepEqual(capacityRetry.completedOutputs, ['business-model/00_data-triage.md'])
  assert.deepEqual(capacityRetry.unresolvedOutputs, [
    'business-model/09_moat.md', 'business-model/99_business-model-synthesis.md',
  ])
}

{
  const claude = makeRun('claude')
  assert.deepEqual(planCodexAutomaticContinuation(claude, cleanExit), {
    continue: false, reason: 'provider_not_codex',
  })
}

{
  const signal = makeRun()
  signal.kind = 'signal'
  signal.runRoot = `screener/runs/SIG-20990101-${Math.random().toString(16).slice(2, 10)}`
  const absolute = path.join(REPO_ROOT, signal.runRoot)
  fs.mkdirSync(absolute, { recursive: true })
  try {
    const missingMetadata = planCodexAutomaticContinuation(signal, cleanExit)
    assert.equal(missingMetadata.continue, true,
      'a signal parent that ended before its run metadata continues')
    assert.ok(missingMetadata.unresolvedOutputs?.includes('RUN_METADATA.md'),
      'a signal continuation always gives the provider a non-empty terminal inventory')
    fs.writeFileSync(path.join(absolute, 'RUN_METADATA.md'), '# Signal run\n\nFinal routing: PARK\n')
    assert.equal(planCodexAutomaticContinuation(signal, cleanExit).reason, 'completion_barrier_not_missing',
      'a valid terminal PARK/LOG outcome is complete even when later discovered orbs never ran')
  } finally {
    fs.rmSync(absolute, { recursive: true, force: true })
  }
}

{
  const run = makeRun()
  run.kind = 'full'
  run.module = 'master'
  run.runRoot = `analyses/ZZTERM${Math.random().toString(16).slice(2, 8).toUpperCase()}_2099-01-01`
  for (const agent of run.agents.values()) agent.status = 'done'
  const absolute = path.join(REPO_ROOT, run.runRoot)
  fs.mkdirSync(absolute, { recursive: true })
  try {
    fs.writeFileSync(path.join(absolute, 'final_thesis.md'), [
      '> ⚠️ **PROVISIONAL — the automated finish-gate found an integrity issue; this thesis was committed UNVERIFIED.**',
      '> fixture integrity reason',
      '>',
      '> Resolve the flagged issue before relying on these numbers.',
      '',
      '# Terminal thesis',
      '',
      'Avoid.',
      '',
    ].join('\n'))
    fs.writeFileSync(path.join(absolute, 'decision_record.json'), JSON.stringify({
      schema_version: '1.0', created_by: 'synthesizer', decision: 'Avoid',
    }, null, 2) + '\n')
    fs.writeFileSync(path.join(absolute, 'idea_3_6m.json'), JSON.stringify({
      schema_version: 'idea-assessment/1.0', status: 'not_assessable',
    }, null, 2) + '\n')
    fs.writeFileSync(path.join(absolute, 'RUN_METADATA.md'), '# Staged metadata\n\nNot published.\n')
    fs.writeFileSync(path.join(absolute, '.requires_idea_publication'), '')

    const terminalContinuation = planCodexAutomaticContinuation(run, cleanExit)
    assert.equal(terminalContinuation.continue, true,
      'a clean master boundary continues when only terminal publication artifacts remain')
    assert.ok(terminalContinuation.completedOutputs?.includes('final_thesis.md'))
    assert.ok(terminalContinuation.checkpoint?.includes('terminal:final_thesis.md'),
      'the canonical finish-gate banner does not make a valid thesis look incomplete')
    assert.ok(terminalContinuation.completedOutputs?.includes('decision_record.json'))
    assert.ok(terminalContinuation.completedOutputs?.includes('idea_3_6m.json'))
    assert.ok(terminalContinuation.checkpoint?.includes('terminal:decision_record.json'))
    assert.ok(terminalContinuation.unresolvedOutputs?.includes('memo.md'))
    assert.ok(terminalContinuation.unresolvedOutputs?.includes('audit_dossier.md'))
    assert.ok(terminalContinuation.unresolvedOutputs?.includes('RUN_METADATA.md'),
      'staged metadata stays unresolved until immutable Ideas publication clears its marker')

    run.automaticContinuationCount = terminalContinuation.index
    run.automaticContinuationCheckpoint = terminalContinuation.checkpoint
    run.automaticContinuationStagnantTurns = terminalContinuation.stagnantTurns
    fs.writeFileSync(path.join(absolute, 'memo.md'), '# Memo\n\nTerminal memo.\n')
    const terminalProgress = planCodexAutomaticContinuation(run, cleanExit)
    assert.equal(terminalProgress.continue, true)
    assert.equal(terminalProgress.stagnantTurns, 0,
      'new terminal artifacts reset the no-progress guard after every module is already complete')
    assert.ok(terminalProgress.completedOutputs?.includes('memo.md'))
    assert.ok(terminalProgress.checkpoint?.includes('terminal:memo.md'))

    fs.rmSync(path.join(absolute, '.requires_idea_publication'))
    fs.rmSync(path.join(absolute, 'RUN_METADATA.md'))
    fs.writeFileSync(path.join(absolute, 'audit_dossier.md'), '# Audit dossier\n\nTerminal audit.\n')
    assert.equal(planCodexAutomaticContinuation(run, cleanExit).continue, true,
      'clearing the publication marker cannot bypass a still-missing declared terminal output')
    fs.writeFileSync(path.join(absolute, 'RUN_METADATA.md'), '# Run metadata\n\nPublished.\n')
    assert.equal(planCodexAutomaticContinuation(run, cleanExit).reason, 'completion_barrier_not_missing',
      'the logical run stops continuing only after every declared terminal output is valid')
  } finally {
    fs.rmSync(absolute, { recursive: true, force: true })
  }
}

{
  const run = makeRun()
  run.kind = 'rerun'
  run.module = 'master'
  run.writeTargetsAbs = [
    'final_thesis.md', 'memo.md', 'audit_dossier.md', 'decision_record.json',
  ].map((name) => path.join(REPO_ROOT, run.runRoot!, name))
  const absolute = path.join(REPO_ROOT, run.runRoot!)
  assert.ok(!providerWritablePaths(run).includes(absolute),
    'the initial master rerun retains its admitted exact-path write scope')
  run.automaticContinuationCount = 1
  assert.deepEqual(providerWritablePaths(run), [absolute],
    'the same-run continuation can finish every publication artifact inside its exact saved root')
}

console.log('Codex automatic continuation planner: ok')
