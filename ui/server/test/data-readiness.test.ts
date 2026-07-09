// Self-describing data-readiness. Run: npx tsx test/data-readiness.test.ts
// Proves a module can declare its readiness rule in its own 00-triage frontmatter (zero edits to the
// readiness engine) and that the interpreter behaves correctly.
import assert from 'node:assert/strict'
import { classify, deriveCoverage, evalDecl, extractPeriod, quoteAsOfMonths } from '../src/data-status'
import { moduleReadinessIssues } from '../src/readiness'
import { moduleReadinessDecls } from '../src/roster'
import type { ClassifiedFile, FileType, ModuleReadiness } from '../src/types'

const hasOf = (present: FileType[]) => (t: FileType) => present.includes(t)

// minimal ClassifiedFile for coverage tests — only filename/type/ageMonths/sheets are read by deriveCoverage
const cf = (filename: string, type: FileType = 'other', ageMonths: number | null = 0): ClassifiedFile => ({
  filename, ext: filename.slice(filename.lastIndexOf('.')), sizeBytes: 1, mtime: '2026-07-01T00:00:00Z',
  type, periodHint: null, ageMonths, confidence: 'high', basis: 'filename',
})
const covPresent = (files: ClassifiedFile[], key: string) => deriveCoverage(files).find((g) => g.key === key)?.present === true

let passed = 0
function check(name: string, fn: () => void) {
  try {
    fn()
    passed++
    console.log(`  ok  ${name}`)
  } catch (e: any) {
    console.error(`FAIL  ${name}\n      ${e?.message || e}`)
    process.exitCode = 1
  }
}

check('evalDecl: missing a required type -> Insufficient', () => {
  const r = evalDecl({ required: ['financials'], sufficient: ['financials'] }, hasOf([]))
  assert.equal(r.status, 'Insufficient')
})
check('evalDecl: all sufficient types present -> Sufficient', () => {
  const r = evalDecl({ required: ['financials'], sufficient: ['financials', 'consensus_estimates'] }, hasOf(['financials', 'consensus_estimates']))
  assert.equal(r.status, 'Sufficient')
})
check('evalDecl: some sufficient missing -> Partial + the declared cap', () => {
  const r = evalDecl({ sufficient: ['transcript', 'guidance'], caps: { guidance: 'guidance limited' } }, hasOf(['transcript']))
  assert.equal(r.status, 'Partial')
  assert.ok(r.caps.includes('guidance limited'))
})
check('a new/declared module is discovered from frontmatter via the graph (catalyst reference)', () => {
  const d = moduleReadinessDecls()['catalyst']
  assert.ok(d, 'catalyst should expose a data_readiness declaration')
  assert.deepEqual(d!.sufficient, ['transcript', 'guidance'])
})

// ---- classify() + upload coverage (regression: two real misclassifications) ----

// Bug: an earnings-call transcript whose filename carries a quarter token was claimed by the quarterly
// rule and never reached the transcript rule (or the content sniff), so "Earnings transcript" showed unmet.
check('classify: "…Q1 2026 Earnings Call…" RTF is a transcript, not a quarterly filing', () => {
  assert.equal(classify('MGM Resorts International, Q1 2026 Earnings Call, Apr 29, 2026.rtf', '').type, 'transcript')
  assert.equal(classify('MGM Resorts International, Q4 2025 Earnings Call, Feb 05, 2026.rtf', '').type, 'transcript')
})
check('classify: a genuine quarterly (no call/transcript token) is still a quarterly filing', () => {
  assert.equal(classify('MGM Resorts International - Form 10-Q (Apr-29-2026).pdf', '').type, 'quarterly_filing')
  assert.equal(classify('Q1 2026 Quarterly Results.pdf', '').type, 'quarterly_filing')
})
check('coverage: a transcript-typed file lights up the Earnings transcript group', () => {
  assert.ok(covPresent([cf('MGM Resorts International, Q1 2026 Earnings Call, Apr 29, 2026.rtf', 'transcript')], 'transcript'))
})

