// Self-describing data-readiness. Run: npx tsx test/data-readiness.test.ts
// Proves a module can declare its readiness rule in its own 00-triage frontmatter (zero edits to the
// readiness engine) and that the interpreter behaves correctly.
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { callDateMonths, classify, deriveCoverage, evalDecl, extractPeriod, latestDecision, quoteAsOfMonths, readinessHas } from '../src/data-status'
import { inspectPoolPresence, moduleReadinessIssues, parseReadinessStdout } from '../src/readiness'
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

// ---- extractor stdout protocol: noisy parser diagnostics cannot masquerade as data failure ----
const pyReport = {
  data_path: '/tmp/data/KAR', generation_digest: 'a'.repeat(64), file_count: 86, usable_count: 86,
  issues: [], entities: [{ file: 'annual-report.pdf', entity: 'Karoon Energy Ltd' }],
}

check('parseReadinessStdout: accepts the strict one-document protocol', () => {
  const parsed = parseReadinessStdout(JSON.stringify(pyReport))
  assert.equal(parsed.report.file_count, 86)
  assert.equal(parsed.ignoredDiagnosticLines, 0)
})
check('parseReadinessStdout: accepts Python nulls for optional issue details', () => {
  const parsed = parseReadinessStdout(JSON.stringify({
    ...pyReport,
    issues: [{ code: 'empty_file', severity: 'blocker', message: 'empty', evidence: null, file: null }],
  }))
  assert.equal(parsed.report.issues[0].code, 'empty_file')
})
check('parseReadinessStdout: recovers one schema-valid report surrounded by parser warnings', () => {
  const parsed = parseReadinessStdout(`WARNING *** noisy workbook\n${JSON.stringify(pyReport)}\nlate parser warning`)
  assert.equal(parsed.report.usable_count, 86)
  assert.equal(parsed.ignoredDiagnosticLines, 2)
})
check('parseReadinessStdout: rejects ambiguous output containing two valid reports', () => {
  assert.throws(
    () => parseReadinessStdout(`${JSON.stringify(pyReport)}\n${JSON.stringify(pyReport)}`),
    /2 valid reports/,
  )
})
check('parseReadinessStdout: rejects unrelated JSON or an impossible report shape', () => {
  assert.throws(() => parseReadinessStdout('{"level":"warning"}'), /0 valid reports/)
  assert.throws(
    () => parseReadinessStdout(JSON.stringify({ ...pyReport, file_count: 1, usable_count: 2 })),
    /0 valid reports/,
  )
  assert.throws(
    () => parseReadinessStdout(JSON.stringify({ ...pyReport, generation_digest: undefined })),
    /0 valid reports/,
    'a successful readiness report cannot omit its immutable generation receipt',
  )
})

