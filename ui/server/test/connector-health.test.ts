// connector-health — pure repair-ledger selection and lifecycle gates. No network or process spawn.
// Run: npx tsx test/connector-health.test.ts.
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import type { ConnectorRepairEvent } from '../src/connector-health'

let passed = 0
function check(name: string, cond: boolean, detail = '') {
  if (cond) { passed++; console.log(`  ok  ${name}`) }
  else { console.error(`FAIL  ${name}  ${detail}`); process.exitCode = 1 }
}

const {
  latestRepairStatusForSubject,
  readAll,
  recordRepair,
  repairLifecycleTransitionsFromLedger,
  repairVerificationsFromLedger,
} = await import('../src/connector-health')

let eventNumber = 0
const event = (overrides: Partial<ConnectorRepairEvent> = {}): ConnectorRepairEvent => ({
  record_id: `repair-${++eventNumber}`,
  kind: 'connector_repair',
  connector_id: 'prices',
  subject: 'WHEAT',
  base_fingerprint: 'old-fingerprint',
  base_commit: 'old-commit',
  status: 'pr_open',
  pr_url: 'https://github.com/example/repo/pull/1',
  note: '',
  at: '2026-08-01T00:00:00Z',
  ...overrides,
})
const row = (value: Record<string, unknown>) => JSON.stringify(value)

// ── subject-scoped status: one subject's lock/terminal state never leaks into another ──
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'connector-health-test-'))
const healthDir = path.join(tmp, 'connectors')
fs.mkdirSync(healthDir, { recursive: true })
const writeRepairs = (events: ConnectorRepairEvent[]) => fs.writeFileSync(
  path.join(healthDir, 'health.ndjson'), `${events.map((e) => JSON.stringify(e)).join('\n')}\n`, 'utf8',
)

const wheatOpen = event({ subject: 'WHEAT', status: 'pr_open', at: '2026-08-01T01:00:00Z' })
const cornAssessed = event({ subject: 'CORN', status: 'assessed', pr_url: null, at: '2026-08-01T02:00:00Z' })
writeRepairs([wheatOpen, cornAssessed])
check('a subject-scoped pr_open applies to that subject',
  latestRepairStatusForSubject('prices', 'WHEAT', tmp).status === 'pr_open')
check('subject A pr_open does not suppress subject B terminal status',
  latestRepairStatusForSubject('prices', 'CORN', tmp).status === 'assessed')
check('subject-scoped events do not leak to an unmentioned subject',
  latestRepairStatusForSubject('prices', 'SOYBEAN', tmp).status === 'none')

const connectorWide = event({
  subject: null, status: 'source_gone', pr_url: null, at: '2026-08-01T03:00:00Z',
})
writeRepairs([wheatOpen, cornAssessed, connectorWide])
check('a later null-subject legacy event applies connector-wide to an existing subject',
  latestRepairStatusForSubject('prices', 'WHEAT', tmp).status === 'source_gone')
check('a null-subject legacy event also applies to a subject with no scoped row',
  latestRepairStatusForSubject('prices', 'SOYBEAN', tmp).status === 'source_gone')

// ── verification: a real post-merge fetch may be followed by a no-fetch fresh sweep ──
const repaired = event({
  subject: 'WHEAT', at: '2026-08-01T00:00:00Z', pr_url: 'https://github.com/example/repo/pull/2',
})
const historicalSuccess = [
  row({
    connector: 'prices', subject: 'WHEAT', decision: 'refetched', outcome: 'current',
    checked_at: '2026-08-02T01:00:00Z', connector_fingerprint: 'new-fingerprint',
    connector_commit: 'deployed-commit',
  }),
  row({
    connector: 'prices', subject: 'WHEAT', decision: 'fresh', outcome: 'current',
    checked_at: '2026-08-02T02:00:00Z', connector_fingerprint: 'new-fingerprint',
    connector_commit: 'deployed-commit',
  }),
].join('\n')
const verified = repairVerificationsFromLedger(historicalSuccess, [repaired], (_pr, deployed) =>
  deployed === 'deployed-commit'
    ? { mergedAt: '2026-08-02T00:00:00Z', mergeCommit: 'merge-commit', deployedCommit: deployed }
    : null)
