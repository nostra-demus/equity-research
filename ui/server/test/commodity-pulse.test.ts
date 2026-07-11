// Commodity pulse (news/commodity-pulse.ts) — the per-subject snapshot behind /api/swarm/pulse.
// Tests the pure parsers (stooq CSV by header name, CFTC COT market resolution, the recurring-reports
// calendar with a frozen clock), config sanitization (hosts can never come from config), the shipped
// frameworks/commodity/pulse_sources.json shape, and the full getPulse flow with injected deps: happy
// path, honest absence (N/D price, unmatched COT market), serve-cached within TTL (no refetch),
// keep-previous + stale:true on fetch failure, and the single-flight guard (two concurrent calls, one
// fetch). Isolated tmpdirs, stubbed fetch, no network. Run: npx tsx test/commodity-pulse.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { NEWS } from '../src/config'
import {
  getPulse,
  loadPulseConfig,
  parseStooqCsv,
  parseCotRows,
  nextReports,
  buildCotUrl,
  type PulseDeps,
} from '../src/news/commodity-pulse'

let passed = 0
async function check(name: string, fn: () => void | Promise<void>): Promise<void> {
  try {
    await fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`)
    process.exitCode = 1
  }
}

// getPulse is gated on NEWS.pulseEnabled, which freezes at config import — a hostile env would make
// every check below fail for the wrong reason, so bail out honestly instead.
if (!NEWS.pulseEnabled) {
  console.log('commodity-pulse.test.ts: skipped (NEWS_PULSE_ENABLED=0 in this environment)')
  process.exit(0)
}

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
// 2026-07-08 is a Wednesday (UTC day 3) — the frozen clock every calendar assertion keys off.
const T0 = Date.parse('2026-07-08T12:00:00Z')
const WED = new Date(T0)
const tmpdirs: string[] = []
const tmp = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), 'pulse-')); tmpdirs.push(d); return d }

// ---- pure parser: stooq CSV ----

const CSV = [
  'Symbol,Date,Time,Open,High,Low,Close,Volume,Previous Close',
  'GC.F,2026-07-08,11:59:02,3310.1,3345.2,3301.0,3340.5,182345,3325.0',
  'NG.F,N/D,N/D,N/D,N/D,N/D,N/D,N/D,N/D',
].join('\n')

await check('parseStooqCsv parses by header name, drops N/D rows, lowercases symbols', () => {
  const rows = parseStooqCsv(CSV)
  assert.equal(rows.length, 1, 'the N/D row is omitted, never faked')
  const gc = rows[0]
  assert.equal(gc.symbol, 'gc.f')
  assert.equal(gc.last, 3340.5)
  assert.equal(gc.prevClose, 3325.0)
  assert.equal(gc.date, '2026-07-08')
  assert.equal(gc.time, '11:59:02')
})

await check('parseStooqCsv tolerates reordered columns and a missing Previous column', () => {
  // reordered + no prev column + an extra column we ignore
  const shuffled = ['Close,Symbol,Extra,Date,Time', '17.42,SB.F,x,2026-07-08,11:00:00'].join('\n')
  const rows = parseStooqCsv(shuffled)
  assert.equal(rows.length, 1)
  assert.equal(rows[0].symbol, 'sb.f')
  assert.equal(rows[0].last, 17.42)
  assert.equal(rows[0].prevClose, null, 'no prev column → null, not a guess')
  // an unrecognizable header must refuse to guess columns
  assert.deepEqual(parseStooqCsv('a,b,c\n1,2,3'), [])
  assert.deepEqual(parseStooqCsv(''), [])
})

// ---- pure parser: CFTC COT rows ----

const gold = (date: string, long: string, short: string, market = 'GOLD - COMMODITY EXCHANGE INC.') => ({
  market_and_exchange_names: market,
  report_date_as_yyyy_mm_dd: `${date}T00:00:00.000`,
  m_money_positions_long_all: long,
  m_money_positions_short_all: short,
})
const COT_ROWS = [gold('2026-07-07', '250000', '50000'), gold('2026-06-30', '240000', '60000')]

await check('parseCotRows: net from latest report, prev/change from the prior one, case-insensitive match', () => {
  const cot = parseCotRows(COT_ROWS, 'gold - commodity exchange')
  assert.ok(cot)
  assert.equal(cot!.market, 'GOLD - COMMODITY EXCHANGE INC.')
  assert.equal(cot!.managed_money_net, 200000)
  assert.equal(cot!.prev_net, 180000)
  assert.equal(cot!.change, 20000)
  assert.equal(cot!.report_date, '2026-07-07')
  assert.equal(cot!.source, 'cftc')
})

await check('parseCotRows prefers the market that STARTS WITH the substring over a contains-only match', () => {
  const rows = [...COT_ROWS, gold('2026-07-07', '9000', '1000', 'E-MICRO GOLD - COMMODITY EXCHANGE INC.')]
  const cot = parseCotRows(rows, 'GOLD - COMMODITY EXCHANGE')
  assert.equal(cot!.market, 'GOLD - COMMODITY EXCHANGE INC.', 'the e-micro distractor is not picked')
  assert.equal(cot!.managed_money_net, 200000)
})

await check('parseCotRows: honest nulls — single report (no prev), no match, non-array input', () => {
  const one = parseCotRows([gold('2026-07-07', '100', '40')], 'GOLD')
  assert.equal(one!.managed_money_net, 60)
  assert.equal(one!.prev_net, null)
  assert.equal(one!.change, null)
  assert.equal(parseCotRows(COT_ROWS, 'SUGAR NO. 11'), null)
  assert.equal(parseCotRows({ not: 'an array' }, 'GOLD'), null)
})

// ---- pure parser: the recurring-reports calendar (frozen Wednesday) ----

await check('nextReports: weekday → the next such day AFTER now; cadence words → null; never invents dates', () => {
  const entries = 'CFTC Commitments of Traders (weekly, Friday); EIA weekly storage (Thursday); USDA WASDE (monthly); Some Report.'
  const reports = nextReports(entries, WED)
  assert.equal(reports.length, 4)
  assert.deepEqual(reports[0], { name: 'CFTC Commitments of Traders (weekly, Friday)', cadence: 'weekly', next: '2026-07-10' })
  assert.deepEqual(reports[1], { name: 'EIA weekly storage (Thursday)', cadence: 'weekly', next: '2026-07-09' })
  assert.deepEqual(reports[2], { name: 'USDA WASDE (monthly)', cadence: 'monthly', next: null })
  assert.deepEqual(reports[3], { name: 'Some Report', cadence: 'scheduled', next: null })
})

await check('nextReports: today never counts as "next"; COT implies Friday; abbreviations and plurals work', () => {
  const r = nextReports('Mid-week report (Wednesday); weekly CFTC COT; Baker Hughes rig count (Fri)', WED)
  assert.equal(r[0].next, '2026-07-15', 'a Wednesday report seen on Wednesday points to NEXT week, never today')
  assert.equal(r[1].next, '2026-07-10', "'COT' with no weekday named still resolves to the CFTC Friday")
  assert.equal(r[2].next, '2026-07-10', "'(Fri)' abbreviation resolves")
  // 'COTTON monthly review' must NOT read 'COT' out of 'COTTON'
  const cotton = nextReports('COTTON monthly review', WED)
  assert.deepEqual(cotton[0], { name: 'COTTON monthly review', cadence: 'monthly', next: null })
})

await check('nextReports parses a real profile section: marker line, wrapped entries, section fences', () => {
  const section = [
    '',
    '- **Benchmark / grade:** LBMA Gold Price.',
    '',
    '**Recurring reports (catalysts):** FOMC decisions + dot plot; weekly CFTC COT (Fridays); WGC quarterly Gold Demand',
    'Trends; UNICA Centre-South bi-weekly data.',
    '',
    '---',
  ].join('\n')
  const r = nextReports(section, WED)
  assert.equal(r.length, 4)
  assert.deepEqual(r[0], { name: 'FOMC decisions + dot plot', cadence: 'scheduled', next: null })
  assert.deepEqual(r[1], { name: 'weekly CFTC COT (Fridays)', cadence: 'weekly', next: '2026-07-10' })
  assert.deepEqual(r[2], { name: 'WGC quarterly Gold Demand Trends', cadence: 'quarterly', next: null }, 'the wrapped line is rejoined')
  assert.deepEqual(r[3], { name: 'UNICA Centre-South bi-weekly data', cadence: 'fortnightly', next: null })
})

// ---- config loading + sanitization ----

await check('loadPulseConfig ignores any value containing :// — hosts can never come from config', () => {
  const dir = tmp()
  const file = path.join(dir, 'pulse_sources.json')
  fs.writeFileSync(file, JSON.stringify({
    cot_dataset: 'https://evil.example/resource/x.json',
    subjects: {
      GOLD: { stooq: 'https://evil.example/gc', unit: 'USD/troy oz', cot_market_contains: 'GOLD - COMMODITY EXCHANGE' },
      SUGAR: { stooq: 'sb.f', unit: 'US¢/lb', cot_market_contains: 'SUGAR NO. 11' },
    },
  }))
  const cfg = loadPulseConfig(file)
  assert.ok(cfg)
  assert.equal(cfg!.subjects.GOLD.stooq, undefined, 'a URL-shaped symbol is dropped')
  assert.equal(cfg!.subjects.GOLD.cotMarketContains, 'GOLD - COMMODITY EXCHANGE')
  assert.equal(cfg!.subjects.SUGAR.stooq, 'sb.f')
  assert.equal(cfg!.cotResource, '/resource/72hh-3qpy.json', 'a ://-carrying dataset falls back to the default resource')
  assert.equal(loadPulseConfig(path.join(dir, 'missing.json')), null)
  assert.ok(buildCotUrl('2026-06-17', cfg!.cotResource).startsWith('https://publicreporting.cftc.gov/resource/72hh-3qpy.json?'))
})

await check('the shipped frameworks/commodity/pulse_sources.json carries all 12 subjects, fully specified', () => {
  const cfg = loadPulseConfig(path.join(REPO, 'frameworks', 'commodity', 'pulse_sources.json'))
  assert.ok(cfg, 'shipped config loads')
  const expect = ['GOLD', 'SUGAR', 'CRUDE-OIL', 'NATURAL-GAS', 'COPPER', 'ALUMINIUM', 'WHEAT', 'CORN', 'SOYBEANS', 'COFFEE', 'COCOA', 'COTTON']
  assert.deepEqual(Object.keys(cfg!.subjects).sort(), [...expect].sort())
  for (const s of expect) {
    const src = cfg!.subjects[s]
    assert.ok(src.stooq, `${s} has a stooq symbol`)
    assert.ok(src.unit, `${s} has a quote unit`)
    assert.ok(src.cotMarketContains, `${s} has a COT market substring`)
  }
  assert.equal(cfg!.cotResource, '/resource/72hh-3qpy.json')
})

// ---- getPulse: fixture repo + stubbed fetch ----

function makeRepo(): string {
  const repo = tmp()
  const fw = path.join(repo, 'frameworks', 'commodity')
  fs.mkdirSync(fw, { recursive: true })
  fs.writeFileSync(path.join(fw, 'pulse_sources.json'), JSON.stringify({
    price_source: 'stooq',
    cot_dataset: 'publicreporting.cftc.gov/resource/72hh-3qpy.json',
    subjects: {
      GOLD: { stooq: 'gc.f', unit: 'USD/troy oz', cot_market_contains: 'GOLD - COMMODITY EXCHANGE' },
      'NATURAL-GAS': { stooq: 'ng.f', unit: 'USD/MMBtu', cot_market_contains: 'NATURAL GAS' },
    },
  }))
  fs.writeFileSync(path.join(fw, 'COMMODITY_PROFILES.md'), [
    '# Commodity Profiles',
    '',
    '## GOLD',
    '',
    '- **Benchmark / grade:** LBMA Gold Price.',
    '',
    '**Recurring reports (catalysts):** weekly CFTC COT (Fridays); USDA WASDE (monthly).',
    '',
    '---',
    '',
    '## NATURAL-GAS',
    '',
    '**Recurring reports (catalysts):** EIA weekly storage (Thu 10:30 ET); weekly CFTC COT.',
  ].join('\n'))
  const run = path.join(repo, 'commodity', 'runs', 'GOLD')
  fs.mkdirSync(run, { recursive: true })
  fs.writeFileSync(path.join(run, 'decision_record.json'), JSON.stringify({ action: 'Hold', decision_date: '2026-07-01' }))
  return repo
}

function makeManifest(id: string) {
  // a variable (not an inline literal) so the extra subjectsSource key — which the real SwarmManifest
  // carries and the pulse reads for the reports calendar — passes into PulseDeps structurally
  return {
    id,
    wire: { pulse: 'frameworks/commodity/pulse_sources.json' },
    runRootTemplate: 'commodity/runs/{COMMODITY}',
    placeholder: 'COMMODITY',
    subjectsSource: 'frameworks/commodity/COMMODITY_PROFILES.md',
  }
}

function makeFetch() {
  const calls = { stooq: 0, cftc: 0 }
  const state = { fail: false }
  const fetchFn = (async (input: any) => {
    const url = String(input)
    if (url.includes('stooq.com')) {
      calls.stooq++
      if (state.fail) throw new Error('stub network down')
      return new Response(CSV, { status: 200 })
    }
    if (url.includes('publicreporting.cftc.gov')) {
      calls.cftc++
      if (state.fail) throw new Error('stub network down')
      return new Response(JSON.stringify(COT_ROWS), { status: 200 })
    }
    throw new Error(`unexpected url: ${url}`)
  }) as typeof fetch
  return { fetchFn, calls, state }
}

const at = (ms: number) => () => new Date(ms)
const PRICE_TTL_MS = NEWS.pulsePriceTtlMin * 60_000
const COT_TTL_MS = NEWS.pulseCotTtlHours * 3_600_000

await check('getPulse returns null for an unknown swarm and for a manifest with no wire.pulse', async () => {
  assert.equal(await getPulse('definitely-not-a-swarm'), null)
  assert.equal(await getPulse('x', { manifest: { id: 'x' } }), null)
})

// NOTE: the NEWS.pulseEnabled=false → null branch is intentionally NOT exercised here. NEWS freezes
// from process.env at config import, and PulseDeps (a fixed public contract) carries no enabled knob —
// flipping it would need a subprocess with NEWS_PULSE_ENABLED=0, which isn't worth a one-line guard.

// shared fixture across the next three checks: happy path → within-TTL reuse → failure keeps cache
const repo = makeRepo()
const stateDir = tmp()
const manifest = makeManifest('pulse-test')
const { fetchFn, calls, state } = makeFetch()
const deps = (nowMs: number): PulseDeps => ({ manifest, fetchFn, now: at(nowMs), stateDir, repoRoot: repo })

await check('getPulse happy path: prices, COT, reports, verdict — and honest absence per subject', async () => {
  const snap = await getPulse('pulse-test', deps(T0))
  assert.ok(snap)
  assert.equal(snap!.swarm, 'pulse-test')
  assert.equal(snap!.stale, false)
  assert.equal(snap!.as_of, new Date(T0).toISOString())
  assert.deepEqual(Object.keys(snap!.subjects).sort(), ['GOLD', 'NATURAL-GAS'])

  const goldSub = snap!.subjects.GOLD
  assert.deepEqual(goldSub.price, {
    symbol: 'gc.f', last: 3340.5, prev_close: 3325, change_pct: 0.47,
    unit: 'USD/troy oz', as_of: '2026-07-08T11:59:02', source: 'stooq',
  })
  assert.deepEqual(goldSub.cot, {
    market: 'GOLD - COMMODITY EXCHANGE INC.', managed_money_net: 200000, prev_net: 180000,
    change: 20000, report_date: '2026-07-07', source: 'cftc',
  })
  assert.deepEqual(goldSub.reports, [
    { name: 'weekly CFTC COT (Fridays)', cadence: 'weekly', next: '2026-07-10' },
    { name: 'USDA WASDE (monthly)', cadence: 'monthly', next: null },
  ])
  assert.deepEqual(goldSub.verdict, { action: 'Hold', at: '2026-07-01' })

  const ng = snap!.subjects['NATURAL-GAS']
  assert.equal(ng.price, undefined, 'the N/D stooq row is omitted, never faked')
  assert.equal(ng.cot, undefined, 'no matching COT market → omitted')
  assert.equal(ng.verdict, undefined, 'no decision_record.json yet → omitted')
  assert.deepEqual(ng.reports, [
    { name: 'EIA weekly storage (Thu 10:30 ET)', cadence: 'weekly', next: '2026-07-09' },
    { name: 'weekly CFTC COT', cadence: 'weekly', next: '2026-07-10' },
  ])

  assert.equal(calls.stooq, 1)
  assert.equal(calls.cftc, 1)
  const persisted = JSON.parse(fs.readFileSync(path.join(stateDir, 'commodity-pulse.json'), 'utf8'))
  assert.ok(persisted['pulse-test']?.prices?.GOLD, 'snapshot persisted under the state dir for restart warm-start')
})

await check('getPulse serves the cache within TTL — no refetch', async () => {
  const snap = await getPulse('pulse-test', deps(T0 + 60_000))
  assert.ok(snap)
  assert.equal(snap!.stale, false)
  assert.equal(snap!.subjects.GOLD.price!.last, 3340.5)
  assert.equal(calls.stooq, 1, 'no second stooq call inside the price TTL')
  assert.equal(calls.cftc, 1, 'no second CFTC call inside the COT TTL')
})

await check('getPulse keeps the previous data and reports stale:true when a due refresh fails', async () => {
  state.fail = true
  const later = T0 + Math.max(PRICE_TTL_MS, COT_TTL_MS) + 3_600_000 // both halves past TTL
  const snap = await getPulse('pulse-test', deps(later))
  assert.ok(snap)
  assert.equal(snap!.stale, true, 'a failed refresh is declared, not hidden')
  assert.equal(snap!.subjects.GOLD.price!.last, 3340.5, 'the previous price half is kept')
  assert.equal(snap!.subjects.GOLD.cot!.managed_money_net, 200000, 'the previous COT half is kept')
  assert.ok(calls.stooq > 1, 'a refresh was actually attempted')
  state.fail = false
})

await check('getPulse single-flight: two concurrent calls share ONE fetch per source', async () => {
  const repo2 = makeRepo()
  const state2 = tmp()
  const m2 = makeManifest('pulse-sf')
  const f2 = makeFetch()
  const d: PulseDeps = { manifest: m2, fetchFn: f2.fetchFn, now: at(T0), stateDir: state2, repoRoot: repo2 }
  const [a, b] = await Promise.all([getPulse('pulse-sf', d), getPulse('pulse-sf', d)])
  assert.ok(a && b)
  assert.equal(f2.calls.stooq, 1, 'one stooq fetch for two concurrent callers')
  assert.equal(f2.calls.cftc, 1, 'one CFTC fetch for two concurrent callers')
  assert.deepEqual(a!.subjects.GOLD.price, b!.subjects.GOLD.price)
})

for (const d of tmpdirs) fs.rmSync(d, { recursive: true, force: true })
console.log(`\ncommodity-pulse.test.ts: ${passed} passed`)
