// Sell-side earnings-note detection. A broker "Earnings Call Insight/Summary" (a directional verdict block
// riding on a call summary) must classify as `sell_side_earnings_note`, NOT a plain `transcript` — so the
// reading layer strips the verdict and caps it (earnings MODULE_RULES → Transcript Sourcing) and it never
// masquerades as a verbatim call. A verbatim CIQ transcript must be unaffected. An ORDINARY results/target-
// price note (not a call summary) must NOT get the proxy type, or it would satisfy the Earnings-transcript
// slot and hide a missing call source (CLAUDE.md §11 / §24). Pure-function unit test.
// Run: npx tsx test/transcript-proxy.test.ts
import assert from 'node:assert/strict'
import { classify, evaluateModules, readinessHas, evalDecl, callDateMonths } from '../src/data-status'
import type { ClassifiedFile, FileType } from '../src/types'

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

const cf = (type: FileType, opts: Partial<ClassifiedFile> = {}): ClassifiedFile => ({
  filename: opts.filename ?? `${type}.pdf`, ext: '.pdf', sizeBytes: 1, mtime: '2026-07-01T00:00:00Z',
  type, periodHint: opts.periodHint ?? null, ageMonths: opts.ageMonths ?? 0, confidence: 'high', basis: 'filename',
})

check('FabResearch note by CONTENT → sell_side_earnings_note (not a plain transcript)', () => {
  const r = classify('a1b2c3d4-opaque-uuid.pdf', FAB_SNIFF) // opaque name → content decides
  assert.equal(r.type, 'sell_side_earnings_note')
})

// 676a: a "…Earnings Call Summary" filename is the exact verdict-bearing note this change targets — it must
// be the proxy, not fall through to the plain-transcript rule on its "earnings call" token.
check('Earnings Call Summary FILENAME → sell_side_earnings_note (676a)', () => {
  const r = classify('Emaar 4Q25 Earnings Call Summary.pdf', '')
  assert.equal(r.type, 'sell_side_earnings_note')
})

// 676b: a file NAMED "…Earnings Call" but whose BODY is a broker verdict block must be caught by the content
// check BEFORE the transcript-filename fallback — otherwise the verdict rides along untagged (§24).
check('Earnings Call filename + broker verdict CONTENT → sell_side_earnings_note, not transcript (676b)', () => {
  const r = classify('Emaar 4Q25 Earnings Call.rtf', FAB_SNIFF)
  assert.equal(r.type, 'sell_side_earnings_note')
})

// 662: an ordinary results/target-price note (no call-summary token, no verdict-on-a-call content) must NOT
// be tagged as the proxy — otherwise it satisfies the Earnings-transcript slot and hides a missing call (§11).
check('ordinary "Analyst Report - 4Q25 Results" FILENAME (no content) → NOT the proxy (662)', () => {
  const r = classify('Analyst Report - 4Q25 Results.pdf', '')
  assert.notEqual(r.type, 'sell_side_earnings_note')
  assert.notEqual(r.type, 'transcript') // and does not fill the call slot as a transcript either
})
check('ordinary "UAE Equity Research - Emaar 4Q25 Results" FILENAME (no content) → NOT the proxy (662)', () => {
  const r = classify('UAE Equity Research - Emaar properties 4Q25 Results.pdf', '')
  assert.notEqual(r.type, 'sell_side_earnings_note')
})

check('a verbatim CIQ transcript filename → transcript (unaffected)', () => {
  const r = classify('MGM Resorts International, Q1 2026 Earnings Call, Apr 29, 2026.rtf', '')
  assert.equal(r.type, 'transcript')
})

check('a verbatim transcript by CONTENT (Operator / prepared remarks, no verdict) → transcript', () => {
  const r = classify('deadbeef-opaque-uuid.pdf', REAL_SNIFF)
  assert.equal(r.type, 'transcript')
})

