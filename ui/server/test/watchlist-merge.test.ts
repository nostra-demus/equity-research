// Watchlist merge + archive durability (src/watchlist.ts).
//
// The two properties worth pinning are the ones a naive implementation gets wrong:
//   - MEMBERSHIP survives a regenerated engine source. Archiving must mute the ASSERTION, so a sizing
//     file rewritten identically (which happens most days — the standing ledger is often byte-identical
//     to yesterday's) does not resurrect the row, while a genuinely CHANGED call does come back.
//   - IDENTITY is ticker AND currency. The live ledger repeats a ticker when two runs are standing
//     (UBER, 2026-08-16), and the same symbol trades in different currencies as different companies.
// Run: npx tsx test/watchlist-merge.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import {
  fingerprintEngineRow,
  makeListing,
  mergeWatchlist,
  readEngineWatch,
  type EngineWatchRow,
  type StandingCall,
  type WatchEntry,
} from '../src/watchlist'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn()
    passed++
    console.log('  ok ', name)
  } catch (e) {
    console.error('  FAIL', name)
    console.error('   ', e)
    process.exitCode = 1
  }
}

const TODAY = '2026-08-18'

function entry(over: Partial<WatchEntry> & { ticker: string; currency: string | null }): WatchEntry {
  const listing = makeListing({ ticker: over.ticker, currency: over.currency })
  return {
    schema_version: 'watchlist-entry/v1',
    entry_id: over.entry_id ?? `WL-20260818-${over.ticker.toLowerCase().padEnd(8, '0').slice(0, 8)}`,
    origin: over.origin ?? 'manual',
    listing,
    engine_ref: over.engine_ref ?? null,
    why: over.why ?? 'because',
    conviction: over.conviction ?? null,
    review_date: over.review_date ?? null,
    tags: over.tags ?? [],
    triggers: over.triggers ?? [],
    attachments: over.attachments ?? [],
    archive: over.archive ?? null,
    history: over.history ?? [],
    created_at: over.created_at ?? '2026-08-01T00:00:00Z',
    created_by: 'test',
    updated_at: '2026-08-01T00:00:00Z',
  }
}

const call = (over: Partial<StandingCall> & { ticker: string; run_root: string }): StandingCall => ({
  company: `${over.ticker} Inc`,
  currency: 'USD',
  basket: 'Watchlist',
  decision: 'Watchlist',
  decision_date: '2026-08-01',
  entry_price: 100,
  ...over,
})

const deco = (rows: { ticker: string; size_in_trigger?: string; next_review?: string }[]) => ({
  file: '2026-08-16_sizing.json',
  generated_at: '2026-08-16',
  byTicker: new Map(rows.map((r) => [r.ticker, [r]])),
})

// ---- membership ----

await check('a Selected basket holds a position, so it is not on watch', () => {
  const rows = readEngineWatch(
    [call({ ticker: 'AAA', run_root: 'analyses/AAA_2026-08-01', basket: 'Selected' }), call({ ticker: 'BBB', run_root: 'analyses/BBB_2026-08-01' })],
    deco([]),
  )
  assert.deepEqual(rows.map((r) => r.ticker ?? r.listing.ticker), ['BBB'])
})

await check('a Selected name the sizing book still lists IS on watch (the skill knows more than the basket)', () => {
  const rows = readEngineWatch(
    [call({ ticker: 'AAA', run_root: 'analyses/AAA_2026-08-01', basket: 'Selected' })],
    deco([{ ticker: 'AAA', size_in_trigger: 'no proven edge yet' }]),
  )
  assert.equal(rows.length, 1, 'the sizing book overrides the basket floor')
  assert.equal(rows[0].size_in_trigger, 'no proven edge yet')
})

await check('two standing runs for one ticker yield ONE row, not a silent drop or a duplicate', () => {
  const rows = readEngineWatch(
    [
      call({ ticker: 'UBER', run_root: 'analyses/UBER_2026-08-09', decision_date: '2026-08-09' }),
      call({ ticker: 'UBER', run_root: 'analyses/UBER_2026-08-06', decision_date: '2026-08-06' }),
    ],
    deco([{ ticker: 'UBER' }]),
  )
  assert.equal(rows.length, 1)
  assert.equal(rows[0].run_root, 'analyses/UBER_2026-08-09', 'the newest standing run wins')
})

await check('engine prose is carried verbatim and never parsed into a number', () => {
  const prose = 'Track at $190-200 for re-entry (>12% margin of safety on base fair value $210).'
  const rows = readEngineWatch([call({ ticker: 'AMZN', run_root: 'analyses/AMZN_2026-07-10' })], deco([{ ticker: 'AMZN', size_in_trigger: prose }]))
  assert.equal(rows[0].size_in_trigger, prose)
  assert.deepEqual(rows[0].listing.currency, 'USD')
})

// ---- identity ----

await check('same ticker, different currency stays TWO rows', () => {
  const eng: EngineWatchRow[] = readEngineWatch(
    [call({ ticker: 'HCG', run_root: 'analyses/HCG_2026-08-01', currency: 'INR' })],
    deco([{ ticker: 'HCG' }]),
  )
  const { rows } = mergeWatchlist({ entries: [entry({ ticker: 'HCG', currency: 'USD' })], engine: eng, today: TODAY })
  assert.equal(rows.length, 2, 'INR and USD listings are different securities')
  assert.deepEqual(rows.map((r) => r.origin).sort(), ['engine', 'manual'])
})

