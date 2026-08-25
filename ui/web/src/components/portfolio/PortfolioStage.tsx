import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { api } from '../../lib/api'
import type { PortfolioBook, PortfolioPerformance, PortfolioPosition, PortfolioRead } from '../../lib/types'

// The fund book: what the fund ACTUALLY owns, fed by IBKR Flex exports.
//
// Deliberately not the engine's model paper-portfolio (/research:size), which answers what the research
// SAID to own. Both exist on purpose and never merge — the calibration loop depends on the model book
// being untouched by execution reality.
//
// Two things this screen refuses to do, because a fund tool that does them is worse than none:
//  · It never shows a number as agreed when it has not been proved. The reconciliation panel is the
//    first thing rendered, and a break is stated rather than tucked away.
//  · It never weights a derivative by its notional. A futures contract is exposure against margin, not
//    an allocation of NAV, so it is shown apart from the equity weights.

const fmtMoney = (v: number | null | undefined, ccy: string | null): string => {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—'
  const sign = v < 0 ? '−' : ''
  const abs = Math.abs(v)
  return `${sign}${ccy === 'USD' ? '$' : ''}${abs.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
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
  const inputRef = useRef<HTMLInputElement>(null)

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

  return (
    <motion.div
      className="fundbook"
      initial={reduced ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 0.26, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="fundbook__head">
        <div className="fundbook__title">
          <span className="fundbook__eyebrow">Fund book · real capital</span>
          <div className="fundbook__titlerow">
            <strong>Portfolio</strong>
            {book && <small>{ccy ? `Reported in ${ccy}` : ''}{book.asOf ? ` · as of ${book.asOf}` : ''}</small>}
          </div>
        </div>
        {book && <ReconcileBadge book={book} />}
      </div>

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
      ) : (
        <>
          <label
            className={`fundbook__drop${dragging ? ' is-over' : ''}${busy ? ' is-busy' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); void upload([...e.dataTransfer.files]) }}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".xml,text/xml,application/xml"
              multiple
              hidden
              onChange={(e) => { void upload([...(e.target.files ?? [])]); e.target.value = '' }}
            />
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" />
            </svg>
            <div className="fundbook__droptext">
              <strong>{busy ? 'Importing…' : 'Drop an IBKR Flex export here'}</strong>
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

          {read?.error && <div className="fundbook__error"><span>{read.error}</span></div>}

          {book && (
            <>
              <Summary book={book} />
              {read?.performance && <Performance perf={read.performance} />}
              <Positions book={book} />
            </>
          )}
          {/* The statement list is rendered whenever statements EXIST, not only when they built a book.
              When they cannot — two accounts in one import, or a file that has become unreadable — the
              Remove buttons here are the only way out, and hiding them behind a successful build strands
              the operator with an error and no control that could clear it. */}
          {read && read.statements.length > 0 && <Statements read={read} onDeleted={setRead} />}
          {read && read.statements.length === 0 && (
            <div className="fundbook__empty">
              <strong>No statement imported yet</strong>
              <span>
                In IBKR: Reports → Flex Queries → Activity Flex Query. Include Trades, Positions, Cash
                Transactions, Change in NAV and Corporate Actions, and run it as XML.
              </span>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

/** The trust anchor, and the first thing on the screen. Every other number here is derived; this is
 *  what says whether the derivation matches the broker. */
function ReconcileBadge({ book }: { book: PortfolioBook }) {
  const failed = book.reconciliation.checks.filter((c) => !c.ok)
  const ok = book.reconciliation.ok
  return (
    <div className={`fundbook__recon${ok ? ' is-ok' : ' is-break'}`} title={book.reconciliation.checks.map((c) => `${c.ok ? 'ok' : 'BREAK'} ${c.name}: ${c.detail}`).join('\n')}>
      <i aria-hidden />
      {ok ? `Reconciled to IBKR · ${book.reconciliation.checks.length} checks` : `${failed.length} of ${book.reconciliation.checks.length} checks failing`}
    </div>
  )
}

function Summary({ book }: { book: PortfolioBook }) {
  const ccy = book.baseCurrency
  const nav = book.navSeries.length ? book.navSeries[book.navSeries.length - 1]!.total : null
  const equity = book.positions.filter((p) => !p.isDerivative)
    .reduce((a, p) => a + (p.positionValue ?? 0) * (p.fxRateToBase ?? 1), 0)
  const unrealised = book.positions.filter((p) => !p.isDerivative)
    .reduce((a, p) => a + (p.unrealizedLocal ?? 0) * (p.fxRateToBase ?? 1), 0)
  const flows = book.flows.reduce((a, f) => a + (f.amountBase ?? 0), 0)
  return (
    <div className="fundbook__cards">
      <Card label="Net asset value" value={fmtMoney(nav, ccy)} sub={`${book.navSeries.length} daily points`} />
      <Card label="Return · TWR" value={fmtPct(book.twr)} sub="Time-weighted, flows removed" tone={toneOf(book.twr)} />
      <Card label="Unrealised" value={fmtMoney(unrealised, ccy)} sub="Open equity positions" tone={toneOf(unrealised)} />
      <Card label="Invested" value={fmtMoney(equity, ccy)} sub={`${book.positions.filter((p) => !p.isDerivative).length} equity positions`} />
      <Card label="Net capital in" value={fmtMoney(flows, ccy)} sub="Removed from the return" />
      <Card
        label="Income"
        value={fmtMoney(book.income.net, ccy)}
        sub={`Dividends ${fmtMoney(book.income.dividendsGross, ccy)} · withholding ${fmtMoney(book.income.withholdingTax, ccy)}`}
        tone={toneOf(book.income.net)}
      />
    </div>
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

/** Returns and risk. Every figure here states the basis it is measured on, because the two most common
 *  ways to mislead with these numbers are annualising a short history and comparing an annualised rate
 *  against a cumulative one. */
function Performance({ perf }: { perf: PortfolioPerformance }) {
  const { risk, benchmark: bm } = perf
  const ratio = (v: number | null) => (risk.sufficient && v !== null ? v.toFixed(2) : '—')
  return (
    <div className="fundbook__panel">
      <div className="fundbook__panelhead">
        <div>
          <strong>Returns and risk</strong>
          <small>
            Time-weighted, flows removed · cash hurdle {perf.riskFreeAnnualPct}% · ratios from {risk.sampleDays} days
            {risk.sampleDays > 0 && ' with capital in the book'}
          </small>
        </div>
      </div>

      <div className="fundbook__row fundbook__row--head fundbook__row--periods">
        <span>Period</span><span className="num">Return</span><span className="num">{bm.symbol}</span>
        <span className="num">Excess</span><span className="num">Days</span>
      </div>
      {perf.periods.map((p) => (
        <div key={p.label} className="fundbook__row fundbook__row--periods">
          <span>{p.label}<small className="fundbook__since">{p.from} → {p.to}</small></span>
          <strong className="num" style={{ color: toneOf(p.twr) }}>{fmtPct(p.twr, 2)}</strong>
          {/* The benchmark is only meaningful over the same window, so it is shown on the inception row
              alone rather than repeated against periods it was never measured over. */}
          <span className="num dim">{p.label === 'Since inception' ? fmtPct(bm.benchmarkTwr, 2) : '—'}</span>
          <span className="num" style={{ color: p.label === 'Since inception' ? toneOf(bm.excess) : undefined }}>
            {p.label === 'Since inception' && bm.excess !== null ? `${bm.excess >= 0 ? '+' : '−'}${Math.abs(bm.excess).toFixed(2)}pp` : '—'}
          </span>
          <span className="num dim">{p.days}</span>
        </div>
      ))}

      {bm.unavailable && (
        <div className="fundbook__foot">
          No benchmark comparison: {bm.unavailable}. Drop daily closes for <b>{bm.symbol}</b> into
          <b> data/_market/&lt;provider&gt;/</b> as <b>date,symbol,close</b> and it appears here.
        </div>
      )}

      <div className="fundbook__cards fundbook__cards--inset">
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
          value={perf.moneyWeightedAnnualisedPct === null ? '—' : `${perf.moneyWeightedAnnualisedPct >= 0 ? '+' : '−'}${Math.abs(perf.moneyWeightedAnnualisedPct).toFixed(1)}%`}
          sub="ANNUALISED (IRR) — not comparable with the cumulative returns above"
          tone={toneOf(perf.moneyWeightedAnnualisedPct)}
        />
      </div>

      {!risk.sufficient && (
        <div className="fundbook__foot">
          {risk.sampleDays} days of valued history — too few to state Sharpe, Sortino or volatility
          honestly, so they are left blank rather than guessed. They appear once the book has about a
          quarter of daily data.
        </div>
      )}
      {risk.drawdown.episodesOver3pct > 0 && (
        <div className="fundbook__foot">
          {risk.drawdown.episodesOver3pct} fall{risk.drawdown.episodesOver3pct === 1 ? '' : 's'} of more than 3% since inception
          {risk.drawdown.underWaterDays !== null && ` · deepest took ${risk.drawdown.underWaterDays} days to recover`}.
        </div>
      )}
    </div>
  )
}

function Positions({ book }: { book: PortfolioBook }) {
  const equities = book.positions.filter((p) => !p.isDerivative)
  const derivatives = book.positions.filter((p) => p.isDerivative)
  return (
    <div className="fundbook__panel">
      <div className="fundbook__panelhead">
        <div>
          <strong>Holdings</strong>
          <small>{book.positions.length} position{book.positions.length === 1 ? '' : 's'} · weights come from the statement</small>
        </div>
      </div>
      <div className="fundbook__row fundbook__row--head">
        <span>Symbol</span><span>Ccy</span><span className="num">Quantity</span><span className="num">Avg cost</span>
        <span className="num">Mark</span><span className="num">Value</span><span className="num">Weight</span><span className="num">Unrealised</span>
      </div>
      {/* The index is the last resort, not the first: two rows with neither conid nor symbol would
          otherwise share the key `null` and React would reconcile them as one row. */}
      {equities.map((p, i) => <PositionRow key={p.conid ?? p.symbol ?? `row-${i}`} p={p} />)}
      {derivatives.length > 0 && (
        <>
          <div className="fundbook__subhead">
            Derivatives — notional is <b>exposure</b>, not an allocation of NAV, so these carry no weight
          </div>
          {derivatives.map((p, i) => <PositionRow key={p.conid ?? p.symbol ?? `row-${i}`} p={p} derivative />)}
        </>
      )}
      {book.positions.length === 0 && <div className="fundbook__none">No open positions in this statement.</div>}
    </div>
  )
}

function PositionRow({ p, derivative }: { p: PortfolioPosition; derivative?: boolean }) {
  return (
    <div className="fundbook__row">
      <strong className="mono">{p.symbol ?? '—'}</strong>
      <span className="dim">{p.currency ?? '—'}</span>
      <span className="num">{fmtNum(p.quantity, 0)}</span>
      <span className="num dim">{fmtNum(p.costBasisPrice)}</span>
      <span className="num">{fmtNum(p.markPrice)}</span>
      <span className="num">
        {fmtNum(p.positionValue, 0)}
        {derivative && <small className="fundbook__notional">notional</small>}
      </span>
      <span className="num dim">{derivative ? '—' : p.percentOfNAV === null ? '—' : `${p.percentOfNAV.toFixed(1)}%`}</span>
      <span className="num" style={{ color: toneOf(p.unrealizedLocal) }}>{fmtNum(p.unrealizedLocal, 0)}</span>
    </div>
  )
}

function Statements({ read, onDeleted }: { read: PortfolioRead; onDeleted: (r: PortfolioRead) => void }) {
  const [removing, setRemoving] = useState<string | null>(null)
  const [removeError, setRemoveError] = useState<string | null>(null)
  return (
    <div className="fundbook__panel">
      <div className="fundbook__panelhead">
        <div>
          <strong>Imported statements</strong>
          <small>The book is rebuilt from these every time it is read — remove one and it recomputes</small>
        </div>
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
              setRemoving(s.id)
              // A failed delete must SAY so. Without the catch the rejection is unhandled and the button
              // simply re-enables, which reads as "removed" while the statement is still in the book.
              try { onDeleted(await api.deleteStatement(s.id)); setRemoveError(null) }
              catch (e: any) { setRemoveError(`${s.filename}: ${e?.message || 'could not be removed'}`) }
              finally { setRemoving(null) }
            }}
          >
            {removing === s.id ? 'Removing…' : 'Remove'}
          </button>
        </div>
      ))}
      {removeError && <div className="fundbook__foot fundbook__foot--warn">{removeError}</div>}
      {read.book && read.book.sectionsUnmodelled.length > 0 && (
        <div className="fundbook__foot">
          Present in the statement but not read by the importer: <b>{read.book.sectionsUnmodelled.join(', ')}</b>
        </div>
      )}
      {read.book && read.book.warnings.length > 0 && read.book.warnings.map((w, i) => (
        <div key={i} className="fundbook__foot fundbook__foot--warn">{w}</div>
      ))}
    </div>
  )
}
