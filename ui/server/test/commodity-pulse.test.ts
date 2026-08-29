// Commodity pulse (news/commodity-pulse.ts) — the per-subject snapshot behind /api/swarm/pulse.
// Tests the pure parsers (CNBC restQuote batch rows with comma-thousands numbers, CFTC COT market
// resolution, the recurring-reports calendar with a frozen clock), config sanitization (hosts can
// never come from config), the shipped frameworks/commodity/pulse_sources.json shape, and the full
// getPulse flow with injected deps: happy path, honest absence (a dead-contract row like @ALI.1, a
// symbol missing from a good batch, unmatched COT market, null previous close → null change),
// serve-cached within TTL (no refetch), keep-previous + stale:true on batch failure, and the
// single-flight guard (two concurrent calls, one fetch per source). Isolated tmpdirs, stubbed fetch,
// no network. Run: npx tsx test/commodity-pulse.test.ts
process.env.ENGINE_ACTIVITY_LOG_DISABLED = '1'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { NEWS } from '../src/config'
import { canonicalJsonText } from '../src/canonical-json'
import {
  getPulse,
  loadPulseConfig,
  parseCnbcQuotes,
  parseCotRows,
  nextReports,
  buildCotUrl,
  buildCnbcQuoteUrl,
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

// ---- pure parser: CNBC restQuote batch ----

// CNBC's last_time carries a UTC offset ("-0400") — 07:59:02-0400 is 11:59:02Z.
const GC_ROW = { symbol: '@GC.1', name: "Gold COMEX (Aug'26)", last: '3,340.50', previous_day_closing: '3,325.00', last_time: '2026-07-08T07:59:02.000-0400' }
const SB_ROW = { symbol: '@SB.1', name: "Sugar #11 (Oct'26)", last: '14.86', last_time: '2026-07-08T07:59:02.000-0400' } // no previous_day_closing
const NG_DEAD_ROW = { symbol: '@NG.1', name: "Natural Gas (Nov'20)" } // dead contract: no last / no time
const cnbcBody = (rows: unknown) => JSON.stringify({ FormattedQuoteResult: { FormattedQuote: rows } })

await check('parseCnbcQuotes strips comma thousands separators and normalizes last_time to ISO UTC', () => {
  const m = parseCnbcQuotes(JSON.parse(cnbcBody([GC_ROW, SB_ROW])))
  assert.equal(m.size, 2)
  assert.deepEqual(m.get('@GC.1'), { symbol: '@GC.1', last: 3340.5, prevClose: 3325.0, asOf: '2026-07-08T11:59:02.000Z', name: "Gold COMEX (Aug'26)" })
  assert.deepEqual(m.get('@SB.1'), { symbol: '@SB.1', last: 14.86, prevClose: null, asOf: '2026-07-08T11:59:02.000Z', name: "Sugar #11 (Oct'26)" }, 'missing previous_day_closing → null, not 0')
})

await check('parseCnbcQuotes: a dead-contract row (no usable last) gets NO entry — honest absence', () => {
  const m = parseCnbcQuotes(JSON.parse(cnbcBody([GC_ROW, NG_DEAD_ROW])))
  assert.equal(m.size, 1)
  assert.equal(m.get('@NG.1'), undefined, "the @ALI.1-style dead row is omitted, never faked")
})

await check('parseCnbcQuotes: a single bare FormattedQuote object (not array) still parses; garbage → empty', () => {
  const single = parseCnbcQuotes(JSON.parse(JSON.stringify({ FormattedQuoteResult: { FormattedQuote: GC_ROW } })))
  assert.equal(single.size, 1)
  assert.equal(single.get('@GC.1')!.last, 3340.5)
  assert.equal(parseCnbcQuotes({ FormattedQuoteResult: {} }).size, 0)
  assert.equal(parseCnbcQuotes('garbage').size, 0)
  assert.equal(parseCnbcQuotes(null).size, 0)
  // a non-numeric last ("N/A", "unch") is not a price
  assert.equal(parseCnbcQuotes(JSON.parse(cnbcBody([{ symbol: '@X.1', last: 'N/A' }]))).size, 0)
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
      GOLD: { cnbc: 'https://evil.example/gc', unit: 'USD/troy oz', cot_market_contains: 'GOLD - COMMODITY EXCHANGE' },
      SUGAR: { cnbc: '@sb.1', unit: 'US¢/lb', cot_market_contains: 'SUGAR NO. 11' },
    },
  }))
  const cfg = loadPulseConfig(file)
  assert.ok(cfg)
  assert.equal(cfg!.subjects.GOLD.cnbc, undefined, 'a URL-shaped symbol is dropped')
  assert.equal(cfg!.subjects.GOLD.cotMarketContains, 'GOLD - COMMODITY EXCHANGE')
  assert.equal(cfg!.subjects.SUGAR.cnbc, '@SB.1', 'symbols normalize to CNBC uppercase')
  assert.equal(cfg!.cotResource, '/resource/72hh-3qpy.json', 'a ://-carrying dataset falls back to the default resource')
  assert.equal(loadPulseConfig(path.join(dir, 'missing.json')), null)
  assert.ok(buildCotUrl('2026-06-17', cfg!.cotResource).startsWith('https://publicreporting.cftc.gov/resource/72hh-3qpy.json?'))
  assert.equal(
    buildCnbcQuoteUrl(['@GC.1', '@SB.1']),
    'https://quote.cnbc.com/quote-html-webservice/restQuote/symbolType/symbol?symbols=%40GC.1%7C%40SB.1&requestMethod=itv&noform=1&partnerId=2&fund=1&output=json',
    'symbols pipe-joined then URL-encoded, host hardcoded',
  )
})

