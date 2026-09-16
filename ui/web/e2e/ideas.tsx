import React, { useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import '../src/styles/global.css'
import { BestIdeasView } from '../src/components/screener/BestIdeasView'
import { useStore } from '../src/lib/store'

window.__ENGINE_LIVE__ = true
useStore.setState({ activeSwarm: 'screener', staticMode: false, health: 'online',
  scGraph: { modules: [], masterSynthesizer: { name: 'Master', description: '' }, totals: { modules: 0, agents: 0, specialists: 0 } },
  scEnsureNewsStream: async () => {}, _maybeAutoResume: async () => {},
})

function Harness() {
  const ideasOpen = useStore((s) => s.ideasOpen)
  useEffect(() => { void useStore.getState().scInit() }, [])
  return <main className="app" data-swarm="screener" style={{ minHeight: '100vh' }}>
    <nav><button type="button" role="radio" aria-checked={ideasOpen} onClick={() => useStore.getState().openIdeas()}>Ideas</button></nav>
    {ideasOpen && <BestIdeasView />}
  </main>
}
createRoot(document.getElementById('root')!).render(<Harness />)
