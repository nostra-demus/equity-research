// Sell-side earnings-note detection. A broker "Earnings Call Insight" (a directional verdict block riding
// on a call summary) must classify as `sell_side_earnings_note`, NOT a plain `transcript` — so the reading
// layer strips the verdict and caps it (earnings MODULE_RULES → Transcript Sourcing). A verbatim CIQ
// transcript must be unaffected. Pure-function unit test. Run: npx tsx test/transcript-proxy.test.ts
import assert from 'node:assert/strict'
import { classify } from '../src/data-status'

let passed = 0
function check(name: string, fn: () => void) {
  try { fn(); passed++; console.log(`  ok  ${name}`) }
  catch (e: any) { console.error(`FAIL  ${name}\n      ${e?.stack || e?.message || e}`); process.exitCode = 1 }
}

// A FabResearch-shaped opening: the verdict block (Current/Target Price, Rating) on an earnings-call summary.
const FAB_SNIFF = [
  'Monday, February 16, 2026  Emaar Properties 4Q25',
  'Earnings Call Insight|4Q25    UAE Equity Research    Sector: Real Estate    Market: DFM',
  'Current Price AED 16.30    Target Price AED 19.25    Upside/Downside (%) +18%    Rating BUY',
  '4Q25 Net Profit higher than our estimate',
  'Earnings Call Summary: Emaar has over 50,800 units currently under construction ...',
].join('\n')

// A verbatim CIQ transcript opening.
const REAL_SNIFF = [
  'MGM Resorts International, Q1 2026 Earnings Call, Apr 29, 2026',
  'Operator: Good afternoon, and welcome to the MGM Resorts First Quarter 2026 earnings call.',
  'Prepared Remarks ... Thank you for joining us today.',
].join('\n')

check('FabResearch note by CONTENT → sell_side_earnings_note (not a plain transcript)', () => {
  const r = classify('a1b2c3d4-opaque-uuid.pdf', FAB_SNIFF) // opaque name → content decides
  assert.equal(r.type, 'sell_side_earnings_note')
})

check('FabResearch note by FILENAME → sell_side_earnings_note', () => {
  const r = classify('UAE Equity Research - Emaar properties 4Q25_Earnings.pdf', '')
  assert.equal(r.type, 'sell_side_earnings_note')
})

check('a verbatim CIQ transcript filename → transcript (unaffected)', () => {
  const r = classify('MGM Resorts International, Q1 2026 Earnings Call, Apr 29, 2026.rtf', '')
  assert.equal(r.type, 'transcript')
})

check('a verbatim transcript by CONTENT (Operator / prepared remarks, no verdict) → transcript', () => {
  const r = classify('deadbeef-opaque-uuid.pdf', REAL_SNIFF)
  assert.equal(r.type, 'transcript')
})

console.log(`\n${passed}/4 passed`)
