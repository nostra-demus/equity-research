import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { BoardConviction, BookMomentum, ConvictionCheckpoint, ConvictionDetail, ConvictionEventRow, TrajectoryEnum } from '../../lib/types'

// Phase 3 live book — the conviction surface. Reads ONLY the board's engine-owned conviction
// snapshot (no client math beyond formatting). Shows, per idea: its sell-side rung, a conviction
// sparkline (the literal "basic → great" shape), the plain "passed N of M proof points" progress,
// and the precise rate-of-upgrade (+N/30d) — both, per the owner's call. Flat until the loop runs.

const TRAJ_WORD: Record<TrajectoryEnum, string> = {
  accelerating: 'climbing fast',
  steady: 'steady',
  stalling: 'stalling',
  decaying: 'cooling',
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null
  const t = new Date(iso).getTime()
  if (isNaN(t)) return null
  return Math.round((t - Date.now()) / 86_400_000)
}

function dueWord(iso: string | null): string {
  const d = daysUntil(iso)
  if (d == null) return 'no date'
  if (d === 0) return 'today'
  if (d > 0) return `in ${d}d`
  return `${-d}d ago`
}

// A pure-SVG conviction sparkline — edge_score_live (0–100) over time. No chart library; the line
// is static SVG and only opacity/transform ever animate (the dot pulse). A single point (never-yet
// validated) renders as a faint baseline + a dot, an honest "awaiting first check" empty state.
function Sparkline({ conv, w = 116, h = 30 }: { conv: BoardConviction; w?: number; h?: number }) {
  const pad = 4
  const pts = conv.trajectory?.length ? conv.trajectory : [{ at: '', edge: conv.edge_score_live }]
  const xy = (edge: number, i: number) => {
    const x = pts.length === 1 ? w - pad : pad + (i * (w - pad * 2)) / (pts.length - 1)
    const y = h - pad - (Math.max(0, Math.min(100, edge)) / 100) * (h - pad * 2)
    return [x, y] as const
  }
  const coords = pts.map((p, i) => xy(p.edge, i))
  const path = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const [lx, ly] = coords[coords.length - 1]
  const tone = !conv.validated
    ? 'var(--text-faint)'
    : conv.upgrade_velocity > 0
      ? 'var(--accent-bright)'
      : conv.upgrade_velocity < 0
        ? 'var(--bad)'
        : 'var(--text-muted)'
  return (
    <svg className="conv__spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden="true">
      <line x1={pad} y1={h - pad} x2={w - pad} y2={h - pad} stroke="var(--hairline)" strokeWidth="1" />
      {pts.length > 1 && <polyline points={path} fill="none" stroke={tone} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />}
      {pts.length === 1 && <line x1={pad} y1={ly} x2={lx} y2={ly} stroke="var(--hairline-strong)" strokeWidth="1.4" strokeDasharray="2 3" />}
      <circle className="conv__sparkdot" cx={lx} cy={ly} r="2.4" fill={tone} />
    </svg>
  )
}

function VelocityBadge({ conv }: { conv: BoardConviction }) {
  if (!conv.validated) return <span className="conv__vel conv__vel--new">not yet tested</span>
  const v = Math.round(conv.upgrade_velocity)
  const dir = v > 0 ? 'up' : v < 0 ? 'down' : 'flat'
  const arrow = v > 0 ? '▲' : v < 0 ? '▼' : '±'
  return (
    <span className={`conv__vel conv__vel--${dir}`} title="Rate of upgrade — change in idea strength per 30 days">
      {arrow} {v > 0 ? '+' : ''}{v}/30d
    </span>
  )
}

export function ConvictionStrip({ conv }: { conv: BoardConviction }) {
  if (conv.archived) {
    return (
      <div className="conv conv--archived">
        <span className="conv__rating conv__rating--archived">{conv.sell_side_rating}</span>
        <span className="conv__archived-note">{conv.plain_note || (conv.state === 'falsified_discarded' ? 'Killed by its own rule.' : 'Window closed unproven.')}</span>
      </div>
    )
  }
  const word = conv.validated ? TRAJ_WORD[conv.trajectory_enum] : 'awaiting first check'
  const nc = conv.next_checkpoint
  return (
    <div className="conv">
      <span className={`conv__rating conv__rating--${conv.state}`} title={`Live idea strength ${conv.edge_score_live}/100 (locked at ${conv.edge_locked})`}>
        {conv.sell_side_rating}
      </span>
      <Sparkline conv={conv} />
      <div className="conv__prog">
        <div className="conv__progline">
          <span>{conv.progress_confirmed} of {conv.progress_total} proof points</span>
          <span className="conv__traj">{word}</span>
        </div>
        <div className="conv__bar"><span className="conv__barfill" style={{ transform: `scaleX(${Math.max(0, Math.min(1, conv.proximity_pct / 100))})` }} /></div>
      </div>
      <VelocityBadge conv={conv} />
      {nc && (
        <span className="conv__next" title={nc.metric_name}>
          next: {nc.metric_name.length > 40 ? nc.metric_name.slice(0, 40) + '…' : nc.metric_name} · <span className="conv__due">{dueWord(nc.due_at)}</span>
        </span>
      )}
      {conv.stale && <span className="conv__flag conv__flag--stale" title="A check's due date passed with no result on record — rating frozen.">stale</span>}
      {conv.insufficient && <span className="conv__flag conv__flag--insuff" title="The check ran but no approved source gave the number — we refuse to fake it.">needs a source</span>}
      {conv.validated && conv.plain_note && <div className="conv__why" title="Why it last moved">{conv.plain_note}</div>}
    </div>
  )
}

