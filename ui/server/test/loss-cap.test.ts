// The deferred backlog cap is a LOSS BOUNDARY: items past DEFERRED_CAP are DROPPED, not deferred (their
// source window ages out and they are never re-fetchable). This file locks two properties of that boundary:
//   1. the loss is COUNTED (dropped_at_cap) and LOGGED — never silent, so "5,000 waiting · steady" can no
//      longer hide real data loss;
//   2. the file that holds the WHOLE backlog is written ATOMICALLY — a mid-write failure (e.g. ENOSPC during
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

await check('the env override freezes into DEFERRED_CAP at import', () => {
  assert.equal(DEFERRED_CAP, 3)
})

await check('overrunning the cap DROPS the tail — counted in dropped_at_cap + logged; invariant deferred = backlog + dropped_at_cap', async () => {
  resetSharedLimiters()
  resetCooldownMemory()
  const state = tmp()
  const root = tmp()
  // six distinct, on-list, material articles; Groq is down and no fallback → all six defer in one failed batch
  const arts = Array.from({ length: 6 }, (_, i) => ({ url: `https://reuters.com/x${i}`, title: 'RBI cuts repo rate 50 bps in surprise off-cycle move', domain: 'reuters.com', seendate: '20260612T090000Z' }))
  const fetchFn = (async (url: string) => {
    const u = String(url)
    if (u.includes('groq')) return res('down', 503)
    if (u.includes('gdelt')) return res({ articles: arts })
    return res({ articles: [] })
  }) as unknown as typeof fetch
  const logs: string[] = []
  const cfg = { groqApiKey: 'k', gdeltBaseUrl: 'https://gdelt.test/doc', groqBaseUrl: 'https://groq.test', groqRpm: 6000, gdeltLookbackMin: 40, rssEnabled: false, themesEnabled: false, overflowProviders: [], anthropicFallbackEnabled: false } as any
  const s = await runIngestCycle({ repoRoot: root, stateDir: state, config: cfg, fetchFn, sleep: noSleep, now: () => new Date('2026-06-12T09:30:00Z'), log: (m) => logs.push(m) })

  assert.equal(s.deferred, 6, 'all six deferred (the TRUE count, uncapped)')
  assert.equal(s.backlog, 3, 'only DEFERRED_CAP retained on disk')
  assert.equal(s.dropped_at_cap, 3, 'the three past the cap are counted as dropped, not hidden')
  assert.equal(s.deferred, (s.backlog || 0) + (s.dropped_at_cap || 0), 'invariant: deferred = backlog + dropped_at_cap')
  assert.ok(logs.some((m) => /LOSS: 3 /.test(m)), 'the loss is LOGGED, not silent')
  assert.match(s.note || '', /DROPPED past the 3-item cap/i, 'the cycle note names the loss honestly (not "clears when quotas reset")')
  assert.equal(loadDeferred(state).length, 3, 'exactly the cap-many highest-priority items persisted')
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
  saveDeferred(state, good)
  assert.equal(loadDeferred(state).length, 2, 'round-trip: persisted then read back')

  // force the temp write to fail; the good file must survive intact, the error must be logged, no orphan .tmp
  const origWrite = fs.writeFileSync
  const logs: string[] = []
  ;(fs as any).writeFileSync = () => { throw new Error('ENOSPC: no space left on device') }
  try {
    saveDeferred(state, [{ event_id: 'c', headline: 'z' }] as unknown as NewsItem[], (m) => logs.push(m))
  } finally {
    ;(fs as any).writeFileSync = origWrite
  }
  assert.equal(loadDeferred(state).length, 2, 'the last-good backlog is INTACT — not truncated to [] by the failed write')
  assert.ok(logs.some((m) => /saveDeferred failed/.test(m)), 'the write failure is logged, not swallowed')
  assert.ok(!fs.existsSync(path.join(state, 'news-deferred.json.tmp')), 'no orphan temp file left behind')
})

console.log(`\n${passed} checks passed`)
