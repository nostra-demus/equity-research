import { lazy, Suspense, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from './lib/store'
import { CommandBar } from './components/CommandBar'
import { SwarmField } from './components/swarm/SwarmField'
import { ViewToggle } from './components/swarm/ViewToggle'
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

// Per-swarm stage shells: the research stage keeps its chrome (data files, decision banner,
// upload empty-state) exactly as before; the screener stage mounts the gauntlet. The research stage is now
// a SINGLE WebGL scene (GlobeStage) that renders BOTH the flat constellation and the globe as morph states
// of the same nodes — the toggle just changes the morph target, so wrapping/unwrapping is one continuous
// animation with no renderer swap. The DOM SwarmField is the fallback only when WebGL is unavailable.
function ResearchStage() {
  const webglOK = useStore((s) => s.webglOK)
  return (
    <>
      {webglOK ? (
        <Suspense fallback={<GlobeLoading />}>
          <GlobeStage />
        </Suspense>
      ) : (
        <SwarmField />
      )}
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
