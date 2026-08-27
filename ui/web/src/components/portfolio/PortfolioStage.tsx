import { useCallback, useEffect, useMemo, useState } from 'react'
import { foldRoundTrips, type TradeRowData } from './tradeRows'
import { motion, useReducedMotion } from 'framer-motion'
import { api } from '../../lib/api'
import type {
  PortfolioBook, PortfolioClosure, PortfolioLiveMark, PortfolioManualRead, PortfolioPerformance,
  PortfolioIdeaBook, PortfolioPosition, PortfolioRead,
} from '../../lib/types'
import { useStore } from '../../lib/store'
import { GrowthChart, UnderwaterChart } from './charts'
import { LogTradeForm, ManualTradeList, ProvisionalEffects } from './manual'
import { groupByIdea } from './tradeRows'

const EMPTY_MANUAL: PortfolioManualRead = { trades: [], live: 0, superseded: 0, effects: [] }

// The fund book: what the fund ACTUALLY owns, fed by IBKR Flex exports.
//
// Deliberately not the engine's model paper-portfolio (/research:size), which answers what the research
// SAID to own. Both exist on purpose and never merge — the calibration loop depends on the model book
// being untouched by execution reality.
//
// FOUR TABS, NOT ONE COLUMN. The book has four genuinely different jobs — what is held, how it has
// performed, what was closed, and what was imported. Stacked, they made a page whose bottom could not
// be reached, and the import affordance sat at the top of every visit even though importing is
// occasional. Tabs also keep each screen's tables intact rather than squeezing five of them into one
// viewport.
//
// Two things this screen refuses to do, because a fund tool that does them is worse than none:
//  · It never shows a number as agreed when it has not been proved. The reconciliation state sits in
//    the header on every tab and links to the checks themselves.
//  · It never weights a derivative by its notional. A futures contract is exposure against margin, not
//    an allocation of NAV, so it is shown apart from the equity weights.

type Tab = 'holdings' | 'performance' | 'trades'

