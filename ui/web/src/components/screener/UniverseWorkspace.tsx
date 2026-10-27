import { type ReactNode } from 'react'
import { usePersonalScopeStore } from '../../lib/personalScope'
import { PersonalScopeToggle } from './PersonalScopeToggle'
import { ModelView } from './ModelView'
import { useStore } from '../../lib/store'
import './model.css'

export function UniverseWorkspace({ events }: { events: ReactNode }) {
  const scope = usePersonalScopeStore((s) => s.scope)
  const tab = useStore((s) => s.universeView)
  const modelOpen = scope === 'universe' && tab === 'model'
  return <div className="personal-wire">
    <PersonalScopeToggle />
    {scope === 'universe' && <nav className="universe-tabs" aria-label="Universe views">
      {(['events', 'model'] as const).map((id) => <button type="button" key={id}
        aria-pressed={tab === id} onClick={() => useStore.setState({ universeView: id })}>{id === 'events' ? 'Events' : 'Model'}</button>)}
    </nav>}
    <div className="universe-events" hidden={modelOpen}>{events}</div>
    {modelOpen && <ModelView />}
  </div>
}
