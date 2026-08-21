import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import {
  quarantineExactAgentArtifacts,
  quarantineExactSynthesisArtifact,
  validateAgentOutputFile,
  validateAgentOutputText,
} from '../../../scripts/agent-output-validity.mjs'

const valid = '# Report\n\n## Finding\n\n```json\n{"ok":true}\n```\n'
assert.deepEqual(validateAgentOutputText(valid), { valid: true, reasons: [] })
assert.equal(validateAgentOutputText('## Wrong level\n').valid, false)
assert.deepEqual(validateAgentOutputText('# Report\n\n```json\n{"cut":true}\n').reasons, ['unclosed-code-fence'])
assert.equal(validateAgentOutputText('# Report\n\nAgent: saved-orb\n').valid, false)
assert.equal(validateAgentOutputText('# Report\n\nAgent: cited-in-body\n' + '\n'.repeat(21) + '## End\n').valid, true,
  'only the trailing chat-confirmation window is structural')

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-output-validity-'))
const file = path.join(tmp, '01_check.md')
fs.writeFileSync(file, valid)
assert.equal(validateAgentOutputFile(file).valid, true)
const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../scripts/agent-output-validity.mjs')
assert.equal(spawnSync(process.execPath, [script, file]).status, 0, 'pipeline CLI and imported server validator agree')
fs.writeFileSync(file, '# Report\n\n~~~csv\na,b\n')
assert.equal(validateAgentOutputFile(file).valid, false)
assert.equal(spawnSync(process.execPath, [script, file]).status, 1, 'the CLI rejects the same malformed file')

const analyses = path.join(tmp, 'analyses')
const moduleDir = path.join(analyses, 'TEST_2026-08-21', 'management-governance')
fs.mkdirSync(moduleDir, { recursive: true })
const failedOutput = path.join(moduleDir, '07_failed-check.md')
const failedSignal = path.join(moduleDir, '07_failed-check.signals.json')
const reusedOutput = path.join(moduleDir, '06_reused-check.md')
const exactEnv = {
  NOSTRA_EXACT_MODULE_RESUME: '1',
  NOSTRA_EXACT_MODULE_RUN_ROOT: 'analyses/TEST_2026-08-21',
  NOSTRA_EXACT_MODULE_NAME: 'management-governance',
  NOSTRA_EXACT_MODULE_WRITABLE_ORBS: '07_failed-check,08_another-missing-check',
  NOSTRA_EXACT_MODULE_SYNTHESIS_ORBS: '99_management-governance-synthesis',
}
fs.writeFileSync(failedOutput, '# Truncated\n```json\n')
fs.writeFileSync(failedSignal, '{"partial":true}')
fs.writeFileSync(reusedOutput, valid)
quarantineExactAgentArtifacts([failedOutput, failedSignal], analyses, exactEnv)
assert.equal(fs.existsSync(failedOutput), false)
assert.equal(fs.existsSync(failedSignal), false)
assert.equal(fs.readFileSync(reusedOutput, 'utf8'), valid, 'quarantine never touches a reused sibling')

fs.writeFileSync(failedOutput, '# Partial from a Task error\n')
fs.writeFileSync(failedSignal, '{"partial":true}')
const cliEnv = { ...process.env, ...exactEnv }
assert.equal(spawnSync(process.execPath, [script, '--quarantine-exact', failedOutput, failedSignal], { cwd: tmp, env: cliEnv }).status, 0)
assert.equal(fs.existsSync(failedOutput), false, 'the exact-mode CLI removes a partial markdown remnant')
assert.equal(fs.existsSync(failedSignal), false, 'the exact-mode CLI removes its paired sidecar')
assert.equal(fs.existsSync(reusedOutput), true)
assert.equal(spawnSync(process.execPath, [script, '--quarantine-exact', failedOutput, failedSignal], { cwd: tmp, env: cliEnv }).status, 0,
  'the exact approved pair remains safe and idempotent when it is already absent')

const blockingDir = path.join(moduleDir, '08_blocking-dir.md')
fs.mkdirSync(blockingDir)
const blockingEnv = { ...cliEnv, NOSTRA_EXACT_MODULE_WRITABLE_ORBS: `${exactEnv.NOSTRA_EXACT_MODULE_WRITABLE_ORBS},08_blocking-dir` }
assert.equal(spawnSync(process.execPath, [script, '--quarantine-exact', blockingDir], { cwd: tmp, env: blockingEnv }).status, 1,
  'cleanup failure is nonzero, so the prompt must stop before synthesis/publication')
assert.equal(fs.existsSync(blockingDir), true, 'the helper never recursively removes a directory')

const otherRun = path.join(analyses, 'TEST_2026-08-20', 'management-governance')
const otherModule = path.join(analyses, 'TEST_2026-08-21', 'business-model')
fs.mkdirSync(otherRun, { recursive: true })
fs.mkdirSync(otherModule, { recursive: true })
assert.throws(() => quarantineExactAgentArtifacts([path.join(otherRun, '07_failed-check.md')], analyses, exactEnv), /unsafe exact-agent artifact/,
  'the reviewed run root is an executable boundary')
