import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/styles/global.css'
import { BestIdeasView } from '../src/components/screener/BestIdeasView'
import { useStore } from '../src/lib/store'
import { EventRail } from '../src/components/screener/EventRail'
import { ActivityHistory } from '../src/components/ActivityLog'
import { PerformancePanel } from '../src/components/PerformancePanel'

window.__ENGINE_LIVE__ = true
useStore.setState({ activeSwarm: 'screener', staticMode: false, health: 'online',
  scGraph: { modules: [], masterSynthesizer: { name: 'Master', description: '' }, totals: { modules: 0, agents: 0, specialists: 0 } },
  scEnsureNewsStream: async () => {}, _maybeAutoResume: async () => {},
})

function Harness() {
  const ideasOpen = useStore((s) => s.ideasOpen)
  const surface = new URLSearchParams(window.location.search).get('surface')
  useEffect(() => { if (!surface) void useStore.getState().scInit() }, [surface])
  if (surface === 'wire') return <main className="app" data-swarm="screener" style={{ flexDirection: 'row' }}><EventRail /></main>
  if (surface === 'activity') return <main className="app"><ActivityHistory /></main>
  if (surface === 'speed') return <main className="app"><PerformancePanel onClose={() => {}} /></main>
  return <main className="app" data-swarm="screener" style={{ minHeight: '100vh' }}>
    <nav><button type="button" role="radio" aria-checked={ideasOpen} onClick={() => useStore.getState().openIdeas()}>Ideas</button></nav>
    {ideasOpen && <BestIdeasView />}
  </main>
}
createRoot(document.getElementById('root')!).render(<Harness />)
