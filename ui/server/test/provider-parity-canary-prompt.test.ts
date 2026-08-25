import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const command = fs.readFileSync(path.resolve(testDir, '../../../.claude/commands/research/full-canary.md'), 'utf8')

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
]) {
  assert.ok(command.includes(expected), `canary prompt must recognize supervisor-owned ${expected}`)
}
assert.match(
  command,
  /Fail if any module folder, terminal artifact, failure\/interruption marker,[\s\S]*unexpected top-level entry already exists/,
  'the corrected support-file allowlist must not weaken the fail-closed prior-output check',
)

console.log('✓ provider-parity canary prompt accepts only supervisor-owned launch support after pristine admission')
