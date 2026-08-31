import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const command = fs.readFileSync(path.resolve(testDir, '../../../.claude/commands/research/full-canary.md'), 'utf8')
const moduleCommand = fs.readFileSync(path.resolve(testDir, '../../../.claude/commands/research/module-canary.md'), 'utf8')
const governanceRules = fs.readFileSync(path.resolve(testDir, '../../../.claude/agents/management-governance/MODULE_RULES.md'), 'utf8')

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
  /either its canonical `99_\*` synthesis[\s\S]*`fail_fast: true`[\s\S]*`Insufficient`/,
  'the terminal adjudicator must accept only synthesis or a discovered fail-fast Insufficient outcome',
)
assert.match(command, /ONE terminal adjudicator/)
assert.match(command, /typed module-outcome roster[\s\S]*fail_fast_insufficient[\s\S]*RUN_METADATA\.md/,
  'the terminal master and metadata must preserve an intentional fail-fast outcome type')
for (const expected of [
  'NOSTRA_PARITY_CANARY_CONTINUATION=1',
  'raw retained `final_thesis.md`',
  '`idea_3_6m.json`',
  'Still fail on `execution_provenance.receipt.json`',
  'do not launch or repeat a module',
]) assert.ok(command.includes(expected), `canary recovery contract is missing: ${expected}`)

for (const expected of [
  'This is a thin compatibility loader, not a second module prompt',
  '.claude/commands/research/<MODULE>.md',
  'Never fall back to a prior dated run',
  'scripts/commit-run.sh',
]) assert.ok(moduleCommand.includes(expected), `module canary loader is missing: ${expected}`)
assert.match(moduleCommand, /intermediate module stages cannot publish/)

for (const module of [
  'earnings', 'competitive-intel', 'balance-sheet-survival',
  'management-governance', 'valuation', 'catalyst',
]) {
  const canonical = fs.readFileSync(path.resolve(
    testDir, `../../../.claude/commands/research/${module}.md`,
  ), 'utf8')
  assert.match(canonical, /NOSTRA_CONTINUATION_RUN_ROOT/,
    `${module} must recognize the exact chained run root`)
  assert.match(canonical, /never fall back to (?:an )?older run/,
    `${module} must not import prior-run context into a chained Full`)
}

for (const agent of [
  '10_contingent-liabilities-and-commitments.md',
  '11_accounting-forensics.md',
]) {
  const prompt = fs.readFileSync(path.resolve(
    testDir, `../../../.claude/agents/management-governance/${agent}`,
  ), 'utf8')
  assert.match(prompt, /NOSTRA_CONTINUATION_RUN_ROOT[\s\S]*only inside that exact root[\s\S]*never search a prior run/,
    `${agent} must not import a prior-run balance-sheet artifact into a frozen continuation`)
}
assert.match(governanceRules, /NOSTRA_CONTINUATION_RUN_ROOT[\s\S]*MUST NOT Glob, search, or read a prior-dated/,
  'the governance module contract must prohibit cross-run refresh in a frozen continuation')

console.log('✓ provider-parity canary prompts enforce bounded modules plus one terminal adjudicator')
