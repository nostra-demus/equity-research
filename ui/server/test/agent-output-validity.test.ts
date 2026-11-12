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

const unfinished = '# Report\n\n## Completion Status\n\n**INCOMPLETE.** The producer stopped with unresolved checks.\n'
assert.deepEqual(validateAgentOutputText(unfinished).reasons, ['explicit-incomplete-completion-status'])
for (const declaration of ['INCOMPLETE', 'INCOMPLETE.', '**INCOMPLETE**', '**INCOMPLETE.** explanation', '**INCOMPLETE**. explanation']) {
  assert.equal(validateAgentOutputText(`# Report\n## Completion Status\n${declaration}\n`).valid, false,
    `an explicit producer declaration blocks reuse: ${declaration}`)
}
for (const body of [
  '# Report\nEvidence is incomplete; apply the stated confidence cap.\n',
  '# Report\n## Verdict\nAvoid — adverse findings are a completed result.\n',
  '# Report\n## Verdict\nInsufficient Data — Refuse To Rate.\n',
  '# Report\n```markdown\n## Completion Status\n**INCOMPLETE.**\n```\n',
  '# Report\n~~~markdown\n## Completion Status\n**INCOMPLETE.**\n~~~\n',
  '# Report\n~~~ example `hint`\n## Completion Status\n**INCOMPLETE.**\n~~~\n',
  '# Report\n``` example ~hint~\n## Completion Status\n**INCOMPLETE.**\n```\n',
  '# Report\n> ## Completion Status\n> **INCOMPLETE.**\n',
  '# Report\n<blockquote>\n## Completion Status\n**INCOMPLETE.**\n</blockquote>\n',
  '# Report\n<blockquote\n  cite="prior draft">\n## Completion Status\n**INCOMPLETE.**\n</blockquote>\n',
  '# Report\n<BLOCKQUOTE cite="example">\n<blockquote>\n## Completion Status\nINCOMPLETE\n</blockquote>\n```\n</BLOCKQUOTE>\n## Completion Status\nCOMPLETE\n',
  '# Report\n```html\n<blockquote>\n```\n## Completion Status\nCOMPLETE\n',
  '# Report\n    ## Completion Status\n    **INCOMPLETE.**\n',
  '# Report\n## Completion Status\n**COMPLETE.**\nEvidence is incomplete; the final rating is capped.\n',
  '# Report\n## Completion Status\nCOMPLETED. The reasoned refusal is the final outcome.\n',
  '# Report\n## Completion Status\n**COMPLETE**. The reasoned refusal is the final outcome.\n',
  '# Report\n## Completion Status\n```markdown\nINCOMPLETE\n```\n**COMPLETE**\n',
]) assert.equal(validateAgentOutputText(body).valid, true,
  'financial adversity, declared data gaps and quoted/fenced/indented examples are not execution failure')
for (const body of [
  '# Report\n## Completion Status\n',
  '# Report\n## Completion Status\nIncomplete evidence remains.\n',
  '# Report\n## Completion Status\nUNKNOWN\n',
  '# Report\n## Completion Status\n**COMPLETE.**\n**INCOMPLETE.**\n',
  '# Report\n## Completion Status\nCOMPLETE\n## Completion Status\nCOMPLETE\n',
]) assert.ok(validateAgentOutputText(body).reasons.includes('invalid-completion-status'),
  'an opt-in reserved section must have one unambiguous producer declaration')
assert.equal(validateAgentOutputText('# Report\n## Completion Status\nCOMPLETE\n```json\n').valid, false,
  'declared completion never overrides mechanical invalidity')
assert.deepEqual(validateAgentOutputText('# Report\n<blockquote>quoted prior status</blockquote>\n## Completion Status\nINCOMPLETE\n').reasons,
  ['explicit-incomplete-completion-status'], 'a real declaration after an HTML quote remains authoritative')
assert.deepEqual(validateAgentOutputText('# Report\nThe literal `<blockquote>` tag is an example.\n## Completion Status\nINCOMPLETE\n').reasons,
  ['explicit-incomplete-completion-status'], 'an inline literal HTML tag cannot swallow a real declaration')
for (const quoted of [
  '<blockquote>\nThe literal `<blockquote>` tag is an example.\n</blockquote>',
  '<blockquote>The literal ``<blockquote>`` tag is an example.</blockquote>',
]) assert.deepEqual(validateAgentOutputText(`# Report\n${quoted}\n## Completion Status\nINCOMPLETE\n`).reasons,
  ['explicit-incomplete-completion-status'], 'inline code inside an HTML quote cannot hide a later real status')
// An UNBALANCED HTML blockquote must fail closed, never swallow a later real INCOMPLETE. Before this
// guard both of these validated as { valid: true, reasons: [] } — an explicitly-unfinished module would
// have been treated as publishable (CLAUDE.md §25/§28; MODULE_PIPELINE "malformed declarations fail closed").
assert.deepEqual(validateAgentOutputText('# Report\n<blockquote>\n## Completion Status\nINCOMPLETE\n').reasons,
  ['unclosed-html-blockquote', 'invalid-completion-status'], 'an unbalanced HTML blockquote fails closed instead of swallowing a later real status')
assert.deepEqual(validateAgentOutputText('# Report\n<blockquote>\nI referenced <blockquote> once more.\n</blockquote>\n## Completion Status\nINCOMPLETE\n').reasons,
  ['unclosed-html-blockquote', 'invalid-completion-status'], 'a prose <blockquote> mention that desyncs the quote depth also fails closed')
assert.equal(validateAgentOutputText('# Report\n<blockquote>\n## Completion Status\nINCOMPLETE\n</blockquote>\n## Done\n').valid, true,
  'a properly balanced HTML quote example is still not a real declaration (no false positive)')
assert.deepEqual(validateAgentOutputText('# Report\n<blockquote>\nquoted source only\n').reasons,
  ['unclosed-html-blockquote'], 'an unclosed quote that hides no reserved section is malformed, not a completion claim')

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
fs.writeFileSync(synthesis, unfinished)
assert.equal(validateAgentOutputFile(synthesis).valid, false)
assert.throws(() => quarantineExactSynthesisArtifact(synthesis, analyses, exactEnv), /unfinished completion output retained/)
assert.equal(fs.readFileSync(synthesis, 'utf8'), unfinished,
  'a child retains explicit unfinished evidence for supervisor archival; it cannot silently erase it')
assert.equal(spawnSync(process.execPath, [script, '--quarantine-exact-synthesis', synthesis], { cwd: tmp, env: cliEnv }).status, 1)
assert.equal(fs.readFileSync(synthesis, 'utf8'), unfinished, 'CLI fails closed and retains the same bytes')
fs.writeFileSync(failedOutput, unfinished)
fs.writeFileSync(failedSignal, '{"evidence":"retained"}')
assert.throws(() => quarantineExactAgentArtifacts([failedOutput, failedSignal], analyses, exactEnv), /unfinished completion output retained/)
assert.equal(fs.readFileSync(failedOutput, 'utf8'), unfinished)
assert.equal(fs.readFileSync(failedSignal, 'utf8'), '{"evidence":"retained"}',
  'an unfinished specialist retains both its draft and paired evidence without a new paid Task')
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
