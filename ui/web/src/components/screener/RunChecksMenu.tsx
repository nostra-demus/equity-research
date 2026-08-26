import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { isLaunchHealthBlocked, useStore } from '../../lib/store'
import { plainStage } from '../../lib/plain'
import { Spin } from '../Spin'
import type { FeedItem, SignalState } from '../../lib/types'
import type { ReportMenuAnchor } from '../ActivityReportMenu'
import '../swarm/CoreOrb.css' // reuse the .reportpop / __item / __label / __hint / __scrim popover look
import { ProviderMiniSelector } from '../ProviderMiniSelector'
import { providerLaunchBlockedReason } from '../../lib/provider'

// "Run the checks" — ONE split button that folds the old (Run button + "or run only through" footer) into a
// single control whose caret opens the RIGHT actions for the signal's ACTUAL run-state. A read-only state
// probe (GET /api/screener/signal-state — derives the SIG-id the same way a launch would, spends nothing)
// drives both a status badge and which actions show:
//   never            → Run all · Stop after <stage>
//   parked / logged  → Override the gate & run all   (the gate held it; a human override forces the run)
//   partial          → Continue · Continue through <stage>
//   running          → Stop the run
//   watchlist / done → locked; only a from-scratch re-run applies (stubbed — no wipe path yet)
// Every action reuses an EXISTING store verb — runEventChecks (with the already-wired `until` / `override`
// params) / continueSignal / cancelSignalRun — so the run engine itself is untouched. Nothing here starts,
// stops, or re-routes a run in a way the footer chips and the old button couldn't already do.

type BadgeTone = 'run' | 'pause' | 'hold' | 'done'

interface Props {
  it: FeedItem
}

