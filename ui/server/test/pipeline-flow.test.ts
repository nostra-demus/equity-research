import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  buildPipelineFlowRates,
  beginPipelineFlowCycle,
  completePipelineFlowCycle,
  countUniqueNewArrivals,
  cycleCompletionMs,
  latestPipelineCycle,
  cycleNewArrivalItems,
  cycleScannedItems,
  PIPELINE_FLOW_ABORT_SETTLEMENT_MS,
  PIPELINE_FLOW_WINDOW_MS,
  readPipelineFlowCycles,
  requiredPipelineFlowDates,
} from '../src/news/pipeline-flow'
import type { CycleSummary } from '../src/news/types'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (error: any) { console.error(`FAIL  ${name}\n      ${error?.stack || error?.message || error}`); process.exitCode = 1 }
}

const NOW = Date.parse('2026-08-21T00:20:00Z')
const CYCLE_TIMEOUT_MS = 480_000
function cycle(atMs: number, fields: Partial<CycleSummary> = {}): CycleSummary {
  return {
    ts: new Date(atMs).toISOString(), ok: true, fetched: 0, candidates: 0,
    picked: 0, watched: 0, dropped: 0, inboxed: 0, groq_requests: 0, groq_tokens: 0,
    feed_commit_version: 1,
    ...fields,
  }
}

check('redelivered backlog IDs are excluded from unique new-arrival inflow', () => {
  const delivered = [
    { event_id: 'EVT-new-a' }, { event_id: 'EVT-held' }, { event_id: 'EVT-new-a' }, { event_id: 'EVT-new-b' },
  ]
  assert.equal(countUniqueNewArrivals(delivered, [{ event_id: 'EVT-held' }]), 2, 'redelivery and duplicate delivery do not inflate inflow')
  const row = cycle(NOW, {
    candidates: 129, fresh: 4, new_arrivals: 2, carryover: 125,
    picked: 3, watched: 4, dropped: 5,
    backlog_expired: 900, dropped_at_cap: 700, deferred: 125,
  })
  assert.equal(cycleNewArrivalItems(row), 2, '`new_arrivals`, not the fetched-path `fresh`, owns inflow')
  assert.equal(cycleScannedItems(row), 12, 'expired, cap loss, deferred, and carryover are not scanning')
})

check('an empty delivery returns before inspecting backlog identities', () => {
  const unreadableBacklog = [{ get event_id(): string { throw new Error('backlog should not be traversed') } }]
  assert.equal(countUniqueNewArrivals([], unreadableBacklog), 0)
})

check('legacy pre-boundary summaries cannot claim durable scanning progress', () => {
  const legacy = cycle(NOW - 60_000, {
    completed_at: new Date(NOW - 30_000).toISOString(), new_arrivals: 12,
    picked: 4, watched: 4, dropped: 4, feed_commit_version: undefined,
  })
  assert.equal(cycleScannedItems(legacy), null)
  const rates = buildPipelineFlowRates([legacy], NOW, CYCLE_TIMEOUT_MS)
  assert.equal(rates.inflow.items, 12)
  assert.equal(rates.scanning.items, null)
  assert.equal(rates.comparison.status, 'unavailable')
})

check('legacy non-empty rows are unknown because fresh/candidates can contain redelivery', () => {
  assert.equal(cycleNewArrivalItems(cycle(NOW, { candidates: 0 })), 0, 'an empty queue safely proves zero arrivals')
  assert.equal(cycleNewArrivalItems(cycle(NOW, { candidates: 19, fresh: 5, carryover: 14 })), null)
  assert.equal(cycleNewArrivalItems(cycle(NOW, { candidates: 19 })), null)
  assert.equal(cycleNewArrivalItems(cycle(NOW, { candidates: 19, new_arrivals: 5 })), 5)
})

