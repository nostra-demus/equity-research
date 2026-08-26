// Where the fund book lives on disk, and how it is rebuilt.
//
// STATEMENTS ARE THE SOURCE OF TRUTH; THE BOOK IS DERIVED. Only the raw Flex exports are stored — the
// book is rebuilt from them on read. That costs a parse (a year of statement is ~2 MB) and buys the
// thing that matters: when the importer improves, every past number improves with it. Persisting the
// derived book instead would freeze today's arithmetic, bugs included, and there would be no way back
// to the source once the original download was gone.
//
// THIS DATA NEVER ENTERS GIT. It is real positions and real NAV, so it lives under STATE_DIR
// (`.state/`, covered by the repo's `**/.state/` ignore rule) rather than in the research-data lane
// that auto-commits to main. That is a storage choice only — uploading, reading and rebuilding all
// work exactly as they would anywhere else.

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { STATE_DIR } from './config'
import { feedPresent, readCloses } from './market-feed'
import { alignFlowsToNavDates, buildBook, type Book } from './portfolio'
import { parseFlexXml, type FlexDocument } from './portfolio-import'
import {
  addManual, clearSuperseded, deleteManual, normalizeManual, provisionalRead, readManual,
  type ManualInput, type ManualRead, type StatementCoverage,
} from './portfolio-manual'
import { readLinks, setLink, thesisRead, type PortfolioThesisRead } from './portfolio-thesis'
import { benchmarkCompare, betaAlpha, dailyReturns, measuredWindow, moneyWeightedReturn, monthlyReturns, returnsByPeriod, riskMetrics, type BenchmarkRead, type BetaAlpha, type MonthRow, type PeriodReturn, type RiskRead } from './portfolio-metrics'

export const PORTFOLIO_DIR = path.join(STATE_DIR, 'portfolio')
export const STATEMENTS_DIR = path.join(PORTFOLIO_DIR, 'statements')

/** One statement is a year of a real account; the cap is generous but bounded. */
export const STATEMENT_MAX_BYTES = 64 * 1024 * 1024

export interface StoredStatement {
  id: string
  filename: string
  bytes: number
  uploadedAt: string
  accountId: string | null
  fromDate: string | null
  toDate: string | null
  trades: number
  /** Row count per section, so the import screen can show WHICH reports a query actually returned.
   *  A Flex query missing Change in NAV still imports and still looks fine — this is where that shows. */
  sections: Record<string, number>
  /** Sections the statement carried that the importer does not read. */
  unmodelled: string[]
}

function ensureDirs(): void {
  fs.mkdirSync(STATEMENTS_DIR, { recursive: true })
}

/** Content hash, so re-uploading a file the book already holds is a no-op rather than a duplicate.
 *  The importer dedups rows too, but stopping here keeps the store itself honest about what it has. */
function statementId(xml: string): string {
  return crypto.createHash('sha256').update(xml).digest('hex').slice(0, 16)
}

function metaPath(id: string): string { return path.join(STATEMENTS_DIR, `${id}.json`) }
function xmlPath(id: string): string { return path.join(STATEMENTS_DIR, `${id}.xml`) }

export function listStatements(): StoredStatement[] {
  ensureDirs()
  let names: string[] = []
  try { names = fs.readdirSync(STATEMENTS_DIR).filter((n) => n.endsWith('.json')) } catch { return [] }
  const out: StoredStatement[] = []
  for (const name of names) {
    let raw: Partial<StoredStatement> & { id?: string }
    try { raw = JSON.parse(fs.readFileSync(path.join(STATEMENTS_DIR, name), 'utf8')) } catch { continue }
    out.push(backfill(raw as StoredStatement))
  }
  return out.sort((a, b) => (a.toDate ?? '').localeCompare(b.toDate ?? ''))
}

/** Fill in fields a sidecar written by an older build does not carry.
 *
 *  The counts are re-derived from the statement itself and the sidecar rewritten, so the work happens
 *  once per file rather than on every read. A statement whose XML has since become unreadable falls
 *  back to empty rather than refusing the listing — the operator needs that row precisely so they can
 *  remove the bad file. */
