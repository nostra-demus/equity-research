import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { api, isStatic } from '../lib/api'
import { currentCalls } from '../lib/callsView'
import { decisionColor } from '../lib/format'
import type { CallSummary, CallTimelineEntry, CallsResult, CallUpdate, NeedsAttentionRow } from '../lib/types'
import './CallsTracker.css'

// every call the engine has made + what's happened since — a card per call with a visual timeline
// (an amber line that fills up to "now" through the dated review checkpoints).

const dash = (v: unknown) => (v === null || v === undefined || v === '' ? '—' : String(v))
function ret(v?: number | null): string {
  return typeof v !== 'number' ? '—' : v >= 0 ? `+${v.toFixed(1)}%` : `${v.toFixed(1)}%`
}
function thesisColor(s?: string | null): string {
  switch ((s || '').toLowerCase()) {
    case 'confirmed': case 'on-track': return 'var(--accent-bright)'
    case 'at-risk': return 'var(--accent-bright)'
    case 'broken': return 'var(--bad)'
    default: return 'var(--text-faint)'
  }
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<CallsView>('current')
  const staticMode = isStatic()

  const reqGen = useRef(0)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const load = useCallback(async (showLoading = false) => {
    const gen = ++reqGen.current
    if (showLoading && mounted.current) setLoading(true)
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
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  // The published endpoint is versioned independently from the browser bundle. Fail closed if an old or
  // partial deploy sends a non-array field instead of letting one malformed payload take down the panel.
  const calls = Array.isArray(data?.calls) ? data.calls : []
  const current = useMemo(() => currentCalls(calls), [calls])
  const currentRoots = useMemo(() => new Set(current
    .map((call) => call?.run_root)
    .filter((root): root is string => typeof root === 'string' && root.length > 0)), [current])
  const updates = Array.isArray(data?.updates) ? data.updates : []
  const needsAttention = Array.isArray(data?.needs_attention) ? data.needs_attention : []
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
          <button className="btn btn--ghost btn--mini" onClick={() => load(true)} disabled={loading} title="Read the latest published Calls history">{loading ? 'Loading…' : 'Refresh ↻'}</button>
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
        {calls.length === 0 ? (
          <div className="calls__empty">{loading ? 'Loading…' : "No calls yet. Run the full pipeline on a company and its verdict appears here to track over time."}</div>
        ) : (
          <>
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
            ) : visibleCalls.map((c) => (
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
              ))}
          </>
        )}
      </div>
    </motion.div>
  )
}

function CallsUpdates({ rows, staticMode, onOpen }: { rows: CallUpdate[]; staticMode: boolean; onOpen: (path: string, title: string) => void }) {
  if (!rows.length) {
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
    const sub = t.status === 'done' ? ret(t.absolute_return_pct) : dash(t.due_date)
    const detail = t.status === 'done'
      ? `Reviewed ${dash(t.review_date)} · price ${dash(t.review_price)} · ${ret(t.absolute_return_pct)} · thesis ${dash(t.thesis_status)} · forecasts ${dash(t.forecasts_confirmed)}✓/${dash(t.forecasts_falsified)}✗${t.memo_delta_file ? ' · click: memo delta' : t.review_file ? ' · click: review JSON' : ''}`
      : `${t.window} review ${t.status} — due ${dash(t.due_date)}`
    const subTone = t.status === 'done' && typeof t.absolute_return_pct === 'number' ? (t.absolute_return_pct >= 0 ? 'pos' : 'neg') : undefined
    // a done checkpoint opens its human-readable memo delta when the review filed one; else the raw review JSON
    const onClick = t.memo_delta_file
      ? () => onOpen(t.memo_delta_file!, `${c.ticker} ${t.window} memo delta`)
      : t.review_file
        ? () => onOpen(t.review_file!, `${c.ticker} ${t.window} review`)
        : undefined
    nodes.push({ kind: t.status, label: t.window, sub, subTone, reached, title: detail, onClick })
  }
  // latest filed delta artifacts (timeline is in time order; take the last done entry that carries them)
  const lastDelta = [...c.timeline].reverse().find((t) => t.status === 'done' && (t.memo_delta_file || t.stage_one_comment))
  // amber fill reaches the furthest checkpoint time has passed (done/due/overdue)
  let reachedIdx = 0
  nodes.forEach((n, i) => { if (n.reached) reachedIdx = i })
  const n = nodes.length
  const inset = 100 / (2 * n)
  const span = 100 - 2 * inset
  const fillW = n > 1 ? (reachedIdx / (n - 1)) * span : 0

  const nc = c.next_checkpoint
  const dueNow = nc && (nc.status === 'due' || nc.status === 'overdue')
  const statusLabel = c.latest_thesis_status || 'awaiting first review'
  const forecastsTotal = c.forecasts.open + c.forecasts.confirmed + c.forecasts.falsified + c.forecasts.expired + c.forecasts.other

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
          <span className="callcard__tkr">{c.ticker}</span>
        </div>
        <div className="callcard__when">{dash(c.decision_date)}<br />{dash(c.time_horizon)} horizon</div>
      </div>

      <div className="callcard__meta">
        <span>entry <b>{money(c.currency, c.entry_price)}</b>{c.implied_target != null && <> → target <b>{money(c.currency, c.implied_target)}</b></>}</span>
        <span>expected <b className={typeof c.expected_return_pct === 'number' ? (c.expected_return_pct >= 0 ? 'pos' : 'neg') : ''}>{ret(c.expected_return_pct)}</b></span>
        <span className="statuschip" style={{ color: thesisColor(c.latest_thesis_status) }}>
          <span className="dot" />{statusLabel}
        </span>
      </div>
      {!historical && c.latest_review_summary && (
        <div className="callcard__latest">
          <span>Latest review{c.latest_review_date ? ` · ${c.latest_review_date}` : ''}</span>
          {c.latest_review_summary}
        </div>
      )}

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
