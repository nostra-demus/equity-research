import { lazy, Suspense, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from './lib/store'
import { CommandBar } from './components/CommandBar'
import { SwarmField } from './components/swarm/SwarmField'
import { ViewToggle } from './components/swarm/ViewToggle'
import { GLOBE } from './components/swarm/globe/globe-consts'
import { ScreenerField } from './components/screener/ScreenerField'
import { WireSurface } from './components/wire/WireSurface'
import { FLOW_WIRE_CONFIG } from './components/wire/WireContext'
import { deriveWireConfig } from './lib/wire'
import { SignalIntake } from './components/screener/SignalIntake'
import { LiveFeed } from './components/screener/LiveFeed'
import { PipelineDiagnostics } from './components/screener/PipelineDiagnostics'
import { SourcesPanel } from './components/screener/SourcesPanel'
import { PipelineBoard } from './components/screener/PipelineBoard'
import { SwarmWarp } from './components/SwarmWarp'
import { ActivityDock } from './components/ActivityDock'
import { OutputReader } from './components/OutputReader'
import { ChatPanel } from './components/ChatPanel'
import { ChatHistory } from './components/ChatHistory'
import { NewsChatPanel } from './components/screener/NewsChatPanel'
import { ScoringPanel } from './components/screener/ScoringPanel'
import { ValuationPlayground } from './components/ValuationPlayground'
import { ReviewPanel } from './components/screener/ReviewPanel'
import { FeedbackPanel } from './components/FeedbackPanel'
import { CallsTracker } from './components/CallsTracker'
import { DataLibrary } from './components/datalibrary/DataLibrary'
import { LaunchConfirm } from './components/LaunchConfirm'
import { ThesisPlanPanel } from './components/ThesisPlanPanel'
import { WhatChangedPanel } from './components/WhatChangedPanel'
import { AddCompany } from './components/AddCompany'
import { ReadinessWarnings } from './components/ReadinessWarnings'
import { DataUploadEmptyState } from './components/DataUploadEmptyState'
import { DataFilesPanel } from './components/DataFilesPanel'
import { IntakeDock } from './components/intake/IntakeDock'
import { DataNeedsDock } from './components/dataneeds/DataNeedsDock'
import { DataPipelinePanel } from './components/pipeline/DataPipelinePanel'
import { DecisionBanner } from './components/DecisionBanner'
import { OfflineBanner } from './components/EngineStatus'
import { api } from './lib/api'
import { callUpdateToast, unseenCallUpdates } from './components/CallsTracker.logic'

// The 3D globe view is lazy-loaded: this dynamic import is the chunk boundary that keeps three.js out of
// the main bundle — it (and its three.js deps) only download when the user first opens the globe.
const GlobeStage = lazy(() => import('./components/swarm/globe/GlobeStage'))

// Polished Suspense fallback while the globe chunk downloads — a calm fade-in, never a blank flash.
// Reuses the existing spinner idiom (.empty__spin, already reduced-motion-aware).
function GlobeLoading() {
  return (
    <div className="globeloading">
      <div className="empty__spin" aria-hidden />
      <div className="globeloading__label">Spinning up the globe…</div>
    </div>
  )
}

// The research stage shows ONE of two SEPARATE renderers, chosen by researchView: the DOM constellation
// (SwarmField — the original, fully-accessible flat view, untouched) or the lazy 3D globe (GlobeStage). The
// constellation is NEVER rebuilt in WebGL. Switching is a coordinated crossfade, not a hard cut: the
// constellation fades + scales out as the globe fades in and WRAPS flat→sphere — and on the way back the
// globe UNWRAPS toward flat as it dissolves into the constellation. AnimatePresence keeps the outgoing
// renderer mounted through its exit, so the globe's wrap/unwrap can finish before it unmounts and the two
// views overlap (both are position:absolute inset:0) for one continuous motion. Reduced-motion → instant
// swap. No WebGL → only the constellation (the Globe toggle is disabled).
// the active swarm's wire config (lib/wire.ts), memoized — a fresh object from a bare selector would
// re-render every subscriber on every store write (the zustand getSnapshot loop).
function useActiveWireConfig() {
  const swarms = useStore((s) => s.swarms)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const subjects = useStore((s) => s.swarmSubjectList)
  return useMemo(() => deriveWireConfig(swarms.find((m) => m.id === activeSwarm), subjects), [swarms, activeSwarm, subjects])
}

function ResearchStage() {
  const view = useStore((s) => s.researchView)
  const webglOK = useStore((s) => s.webglOK)
  const wireConfig = useActiveWireConfig()
  const reduced = useMemo(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const onGlobe = webglOK && view === 'globe'
  const ease = [0.23, 1, 0.32, 1] as const
  const W = GLOBE.WRAP_SECONDS // wrap/unwrap duration, shared with GlobeScene's morph
  const home = (
    <>
      <AnimatePresence>
        {onGlobe ? (
          // The globe's FLAT state is the EXACT constellation (GlobeStage feeds it as the flat override), so
          // at morph 0 the globe orbs sit pixel-on-pixel over the constellation. Entering = WRAP: cross-fade
          // over the SAME duration the constellation fades out (identical pixels → invisible swap) while the
          // scene wraps flat→sphere. Exiting = UNWRAP: held mounted for the full flatten, opaque until it has
          // unwrapped back onto the constellation, then a brief end-fade hand-off (no scale → no drift).
          <motion.div
            key="globe"
            className="stageview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: reduced ? 0 : 0.6, ease } }}
            exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: [1, 1, 0], transition: { duration: W, times: [0, 0.72, 1], ease } }}
          >
            <Suspense fallback={<GlobeLoading />}>
              <GlobeStage />
            </Suspense>
          </motion.div>
        ) : (
          // Opacity ONLY (no scale) so the constellation stays pixel-aligned with the globe's matched flat
          // state through the cross-fade. Entering after an UNWRAP: held until the globe has flattened back
          // onto it (delay ≈ 0.72·W), then a brief fade-in that complements the globe's end-fade.
          <motion.div
            key="constellation"
            className="stageview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: reduced ? 0 : W * 0.28, delay: reduced ? 0 : W * 0.72, ease } }}
            exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.6, ease } }}
          >
            <SwarmField />
          </motion.div>
        )}
      </AnimatePresence>
      <ViewToggle />
      <DataUploadEmptyState />
      {/* The left rail. These two docks are about the SAME subject — this company's documents — and
          share the left edge. They used to be two independent absolute overlays anchored to OPPOSITE
          edges (the pool at bottom:18px, intake at top:70px): expand both and they grew into each
          other until z-index picked a winner. One flex column cannot overlap itself. Intake sits on
          top (it is the transient, "look at this now" surface); the pool keeps its bottom anchor. */}
      <div className="stagerail">
        <IntakeDock />
        <DataFilesPanel />
      </div>
      <DataNeedsDock />
      <DecisionBanner />
    </>
  )
  // A constellation swarm whose manifest DECLARES a wire (SWARM.md `wire:` → /api/swarms) renders the
  // SAME shared wire surface the screener uses, with the constellation as its resting main view — read
  // the wire, open an event, launch a run, watch the orbs. Absent declaration (incl. every swarm on an
  // old server): exactly the plain stage below, no wire chrome (deploy-skew fail-closed).
  if (wireConfig && !wireConfig.flow) return <WireSurface config={wireConfig} home={home} />
  return home
}

