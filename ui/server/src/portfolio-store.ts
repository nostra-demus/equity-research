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
import {
  assignClosures, assignPosition, createIdea, deleteIdea, readIdeas, renameIdea, type IdeaBook,
} from './portfolio-ideas'
import { readOverrides, setCashEquivalent, type PortfolioOverrides } from './portfolio-overrides'
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

/** Owner-only. These files are the raw broker statement: account identifiers, every position, every
 *  fill and the exact NAV. Under the usual 022 umask the defaults land 0755/0644, so on any machine with
 *  a second local account the whole book was readable. mkdir's `mode` is ignored when the directory
 *  already exists, hence the explicit chmod for stores created before this. */
const DIR_MODE = 0o700
const FILE_MODE = 0o600

function ensureDirs(): void {
  fs.mkdirSync(STATEMENTS_DIR, { recursive: true, mode: DIR_MODE })
  try { fs.chmodSync(STATEMENTS_DIR, DIR_MODE) } catch { /* read-only store — nothing to tighten */ }
}

/** Content hash, so re-uploading a file the book already holds is a no-op rather than a duplicate.
 *  The importer dedups rows too, but stopping here keeps the store itself honest about what it has. */
function statementId(xml: string): string {
  return crypto.createHash('sha256').update(xml).digest('hex').slice(0, 16)
}

function metaPath(id: string): string { return path.join(STATEMENTS_DIR, `${id}.json`) }
function xmlPath(id: string): string { return path.join(STATEMENTS_DIR, `${id}.xml`) }

/** `badSidecars` collects the metadata files that could not be parsed. They must not be dropped
 *  silently: a statement missing from this list is never read, never counted as unreadable, and never
 *  offered a Remove button — so the book is built from the survivors and published green. That is the
 *  same silent-partial-book failure the unreadable-XML guard closes, left open on the sidecar side. */
