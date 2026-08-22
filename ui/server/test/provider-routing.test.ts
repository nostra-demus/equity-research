import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  appendPipelineTelemetry,
  deterministicCycleId,
  deterministicDecisionId,
  evaluateProviderRouting,
  parseTrendRange,
  readPipelineTrend,
  readPipelineTrendEvents,
  repairPipelineTelemetryTail,
  type PipelineAuditEvent,
  type ProviderRoutingCandidate,
} from '../src/news/provider-routing'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error?.message || error}`); process.exitCode = 1 }
}

const NOW = Date.parse('2026-08-22T12:00:00.000Z')

function workspace(): { root: string; state: string; archive: string } {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'provider-routing-'))
  const state = path.join(root, '.state')
  const archive = path.join(root, 'archive')
  fs.mkdirSync(path.join(root, 'screener', 'inbox'), { recursive: true })
  fs.mkdirSync(state, { recursive: true })
  fs.mkdirSync(archive, { recursive: true })
  return { root, state, archive }
}

function candidates(overrides: Partial<Record<'alpha' | 'beta' | 'anthropic-triage', Partial<ProviderRoutingCandidate>>> = {}): ProviderRoutingCandidate[] {
  return [
    { id: 'alpha', order: 0, eligible: true, eligibilityReason: 'eligible', releasedCapacityUrgency: 0.5, ...overrides.alpha },
    { id: 'beta', order: 1, eligible: true, eligibilityReason: 'eligible', releasedCapacityUrgency: 0.5, ...overrides.beta },
    { id: 'anthropic-triage', order: 2, eligible: true, eligibilityReason: 'eligible', releasedCapacityUrgency: 0.5, isHaiku: true, ...overrides['anthropic-triage'] },
  ]
}

function decision(ts: string, index: number, providerId: string): PipelineAuditEvent {
  return {
    v: 1, kind: 'provider_decision', ts, cycleId: `cycle-${index}`, decisionId: `decision-${index}`,
    mode: 'shadow', actualProviderId: providerId, shadowProviderId: providerId, exploration: false,
    candidates: [],
  }
}

function outcome(ts: string, index: number, providerId: string, ok = true, elapsedMs = 1_000): PipelineAuditEvent {
  return {
    v: 1, kind: 'provider_outcome', ts, cycleId: `cycle-${index}`, decisionId: `decision-${index}`,
    providerId, outcome: ok ? 'success' : 'failure', failureClass: ok ? null : 'availability',
    batchSize: 12, scoredItems: ok ? 12 : 0, networkCalls: 1, tokens: 100, costUsd: 0, elapsedMs,
  }
}

function seed(root: string, rows: PipelineAuditEvent[]) {
  for (const row of rows) assert.equal(appendPipelineTelemetry(root, row), true)
}

check('deterministic cycle and decision IDs are stable', () => {
  const cycle = deterministicCycleId('2026-08-22T12:00:00Z')
  assert.equal(cycle, deterministicCycleId('2026-08-22T12:00:00Z'))
  assert.equal(deterministicDecisionId(cycle, 3, 2), deterministicDecisionId(cycle, 3, 2))
  assert.notEqual(deterministicDecisionId(cycle, 3, 2), deterministicDecisionId(cycle, 3, 3))
})

check('append repairs a torn tail, fsyncs a complete row, and strips unknown secret/error fields', () => {
  const { root } = workspace()
  const date = '2026-08-22'
  const file = path.join(root, 'screener', 'inbox', `${date}_pipeline.ndjson`)
  fs.writeFileSync(file, `${JSON.stringify(decision(`${date}T10:00:00Z`, 1, 'alpha'))}\n{"kind":"provider_out`)
  const fd = fs.openSync(file, 'a+')
  const repaired = repairPipelineTelemetryTail(fd)
  fs.closeSync(fd)
  assert.equal(repaired, fs.statSync(file).size)
  const unsafe = { ...outcome(`${date}T10:01:00Z`, 1, 'alpha'), prompt: 'never persist me', error: 'provider body', apiKey: 'sk-secret' } as unknown as PipelineAuditEvent
  assert.equal(appendPipelineTelemetry(root, unsafe), true)
  const text = fs.readFileSync(file, 'utf8')
  assert.doesNotMatch(text, /never persist|provider body|sk-secret/)
  assert.equal(text.trim().split('\n').length, 2)

  const completeRoot = workspace().root
  const completeFile = path.join(completeRoot, 'screener', 'inbox', `${date}_pipeline.ndjson`)
  const complete = decision(`${date}T11:00:00Z`, 3, 'beta')
  fs.writeFileSync(completeFile, JSON.stringify(complete))
  assert.equal(appendPipelineTelemetry(completeRoot, outcome(`${date}T11:00:01Z`, 3, 'beta')), true)
  const completeRows = fs.readFileSync(completeFile, 'utf8').trim().split('\n').map((row) => JSON.parse(row))
  assert.equal(completeRows.length, 2, 'a complete delimiterless final row is preserved before the next append')
  assert.equal(completeRows[0].decisionId, 'decision-3')
})

