import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const command = fs.readFileSync(path.resolve(testDir, '../../../.claude/commands/research/full-canary.md'), 'utf8')
const moduleCommand = fs.readFileSync(path.resolve(testDir, '../../../.claude/commands/research/module-canary.md'), 'utf8')

assert.doesNotMatch(
  command,
  /Require `<RUN_ROOT>` to contain only the binding before starting/,
  'the provider must not repeat the admission-only pristine-root check after supervisor launch support is written',
)
for (const expected of [
  '.provider-parity-input.json',
  '.requires_idea_publication',
  '_pool_extracts/',
  'readiness_override.json',
  '.defer_module_memos',
]) {
  assert.ok(command.includes(expected), `canary prompt must recognize supervisor-owned ${expected}`)
}
assert.match(
  command,
  /Require every discovered module's canonical `99_\*` synthesis[\s\S]*pass the artifact validator/,
  'the terminal adjudicator must refuse a partial module DAG',
)
assert.match(command, /ONE terminal adjudicator/)

for (const expected of [
  'This is a thin compatibility loader, not a second module prompt',
  '.claude/commands/research/<MODULE>.md',
  'Never fall back to a prior dated run',
  'scripts/commit-run.sh',
]) assert.ok(moduleCommand.includes(expected), `module canary loader is missing: ${expected}`)
assert.match(moduleCommand, /intermediate module stages cannot publish/)

console.log('✓ provider-parity canary prompts enforce bounded modules plus one terminal adjudicator')