// 668: the <2-recent-calls cap must count DISTINCT RECENT call PERIODS, not files — a Q4 transcript + a Q4
// proxy (same call) is one call's worth of colour, so earnings must NOT read Sufficient (§11).
check('earnings: 1 transcript + 1 proxy of the SAME period → Partial, <2-calls cap fires (668)', () => {
  const files = [
    cf('financials'), cf('consensus_estimates'),
    cf('transcript', { periodHint: 'Q4 2025', filename: 't.pdf' }),
    cf('sell_side_earnings_note', { periodHint: 'Q4 2025', filename: 'p.pdf' }),
  ]
  const r = evaluateModules(files, [])['earnings']
  assert.equal(r.status, 'Partial')
  assert.ok(r.caps.some((c) => /fewer than 2 recent earnings calls/.test(c)))
})
check('earnings: two DISTINCT recent call periods → Sufficient (668 non-regression)', () => {
  const files = [
    cf('financials'), cf('consensus_estimates'),
    cf('transcript', { periodHint: 'Q4 2025', filename: 't1.pdf' }),
    cf('transcript', { periodHint: 'Q3 2025', filename: 't2.pdf' }),
  ]
  assert.equal(evaluateModules(files, [])['earnings'].status, 'Sufficient')
})
check('earnings: proxy-only pool → Partial (strong-cap, never a blocker) (§11/§24)', () => {
  const files = [cf('financials'), cf('consensus_estimates'), cf('sell_side_earnings_note')]
  const r = evaluateModules(files, [])['earnings']
  assert.equal(r.status, 'Partial')
  assert.ok(r.caps.some((c) => /sell-side proxy only/.test(c)))
})

// 679: a proxy fills the `transcript` readiness slot for self-declared rules, exactly as the coverage row
// groups them — so the upload panel and the readiness dot agree. Generic, no module name hardcoded (§26).
check('readinessHas: a proxy satisfies the transcript slot (679)', () => {
  const proxyOnly = [cf('sell_side_earnings_note'), cf('guidance')]
  assert.equal(readinessHas(proxyOnly, 'transcript'), true)
  const r = evalDecl({ sufficient: ['transcript', 'guidance'] }, (t) => readinessHas(proxyOnly, t))
  assert.equal(r.status, 'Sufficient')
})
check('readinessHas: no exact type and no proxy → false (no false positive)', () => {
  assert.equal(readinessHas([cf('financials')], 'transcript'), false)
})

// ---- Codex #195 follow-ups: tighten the detector so non-call files can't fill the transcript slot (§11/§24) ----

// r3551600913: the FILENAME shortcut must require the earnings/conference qualifier — a bare "Capital Call
// Summary" / "Customer Call Recap" is NOT an earnings call and must not be typed as the proxy.
check('a non-earnings "Capital Call Summary" filename is NOT a sell-side earnings note (r3551600913)', () => {
  assert.notEqual(classify('Blackstone Capital Call Summary.pdf', '').type, 'sell_side_earnings_note')
  assert.notEqual(classify('Acme Customer Call Recap.pdf', '').type, 'sell_side_earnings_note')
})

// r3551600915: a Capital IQ "Key Developments" material-events feed whose text quotes an earnings call plus a
// target-price/rating event must stay 'other' (pinned by name), NOT be content-typed as a call proxy.
check('a "Key Developments" feed with a call+target/rating mention stays other, not a proxy (r3551600915)', () => {
  const kdSniff = 'MGM Resorts Key Developments. Analyst reiterates Rating BUY, Target Price 55, ahead of the Q1 2026 earnings call.'
  const r = classify('MGM Resorts International NYSE MGM Key Developments.rtf', kdSniff)
  assert.equal(r.type, 'other')
})