check('fitness applies yield, normalized throughput, urgency, failure, cost, and stable order', () => {
  const { root, state } = workspace()
  const rows: PipelineAuditEvent[] = []
  for (let index = 0; index < 8; index++) {
    const ts = new Date(NOW - (index + 1) * 3_600_000).toISOString()
    rows.push(decision(ts, index, 'alpha'), outcome(ts, index, 'alpha', true, 500))
  }
  for (let index = 8; index < 16; index++) {
    const ts = new Date(NOW - (index + 1) * 3_600_000).toISOString()
    rows.push(decision(ts, index, 'beta'), outcome(ts, index, 'beta', false, 2_000))
  }
  seed(root, rows)
  const result = evaluateProviderRouting({ repoRoot: root, stateDir: state, requestedMode: 'shadow', now: NOW }, candidates({ beta: { consecutiveFailures: 3 }, 'anthropic-triage': { consecutiveFailures: 0 } }))
  const alpha = result.candidates.find((row) => row.id === 'alpha')!
  const beta = result.candidates.find((row) => row.id === 'beta')!
  const haiku = result.candidates.find((row) => row.id === 'anthropic-triage')!
  assert.ok(alpha.score > beta.score)
  assert.equal(beta.components.failurePenalty, 30)
  assert.equal(haiku.components.costPenalty, 15)
  assert.equal(alpha.components.releasedCapacityUrgency, 0.5)
  const cleanWorkspace = workspace()
  const clean = evaluateProviderRouting({ repoRoot: cleanWorkspace.root, stateDir: cleanWorkspace.state, requestedMode: 'static', now: NOW }, candidates({ 'anthropic-triage': { eligible: false, eligibilityReason: 'haiku-pressure' } }))
  assert.equal(clean.router.mode, 'static')
  assert.equal(clean.candidates.find((row) => row.id === 'alpha')?.rank, 1)
  assert.equal(clean.candidates.find((row) => row.id === 'beta')?.rank, 2)
  assert.equal(clean.candidates.find((row) => row.id === 'anthropic-triage')?.rank, null, 'Haiku stays out of a healthy low-pressure route')

  const pressureWorkspace = workspace()
  const pressure = evaluateProviderRouting({ repoRoot: pressureWorkspace.root, stateDir: pressureWorkspace.state, requestedMode: 'shadow', now: NOW }, candidates({ alpha: { consecutiveFailures: 3 }, beta: { eligible: false, eligibilityReason: 'cooldown' } }))
  assert.equal(pressure.candidates.find((row) => row.id === 'anthropic-triage')?.rank, 1, 'cost-guarded Haiku can outrank a repeatedly failing free peer once pressure makes it eligible')

  const decayWorkspace = workspace()
  seed(decayWorkspace.root, [
    decision(new Date(NOW - 24 * 3_600_000).toISOString(), 90, 'alpha'), outcome(new Date(NOW - 24 * 3_600_000).toISOString(), 90, 'alpha'),
    decision(new Date(NOW - 60_000).toISOString(), 91, 'beta'), outcome(new Date(NOW - 60_000).toISOString(), 91, 'beta'),
  ])
  const decayed = evaluateProviderRouting({ repoRoot: decayWorkspace.root, stateDir: decayWorkspace.state, requestedMode: 'shadow', now: NOW }, candidates({ 'anthropic-triage': { eligible: false, eligibilityReason: 'haiku-pressure' } }))
  assert.ok(decayed.candidates.find((row) => row.id === 'beta')!.score > decayed.candidates.find((row) => row.id === 'alpha')!.score, 'the 24-hour half-life gives recent usable work more fitness weight')
})

