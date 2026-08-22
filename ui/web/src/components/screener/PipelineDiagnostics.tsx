// Pipeline diagnostics — the full, honest end-to-end view of the news/triage scanner, so a defer / cooldown
// / backlog state is never a surprise. It answers, in one place: which tier is scoring right now, how much of
// each tier's engine allowance has been used, which tiers are held after errors (and for how long), how deep the deferred backlog
// is against its active work window, and — the piece that used to be hidden — exactly WHY anything is waiting,
// including the Haiku last-resort's state. Read-only. Same right-slide-in family as the Data Pipeline panel;
// live-tick-safe (polled + refreshed on every cycle, so it is mounted WITHOUT <AnimatePresence> in App.tsx —
// a live re-render can freeze a framer exit mid-slide). All colour comes from tokens; motion is
// transform/opacity only, <300ms, and stilled under reduced-motion.

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../lib/store'
import type { DeferReason, LastResortState, NewsDiagnostics, TierDiagnostics, TierHealth } from '../../lib/types'
import { tierMeter } from './pipelineMeter'
import { diagnosticDeferReasons, fmtFailingFor, lastCycleArrivalCopy, pipelineFlowPresentation, tierStatusCopy, todayOutcomeCopy } from './pipelineDiagnosticsView'
import { PipelineTrendView } from './PipelineTrend'
import './PipelineDiagnostics.css'

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

const HEALTH_TONE: Record<TierHealth, string> = {
  healthy: 'live',
  paced: 'warn',
  cooling: 'bad',
  'budget-spent': 'muted',
  unavailable: 'bad',
  disabled: 'off',
}

const ROLE_LABEL: Record<TierDiagnostics['role'], string> = {
  primary: 'first choice',
  overflow: 'free backup',
  gemini: 'free backup',
  'last-resort': 'paid backup',
}

const DEFER_WHY: Record<DeferReason, string> = {
  aborted: 'The last check ran out of time. The rest were saved for another try.',
  'usage-ledger-unavailable': "The app can’t check how much of today’s service limits have been used, so it paused to avoid overspending.",
  'free-budget-spent': 'The app has used its free amount for today.',
  'provider-day-limit': 'A checking service has reached its daily limit, and no backup can take the work.',
  'provider-retry-held': 'A checking service failed and is waiting to try again.',
  'groq-cooldown': 'Groq is waiting to try again after an error',
  'allowance-paced': 'The app is saving some of today’s use for later.',
  paced: 'The app is saving some of today’s use for later.',
  'feed-cap': 'Today’s results file is full. Waiting items will be tried again after midnight UTC.',
  'feed-write-failed': 'The app could not save results. The work remains saved for another try.',
  'inbox-withheld': 'Kept items are waiting because the app could not confirm when they were saved.',
  'storage-emergency': 'The app could not confirm that every waiting item was saved. This needs attention now.',
  'no-scoring-provider': 'No checking service is set up. Items that still need checking will remain waiting.',
  'batch-failed': 'A checking service failed. This work was saved for another try.',
}

function deferWhy(reason: string): string {
  return DEFER_WHY[reason as DeferReason] || 'The last check did not finish. The remaining work was saved for another try.'
}

const LAST_RESORT_WHY: Record<LastResortState, string> = {
  off: 'The paid Haiku backup is off.',
  unavailable: "The app can’t check today’s Haiku use.",
  scored: 'The paid Haiku backup is checking the waiting work.',
  'usd-cap': 'The app has used today’s Haiku spending limit.',
  'plan-quota': 'The Claude plan limit has been used. Haiku is waiting for it to reset.',
  'auth-expired': 'The Claude sign-in has expired. Run `claude auth login` on the scanner computer.',
  cooling: 'The paid Haiku backup failed and is waiting to try again.',
  available: 'The paid Haiku backup is ready.',
}

/** Look up the reason text, tolerating a state this bundle has never heard of. A NEWER engine can stream a
 *  last_resort value an OLDER bundle predates (the ~20-30s deploy-skew window), and a bare Record lookup
 *  would then render `undefined` — a blank where the explanation belongs. Fall back to saying plainly that
 *  the tier is held, rather than showing nothing. */
