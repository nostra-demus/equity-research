import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { DATA_DIR, ANALYSES_DIR, REPO_ROOT } from './config'
import { syncingState } from './data-activity'
import { listModuleNames, moduleReadinessDecls } from './roster'
import { suggestTicker, tickerInvalidReason } from './sandbox'
import type { ClassifiedFile, CoverageGroup, DataReadinessDecl, DataStatus, FileType, ModuleReadiness, Sufficiency, TickerSummary, WorkbookSheet } from './types'

// ---- persistent extract cache ----
// Reading workbook tabs / pdf-rtf content spawns python over the Google Drive mount,
// which is slow on a cold load — and we clear in-memory caches on every restart. Persist
// the results to local disk keyed by path:size:mtime, so each file is read at most once
// EVER; repeat loads (and loads after a restart) are instant. A changed file (new mtime
// or size) re-reads automatically.
const CACHE_FILE = path.join(REPO_ROOT, '.cache', 'cockpit-extract.json')
let diskCache: Record<string, unknown> = {}
try {
  diskCache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'))
} catch {
  diskCache = {}
}
let cacheDirty = false
let persistTimer: ReturnType<typeof setTimeout> | null = null
function persistCache(): void {
  if (persistTimer) return
  persistTimer = setTimeout(() => {
    persistTimer = null
    if (!cacheDirty) return
    cacheDirty = false
    try {
      fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true })
      fs.writeFileSync(CACHE_FILE, JSON.stringify(diskCache))
    } catch {}
  }, 800)
}
function cacheGet<T>(key: string): T | undefined {
  return key in diskCache ? (diskCache[key] as T) : undefined
}
function cacheSet(key: string, val: unknown): void {
  diskCache[key] = val
  cacheDirty = true
  persistCache()
}

// ---- light content sniffing (memoized) ----
const sniffCache = new Map<string, string>()
function sniffText(filePath: string, sizeBytes: number, mtimeMs: number): string {
  const key = `${filePath}:${sizeBytes}:${Math.round(mtimeMs)}`
  const hit = sniffCache.get(key)
  if (hit !== undefined) return hit
  let text = ''
  try {
    const ext = path.extname(filePath).toLowerCase()
    const base = filePath.slice(0, -ext.length)
    const sibling = base + '.txt'
    if (ext === '.txt') {
      text = fs.readFileSync(filePath, 'utf8').slice(0, 8000)
    } else if (fs.existsSync(sibling)) {
      text = fs.readFileSync(sibling, 'utf8').slice(0, 8000)
    } else if (ext === '.pdf' || ext === '.rtf') {
      // extract REAL text via the canonical extractor (pdftotext / textutil) so we
      // classify on contents, not raw bytes. Fall back to printable bytes if it fails.
      text = extractSniffText(filePath, sizeBytes, mtimeMs).slice(0, 8000)
      if (!text) {
        const buf = fs.readFileSync(filePath).subarray(0, 16000).toString('latin1')
        text = buf.replace(/[^\x20-\x7e\n]/g, ' ').slice(0, 8000)
      }
    }
  } catch {
    text = ''
  }
  sniffCache.set(key, text)
  return text
}

// real text for a pdf/rtf (and any supported type) via the canonical extractor —
// the SAME extract_pool.py the pipeline uses, so the cockpit reads pdf/rtf instead
// of guessing from raw bytes. Returns '' on any failure (pdftotext/textutil absent).
function extractSniffText(filePath: string, sizeBytes: number, mtimeMs: number): string {
  const key = `sniff:${filePath}:${sizeBytes}:${Math.round(mtimeMs)}`
  const cached = cacheGet<string>(key)
  if (cached !== undefined) return cached
  let text = ''
  try {
    const script = path.join(REPO_ROOT, '.claude', 'tools', 'extract_pool.py')
    text = execFileSync('python3', [script, '--text', filePath, '--max-chars', '16000'], { timeout: 30000, maxBuffer: 8_000_000 }).toString('utf8')
  } catch {
    text = ''
  }
  cacheSet(key, text)
  return text
}

