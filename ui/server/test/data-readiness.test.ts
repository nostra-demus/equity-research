// Self-describing data-readiness. Run: npx tsx test/data-readiness.test.ts
// Proves a module can declare its readiness rule in its own 00-triage frontmatter (zero edits to the
// readiness engine) and that the interpreter behaves correctly.
import assert from 'node:assert/strict'
import { classify, deriveCoverage, evalDecl, quoteAsOfMonths } from '../src/data-status'
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

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
