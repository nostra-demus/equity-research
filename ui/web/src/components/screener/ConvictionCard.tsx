import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import type { BoardConviction, BookMomentum, ConvictionDetail, TrajectoryEnum } from '../../lib/types'

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

function dueLabel(iso: string | null): string {
  if (!iso) return 'no set date'
  const d = daysUntil(iso)
  if (d == null) return iso
  if (d > 0) return `${iso} · in ${d}d`
  if (d === 0) return `${iso} · today`
  return `${iso} · passed`
}

// The proof points as a dated track: each checkpoint with its status dot (confirmed / missed / killed /
// upcoming) + the move history beneath. Powers "what are we waiting for, and what's already landed".
export function CheckpointTimeline({ detail }: { detail: ConvictionDetail }) {
  const cps = [...(detail.checkpoints || [])].sort((a, b) => (a.due_at || '~') < (b.due_at || '~') ? -1 : 1)
  const verdictByCp: Record<string, string> = {}
  for (const e of detail.events || []) if (e.row_type === 'validation_result' && e.checkpoint_id && e.verdict) verdictByCp[e.checkpoint_id] = e.verdict
  const moves = (detail.events || []).filter((e) => e.row_type === 'conviction_event' && e.kind !== 'seed')
  if (!cps.length) return null
  return (
    <div className="cptl">
      <div className="cptl__list">
        {cps.map((c) => {
          const v = verdictByCp[c.checkpoint_id]
          const tone = v === 'confirmed' ? 'ok' : v === 'breached_kill' ? 'kill' : v === 'against' ? 'miss' : v === 'partial' ? 'part' : c.status === 'resolved' ? 'done' : 'soon'
          const thr = c.threshold != null && c.threshold !== '' ? ` ${c.threshold}${c.unit ? ` ${c.unit}` : ''}` : ''
          return (
            <div key={c.checkpoint_id} className={`cptl__row cptl__row--${tone}`}>
              <span className="cptl__dot" />
              <span className="cptl__kind">{KIND_LABEL[c.kind] || c.kind}{c.can_kill ? ' ⚠' : ''}</span>
              <span className="cptl__metric" title={c.metric_name}>{c.metric_name.length > 64 ? c.metric_name.slice(0, 64) + '…' : c.metric_name}{thr}</span>
              <span className="cptl__due">{v ? v.replace(/_/g, ' ') : dueLabel(c.due_at)}</span>
            </div>
          )
        })}
      </div>
      {moves.length > 0 && (
        <div className="cptl__moves">
          {moves.slice(-6).reverse().map((m, i) => (
            <div key={i} className="cptl__move">
              <span className={`cptl__movekind cptl__movekind--${m.kind}`}>{m.kind}</span>
              <span className="cptl__movenote">{m.plain_note}</span>
              {typeof m.edge_score_live === 'number' && <span className="cptl__moveedge">{m.edge_score_live}</span>}
            </div>
          ))}
        </div>
      )}
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