// ---- workbook tab reader (memoized) ----
// Reuses the engine's ONE canonical extractor (.claude/tools/extract_pool.py --list-json)
// so the cockpit and the research pipeline agree on what tabs a workbook holds. A multi-tab
// Capital IQ / NSE export must never show up as one opaque "other / low" row.
function readWorkbookSheets(filePath: string, sizeBytes: number, mtimeMs: number): WorkbookSheet[] | undefined {
  const key = `sheets:${filePath}:${sizeBytes}:${Math.round(mtimeMs)}`
  const cached = cacheGet<WorkbookSheet[] | null>(key)
  if (cached !== undefined) return cached ?? undefined
  let sheets: WorkbookSheet[] | undefined
  try {
    const script = path.join(REPO_ROOT, '.claude', 'tools', 'extract_pool.py')
    const out = execFileSync('python3', [script, '--list-json', filePath], { timeout: 20000, maxBuffer: 8_000_000 }).toString('utf8')
    const parsed = JSON.parse(out)
    if (parsed && parsed.kind === 'workbook' && parsed.status === 'ok' && Array.isArray(parsed.sheets)) {
      sheets = parsed.sheets.map((s: { name?: unknown; rows?: unknown; cols?: unknown; cells?: unknown }) => ({
        name: String(s.name ?? ''),
        rows: Number(s.rows) || 0,
        cols: Number(s.cols) || 0,
        cells: Number(s.cells) || 0,
      }))
    }
  } catch {
    sheets = undefined // missing python/xlrd, HTML-disguised .xls, or corrupt file — degrade gracefully
  }
  // [fix F34] cache ONLY successful reads. A transient failure (FUSE deadlock, a momentary lock,
  // a missing dep before bootstrap) must not be memoized as a permanent "no tabs": the disk cache
  // persists across restarts and the key (path:size:mtime) won't change on a re-flake, so a one-off
  // failure would stick forever. Leaving the key absent makes the next refresh re-attempt the read.
  if (sheets !== undefined) cacheSet(key, sheets)
  return sheets
}

// when a workbook's filename gave no signal, classify on the tab names we actually read
const SHEET_TYPE_RULES: [RegExp, FileType][] = [
  [/multiple/i, 'multiples_export'],
  [/peer|comp/i, 'peer_comps'],
  [/consensus|estimate|revision|surprise|trend|guidance/i, 'consensus_estimates'],
  [/ownership|insider|holding/i, 'ownership_insider'],
  [/financ|income|balance|cash[\s_]?flow|profit|p&l/i, 'financials'],
]
function inferTypeFromSheets(sheets: WorkbookSheet[]): FileType {
  const names = sheets.map((s) => s.name).join(' | ')
  for (const [re, t] of SHEET_TYPE_RULES) if (re.test(names)) return t
  return 'other'
}

// ---- period / age ----
function monthsSince(year: number, month: number): number {
  const now = new Date()
  return (now.getFullYear() - year) * 12 + (now.getMonth() + 1 - month)
}

function extractPeriod(filename: string, sniff: string): { hint: string | null; ageMonths: number | null } {
  const hay = `${filename}\n${sniff.slice(0, 2000)}`
  // fiscal year e.g. FY24-25, FY2024-25, FY25
  let m = hay.match(/FY\s?(\d{4})[-/](\d{2,4})/i)
  if (m) {
    const endY = m[2].length === 2 ? 2000 + Number(m[2]) : Number(m[2])
    return { hint: `FY${m[1]}-${m[2]}`, ageMonths: Math.max(0, monthsSince(endY, 3)) }
  }
  m = hay.match(/\bFY\s?(\d{2})\b/i)
  if (m) {
    const endY = 2000 + Number(m[1])
    return { hint: `FY${m[1]}`, ageMonths: Math.max(0, monthsSince(endY, 3)) }
  }
  // quarter e.g. Q1 2026 / q1-2026
  m = hay.match(/\bQ([1-4])[\s\-_]?(20\d{2})\b/i)
  if (m) {
    const q = Number(m[1])
    return { hint: `Q${m[1]} ${m[2]}`, ageMonths: Math.max(0, monthsSince(Number(m[2]), q * 3)) }
  }
  // plain 4-digit year, take the most recent plausible one
  const years = [...hay.matchAll(/\b(20[1-3]\d)\b/g)].map((x) => Number(x[1])).filter((y) => y <= new Date().getFullYear() + 1)
  if (years.length) {
    const y = Math.max(...years)
    return { hint: String(y), ageMonths: Math.max(0, monthsSince(y, 6)) }
  }
  return { hint: null, ageMonths: null }
}

