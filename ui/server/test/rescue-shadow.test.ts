import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { RESCUE_SELECTOR_VERSION, selectRescueCandidates, withInitialRescueDecision } from '../src/news/rescue/selector'
import { getRescueDiagnostics, runRescueShadowPass, type RescueShadowConfig } from '../src/news/rescue/shadow'
import { runNormalIdeasThenSecondLook } from '../src/news/rescue/order'
import {
  completeRescueCheck, loadRescueDay, loadRescueQueue, readRescueHealth,
  recordRescueRows, reserveRescueCheck, updateRescueHealth,
} from '../src/news/rescue/store'
import { invalidateSymbolCache } from '../src/news/symbology'
import type { FeedItem } from '../src/news/types'

const START = Date.parse('2026-08-22T00:01:00Z')
const baseConfig: RescueShadowConfig = {
  mode: 'shadow', maxAgeHrs: 36, dailyChecks: 200, perCycle: 8,
  nameDailyCap: 40, paceFloorFraction: 0.04, auditMaxBytes: 15 * 1024 * 1024,
}

{
  const order: string[] = []
  await runNormalIdeasThenSecondLook({
    ideas: async () => { order.push('normal-start'); await Promise.resolve(); order.push('normal-finish') },
    secondLook: async () => { order.push('second-look') },
  })
  assert.deepEqual(order, ['normal-start', 'normal-finish', 'second-look'], 'normal Ideas always finishes first')
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
    }, dedup_status: 'new', inboxed: false,
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
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
}

console.log('rescue shadow pacing, restart, outage, audit, and core-priority checks passed')