export function RunChecksMenu({ it }: Props) {
  const run = useStore((s) => s.runEventChecks)
  const continueSig = useStore((s) => s.continueSignal)
  const cancelSig = useStore((s) => s.cancelSignalRun)
  const fetchState = useStore((s) => s.fetchSignalState)
  const entry = useStore((s) => s.scSignalState[it.event_id])
  const launchPending = useStore((s) => s.launchPending)
  const staticMode = useStore((s) => s.staticMode)
  const scGraph = useStore((s) => s.scGraph) // the SCREENER graph — stages in dependency order (zero-touch)
  const runProvider = useStore((s) => s.runProvider)
  const providers = useStore((s) => s.providers)
  const providerProblem = providerLaunchBlockedReason(providers[runProvider], providers.catalogState)
  const health = useStore((s) => s.health)
  const launchBlocked = isLaunchHealthBlocked(health)
  const launchProblem = launchBlocked ? 'Engine update in progress — new runs resume when it finishes' : providerProblem
  const [open, setOpen] = useState(false)
  const [anchor, setAnchor] = useState<ReportMenuAnchor | null>(null)

  // read the run-state once per opened event (read-only — no run, no spend). Refined into the badge + actions
  // when it lands; until then the control shows the safe default (a plain full run), so it is instantly usable.
  useEffect(() => {
    void fetchState(it)
  }, [it.event_id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Escape closes the menu — and ONLY the menu. EventDetail also backs out to the list on Escape and can't
  // see this local open-state, so consume the event in the CAPTURE phase (runs before EventDetail's bubble
  // listener) and stop it, or one Escape would both close the menu and drop the user out of the reader.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      setOpen(false)
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [open])

  const st: SignalState | null = entry && entry !== 'loading' ? entry : null
  const state = st?.state ?? 'never'
  const sigId = st?.sigId || ''
  // FIRST-read only (a refetch keeps the last-known value, never 'loading'). While the very first state is
  // unknown, disable the trigger so a fast click can't fire the 'never' default (a duplicate run) on a signal
  // that's actually running/complete/parked. Sub-second; the button enables the moment the state lands.
  const loading = entry === 'loading'

  // the screener stages in order; the LAST is the terminal module, so "run/stop THROUGH the last stage" == run
  // all — the staged targets are every stage before it (mirrors the old "or run only through" chip list).
  const stages = useMemo(() => (scGraph?.modules || []).slice().sort((a, b) => a.order - b.order), [scGraph])
  const nonTerminal = stages.slice(0, -1)
  const doneSet = useMemo(() => new Set(st?.doneModules || []), [st])
  const remaining = nonTerminal.filter((m) => !doneSet.has(m.name)) // stages still to run — the Continue-through targets

  // busy = a launch this control started is in flight (a fresh intake has no sigId yet; a resume carries ours)
  const busy = !!launchPending && (launchPending.key === 'signal:intake' || (!!sigId && launchPending.ticker === sigId))

  const closeThen = (fn: () => void) => () => {
    setOpen(false)
    fn()
  }
  // after a resume / stop the reader stays open, so re-read the state to flip the badge (Paused→Running, etc.)
  const refetch = () => {
    void fetchState(it)
  }
  const startFull = () => void run(it)
  const startThrough = (mod: string) => void run(it, mod)
  const overrideRun = () => void run(it, undefined, true)
  const resumeAll = () => void continueSig(sigId).then(refetch)
  const resumeThrough = (mod: string) => void continueSig(sigId, mod).then(refetch)
  const stopRun = () => void cancelSig(sigId).then(refetch)

  const scoreTxt = typeof st?.materiality === 'number' ? ` · ${Math.round(st.materiality)}` : ''

  // ── the status badge + the dropdown-trigger label, by state ─────────────────────────────────────────────
  // ONE button that OPENS the menu — there is no separate one-click action. The label names what the menu is
  // about; the badge (to its left) shows the state. Every verb (run / stop after / continue / override / stop
  // / re-run) lives INSIDE the menu, so a click always opens options to pick from and never fires a run itself.
  let badge: { label: ReactNode; tone: BadgeTone } | null = null
  let buttonLabel = 'Run the checks'
  switch (state) {
    case 'running':
      badge = { label: 'Running', tone: 'run' }
      buttonLabel = 'Manage run'
      break
    case 'partial':
      // omit the fraction until the screener graph has loaded, so a cold open never shows "Paused · N/0"
      badge = { label: stages.length ? `Paused · ${doneSet.size}/${stages.length}` : 'Paused', tone: 'pause' }
      buttonLabel = 'Continue the run'
      break
    case 'parked':
      badge = { label: `Parked${scoreTxt}`, tone: 'hold' }
      break
    case 'logged':
      badge = { label: `Logged${scoreTxt}`, tone: 'hold' }
      break
    case 'watchlist':
      badge = { label: 'Watchlist', tone: 'done' }
      buttonLabel = 'Re-run'
      break
    case 'complete':
      badge = { label: 'Complete ✓', tone: 'done' }
      buttonLabel = 'Re-run'
      break
    // default (never / still loading): no badge, label stays "Run the checks"
  }

  // the cost/early-stop hint only applies to states whose menu can start a fresh (or overridden) full run
  // ('never' already covers the still-loading case, since state falls back to 'never' when st is null)
  const showEst = state === 'never' || state === 'parked' || state === 'logged'

  const openMenu = (e: React.MouseEvent) => {
    const bar = (e.currentTarget as HTMLElement).closest('.runsplit') as HTMLElement | null
    const r = (bar ?? (e.currentTarget as HTMLElement)).getBoundingClientRect()
    const right = Math.max(8, window.innerWidth - r.right)
    const below = window.innerHeight - r.bottom
    setAnchor(below < 320 ? { right, bottom: Math.max(8, window.innerHeight - r.top + 6) } : { right, top: r.bottom + 6 })
    setOpen((v) => !v)
  }

  return (
    <div className="evdetail__run">
      <div className="runsplit">
        {badge && <span className={`runsplit__badge runsplit__badge--${badge.tone}`}>{badge.tone === 'run' && <Spin />}{badge.label}</span>}
        <button
          className="btn btn--amber runsplit__trigger"
          aria-haspopup="menu"
          aria-expanded={open}
          disabled={busy || loading || (!!launchProblem && state !== 'running')}
          onClick={openMenu}
          title={staticMode ? 'Runs on your local machine (npm run dev)' : state === 'running' ? 'Manage this run' : launchProblem || (loading ? 'Checking this signal’s run state…' : 'Choose how to run the checks')}
        >
          {busy ? <><Spin /> Starting…</> : loading ? <><Spin /> Checking…</> : <>{buttonLabel}<span className="runsplit__chev" aria-hidden style={{ transform: open ? 'rotate(180deg)' : 'none' }}>▾</span></>}
        </button>
      </div>
      <ProviderMiniSelector agentCount={scGraph?.totals.agents} duration="duration shown live" />
      {showEst && <span className="evdetail__est mono">{runProvider === 'codex' ? 'Codex plan · stops early if a check says no' : 'about $8–45 · stops early (and cheaper) if a check says no'}</span>}

      {open && anchor && createPortal(
        <>
          <div className="reportpop__scrim" onClick={() => setOpen(false)} />
          <div
            className="reportpop"
            style={{ left: 'auto', right: anchor.right, top: anchor.top, bottom: anchor.bottom, transform: 'none', animation: 'none', minWidth: 232 }}
            onClick={(e) => e.stopPropagation()}
            role="menu"
          >
            {/* RUNNING — the only useful action is to stop it */}
            {state === 'running' && (
              <>
                <div className="reportpop__label">This signal is running</div>
                <button className="reportpop__item" role="menuitem" onClick={closeThen(stopRun)}>
                  <b style={{ color: 'var(--bad)' }}>Stop the run</b>
                  <span>Halt the remaining checks — finished stages stay saved</span>
                </button>
              </>
            )}

            {/* PARTIAL — resume to the end, or resume through a named stage */}
            {state === 'partial' && (
              <>
                <div className="reportpop__label">{stages.length ? `Resume · ${doneSet.size}/${stages.length} done` : 'Resume the run'}</div>
                <button className="reportpop__item" role="menuitem" disabled={!!launchProblem} title={launchProblem || undefined} onClick={closeThen(resumeAll)}>
                  <b>Continue to the end</b>
                  <span>Run every remaining stage</span>
                </button>
                {remaining.length > 0 && remaining.map((m) => (
                  <button key={m.name} className="reportpop__item" role="menuitem" disabled={!!launchProblem} title={launchProblem || undefined} onClick={closeThen(() => resumeThrough(m.name))}>
                    <b>Continue through “{plainStage(m.name)}”</b>
                    <span>Run up to here, then stop again</span>
                  </button>
                ))}
              </>
            )}

            {/* PARKED / LOGGED — the gate held it; override forces the full run */}
            {(state === 'parked' || state === 'logged') && (
              <>
                <div className="reportpop__label">{state === 'parked' ? 'Parked by the gate' : 'Logged by the gate'}{scoreTxt}</div>
                <button className="reportpop__item" role="menuitem" disabled={!!launchProblem} title={launchProblem || undefined} onClick={closeThen(overrideRun)}>
                  <b style={{ color: 'var(--accent-deep)' }}>Override the gate & run all</b>
                  <span>Force past the promotion gate and run every stage</span>
                </button>
                <button className="reportpop__item" role="menuitem" disabled={!!launchProblem} title={launchProblem || undefined} onClick={closeThen(startFull)}>
                  <b>Run all (respect the gate)</b>
                  <span>Re-score at the gate — it may park again</span>
                </button>
              </>
            )}

            {/* NEVER — run all, or run through a named stage then stop */}
            {state === 'never' && (
              <>
                <div className="reportpop__label">Run the checks</div>
                <button className="reportpop__item" role="menuitem" disabled={!!launchProblem} title={launchProblem || undefined} onClick={closeThen(startFull)}>
                  <b style={{ color: 'var(--accent-deep)' }}>Run all checks</b>
                  <span>The full gauntlet — every stage</span>
                </button>
                {nonTerminal.length > 0 && <div className="reportpop__label" style={{ marginTop: 2 }}>Or stop after…</div>}
                {nonTerminal.map((m) => (
                  <button key={m.name} className="reportpop__item" role="menuitem" disabled={!!launchProblem} title={launchProblem || undefined} onClick={closeThen(() => startThrough(m.name))}>
                    <b>{plainStage(m.name)}</b>
                    <span>Run through here, then stop — Continue the rest later</span>
                  </button>
                ))}
              </>
            )}

            {/* WATCHLIST / COMPLETE — locked; only a from-scratch re-run applies (stubbed) */}
            {(state === 'watchlist' || state === 'complete') && (
              <>
                <div className="reportpop__label">{state === 'complete' ? 'Ran & locked · complete' : 'Ran & locked · watchlist'}</div>
                <button className="reportpop__item" role="menuitem" disabled title="Re-running from scratch is coming soon — the saved run stays on the board." style={{ cursor: 'not-allowed', opacity: 0.55 }}>
                  <b>Re-run from scratch</b>
                  <span>Coming soon — wipes the saved run and starts over</span>
                </button>
              </>
            )}

            <div className="reportpop__hint">Finished stages are always saved — stopping or a partial run never loses them.</div>
          </div>
        </>,
        document.body,
      )}
    </div>
  )
}