check('rates use a fixed 3,600-second trailing window and include the exact lower boundary', () => {
  const rates = buildPipelineFlowRates([
    cycle(NOW - PIPELINE_FLOW_WINDOW_MS, { candidates: 4, new_arrivals: 4, picked: 2, watched: 1, dropped: 1 }),
    cycle(NOW - 30 * 60_000, { candidates: 8, new_arrivals: 8, picked: 3, watched: 2, dropped: 1 }),
    cycle(NOW - PIPELINE_FLOW_WINDOW_MS - 1, { candidates: 1_000, new_arrivals: 1_000, picked: 1_000 }),
    cycle(NOW + 1, { candidates: 1_000, new_arrivals: 1_000, picked: 1_000 }),
  ], NOW, CYCLE_TIMEOUT_MS)

  assert.equal(rates.inflow.items, 12)
  assert.equal(rates.scanning.items, 10)
  assert.equal(rates.inflow.perSecond, 12 / 3600, 'the denominator is the whole hour, not time since the first cycle')
  assert.equal(rates.scanning.perSecond, 10 / 3600)
  assert.deepEqual(rates.comparison, {
    measured: true, status: 'behind', scanningMinusInflowItemsPerHour: -2,
  })
})

check('completion time places work in the rate window; legacy summaries fall back to start time', () => {
  const completedInside = cycle(NOW - 61 * 60_000, {
    completed_at: new Date(NOW - 59 * 60_000).toISOString(), candidates: 4, new_arrivals: 4, picked: 4,
  })
  const completedOutside = cycle(NOW - 63 * 60_000, {
    completed_at: new Date(NOW - 61 * 60_000).toISOString(), candidates: 100, new_arrivals: 100, picked: 100,
  })
  const legacyInside = cycle(NOW - 20 * 60_000, { candidates: 2, new_arrivals: 2, picked: 2 })
  const rates = buildPipelineFlowRates([completedInside, completedOutside, legacyInside], NOW, CYCLE_TIMEOUT_MS)
  assert.equal(cycleCompletionMs(completedInside, CYCLE_TIMEOUT_MS), NOW - 59 * 60_000)
  assert.equal(cycleCompletionMs(legacyInside, CYCLE_TIMEOUT_MS), NOW - 20 * 60_000)
  assert.equal(rates.inflow.items, 6)
  assert.equal(rates.scanning.items, 6)
})

check('the prior start-date partition remains required after the lower bound crosses midnight', () => {
  const afterMidnight = Date.parse('2026-08-21T00:50:00Z')
  assert.deepEqual(requiredPipelineFlowDates(afterMidnight, CYCLE_TIMEOUT_MS), ['2026-08-20', '2026-08-21'])
  const straddling = cycle(Date.parse('2026-08-20T23:58:00Z'), {
    completed_at: '2026-08-21T00:05:00Z', candidates: 7, new_arrivals: 7, picked: 7,
  })
  const rates = buildPipelineFlowRates([straddling], afterMidnight, CYCLE_TIMEOUT_MS)
  assert.equal(rates.inflow.items, 7, 'placement follows completion even though storage follows the prior start day')
  const earlierCurrent = cycle(Date.parse('2026-08-21T00:01:00Z'), { candidates: 1, new_arrivals: 1, picked: 1 })
  assert.equal(latestPipelineCycle([straddling, earlierCurrent], CYCLE_TIMEOUT_MS), straddling, 'Last look considers the prior start-day partition after midnight')
})

check('partition coverage includes the bounded post-abort settlement horizon', () => {
  const stillNeedsPrior = Date.parse('2026-08-21T01:09:59Z')
  const boundaryReached = Date.parse('2026-08-21T01:10:00Z')
  assert.equal(CYCLE_TIMEOUT_MS + PIPELINE_FLOW_ABORT_SETTLEMENT_MS, 10 * 60_000)
  assert.deepEqual(requiredPipelineFlowDates(stillNeedsPrior, CYCLE_TIMEOUT_MS), ['2026-08-20', '2026-08-21'])
  assert.deepEqual(requiredPipelineFlowDates(boundaryReached, CYCLE_TIMEOUT_MS), ['2026-08-21'])
})