// Bug: a Capital IQ "Key Developments" material-events feed quotes "Independent Auditor", so the annual
// content-sniff mis-typed it as an audited annual filing — and it then hijacked the Annual report slot.
check('classify: a "Key Developments" feed is NOT an annual filing even when its text names the auditor', () => {
  assert.equal(classify('MGM Resorts International NYSE MGM Key Developments.rtf', 'MGM appoints Independent Auditor; Annual Report due').type, 'other')
})
// Bug (underscore vs space): filename rules used a literal space, so underscore exports slipped to 'other'.
check('classify: underscore-named exports are still identified (annual report, recent changes)', () => {
  const ar = classify('MGM_Annual_Report_Final_BMK.pdf', '')
  assert.equal(ar.type, 'annual_filing')
  assert.equal(ar.basis, 'filename') // by name now, not only rescued by content-sniff
  assert.equal(classify('02_Recent_Changes.xls', '').type, 'consensus_estimates')
})

// Bug: the Capital IQ "Public Company Profile" tearsheet holds the dated current price but was typed
// 'other' and did not satisfy the price signal, so "Current price" showed unmet even when uploaded.
check('coverage: only the PUBLIC company profile tearsheet satisfies Current price', () => {
  // the Capital IQ public-issuer tearsheet counts…
  assert.ok(covPresent([cf('MGM Resorts International NYSE MGM Public Company Profile.rtf')], 'price'))
  // …but a bare "Company Profile" overview (no dated quote) must NOT open the CRITICAL price gate
  assert.equal(covPresent([cf('Acme Corp Company Profile.pdf')], 'price'), false)
})
// Codex C5: the exclusion is a document phrase ("target price"), so an issuer literally NAMED Target still
// gets a price from its tearsheet, while an analyst target-price export is still rejected.
check('coverage: an issuer named "Target" still gets Current price; an analyst target-price export does not', () => {
  assert.ok(covPresent([cf('Target Corporation NYSE TGT Public Company Profile.rtf')], 'price'))
  assert.equal(covPresent([cf('MGM Analyst Coverage Target Price.xls')], 'price'), false)
})
// Codex C4: an earnings-call PRESENTATION/slide deck is slides, not prepared remarks — it must not fill the
// CORE Earnings transcript slot; the actual call transcript still classifies as a transcript.
check('classify: an earnings-call presentation/slide deck is investor_deck, not a transcript', () => {
  assert.equal(classify('MGM Q1 2026 Earnings Call Presentation.pdf', '').type, 'investor_deck')
  assert.equal(classify('MGM Q1 2026 Earnings Call Slides.pdf', '').type, 'investor_deck')
  assert.equal(classify('MGM Resorts International, Q1 2026 Earnings Call, Apr 29, 2026.rtf', '').type, 'transcript')
})
// Codex C2/C3 (tearsheet freshness): a full date counts ONLY after a quote-context phrase, so neither a bare
// body year nor a newer UNRELATED date (upcoming earnings, ex-div) can make a stale quote read fresh.
check('quoteAsOfMonths: only a quote-context date sets age; bare / newer-unrelated dates are ignored', () => {
  assert.equal(quoteAsOfMonths('Jul-02-2026'), null)                     // bare date, no quote context
  assert.equal(quoteAsOfMonths('Founded 2010; incorporated 1998'), null) // bare years
  const jul = quoteAsOfMonths('Delayed Quote Last Updated on Jul-02-2026')
  const jan = quoteAsOfMonths('as of Jan-02-2026')
  assert.ok(jul !== null && jan !== null && jul < jan, 'a later quote date is fewer months old')
  // a STALE Jan quote plus a NEWER unrelated date -> the quote date wins, not the later one
  assert.equal(quoteAsOfMonths('Delayed Quote Last Updated Jan-02-2026. Upcoming earnings Aug-05-2026'), jan)
  assert.equal(quoteAsOfMonths('price as of 2026-07-02'), jul)           // ISO form == Mon-DD-YYYY form
})
// Codex round 2: "as of" / "as at" is generic phrasing (consensus-estimate dates, filing dates, …), so a
// STRONG quote phrase (last updated / delayed quote / real-time quote) found anywhere in the document must
// win over a newer but weaker "as of" elsewhere — the weak phrase must never compete with a real quote
// timestamp for "most recent qualifying date".
check('quoteAsOfMonths: a strong quote phrase beats a newer unrelated weak "as of" date', () => {
  const jan = quoteAsOfMonths('as of Jan-02-2026')
  assert.equal(
    quoteAsOfMonths('Delayed Quote Last Updated Jan-02-2026. Consensus estimates as of Jul-02-2026.'),
    jan,
  )
})

