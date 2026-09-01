import { useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from '../lib/store'
import { fmtCost } from '../lib/format'
import { collectSamples, expectedDurations, expectedFor, fmtClock, fmtEtaLeft, fmtSpan, isOrblessRun, orbClass, orbProgress, scopeTiming, type ScopeOrb } from '../lib/eta'
import { LIVEISH, pendingForScope, runLabel, runsForScope } from '../lib/runScope'
import { Spin } from './Spin'
import { providerLabel } from '../lib/provider'
import type { RunPublicationPhase } from '../lib/types'

const dotColor: Record<string, string> = {
  running: 'var(--accent)',
  done: 'var(--accent)',
  failed: 'var(--bad)',
  queued: 'var(--accent-deep)',
}

const runExecutionLabel = (run: { provider?: 'claude' | 'codex'; profileKey?: string; executionProfile?: { key: string }; model?: string; reasoningLevel?: string }): string =>
  run.provider
    ? `${providerLabel(run.provider)} · ${run.profileKey || run.executionProfile?.key || (run.model ? `${run.model}${run.reasoningLevel ? `:${run.reasoningLevel}` : ''}` : 'profile unknown')}`
    : 'Provider/profile unknown'

// what the system is doing right now, in plain words — from the run's server status
const PHASE_LABEL: Record<string, string> = {
  starting: 'Starting the engine…',
  'readiness-checking': 'Checking the data pool…',
  'awaiting-readiness-decision': 'Paused — waiting for your data-check decision',
}

const PUBLICATION_LABEL: Partial<Record<RunPublicationPhase, string>> = {
  'archive-in-progress': 'Saving supporting records…',
  'archive-sealed': 'Supporting records saved — preparing the final result…',
  'terminal-in-progress': 'Saving and publishing the finished work…',
  'terminal-complete': 'Final work saved — finishing up…',
  'terminal-failed': 'The final save failed — the run will report an error.',
  'parity-attested': 'Final work verified — finishing up…',
}

// A finished run's bar, tinted by HOW it finished — so "full" never reads as "succeeded" on a run that
// errored, was cancelled, or was truncated. Absent = the run is still in flight.
const TERMINAL_TONE: Record<string, string> = {
  done: 'var(--accent)',
  error: 'var(--bad)',
  cancelled: 'var(--bad)',
  incomplete: 'var(--warn, #d8a656)', // truncated: it ran, but not to the end (see RunStatus 'incomplete')
}

// The run is stopped, waiting on the USER (the readiness gate). Live, but nothing is moving — so it must
// neither animate (that would imply work) nor sit blank (that would imply nothing happened).
const PAUSED_TONE = 'var(--warn, #d8a656)'

/** The run's progress bar. It has to answer "where is this run?" even when there is no fraction to draw.
 *
 *  An ORBLESS run — a news scan, or a doc-intake new-data read — has no orbs at all, so `done/total` is
 *  0/0 and the bar sat at zero width for the run's entire life, INCLUDING after it finished: a card reading
 *  "New-data read · done" above a completely empty track, which reads as "nothing happened". The same held
 *  for any run whose transient row stream had been cleared (plannedCount known, rows gone → 0%), and for
 *  the first minute or two of EVERY full run, which sits at "Starting the engine…" / "Checking the data
 *  pool…" before a single orb can report. The meta line above already refuses to print "0/0 orbs" for
 *  exactly this reason; the bar simply never got the same treatment.
 *
 *  A fraction is only worth drawing once it MEANS something — that needs a denominator (an orbless run has
 *  none) AND at least one orb reported against it. Before that the run is not "0% done", it is
 *  not-yet-measurable, which is what the indeterminate state is for. The standard vocabulary:
 *
 *   • live, a real fraction   → determinate fill, as before
 *   • live, nothing to measure → indeterminate sweep, because any number here would be invented
 *   • live, paused on the user → full and STATIC in the paused tone: stopped, not working, not finished
 *   • finished                 → full, in its outcome's colour
 */
function RunProgressBar({ pct, running, status, measurable, reported, waitingOnDecision = false }: { pct: number; running: boolean; status: string; measurable: boolean; reported: boolean; waitingOnDecision?: boolean }) {
  const tone = TERMINAL_TONE[status]
  // Paused at the readiness gate: the run is live but waiting on a human decision. Animating it would
  // claim work that isn't happening — the one live state that must NOT sweep.
  const paused = status === 'awaiting-readiness-decision' || waitingOnDecision
  // Nothing to take a fraction OF (orbless), or nothing has reported against the denominator yet (the
  // pre-spawn gate phases, and the window before the first orb speaks).
  const indeterminate = running && !paused && (!measurable || !reported)
  // Live: the honest fraction where one exists. Finished: a terminal run is never "0% done" — it is over.
  // A clean finish fills. One that ended badly keeps its measured fraction when that says something ("got
  // 7/12 through, then stopped"), and otherwise fills in its own colour, so the bar always states the
  // outcome instead of showing a blank track.
  const scale = running
    ? (paused || !measurable || !reported ? 1 : pct / 100)
    : status !== 'done' && pct > 0 ? pct / 100 : 1
  return (
    <div className={`runbar${running && !paused ? ' runbar--live' : ''}${indeterminate ? ' runbar--indeterminate' : ''}${paused ? ' runbar--paused' : ''}`}>
      <div
        className="runbar__fill"
        style={{ transform: indeterminate ? undefined : `scaleX(${scale})`, background: paused ? PAUSED_TONE : running ? 'var(--accent)' : tone || 'var(--neutral)' }}
      />
    </div>
  )
}

// plain-English gloss for the orchestrator's tool calls (heartbeat lastActivity)
const TOOL_GLOSS: Record<string, string> = {
  Task: 'dispatching an orb',
  Read: 'reading outputs',
  Write: 'writing a file',
  Edit: 'editing a file',
  Bash: 'running pipeline steps',
  Glob: 'scanning the run folder',
  Grep: 'searching outputs',
  WebSearch: 'searching the news',
  WebFetch: 'reading a source',
}

/** NOW — what this subject is running, or just ran. The live half of the Activity dock: one card per run
 *  with its progress bar, heartbeat, Cancel, and the orbs reporting in as they finish.
 *
 *  It used to be its own floating panel beside the stage, which put the SAME information in two places —
 *  this, and the Activity log's table — with two entry points and two mental models. It is now a section of
 *  the dock, so "what's happening" and "what has happened" are one surface read top to bottom. It renders
 *  only its own content: the shell, the header and the close button belong to the dock. */
export function RunNowSection() {
  const activeRuns = useStore((s) => s.activeRuns)
  const runStream = useStore((s) => s.runStream)
  const cancelRun = useStore((s) => s.cancelRun)
  const ticker = useStore((s) => s.selectedTicker)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const nodeRuntime = useStore((s) => s.nodeRuntime)
  const nodesByKey = useStore((s) => s.nodesByKey)
  const now = useStore((s) => s.now) // the shared 1s clock owned by SwarmField; ticks only while orbs run
  const launchPending = useStore((s) => s.launchPending)
  const stoppingRuns = useStore((s) => s.stoppingRuns)
  const pendingAdmissions = useStore((s) => s.pendingAdmissions)
  const cancelPendingAdmission = useStore((s) => s.cancelPendingAdmission)
  const readinessGate = useStore((s) => s.readinessGate)
  const readinessGateQueue = useStore((s) => s.readinessGateQueue)
  const readinessRecovery = useStore((s) => s.readinessRecovery)

  // run-adaptive expected duration per orb class (gate / specialist / synthesis), learned from finished orbs
  const exp = useMemo(() => expectedDurations(collectSamples(nodeRuntime, (k) => { const n = nodesByKey.get(k); return n ? orbClass(n) : 'specialist' })), [nodeRuntime, nodesByKey])

  // the scope's runs + the click→ack window, from the shared helper the dock shell also reads (lib/runScope)
  const runs = runsForScope(activeRuns, activeSwarm, ticker)
  const pendingHere = pendingForScope(launchPending, activeSwarm, ticker)
  const queuedHere = activeSwarm === 'research'
    ? pendingAdmissions.filter((request) => !ticker || request.ticker === ticker)
    : []

  const perRun = runs.map((run) => {
    const rows = runStream.filter((r) => r.runId === run.runId)
    const done = rows.filter((r) => r.status === 'done').length
    const total = run.plannedCount ?? rows.length
    // every in-flight status counts as live — including the pre-spawn gate phases the early-acked
    // launch now surfaces (a gate-parked run must keep its card, its Cancel, and its progress bar)
    const running = run.status === 'running' || run.status === 'starting' || run.status === 'readiness-checking' || run.status === 'awaiting-readiness-decision'
    return { run, rows, done, total, running }
  })
  // Nothing running and nothing just-finished for this subject: the section says so in one quiet line
  // rather than vanishing, so the dock's shape doesn't jump as runs come and go.
  if (!runs.length && runStream.length === 0 && !pendingHere && queuedHere.length === 0) {
    return <div className="adock__idle">Nothing running for this {activeSwarm === 'screener' ? 'signal' : 'company'} right now. Anything you launch appears here as it happens.</div>
  }

  return (
    <>
      <div className="sidepanel__body">
        {queuedHere.map((request) => {
          const state = request.status === 'waiting_for_update'
            ? 'Waiting for update'
            : request.status === 'admitting'
              ? 'Starting after update'
              : 'Needs attention'
          const diff = request.planDifference
          const changed = diff && (diff.addedPayableOrbKeys.length || diff.removedPayableOrbKeys.length)
          return (
            <div key={request.requestId} className="sidepanel__runcard" style={{ borderBottom: '1px solid var(--hairline)', padding: '8px 16px', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="sidepanel__title" style={{ fontSize: 13 }}>{request.action === 'continue' ? 'Complete old run' : 'Full run'} · {request.ticker}</div>
                  <div className="sidepanel__meta">{state} · {providerLabel(request.provider)} · {request.expectedProfileKey || 'profile unknown'}</div>
                </div>
                {(request.status === 'waiting_for_update' || request.status === 'needs_attention') && (
                  <button className="btn btn--danger" style={{ height: 26, padding: '0 9px', fontSize: 12 }} onClick={() => void cancelPendingAdmission(request.requestId)}>Cancel</button>
                )}
              </div>
              <div className="sidepanel__meta" style={{ paddingTop: 5 }}>
                {request.status === 'waiting_for_update'
                  ? 'No paid work has started. This exact request survives refresh and restart.'
                  : request.status === 'admitting'
                    ? 'The update is healthy. Rechecking the exact plan before any paid work starts.'
                    : request.attention || 'Nothing was started automatically. Review this request.'}
              </div>
              {changed ? (
                <div className="sidepanel__meta" style={{ paddingTop: 4 }}>
                  Plan changed after update: {diff!.addedPayableOrbKeys.length} added, {diff!.removedPayableOrbKeys.length} removed. {request.action === 'continue' ? 'It remains Continue, never Full.' : ''}
                </div>
              ) : null}
            </div>
          )
        })}
        {/* click→ack window: the launch was fired and the server hasn't answered yet */}
        {pendingHere && !runs.some((r) => LIVEISH.has(r.status)) && (
          <div className="sidepanel__empty" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Spin /> {launchPending!.label}
          </div>
        )}
        {perRun.map(({ run, rows, done, total, running }) => {
          const pct = total ? Math.min(100, Math.round((done / total) * 100)) : 0
          const elapsedMs = run.startedAt ? now - run.startedAt : 0
          // honest run ETA: progress-projection once an orb has finished; the launch-time range until then
          const runOrbs: ScopeOrb[] = Object.entries(nodeRuntime)
            .filter(([, rt]) => rt.runId === run.runId)
            .map(([k, rt]) => { const n = nodesByKey.get(k); return { startedAt: rt.startedAt, endedAt: rt.endedAt, status: rt.status, cls: n ? orbClass(n) : 'specialist' } })
          const rt = scopeTiming(runOrbs, exp, now)
          const etaLow = run.kind === 'full' ? 20 : Math.max(1, Math.ceil(total * 0.3))
          const etaHigh = run.kind === 'full' ? 40 : Math.max(2, Math.ceil(total * 0.8))
          const etaText = rt.fraction > 0 && rt.etaRemainingMs != null ? fmtEtaLeft(rt.etaRemainingMs) : `~${etaLow}–${etaHigh} min`
          const ownsRun = (gate: NonNullable<typeof readinessGate>) => gate.runId === run.runId
            || gate.memberRunIds?.includes(run.runId)
            || (!!run.chainId && gate.chainId === run.chainId)
          const queuedDecision = readinessGateQueue.some(ownsRun)
          const chainHasDecision = !!run.chainId
            && [readinessGate, ...readinessGateQueue].some((gate) => gate?.chainId === run.chainId)
          const waitingOnSharedDecision = run.status === 'readiness-checking'
            && chainHasDecision
          const recovery = readinessRecovery[run.runId]
          const phaseLabel = recovery?.message
            ?? (queuedDecision
            ? 'Paused — decision safely queued'
            : waitingOnSharedDecision
              ? 'Waiting for the one shared data decision…'
              : PHASE_LABEL[run.status])
          return (
            <div key={run.runId} className="sidepanel__runcard" style={{ borderBottom: '1px solid var(--hairline)', paddingBottom: 8, marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px 4px' }}>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div className="sidepanel__title" style={{ fontSize: 13 }}>{runLabel(run)}</div>
                  <div className="sidepanel__meta">
                    {phaseLabel
                      ? phaseLabel + (running ? ` · ${fmtClock(elapsedMs)}` : '')
                      : isOrblessRun(run.kind)
                        // an orbless run (a sweep, or a doc-intake new-data read) has no orbs — a "0/0 orbs"
                        // line would read as broken. Show the clock (and, once done, the plain status) instead;
                        // the heartbeat line below carries the live detail.
                        ? (running ? `${run.kind === 'doc-intake' ? 'reading' : 'scanning'} · ${fmtClock(elapsedMs)}` : run.status)
                        : `${done}/${total} orbs · ${running ? `${fmtClock(elapsedMs)} · ${etaText}` : run.status}`}
                    {` · ${runExecutionLabel(run)}`}
                  </div>
                </div>
                {run.willCommitToMain && <span className="chip" style={{ color: 'var(--accent-bright)', borderColor: 'var(--accent-deep)' }}>commits main</span>}
                <span className="runfoot__stat">{run.provider === 'codex' ? 'Plan' : fmtCost(run.costUsd)}</span>
                {running && (stoppingRuns[run.runId]
                  ? <button className="btn" style={{ height: 26, padding: '0 9px', fontSize: 12 }} disabled><Spin /> Stopping…</button>
                  : <button className="btn btn--danger" style={{ height: 26, padding: '0 9px', fontSize: 12 }} onClick={() => cancelRun(run.runId)}>Cancel</button>)}
              </div>
              {/* live heartbeat: what the engine is doing + when it last spoke — the anti-"is it stuck?" line */}
              {run.status === 'running' && (run.publicationPhase || run.lastActivity || run.lastStdoutAt) && (() => {
                const quietMs = run.lastStdoutAt ? Math.max(0, now - run.lastStdoutAt) : null
                const stale = quietMs != null && quietMs > 45_000
                const doing = run.lastActivity ? (TOOL_GLOSS[run.lastActivity.tool] || `using ${run.lastActivity.tool}`) : null
                const publishing = run.publicationPhase ? PUBLICATION_LABEL[run.publicationPhase] : null
                const failedPublication = run.publicationPhase === 'terminal-failed'
                return (
                  <div className="sidepanel__meta" style={{ padding: '0 16px 4px', color: failedPublication ? 'var(--bad)' : stale && !publishing ? 'var(--warn, #d8a656)' : 'var(--text-faint)' }}>
                    {publishing
                      ? publishing
                      : stale
                      ? `No new model output for ${fmtClock(quietMs!)}; the engine still reports this run as active.`
                      : `engine active${doing ? ` · ${doing}` : ''}${quietMs != null ? ` · ${quietMs < 3000 ? 'just now' : fmtClock(quietMs) + ' ago'}` : ''}`}
                  </div>
                )
              })()}
              <div style={{ padding: '0 16px 6px' }}>
                <RunProgressBar pct={pct} running={running} status={run.status} measurable={total > 0} reported={rows.length > 0} waitingOnDecision={waitingOnSharedDecision} />
              </div>
              <AnimatePresence initial={false}>
                {rows.map((r) => {
                  const nrt = nodeRuntime[r.key]
                  const dur = nrt?.startedAt && nrt?.endedAt && nrt.endedAt > nrt.startedAt ? fmtSpan(nrt.endedAt - nrt.startedAt) : null
                  const liveElapsed = nrt?.startedAt ? fmtClock(Math.max(0, now - nrt.startedAt)) : null
                  const liveLeft = nrt?.startedAt ? fmtEtaLeft(orbProgress(nrt.startedAt, expectedFor((() => { const n = nodesByKey.get(r.key); return n ? orbClass(n) : 'specialist' })(), exp), now).remainingMs) : null
                  return (
                    <motion.div key={r.key} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="streamrow">
                      <span className={`streamrow__dot${r.status === 'running' ? ' pulsedot' : ''}`} style={{ background: dotColor[r.status] || 'var(--neutral)' }} />
                      <div className="streamrow__body">
                        <div className="streamrow__name">
                          {r.name}
                          <span className="streamrow__mod">{r.module} · L{r.layer} · {runExecutionLabel(run)}</span>
                        </div>
                        {r.verdict && (
                          <div className="streamrow__verdict">{r.verdict}{r.status === 'done' && dur && <span className="streamrow__dur"> · {dur}</span>}</div>
                        )}
                        {r.status === 'done' && !r.verdict && dur && <div className="streamrow__verdict streamrow__dur">{dur}</div>}
                        {r.status === 'running' && <div className="streamrow__verdict" style={{ color: 'var(--accent-bright)' }}>running{liveElapsed ? ` · ${liveElapsed}` : ''}{liveLeft ? ` · ${liveLeft}` : ''}</div>}
                        {r.status === 'failed' && <div className="streamrow__verdict" style={{ color: 'var(--bad)' }}>failed</div>}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
              {running && rows.length === 0 && (
                <div className="sidepanel__empty">
                  {recovery ? recovery.message
                    : queuedDecision ? 'Another data decision is on screen. This one is queued and cannot be lost.'
                    : waitingOnSharedDecision ? 'Waiting for the one data decision on screen. Every module continues automatically after it is resolved.'
                      : run.status === 'readiness-checking' ? 'Checking the data pool — extracting and validating every file. The run starts the moment it passes.'
                    : run.status === 'awaiting-readiness-decision' ? 'The data check needs your decision — see the panel that opened.'
                    : 'Starting the engine… the first orb will report in a moment.'}
                </div>
              )}
            </div>
          )
        })}

        {/* no live/recent run object, but stream rows survived (e.g. just after a finish) */}
        {!runs.length && (
          <AnimatePresence initial={false}>
            {runStream.map((r) => {
              const nrt = nodeRuntime[r.key]
              const owner = activeRuns[r.runId]
              const dur = nrt?.startedAt && nrt?.endedAt && nrt.endedAt > nrt.startedAt ? fmtSpan(nrt.endedAt - nrt.startedAt) : null
              return (
                <motion.div key={r.key} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="streamrow">
                  <span className="streamrow__dot" style={{ background: dotColor[r.status] || 'var(--neutral)' }} />
                  <div className="streamrow__body">
                    <div className="streamrow__name">{r.name}<span className="streamrow__mod">{r.module} · L{r.layer} · {owner ? runExecutionLabel(owner) : 'Provider/profile unknown'}</span></div>
                    {r.verdict && <div className="streamrow__verdict">{r.verdict}{dur && <span className="streamrow__dur"> · {dur}</span>}</div>}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>
    </>
  )
}