await check('the shipped frameworks/commodity/pulse_sources.json carries all 12 subjects, fully specified', () => {
  const cfg = loadPulseConfig(path.join(REPO, 'frameworks', 'commodity', 'pulse_sources.json'))
  assert.ok(cfg, 'shipped config loads')
  const expect = ['GOLD', 'SUGAR', 'CRUDE-OIL', 'NATURAL-GAS', 'COPPER', 'ALUMINIUM', 'WHEAT', 'CORN', 'SOYBEANS', 'COFFEE', 'COCOA', 'COTTON']
  assert.deepEqual(Object.keys(cfg!.subjects).sort(), [...expect].sort())
  for (const s of expect) {
    const src = cfg!.subjects[s]
    assert.ok(src.cnbc, `${s} has a CNBC symbol`)
    assert.match(src.cnbc!, /^@[A-Z0-9.]+$/, `${s} symbol looks like a CNBC front-month symbol`)
    assert.ok(src.unit, `${s} has a quote unit`)
    assert.ok(src.cotMarketContains, `${s} has a COT market substring`)
  }
  assert.equal(cfg!.subjects.GOLD.cnbc, '@GC.1')
  assert.equal(cfg!.subjects.WHEAT.cnbc, '@W.1')
  assert.equal(cfg!.subjects.ALUMINIUM.cnbc, '@ALI.1', 'kept as the seed even though currently a dead contract')
  // live-verified 2026-07-11: bare "NATURAL GAS" matches nothing — the NYMEX Henry Hub row is "NAT GAS NYME"
  assert.equal(cfg!.subjects['NATURAL-GAS'].cotMarketContains, 'NAT GAS NYME')
  assert.equal(cfg!.cotResource, '/resource/72hh-3qpy.json')
})

// ---- getPulse: fixture repo + stubbed fetch ----

