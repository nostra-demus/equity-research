import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { api, isStatic } from '../lib/api'
import { currentCalls, publishedCalls, publishedCallsScorecard, publishedCallUpdates, publishedNeedsAttention } from '../lib/callsView'
import { callReturnValue, callTrackingSnapshot, latestCompletedReview } from '../lib/callsTracking'
import { publishedPaperPortfolio } from '../lib/paperPortfolioView'
import { decisionColor } from '../lib/format'
import type { CallSummary, CallsScorecard, CallTimelineEntry, CallsResult, CallUpdate, IbkrPaperPortfolioRead, NeedsAttentionRow } from '../lib/types'
import './CallsTracker.css'

// every call the engine has made + what's happened since — a card per call with a visual timeline
// (an amber line that fills up to "now" through the dated review checkpoints).

const dash = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : String(v))
function ret(v?: number | null): string {
  return typeof v !== 'number' ? '—' : v >= 0 ? `+${v.toFixed(1)}%` : `${v.toFixed(1)}%`
}
function money(cur?: string | null, v?: number | null): string {
  if (v === null || v === undefined) return '—'
  return `${(cur || '').trim()} ${v}`.trim()
}

type TLNode = { kind: 'call' | CallTimelineEntry['status']; label: string; sub: string; subTone?: 'pos' | 'neg'; reached: boolean; title: string; onClick?: () => void }
type CallsView = 'current' | 'history' | 'updates'