// Codex C8 (hyphenated target-price): the analyst-doc exclusion is a PHRASE and must match the hyphen form
// too — a "Target-Price Quote"/"Target-Price Snapshot" export is an analyst target, NOT a live market quote,
// so it must NOT satisfy the CRITICAL Current-price group / valuation hasCurrentPrice gate (CLAUDE.md §16:
// "current price and its date"). An issuer literally NAMED Target must still get a price from its tearsheet.
check('coverage: a HYPHENATED analyst target-price export does not satisfy Current price', () => {
  assert.equal(covPresent([cf('MGM Target-Price Quote.pdf')], 'price'), false)
  assert.equal(covPresent([cf('MGM Target-Price Snapshot.pdf')], 'price'), false)
  // controls: issuer named Target still qualifies; the spaced form was already rejected
  assert.ok(covPresent([cf('Target Corporation NYSE TGT Public Company Profile.rtf')], 'price'))
  assert.equal(covPresent([cf('MGM Analyst Coverage Target Price.xls')], 'price'), false)
})
// Codex C7 (explicit transcript titled with a presentation-event name): "…Presentation Transcript" is
// prepared remarks, not slides — the `transcript` token wins, so it fills the CORE Earnings-transcript slot
// and is NOT routed to investor_deck. A plain "…Earnings Presentation" (no transcript token) stays a deck.
check('classify: an explicit "…Presentation Transcript" is a transcript, not an investor_deck', () => {
  assert.equal(classify('MGM Q1 2026 Earnings Presentation Transcript.rtf', '').type, 'transcript')
  assert.equal(classify('Investor Presentation Transcript.pdf', '').type, 'transcript')
  // controls: a slide-only deck is still a deck; a plain call transcript is still a transcript
  assert.equal(classify('MGM Q1 2026 Earnings Call Presentation.pdf', '').type, 'investor_deck')
  assert.equal(classify('MGM Q1 2026 Investor Presentation.pdf', '').type, 'investor_deck')
})

// ---- A.5: readiness-gate scoping by run kind ----
const M = (status: ModuleReadiness['status']): ModuleReadiness => ({ status, reasons: [], caps: [] })

check('moduleReadinessIssues: full run -> an Insufficient module is a DEGRADE (others still run)', () => {
  const out = moduleReadinessIssues('full', undefined, { earnings: M('Insufficient'), valuation: M('Sufficient') })
  assert.equal(out.length, 1)
  assert.equal(out[0].severity, 'degrade')
  assert.equal(out[0].module, 'earnings')
})
check('moduleReadinessIssues: module run -> an Insufficient TARGET is a BLOCKER (scoped to the target)', () => {
  const out = moduleReadinessIssues('module', 'earnings', { earnings: M('Insufficient'), valuation: M('Insufficient') })
  assert.equal(out.length, 1) // only the target, not the other Insufficient module
  assert.equal(out[0].severity, 'blocker')
  assert.equal(out[0].module, 'earnings')
})
check('moduleReadinessIssues: module run with a Sufficient target -> no issue', () => {
  assert.equal(moduleReadinessIssues('module', 'valuation', { valuation: M('Sufficient') }).length, 0)
})
check('moduleReadinessIssues: Partial is not surfaced (runs capped, not a gate concern)', () => {
  assert.equal(moduleReadinessIssues('full', undefined, { earnings: M('Partial') }).length, 0)
})
check('moduleReadinessIssues: agent + rerun are skipped entirely', () => {
  assert.equal(moduleReadinessIssues('agent', undefined, { earnings: M('Insufficient') }).length, 0)
  assert.equal(moduleReadinessIssues('rerun', undefined, { earnings: M('Insufficient') }).length, 0)
})

// ---- period from the FILENAME wins over content-scraped years (the "Data Coverage picks 2024 not 2025" bug) ----
check('extractPeriod: a titled annual report takes its FILENAME year, not a later year its body mentions', () => {
  // the 2024 report's body names 2025 (outlook / AGM date) — that must NOT be read as the period
  const p24 = extractPeriod('Emaar_Properties_Annual_Report_2024.pdf', 'Annual Report 2024. Year ended 31 December 2024. Our outlook for 2025 remains strong.')
  const p25 = extractPeriod('Emaar_Properties_Annual_Report_2025.pdf', 'Annual Report 2025. Year ended 31 December 2025.')
  assert.equal(p24.hint, '2024')
  assert.equal(p25.hint, '2025')
  assert.ok((p24.ageMonths ?? 0) > (p25.ageMonths ?? 0), 'the 2024 report must be OLDER than the 2025 report')
})