// ---- classification ----
function classify(filename: string, sniff: string): { type: FileType; confidence: 'high' | 'medium' | 'low'; basis: 'filename' | 'content' | 'extension' } {
  const f = filename.toLowerCase()
  const ext = path.extname(f)
  const test = (re: RegExp) => re.test(f)
  const testC = (re: RegExp) => re.test(sniff)

  if (test(/\.gdoc$/)) return { type: 'user_note', confidence: 'high', basis: 'filename' }
  if (test(/annual\s?report|10-?k|integrated annual/)) return { type: 'annual_filing', confidence: 'high', basis: 'filename' }
  if (test(/10-?q|quarterly|interim|half[\s\-]?year|q[1-4][\s\-_]?20\d{2}/)) return { type: 'quarterly_filing', confidence: 'high', basis: 'filename' }
  if (test(/transcript|conference[\s\-_]?call|earnings[\s\-_]?call|_call\b/)) return { type: 'transcript', confidence: 'high', basis: 'filename' }
  if (test(/estimates?|consensus/)) return { type: 'consensus_estimates', confidence: 'high', basis: 'filename' }
  if (test(/revision|surprise|recent changes|trends/)) return { type: 'consensus_estimates', confidence: 'medium', basis: 'filename' }
  if (test(/analyst[\s_]?coverage|research[\s_]?coverage|broker[\s_]?(recommendation|rating)/)) return { type: 'consensus_estimates', confidence: 'high', basis: 'filename' }
  if (test(/multiples/)) return { type: 'multiples_export', confidence: 'high', basis: 'filename' }
  if (test(/comparable|comps|peer/)) return { type: 'peer_comps', confidence: 'high', basis: 'filename' }
  if (test(/ownership|insider|shareholding|public[\s_]?holding|holding[\s_]?pattern/)) return { type: 'ownership_insider', confidence: 'high', basis: 'filename' }
  if (test(/proxy|def[\s_]?14a|compensation|remuneration|professionals/)) return { type: 'proxy_comp', confidence: 'medium', basis: 'filename' }
  if (test(/guidance/)) return { type: 'guidance', confidence: 'high', basis: 'filename' }
  if (test(/financials|income|balance|cash[\s_]?flow/)) return { type: 'financials', confidence: 'high', basis: 'filename' }
  if (test(/presentation|deck|investor/)) return { type: 'investor_deck', confidence: 'high', basis: 'filename' }
  if (test(/company profile|tearsheet|landscape|suppliers|customers|products/)) return { type: 'other', confidence: 'low', basis: 'filename' }

  // content sniff for opaque names (UUID PDFs)
  if (sniff) {
    if (testC(/ANNUAL REPORT|Form 10-K|Independent Auditor|Integrated Annual/i)) return { type: 'annual_filing', confidence: 'medium', basis: 'content' }
    if (testC(/Form 10-Q|three months ended|unaudited condensed|interim (results|report|financial)|half[\s-]?year/i)) return { type: 'quarterly_filing', confidence: 'medium', basis: 'content' }
    if (testC(/prepared remarks|Question-and-Answer|Operator[,:]|Thank you for joining|earnings call/i)) return { type: 'transcript', confidence: 'medium', basis: 'content' }
    if (testC(/investor presentation|earnings presentation/i)) return { type: 'investor_deck', confidence: 'medium', basis: 'content' }
    if (testC(/Equity Analyst Coverage|Recommendation[\s\S]{0,60}Target Price|Target Price[\s\S]{0,60}Recommendation|broker recommendation/i)) return { type: 'consensus_estimates', confidence: 'medium', basis: 'content' }
  }
  if (ext === '.xls' || ext === '.xlsx') return { type: 'other', confidence: 'low', basis: 'extension' }
  return { type: 'other', confidence: 'low', basis: 'extension' }
}

function classifyFile(dir: string, filename: string): ClassifiedFile {
  const full = path.join(dir, filename)
  const st = fs.statSync(full)
  const sniff = sniffText(full, st.size, st.mtimeMs)
  let { type, confidence, basis } = classify(filename, sniff)
  const { hint, ageMonths } = extractPeriod(filename, sniff)
  // fall back to file mtime age when no period could be parsed
  const mtimeAge = Math.max(0, Math.round((Date.now() - st.mtimeMs) / (1000 * 60 * 60 * 24 * 30.4)))
  const ext = path.extname(filename).toLowerCase()

  // Crack open spreadsheets so a multi-tab workbook is never one opaque "other / low" row:
  // read its tabs via the canonical extractor and, when the filename gave no signal,
  // classify on what's actually inside.
  let sheets: WorkbookSheet[] | undefined
  if (ext === '.xls' || ext === '.xlsx' || ext === '.xlsm') {
    sheets = readWorkbookSheets(full, st.size, st.mtimeMs)
    if (sheets && sheets.length) {
      if (basis === 'extension') {
        type = inferTypeFromSheets(sheets)
        confidence = 'medium'
        basis = 'content'
      } else if (confidence === 'low') {
        confidence = 'medium'
        basis = 'content'
      }
    }
  }

  return {
    filename,
    ext,
    sizeBytes: st.size,
    mtime: new Date(st.mtimeMs).toISOString(),
    type,
    periodHint: hint,
    ageMonths: ageMonths ?? mtimeAge,
    confidence,
    basis,
    ...(sheets && sheets.length ? { sheets } : {}),
  }
}

