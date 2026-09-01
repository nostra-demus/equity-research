import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { moduleTerminalOutcome } from '../src/launcher'

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'module-terminal-outcome-'))
const moduleDir = path.join(root, 'business-model')
fs.mkdirSync(moduleDir, { recursive: true })

const triage = path.join(moduleDir, '00_data-triage.md')
fs.writeFileSync(triage, '# Data triage\n\nVerdict: Insufficient data.\n')
assert.deepEqual(moduleTerminalOutcome(root, 'business-model'), {
  kind: 'fail-fast', agentKey: 'business-model/00_data-triage',
}, 'the API can project a canonically validated fail-fast outcome')

fs.writeFileSync(triage, 'Verdict: Insufficient data.\n')
assert.equal(moduleTerminalOutcome(root, 'business-model'), null,
  'a malformed saved file cannot make the cockpit claim the module completed')

const synthesis = path.join(moduleDir, '99_business-model-synthesis.md')
fs.writeFileSync(synthesis, '# Business-model synthesis\n\nVerdict: Sufficient\n')
assert.deepEqual(moduleTerminalOutcome(root, 'business-model'), {
  kind: 'synthesis', agentKey: 'business-model/99_business-model-synthesis',
}, 'a valid synthesis remains the primary terminal outcome')

fs.rmSync(root, { recursive: true, force: true })
console.log('module-terminal-outcome.test.ts: canonical terminal projection passed')
