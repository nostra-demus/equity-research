// The deferred backlog cap is the canonical WORK window, not a data-loss boundary. Excess source rows live
// in a separate durable overflow and replay on later standalone cycles. This file locks two properties:
//   1. crossing the work cap still makes forward progress, existing backlog goes first, and the suffix is
//      durable rather than dropped;
//   2. every file that owns retry work is written ATOMICALLY — a mid-write failure (e.g. ENOSPC during
//      a long outage, exactly when the backlog is largest) keeps the last-good backlog instead of truncating
//      it to nothing.
// It sets a TINY DEFERRED_CAP before importing runCycle (the cap is frozen at import), so a handful of items
// overruns it deterministically.
// Run: npx tsx test/loss-cap.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
process.env.NEWS_DEFERRED_CAP = '3' // must be set BEFORE runCycle loads (DEFERRED_CAP is frozen at import)
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { resetCooldownMemory, resetSharedLimiters } from '../src/news/triage/budget'
import type { NewsItem } from '../src/news/types'
// DYNAMIC import: static `import` statements are hoisted ABOVE the process.env line above, so importing
// runCycle statically would freeze DEFERRED_CAP at the real default before the override lands. Import it
// after the env is set. (budget is safe to import statically — it never reads NEWS_DEFERRED_CAP.)
const { runIngestCycle, loadDeferred, saveDeferred, DEFERRED_CAP } = await import('../src/news/runCycle')
const { readFeed } = await import('../src/news/feed')

let passed = 0
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

function res(body: any, status = 200): any {
  const text = typeof body === 'string' ? body : JSON.stringify(body)
  return { ok: status >= 200 && status < 300, status, text: async () => text, json: async () => JSON.parse(text) }
}
const noSleep = async () => {}
const tmp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'loss-'))

// Exact pre-v2 behavior: both canonical and pending are inspected, and either non-array makes the old
// worker pause before fetch/scoring. New sidecars are intentionally invisible to this compatibility probe.
function legacyArrayOnlyWorkerCanRead(stateDir: string): boolean {
  for (const name of ['news-deferred.json', 'news-deferred-pending.json']) {
    try {
      if (!Array.isArray(JSON.parse(fs.readFileSync(path.join(stateDir, name), 'utf8')))) return false
    } catch (error: any) {
      if (error?.code === 'ENOENT') continue
      return false
    }
  }
  return true
}

await check('the env override freezes into DEFERRED_CAP at import', () => {
  assert.equal(DEFERRED_CAP, 3)
})

