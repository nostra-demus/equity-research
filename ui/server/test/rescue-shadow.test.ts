import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { RESCUE_SELECTOR_VERSION, selectRescueCandidates, withInitialRescueDecision } from '../src/news/rescue/selector'
import { getRescueDiagnostics, runRescueShadowPass, type RescueShadowConfig } from '../src/news/rescue/shadow'
import { runNormalIdeasThenSecondLook } from '../src/news/rescue/order'
import {
  completeRescueCheck, flushPendingRescueAudit, flushStagedRescueRows, loadRescueDay, loadRescueQueue, readRescueHealth,
  recordRescueRows as recordRescueRowsProduction,
  RESCUE_QUEUE_MAX_BYTES, RESCUE_QUEUE_MAX_ITEMS, RESCUE_QUEUE_OVERFLOW_ERROR,
  readRescueMode, recordRescueMode, reserveRescueCheck, rescueQueueEnabled, stageRescueFeedRange, updateRescueHealth,
} from '../src/news/rescue/store'
import { invalidateSymbolCache } from '../src/news/symbology'
import type { FeedItem } from '../src/news/types'

const START = Date.parse('2026-08-22T00:01:00Z')
const baseConfig: RescueShadowConfig = {
  mode: 'shadow', maxAgeHrs: 36, dailyChecks: 200, perCycle: 8,
  nameDailyCap: 40, paceFloorFraction: 0.04, auditMaxBytes: 15 * 1024 * 1024,
}

assert.ok(RESCUE_QUEUE_MAX_ITEMS >= 120_000,
  'the queue covers a 36-hour window spanning bursts from three UTC daily partitions')
assert.ok(RESCUE_QUEUE_MAX_BYTES >= 240_000_000, 'the byte guard covers the same maximum retention window')
assert.equal(rescueQueueEnabled('shadow'), true)
assert.equal(rescueQueueEnabled('off'), false, 'the explicit off switch disables rescue queue maintenance')

function recordRescueRows(stateDir: string, rows: readonly FeedItem[], now = START, maxAgeHrs = 36): boolean {
  if (!loadRescueQueue(stateDir).coverage_started_at) {
    const matureStart = now - Math.max(1, maxAgeHrs) * 3_600_000 - 5 * 60_000 - 1
    if (!recordRescueRowsProduction(stateDir, [], matureStart, maxAgeHrs)) return false
  }
  return recordRescueRowsProduction(stateDir, rows, now, maxAgeHrs)
}

