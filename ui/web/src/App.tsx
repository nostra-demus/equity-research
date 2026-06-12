import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useStore } from './lib/store'
import { CommandBar } from './components/CommandBar'
import { SwarmField } from './components/swarm/SwarmField'
import { ScreenerField } from './components/screener/ScreenerField'
import { SignalIntake } from './components/screener/SignalIntake'
import { LiveFeed } from './components/screener/LiveFeed'
import { PipelineBoard } from './components/screener/PipelineBoard'
import { SwarmWarp } from './components/SwarmWarp'
import { RunStreamPanel } from './components/RunStreamPanel'
import { OutputReader } from './components/OutputReader'
import { ActivityLog } from './components/ActivityLog'
import { CallsTracker } from './components/CallsTracker'
import { LaunchConfirm } from './components/LaunchConfirm'
import { ReadinessWarnings } from './components/ReadinessWarnings'
import { DataUploadEmptyState } from './components/DataUploadEmptyState'
import { DataFilesPanel } from './components/DataFilesPanel'
import { DecisionBanner } from './components/DecisionBanner'
import { OfflineBanner } from './components/EngineStatus'

// Per-swarm stage shells: the research stage keeps its chrome (data files, decision banner,
// upload empty-state) exactly as before; the screener stage mounts the gauntlet. No research
// component learns about swarms — the shell swap is the only branch point.
function ResearchStage() {
  return (
    <>
      <SwarmField />
      <DataUploadEmptyState />
      <DataFilesPanel />
      <DecisionBanner />
    </>
  )
}

function ScreenerStage() {
  return <ScreenerField />
}

export function App() {
  const init = useStore((s) => s.init)
  const openOutput = useStore((s) => s.openOutput)
  const activityOpen = useStore((s) => s.activityOpen)
  const callsOpen = useStore((s) => s.callsOpen)
  const pipelineOpen = useStore((s) => s.pipelineOpen)
  const newsFeedOpen = useStore((s) => s.newsFeedOpen)
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
      <AnimatePresence>{callsOpen && <CallsTracker />}</AnimatePresence>
      <AnimatePresence>{pipelineOpen && <PipelineBoard />}</AnimatePresence>
      {/* no exit animation by design: the wire re-renders on live news/status ticks, which can
          freeze a framer exit mid-slide — instant close is deterministic (and exits should be
          faster than enters anyway); the entry slide still runs via initial/animate */}
      {newsFeedOpen && <LiveFeed />}
      <SignalIntake />
      <LaunchConfirm />
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
