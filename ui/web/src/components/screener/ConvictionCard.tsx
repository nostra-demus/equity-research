import type { BoardConviction, BookMomentum, TrajectoryEnum } from '../../lib/types'

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