function lastResortWhy(state: LastResortState): string {
  return LAST_RESORT_WHY[state] || 'The paid Haiku backup is not checking items right now.'
}

function TierRow({ tier, coolLeftMs, routerMode }: { tier: TierDiagnostics; coolLeftMs: number; routerMode?: NonNullable<NewsDiagnostics['router']>['mode'] }) {
  const c = `var(${tier.color})`
  const meter = tierMeter(tier)
  const tone = tier.spendingAllowed === false ? 'off' : HEALTH_TONE[tier.health]
  const status = tierStatusCopy(tier, coolLeftMs)
  const meterLabel = meter.frac === -2
    ? 'usage unknown'
    : meter.frac < 0
      ? `${(tier.requestsToday ?? 0).toLocaleString()} tries today`
      : `${Math.round(meter.frac * 100)}% used today`
  const consecutive = tier.consecutiveFailures ?? tier.fails
  const retryScope = tier.retryScope === 'triage' ? 'Only news checking is paused.' : tier.retryScope === 'shared' ? 'This service is paused for all work.' : ''
  const nextAt = tier.nextEligibleAt && Number.isFinite(Date.parse(tier.nextEligibleAt))
    ? `Next try at ${new Date(tier.nextEligibleAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    : ''
  const statusTitle = [status, retryScope, nextAt].filter(Boolean).join(' ')
  return (
    <div className="diagtier" data-health={tier.health} style={{ borderLeftColor: c }}>
      <div className="diagtier__top">
        <span className="diagtier__dot" data-tone={tone} aria-hidden />
        <span className="diagtier__label" style={{ color: tier.enabled && tier.spendingAllowed !== false ? c : 'var(--text-faint)' }}>{tier.label}</span>
        {tier.routing && <span className="diagtier__rank" title={`Fitness ${tier.routing.fitnessScore.toFixed(1)} from ${tier.routing.sampleSize} audited calls`}>
          {tier.routing.actualRank == null ? 'not ranked' : `#${tier.routing.actualRank}`}
          {routerMode === 'shadow' && tier.routing.shadowRank != null
            ? ` · would rank #${tier.routing.shadowRank}`
            : tier.routing.shadowRank != null && tier.routing.shadowRank !== tier.routing.actualRank
              ? ` · shadow #${tier.routing.shadowRank}`
              : ''}
        </span>}
        <span className="diagtier__health" data-tone={tone} title={statusTitle}>
          {status}
        </span>
      </div>
      <div className="diagtier__meter">
        <span className="diagtier__role">{tier.id === 'local' ? `${ROLE_LABEL[tier.role]} · no daily limit` : ROLE_LABEL[tier.role]}</span>
        {/* an unlimited tier (local primary brain) has no cap to meter — show "∞ no cap" instead of a bar */}
        {meter.frac === -2 ? (
          <span className="diagtier__unlimited" title="The saved usage record needs attention">—</span>
        ) : meter.frac < 0 ? (
          <span className="diagtier__unlimited" style={{ color: c }} title="No daily limit">∞ no daily limit</span>
        ) : (
          <span className="diagtier__bar" aria-hidden>
            <span className="diagtier__fill" style={{ transform: `scaleX(${meter.frac})`, background: c }} />
          </span>
        )}
        <span className="diagtier__val">{tier.enabled ? meterLabel : 'off'}</span>
        {typeof tier.lastCycleRequests === 'number' && tier.lastCycleRequests > 0 && (
          <span className="diagtier__last" title="Groups checked by this service in the latest check">· {tier.lastCycleRequests} last time</span>
        )}
      </div>
      {(typeof tier.triageAttemptsToday === 'number' || (typeof tier.failuresToday === 'number' && tier.failuresToday > 0) || (typeof consecutive === 'number' && consecutive > 0)) && (
        <div className="diagtier__stats">
          {typeof tier.triageAttemptsToday === 'number' && (
            <span className="diagtier__work" title="Tries made by this service today, including retries">{typeof tier.triageScoredBatchesToday === 'number' ? `${tier.triageScoredBatchesToday} groups checked · ${tier.triageAttemptsToday} tries today` : `${tier.triageAttemptsToday} tries today`}</span>
          )}
          {typeof tier.failuresToday === 'number' && tier.failuresToday > 0 && (
            <span className="diagtier__fails" title="Failed tries today">{tier.failuresToday} failed today</span>
          )}
          {typeof consecutive === 'number' && consecutive > 0 && (
            <span className="diagtier__fails" title="Failures in a row">{consecutive} in a row</span>
          )}
        </div>
      )}
      {tier.routing && <div className="diagtier__fitness" title={`Yield ${(tier.routing.components.usableBatchYield * 100).toFixed(1)}%; throughput ${(tier.routing.components.usefulThroughput * 100).toFixed(1)}% of peer; released-capacity urgency ${(tier.routing.components.releasedCapacityUrgency * 100).toFixed(1)}%; failure penalty ${tier.routing.components.failurePenalty}; cost penalty ${tier.routing.components.costPenalty}.`}>
        fitness {tier.routing.fitnessScore.toFixed(1)} · {tier.routing.sampleSize} calls · {tier.routing.eligible ? 'eligible' : tier.routing.eligibilityReason}
      </div>}
    </div>
  )
}