check('daytime rate history does not require yesterday after the earliest possible start crosses midnight', () => {
  const midday = Date.parse('2026-08-21T12:00:00Z')
  assert.deepEqual(requiredPipelineFlowDates(midday, CYCLE_TIMEOUT_MS), ['2026-08-21'])
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-flow-daytime-'))
  try {
    const localInbox = path.join(root, 'screener', 'inbox')
    fs.mkdirSync(localInbox, { recursive: true })
    fs.writeFileSync(path.join(localInbox, '2026-08-21_firehose.ndjson'), '')
    const read = readPipelineFlowCycles(root, '', midday, CYCLE_TIMEOUT_MS)
    assert.equal(read.history.coverage, 'complete')
    assert.deepEqual(read.history.missingDates, [], 'an irrelevant prior-day partition is not coverage debt')
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

check('rate history reads cycle summaries from every shard in the UTC partition', () => {
  const midday = Date.parse('2026-08-21T12:00:00Z')
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-flow-shards-'))
  try {
    const inbox = path.join(root, 'screener', 'inbox')
    fs.mkdirSync(inbox, { recursive: true })
    const first = cycle(Date.parse('2026-08-21T11:00:00Z'), { new_arrivals: 1, picked: 1 })
    const second = cycle(Date.parse('2026-08-21T11:30:00Z'), { new_arrivals: 2, picked: 2 })
    fs.writeFileSync(path.join(inbox, '2026-08-21_firehose.ndjson'), `${JSON.stringify({ kind: 'cycle_summary', ...first })}\n`)
    fs.writeFileSync(path.join(inbox, '2026-08-21_firehose.000001.ndjson'), `${JSON.stringify({ kind: 'cycle_summary', ...second })}\n`)
    const read = readPipelineFlowCycles(root, '', midday, CYCLE_TIMEOUT_MS)
    assert.equal(read.cycles.length, 2)
    assert.equal(buildPipelineFlowRates(read.cycles, midday, CYCLE_TIMEOUT_MS, read.history).inflow.items, 3)
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
})

check('a missing physical shard makes pipeline-flow coverage unreadable instead of undercounted', () => {
  const midday = Date.parse('2026-08-21T12:00:00Z')
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-flow-shard-gap-'))
  try {
    const inbox = path.join(root, 'screener', 'inbox')
    fs.mkdirSync(inbox, { recursive: true })
    fs.writeFileSync(path.join(inbox, '2026-08-21_firehose.ndjson'), '')
    fs.writeFileSync(path.join(inbox, '2026-08-21_firehose.000002.ndjson'), `${JSON.stringify({
      kind: 'cycle_summary', ...cycle(midday - 60_000, { new_arrivals: 99, picked: 99 }),
    })}\n`)
    const read = readPipelineFlowCycles(root, '', midday, CYCLE_TIMEOUT_MS)
    assert.deepEqual(read.history.unreadableDates, ['2026-08-21'])
    assert.notEqual(read.history.coverage, 'complete', 'the missing shard cannot produce measured coverage')
    assert.equal(buildPipelineFlowRates(read.cycles, midday, CYCLE_TIMEOUT_MS, read.history).comparison.status, 'unavailable')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
})

check('impossible completion chronology fails the rate closed when the cycle could affect the window', () => {
  const started = NOW - 20 * 60_000
  for (const completed_at of [
    new Date(started - 1).toISOString(),
    new Date(started + CYCLE_TIMEOUT_MS + 1).toISOString(),
    'not-a-time',
  ]) {
    const impossible = cycle(started, { completed_at, candidates: 9, new_arrivals: 9, picked: 9 })
    assert.equal(cycleCompletionMs(impossible, CYCLE_TIMEOUT_MS), null)
    const rates = buildPipelineFlowRates([impossible], NOW, CYCLE_TIMEOUT_MS)
    assert.equal(rates.history.coverage, 'partial')
    assert.equal(rates.history.corruptCycleRows, 1)
    assert.equal(rates.inflow.perSecond, null)
    assert.equal(rates.comparison.status, 'unavailable')
  }
})

check('an aborted cycle may settle briefly after its guard, but not beyond the bounded interval', () => {
  const started = NOW - 20 * 60_000
  const atBoundary = cycle(started, {
    aborted: true,
    completed_at: new Date(started + CYCLE_TIMEOUT_MS + PIPELINE_FLOW_ABORT_SETTLEMENT_MS).toISOString(),
    candidates: 9, new_arrivals: 9, picked: 9,
  })
  assert.equal(
    cycleCompletionMs(atBoundary, CYCLE_TIMEOUT_MS),
    started + CYCLE_TIMEOUT_MS + PIPELINE_FLOW_ABORT_SETTLEMENT_MS,
  )
  const validRates = buildPipelineFlowRates([atBoundary], NOW, CYCLE_TIMEOUT_MS)
  assert.equal(validRates.history.coverage, 'complete')
  assert.equal(validRates.inflow.items, 9)

  const tooLate = cycle(started, {
    aborted: true,
    completed_at: new Date(started + CYCLE_TIMEOUT_MS + PIPELINE_FLOW_ABORT_SETTLEMENT_MS + 1).toISOString(),
    candidates: 99, new_arrivals: 99, picked: 99,
  })
  assert.equal(cycleCompletionMs(tooLate, CYCLE_TIMEOUT_MS), null)
  const invalidRates = buildPipelineFlowRates([tooLate], NOW, CYCLE_TIMEOUT_MS)
  assert.equal(invalidRates.history.coverage, 'partial')
  assert.equal(invalidRates.inflow.items, null)
})

check('an impossible old completion outside the possible start window does not hide current rates', () => {
  const current = cycle(NOW - 10 * 60_000, { candidates: 5, new_arrivals: 5, picked: 5 })
  const oldImpossible = cycle(NOW - 2 * 60 * 60_000, {
    completed_at: new Date(NOW - 10 * 60_000).toISOString(), candidates: 999, new_arrivals: 999, picked: 999,
  })
  const rates = buildPipelineFlowRates([oldImpossible, current], NOW, CYCLE_TIMEOUT_MS)
  assert.equal(rates.history.coverage, 'complete')
  assert.equal(rates.history.corruptCycleRows, 0)
  assert.equal(rates.inflow.items, 5)
  assert.equal(rates.scanning.items, 5)
})

check('a mixed legacy window exposes partial coverage but never claims a comparison', () => {
  const rates = buildPipelineFlowRates([
    cycle(NOW - 10_000, { candidates: 5, new_arrivals: 5, picked: 5 }),
    cycle(NOW - 20_000, { candidates: 9, fresh: 9, picked: 9 }), // no new-arrival partition: unknown inflow
  ], NOW, CYCLE_TIMEOUT_MS)

  assert.deepEqual(rates.inflow, {
    items: null, perSecond: null, measured: false, coverage: 'partial', knownCycles: 1, totalCycles: 2,
  })
  assert.equal(rates.scanning.measured, true)
  assert.equal(rates.scanning.items, 14)
  assert.deepEqual(rates.comparison, {
    measured: false, status: 'unavailable', scanningMinusInflowItemsPerHour: null,
  })
})

check('a parseable bad completion keeps loss/provider fields and remains eligible for Last look', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-flow-preserve-'))
  try {
    const localInbox = path.join(root, 'screener', 'inbox')
    fs.mkdirSync(localInbox, { recursive: true })
    fs.writeFileSync(path.join(localInbox, '2026-08-20_firehose.ndjson'), '')
    const bad = cycle(NOW - 10 * 60_000, {
      completed_at: new Date(NOW - 11 * 60_000).toISOString(), candidates: 4, new_arrivals: 4,
      dropped_at_cap: 7, backlog_expired: 3, provider_attempts: { groq: 2 },
    })
    fs.writeFileSync(path.join(localInbox, '2026-08-21_firehose.ndjson'), `${JSON.stringify({ kind: 'cycle_summary', ...bad })}\n`)
    const read = readPipelineFlowCycles(root, '', NOW, CYCLE_TIMEOUT_MS)
    assert.equal(read.cycles.length, 1, 'rate timestamp damage never deletes the parseable operational row')
    assert.equal(read.cycles[0].dropped_at_cap, 7)
    assert.equal(read.cycles[0].backlog_expired, 3)
    assert.equal(read.cycles[0].provider_attempts?.groq, 2)
    assert.equal(latestPipelineCycle(read.cycles, CYCLE_TIMEOUT_MS), read.cycles[0], 'Last look falls back to the valid start timestamp')
    const rates = buildPipelineFlowRates(read.cycles, NOW, CYCLE_TIMEOUT_MS, read.history)
    assert.equal(rates.history.coverage, 'partial', 'rate math still rejects the impossible completion')
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

check('Last look is read and cached independently after prior-day rate history ages out', () => {
  const midday = Date.parse('2026-08-21T12:00:00Z')
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-flow-last-look-'))
  try {
    const localInbox = path.join(root, 'screener', 'inbox')
    fs.mkdirSync(localInbox, { recursive: true })
    const previous = cycle(Date.parse('2026-08-20T23:50:00Z'), {
      completed_at: '2026-08-20T23:55:00Z', candidates: 7, new_arrivals: 7, picked: 4, watched: 2, dropped: 1,
    })
    const priorFile = path.join(localInbox, '2026-08-20_firehose.ndjson')
    fs.writeFileSync(priorFile, `${JSON.stringify({ kind: 'cycle_summary', ...previous })}\n`)
    fs.writeFileSync(path.join(localInbox, '2026-08-21_firehose.ndjson'), '')

    const coldRead = readPipelineFlowCycles(root, '', midday, CYCLE_TIMEOUT_MS)
    assert.deepEqual(coldRead.history.requiredDates, ['2026-08-21'])
    assert.equal(coldRead.cycles.length, 0, 'historical Last look never enters rate/day rows')
    assert.equal(coldRead.latestCycle?.ts, previous.ts, 'a cold process finds the newest older partition')

    fs.unlinkSync(priorFile)
    const cachedRead = readPipelineFlowCycles(root, '', midday + 10_000, CYCLE_TIMEOUT_MS)
    assert.equal(cachedRead.cycles.length, 0)
    assert.equal(cachedRead.latestCycle?.ts, previous.ts, 'subsequent polls retain one row without rereading old history')
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

check('cycle-only reader proves cross-midnight local+archive coverage without touching item rows', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-flow-root-'))
  const archive = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-flow-archive-'))
  try {
    const localInbox = path.join(root, 'screener', 'inbox')
    fs.mkdirSync(localInbox, { recursive: true })
    const prior = cycle(Date.parse('2026-08-20T23:45:00Z'), {
      completed_at: '2026-08-20T23:50:00Z', candidates: 3, new_arrivals: 3, picked: 3,
    })
    const current = cycle(Date.parse('2026-08-21T00:05:00Z'), {
      completed_at: '2026-08-21T00:10:00Z', candidates: 4, new_arrivals: 4, picked: 4,
    })
    const irrelevantMalformed = '{"kind":"cycle_summary","ts":"2026-08-20T10:00:00Z",'
    fs.writeFileSync(path.join(archive, '2026-08-20_firehose.ndjson'), `${irrelevantMalformed}\n${JSON.stringify({ kind: 'item', event_id: 'ignored' })}\n${JSON.stringify({ kind: 'cycle_summary', ...prior })}\n`)
    fs.writeFileSync(path.join(localInbox, '2026-08-21_firehose.ndjson'), `${JSON.stringify({ kind: 'item', event_id: 'ignored-2' })}\n${JSON.stringify({ kind: 'cycle_summary', ...current })}\n`)

    const read = readPipelineFlowCycles(root, archive, NOW, CYCLE_TIMEOUT_MS)
    assert.deepEqual(requiredPipelineFlowDates(NOW, CYCLE_TIMEOUT_MS), ['2026-08-20', '2026-08-21'])
    assert.equal(read.cycles.length, 2)
    assert.equal(read.history.coverage, 'complete')
    assert.equal(read.history.corruptCycleRows, 0, 'malformed history outside the possible start window cannot black out current rates')
    assert.deepEqual(read.history.readDates, ['2026-08-20', '2026-08-21'])
    const rates = buildPipelineFlowRates(read.cycles, NOW, CYCLE_TIMEOUT_MS, read.history)
    assert.equal(rates.inflow.items, 7)
    assert.equal(rates.scanning.items, 7)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
    fs.rmSync(archive, { recursive: true, force: true })
  }
})

check('missing required cross-midnight history fails both rates and comparison closed', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-flow-missing-'))
  try {
    const localInbox = path.join(root, 'screener', 'inbox')
    fs.mkdirSync(localInbox, { recursive: true })
    const current = cycle(Date.parse('2026-08-21T00:05:00Z'), {
      completed_at: '2026-08-21T00:10:00Z', candidates: 4, new_arrivals: 4, picked: 4,
    })
    fs.writeFileSync(path.join(localInbox, '2026-08-21_firehose.ndjson'), `${JSON.stringify({ kind: 'cycle_summary', ...current })}\n`)
    const read = readPipelineFlowCycles(root, '', NOW, CYCLE_TIMEOUT_MS)
    assert.equal(read.history.coverage, 'partial')
    assert.deepEqual(read.history.missingDates, ['2026-08-20'])
    const rates = buildPipelineFlowRates(read.cycles, NOW, CYCLE_TIMEOUT_MS, read.history)
    assert.equal(rates.inflow.perSecond, null)
    assert.equal(rates.scanning.perSecond, null)
    assert.equal(rates.comparison.status, 'unavailable')
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

check('no completed cycles is no coverage, not a measured zero-rate claim', () => {
  const rates = buildPipelineFlowRates([], NOW, CYCLE_TIMEOUT_MS)
  assert.equal(rates.inflow.coverage, 'none')
  assert.equal(rates.scanning.coverage, 'none')
  assert.equal(rates.inflow.perSecond, null)
  assert.equal(rates.comparison.status, 'unavailable')
})

check('a durable started-without-summary receipt makes an otherwise readable rate window unavailable', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-flow-gap-root-'))
  const state = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-flow-gap-state-'))
  const midday = Date.parse('2026-08-21T12:00:00Z')
  const started = '2026-08-21T11:59:00Z'
  try {
    const inbox = path.join(root, 'screener', 'inbox')
    fs.mkdirSync(inbox, { recursive: true })
    fs.writeFileSync(path.join(inbox, '2026-08-21_firehose.ndjson'), `${JSON.stringify({
      kind: 'cycle_summary', ...cycle(midday - 600_000, { completed_at: '2026-08-21T11:51:00Z', new_arrivals: 1, picked: 2 }),
    })}\n`)
    assert.equal(beginPipelineFlowCycle(state, started, midday - 60_000, CYCLE_TIMEOUT_MS), true)
    const incomplete = readPipelineFlowCycles(root, '', midday, CYCLE_TIMEOUT_MS, state)
    assert.equal(incomplete.history.coverage, 'partial')
    assert.equal(incomplete.history.incompleteCycles, 1)
    assert.equal(incomplete.history.todayIncompleteCycles, 1)
    assert.equal(incomplete.history.todayTotalsLowerBound, true)
    assert.equal(buildPipelineFlowRates(incomplete.cycles, midday, CYCLE_TIMEOUT_MS, incomplete.history).comparison.status, 'unavailable')

    // A later begin performs receipt pruning. The missing 11:59 summary no longer overlaps the trailing
    // hour at 14:00, but must survive because today's summary-derived counters are still lower bounds.
    const twoHoursLater = midday + 2 * 60 * 60_000
    const laterStarted = '2026-08-21T13:59:00Z'
    assert.equal(beginPipelineFlowCycle(state, laterStarted, twoHoursLater - 60_000, CYCLE_TIMEOUT_MS), true)
    assert.equal(completePipelineFlowCycle(state, laterStarted), true)
    fs.appendFileSync(path.join(inbox, '2026-08-21_firehose.ndjson'), `${JSON.stringify({
      kind: 'cycle_summary', ...cycle(twoHoursLater - 10 * 60_000, {
        completed_at: '2026-08-21T13:51:00Z', new_arrivals: 1, picked: 1,
      }),
    })}\n`)
    const aged = readPipelineFlowCycles(root, '', twoHoursLater, CYCLE_TIMEOUT_MS, state)
    assert.equal(aged.history.incompleteCycles, undefined, 'an old same-day gap does not gate the trailing hour')
    assert.equal(aged.history.coverage, 'complete', 'rate history remains independently complete')
    assert.equal(aged.history.todayIncompleteCycles, 1, 'daily incompleteness survives later begin/prune calls')
    assert.equal(aged.history.todayTotalsLowerBound, true)
    assert.equal(buildPipelineFlowRates(aged.cycles, twoHoursLater, CYCLE_TIMEOUT_MS, aged.history).comparison.status, 'equal')

    assert.equal(completePipelineFlowCycle(state, started), true)
    const complete = readPipelineFlowCycles(root, '', twoHoursLater, CYCLE_TIMEOUT_MS, state)
    assert.equal(complete.history.coverage, 'complete')
    assert.equal(complete.history.todayIncompleteCycles, 0)
    assert.equal(complete.history.todayTotalsLowerBound, false)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
    fs.rmSync(state, { recursive: true, force: true })
  }
})

check('a missing completion authority after v1 summaries exist fails the rate closed', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-flow-missing-gap-root-'))
  const state = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-flow-missing-gap-state-'))
  const midday = Date.parse('2026-08-21T12:00:00Z')
  try {
    const inbox = path.join(root, 'screener', 'inbox')
    fs.mkdirSync(inbox, { recursive: true })
    fs.writeFileSync(path.join(inbox, '2026-08-21_firehose.ndjson'), `${JSON.stringify({
      kind: 'cycle_summary', ...cycle(midday - 60_000, {
        completed_at: '2026-08-21T11:59:30Z', new_arrivals: 2, picked: 3,
      }),
    })}\n`)
    // The state directory exists but its v1 completion-authority file disappeared. Because a v1 summary
    // proves the authority was initialized, ENOENT is damage rather than a clean first boot.
    const read = readPipelineFlowCycles(root, '', midday, CYCLE_TIMEOUT_MS, state)
    assert.equal(read.history.gapMarkerUnreadable, true)
    assert.equal(read.history.coverage, 'partial')
    assert.equal(read.history.todayTotalsLowerBound, true)
    assert.equal(buildPipelineFlowRates(read.cycles, midday, CYCLE_TIMEOUT_MS, read.history).comparison.status, 'unavailable')
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
    fs.rmSync(state, { recursive: true, force: true })
  }
})

check('today summary-partition damage marks daily totals incomplete independently of the trailing rate', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-flow-today-damage-'))
  const midday = Date.parse('2026-08-21T12:00:00Z')
  try {
    const inbox = path.join(root, 'screener', 'inbox')
    fs.mkdirSync(inbox, { recursive: true })
    const oldMalformed = '{"kind":"cycle_summary","ts":"2026-08-21T08:00:00Z",'
    fs.writeFileSync(path.join(inbox, '2026-08-21_firehose.ndjson'), `${oldMalformed}\n${JSON.stringify({
      kind: 'cycle_summary', ...cycle(midday - 60_000, {
        completed_at: '2026-08-21T11:59:30Z', new_arrivals: 2, picked: 2,
      }),
    })}\n`)
    const corrupt = readPipelineFlowCycles(root, '', midday, CYCLE_TIMEOUT_MS)
    assert.equal(corrupt.history.coverage, 'complete', 'an old malformed row does not black out a valid trailing rate')
    assert.equal(corrupt.history.todayHistoryStatus, 'complete')
    assert.equal(corrupt.history.todayCorruptCycleRows, 1)
    assert.equal(corrupt.history.todayTotalsLowerBound, true, 'the same old row still makes day totals a lower bound')

    fs.unlinkSync(path.join(inbox, '2026-08-21_firehose.ndjson'))
    const missing = readPipelineFlowCycles(root, '', midday, CYCLE_TIMEOUT_MS)
    assert.equal(missing.history.todayHistoryStatus, 'missing')
    assert.equal(missing.history.todayTotalsLowerBound, true)
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

check('a prior-day missing summary gates only the overlapping rate window and not new-day totals', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-flow-rollover-root-'))
  const state = fs.mkdtempSync(path.join(os.tmpdir(), 'pipeline-flow-rollover-state-'))
  const started = '2026-08-21T23:59:00Z'
  const shortlyAfterMidnight = Date.parse('2026-08-22T00:05:00Z')
  const twoHoursAfterMidnight = Date.parse('2026-08-22T02:00:00Z')
  try {
    const inbox = path.join(root, 'screener', 'inbox')
    fs.mkdirSync(inbox, { recursive: true })
    fs.writeFileSync(path.join(inbox, '2026-08-21_firehose.ndjson'), '')
    fs.writeFileSync(path.join(inbox, '2026-08-22_firehose.ndjson'), '')
    assert.equal(beginPipelineFlowCycle(state, started, Date.parse(started), CYCLE_TIMEOUT_MS), true)

    const overlapping = readPipelineFlowCycles(root, '', shortlyAfterMidnight, CYCLE_TIMEOUT_MS, state)
    assert.equal(overlapping.history.incompleteCycles, 1, 'the 23:59 start can still affect the trailing hour')
    assert.equal(overlapping.history.coverage, 'partial')
    assert.equal(overlapping.history.todayIncompleteCycles, 0, 'the prior UTC day does not taint new-day totals')
    assert.equal(overlapping.history.todayTotalsLowerBound, false)

    fs.appendFileSync(path.join(inbox, '2026-08-22_firehose.ndjson'), `${JSON.stringify({
      kind: 'cycle_summary', ...cycle(Date.parse('2026-08-22T01:50:00Z'), {
        completed_at: '2026-08-22T01:51:00Z', new_arrivals: 2, picked: 2,
      }),
    })}\n`)
    const aged = readPipelineFlowCycles(root, '', twoHoursAfterMidnight, CYCLE_TIMEOUT_MS, state)
    assert.equal(aged.history.incompleteCycles, undefined)
    assert.equal(aged.history.coverage, 'complete')
    assert.equal(aged.history.todayIncompleteCycles, 0)
    assert.equal(aged.history.todayTotalsLowerBound, false)
    assert.equal(buildPipelineFlowRates(aged.cycles, twoHoursAfterMidnight, CYCLE_TIMEOUT_MS, aged.history).comparison.status, 'equal')

    // The first new-day begin may now prune the irrelevant prior-day receipt.
    const newDayStarted = '2026-08-22T01:59:00Z'
    assert.equal(beginPipelineFlowCycle(state, newDayStarted, Date.parse(newDayStarted), CYCLE_TIMEOUT_MS), true)
    assert.equal(completePipelineFlowCycle(state, newDayStarted), true)
    assert.deepEqual(JSON.parse(fs.readFileSync(path.join(state, 'news-pipeline-flow-gaps.json'), 'utf8')).starts, [])
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
    fs.rmSync(state, { recursive: true, force: true })
  }
})

console.log(`\npipeline-flow.test: ${passed} checks passed`)