const fmtMoney = (v: number | null | undefined, ccy: string | null): string => {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—'
  const sign = v < 0 ? '−' : ''
  return `${sign}${ccy === 'USD' ? '$' : ''}${Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}
const fmtPct = (v: number | null | undefined, digits = 1): string =>
  v === null || v === undefined || !Number.isFinite(v) ? '—' : `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(digits)}%`
const fmtNum = (v: number | null | undefined, digits = 2): string => {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—'
  // The typographic minus the rest of the cockpit uses. A hyphen beside tabular figures reads as a
  // dash, and `(-0.4).toLocaleString(…, {maximumFractionDigits: 0})` renders the string "-0", which
  // looks like a broken row rather than a small loss.
  const rounded = Number(v.toFixed(digits))
  const sign = rounded < 0 ? '−' : ''
  return `${sign}${Math.abs(rounded).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`
}

/** Precision that follows magnitude: a 0.1803-share lot is not "0", and a $4.29 gain is not "0" either. */
const fmtQty = (v: number | null | undefined): string =>
  v === null || v === undefined || !Number.isFinite(v) ? '—'
    : Math.abs(v) < 1 && v !== 0 ? fmtNum(v, 4) : fmtNum(v, Number.isInteger(v) ? 0 : 2)
const fmtSmallMoney = (v: number | null | undefined): string =>
  v === null || v === undefined || !Number.isFinite(v) ? '—' : Math.abs(v) < 100 ? fmtNum(v, 2) : fmtNum(v, 0)

/** A position's value in the BASE currency, or null when the statement gave no rate to convert it.
 *
 *  `?? 1` was the bug: a EUR 10,000 position with no rate was added to a dollar total as $10,000. The
 *  backend sets the rate to null deliberately — it is saying it cannot value this row — so the honest
 *  reading is to leave it out of the total and say how many rows were left out, exactly as buildBook
 *  already does for income it cannot convert. */
const baseValue = (v: number | null | undefined, p: { fxRateToBase: number | null }): number | null =>
  v === null || v === undefined || !Number.isFinite(v) || p.fxRateToBase === null ? null : v * p.fxRateToBase

/** What a closed round trip realised in the base currency, or null when no rate existed at the close.
 *  Falling back to the LOCAL figure summed francs into dollars and published a total the reconciliation
 *  explicitly refuses to certify. */
const baseRealised = (c: { realizedBase: number | null }): number | null => c.realizedBase

/** Sum only what could be valued, and count what could not — so a total is never quietly short. */
function sumBase<T>(rows: T[], value: (row: T) => number | null): { total: number; unvalued: number } {
  let total = 0
  let unvalued = 0
  for (const row of rows) {
    const v = value(row)
    if (v === null) unvalued += 1
    else total += v
  }
  return { total, unvalued }
}

/** Positive is amber, not green: the cockpit's --good IS the accent. Losses are the only red. */
const toneOf = (v: number | null | undefined): string =>
  v === null || v === undefined || !Number.isFinite(v) ? 'var(--text-muted)' : v < 0 ? 'var(--bad)' : 'var(--good)'

export function PortfolioStage() {
  const reduced = useReducedMotion()
  const selectTicker = useStore((s) => s.selectTicker)
  const setResearchView = useStore((s) => s.setResearchView)
  const [read, setRead] = useState<PortfolioRead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [notes, setNotes] = useState<{ tone: 'ok' | 'bad'; text: string }[]>([])
  const [dragging, setDragging] = useState(false)
  const [tab, setTab] = useState<Tab>('holdings')
  const [changed, setChanged] = useState<ImportDelta | null>(null)
  // Import and hand-logging are both "put a trade into the book", so they belong on the trade screen as
  // two buttons rather than a tab of their own. This says which of the two surfaces is open.
  const [openImport, setOpenImport] = useState(false)
  // Loaded AFTER the book and kept apart from it. The reconciled figures must be on screen immediately
  // and must never wait on — or be altered by — a number that ties to nothing.
  const [live, setLive] = useState<PortfolioLiveMark | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try { setRead(await api.portfolio()); setError(null) }
    catch (e: any) { setError(e?.message || 'could not reach the engine') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])
  useEffect(() => {
    if (!read?.book) { setLive(null); return }
    let dropped = false
    void api.portfolioLive().then((m) => { if (!dropped) setLive(m) }).catch(() => { if (!dropped) setLive(null) })
    return () => { dropped = true }
  }, [read?.book?.asOf, read?.statements.length])

  const upload = useCallback(async (files: File[]) => {
    if (!files.length || busy) return
    setBusy(true); setProgress(0); setNotes([])
    try {
      const before = snapshot(read)
      const result = await api.uploadStatements(files, setProgress)
      const after: PortfolioRead = { statements: result.statements, book: result.book, performance: result.performance, manual: result.manual, overrides: result.overrides, error: result.error }
      setRead(after)
      // What the import actually did to the book, measured rather than asserted: a "12 statements
      // imported" message that leaves every total unchanged is exactly the case an operator needs to
      // notice, and only a before/after comparison can show it.
      setChanged(diffBooks(before, snapshot(after)))
      setOpenImport(true)
      const next: { tone: 'ok' | 'bad'; text: string }[] = []
      if (result.saved.length) next.push({ tone: 'ok', text: `${result.saved.length} statement${result.saved.length === 1 ? '' : 's'} imported` })
      // A duplicate is a normal outcome, not a failure: overlapping exports are how full history is
      // assembled, and the importer dedups on the broker's own ids.
      for (const d of result.duplicates) next.push({ tone: 'ok', text: `${d} was already imported — nothing changed` })
      for (const f of result.fileErrors) next.push({ tone: 'bad', text: `${f.filename}: ${f.reason}` })
      setNotes(next)
    } catch (e: any) {
      setNotes([{ tone: 'bad', text: e?.message || 'upload failed' }])
    } finally { setBusy(false); setProgress(0) }
    // `read` IS a dependency: the delta panel measures against the book as it stood immediately before
    // the upload, and a callback frozen at mount compares against whatever was loaded then — so after a
    // statement delete or a hand-logged trade it reported deltas that never happened.
  }, [busy, read])

  const book = read?.book ?? null
  const manual = read?.manual ?? EMPTY_MANUAL
  const ccy = book?.baseCurrency ?? null
  const hasStatements = (read?.statements.length ?? 0) > 0

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'holdings', label: 'Holdings', count: book?.positions.length },
    { id: 'performance', label: 'Returns & risk' },
    { id: 'trades', label: 'Trade history', count: (book?.closures.length ?? 0) + manual.live },
  ]

  return (
    <motion.div
      className="fundbook"
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.26, ease: [0.23, 1, 0.32, 1] }}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => { e.preventDefault(); setDragging(false); void upload([...e.dataTransfer.files]) }}
    >
      <div className="fundbook__head">
        <div>
          <span className="fundbook__eyebrow">Fund book · real capital</span>
          <div className="fundbook__titlerow">
            <strong>Portfolio</strong>
            {book && <small>{ccy ? `Reported in ${ccy}` : ''}{book.asOf ? ` · as of ${book.asOf}` : ''}</small>}
          </div>
        </div>
      </div>

      {/* Tabs and status on ONE row, deliberately BELOW the title rather than in the header's top-right
          corner: the cockpit's view toggle is an absolute overlay pinned there, and the reconciliation
          badge — the one thing on this screen that must never be hidden — was sliding underneath it at
          ordinary desktop widths. This row clears the overlay at any width, with no magic number
          coupling the two components. */}
      {(book || manual.live > 0) && (
        <div className="fundbook__toolbar">
          {book && (
            <div className="fundbook__tabs" role="tablist" aria-label="Fund book sections">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  role="tab"
                  aria-selected={tab === t.id}
                  className={`fundbook__tab${tab === t.id ? ' is-on' : ''}`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                  {t.count !== undefined && <span className="fundbook__tabcount">{t.count}</span>}
                </button>
              ))}
            </div>
          )}
          <div className="fundbook__badges">
            {/* Outstanding hand-logged fills sit beside the reconciliation state, not buried in a tab:
                together they answer "is what I am looking at the whole picture?" */}
            {manual.live > 0 && (
              <button className="fundbook__recon is-provisional" onClick={() => { setTab('trades'); setOpenImport(false) }}
                title="Fills logged by hand that no statement covers yet">
                <i aria-hidden />
                {manual.live} logged by hand
              </button>
            )}
            {book && <ReconcileBadge book={book} onInspect={() => { setTab('trades'); setOpenImport(true) }} />}
          </div>
        </div>
      )}

      {dragging && <div className="fundbook__dropnote">Release to import — the file stays on this machine</div>}

      {/* The one scrolling region. It must be the ONLY thing that scrolls: the header and tabs stay put
          so the reconciliation state is never scrolled away from. */}
      <div className="fundbook__body">
        {loading && !read ? (
          <div className="fundbook__loading">
            <span className="skel" style={{ height: 74, borderRadius: 'var(--r-lg)' }} />
            <span className="skel" style={{ height: 160, borderRadius: 'var(--r-lg)' }} />
          </div>
        ) : error ? (
          <div className="fundbook__error">
            <span>{error}</span>
            <button className="fundbook__retry" onClick={() => void load()}>Try again</button>
          </div>
        ) : !book ? (
          // No book — either nothing imported yet, or statements that could not build one. Both land on
          // the import surface, because when the build FAILS the Remove buttons there are the only way
          // out; hiding them behind a successful build strands the operator with an error and no control.
          <ImportTab
            read={read ?? { statements: [], book: null, performance: null, manual: EMPTY_MANUAL, overrides: { cashEquivalents: [] }, error: null }}
            onFiles={upload} onChanged={setRead} busy={busy} progress={progress} notes={notes}
            firstRun={!hasStatements} changed={changed} manual={manual}
          />
        ) : tab === 'holdings' ? (
          // `read?.overrides?.` uses optional chaining on a REQUIRED field on purpose: a server that
          // predates the key — an older engine, or the live cockpit between a bundle deploy and its
          // restart — would otherwise white-screen the whole Portfolio view over a field that only
          // decorates it.
          <Holdings
            book={book} perf={read?.performance ?? null} manual={manual}
            cashEquivalents={read?.overrides?.cashEquivalents ?? []} live={live} ideas={read?.ideas}
            onManage={() => setTab('trades')} onChanged={setRead}
          />
        ) : tab === 'performance' ? (
          read?.performance
            ? <Performance perf={read.performance} cashShare={cashShare(book, read?.overrides?.cashEquivalents ?? [])} />
            : <div className="fundbook__none">No performance to show yet.</div>
        ) : (
          <Trades
            book={book} manual={manual} onChanged={setRead} ideas={read?.ideas}
            cashEquivalents={read?.overrides?.cashEquivalents ?? []}
            importOpen={openImport} onImportOpen={setOpenImport}
            importSurface={
              <ImportTab
                read={read!} onFiles={upload} onChanged={setRead} busy={busy} progress={progress}
                notes={notes} changed={changed} manual={manual} embedded
              />
            }
          />
        )}
      </div>
    </motion.div>
  )
}

/** The trust anchor, visible on every tab. Every other number here is derived; this says whether the
 *  derivation matches the broker — and it links straight to the checks. */
function ReconcileBadge({ book, onInspect }: { book: PortfolioBook; onInspect: () => void }) {
  const failed = book.reconciliation.checks.filter((c) => !c.ok)
  const ok = book.reconciliation.ok
  return (
    <button className={`fundbook__recon${ok ? ' is-ok' : ' is-break'}`} onClick={onInspect} title="Show every reconciliation check">
      <i aria-hidden />
      {ok ? `Reconciled · ${book.reconciliation.checks.length} checks` : `${failed.length} of ${book.reconciliation.checks.length} checks failing`}
    </button>
  )
}

// ---------- what an import changed ----------

interface Snapshot {
  statements: number; trades: number; closures: number; positions: number
  navPoints: number; nav: number | null; realised: number | null; from: string | null; to: string | null
}
export interface ImportDelta { before: Snapshot; after: Snapshot; nothingMoved: boolean }

function snapshot(read: PortfolioRead | null): Snapshot {
  const b = read?.book ?? null
  const dates = (read?.statements ?? []).flatMap((s) => [s.fromDate, s.toDate]).filter((d): d is string => !!d).sort()
  return {
    statements: read?.statements.length ?? 0,
    trades: (read?.statements ?? []).reduce((a, s) => a + s.trades, 0),
    closures: b?.closures.length ?? 0,
    positions: b?.positions.length ?? 0,
    navPoints: b?.navSeries.length ?? 0,
    nav: b && b.navSeries.length ? b.navSeries[b.navSeries.length - 1]!.total : null,
    realised: b ? sumBase(b.closures, baseRealised).total : null,
    from: dates[0] ?? null,
    to: dates[dates.length - 1] ?? null,
  }
}

function diffBooks(before: Snapshot, after: Snapshot): ImportDelta {
  const same = (a: number | null, b: number | null) =>
    a === null || b === null ? a === b : Math.abs(a - b) < 0.005
  return {
    before,
    after,
    nothingMoved: before.statements === after.statements && before.trades === after.trades
      && before.closures === after.closures && before.navPoints === after.navPoints
      && same(before.nav, after.nav) && same(before.realised, after.realised),
  }
}

function Card({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: string }) {
  return (
    <div className="fundbook__card">
      <span className="fundbook__cardlabel">{label}</span>
      <strong className="fundbook__cardvalue" style={tone ? { color: tone } : undefined}>{value}</strong>
      {sub && <small className="fundbook__cardsub">{sub}</small>}
    </div>
  )
}

/** Share of NAV sitting in cash and declared cash equivalents. The risk ratios are computed on total
 *  NAV, so this is what says whether they describe the picking or mostly the parking. */
function cashShare(book: PortfolioBook, cashEquivalents: string[]): number | null {
  const nav = book.navSeries.length ? book.navSeries[book.navSeries.length - 1]!.total : null
  if (nav === null || nav <= 0) return null
  const risked = book.positions
    .filter((p) => !p.isDerivative && !cashEquivalents.includes((p.symbol ?? '').toUpperCase()))
    .reduce((a, p) => a + (baseValue(p.positionValue, p) ?? 0), 0)
  return ((nav - risked) / nav) * 100
}

/** Carry the reconciled index forward to today's prices, as ONE extra point.
 *
 *  The index is rebased, not absolute, so the estimate enters as a RATIO: whatever the market has done
 *  to the holdings since the statement, applied to the last reconciled level. Returns the series
 *  untouched whenever there is nothing to add — no live mark, no gap, or no reconciled NAV to scale
 *  from — so the chart never gains a point that says the same thing twice. */
function withLive(
  growth: PortfolioPerformance['growth'],
  live: PortfolioLiveMark | null,
  nav: number | null,
  benchmarkForward: PortfolioPerformance['benchmarkForward'] = [],
) {
  if (!live || live.unavailable || live.nav === null || live.asOf === null) return growth
  if (nav === null || nav <= 0 || growth.length === 0) return growth
  const last = growth[growth.length - 1]!
  if (live.asOf <= last.date) return growth // the statement already covers the day the prices belong to
  return [...growth, {
    date: live.asOf,
    book: last.book * (live.nav / nav),
    // The index carries forward too, but ONLY on a day the feed actually closed. Its level is a settled
    // close, not an estimate — it is the book beside it that is priced at the market. Requiring the
    // dates to match exactly is what keeps a Friday index close from being drawn at a Monday book mark
    // and read as a comparison that was never made.
    benchmark: benchmarkForward.find((b) => b.date === live.asOf)?.level ?? null,
    provisional: true,
  }]
}

// ---------- holdings ----------

function Holdings({ book, perf, manual, cashEquivalents, live, ideas, onManage, onChanged }: {
  book: PortfolioBook; perf: PortfolioPerformance | null; manual: PortfolioManualRead
  cashEquivalents: string[]; live: PortfolioLiveMark | null
  /** Absent on an engine that predates idea grouping — the block simply does not render (DESIGN.md §5). */
  ideas?: PortfolioIdeaBook
  onManage: () => void; onChanged: (r: PortfolioRead) => void
}) {
  const ccy = book.baseCurrency
  const isCashEq = (sym: string | null) => !!sym && cashEquivalents.includes(sym.toUpperCase())
  const onCash = async (symbol: string, isCash: boolean) => {
    try { onChanged(await api.setCashEquivalent(symbol, isCash)) } catch { /* the row simply does not move */ }
  }
  const nav = book.navSeries.length ? book.navSeries[book.navSeries.length - 1]!.total : null
  const equities = book.positions.filter((p) => !p.isDerivative)
  const derivatives = book.positions.filter((p) => p.isDerivative)
  // A T-bill ETF is cash with a ticker: it is held to park money, not to express a view. Counting it as
  // invested made a book that is 72% in SGOV read as "99.7% invested" when it is mostly waiting. The
  // broker cannot tell us — SGOV, CANE and GLDM all arrive as subCategory="ETF" — so the operator does.
  // BIGGEST FIRST. The statement's own order is the order the account happened to acquire things, which
  // tells the reader nothing; with 20+ names the position that actually matters could be anywhere in the
  // list. Sorted by what it is worth, the top of the table is always the part worth reading.
  const byValue = (a: PortfolioPosition, b: PortfolioPosition) =>
    Math.abs(baseValue(b.positionValue, b) ?? 0) - Math.abs(baseValue(a.positionValue, a) ?? 0)
  const parked = equities.filter((p) => isCashEq(p.symbol)).sort(byValue)
  const risked = equities.filter((p) => !isCashEq(p.symbol)).sort(byValue)
  const parkedValue = sumBase(parked, (p) => baseValue(p.positionValue, p)).total
  const investedSum = sumBase(risked, (p) => baseValue(p.positionValue, p))
  const invested = investedSum.total
  const unrealisedSum = sumBase(equities, (p) => baseValue(p.unrealizedLocal, p))
  const unrealised = unrealisedSum.total
  const flows = book.flows.reduce((a, f) => a + (f.amountBase ?? 0), 0)
  const realisedSum = sumBase(book.closures, baseRealised)
  const realised = realisedSum.total
  // Every row the statement could not put a rate on, across the three totals above. Reported rather
  // than absorbed: a total that silently drops rows is worse than one that says how many it dropped.
  const unvalued = investedSum.unvalued + unrealisedSum.unvalued + realisedSum.unvalued

  // THE BRIDGE MUST CLOSE. Capital in, realised, unrealised and PAID income do not reach NAV on their
  // own: the broker also carries income that is earned but not yet paid, which sits inside the ending
  // value and in no cash transaction ($24.88 of accrued interest on the real book). Printing the four
  // rows under a bold total they do not produce is the kind of arithmetic nobody checks until it is
  // large. So the shortfall is always shown — named when the statement's own accrual balance proves
  // what it is, and marked unexplained when it does not, which turns any future omission into a
  // visible row instead of a silent error.
  const bridgeParts = nav === null ? null : flows + realised + unrealised + book.income.net
  const rawGap = bridgeParts === null || nav === null ? null : nav - bridgeParts
  const accrued = book.accruals?.total ?? null
  const gapIsAccruals = rawGap !== null && accrued !== null && Math.abs(rawGap - accrued) < 0.005
  // Half a cent: below that the difference is float noise in the sum, not a missing component.
  const bridgeGap = rawGap === null || Math.abs(rawGap) < 0.005 ? null : rawGap
  // Named when the statement's own accrual balance proves what it is; otherwise the candidates are
  // listed rather than left blank — an unexplained row still has to tell the reader where to look.
  const bridgeGapLabel = gapIsAccruals
    ? 'Income earned but not yet paid'
    : 'Everything else — currency translation, accruals, derivative marks'
  // §15 — an aggregate carries its components: the statement gives dividend and interest accrual
  // BALANCES separately, so a reader should be able to rebuild the one printed total from them rather
  // than take it on faith. Both are guaranteed non-null whenever `total` (and so `gapIsAccruals`) is.
  const bridgeGapTitle = gapIsAccruals && book.accruals
    ? `Dividends ${fmtMoney(book.accruals.dividend, ccy)} + interest ${fmtMoney(book.accruals.interest, ccy)}`
    : undefined
  const brokerCash = nav === null ? null : nav - invested - parkedValue
  const cash = brokerCash === null ? null : brokerCash + parkedValue
  return (
    <>
      {/* The LIVE BOOK, not performance: what is held and what it is worth today. The time-weighted
          return heads Returns & risk and realised P&L heads Trade history — repeating them here made
          this row a summary of three screens instead of a snapshot of one. */}
      <div className="fundbook__cards">
        <Card label="Net asset value" value={fmtMoney(nav, ccy)} sub={`${book.navSeries.length} daily points · as of ${book.asOf ?? '—'}`} />
        <Card
          label="Invested"
          value={fmtMoney(invested, ccy)}
          sub={nav ? `${((invested / nav) * 100).toFixed(1)}% of NAV · ${risked.length} position${risked.length === 1 ? '' : 's'}` : `${risked.length} positions`}
        />
        <Card
          label="Cash"
          value={fmtMoney(cash, ccy)}
          sub={parked.length > 0 ? `incl. ${parked.map((p) => p.symbol).join(', ')} held as cash` : 'Broker balance'}
        />
        <Card label="Unrealised" value={fmtMoney(unrealised, ccy)} sub="On open positions, at the statement's marks" tone={toneOf(unrealised)} />
        <Card label="Net capital in" value={fmtMoney(flows, ccy)} sub="LP contributions less withdrawals" />
        {live && !live.unavailable && live.nav !== null && live.staleDays !== null && live.staleDays > 0 ? (
          <Card
            label="Estimated now"
            value={fmtMoney(live.nav, ccy)}
            sub={`${live.asOfIsClose ? 'Last close' : 'Delayed'} ${live.asOf} · ${live.staleDays}d past the statement · cash frozen at ${live.bookAsOf}${live.unpriced.length ? ` · ${live.unpriced.join(', ')} unpriced` : ''}`}
            tone={nav !== null && live.nav !== nav ? toneOf(live.nav - nav) : undefined}
          />
        ) : null}
        <Card label="Income" value={fmtMoney(book.income.net, ccy)} sub={`Dividends ${fmtMoney(book.income.dividendsGross, ccy)} · withholding ${fmtMoney(book.income.withholdingTax, ccy)}`} tone={toneOf(book.income.net)} />
      </div>

      {/* THE ESTIMATE IS APPENDED, NOT MERGED. The reconciled index ends where the statements do; this
          carries it forward by the ratio the market has moved the holdings since, and the chart draws
          that last hop dashed. It never touches TWR, the reconciliation, or any figure in the cards. */}
      {/* The curve and the bridge answer the same question from two directions — what the book did, and
          what it is made of — so they sit side by side rather than a screen apart. */}
      <div className="fundbook__split fundbook__split--wide">
        {perf && perf.growth.length > 1 && (
          <div className="fundbook__panel">
            <div className="fundbook__panelhead">
              <div><strong>Growth of capital</strong></div>
            </div>
            <GrowthChart series={withLive(perf.growth, live, nav, perf.benchmarkForward)} benchmarkSymbol={perf.benchmark.symbol} height={230} />
          </div>
        )}

        <div className="fundbook__panel">
          <div className="fundbook__panelhead">
            <div><strong>How NAV got here</strong></div>
          </div>
          <BridgeRow label="LP capital, net" value={fmtMoney(flows, ccy)} />
          <BridgeRow label="Realised on closed trades" value={fmtMoney(realised, ccy)} tone={toneOf(realised)} />
          <BridgeRow label="Unrealised on open positions" value={fmtMoney(unrealised, ccy)} tone={toneOf(unrealised)} />
          <BridgeRow label="Income, net of withholding and fees" value={fmtMoney(book.income.net, ccy)} tone={toneOf(book.income.net)} />
          {bridgeGap !== null && (
            <BridgeRow label={bridgeGapLabel} value={fmtMoney(bridgeGap, ccy)} tone={toneOf(bridgeGap)} title={bridgeGapTitle} />
          )}
          <div className="fundbook__bridge is-total"><span>Net asset value</span><strong>{fmtMoney(nav, ccy)}</strong></div>
        </div>
      </div>

      {manual.effects.length > 0 && (
        <div className="fundbook__panel is-provisional">
          <div className="fundbook__panelhead">
            <div>
              <strong>Logged by hand — not in a statement yet</strong>
              <small>What the book will hold once these fills land. Nothing here is in the numbers above.</small>
            </div>
            <button className="fundbook__btn" onClick={onManage}>Manage</button>
          </div>
          <ProvisionalEffects effects={manual.effects} />
        </div>
      )}

      {/* THE SUMMARY BEFORE THE DETAIL. Exposure answers "where is the risk" in a bounded block;
          Positions answers "what exactly do I hold" in a list that grows with every name. Printed the
          other way round, the summary sat a screen and a half below the thing it summarises. */}
      <Exposure
        book={book} risked={risked} parkedValue={parkedValue} nav={nav} ccy={ccy}
        invested={invested} cash={cash} parked={parked} ideas={ideas} bars={
          <>
            {/* nav > 0, not merely present: an account that has been emptied divides by zero, and both
                bars printed the literal string "NaN%". */}
            {nav !== null && nav > 0 && cash !== null && (
              <div className="fundbook__bars">
                <Bar label="Invested" pct={(invested / nav) * 100} value={fmtMoney(invested, ccy)} />
                <Bar label="Cash" pct={(cash / nav) * 100} value={fmtMoney(cash, ccy)} deep />
              </div>
            )}
            {/* The declaration belongs where the split it changes is explained, not repeated as a button on
                every position row — one control in one place instead of one per holding. */}
            {unvalued > 0 && (
            <div className="fundbook__foot fundbook__foot--warn">
              {unvalued} row{unvalued === 1 ? '' : 's'} could not be valued in {ccy ?? 'the base currency'} —
              the statement carried no rate for {unvalued === 1 ? 'it' : 'them'}, so {unvalued === 1 ? 'it is' : 'they are'} left
              out of the totals above rather than added at one-for-one.
            </div>
          )}
          <div className="fundbook__foot fundbook__cashdecl">
              <span>
                {parked.length > 0
                  ? <>Cash includes {fmtMoney(parkedValue, ccy)} held as {parked.map((p) => p.symbol).join(', ')} — money waiting, not money at risk.</>
                  : <>A T-bill or money-market ETF is cash with a ticker. The statement cannot tell one from a commodity fund, so name it here.</>}
              </span>
              <select
                className="fundbook__select"
                value=""
                onChange={(e) => { if (e.target.value) void onCash(e.target.value, !isCashEq(e.target.value)) }}
                aria-label="Treat a holding as cash, or stop treating it as cash"
              >
                <option value="" disabled>treat as cash…</option>
                {equities.map((p) => (
                  <option key={p.symbol ?? ''} value={p.symbol ?? ''}>
                    {p.symbol}{isCashEq(p.symbol) ? ' — count as invested' : ''}
                  </option>
                ))}
              </select>
            </div>
          </>
        }
      />

      <div className="fundbook__panel">
        <div className="fundbook__panelhead">
          <div><strong>Positions</strong><small>{book.positions.length} open · weights as the statement states them</small></div>
        </div>
        <div className="fundbook__scroll">
          <div className="fundbook__row fundbook__row--head">
            <span>Symbol</span><span>Ccy</span><span className="num">Quantity</span><span className="num">Avg cost</span>
            <span className="num">Mark</span><span className="num">Value</span><span className="num">Weight</span>
            <span className="num">Unrealised</span><span className="num">%</span>
          </div>
          {risked.map((p, i) => <PositionRow key={`${p.conid ?? p.symbol ?? 'x'}-${i}`} p={p} ideas={ideas} onChanged={onChanged} />)}
          {parked.length > 0 && (
            <>
              <div className="fundbook__subhead">Cash equivalents — counted as cash above, not as positions</div>
              {parked.map((p, i) => <PositionRow key={`c-${p.conid ?? p.symbol ?? 'x'}-${i}`} p={p} isCash />)}
            </>
          )}
          {derivatives.length > 0 && (
            <>
              <div className="fundbook__subhead">Derivatives — notional is <b>exposure</b>, so these carry no weight</div>
              {derivatives.map((p, i) => <PositionRow key={`d-${p.conid ?? p.symbol ?? 'x'}-${i}`} p={p} derivative />)}
            </>
          )}
          {book.positions.length === 0 && <div className="fundbook__none">No open positions in this statement.</div>}
        </div>
      </div>

      {/* CAPITAL FLOWS LAST. It is reference detail — how the LP's money went in and out — and like the
          positions list it grows without bound, so it sits behind the things read on every visit. */}
      {book.flows.length > 0 && (
        <div className="fundbook__panel">
          <div className="fundbook__panelhead">
            <div><strong>Capital flows</strong><small>Removed from the return, so they never read as performance</small></div>
          </div>
          {[...book.flows].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).map((f, i) => (
            <div key={`${f.date}-${i}`} className="fundbook__bridge">
              <span>
                <span className="mono dim">{f.date ?? '—'}</span> · {f.description ?? (f.amount >= 0 ? 'Contribution' : 'Withdrawal')}
                {/* The backend sets amountBase to null when the statement carried no rate. Falling back
                    to the local figure under the base-currency label printed a €1,000 contribution as
                    "$1,000", so the flow stays in the currency it was actually paid in. */}
                {f.amountBase === null && (
                  <small className="fundbook__since">no rate in the statement — not converted to {ccy ?? 'the base currency'}</small>
                )}
              </span>
              <strong style={{ color: toneOf(f.amountBase ?? f.amount) }}>
                {f.amountBase === null ? `${fmtMoney(f.amount, null)} ${f.currency ?? '—'}` : fmtMoney(f.amountBase, ccy)}
              </strong>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

/** EXPOSURE — concentration, gross and net, and the single name that matters most.
 *
 *  Measured on money AT RISK, not on NAV. A book that is 72% parked in T-bills has a largest position of
 *  36% of NAV but 50% of its actual risk, and only the second number answers "what happens if this one
 *  goes wrong". Both are shown so neither can be mistaken for the other.
 *
 *  Sector is absent ON PURPOSE: the Flex statement carries an asset category and a sub-category and
 *  nothing else. A sector guessed from a ticker would be an invention wearing the broker's authority,
 *  so the panel says the data is not there rather than drawing a made-up split. */
function Exposure({ book, risked, parkedValue, nav, ccy, ideas, bars }: {
  book: PortfolioBook; risked: PortfolioPosition[]; parkedValue: number
  nav: number | null; ccy: string | null
  invested: number; cash: number | null; parked: PortfolioPosition[]
  ideas?: PortfolioIdeaBook
  /** The invested-against-cash bars and the cash declaration, folded in from what used to be a panel of
   *  its own. They answer the same question this one does — how the money is distributed — and both
   *  were drawing their own currency breakdown, so side by side they said one thing twice. */
  bars: React.ReactNode
}) {
  const derivatives = book.positions.filter((p) => p.isDerivative)
  const valued = risked
    .map((p) => ({ p, base: baseValue(p.positionValue, p) ?? 0 }))
    .sort((a, b) => Math.abs(b.base) - Math.abs(a.base))
  if (valued.length === 0) return null

  // Gross counts both directions; net cancels them. They are equal here only because the book is
  // long-only — the moment it is not, the difference between them IS the hedge.
  const gross = valued.reduce((a, v) => a + Math.abs(v.base), 0)
  // Every share on this panel divides by GROSS. Against the signed net, a $100 long beside a $20 short
  // reported the long as 125% of the money at risk, and a market-neutral book made every figure here
  // null because the denominator came out at zero.
  const shareOfRisk = (v: number) => (gross === 0 ? null : (v / gross) * 100)
  const top = valued[0]!
  const topThree = valued.slice(0, 3).reduce((a, v) => a + v.base, 0)
  const longs = valued.filter((v) => v.base > 0).reduce((a, v) => a + v.base, 0)
  const shorts = valued.filter((v) => v.base < 0).reduce((a, v) => a + v.base, 0)

  const group = (key: (p: PortfolioPosition) => string) => {
    const by = new Map<string, number>()
    for (const { p, base } of valued) by.set(key(p), (by.get(key(p)) ?? 0) + base)
    return [...by.entries()].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
  }
  const shown = valued.slice(0, TOP_POSITIONS)
  const rest = valued.slice(TOP_POSITIONS)
  const restValue = rest.reduce((a, v) => a + v.base, 0)
  const byCurrency = group((p) => p.currency ?? '—')
  const byClass = group((p) => p.subCategory || p.assetCategory || 'unclassified')

  // BY IDEA — the only breakdown here the statement cannot produce, because it is a declaration.
  // Residual dust is dropped from the WEIGHTING: one leftover share of CANE is $11 against a $1.03m
  // book, and counting it renders a closed idea as an open 0.0% one forever. It stays in the positions
  // list and in reconciliation; only its weight is withheld.
  const ideaLabel = new Map((ideas?.ideas ?? []).map((i) => [i.id, i.label]))
  const nonResidual = valued.filter((v) => Math.abs(v.base) >= RESIDUAL_VALUE_BASE)
  const residualCount = valued.length - nonResidual.length
  const byIdea = (() => {
    if (!ideas) return []
    const by = new Map<string, number>()
    for (const { p, base } of nonResidual) {
      const id = ideas.assignments.positions[(p.symbol ?? '').toUpperCase()] ?? ''
      by.set(id, (by.get(id) ?? 0) + base)
    }
    return [...by.entries()].sort((a, b) => {
      if (!a[0]) return 1
      if (!b[0]) return -1
      return Math.abs(b[1]) - Math.abs(a[1])
    })
  })()

  return (
    <div className="fundbook__panel">
      <div className="fundbook__panelhead">
        <div>
          <strong>Exposure</strong>
          <small>What is at risk against what is parked, and how that risk is spread</small>
        </div>
      </div>

      {bars}

      <div className="fundbook__cards fundbook__cards--inset">
        <Card
          label="Largest single name"
          value={shareOfRisk(top.base) === null ? '—' : `${shareOfRisk(top.base)!.toFixed(1)}%`}
          sub={`${top.p.symbol ?? '—'} · ${fmtMoney(top.base, ccy)}${nav ? ` · ${((top.base / nav) * 100).toFixed(1)}% of NAV` : ''}`}
        />
        <Card
          label="Top three"
          value={shareOfRisk(topThree) === null ? '—' : `${shareOfRisk(topThree)!.toFixed(1)}%`}
          sub={`of money at risk · ${valued.slice(0, 3).map((v) => v.p.symbol).join(', ')}`}
        />
        <Card label="Gross exposure" value={fmtMoney(gross, ccy)} sub={nav ? `${((gross / nav) * 100).toFixed(0)}% of NAV · long and short added` : 'long and short added'} />
        <Card
          label="Net exposure"
          value={fmtMoney(longs + shorts, ccy)}
          sub={shorts === 0 ? 'Long-only, so net equals gross' : `${fmtMoney(longs, ccy)} long less ${fmtMoney(Math.abs(shorts), ccy)} short`}
        />
        <Card label="Names at risk" value={String(valued.length)} sub={parkedValue > 0 ? `plus ${fmtMoney(parkedValue, ccy)} parked as cash` : 'every equity position'} />
      </div>

      <div className="fundbook__split">
        <div>
          <div className="fundbook__subhead">By position</div>
          {/* CAPPED, because this is a summary and a summary with one row per holding is just the
              positions table again. Concentration is carried by the top few and the size of the tail —
              which is what the rolled-up row says — not by twenty individually tiny bars. */}
          {shown.map(({ p, base }) => (
            <ExposureBar key={`${p.conid ?? p.symbol}`} label={p.symbol ?? '—'} pct={shareOfRisk(base) ?? 0} value={fmtMoney(base, ccy)} />
          ))}
          {rest.length > 0 && (
            <ExposureBar
              label={`${rest.length} smaller`}
              pct={shareOfRisk(restValue) ?? 0}
              value={fmtMoney(restValue, ccy)}
              deep
            />
          )}
        </div>
        <div>
          {/* A bar is a COMPARISON. With one currency there is nothing to compare it against, and the
              row reduced to a full-width 100% bar that took a third of the block to say what the
              sentence below says in six words. Two or more, and the split is worth drawing. */}
          <div className="fundbook__subhead">By currency</div>
          {byCurrency.length > 1 ? byCurrency.map(([k, v]) => (
            <ExposureBar key={`c-${k}`} label={k} pct={shareOfRisk(v) ?? 0} value={fmtMoney(v, ccy)} />
          )) : (
            <div className="fundbook__barnote">
              {/* One currency is "no risk to spread" only when it IS the book's base currency — a book
                  100% in one FOREIGN currency is maximally FX-exposed, not FX-free, and an unknown
                  currency is an unknown state, not a proven absence of risk. */}
              {byCurrency.length === 1
                ? byCurrency[0]![0] === '—'
                  ? 'Currency unknown for every position — FX exposure cannot be assessed.'
                  : byCurrency[0]![0] === ccy
                    ? `All of it in ${byCurrency[0]![0]} — the book's own base currency, so no currency risk to spread.`
                    : `All of it in ${byCurrency[0]![0]} — fully exposed to that currency against the book's ${ccy ?? 'base currency'}.`
                : 'No valued position to split.'}
            </div>
          )}
          <div className="fundbook__subhead">By asset class</div>
          {byClass.map(([k, v]) => (
            <ExposureBar key={`a-${k}`} label={k} pct={shareOfRisk(v) ?? 0} value={fmtMoney(v, ccy)} deep />
          ))}
          {ideas && (
            <>
              <div className="fundbook__subhead">By idea — <b>declared, never inferred</b></div>
              {byIdea.length > 0 ? byIdea.map(([id, v]) => (
                <ExposureBar
                  key={`i-${id || 'none'}`}
                  label={id ? (ideaLabel.get(id) ?? id) : 'Unassigned'}
                  pct={shareOfRisk(v) ?? 0}
                  value={fmtMoney(v, ccy)}
                  deep={!id}
                  prose
                />
              )) : (
                <div className="fundbook__barnote">No position carries an idea yet — name one on a holding below.</div>
              )}
              {residualCount > 0 && (
                <div className="fundbook__barnote">
                  {residualCount === 1 ? 'One holding is' : `${residualCount} holdings are`} under {fmtMoney(RESIDUAL_VALUE_BASE, ccy)} and
                  left out of this weighting — dust from a closed trade, not a view. Still listed and still reconciled below.
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <div className="fundbook__foot">
        No sector split: the statement carries an asset category and a sub-category and nothing else, and
        a sector guessed from a ticker would be an invention wearing the broker&rsquo;s authority.
        {derivatives.length > 0 && ' Futures are excluded — notional is exposure against margin, not a share of NAV.'}
      </div>
    </div>
  )
}

/** How many names the concentration panel names individually before rolling the tail into one row. */
const TOP_POSITIONS = 8

/** Mirrors RESIDUAL_VALUE_BASE in the server's portfolio-ideas.ts. Dust is left out of idea WEIGHTING
 *  only — never out of the positions list, and never out of reconciliation. */
const RESIDUAL_VALUE_BASE = 100

function ExposureBar({ label, pct, value, deep, prose }: {
  label: string; pct: number; value: string; deep?: boolean
  /** An idea NAME, not a ticker. Tickers and asset classes are codes and belong in mono inside 74px;
   *  an idea is prose ("Consumer recovery 2026"), which in that column wrapped to three lines and made
   *  its row three times the height of every other bar. Prose rows get the sans face, a wider label
   *  column, and one line with an ellipsis — the full name stays reachable as the title. */
  prose?: boolean
}) {
  return (
    <div className={`fundbook__bar-row fundbook__bar-row--exposure${prose ? ' fundbook__bar-row--prose' : ''}`}>
      <span className={`fundbook__bar-label${prose ? '' : ' mono'}`} title={prose ? label : undefined}>{label}</span>
      <span className="fundbook__bar-track">
        <span style={{ width: `${Math.max(0, Math.min(100, Math.abs(pct)))}%`, background: deep ? 'var(--accent-deep)' : 'var(--accent)' }} />
      </span>
      <span className="fundbook__bar-pct">{pct.toFixed(1)}%</span>
      <span className="fundbook__bar-value">{value}</span>
    </div>
  )
}

function Bar({ label, pct, value, deep }: { label: string; pct: number; value: string; deep?: boolean }) {
  return (
    <div className="fundbook__bar-row">
      <span className="fundbook__bar-label">{label}</span>
      <span className="fundbook__bar-track"><span style={{ width: `${Math.max(0, Math.min(100, pct))}%`, background: deep ? 'var(--accent-deep)' : 'var(--accent)' }} /></span>
      <span className="fundbook__bar-pct">{pct.toFixed(1)}%</span>
      <span className="fundbook__bar-value">{value}</span>
    </div>
  )
}

function BridgeRow({ label, value, tone, title }: { label: string; value: string; tone?: string; title?: string }) {
  return (
    <div className="fundbook__bridge" title={title}>
      <span>{label}{title && <small className="fundbook__since"> {title}</small>}</span>
      <strong style={tone ? { color: tone } : undefined}>{value}</strong>
    </div>
  )
}

function Delta({ label, before, after, beforeText, afterText }: {
  label: string; before?: number; after?: number; beforeText?: string; afterText?: string
}) {
  const moved = beforeText !== undefined ? beforeText !== afterText : before !== after
  const shift = before !== undefined && after !== undefined ? after - before : null
  return (
    <div className={`fundbook__card${moved ? ' is-moved' : ''}`}>
      <span className="fundbook__cardlabel">{label}</span>
      <strong className="fundbook__cardvalue">{afterText ?? after}</strong>
      <small className="fundbook__cardsub">
        {moved
          ? <>was {beforeText ?? before}{shift !== null && shift !== 0 && <> · {shift > 0 ? '+' : '−'}{Math.abs(shift)}</>}</>
          : 'unchanged'}
      </small>
    </div>
  )
}

function PositionRow({ p, derivative, isCash, ideas, onChanged }: {
  p: PortfolioPosition; derivative?: boolean; isCash?: boolean
  ideas?: PortfolioIdeaBook; onChanged?: (r: PortfolioRead) => void
}) {
  return (
    <div className={`fundbook__row${isCash ? ' is-parked' : ''}`}>
      {/* Symbol and idea on ONE line. Stacked, the picker added 22px to every assignable row (57px
          against the 35px of a row that has none), so the positions table ran at uneven heights with
          the cash-equivalent rows visibly short. Inline, every row is the same height again. */}
      <strong className="mono fundbook__symcell">
        <span>{p.symbol ?? '—'}</span>
        {ideas && !isCash && !derivative && p.symbol && (
          <IdeaPicker symbol={p.symbol} ideas={ideas} onChanged={onChanged} />
        )}
      </strong>
      <span className="dim">{p.currency ?? '—'}</span>
      <span className="num">{fmtQty(p.quantity)}</span>
      <span className="num dim">{fmtNum(p.costBasisPrice)}</span>
      <span className="num">{fmtNum(p.markPrice)}</span>
      <span className="num">{fmtSmallMoney(p.positionValue)}{derivative && <small className="fundbook__notional">notional</small>}</span>
      <span className="num dim">{derivative ? '—' : p.percentOfNAV === null ? '—' : `${p.percentOfNAV.toFixed(1)}%`}</span>
      <span className="num" style={{ color: toneOf(p.unrealizedLocal) }}>{fmtSmallMoney(p.unrealizedLocal)}</span>
      {/* Against COST, not against market value: the question is what this position has returned on the
          money put into it. Cost is the statement's own basis, so the percentage ties to the figure
          beside it rather than to a denominator computed here. */}
      <span className="num" style={{ color: toneOf(p.unrealizedLocal) }}>{fmtPct(unrealisedPct(p), 1)}</span>
    </div>
  )
}

/** Declaring which idea a HOLDING expresses.
 *
 *  Naming a NEW idea uses an inline field, not window.prompt. The prompt was not merely bad manners in
 *  a cockpit that has no other native dialogs — it does not exist here: this browser throws
 *  "prompt() is not supported.", so picking "+ New idea…" could only ever fail, and the failure showed
 *  as one line of small red text under the row. An inline input also lets the name be corrected before
 *  it is committed, which a modal dialog cannot.
 */
function IdeaPicker({ symbol, ideas, onChanged, closeTradeIDs }: {
  symbol: string; ideas: PortfolioIdeaBook; onChanged?: (r: PortfolioRead) => void
  /** Present on a CLOSED round trip: the broker ids that identify it. Absent means this is the open
   *  position in `symbol`. The two are labelled separately on purpose — that is what keeps this year's
   *  AMZN and next year's from sharing a label just because they share a ticker. */
  closeTradeIDs?: string[]
}) {
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [naming, setNaming] = useState(false)
  const [draft, setDraft] = useState('')
  const onTrade = Array.isArray(closeTradeIDs)
  // A round trip's legs can disagree — the operator may have labelled them separately. Showing one of
  // them as if it were the row's answer would misreport it, so the picker shows no selection and the
  // row's own '(split)' marker says why.
  const found = onTrade ? new Set(closeTradeIDs!.map((t) => ideas.assignments.closures[t] ?? '')) : null
  const current = onTrade
    ? (found!.size === 1 ? [...found!][0]! : '')
    : (ideas.assignments.positions[symbol.toUpperCase()] ?? '')
  // No broker id means no stable key, so there is nothing to label and the control must not pretend.
  const unlabellable = onTrade && closeTradeIDs!.length === 0

  async function save(id: string | null): Promise<PortfolioRead> {
    return onTrade ? api.setTradeIdea(closeTradeIDs!, id) : api.setHoldingIdea(symbol, id)
  }

  async function assign(id: string | null) {
    setBusy(true); setErr(null)
    try {
      onChanged?.(await save(id))
    } catch (e: any) {
      setErr(String(e?.message || 'that could not be saved'))
    } finally { setBusy(false) }
  }

  async function createAndAssign() {
    const label = draft.trim()
    if (!label) { setNaming(false); setDraft(''); return }
    setBusy(true); setErr(null)
    try {
      // The SERVER says which idea this is. createIdea is idempotent on the slug, so typing "sugar"
      // while "Sugar" exists returns "Sugar" — reading the id back out of the response is what makes
      // that a success instead of the "could not be created" this used to report.
      const created = await api.createIdea(label)
      const id = created.idea?.id
      if (!id) throw new Error('that idea could not be created')
      onChanged?.(await save(id))
      setNaming(false); setDraft('')
    } catch (e: any) {
      setErr(String(e?.message || 'that idea could not be saved'))
    } finally { setBusy(false) }
  }

  if (unlabellable) {
    return (
      <span className="fundbook__idea">
        <small className="fundbook__lots" title="The broker gave this trade no id, so there is no stable key to hang a label on — a positional one would point at a different trade after the next import.">no trade id</small>
      </span>
    )
  }

  if (naming) {
    return (
      <span className="fundbook__idea">
        <input
          className="fundbook__ideainput"
          autoFocus
          value={draft}
          disabled={busy}
          maxLength={60}
          placeholder={`idea for ${symbol}…`}
          aria-label={`Name a new idea for ${symbol}`}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); void createAndAssign() }
            if (e.key === 'Escape') { e.preventDefault(); setNaming(false); setDraft(''); setErr(null) }
          }}
        />
        <button className="fundbook__ideaok" disabled={busy || !draft.trim()} onClick={() => void createAndAssign()}>
          {busy ? '…' : 'Add'}
        </button>
        <button className="fundbook__ideacancel" disabled={busy} onClick={() => { setNaming(false); setDraft(''); setErr(null) }}>
          Cancel
        </button>
        {err && <small className="fundbook__ideaerr">{err}</small>}
      </span>
    )
  }

  return (
    <span className="fundbook__idea">
      <select
        className="fundbook__ideaselect"
        value={current}
        disabled={busy}
        aria-label={onTrade ? `Idea for the ${symbol} round trip` : `Idea for ${symbol}`}
        onChange={(e) => {
          const v = e.target.value
          if (v === NEW_IDEA) { setNaming(true); setDraft(''); setErr(null); return }
          void assign(v || null)
        }}
      >
        <option value="">{onTrade && found!.size > 1 ? '— split —' : '— no idea yet —'}</option>
        {ideas.ideas.map((i) => <option key={i.id} value={i.id}>{i.label}</option>)}
        <option value={NEW_IDEA}>+ New idea…</option>
      </select>
      {err && <small className="fundbook__ideaerr">{err}</small>}
    </span>
  )
}