// ---- per-module sufficiency ----
const recent = (age: number | null, months: number) => (age == null ? true : age <= months)

// Interpret a module's self-declared readiness rule against the files present. This is how a NEW
// module gets a tailored verdict with ZERO edits here — it ships the rule in its own 00-triage
// frontmatter. Required missing => Insufficient; all `sufficient` present => Sufficient; else Partial.
export function evalDecl(decl: DataReadinessDecl, has: (t: FileType) => boolean): ModuleReadiness {
  const required = decl.required ?? []
  const sufficient = decl.sufficient ?? []
  const missingRequired = required.filter((t) => !has(t))
  if (missingRequired.length) return { status: 'Insufficient', reasons: [`missing required data: ${missingRequired.join(', ')}`], caps: [] }
  const caps: string[] = []
  for (const [t, note] of Object.entries(decl.caps ?? {})) if (!has(t as FileType) && note) caps.push(note)
  const missing = sufficient.filter((t) => !has(t))
  if (!missing.length) return { status: 'Sufficient', reasons: [sufficient.length ? `expected inputs present: ${sufficient.join(', ')}` : 'inputs present'], caps }
  return { status: 'Partial', reasons: [`present, missing: ${missing.join(', ')}`], caps }
}

function evaluateModules(files: ClassifiedFile[], moduleNames: string[]): Record<string, ModuleReadiness> {
  const has = (t: FileType) => files.some((f) => f.type === t)
  const minAge = (types: FileType[]) => {
    const ages = files.filter((f) => types.includes(f.type)).map((f) => f.ageMonths).filter((a): a is number => a != null)
    return ages.length ? Math.min(...ages) : null
  }
  const hasAnnual = has('annual_filing')
  const hasQuarterly = has('quarterly_filing')
  const hasTranscript = has('transcript')
  const hasDeck = has('investor_deck')
  const hasPeriodic = hasQuarterly || hasTranscript || hasDeck
  const hasFinancials = has('financials') || hasAnnual
  const hasConsensus = has('consensus_estimates')
  const hasMultiples = has('multiples_export')
  const hasPeerComps = has('peer_comps')
  const hasOwnership = has('ownership_insider')
  const hasProxyComp = has('proxy_comp') || hasAnnual
  // A pool-verified CURRENT price is valuation's #1 gate (reverse-DCF + margin-of-safety). It is NOT
  // a consensus/multiples export — those carry no live, dated quote. Detect a real price signal only:
  // an IBKR/exchange/tear-sheet quote file or a price/quote workbook tab. (Was faked as
  // `hasConsensus || hasMultiples`, which overstated valuation readiness on every pool that had a
  // vendor export but no actual price.)
  const hasCurrentPrice = files.some((f) => /price|quote|ibkr|tear[\s_]?sheet|snapshot[\s_]?quote/i.test(f.filename) || (f.sheets ?? []).some((s) => /price|quote|trading[\s_]?summary/i.test(s.name)))
  const hasDebtNote = hasAnnual || hasQuarterly
  const hasGovernance = hasAnnual || hasProxyComp || hasOwnership

  const annualAge = minAge(['annual_filing'])
  const periodicAge = minAge(['quarterly_filing', 'transcript', 'investor_deck'])

  const out: Record<string, ModuleReadiness> = {}

  // business-model
  {
    const annualOk = hasAnnual && recent(annualAge, 18)
    const periodicOk = hasPeriodic && recent(periodicAge, 9)
    let status: Sufficiency = 'Insufficient'
    const reasons: string[] = []
    if (annualOk && periodicOk) {
      status = 'Sufficient'
      reasons.push('annual filing + recent quarterly/transcript/deck present')
    } else if (annualOk || periodicOk) {
      status = 'Partial'
      reasons.push(annualOk ? 'annual filing present, no recent quarterly/transcript' : 'recent quarterly/transcript present, no annual filing')
    } else {
      reasons.push('no recent annual filing or quarterly/transcript')
    }
    out['business-model'] = { status, reasons, caps: [] }
  }

  // earnings
  {
    const core = hasFinancials && (hasPeriodic || hasAnnual)
    const caps: string[] = []
    let status: Sufficiency = 'Insufficient'
    const reasons: string[] = []
    if (!hasFinancials) {
      reasons.push('no income statement / cash-flow base to analyze earnings')
    } else if (core && hasConsensus) {
      status = 'Sufficient'
      reasons.push('financials + recent period + consensus estimates present')
    } else {
      status = 'Partial'
      reasons.push(core ? 'financials present' : 'financials present, period recency limited')
      if (!hasConsensus) caps.push('consensus read capped (agents 04/05/99)')
      if (!hasPeriodic) caps.push('quarterly trend capped (agents 01/02/03/06)')
    }
    out['earnings'] = { status, reasons, caps }
  }

  // valuation
  {
    const methods = [hasFinancials, hasPeerComps || hasMultiples, hasFinancials, hasFinancials && hasCurrentPrice].filter(Boolean).length
    const caps: string[] = []
    let status: Sufficiency = 'Insufficient'
    const reasons: string[] = []
    if (methods < 2 || !hasFinancials) {
      reasons.push('fewer than two valuation methods runnable')
    } else if (hasFinancials && hasCurrentPrice && (hasConsensus || hasPeerComps || hasMultiples)) {
      status = 'Sufficient'
      reasons.push('financials + current price + comps/consensus present (≥4 methods)')
    } else {
      status = 'Partial'
      reasons.push('valuation base present')
      if (!hasCurrentPrice) caps.push('margin of safety not assessable (no current price)')
      if (!hasPeerComps) caps.push('relative-valuation peers limited')
    }
    out['valuation'] = { status, reasons, caps }
  }

  // balance-sheet-survival
  {
    const caps: string[] = []
    let status: Sufficiency = 'Insufficient'
    const reasons: string[] = []
    if (!hasFinancials) {
      reasons.push('no balance sheet to establish leverage')
    } else if (hasFinancials && hasDebtNote) {
      status = 'Sufficient'
      reasons.push('balance sheet + debt note + cash flow present')
      caps.push('covenant/maturity detail limited unless a credit agreement is in the pool')
    } else {
      status = 'Partial'
      reasons.push('balance sheet present, debt detail limited')
      caps.push('maturity wall + covenant headroom not assessable')
    }
    out['balance-sheet-survival'] = { status, reasons, caps }
  }

  // management-governance
  {
    const caps: string[] = []
    let status: Sufficiency = 'Insufficient'
    const reasons: string[] = []
    if (!hasGovernance) {
      reasons.push('no governance / ownership / proxy disclosure')
    } else if (hasGovernance && hasOwnership && hasProxyComp) {
      status = 'Sufficient'
      reasons.push('proxy/comp + ownership + board/RPT disclosure present')
    } else {
      status = 'Partial'
      reasons.push('partial governance disclosure')
      if (!hasOwnership) caps.push('ownership/insider behavior limited')
      if (!has('proxy_comp')) caps.push('compensation detail limited (no standalone proxy)')
    }
    out['management-governance'] = { status, reasons, caps }
  }

  // self-declared modules: any module shipping a `data_readiness` rule in its 00-triage frontmatter
  // gets a tailored verdict here — no hand-written rule in this file. (Founding modules above keep
  // their bespoke rules; a new module needs only its own declaration, else it falls to generic.)
  const decls = moduleReadinessDecls()
  for (const name of moduleNames) {
    if (out[name]) continue
    const d = decls[name]
    if (d) out[name] = evalDecl(d, has)
  }

  // generic fallback — keeps readiness self-discovering for any other module the engine adds,
  // without a hand-written rule AND without a declaration. Evidence-based on recent filings.
  for (const name of moduleNames) {
    if (out[name]) continue
    const annualOk = hasAnnual && recent(annualAge, 18)
    const periodicOk = hasPeriodic && recent(periodicAge, 9)
    let status: Sufficiency = 'Insufficient'
    const reasons: string[] = []
    if (annualOk && periodicOk) {
      status = 'Sufficient'
      reasons.push('recent annual + quarterly/transcript present')
    } else if (annualOk || periodicOk || hasFinancials) {
      status = 'Partial'
      reasons.push('some filings present; module-specific rule not yet encoded')
    } else {
      reasons.push('no recent filings')
    }
    out[name] = { status, reasons, caps: [] }
  }

  return out
}

