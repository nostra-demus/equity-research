// Pipeline diagnostics — the full, honest end-to-end view of the news/triage scanner, so a defer / cooldown
// / backlog state is never a surprise. It answers, in one place: which tier is scoring right now, how much of
// each tier's engine allowance has been used, which tiers are held after errors (and for how long), how deep the deferred backlog
// is against its active work window, and — the piece that used to be hidden — exactly WHY anything is waiting,
// including the Haiku last-resort's state. Read-only. Same right-slide-in family as the Data Pipeline panel;
// live-tick-safe (polled + refreshed on every cycle, so it is mounted WITHOUT <AnimatePresence> in App.tsx —
// a live re-render can freeze a framer exit mid-slide). All colour comes from tokens; motion is
// transform/opacity only, <300ms, and stilled under reduced-motion.

import { useEffect, useId, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../lib/store'
import type { DeferReason, LastResortState, NewsDiagnostics, TierDiagnostics, TierHealth } from '../../lib/types'
import { tierMeter } from './pipelineMeter'
import { diagnosticDeferReasons, fmtFailingFor, lastCycleArrivalCopy, pipelineFlowPresentation, tierStatusCopy, todayOutcomeCopy } from './pipelineDiagnosticsView'
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
  aborted: 'the last check ran out of time; the rest were saved for another check',
  'usage-ledger-unavailable': "this app can't read one or more provider usage files, so it paused safely",
  'free-budget-spent': "this app's set daily limits could not fit another group",
  'provider-day-limit': "one or more providers said today's limit is used, and no backup could take the work",
  'provider-retry-held': 'one or more providers are waiting to try again after an error',
  'groq-cooldown': 'Groq is waiting to try again after an error',
  'allowance-paced': 'some use is saved for later today',
  paced: 'some use is saved for later today',
  'feed-cap': "today's durable news-feed capacity is full; queued work will retry after the UTC day rolls over",
  'feed-write-failed': 'this app could not access or update the durable news feed; queued work remains for another try',
  'inbox-withheld': 'kept work is waiting because its durable inbox clock could not be proved',
  'storage-emergency': 'the scanner could not prove that every retry row reached durable storage; operator attention is required now',
  'no-scoring-provider': 'no scoring provider is configured; already-scored recovery can finish, but unscored work remains queued',
  'batch-failed': 'a provider call failed; this work was saved for another try',
}

function deferWhy(reason: string): string {
  return DEFER_WHY[reason as DeferReason] || 'the last look could not complete the remaining work; the details below show the current blockers'
}

const LAST_RESORT_WHY: Record<LastResortState, string> = {
  off: 'the paid Haiku backup is off',
  unavailable: "this app can't read the paid Haiku backup's usage",
  scored: 'the paid Haiku backup is scoring the waiting work',
  'usd-cap': "this app's daily Haiku dollar limit is used",
  'plan-quota': 'the Claude plan limit is used; Haiku is waiting for it to reset',
  'auth-expired': "the Claude sign-in has expired. Run `claude login` on the engine host.",
  cooling: 'the paid Haiku backup is waiting to try again after an error',
  available: 'the paid Haiku backup is ready to try',
}

/** Look up the reason text, tolerating a state this bundle has never heard of. A NEWER engine can stream a
 *  last_resort value an OLDER bundle predates (the ~20-30s deploy-skew window), and a bare Record lookup
 *  would then render `undefined` — a blank where the explanation belongs. Fall back to saying plainly that
 *  the tier is held, rather than showing nothing. */
function lastResortWhy(state: LastResortState): string {
  return LAST_RESORT_WHY[state] || 'the paid Haiku backup is not scoring right now'
}

