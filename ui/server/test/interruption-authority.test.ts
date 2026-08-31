// Immutable per-interruption provider authority.
// Run: npx tsx test/interruption-authority.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const state = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-interruption-authority-')))
process.env.ENGINE_STATE_DIR = state

const { REPO_ROOT } = await import('../src/config')
const {
  beginExecutionAttempt,
  readLastProviderSelection,
  readProviderInterruptionAuthority,
  recordProviderInterruptionAuthority,
  recordRecoveredPublicationAuthority,
} = await import('../src/execution-provenance')
const { writeRunMarker } = await import('../src/outputs')
const { writeInterruptionMarker } = await import('../src/launcher')
const { createRun } = await import('../src/registry')

const runRoot = `analyses/ZZINTAUTH_${Date.now()}`
const absoluteRoot = path.join(REPO_ROOT, runRoot)
const profile = {
  key: 'codex:gpt-test:max', parentModel: 'gpt-test', parentReasoning: 'max' as const,
}
const newRun = (module: string) => createRun({
  kind: 'module' as const,
  ticker: 'ZZINTAUTH',
  module,
  provider: 'codex' as const,
  executionProfile: profile,
  profileKey: profile.key,
  model: 'gpt-test',
  reasoningLevel: 'max',
  prompt: `/research:${module} ZZINTAUTH`,
  user: 'test',
  userVia: 'local' as const,
  runRoot,
  willCommitToMain: false,
  writeTargetsAbs: [path.join(absoluteRoot, module)],
  coveredModules: [module],
  readDepsAbs: [],
  expected: new Map(),
})

const interrupt = (run: ReturnType<typeof newRun>, reason: string) => {
  writeRunMarker(runRoot, '.interrupted', {
    reason,
    module: run.module,
    provider: run.provider,
    profileKey: run.profileKey,
    model: run.model,
    reasoningLevel: run.reasoningLevel,
    runId: run.runId,
    attemptId: run.providerAttemptId ?? run.runId,
    startedAt: run.startedAt,
  })
  recordProviderInterruptionAuthority(run)
}

try {
  fs.mkdirSync(absoluteRoot, { recursive: true })

  const interruptedA = newRun('management-governance')
  interrupt(interruptedA, 'provider_connection_lost')
  assert.equal(readProviderInterruptionAuthority(runRoot, interruptedA.runId)?.runId, interruptedA.runId)

  // A sibling advancing the mutable "last provider" projection must not erase A's selected interruption.
  const siblingB = newRun('earnings')
  beginExecutionAttempt(siblingB)
  assert.equal(readProviderInterruptionAuthority(runRoot, interruptedA.runId)?.runId, interruptedA.runId,
    'a sibling spawn cannot erase an earlier exact interruption authority')
  assert.equal(readLastProviderSelection(runRoot, 'interrupted')?.profileKey, interruptedA.profileKey,
    'the interrupted selection reader resolves the immutable marker-selected attempt, not the last sibling')

  const published = path.join(absoluteRoot, 'final_thesis.md')
  fs.writeFileSync(published, 'published sibling bytes\n')
  const publishedRelative = `${runRoot}/final_thesis.md`
  recordRecoveredPublicationAuthority({
    runId: siblingB.runId,
    runRoot,
    provider: siblingB.provider,
    model: siblingB.model,
    reasoningLevel: siblingB.reasoningLevel,
    profileKey: siblingB.profileKey,
    executionProfile: siblingB.executionProfile,
  }, {
    [publishedRelative]: `sha256:${createHash('sha256').update(fs.readFileSync(published)).digest('hex')}`,
  })
  assert.equal(readProviderInterruptionAuthority(runRoot, interruptedA.runId)?.runId, interruptedA.runId,
    'a sibling publication cannot erase an earlier exact interruption authority')

  // A later failure deliberately replaces the run-root marker. The scanner must resolve only that marker's
  // immutable record; the older authority remains archived but cannot be selected under the new marker.
  const interruptedC = newRun('valuation')
  interrupt(interruptedC, 'provider_process_failed')
  const markerPath = path.join(absoluteRoot, '.interrupted')
  const firstMarker = fs.readFileSync(markerPath)
  writeInterruptionMarker(interruptedC, 'turn_failed', 'duplicate terminal report')
  assert.deepEqual(fs.readFileSync(markerPath), firstMarker,
    'a duplicate terminal report for one protected attempt must not rewrite its timestamp-bound marker')
  assert.equal(readProviderInterruptionAuthority(runRoot)?.interruptionRunId, interruptedC.runId)
  assert.equal(readProviderInterruptionAuthority(runRoot, interruptedC.runId)?.runId, interruptedC.runId)
  assert.equal(readProviderInterruptionAuthority(runRoot, interruptedA.runId), null,
    'an old interruption id cannot borrow the latest marker')
  assert.equal(readLastProviderSelection(runRoot, 'interrupted')?.profileKey, interruptedC.profileKey)

  const authorityFiles: string[] = []
  const walk = (directory: string) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const absolute = path.join(directory, entry.name)
      if (entry.isDirectory()) walk(absolute)
      else if (entry.isFile() && entry.name.endsWith('.json')) authorityFiles.push(absolute)
    }
  }
  walk(path.join(state, 'execution-provenance', 'interruptions'))
  assert.equal(authorityFiles.length, 2, 'both interruption authorities remain as separate owner-only records')
  for (const file of authorityFiles) {
    assert.equal(fs.lstatSync(file).mode & 0o077, 0)
    assert.equal(fs.lstatSync(file).nlink, 1)
  }

  console.log('immutable interruption authority tests passed')
} finally {
  fs.rmSync(absoluteRoot, { recursive: true, force: true })
  fs.rmSync(state, { recursive: true, force: true })
}