check('a historical post-merge refetch verifies repair even when a later row is fresh',
  verified.length === 1 && verified[0].subject === 'WHEAT')

const wrongSubjectSuccess = historicalSuccess.replaceAll('WHEAT', 'CORN')
check('a successful fetch for subject B cannot verify subject A repair',
  repairVerificationsFromLedger(wrongSubjectSuccess, [repaired], () => ({
    mergedAt: '2026-08-02T00:00:00Z', mergeCommit: 'merge-commit', deployedCommit: 'deployed-commit',
  })).length === 0)
const legacyWide = event({
  subject: null, at: '2026-08-01T00:00:00Z', pr_url: 'https://github.com/example/repo/pull/4',
})
const wideVerified = repairVerificationsFromLedger(historicalSuccess, [legacyWide], (_pr, deployed) =>
  deployed === 'deployed-commit'
    ? { mergedAt: '2026-08-02T00:00:00Z', mergeCommit: 'merge-commit', deployedCommit: deployed }
    : null)
check('a post-merge subject fetch clears a legacy null-subject repair lock for that subject',
  wideVerified.length === 1 && wideVerified[0].subject === 'WHEAT')
const scopedWheatTerminal = event({
  subject: 'WHEAT', status: 'assessed', pr_url: null, at: '2026-08-03T00:00:00Z',
})
const cornSuccess = historicalSuccess.replaceAll('WHEAT', 'CORN')
check('a scoped event for one subject does not strand a legacy connector-wide lock on another subject',
  repairVerificationsFromLedger(cornSuccess, [legacyWide, scopedWheatTerminal], (_pr, deployed) =>
    deployed === 'deployed-commit'
      ? { mergedAt: '2026-08-02T00:00:00Z', mergeCommit: 'merge-commit', deployedCommit: deployed }
      : null).some((item) => item.subject === 'CORN'))

// ── PR lifecycle: closed releases immediately; merged-and-broken requires proven deployed ancestry ──
const closed = repairLifecycleTransitionsFromLedger('', [repaired], () => ({ state: 'CLOSED' }))
check('a closed, unmerged PR releases its subject repair lock',
  closed.length === 1 && closed[0].subject === 'WHEAT' && /closed without merge/.test(closed[0].note))

const cornOpen = event({
  subject: 'CORN', pr_url: 'https://github.com/example/repo/pull/3', at: '2026-08-01T00:01:00Z',
})
const scopedTransitions = repairLifecycleTransitionsFromLedger('', [repaired, cornOpen], (url) =>
  url.endsWith('/2') ? { state: 'CLOSED' } : { state: 'OPEN' })
check('closing subject A PR does not transition subject B open PR',
  scopedTransitions.length === 1 && scopedTransitions[0].subject === 'WHEAT')

// A durable `repairing` row cannot prove that an in-memory coding process survived a server restart. The
// current runtime hard-disables connector coding entirely, so such a row must be released immediately;
// a future isolated runtime may keep only a same-process, still-within-window repair active.
const oldRepairing = event({
  subject: 'WHEAT', status: 'repairing', pr_url: null, at: '2026-08-01T00:00:00Z',
})
const disabledOrphan = repairLifecycleTransitionsFromLedger('', [oldRepairing], () => null, () => null, {
  automationAvailable: false, runnerStartedAt: '2026-08-01T00:00:00Z', nowMs: Date.parse('2026-08-01T00:01:00Z'),
})
check('hard-disabled automation releases a persisted repairing state instead of claiming work is running',
  disabledOrphan.length === 1 && disabledOrphan[0].subject === 'WHEAT'
    && disabledOrphan[0].pr_url === null && /disabled/.test(disabledOrphan[0].note))
const restartOrphan = repairLifecycleTransitionsFromLedger('', [oldRepairing], () => null, () => null, {
  automationAvailable: true, runnerStartedAt: '2026-08-01T00:01:00Z', nowMs: Date.parse('2026-08-01T00:02:00Z'),
})
check('a repairing state from before this process is released after restart',
  restartOrphan.length === 1 && /restart/.test(restartOrphan[0].note))