assert.throws(() => quarantineExactAgentArtifacts([path.join(otherModule, '07_failed-check.md')], analyses, exactEnv), /unsafe exact-agent artifact/,
  'the reviewed module is an executable boundary')
assert.throws(() => quarantineExactAgentArtifacts([path.join(moduleDir, '06_reused-check.md')], analyses, exactEnv), /writable-orb receipt/,
  'a reused paid orb cannot be deleted by substituting its path')
assert.throws(() => quarantineExactAgentArtifacts([path.join(moduleDir, '99_management-governance-synthesis.md')], analyses, exactEnv), /writable-orb receipt/,
  'the specialist cleanup helper never deletes a synthesis')
assert.throws(() => quarantineExactAgentArtifacts([failedSignal], analyses, exactEnv), /markdown is not/,
  'a signal artifact cannot occupy the required markdown slot')
assert.throws(() => quarantineExactAgentArtifacts([
  failedOutput,
  path.join(moduleDir, '08_another-missing-check.md'),
], analyses, exactEnv), /signal sidecar does not match/,
  'the optional second path cannot be another markdown file')
assert.throws(() => quarantineExactAgentArtifacts([
  failedOutput,
  path.join(moduleDir, '08_another-missing-check.signals.json'),
], analyses, exactEnv), /signal sidecar does not match/,
  'a sidecar must match the same specialist stem')
assert.throws(() => quarantineExactAgentArtifacts([failedOutput], analyses, {}), /exact module resume is not enabled/,
  'missing child-only exact-mode environment fails closed')
assert.throws(() => quarantineExactAgentArtifacts([failedOutput], analyses, {
  ...exactEnv,
  NOSTRA_EXACT_MODULE_WRITABLE_ORBS: '99_management-governance-synthesis',
}), /writable-orb receipt/, 'the server cannot authorize 99 through the specialist cleanup receipt')

const synthesis = path.join(moduleDir, '99_management-governance-synthesis.md')
fs.writeFileSync(synthesis, '# Superficially valid summary left by an errored Task\n')
quarantineExactSynthesisArtifact(synthesis, analyses, exactEnv)
assert.equal(fs.existsSync(synthesis), false,
  'a Task error cannot leave a valid-looking current 99 that planning would mistake for done')
fs.writeFileSync(synthesis, '# Truncated summary\n```json\n')
assert.equal(spawnSync(process.execPath, [script, '--quarantine-exact-synthesis', synthesis], { cwd: tmp, env: cliEnv }).status, 0)
assert.equal(fs.existsSync(synthesis), false,
  'the real CLI removes only the bound current synthesis after mechanical validation fails')
assert.equal(spawnSync(process.execPath, [script, '--quarantine-exact-synthesis', synthesis], { cwd: tmp, env: cliEnv }).status, 0,
  'synthesis cleanup is idempotent when the exact approved path is already absent')
assert.throws(() => quarantineExactSynthesisArtifact(path.join(moduleDir, '99_retired-synthesis.md'), analyses, exactEnv), /synthesis-orb receipt/,
  'an obsolete or substituted 99 cannot be deleted')
assert.throws(() => quarantineExactSynthesisArtifact(path.join(otherModule, '99_management-governance-synthesis.md'), analyses, exactEnv), /unsafe exact-agent artifact/,
  'the synthesis receipt cannot be used across modules')

const pipeline = fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../frameworks/MODULE_PIPELINE.md'), 'utf8')
assert.match(pipeline, /NOT reused[\s\S]*--quarantine-exact[\s\S]*before dispatching\s+that orb or the `99` synthesis/,
  'exact mode clears only newly-run paths before their sole paid Task')
assert.match(pipeline, /Task error counts[\s\S]*remove BOTH exact canonical artifacts[\s\S]*--quarantine-exact[\s\S]*do not advance[\s\S]*run `99`[\s\S]*publish/,
  'failed exact outputs are absent before synthesis and publication, with no paid redispatch')
assert.match(pipeline, /Reused\s+artifacts never enter this cleanup/)
assert.match(pipeline, /NOSTRA_EXACT_MODULE_RUN_ROOT[\s\S]*NOSTRA_EXACT_MODULE_NAME[\s\S]*NOSTRA_EXACT_MODULE_WRITABLE_ORBS[\s\S]*rejects `99`, reused orbs/,
  'the destructive helper is bound to the exact server-reviewed run, module, and specialist set')
assert.match(pipeline, /If the one exact `99` Task itself errors[\s\S]*--quarantine-exact-synthesis[\s\S]*stop before[\s\S]*publish/,
  'a bad synthesis is removed through its separate server-bound receipt and remains retryable')

console.log('agent output validity: server + pipeline CLI share one exact mechanical authority')