check('auto stays shadow until gates pass, activates with two-provider coverage, and fails static on corruption', () => {
  const ready = workspace()
  const rows: PipelineAuditEvent[] = []
  for (let index = 0; index < 20; index++) {
    const ts = new Date(NOW - 25 * 3_600_000 + index * 60_000).toISOString()
    const provider = index % 2 ? 'alpha' : 'beta'
    rows.push(decision(ts, index, provider), outcome(ts, index, provider, true))
  }
  seed(ready.root, rows)
  const adaptive = evaluateProviderRouting({ repoRoot: ready.root, stateDir: ready.state, requestedMode: 'auto', shadowHours: 24, minOutcomes: 20, now: NOW }, candidates({ 'anthropic-triage': { eligible: false, eligibilityReason: 'haiku-pressure' } }))
  assert.equal(adaptive.router.mode, 'adaptive')
  assert.equal(adaptive.router.coverageComplete, true)
  assert.equal(evaluateProviderRouting({ repoRoot: ready.root, stateDir: ready.state, requestedMode: 'shadow', shadowHours: 24, minOutcomes: 20, now: NOW }, candidates()).router.mode, 'shadow', 'the emergency shadow override never activates actual adaptive order')
  fs.unlinkSync(path.join(ready.state, 'news-provider-fitness.json'))
  assert.equal(evaluateProviderRouting({ repoRoot: ready.root, stateDir: ready.state, requestedMode: 'auto', shadowHours: 24, minOutcomes: 20, now: NOW }, candidates({ 'anthropic-triage': { eligible: false, eligibilityReason: 'haiku-pressure' } })).router.mode, 'adaptive', 'restart rebuilds the same route from the append-only authority')

  const shadow = workspace()
  seed(shadow.root, [decision(new Date(NOW - 2 * 3_600_000).toISOString(), 1, 'alpha'), outcome(new Date(NOW - 2 * 3_600_000).toISOString(), 1, 'alpha')])
  assert.equal(evaluateProviderRouting({ repoRoot: shadow.root, stateDir: shadow.state, requestedMode: 'auto', now: NOW }, candidates()).router.mode, 'shadow')

  const corrupt = workspace()
  seed(corrupt.root, [decision(new Date(NOW - 25 * 3_600_000).toISOString(), 1, 'alpha')])
  const file = path.join(corrupt.root, 'screener', 'inbox', '2026-08-21_pipeline.ndjson')
  fs.appendFileSync(file, '{not-json}\n')
  assert.equal(evaluateProviderRouting({ repoRoot: corrupt.root, stateDir: corrupt.state, requestedMode: 'auto', now: NOW }, candidates()).router.mode, 'static-fallback')

  const interrupted = workspace()
  const oldRows: PipelineAuditEvent[] = []
  for (let index = 0; index < 20; index++) {
    const ts = new Date(NOW - 72 * 3_600_000 + index * 60_000).toISOString()
    const provider = index % 2 ? 'alpha' : 'beta'
    oldRows.push(decision(ts, 100 + index, provider), outcome(ts, 100 + index, provider, true))
  }
  seed(interrupted.root, oldRows)
  seed(interrupted.root, [{
    v: 1, kind: 'provider_snapshot', ts: new Date(NOW - 60_000).toISOString(), cycleId: 'cycle-current', phase: 'cycle-start', providers: [],
  }])
  const interruptedResult = evaluateProviderRouting({ repoRoot: interrupted.root, stateDir: interrupted.state, requestedMode: 'auto', now: NOW }, candidates())
  assert.equal(interruptedResult.router.mode, 'shadow', 'a missing UTC day inside the measured window blocks automatic activation')
  assert.match(interruptedResult.router.reason, /audit gaps/)

  const cacheFailure = workspace()
  seed(cacheFailure.root, rows)
  const blockedState = path.join(cacheFailure.root, 'state-is-a-file')
  fs.writeFileSync(blockedState, 'not a directory')
  assert.equal(evaluateProviderRouting({ repoRoot: cacheFailure.root, stateDir: blockedState, requestedMode: 'auto', shadowHours: 24, minOutcomes: 20, now: NOW }, candidates()).router.mode, 'static-fallback', 'an unwriteable derived cache cannot authorize provider calls')
})