function backfill(s: StoredStatement): StoredStatement {
  if (s.sections && s.unmodelled) return s
  const empty: StoredStatement = { ...s, sections: s.sections ?? {}, unmodelled: s.unmodelled ?? [] }
  if (!s.id) return empty
  let doc
  try { doc = parseFlexXml(fs.readFileSync(xmlPath(s.id), 'utf8')) } catch { return empty }
  const filled: StoredStatement = { ...s, sections: sectionCounts(doc), unmodelled: doc.sectionsUnmodelled }
  try { fs.writeFileSync(metaPath(s.id), JSON.stringify(filled, null, 2) + '\n') } catch { /* read-only store — still return the counts */ }
  return filled
}

/** What the file actually carried, section by section. A Flex query with a section left unticked
 *  imports cleanly and reconciles green while silently missing dividends or NAV; these counts are how
 *  that is caught. */
function sectionCounts(doc: FlexDocument): Record<string, number> {
  return {
    Trades: doc.trades.length,
    'Open positions': doc.openPositions.length,
    'Cash transactions': doc.cashTransactions.length,
    'Corporate actions': doc.corporateActions.length,
    'Change in NAV': doc.changeInNav ? 1 : 0,
    'Daily NAV': doc.equitySummary.length,
    'Conversion rates': doc.conversionRates.length,
  }
}

export interface SaveResult {
  status: 'saved' | 'duplicate'
  statement: StoredStatement
}

/** Parse BEFORE writing. A file that is not a readable Flex export never reaches the store, so a failed
 *  upload can never leave a half-book behind that later reads as real. */
export function saveStatement(xml: string, filename: string): SaveResult {
  const doc = parseFlexXml(xml) // throws with a useful message on anything that is not a Flex export
  ensureDirs()
  const id = statementId(xml)
  const statement: StoredStatement = {
    id,
    filename,
    bytes: Buffer.byteLength(xml, 'utf8'),
    uploadedAt: new Date().toISOString(),
    accountId: doc.accountIds[0] ?? doc.accountId,
    fromDate: doc.fromDate,
    toDate: doc.toDate,
    trades: doc.trades.length,
    sections: sectionCounts(doc),
    unmodelled: doc.sectionsUnmodelled,
  }
  if (fs.existsSync(xmlPath(id))) return { status: 'duplicate', statement }
  fs.writeFileSync(xmlPath(id), xml)
  fs.writeFileSync(metaPath(id), JSON.stringify(statement, null, 2) + '\n')
  invalidate()
  return { status: 'saved', statement }
}

export function deleteStatement(id: string): boolean {
  if (!/^[0-9a-f]{16}$/.test(id)) return false // ids are our own hashes — never a caller-supplied path
  let removed = false
  for (const p of [xmlPath(id), metaPath(id)]) {
    try { if (fs.existsSync(p)) { fs.rmSync(p, { force: true }); removed = true } } catch { /* best effort */ }
  }
  if (removed) invalidate()
  return removed
}

// Rebuilding parses every stored statement, so the result is cached against the exact set of files it
// was built from. Any upload or delete invalidates it.
let cache: { key: string; book: Book | null; error: string | null } | null = null
function invalidate(): void { cache = null }

function currentKey(statements: StoredStatement[]): string {
  return statements.map((s) => s.id).sort().join(',')
}

/** The benchmark and the cash hurdle the book is measured against. Both are stated on screen so the
 *  comparison can never be read as against something else. */
export const BENCHMARK_SYMBOL = 'SPY'
export const RISK_FREE_ANNUAL_PCT = 4.3

export interface PortfolioPerformance {
  periods: PeriodReturn[]
  /** Month by month, book against benchmark. */
  months: MonthRow[]
  /** How much index movement the book carries, and what it returned beyond that. */
  betaAlpha: BetaAlpha
  /** The two curves the growth chart draws, both REBASED to 100 at the first funded day so they are
   *  comparable: NAV itself cannot be plotted against an index because deposits move it without being
   *  performance. The book curve is the flow-adjusted index the returns are already built from. */
  growth: { date: string; book: number; benchmark: number | null }[]
  /** Distance below the previous high, day by day — the underwater curve. */
  underwater: { date: string; depth: number }[]
  /** The LP's lived return — reported alongside the time-weighted figure, never instead of it.
   *  ANNUALISED (XIRR), unlike the cumulative period returns above: the UI must label it as such. */
  moneyWeightedAnnualisedPct: number | null
  risk: RiskRead
  benchmark: BenchmarkRead
  riskFreeAnnualPct: number
  /** Whether any market feed exists at all, so the UI can tell "none configured" from "does not cover
   *  this window" — different problems with different fixes. */
  feedPresent: boolean
}