// r3552380164: a VERBATIM transcript that merely quotes a "target price" and says "buy"/"hold" as free text
// (no Rating/Recommendation label, no buy/hold-next-to-a-rating cue) must keep its transcript classification.
check('a verbatim transcript quoting "target price" + free-text "buy/hold" stays a transcript (r3552380164)', () => {
  const sniff = [
    'MGM Resorts International, Q1 2026 Earnings Call, Apr 29, 2026',
    'Operator: Good afternoon. Prepared Remarks follow.',
    'Analyst: Given your stock is below many sell-side target price levels, would you buy back more, or hold cash?',
    'CFO: We will be opportunistic on the buyback.',
  ].join('\n')
  assert.equal(classify('deadbeef-opaque-uuid.pdf', sniff).type, 'transcript')
})
// and the FabResearch verdict block (a labelled "Rating BUY" + "Target Price") is still caught after the tighten
check('a labelled broker verdict block (Rating + Target Price on a call summary) is still the proxy (r3552380164 non-regression)', () => {
  assert.equal(classify('opaque-uuid.pdf', FAB_SNIFF).type, 'sell_side_earnings_note')
})
// r3552380160: a "Price Target" (reversed) variant on a call summary is still detected
check('a broker note using the "Price Target" variant is still the proxy (r3552380160)', () => {
  const sniff = 'Emaar 4Q25 Earnings Call Summary. Recommendation: BUY. Price Target: AED 19.25.'
  assert.equal(classify('opaque.pdf', sniff).type, 'sell_side_earnings_note')
})

// r3551600904: a STALE verbatim transcript (>6mo) + two RECENT distinct proxies must NOT read Sufficient —
// the only recent call colour is proxy-only, so a cap fires and it stays Partial (§11 false-confidence path).
check('earnings: stale transcript + 2 recent distinct proxies → Partial, not Sufficient (r3551600904)', () => {
  const files = [
    cf('financials'), cf('consensus_estimates'),
    cf('transcript', { periodHint: 'Q1 2025', ageMonths: 15, filename: 'stale.pdf' }), // >6mo → stale
    cf('sell_side_earnings_note', { periodHint: 'Q4 2025', ageMonths: 3, filename: 'p1.pdf' }),
    cf('sell_side_earnings_note', { periodHint: 'Q3 2025', ageMonths: 5, filename: 'p2.pdf' }),
  ]
  const r = evaluateModules(files, [])['earnings']
  assert.equal(r.status, 'Partial')
  assert.ok(r.caps.some((c) => /only RECENT earnings-call colour is a sell-side proxy/.test(c)), `expected the recent-proxy-only cap, got: ${JSON.stringify(r.caps)}`)
})
// non-regression: a stale transcript + a RECENT verbatim transcript still reads by its recent verbatim colour
check('earnings: stale transcript + a recent verbatim transcript is NOT proxy-capped (r3551600904 non-regression)', () => {
  const files = [
    cf('financials'), cf('consensus_estimates'),
    cf('transcript', { periodHint: 'Q1 2025', ageMonths: 15, filename: 'stale.pdf' }),
    cf('transcript', { periodHint: 'Q4 2025', ageMonths: 3, filename: 'recent1.pdf' }),
    cf('transcript', { periodHint: 'Q3 2025', ageMonths: 5, filename: 'recent2.pdf' }),
  ]
  const r = evaluateModules(files, [])['earnings']
  assert.ok(!r.caps.some((c) => /sell-side proxy/.test(c)), `no proxy cap expected, got: ${JSON.stringify(r.caps)}`)
})

// ── Codex #195 second-round review findings (2026-07-09) ─────────────────────────────────────────────
// Expected values pinned to CLAUDE.md §11 (a non-call source must not fill the earnings-transcript slot) and
// §24 (a broker verdict must never ride into a verbatim-transcript classification untagged). Each is red on
// the pre-fix classifier (verified by stashing src/data-status.ts) and green after.