check('one-in-ten recovery exploration promotes an eligible under-sampled provider', () => {
  const { root, state } = workspace()
  const rows: PipelineAuditEvent[] = []
  for (let index = 0; index < 9; index++) {
    const ts = new Date(NOW - 25 * 3_600_000 + index * 60_000).toISOString()
    const provider = index === 8 ? 'beta' : 'alpha'
    rows.push(decision(ts, index, provider), outcome(ts, index, provider, true))
  }
  seed(root, rows)
  const result = evaluateProviderRouting({ repoRoot: root, stateDir: state, requestedMode: 'auto', shadowHours: 24, minOutcomes: 1, now: NOW }, candidates({ 'anthropic-triage': { eligible: false, eligibilityReason: 'haiku-pressure' } }))
  assert.equal(result.router.mode, 'adaptive')
  assert.equal(result.exploration, true)
  assert.equal(result.selectedProviderId, 'beta')

  const recent = workspace()
  const recentRows: PipelineAuditEvent[] = []
  for (let index = 0; index < 9; index++) {
    const ts = new Date(NOW - (index === 8 ? 60 : 25 * 3_600) * 1_000).toISOString()
    const provider = index === 8 ? 'beta' : 'alpha'
    recentRows.push(decision(ts, 200 + index, provider), outcome(ts, 200 + index, provider, true))
  }
  seed(recent.root, recentRows)
  const held = evaluateProviderRouting({ repoRoot: recent.root, stateDir: recent.state, requestedMode: 'auto', shadowHours: 1, minOutcomes: 1, now: NOW }, candidates({ 'anthropic-triage': { eligible: false, eligibilityReason: 'haiku-pressure' } }))
  assert.equal(held.exploration, false, 'an under-sampled provider is not probed again inside its six-hour recovery interval')
})

check('aggregate and demoted-local safety bands never displace an eligible direct route', () => {
  const { root, state } = workspace()
  const result = evaluateProviderRouting({ repoRoot: root, stateDir: state, requestedMode: 'shadow', now: NOW }, [
    { id: 'direct', order: 0, band: 'direct', eligible: true, eligibilityReason: 'eligible', releasedCapacityUrgency: 0 },
    { id: 'aggregate', order: 1, band: 'aggregate', eligible: true, eligibilityReason: 'eligible', releasedCapacityUrgency: 1 },
    { id: 'local-last', order: 2, band: 'demoted-local', eligible: true, eligibilityReason: 'eligible', releasedCapacityUrgency: 1 },
  ])
  assert.equal(result.shadowProviderId, 'direct')
  assert.equal(result.candidates.find((row) => row.id === 'aggregate')?.rank, 1, 'the aggregate is ranked only inside its own band')
  assert.equal(result.candidates.find((row) => row.id === 'local-last')?.rank, 1, 'the demoted local is ranked only inside its own band')
})