const liveRepairing = repairLifecycleTransitionsFromLedger('', [oldRepairing], () => null, () => null, {
  automationAvailable: true, runnerStartedAt: '2026-08-01T00:00:00Z', nowMs: Date.parse('2026-08-01T00:05:00Z'),
})
check('a same-process repairing state inside its execution window remains active', liveRepairing.length === 0)

// Rows written by the pre-v2 repair lifecycle have no subject/fingerprint/commit fields. A successful
// post-merge refetch proves the merged code ran, but cannot prove the connector fingerprint changed; clear
// the old lock conservatively as assessed rather than falsely verified or stranded forever.
const legacyPrOpen: ConnectorRepairEvent = {
  record_id: 'legacy-pr-open', kind: 'connector_repair', connector_id: 'prices', status: 'pr_open',
  pr_url: 'https://github.com/example/repo/pull/legacy', note: '', at: '2026-08-01T00:00:00Z',
} as ConnectorRepairEvent
const legacySuccess = row({
  connector: 'prices', subject: 'WHEAT', decision: 'refetched', outcome: 'current',
  checked_at: '2026-08-03T00:00:00Z', connector_fingerprint: 'new-fingerprint',
  connector_commit: 'deployed-commit',
})
check('a legacy PR without a base fingerprint cannot be called verified',
  repairVerificationsFromLedger(legacySuccess, [legacyPrOpen], () => ({
    mergedAt: '2026-08-02T00:00:00Z', mergeCommit: 'merge-commit', deployedCommit: 'deployed-commit',
  })).length === 0)
const legacyReleased = repairLifecycleTransitionsFromLedger(
  legacySuccess, [legacyPrOpen], () => ({
    state: 'MERGED', mergedAt: '2026-08-02T00:00:00Z', mergeCommit: 'merge-commit',
  }), (_pr, deployed) => ({
    mergedAt: '2026-08-02T00:00:00Z', mergeCommit: 'merge-commit', deployedCommit: deployed,
  }),
)
check('a merged legacy repair with a real post-deploy refetch is released as assessed, not stranded',
  legacyReleased.length === 1 && legacyReleased[0].subject === 'WHEAT'
    && /legacy repair/.test(legacyReleased[0].note) && /assessed/.test(legacyReleased[0].note))

const afterMerge = Date.parse('2026-08-03T00:00:00Z') / 1000
const stillBroken = [0, 1, 2].map((offset) => row({
  connector: 'prices', subject: 'WHEAT', decision: 'failed', outcome: 'broken',
  ts: afterMerge + offset, connector_commit: 'deployed-commit', connector_fingerprint: 'new-fingerprint',
})).join('\n')
const mergedPr = () => ({ state: 'MERGED' as const, mergedAt: '2026-08-02T00:00:00Z', mergeCommit: 'merge-commit' })
check('merged-but-broken does not release without proof the deployed commit contains the merge',
  repairLifecycleTransitionsFromLedger(stillBroken, [repaired], mergedPr, () => null).length === 0)
const deployedBroken = repairLifecycleTransitionsFromLedger(stillBroken, [repaired], mergedPr, (_pr, deployed) => ({
  mergedAt: '2026-08-02T00:00:00Z', mergeCommit: 'merge-commit', deployedCommit: deployed,
}))
check('merged-and-still-broken releases only after deployed ancestry is proven',
  deployedBroken.length === 1 && deployedBroken[0].subject === 'WHEAT')
const successThenBroken = [historicalSuccess.split('\n')[0], stillBroken].join('\n')
const deployedRepair = (_pr: string, deployed: string) => ({
  mergedAt: '2026-08-02T00:00:00Z', mergeCommit: 'merge-commit', deployedCommit: deployed,
})
const terminalCandidates = [
  ...repairVerificationsFromLedger(successThenBroken, [repaired], deployedRepair)
    .map((item) => ({ ...item, terminal: 'verified' })),
  ...repairLifecycleTransitionsFromLedger(successThenBroken, [repaired], mergedPr, deployedRepair)
    .map((item) => ({ ...item, terminal: 'assessed' })),
]
check('a later sustained deployed break supersedes an older qualifying success with one terminal candidate',
  terminalCandidates.length === 1 && terminalCandidates[0].subject === 'WHEAT'
    && terminalCandidates[0].terminal === 'assessed')