{
  const failedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-day-directory-eio-'))
  const unsupportedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-day-directory-unsupported-'))
  const rootSyncRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-root-directory-eio-'))
  const open = fs.openSync
  try {
    const candidate = selectRescueCandidates([row(1)], START).candidates[0]
    const failDir = path.join(failedRoot, 'news-rescue', 'days')
    ;(fs as any).openSync = (target: fs.PathLike, flags: string | number, mode?: number) => {
      if (String(target) === failDir && flags === 'r') {
        const error = new Error('injected parent directory I/O failure') as NodeJS.ErrnoException
        error.code = 'EIO'
        throw error
      }
      return open(target, flags as any, mode)
    }
    assert.equal(reserveRescueCheck(failedRoot, '2026-08-22', candidate, RESCUE_SELECTOR_VERSION, START), null,
      'a real parent-directory fsync error closes admission even after the file rename')

    const unsupportedDir = path.join(unsupportedRoot, 'news-rescue', 'days')
    ;(fs as any).openSync = (target: fs.PathLike, flags: string | number, mode?: number) => {
      if (String(target) === unsupportedDir && flags === 'r') {
        const error = new Error('directory fsync unsupported') as NodeJS.ErrnoException
        error.code = 'EINVAL'
        throw error
      }
      return open(target, flags as any, mode)
    }
    assert.ok(reserveRescueCheck(unsupportedRoot, '2026-08-22', candidate, RESCUE_SELECTOR_VERSION, START),
      'an explicitly unsupported directory fsync is the only tolerated parent-sync failure')

    ;(fs as any).openSync = (target: fs.PathLike, flags: string | number, mode?: number) => {
      if (String(target) === rootSyncRoot && flags === 'r') {
        const error = new Error('injected rescue-root parent I/O failure') as NodeJS.ErrnoException
        error.code = 'EIO'
        throw error
      }
      return open(target, flags as any, mode)
    }
    assert.equal(reserveRescueCheck(rootSyncRoot, '2026-08-22', candidate, RESCUE_SELECTOR_VERSION, START), null,
      'the first news-rescue directory entry must be synced in its state parent before admission')
  } finally {
    ;(fs as any).openSync = open
    fs.rmSync(failedRoot, { recursive: true, force: true })
    fs.rmSync(unsupportedRoot, { recursive: true, force: true })
    fs.rmSync(rootSyncRoot, { recursive: true, force: true })
  }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-name-to-ticker-'))
  try {
    invalidateSymbolCache()
    assert.equal(recordRescueRows(root, [
      row(1), row(2), row(3), row(4), row(100, true),
    ], START), true)
    let calls = 0
    const fetchImpl = (async (url: string) => { calls++; return responseForUrl(url) }) as any
    const first = await runRescueShadowPass({
      stateDir: root, config: { ...baseConfig, perCycle: 5 }, coreReady: true, fetchImpl, now: () => START,
    })
    assert.equal(first.checkedThisCycle, 5)
    const enriched = withInitialRescueDecision({
      ...row(100),
      companies: [{ name: 'Company 100 Inc', ticker: 'C100', listing_country: 'US' }],
    })
    assert.equal(recordRescueRows(root, [enriched], START + 60_000), true)
    const second = await runRescueShadowPass({
      stateDir: root, config: { ...baseConfig, perCycle: 1 }, coreReady: true, fetchImpl,
      now: () => START + 60_000,
    })
    assert.equal(second.checkedThisCycle, 0,
      'a verified name-only check follows the same story after exact ticker enrichment')
    assert.equal(calls, 5)
    assert.equal(loadRescueDay(root, '2026-08-22').ledger.checks.length, 5)
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-audit-directory-sync-'))
  const open = fs.openSync
  try {
    const candidate = selectRescueCandidates([row(1)], START).candidates[0]
    const reservation = reserveRescueCheck(root, '2026-08-22', candidate, RESCUE_SELECTOR_VERSION, START)
    assert.ok(reservation)
    const auditDir = path.join(root, 'news-rescue', 'ledger')
    ;(fs as any).openSync = (target: fs.PathLike, flags: string | number, mode?: number) => {
      if (String(target) === auditDir && flags === 'r') throw new Error('injected directory fsync failure')
      return open(target, flags as any, mode)
    }
    assert.equal(completeRescueCheck(root, '2026-08-22', reservation.key, {
      status: 'verified', ticker: 'C1', companyName: 'Company 1 Inc', exchange: 'NYSE',
    }, baseConfig.auditMaxBytes, START), false,
    'a result cannot finalize when the monthly audit directory entry is not proven durable')
    assert.equal(loadRescueDay(root, '2026-08-22').ledger.checks[0].audit_pending, true)
    ;(fs as any).openSync = open
    assert.equal(flushPendingRescueAudit(root, '2026-08-22', baseConfig.auditMaxBytes), true)
    assert.equal(loadRescueDay(root, '2026-08-22').ledger.checks[0].audit_pending, false)
  } finally {
    ;(fs as any).openSync = open
    fs.rmSync(root, { recursive: true, force: true })
  }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-audit-directory-unsupported-'))
  const open = fs.openSync
  try {
    const candidate = selectRescueCandidates([row(1)], START).candidates[0]
    const reservation = reserveRescueCheck(root, '2026-08-22', candidate, RESCUE_SELECTOR_VERSION, START)
    assert.ok(reservation)
    const auditDir = path.join(root, 'news-rescue', 'ledger')
    ;(fs as any).openSync = (target: fs.PathLike, flags: string | number, mode?: number) => {
      if (String(target) === auditDir && flags === 'r') {
        const error = new Error('directory fsync unsupported') as NodeJS.ErrnoException
        error.code = 'ENOTSUP'
        throw error
      }
      return open(target, flags as any, mode)
    }
    assert.equal(completeRescueCheck(root, '2026-08-22', reservation.key, {
      status: 'verified', ticker: 'C1', companyName: 'Company 1 Inc', exchange: 'NYSE',
    }, baseConfig.auditMaxBytes, START), true,
    'an unsupported audit-directory fsync does not wedge a platform that cannot provide it')
    assert.equal(loadRescueDay(root, '2026-08-22').ledger.checks[0].audit_pending, false)
  } finally {
    ;(fs as any).openSync = open
    fs.rmSync(root, { recursive: true, force: true })
  }
}

{
  const order: string[] = []
  await runNormalIdeasThenSecondLook({
    ideas: async () => {
      order.push('normal-start'); await Promise.resolve(); order.push('normal-finish')
      return { coverage_complete: true }
    },
    secondLook: async () => { order.push('second-look') },
  })
  assert.deepEqual(order, ['normal-start', 'normal-finish', 'second-look'], 'normal Ideas always finishes first')
}

{
  let secondLookRan = false
  let blockedRecorded = false
  const result = await runNormalIdeasThenSecondLook({
    ideas: async () => ({ coverage_complete: false, ran: false, note: 'provider failed softly' }),
    secondLook: async () => { secondLookRan = true; return 'ran' },
    onSecondLookBlocked: async () => { blockedRecorded = true; return 'paused' },
  })
  assert.equal(secondLookRan, false, 'a fail-soft normal Ideas result cannot start second-look work')
  assert.equal(blockedRecorded, true)
  assert.equal(result.secondLook, 'paused')
}

function row(index: number, nameOnly = false): FeedItem {
  const ticker = `C${index}`
  return withInitialRescueDecision({
    kind: 'item', ts: '2026-08-22T00:00:00Z', found_at: '2026-08-22T00:00:00Z', event_id: `EVT-${index}`,
    headline: `Company ${index} announces a $${index + 10} million commercial contract`,
    url: `https://reuters.com/${index}`, domain: 'reuters.com', source_name: 'Reuters', via: 'gdelt', region: 'US',
    input_nature: 'news_headline', triage_score: 30, band: 'drop', triage_reason: '', relevance: 'relevant_non_material',
    event_types: ['commercial'], issuer_linkage: 'primary',
    companies: [{ name: `Company ${index} Inc`, ticker: nameOnly ? null : ticker, listing_country: 'US' }],
    size_bucket: 'unknown', source_tier: 'news',
    rank_factors: {
      materiality: 30, source_tier: 0, scope: 0, event: 0, size: 0, recency: 0,
      materiality_label_floor: 0, quantified: nameOnly ? 6 : 0, boost_weight: 1,
      scope_id: 'single_name', source_tier_id: 'news', event_id: 'commercial', size_bucket: 'unknown',
    }, dedup_status: 'new', dedup_group: `EVT-${index}`, inboxed: false,
  })
}

function responseForUrl(url: string): any {
  const query = new URL(url).searchParams.get('q') || ''
  const match = /C(\d+)/i.exec(query) || /Company\s+(\d+)/i.exec(query)
  const index = match?.[1] || '0'
  return {
    ok: true, status: 200,
    json: async () => ({ quotes: [{ quoteType: 'EQUITY', symbol: `C${index}`, longname: `Company ${index} Inc`, exchDisp: 'NYSE' }] }),
  }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-post-ideas-queue-'))
  try {
    assert.equal(recordRescueRows(root, [], START), true)
    const queuePath = path.join(root, 'news-rescue', 'queue.json')
    const queueBeforeIngest = fs.readFileSync(queuePath)
    const firehose = path.join(root, 'screener', 'inbox', '2026-08-22_firehose.ndjson')
    fs.mkdirSync(path.dirname(firehose), { recursive: true })
    const item = row(77)
    fs.writeFileSync(firehose, `${JSON.stringify(item)}\n`)
    const before = { '2026-08-22': 0, '2026-08-21': 0, '2026-08-20': 0 }
    const after = { ...before, '2026-08-22': fs.statSync(firehose).size }
    assert.equal(stageRescueFeedRange(root, START, { before, after }), true)
    assert.deepEqual(fs.readFileSync(queuePath), queueBeforeIngest,
      'ingest writes only a tiny feed marker and never rewrites the rolling queue before Ideas')
    assert.equal(loadRescueQueue(root).committed, false,
      'a staged feed range blocks lookups until the post-Ideas queue update lands')

    assert.equal(recordRescueMode(root, 'off', START), true)
    assert.equal(flushStagedRescueRows(root, root, START, 36, 'off'), true)
    assert.deepEqual(fs.readFileSync(queuePath), queueBeforeIngest,
      'off mode leaves the staged marker in place without rewriting the rolling queue')
    assert.equal(readRescueMode(root).mode, 'off', 'off-mode flushing cannot silently turn shadow mode back on')

    const order: string[] = []
    await runNormalIdeasThenSecondLook({
      ideas: async () => { order.push('normal-ideas'); return { coverage_complete: true } },
      secondLook: async () => {
        order.push('queue-flush')
        assert.equal(flushStagedRescueRows(root, root, START), true)
        order.push('second-look')
      },
    })
    assert.deepEqual(order, ['normal-ideas', 'queue-flush', 'second-look'])
    const queue = loadRescueQueue(root)
    assert.equal(queue.committed, true)
    assert.ok(queue.items.some((saved) => saved.event_id === item.event_id))
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-retention-growth-'))
  try {
    const shortWindowHrs = 12
    const matureStart = START - shortWindowHrs * 3_600_000 - 5 * 60_000 - 1
    assert.equal(recordRescueRowsProduction(root, [], matureStart, shortWindowHrs), true)
    assert.equal(recordRescueRowsProduction(root, [row(1)], START, shortWindowHrs), true)
    assert.equal(loadRescueQueue(root).max_age_hrs, shortWindowHrs)

    const grewAt = START + 60_000
    const fresh = withInitialRescueDecision({
      ...row(2), ts: new Date(grewAt).toISOString(), found_at: new Date(grewAt).toISOString(),
    })
    assert.equal(recordRescueRowsProduction(root, [fresh], grewAt, 36), true)
    const queue = loadRescueQueue(root)
    assert.equal(queue.max_age_hrs, 36)
    assert.equal(queue.coverage_started_at, new Date(grewAt).toISOString(),
      'growing the retention window starts a new proof clock for the newly included history')
    let calls = 0
    const result = await runRescueShadowPass({
      stateDir: root, config: baseConfig, coreReady: true,
      fetchImpl: (async (url: string) => { calls++; return responseForUrl(url) }) as any,
      now: () => grewAt,
    })
    assert.equal(result.status, 'warming')
    assert.equal(result.candidatesFound, null)
    assert.equal(calls, 0)
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-warmup-'))
  try {
    invalidateSymbolCache()
    assert.equal(recordRescueRowsProduction(root, [row(1)], START), true)
    let calls = 0
    const fetchImpl = (async (url: string) => { calls++; return responseForUrl(url) }) as any
    const warming = await runRescueShadowPass({
      stateDir: root, config: baseConfig, coreReady: true, fetchImpl, now: () => START,
    })
    assert.equal(warming.status, 'warming')
    assert.equal(warming.candidatesFound, null,
      'first-deployment counts stay unknown while pre-start firehose rows may be missing')
    assert.equal(calls, 0)

    const matureAt = START + 36 * 3_600_000 + 5 * 60_000 + 1
    const fresh = withInitialRescueDecision({
      ...row(2), ts: new Date(matureAt).toISOString(), found_at: new Date(matureAt).toISOString(),
    })
    assert.equal(recordRescueRowsProduction(root, [fresh], matureAt), true)
    const ready = await runRescueShadowPass({
      stateDir: root, config: { ...baseConfig, perCycle: 1 }, coreReady: true, fetchImpl,
      now: () => matureAt,
    })
    assert.equal(ready.status, 'ready')
    assert.equal(ready.checkedThisCycle, 1,
      'the lane starts only after its full omission window has retired')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-off-reenable-'))
  try {
    invalidateSymbolCache()
    assert.equal(recordRescueRows(root, [row(1)], START), true)
    const offAt = START + 60 * 60_000
    const queuePath = path.join(root, 'news-rescue', 'queue.json')
    const queueBeforeOff = fs.readFileSync(queuePath)
    assert.equal(recordRescueMode(root, 'off', offAt), true)
    const disabled = await runRescueShadowPass({
      stateDir: root, config: { ...baseConfig, mode: 'off' }, coreReady: true, now: () => offAt,
    })
    assert.equal(disabled.status, 'disabled')
    assert.equal(readRescueMode(root).mode, 'off')
    assert.deepEqual(fs.readFileSync(queuePath), queueBeforeOff,
      'an off-mode Ideas tick writes no candidate queue bytes')

    let calls = 0
    const reenabledAt = offAt + 60 * 60_000
    const checkpoint = { '2026-08-22': 123, '2026-08-21': 0, '2026-08-20': 0 }
    assert.equal(recordRescueRowsProduction(root, [], reenabledAt, 36, {
      before: checkpoint, after: checkpoint,
    }), true)
    const reenabled = await runRescueShadowPass({
      stateDir: root, config: baseConfig, coreReady: true,
      fetchImpl: (async (url: string) => { calls++; return responseForUrl(url) }) as any,
      feedCheckpoint: { available: true, checkpoint },
      now: () => reenabledAt,
    })
    const queue = loadRescueQueue(root)
    assert.equal(reenabled.status, 'warming')
    assert.equal(reenabled.candidatesFound, null)
    assert.equal(readRescueMode(root).mode, 'shadow')
    assert.equal(queue.coverage_started_at, new Date(reenabledAt).toISOString(),
      'off -> shadow starts a new omission window instead of reusing the old mature clock')
    assert.equal(calls, 0, 're-enable cannot perform a directory check before the new window matures')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-pending-and-health-fail-'))
  const rename = fs.renameSync
  try {
    invalidateSymbolCache()
    assert.equal(recordRescueRows(root, [row(1)], START), true)
    const failedAt = START + 60_000
    ;(fs as any).renameSync = (from: fs.PathLike, to: fs.PathLike) => {
      if (String(to).endsWith('/news-rescue/queue-pending.json')
        || String(to).endsWith('/news-rescue/health.json')) {
        throw new Error('injected pending and health write failure')
      }
      return rename(from, to)
    }
    assert.equal(recordRescueRowsProduction(root, [row(2)], failedAt), false)
    ;(fs as any).renameSync = rename

    let calls = 0
    const blocked = await runRescueShadowPass({
      stateDir: root, config: baseConfig, coreReady: true,
      fetchImpl: (async (url: string) => { calls++; return responseForUrl(url) }) as any,
      now: () => failedAt,
    })
    assert.equal(blocked.status, 'audit_unavailable')
    assert.equal(blocked.candidatesFound, null)
    assert.equal(calls, 0,
      'the in-memory failure witness blocks same-cycle directory admission when both durable witnesses failed')
  } finally {
    ;(fs as any).renameSync = rename
    fs.rmSync(root, { recursive: true, force: true })
  }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-restart-checkpoint-gap-'))
  try {
    invalidateSymbolCache()
    const saved = { '2026-08-22': 100, '2026-08-21': 0, '2026-08-20': 0 }
    assert.equal(recordRescueRowsProduction(root, [row(1)], START, 36, { before: saved, after: saved }), true)
    let calls = 0
    const afterMissedFeedAppend = { ...saved, '2026-08-22': 250 }
    const restarted = await runRescueShadowPass({
      stateDir: root, config: baseConfig, coreReady: true,
      fetchImpl: (async (url: string) => { calls++; return responseForUrl(url) }) as any,
      feedCheckpoint: { available: true, checkpoint: afterMissedFeedAppend },
      now: () => START,
    })
    assert.equal(restarted.status, 'warming')
    assert.equal(restarted.candidatesFound, null)
    assert.equal(calls, 0,
      'a durable firehose/queue checkpoint mismatch survives process restart and blocks directory admission')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const runCycleSource = fs.readFileSync(new URL('../src/news/runCycle.ts', import.meta.url), 'utf8')
  assert.ok(runCycleSource.indexOf("recordRescueMode(stateDir, 'off'") < runCycleSource.indexOf('appendFeedItems('),
    'off mode is recorded at the ingest boundary before any durable feed append can omit queue maintenance')
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-paced-'))
  try {
    invalidateSymbolCache()
    assert.equal(recordRescueRows(root, [row(100, true), ...Array.from({ length: 12 }, (_, index) => row(index))], START), true)
    let calls = 0
    const fetchImpl = (async (url: string) => { calls++; return responseForUrl(url) }) as any
    const first = await runRescueShadowPass({ stateDir: root, config: baseConfig, coreReady: true, fetchImpl, now: () => START })
    assert.equal(first.checkedThisCycle, 8, 'the 4% floor releases exactly eight start-of-day checks')
    assert.equal(calls, 8)
    const day = loadRescueDay(root, '2026-08-22')
    assert.equal(day.ledger.checks.length, 8)
    assert.equal(day.ledger.checks.filter((check) => check.pool === 'name').length, 1, 'the fifth slot is the 20% name reserve')
    assert.ok(day.ledger.checks.every((check) => check.identity_status === 'verified'))
    const restarted = await runRescueShadowPass({ stateDir: root, config: baseConfig, coreReady: true, fetchImpl, now: () => START })
    assert.equal(restarted.checkedThisCycle, 0, 'a restart cannot reuse the same paced slots')
    assert.equal(calls, 8)
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-ticker-shortage-'))
  try {
    invalidateSymbolCache()
    const rows = [
      ...Array.from({ length: 4 }, (_, index) => row(index + 1)),
      ...Array.from({ length: 5 }, (_, index) => row(index + 100, true)),
    ]
    assert.equal(recordRescueRows(root, rows, START), true)
    let calls = 0
    const fetchImpl = (async (url: string) => { calls++; return responseForUrl(url) }) as any
    const result = await runRescueShadowPass({ stateDir: root, config: baseConfig, coreReady: true, fetchImpl, now: () => START })
    assert.equal(result.checkedThisCycle, 5, 'four ticker checks earn exactly one name-only check')
    assert.equal(calls, 5)
    const checks = loadRescueDay(root, '2026-08-22').ledger.checks
    assert.equal(checks.filter((check) => check.pool === 'ticker').length, 4)
    assert.equal(checks.filter((check) => check.pool === 'name').length, 1,
      'empty ticker slots never spill over to extra name-only searches')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-outage-'))
  try {
    invalidateSymbolCache()
    assert.equal(recordRescueRows(root, Array.from({ length: 6 }, (_, index) => row(index)), START), true)
    let calls = 0
    const unavailable = (async () => { calls++; return { ok: false, status: 429, json: async () => ({}) } }) as any
    const result = await runRescueShadowPass({ stateDir: root, config: baseConfig, coreReady: true, fetchImpl: unavailable, now: () => START })
    assert.equal(result.checkedThisCycle, 3, 'three failures open the circuit before a fourth request')
    assert.equal(calls, 3)
    assert.equal(result.status, 'directory_paused')
    assert.equal(result.directoryUnavailable, 3)
    assert.ok(result.circuitOpenUntil)
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-health-write-'))
  const rename = fs.renameSync
  try {
    invalidateSymbolCache()
    assert.equal(recordRescueRows(root, [row(1), row(2), row(3)], START), true)
    let calls = 0
    let healthWrites = 0
    ;(fs as any).renameSync = (from: fs.PathLike, to: fs.PathLike) => {
      if (String(to).endsWith('/news-rescue/health.json') && ++healthWrites >= 2) {
        throw new Error('injected health write failure')
      }
      return rename(from, to)
    }
    const unavailable = (async () => { calls++; return { ok: false, status: 503, json: async () => ({}) } }) as any
    const failed = await runRescueShadowPass({ stateDir: root, config: baseConfig, coreReady: true, fetchImpl: unavailable, now: () => START })
    assert.equal(calls, 1, 'a failed directory-health write stops the pass immediately')
    assert.equal(failed.status, 'audit_unavailable')
    assert.equal(failed.auditHealthy, false)
    const stillFailed = await runRescueShadowPass({ stateDir: root, config: baseConfig, coreReady: true, fetchImpl: unavailable, now: () => START })
    assert.equal(stillFailed.checkedThisCycle, 0)
    assert.equal(calls, 1, 'a persistently unwritable health authority blocks before another network call')
  } finally {
    ;(fs as any).renameSync = rename
    fs.rmSync(root, { recursive: true, force: true })
  }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-empty-'))
  try {
    invalidateSymbolCache()
    assert.equal(recordRescueRows(root, [row(1)], START), true)
    const healthyEmpty = (async () => ({ ok: true, status: 200, json: async () => ({ quotes: [] }) })) as any
    const result = await runRescueShadowPass({ stateDir: root, config: { ...baseConfig, perCycle: 1 }, coreReady: true, fetchImpl: healthyEmpty, now: () => START })
    assert.equal(result.identityUnresolved, 1)
    assert.equal(result.directoryUnavailable, 0, 'a healthy empty result is not an outage')
    const changedIdentity = withInitialRescueDecision({
      ...row(1),
      companies: [{ name: 'Renamed Company Inc', ticker: 'RENAMED', listing_country: 'US' }],
    })
    assert.equal(recordRescueRows(root, [changedIdentity], START), true)
    let changedCalls = 0
    const changedFetch = (async () => {
      changedCalls++
      return {
        ok: true, status: 200,
        json: async () => ({ quotes: [{ quoteType: 'EQUITY', symbol: 'RENAMED', longname: 'Renamed Company Inc', exchDisp: 'NYSE' }] }),
      }
    }) as any
    const retried = await runRescueShadowPass({ stateDir: root, config: { ...baseConfig, perCycle: 1 }, coreReady: true, fetchImpl: changedFetch, now: () => START })
    assert.equal(retried.checkedThisCycle, 1, 'an unresolved item may be retried when its saved identity changes')
    assert.equal(changedCalls, 1)
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-directory-alias-'))
  try {
    invalidateSymbolCache()
    assert.equal(recordRescueRows(root, [row(1)], START), true)
    const aliases = (async () => ({
      ok: true, status: 200, json: async () => ({ quotes: [
        { quoteType: 'EQUITY', symbol: 'C1.L', longname: 'Company 1 Inc', exchDisp: 'LSE' },
        { quoteType: 'EQUITY', symbol: 'C1', longname: 'Company 1 Inc', exchDisp: 'NYSE' },
      ] }),
    })) as any
    const result = await runRescueShadowPass({
      stateDir: root, config: { ...baseConfig, perCycle: 1 }, coreReady: true, fetchImpl: aliases, now: () => START,
    })
    assert.equal(result.verified, 1)
    const check = loadRescueDay(root, '2026-08-22').ledger.checks[0]
    assert.equal(check.ticker, 'C1')
    assert.equal(check.exchange, 'NYSE', 'an exact alias keeps its own listing venue, not the group primary venue')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-directory-country-'))
  try {
    invalidateSymbolCache()
    const gbRow = withInitialRescueDecision({
      ...row(1), companies: [{ name: 'Company 1 Inc', ticker: 'C1', listing_country: 'GB' }],
    })
    assert.equal(recordRescueRows(root, [gbRow], START), true)
    const listings = (async () => ({
      ok: true, status: 200, json: async () => ({ quotes: [
        { quoteType: 'EQUITY', symbol: 'C1', longname: 'Company 1 Inc', exchDisp: 'NYSE' },
        { quoteType: 'EQUITY', symbol: 'C1.L', longname: 'Company 1 Inc', exchDisp: 'LSE' },
      ] }),
    })) as any
    const result = await runRescueShadowPass({
      stateDir: root, config: { ...baseConfig, perCycle: 1 }, coreReady: true, fetchImpl: listings, now: () => START,
    })
    assert.equal(result.verified, 1)
    const check = loadRescueDay(root, '2026-08-22').ledger.checks[0]
    assert.equal(check.ticker, 'C1.L')
    assert.equal(check.exchange, 'LSE', 'an exact bare ticker on the wrong country cannot win the match')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const ambiguousRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-name-ambiguous-'))
  const countryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-name-country-'))
  const directory = (async (url: string) => {
    if (!new URL(url).searchParams.get('q')?.includes('Company 100')) return responseForUrl(url)
    return {
      ok: true, status: 200, json: async () => ({ quotes: [
        { quoteType: 'EQUITY', symbol: 'C100', longname: 'Company 100 Inc', exchDisp: 'NYSE' },
        { quoteType: 'EQUITY', symbol: 'C100.AX', longname: 'Company 100 Corp', exchDisp: 'ASX' },
      ] }),
    }
  }) as any
  try {
    invalidateSymbolCache()
    const noCountry = withInitialRescueDecision({
      ...row(100, true), companies: [{ name: 'Company 100', ticker: null, listing_country: null }],
    })
    assert.equal(recordRescueRows(ambiguousRoot, [row(1), row(2), row(3), row(4), noCountry], START), true)
    const ambiguous = await runRescueShadowPass({
      stateDir: ambiguousRoot, config: { ...baseConfig, perCycle: 5 }, coreReady: true, fetchImpl: directory, now: () => START,
    })
    assert.equal(ambiguous.identityUnresolved, 1,
      'two same-core issuers remain ambiguous when the saved item has no listing country')

    invalidateSymbolCache()
    assert.equal(recordRescueRows(countryRoot, [row(1), row(2), row(3), row(4), row(100, true)], START), true)
    const countryMatched = await runRescueShadowPass({
      stateDir: countryRoot, config: { ...baseConfig, perCycle: 5 }, coreReady: true, fetchImpl: directory, now: () => START,
    })
    assert.equal(countryMatched.verified, 5, 'a saved country may select exactly one compatible issuer listing')
    assert.equal(loadRescueDay(countryRoot, '2026-08-22').ledger.checks.find((check) => check.pool === 'name')?.exchange, 'NYSE')
  } finally {
    fs.rmSync(ambiguousRoot, { recursive: true, force: true })
    fs.rmSync(countryRoot, { recursive: true, force: true })
  }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-audit-'))
  try {
    invalidateSymbolCache()
    assert.equal(recordRescueRows(root, [row(1), row(2)], START), true)
    let calls = 0
    const fetchImpl = (async (url: string) => { calls++; return responseForUrl(url) }) as any
    const result = await runRescueShadowPass({
      stateDir: root, config: { ...baseConfig, auditMaxBytes: 1 }, coreReady: true, fetchImpl, now: () => START,
    })
    assert.equal(calls, 0, 'a known-full detailed audit stops before any unlogged network check')
    assert.equal(result.status, 'audit_unavailable')
    assert.equal(result.auditHealthy, false)

    const nextMonth = Date.parse('2026-09-01T00:01:00Z')
    const nextRow = withInitialRescueDecision({
      ...row(3), ts: '2026-09-01T00:00:00Z', found_at: '2026-09-01T00:00:00Z',
    })
    assert.equal(recordRescueRows(root, [nextRow], nextMonth), true)
    const recovered = await runRescueShadowPass({
      stateDir: root, config: baseConfig, coreReady: true, fetchImpl, now: () => nextMonth,
    })
    assert.equal(recovered.status, 'ready')
    assert.equal(recovered.checkedThisCycle, 1,
      'a capacity-only latch is re-probed and clears when a new monthly audit has room')
    assert.equal(readRescueHealth(root).audit_healthy, true)
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-crash-'))
  try {
    invalidateSymbolCache()
    assert.equal(recordRescueRows(root, [row(1)], START), true)
    const candidate = selectRescueCandidates(loadRescueQueue(root).items, START).candidates[0]
    assert.ok(candidate)
    assert.ok(reserveRescueCheck(root, '2026-08-22', candidate, RESCUE_SELECTOR_VERSION, START))
    let calls = 0
    const fetchImpl = (async (url: string) => { calls++; return responseForUrl(url) }) as any
    const restarted = await runRescueShadowPass({ stateDir: root, config: baseConfig, coreReady: true, fetchImpl, now: () => START })
    assert.equal(restarted.checkedThisCycle, 0)
    assert.equal(calls, 0, 'a crash after reservation cannot repeat an identity check on restart')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-audit-repair-'))
  try {
    assert.equal(recordRescueRows(root, [row(1)], START), true)
    const candidate = selectRescueCandidates(loadRescueQueue(root).items, START).candidates[0]
    const reservation = reserveRescueCheck(root, '2026-08-22', candidate, RESCUE_SELECTOR_VERSION, START)
    assert.ok(reservation)
    assert.equal(completeRescueCheck(root, '2026-08-22', reservation.key, {
      status: 'verified', ticker: 'C1', companyName: 'Company 1 Inc', exchange: 'NYSE',
    }, baseConfig.auditMaxBytes, START), true)

    const dayPath = path.join(root, 'news-rescue', 'days', '2026-08-22.json')
    const day = JSON.parse(fs.readFileSync(dayPath, 'utf8'))
    day.checks[0].audit_pending = true
    fs.writeFileSync(dayPath, `${JSON.stringify(day)}\n`)

    assert.equal(updateRescueHealth(root, {
      audit_healthy: false,
      audit_error: 'The detailed second-look result could not be saved. Further checks are stopped.',
    }, START), true)
    const repaired = await runRescueShadowPass({ stateDir: root, config: baseConfig, coreReady: true, now: () => START })
    assert.equal(repaired.status, 'ready', 'pending audit repair runs before a stale unhealthy latch is honored')
    assert.equal(repaired.auditHealthy, true)
    const auditPath = path.join(root, 'news-rescue', 'ledger', '2026-08.ndjson')
    assert.equal(fs.readFileSync(auditPath, 'utf8').trim().split('\n').length, 1,
      'crash repair checks the saved byte offset and does not duplicate the audit row')

    const completeAudit = fs.readFileSync(auditPath)
    const tornDay = JSON.parse(fs.readFileSync(dayPath, 'utf8'))
    tornDay.checks[0].audit_pending = true
    fs.writeFileSync(dayPath, `${JSON.stringify(tornDay)}\n`)
    fs.writeFileSync(auditPath, completeAudit.subarray(0, Math.max(1, Math.floor(completeAudit.length / 2))))
    assert.equal(updateRescueHealth(root, {
      audit_healthy: false,
      audit_error: 'The detailed second-look result could not be saved. Further checks are stopped.',
    }, START), true)
    const tornRepaired = await runRescueShadowPass({
      stateDir: root, config: baseConfig, coreReady: true, now: () => START,
    })
    assert.equal(tornRepaired.status, 'ready')
    assert.deepEqual(fs.readFileSync(auditPath), completeAudit,
      'a no-newline torn suffix is truncated to its durable offset and the exact pending row is re-appended')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-queue-recovery-'))
  try {
    assert.equal(updateRescueHealth(root, {
      audit_healthy: false, audit_error: 'The app could not save the second-look queue.',
    }, START), true)
    assert.equal(recordRescueRows(root, [row(1)], START), true)
    assert.equal(readRescueHealth(root).audit_healthy, true,
      'a later successful queue write clears only the queue transient it proves recovered')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-overflow-retirement-'))
  try {
    assert.equal(updateRescueHealth(root, {
      audit_healthy: false,
      audit_error: RESCUE_QUEUE_OVERFLOW_ERROR,
      queue_overflow_at: new Date(START).toISOString(),
    }, START), true)
    const laterOverflow = START + 24 * 3_600_000
    assert.equal(updateRescueHealth(root, {
      audit_healthy: false,
      audit_error: RESCUE_QUEUE_OVERFLOW_ERROR,
      queue_overflow_at: new Date(laterOverflow).toISOString(),
    }, laterOverflow), true)
    const beforeRetirement = START + 36 * 3_600_000 + 6 * 60_000
    const stillActive = withInitialRescueDecision({
      ...row(1), ts: new Date(beforeRetirement).toISOString(), found_at: new Date(beforeRetirement).toISOString(),
    })
    assert.equal(recordRescueRows(root, [stillActive], beforeRetirement), true)
    assert.equal(readRescueHealth(root).audit_healthy, false,
      'a later omitted batch extends retirement beyond the first overflow window')

    const afterRetirement = laterOverflow + 36 * 3_600_000 + 6 * 60_000
    const rebuilt = withInitialRescueDecision({
      ...row(1), ts: new Date(afterRetirement).toISOString(), found_at: new Date(afterRetirement).toISOString(),
    })
    assert.equal(recordRescueRows(root, [rebuilt], afterRetirement), true)
    assert.equal(readRescueHealth(root).audit_healthy, true,
      'a complete bounded rewrite clears the overflow only after every omitted row has aged out')
    assert.equal(readRescueHealth(root).queue_overflow_at, null)
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-queue-omitted-batch-'))
  const rename = fs.renameSync
  try {
    assert.equal(recordRescueRows(root, [row(1)], START), true)
    let failed = false
    ;(fs as any).renameSync = (from: fs.PathLike, to: fs.PathLike) => {
      if (!failed && String(to).endsWith('/news-rescue/queue.json')) {
        failed = true
        throw new Error('injected queue replace failure')
      }
      return rename(from, to)
    }
    assert.equal(recordRescueRows(root, [row(2)], START), false)
    ;(fs as any).renameSync = rename
    assert.equal(recordRescueRows(root, [row(3)], START), true)
    assert.deepEqual(new Set(loadRescueQueue(root).items.map((item) => item.event_id)),
      new Set(['EVT-1', 'EVT-2', 'EVT-3']),
      'a later successful queue write restores the exact batch retained before the failed replacement')
    assert.equal(readRescueHealth(root).audit_healthy, true)
  } finally {
    ;(fs as any).renameSync = rename
    fs.rmSync(root, { recursive: true, force: true })
  }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-pending-closes-admission-'))
  const rename = fs.renameSync
  try {
    invalidateSymbolCache()
    assert.equal(recordRescueRows(root, [row(1)], START), true)
    let queueFailed = false
    ;(fs as any).renameSync = (from: fs.PathLike, to: fs.PathLike) => {
      if (!queueFailed && String(to).endsWith('/news-rescue/queue.json')) {
        queueFailed = true
        throw new Error('injected queue replacement failure')
      }
      if (String(to).endsWith('/news-rescue/health.json')) throw new Error('injected health write failure')
      return rename(from, to)
    }
    assert.equal(recordRescueRows(root, [row(2)], START), false)
    ;(fs as any).renameSync = rename

    let calls = 0
    const fetchImpl = (async (url: string) => { calls++; return responseForUrl(url) }) as any
    const blocked = await runRescueShadowPass({
      stateDir: root, config: baseConfig, coreReady: true, fetchImpl, now: () => START,
    })
    assert.equal(blocked.status, 'audit_unavailable')
    assert.equal(blocked.candidatesFound, null)
    assert.equal(calls, 0,
      'a durable uncommitted batch closes admission even when the accompanying health write failed')
  } finally {
    ;(fs as any).renameSync = rename
    fs.rmSync(root, { recursive: true, force: true })
  }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-reservation-recovery-'))
  const rename = fs.renameSync
  try {
    invalidateSymbolCache()
    assert.equal(recordRescueRows(root, [row(1)], START), true)
    let failed = false
    ;(fs as any).renameSync = (from: fs.PathLike, to: fs.PathLike) => {
      if (!failed && String(to).endsWith('/news-rescue/days/2026-08-22.json')) {
        failed = true
        throw new Error('injected reservation failure')
      }
      return rename(from, to)
    }
    let calls = 0
    const fetchImpl = (async (url: string) => { calls++; return responseForUrl(url) }) as any
    const failedPass = await runRescueShadowPass({
      stateDir: root, config: { ...baseConfig, perCycle: 1 }, coreReady: true, fetchImpl, now: () => START,
    })
    assert.equal(failedPass.status, 'audit_unavailable')
    assert.equal(calls, 0, 'a failed reservation never crosses the network boundary')
    ;(fs as any).renameSync = rename
    const recovered = await runRescueShadowPass({
      stateDir: root, config: { ...baseConfig, perCycle: 1 }, coreReady: true, fetchImpl, now: () => START,
    })
    assert.equal(recovered.status, 'ready')
    assert.equal(calls, 1, 'a proven day-ledger write clears only the transient reservation error')
  } finally {
    ;(fs as any).renameSync = rename
    fs.rmSync(root, { recursive: true, force: true })
  }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-malformed-queue-'))
  try {
    const dir = path.join(root, 'news-rescue')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, 'queue.json'), `${JSON.stringify({
      v: 1, updated_at: new Date(START).toISOString(),
      items: [{ kind: 'item', event_id: 'EVT-bad-shape', companies: {} }],
    })}\n`)
    assert.equal(loadRescueQueue(root).available, false,
      'a JSON-valid row with selector-unsafe shapes closes the durable queue instead of throwing later')
    fs.writeFileSync(path.join(dir, 'queue.json'), `${JSON.stringify({
      v: 1, updated_at: new Date(START).toISOString(), coverage_started_at: new Date(START).toISOString(),
      incomplete_since: 'not-a-clock', items: [row(1)],
    })}\n`)
    assert.equal(loadRescueQueue(root).available, false,
      'an invalid incomplete-window clock cannot reopen queue admission')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-malformed-day-'))
  try {
    const dir = path.join(root, 'news-rescue', 'days')
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(path.join(dir, '2026-08-22.json'), `${JSON.stringify({
      v: 1, date: '2026-08-22', checks: [null],
    })}\n`)
    assert.equal(loadRescueDay(root, '2026-08-22').available, false)
    const diagnostic = getRescueDiagnostics(root, baseConfig, START)
    assert.equal(diagnostic.status, 'audit_unavailable',
      'a malformed durable check closes diagnostics instead of throwing')
    assert.equal(diagnostic.identityChecks, null)
    assert.equal(diagnostic.candidatesFound, null)
    assert.equal(diagnostic.reconciliation, null, 'unreadable authority is unknown, never empty activity')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-incomplete-completed-day-'))
  try {
    const candidate = selectRescueCandidates([row(1)], START).candidates[0]
    assert.ok(reserveRescueCheck(root, '2026-08-22', candidate, RESCUE_SELECTOR_VERSION, START))
    const file = path.join(root, 'news-rescue', 'days', '2026-08-22.json')
    const day = JSON.parse(fs.readFileSync(file, 'utf8'))
    day.checks[0].identity_status = 'verified'
    fs.writeFileSync(file, `${JSON.stringify(day)}\n`)
    assert.equal(loadRescueDay(root, '2026-08-22').available, false,
      'a completed phase marker without its reason, audit offset, timestamp, and venue is corrupt')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-full-reconciliation-'))
  try {
    const social = withInitialRescueDecision({ ...row(2), via: 'reddit', source_tier: 'social' })
    const routine = withInitialRescueDecision({
      ...row(3), headline: 'Company 3 Ltd - Board Meeting Intimation for quarterly results',
      source_tier: 'primary_filing', event_types: ['earnings_revenue_margin'],
    })
    const noSignal = withInitialRescueDecision({
      ...row(4), event_types: [], rank_factors: { ...row(4).rank_factors!, quantified: 0 },
    })
    const inboxed = withInitialRescueDecision({ ...row(5), inboxed: true })
    const outside = withInitialRescueDecision({ ...row(6), triage_score: 45 })
    assert.equal(recordRescueRows(root, [row(1), social, routine, noSignal, inboxed, outside], START), true)
    const saved = loadRescueQueue(root)
    assert.equal(saved.items.length, 6, 'terminal scored rows remain in the rolling audit authority')
    const reconciled = getRescueDiagnostics(root, baseConfig, START).reconciliation
    assert.equal(reconciled.total, 6)
    assert.equal(reconciled.inboxed, 1)
    assert.equal(reconciled.outside_score, 1)
    assert.equal(reconciled.social, 1)
    assert.equal(reconciled.routine_filing, 1)
    assert.equal(reconciled.no_signal, 1)
    assert.equal(reconciled.candidates, 1)
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-cluster-representative-'))
  try {
    invalidateSymbolCache()
    assert.equal(recordRescueRows(root, [row(1)], START), true)
    let calls = 0
    const fetchImpl = (async (url: string) => { calls++; return responseForUrl(url) }) as any
    const first = await runRescueShadowPass({
      stateDir: root, config: { ...baseConfig, perCycle: 1 }, coreReady: true, fetchImpl, now: () => START,
    })
    assert.equal(first.checkedThisCycle, 1)
    const betterCopy = withInitialRescueDecision({
      ...row(1), event_id: 'EVT-1-better', triage_score: 39,
      ts: '2026-08-22T00:02:00Z', found_at: '2026-08-22T00:02:00Z',
      url: 'https://ft.com/company-1-better', domain: 'ft.com', source_name: 'Financial Times',
    })
    const later = START + 3 * 60_000
    assert.equal(recordRescueRows(root, [betterCopy], later), true)
    const second = await runRescueShadowPass({
      stateDir: root, config: { ...baseConfig, perCycle: 1 }, coreReady: true, fetchImpl, now: () => later,
    })
    assert.equal(second.checkedThisCycle, 0,
      'a better representative reuses the check on its now-supporting cluster member')
    assert.equal(calls, 1)
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-stable-story-dedup-'))
  try {
    invalidateSymbolCache()
    const otherFamily = withInitialRescueDecision({
      ...row(1), event_id: 'EVT-1-product-copy',
      headline: 'Company 1 launches a $20 million product contract',
      url: 'https://ft.com/company-1-product-copy', domain: 'ft.com', source_name: 'Financial Times',
      event_types: ['product'], dedup_group: 'EVT-1',
    })
    assert.equal(recordRescueRows(root, [row(1), otherFamily], START), true)
    assert.equal(selectRescueCandidates(loadRescueQueue(root).items, START).candidates.length, 2,
      'the selector keeps separately labelled event families auditable')
    let calls = 0
    const fetchImpl = (async (url: string) => { calls++; return responseForUrl(url) }) as any
    const result = await runRescueShadowPass({
      stateDir: root, config: baseConfig, coreReady: true, fetchImpl, now: () => START,
    })
    assert.equal(result.candidatesFound, 1, 'one stable company/story pair is one review candidate')
    assert.equal(result.checkedThisCycle, 1)
    assert.equal(calls, 1, 'the same stable story cannot be checked twice in one pass')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-aged-representative-'))
  try {
    invalidateSymbolCache()
    assert.equal(recordRescueRows(root, [row(1)], START), true)
    let calls = 0
    const fetchImpl = (async (url: string) => { calls++; return responseForUrl(url) }) as any
    const first = await runRescueShadowPass({
      stateDir: root, config: { ...baseConfig, perCycle: 1 }, coreReady: true, fetchImpl, now: () => START,
    })
    assert.equal(first.checkedThisCycle, 1)

    const later = START + 37 * 3_600_000
    const replacement = withInitialRescueDecision({
      ...row(1), event_id: 'EVT-1-new-representative',
      ts: new Date(later - 60_000).toISOString(), found_at: new Date(later - 60_000).toISOString(),
      url: 'https://ft.com/company-1-follow-up', domain: 'ft.com', source_name: 'Financial Times',
      dedup_group: 'EVT-1',
    })
    assert.equal(recordRescueRows(root, [replacement], later), true)
    assert.deepEqual(loadRescueQueue(root).items.map((item) => item.event_id), ['EVT-1-new-representative'],
      'the original representative has aged out of the rolling queue')
    const second = await runRescueShadowPass({
      stateDir: root, config: { ...baseConfig, perCycle: 1 }, coreReady: true, fetchImpl, now: () => later,
    })
    assert.equal(second.checkedThisCycle, 0,
      'the completed review follows the stable story cluster after its original event id ages out')
    assert.equal(calls, 1)
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-retry-exhausted-'))
  try {
    invalidateSymbolCache()
    assert.equal(recordRescueRows(root, [row(1)], START), true)
    const unavailable = (async () => ({ ok: false, status: 503, json: async () => ({}) })) as any
    await runRescueShadowPass({
      stateDir: root, config: { ...baseConfig, perCycle: 1 }, coreReady: true,
      fetchImpl: unavailable, now: () => START,
    })
    const cooling = getRescueDiagnostics(root, baseConfig, START + 10 * 60_000)
    assert.equal(cooling.retryCooling, 1)
    assert.equal(cooling.queuedForLater, 0,
      'a retry delay is not mislabeled as waiting for a paced slot')
    assert.equal(cooling.capacityMisses, 0)
    const later = START + 31 * 60_000
    const exhausted = await runRescueShadowPass({
      stateDir: root, config: { ...baseConfig, perCycle: 1 }, coreReady: true,
      fetchImpl: unavailable, now: () => later,
    })
    assert.equal(exhausted.retryExhausted, 1)
    assert.equal(exhausted.queuedForLater, 0, 'two failed attempts are not described as awaiting a paced slot')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-midnight-'))
  const beforeMidnight = Date.parse('2026-08-22T23:59:00Z')
  const afterMidnight = Date.parse('2026-08-23T00:01:00Z')
  try {
    invalidateSymbolCache()
    const lateRow = withInitialRescueDecision({
      ...row(1), ts: '2026-08-22T23:58:00Z', found_at: '2026-08-22T23:58:00Z',
    })
    assert.equal(recordRescueRows(root, [lateRow], beforeMidnight), true)
    const candidate = selectRescueCandidates(loadRescueQueue(root).items, beforeMidnight).candidates[0]
    assert.ok(candidate)
    assert.ok(reserveRescueCheck(root, '2026-08-22', candidate, RESCUE_SELECTOR_VERSION, beforeMidnight))
    let calls = 0
    const fetchImpl = (async (url: string) => { calls++; return responseForUrl(url) }) as any
    const restarted = await runRescueShadowPass({ stateDir: root, config: baseConfig, coreReady: true, fetchImpl, now: () => afterMidnight })
    assert.equal(restarted.checkedThisCycle, 0)
    assert.equal(calls, 0, 'a UTC date rollover cannot repeat a reserved review after restart')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-live-midnight-'))
  const beforeMidnight = Date.parse('2026-08-22T23:59:59Z')
  const afterMidnight = Date.parse('2026-08-23T00:00:01Z')
  let clock = beforeMidnight
  try {
    invalidateSymbolCache()
    const lateRows = [row(1), row(2)].map((item, index) => withInitialRescueDecision({
      ...item, ts: `2026-08-22T23:59:5${index}Z`, found_at: `2026-08-22T23:59:5${index}Z`,
    }))
    assert.equal(recordRescueRows(root, lateRows, beforeMidnight), true)
    let calls = 0
    const fetchImpl = (async (url: string) => {
      calls++
      clock = afterMidnight
      return responseForUrl(url)
    }) as any
    const result = await runRescueShadowPass({ stateDir: root, config: baseConfig, coreReady: true, fetchImpl, now: () => clock })
    assert.equal(calls, 1, 'a pass stops before reserving another check after UTC midnight')
    assert.equal(result.checkedThisCycle, 1)
    assert.equal(result.identityChecks, 1, 'the crossing pass reports the day ledger it actually charged')
    assert.equal(loadRescueDay(root, '2026-08-22').ledger.checks.length, 1)
    assert.equal(loadRescueDay(root, '2026-08-23').ledger.checks.length, 0,
      'the new UTC day receives no hidden reservation from the prior pass')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-midnight-attempt-'))
  const beforeMidnight = Date.parse('2026-08-22T23:30:00Z')
  const afterMidnight = Date.parse('2026-08-23T00:01:00Z')
  try {
    const candidate = selectRescueCandidates([withInitialRescueDecision({
      ...row(1), ts: '2026-08-22T23:29:00Z', found_at: '2026-08-22T23:29:00Z',
    })], beforeMidnight).candidates[0]
    const first = reserveRescueCheck(root, '2026-08-22', candidate, RESCUE_SELECTOR_VERSION, beforeMidnight)
    assert.ok(first)
    assert.equal(completeRescueCheck(root, '2026-08-22', first.key, {
      status: 'directory_unavailable',
    }, baseConfig.auditMaxBytes, beforeMidnight), true)
    const second = reserveRescueCheck(root, '2026-08-23', candidate, RESCUE_SELECTOR_VERSION, afterMidnight)
    assert.ok(second)
    assert.equal(second.attempt, 2,
      'the saved attempt number uses the same cross-day history that enforces the retry limit')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-name-cap-'))
  try {
    const rows = [row(100, true), row(101, true), row(1)]
    assert.equal(recordRescueRows(root, rows, START), true)
    const selection = selectRescueCandidates(loadRescueQueue(root).items, START)
    const firstName = selection.candidates.find((candidate) => candidate.pool === 'name')
    assert.ok(firstName)
    assert.ok(reserveRescueCheck(root, '2026-08-22', firstName, RESCUE_SELECTOR_VERSION, START))
    const diagnostic = getRescueDiagnostics(root, { ...baseConfig, nameDailyCap: 1 }, START)
    assert.equal(diagnostic.capacityMisses, 1, 'the exhausted name-only daily cap is a capacity miss')
    assert.equal(diagnostic.queuedForLater, 1, 'an eligible ticker candidate can still await a paced slot')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

{
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-core-'))
  try {
    invalidateSymbolCache()
    assert.equal(recordRescueRows(root, [row(1)], START), true)
    let calls = 0
    const fetchImpl = (async (url: string) => { calls++; return responseForUrl(url) }) as any
    const paused = await runRescueShadowPass({ stateDir: root, config: baseConfig, coreReady: false, fetchImpl, now: () => START })
    assert.equal(paused.status, 'paused_core_work')
    assert.equal(calls, 0, 'normal queued work always wins')
    assert.equal(getRescueDiagnostics(root, { ...baseConfig, mode: 'off' }, START).status, 'disabled')
    const humanLedgerPaused = await runRescueShadowPass({
      stateDir: root, config: baseConfig, coreReady: true, humanActionsReady: false, fetchImpl, now: () => START,
    })
    assert.equal(humanLedgerPaused.status, 'audit_unavailable')
    assert.match(humanLedgerPaused.reason, /dismissals and manual blocks/i,
      'a damaged human-action authority is not mislabeled as ordinary queued work')
    assert.equal(calls, 0)
    const ideasPaused = await runRescueShadowPass({
      stateDir: root, config: baseConfig, coreReady: true, normalIdeasReady: false, fetchImpl, now: () => START,
    })
    assert.equal(ideasPaused.status, 'paused_core_work')
    assert.equal(calls, 0, 'unfinished normal Ideas work always wins over the second look')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

console.log('rescue shadow pacing, restart, outage, audit, and core-priority checks passed')