// Two panes: a persistent left rail streaming every event the scanner reads (ranked), and the main
// stage. The main stage reads ONE event when the user picks it off the rail, otherwise it is the
// gauntlet constellation (dormant until a signal runs, animated while one does). Picking "Run the
// checks" in the reader clears the event and the constellation takes over — one continuous flow:
// see events → read one → run it → watch the orbs. The composition itself is the shared WireSurface;
// this stage just supplies the flow config + the gauntlet as home.
function ScreenerStage() {
  const wireConfig = useActiveWireConfig()
  const activeSwarm = useStore((s) => s.activeSwarm)
  const label = useStore((s) => s.swarms.find((swarm) => swarm.id === s.activeSwarm)?.label ?? s.activeSwarm)
  // The swarm-specific wrapper grants the gauntlet capability. `layout: flow` alone only grants the
  // shared wire; this keeps the shared component tree free of swarm-id behavior branches.
  const config = { ...(wireConfig ?? { ...FLOW_WIRE_CONFIG, swarmId: activeSwarm }), gauntlet: activeSwarm === 'screener' }
  // `layout: flow` supplies the shared wire composition, but the gauntlet/board adapter currently belongs
  // only to the screener. A newly declared flow can still show its own wire; fail closed in the main pane
  // instead of painting cached screener state under another swarm's name.
  const home = activeSwarm === 'screener'
    ? <ScreenerField />
    : (
      <div className="empty">
        <div className="empty__card">
          <div className="empty__title">{label}</div>
          <div className="empty__body">This flow has no compatible stage adapter yet. Its event wire remains available.</div>
        </div>
      </div>
    )
  return <WireSurface config={config} home={home} />
}