// Even if consecutive sweeps overlap at the append boundary, later terminal
// knowledge must be written after earlier knowledge for the same coverage row.
await Promise.all([
  recordRepair('serialized-repair', 'verified', { subject: 'WHEAT', note: 'older success' }, tmp),
  recordRepair('serialized-repair', 'assessed', { subject: 'WHEAT', note: 'later sustained break' }, tmp),
])
const serializedTerminalWrites = readAll(tmp).filter((item) => item.connector_id === 'serialized-repair')
check('terminal repair writes for one connector and subject preserve call order',
  serializedTerminalWrites.length === 2
    && serializedTerminalWrites[0].status === 'verified'
    && serializedTerminalWrites[1].status === 'assessed'
    && latestRepairStatusForSubject('serialized-repair', 'WHEAT', tmp).status === 'assessed')
const legacyDeployedBroken = repairLifecycleTransitionsFromLedger(
  stillBroken, [legacyWide], mergedPr, (_pr, deployed) => ({
    mergedAt: '2026-08-02T00:00:00Z', mergeCommit: 'merge-commit', deployedCommit: deployed,
  }),
)
check('a merged legacy connector-wide repair releases each subject after its own sustained deployed failure',
  legacyDeployedBroken.length === 1 && legacyDeployedBroken[0].subject === 'WHEAT')
const cornStillBroken = stillBroken.replaceAll('WHEAT', 'CORN')
const legacyWithScopedTerminal = repairLifecycleTransitionsFromLedger(
  cornStillBroken, [legacyWide, scopedWheatTerminal], mergedPr, (_pr, deployed) => ({
    mergedAt: '2026-08-02T00:00:00Z', mergeCommit: 'merge-commit', deployedCommit: deployed,
  }),
)
check('a scoped terminal event does not strand a legacy connector-wide failed repair on another subject',
  legacyWithScopedTerminal.length === 1 && legacyWithScopedTerminal[0].subject === 'CORN')
const preMergeFailures = [0, 1].map((offset) => row({
  connector: 'prices', subject: 'WHEAT', decision: 'failed', outcome: 'broken',
  ts: Date.parse('2026-08-01T23:00:00Z') / 1000 + offset,
  connector_commit: 'old-commit', connector_fingerprint: 'old-fingerprint',
}))
const onePostMergeFailure = row({
  connector: 'prices', subject: 'WHEAT', decision: 'failed', outcome: 'broken',
  ts: afterMerge, connector_commit: 'deployed-commit', connector_fingerprint: 'new-fingerprint',
})
check('pre-merge failures do not contribute to the post-merge repair-failure streak',
  repairLifecycleTransitionsFromLedger([...preMergeFailures, onePostMergeFailure].join('\n'), [repaired], mergedPr,
    (_pr, deployed) => deployed === 'deployed-commit'
      ? { mergedAt: '2026-08-02T00:00:00Z', mergeCommit: 'merge-commit', deployedCommit: deployed }
      : null).length === 0)

// A terminal event is scoped to its own subject and supersedes the earlier pr_open only for that subject.
const wheatAssessed = event({
  subject: 'WHEAT', status: 'assessed', pr_url: null, at: '2026-08-04T00:00:00Z',
})
const cornGone = event({
  subject: 'CORN', status: 'source_gone', pr_url: null, at: '2026-08-04T00:01:00Z',
})
const terminalRepairs = [repaired, cornOpen, wheatAssessed, cornGone]
check('terminal subject-specific statuses cannot be verified again',
  repairVerificationsFromLedger(historicalSuccess, terminalRepairs, () => ({
    mergedAt: '2026-08-02T00:00:00Z', mergeCommit: 'merge-commit', deployedCommit: 'deployed-commit',
  })).length === 0)
check('terminal subject-specific statuses cannot emit stale PR lifecycle transitions',
  repairLifecycleTransitionsFromLedger(stillBroken, terminalRepairs, () => ({ state: 'CLOSED' })).length === 0)

fs.rmSync(tmp, { recursive: true, force: true })
console.log(`\nconnector-health.test.ts: ${passed} passed${process.exitCode ? ' (with failures)' : ''}`)
