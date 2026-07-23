// Pipeline diagnostics — the full, honest end-to-end view of the news/triage scanner, so a defer / cooldown
// / backlog state is never a surprise. It answers, in one place: which tier is scoring right now, how much of
// each tier's budget is spent, which tiers are cooling down (and for how long), how deep the deferred backlog
// is against its loss boundary, and — the piece that used to be hidden — exactly WHY anything is waiting,
// including the Haiku last-resort's state. Read-only. Same right-slide-in family as the Data Pipeline panel;
// live-tick-safe (polled + refreshed on every cycle, so it is mounted WITHOUT <AnimatePresence> in App.tsx —
// a live re-render can freeze a framer exit mid-slide). All colour comes from tokens; motion is
// transform/opacity only, <300ms, and stilled under reduced-motion.

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../lib/store'
import type { DeferReason, LastResortState, NewsDiagnostics, TierDiagnostics, TierHealth } from '../../lib/types'
import { tierMeter } from './pipelineMeter'
import './PipelineDiagnostics.css'

/** A short, human duration for a cooldown countdown. Minute granularity above 90s (calm, not frantic). */
function fmtDur(ms: number): string {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 90) return `${s}s`
  const m = Math.round(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  return `${h}h ${m % 60}m`
}

/** Plain time-UNTIL a future instant. The scheduler keeps nextCycleAt ahead of now, so this is the correct
 *  direction; a past-clamping ago() would always read "just now"/"imminently" here (the bug this replaces). */
function until(iso: string | null): string {
  if (!iso) return ''
  const ms = Date.parse(iso) - Date.now()
  if (!Number.isFinite(ms)) return ''
  if (ms <= 20_000) return 'imminently'
  const m = Math.round(ms / 60_000)
  return m < 1 ? 'in under a minute' : m < 60 ? `in ~${m}m` : `in ~${Math.round(m / 60)}h`
}

const HEALTH: Record<TierHealth, { label: string; tone: string }> = {
  healthy: { label: 'Healthy', tone: 'live' },
  paced: { label: 'Pacing', tone: 'warn' },
  cooling: { label: 'Cooling down', tone: 'bad' },
  'budget-spent': { label: 'Daily cap reached', tone: 'muted' },
  disabled: { label: 'Off', tone: 'off' },
}

const ROLE_LABEL: Record<TierDiagnostics['role'], string> = {
  primary: 'primary',
  overflow: 'free overflow',
  gemini: 'free overflow',
  'last-resort': 'paid last resort',
}

const DEFER_WHY: Record<DeferReason, string> = {
  aborted: 'the last look hit its time guard and dumped the rest to the backlog',
  'free-budget-spent': 'every free tier reached its daily cap',
  'groq-cooldown': 'Groq is in a failure cooldown',
  paced: 'the daily budget is being spread evenly across the day (not stuck — just paced)',
  'batch-failed': 'a scoring call errored — a transient hiccup, retried next look',
}

const LAST_RESORT_WHY: Record<LastResortState, string> = {
  off: 'the Haiku last-resort is off',
  scored: 'the Haiku last-resort is scoring the overflow',
  'usd-cap': 'the Haiku last-resort hit its daily $ ceiling',
  'plan-quota': 'the Haiku last-resort is paused — the Claude plan quota is spent, waiting for it to reset',
  cooling: 'the Haiku last-resort is backing off after an error',
  available: 'the Haiku last-resort is ready (it was not needed)',
}

function TierRow({ tier, coolLeftMs }: { tier: TierDiagnostics; coolLeftMs: number }) {
  const c = `var(${tier.color})`
  const meter = tierMeter(tier)
  const health = HEALTH[tier.health]
  const cooling = coolLeftMs > 0
  return (
    <div className="diagtier" data-health={tier.health} style={{ borderLeftColor: c }}>
      <div className="diagtier__top">
        <span className="diagtier__dot" data-tone={health.tone} aria-hidden />
        <span className="diagtier__label" style={{ color: tier.enabled ? c : 'var(--text-faint)' }}>{tier.label}</span>
        <span className="diagtier__role">{ROLE_LABEL[tier.role]}</span>
        <span className="diagtier__health" data-tone={health.tone}>
          {cooling ? `Cooling · back in ~${fmtDur(coolLeftMs)}` : health.label}
        </span>
      </div>
      <div className="diagtier__meter">
        <span className="diagtier__bar" aria-hidden>
          <span className="diagtier__fill" style={{ transform: `scaleX(${meter.frac})`, background: c }} />
        </span>
        <span className="diagtier__val mono">{tier.enabled ? meter.label : 'disabled'}</span>
        {typeof tier.lastCycleRequests === 'number' && tier.lastCycleRequests > 0 && (
          <span className="diagtier__last" title="batches this tier scored in the most recent look">· {tier.lastCycleRequests} this look</span>
        )}
        {typeof tier.fails === 'number' && tier.fails > 0 && (
          <span className="diagtier__fails" title="consecutive failures driving the current backoff">{tier.fails} fail{tier.fails === 1 ? '' : 's'}</span>
        )}
      </div>
    </div>
  )
}