export interface PortfolioRead {
  statements: StoredStatement[]
  book: Book | null
  /** Hand-logged fills, marked against statement coverage. A SEPARATE layer: nothing here reaches the
   *  book or the reconciliation checks, which stay exactly as the broker states them. */
  manual: ManualRead
  /** What the engine's own research says about what is held. Read-only in both directions — a verdict
   *  never moves a position, and a position never moves a verdict. */
  thesis: PortfolioThesisRead
  /** Null whenever there is no book to measure. */
  performance: PortfolioPerformance | null
  /** Present when the stored statements cannot currently produce a book — two accounts, say. The
   *  statements are still listed, so the operator can see what to remove. */
  error: string | null
}

/** Returns, risk and the benchmark comparison for a built book. Derived on read like the book itself —
 *  nothing here is persisted, so improving the maths improves every past figure. */
export function performanceOf(book: Book): PortfolioPerformance {
  // THE SAME FUNCTION the book's own TWR uses, not a copy of it. A second implementation of the flow
  // alignment drifts from the first the moment either is corrected — and the copy that lived here had
  // already drifted, landing an unvaluable flow's raw local amount in the chain the original excludes.
  const flowsByDate = alignFlowsToNavDates(book.flows, book.navSeries)
  const closes = readCloses(BENCHMARK_SYMBOL)
  const returns = dailyReturns(book.navSeries, flowsByDate)
  // EVERY period is measured over the window the book actually held capital, never over every calendar
  // row the export happens to carry. A Flex export routinely starts months before the first deposit,
  // and measuring from there charges the book a full year of cash hurdle against a few months of
  // return — which does not merely overstate the hurdle, it FLIPS the sign of "over cash". It also
  // dated a four-month-old book "since 2025-08-22" on screen.
  const window = measuredWindow(book.navSeries, flowsByDate)

  // Both curves REBASED to 100 on the first day the book actually held capital. Plotting raw NAV
  // against an index would draw every deposit as a leap in performance; the book curve is the same
  // flow-adjusted index every return on this screen is already built from.
  const growth: { date: string; book: number; benchmark: number | null }[] = []
  if (returns.length > 0) {
    const start = returns[0]!.date
    const inWindow = closes.filter((c) => c.date >= start).sort((a, b) => a.date.localeCompare(b.date))
    const base = inWindow.length ? inWindow[0]!.close : null
    const byDate = new Map(inWindow.map((c) => [c.date, c.close]))
    let index = 100
    let lastBm: number | null = base ? 100 : null
    growth.push({ date: start, book: 100, benchmark: lastBm })
    for (const { date, r } of returns) {
      index *= 1 + r
      const close = byDate.get(date)
      // Carry the last level across a day the feed does not price, rather than breaking the line.
      if (close !== undefined && base) lastBm = (close / base) * 100
      growth.push({ date, book: index, benchmark: lastBm })
    }
  }

  // The underwater curve, from that same index — so a withdrawal is never drawn as a drawdown.
  const underwater: { date: string; depth: number }[] = []
  if (returns.length > 0) {
    let index = 1
    let peak = 1
    underwater.push({ date: returns[0]!.date, depth: 0 })
    for (const { date, r } of returns) {
      index *= 1 + r
      peak = Math.max(peak, index)
      underwater.push({ date, depth: (index / peak - 1) * 100 })
    }
  }

  return {
    periods: returnsByPeriod(window, flowsByDate, RISK_FREE_ANNUAL_PCT),
    months: monthlyReturns(book.navSeries, flowsByDate, closes),
    betaAlpha: betaAlpha(returns, closes, RISK_FREE_ANNUAL_PCT),
    growth,
    underwater,
    moneyWeightedAnnualisedPct: moneyWeightedReturn(book.navSeries, flowsByDate),
    risk: riskMetrics(book.navSeries, flowsByDate, RISK_FREE_ANNUAL_PCT),
    benchmark: benchmarkCompare(BENCHMARK_SYMBOL, book.twr, window, closes),
    riskFreeAnnualPct: RISK_FREE_ANNUAL_PCT,
    feedPresent: feedPresent(),
  }
}