function BacklogGauge({
  b,
  dailyLossTotalsLowerBound,
  dailyLossTotalsUnverified,
  storageEmergency,
}: {
  b: NewsDiagnostics['backlog']
  dailyLossTotalsLowerBound: boolean
  dailyLossTotalsUnverified: boolean
  storageEmergency: boolean
}) {
  // The OTHER real loss, kept separate from the cap: items retired unscored for waiting out the backlog's
  // own age bound. Silence here is what let a 23,000-item wall of stale filings look healthy while it
  // starved live news off the wire — a gauge reading only the cap would have shown 0 throughout.
  // Hoisted ABOVE the unavailable branch because retiredToday is summed from cycle summaries, not read
  // from the deferred file: it survives exactly the failure that branch reports, and an unreadable
  // waiting list is when an operator most needs to know items were being retired.
  const retired = b.retiredToday ?? 0
  const maxAgeHours = b.maxAgeHours ?? 48
  const retiredAlert = retired > 0 ? (
    <div className="diagbacklog__lost" role="alert">
      {dailyLossTotalsLowerBound ? 'At least ' : ''}{retired.toLocaleString()} item{retired === 1 ? '' : 's'} were never scored because they waited more than {maxAgeHours} hours. The scanner fell behind.
    </div>
  ) : null
  const lossProofAlert = dailyLossTotalsUnverified ? (
    <div className="diagbacklog__lost" role="alert">
      {dailyLossTotalsLowerBound
        ? 'The true number of missed items may be higher than shown.'
        : 'Today’s missed-item total could not be fully checked.'}
    </div>
  ) : null
  if (b.unavailable) {
    return (
      <div className="diagbacklog is-unavailable" role="status">
        <div className="diagbacklog__top">
          <span className="diagbacklog__count mono">—</span>
          <span className="diagbacklog__of">items waiting</span>
        </div>
        <div className="diagbacklog__note">The app can’t read the saved waiting list. This needs attention.</div>
        {b.lostToday > 0 && (
          <div className="diagbacklog__lost" role="alert">
            {dailyLossTotalsLowerBound ? 'At least ' : ''}{b.lostToday.toLocaleString()} item{b.lostToday === 1 ? '' : 's'} were missed today.
          </div>
        )}
        {retiredAlert}
        {lossProofAlert}
      </div>
    )
  }
  const frac = b.cap > 0 ? Math.min(1, b.count / b.cap) : 0
  const trend = b.trend === 'growing' ? '↑ getting longer' : b.trend === 'shrinking' ? '↓ getting shorter' : b.trend === 'flat' ? '→ unchanged' : ''
  return (
    <div className={`diagbacklog${b.nearLimit ? ' is-near' : ''}`}>
      <div className="diagbacklog__top">
        <span className="diagbacklog__count mono">{b.count.toLocaleString()}</span>
        <span className="diagbacklog__of">item{b.count === 1 ? '' : 's'} waiting{b.count > 0 ? ` · ${b.cap.toLocaleString()} checked at a time` : ''}</span>
        {trend && <span className="diagbacklog__trend" data-dir={b.trend ?? 'flat'}>{trend}</span>}
      </div>
      <span className="diagbacklog__bar" aria-hidden><span className="diagbacklog__fill" style={{ transform: `scaleX(${frac})` }} /></span>
      <div className="diagbacklog__note">
        {storageEmergency
          ? 'This number may be wrong because the app could not confirm that every waiting item was saved.'
          : b.nearLimit
          ? `Almost full. The app can work through ${b.cap.toLocaleString()} waiting items at a time. Extra items stay saved for later.`
          : b.count === 0
            ? 'All caught up.'
            : 'These items are saved for the next check.'}
      </div>
      <div className="diag__hint">Waiting items expire after {maxAgeHours} hours so old work cannot permanently block newer news. An expired item is still counted as a real miss.</div>
      {/* PERSISTENT legacy loss alert: rolling-deploy summaries may still report rows dropped by the old
          cap-slicing worker. Keyed on the cumulative daily count so later recovery cannot hide prior loss. */}
      {b.lostToday > 0 && (
        <div className="diagbacklog__lost" role="alert">
          {dailyLossTotalsLowerBound ? 'At least ' : ''}{b.lostToday.toLocaleString()} item{b.lostToday === 1 ? '' : 's'} were missed today before they could be checked.
        </div>
      )}
      {retiredAlert}
      {lossProofAlert}
    </div>
  )
}