await check('overrunning the work cap processes existing backlog first and durably replays every fresh suffix row', async () => {
  resetSharedLimiters()
  resetCooldownMemory()
  const state = tmp()
  const root = tmp()
  const oldRows = Array.from({ length: 3 }, (_, i) => ({
    event_id: `EVT-existing-${i}`, headline: `Existing backlog rate decision row number ${i}`,
    url: `https://reuters.com/existing-${i}`, domain: 'reuters.com', source_name: 'Reuters', region: 'GLOBAL',
    input_nature: 'news_headline', found_at: '2026-06-12T08:00:00Z', deferred_at: '2026-06-12T08:01:00Z', dedup_status: 'new',
  })) as NewsItem[]
  assert.equal(saveDeferred(state, oldRows), true)
  const arts = Array.from({ length: 3 }, (_, i) => ({ url: `https://reuters.com/fresh-${i}`, title: `Fresh RBI rate decision row number ${i} with fifty basis points`, domain: 'reuters.com', seendate: '20260612T090000Z' }))
  let gdeltCalls = 0
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res({
      choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ items: Array.from({ length: 3 }, (_, i) => ({
        i, relevance: 'material', materiality_pre_score: 85, event_types: ['macro_sector'],
        issuer_linkage: 'macro', why: 'The rate decision changes funding costs.', companies: [], size_bucket: 'unknown',
      })) }) } }],
      usage: { total_tokens: 100 },
    })
    if (u.includes('gdelt')) return res({ articles: gdeltCalls++ === 0 ? arts : [] })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false, overflowProviders: [], geminiEnabled: false, geminiApiKey: '', anthropicFallbackEnabled: false } as any
  const first = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now: () => new Date('2026-06-12T09:30:00Z') })

  assert.equal(first.picked, 3, `a cap-crossing standalone fetch still scans its admitted prefix: ${JSON.stringify(first)}`)
  assert.equal(first.backlog, 3, 'the fresh suffix remains durably queued')
  assert.equal(first.dropped_at_cap, undefined, 'durable overflow is not reported as data loss')
  assert.deepEqual(readFeed(root, 1, { now: () => new Date('2026-06-12T09:31:00Z') }).items.map((item) => item.url).sort(), oldRows.map((item) => item.url).sort(), 'existing backlog owns the first work window')
  assert.deepEqual(loadDeferred(state).map((item) => item.url).sort(), arts.map((item) => item.url).sort(), 'every non-RSS fresh suffix row survived the source handoff')
  assert.ok(fs.existsSync(path.join(state, 'news-input-overflow.json')), 'the excess source-neutral authority remains until replay')

  const second = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now: () => new Date('2026-06-12T09:35:00Z') })
  assert.equal(second.picked, 3, 'the next standalone fetch replays and scans the saved suffix')
  assert.equal(second.backlog, 0)
  assert.equal(loadDeferred(state).length, 0)
  assert.equal(fs.existsSync(path.join(state, 'news-input-overflow.json')), false, 'overflow is durably removed only after its suffix is admitted')
})

await check('every rolling handoff crash boundary pauses an array-only worker and preserves the full queue for current code', async () => {
  const boundaries = [
    { name: 'after full pending barrier', fail: 'canonical' as const },
    { name: 'after canonical active window', fail: 'overflow' as const },
    { name: 'after overflow suffix', fail: 'barrier-remove' as const },
  ]
  for (const boundary of boundaries) {
    resetSharedLimiters()
    resetCooldownMemory()
    const state = tmp()
    const root = tmp()
    const oldRows = Array.from({ length: 3 }, (_, i) => ({
      event_id: `EVT-${boundary.fail}-${i}`, headline: `Existing rolling boundary row ${i} for ${boundary.name}`,
      url: `https://reuters.com/${boundary.fail}-existing-${i}`, domain: 'reuters.com', source_name: 'Reuters', region: 'GLOBAL',
      input_nature: 'news_headline', found_at: '2026-06-12T08:00:00Z', deferred_at: '2026-06-12T08:01:00Z', dedup_status: 'new',
    })) as NewsItem[]
    assert.equal(saveDeferred(state, oldRows), true)
    const arts = Array.from({ length: 2 }, (_, i) => ({
      url: `https://reuters.com/${boundary.fail}-fresh-${i}`,
      title: `Fresh source row ${i} must survive ${boundary.name}`,
      domain: 'reuters.com', seendate: '20260612T090000Z',
    }))
    let providerCalls = 0
    const fetchFn = (async (url: string) => {
      const u = String(url)
      if (u.includes('groq')) { providerCalls++; return res('must not run', 503) }
      if (u.includes('gdelt')) return res({ articles: arts })
      return res({ articles: [] })
    }) as unknown as typeof fetch
    const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false, overflowProviders: [], geminiEnabled: false, geminiApiKey: '', anthropicFallbackEnabled: false } as any
    const origRename = fs.renameSync
    const origRm = fs.rmSync
    ;(fs as any).renameSync = (from: string, to: string) => {
      if (boundary.fail === 'canonical' && String(to) === path.join(state, 'news-deferred.json')) throw new Error('simulated crash before canonical rename')
      if (boundary.fail === 'overflow' && String(to) === path.join(state, 'news-input-overflow.json')) throw new Error('simulated crash before overflow rename')
      return (origRename as any)(from, to)
    }
    ;(fs as any).rmSync = (target: string, options?: any) => {
      if (boundary.fail === 'barrier-remove' && String(target) === path.join(state, 'news-deferred-pending.json')) throw new Error('simulated crash before barrier removal')
      return (origRm as any)(target, options)
    }
    let summary: any
    try {
      summary = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now: () => new Date('2026-06-12T09:30:00Z') })
    } finally {
      ;(fs as any).renameSync = origRename
      ;(fs as any).rmSync = origRm
    }

    assert.equal(providerCalls, 0, `${boundary.name}: source acknowledgement/provider work stays behind the completed handoff`)
    assert.equal(summary.defer_reason, 'storage-emergency', `${boundary.name}: incomplete transition fails closed`)
    assert.equal(legacyArrayOnlyWorkerCanRead(state), false, `${boundary.name}: v2 pending/canonical bytes force the rollback worker to pause`)
    const expectedUrls = [...oldRows.map((item) => item.url), ...arts.map((item) => item.url)].sort()
    assert.deepEqual(loadDeferred(state).map((item) => item.url).sort(), expectedUrls, `${boundary.name}: current reader retains every resident and freshly fetched row`)
  }
})