export function CallsTracker() {
  const close = useStore((s) => s.closeCalls)
  const updateCall = useStore((s) => s.updateCall)
  const fileDueReview = useStore((s) => s.fileDueReview)
  const refreshDashboard = useStore((s) => s.refreshDashboard)
  const openCallFile = useStore((s) => s.openCallFile)
  const setToast = useStore((s) => s.setToast)
  // copy the paste-ready Stage-One sheet note (from the latest review's §8 memo_delta block)
  const copyStageOne = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setToast({ msg: 'Stage-One comment copied to clipboard', tone: 'good' })
    } catch {
      setToast({ msg: 'Could not copy — open the delta memo and copy section 6', tone: 'info' })
    }
  }, [setToast])
  const anyRunForTicker = useStore((s) => s.anyRunForTicker)
  const launchPending = useStore((s) => s.launchPending)
  const [data, setData] = useState<CallsResult | null>(null)
  const [paperData, setPaperData] = useState<IbkrPaperPortfolioRead | null>(null)
  const [paperLoading, setPaperLoading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<CallsView>('current')
  const staticMode = isStatic()

  const reqGen = useRef(0)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const load = useCallback(async (showLoading = false) => {
    const gen = ++reqGen.current
    if (mounted.current) {
      if (showLoading) setLoading(true)
      setError(null)
    }
    try {
      const res = await api.calls()
      if (mounted.current && gen === reqGen.current) {
        setData(res)
        setError(null)
      }
    } catch {
      if (mounted.current && gen === reqGen.current) {
        setError('Published Calls history is temporarily unavailable. Your saved research has not been changed.')
      }
    } finally {
      if (mounted.current && gen === reqGen.current) setLoading(false)
    }
  }, [])
  useEffect(() => {
    load()
    const id = setInterval(load, 15_000) // settle in newly-filed reviews / dashboards
    return () => clearInterval(id)
  }, [load])
  const loadPaper = useCallback(async () => {
    try {
      const read = publishedPaperPortfolio(await api.paperPortfolio())
      if (mounted.current) setPaperData(read)
    } catch {
      if (mounted.current) setPaperData(null)
    } finally {
      if (mounted.current) setPaperLoading(false)
    }
  }, [])
  useEffect(() => {
    loadPaper()
    const id = setInterval(loadPaper, 15_000)
    return () => clearInterval(id)
  }, [loadPaper])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  // The published endpoint is versioned independently from the browser bundle. Fail closed if an old or
  // partial deploy sends a non-array field instead of letting one malformed payload take down the panel.
  const calls = useMemo(() => publishedCalls(data?.calls), [data?.calls])
  const current = useMemo(() => currentCalls(calls), [calls])
  const currentRoots = useMemo(() => new Set(current
    .map((call) => call?.run_root)
    .filter((root): root is string => typeof root === 'string' && root.length > 0)), [current])
  const updates = useMemo(() => publishedCallUpdates(data?.updates), [data?.updates])
  const needsAttention = useMemo(() => publishedNeedsAttention(data?.needs_attention), [data?.needs_attention])
  const scorecard = useMemo(() => publishedCallsScorecard(data?.scorecard), [data?.scorecard])
  const visibleCalls = view === 'current' ? current : calls

  return (
    <motion.div className="calls" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="calls__head">
        <div style={{ minWidth: 0 }}>
          <div className="calls__title">Calls</div>
          <div className="calls__sub">What the engine believes now, what it believed before, and what changed</div>
        </div>
        <div className="calls__tools">
          {!staticMode && <button className="btn btn--ghost btn--mini" onClick={() => refreshDashboard()} title="Rebuild the downloadable dashboard (/research:track)">Rebuild</button>}
          <button className="btn btn--ghost btn--mini" onClick={() => data?.dashboard ? openCallFile(data.dashboard, 'Calls dashboard') : setToast({ msg: 'No dashboard yet — Rebuild to generate one', tone: 'info' })} title="Open the latest markdown dashboard">Dashboard ↧</button>
          <button className="btn btn--ghost btn--mini" onClick={() => { load(true); loadPaper() }} disabled={loading} title="Read the latest Calls history and IBKR Paper portfolio">{loading ? 'Loading…' : 'Refresh ↻'}</button>
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={close} aria-label="Close">✕</button>
        </div>
      </div>

      <div className="calls__body">
        {error && (
          <div className="calls__error" role="status">
            <span>{error}</span>
            <button className="btn btn--ghost btn--mini" onClick={() => load(true)}>Try again</button>
          </div>
        )}
        <PaperPortfolioPanel portfolio={paperData} loading={paperLoading} staticMode={staticMode} onRefresh={loadPaper} />
        {calls.length === 0 ? (
          <div className="calls__empty">{loading ? 'Loading…' : "No calls yet. Run the full pipeline on a company and its verdict appears here to track over time."}</div>
        ) : (
          <>
            {scorecard && <CallsScorecardPanel scorecard={scorecard} />}
            <div className="calls__viewbar">
              <div className="seg calls__tabs" role="tablist" aria-label="Calls view">
                {([
                  ['current', 'Current', current.length],
                  ['history', 'History', calls.length],
                  ['updates', 'Updates', updates.length],
                ] as const).map(([key, label, count]) => (
                  <button
                    key={key}
                    className={`seg__btn${view === key ? ' seg__btn--on' : ''}`}
                    role="tab"
                    aria-selected={view === key}
                    onClick={() => setView(key)}
                  >
                    {label} <span className="calls__tabcount">{count}</span>
                  </button>
                ))}
              </div>
              <div className="calls__count" title={data?.authority_commit ? `Published source commit ${data.authority_commit}` : undefined}>
                {view === 'current' && <><b>{current.length}</b> current compan{current.length === 1 ? 'y' : 'ies'}</>}
                {view === 'history' && <><b>{calls.length}</b> dated call{calls.length === 1 ? '' : 's'} across {current.length} compan{current.length === 1 ? 'y' : 'ies'}</>}
                {view === 'updates' && <><b>{updates.length}</b> recorded change{updates.length === 1 ? '' : 's'}</>}
                {staticMode ? ' · read-only showcase' : data?.authority_commit ? ' · published history' : ''}
              </div>
            </div>
            {view === 'current' && needsAttention.length > 0 && <NeedsAttentionPanel rows={needsAttention} onOpen={openCallFile} />}
            {view === 'updates' ? (
              <CallsUpdates rows={updates} staticMode={staticMode} onOpen={openCallFile} />
            ) : (
              visibleCalls.map((c) => (
                <CallCard
                  key={c.run_root}
                  c={c}
                  historical={view === 'history' && !currentRoots.has(c.run_root)}
                  busy={anyRunForTicker(c.ticker) || launchPending?.ticker === c.ticker} // pending covers the click→ack window; refreshActiveRuns covers the rest
                  staticMode={staticMode}
                  onUpdate={() => updateCall(c.ticker)}
                  onFileDue={(w) => fileDueReview(c.ticker, w)}
                  onOpen={openCallFile}
                  onCopyNote={copyStageOne}
                />
              ))
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

function portfolioMoney(currency: string | null | undefined, value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  try {
    return new Intl.NumberFormat(undefined, {
      style: currency ? 'currency' : 'decimal', currency: currency || undefined,
      maximumFractionDigits: Math.abs(value) >= 1_000 ? 0 : 2,
    }).format(value)
  } catch {
    return `${currency || ''} ${value.toLocaleString()}`.trim()
  }
}

function historicalStateLabel(state: NonNullable<IbkrPaperPortfolioRead['history']['call_states']>[number]): string {
  if (state.state === 'blocked') return `Blocked · ${String(state.block_reason || 'safety check').replaceAll('_', ' ')}`
  if (state.state === 'no_position') return 'No position'
  return `${state.state === 'open' ? 'Open' : 'Closed'} · ${state.allocation_pct}% ${state.side}`
}

function historicalMarkLabel(state: NonNullable<IbkrPaperPortfolioRead['history']['call_states']>[number]): string {
  if (!state.price_as_of) return 'No price check available'
  if (state.mark_source === 'review') return `Review ${state.price_as_of}`
  if (state.mark_source === 'later_call') return `Closed ${state.price_as_of}`
  return `Call date ${state.price_as_of} · no later price check`
}

function PaperPortfolioPanel({ portfolio, loading, staticMode, onRefresh }: { portfolio: IbkrPaperPortfolioRead | null; loading: boolean; staticMode: boolean; onRefresh: () => Promise<void> }) {
  const setToast = useStore((s) => s.setToast)
  const [busy, setBusy] = useState<string | null>(null)
  const account = portfolio?.account
  const targetPositions = portfolio?.target.positions ?? []
  const actualPositions = account?.positions ?? []
  const openOrders = portfolio?.open_orders ?? []
  const history = portfolio?.history
  const historyAvailable = history?.available === true
  const status = portfolio?.status ?? (loading ? 'loading' : 'unavailable')
  const statusLabel = status === 'connected' ? 'Connected' : status === 'loading' ? 'Connecting…' : status === 'disabled' && staticMode ? 'Live only' : 'Disconnected'
  const targetLabel = portfolio?.target.valid
    ? targetPositions.length
      ? `${targetPositions.length} sized target${targetPositions.length === 1 ? '' : 's'}`
      : '100% cash · no trade'
    : 'Target blocked'
  const ready = portfolio?.execution.status === 'ready' && portfolio.execution.can_execute && !staticMode
  const syncNeeded = targetPositions.length > 0 || actualPositions.length > 0 || openOrders.some((row) => row.nostra_managed)
  const automatic = portfolio?.execution.automatic
  const lastAutomatic = automatic?.last_attempt

  const act = async (key: string, question: string, run: () => Promise<{ detail: string; skipped: { ticker: string; reason: string }[] }>) => {
    if (!window.confirm(question)) return
    setBusy(key)
    try {
      const result = await run()
      const skipped = result.skipped.length ? ` ${result.skipped.map((row) => `${row.ticker}: ${row.reason}`).join(' ')}` : ''
      setToast({ msg: `${result.detail}${skipped}`, tone: result.skipped.length ? 'info' : 'good' })
      await onRefresh()
    } catch (error: any) {
      setToast({ msg: String(error?.message || 'IBKR Paper action failed'), tone: 'info' })
    } finally { setBusy(null) }
  }

  return (
    <section className={`paperport paperport--${status}`} aria-label="IBKR simulated paper portfolio" aria-busy={busy !== null}>
      <div className="paperport__head">
        <div>
          <span className="paperport__eyebrow">Simulated · paper only</span>
          <strong>Nostra automated portfolio</strong>
          <small>{portfolio?.connection.detail || (loading ? 'Reading the local TWS paper account…' : 'IBKR Paper is temporarily unavailable.')}</small>
        </div>
        <span className="paperport__status" role="status" aria-live="polite"><i />{statusLabel}</span>
      </div>
      <div className="paperport__model">
        <div className="paperport__modelhead">
          <div><span>Historical model portfolio</span><strong>{historyAvailable ? `${history!.present_value.toFixed(2)} NAV` : '—'}</strong><small>{history?.detail || 'Reading all published calls…'}</small></div>
          <div><span>Result</span><strong className={(history?.total_return_pct ?? 0) < 0 ? 'tone--bad' : 'tone--good'}>{historyAvailable ? ret(history!.total_return_pct) : '—'}</strong><small>{historyAvailable ? `${history!.cash_value.toFixed(2)} cash · ${history!.invested_value.toFixed(2)} invested` : 'Unavailable'}</small></div>
          <div><span>Old calls shown</span><strong>{historyAvailable ? history!.calls_examined : '—'}</strong><small>{historyAvailable ? `${history!.trade_calls} model trades · ${history!.non_trade_calls} intentional no-trades` : 'No cash signal inferred'}</small></div>
        </div>
        {[...(history?.call_states ?? [])].reverse().map((state) => (
          <div className={`paperport__callstate paperport__callstate--${state.state}`} key={state.call_id} title={state.detail}>
            <span><b>{state.ticker}</b> {state.decision}<small>{state.decision_date || 'date unavailable'} · confidence {state.confidence ?? '—'}</small></span>
            <span><b>{historicalStateLabel(state)}</b><small>{state.allocation_pct ? `${state.conviction} conviction sizing` : 'No model cash used'}</small></span>
            <span><b>{state.entry_price === null ? 'Price unavailable' : `${state.currency || ''} ${state.entry_price}${state.mark_source === 'decision' || state.current_price === null ? '' : ` → ${state.current_price}`}`}</b><small>{state.position_return_pct !== null && state.mark_source !== 'decision' ? `Position result ${ret(state.position_return_pct)} · value ${state.current_value_units?.toFixed(2)} from ${state.allocation_pct?.toFixed(2)}` : state.price_move_pct !== null ? `Price move ${ret(state.price_move_pct)} · not portfolio P&L` : 'No later result yet'}</small></span>
            <span><b>{state.current_action || 'Not reviewed yet'}</b><small>{historicalMarkLabel(state)}{state.next_check_date ? ` · Next ${state.next_check_label || 'check'} ${state.next_check_date}` : ''}</small></span>
            <small className="paperport__callstate-detail">{state.detail}{state.current_action_reason ? ` Current review: ${state.current_action_reason}` : ''}</small>
          </div>
        ))}
      </div>
      <div className="paperport__metrics">
        <div><span>Portfolio value</span><strong>{portfolioMoney(account?.currency, account?.net_liquidation)}</strong></div>
        <div><span>Cash</span><strong>{portfolioMoney(account?.currency, account?.total_cash)}</strong></div>
        <div><span>Invested</span><strong>{portfolioMoney(account?.currency, account?.gross_position_value)}</strong></div>
        <div><span>Unrealized P&amp;L</span><strong>{portfolioMoney(account?.currency, account?.unrealized_pnl)}</strong></div>
      </div>
      <div className="paperport__truth">
        <div>
          <span>Nostra target</span>
          <strong>{targetLabel}</strong>
          <small>{portfolio?.target.detail || 'Building the current target from published Calls history.'}{portfolio?.target.generated_at ? ` · ${portfolio.target.generated_at}` : ''}</small>
        </div>
        <div>
          <span>IBKR Paper now</span>
          <strong>{actualPositions.length ? `${actualPositions.length} holding${actualPositions.length === 1 ? '' : 's'}` : account ? '100% cash · no holdings' : 'Not available'}</strong>
          <small>{portfolio?.reconciliation.detail || 'Open TWS in Paper mode on port 7497 to compare.'}</small>
        </div>
      </div>
      {(targetPositions.length > 0 || actualPositions.length > 0) && (
        <div className="paperport__positions">
          {targetPositions.map((row) => <span key={`target-${row.ticker}`}><b>{row.ticker}</b> {row.decision} · target {ret(row.model_weight_pct)} · {row.conviction} {row.confidence}</span>)}
        </div>
      )}
      {(openOrders.length > 0 || actualPositions.length > 0) && (
        <div className="paperport__brokerrows">
          {openOrders.map((row) => (
            <div className="paperport__brokerrow" key={`order-${row.order_id}`}>
              <span><b>{row.symbol}</b> {row.action} {row.total_quantity ?? '—'} · {row.status} · {row.nostra_managed ? 'Nostra' : 'manual/other'}</span>
              {row.can_cancel && <button className="btn btn--ghost btn--mini" disabled={!ready || busy !== null} onClick={() => act(`cancel-${row.order_id}`, `Cancel this unfilled ${row.symbol} PAPER order?`, () => api.paperOrderCancel(row.order_id))}>{busy === `cancel-${row.order_id}` ? 'Cancelling…' : 'Cancel order'}</button>}
            </div>
          ))}
          {actualPositions.map((row) => (
            <div className="paperport__brokerrow" key={`position-${row.contract_id}`}>
              <span><b>{row.symbol}</b> {row.quantity} shares · {ret(row.portfolio_weight_pct)} · P&amp;L {portfolioMoney(row.currency, row.unrealized_pnl)}</span>
              <button className="btn btn--ghost btn--mini" disabled={!ready || busy !== null} onClick={() => act(`close-${row.contract_id}`, `Close the entire ${row.symbol} PAPER position at market? Its value returns to cash after the fill.`, () => api.paperPositionClose(row.contract_id))}>{busy === `close-${row.contract_id}` ? 'Closing…' : 'Close to cash'}</button>
            </div>
          ))}
        </div>
      )}
      <div className={`paperport__lock${ready ? ' paperport__lock--ready' : ''}`} role="status" aria-live="polite">
        <span>{automatic?.enabled ? 'Automatic paper execution on' : ready ? 'Paper execution ready' : portfolio?.execution.status === 'ready' ? 'View only · operator controls locked' : 'Execution locked'}</span>
        <small>{portfolio?.execution.detail || 'No order can be sent.'} Low conviction = 5%. High conviction = 10% at confidence 75+.{lastAutomatic ? ` Last automatic result: ${lastAutomatic.outcome.replaceAll('_', ' ')} at ${lastAutomatic.at}${lastAutomatic.ticker ? ` after ${lastAutomatic.ticker} research` : ''} — ${lastAutomatic.detail}` : automatic?.enabled ? ' Waiting for the next verified published Research call.' : ''}</small>
        {ready && <button className="btn btn--amber btn--mini" disabled={busy !== null || !portfolio?.target.valid || !syncNeeded} onClick={() => act('sync', `Reconcile IBKR PAPER to the verified current Nostra target now${targetPositions.length ? ` (${targetPositions.length} position${targetPositions.length === 1 ? '' : 's'})` : ' (100% cash)'}? Any required close must fill before a replacement opens. Historical calls will not be backdated.`, () => api.paperPortfolioSync())}>{busy === 'sync' ? 'Sending…' : syncNeeded ? 'Sync now' : 'No trade now'}</button>}
      </div>
    </section>
  )
}

function CallsScorecardPanel({ scorecard }: { scorecard: CallsScorecard }) {
  return (
    <section className="callscore" aria-label="Overall Nostra call scorecard">
      <div className="callscore__head">
        <div><strong>Nostra scorecard</strong><span>One latest outcome per non-provisional call. Returns use Selected and Short calls only.</span></div>
        <span>{scorecard.assessed_calls} scored · {scorecard.mixed} mixed · {scorecard.unscored} unscored / not assessable{scorecard.excluded_provisional ? ` · ${scorecard.excluded_provisional} provisional excluded` : ''}</span>
      </div>
      <div className="callscore__metrics">
        <div><span>Calls worked</span><strong className="tone--good">{scorecard.worked}</strong></div>
        <div><span>Calls failed</span><strong className="tone--bad">{scorecard.failed}</strong></div>
        <div><span>Average position result</span><strong>{ret(scorecard.average_return_pct)}</strong></div>
        <div><span>Versus benchmark</span><strong>{ret(scorecard.average_vs_benchmark_pct)}</strong></div>
      </div>
      <div className="callscore__horizons">
        {scorecard.horizons.map((row) => (
          <div key={row.window}>
            <span>{row.window.toUpperCase()}</span>
            <strong>{ret(row.average_return_pct)}</strong>
            <small>{row.reviewed ? `${ret(row.average_vs_benchmark_pct)} vs benchmark · ${row.worked} worked · ${row.failed} failed · ${row.reviewed} reviewed` : 'No reviews yet'}</small>
          </div>
        ))}
      </div>
      <div className={`callscore__confidence callscore__confidence--${scorecard.confidence_check.status}`}>
        <strong>Confidence check</strong><span>{scorecard.confidence_check.detail}</span>
      </div>
    </section>
  )
}

function CallsUpdates({ rows, staticMode, onOpen }: { rows: CallUpdate[]; staticMode: boolean; onOpen: (path: string, title: string) => void }) {
  if (!Array.isArray(rows) || rows.length === 0) {
    return (
      <div className="calls__empty">
        {staticMode
          ? 'Updates are available in the live cockpit. This read-only showcase does not rebuild published history.'
          : 'No recorded changes yet. A new dated call or completed review will appear here in plain English.'}
      </div>
    )
  }
  return (
    <div className="callupdates" aria-label="Published call changes">
      {rows.map((row) => (
        <button
          className={`callupdate callupdate--${row.tone}`}
          key={row.id}
          disabled={!row.source_path}
          onClick={() => row.source_path && onOpen(row.source_path, `${row.kind === 'review' ? 'Review' : 'Investment thesis'} — ${row.ticker}`)}
          title={row.source_path ? 'Open the published source behind this update' : undefined}
        >
          <span className="callupdate__rail" />
          <span className="callupdate__body">
            <span className="callupdate__meta">
              <span>{row.kind === 'review' ? 'Review' : 'Call'}</span>
              <span>{row.at || 'date not recorded'}</span>
              {row.company && <span>{row.company}</span>}
            </span>
            <strong>{row.headline}</strong>
            {row.detail && <span className="callupdate__detail">{row.detail}</span>}
          </span>
          {row.source_path && <span className="callupdate__open" aria-hidden="true">›</span>}
        </button>
      ))}
    </div>
  )
}

// Ranked "needs attention now" list — AS_forecast_overdue / AW_kill_criteria_overdue (scripts/eval.py),
// live: a forecast whose window closed with no resolution, or a kill criterion whose named monitor
// event already passed unchecked (CLAUDE.md §8/§19). Previously visible only by running
// `/research:eval` by hand; this is what makes them actionable without leaving the cockpit.
function NeedsAttentionPanel({ rows, onOpen }: { rows: NeedsAttentionRow[]; onOpen: (path: string, title: string) => void }) {
  const [open, setOpen] = useState(true)
  if (!Array.isArray(rows) || rows.length === 0) return null
  return (
    <div className="needsattn">
      <div className="needsattn__head" onClick={() => setOpen((o) => !o)}>
        <span className="needsattn__title">⚠ Needs attention now</span>
        <span className="needsattn__count">{rows.length}</span>
        <span className="needsattn__toggle">{open ? '▾' : '▸'}</span>
      </div>
      {open && (
        <div className="needsattn__list">
          {rows.map((r, i) => (
            <div
              key={`${r.run_root}-${r.type}-${i}`}
              className="needsattn__row"
              title={r.description}
              onClick={() => onOpen(r.final_thesis_path, `Investment Thesis — ${r.ticker}`)}
            >
              <span className="needsattn__kind">{r.type === 'forecast' ? 'forecast' : 'kill criterion'}</span>
              <span className="needsattn__tkr">{r.ticker}</span>
              <span className="needsattn__due">due {r.due_date}</span>
              <span className="needsattn__desc">{r.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function CallCard({ c, historical, busy, staticMode, onUpdate, onFileDue, onOpen, onCopyNote }: {
  c: CallSummary
  historical: boolean
  busy: boolean
  staticMode: boolean
  onUpdate: () => void
  onFileDue: (window: string) => void
  onOpen: (path: string, title: string) => void
  onCopyNote: (text: string) => void
}) {
  // nodes = the call itself, then each review checkpoint in time order
  const nodes: TLNode[] = [{
    kind: 'call', label: 'Call', sub: dash(c.decision_date), reached: true,
    title: `Call: ${dash(c.decision)} on ${dash(c.decision_date)} · entry ${money(c.currency, c.entry_price)}`,
  }]
  for (const t of c.timeline) {
    const reached = t.status === 'done' || t.status === 'due' || t.status === 'overdue'
    const callReturn = callReturnValue(c, t.absolute_return_pct)
    const sub = t.status === 'done' ? ret(callReturn) : dash(t.due_date)
    const detail = t.status === 'done'
      ? `Reviewed ${dash(t.review_date)} · price ${dash(t.review_price)} · ${ret(callReturn)} · thesis ${dash(t.thesis_status)} · forecasts ${dash(t.forecasts_confirmed)}✓/${dash(t.forecasts_falsified)}✗${t.memo_delta_file ? ' · click: memo delta' : t.review_file ? ' · click: review JSON' : ''}`
      : `${t.window} review ${t.status} — due ${dash(t.due_date)}`
    const subTone = t.status === 'done' && callReturn != null ? (callReturn >= 0 ? 'pos' : 'neg') : undefined
    // a done checkpoint opens its human-readable memo delta when the review filed one; else the raw review JSON
    const onClick = t.memo_delta_file
      ? () => onOpen(t.memo_delta_file!, `${c.ticker} ${t.window} memo delta`)
      : t.review_file
        ? () => onOpen(t.review_file!, `${c.ticker} ${t.window} review`)
        : undefined
    nodes.push({ kind: t.status, label: t.window, sub, subTone, reached, title: detail, onClick })
  }
  // Use the actual review date: a scheduled review can be filed after a newer-due ad-hoc checkpoint.
  const lastDelta = latestCompletedReview(c.timeline.filter((t) => t.memo_delta_file || t.stage_one_comment))
  // amber fill reaches the furthest checkpoint time has passed (done/due/overdue)
  let reachedIdx = 0
  nodes.forEach((n, i) => { if (n.reached) reachedIdx = i })
  const n = nodes.length
  const inset = 100 / (2 * n)
  const span = 100 - 2 * inset
  const fillW = n > 1 ? (reachedIdx / (n - 1)) * span : 0

  const nc = c.next_checkpoint
  const dueNow = nc && (nc.status === 'due' || nc.status === 'overdue')
  const forecastsTotal = c.forecasts.open + c.forecasts.confirmed + c.forecasts.falsified + c.forecasts.expired + c.forecasts.other
  const tracking = callTrackingSnapshot(c)

  return (
    <div className="callcard">
      <div className="callcard__top">
        <div className="callcard__id">
          <span className="verdict" style={{ color: decisionColor(c.decision || '') }}>{dash(c.decision)}</span>
          {c.integrity_status === 'provisional' && (
            <span
              className="flag flag--bad"
              title={`Truth-integrity: provisional${c.integrity_verdict ? ` (verify-evidence verdict: ${c.integrity_verdict})` : ''}${c.integrity_banner ? ' — the finish-gate stamped this run PROVISIONAL' : ''}. Resolve before trusting this call's numbers.`}
            >
              ⚠ UNVERIFIED
            </span>
          )}
          {c.decision_is_post_mortem_capped && (
            <span className="flag flag--warn" title="A terminal pre-mortem red-team verdict downgraded this call below its original rating — open the thesis for the pre-mortem's verdict and killer risk.">
              ⚠ CAPPED
            </span>
          )}
          {historical && <span className="flag flag--past" title="A newer dated call for this company is shown in Current">PAST CALL</span>}
          <span className="callcard__name" title={dash(c.company)}>{dash(c.company)}</span>
          <span className="callcard__tkr">{c.ticker}{c.exchange ? ` · ${c.exchange}` : ''}</span>
        </div>
        <div className="callcard__when">{dash(c.decision_date)}<br />{dash(c.time_horizon)} horizon</div>
      </div>

      <div className="calltrack">
        <p className="calltrack__original">{tracking.originalSentence}</p>
        <div className="calltrack__action">
          <span>Action now</span>
          <strong className={`tone--${tracking.actionNow.tone}`}>{tracking.actionNow.label}</strong>
          <small>{tracking.actionNow.detail}</small>
        </div>
        {tracking.result && (
          <div className="calltrack__result">
            <span>Price result versus thesis result</span>
            <strong className={`tone--${tracking.result.tone}`}>{tracking.result.headline}</strong>
            <small>{tracking.result.thesis}</small>
          </div>
        )}
        <div className="calltrack__grid">
          <div className="calltrack__cell">
            <span className="calltrack__label">{tracking.checkpoint?.label || 'Latest check'}</span>
            <strong>{tracking.checkpoint?.price || 'Not reviewed yet'}</strong>
            <span className={`calltrack__metric tone--${tracking.checkpoint?.returnTone || 'neutral'}`}>
              {tracking.checkpoint?.returnLabel || 'Return at check'}: {tracking.checkpoint?.returnFromCall || 'not available yet'}
            </span>
            {tracking.checkpoint?.benchmarkDelta && <small>{tracking.checkpoint.benchmarkDelta}</small>}
            {tracking.checkpoint?.sincePrevious && <small>{tracking.checkpoint.sincePrevious}</small>}
          </div>
          <div className="calltrack__cell">
            <span className="calltrack__label">Confidence change</span>
            <strong className={`tone--${tracking.confidence.tone}`}>{tracking.confidence.label}</strong>
            <small>{tracking.confidence.detail}</small>
          </div>
          <div className="calltrack__cell">
            <span className="calltrack__label">Next check</span>
            <strong className={`tone--${tracking.nextCheck?.tone || 'neutral'}`}>
              {tracking.nextCheck?.date || 'Not scheduled'}
            </strong>
            <small>{tracking.nextCheck?.detail || 'No future checkpoint recorded'}</small>
          </div>
        </div>
        {tracking.evidence && (
          <div className="calltrack__evidence" title={tracking.evidence}>
            <span>What is going right / wrong</span>
            <p>{tracking.evidence}</p>
          </div>
        )}
        {tracking.learning && (
          <div className="calltrack__learning" title={tracking.learning}>
            <span>Why we were right / wrong · lesson carried forward</span>
            <p>{tracking.learning}</p>
          </div>
        )}
      </div>

      <div className="tl">
        <div className="tl__base" style={{ left: `${inset}%`, width: `${span}%` }} />
        <div className="tl__fill" style={{ left: `${inset}%`, width: `${fillW}%` }} />
        <div className="tl__row">
          {nodes.map((node, i) => (
            <div
              key={i}
              className={`tlnode tlnode--${node.kind}${node.onClick ? ' clickable' : ''}`}
              title={node.title}
              onClick={node.onClick}
            >
              <div className="tlnode__dot" />
              <div className="tlnode__label">{node.label}</div>
              <div className={`tlnode__sub${node.subTone ? ' ' + node.subTone : ''}`}>{node.sub}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="callcard__foot">
        <button className="btn btn--mini" onClick={onUpdate} disabled={staticMode || busy} title="Fetch the latest price and re-check forecasts/risks now (files an ad-hoc review)">
          {busy ? 'Updating…' : 'Update now'}
        </button>
        {dueNow && <button className="btn btn--ghost btn--mini" onClick={() => onFileDue(nc!.window)} disabled={staticMode || busy} title={`File the scheduled ${nc!.window} review`}>File {nc!.window} review</button>}
        <button className="btn btn--ghost btn--mini" onClick={() => onOpen(c.final_thesis_path, `Investment Thesis — ${c.ticker}`)}>Thesis</button>
        {lastDelta?.memo_delta_file && (
          <button className="btn btn--ghost btn--mini" onClick={() => onOpen(lastDelta.memo_delta_file!, `${c.ticker} memo delta (${lastDelta.window})`)} title="What changed since the memo — the latest review's 2–3 page delta">
            Delta memo
          </button>
        )}
        {lastDelta?.stage_one_comment && (
          <button className="btn btn--ghost btn--mini" onClick={() => onCopyNote(lastDelta.stage_one_comment!)} title="Copy the latest Stage-One sheet comment">
            Copy note
          </button>
        )}
        <span className="callcard__hint">
          {forecastsTotal > 0 && <>{c.forecasts.confirmed}✓/{c.forecasts.falsified}✗ of {forecastsTotal} forecasts · </>}
          {nc ? <>next: {nc.window} {nc.status === 'overdue' ? 'overdue' : nc.status} {dash(nc.due_date)}</> : 'no checkpoints'}
        </span>
      </div>
    </div>
  )
}