// A (r3553999643): a broker note titled "…Earnings Call - Summary" / "…Earnings Call – Recap" (a dash-run
// separator, no readable body) must still be the proxy — not fall through to the plain-transcript rule where
// its verdict would ride untagged (§24). A single-char separator class missed the space-dash-space shape.
check('A: "Earnings Call - Summary" (dash-run sep), empty body → sell_side_earnings_note not transcript', () => {
  assert.equal(classify('Emaar 4Q25 Earnings Call - Summary.pdf', '').type, 'sell_side_earnings_note')
  assert.equal(classify('Emaar 4Q25 Earnings Call – Recap.pdf', '').type, 'sell_side_earnings_note')
})
// A non-regression: a verbatim "…Earnings Call.pdf" (no summary/recap token) is still a plain transcript.
check('A non-regression: a verbatim "Earnings Call.pdf" is still a transcript', () => {
  assert.equal(classify('MGM Q1 2026 Earnings Call.pdf', '').type, 'transcript')
})

// B (r3553999647): a VERBATIM transcript that mentions its "credit rating" (management colour) and quotes a
// "price target" in an analyst question, with "prepared remarks", must stay a transcript — a company credit
// rating is not an analyst verdict label, so it must not mis-tag the file as a broker note (§24).
check('B: verbatim transcript mentioning credit rating + price target stays a transcript', () => {
  const body = 'Operator: Thank you for joining. Prepared remarks. CFO: our credit rating was affirmed. Analyst: what price target underpins guidance'
  assert.equal(classify('Emaar Q4 2025 Earnings Call.pdf', body).type, 'transcript')
})
// B non-regression: a labelled analyst verdict ("Rating BUY") on a call summary is still the proxy.
check('B non-regression: a labelled "Rating BUY" broker verdict is still the proxy', () => {
  assert.equal(classify('opaque.pdf', FAB_SNIFF).type, 'sell_side_earnings_note')
})

// C (r3553999649): a file NAMED "Analyst Coverage" / "Broker Recommendation" is a consensus/estimates export
// (the filename rule pins it to consensus_estimates). A Recommendation+Target-Price body that also quotes a
// call must NOT hijack it into the transcript slot (§4/§11) — it must stay consensus_estimates.
check('C: "Broker Recommendation"/"Analyst Coverage" named file stays consensus_estimates, not proxy', () => {
  const body = 'Emaar 4Q25 Earnings Call Summary. Rating: BUY. Target Price AED 19.25. Recommendation BUY.'
  assert.equal(classify('Emaar Broker Recommendation.pdf', body).type, 'consensus_estimates')
  assert.equal(classify('Emaar Analyst Coverage.pdf', body).type, 'consensus_estimates')
})

// E (r3554298632): the tearsheet/profile exclusion must be separator-tolerant — "Public_Company_Profile.pdf"
// and "tear_sheet.pdf" are CIQ reference exports and must be pinned to 'other', exactly like their space/one-
// word forms, never mis-typed as a call proxy that fills the transcript slot (§11).
check('E: "Public_Company_Profile"/"tear_sheet" separator variants → other, not proxy', () => {
  const body = 'Emaar 4Q25 Earnings Call Summary. Rating: BUY. Target Price AED 19.25. Recommendation BUY.'
  assert.equal(classify('Public_Company_Profile.pdf', body).type, 'other')
  assert.equal(classify('Emaar_tear_sheet.pdf', body).type, 'other')
})

// G (r3554298641): a later EXPORT / DOWNLOAD stamp in a call filename must not set the call's recency — a
// stale Q2-2025 call exported on 2026-07-01 must age from the CALL date (Aug 2025 ≈ 11mo), not the export
// stamp (which would read ~0mo and falsely suppress the "<2 recent calls" cap).
check('G: an export stamp does not refresh a stale call date', () => {
  const withStamp = callDateMonths('Emaar Q2 2025 Earnings Call, Aug 05 2025 - exported 2026-07-01.rtf')
  const callOnly = callDateMonths('Emaar Q2 2025 Earnings Call, Aug 05 2025.rtf')
  assert.equal(withStamp, callOnly, `export stamp must be ignored: got ${withStamp}, expected ${callOnly}`)
  assert.ok(withStamp != null && withStamp >= 10, `stale call must age from Aug 2025 (~11mo), got ${withStamp}`)
})

console.log(`\n${passed} passed`)