function TierRow({ tier, coolLeftMs }: { tier: TierDiagnostics; coolLeftMs: number }) {
  const c = `var(${tier.color})`
  const meter = tierMeter(tier)
  const tone = tier.spendingAllowed === false ? 'off' : HEALTH_TONE[tier.health]
  const status = tierStatusCopy(tier, coolLeftMs)
  const consecutive = tier.consecutiveFailures ?? tier.fails
  const retryScope = tier.retryScope === 'triage' ? 'This hold applies only to triage work.' : tier.retryScope === 'shared' ? 'This provider-wide hold applies to every workload.' : ''
  const nextAt = tier.nextEligibleAt && Number.isFinite(Date.parse(tier.nextEligibleAt))
    ? `Next eligible at ${new Date(tier.nextEligibleAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    : ''
  const statusTitle = [status, retryScope, nextAt].filter(Boolean).join(' ')
  return (
    <div className="diagtier" data-health={tier.health} style={{ borderLeftColor: c }}>
      <div className="diagtier__top">
        <span className="diagtier__dot" data-tone={tone} aria-hidden />
        <span className="diagtier__label" style={{ color: tier.enabled && tier.spendingAllowed !== false ? c : 'var(--text-faint)' }}>{tier.label}</span>
        <span className="diagtier__health" data-tone={tone} title={statusTitle}>
          {status}
        </span>
      </div>
      <div className="diagtier__meter">
        <span className="diagtier__role">{tier.id === 'local' ? `${ROLE_LABEL[tier.role]} · no daily limit` : ROLE_LABEL[tier.role]}</span>
        {/* an unlimited tier (local primary brain) has no cap to meter — show "∞ no cap" instead of a bar */}
        {meter.frac === -2 ? (
          <span className="diagtier__unlimited" title="The durable usage record needs attention">—</span>
        ) : meter.frac < 0 ? (
          <span className="diagtier__unlimited" style={{ color: c }} title="unlimited — no daily cap, processes 24×7">∞ no cap</span>
        ) : (
          <span className="diagtier__bar" aria-hidden>
            <span className="diagtier__fill" style={{ transform: `scaleX(${meter.frac})`, background: c }} />
          </span>
        )}
        <span className="diagtier__val mono">{tier.enabled ? meter.label : 'disabled'}</span>
        {typeof tier.lastCycleRequests === 'number' && tier.lastCycleRequests > 0 && (
          <span className="diagtier__last" title="batches this tier scored in the most recent look">· {tier.lastCycleRequests} this look</span>
        )}
      </div>
      {(typeof tier.triageAttemptsToday === 'number' || (typeof tier.failuresToday === 'number' && tier.failuresToday > 0) || (typeof consecutive === 'number' && consecutive > 0)) && (
        <div className="diagtier__stats">
          {typeof tier.triageAttemptsToday === 'number' && (
            <span className="diagtier__work" title="Actual provider calls made by triage today, including in-call retries">{typeof tier.triageScoredBatchesToday === 'number' ? `${tier.triageScoredBatchesToday} batches scored · ${tier.triageAttemptsToday} calls today` : `${tier.triageAttemptsToday} triage calls today`}</span>
          )}
          {typeof tier.failuresToday === 'number' && tier.failuresToday > 0 && (
            <span className="diagtier__fails" title="Failed provider attempts recorded today">{tier.failuresToday} failed today</span>
          )}
          {typeof consecutive === 'number' && consecutive > 0 && (
            <span className="diagtier__fails" title="Consecutive failures in the current streak; not a daily total">{consecutive} consecutive</span>
          )}
        </div>
      )}
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
  const retiredAlert = retired > 0 ? (
    <div className="diagbacklog__lost" role="alert">
      {dailyLossTotalsLowerBound ? 'At least ' : ''}{retired.toLocaleString()} item{retired === 1 ? '' : 's'} retired today — waited longer than the backlog’s age bound, so they were never scored. The scanner is behind, not the sources.
    </div>
  ) : null
  const lossProofAlert = dailyLossTotalsUnverified ? (
    <div className="diagbacklog__lost" role="alert">
      {dailyLossTotalsLowerBound
        ? 'Daily loss totals are incomplete — known lost and retired counts are lower bounds.'
        : 'Daily loss totals are not fully verified by this report.'}
    </div>
  ) : null
  if (b.unavailable) {
    return (
      <div className="diagbacklog is-unavailable" role="status">
        <div className="diagbacklog__top">
          <span className="diagbacklog__count mono">—</span>
          <span className="diagbacklog__of">waiting list</span>
        </div>
        <div className="diagbacklog__note">Can’t read the saved waiting list. Needs attention.</div>
        {b.lostToday > 0 && (
          <div className="diagbacklog__lost" role="alert">
            {dailyLossTotalsLowerBound ? 'At least ' : ''}{b.lostToday.toLocaleString()} item{b.lostToday === 1 ? '' : 's'} lost today.
          </div>
        )}
        {retiredAlert}
        {lossProofAlert}
      </div>
    )
  }
  const frac = b.cap > 0 ? Math.min(1, b.count / b.cap) : 0
  const trend = b.trend === 'growing' ? '↑ growing' : b.trend === 'shrinking' ? '↓ shrinking' : b.trend === 'flat' ? '→ steady' : ''
  return (
    <div className={`diagbacklog${b.nearLimit ? ' is-near' : ''}`}>
      <div className="diagbacklog__top">
        <span className="diagbacklog__count mono">{b.count.toLocaleString()}</span>
        <span className="diagbacklog__of">waiting · {b.cap.toLocaleString()} active window</span>
        {trend && <span className="diagbacklog__trend" data-dir={b.trend ?? 'flat'}>{trend}</span>}
      </div>
      <span className="diagbacklog__bar" aria-hidden><span className="diagbacklog__fill" style={{ transform: `scaleX(${frac})` }} /></span>
      <div className="diagbacklog__note">
        {storageEmergency
          ? 'Queue depth is not complete — at least one recent retry row could not be proved in durable storage.'
          : b.nearLimit
          ? `The ${b.cap.toLocaleString()}-item active work window is near or at capacity (${b.pctOfCap}%). Excess rows stay in durable overflow and replay later.`
          : b.count === 0
            ? 'Caught up — nothing waiting to be scored.'
            : `Held safely for the next look (${b.pctOfCap}% of the ${b.cap.toLocaleString()}-item active work window).`}
      </div>
      {/* PERSISTENT legacy loss alert: rolling-deploy summaries may still report rows dropped by the old
          cap-slicing worker. Keyed on the cumulative daily count so later recovery cannot hide prior loss. */}
      {b.lostToday > 0 && (
        <div className="diagbacklog__lost" role="alert">
          {dailyLossTotalsLowerBound ? 'At least ' : ''}{b.lostToday.toLocaleString()} item{b.lostToday === 1 ? '' : 's'} lost today — dropped past the {b.cap.toLocaleString()} cap, not deferred; gone once the source window ages out.
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
  const inflowDescriptionId = useId()
  const scanningDescriptionId = useId()

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
    if (diag.readOnly) return 'Read-only — another engine owns the scanner for this data dir'
    if (!diag.enabled) return 'Scanner is off'
    if (diag.running) return 'Looking now…'
    return diag.nextCycleAt ? `Next look ${until(diag.nextCycleAt)}` : 'Idle'
  }, [diag])

  const lc = diag?.lastCycle
  const lastCycleArrival = lc ? lastCycleArrivalCopy(lc) : null
  const flowView = pipelineFlowPresentation(diag?.flow, diag?.ts, nowTs)
  const todayCopy = diag ? todayOutcomeCopy(diag.today, diag.flow?.history?.gapMarkerUnreadable === true) : null
  const deferReasons = diag ? diagnosticDeferReasons(diag.defer) : []
  const storageEmergency = deferReasons.includes('storage-emergency')
  // Tiers the provider is refusing the key for. Read off the per-tier flag rather than the defer group so this
  // still renders against an engine that has the flag but not yet the group (rolling deploy).
  const credentialBlocked = (diag?.tiers || []).filter((t) => t.enabled && t.spendingAllowed !== false && t.credentialRejected === true)
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
            {todayCopy && <span className="diag__today mono">{todayCopy}</span>}
          </div>

          {/* Like-for-like queue flow at the top: genuinely new triage items in, scored queue outcomes out.
              The fixed 60-minute denominator prevents a quiet minute from looking artificially fast. */}
          <section className="diagrate" data-tone={flowView.tone} aria-label="Trailing pipeline flow rates">
            <div className="diagrate__metrics">
              <div className="diagrate__metric" aria-describedby={inflowDescriptionId}>
                <span className="diagrate__label">Average data inflow / second</span>
                <span className="diagrate__reading"><b className="mono">{flowView.inflowRate}</b><span>items/s</span></span>
                <span className="diagrate__definition" id={inflowDescriptionId}>Unique new queue arrivals. Redelivery and carried backlog are excluded.</span>
              </div>
              <div className="diagrate__metric" aria-describedby={scanningDescriptionId}>
                <span className="diagrate__label">Average data scanning / second</span>
                <span className="diagrate__reading"><b className="mono">{flowView.scanningRate}</b><span>items/s</span></span>
                <span className="diagrate__definition" id={scanningDescriptionId}>Durably saved pick, watch, or drop outcomes. Age-based retirement and legacy loss are excluded.</span>
              </div>
            </div>
            <div className="diagrate__rule"><span>Scanning must stay</span><b aria-label="greater than">&gt;</b><span>inflow</span></div>
            <div className="diagrate__gap" role="status">
              <span>Queue-pressure / capacity gap</span>
              <strong>{flowView.gapCopy}</strong>
            </div>
            <div className="diagrate__coverage">{flowView.coverageCopy}</div>
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
                  <span>{credentialBlocked.map((t) => t.label).join(', ')}: key rejected</span>
                </div>
                <ul className="diagwhy__list">
                  {credentialBlocked.map((t) => (
                    <li key={t.id}>
                      {t.label} — the provider is refusing this key{t.failingForMs != null ? `, failing for ${fmtFailingFor(t.failingForMs)}` : ''}
                      {t.triageScoredBatchesToday === 0 ? ' with nothing scored today' : ''}.
                      {t.keyEnvVar ? ` Check ${t.keyEnvVar} on the engine host.` : ' Check its API key on the engine host.'}
                    </li>
                  ))}
                </ul>
                <div className="diagwhy__foot">Retrying cannot fix this — the countdown beside each one is only when the engine will next check.</div>
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
                    ? 'Retry queue durability needs attention'
                    : `${diag.backlog.count.toLocaleString()} item${diag.backlog.count === 1 ? '' : 's'} waiting`}</span>
                </div>
                <ul className="diagwhy__list">
                  {deferReasons.map((reason) => <li key={reason}>{deferWhy(reason)}</li>)}
                  {diag.defer.plainNote && <li>Latest look: {diag.defer.plainNote}</li>}
                  {diag.defer.lastResort && diag.defer.lastResort !== 'scored' && diag.defer.lastResort !== 'available' && (
                    <li>{lastResortWhy(diag.defer.lastResort)}</li>
                  )}
                </ul>
                <div className="diagwhy__foot">See each provider below.</div>
              </div>
            </section>
          )}

      {/* backlog gauge — durable retry depth vs the active work window */}
          <section className="diag__sec">
            <div className="diag__sechead">Items waiting</div>
            <BacklogGauge
              b={diag.backlog}
              dailyLossTotalsLowerBound={diag.today.totalsLowerBound === true && diag.today.durablyCommitted === true}
              dailyLossTotalsUnverified={diag.today.totalsLowerBound !== false || diag.today.durablyCommitted !== true}
              storageEmergency={storageEmergency}
            />
          </section>

          {/* the fallback ladder — Groq → overflow → Gemini → Haiku */}
          <section className="diag__sec">
            <div className="diag__sechead">Providers <span className="diag__count">{diag.tiers.length}</span></div>
            <div className="diag__tiers">
              {diag.tiers.map((t) => <TierRow key={t.id} tier={t} coolLeftMs={coolLeft(t)} />)}
            </div>
            <div className="diag__hint">These bars show how much this app has used. They are not live limits from the provider.</div>
            {diag.tiers.length === 0 && <div className="diag__hint">No scoring tiers configured — configure any supported local or cloud provider to turn the scanner on.</div>}
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
                  {lastCycleArrival && <span className="diagflow__split"> ({lastCycleArrival})</span>}
                </span>
                <span className="diagflow__arrow" aria-hidden>→</span>
                <span className="diagflow__step">
                  {lc.durablyCommitted === true ? <>
                    <b className="mono diagflow__kept">{(lc.picked + lc.watched).toLocaleString()}</b> inbox-eligible · <b className="mono">{lc.dropped.toLocaleString()}</b> dropped
                  </> : <>
                    legacy report: <b className="mono diagflow__kept">{(lc.picked + lc.watched).toLocaleString()}</b> inbox-eligible · <b className="mono">{lc.dropped.toLocaleString()}</b> dropped · feed durability unverified
                  </>}
                </span>
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
