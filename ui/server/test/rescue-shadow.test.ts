import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { RESCUE_SELECTOR_VERSION, selectRescueCandidates, withInitialRescueDecision } from '../src/news/rescue/selector'
import { getRescueDiagnostics, runRescueShadowPass, type RescueShadowConfig } from '../src/news/rescue/shadow'
import { runNormalIdeasThenSecondLook } from '../src/news/rescue/order'
import {
  completeRescueCheck, flushPendingRescueAudit, loadRescueDay, loadRescueQueue, readRescueHealth,
  recordRescueRows, RESCUE_QUEUE_MAX_BYTES, RESCUE_QUEUE_MAX_ITEMS, reserveRescueCheck, rescueQueueEnabled,
  updateRescueHealth,
} from '../src/news/rescue/store'
import { invalidateSymbolCache } from '../src/news/symbology'
import type { FeedItem } from '../src/news/types'

const START = Date.parse('2026-08-22T00:01:00Z')
const baseConfig: RescueShadowConfig = {
  mode: 'shadow', maxAgeHrs: 36, dailyChecks: 200, perCycle: 8,
  nameDailyCap: 40, paceFloorFraction: 0.04, auditMaxBytes: 15 * 1024 * 1024,
}

assert.ok(RESCUE_QUEUE_MAX_ITEMS >= 60_000, 'the queue covers 36 hours at the 40,000-row daily feed cap')
assert.ok(RESCUE_QUEUE_MAX_BYTES >= 120_000_000, 'the byte guard covers the same maximum retention window')
assert.equal(rescueQueueEnabled('shadow'), true)
assert.equal(rescueQueueEnabled('off'), false, 'the explicit off switch disables rescue queue maintenance')

{
  const failedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-day-directory-eio-'))
  const unsupportedRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'rescue-shadow-day-directory-unsupported-'))
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
  } finally {
    ;(fs as any).openSync = open
    fs.rmSync(failedRoot, { recursive: true, force: true })
    fs.rmSync(unsupportedRoot, { recursive: true, force: true })
  }
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
  const directory = (async () => ({
    ok: true, status: 200, json: async () => ({ quotes: [
      { quoteType: 'EQUITY', symbol: 'C100', longname: 'Company 100 Inc', exchDisp: 'NYSE' },
      { quoteType: 'EQUITY', symbol: 'C100.AX', longname: 'Company 100 Corp', exchDisp: 'ASX' },
    ] }),
  })) as any
  try {
    invalidateSymbolCache()
    const noCountry = withInitialRescueDecision({
      ...row(100, true), companies: [{ name: 'Company 100', ticker: null, listing_country: null }],
    })
    assert.equal(recordRescueRows(ambiguousRoot, [noCountry], START), true)
    const ambiguous = await runRescueShadowPass({
      stateDir: ambiguousRoot, config: { ...baseConfig, perCycle: 1 }, coreReady: true, fetchImpl: directory, now: () => START,
    })
    assert.equal(ambiguous.identityUnresolved, 1,
      'two same-core issuers remain ambiguous when the saved item has no listing country')

    invalidateSymbolCache()
    assert.equal(recordRescueRows(countryRoot, [row(100, true)], START), true)
    const countryMatched = await runRescueShadowPass({
      stateDir: countryRoot, config: { ...baseConfig, perCycle: 1 }, coreReady: true, fetchImpl: directory, now: () => START,
    })
    assert.equal(countryMatched.verified, 1, 'a saved country may select exactly one compatible issuer listing')
    assert.equal(loadRescueDay(countryRoot, '2026-08-22').ledger.checks[0].exchange, 'NYSE')
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
    const candidate = selectRescueCandidates([row(1)], START).candidates[0]
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