/** Sentinel for the "+ New idea…" row. A NUL prefix cannot collide with a real slug, which is only
 *  ever [a-z0-9-]. */
const NEW_IDEA = '\u0000new'

/** Unrealised return on cost. Null when the statement gives no usable basis — a position transferred in
 *  without one would otherwise divide by zero and report an infinite gain. */
function unrealisedPct(p: PortfolioPosition): number | null {
  const cost = p.costBasisMoney
  if (cost === null || !Number.isFinite(cost) || Math.abs(cost) < 1e-9) return null
  if (p.unrealizedLocal === null || !Number.isFinite(p.unrealizedLocal)) return null
  return (p.unrealizedLocal / Math.abs(cost)) * 100
}

// ---------- performance ----------

function Performance({ perf, cashShare }: { perf: PortfolioPerformance; cashShare: number | null }) {
  const { risk, benchmark: bm } = perf
  const ratio = (v: number | null) => (risk.sufficient && v !== null ? v.toFixed(2) : '—')
  const inception = perf.periods.find((p) => p.label === 'Since inception') ?? null
  // Past about a third in cash, the ratios say more about the parking than the picking.
  const cashHeavy = cashShare !== null && cashShare >= 33
  return (
    <>
      {/* ORDER IS THE ARGUMENT, and now the GRID CARRIES IT: three to a row, one theme per row — what
          the book made, what that cost in risk, then the risk-adjusted read and what the LP actually
          earned. Nine cards in a six-wide grid put three of them alone on a second row beside 970px of
          nothing; three rows of three fill the block and say why each card sits where it does. */}
      <div className="fundbook__cards fundbook__cards--metrics">
        <Card
          label="Return · TWR"
          value={fmtPct(inception?.twr, 2)}
          sub={inception ? `Time-weighted, flows removed · ${inception.from} → ${inception.to}` : 'Since inception'}
          tone={toneOf(inception?.twr)}
        />
        <Card
          label={`vs ${bm.symbol}`}
          value={bm.excess === null ? '—' : `${bm.excess >= 0 ? '+' : '−'}${Math.abs(bm.excess).toFixed(2)}pp`}
          sub={bm.unavailable ? bm.unavailable : `${fmtPct(inception?.twr, 2)} against the index's ${fmtPct(bm.benchmarkTwr, 2)}`}
          tone={toneOf(bm.excess)}
        />
        <Card
          label="vs cash"
          value={inception?.overHurdle === undefined || inception?.overHurdle === null
            ? '—'
            : `${inception.overHurdle >= 0 ? '+' : '−'}${Math.abs(inception.overHurdle).toFixed(2)}pp`}
          sub={`Over a ${perf.riskFreeAnnualPct}% cash rate, which earned ${fmtPct(inception?.hurdle, 2)} across this window`}
          tone={toneOf(inception?.overHurdle)}
        />
        <Card
          label="Max drawdown"
          value={risk.drawdown.depth === null ? '—' : `${fmtNum(risk.drawdown.depth, 2)}%`}
          sub={risk.drawdown.depth === null ? 'No fall from a high yet'
            : `${risk.drawdown.peakDate} → ${risk.drawdown.troughDate}${risk.drawdown.recoveredDate ? ` · back ${risk.drawdown.recoveredDate}` : ' · still under water'}`}
          tone={risk.drawdown.depth === null ? undefined : 'var(--bad)'}
        />
        <Card
          label="Volatility"
          value={risk.volatility === null || !risk.sufficient ? '—' : `${risk.volatility.toFixed(1)}%`}
          sub={cashHeavy ? `Annualised on TOTAL NAV, which is ${cashShare!.toFixed(0)}% cash` : 'Annualised from the daily NAV series'}
        />
        <Card
          label={`Beta to ${bm.symbol}`}
          value={perf.betaAlpha.beta === null ? '—' : perf.betaAlpha.beta.toFixed(2)}
          sub={perf.betaAlpha.beta === null
            ? `Needs ${bm.symbol} price history`
            : `Alpha ${fmtPct(perf.betaAlpha.alpha, 1)} annualised${Math.abs(perf.betaAlpha.beta) < 0.2 ? ' — but at this beta that is little more than the excess over cash' : ''}, from ${perf.betaAlpha.pairedDays} paired days`}
        />
        {/* The cash caveat is on the ratios too, and it is not a nicety: a book mostly in T-bills has
            little volatility, so its Sharpe reads high for holding cash rather than for picking well.
            The invested sleeve's own ratio cannot be computed — the statement carries ONE daily NAV for
            the whole account, not one per sleeve — so the honest move is to say what the figure covers
            rather than to derive a flattering number from a denominator we do not have. */}
        <Card label="Sharpe" value={ratio(risk.sharpe)} sub={cashHeavy ? 'Excess per unit of swing — on the whole book, cash included' : 'Excess return per unit of swing'} />
        <Card label="Sortino" value={ratio(risk.sortino)} sub="Counts only downside swing" />
        <Card
          label="Money-weighted"
          value={fmtPct(perf.moneyWeightedAnnualisedPct)}
          sub="ANNUALISED (IRR) — what the LP earned, not comparable with the cumulative returns"
          tone={toneOf(perf.moneyWeightedAnnualisedPct)}
        />
      </div>

      <div className="fundbook__panel">
        <div className="fundbook__panelhead">
          <div>
            <strong>Return by period</strong>
            <small>Cash hurdle {perf.riskFreeAnnualPct}% · ratios from {risk.sampleDays} funded days</small>
          </div>
        </div>
        <div className="fundbook__scroll">
          <div className="fundbook__row fundbook__row--periods fundbook__row--head">
            <span>Period</span><span className="num">Return</span><span className="num">{bm.symbol}</span><span className="num">Excess</span>
            <span className="num">Cash</span><span className="num">Over cash</span>
          </div>
          {perf.periods.map((p) => (
            <div key={p.label} className="fundbook__row fundbook__row--periods">
              <span>
                {p.label}
                {/* The book has no valued day at this period's own start, so the figure covers less than
                    the label claims. Said out loud — otherwise two rows show the same number under two
                    period names and the reader has to guess which one is the real one. */}
                {p.partial && <em className="fundbook__partial" title={`The book has no valued day before this period began — measured from ${p.from}`}>from inception</em>}
                <small className="fundbook__since">{p.from} → {p.to}</small>
              </span>
              <strong className="num" style={{ color: toneOf(p.twr) }}>{fmtPct(p.twr, 2)}</strong>
              {/* Measured over THIS row's own window — the same days the return beside it covers —
                  rather than repeating the since-inception figure or leaving the column empty. Null,
                  and so a dash, only where the feed cannot span the window without a hole in it. */}
              <span className="num dim">{fmtPct(p.benchmark, 2)}</span>
              <span className="num" style={{ color: toneOf(p.excess) }}>
                {p.excess === null ? '—' : `${p.excess >= 0 ? '+' : '−'}${Math.abs(p.excess).toFixed(2)}pp`}
              </span>
              {/* The second yardstick: beating an index while trailing a deposit account is not a result.
                  The day count that used to close this row is gone — the window is printed under the
                  period name, so it said the same thing twice and cost the table 58 of the 780px that
                  made it scroll on a laptop. */}
              <span className="num dim">{fmtPct(p.hurdle, 2)}</span>
              <span className="num" style={{ color: toneOf(p.overHurdle) }}>
                {p.overHurdle === null ? '—' : `${p.overHurdle >= 0 ? '+' : '−'}${Math.abs(p.overHurdle).toFixed(2)}pp`}
              </span>
            </div>
          ))}
        </div>
        {/* bm.unavailable comes from the SINCE-INCEPTION comparison only. The period rows above are each
            measured over their own window (benchmarkOverWindow), so a feed that covers a recent MTD or
            QTD window but not the book's full history can fill valid rows while this footer, unqualified,
            said "No benchmark comparison" — contradicting the table directly above it. */}
        {bm.unavailable && (
          perf.periods.some((p) => p.benchmark !== null) ? (
            <div className="fundbook__foot">
              No SINCE-INCEPTION benchmark comparison: {bm.unavailable}. The periods above still compare
              where the feed covers that shorter window. Drop daily closes for <b>{bm.symbol}</b> into
              <b> data/_market/&lt;provider&gt;/</b> as <b>date,symbol,close</b>, back to the book's own
              start, to fill the rest.
            </div>
          ) : (
            <div className="fundbook__foot">
              No benchmark comparison: {bm.unavailable}. Drop daily closes for <b>{bm.symbol}</b> into
              <b> data/_market/&lt;provider&gt;/</b> as <b>date,symbol,close</b> and it appears here.
            </div>
          )
        )}
      </div>

      {perf.months.length > 0 && (
        <div className="fundbook__panel">
          <div className="fundbook__panelhead">
            <div><strong>Month by month</strong></div>
          </div>
          <div className="fundbook__scroll">
            <div className="fundbook__months">
              <div className="fundbook__monthrow fundbook__monthrow--head">
                <span>&nbsp;</span>
                {perf.months.map((m) => <span key={m.month} className="num">{m.month.slice(2)}</span>)}
              </div>
              <div className="fundbook__monthrow">
                <span>Book</span>
                {perf.months.map((m) => (
                  <span key={m.month} className="num" style={{ color: toneOf(m.book) }}>{fmtPct(m.book, 1)}</span>
                ))}
              </div>
              <div className="fundbook__monthrow">
                <span className="dim">{bm.symbol}</span>
                {perf.months.map((m) => <span key={m.month} className="num dim">{fmtPct(m.benchmark, 1)}</span>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* THE TWO RETURN TABLES BELONG TOGETHER: the same question at two granularities, and a reader
          goes straight from one to the other. The drawdown chart answers a different one — not what the
          book returned but what holding it felt like — so it follows them rather than splitting them,
          which is also the order the cards above read in: return, then comparison, then risk.

          They are NOT side by side, and the reason is measurable rather than aesthetic: the period
          table needs 780px and a half column of the 1180px shell is 584px, so it would scroll
          horizontally forever. The monthly grid is worse as a partner — 352px at six months, 772px at
          twelve, 2212px at three years — so any pairing that fits today breaks within months. */}
      {perf.growth.length > 1 && (
        <div className="fundbook__panel">
          <div className="fundbook__panelhead">
            <div>
              <strong>Drawdown</strong>
              <small>
                Distance below the previous high
                {risk.drawdown.underWaterDays !== null && ` · the deepest took ${risk.drawdown.underWaterDays} days to recover`}
              </small>
            </div>
          </div>
          {/* The SAME series the growth curve is drawn from: the underwater line is a pure function of
              that index, so deriving it here rather than from a second precomputed field means the two
              charts cannot disagree about the same days — and it is what lets the range and the
              benchmark work at all. */}
          {/* THE RECONCILED SERIES ONLY. Max drawdown is a risk statistic the cards state as fact; letting
              an estimate set a new low would put a number nobody can check into a figure people size
              positions from. */}
          <UnderwaterChart series={perf.growth} benchmarkSymbol={perf.benchmark.symbol} />
        </div>
      )}

      {!risk.sufficient && (
        <div className="fundbook__panel"><div className="fundbook__foot">
          {risk.sampleDays} days of valued history — too few to state Sharpe, Sortino or volatility
          honestly, so they are left blank rather than guessed. They appear once the book has about a
          quarter of daily data.
        </div></div>
      )}
      {risk.drawdown.episodesOver3pct > 0 && (
        <div className="fundbook__panel"><div className="fundbook__foot">
          {risk.drawdown.episodesOver3pct} fall{risk.drawdown.episodesOver3pct === 1 ? '' : 's'} of more than 3% since inception
          {risk.drawdown.underWaterDays !== null && ` · the deepest took ${risk.drawdown.underWaterDays} days to recover`}.
        </div></div>
      )}
    </>
  )
}

// ---------- trade history ----------

/** One row of the trade table: a single closing execution, with every FIFO lot it consumed folded in. */

function Trades({ book, manual, onChanged, ideas, cashEquivalents, importOpen, onImportOpen, importSurface }: {
  book: PortfolioBook; manual: PortfolioManualRead; onChanged: (r: PortfolioRead) => void
  ideas?: PortfolioIdeaBook; cashEquivalents: string[]
  importOpen: boolean; onImportOpen: (v: boolean) => void; importSurface: React.ReactNode
}) {
  const [logging, setLogging] = useState(false)
  const ccy = book.baseCurrency
  // ONE ROW PER TRADE, NOT PER LOT. A single sell is matched against every opening lot it consumes, so
  // FIFO produces one closure per lot — on the real book, 47 lot-rows for 31 trades, with one AMZN sell
  // spread across nine of them. The operator placed one order; the lots are the accounting underneath
  // it. `closeTradeID` is the closing execution, which is exactly the thing to group on. A closure with
  // no id keeps its own row rather than being lumped with unrelated ones.
  const rows = useMemo(() => foldRoundTrips(book.closures), [book.closures])
  // A THIRD fold on top of the round trips: which IDEA each was expressing. It changes nothing about
  // the arithmetic above — the grouped total is asserted equal to the blotter total in the tests —
  // and it is the only view that can answer "did the sugar idea work" when the idea was expressed
  // through two different vehicles.
  const ideaRows = useMemo(() => groupByIdea(rows, ideas, cashEquivalents), [rows, ideas, cashEquivalents])
  const stats = useMemo(() => {
    const vals = rows.map((c) => c.realized)
    const wins = vals.filter((v) => v > 0)
    const losses = vals.filter((v) => v < 0)
    const held = rows.map((c) => c.holdingDays).filter((d): d is number => d !== null)
    const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
    // Converted trade by trade at that trade's own closing rate, and the ones with no rate counted
    // rather than added: the raw local figures were summed across currencies and shown as base.
    const costs = sumBase(rows, (c) => c.commissionBase)
    return {
      total: vals.reduce((a, b) => a + b, 0),
      hitRate: rows.length ? (wins.length / rows.length) * 100 : null,
      wins: wins.length,
      losses: losses.length,
      avgWin: avg(wins),
      avgLoss: avg(losses),
      avgHold: avg(held),
      commission: costs.total,
      commissionUnvalued: costs.unvalued,
      grossRealised: vals.reduce((a, b) => a + Math.abs(b), 0),
      worst: losses.length ? Math.min(...losses) : null,
    }
  }, [rows])

  // Attribution: what carried the realised result, biggest absolute mover first.
  //
  // Folded by IDEA where one is declared, by NAME where none is. Per symbol, one sugar bet expressed
  // through two vehicles showed up as CANE +3,703 and SUGAl +3,005 — two mid-sized bars that between
  // them were the book's biggest winner at +6,708, and nothing on the panel said so. A declared cash
  // equivalent keeps its own name: SGOV is where the money waited, not a name that "carried" anything.
  const { attribution, attributionMax, topShare, nameCount, foldedNames } = useMemo(() => {
    const labels = new Map((ideas?.ideas ?? []).map((i) => [i.id, i.label]))
    const assigned = ideas?.assignments?.closures ?? {}
    const cash = new Set(cashEquivalents.map((v) => v.trim().toUpperCase()))
    const by = new Map<string, { value: number; trades: number; names: Set<string> }>()
    let folded = 0
    for (const c of rows) {
      const sym = c.symbol ?? '—'
      // One idea per row only when every leg agrees — the same rule groupByIdea applies, so the two
      // panels can never disagree about which bucket a trade is in.
      const found = new Set(c.closeTradeIDs.map((t) => assigned[t] ?? ''))
      const id = found.size === 1 ? [...found][0]! : ''
      const useIdea = !!id && !cash.has(sym.toUpperCase())
      const k = useIdea ? (labels.get(id) ?? id) : sym
      const cur = by.get(k) ?? { value: 0, trades: 0, names: new Set<string>() }
      cur.value += c.realized
      cur.trades += 1
      cur.names.add(sym)
      by.set(k, cur)
    }
    for (const v of by.values()) if (v.names.size > 1) folded += 1
    const all = [...by.entries()].map(([symbol, v]) => ({ symbol, value: v.value, trades: v.trades }))
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
    const list = all.slice(0, 12)
    const max = Math.max(...list.map((a) => Math.abs(a.value)), 1)
    const winners = all.filter((a) => a.value > 0).sort((a, b) => b.value - a.value)
    const grossWin = winners.reduce((a, b) => a + b.value, 0)
    const top3 = winners.slice(0, 3).reduce((a, b) => a + b.value, 0)
    return {
      attribution: list,
      attributionMax: max,
      topShare: winners.length > 3 && grossWin > 0 ? (top3 / grossWin) * 100 : null,
      nameCount: all.length,
      foldedNames: folded,
    }
  }, [rows, ideas, cashEquivalents])

  // Splitting the realised result into what the STOCK did and what the RATE did. Exact by construction:
  //   realised(base) = gross×openFx  +  gross×(closeFx − openFx)  +  costs×closeFx
  // Only the FX move on the GAIN can appear here — the move on the capital itself never enters the
  // broker's realised P&L, which is why the note under the table says where it does land.
  const { currencyEffect, allBase } = useMemo(() => {
    const by = new Map<string, { trades: number; security: number; currencyEffect: number; costs: number; realised: number }>()
    // Reads the LOTS, not the merged rows: the fx pair belongs to a lot (each was opened on its own day
    // at its own rate), and averaging rates across a merge would blur the very split this table exists
    // to show.
    for (const c of book.closures) {
      const open = c.openFxRateToBase
      const close = c.closeFxRateToBase
      if (open === null || close === null) continue // no rate pair — excluded rather than assumed 1
      const k = c.currency ?? '—'
      const cur = by.get(k) ?? { trades: 0, security: 0, currencyEffect: 0, costs: 0, realised: 0 }
      cur.trades += 1
      cur.security += c.grossLocal * open
      cur.currencyEffect += c.grossLocal * (close - open)
      cur.costs += c.commissionLocal * close
      cur.realised += c.realizedBase ?? 0
      by.set(k, cur)
    }
    const list = [...by.entries()].map(([currency, v]) => ({ currency, ...v }))
      .sort((a, b) => Math.abs(b.realised) - Math.abs(a.realised))
    return { currencyEffect: list, allBase: list.every((r) => Math.abs(r.currencyEffect) < 0.005) }
  }, [book.closures])

  // Rendered above the closed round trips AND above the empty state: a book whose only activity is
  // hand-logged fills must not look like a book with nothing in it.
  const manualPanel = (
    <div className={`fundbook__panel${manual.live > 0 ? ' is-provisional' : ''}`}>
      <div className="fundbook__panelhead">
        <div>
          <strong>Add trades to the book</strong>
          <small>A hand-logged fill is provisional — it never enters the reconciled book, and a statement covering its date answers it</small>
        </div>
        <div className="fundbook__formbtns">
          <button
            className={`fundbook__btn${importOpen ? ' is-primary' : ''}`}
            onClick={() => { onImportOpen(!importOpen); setLogging(false) }}
          >
            {importOpen ? 'Hide import' : 'Import statement'}
          </button>
          <button
            className={`fundbook__btn${logging ? ' is-primary' : ''}`}
            onClick={() => { setLogging(!logging); onImportOpen(false) }}
          >
            {logging ? 'Cancel' : 'Log a trade'}
          </button>
        </div>
      </div>
      {importOpen && <div className="fundbook__embed">{importSurface}</div>}
      {logging && (
        <LogTradeForm
          baseCurrency={ccy}
          onCancel={() => setLogging(false)}
          onDone={(read) => { onChanged(read); setLogging(false) }}
        />
      )}

      {/* The "nothing logged yet" copy explains the feature — pointless, and faintly absurd, while the
          operator is typing into the form it describes. */}
      {(!logging || manual.trades.length > 0) && (
        <ManualTradeList manual={manual} baseCurrency={ccy} onChanged={onChanged} />
      )}
      {manual.effects.length > 0 && (
        <>
          <div className="fundbook__subhead">What they would do to the book</div>
          <ProvisionalEffects effects={manual.effects} />
        </>
      )}
    </div>
  )

  if (rows.length === 0) {
    return (
      <>
        {manualPanel}
        <div className="fundbook__empty">
          <strong>No closed trades yet</strong>
          <span>A round trip appears once a position has been closed and matched against the lot that opened it.</span>
        </div>
      </>
    )
  }
  return (
    <>
      {/* The SUMMARY leads here too. "Add trades" is an action, not information: it was heading a screen
          whose first question is what the trading actually produced. */}
      <div className="fundbook__cards">
        <Card
          label="Realised"
          value={fmtMoney(stats.total, ccy)}
          sub={`Net of ${fmtMoney(Math.abs(stats.commission), ccy)} in costs${stats.commissionUnvalued > 0
            ? ` · costs on ${stats.commissionUnvalued} trade${stats.commissionUnvalued === 1 ? '' : 's'} had no rate and are left out`
            : ''}`}
          tone={toneOf(stats.total)}
        />
        <Card label="Closed trades" value={String(rows.length)} sub={`${stats.wins} up · ${stats.losses} down`} />
        <Card label="Hit rate" value={stats.hitRate === null ? '—' : `${stats.hitRate.toFixed(0)}%`} sub="Share that closed up" />
        <Card
          label="Win / loss size"
          value={stats.avgWin && stats.avgLoss ? `${(stats.avgWin / Math.abs(stats.avgLoss)).toFixed(1)}×` : '—'}
          sub={`Avg ${fmtMoney(stats.avgWin, ccy)} vs ${fmtMoney(stats.avgLoss, ccy)}`}
        />
        <Card label="Avg hold" value={stats.avgHold === null ? '—' : `${Math.round(stats.avgHold)}d`} sub="Open to close" />
        <Card label="Largest loss" value={fmtMoney(stats.worst, ccy)} sub="Single round trip" tone={stats.worst === null ? undefined : 'var(--bad)'} />
      </div>

      {manualPanel}

      {ideas && (
        <div className="fundbook__panel">
          <div className="fundbook__panelhead">
            <div><strong>By idea</strong><small>What the money was actually betting on, across every vehicle used to express it</small></div>
          </div>
          <div className="fundbook__subhead">
            Declared, never inferred — a ticker is not an idea, so each closed trade is labelled
            against <b>the broker&rsquo;s own trade ids</b>. Labelling this year&rsquo;s trade cannot relabel next year&rsquo;s.
          </div>
          {ideaRows.length === 0 ? (
            <div className="fundbook__none">No closed trades yet.</div>
          ) : (
            <div className="fundbook__scroll">
              <div className="fundbook__row fundbook__row--ideas fundbook__row--head">
                <span>Idea</span><span>Expressed through</span><span className="num">Realised</span>
                <span className="num">Trades</span><span className="num">First</span><span className="num">Last</span>
              </div>
              {ideaRows.map((g) => (
                <div key={g.ideaId ?? g.label} className="fundbook__row fundbook__row--ideas">
                  <span>{g.label}</span>
                  <span className="mono dim">{g.symbols.join(' · ') || '—'}</span>
                  <span className="num" style={{ color: toneOf(g.realized) }}>{fmtSmallMoney(g.realized)}</span>
                  <span className="num dim">{g.trades}</span>
                  <span className="num dim">{g.firstClosed ?? '—'}</span>
                  <span className="num dim">{g.lastClosed ?? '—'}</span>
                </div>
              ))}
            </div>
          )}
          {ideaRows.some((g) => g.unlabellable > 0) && (
            <div className="fundbook__foot">
              {ideaRows.reduce((a, g) => a + g.unlabellable, 0)} closed trade(s) carry no broker trade id, so they
              cannot be labelled — they are shown under Unassigned and will stay there.
            </div>
          )}
        </div>
      )}

      <div className="fundbook__split">
        <div className="fundbook__panel">
          <div className="fundbook__panelhead">
            <div>
              <strong>Where the money came from</strong>
              <small>{foldedNames > 0 ? 'Realised result by idea, or by name where none is declared' : 'Realised result by name'}</small>
            </div>
          </div>
          {attribution.length === 0
            ? <div className="fundbook__none">Nothing closed yet.</div>
            : attribution.map((a) => (
              <div key={a.symbol} className="fundbook__contrib">
                <span className="fundbook__contrib-label mono">{a.symbol}</span>
                {/* Diverging from a centre line: losers read as losers at a glance, which a
                    left-anchored bar cannot do. */}
                <span className="fundbook__contrib-track">
                  <i className="fundbook__contrib-zero" aria-hidden />
                  <i
                    className="fundbook__contrib-fill"
                    style={{
                      left: a.value >= 0 ? '50%' : `${50 - (Math.abs(a.value) / attributionMax) * 50}%`,
                      width: `${(Math.abs(a.value) / attributionMax) * 50}%`,
                      background: a.value < 0 ? 'var(--bad)' : 'var(--accent)',
                    }}
                  />
                </span>
                <span className="fundbook__contrib-value num" style={{ color: toneOf(a.value) }}>{fmtMoney(a.value, ccy)}</span>
                <span className="fundbook__contrib-n num dim">{a.trades}</span>
              </div>
            ))}
          {attribution.length > 0 && (
            <div className="fundbook__foot">
              {/* Counted against the list actually drawn. This claimed every name was shown whenever
                  there were three winners or fewer — a fact about winners, not about the cap of 12,
                  so a book with 20 closed names and 2 winners asserted completeness with 8 hidden. */}
              {attribution.length < nameCount
                ? `The ${attribution.length} biggest movers, of ${nameCount} closed names.`
                : 'Every closed name is shown.'}
              {topShare !== null && ` The best three carry ${topShare.toFixed(0)}% of the gross winnings.`}
              {foldedNames > 0 && ` ${foldedNames === 1 ? 'One bar is an idea' : `${foldedNames} bars are ideas`} — every vehicle used to express it, added up.`}
            </div>
          )}
        </div>

        <div className="fundbook__panel">
          <div className="fundbook__panelhead">
            <div><strong>Stock or currency?</strong><small>How much of the result was the position, and how much was the rate moving under it</small></div>
          </div>
          {currencyEffect.length === 0 ? (
            <div className="fundbook__none">No closed trade carries both an opening and a closing rate yet.</div>
          ) : (
            <>
              <div className="fundbook__row fundbook__row--fx fundbook__row--head">
                <span>Ccy</span><span className="num">Trades</span><span className="num">Stock</span><span className="num">Currency</span><span className="num">Costs</span><span className="num">Realised</span>
              </div>
              {currencyEffect.map((r) => (
                <div key={r.currency} className="fundbook__row fundbook__row--fx">
                  <strong className="mono">{r.currency}</strong>
                  <span className="num dim">{r.trades}</span>
                  <span className="num" style={{ color: toneOf(r.security) }}>{fmtMoney(r.security, ccy)}</span>
                  <span className="num" style={{ color: toneOf(r.currencyEffect) }}>{fmtMoney(r.currencyEffect, ccy)}</span>
                  <span className="num dim">{fmtMoney(r.costs, ccy)}</span>
                  <strong className="num" style={{ color: toneOf(r.realised) }}>{fmtMoney(r.realised, ccy)}</strong>
                </div>
              ))}
              <div className="fundbook__foot">
                {allBase
                  ? `Every closed trade settled in ${ccy ?? 'the base currency'}, so there is no currency effect to separate.`
                  : `The currency column is the rate moving between opening and closing the trade. The rate moving on the CAPITAL itself is not realised P&L — it sits in the cash balance and reaches the return through NAV.`}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="fundbook__panel">
        <div className="fundbook__panelhead">
          <div>
            <strong>Closed round trips</strong>
            <small>One row per round trip — every lot it consumed and every order it left in · realised is net of commission on both legs</small>
          </div>
        </div>
        <div className="fundbook__scroll">
          <div className="fundbook__row fundbook__row--trades fundbook__row--head">
            <span>Symbol</span><span>Idea</span><span>Ccy</span><span>Opened</span><span>Closed</span><span className="num">Held</span>
            <span className="num">Qty</span><span className="num">Entry</span><span className="num">Exit</span>
            <span className="num">Gross</span><span className="num">Costs</span><span className="num">Realised</span>
            <span className="num">Share</span>
          </div>
          {rows.map((c, i) => (
            <TradeRow
              key={`${c.symbol}-${c.closedAt}-${i}`} c={c} grossRealised={stats.grossRealised}
              ideas={ideas} onChanged={onChanged}
            />
          ))}
        </div>
      </div>
    </>
  )
}

function TradeRow({ c, grossRealised, ideas, onChanged }: {
  c: TradeRowData; grossRealised: number
  ideas?: PortfolioIdeaBook; onChanged?: (r: PortfolioRead) => void
}) {
  // Share of the book's total realised ACTIVITY (winners and losers as magnitudes), so it stays stable
  // when the net happens to sit near zero — where a share of the net would explode into nonsense.
  const share = grossRealised > 0 ? (Math.abs(c.realized) / grossRealised) * 100 : null
  return (
    <div className="fundbook__row fundbook__row--trades">
      <strong className="mono">
        {c.symbol ?? '—'}
        {(c.lots > 1 || c.fills > 1) && (
          <small
            className="fundbook__lots"
            title={`${c.fills > 1 ? `${c.fills} exits, ` : ''}${c.lots} opening lot${c.lots === 1 ? '' : 's'} — summed, with prices weighted by quantity`}
          >{c.fills > 1 ? `${c.fills} fills` : `${c.lots} lots`}</small>
        )}
      </strong>
      <span>
        {ideas
          ? <IdeaPicker symbol={c.symbol ?? '—'} ideas={ideas} onChanged={onChanged} closeTradeIDs={c.closeTradeIDs} />
          : <span className="dim">—</span>}
      </span>
      <span className="dim">{c.currency ?? '—'}</span>
      <span className="dim mono">{(c.openedAt ?? '—').slice(0, 10)}</span>
      <span className="dim mono">{(c.closedAt ?? '—').slice(0, 10)}</span>
      <span className="num dim">{c.holdingDays === null ? '—' : `${c.holdingDays}d`}</span>
      <span className="num">{fmtQty(c.quantity)}</span>
      <span className="num dim">{fmtNum(c.entryPrice)}</span>
      <span className="num">{fmtNum(c.exitPrice)}</span>
      <span className="num dim">{fmtSmallMoney(c.grossLocal)}</span>
      <span className="num dim">{fmtSmallMoney(c.commissionLocal)}</span>
      <strong className="num" style={{ color: toneOf(c.realized) }}>{fmtSmallMoney(c.realized)}</strong>
      <span className="num dim">{share === null ? '—' : `${share.toFixed(1)}%`}</span>
    </div>
  )
}

// ---------- import ----------

function ImportTab({ read, onFiles, onChanged, busy, progress, notes, firstRun, changed, manual, embedded }: {
  read: PortfolioRead
  onFiles: (f: File[]) => void
  onChanged: (r: PortfolioRead) => void
  busy: boolean
  progress: number
  notes: { tone: 'ok' | 'bad'; text: string }[]
  firstRun?: boolean
  changed: ImportDelta | null
  manual: PortfolioManualRead
  /** Rendered inside the trade screen rather than as a screen of its own — no drop-zone flourish. */
  embedded?: boolean
}) {
  const [removing, setRemoving] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const book = read.book
  return (
    <>
      <label className={`fundbook__drop${busy ? ' is-busy' : ''}${firstRun && !embedded ? '' : ' is-compact'}`}>
        <input type="file" accept=".xml,text/xml,application/xml" multiple hidden
          onChange={(e) => { void onFiles([...(e.target.files ?? [])]); e.target.value = '' }} />
        <svg width={firstRun && !embedded ? 26 : 20} height={firstRun && !embedded ? 26 : 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" />
        </svg>
        <div className="fundbook__droptext">
          <strong>{busy ? 'Importing…' : 'Drop an IBKR Flex export, or click to choose'}</strong>
          <small>
            Activity Flex Query, XML. Overlapping date ranges are safe — trades are matched on IBKR&rsquo;s own
            ids, so re-importing a year never double-counts. The file stays on this machine.
          </small>
        </div>
        {busy && <span className="fundbook__bar"><span style={{ width: `${Math.round(progress * 100)}%` }} /></span>}
      </label>

      {notes.length > 0 && (
        <div className="fundbook__notes">
          {notes.map((n, i) => <span key={i} className={`fundbook__note fundbook__note--${n.tone}`}>{n.text}</span>)}
        </div>
      )}
      {changed && (
        <div className="fundbook__panel">
          <div className="fundbook__panelhead">
            <div>
              <strong>What this import changed</strong>
              <small>Measured against the book as it stood before the file was read</small>
            </div>
          </div>
          {changed.nothingMoved ? (
            <div className="fundbook__foot">
              Nothing in the book moved. That is the expected outcome when the file only repeats a range
              already imported — but if you meant to add new activity, the export&rsquo;s date range is
              the first thing to check.
            </div>
          ) : (
            <div className="fundbook__cards fundbook__cards--tight">
              <Delta label="Statements" before={changed.before.statements} after={changed.after.statements} />
              <Delta label="Trades read" before={changed.before.trades} after={changed.after.trades} />
              <Delta label="Closed round trips" before={changed.before.closures} after={changed.after.closures} />
              <Delta label="Open positions" before={changed.before.positions} after={changed.after.positions} />
              <Delta label="Valued days" before={changed.before.navPoints} after={changed.after.navPoints} />
              <Delta label="Covered through" beforeText={changed.before.to ?? '—'} afterText={changed.after.to ?? '—'} />
            </div>
          )}
        </div>
      )}

      {/* Only when no book builds. The Trade-history tab owns these normally, but that tab does not exist
          without a book — and entries logged before the statements were removed would otherwise be
          stranded with no way to reach or delete them. Shown, never offered: logging a NEW fill needs an
          account and a base currency to be worth anything, and neither exists here. */}
      {!book && manual.trades.length > 0 && (
        <div className="fundbook__panel is-provisional">
          <div className="fundbook__panelhead">
            <div>
              <strong>Logged by hand</strong>
              <small>
                {manual.trades.length} entr{manual.trades.length === 1 ? 'y' : 'ies'} kept from before. They
                rejoin the Trade history screen as soon as a statement builds a book again.
              </small>
            </div>
          </div>
          <ManualTradeList manual={manual} baseCurrency={null} onChanged={onChanged} />
        </div>
      )}

      {read.error && <div className="fundbook__error"><span>{read.error}</span></div>}
      {removeError && <div className="fundbook__error"><span>{removeError}</span></div>}

      {book && (
        <div className="fundbook__panel">
          <div className="fundbook__panelhead">
            <div><strong>Reconciliation</strong><small>What proves the derived numbers against the broker</small></div>
          </div>
          <div className="fundbook__scroll">
            <div className="fundbook__row fundbook__row--checks fundbook__row--head">
              <span>Check</span><span className="num">Ours</span><span className="num">Broker</span><span className="num">Break</span><span className="num">State</span>
            </div>
            {book.reconciliation.checks.map((c) => (
              <div key={c.name} className="fundbook__row fundbook__row--checks">
                <span>{c.name}<small className="fundbook__since">{c.detail}</small></span>
                <span className="num dim">{fmtNum(c.ours, 2)}</span>
                <span className="num dim">{fmtNum(c.broker, 2)}</span>
                <span className="num" style={{ color: c.ok ? undefined : 'var(--bad)' }}>{fmtNum(c.break, 4)}</span>
                <span className={`num ${c.ok ? 'fundbook__ok' : 'fundbook__break'}`}>{c.ok ? 'ok' : 'BREAK'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rendered whenever statements EXIST, not only when they built a book. When the build fails —
          two accounts in one import, or a file that has become unreadable — these Remove buttons are the
          only way out, and hiding them behind a successful build strands the operator with an error and
          no control that could clear it. */}
      {read.statements.length > 0 ? (
        <div className="fundbook__panel">
          <div className="fundbook__panelhead">
            <div><strong>Imported statements</strong><small>Remove one and the book recomputes</small></div>
          </div>
          {read.statements.map((s) => (
            <div key={s.id} className="fundbook__stmt">
              <span className="mono">{s.filename}</span>
              <span className="dim">{s.fromDate ?? '?'} → {s.toDate ?? '?'}</span>
              <span className="dim num">{s.trades} trades</span>
              {/* What the file actually CARRIED. A Flex query with a section left unticked imports
                  cleanly and reconciles green while silently missing dividends or NAV — the only way to
                  catch that is to show what came in the box. */}
              <span className="fundbook__chips">
                {Object.entries(s.sections ?? {}).sort((a, b) => b[1] - a[1]).map(([name, n]) => (
                  <i key={name} className={`fundbook__chip${n === 0 ? ' is-unread' : ''}`}
                    title={n === 0
                      ? `${name} carried no rows. Normal if none occurred — but it is also what an unticked section looks like, so check the Flex query if you expected some.`
                      : `${n} row${n === 1 ? '' : 's'} read from ${name}`}>
                    {name} <b>{n}</b>
                  </i>
                ))}
                {(s.unmodelled ?? []).map((name) => (
                  <i key={`u-${name}`} className="fundbook__chip is-unread" title={`${name} is present in the file but not read by the importer`}>
                    {name} <b>not read</b>
                  </i>
                ))}
                {Object.keys(s.sections ?? {}).length === 0 && <i className="fundbook__chip is-unread">no sections recorded</i>}
              </span>
              <button
                className="fundbook__remove"
                disabled={removing === s.id}
                onClick={async () => {
                  setRemoving(s.id); setRemoveError(null)
                  try { onChanged(await api.deleteStatement(s.id)) }
                  catch (e: any) { setRemoveError(e?.message || 'could not remove that statement') }
                  finally { setRemoving(null) }
                }}
              >
                {removing === s.id ? 'Removing…' : 'Remove'}
              </button>
            </div>
          ))}
          {book && book.sectionsUnmodelled.length > 0 && (
            <div className="fundbook__foot">
              Present in the statement but not read by the importer: <b>{book.sectionsUnmodelled.join(', ')}</b>.
              Listed so a reconciled book is never mistaken for a fully-consumed statement.
            </div>
          )}
          {book?.warnings.map((w, i) => <div key={i} className="fundbook__foot fundbook__foot--warn">{w}</div>)}
        </div>
      ) : (
        <div className="fundbook__empty">
          <strong>No statement imported yet</strong>
          <span>
            In IBKR: Reports → Flex Queries → Activity Flex Query. Include Trades, Positions, Cash
            Transactions, Change in NAV and Corporate Actions, and run it as XML.
          </span>
        </div>
      )}
    </>
  )
}