check('extractPeriod: with no year in the filename it falls back to the content period', () => {
  assert.equal(extractPeriod('annual-report.pdf', 'Results for the year ended 31 December 2025.').hint, '2025')
})

// ---- a bare-year filename is sharpened by the body's EXACT same-year fiscal period (was regressed by
// filename-first: the old combined scan caught FY2024-25; filename-first short-circuited on bare "2025") ----
check('extractPeriod: a bare-year filename takes the body\'s exact SAME-YEAR fiscal period (March year-end, not the June default)', () => {
  // "Annual Report 2025" whose body states FY2024-25 = year ended 31 March 2025 (Indian FY, CLAUDE.md §27).
  // It must age from MARCH, not the plain-year June default — i.e. exactly 3 months older. Expected value is
  // pinned to the fiscal-calendar fact (§27) + the March(3)-vs-June(6) monthsSince anchors, not to code output.
  const precise = extractPeriod('Annual Report 2025.pdf', 'Report for FY2024-25. Year ended 31 March 2025.')
  const bareOnly = extractPeriod('Annual Report 2025.pdf', 'no fiscal period is stated in this body')
  assert.equal(precise.hint, 'FY2024-25')
  assert.equal((precise.ageMonths ?? 0) - (bareOnly.ageMonths ?? 0), 3, 'March year-end must read 3 months older than the June plain-year default')
})

check('extractPeriod: a LATER year in the body never overrides the filename year (the next-year leak stays shut)', () => {
  // guard for the same-year constraint: a 2024-titled report whose body names FY2025-26 must stay 2024.
  assert.equal(extractPeriod('Emaar_Annual_Report_2024.pdf', 'Our outlook for FY2025-26 remains strong.').hint, '2024')
})

// ---- the common Indian AR filename `Annual_Report_2024-25.pdf` (fiscal range, NO `FY` prefix). Before the
// bare-fiscal-range branch the plain-year scan grabbed only the START year 2024 (June), so a current FY2024-25
// report read ~9 months too old and could wrongly trip the 18-month staleness gate. ----
check('extractPeriod: a bare fiscal-range filename (2024-25, no FY prefix) ages from the END year 31-Mar, not the START year June', () => {
  // Expected values pinned to §27 fiscal facts + the March(3)/June(6) monthsSince anchors, not to code output.
  const fiscal = extractPeriod('Annual_Report_2024-25.pdf', '')
  const precise2025 = extractPeriod('Annual Report 2025.pdf', 'Report for FY2024-25. Year ended 31 March 2025.')
  const bare2024 = extractPeriod('Annual Report 2024.pdf', '')
  assert.equal(fiscal.hint, 'FY2024-25')
  assert.equal(fiscal.ageMonths, precise2025.ageMonths, 'the filename fiscal range must age from the SAME 31-Mar-2025 year-end as the precise body path')
  assert.equal((bare2024.ageMonths ?? 0) - (fiscal.ageMonths ?? 0), 9, 'must take END year 2025 (Mar), not START year 2024 (Jun) — a 9-month fresher read')
})

// a real multi-year span or an ISO date must NOT be mis-read as a fiscal year (guarded by end===start+1)
check('extractPeriod: a non-consecutive span (2019-2024) is not a fiscal year — falls through to the plain-year max', () => {
  assert.equal(extractPeriod('Sector_Study_2019-2024.pdf', '').hint, '2024')
})

check('coverage: among annual reports the Annual-report group names the LATEST (2025), not the alphabetically-earlier 2024', () => {
  const g = deriveCoverage([
    cf('Emaar_Properties_Annual_Report_2023.pdf', 'annual_filing', 37),
    cf('Emaar_Properties_Annual_Report_2024.pdf', 'annual_filing', 25),
    cf('Emaar_Properties_Annual_Report_2025.pdf', 'annual_filing', 13),
  ]).find((x) => x.key === 'annual')
  assert.equal(g?.filename, 'Emaar_Properties_Annual_Report_2025.pdf')
})

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
