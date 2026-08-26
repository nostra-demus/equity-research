process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { assertParityCanaryStageRoot, isRecoverableParityInterruptionReason } from '../src/launcher'
import { buildSwarmGraph } from '../src/roster'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-parity-stage-'))
try {
  for (const reason of [
    'codex_incomplete_orchestration', 'codex_continuation_failed',
    'continuation_spawn_failed',
    'terminated_sigterm', 'supervisor_shutdown', 'supervisor_restart',
  ]) {
    assert.equal(isRecoverableParityInterruptionReason(reason), true, `${reason} is an exact machine-stop recovery reason`)
  }
  for (const reason of ['cancelled_by_user', 'out_of_credits', '', null]) {
    assert.equal(isRecoverableParityInterruptionReason(reason), false, `${String(reason)} cannot bypass the continuation gate`)
  }

  const missingRoot = path.join(root, 'does-not-exist')
  let missingError: (Error & { statusCode?: number }) | undefined
  try {
    assertParityCanaryStageRoot(missingRoot, 'chain')
  } catch (error) {
    missingError = error as Error & { statusCode?: number }
  }
  assert.match(missingError?.message ?? '', /no longer exists/,
    'a root that disappears before the stage check is a controlled conflict')
  assert.ok(missingError)
  assert.equal(missingError.statusCode, 409)

  fs.writeFileSync(path.join(root, '.provider-parity-input.json'), '{}\n')
  assert.doesNotThrow(() => assertParityCanaryStageRoot(root, 'chain'))
  fs.writeFileSync(path.join(root, '.DS_Store'), 'Finder metadata\n')
  assert.doesNotThrow(
    () => assertParityCanaryStageRoot(root, 'chain'),
    'macOS Finder metadata is not research evidence and does not contaminate a pristine root',
  )

  fs.writeFileSync(path.join(root, '.defer_module_memos'), '')
  assert.throws(
    () => assertParityCanaryStageRoot(root, 'chain'),
    /no longer pristine/,
    'the logical chain admission accepts only the immutable binding',
  )

  fs.writeFileSync(path.join(root, '.requires_idea_publication'), '')
  fs.mkdirSync(path.join(root, '_pool_extracts'))
  fs.mkdirSync(path.join(root, 'business-model'))
  fs.writeFileSync(path.join(root, 'business-model', '01_partial.md'), '# Partial sibling\n')
  fs.writeFileSync(path.join(root, '.interrupted'), JSON.stringify({ reason: 'codex_incomplete_orchestration' }) + '\n')
  fs.writeFileSync(path.join(root, 'RUN_FAILURE.md'), '# Prior attempt stopped\n')
  assert.doesNotThrow(
    () => assertParityCanaryStageRoot(root, 'continuation'),
    'an interrupted canary may retain validated partial modules and supervisor failure markers',
  )
  fs.writeFileSync(path.join(root, '.aborted'), '{}\n')
  assert.throws(
    () => assertParityCanaryStageRoot(root, 'continuation'),
    /requires an interruption marker and no abort marker/,
    'an operator-aborted canary cannot be continued',
  )
  fs.rmSync(path.join(root, '.aborted'))
  for (const [name, content] of Object.entries({
    'final_thesis.md': '# Retained terminal thesis\n',
    'decision_record.json': '{"decision":"Avoid"}\n',
    'idea_3_6m.json': '{"status":"not_assessable"}\n',
    'memo.md': '# Retained memo\n',
    'audit_dossier.md': '# Retained audit\n',
    'RUN_METADATA.md': '# Retained metadata\n',
  })) fs.writeFileSync(path.join(root, name), content)
  assert.doesNotThrow(
    () => assertParityCanaryStageRoot(root, 'continuation'),
    'a sealed same-root continuation may retain raw terminal work while repairing publication',
  )
  fs.writeFileSync(path.join(root, 'execution_provenance.receipt.json'), '{}\n')
  assert.throws(
    () => assertParityCanaryStageRoot(root, 'continuation'),
    /already supervisor-published/,
    'a supervisor-published canary cannot enter the recovery path',
  )
  fs.rmSync(path.join(root, 'execution_provenance.receipt.json'))
  for (const name of [
    'final_thesis.md', 'decision_record.json', 'idea_3_6m.json',
    'memo.md', 'audit_dossier.md', 'RUN_METADATA.md',
  ]) {
    fs.rmSync(path.join(root, name))
  }
  fs.rmSync(path.join(root, '.interrupted'))
  fs.rmSync(path.join(root, 'RUN_FAILURE.md'))
  assert.doesNotThrow(
    () => assertParityCanaryStageRoot(root, 'module'),
    'module admissions permit an in-flight sibling directory from the same scheduler',
  )
  assert.throws(
    () => assertParityCanaryStageRoot(root, 'final'),
    /not complete|before every module is complete/,
    'terminal adjudication refuses a partial DAG',
  )

  for (const module of buildSwarmGraph().modules) {
    const dir = path.join(root, module.name)
    fs.mkdirSync(dir, { recursive: true })
    for (const agent of Object.values(module.layers).flat().filter((item) => item.isSynthesis)) {
      const file = `${agent.key.split('/').at(-1)}.md`
      fs.writeFileSync(path.join(dir, file), `# ${module.name} synthesis\n\nVerdict: mechanically valid test artifact.\n`)
    }
  }
  fs.writeFileSync(path.join(root, 'final_thesis.md'), '# Retained interrupted thesis\n')
  fs.writeFileSync(path.join(root, 'decision_record.json'), '{"decision":"Avoid"}\n')
  fs.writeFileSync(path.join(root, 'idea_3_6m.json'), '{"status":"not_assessable"}\n')
  assert.doesNotThrow(
    () => assertParityCanaryStageRoot(root, 'final'),
    'the terminal recovery stage accepts retained raw adjudication after every module validates',
  )

  const businessSynthesis = buildSwarmGraph().modules
    .find((module) => module.name === 'business-model')!
  const businessSynthesisAgent = Object.values(businessSynthesis.layers).flat()
    .find((agent) => agent.isSynthesis)!
  const synthesisPath = path.join(root, 'business-model', `${businessSynthesisAgent.key.split('/').at(-1)}.md`)
  fs.rmSync(synthesisPath)
  fs.mkdirSync(synthesisPath)
  assert.throws(
    () => assertParityCanaryStageRoot(root, 'final'),
    /not complete/,
    'a directory named like the synthesis is never accepted as a terminal artifact',
  )
  fs.rmSync(synthesisPath, { recursive: true })
  fs.writeFileSync(synthesisPath, '# business-model synthesis\n\nVerdict: mechanically valid test artifact.\n')

  const failFastModule = buildSwarmGraph().modules.find((module) =>
    Object.values(module.layers).flat().some((agent) => agent.nn === '00' && agent.failFast))!
  const failFastTriage = Object.values(failFastModule.layers).flat()
    .find((agent) => agent.nn === '00' && agent.failFast)!
  const failFastSynthesis = Object.values(failFastModule.layers).flat().find((agent) => agent.isSynthesis)!
  const failFastSynthesisPath = path.join(root, failFastModule.name, `${failFastSynthesis.key.split('/').at(-1)}.md`)
  const failFastTriagePath = path.join(root, failFastModule.name, `${failFastTriage.key.split('/').at(-1)}.md`)
  fs.rmSync(failFastSynthesisPath)
  fs.writeFileSync(failFastTriagePath, '# Triage\n\nVerdict: Insufficient\n')
  assert.doesNotThrow(
    () => assertParityCanaryStageRoot(root, 'final'),
    'a validated fail-fast Insufficient triage is a completed capped module outcome',
  )
  fs.writeFileSync(failFastTriagePath, '# Triage\n\nVerdict: Partial\n')
  assert.throws(
    () => assertParityCanaryStageRoot(root, 'final'),
    /not complete|before every module is complete/,
    'a non-Insufficient triage cannot masquerade as a completed fail-fast outcome',
  )
  fs.rmSync(failFastTriagePath)
  fs.mkdirSync(failFastTriagePath)
  assert.throws(
    () => assertParityCanaryStageRoot(root, 'final'),
    /not complete|before every module is complete/,
    'an unreadable or wrong-type triage fails closed as incomplete instead of escaping as an I/O error',
  )
  fs.rmSync(failFastTriagePath, { recursive: true })
  fs.writeFileSync(failFastSynthesisPath, `# ${failFastModule.name} synthesis\n\nVerdict: mechanically valid test artifact.\n`)

  fs.writeFileSync(path.join(root, 'untrusted.txt'), 'unexpected\n')
  assert.throws(
    () => assertParityCanaryStageRoot(root, 'module'),
    /unexpected top-level path/,
    'an unknown top-level artifact cannot enter the frozen chain',
  )
} finally {
  fs.rmSync(root, { recursive: true, force: true })
}

console.log('provider-parity-stage-root.test.ts: pristine, in-flight, complete, and contamination gates pass')