// ---- source-document coverage (the upload-aligned view) ----
// A human uploads SOURCE DOCUMENTS, not internal FileTypes. These groups model the actual upload set,
// derived from what each module's triage DECLARES it needs (audited from the orbs/MODULE_RULES). Each
// group carries a TIER (how much a gap costs) and a precise quantity/recency in `helps` (e.g. "3-5yr +
// 8 quarters", "latest only ≤18mo"), so the guide says exactly what to drop in — not a vague "filings".
//
// Presence is detected file-type / filename / tab-aware: a group is satisfied by a file of a matching
// type, OR a filename pattern (so a "Credit Health Panel" / "Events Calendar" lands in the right group
// even though classify() left it generic), OR a workbook TAB whose name matches (so a "Multiples" tab
// inside a 'financials' workbook still counts). Each present group names the file/tab that satisfies it
// and flags staleness. deriveCoverage([]) yields all-absent groups — the empty-state upload guide.
type CoverageTier = 'critical' | 'core' | 'recommended' | 'optional'
interface CoverageSpec {
  types?: FileType[] // file-level types that satisfy it
  name?: RegExp // a filename pattern that satisfies it (for docs classify() leaves generic)
  tab?: RegExp // a workbook tab name that satisfies it (tab-aware)
  prefer?: RegExp // among same-type matches, name the file whose filename matches this (else the freshest)
}
interface CoverageGroupDef extends CoverageSpec {
  key: string
  label: string
  tier: CoverageTier
  helps: string // precise: how much / how recent + the consequence if absent
  staleAfterMonths?: number // present-but-old threshold; omitted => never flagged stale
  covers?: ({ key: string; label: string } & CoverageSpec)[]
}

