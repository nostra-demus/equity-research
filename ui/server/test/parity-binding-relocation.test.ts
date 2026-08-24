// A freeze created in one checkout must remain valid when the server consumes it from another worktree.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { REPO_ROOT } from '../src/config'
import { beginExecutionAttempt, releaseParityRegistration } from '../src/execution-provenance'
import { createRun, finishRun } from '../src/registry'

const subject = `ZP${randomUUID().slice(0, 8)}`.toUpperCase()
const fixture = `ZZPARITY-${subject}`
const fixtureRoot = path.join(REPO_ROOT, 'analyses', fixture)
const dataRoot = path.join(fixtureRoot, 'data')
const claudeRoot = path.join(fixtureRoot, 'claude', `${fixture}_2026-08-24`)
const codexRoot = path.join(fixtureRoot, 'codex', `${fixture}_2026-08-24`)
const receipt = path.join(fixtureRoot, 'freeze.json')
fs.mkdirSync(dataRoot, { recursive: true })
fs.writeFileSync(path.join(dataRoot, 'filing.txt'), 'frozen primary evidence\n')

try {
  execFileSync('python3', [
    path.join(REPO_ROOT, 'scripts', 'provider_parity_freeze.py'),
    '--data-snapshot', dataRoot,
    '--claude-run', claudeRoot,
    '--codex-run', codexRoot,
    '--subject', subject,
    '--decision-date', '2026-08-24',
    '--price-value', '100',
    '--price-currency', 'USD',
    '--price-as-of', '2026-08-24',
    '--price-source', 'test fixture',
    '--claude-model', 'sonnet',
    '--claude-reasoning', 'default',
    '--claude-profile', 'claude:sonnet:default',
    '--codex-model', 'gpt-5.6-sol',
    '--codex-reasoning', 'max',
    '--codex-profile', 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
    '--output', receipt,
  ], { cwd: REPO_ROOT, stdio: 'pipe' })

  const binding = JSON.parse(fs.readFileSync(path.join(codexRoot, '.provider-parity-input.json'), 'utf8'))
  assert.equal(path.isAbsolute(binding.run_root), false, 'in-repo run roots are relocatable')
  assert.equal(path.isAbsolute(binding.receipt_path), false, 'in-repo receipts are relocatable')

  const relativeRunRoot = path.relative(REPO_ROOT, codexRoot).split(path.sep).join('/')
  const profile = {
    key: 'codex|gpt-5.6-sol:max|gpt-5.6-terra:xhigh',
    parentModel: 'gpt-5.6-sol', parentReasoning: 'max',
  }
  const run = createRun({
    kind: 'full', ticker: subject, provider: 'codex', executionProfile: profile,
    profileKey: profile.key, model: 'gpt-5.6-sol', reasoningLevel: 'max', prompt: '',
    user: 'test', userVia: 'local', runRoot: relativeRunRoot, willCommitToMain: false,
    writeTargetsAbs: [codexRoot], coveredModules: [], readDepsAbs: [], closeWatcher: undefined,
    expected: new Map(),
  })
  try {
    assert.doesNotThrow(() => beginExecutionAttempt(run),
      'the provenance guard accepts repo-relative freeze bindings in the current deployed worktree')
    assert.ok(run.parityPrelaunchBinding, 'the supervisor records the verified parity binding')
  } finally {
    releaseParityRegistration(run)
    finishRun(run, 'complete')
  }
} finally {
  for (const file of [path.join(claudeRoot, '.provider-parity-input.json'),
    path.join(codexRoot, '.provider-parity-input.json'), receipt]) {
    if (fs.existsSync(file)) fs.chmodSync(file, 0o600)
  }
  fs.rmSync(fixtureRoot, { recursive: true, force: true })
}
