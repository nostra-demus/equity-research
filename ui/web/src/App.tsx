import { lazy, Suspense, useEffect, useMemo } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from './lib/store'
import { CommandBar } from './components/CommandBar'
import { SwarmField } from './components/swarm/SwarmField'
import { ViewToggle } from './components/swarm/ViewToggle'
import { GLOBE } from './components/swarm/globe/globe-consts'
import { ScreenerField } from './components/screener/ScreenerField'
import { EventRail } from './components/screener/EventRail'
import { EventDetail } from './components/screener/EventDetail'
import { CompanyView } from './components/screener/CompanyView'
import { ThemesView } from './components/screener/ThemesView'
import { SignalIntake } from './components/screener/SignalIntake'
import { LiveFeed } from './components/screener/LiveFeed'
import { SourcesPanel } from './components/screener/SourcesPanel'
import { PipelineBoard } from './components/screener/PipelineBoard'
import { SwarmWarp } from './components/SwarmWarp'
import { RunStreamPanel } from './components/RunStreamPanel'
import { OutputReader } from './components/OutputReader'
import { ChatPanel } from './components/ChatPanel'
import { ActivityLog } from './components/ActivityLog'
import { ScoringPanel } from './components/screener/ScoringPanel'
import { CallsTracker } from './components/CallsTracker'
import { LaunchConfirm } from './components/LaunchConfirm'
import { AddCompany } from './components/AddCompany'
import { ReadinessWarnings } from './components/ReadinessWarnings'
import { DataUploadEmptyState } from './components/DataUploadEmptyState'
import { DataFilesPanel } from './components/DataFilesPanel'
import { DecisionBanner } from './components/DecisionBanner'
import { OfflineBanner } from './components/EngineStatus'

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
function ResearchStage() {
  const view = useStore((s) => s.researchView)
  const webglOK = useStore((s) => s.webglOK)
  const reduced = useMemo(
    () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    [],
  )
  const onGlobe = webglOK && view === 'globe'
  const ease = [0.23, 1, 0.32, 1] as const
  const W = GLOBE.WRAP_SECONDS // wrap/unwrap duration, shared with GlobeScene's morph
  return (
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
      <DataFilesPanel />
      <DecisionBanner />
    </>
  )
}

// Two panes: a persistent left rail streaming every event the scanner reads (ranked), and the main
// stage. The main stage reads ONE event when the user picks it off the rail, otherwise it is the
// gauntlet constellation (dormant until a signal runs, animated while one does). Picking "Run the
// checks" in the reader clears the event and the constellation takes over — one continuous flow:
// see events → read one → run it → watch the orbs.
function ScreenerStage() {
  const event = useStore((s) => s.scSelectedEvent)
  const themesView = useStore((s) => s.themesView)
  const focusedCompany = useStore((s) => s.scFocusedCompany)
  return (
    <div className="scstage">
      <EventRail />
      <div className="scstage__main">{focusedCompany ? <CompanyView /> : event ? <EventDetail it={event} /> : themesView ? <ThemesView /> : <ScreenerField />}</div>
    </div>
  )
}

export function App() {
  const init = useStore((s) => s.init)
  const openOutput = useStore((s) => s.openOutput)
  const activityOpen = useStore((s) => s.activityOpen)
  const scoringOpen = useStore((s) => s.scoringOpen)
  const callsOpen = useStore((s) => s.callsOpen)
  const pipelineOpen = useStore((s) => s.pipelineOpen)
  const chatOpen = useStore((s) => s.chatOpen)
  const newsFeedOpen = useStore((s) => s.newsFeedOpen)
  const sourcesOpen = useStore((s) => s.sourcesOpen)
  const toast = useStore((s) => s.toast)
  const activeSwarm = useStore((s) => s.activeSwarm)
  const warp = useStore((s) => s.warp)

  useEffect(() => {
    init().catch((e) => console.error('init failed', e))
  }, [init])

  return (
    <div className={`app${warp ? ` app--warp-${warp.phase}` : ''}`} data-swarm={activeSwarm}>
      <div className="app__bg" />
      <CommandBar />
      <OfflineBanner />
      <div className="main">
        <div className="stage" key={activeSwarm}>
          {activeSwarm === 'screener' ? <ScreenerStage /> : <ResearchStage />}
        </div>
        <RunStreamPanel />
      </div>

      <AnimatePresence>{openOutput && <OutputReader key={openOutput.path || openOutput.nodeKey || 'panel'} output={openOutput} />}</AnimatePresence>
      <AnimatePresence>{chatOpen && <ChatPanel />}</AnimatePresence>
      <AnimatePresence>{activityOpen && <ActivityLog />}</AnimatePresence>
      <AnimatePresence>{scoringOpen && <ScoringPanel />}</AnimatePresence>
      <AnimatePresence>{callsOpen && <CallsTracker />}</AnimatePresence>
      <AnimatePresence>{pipelineOpen && <PipelineBoard />}</AnimatePresence>
      {/* no exit animation by design: the wire re-renders on live news/status ticks, which can
          freeze a framer exit mid-slide — instant close is deterministic (and exits should be
          faster than enters anyway); the entry slide still runs via initial/animate */}
      {newsFeedOpen && <LiveFeed />}
      {sourcesOpen && <SourcesPanel />}
      <SignalIntake />
      <LaunchConfirm />
      <AddCompany />
      <ReadinessWarnings />
      <SwarmWarp />

      <AnimatePresence>
        {toast && (
          <motion.div key="toast" className="toast" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}>
            <span className="creditbadge__dot" style={{ background: toast.tone === 'good' ? 'var(--accent)' : toast.tone === 'bad' ? 'var(--bad)' : 'var(--text-muted)' }} />
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