const COVERAGE_GROUPS: CoverageGroupDef[] = [
  { key: 'price', label: 'Current price', tier: 'critical',
    helps: 'a dated quote, ≤ a few days old — reverse-DCF + margin-of-safety; without it valuation confidence caps at 55',
    name: /price|quote|ibkr|tear[\s_]?sheet|snapshot[\s_]?quote/i, tab: /price|quote|trading[\s_]?summary/i, staleAfterMonths: 1 },
  { key: 'annual', label: 'Annual report', tier: 'core',
    helps: 'the latest audited annual only (≤18mo) — the spine every module reads; more annuals optional (history)',
    types: ['annual_filing'], staleAfterMonths: 18 },
  { key: 'interim', label: 'Interim / quarterly', tier: 'core',
    helps: 'the latest interim/quarterly (≤~6mo) — recent trend & earnings',
    types: ['quarterly_filing'], tab: /quarter|interim/i, staleAfterMonths: 6 },
  { key: 'transcript', label: 'Earnings transcript', tier: 'core',
    helps: 'the latest earnings call — guidance & candor; more quarters optional (trend)',
    types: ['transcript'], staleAfterMonths: 6 },
  { key: 'estimates', label: 'Consensus estimates', tier: 'core',
    helps: 'current consensus + revisions (90/60/30d) — the bar to beat; without it earnings consensus caps at 30',
    types: ['consensus_estimates'], tab: /consensus|estimate|revision|trend|surprise|analyst[\s_]?coverage/i },
  { key: 'governance', label: 'Ownership & governance', tier: 'core',
    helps: 'latest proxy/AGM + shareholding + insider trades (12mo) — pay, board, holdings',
    types: ['proxy_comp', 'ownership_insider'], name: /professional|holding|ownership|insider|proxy/i,
    tab: /ownership|insider|holding|board|director|remuneration/i,
    covers: [
      { key: 'board', label: 'board/pros', types: ['proxy_comp'], name: /professional|board|director/i },
      { key: 'holdings', label: 'shareholding', types: ['ownership_insider'], name: /holding|ownership|shareholding/i },
      { key: 'insider', label: 'insider', name: /insider/i },
    ] },
  { key: 'financials', label: 'Financials extract', tier: 'recommended',
    helps: '3–5yr annual + last 8 quarters (income · balance sheet · cash flow) — earnings & valuation base',
    types: ['financials'], prefer: /financ/i, tab: /income|balance|cash[\s_]?flow|p&l|profit[\s_]?&[\s_]?loss/i },
  { key: 'peers', label: 'Peer comps & multiples', tier: 'recommended',
    helps: 'current peer multiples + 3–5yr own-history bands — relative & own-history valuation',
    types: ['peer_comps', 'multiples_export'], tab: /peer|comparable|comps|multiple/i },
  { key: 'balance-credit', label: 'Balance-sheet & credit', tier: 'recommended',
    helps: 'debt note + maturity schedule (5yr) + covenants + latest rating — leverage & solvency',
    name: /credit[\s_]?health|rating|covenant|debenture|indenture|credit[\s_]?agreement/i,
    tab: /solvency|liquidity[\s_]?metric|credit[\s_]?health|covenant|maturit/i,
    covers: [
      { key: 'credit-health', label: 'credit health', name: /credit[\s_]?health/i, tab: /solvency|liquidity/i },
      { key: 'rating', label: 'rating', name: /rating|crisil|icra|moody|fitch|s&p|care[\s_]?rating/i },
      { key: 'debt-terms', label: 'debt terms', name: /covenant|debenture|indenture|credit[\s_]?agreement/i, tab: /maturit|covenant/i },
    ] },
  { key: 'catalyst', label: 'Catalyst calendar', tier: 'optional',
    helps: 'dated events over the next 12 months — results, AGM, dividend, maturities',
    name: /events?[\s_]?calendar|calendar/i, tab: /events?[\s_]?calendar|calendar/i },
  { key: 'deck', label: 'Investor deck', tier: 'optional',
    helps: 'clearer segment splits & KPI slides than the filings',
    types: ['investor_deck'] },
]

