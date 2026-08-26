// The join between the book and the engine's own research. The rules that matter: matching is exact or
// explicit and never fuzzy, direction decides whether a verdict agrees or contradicts, and coverage is
// measured by WEIGHT rather than by counting names.
// Hermetic — builds a throwaway analyses/ tree, so no real dossier is involved.
// Run: npx tsx test/portfolio-thesis.test.ts
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  coveredTickers, MAX_LINKS, readLinks, setLink, stanceOf, suggestTickers, thesisRead,
  type HeldForThesis,
} from '../src/portfolio-thesis'

const TMP = fs.mkdtempSync(path.join(os.tmpdir(), 'fundbook-thesis-'))
const ANALYSES = path.join(TMP, 'analyses')
const STORE = path.join(TMP, 'portfolio')
fs.mkdirSync(ANALYSES, { recursive: true })
fs.mkdirSync(STORE, { recursive: true })

const TODAY = '2026-08-26'

let passed = 0
const fails: string[] = []
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok   ${name}`) }
  catch (e: any) { fails.push(name); console.log(`  FAIL ${name}\n       ${e?.message || e}`) }
}

function dossier(ticker: string, date: string, decision: string | null, confidence: number | null): void {
  const dir = path.join(ANALYSES, `${ticker}_${date}`)
  fs.mkdirSync(dir, { recursive: true })
  const record: Record<string, unknown> = { decision_date: date }
  if (decision !== null) record.decision = decision
  if (confidence !== null) record.confidence_score = confidence
  fs.writeFileSync(path.join(dir, 'decision_record.json'), JSON.stringify(record))
}
function held(over: Partial<HeldForThesis> = {}): HeldForThesis {
  return { symbol: 'AMZN', currency: 'USD', quantity: 100, percentOfNAV: 10, isDerivative: false, ...over }
}

dossier('AMZN', '2026-07-20', 'Buy', 71)
dossier('BG', '2026-06-01', 'Avoid', 70)
dossier('NHY', '2026-08-06', 'Watchlist', 48)
dossier('TSLA', '2026-07-25', 'Short Candidate', 60)
dossier('MGM', '2026-08-14', 'Insufficient Data — Refuse To Rate', null)
// The engine's own working folders live beside the dossiers and are not companies.
for (const junk of ['eval', 'tracking', 'portfolio', 'performance']) fs.mkdirSync(path.join(ANALYSES, junk), { recursive: true })
// A run folder with no usable decision record must not present itself as coverage.
fs.mkdirSync(path.join(ANALYSES, 'HCG_2026-06-01'), { recursive: true })

// ---------- what counts as covered ----------
check('only tickers with a usable decision are offered as research', () => {
  const covered = coveredTickers(ANALYSES)
  assert.deepEqual(covered, ['AMZN', 'BG', 'MGM', 'NHY', 'TSLA'])
  assert.ok(!covered.includes('HCG'), 'a run folder with no decision record is not coverage')
  for (const junk of ['eval', 'tracking', 'portfolio', 'performance']) {
    assert.ok(!covered.includes(junk.toUpperCase()), `${junk} is a working folder, not a company`)
  }
})

// ---------- matching ----------
check('an identical ticker matches on its own, and carries the verdict with its age', () => {
  const read = thesisRead([held({ symbol: 'amzn' })], new Map(), TODAY, ANALYSES)
  const row = read.rows[0]!
  assert.equal(row.ticker, 'AMZN')
  assert.equal(row.matchedBy, 'exact')
  assert.equal(row.decision, 'Buy')
  assert.equal(row.confidence, 71)
  assert.equal(row.decisionDate, '2026-07-20')
  assert.equal(row.ageDays, 37, 'a verdict without its age is a slogan')
  assert.equal(row.stance, 'supported')
})

check('a different ticker is NEVER matched by resemblance', () => {
  // The whole point: NHYDY is the ADR of NHY, and a rule loose enough to join them automatically would
  // also join BG to BGC. Attributing one company's verdict to another is worse than showing none.
  const read = thesisRead([held({ symbol: 'NHYDY' })], new Map(), TODAY, ANALYSES)
  const row = read.rows[0]!
  assert.equal(row.ticker, null)
  assert.equal(row.decision, null)
  assert.equal(row.stance, 'none')
  assert.deepEqual(row.suggestions, ['NHY'], 'but the near-miss is OFFERED')
})

check('an explicit link joins what resemblance would not', () => {
  const read = thesisRead([held({ symbol: 'NHYDY' })], new Map([['NHYDY', 'NHY']]), TODAY, ANALYSES)
  const row = read.rows[0]!
  assert.equal(row.ticker, 'NHY')
  assert.equal(row.matchedBy, 'linked')
  assert.equal(row.decision, 'Watchlist')
  assert.deepEqual(row.suggestions, [], 'a matched holding needs no suggestions')
})

check('an explicit link beats an identical ticker', () => {
  // Two companies can share a symbol across exchanges. If the operator has said which one this is, a
  // coincidence of letters must not overrule them.
  const read = thesisRead([held({ symbol: 'BG' })], new Map([['BG', 'AMZN']]), TODAY, ANALYSES)
  assert.equal(read.rows[0]!.ticker, 'AMZN')
  assert.equal(read.rows[0]!.matchedBy, 'linked')
})

check('a link to a ticker the engine no longer covers falls back to no research', () => {
  // Not to a broken row, and not to a silent exact match either — the holding simply has no dossier.
  const read = thesisRead([held({ symbol: 'GLDM' })], new Map([['GLDM', 'GONE']]), TODAY, ANALYSES)
  assert.equal(read.rows[0]!.ticker, null)
  assert.equal(read.rows[0]!.decision, null)
})

check('suggestions require a prefix relation and a small gap', () => {
  const covered = ['NHY', 'BG', 'AMZN']
  assert.deepEqual(suggestTickers('NHYDY', covered), ['NHY'])
  assert.deepEqual(suggestTickers('BGC', covered), ['BG'], 'offered — and exactly why it is never applied')
  assert.deepEqual(suggestTickers('NHYDYABC', covered), [], 'four characters apart is not a listing suffix')
  assert.deepEqual(suggestTickers('XYZ', covered), [])
  assert.deepEqual(suggestTickers('AMZN', covered), [], 'an exact match is not its own suggestion')
})

// ---------- stance ----------
check('direction decides whether a verdict agrees or contradicts', () => {
  for (const [decision, long, short] of [
    ['Strong Buy', 'supported', 'against'],
    ['Buy', 'supported', 'against'],
    ['Starter Position Only', 'supported', 'against'],
    ['Avoid', 'against', 'supported'],
    ['Short Candidate', 'against', 'supported'],
    ['Watchlist', 'watch', 'watch'],
    ['Insufficient Data — Refuse To Rate', 'unrated', 'unrated'],
    ['Pair Trade / Hedge Required', 'hedge', 'hedge'],
  ] as const) {
    assert.equal(stanceOf(decision, 100), long, `${decision} held long`)
    assert.equal(stanceOf(decision, -100), short, `${decision} held short`)
  }
  assert.equal(stanceOf(null, 100), 'none')
  assert.equal(stanceOf('Buy', null), 'supported', 'an unknown quantity cannot contradict anything')
})

check('a position held against its verdict is counted, not merely coloured', () => {
  const read = thesisRead([
    held({ symbol: 'BG', percentOfNAV: 20 }),        // Avoid, held long
    held({ symbol: 'TSLA', percentOfNAV: 15 }),      // Short Candidate, held long
    held({ symbol: 'AMZN', percentOfNAV: 30 }),      // Buy, held long
    held({ symbol: 'MGM', percentOfNAV: 5 }),        // Insufficient Data
  ], new Map(), TODAY, ANALYSES)
  assert.equal(read.againstCount, 2)
  assert.equal(read.uncoveredCount, 0)
  assert.equal(read.rows.find((r) => r.symbol === 'MGM')!.stance, 'unrated')
})

check('a short position against a Short Candidate is agreement, and is not counted against', () => {
  const read = thesisRead([held({ symbol: 'TSLA', quantity: -50 })], new Map(), TODAY, ANALYSES)
  assert.equal(read.rows[0]!.stance, 'supported')
  assert.equal(read.againstCount, 0)
})

// ---------- coverage ----------
check('coverage is measured by WEIGHT, not by counting names', () => {
  // Four researched 1% positions and one unresearched 60% position is 80% covered by count and 6% by
  // weight, and only the second number describes the risk.
  const read = thesisRead([
    held({ symbol: 'AMZN', percentOfNAV: 1 }),
    held({ symbol: 'BG', percentOfNAV: 1 }),
    held({ symbol: 'NHY', percentOfNAV: 1 }),
    held({ symbol: 'TSLA', percentOfNAV: 1 }),
    held({ symbol: 'GLDM', percentOfNAV: 60 }),
  ], new Map(), TODAY, ANALYSES)
  assert.equal(read.uncoveredCount, 1)
  assert.ok(Math.abs(read.coveredWeightPct! - (4 / 64) * 100) < 1e-9, `got ${read.coveredWeightPct}`)
})

check('a derivative carries exposure, so it never dilutes the weight coverage', () => {
  const read = thesisRead([
    held({ symbol: 'AMZN', percentOfNAV: 50 }),
    held({ symbol: 'ESZ6', percentOfNAV: 900, isDerivative: true }),
  ], new Map(), TODAY, ANALYSES)
  assert.equal(read.coveredWeightPct, 100, 'the notional must not enter the denominator')
  assert.equal(read.rows.find((r) => r.symbol === 'ESZ6')!.weightPct, null)
})

check('rows come back heaviest first', () => {
  const read = thesisRead([
    held({ symbol: 'BG', percentOfNAV: 5 }),
    held({ symbol: 'AMZN', percentOfNAV: 40 }),
    held({ symbol: 'NHY', percentOfNAV: 12 }),
  ], new Map(), TODAY, ANALYSES)
  assert.deepEqual(read.rows.map((r) => r.symbol), ['AMZN', 'NHY', 'BG'])
})

check('an empty book produces an empty read, not a crash or a false 0%', () => {
  const read = thesisRead([], new Map(), TODAY, ANALYSES)
  assert.deepEqual(read.rows, [])
  assert.equal(read.coveredWeightPct, null, 'no weight to divide by is not "nothing covered"')
  assert.equal(read.againstCount, 0)
})

// ---------- the link store ----------
check('a link round-trips, and unlinking removes it', () => {
  setLink(STORE, 'nhydy', 'nhy', ANALYSES)
  assert.equal(readLinks(STORE).get('NHYDY'), 'NHY', 'both sides are stored upper-case')
  setLink(STORE, 'NHYDY', null, ANALYSES)
  assert.equal(readLinks(STORE).has('NHYDY'), false)
})

check('a link to a ticker the engine has no dossier for is refused, with the reason', () => {
  // Otherwise the link is saved, shows as "no research", and looks to the operator exactly like a link
  // that was never made.
  assert.throws(() => setLink(STORE, 'GLDM', 'NOPE', ANALYSES), /no dossier for NOPE/)
  assert.throws(() => setLink(STORE, 'GLDM', 'HCG', ANALYSES), /no dossier for HCG/)
  assert.throws(() => setLink(STORE, '', 'NHY', ANALYSES), /symbol is required/)
  assert.throws(() => setLink(STORE, 'GLDM', 'not a ticker', ANALYSES), /valid ticker/)
  assert.equal(readLinks(STORE).size, 0)
})

check('a corrupt or hostile links file reads as no links', () => {
  fs.writeFileSync(path.join(STORE, 'thesis-links.json'), '{"NHYDY":')
  assert.equal(readLinks(STORE).size, 0)
  fs.writeFileSync(path.join(STORE, 'thesis-links.json'), '["NHYDY","NHY"]')
  assert.equal(readLinks(STORE).size, 0)
  fs.writeFileSync(path.join(STORE, 'thesis-links.json'), JSON.stringify({ NHYDY: '../../etc/passwd', OK: 'NHY' }))
  const links = readLinks(STORE)
  assert.equal(links.has('NHYDY'), false, 'a value that is not a ticker is dropped, not stored')
  assert.equal(links.get('OK'), 'NHY', 'and the readable entries around it survive')
  fs.rmSync(path.join(STORE, 'thesis-links.json'), { force: true })
})

check('the link store is bounded', () => {
  for (let i = 0; i < MAX_LINKS; i++) setLink(STORE, `SYM${i}`, 'NHY', ANALYSES)
  assert.throws(() => setLink(STORE, 'ONEMORE', 'NHY', ANALYSES), /no room/)
  // Re-pointing an existing link is not a new one, so it still works at the cap.
  assert.doesNotThrow(() => setLink(STORE, 'SYM0', 'AMZN', ANALYSES))
  assert.equal(readLinks(STORE).get('SYM0'), 'AMZN')
})

try { fs.rmSync(TMP, { recursive: true, force: true }) } catch { /* best effort */ }
console.log(`\n${passed} passed, ${fails.length} failed`)
if (fails.length) { console.error('FAILED: ' + fails.join(', ')); process.exit(1) }