export function listStatements(badSidecars?: string[]): StoredStatement[] {
  ensureDirs()
  let names: string[] = []
  try { names = fs.readdirSync(STATEMENTS_DIR).filter((n) => n.endsWith('.json')) } catch { return [] }
  const out: StoredStatement[] = []
  for (const name of names) {
    let raw: Partial<StoredStatement> & { id?: string }
    try { raw = JSON.parse(fs.readFileSync(path.join(STATEMENTS_DIR, name), 'utf8')) } catch {
      badSidecars?.push(name) // name only — the caught error carries absolute paths
      continue
    }
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
  try { fs.writeFileSync(metaPath(s.id), JSON.stringify(filled, null, 2) + '\n', { mode: FILE_MODE }) } catch { /* read-only store — still return the counts */ }
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
  // ORDER MATTERS. `listStatements` reads the .json and the duplicate check above reads the .xml, so
  // writing the XML first opened a window where a crash left a statement the list cannot show and the
  // duplicate check will never accept again — unimportable and undeletable. Sidecar first inverts the
  // failure: the row is listed, reported unreadable, removable, and a re-upload repairs it.
  fs.writeFileSync(metaPath(id), JSON.stringify(statement, null, 2) + '\n', { mode: FILE_MODE })
  fs.writeFileSync(xmlPath(id), xml, { mode: FILE_MODE })
  invalidate()
  return { status: 'saved', statement }
}

export function deleteStatement(id: string): boolean {
  if (!/^[0-9a-f]{16}$/.test(id)) return false // ids are our own hashes — never a caller-supplied path
  // BOTH files, or neither. Reporting success once either one is gone hid the two half-states that
  // matter: the sidecar removed but the XML kept orphans the raw statement on disk with no route to it
  // from the UI, and the XML removed but the sidecar kept leaves a listed statement whose source is gone.
  let existed = false
  let removed = true
  for (const p of [xmlPath(id), metaPath(id)]) {
    try {
      if (!fs.existsSync(p)) continue
      existed = true
      fs.rmSync(p, { force: true })
      if (fs.existsSync(p)) removed = false
    } catch { removed = false }
  }
  invalidate()
  return existed && removed
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
// The INDEX, not an ETF tracking it. An ETF carries its own fee drag and its own premium or discount
// to net asset value; charging the manager for those, or crediting them, measures the fund against
// something it never had a view on. Fed by .claude/connectors/fred-sp500 into data/_market/fred/.
export const BENCHMARK_SYMBOL = 'SP500'
/** PRICE INDEX, not total return. FRED's SP500 series is the closing index level, so it excludes the
 *  index's dividends (~1.3%/yr) while the book's own return keeps its dividend cash inside NAV. The
 *  comparison therefore flatters the fund by roughly that much, and the screen says so rather than
 *  crediting it silently. Replacing this with a total-return series would remove the caveat with it. */
export const BENCHMARK_BASIS = 'price index — the index’s dividends are not included, worth roughly 1.3%/yr'
/** The cash hurdle, DATED AND SOURCED. An undated constant goes stale silently and no reader can
 *  reconstruct what a past ratio was measured against — the same reason every other published figure in
 *  this repo carries its source and as-of date. */
export const RISK_FREE = {
  pct: 4.3,
  asOf: '2026-01-02',
  source: '3-month US Treasury bill (secondary market), FRED DTB3',
} as const
export const RISK_FREE_ANNUAL_PCT = RISK_FREE.pct
/** How far past its last close the benchmark curve may still be carried — a long weekend and a public
 *  holiday, no more. The same tolerance benchmarkCompare uses to decide whether the feed covers a
 *  window, so the chart and the comparison can never disagree about what is covered. */
const MAX_BENCHMARK_GAP_DAYS = 7

/** Index levels for feed days after the book's last valued day (`last`), rebased against `base`.
 *  Extracted as pure logic — `performanceOf` reads its closes from disk, so this is what a test can
 *  actually drive red-on-old/green-on-new.
 *
 *  THE GAP IS MEASURED BETWEEN CONSECUTIVE DRAWN CLOSES, not from the fixed statement date `last`.
 *  Measuring from `last` alone broke the chain once the statement was more than the gap ceiling behind
 *  the live mark, even when the feed was an unbroken daily series all the way through it — dropping the
 *  forward level the chart looks up by exact date. A real hole in the feed still stops the chain. */
export function forwardBenchmarkLevels(
  inWindow: { date: string; close: number }[],
  last: string,
  base: number | null,
): { date: string; level: number }[] {
  const out: { date: string; level: number }[] = []
  let prevDrawn = last
  for (const c of inWindow) {
    if (c.date <= last || base === null || c.close <= 0) continue
    const gap = (Date.parse(`${c.date}T00:00:00Z`) - Date.parse(`${prevDrawn}T00:00:00Z`)) / 86_400_000
    if (gap > MAX_BENCHMARK_GAP_DAYS) break
    out.push({ date: c.date, level: (c.close / base) * 100 })
    prevDrawn = c.date
  }
  return out
}

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
  /** Index levels for feed days AFTER the book's last valued day, rebased exactly as `growth` is. The
   *  index is a settled close there, not an estimate — it is the BOOK's forward mark that is priced at
   *  the market. Used only where the date matches the live mark, so it is never drawn at a book day. */
  benchmarkForward: { date: string; level: number }[]
  /** The LP's lived return — reported alongside the time-weighted figure, never instead of it.
   *  ANNUALISED (XIRR), unlike the cumulative period returns above: the UI must label it as such. */
  moneyWeightedAnnualisedPct: number | null
  risk: RiskRead
  benchmark: BenchmarkRead
  riskFreeAnnualPct: number
  /** Where that hurdle came from and when it was read. A ratio stated without them cannot be checked
   *  later, and the rate goes stale silently. */
  riskFreeAsOf: string
  riskFreeSource: string
  /** What the benchmark series actually measures. The index is a PRICE index while the book's return
   *  keeps its dividends, so the comparison flatters the fund by roughly the index's yield — said out
   *  loud rather than credited in silence. */
  benchmarkBasis: string
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
  /** What the operator has declared about a holding that the statement cannot say — currently which
   *  positions are cash equivalents rather than investments. */
  overrides: PortfolioOverrides
  /** Which IDEA each holding and each closed round trip was expressing. Declared, never inferred —
   *  see portfolio-ideas.ts for why a ticker cannot stand in for an idea. */
  ideas: IdeaBook
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
  /** Index levels for feed days AFTER the book's last valued day, on the same rebasing as `growth`. */
  const benchmarkForward: { date: string; level: number }[] = []
  if (returns.length > 0) {
    const start = returns[0]!.date
    const inWindow = closes.filter((c) => c.date >= start).sort((a, b) => a.date.localeCompare(b.date))
    const base = inWindow.length ? inWindow[0]!.close : null
    const byDate = new Map(inWindow.map((c) => [c.date, c.close]))
    // The feed's own last day. Carrying the last level FOREVER drew a flat index line for every month
    // past the end of the data — while benchmarkCompare, correctly, reported the comparison
    // unavailable. One screen cannot say both. Past coverage the curve simply stops.
    const covered = inWindow.length ? inWindow[inWindow.length - 1]!.date : null
    const beyond = (date: string) => covered === null
      || (Date.parse(`${date}T00:00:00Z`) - Date.parse(`${covered}T00:00:00Z`)) / 86_400_000 > MAX_BENCHMARK_GAP_DAYS
    let index = 100
    let lastBm: number | null = base ? 100 : null
    growth.push({ date: start, book: 100, benchmark: lastBm })
    for (const { date, r } of returns) {
      index *= 1 + r
      const close = byDate.get(date)
      // Carry the last level across a day the feed does not price — a market holiday is not a gap in
      // the series — but only while the feed still covers the date.
      if (close !== undefined && base) lastBm = (close / base) * 100
      growth.push({ date, book: index, benchmark: beyond(date) ? null : lastBm })
    }
    // PAST THE LAST STATEMENT, the index is not an estimate — it is a settled close the feed already
    // carries. The book's own forward mark is priced at the market and dashed for that reason; leaving
    // the index behind at the statement date made the book look as though it had diverged, when the
    // day simply had not been drawn yet. Levels only — the chart uses one only when its date matches
    // the live mark exactly, so an index day is never plotted at a book day's position.
    const last = returns[returns.length - 1]!.date
    benchmarkForward.push(...forwardBenchmarkLevels(inWindow, last, base))
  }

  return {
    periods: returnsByPeriod(window, flowsByDate, RISK_FREE_ANNUAL_PCT, closes),
    months: monthlyReturns(book.navSeries, flowsByDate, closes),
    betaAlpha: betaAlpha(returns, closes, RISK_FREE_ANNUAL_PCT),
    growth,
    benchmarkForward,
    moneyWeightedAnnualisedPct: moneyWeightedReturn(book.navSeries, flowsByDate),
    risk: riskMetrics(book.navSeries, flowsByDate, RISK_FREE_ANNUAL_PCT),
    benchmark: benchmarkCompare(BENCHMARK_SYMBOL, book.twr, window, closes),
    riskFreeAnnualPct: RISK_FREE_ANNUAL_PCT,
    riskFreeAsOf: RISK_FREE.asOf,
    riskFreeSource: RISK_FREE.source,
    benchmarkBasis: BENCHMARK_BASIS,
    feedPresent: feedPresent(),
  }
}

function coverageOf(statements: StoredStatement[]): StatementCoverage[] {
  return statements.map((s) => ({
    id: s.id, filename: s.filename, fromDate: s.fromDate, toDate: s.toDate,
    hasTrades: (s.sections?.Trades ?? s.trades ?? 0) > 0,
  }))
}

/** The provisional layer for the current store. Whether an entry is superseded is DERIVED from the
 *  statements present right now — so removing a statement makes the entries it answered live again,
 *  which is the honest answer rather than a stale flag frozen at upload time. */
function manualRead(statements: StoredStatement[], book: Book | null): ManualRead {
  return provisionalRead(readManual(PORTFOLIO_DIR), coverageOf(statements), book?.positions ?? [])
}

export function logManualTrade(input: ManualInput): PortfolioRead {
  // LOCAL, not UTC. The form offers the operator's own calendar day; east of UTC that day begins hours
  // before the UTC one, so a UTC "today" rejected this morning's real fill as being in the future.
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  addManual(PORTFOLIO_DIR, normalizeManual(input, today))
  return readPortfolio()
}

export function removeManualTrade(id: string): boolean {
  return deleteManual(PORTFOLIO_DIR, id)
}

/** Declare a holding a cash equivalent (a T-bill ETF is cash with a ticker), or take it back. */
export function declareCashEquivalent(symbol: string, isCash: boolean): PortfolioRead {
  setCashEquivalent(PORTFOLIO_DIR, symbol, isCash)
  return readPortfolio()
}

/** Name an idea, or hand a holding / closed round trip to one. Each returns the whole read so the
 *  screen refreshes from one round trip, exactly as declareCashEquivalent does. */
export function declareIdea(label: string): PortfolioRead {
  createIdea(PORTFOLIO_DIR, label)
  return readPortfolio()
}

export function renameDeclaredIdea(id: string, label: string): PortfolioRead {
  renameIdea(PORTFOLIO_DIR, id, label)
  return readPortfolio()
}

export function removeDeclaredIdea(id: string): PortfolioRead {
  deleteIdea(PORTFOLIO_DIR, id)
  return readPortfolio()
}

export function assignHoldingIdea(symbol: string, ideaId: string | null): PortfolioRead {
  assignPosition(PORTFOLIO_DIR, symbol, ideaId)
  return readPortfolio()
}

export function assignTradeIdea(closeTradeIDs: string[], ideaId: string | null): PortfolioRead {
  assignClosures(PORTFOLIO_DIR, closeTradeIDs, ideaId)
  return readPortfolio()
}

/** Drop every entry a statement now covers. Returns how many went, so the UI can say it out loud
 *  instead of the list simply shrinking. */
export function clearSupersededManual(): number {
  return clearSuperseded(PORTFOLIO_DIR, coverageOf(listStatements()))
}

export function readPortfolio(): PortfolioRead {
  const badSidecars: string[] = []
  const statements = listStatements(badSidecars)
  if (badSidecars.length > 0) {
    return {
      statements, book: null, performance: null,
      error: `${badSidecars.length} statement record${badSidecars.length === 1 ? '' : 's'} could not be read (${badSidecars.join(', ')}) — the statement${badSidecars.length === 1 ? ' it names is' : 's they name are'} missing from the book, so no book is published until ${badSidecars.length === 1 ? 'it is' : 'they are'} repaired or removed`,
      manual: manualRead(statements, null),
      overrides: readOverrides(PORTFOLIO_DIR),
    ideas: readIdeas(PORTFOLIO_DIR),
    }
  }
  if (statements.length === 0) {
    return {
      statements, book: null, performance: null, error: null,
      manual: manualRead(statements, null),
      overrides: readOverrides(PORTFOLIO_DIR),
    ideas: readIdeas(PORTFOLIO_DIR),
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
      overrides: readOverrides(PORTFOLIO_DIR),
    ideas: readIdeas(PORTFOLIO_DIR),
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
    overrides: readOverrides(PORTFOLIO_DIR),
    ideas: readIdeas(PORTFOLIO_DIR),
  }
}