await check('same ticker AND currency merges into one row badged both', () => {
  const eng = readEngineWatch([call({ ticker: 'BG', run_root: 'analyses/BG_2026-08-01' })], deco([{ ticker: 'BG' }]))
  const { rows } = mergeWatchlist({ entries: [entry({ ticker: 'BG', currency: 'USD', why: 'crush margins' })], engine: eng, today: TODAY })
  assert.equal(rows.length, 1)
  assert.equal(rows[0].origin, 'both')
  assert.equal(rows[0].why, 'crush margins', 'the human half supplies the reason')
  assert.ok(rows[0].engine, 'the engine half is still attached')
})

// ---- archive durability: the core guarantee ----

const archivedEntry = (fp: string, scope: 'assertion' | 'listing' = 'assertion') =>
  entry({
    ticker: 'AMZN',
    currency: 'USD',
    archive: { at: '2026-08-17T10:00:00Z', by: 'me', reason: 'too expensive', muted_fingerprint: fp, mute_scope: scope },
  })

await check('an identical regenerated engine list does NOT resurrect an archived row', () => {
  const mk = () => readEngineWatch([call({ ticker: 'AMZN', run_root: 'analyses/AMZN_2026-07-10' })], deco([{ ticker: 'AMZN', size_in_trigger: 'track at $190-200' }]))
  const first = mk()
  const e = archivedEntry(first[0].fingerprint)
  // regenerate the engine source from scratch — a different object, identical content
  const second = mk()
  const { rows, archived } = mergeWatchlist({ entries: [e], engine: second, today: TODAY })
  assert.equal(rows.length, 0, 'still hidden')
  assert.equal(archived.length, 1)
  assert.equal(archived[0].resurfaced, false)
})

await check('a REWORDED engine trigger brings the row back, badged', () => {
  const before = readEngineWatch([call({ ticker: 'AMZN', run_root: 'analyses/AMZN_2026-07-10' })], deco([{ ticker: 'AMZN', size_in_trigger: 'track at $190-200' }]))
  const e = archivedEntry(before[0].fingerprint)
  const after = readEngineWatch([call({ ticker: 'AMZN', run_root: 'analyses/AMZN_2026-07-10' })], deco([{ ticker: 'AMZN', size_in_trigger: 'now buy at $240 — thesis changed' }]))
  const { rows, archived } = mergeWatchlist({ entries: [e], engine: after, today: TODAY })
  assert.equal(archived.length, 0)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].resurfaced, true, 'the engine changed its view, so the mute no longer applies')
})

await check('a NEW run for the same name brings the row back', () => {
  const before = readEngineWatch([call({ ticker: 'AMZN', run_root: 'analyses/AMZN_2026-07-10' })], deco([{ ticker: 'AMZN' }]))
  const e = archivedEntry(before[0].fingerprint)
  const after = readEngineWatch([call({ ticker: 'AMZN', run_root: 'analyses/AMZN_2026-08-24' })], deco([{ ticker: 'AMZN' }]))
  const { rows } = mergeWatchlist({ entries: [e], engine: after, today: TODAY })
  assert.equal(rows.length, 1)
  assert.equal(rows[0].resurfaced, true)
})

await check('mute_scope listing stays hidden even when the engine changes its view', () => {
  const before = readEngineWatch([call({ ticker: 'AMZN', run_root: 'analyses/AMZN_2026-07-10' })], deco([{ ticker: 'AMZN', size_in_trigger: 'a' }]))
  const e = archivedEntry(before[0].fingerprint, 'listing')
  const after = readEngineWatch([call({ ticker: 'AMZN', run_root: 'analyses/AMZN_2026-08-24' })], deco([{ ticker: 'AMZN', size_in_trigger: 'b' }]))
  const { rows, archived } = mergeWatchlist({ entries: [e], engine: after, today: TODAY })
  assert.equal(rows.length, 0, 'an explicit permanent mute is honoured')
  assert.equal(archived.length, 1)
})

await check('a purely manual archived row stays archived and is restorable', () => {
  const e = entry({ ticker: 'EMAAR', currency: 'AED', archive: { at: '2026-08-09T00:00:00Z', by: 'me', reason: 'dropped coverage', muted_fingerprint: null, mute_scope: 'assertion' } })
  const { rows, archived } = mergeWatchlist({ entries: [e], engine: [], today: TODAY })
  assert.equal(rows.length, 0)
  assert.equal(archived.length, 1)
  assert.equal(archived[0].origin, 'manual')
})

await check('the fingerprint is whitespace-stable but content-sensitive', () => {
  const a = fingerprintEngineRow({ run_root: 'r', decision: 'Watchlist', size_in_trigger: 'buy  at   100', next_review: '2026-09-01' })
  const b = fingerprintEngineRow({ run_root: 'r', decision: 'Watchlist', size_in_trigger: 'buy at 100', next_review: '2026-09-01' })
  const c = fingerprintEngineRow({ run_root: 'r', decision: 'Watchlist', size_in_trigger: 'buy at 101', next_review: '2026-09-01' })
  assert.equal(a, b, 'reflowed whitespace is not a change of view')
  assert.notEqual(a, c, 'a different number is')
})

console.log(`\nwatchlist-merge.test.ts: ${passed} passed`)