function BacklogGauge({ b }: { b: NewsDiagnostics['backlog'] }) {
  const frac = b.cap > 0 ? Math.min(1, b.count / b.cap) : 0
  const trend = b.trend === 'growing' ? '↑ growing' : b.trend === 'shrinking' ? '↓ shrinking' : b.trend === 'flat' ? '→ steady' : ''
  return (
    <div className={`diagbacklog${b.nearLimit ? ' is-near' : ''}`}>
      <div className="diagbacklog__top">
        <span className="diagbacklog__count mono">{b.count.toLocaleString()}</span>
        <span className="diagbacklog__of">waiting · {b.cap.toLocaleString()} cap</span>
        {trend && <span className="diagbacklog__trend" data-dir={b.trend ?? 'flat'}>{trend}</span>}
      </div>
      <span className="diagbacklog__bar" aria-hidden><span className="diagbacklog__fill" style={{ transform: `scaleX(${frac})` }} /></span>
      <div className="diagbacklog__note">
        {b.nearLimit
          ? `Near the loss boundary (${b.pctOfCap}% of ${b.cap.toLocaleString()}) — past the cap the tail is dropped, not deferred.`
          : b.count === 0
            ? 'Caught up — nothing waiting to be scored.'
            : `Held safely for the next look (${b.pctOfCap}% of the ${b.cap.toLocaleString()} loss boundary). Deferred, not dropped.`}
      </div>
      {/* PERSISTENT loss alert: real items dropped past the cap SO FAR TODAY. Keyed on the cumulative daily
          count, not this cycle's backlog — so a later caught-up cycle can't erase the fact that data was lost
          earlier today (the server sums it across cycles; this stops it vanishing when lastCycle rolls over). */}
      {b.lostToday > 0 && (
        <div className="diagbacklog__lost" role="alert">
          {b.lostToday.toLocaleString()} item{b.lostToday === 1 ? '' : 's'} lost today — dropped past the {b.cap.toLocaleString()} cap, not deferred; gone once the source window ages out.
        </div>
      )}
    </div>
  )
}

