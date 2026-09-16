// Is the market feed alive? Judged from the files the engine can read, not from whether a timer says it ran.
// Run: npx tsx test/market-feed-health.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { marketFeedHealth, memoizeCloses, readRefresh, tradingDaysBetween } from '../src/market-feed-health'

let passed = 0
const fails: string[] = []
async function check(name: string, fn: () => void | Promise<void>) {
  try { await fn(); passed++; console.log(`  ok   ${name}`) }
  catch (e: any) { fails.push(name); console.log(`  FAIL ${name}\n       ${e?.message || e}`) }
}

const closes = (rows: Record<string, string[]>) => (symbol: string) =>
  (rows[symbol] ?? []).map((date) => ({ date, close: 1 }))
const noRefresh = () => null

await check('trading days skip the weekend, so a Friday close is not stale on Monday', () => {
  // 2026-09-11 is a Friday, 2026-09-14 the Monday after it.
  assert.equal(tradingDaysBetween('2026-09-11', '2026-09-14'), 1)
  assert.equal(tradingDaysBetween('2026-09-11', '2026-09-11'), 0)
  assert.equal(tradingDaysBetween('2026-09-11', '2026-09-18'), 5)
  assert.equal(tradingDaysBetween('2026-09-18', '2026-09-11'), null, 'a date before the close is not an age')
  assert.equal(tradingDaysBetween('nonsense', '2026-09-11'), null)
})

await check('a series whose newest close is a day or two back is healthy', async () => {
  const h = await marketFeedHealth(['SP500'], '2026-09-16', { closes: closes({ SP500: ['2026-09-14', '2026-09-15'] }), refresh: noRefresh })
  assert.equal(h.state, 'healthy')
  assert.deepEqual(h.series[0]!.lastClose, '2026-09-15')
  assert.match(h.detail, /SP500 to 2026-09-15/)
})

await check('a series that stops more than three trading days back is stale, and says where it stops', async () => {
  const h = await marketFeedHealth(['SP500'], '2026-09-16', { closes: closes({ SP500: ['2026-09-09'] }), refresh: noRefresh })
  assert.equal(h.state, 'stale')
  assert.equal(h.series[0]!.tradingDaysBehind, 5)
  assert.match(h.detail, /SP500 stops at 2026-09-09, 5 trading days back/)
})

await check('no history at all is missing, not merely stale — and it says the timer may never have run', async () => {
  const h = await marketFeedHealth(['SP500'], '2026-09-16', { closes: closes({}), refresh: noRefresh })
  assert.equal(h.state, 'missing')
  assert.equal(h.series[0]!.lastClose, null)
  assert.match(h.detail, /No price history at all for SP500/)
  assert.match(h.detail, /No refresh has reported itself yet/)
})

await check('the worst series decides the state, and every series is still named', async () => {
  const h = await marketFeedHealth(['SP500', 'DTB3'], '2026-09-16', {
    closes: closes({ SP500: ['2026-09-15'] }), refresh: noRefresh,
  })
  assert.equal(h.state, 'missing', 'one healthy series cannot cover for one that is absent')
  assert.deepEqual(h.series.map((s) => [s.symbol, s.state]), [['SP500', 'healthy'], ['DTB3', 'missing']])
})

await check('the refresher’s own last word explains a feed that is not current', async () => {
  const refresh = () => ({ at: '2026-09-10T07:10:04Z', outcome: 'skipped', detail: 'this machine is not the canonical pool writer, or the Drive projection is unavailable' })
  const h = await marketFeedHealth(['SP500'], '2026-09-16', { closes: closes({ SP500: ['2026-09-09'] }), refresh })
  assert.match(h.detail, /The last refresh skipped on 2026-09-10: this machine is not the canonical pool writer/)
  // A healthy feed needs no story.
  const ok = await marketFeedHealth(['SP500'], '2026-09-16', { closes: closes({ SP500: ['2026-09-15'] }), refresh })
  assert.doesNotMatch(ok.detail, /last refresh/)
})

await check('the breadcrumb is read from disk, and anything malformed is simply absent', async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'market-feed-status-'))
  const file = path.join(dir, 'market-feed.json')
  assert.equal(await readRefresh(file), null, 'nothing written yet')
  fs.writeFileSync(file, JSON.stringify({ at: '2026-09-16T07:10:04Z', outcome: 'ok', detail: 'SP500 — 2543 through 2026-09-15' }))
  assert.deepEqual(await readRefresh(file), { at: '2026-09-16T07:10:04Z', outcome: 'ok', detail: 'SP500 — 2543 through 2026-09-15' })
  fs.writeFileSync(file, '{ not json')
  assert.equal(await readRefresh(file), null)
  fs.writeFileSync(file, JSON.stringify({ at: 'whenever', outcome: 'ok' }))
  assert.equal(await readRefresh(file), null, 'a status with no usable time says nothing')
  fs.rmSync(dir, { recursive: true, force: true })
})

await check('asked with no injected reader at all, it answers rather than throws', async () => {
  // /api/health is the probe the cockpit uses to decide the engine is up. A health field that can throw
  // would take the whole endpoint down over a missing CSV, which is the opposite of the point.
  const h = await marketFeedHealth(['SP500'], '2026-09-16')
  assert.ok(['healthy', 'stale', 'missing'].includes(h.state))
  assert.equal(typeof h.detail, 'string')
})

await check('a future-dated close is excluded, not treated as the newest — and never reads as healthy by accident', async () => {
  // A row past `today` is invalid data (frameworks/MARKET_FEED.md: future observations are excluded from
  // every calculation), not evidence the feed is current. Before the fix, `tradingDaysBetween` returned
  // null for it and null age was mapped straight to 'healthy' — the exact opposite of "exclude it".
  const rows = closes({ SP500: ['2026-09-09', '2099-01-01'] })
  const h = await marketFeedHealth(['SP500'], '2026-09-16', { closes: rows, refresh: noRefresh })
  assert.equal(h.state, 'stale', 'the future row must be ignored in favour of the real newest close')
  assert.equal(h.series[0]!.lastClose, '2026-09-09')
  assert.equal(h.series[0]!.tradingDaysBehind, 5)

  // If EVERY row is future-dated there is no valid observation at all — that is 'missing', not 'healthy'.
  const onlyFuture = await marketFeedHealth(['SP500'], '2026-09-16', { closes: closes({ SP500: ['2099-01-01'] }), refresh: noRefresh })
  assert.equal(onlyFuture.state, 'missing')
  assert.equal(onlyFuture.series[0]!.lastClose, null)
})

await check('the real reader is cached across a burst of calls, so concurrent /api/health polls do not each reparse the feed', () => {
  let calls = 0
  const reader = (_s: string) => { calls++; return [{ date: '2026-09-15', close: 1 }] }
  let t = 1_000
  const cached = memoizeCloses(reader, 15_000, () => t)
  cached('SP500'); cached('SP500'); cached('SP500')
  assert.equal(calls, 1, 'three calls inside the TTL window should reparse the feed once, not three times')
  t += 15_001
  cached('SP500')
  assert.equal(calls, 2, 'a call after the TTL has elapsed should reparse again')
  // Different symbols never share a cache slot.
  cached('DTB3')
  assert.equal(calls, 3)
})

console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