function makeRepo(): string {
  const repo = tmp()
  const fw = path.join(repo, 'frameworks', 'commodity')
  fs.mkdirSync(fw, { recursive: true })
  fs.writeFileSync(path.join(fw, 'pulse_sources.json'), JSON.stringify({
    price_source: 'cnbc',
    cot_dataset: 'publicreporting.cftc.gov/resource/72hh-3qpy.json',
    subjects: {
      GOLD: { cnbc: '@GC.1', unit: 'USD/troy oz', cot_market_contains: 'GOLD - COMMODITY EXCHANGE' },
      'NATURAL-GAS': { cnbc: '@NG.1', unit: 'USD/MMBtu', cot_market_contains: 'NAT GAS NYME' },
      SUGAR: { cnbc: '@SB.1', unit: 'US¢/lb', cot_market_contains: 'SUGAR NO. 11' },
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
    runsRoot: 'commodity/runs',
    runRootTemplate: 'commodity/runs/{COMMODITY}',
    placeholder: 'COMMODITY',
    subjectsSource: 'frameworks/commodity/COMMODITY_PROFILES.md',
  }
}

function makeFetch() {
  const calls = { cnbc: 0, cftc: 0 }
  const state = { fail: false }
  const fetchFn = (async (input: any) => {
    const url = String(input)
    // route by the PARSED host, not a substring — matches how production pins its hosts (and keeps
    // CodeQL's incomplete-url-substring-sanitization check quiet, even though this is only a stub)
    const host = new URL(url).host
    if (host === 'quote.cnbc.com') {
      calls.cnbc++
      if (state.fail) throw new Error('stub network down')
      // the batch answers for GC + SB; NG is a dead contract (row present, no usable quote)
      return new Response(cnbcBody([GC_ROW, SB_ROW, NG_DEAD_ROW]), { status: 200 })
    }
    if (host === 'publicreporting.cftc.gov') {
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

// shared fixture across the next three checks: happy path → within-TTL reuse → batch failure keeps cache
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
  assert.deepEqual(Object.keys(snap!.subjects).sort(), ['GOLD', 'NATURAL-GAS', 'SUGAR'])

  const goldSub = snap!.subjects.GOLD
  assert.deepEqual(goldSub.price, {
    symbol: '@GC.1', last: 3340.5, prev_close: 3325, change_pct: 0.47,
    unit: 'USD/troy oz', as_of: '2026-07-08T11:59:02.000Z', source: 'cnbc', label: "Gold COMEX (Aug'26)",
  }, 'comma-separated strings parsed; change recomputed from last/prev; contract label carried')
  assert.deepEqual(goldSub.cot, {
    market: 'GOLD - COMMODITY EXCHANGE INC.', managed_money_net: 200000, prev_net: 180000,
    change: 20000, report_date: '2026-07-07', source: 'cftc',
  })
  assert.deepEqual(goldSub.reports, [
    { name: 'weekly CFTC COT (Fridays)', cadence: 'weekly', next: '2026-07-10' },
    { name: 'USDA WASDE (monthly)', cadence: 'monthly', next: null },
  ])
  assert.deepEqual(goldSub.verdict, { action: 'Hold', at: '2026-07-01' })

  const sugar = snap!.subjects.SUGAR
  assert.deepEqual(sugar.price, {
    symbol: '@SB.1', last: 14.86, prev_close: null, change_pct: null,
    unit: 'US¢/lb', as_of: '2026-07-08T11:59:02.000Z', source: 'cnbc', label: "Sugar #11 (Oct'26)",
  }, 'null previous close → change_pct null, never a fake 0-based move')
  assert.equal(sugar.cot, undefined, 'no matching COT market → omitted')
  assert.equal(sugar.reports, undefined, 'no profile section → omitted')

  const ng = snap!.subjects['NATURAL-GAS']
  assert.equal(ng.price, undefined, 'a dead-contract row in a good batch is omitted, never faked')
  assert.equal(ng.cot, undefined)
  assert.equal(ng.verdict, undefined, 'no decision_record.json yet → omitted')
  assert.deepEqual(ng.reports, [
    { name: 'EIA weekly storage (Thu 10:30 ET)', cadence: 'weekly', next: '2026-07-09' },
    { name: 'weekly CFTC COT', cadence: 'weekly', next: '2026-07-10' },
  ])

  assert.equal(calls.cnbc, 1, 'ONE batch call covers every symbol')
  assert.equal(calls.cftc, 1)
  const persisted = JSON.parse(fs.readFileSync(path.join(stateDir, 'commodity-pulse.json'), 'utf8'))
  assert.ok(persisted['pulse-test']?.prices?.GOLD, 'snapshot persisted under the state dir for restart warm-start')
  const historyDir = path.join(
    stateDir, 'commodity-pulse-history', createHash('sha256').update('pulse-test').digest('hex'),
  )
  const historyFiles = fs.readdirSync(historyDir)
  assert.equal(historyFiles.length, 1, 'the exact price half is retained for point-in-time research')
  const historical = JSON.parse(fs.readFileSync(path.join(historyDir, historyFiles[0]), 'utf8'))
  const material = { swarm: historical.swarm, priceAt: historical.priceAt, prices: historical.prices }
  const digest = createHash('sha256').update(canonicalJsonText(material)).digest('hex')
  assert.equal(historical.snapshot_sha256, `sha256:${digest}`)
  assert.equal(historyFiles[0], `${T0}-${digest}.json`, 'the immutable filename binds time and content')
})

await check('getPulse serves the cache within TTL — no refetch', async () => {
  const snap = await getPulse('pulse-test', deps(T0 + 60_000))
  assert.ok(snap)
  assert.equal(snap!.stale, false)
  assert.equal(snap!.subjects.GOLD.price!.last, 3340.5)
  assert.equal(calls.cnbc, 1, 'no second batch call inside the price TTL')
  assert.equal(calls.cftc, 1, 'no second CFTC call inside the COT TTL')
})

await check('getPulse keeps the previous data and reports stale:true when a due refresh fails', async () => {
  state.fail = true
  const later = T0 + Math.max(PRICE_TTL_MS, COT_TTL_MS) + 3_600_000 // both halves past TTL
  const snap = await getPulse('pulse-test', deps(later))
  assert.ok(snap)
  assert.equal(snap!.stale, true, 'a failed refresh is declared, not hidden')
  assert.equal(snap!.subjects.GOLD.price!.last, 3340.5, 'the previous price half is kept')
  assert.equal(snap!.subjects.SUGAR.price!.last, 14.86)
  assert.equal(snap!.subjects.GOLD.cot!.managed_money_net, 200000, 'the previous COT half is kept')
  assert.ok(calls.cnbc > 1, 'a refresh was actually attempted')
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
  assert.equal(f2.calls.cnbc, 1, 'one batch call for two concurrent callers')
  assert.equal(f2.calls.cftc, 1, 'one CFTC fetch for two concurrent callers')
  assert.deepEqual(a!.subjects.GOLD.price, b!.subjects.GOLD.price)
})

for (const d of tmpdirs) fs.rmSync(d, { recursive: true, force: true })
console.log(`\ncommodity-pulse.test.ts: ${passed} passed`)