await check('a final overflow read EIO reports storage emergency and a known backlog lower bound, never a false zero', async () => {
  resetSharedLimiters()
  resetCooldownMemory()
  const state = tmp()
  const root = tmp()
  const oldRows = Array.from({ length: 3 }, (_, i) => ({
    event_id: `EVT-final-read-${i}`, headline: `Existing final read backlog row number ${i}`,
    url: `https://reuters.com/final-read-${i}`, domain: 'reuters.com', source_name: 'Reuters', region: 'GLOBAL',
    input_nature: 'news_headline', found_at: '2026-06-12T08:00:00Z', deferred_at: '2026-06-12T08:01:00Z', dedup_status: 'new',
  })) as NewsItem[]
  assert.equal(saveDeferred(state, oldRows), true)
  const arts = Array.from({ length: 2 }, (_, i) => ({
    url: `https://reuters.com/final-read-fresh-${i}`,
    title: `Fresh durable overflow row ${i} survives a final storage read fault`,
    domain: 'reuters.com', seendate: '20260612T090000Z',
  }))
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res({
      choices: [{ finish_reason: 'stop', message: { content: JSON.stringify({ items: Array.from({ length: 3 }, (_, i) => ({
        i, relevance: 'material', materiality_pre_score: 85, event_types: ['macro_sector'],
        issuer_linkage: 'macro', why: 'This decision has a direct market impact.', companies: [], size_bucket: 'unknown',
      })) }) } }],
      usage: { total_tokens: 100 },
    })
    if (u.includes('gdelt')) return res({ articles: arts })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false, overflowProviders: [], geminiEnabled: false, geminiApiKey: '', anthropicFallbackEnabled: false } as any
  const origRead = fs.readFileSync
  let overflowReads = 0
  ;(fs as any).readFileSync = (...args: any[]) => {
    if (String(args[0]).endsWith('news-input-overflow.json') && ++overflowReads === 2) {
      throw Object.assign(new Error('EIO: final overflow read unavailable'), { code: 'EIO' })
    }
    return (origRead as any)(...args)
  }
  let summary: any
  try {
    summary = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now: () => new Date('2026-06-12T09:30:00Z') })
  } finally {
    ;(fs as any).readFileSync = origRead
  }

  assert.equal(overflowReads, 2, 'the injected fault lands on the final authority verification')
  assert.equal(summary.defer_reason, 'storage-emergency')
  assert.equal(summary.deferred_read_failed, true, 'an unreadable final authority is distinct from a quiet queue')
  assert.equal(summary.backlog, arts.length, 'the untouched durable suffix is reported as a known lower bound, never zero')
  assert.match(summary.note || '', /backlog depth is unavailable.*known lower bound: 2/i)
  assert.deepEqual(loadDeferred(state).map((item) => item.url).sort(), arts.map((item) => item.url).sort(), 'restoring reads proves the overflow suffix itself was never lost')
})