// Map a checkpoint kind to a short plain label the board shows (no jargon, §21).
const KIND_LABEL: Record<string, string> = {
  kill_metric: 'kill-switch', secondary_metric: 'backup check', secondary_falsifier: 'warning sign',
  convergence_trigger: 'the catalyst', secondary_trigger: 'backup catalyst', expiry: 'deadline',
}

const VERDICT_STATE: Record<string, string> = { confirmed: 'ok', partial: 'part', against: 'miss', breached_kill: 'kill', unresolved: 'unresolved' }
const VERDICT_LABEL: Record<string, string> = { confirmed: 'confirmed', partial: 'partial', against: 'came up short', breached_kill: 'kill fired', unresolved: 'no read yet' }
const DOT_GLYPH: Record<string, string> = { ok: '✓', part: '~', miss: '!', kill: '✕', unresolved: '·' }

function shortDate(iso?: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return isNaN(d.getTime()) ? iso.slice(0, 10) : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

// The proof points as ONE connected timeline: what already resolved (green confirmed / amber short /
// red killed, with the real number read + the verdict it caused) → a "today" marker → what's still
// ahead (dated, counting down). New checks slot in by date with a "new" tag, on the same thread — so
// the idea reads top-to-bottom and you can see what's been checked, what it meant, and what's next.
export function CheckpointTimeline({ detail }: { detail: ConvictionDetail }) {
  const cps = detail.checkpoints || []
  if (!cps.length) return null
  const events = detail.events || []
  const resultByCp: Record<string, ConvictionEventRow> = {}
  for (const e of events) {
    if (e.row_type === 'validation_result' && e.checkpoint_id) {
      const cur = resultByCp[e.checkpoint_id]
      if (!cur || (e.checked_at || '') >= (cur.checked_at || '')) resultByCp[e.checkpoint_id] = e
    }
  }
  const moveByCp: Record<string, ConvictionEventRow> = {}
  for (const e of events) if (e.row_type === 'conviction_event' && e.triggering_checkpoint_id) moveByCp[e.triggering_checkpoint_id] = e
  const lock = cps.map((c) => c.created_at || '').filter(Boolean).sort()[0] || ''
  const isNew = (c: ConvictionCheckpoint) => !!(c.created_at && lock && c.created_at.slice(0, 10) > lock.slice(0, 10))
  const isResolved = (c: ConvictionCheckpoint) => { const r = resultByCp[c.checkpoint_id]; return !!(r && r.verdict && r.verdict !== 'unresolved') }

  const checked = cps.filter(isResolved).sort((a, b) => ((resultByCp[a.checkpoint_id].checked_at || '') < (resultByCp[b.checkpoint_id].checked_at || '') ? -1 : 1))
  const ahead = cps.filter((c) => !isResolved(c)).sort((a, b) => ((a.due_at || '~') < (b.due_at || '~') ? -1 : 1))
  const todayShort = shortDate(new Date().toISOString().slice(0, 10))

  const resolvedNode = (c: ConvictionCheckpoint) => {
    const r = resultByCp[c.checkpoint_id]
    const st = VERDICT_STATE[r.verdict || ''] || 'unresolved'
    const mv = moveByCp[c.checkpoint_id]
    const up = !!mv && ['upgrade', 'recover'].includes(mv.kind || '')
    return (
      <div key={c.checkpoint_id} className={`tl__node tl__node--${st}`}>
        <span className={`tl__dot tl__dot--${st}`}>{DOT_GLYPH[st]}</span>
        <div className="tl__body">
          <div className="tl__head">
            <span className="tl__kind">{KIND_LABEL[c.kind] || c.kind}{c.can_kill ? ' ⚠' : ''}</span>
            <span className={`tl__pill tl__pill--${st}`}>{VERDICT_LABEL[r.verdict || ''] || r.verdict}</span>
            {r.checked_at && <span className="tl__date">checked {shortDate(r.checked_at)}</span>}
          </div>
          <div className="tl__metric">
            {c.metric_name}
            {r.observed_value != null && r.observed_value !== '' ? <> — read <b>{String(r.observed_value)}</b></> : null}
            {c.threshold != null && c.threshold !== '' ? <span className="tl__vs"> vs {c.threshold}{c.unit ? ` ${c.unit}` : ''}</span> : null}
          </div>
          {mv && (mv.plain_note || mv.sell_side_rating) && (
            <div className={`tl__move tl__move--${up ? 'up' : 'down'}`}>
              {up ? '↑ ' : '↓ '}{mv.plain_note || `${mv.kind} to ${mv.sell_side_rating}`}
              {typeof mv.edge_score_live === 'number' ? ` · strength ${mv.edge_score_live}` : ''}
            </div>
          )}
        </div>
      </div>
    )
  }

  const upcomingNode = (c: ConvictionCheckpoint, last: boolean) => {
    const d = daysUntil(c.due_at)
    const overdue = d != null && d < 0
    const isKill = c.kind === 'kill_metric'
    const tone = overdue ? 'checking' : isKill ? 'killsoon' : 'soon'
    return (
      <div key={c.checkpoint_id} className={`tl__node tl__node--${tone}${last ? ' tl__node--end' : ''}${isNew(c) ? ' tl__node--new' : ''}`}>
        <span className={`tl__dot tl__dot--${tone}`}>{isKill ? '⚠' : isNew(c) ? '+' : ''}</span>
        <div className="tl__body">
          <div className="tl__head">
            <span className="tl__kind">{KIND_LABEL[c.kind] || c.kind}{c.can_kill ? ' ⚠' : ''}</span>
            {isNew(c) && <span className="tl__pill tl__pill--new">new · added {shortDate(c.created_at)}</span>}
            <span className="tl__date">{c.due_at ? `due ${shortDate(c.due_at)}` : 'no set date'}{d != null ? ` · ${overdue ? 'checking…' : `in ${d}d`}` : ''}</span>
          </div>
          <div className="tl__metric">
            {c.metric_name}
            {c.threshold != null && c.threshold !== '' ? <span className="tl__vs"> · {c.threshold}{c.unit ? ` ${c.unit}` : ''}</span> : null}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="tl">
      {checked.length > 0 && <div className="tl__zone">Checked — results are in</div>}
      {checked.map(resolvedNode)}
      <div className="tl__now"><span className="tl__nowline" />Today · {todayShort}<span className="tl__nowline" /></div>
      {ahead.length > 0 && <div className="tl__zone">Coming up — what we’re waiting on</div>}
      {ahead.map((c, i) => upcomingNode(c, i === ahead.length - 1))}
    </div>
  )
}

// The track record strip — the proof the loop works. Reads /screener:calibrate's latest output;
// shows an honest "building" state until enough checks resolve (never fabricates a metric).
export function TrackRecord() {
  const [c, setC] = useState<any | null>(null)
  useEffect(() => {
    let on = true
    api.screenerCalibration().then((r) => { if (on) setC(r) }).catch(() => {})
    return () => { on = false }
  }, [])
  if (!c) return null
  if (!c.sufficient) {
    return (
      <div className="trackrec trackrec--building" title={c.verdict}>
        <span className="trackrec__label">Track record</span>
        <span className="trackrec__note">building — {c.n_resolved}/{c.min_resolved_for_calibration} checks resolved across {c.n_theses} idea{c.n_theses === 1 ? '' : 's'}; fills in as they hit their dates</span>
      </div>
    )
  }
  return (
    <div className="trackrec" title={c.verdict}>
      <span className="trackrec__label">Track record</span>
      <span className="trackrec__stats">
        {c.hit_rate != null && <b>{Math.round(c.hit_rate * 100)}% hit-rate</b>}
        <span>{c.brier != null ? `Brier ${c.brier}` : 'Brier pending'}</span>
        <span>{c.n_resolved} checks resolved</span>
        {c.median_days_lock_to_confirm != null && <span>~{c.median_days_lock_to_confirm}d to confirm</span>}
        {c.false_discard_rate != null && <span>{Math.round(c.false_discard_rate * 100)}% discards reversed</span>}
      </span>
    </div>
  )
}

export function BookMomentumBanner({ m }: { m: BookMomentum }) {
  if (!m || m.live_count === 0) return null
  const anyTested = m.upgrading_count + m.decaying_count > 0
  const v = Math.round(m.mean_upgrade_velocity)
  const tone = !anyTested ? 'new' : v > 0 ? 'up' : v < 0 ? 'down' : 'flat'
  const detail = [
    `${m.live_count} live`,
    m.upgrading_count ? `${m.upgrading_count} climbing` : null,
    m.confirmed_count ? `${m.confirmed_count} confirmed` : null,
    m.fading_count ? `${m.fading_count} cooling` : null,
    m.archived_count ? `${m.archived_count} archived` : null,
  ].filter(Boolean).join(' · ')
  return (
    <div className={`bookmom bookmom--${tone}`}>
      {anyTested ? (
        <>
          <span className="bookmom__num">{v > 0 ? '▲ +' : v < 0 ? '▼ ' : '± '}{v}/30d</span>
          <span className="bookmom__label">book {v > 0 ? 'upgrading' : v < 0 ? 'cooling' : 'flat'} this week</span>
        </>
      ) : (
        <span className="bookmom__label">Tracking {m.live_count} live idea{m.live_count === 1 ? '' : 's'} · awaiting their first checks</span>
      )}
      <span className="bookmom__detail">{detail}</span>
    </div>
  )
}