function coverageOf(statements: StoredStatement[]): StatementCoverage[] {
  return statements.map((s) => ({ id: s.id, filename: s.filename, fromDate: s.fromDate, toDate: s.toDate }))
}

/** The provisional layer for the current store. Whether an entry is superseded is DERIVED from the
 *  statements present right now — so removing a statement makes the entries it answered live again,
 *  which is the honest answer rather than a stale flag frozen at upload time. */
function manualRead(statements: StoredStatement[], book: Book | null): ManualRead {
  return provisionalRead(readManual(PORTFOLIO_DIR), coverageOf(statements), book?.positions ?? [])
}

/** Derived on every read like the book itself: a dossier published since the last look shows up without
 *  anything having to be re-imported, and a verdict is never frozen into the book's own state. */
function thesisOf(book: Book | null): PortfolioThesisRead {
  const today = new Date().toISOString().slice(0, 10)
  return thesisRead(book?.positions ?? [], readLinks(PORTFOLIO_DIR), today)
}

export function logManualTrade(input: ManualInput): PortfolioRead {
  const today = new Date().toISOString().slice(0, 10)
  addManual(PORTFOLIO_DIR, normalizeManual(input, today))
  return readPortfolio()
}

export function removeManualTrade(id: string): boolean {
  return deleteManual(PORTFOLIO_DIR, id)
}

/** Point a holding at the engine's research for a company, or pass null to unlink. Validated in
 *  portfolio-thesis.ts so every caller obeys the same rule. */
export function linkThesis(symbol: string, ticker: string | null): PortfolioRead {
  setLink(PORTFOLIO_DIR, symbol, ticker)
  return readPortfolio()
}

/** Drop every entry a statement now covers. Returns how many went, so the UI can say it out loud
 *  instead of the list simply shrinking. */
export function clearSupersededManual(): number {
  return clearSuperseded(PORTFOLIO_DIR, coverageOf(listStatements()))
}

export function readPortfolio(): PortfolioRead {
  const statements = listStatements()
  if (statements.length === 0) {
    return {
      statements, book: null, performance: null, error: null,
      manual: manualRead(statements, null), thesis: thesisOf(null),
    }
  }
  const key = currentKey(statements)
  if (cache && cache.key === key) {
    // The manual layer is NOT cached with the book: it changes on its own, and it is a file read plus a
    // roll-up over at most a couple of hundred rows.
    return {
      statements, book: cache.book, error: cache.error,
      performance: cache.book ? performanceOf(cache.book) : null,
      manual: manualRead(statements, cache.book),
      thesis: thesisOf(cache.book),
    }
  }

  // EVERY listed statement must load, or there is no book. Skipping an unreadable one and building from
  // the rest returns a green, complete-looking book that is silently missing whole months of trades and
  // NAV — while the screen still lists the statement that was dropped. A partial book nobody is told
  // about is the failure this store exists to prevent.
  const docs: FlexDocument[] = []
  const unreadable: string[] = []
  for (const s of statements) {
    try { docs.push(parseFlexXml(fs.readFileSync(xmlPath(s.id), 'utf8'))) }
    catch { unreadable.push(s.filename || s.id) } // names only — the caught error carries absolute paths
  }
  let book: Book | null = null
  let error: string | null = null
  if (unreadable.length) {
    error = `${unreadable.length} stored statement${unreadable.length === 1 ? '' : 's'} could not be read (${unreadable.join(', ')}) — remove ${unreadable.length === 1 ? 'it' : 'them'} and re-import, because a book built from the rest would be quietly incomplete`
  } else {
    try {
      book = buildBook(docs)
    } catch (e: any) {
      error = String(e?.message || e)
    }
  }
  cache = { key, book, error }
  return {
    statements, book, error,
    performance: book ? performanceOf(book) : null,
    manual: manualRead(statements, book),
    thesis: thesisOf(book),
  }
}