await check('an unavailable overflow authority fails closed before any provider call and preserves existing backlog', async () => {
  resetSharedLimiters()
  resetCooldownMemory()
  const state = tmp()
  const root = tmp()
  const oldRows = Array.from({ length: 3 }, (_, i) => ({
    event_id: `EVT-overflow-fail-${i}`, headline: `Existing overflow failure row number ${i}`,
    url: `https://reuters.com/overflow-fail-${i}`, domain: 'reuters.com', source_name: 'Reuters', region: 'GLOBAL',
    input_nature: 'news_headline', found_at: '2026-06-12T08:00:00Z', deferred_at: '2026-06-12T08:01:00Z', dedup_status: 'new',
  })) as NewsItem[]
  assert.equal(saveDeferred(state, oldRows), true)
  let providerCalls = 0
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) { providerCalls++; return res('must not run', 503) }
    if (u.includes('gdelt')) return res({ articles: [{
      url: 'https://reuters.com/new-overflow-row', title: 'New non RSS source row must be spooled before scoring',
      domain: 'reuters.com', seendate: '20260612T090000Z',
    }] })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false, overflowProviders: [], geminiEnabled: false, geminiApiKey: '', anthropicFallbackEnabled: false } as any
  const origRename = fs.renameSync
  ;(fs as any).renameSync = (from: string, to: string) => {
    if (String(to).endsWith('news-input-overflow.json')) throw new Error('ENOSPC: overflow unavailable')
    return (origRename as any)(from, to)
  }
  let summary: any
  try {
    summary = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now: () => new Date('2026-06-12T09:30:00Z') })
  } finally {
    ;(fs as any).renameSync = origRename
  }
  assert.equal(providerCalls, 0, 'no paid/free model call starts without a durable overflow authority')
  assert.equal(summary.defer_reason, 'storage-emergency')
  assert.equal(summary.deferred_write_failed, true)
  assert.equal(loadDeferred(state).length, oldRows.length + 1, 'the full pending barrier retains the old backlog and newly fetched row despite overflow failure')
  assert.ok(loadDeferred(state).some((item) => item.url === 'https://reuters.com/new-overflow-row'), 'the fresh non-RSS delivery is already durable before the failed suffix write')
})

await check('no loss when the backlog fits under the cap → dropped_at_cap is absent', async () => {
  resetSharedLimiters()
  resetCooldownMemory()
  const state = tmp()
  const root = tmp()
  const arts = Array.from({ length: 2 }, (_, i) => ({ url: `https://reuters.com/y${i}`, title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }))
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res('down', 503)
    if (u.includes('gdelt')) return res({ articles: arts })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false, overflowProviders: [], anthropicFallbackEnabled: false } as any
  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now: () => new Date('2026-06-12T09:30:00Z') })
  assert.equal(s.deferred, 2)
  assert.equal(s.backlog, 2)
  assert.equal(s.dropped_at_cap, undefined, 'no loss → the field is omitted, not 0-noise')
})