// Match a group against the pool: prefer a whole-file match (file-type, then filename), else a tab match.
function matchCoverage(files: ClassifiedFile[], spec: CoverageSpec): { via: 'file' | 'tab' | null; file: ClassifiedFile | null; sheet: string | null } {
  const { types = [], name, tab, prefer } = spec
  // 1. file-type match (strongest) — a filename-hinted file wins (so "Financials extract" names the
  //    Financials.xls, not a same-typed Credit Health Panel), then the freshest.
  let fileHit: ClassifiedFile | null = null
  for (const f of files) {
    if (!types.includes(f.type)) continue
    if (!fileHit) { fileHit = f; continue }
    const fp = prefer ? prefer.test(f.filename) : false
    const hp = prefer ? prefer.test(fileHit.filename) : false
    if (fp !== hp) { if (fp) fileHit = f; continue }
    if ((f.ageMonths ?? 9999) < (fileHit.ageMonths ?? 9999)) fileHit = f
  }
  if (fileHit) return { via: 'file', file: fileHit, sheet: null }
  // 2. filename match (for docs classify() leaves generic — credit health, events calendar, a price quote)
  if (name) {
    for (const f of files) if (name.test(f.filename)) return { via: 'file', file: f, sheet: null }
  }
  // 3. tab match (data lives inside a workbook tab)
  if (tab) {
    for (const f of files) for (const s of f.sheets ?? []) if (tab.test(s.name)) return { via: 'tab', file: f, sheet: s.name }
  }
  return { via: null, file: null, sheet: null }
}

// Build the upload-aligned coverage view from the classified pool (empty pool => the upload guide).
export function deriveCoverage(files: ClassifiedFile[]): CoverageGroup[] {
  return COVERAGE_GROUPS.map((g) => {
    const m = matchCoverage(files, g)
    const ageMonths = m.file?.ageMonths ?? null
    const stale = m.via != null && g.staleAfterMonths != null && ageMonths != null && ageMonths > g.staleAfterMonths
    const covers = g.covers?.map((c) => ({ key: c.key, label: c.label, present: matchCoverage(files, c).via != null }))
    return {
      key: g.key, label: g.label, tier: g.tier, helps: g.helps,
      present: m.via != null, via: m.via,
      filename: m.file?.filename ?? null, sheet: m.sheet, ageMonths, stale, covers,
    }
  })
}

