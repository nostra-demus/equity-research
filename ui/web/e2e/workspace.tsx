import React from 'react'
import { createRoot } from 'react-dom/client'
import '../src/styles/global.css'
import { App } from '../src/App'
import { useStore } from '../src/lib/store'

window.__ENGINE_LIVE__ = true
useStore.setState({
  init: async () => {},
  staticMode: false, connected: true, health: 'online', selectedTicker: 'DEMO',
  researchView: 'constellation',
  graph: { modules: [], masterSynthesizer: { name: 'Master', description: '' }, totals: { modules: 0, agents: 0, specialists: 0 } },
  reports: { memo: true, thesis: true, dossier: true },
  runRoot: 'analyses/DEMO_2026-09-24',
  swarms: [
    { id: 'research', label: 'Research', color: '#e6a638', layout: 'constellation' },
    { id: 'screener', label: 'Screener', color: '#36cbb2', layout: 'flow' },
    { id: 'commodity', label: 'Commodities', color: '#8b5cf6', layout: 'constellation' },
  ] as ReturnType<typeof useStore.getState>['swarms'],
})
createRoot(document.getElementById('root')!).render(<App />)