check('trend validates 90 days, caps buckets, preserves legacy gaps, and paginates newest exact events', () => {
  const { root, archive } = workspace()
  assert.throws(() => parseTrendRange('2026-01-01T00:00:00Z', '2026-08-22T00:00:00Z'), /90 days/)
  const firehose = path.join(root, 'screener', 'inbox', '2026-08-22_firehose.ndjson')
  fs.writeFileSync(firehose, [
    JSON.stringify({ kind: 'cycle_summary', ts: '2026-08-22T10:00:00Z', completed_at: '2026-08-22T10:01:00Z', feed_commit_version: 1, new_arrivals: 12, picked: 5, watched: 4, dropped: 3, backlog: 20, backlog_expired: 2 }),
    JSON.stringify({ kind: 'cycle_summary', ts: '2026-08-22T11:00:00Z', completed_at: '2026-08-22T11:01:00Z', picked: 1, watched: 1, dropped: 1, backlog: 18 }),
  ].join('\n') + '\n')
  seed(root, [
    decision('2026-08-22T10:00:00Z', 1, 'alpha'), outcome('2026-08-22T10:00:02Z', 1, 'alpha'),
    decision('2026-08-22T11:00:00Z', 2, 'beta'), outcome('2026-08-22T11:00:03Z', 2, 'beta', false),
  ])
  fs.appendFileSync(path.join(root, 'screener', 'inbox', '2026-08-22_pipeline.ndjson'), `${JSON.stringify({ v: 1, kind: 'provider_decision', ts: '2026-08-22T11:30:00Z', cycleId: 'malformed', candidates: 'not-an-array' })}\n`)
  const trend = readPipelineTrend(root, archive, Date.parse('2026-08-22T09:00:00Z'), Date.parse('2026-08-22T12:00:00Z'), '1m')
  assert.ok(trend.buckets.length <= 720)
  assert.ok(trend.buckets.some((bucket) => !bucket.verified && bucket.inflowPerSecond != null), 'a corrupt pipeline partition hatches otherwise-readable flow instead of connecting it')
  assert.ok(trend.buckets.some((bucket) => !bucket.verified && bucket.backlog === 18), 'legacy summary is hatched, not zero-filled')
  assert.equal(trend.coverage.corruptRows, 1, 'a structurally invalid row becomes a visible corruption gap instead of crashing the trend read')
  const page = readPipelineTrendEvents(root, archive, Date.parse('2026-08-22T09:00:00Z'), Date.parse('2026-08-22T12:00:00Z'), '', '', 1)
  assert.equal(page.events.length, 1)
  assert.equal(page.events[0].ts, '2026-08-22T11:00:03.000Z')
  assert.equal(page.nextCursor, '1')

  const archived = workspace()
  fs.writeFileSync(path.join(archived.archive, '2026-08-22_pipeline.ndjson'), [
    JSON.stringify(decision('2026-08-22T10:00:00Z', 40, 'alpha')),
    JSON.stringify(outcome('2026-08-22T10:00:01Z', 40, 'alpha')),
  ].join('\n') + '\n')
  const archivePage = readPipelineTrendEvents(archived.root, archived.archive, Date.parse('2026-08-22T09:00:00Z'), Date.parse('2026-08-22T12:00:00Z'), 'alpha', '', 10)
  assert.equal(archivePage.events.length, 2, 'a pruned local day reads its permanent archive copy')

  const ranklessForward = workspace()
  const ranklessReverse = workspace()
  const sameTime = '2026-08-22T10:30:00Z'
  seed(ranklessForward.root, [outcome(sameTime, 50, 'zeta'), outcome(sameTime, 51, 'alpha')])
  seed(ranklessReverse.root, [outcome(sameTime, 51, 'alpha'), outcome(sameTime, 50, 'zeta')])
  const rangeStart = Date.parse('2026-08-22T10:00:00Z')
  const rangeEnd = Date.parse('2026-08-22T11:00:00Z')
  const forwardOrder = readPipelineTrend(ranklessForward.root, ranklessForward.archive, rangeStart, rangeEnd).providers.map((provider) => provider.id)
  const reverseOrder = readPipelineTrend(ranklessReverse.root, ranklessReverse.archive, rangeStart, rangeEnd).providers.map((provider) => provider.id)
  assert.deepEqual(forwardOrder, ['alpha', 'zeta'])
  assert.deepEqual(reverseOrder, forwardOrder, 'rankless equal contributors sort deterministically regardless of ledger insertion order')
})

check('archive service mirrors and safely prunes pipeline telemetry under the firehose contract', () => {
  const here = path.dirname(fileURLToPath(import.meta.url))
  const script = fs.readFileSync(path.resolve(here, '../../..', 'scripts/ops/news-archive.sh'), 'utf8')
  assert.match(script, /\*_pipeline\.ndjson/)
  assert.match(script, /-name '\*_pipeline\.ndjson'/)
  assert.match(script, /stat -f%z/)
  assert.match(script, /NEWS_LOCAL_RETENTION_DAYS:-30/)
})

console.log(`provider routing tests: ${passed} passed`)