export function PipelineDiagnostics() {
  const close = useStore((s) => s.closeDiagnostics)
  const diag = useStore((s) => s.newsDiagnostics)
  const refresh = useStore((s) => s.refreshDiagnostics)
  const [booted, setBooted] = useState(false)

  // panel-local poll (guarded, cleared on unmount) — belt-and-braces over the per-cycle SSE refresh
  useEffect(() => {
    let mounted = true
    void refresh().finally(() => { if (mounted) setBooted(true) })
    const t = setInterval(() => { if (mounted) void refresh() }, 10_000)
    return () => { mounted = false; clearInterval(t) }
  }, [refresh])

  // Escape to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close])

  // Live cooldown countdown WITHOUT mixing server + client clocks (the bug that made every tier read
  // "cooling"): "cooling" is decided purely by the server's snapshot (cooldownRemainingMs — a healthy tier
  // is 0/absent and can never count as cooling), and we only DECREMENT it locally by how long we've held
  // this snapshot (client elapsed since the diag was fetched). A value change, not motion — fine under
  // reduced-motion.
  const hasCountdown = !!diag?.tiers.some((t) => (t.cooldownRemainingMs ?? 0) > 0)
  const [nowTs, setNowTs] = useState(() => Date.now())
  const [fetchedAt, setFetchedAt] = useState(() => Date.now())
  useEffect(() => { setFetchedAt(Date.now()); setNowTs(Date.now()) }, [diag?.ts])
  useEffect(() => {
    if (!hasCountdown) return
    const t = setInterval(() => setNowTs(Date.now()), 1000)
    return () => clearInterval(t)
  }, [hasCountdown])
  const coolLeft = (t: TierDiagnostics): number => {
    const snap = t.cooldownRemainingMs ?? 0
    return snap > 0 ? Math.max(0, snap - (nowTs - fetchedAt)) : 0
  }

  const statusLine = useMemo(() => {
    if (!diag) return ''
    if (diag.readOnly) return 'Read-only — another engine owns the scanner for this data dir'
    if (!diag.enabled) return 'Scanner is off'
    if (diag.running) return 'Looking now…'
    return diag.nextCycleAt ? `Next look ${until(diag.nextCycleAt)}` : 'Idle'
  }, [diag])

  const lc = diag?.lastCycle

  return (
    <motion.div className="diag" initial={{ x: '100%' }} animate={{ x: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="diag__head">
        <div style={{ minWidth: 0 }}>
          <div className="diag__title">Pipeline diagnostics</div>
          <div className="diag__sub">Every scanner tier, the backlog, and exactly why anything is waiting — end to end, no surprises.</div>
        </div>
        <div className="diag__tools">
          <button className="btn btn--ghost diag__mini" onClick={() => void refresh()} title="Refresh">↻</button>
          <button className="btn btn--ghost diag__mini" onClick={close}>Close ✕</button>
        </div>
      </div>

      {!booted && !diag ? (
        <div className="diag__body">
          <div className="diag__sec"><div className="diag__sechead">Loading the pipeline…</div>
            {[0, 1, 2, 3].map((i) => <div key={i} className="diag__skel" style={{ animationDelay: `${i * 45}ms` }} />)}
          </div>
        </div>
      ) : !diag ? (
        <div className="diag__body">
          <div className="diag__empty">Couldn't reach the scanner. <button className="btn btn--ghost diag__mini" onClick={() => void refresh()}>Retry</button></div>
        </div>
      ) : (
        <div className="diag__body">
          {/* status strip */}
          <div className="diag__strip">
            <span className={`diag__pulse${diag.running ? ' is-on' : ''}`} aria-hidden />
            <span className="diag__stripline">{statusLine}</span>
            {diag.today.cycles > 0 && (
              <span className="diag__today mono">read {diag.today.read.toLocaleString()} · kept {(diag.today.kept).toLocaleString()} · dropped {diag.today.dropped.toLocaleString()}</span>
            )}
          </div>

          {/* the honest "why is anything waiting" surface — the whole point */}
          {diag.defer.active && (
            <section className="diag__sec">
              <div className={`diagwhy${diag.backlog.nearLimit ? ' is-alert' : ''}`}>
                <div className="diagwhy__head">
                  <span aria-hidden>⚠</span>
                  <span>{diag.backlog.count.toLocaleString()} item{diag.backlog.count === 1 ? '' : 's'} waiting — here's why</span>
                </div>
                <ul className="diagwhy__list">
                  {diag.defer.reason && <li>{DEFER_WHY[diag.defer.reason]}</li>}
                  {diag.defer.lastResort && diag.defer.lastResort !== 'scored' && diag.defer.lastResort !== 'available' && (
                    <li>{LAST_RESORT_WHY[diag.defer.lastResort]}</li>
                  )}
                  {diag.defer.blockingTiers.length > 0 && (
                    <li>tapped out right now: {diag.defer.blockingTiers.join(', ')}</li>
                  )}
                </ul>
                {diag.defer.plainNote && <div className="diagwhy__note">{diag.defer.plainNote}</div>}
              </div>
            </section>
          )}

          {/* backlog gauge — depth vs the loss boundary */}
          <section className="diag__sec">
            <div className="diag__sechead">Deferred backlog</div>
            <BacklogGauge b={diag.backlog} />
          </section>

          {/* the fallback ladder — Groq → overflow → Gemini → Haiku */}
          <section className="diag__sec">
            <div className="diag__sechead">Scoring tiers <span className="diag__count">{diag.tiers.length}</span></div>
            <div className="diag__tiers">
              {diag.tiers.map((t) => <TierRow key={t.id} tier={t} coolLeftMs={coolLeft(t)} />)}
            </div>
            {diag.tiers.length === 0 && <div className="diag__hint">No scoring tiers configured — set a GROQ_API_KEY to turn the scanner on.</div>}
          </section>

          {/* last look — the flow */}
          {lc && (
            <section className="diag__sec">
              <div className="diag__sechead">Last look <span className="diag__count">{lc.phase === 'drain' ? 'backlog drain' : 'fetch'}{lc.aborted ? ' · timed out' : ''}</span></div>
              <div className="diagflow">
                <span className="diagflow__step"><b className="mono">{lc.fetched.toLocaleString()}</b> read</span>
                <span className="diagflow__arrow" aria-hidden>→</span>
                <span className="diagflow__step">
                  <b className="mono">{lc.candidates.toLocaleString()}</b> to score
                  {lc.fresh !== null && lc.carryover !== null && <span className="diagflow__split"> ({lc.fresh} new + {lc.carryover} carried)</span>}
                </span>
                <span className="diagflow__arrow" aria-hidden>→</span>
                <span className="diagflow__step"><b className="mono diagflow__kept">{(lc.picked + lc.watched).toLocaleString()}</b> kept · <b className="mono">{lc.dropped.toLocaleString()}</b> dropped</span>
                {lc.deferred !== null && lc.deferred > 0 && (
                  <><span className="diagflow__arrow" aria-hidden>→</span><span className="diagflow__step diagflow__deferred"><b className="mono">{lc.deferred.toLocaleString()}</b> deferred</span></>
                )}
              </div>
              {lc.scoredBy.length > 0 && (
                <div className="diagflow__by">
                  scored by {lc.scoredBy.map((s, i) => <span key={s.id}>{i > 0 ? ' · ' : ''}<b>{s.label}</b> {s.requests}</span>)}
                  {typeof lc.anthropicCostUsd === 'number' && lc.anthropicCostUsd > 0 && <span className="diagflow__cost"> · Haiku ${lc.anthropicCostUsd.toFixed(3)}</span>}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </motion.div>
  )
}