await check('saveDeferred is ATOMIC: a write failure keeps the last-good backlog (never truncates to empty) and logs it', () => {
  const state = tmp()
  const good = [{ event_id: 'a', headline: 'x' }, { event_id: 'b', headline: 'y' }] as unknown as NewsItem[]
  // finding 4 (Codex, PR #316): saveDeferred now RETURNS whether it persisted, so a caller can tell the
  // summary the backlog counts describe intent, not disk. Contract: true on a clean persist.
  assert.equal(saveDeferred(state, good), true, 'a clean persist returns true')
  assert.equal(loadDeferred(state).length, 2, 'round-trip: persisted then read back')

  // force the temp write to fail; the good file must survive intact, the error must be logged, no orphan .tmp
  const origWrite = fs.writeFileSync
  const logs: string[] = []
  ;(fs as any).writeFileSync = () => { throw new Error('ENOSPC: no space left on device') }
  let ret: boolean | undefined
  try {
    ret = saveDeferred(state, [{ event_id: 'c', headline: 'z' }] as unknown as NewsItem[], (m) => logs.push(m))
  } finally {
    ;(fs as any).writeFileSync = origWrite
  }
  assert.equal(ret, false, 'a failed write returns false (the signal the cycle summary surfaces as deferred_write_failed)')
  assert.equal(loadDeferred(state).length, 2, 'the last-good backlog is INTACT — not truncated to [] by the failed write')
  assert.ok(logs.some((m) => /saveDeferred failed/.test(m)), 'the write failure is logged, not swallowed')
  assert.ok(!fs.existsSync(path.join(state, 'news-deferred.json.tmp')), 'no orphan temp file left behind')
})

await check('a malformed backlog fails closed and runCycle preserves its exact bytes without fetching', async () => {
  resetSharedLimiters()
  resetCooldownMemory()
  const state = tmp()
  const root = tmp()
  const target = path.join(state, 'news-deferred.json')
  const corrupt = '{"event_id":"truncated"'
  fs.writeFileSync(target, corrupt)
  let calls = 0
  const summary = await runIngestCycle({
    repoRoot: root, stateDir: state,
    config: { groqApiKey: 'k', themesEnabled: false } as any,
    fetchFn: (async () => { calls++; return res({ articles: [] }) }) as unknown as typeof fetch,
    sleep: noSleep, now: () => new Date('2026-06-12T09:30:00Z'),
  })
  assert.equal(summary.deferred_read_failed, true)
  assert.equal(calls, 0, 'bad backlog authority stops before one-shot fetch/provider work')
  assert.equal(fs.readFileSync(target, 'utf8'), corrupt, 'corrupt authority is never overwritten as empty')
})

await check('finding 4: a cycle whose deferred write FAILS surfaces deferred_write_failed on the summary (counts describe intent, not disk)', async () => {
  resetSharedLimiters()
  resetCooldownMemory()
  const state = tmp()
  const root = tmp()
  // same overload shape as the cap test: Groq down, no fallback → the batch defers, so saveDeferred runs
  // with a non-empty list. We fail ONLY the deferred-file rename (surgical: the inbox rename still lands),
  // so the cycle completes but the backlog never reached disk — the summary must SAY so.
  const arts = Array.from({ length: 4 }, (_, i) => ({ url: `https://reuters.com/w${i}`, title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }))
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res('down', 503)
    if (u.includes('gdelt')) return res({ articles: arts })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false, overflowProviders: [], anthropicFallbackEnabled: false } as any
  const origRename = fs.renameSync
  ;(fs as any).renameSync = (from: string, to: string) => {
    if (String(to).includes('news-deferred.json')) throw new Error('ENOSPC: no space left on device')
    return (origRename as any)(from, to)
  }
  let s: any
  try {
    s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now: () => new Date('2026-06-12T09:30:00Z'), log: () => {} })
  } finally {
    ;(fs as any).renameSync = origRename
  }
  assert.equal(s.deferred_write_failed, true, 'the failed backlog write is surfaced on the summary, not hidden behind a "waiting" count')
  assert.ok((s.deferred || 0) > 0, 'the cycle really did try to defer items (so the write mattered)')
  assert.ok(loadDeferred(state).length > 0, 'the completed pending journal keeps newly fetched rows retryable')
  assert.ok(fs.existsSync(path.join(state, 'news-deferred-pending.json')), 'canonical rename failure leaves a durable pending journal')
})

console.log(`\n${passed} checks passed`)