// The return door to the phone chat shell. Rendered only on a coarse-pointer viewport ≤820px (the CSS
// gates it), i.e. a phone user who chose "Use desktop site" — clearing the flag sends them back. The
// topbar cannot host this: its children are nowrap + flex-shrink:0, so on a phone the bar's right side
// is physically off-screen.
function MobileViewPill() {
  return (
    <button
      className="mobilepill"
      onClick={() => {
        try { localStorage.removeItem('nsw.forceDesktop') } catch { /* private mode */ }
        location.href = '/m/'
      }}
    >
      📱 Mobile view
    </button>
  )
}

export function App() {
  const init = useStore((s) => s.init)
  const openOutput = useStore((s) => s.openOutput)
  const activityOpen = useStore((s) => s.activityOpen)
  const scoringOpen = useStore((s) => s.scoringOpen)
  const valuationPlaygroundOpen = useStore((s) => s.valuationPlaygroundOpen)
  const reviewOpen = useStore((s) => s.reviewOpen)
  const cockpitFeedbackOpen = useStore((s) => s.cockpitFeedbackOpen)
  const callsOpen = useStore((s) => s.callsOpen)
  const dataLibraryOpen = useStore((s) => s.dataLibraryOpen)
  const pipelineOpen = useStore((s) => s.pipelineOpen)
  const dataPipelineOpen = useStore((s) => s.dataPipelineOpen)
  const chatOpen = useStore((s) => s.chatOpen)
  const chatHistoryOpen = useStore((s) => s.chatHistoryOpen)
  const newsChatOpen = useStore((s) => s.newsChatOpen)
  const newsFeedOpen = useStore((s) => s.newsFeedOpen)
  const sourcesOpen = useStore((s) => s.sourcesOpen)
  const diagnosticsOpen = useStore((s) => s.diagnosticsOpen)
  const toast = useStore((s) => s.toast)
  const setToast = useStore((s) => s.setToast)
  const openCalls = useStore((s) => s.openCalls)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const swarms = useStore((s) => s.swarms)
  const warp = useStore((s) => s.warp)
  // Dispatch the stage by the swarm's LAYOUT, not its id: the screener is a 'flow' swarm (its bespoke
  // rail+gauntlet stage); research and any 'constellation' swarm (e.g. commodity) share the constellation
  // stage. Fall back to the screener/research split before the swarm list resolves (first-frame safe).
  const activeLayout = swarms.find((s) => s.id === activeSwarm)?.layout ?? (activeSwarm === 'screener' ? 'flow' : 'constellation')
  // The active swarm's manifest color (SWARM.md), injected as --swarm-color so tokens.css can derive
  // the whole accent family for swarms without a hand-tuned palette (research amber / screener teal
  // keep theirs). Absent before the swarm list resolves → tokens fall back to the research amber.
  const activeColor = swarms.find((s) => s.id === activeSwarm)?.color

  useEffect(() => {
    init().catch((e) => console.error('init failed', e))
  }, [init])

  // Background call-change notifications. The update id is derived from the committed call/review
  // artifact, so polling, reloads and multiple tabs cannot manufacture a new event. The first visit only
  // establishes the watermark; later visits still alert if an automatic update landed while the app was
  // closed. The Calls panel remains the durable notification history.
  useEffect(() => {
    let stopped = false
    const key = 'nostra.calls.seen-updates.v2'
    const check = async () => {
      try {
        const result = await api.calls()
        if (stopped || result.automation?.enabled !== true) return
        const updates = (result.updates || []).filter((update) => Boolean(update?.id))
        if (!updates.length) return
        const claim = () => {
          let raw: string | null
          try { raw = localStorage.getItem(key) } catch { return null /* private browsing */ }
          if (!raw) {
            // First visit establishes history; it must not announce every old call as if it just changed.
            try { localStorage.setItem(key, JSON.stringify(updates.map((update) => update.id).slice(0, 300))) } catch {}
            return null
          }
          let seen: string[] = []
          try {
            const parsed = JSON.parse(raw)
            if (Array.isArray(parsed)) seen = parsed.filter((id): id is string => typeof id === 'string')
          } catch { /* reset a malformed browser-only watermark from the authoritative API list below */ }
          const seenSet = new Set(seen)
          // Dates are day-granular, so a newly-written review can sort below an older same-day review.
          // Keep the whole unseen batch. We announce it as one clear alert below before marking every id.
          const unseen = unseenCallUpdates(updates, seenSet)
          const merged = [...updates.map((update) => update.id), ...seen].filter((id, index, all) => all.indexOf(id) === index).slice(0, 300)
          try { localStorage.setItem(key, JSON.stringify(merged)) } catch { return null }
          return unseen
        }
        // Web Locks serializes the watermark across tabs. Older browsers still get the safe local
        // fallback; the committed update id prevents polling from creating new history either way.
        const unseen = navigator.locks?.request
          ? await navigator.locks.request('nostra-calls-notification', claim)
          : claim()
        const alert = callUpdateToast(unseen || [])
        if (!alert) return
        setToast({
          msg: alert.message,
          tone: alert.tone,
          action: { label: 'Open Calls', onClick: openCalls },
        })
      } catch { /* Calls owns the persistent error state; never spam a global error toast. */ }
    }
    void check()
    const timer = window.setInterval(() => { void check() }, 60_000)
    return () => { stopped = true; window.clearInterval(timer) }
  }, [openCalls, setToast])

  return (
    <div className={`app${warp ? ` app--warp-${warp.phase}` : ''}${openOutput && chatOpen ? ' app--dual' : ''}`} data-swarm={activeSwarm} style={activeColor ? ({ ['--swarm-color' as any]: activeColor }) : undefined}>
      <div className="app__bg" />
      <CommandBar />
      <OfflineBanner />
      <div className="main">
        <div className="stage" key={activeSwarm}>
          {activeLayout === 'flow' ? <ScreenerStage /> : <ResearchStage />}
        </div>
        {/* ONE activity surface, docked IN the layout (never over it): what's running now, then everything
            that has run. Opens itself the moment anything launches; drag its edge to resize. */}
        <ActivityDock />
      </div>

      <AnimatePresence>{openOutput && <OutputReader key={openOutput.path || openOutput.nodeKey || 'panel'} output={openOutput} />}</AnimatePresence>
      <AnimatePresence>{chatOpen && <ChatPanel />}</AnimatePresence>
      <AnimatePresence>{chatHistoryOpen && <ChatHistory />}</AnimatePresence>
      <AnimatePresence>{newsChatOpen && <NewsChatPanel />}</AnimatePresence>
      <AnimatePresence>{scoringOpen && <ScoringPanel />}</AnimatePresence>
      <AnimatePresence>{valuationPlaygroundOpen && <ValuationPlayground />}</AnimatePresence>
      <AnimatePresence>{reviewOpen && <ReviewPanel />}</AnimatePresence>
      <AnimatePresence>{cockpitFeedbackOpen && <FeedbackPanel />}</AnimatePresence>
      <AnimatePresence>{dataPipelineOpen && <DataPipelinePanel />}</AnimatePresence>
      <AnimatePresence>{callsOpen && <CallsTracker />}</AnimatePresence>
      <AnimatePresence>{dataLibraryOpen && <DataLibrary />}</AnimatePresence>
      <AnimatePresence>{pipelineOpen && <PipelineBoard />}</AnimatePresence>
      {/* no exit animation by design: the wire re-renders on live news/status ticks, which can
          freeze a framer exit mid-slide — instant close is deterministic (and exits should be
          faster than enters anyway); the entry slide still runs via initial/animate */}
      {newsFeedOpen && <LiveFeed />}
      {diagnosticsOpen && <PipelineDiagnostics />}
      {sourcesOpen && <SourcesPanel />}
      <SignalIntake />
      <LaunchConfirm />
      <ThesisPlanPanel />
      <WhatChangedPanel />
      <AddCompany />
      <ReadinessWarnings />
      <SwarmWarp />

      <AnimatePresence>
        {toast && (
          <motion.div key="toast" className="toast" role="status" aria-live="polite" aria-atomic="true" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
            <span className="creditbadge__dot" style={{ background: toast.tone === 'good' ? 'var(--accent)' : toast.tone === 'bad' ? 'var(--bad)' : 'var(--text-muted)' }} />
            <span className="toast__msg" title={toast.msg}>{toast.msg}</span>
            {toast.action && (
              <button
                type="button"
                className="toast__action"
                onClick={() => { const a = toast.action!; setToast(null); a.onClick() }}
              >
                {toast.action.label}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <MobileViewPill />
    </div>
  )
}
