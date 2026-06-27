import { useStore } from '../../lib/store'

// Stage-anchored segmented control to switch the research stage between the flat 2D constellation
// (default) and the 3D globe. Mounted only inside ResearchStage, so it's research-only by construction.
// Modeled on the screener's themes__viewtoggle radiogroup (same a11y + token styling). The Globe option
// is disabled when WebGL is unavailable so a no-WebGL browser is never offered a view it can't render.
export function ViewToggle() {
  const view = useStore((s) => s.researchView)
  const setView = useStore((s) => s.setResearchView)
  const webglOK = useStore((s) => s.webglOK)

  return (
    <div className="viewtoggle" role="radiogroup" aria-label="Research stage view">
      <button
        type="button"
        role="radio"
        aria-checked={view === 'constellation'}
        className={`viewtoggle__btn${view === 'constellation' ? ' is-on' : ''}`}
        onClick={() => setView('constellation')}
      >
        Constellation
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={view === 'globe'}
        disabled={!webglOK}
        title={webglOK ? undefined : '3D view needs WebGL — unavailable in this browser'}
        className={`viewtoggle__btn${view === 'globe' ? ' is-on' : ''}`}
        onClick={() => setView('globe')}
      >
        Globe
      </button>
    </div>
  )
}