check('inspectPoolPresence: proves real non-empty inputs without counting metadata or engine output', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-pool-presence-'))
  try {
    fs.writeFileSync(path.join(root, 'annual-report.pdf'), 'real filing bytes')
    fs.writeFileSync(path.join(root, 'empty.pdf'), '')
    fs.writeFileSync(path.join(root, 'annual-report.pdf.source.json'), '{"metadata":true}')
    fs.writeFileSync(path.join(root, '.DS_Store'), 'finder metadata')
    const output = path.join(root, 'prior-engine-output')
    fs.mkdirSync(output)
    fs.writeFileSync(path.join(output, '.nostradamus_output'), '')
    fs.writeFileSync(path.join(output, 'final_thesis.md'), 'must not be re-ingested')
    fs.mkdirSync(path.join(output, 'archive'))
    fs.writeFileSync(path.join(output, 'archive', 'nested-output.md'), 'must also stay excluded')
    assert.deepEqual(inspectPoolPresence(root), { state: 'nonempty', fileCount: 2, nonEmptyFileCount: 1 })
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

check('inspectPoolPresence: missing is unknown; all-zero-byte inputs are positive empty proof', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-pool-empty-'))
  try {
    assert.deepEqual(inspectPoolPresence(path.join(root, 'missing')), {
      state: 'unknown', fileCount: 0, nonEmptyFileCount: 0, reason: 'root_realpath_failed',
    })
    assert.deepEqual(inspectPoolPresence(root), { state: 'empty', fileCount: 0, nonEmptyFileCount: 0 })
    fs.writeFileSync(path.join(root, 'empty.xls'), '')
    assert.deepEqual(inspectPoolPresence(root), { state: 'empty', fileCount: 1, nonEmptyFileCount: 0 })
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

check('inspectPoolPresence: any incomplete directory walk is unknown, never empty', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-pool-io-error-'))
  const blocked = path.join(root, 'blocked')
  fs.mkdirSync(blocked)
  try {
    assert.deepEqual(inspectPoolPresence(root, {
      realpathSync: (target) => fs.realpathSync(target),
      lstatSync: (target) => fs.lstatSync(target),
      readdirSync: (directory) => {
        if (path.basename(directory) === path.basename(blocked)) throw new Error('simulated Drive read failure')
        return fs.readdirSync(directory, { withFileTypes: true })
      },
    }), {
      state: 'unknown', fileCount: 0, nonEmptyFileCount: 0, reason: 'directory_read_failed',
    })
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
})

check('inspectPoolPresence: a file disappearing during stat makes the proof unknown', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nostra-pool-stat-error-'))
  const filing = path.join(root, 'filing.pdf')
  fs.writeFileSync(filing, 'bytes')
  try {
    assert.deepEqual(inspectPoolPresence(root, {
      realpathSync: (target) => fs.realpathSync(target),
      lstatSync: (candidate) => {
        if (path.basename(candidate) === path.basename(filing)) throw new Error('simulated concurrent rename')
        return fs.lstatSync(candidate)
      },
      readdirSync: (directory) => fs.readdirSync(directory, { withFileTypes: true }),
    }), {
      state: 'unknown', fileCount: 0, nonEmptyFileCount: 0, reason: 'entry_stat_failed',
    })
  } finally {
    fs.rmSync(root, { recursive: true, force: true })
  }
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

// Codex #196 r3553859966: a bare filename year that is a DOWNLOAD/SAVED stamp (not the report period) must
// not win over the body's real fiscal period. Expected value pinned to §27 (a FY2024-25 report ends 31-Mar-
// 2025 → aged from March), NOT to the 2026 saved-date. Red on the pre-fix same-year-only rule (the stamp
// year 2026 ≠ body year 2025 rejected the upgrade, leaving the false-fresh "2026" ~1mo read); green after.
check('extractPeriod: a download/saved stamp year in the filename does not win over the body FY period', () => {
  const stamped = extractPeriod('Annual_Report_downloaded_2026.pdf', 'This is the FY2024-25 annual report. Outlook for 2026.')
  const real = extractPeriod('Annual_Report_2024-25.pdf', '')
  assert.equal(stamped.hint, 'FY2024-25', 'the FY2024-25 body period must win over the 2026 download stamp')
  assert.equal(stamped.ageMonths, real.ageMonths, 'must age from the 31-Mar-2025 FY end, not the June-2026 stamp')
})
// next-year-leak guard (must still hold): a REAL period filename with no stamp keeps its own year even when
// the body names the following year.
check('extractPeriod: a non-stamp filename year still ignores a later body year (no next-year leak)', () => {
  assert.equal(extractPeriod('Annual_Report_2024.pdf', 'Outlook for 2025 and the AGM in 2025.').hint, '2024')
})

// ---- #195: broker-style quarter labels (distinctness) + call-date recency ----
check('extractPeriod: broker quarters 4Q25 / 1Q2026 parse to the same Q<n> <yyyy> as a verbatim transcript', () => {
  assert.equal(extractPeriod('ACME 4Q25 Earnings Call Insight.pdf', '').hint, 'Q4 2025')
  assert.equal(extractPeriod('ACME 1Q2026 Results Note.pdf', '').hint, 'Q1 2026')
  // a broker 4Q25 note and a verbatim Q4 2025 transcript are ONE call period — they must dedupe (not read as "2026")
  assert.equal(extractPeriod('Broker 4Q25 note.pdf', '').hint, extractPeriod('Co Q4 2025 transcript.rtf', '').hint)
})

check('callDateMonths: a call ages from its FILENAME call date — 2 months fresher than the quarter-end', () => {
  // "Q4 2025 Earnings Call, Feb 05 2026": the call (Feb 2026) is 2 months newer than the Q4-2025 quarter-end
  // (Dec 2025) extractPeriod anchors to. The diff is date-independent (both shift with today) — pins the fix.
  const callAge = callDateMonths('ACME Q4 2025 Earnings Call, Feb 05, 2026.rtf')
  const quarterEnd = extractPeriod('ACME Q4 2025 Earnings Call.rtf', '').ageMonths
  assert.ok(callAge != null, 'the Feb-2026 call date is parsed from the filename')
  assert.equal((quarterEnd ?? 0) - (callAge ?? 0), 2, 'call date reads exactly 2 months fresher than the quarter-end')
})

check('callDateMonths: no date in the filename -> null (falls back to the quarter-end age)', () => {
  assert.equal(callDateMonths('ACME Q4 2025 Earnings Call.rtf'), null)
})

// ---- external data is readiness-NEUTRAL (frameworks/EXTERNAL_DATA.md) ----
// An external file's name/tabs must never satisfy a coverage slot — the coverage regexes are not
// type-keyed, so a routed broker note with a "Consensus" tab (or a file named like a price quote)
// would otherwise read as the upload being present.
const extCf = (filename: string, sheets?: { name: string; rows: number; cols: number; cells: number }[]): ClassifiedFile => ({
  ...cf(filename, 'external_data', 0),
  ...(sheets ? { sheets } : {}),
  external: { provider: 'SomeVendor', sourceType: 'broker_research', tier: 7 },
})

check('external: a price-named external file does not satisfy the price coverage slot', () => {
  assert.equal(covPresent([extCf('external/vendor/spot_price_tracker.xlsx')], 'price'), false)
})
check('external: a "Consensus" tab inside an external workbook does not satisfy estimates coverage', () => {
  assert.equal(covPresent([extCf('external/vendor/panel.xlsx', [{ name: 'Consensus', rows: 5, cols: 5, cells: 10 }])], 'estimates'), false)
})
check('external: the same names as TOP-LEVEL files DO satisfy coverage (the exclusion is external-only)', () => {
  assert.equal(covPresent([cf('spot_price_tracker.xlsx')], 'price'), true)
  assert.equal(covPresent([cf('estimates.xls', 'consensus_estimates')], 'estimates'), true)
})
check('external: external_data satisfies no declared readiness slot (type-keyed has())', () => {
  const r = evalDecl({ sufficient: ['transcript'] }, hasOf(['external_data' as FileType]))
  assert.equal(r.status, 'Partial')
})

// ---- `external:<sourceType>` readiness tokens (competitive-intel's peer_transcript) ----
// A module whose evidence lives under external/ declares an `external:<sourceType>` token so the readiness
// engine can SEE it (external files are all typed the readiness-neutral 'external_data'; the kind is in
// external.sourceType). And a subject-side 'transcript' must NOT satisfy that external token.
const peerCall: ClassifiedFile = {
  ...cf('external/CapitalIQ/whirlpool_q2.txt', 'external_data', 0),
  external: { provider: 'CapitalIQ', sourceType: 'peer_transcript', tier: 6 },
}
check('readinessHas: external:<sourceType> matches an external_data file carrying that source type', () => {
  assert.equal(readinessHas([peerCall], 'external:peer_transcript'), true)
  assert.equal(readinessHas([peerCall], 'external:alt_data_panel'), false)
  // a SUBJECT transcript (top-level type 'transcript') does NOT satisfy the external peer-transcript slot
  assert.equal(readinessHas([cf('subject_call.rtf', 'transcript')], 'external:peer_transcript'), false)
})
check('evalDecl: sufficient [external:peer_transcript] -> Sufficient with a peer call; Partial + cap without', () => {
  const decl = {
    sufficient: ['external:peer_transcript'],
    caps: { 'external:peer_transcript': 'no competitor transcripts' },
  } as const
  assert.equal(evalDecl(decl, (t) => readinessHas([peerCall], t)).status, 'Sufficient')
  // a pool with only the subject's own transcript is Partial and surfaces the coverage-gap cap
  const r0 = evalDecl(decl, (t) => readinessHas([cf('subject_call.rtf', 'transcript')], t))
  assert.equal(r0.status, 'Partial')
  assert.ok(r0.caps.includes('no competitor transcripts'))
})
check('competitive-intel triage declares the external:peer_transcript readiness token', () => {
  const d = moduleReadinessDecls()['competitive-intel']
  assert.ok(d, 'competitive-intel should expose a data_readiness declaration')
  assert.deepEqual(d!.sufficient, ['external:peer_transcript'])
})

// ---- latestDecision: a newer INCOMPLETE run must not hide the last finished dossier. The real case: a
// single-module rerun writes a fresh dated folder (e.g. AMZN_2026-07-11/management-governance) with no
// decision_record, and the old code returned that newest folder unconditionally, hiding AMZN_2026-07-10. ----
{
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'analyses-'))
  fs.mkdirSync(path.join(dir, 'AMZN_2026-07-10'), { recursive: true })
  fs.writeFileSync(path.join(dir, 'AMZN_2026-07-10', 'decision_record.json'),
    JSON.stringify({ decision: 'Buy', decision_date: '2026-07-10', confidence_score: 78 }))
  fs.mkdirSync(path.join(dir, 'AMZN_2026-07-11', 'management-governance'), { recursive: true }) // partial rerun, no decision_record

  check('latestDecision: a newer partial run does NOT shadow the last finished dossier', () => {
    const r = latestDecision('AMZN', dir)
    assert.equal(r?.runRoot, 'analyses/AMZN_2026-07-10', 'must fall back to the completed run, not the empty 07-11 folder')
    assert.equal(r?.decision, 'Buy')
    assert.equal(r?.confidence, 78)
  })
  check('latestDecision: a malformed latest decision_record also falls back to the previous complete run', () => {
    fs.writeFileSync(path.join(dir, 'AMZN_2026-07-11', 'decision_record.json'), '{ not valid json')
    const r = latestDecision('AMZN', dir)
    assert.equal(r?.runRoot, 'analyses/AMZN_2026-07-10')
    assert.equal(r?.decision, 'Buy')
  })
  check('latestDecision: when only an incomplete run exists -> return it (decision null), never null-crash', () => {
    const d2 = fs.mkdtempSync(path.join(os.tmpdir(), 'analyses2-'))
    fs.mkdirSync(path.join(d2, 'NEWCO_2026-01-01'))
    const r = latestDecision('NEWCO', d2)
    assert.equal(r?.runRoot, 'analyses/NEWCO_2026-01-01')
    assert.equal(r?.decision, null)
  })
  check('latestDecision: no runs for the ticker -> null', () => {
    assert.equal(latestDecision('ZZZ', dir), null)
  })
}

console.log(`\n${passed} checks passed${process.exitCode ? ' (with failures)' : ''}`)