export function PipelineDiagnostics() {
  const close = useStore((s) => s.closeDiagnostics)
  const diag = useStore((s) => s.newsDiagnostics)
  const refresh = useStore((s) => s.refreshDiagnostics)
  const [booted, setBooted] = useState(false)
  const [trendMode, setTrendMode] = useState(false)

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

  // Live retry countdown WITHOUT mixing server + client clocks (the bug that made every tier read
  // "cooling"): the retry hold is decided purely by the server's snapshot (cooldownRemainingMs — an eligible
  // tier is 0/absent and can never count as held), and we only DECREMENT it locally by how long we've held
  // this snapshot (client elapsed since the diag was fetched). A value change, not motion — fine under
  // reduced-motion.
  const hasCountdown = !!diag?.tiers.some((t) => (t.cooldownRemainingMs ?? 0) > 0)
  const [nowTs, setNowTs] = useState(() => Date.now())
  const [fetchedAt, setFetchedAt] = useState(() => Date.now())
  useEffect(() => { setFetchedAt(Date.now()); setNowTs(Date.now()) }, [diag?.ts])
  useEffect(() => {
    if (!hasCountdown && !diag?.flow) return
    const t = setInterval(() => setNowTs(Date.now()), hasCountdown ? 1000 : 10_000)
    return () => clearInterval(t)
  }, [hasCountdown, diag?.flow])
  const coolLeft = (t: TierDiagnostics): number => {
    const snap = t.cooldownRemainingMs ?? 0
    return snap > 0 ? Math.max(0, snap - (nowTs - fetchedAt)) : 0
  }

  const statusLine = useMemo(() => {
    if (!diag) return ''
    if (diag.readOnly) return 'View only — this copy is not running the scanner'
    if (!diag.enabled) return 'Scanner is off'
    if (diag.running) return 'Checking now…'
    return diag.nextCycleAt ? `Next check ${until(diag.nextCycleAt)}` : 'Waiting for the next check'
  }, [diag])

  const lc = diag?.lastCycle
  const lastCycleArrival = lc ? lastCycleArrivalCopy(lc) : null
  const flowView = pipelineFlowPresentation(diag?.flow, diag?.ts, nowTs)
  const todayCopy = diag ? todayOutcomeCopy(diag.today, diag.flow?.history?.gapMarkerUnreadable === true) : null
  const deferReasons = diag ? diagnosticDeferReasons(diag.defer) : []
  const storageEmergency = deferReasons.includes('storage-emergency')
  const dailyScoringTotalsKnown = diag?.today.totalsLowerBound === false && diag?.today.durablyCommitted === true
  // Tiers the provider is refusing the key for. Read off the per-tier flag rather than the defer group so this
  // still renders against an engine that has the flag but not yet the group (rolling deploy).
  const credentialBlocked = (diag?.tiers || []).filter((t) => t.enabled && t.spendingAllowed !== false && t.credentialRejected === true)
  return (
    <motion.div className={`diag${trendMode ? ' is-trend' : ''}`} initial={{ x: '100%' }} animate={{ x: 0 }} transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
      <div className="diag__head">
        <div style={{ minWidth: 0 }}>
          <div className="diag__title">News scanner</div>
          <div className="diag__sub">Checks incoming news and keeps the useful items. See whether it is working, keeping up, or missing anything.</div>
        </div>
        <div className="diag__tools">
          <button className="btn btn--ghost diag__mini" onClick={() => setTrendMode((value) => !value)}>{trendMode ? 'Live' : 'Trend'}</button>
          <button className="btn btn--ghost diag__mini" onClick={() => void refresh()} title="Refresh">↻</button>
          <button className="btn btn--ghost diag__mini" onClick={close}>Close ✕</button>
        </div>
      </div>

      {!booted && !diag ? (
        <div className="diag__body">
          <div className="diag__sec"><div className="diag__sechead">Loading scanner status…</div>
            {[0, 1, 2, 3].map((i) => <div key={i} className="diag__skel" style={{ animationDelay: `${i * 45}ms` }} />)}
          </div>
        </div>
      ) : !diag ? (
        <div className="diag__body">
          <div className="diag__empty">Couldn't reach the scanner. <button className="btn btn--ghost diag__mini" onClick={() => void refresh()}>Retry</button></div>
        </div>
      ) : trendMode ? (
        <div className="diag__body is-trend"><PipelineTrendView diagnostics={diag} /></div>
      ) : (
        <div className="diag__body">
          <section className="diag__sec">
            <div className="diag__sechead">Is it working?</div>
            <div className="diag__strip">
              <span className={`diag__pulse${diag.enabled && diag.running ? ' is-on' : ''}`} aria-hidden />
              <span className="diag__stripline">{statusLine}</span>
              {todayCopy && <span className="diag__today">Today: {todayCopy}</span>}
            </div>
          </section>

          <section className="diag__sec">
            <div className="diag__sechead">Is it keeping up?</div>
            <div className="diagrate" data-tone={flowView.tone} aria-label="Can the news scanner keep up?">
              <div className="diagrate__metrics">
                <div className="diagrate__metric">
                  <span className="diagrate__label">Average inflow</span>
                  <span className="diagrate__reading"><b>{flowView.inflowRate}</b><span>items/s</span></span>
                </div>
                <div className="diagrate__metric">
                  <span className="diagrate__label">Average scanning</span>
                  <span className="diagrate__reading"><b>{flowView.scanningRate}</b><span>items/s</span></span>
                </div>
              </div>
              <div className="diagrate__gap" role="status">
                <strong>{flowView.gapCopy}</strong>
              </div>
              <div className="diagrate__coverage">{flowView.coverageCopy}</div>
            </div>
          </section>

          {/* A REJECTED CREDENTIAL, ABOVE EVERYTHING ELSE. Every other state on this panel resolves itself
              given time — a quota resets, a rate limit lapses, an outage ends. This one never does, and it is
              the only one that needs a human. It is drawn here, outside `defer.active`, because a dead tier
              does not necessarily make the CYCLE defer: with other providers coping, the panel would look
              healthy while the largest allowance on the roster sat dark. That is exactly what happened. */}
          {credentialBlocked.length > 0 && (
            <section className="diag__sec">
              <div className="diagwhy is-alert" role="alert">
                <div className="diagwhy__head">
                  <span aria-hidden>⚠</span>
                  <span>{credentialBlocked.map((t) => t.label).join(', ')} needs a working key</span>
                </div>
                <ul className="diagwhy__list">
                  {credentialBlocked.map((t) => (
                    <li key={t.id}>
                      {t.label} cannot sign in{t.failingForMs != null ? ` and has failed for ${fmtFailingFor(t.failingForMs)}` : ''}
                      {t.triageScoredBatchesToday === 0 ? ', so it has checked nothing today' : ''}.
                      {t.keyEnvVar ? ` Replace ${t.keyEnvVar} on the scanner computer.` : ' Replace its API key on the scanner computer.'}
                    </li>
                  ))}
                </ul>
                <div className="diagwhy__foot">Waiting will not fix this.</div>
              </div>
            </section>
          )}

          {/* the honest "why is anything waiting" surface — the whole point */}
          {diag.defer.active && (
            <section className="diag__sec">
              <div className={`diagwhy${diag.backlog.nearLimit ? ' is-alert' : ''}`}>
                <div className="diagwhy__head">
                  <span aria-hidden>⚠</span>
                  <span>{storageEmergency
                    ? 'Saved waiting items need attention'
                    : `${diag.backlog.count.toLocaleString()} item${diag.backlog.count === 1 ? '' : 's'} waiting`}</span>
                </div>
                <ul className="diagwhy__list">
                  {deferReasons.map((reason) => <li key={reason}>{deferWhy(reason)}</li>)}
                  {diag.defer.lastResort && diag.defer.lastResort !== 'scored' && diag.defer.lastResort !== 'available' && (
                    <li>{lastResortWhy(diag.defer.lastResort)}</li>
                  )}
                </ul>
                <div className="diagwhy__foot">See each checking service below.</div>
              </div>
            </section>
          )}

          {/* backlog gauge — durable retry depth vs the active work window */}
          <section className="diag__sec">
            <div className="diag__sechead">Is anything waiting or missed?</div>
            <div className="diagwhy" role="status">
              <ul className="diagwhy__list">
                <li><b>{diag.today.newArrivals == null ? '—' : diag.today.newArrivals.toLocaleString()}</b> new items found today{diag.today.newArrivals == null ? ' — older records cannot prove the unique total.' : '.'}</li>
                <li><b>{dailyScoringTotalsKnown ? diag.today.read.toLocaleString() : '—'}</b> items fully scored{dailyScoringTotalsKnown ? '.' : ' — saved cycle records cannot prove the full total.'}</li>
                <li><b>{diag.backlog.unavailable ? '—' : (diag.backlog.unscoredCount ?? diag.backlog.count).toLocaleString()}</b> items currently waiting for a first score{diag.backlog.unavailable ? ' — the saved waiting list could not be read.' : '.'}</li>
                {(diag.backlog.projectionRecoveryCount ?? 0) > 0 && <li><b>{diag.backlog.projectionRecoveryCount!.toLocaleString()}</b> items already scored and waiting to be safely saved.</li>}
                <li><b>{dailyScoringTotalsKnown ? diag.today.dropped.toLocaleString() : '—'}</b> items scored but not sent to the main inbox{dailyScoringTotalsKnown ? '.' : ' — saved cycle records cannot prove the full total.'}</li>
                <li><b>{diag.backlog.lostToday.toLocaleString()}</b> items never scored by older scanner versions because the active waiting list was full.</li>
                <li><b>{(diag.backlog.retiredToday ?? 0).toLocaleString()}</b> items never scored because they waited too long.</li>
              </ul>
            </div>
            <BacklogGauge
              b={diag.backlog}
              dailyLossTotalsLowerBound={diag.today.totalsLowerBound === true && diag.today.durablyCommitted === true}
              dailyLossTotalsUnverified={diag.today.totalsLowerBound !== false || diag.today.durablyCommitted !== true}
              storageEmergency={storageEmergency}
            />
          </section>

          {diag.rescue && (
            <section className="diag__sec">
              <div className="diag__sechead">Second look <span className="diag__count">{diag.rescue.mode === 'shadow' ? 'testing only' : 'off'}</span></div>
              <div className={`diagwhy${diag.rescue.status === 'directory_paused' || diag.rescue.status === 'audit_unavailable' ? ' is-alert' : ''}`} role="status">
                <div className="diagwhy__head"><span aria-hidden>↻</span><span>{diag.rescue.reason}</span></div>
                <ul className="diagwhy__list">
                  {diag.rescue.candidatesFound == null
                    ? <li>{diag.rescue.status === 'warming'
                        ? 'Second-look counts will appear after the first complete history window is built.'
                        : 'Second-look counts are unavailable because the saved second-look record could not be read.'}</li>
                    : <li>{diag.rescue.candidatesFound.toLocaleString()} items looked worth checking again.</li>}
                  {diag.rescue.identityChecks != null && diag.rescue.verified != null && (
                    <li>{diag.rescue.identityChecks.toLocaleString()} of {diag.rescue.dailyCap.toLocaleString()} daily company checks used · {diag.rescue.verified.toLocaleString()} matched to a listed stock.</li>
                  )}
                  {(diag.rescue.identityUnresolved ?? 0) > 0 && <li>{diag.rescue.identityUnresolved!.toLocaleString()} could not be matched to one listed stock.</li>}
                  {(diag.rescue.directoryUnavailable ?? 0) > 0 && <li>{diag.rescue.directoryUnavailable!.toLocaleString()} checks failed because the stock-listing lookup was unavailable.</li>}
                  {(diag.rescue.retryCooling ?? 0) > 0 && <li>{diag.rescue.retryCooling!.toLocaleString()} are waiting 30 minutes before another stock-listing lookup.</li>}
                  {(diag.rescue.retryExhausted ?? 0) > 0 && <li>{diag.rescue.retryExhausted!.toLocaleString()} could not be checked after two temporary listing-service failures.</li>}
                  {(diag.rescue.capacityMisses ?? 0) > 0 && <li>{diag.rescue.capacityMisses!.toLocaleString()} were not reviewed: their daily second-look limit was reached.</li>}
                  {(diag.rescue.queuedForLater ?? 0) > 0 && <li>{diag.rescue.queuedForLater!.toLocaleString()} are waiting for a paced slot later today.</li>}
                  <li>{diag.rescue.articleReads.toLocaleString()} articles read · {diag.rescue.ideasCreated.toLocaleString()} ideas created. Shadow mode keeps both at zero.</li>
                </ul>
                <div className="diagwhy__foot">Not selected does not mean an item was proven wrong. It means it did not pass the evidence and capacity rules used that day.</div>
              </div>
            </section>
          )}

          {/* the fallback ladder — Groq → overflow → Gemini → Haiku */}
          <details className="diagdetails">
            <summary>Checking services <span className="diag__count">{diag.tiers.length}</span></summary>
            <div className="diag__tiers">
              {diag.tiers.map((t) => <TierRow key={t.id} tier={t} coolLeftMs={coolLeft(t)} routerMode={diag.router?.mode} />)}
            </div>
            <div className="diag__hint">The bars show how much of this app’s daily limit has been used.</div>
            {diag.tiers.length === 0 && <div className="diag__hint">No checking service is set up, so the scanner cannot run.</div>}
          </details>

          {/* last look — the flow */}
          {lc && (
            <section className="diag__sec">
              <div className="diag__sechead">Most recent check <span className="diag__count">{lc.phase === 'drain' ? 'waiting items' : 'new items'}{lc.aborted ? ' · ran out of time' : ''}</span></div>
              <div className="diagflow">
                <span className="diagflow__step"><b className="mono">{lc.fetched.toLocaleString()}</b> found</span>
                <span className="diagflow__arrow" aria-hidden>→</span>
                <span className="diagflow__step">
                  <b className="mono">{lc.candidates.toLocaleString()}</b> checked
                  {lastCycleArrival && <span className="diagflow__split"> ({lastCycleArrival})</span>}
                </span>
                <span className="diagflow__arrow" aria-hidden>→</span>
                <span className="diagflow__step">
                  {lc.durablyCommitted === true ? <>
                    <b className="mono diagflow__kept">{(lc.picked + lc.watched).toLocaleString()}</b> kept · <b className="mono">{lc.dropped.toLocaleString()}</b> ignored
                  </> : <>
                    reported: <b className="mono diagflow__kept">{(lc.picked + lc.watched).toLocaleString()}</b> kept · <b className="mono">{lc.dropped.toLocaleString()}</b> ignored · saved results not fully checked
                  </>}
                </span>
                {lc.deferred !== null && lc.deferred > 0 && (
                  <><span className="diagflow__arrow" aria-hidden>→</span><span className="diagflow__step diagflow__deferred"><b className="mono">{lc.deferred.toLocaleString()}</b> saved for later</span></>
                )}
              </div>
              {lc.scoredBy.length > 0 && (
                <div className="diagflow__by">
                  checked using {lc.scoredBy.map((s, i) => <span key={s.id}>{i > 0 ? ' · ' : ''}<b>{s.label}</b> {s.requests}</span>)}
                  {typeof lc.anthropicCostUsd === 'number' && lc.anthropicCostUsd > 0 && <span className="diagflow__cost"> · Haiku cost ${lc.anthropicCostUsd.toFixed(3)}</span>}
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </motion.div>
  )
}