export function analyzeTicker(ticker: string): DataStatus {
  // Containment: the /api/data-status route validates TICKER_RE, but that allows dots — a lone '..'
  // slips through path.join and escapes DATA_DIR. Resolve and confine to DATA_DIR; an escaping ticker
  // returns the empty (no-data) status. EARLY return so the guard dominates every read below (incl.
  // classifyFile), never just the readdir — that's what makes `dir` safe at every sink. (Clears CodeQL
  // js/path-injection.)
  const dir = path.resolve(DATA_DIR, ticker)
  if (dir !== DATA_DIR && !dir.startsWith(DATA_DIR + path.sep)) {
    const modules = Object.fromEntries(listModuleNames().map((m) => [m, { status: 'Insufficient' as Sufficiency, reasons: ['no data uploaded'], caps: [] }]))
    return { ticker, hasAnyData: false, fileCount: 0, files: [], recentByType: {}, modules, coverage: deriveCoverage([]), overallReady: false, dataDir: DATA_DIR, ts: Date.now() }
  }
  let filenames: string[] = []
  try {
    filenames = fs.readdirSync(dir).filter((n) => !n.startsWith('.') && fs.statSync(path.join(dir, n)).isFile())
  } catch {
    filenames = []
  }
  const files = filenames.map((n) => classifyFile(dir, n)).sort((a, b) => a.filename.localeCompare(b.filename))

  const recentByType: DataStatus['recentByType'] = {}
  for (const f of files) {
    const cur = recentByType[f.type]
    if (!cur || (f.ageMonths ?? 999) < (cur.ageMonths ?? 999)) {
      recentByType[f.type] = { filename: f.filename, ageMonths: f.ageMonths }
    }
  }

  const modules = files.length ? evaluateModules(files, listModuleNames()) : Object.fromEntries(listModuleNames().map((m) => [m, { status: 'Insufficient' as Sufficiency, reasons: ['no data uploaded'], caps: [] }]))
  const overallReady = Object.values(modules).some((m) => m.status === 'Sufficient')

  return {
    ticker,
    hasAnyData: files.length > 0,
    fileCount: files.length,
    files,
    recentByType,
    modules,
    coverage: deriveCoverage(files),
    overallReady,
    dataDir: dir,
    ts: Date.now(),
  }
}

// ---- tickers list ----
export function listTickers(): { tickers: TickerSummary[]; emptyState: boolean; dataDir: string; coverage: CoverageGroup[] } {
  let names: string[] = []
  try {
    names = fs.readdirSync(DATA_DIR).filter((n) => {
      try {
        return !n.startsWith('.') && fs.statSync(path.join(DATA_DIR, n)).isDirectory()
      } catch {
        return false
      }
    })
  } catch {
    names = []
  }
  const tickers: TickerSummary[] = names.sort().map((ticker) => {
    let fileCount = 0
    try {
      // count only top-level FILES (not subfolders) — so engine-written "Memos …" output folders saved
      // back into the company folder don't inflate the data-file count
      fileCount = fs.readdirSync(path.join(DATA_DIR, ticker)).filter((n) => {
        if (n.startsWith('.')) return false
        try { return fs.statSync(path.join(DATA_DIR, ticker, n)).isFile() } catch { return false }
      }).length
    } catch {}
    const invalidReason = tickerInvalidReason(ticker)
    const { syncing, lastChangeAt } = syncingState(ticker)
    return {
      ticker,
      fileCount,
      hasAnyData: fileCount > 0,
      valid: invalidReason === null,
      invalidReason: invalidReason ?? undefined,
      suggestedTicker: invalidReason ? suggestTicker(ticker) : undefined,
      syncing,
      lastChangeAt,
      latestRun: latestDecision(ticker),
    }
  })
  // resolve the data/ symlink so the UI shows the real Google Drive location it reads from
  let dataDir = DATA_DIR
  try {
    dataDir = fs.realpathSync(DATA_DIR)
  } catch {}
  // coverage = the default upload guide (all unmet), so the cockpit can show "upload these first"
  // even with ZERO ticker folders — the most important onboarding moment, where there is no ticker
  // (and so no per-ticker dataStatus) to derive it from.
  return { tickers, emptyState: tickers.length === 0, dataDir, coverage: deriveCoverage([]) }
}

function latestDecision(ticker: string): TickerSummary['latestRun'] {
  try {
    const dirs = fs
      .readdirSync(ANALYSES_DIR)
      .filter((n) => n.startsWith(ticker + '_'))
      .sort()
      .reverse()
    for (const d of dirs) {
      const drPath = path.join(ANALYSES_DIR, d, 'decision_record.json')
      if (fs.existsSync(drPath)) {
        const dr = JSON.parse(fs.readFileSync(drPath, 'utf8'))
        return {
          runRoot: `analyses/${d}`,
          decision: dr.decision ?? null,
          decisionDate: dr.decision_date ?? null,
          confidence: typeof dr.confidence_score === 'number' ? dr.confidence_score : null,
        }
      }
      return { runRoot: `analyses/${d}`, decision: null, decisionDate: null, confidence: null }
    }
  } catch {}
  return null
}
