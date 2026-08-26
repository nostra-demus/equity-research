import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { api } from '../../lib/api'
import type {
  PortfolioBook, PortfolioClosure, PortfolioManualRead, PortfolioPerformance, PortfolioPosition, PortfolioRead,
} from '../../lib/types'
import { useStore } from '../../lib/store'
import { GrowthChart, UnderwaterChart } from './charts'
import { LogTradeForm, ManualTradeList, ProvisionalEffects } from './manual'

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

  const load = useCallback(async () => {
    setLoading(true)
    try { setRead(await api.portfolio()); setError(null) }
    catch (e: any) { setError(e?.message || 'could not reach the engine') }
    finally { setLoading(false) }
  }, [])
  useEffect(() => { void load() }, [load])

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
            cashEquivalents={read?.overrides?.cashEquivalents ?? []}
            onManage={() => setTab('trades')} onChanged={setRead}
          />
        ) : tab === 'performance' ? (
          read?.performance
            ? <Performance perf={read.performance} />
            : <div className="fundbook__none">No performance to show yet.</div>
        ) : (
          <Trades
            book={book} manual={manual} onChanged={setRead}
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
    realised: b ? b.closures.reduce((a, c) => a + (c.realizedBase ?? c.realizedLocal), 0) : null,
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

// ---------- holdings ----------

function Holdings({ book, perf, manual, cashEquivalents, onManage, onChanged }: {
  book: PortfolioBook; perf: PortfolioPerformance | null; manual: PortfolioManualRead
  cashEquivalents: string[]; onManage: () => void; onChanged: (r: PortfolioRead) => void
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
  const parked = equities.filter((p) => isCashEq(p.symbol))
  const risked = equities.filter((p) => !isCashEq(p.symbol))
  const parkedValue = parked.reduce((a, p) => a + (p.positionValue ?? 0) * (p.fxRateToBase ?? 1), 0)
  const invested = risked.reduce((a, p) => a + (p.positionValue ?? 0) * (p.fxRateToBase ?? 1), 0)
  const unrealised = equities.reduce((a, p) => a + (p.unrealizedLocal ?? 0) * (p.fxRateToBase ?? 1), 0)
  const flows = book.flows.reduce((a, f) => a + (f.amountBase ?? 0), 0)
  const realised = book.closures.reduce((a, c) => a + (c.realizedBase ?? c.realizedLocal), 0)
  const brokerCash = nav === null ? null : nav - invested - parkedValue
  const cash = brokerCash === null ? null : brokerCash + parkedValue

  // Currency mix is real risk on a cross-border book, and nothing else on this screen shows it.
  const byCurrency = new Map<string, number>()
  for (const p of equities) {
    byCurrency.set(p.currency ?? '—', (byCurrency.get(p.currency ?? '—') ?? 0) + (p.positionValue ?? 0) * (p.fxRateToBase ?? 1))
  }
  if (cash !== null && cash > 0) byCurrency.set(ccy ?? 'cash', (byCurrency.get(ccy ?? 'cash') ?? 0) + cash)
  const currencyRows = [...byCurrency.entries()].sort((a, b) => b[1] - a[1])
  const currencyTotal = currencyRows.reduce((a, [, v]) => a + v, 0)

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
        <Card label="Income" value={fmtMoney(book.income.net, ccy)} sub={`Dividends ${fmtMoney(book.income.dividendsGross, ccy)} · withholding ${fmtMoney(book.income.withholdingTax, ccy)}`} tone={toneOf(book.income.net)} />
      </div>

      {/* The curve and the bridge answer the same question from two directions — what the book did, and
          what it is made of — so they sit side by side rather than a screen apart. */}
      <div className="fundbook__split fundbook__split--wide">
        {perf && perf.growth.length > 1 && (
          <div className="fundbook__panel">
            <div className="fundbook__panelhead">
              <div><strong>Growth of capital</strong></div>
            </div>
            <GrowthChart series={perf.growth} benchmarkSymbol={perf.benchmark.symbol} height={230} />
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
          <div className="fundbook__bridge is-total"><span>Net asset value</span><strong>{fmtMoney(nav, ccy)}</strong></div>
        </div>
      </div>

      <div className="fundbook__split">
        <div className="fundbook__panel">
          <div className="fundbook__panelhead">
            <div><strong>Where the money sits</strong></div>
          </div>
          {nav !== null && cash !== null && (
            <div className="fundbook__bars">
              <Bar label="Invested" pct={(invested / nav) * 100} value={fmtMoney(invested, ccy)} />
              <Bar label="Cash" pct={(cash / nav) * 100} value={fmtMoney(cash, ccy)} deep />
            </div>
          )}
          {/* The declaration belongs where the split it changes is explained, not repeated as a button on
              every position row — one control in one place instead of one per holding. */}
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
          {currencyRows.length > 1 && (
            <div className="fundbook__bars fundbook__bars--top">
              {currencyRows.map(([c, v]) => (
                <Bar key={c} label={c} pct={currencyTotal ? (v / currencyTotal) * 100 : 0} value={fmtMoney(v, ccy)} />
              ))}
            </div>
          )}
        </div>

        {book.flows.length > 0 && (
          <div className="fundbook__panel">
            <div className="fundbook__panelhead">
              <div><strong>Capital flows</strong><small>Removed from the return, so they never read as performance</small></div>
            </div>
            {[...book.flows].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).map((f, i) => (
              <div key={`${f.date}-${i}`} className="fundbook__bridge">
                <span><span className="mono dim">{f.date ?? '—'}</span> · {f.description ?? (f.amount >= 0 ? 'Contribution' : 'Withdrawal')}</span>
                <strong style={{ color: toneOf(f.amountBase ?? f.amount) }}>{fmtMoney(f.amountBase ?? f.amount, ccy)}</strong>
              </div>
            ))}
          </div>
        )}
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
          {risked.map((p, i) => <PositionRow key={`${p.conid ?? p.symbol ?? 'x'}-${i}`} p={p} />)}
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

      <Exposure book={book} risked={risked} parkedValue={parkedValue} nav={nav} ccy={ccy} />
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
function Exposure({ book, risked, parkedValue, nav, ccy }: {
  book: PortfolioBook; risked: PortfolioPosition[]; parkedValue: number
  nav: number | null; ccy: string | null
}) {
  const derivatives = book.positions.filter((p) => p.isDerivative)
  const valued = risked
    .map((p) => ({ p, base: (p.positionValue ?? 0) * (p.fxRateToBase ?? 1) }))
    .sort((a, b) => Math.abs(b.base) - Math.abs(a.base))
  const atRisk = valued.reduce((a, v) => a + v.base, 0)
  if (valued.length === 0) return null

  const shareOfRisk = (v: number) => (atRisk === 0 ? null : (v / atRisk) * 100)
  const top = valued[0]!
  const topThree = valued.slice(0, 3).reduce((a, v) => a + v.base, 0)
  // Gross counts both directions; net cancels them. They are equal here only because the book is
  // long-only — the moment it is not, the difference between them IS the hedge.
  const gross = valued.reduce((a, v) => a + Math.abs(v.base), 0)
  const longs = valued.filter((v) => v.base > 0).reduce((a, v) => a + v.base, 0)
  const shorts = valued.filter((v) => v.base < 0).reduce((a, v) => a + v.base, 0)

  const group = (key: (p: PortfolioPosition) => string) => {
    const by = new Map<string, number>()
    for (const { p, base } of valued) by.set(key(p), (by.get(key(p)) ?? 0) + base)
    return [...by.entries()].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
  }
  const byCurrency = group((p) => p.currency ?? '—')
  const byClass = group((p) => p.subCategory || p.assetCategory || 'unclassified')

  return (
    <div className="fundbook__panel">
      <div className="fundbook__panelhead">
        <div>
          <strong>Exposure</strong>
          <small>Concentration on money at risk, not on NAV</small>
        </div>
      </div>

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
          {valued.map(({ p, base }) => (
            <ExposureBar key={`${p.conid ?? p.symbol}`} label={p.symbol ?? '—'} pct={shareOfRisk(base) ?? 0} value={fmtMoney(base, ccy)} />
          ))}
        </div>
        <div>
          <div className="fundbook__subhead">By currency</div>
          {byCurrency.map(([k, v]) => (
            <ExposureBar key={`c-${k}`} label={k} pct={shareOfRisk(v) ?? 0} value={fmtMoney(v, ccy)} />
          ))}
          <div className="fundbook__subhead">By asset class</div>
          {byClass.map(([k, v]) => (
            <ExposureBar key={`a-${k}`} label={k} pct={shareOfRisk(v) ?? 0} value={fmtMoney(v, ccy)} deep />
          ))}
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

function ExposureBar({ label, pct, value, deep }: { label: string; pct: number; value: string; deep?: boolean }) {
  return (
    <div className="fundbook__bar-row fundbook__bar-row--exposure">
      <span className="fundbook__bar-label mono">{label}</span>
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

function BridgeRow({ label, value, tone }: { label: string; value: string; tone?: string }) {
  return <div className="fundbook__bridge"><span>{label}</span><strong style={tone ? { color: tone } : undefined}>{value}</strong></div>
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

function PositionRow({ p, derivative, isCash }: {
  p: PortfolioPosition; derivative?: boolean; isCash?: boolean
}) {
  return (
    <div className={`fundbook__row${isCash ? ' is-parked' : ''}`}>
      <strong className="mono">{p.symbol ?? '—'}</strong>
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

/** Unrealised return on cost. Null when the statement gives no usable basis — a position transferred in
 *  without one would otherwise divide by zero and report an infinite gain. */
function unrealisedPct(p: PortfolioPosition): number | null {
  const cost = p.costBasisMoney
  if (cost === null || !Number.isFinite(cost) || Math.abs(cost) < 1e-9) return null
  if (p.unrealizedLocal === null || !Number.isFinite(p.unrealizedLocal)) return null
  return (p.unrealizedLocal / Math.abs(cost)) * 100
}

// ---------- performance ----------

function Performance({ perf }: { perf: PortfolioPerformance }) {
  const { risk, benchmark: bm } = perf
  const ratio = (v: number | null) => (risk.sufficient && v !== null ? v.toFixed(2) : '—')
  return (
    <>
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
            <span className="num">Cash</span><span className="num">Over cash</span><span className="num">Days</span>
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
              {/* The benchmark is only meaningful over the same window, so it appears on the inception
                  row alone rather than repeated against periods it was never measured over. */}
              <span className="num dim">{p.label === 'Since inception' ? fmtPct(bm.benchmarkTwr, 2) : '—'}</span>
              <span className="num" style={{ color: p.label === 'Since inception' ? toneOf(bm.excess) : undefined }}>
                {p.label === 'Since inception' && bm.excess !== null ? `${bm.excess >= 0 ? '+' : '−'}${Math.abs(bm.excess).toFixed(2)}pp` : '—'}
              </span>
              {/* The second yardstick: beating an index while trailing a deposit account is not a result. */}
              <span className="num dim">{fmtPct(p.hurdle, 2)}</span>
              <span className="num" style={{ color: toneOf(p.overHurdle) }}>
                {p.overHurdle === null ? '—' : `${p.overHurdle >= 0 ? '+' : '−'}${Math.abs(p.overHurdle).toFixed(2)}pp`}
              </span>
              <span className="num dim">{p.days}</span>
            </div>
          ))}
        </div>
        {bm.unavailable && (
          <div className="fundbook__foot">
            No benchmark comparison: {bm.unavailable}. Drop daily closes for <b>{bm.symbol}</b> into
            <b> data/_market/&lt;provider&gt;/</b> as <b>date,symbol,close</b> and it appears here.
          </div>
        )}
      </div>

      {perf.underwater.length > 1 && (
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
          <UnderwaterChart series={perf.underwater} />
        </div>
      )}

      <div className="fundbook__cards">
        <Card label="Volatility" value={risk.volatility === null || !risk.sufficient ? '—' : `${risk.volatility.toFixed(1)}%`} sub="Annualised, daily NAV" />
        <Card label="Sharpe" value={ratio(risk.sharpe)} sub="Excess return per unit of swing" />
        <Card label="Sortino" value={ratio(risk.sortino)} sub="Counts only downside swing" />
        <Card label="Calmar" value={ratio(risk.calmar)} sub="Period return ÷ worst fall" />
        <Card
          label="Max drawdown"
          value={risk.drawdown.depth === null ? '—' : `${risk.drawdown.depth.toFixed(2)}%`}
          sub={risk.drawdown.depth === null ? 'No fall from a high yet'
            : `${risk.drawdown.peakDate} → ${risk.drawdown.troughDate}${risk.drawdown.recoveredDate ? ` · back ${risk.drawdown.recoveredDate}` : ' · still under water'}`}
          tone={risk.drawdown.depth === null ? undefined : 'var(--bad)'}
        />
        <Card
          label="Money-weighted"
          value={fmtPct(perf.moneyWeightedAnnualisedPct)}
          sub="ANNUALISED (IRR) — not comparable with the cumulative returns above"
          tone={toneOf(perf.moneyWeightedAnnualisedPct)}
        />
        <Card
          label={`Beta to ${bm.symbol}`}
          value={perf.betaAlpha.beta === null ? '—' : perf.betaAlpha.beta.toFixed(2)}
          sub={perf.betaAlpha.pairedDays > 0
            ? `From ${perf.betaAlpha.pairedDays} days both series moved`
            : `Needs ${bm.symbol} price history`}
        />
        <Card
          label="Alpha"
          value={perf.betaAlpha.alpha === null ? '—' : fmtPct(perf.betaAlpha.alpha)}
          sub="Annualised, beyond what beta explains"
          tone={perf.betaAlpha.alpha === null ? undefined : toneOf(perf.betaAlpha.alpha)}
        />
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
interface TradeRowData {
  symbol: string | null
  currency: string | null
  quantity: number
  entryPrice: number
  exitPrice: number
  openedAt: string | null
  closedAt: string | null
  holdingDays: number
  grossLocal: number
  commissionLocal: number
  /** Base currency where a rate existed, local otherwise — the same figure the cards above total. */
  realized: number
  /** How many opening lots this one exit consumed. */
  lots: number
}

function Trades({ book, manual, onChanged, importOpen, onImportOpen, importSurface }: {
  book: PortfolioBook; manual: PortfolioManualRead; onChanged: (r: PortfolioRead) => void
  importOpen: boolean; onImportOpen: (v: boolean) => void; importSurface: React.ReactNode
}) {
  const [logging, setLogging] = useState(false)
  const ccy = book.baseCurrency
  // ONE ROW PER TRADE, NOT PER LOT. A single sell is matched against every opening lot it consumes, so
  // FIFO produces one closure per lot — on the real book, 47 lot-rows for 31 trades, with one AMZN sell
  // spread across nine of them. The operator placed one order; the lots are the accounting underneath
  // it. `closeTradeID` is the closing execution, which is exactly the thing to group on. A closure with
  // no id keeps its own row rather than being lumped with unrelated ones.
  const rows = useMemo(() => {
    const groups = new Map<string, PortfolioClosure[]>()
    book.closures.forEach((c, i) => {
      const key = c.closeTradeID ? `${c.symbol}|${c.closeTradeID}` : `solo|${i}`
      const list = groups.get(key)
      if (list) list.push(c); else groups.set(key, [c])
    })
    const merged: TradeRowData[] = [...groups.values()].map((lots) => {
      const qty = lots.reduce((a, c) => a + c.quantity, 0)
      // Weighted by quantity, because the lots being merged were opened at different prices — a plain
      // mean would report an entry the book never paid.
      const wAvg = (pick: (c: PortfolioClosure) => number) =>
        qty === 0 ? pick(lots[0]!) : lots.reduce((a, c) => a + pick(c) * c.quantity, 0) / qty
      const opened = lots.map((c) => c.openedAt).filter(Boolean).sort()[0] ?? null
      return {
        symbol: lots[0]!.symbol,
        currency: lots[0]!.currency,
        quantity: qty,
        entryPrice: wAvg((c) => c.entryPrice),
        exitPrice: wAvg((c) => c.exitPrice),
        openedAt: opened,
        closedAt: lots[0]!.closedAt,
        // Measured from the OLDEST lot in the group: that is how long the money was actually committed.
        holdingDays: Math.max(...lots.map((c) => c.holdingDays ?? 0)),
        grossLocal: lots.reduce((a, c) => a + c.grossLocal, 0),
        commissionLocal: lots.reduce((a, c) => a + c.commissionLocal, 0),
        realized: lots.reduce((a, c) => a + (c.realizedBase ?? c.realizedLocal), 0),
        lots: lots.length,
      }
    })
    return merged.sort((a, b) => (b.closedAt ?? '').localeCompare(a.closedAt ?? ''))
  }, [book.closures])
  const stats = useMemo(() => {
    const vals = rows.map((c) => c.realized)
    const wins = vals.filter((v) => v > 0)
    const losses = vals.filter((v) => v < 0)
    const held = rows.map((c) => c.holdingDays).filter((d): d is number => d !== null)
    const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null)
    return {
      total: vals.reduce((a, b) => a + b, 0),
      hitRate: rows.length ? (wins.length / rows.length) * 100 : null,
      wins: wins.length,
      losses: losses.length,
      avgWin: avg(wins),
      avgLoss: avg(losses),
      avgHold: avg(held),
      commission: rows.reduce((a, c) => a + c.commissionLocal, 0),
      grossRealised: vals.reduce((a, b) => a + Math.abs(b), 0),
      worst: losses.length ? Math.min(...losses) : null,
    }
  }, [rows])

  // Attribution: what each NAME contributed, biggest absolute mover first. A fund's realised result is
  // almost never spread evenly, and the names that carried it are the ones worth reviewing.
  const { attribution, attributionMax, topShare } = useMemo(() => {
    const by = new Map<string, { value: number; trades: number }>()
    for (const c of rows) {
      const k = c.symbol ?? '—'
      const cur = by.get(k) ?? { value: 0, trades: 0 }
      cur.value += c.realized
      cur.trades += 1
      by.set(k, cur)
    }
    const all = [...by.entries()].map(([symbol, v]) => ({ symbol, ...v }))
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
    }
  }, [rows])

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
      cur.realised += c.realizedBase ?? c.realizedLocal
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
      {manualPanel}
      <div className="fundbook__cards">
        <Card label="Realised" value={fmtMoney(stats.total, ccy)} sub={`Net of ${fmtMoney(Math.abs(stats.commission), ccy)} in costs`} tone={toneOf(stats.total)} />
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

      <div className="fundbook__split">
        <div className="fundbook__panel">
          <div className="fundbook__panelhead">
            <div><strong>Where the money came from</strong><small>Realised result by name</small></div>
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
              {topShare === null
                ? 'Every closed name is shown.'
                : `The best three names carry ${topShare.toFixed(0)}% of the gross winnings.`}
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
            <small>One row per exit, every lot it consumed folded in · realised is net of commission on both legs</small>
          </div>
        </div>
        <div className="fundbook__scroll">
          <div className="fundbook__row fundbook__row--trades fundbook__row--head">
            <span>Symbol</span><span>Ccy</span><span>Opened</span><span>Closed</span><span className="num">Held</span>
            <span className="num">Qty</span><span className="num">Entry</span><span className="num">Exit</span>
            <span className="num">Gross</span><span className="num">Costs</span><span className="num">Realised</span>
            <span className="num">Share</span>
          </div>
          {rows.map((c, i) => (
            <TradeRow key={`${c.symbol}-${c.closedAt}-${i}`} c={c} grossRealised={stats.grossRealised} />
          ))}
        </div>
      </div>
    </>
  )
}

function TradeRow({ c, grossRealised }: { c: TradeRowData; grossRealised: number }) {
  // Share of the book's total realised ACTIVITY (winners and losers as magnitudes), so it stays stable
  // when the net happens to sit near zero — where a share of the net would explode into nonsense.
  const share = grossRealised > 0 ? (Math.abs(c.realized) / grossRealised) * 100 : null
  return (
    <div className="fundbook__row fundbook__row--trades">
      <strong className="mono">
        {c.symbol ?? '—'}
        {c.lots > 1 && <small className="fundbook__lots" title={`This exit closed ${c.lots} opening lots`}>{c.lots} lots</small>}
      </strong>
      <span className="dim">{c.currency ?? '—'}</span>
      <span className="dim mono">{(c.openedAt ?? '—').slice(0, 10)}</span>
      <span className="dim mono">{(c.closedAt ?? '—').slice(0, 10)}</span>
      <span className="num dim">{`${c.holdingDays}d`}</span>
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
