import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { api } from '../../lib/api'
import type {
  PortfolioBook, PortfolioClosure, PortfolioPerformance, PortfolioPosition, PortfolioRead,
} from '../../lib/types'

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

type Tab = 'holdings' | 'performance' | 'trades' | 'import'

const fmtMoney = (v: number | null | undefined, ccy: string | null): string => {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—'
  const sign = v < 0 ? '−' : ''
  return `${sign}${ccy === 'USD' ? '$' : ''}${Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}
const fmtPct = (v: number | null | undefined, digits = 1): string =>
  v === null || v === undefined || !Number.isFinite(v) ? '—' : `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(digits)}%`
const fmtNum = (v: number | null | undefined, digits = 2): string =>
  v === null || v === undefined || !Number.isFinite(v) ? '—' : v.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })

/** Positive is amber, not green: the cockpit's --good IS the accent. Losses are the only red. */
const toneOf = (v: number | null | undefined): string =>
  v === null || v === undefined || !Number.isFinite(v) ? 'var(--text-muted)' : v < 0 ? 'var(--bad)' : 'var(--good)'

export function PortfolioStage() {
  const reduced = useReducedMotion()
  const [read, setRead] = useState<PortfolioRead | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState(0)
  const [notes, setNotes] = useState<{ tone: 'ok' | 'bad'; text: string }[]>([])
  const [dragging, setDragging] = useState(false)
  const [tab, setTab] = useState<Tab>('holdings')

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
      const result = await api.uploadStatements(files, setProgress)
      setRead({ statements: result.statements, book: result.book, performance: result.performance, error: result.error })
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
  }, [busy])

  const book = read?.book ?? null
  const ccy = book?.baseCurrency ?? null
  const hasStatements = (read?.statements.length ?? 0) > 0

  const tabs: { id: Tab; label: string; count?: number }[] = [
    { id: 'holdings', label: 'Holdings', count: book?.positions.length },
    { id: 'performance', label: 'Returns & risk' },
    { id: 'trades', label: 'Trade history', count: book?.closures.length },
    { id: 'import', label: 'Import', count: read?.statements.length },
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
        {book && <ReconcileBadge book={book} onInspect={() => setTab('import')} />}
      </div>

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
            read={read ?? { statements: [], book: null, performance: null, error: null }}
            onFiles={upload} onChanged={setRead} busy={busy} progress={progress} notes={notes}
            firstRun={!hasStatements}
          />
        ) : tab === 'holdings' ? (
          <Holdings book={book} perf={read?.performance ?? null} />
        ) : tab === 'performance' ? (
          read?.performance
            ? <Performance perf={read.performance} />
            : <div className="fundbook__none">No performance to show yet.</div>
        ) : tab === 'trades' ? (
          <Trades book={book} />
        ) : (
          <ImportTab read={read!} onFiles={upload} onChanged={setRead} busy={busy} progress={progress} notes={notes} />
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

function Holdings({ book, perf }: { book: PortfolioBook; perf: PortfolioPerformance | null }) {
  const ccy = book.baseCurrency
  const nav = book.navSeries.length ? book.navSeries[book.navSeries.length - 1]!.total : null
  const equities = book.positions.filter((p) => !p.isDerivative)
  const derivatives = book.positions.filter((p) => p.isDerivative)
  const invested = equities.reduce((a, p) => a + (p.positionValue ?? 0) * (p.fxRateToBase ?? 1), 0)
  const unrealised = equities.reduce((a, p) => a + (p.unrealizedLocal ?? 0) * (p.fxRateToBase ?? 1), 0)
  const flows = book.flows.reduce((a, f) => a + (f.amountBase ?? 0), 0)
  const realised = book.closures.reduce((a, c) => a + (c.realizedBase ?? c.realizedLocal), 0)
  const cash = nav === null ? null : nav - invested

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
      <div className="fundbook__cards">
        <Card label="Net asset value" value={fmtMoney(nav, ccy)} sub={`${book.navSeries.length} daily points`} />
        <Card label="Return · TWR" value={fmtPct(perf?.periods.at(-1)?.twr ?? book.twr)} sub="Time-weighted, flows removed" tone={toneOf(book.twr)} />
        <Card label="Unrealised" value={fmtMoney(unrealised, ccy)} sub="Open equity positions" tone={toneOf(unrealised)} />
        <Card label="Realised" value={fmtMoney(realised, ccy)} sub={`${book.closures.length} closed round trips`} tone={toneOf(realised)} />
        <Card label="Net capital in" value={fmtMoney(flows, ccy)} sub="Removed from the return" />
        <Card label="Income" value={fmtMoney(book.income.net, ccy)} sub={`Dividends ${fmtMoney(book.income.dividendsGross, ccy)} · withholding ${fmtMoney(book.income.withholdingTax, ccy)}`} tone={toneOf(book.income.net)} />
      </div>

      <div className="fundbook__split">
        <div className="fundbook__panel">
          <div className="fundbook__panelhead">
            <div><strong>Where the money sits</strong><small>Invested against cash, and the currencies carrying it</small></div>
          </div>
          {nav !== null && cash !== null && (
            <div className="fundbook__bars">
              <Bar label="Invested" pct={(invested / nav) * 100} value={fmtMoney(invested, ccy)} />
              <Bar label="Cash" pct={(cash / nav) * 100} value={fmtMoney(cash, ccy)} deep />
            </div>
          )}
          {currencyRows.length > 1 && (
            <div className="fundbook__bars fundbook__bars--top">
              {currencyRows.map(([c, v]) => (
                <Bar key={c} label={c} pct={currencyTotal ? (v / currencyTotal) * 100 : 0} value={fmtMoney(v, ccy)} />
              ))}
            </div>
          )}
          {derivatives.length > 0 && (
            <div className="fundbook__foot">
              Futures notional is <b>exposure</b>, not an allocation of NAV — it consumes margin, not its
              face value, so it carries no weight here.
            </div>
          )}
        </div>

        <div className="fundbook__panel">
          <div className="fundbook__panelhead">
            <div><strong>How NAV got here</strong><small>LP flows are removed from the return, but they still build the book</small></div>
          </div>
          <BridgeRow label="LP capital, net" value={fmtMoney(flows, ccy)} />
          <BridgeRow label="Realised on closed trades" value={fmtMoney(realised, ccy)} tone={toneOf(realised)} />
          <BridgeRow label="Unrealised on open positions" value={fmtMoney(unrealised, ccy)} tone={toneOf(unrealised)} />
          <BridgeRow label="Income, net of withholding and fees" value={fmtMoney(book.income.net, ccy)} tone={toneOf(book.income.net)} />
          <div className="fundbook__bridge is-total"><span>Net asset value</span><strong>{fmtMoney(nav, ccy)}</strong></div>
        </div>
      </div>

      <div className="fundbook__panel">
        <div className="fundbook__panelhead">
          <div><strong>Positions</strong><small>{book.positions.length} open · weights come from the statement</small></div>
        </div>
        <div className="fundbook__scroll">
          <div className="fundbook__row fundbook__row--head">
            <span>Symbol</span><span>Ccy</span><span className="num">Quantity</span><span className="num">Avg cost</span>
            <span className="num">Mark</span><span className="num">Value</span><span className="num">Weight</span><span className="num">Unrealised</span>
          </div>
          {equities.map((p, i) => <PositionRow key={`${p.conid ?? p.symbol ?? 'x'}-${i}`} p={p} />)}
          {derivatives.length > 0 && (
            <>
              <div className="fundbook__subhead">Derivatives — notional is <b>exposure</b>, not an allocation of NAV, so these carry no weight</div>
              {derivatives.map((p, i) => <PositionRow key={`d-${p.conid ?? p.symbol ?? 'x'}-${i}`} p={p} derivative />)}
            </>
          )}
          {book.positions.length === 0 && <div className="fundbook__none">No open positions in this statement.</div>}
        </div>
      </div>
    </>
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

function PositionRow({ p, derivative }: { p: PortfolioPosition; derivative?: boolean }) {
  return (
    <div className="fundbook__row">
      <strong className="mono">{p.symbol ?? '—'}</strong>
      <span className="dim">{p.currency ?? '—'}</span>
      <span className="num">{fmtNum(p.quantity, 0)}</span>
      <span className="num dim">{fmtNum(p.costBasisPrice)}</span>
      <span className="num">{fmtNum(p.markPrice)}</span>
      <span className="num">{fmtNum(p.positionValue, 0)}{derivative && <small className="fundbook__notional">notional</small>}</span>
      <span className="num dim">{derivative ? '—' : p.percentOfNAV === null ? '—' : `${p.percentOfNAV.toFixed(1)}%`}</span>
      <span className="num" style={{ color: toneOf(p.unrealizedLocal) }}>{fmtNum(p.unrealizedLocal, 0)}</span>
    </div>
  )
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
            <small>Time-weighted, flows removed · cash hurdle {perf.riskFreeAnnualPct}% · ratios from {risk.sampleDays} days with capital in the book</small>
          </div>
        </div>
        <div className="fundbook__scroll">
          <div className="fundbook__row fundbook__row--periods fundbook__row--head">
            <span>Period</span><span className="num">Return</span><span className="num">{bm.symbol}</span><span className="num">Excess</span><span className="num">Days</span>
          </div>
          {perf.periods.map((p) => (
            <div key={p.label} className="fundbook__row fundbook__row--periods">
              <span>{p.label}<small className="fundbook__since">{p.from} → {p.to}</small></span>
              <strong className="num" style={{ color: toneOf(p.twr) }}>{fmtPct(p.twr, 2)}</strong>
              {/* The benchmark is only meaningful over the same window, so it appears on the inception
                  row alone rather than repeated against periods it was never measured over. */}
              <span className="num dim">{p.label === 'Since inception' ? fmtPct(bm.benchmarkTwr, 2) : '—'}</span>
              <span className="num" style={{ color: p.label === 'Since inception' ? toneOf(bm.excess) : undefined }}>
                {p.label === 'Since inception' && bm.excess !== null ? `${bm.excess >= 0 ? '+' : '−'}${Math.abs(bm.excess).toFixed(2)}pp` : '—'}
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
      </div>

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

function Trades({ book }: { book: PortfolioBook }) {
  const ccy = book.baseCurrency
  const rows = useMemo(
    () => [...book.closures].sort((a, b) => (b.closedAt ?? '').localeCompare(a.closedAt ?? '')),
    [book.closures],
  )
  const stats = useMemo(() => {
    const vals = rows.map((c) => c.realizedBase ?? c.realizedLocal)
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
      worst: losses.length ? Math.min(...losses) : null,
    }
  }, [rows])

  if (rows.length === 0) {
    return (
      <div className="fundbook__empty">
        <strong>No closed trades yet</strong>
        <span>A round trip appears once a position has been closed and matched against the lot that opened it.</span>
      </div>
    )
  }
  return (
    <>
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

      <div className="fundbook__panel">
        <div className="fundbook__panelhead">
          <div><strong>Closed round trips</strong><small>Newest first · realised is net of commission on both legs, as the broker states it</small></div>
        </div>
        <div className="fundbook__scroll">
          <div className="fundbook__row fundbook__row--trades fundbook__row--head">
            <span>Symbol</span><span>Ccy</span><span>Opened</span><span>Closed</span><span className="num">Held</span>
            <span className="num">Qty</span><span className="num">Entry</span><span className="num">Exit</span>
            <span className="num">Gross</span><span className="num">Costs</span><span className="num">Realised</span>
          </div>
          {rows.map((c, i) => <TradeRow key={`${c.symbol}-${c.closedAt}-${i}`} c={c} />)}
        </div>
      </div>
    </>
  )
}

function TradeRow({ c }: { c: PortfolioClosure }) {
  const net = c.realizedBase ?? c.realizedLocal
  return (
    <div className="fundbook__row fundbook__row--trades">
      <strong className="mono">{c.symbol ?? '—'}</strong>
      <span className="dim">{c.currency ?? '—'}</span>
      <span className="dim mono">{(c.openedAt ?? '—').slice(0, 10)}</span>
      <span className="dim mono">{(c.closedAt ?? '—').slice(0, 10)}</span>
      <span className="num dim">{c.holdingDays === null ? '—' : `${c.holdingDays}d`}</span>
      <span className="num">{fmtNum(c.quantity, 0)}</span>
      <span className="num dim">{fmtNum(c.entryPrice)}</span>
      <span className="num">{fmtNum(c.exitPrice)}</span>
      <span className="num dim">{fmtNum(c.grossLocal, 0)}</span>
      <span className="num dim">{fmtNum(c.commissionLocal, 0)}</span>
      <strong className="num" style={{ color: toneOf(net) }}>{fmtNum(net, 0)}</strong>
    </div>
  )
}

// ---------- import ----------

function ImportTab({ read, onFiles, onChanged, busy, progress, notes, firstRun }: {
  read: PortfolioRead
  onFiles: (f: File[]) => void
  onChanged: (r: PortfolioRead) => void
  busy: boolean
  progress: number
  notes: { tone: 'ok' | 'bad'; text: string }[]
  firstRun?: boolean
}) {
  const [removing, setRemoving] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)
  const book = read.book
  return (
    <>
      <label className={`fundbook__drop${busy ? ' is-busy' : ''}${firstRun ? '' : ' is-compact'}`}>
        <input type="file" accept=".xml,text/xml,application/xml" multiple hidden
          onChange={(e) => { void onFiles([...(e.target.files ?? [])]); e.target.value = '' }} />
        <svg width={firstRun ? 26 : 20} height={firstRun ? 26 : 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
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
      {read.error && <div className="fundbook__error"><span>{read.error}</span></div>}
      {removeError && <div className="fundbook__error"><span>{removeError}</span></div>}

      {book && (
        <div className="fundbook__panel">
          <div className="fundbook__panelhead">
            <div><strong>Reconciliation</strong><small>Every number in the book is derived — these checks are what prove it against the broker</small></div>
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
            <div><strong>Imported statements</strong><small>The book is rebuilt from these every time it is read — remove one and it recomputes</small></div>
          </div>
          {read.statements.map((s) => (
            <div key={s.id} className="fundbook__stmt">
              <span className="mono">{s.filename}</span>
              <span className="dim">{s.fromDate ?? '?'} → {s.toDate ?? '?'}</span>
              <span className="dim num">{s.trades} trades</span>
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
