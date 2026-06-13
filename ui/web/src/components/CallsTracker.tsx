import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { api, isStatic } from '../lib/api'
import { decisionColor } from '../lib/format'
import type { CallSummary, CallTimelineEntry, CallsResult } from '../lib/types'
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
  const [data, setData] = useState<CallsResult | null>(null)
  const [loading, setLoading] = useState(true)
  const staticMode = isStatic()

  const reqGen = useRef(0)
  const mounted = useRef(true)
  useEffect(() => { mounted.current = true; return () => { mounted.current = false } }, [])
  const load = useCallback(async () => {
    const gen = ++reqGen.current
    try {
      const res = await api.calls()
      if (mounted.current && gen === reqGen.current) setData(res)
    } catch {
      if (mounted.current && gen === reqGen.current) setData({ calls: [], dashboard: null })
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

  const calls = data?.calls ?? []

  return (
    <motion.div className="calls" initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="calls__head">
        <div style={{ minWidth: 0 }}>
          <div className="calls__title">Calls tracker</div>
          <div className="calls__sub">Every call the engine has made — and what's happened since</div>
        </div>
        <div className="calls__tools">
          {!staticMode && <button className="btn btn--ghost btn--mini" onClick={() => refreshDashboard()} title="Rebuild the downloadable dashboard (/research:track)">Rebuild</button>}
          <button className="btn btn--ghost btn--mini" onClick={() => data?.dashboard ? openCallFile(data.dashboard, 'Calls dashboard') : setToast({ msg: 'No dashboard yet — Rebuild to generate one', tone: 'info' })} title="Open the latest markdown dashboard">Dashboard ↧</button>
          <button className="btn btn--ghost" style={{ height: 30 }} onClick={close} aria-label="Close">✕</button>
        </div>
      </div>

      <div className="calls__body">
        {calls.length === 0 ? (
          <div className="calls__empty">{loading ? 'Loading…' : "No calls yet. Run the full pipeline on a company and its verdict appears here to track over time."}</div>
        ) : (
          <>
            <div className="calls__count">Tracking <b style={{ color: 'var(--text-muted)' }}>{calls.length}</b> call{calls.length === 1 ? '' : 's'}{staticMode ? ' · read-only showcase' : ''}</div>
            {calls.map((c) => (
              <CallCard
                key={c.run_root}
                c={c}
                busy={anyRunForTicker(c.ticker)}
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

function CallCard({ c, busy, staticMode, onUpdate, onFileDue, onOpen, onCopyNote }: {
  c: CallSummary
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
